# -*- coding: utf-8 -*-
"""Règles d'intégrité communes aux decklists structurées."""


def side_deck_size(deck):
    return sum(card.get("quantity", 0) for card in deck.get("sideDeck", []))


def vendetta_side_deck_is_complete(deck):
    if deck.get("set") != "Vendetta":
        return True
    return side_deck_size(deck) == 10


def vendetta_decklist_missing(deck):
    if deck.get("set") != "Vendetta":
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
