"""Search module."""

from fastapi import FastAPI
from text_search_server import trie
import geopandas as gpd

text_pd = gpd.read_file("/mnt/data/text_sverige.gpkg")
text = [
    (text, index)
    for text, index in zip(text_pd.textstrang.tolist(), text_pd.index.tolist())
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
    top_50_matches = [text_pd.iloc[y] for x, y in all_words[:50]]
    return {"input_text": input_text, "top_50_matches": top_50_matches}
