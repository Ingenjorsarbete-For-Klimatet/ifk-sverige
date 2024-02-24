"""SMHI data layer."""

import json
import math
import logging
import mapbox_vector_tile
from shapely import Polygon
from typing import Union, Optional
from smhi.mesan import Mesan  # type: ignore
from smhi.metfcts import Metfcts  # type: ignore

from pmtiles.tile import zxy_to_tileid, TileType, Compression
from pmtiles.writer import Writer

logger = logging.getLogger()


def deg2num(lat_deg, lon_deg, zoom):
    lat_rad = math.radians(lat_deg)
    n = 1 << zoom
    xtile = int((lon_deg + 180.0) / 360.0 * n)
    ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
    return xtile, ytile


def num2deg(xtile, ytile, zoom):
    n = 1 << zoom
    lon_deg = xtile / n * 360.0 - 180.0
    lat_rad = math.atan(math.sinh(math.pi * (1 - 2 * ytile / n)))
    lat_deg = math.degrees(lat_rad)
    return lat_deg, lon_deg


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


def create_pmtile(file: str, client: Union[Mesan, Metfcts] = Mesan()):
    """Create PMTiles from SMHI multipoint data.

    Args:
        file: file to save
        client: client to fetch data with
    """
    # valid_times = client.valid_time
    coordinates = client.get_geo_multipoint(1)
    polygon = Polygon(coordinates)
    lon_min, lat_min, lon_max, lat_max = polygon.exterior.bounds

    with open("stamen_toner_maxzoom3.pmtiles", "wb") as f:
        writer = Writer(f)

        for z in range(4, 10 + 1):
            tile_x_min, tile_y_max = deg2num(lat_min, lon_min, z)
            tile_x_max, tile_y_min = deg2num(lat_max, lon_max, z)

            for x in range(tile_x_min, tile_x_max + 1):
                for y in range(tile_y_min, tile_y_max + 1):
                    lat_nw, lon_nw = num2deg(x, y, z)
                    lat_se, lon_se = num2deg(x + 1, y + 1, z)

                    tile_id = zxy_to_tileid(z, x, y)

                    data = mapbox_vector_tile.encode(
                        {
                            "smhi": {
                                "type": "FeatureCollection",
                                "crs": {
                                    "type": "name",
                                    "properties": {
                                        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                                    },
                                },
                                "features": {
                                    "type": "Feature",
                                    "properties": {
                                        "t": [1],
                                    },
                                    "geometry": {
                                        "type": "Point",
                                        "coordinates": [lon_min, lat_min],
                                    },
                                },
                            }
                        }
                    )
                    writer.write_tile(tile_id, data)
                    print(tile_id)

        writer.finalize(
            {
                "tile_type": TileType.MVT,
                "tile_compression": Compression.GZIP,
                "min_zoom": 0,
                "max_zoom": 3,
                "min_lon_e7": int(lon_min * 10000000),
                "min_lat_e7": int(lat_min * 10000000),
                "max_lon_e7": int(lon_max * 10000000),
                "max_lat_e7": int(lat_max * 10000000),
                "center_zoom": 0,
                "center_lon_e7": 0,
                "center_lat_e7": 0,
            },
            {
                "attribution": 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
            },
        )
    # with open("stamen_toner_maxzoom3.pmtiles", "wb") as f:
    #     writer = Writer(f)

    #     for tileid in range(0, zxy_to_tileid(4, 0, 0)):
    #         z, x, y = tileid_to_zxy(tileid)
    #         req = Request(f"https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png")
    #         req.add_header(
    #             "User-Agent",
    #             "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
    #         )
    #         with urlopen(req) as f:
    #             writer.write_tile(tileid, f.read())
    # all_temperatures = []
    # for i, time in enumerate(valid_times):
    #     try:
    #         temperature = client.get_multipoint(time, "t", "hl", 2, 1)
    #         all_temperatures.append(temperature["values"].to_list())
    #     except KeyError:
    #         logger.warning(f"No temperature data found for {time}.")
