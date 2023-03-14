"""Config module."""


class Config:
    """Config class."""

    espg_3006: str = "EPSG:3006"
    epsg_4326: str = "EPSG:4326"

    border_land: str = "Riksgräns"
    border_sea: str = "Sjöterritoriets gräns i havet"
    border_county: str = "Länsgräns"
    border_municipality: str = "Kommungräns"

    ground_sweden: str = "00_sverige.geojson"
    ground_50: dict[str, str] = {
        "Anlagt vatten": "01_anlagt_vatten.geojson",
        "Barr- och blandskog": "02_barr_blandskog.geojson",
        "Fjällbjörkskog": "03_fjällbjörkskog.geojson",
        "Fruktodling": "04_fruktodling.geojson",
        "Glaciär": "05_glaciär.geojson",
        "Hög bebyggelse": "06_hög_bebygelse.geojson",
        "Industri- och handelsbebyggelse": "07_industri_handel.geojson",
        "Kalfjäll": "08_kalfjäll.geojson",
        "Låg bebyggelse": "09_låg_bebygelse.geojson",
        "Lövskog": "10_lövskog.geojson",
        "Sjö": "11_sjö.geojson",
        "Sluten bebyggelse": "12_sluten_bebygelse.geojson",
        "Vattendragsyta": "13_vattendragsyta.geojson",
        "Åker": "14_åker.geojson",
        "Öppen mark": "15_öppen_mark.geojson",
        "Hav": "16_hav.geojson",
        "Ej karterat område": "17_ej_kartlagt.geojson",
    }
    ground_1m: dict[str, str] = {
        "Vattenyta": "01_vattenyta.geojson",
        "Skog": "02_skog.geojson",
        "Glaciär": "05_glaciär.geojson",
        "Bebyggelse": "06_bebygelse.geojson",
        "Kalfjäll": "08_kalfjäll.geojson",
        "Öppen mark": "15_öppen_mark.geojson",
        "Hav": "16_hav.geojson",
        "Ej karterat område": "17_ej_kartlagt.geojson",
    }
    exclude_ground = {"Hav", "Ej karterat område"}


config = Config()
