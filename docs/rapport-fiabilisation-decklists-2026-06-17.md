# Rapport — Fiabilisation des decklists (session 16-17 juin 2026)

## Contexte
Suite à la découverte de decklists Changsha fabriquées, audit et fiabilisation complète
des decklists sur tout le site (pages deck, articles, deckbuilder, filtres), prod incluse.
Règle directrice : **ne jamais publier de données fausses ou incertaines — skip/supprime plutôt.**

## Corrections données (appliquées local + prod)

| Problème | Fix | Volume |
|---|---|---|
| Decklists Changsha fabriquées | Supprimées | 70 + 7 |
| Decks sans runes | Backfill (runes objet `{Domaine:n}` → « X Rune ») | 1883 decks |
| Decks sans carte Légende | Backfill par nom de carte | 110 decks |
| Filtres légendes non harmonisés | `legendName` → nom exact de carte | 244 decks |
| Titres incohérents | Régénérés `Légende — Tournoi` | ~2900 |
| Decks à source corrompue | Supprimés (légende=champion, champion=spell/gear) | 3 (Suzhou) |

## Corrections code (sur `main`, déployées)

- **Deckbuilder import** : champion fusionné (+1) dans le main → 40/40, pas de doublon de clé
  React, runes incluses. Fusion aussi des éditions multiples d'une même carte.
- **Légendes OPP / alt-art** aliasées vers la carte canonique du même nom
  (Master Yi `opp-019-024` → `ogs-019-024`, ~1025 decks).
- **Articles** : champion affiché 1× (suppression de l'auto-dérivation qui doublait) ;
  reconnaissance de la section `champion` produite par le parser de code deck.
- **Cohérence** : helper unique `isChampionCard` → le champion s'affiche toujours sous
  « Champion » partout (pages deck, articles, `/d/[code]`, image OG, deckbuilder).
- **Hover** des cartes best-of non rogné (overflow conditionnel sur l'accordéon).
- **Seed** `seed-scraped-decks.ts` corrigé (runes objet) pour ne plus reproduire le bug.

## Vérifications finales (prod)

- **20 336 decks** : 0 doublon, 0 champion manquant, 0 légende non résolue, 0 deck sans
  carte légende.
- **Filtre /decks** : 0 variante de légende en double.
- **Article best-of-tianjin** : champion en section `champion` seule (aucune section
  `legend` parasite).
- **Page deck** : runes (Fury/Order Rune) + champion (label « Champion ») + légende.

## Garde-fous

- Règle « ne jamais inventer » dans `AGENTS.md` + validateur `scripts/validate-decklists.py`.
- 2 decks Shanghai City Challenge sans runes laissés tels quels (pas de source → pas de
  fabrication).

## Points non évidents (pièges à retenir)

- **Un champion peut être à la fois en main ET en section champion/légende** : ce n'est pas
  un doublon, ne jamais dédupliquer entre ces sections.
- Le champion est une **carte réelle du main deck** ; à l'import deckbuilder on l'ajoute en
  fusionnant la quantité (+1).
- Runes parfois stockées en **objet par domaine** `{"Calm":7}` → la carte s'appelle
  « Calm **Rune** » (suffixer au lookup).
- Noms canoniques de cartes avec quirks : `Rek'sai` (s minuscule), `Jax, Grandmaster At Arms`
  (At majuscule).

## Git

10 commits sur `main` (poussés), dont les 4 du 17/06 : `be32b24b`, `803f56df`, `6a577e79`,
`f8a28930`. L'overlay de stream reste isolé sur `feat/stream-overlay` (modèle `OverlayState`,
2 routes de dropdowns, lien profil).
