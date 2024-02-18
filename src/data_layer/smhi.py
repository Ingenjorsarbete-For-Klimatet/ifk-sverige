"""SMHI data layer."""

import json
import logging
from smhi.mesan import Mesan

logger = logging.getLogger()


def save_mesan_multipoint(file: str) -> None:
    """Save Mesan multipoint data.

    Args:
        file: file path for saved file
    """
    client = Mesan()
    valid_times = client.valid_time
    coordinates = client.get_geo_multipoint(1)

    all_temperatures = []
    for i, time in enumerate(valid_times):
        try:
            temperature = client.get_multipoint(time, "t", "hl", 2, 1)
        except KeyError:
            logger.warning(f"No temperature data found for {time}.")
            all_temperatures.append(temperature["values"].to_list())

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

    geosjson = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features,
    }

    with open(file, "w") as f:
        json.dump(geosjson, f)
