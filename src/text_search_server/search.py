"""Search module."""

from fastapi import FastAPI
from text_search_server import trie
import geopandas as gpd

text = gpd.read_file("/mnt/data/text_sverige.gpkg")
text = [
    (text, index) for text, index in zip(text.textstrang.tolist(), text.index.tolist())
]

tdb = trie.TrieDB()
for word in text:
    tdb.insert(word)

app = FastAPI()


@app.get("/search/{input_text}")
def search(input_text: str) -> dict:
    """Search database based on search string.

    Args:
        input_text: input search string

    Returns:
        top 50 found results for query
    """
    tquery = trie.TrieQuery(tdb.root)
    all_words = tquery.search(input_text)
    return {"input_text": input_text, "top_50_matches": all_words[:50]}
