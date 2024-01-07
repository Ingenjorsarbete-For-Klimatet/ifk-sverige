"""Integration tests for text search server search module."""

import pytest
from text_search_server.trie import TrieDB, TrieQuery

TEST_LIST = [("Göteborg", 0), ("Gö", 1), ("Luleå", 2)]

tdb = TrieDB()
for item in TEST_LIST:
    tdb.insert(item)


@pytest.mark.parametrize(
    "query, max_words, expected_result",
    [
        ("G", 50, [("Gö", 1), ("Göteborg", 0)]),
        ("Luleå", 50, [("Luleå", 2)]),
        ("None", 50, []),
        (
            "",
            50,
            [
                ("Gö", 1),
                ("Göteborg", 0),
                ("Luleå", 2),
            ],
        ),
        ("G", 1, [("Gö", 1)]),
    ],
)
def test_integration_trie(query: str, max_words: int, expected_result: tuple):
    """Integration test of trie.

    Args:
        query: query to search
        max_words: max number of words to search
        expected_result: expected result
    """
    tquery = TrieQuery(tdb.root, max_words)
    result = tquery.search(query)

    assert result == expected_result
