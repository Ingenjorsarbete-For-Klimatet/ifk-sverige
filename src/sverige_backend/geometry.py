"""Geometry module."""
import geopandas as gpd
from config import config
from shapely.geometry import Polygon
from shapely.ops import unary_union, linemerge


class Geometry:
    """Geometry class."""

    def __init__(self, file_path: str):
        """Initialise Border object.

        Args:
            file_path: path to border data
        """
        self.data = gpd.read_file(file_path)


class Border(Geometry):
    """Border class."""

    def __init__(self, file_path: str):
        """Initialise Border object.

        Args:
            file_path: path to border data
        """
        super().__init__(file_path)

    def _get_borders(self, object: list[str]) -> gpd.GeoDataFrame:
        """Get border of selected object.

        Args:
            object: object to get

        Returns:
            geopandas GeoDataFrame with border objects
        """
        return self.data[self.data["objekttyp"].isin(object)]

    def _get_polygon(self, geometry: gpd.GeoSeries) -> list[Polygon]:
        """Get polygon of borders.

        Args:
            geometry: line geometry

        Returns:
            list of Polygons
        """
        border_merged = linemerge(unary_union(geometry))
        return [Polygon(x) for x in border_merged.geoms]

    def get_country_border(self) -> gpd.GeoDataFrame:
        """Get border of Sweden.

        Returns:
            geopandas GeoDataFrame of Sweden's border
        """
        return self._get_borders([config.border_land, config.border_sea])

    def get_county_border(self) -> gpd.GeoDataFrame:
        """Get county borders in Sweden.

        Returns:
            geopandas GeoDataFrame of Sweden's border
        """
        return self._get_borders([config.border_county])

    def get_municipality_border(self) -> gpd.GeoDataFrame:
        """Get municipality borders in Sweden.

        Returns:
            geopandas GeoDataFrame of Sweden's border
        """
        return self._get_borders([config.border_municipality])

    def get_country_polygon(self) -> gpd.GeoDataFrame:
        """Get polygon of Sweden.

        Returns:
            geopandas GeoDataFrame of Sweden as a polygon
        """
        return gpd.GeoDataFrame(
            self._get_polygon(self.get_country_border()["geometry"])
        )
