# -*- coding: utf-8 -*-
"""Règles d'intégrité communes aux decklists structurées."""

# Radiance garde la construction de Vendetta (66 cartes, réserve de 10). Écrit
# `!= "Vendetta"`, le contrôle laissait passer une liste Radiance amputée.
SETS_A_RESERVE = {"Vendetta", "Radiance"}


def side_deck_size(deck):
    return sum(card.get("quantity", 0) for card in deck.get("sideDeck", []))


def vendetta_side_deck_is_complete(deck):
    if deck.get("set") not in SETS_A_RESERVE:
        return True
    return side_deck_size(deck) == 10


def nom_hexgate(carte, sans_titre):
    """Le nom d'une carte hexgate, titre compris.

    hexgate écrit « Viktor » pour Viktor, Leader. Comparé tel quel, le brut ne
    retrouvait pas la carte de la decklist et le validateur criait à l'écart.
    `sans_titre` est la table de data/hexgate-cartes-sans-titre.json.

    La conversion lit la même table : une ligne fausse les tromperait ensemble.
    Seul contrôle propre au validateur, le personnage : une ligne qui fait de
    « Viktor » une autre carte que Viktor est ignorée, et l'écart ressort. Une
    ligne `coquille`, posée à la main quand hexgate écrit mal le nom (« Corinna »
    pour Corina Veraza), passe outre.
    """
    nom = carte["en_name"]
    entree = sans_titre.get(carte.get("card_no"))
    if not entree:
        return nom
    if not entree.get("coquille") and entree["nom"].split(",")[0].strip().lower() != nom.strip().lower():
        return nom
    return entree["nom"]


def vendetta_decklist_missing(deck):
    if deck.get("set") not in SETS_A_RESERVE:
        return []

    main = sum(card.get("quantity", 0) for card in deck.get("mainDeck", []))
    runes_value = deck.get("runes", {})
    runes = sum(runes_value.values()) if isinstance(runes_value, dict) else sum(
        rune.get("quantity", 0) for rune in runes_value
    )
    battlefields = len(deck.get("battlefields", []))
    side = side_deck_size(deck)
    missing = []
    if main != 39:
        missing.append(f"deck principal {main}/39")
    if not deck.get("champion"):
        missing.append("champion 0/1")
    if runes != 12:
        missing.append(f"runes {runes}/12")
    if battlefields != 3:
        missing.append(f"champs de bataille {battlefields}/3")
    if side != 10:
        missing.append(f"réserve {side}/10")
    return missing
