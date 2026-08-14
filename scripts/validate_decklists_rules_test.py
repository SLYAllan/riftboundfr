# -*- coding: utf-8 -*-
import unittest

from scripts.validate_decklists_rules import vendetta_decklist_missing, vendetta_side_deck_is_complete


class VendettaSideDeckRulesTest(unittest.TestCase):
    def test_accepts_exactly_ten_cards(self):
        deck = {
            "set": "Vendetta",
            "sideDeck": [
                {"name": "Charm", "quantity": 3},
                {"name": "Salvage", "quantity": 7},
            ],
        }

        self.assertTrue(vendetta_side_deck_is_complete(deck))

    def test_rejects_an_incomplete_side_deck(self):
        deck = {"set": "Vendetta", "sideDeck": [{"name": "Charm", "quantity": 9}]}

        self.assertFalse(vendetta_side_deck_is_complete(deck))

    def test_does_not_apply_to_older_sets(self):
        deck = {"set": "Unleashed", "sideboard": []}

        self.assertTrue(vendetta_side_deck_is_complete(deck))

    def test_reports_every_missing_vendetta_section(self):
        deck = {
            "set": "Vendetta",
            "mainDeck": [{"quantity": 38}],
            "champion": None,
            "runes": {"Calm": 12},
            "battlefields": [],
            "sideDeck": [{"quantity": 10}],
        }

        self.assertEqual(
            vendetta_decklist_missing(deck),
            ["deck principal 38/39", "champion 0/1", "champs de bataille 0/3"],
        )


if __name__ == "__main__":
    unittest.main()
