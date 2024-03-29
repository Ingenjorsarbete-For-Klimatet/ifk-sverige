"""Search module."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from text_search_server import trie  # type: ignore
import geopandas as gpd  # type: ignore
from fastapi.middleware.cors import CORSMiddleware

MAX_WORDS = 50
DATABASE = {}
FILE = "/mnt/data/text_sverige.gpkg"
ORIGINS = ["http://localhost:5173"]


def initialise_data(file: str) -> tuple[gpd.GeoDataFrame, trie.TrieDB]:
    """Initialise data.

    Args:
        file: file to load

    Returns
        tuple of geopandas object and trie database
    """
    text_pd = gpd.read_file(file)
    text_pd = text_pd.to_crs("EPSG:4326")
    text_pd["geometry_xy"] = [
        (x.coords.xy[0][0], x.coords.xy[1][0]) for x in text_pd.geometry
    ]
    text_pd = text_pd.drop("geometry", axis=1)

    text = [
        (text.lower(), index)
        for text, index in zip(text_pd.textstrang.tolist(), text_pd.index.tolist())
    ]

    tdb = trie.TrieDB()
    for word in text:
        tdb.insert(word)

    return text_pd, tdb


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load data on app startup."""
    text_pd, tdb = initialise_data(FILE)
    DATABASE["text_pd"] = text_pd
    DATABASE["tdb"] = tdb
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/search/{input_text}")
def search(input_text: str) -> dict:
    """Search database based on search string.

    Args:
        input_text: input search string

    Returns:
        top 50 found results for query
    """
    text_pd = DATABASE["text_pd"]
    tdb = DATABASE["tdb"]
    tquery = trie.TrieQuery(tdb.root, MAX_WORDS)
    all_words = tquery.search(input_text.lower())
    matches = [text_pd.iloc[i].to_dict() for _, indices in all_words for i in indices]
    return {"input_text": input_text, "matches": matches}
