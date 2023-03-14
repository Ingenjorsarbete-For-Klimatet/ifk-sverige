"""Config module."""
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    """Config class."""

    espg_3006: str = "EPSG:3006"
    epsg_4326: str = "EPSG:4326"

    border_land: str = "Riksgräns"
    border_sea: str = "Sjöterritoriets gräns i havet"
    border_county: str = "Länsgräns"
    border_municipality: str = "Kommungräns"


config = Config()
