"""Integration tests for text search server search module."""

import pytest
from unittest.mock import patch
import geopandas as gpd
from shapely import Point
from text_search_server.search import app
from fastapi.testclient import TestClient

data = gpd.GeoDataFrame(
    {
        "geometry": [Point(0, 0), Point(1, 2), Point(2, 2)],
        "textstrang": ["Göteborg", "Gö", "Luleå"],
        "index": [0, 1, 2],
    }
)
data.set_crs("EPSG:3006")
data.to_file("tests/fixtures/test_data.gpkg")


@pytest.mark.parametrize(
    "query, status, expected_result",
    [
        (
            "G",
            200,
            {
                "input_text": "G",
                "top_50_matches": [
                    {"geometry_xy": [1.0, 2.0], "index": 1, "textstrang": "Gö"},
                    {"geometry_xy": [0.0, 0.0], "index": 0, "textstrang": "Göteborg"},
                ],
            },
        ),
        (
            "Luleå",
            200,
            {
                "input_text": "Luleå",
                "top_50_matches": [
                    {"geometry_xy": [2.0, 2.0], "index": 2, "textstrang": "Luleå"}
                ],
            },
        ),
        ("None", 200, {"input_text": "None", "top_50_matches": []}),
        ("", 404, {"detail": "Not Found"}),
    ],
)
@patch("text_search_server.search.FILE", "tests/fixtures/test_data.gpkg")
def test_integration_search(query, status, expected_result):
    """Integration test of search.

    Args:
        query: query to search
        status: response status code
        expected_result: expected result
    """
    with TestClient(app) as client:
        response = client.get(f"/search/{query}")
        assert response.status_code == status
        assert response.json() == expected_result