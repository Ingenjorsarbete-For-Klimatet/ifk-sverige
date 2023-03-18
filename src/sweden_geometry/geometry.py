"""Geometry module."""
from os import path
import geopandas as gpd
from shapely.ops import linemerge
from shapely.geometry import Polygon
from sweden_geometry.config import config


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
        border_merged = linemerge(geometry.unary_union)
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


class Ground(Geometry):
    """Ground class."""

    def __init__(self, file_path: str):
        """Initialise Ground object.

        Args:
            file_path: path to border data
        """
        super().__init__(file_path)

        self.data["area_m2"] = self.data.area
        self.data["length_m"] = self.data.length

    def _get_ground_items(self, ground: dict = config.ground_1m) -> gpd.GeoDataFrame:
        """Get ground items.

        Args:
            ground: dict of items to search for

        Returns:
            ground item
            file_name of ground item
        """
        for object_name, file_name in ground.items():
            if object_name in config.exclude_ground:
                continue

            piece = self.data[self.data["objekttyp"] == object_name]
            yield piece, file_name

    def get_ground(
        self, ground: dict = config.ground_1m
    ) -> dict[str, gpd.GeoDataFrame]:
        """Get Sweden's ground.

        Args:
            ground: dict of items to search for

        Returns:
            map of ground pieces including Sweden

        Raises:
            KeyError
        """
        ground_items = set(self.data["objekttyp"])
        if any([k not in ground_items for k, _ in ground.items()]):
            raise KeyError("Can't find all items in ground dict.")

        data = {}
        for piece, file_name in self._get_ground_items(ground):
            data[file_name] = piece

        sweden_data = self.data.drop(
            self.data.loc[self.data["objekttyp"].isin(config.exclude_ground)].index
        )
        data[config.ground_sweden] = gpd.GeoDataFrame(
            {"geometry": sweden_data.geometry.unary_union.geoms}
        )
        return data

    def save_ground(self, save_path: str, ground: dict = config.ground_1m):
        """Save Sweden's ground.

        Args:
            path: path of dir to save
            ground: dict of items to search for
        """
        for file_name, piece in self.get_ground(ground).items():
            piece = piece.to_crs(config.epsg_4326)
            piece.to_file(path.join(save_path, file_name), driver="GeoJSON")
