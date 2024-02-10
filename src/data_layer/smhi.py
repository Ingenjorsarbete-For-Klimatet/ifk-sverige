"""SMHI data layer."""

import json
import pandas as pd
from smhi.mesan import Mesan


def save_mesan_multipoint(file: str) -> pd.DataFrame:
    client = Mesan()
    valid_times = client.valid_time
    coordinates = client.get_geo_multipoint(20)
    # temperature = client.get_multipoint(valid_times[10], "t", "hl", 2, 10)

    print(valid_times)
    tmp = []
    for i, time in enumerate(valid_times[1:-9]):
        temperature = client.get_multipoint(time, "t", "hl", 2, 20)
        tmp.append(temperature["values"].to_list())

    features = []
    for i, c in enumerate(coordinates):
        temp = [j[i] for j in tmp]
        features.append({"t": temp, "c": c, "time": len(tmp)})

    #     {
    #         # "type": "Feature",
    #         # "properties": {
    #         "t": tmp,
    #         "c": coordinates[i],
    #         "time": tm,
    #         # },
    #         # "geometry": {"type": "Point", "coordinates": coordinates[index]},
    #     }
    # )

    geosjson = {
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"},
        },
        "features": features,
    }

    with open(file, "w") as f:
        json.dump(features, f)

    print(valid_times[0])

    # return temperature_and_coordinates
