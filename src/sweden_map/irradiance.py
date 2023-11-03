"""Irradiance data module."""
from shapely import Point
from typing import Generator
from smhi.strang import Strang
from pyproj import Transformer
from geometry.geometry import Border
from datetime import datetime, timedelta

import numpy as np


class GlobalIrradiance:
    """Global Irradiance class."""

    def __init__(self, border_path: str):
        """Initialise irradiance object."""
        self.parameter = 117
        self.strang = Strang()
        self.border = Border(border_path).get_border()
        self.data = None

        self.geo_projection = "epsg:4326"
        self.flat_projection = "epsg:3006"
        self.geo_to_flat = Transformer.from_crs(
            self.geo_projection, self.flat_projection
        )
        self.flat_to_geo = Transformer.from_crs(
            self.flat_projection, self.geo_projection
        )

    def get(self):
        """Get all the data from implemented functions."""
        self._load_saved_strang()
        self._save_strang()

    def _load_saved_strang(self, data_path: str = "data.parquet"):
        """Load already saved data."""
        pass  # self.data = pl.scan_parquet(data_path)

    def _save_strang(self):
        """Save Strang data daily aggregated."""
        interval = "daily"
        all_dates = self._find_dates()

        for date in all_dates:
            if self._is_saved_date(date) is True:
                continue

            data = self.strang.get_multipoint(
                self.parameter, "2020-08", "monthly"
            )  # interval)
            print(data.head())
            points = [
                Point(self.geo_to_flat.transform(y, x)[::-1])
                for x, y in zip(data["lon"], data["lat"])
            ]
            print(points[:10])
            index = self.border.contains(points)
            data = data[index]
            self.points = np.array(points)[index]
            break

        return data

    def _find_dates(self) -> Generator:
        """Find dates to download.

        Returns:
            generator
        """
        time_from = self.strang.available_parameters[self.parameter].time_from
        time_to = self.strang.available_parameters[self.parameter].time_to()

        for day in range((time_to - time_from).days):
            yield time_from + timedelta(days=day)

    def _is_saved_date(self, date: datetime) -> bool:
        """Check if data for date is already saved.

        Args:
            date: date to look for

        Returns:
            true if date is saved or false if not saved
        """
        return
