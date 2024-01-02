"""Integration tests for text search server search module."""

import pytest
from text_search_server.trie import TrieDB, TrieQuery

TEST_LIST = [("Göteborg", 0), ("Gö", 1), ("Luleå", 2)]

tdb = TrieDB()
for item in TEST_LIST:
    tdb.insert(item)


@pytest.mark.parametrize(
    "query, expected_result",
    [
        ("G", [("Gö", 1), ("Göteborg", 0)]),
        ("Luleå", [("Luleå", 2)]),
        ("None", []),
        (
            "",
            [
                ("Gö", 1),
                ("Göteborg", 0),
                ("Luleå", 2),
            ],
        ),
    ],
)
def test_integration_trie(query: str, expected_result: tuple):
    """Integration test of trie.

    Args:
        query: query to search
        expected_result: expected result
    """
    tquery = TrieQuery(tdb.root)
    result = tquery.search(query)

    assert result == expected_result
