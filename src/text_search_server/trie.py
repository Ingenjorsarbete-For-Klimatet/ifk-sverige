"""Trie data structure."""

from collections import namedtuple
from typing import Optional

Text = namedtuple("Text", "text index")


class TrieNode:
    """Trie node class."""

    def __init__(self, character: str) -> None:
        """Initialise the trie node.

        Args:
            character: character stored in this node
        """
        self.character = character
        self.is_word = False
        self.num_words = 0
        self.db_index: Optional[int] = None
        self.children: dict = {}


class TrieDB:
    """Trie class."""

    def __init__(self) -> None:
        """Initialise the trie class."""
        self.root = TrieNode("")

    def insert(self, word_index: tuple[str, int]) -> None:
        """Insert an entry (word and index) into trie.

        Args:
            word: word to insert
        """
        node = self.root
        word, index = word_index

        for character in word:
            if character in node.children:
                node = node.children[character]
                continue

            new_node = TrieNode(character)
            node.children[character] = new_node
            node = new_node

        node.is_word = True
        node.db_index = index


class TrieQuery:
    """TrieQuery class.

    Query trie database, read only.
    """

    def __init__(self, root: TrieNode, max_words: int = 50) -> None:
        """Initialise trie query.

        Args:
            root: root node to query from
            max_words: max words to return from search
        """
        self.root = root
        self.max_words = max_words

    def dfs(self, all_words: list, node: TrieNode, input_text: str) -> None:
        """Depth-first search of trie.

        Args:
            all_words: list of all found words
            node: start node
            input_text: current input text
        """
        assembled_word = input_text + node.character

        if node.is_word:
            all_words.append(Text(assembled_word, node.db_index))

        for child in node.children.values():
            if len(all_words) >= self.max_words:
                return

            self.dfs(all_words, child, assembled_word)

    def search(self, input_text: str) -> list:
        """Search trie for an input text.

        Args:
            input_text: input text for search, treated as prefix

        Returns:
            list of matching (prefix) words sorted alphabetically
        """
        all_words: list = []
        node = self.root

        for character in input_text:
            if character not in node.children:
                return all_words

            node = node.children[character]

        self.dfs(all_words, node, input_text[:-1])

        return sorted(all_words)
