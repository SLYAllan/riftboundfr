# -*- coding: utf-8 -*-
import unittest

from scripts.validate_decklists_rules import nom_hexgate, vendetta_decklist_missing, vendetta_side_deck_is_complete


class NomHexgateTest(unittest.TestCase):
    def test_rend_le_titre_que_la_table_prouve(self):
        table = {"ARC-006/006": {"nom": "Viktor, Leader"}}
        carte = {"card_no": "ARC-006/006", "en_name": "Viktor"}

        self.assertEqual(nom_hexgate(carte, table), "Viktor, Leader")

    def test_garde_le_nom_hexgate_hors_table(self):
        carte = {"card_no": "OGN-246/298", "en_name": "Viktor, Leader"}

        self.assertEqual(nom_hexgate(carte, {}), "Viktor, Leader")

    def test_ignore_une_ligne_d_un_autre_personnage(self):
        table = {"ARC-006/006": {"nom": "Vi, Destructive"}}
        carte = {"card_no": "ARC-006/006", "en_name": "Viktor"}

        self.assertEqual(nom_hexgate(carte, table), "Viktor")

    def test_une_coquille_posee_a_la_main_passe(self):
        table = {"SFD-179/221": {"nom": "Corina Veraza", "coquille": True}}
        carte = {"card_no": "SFD-179/221", "en_name": "Corinna Veraza"}

        self.assertEqual(nom_hexgate(carte, table), "Corina Veraza")


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

    def test_applies_to_radiance_too(self):
        deck = {"set": "Radiance", "sideDeck": [{"name": "Charm", "quantity": 9}]}

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
