---
name: decklists
description: Règle absolue d'intégrité des données de deck sur Riftbound France. À utiliser dès qu'il s'agit d'ajouter, corriger, seeder ou publier un deck, une decklist, un résultat de tournoi ou un best-of. Dit quoi faire quand la donnée réelle manque.
---

# Ne jamais fabriquer une decklist

**Si la donnée réelle n'existe pas ou n'est pas vérifiable : SAUTER ou
SUPPRIMER le deck.** Jamais de reconstitution. Un deck manquant vaut mieux qu'un
deck faux : le site est lu par des joueurs qui construisent d'après ces listes.

## Ce que ça interdit

- Sourcer une carte « de mémoire » ou par ce que joue d'habitude l'archétype.
- Compléter un deck partiel. Si riftdecks affiche « Missing / Not available »,
  le deck n'a pas de liste : on ne la fabrique pas.
- Deviner une légende à partir du set ou du champion. Il existe **deux** Légendes
  Master Yi (Wuju Bladesman et Wuju Master) : lire la vraie légende de chaque
  deck, jamais de repli.

## La source

`data/raw-scrapes/` — le scrape brut de riftdecks, par tournoi et par page.
C'est contre lui, et lui seul, qu'une decklist se vérifie.

## Avant tout seed ou publication

```bash
npm run validate:decks      # dépasse 5 min, prévoir une limite large
```

Sortie 1 = au moins une decklist ne correspond pas à sa source brute, donc a été
fabriquée. Corriger ou supprimer chaque MISMATCH avant d'aller plus loin.

## Comptage, pas fabrication

Deux défauts déjà vus ressemblent à de la fabrication sans en être :

- une carte présente en deck principal **et** en réserve compte deux fois ;
- 14 cartes ont deux impressions réelles (OGS et OPP) et se retrouvent en double
  dans la même section — voir `scripts/fix-doublons-ogs-opp.mts`.

Les corriger relève de la comptabilité. Ajouter une carte que la source ne porte
pas relève de la fabrication. Ne pas confondre.

## Ne jamais recalculer les cartes à la main

`resolveDeckCards` (`src/lib/deck-cards.ts`) est le passage unique entre un code
de deck et les cartes en base. Le bloc a déjà été recopié dans quatre fichiers,
chacun avec le même défaut : une carte introuvable disparaissait en silence. La
fonction rend les cartes trouvées **et** la liste `missing`, qui doit s'afficher.
