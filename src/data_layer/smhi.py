"""SMHI data layer."""

import json
import logging
from typing import Union, Optional
from smhi.mesan import Mesan  # type: ignore
from smhi.metfcts import Metfcts  # type: ignore

logger = logging.getLogger()


def get_data(client: Union[Mesan, Metfcts]) -> Optional[dict]:
    """Get data from client.

    Args:
        client: Mesan or Metfcts clients
    """
    valid_times = client.valid_time
    coordinates = client.get_geo_multipoint(1)

    all_temperatures = []
    for i, time in enumerate(valid_times):
        try:
            temperature = client.get_multipoint(time, "t", "hl", 2, 1)
            all_temperatures.append(temperature["values"].to_list())
        except KeyError:
            logger.warning(f"No temperature data found for {time}.")

    if len(all_temperatures) == 0:
        logger.warning("No data saved.")
        return None

    features = []
    for i, coord in enumerate(coordinates):
        temperature = [j[i] for j in all_temperatures]
        features.append(
            {
                "type": "Feature",
                "properties": {
                    "t": temperature,
                },
                "geometry": {"type": "Point", "coordinates": coord},
            }
        )

    return {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features,
    }


def save_metfcts_multipoint(file: str) -> None:
    """Save Metfcts multipoint data.

    Args:
        file: file path for saved file
    """
    client = Metfcts()
    geojson = get_data(client)

    with open(file, "w") as f:
        json.dump(geojson, f)


def save_mesan_multipoint(file: str) -> None:
    """Save Mesan multipoint data.

    Args:
        file: file path for saved file
    """
    client = Mesan()
    geojson = get_data(client)

    with open(file, "w") as f:
        json.dump(geojson, f)
