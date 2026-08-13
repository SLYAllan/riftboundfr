---
name: scraper-tournoi
description: Ajoute un tournoi riftdecks.com au site, du scraping jusqu'à la mise en ligne. À utiliser quand on donne une ou plusieurs URL de tournoi riftdecks à importer, ou quand il faut re-scraper un tournoi existant. Couvre le scraping, la validation, le seed, les best-of et les drapeaux.
---

# Ajouter un tournoi

Sept étapes, dans cet ordre. Aucune ne se saute, surtout pas la 0 et la 2.

## 0. Vérifier que les Légendes du set sont connues

```bash
npx tsx scripts/maj-legend-map.mts          # dit ce qui manque
npx tsx scripts/maj-legend-map.mts --apply  # écrit
```

Le scraper reconnaît la Légende d'un deck par `data/raw-scrapes/legend-map.json`.
**Une Légende absente fait sauter le deck entier, en silence.** Un tournoi sur un
set plus récent que la carte perd donc la moitié de ses decks sans que rien ne
prévienne : c'est arrivé avec Vendetta, dont les 9 Légendes étaient en base mais
pas dans la carte.

## 1. Scraper

La marche à suivre existe déjà et fait foi : **`data/raw-scrapes/AGENT-INSTRUCTIONS.md`**.
La lire en entier avant de commencer. Elle donne le découpage par pages, la
reconnaissance de la Légende par `legend-map.json`, le format exact des fichiers
à écrire, et quoi faire d'un deck sans Légende (le sauter, pas le deviner).

En pratique, tout est fait par un script :

```bash
bash scripts/scrape-tournoi.sh <slug> <url-du-tournoi> <nb-pages>
```

Il collecte les URL de decks page par page, puis récupère chaque deck. Il est
reprenable : un deck déjà sur le disque n'est pas repris, et un fichier trop
court est rejeté plutôt que gardé (sinon une page de défi Cloudflare compterait
comme un deck).

Quatre points qui coûtent cher si on les rate :

- **Seul le CLI `firecrawl` traverse le Cloudflare de riftdecks.** `curl`,
  `WebFetch`, le serveur MCP `scrapeur` et `cloudscraper` 1.2.71 y prennent tous
  un 403, vérifié le 13 août 2026.
- **Les appels passent par `scripts/fc.sh`, pas par `firecrawl` en direct.** Il
  change de clé quand la clé courante n'a plus de crédit. Sans lui, un run s'est
  arrêté net au milieu d'un tournoi et n'a jamais atteint les deux suivants.
- **Les clés vivent dans `.firecrawl/keys`, une par ligne. Ce fichier n'est pas
  dans git** (ce sont des secrets) : sur un clone neuf il faut le recréer, sinon
  `fc.sh` retombe sur la config du CLI. La variable `FIRECRAWL_API_KEYS`
  (séparée par des virgules) fait la même chose et gagne sur le fichier.
- **Un tournoi à la fois.** Une clé plafonne à 18 requêtes par minute. Deux
  scrapes en parallèle ne vont pas deux fois plus vite : ils se volent le quota
  et repartent en erreur. À 1 s d'écart, deux appels sur cinq revenaient vides —
  ça ressemble à des decks manquants, ce sont des refus de débit.

Sortie : `data/decklists/<legende>/<slug>-*.json`, plus le résumé
`data/tournaments/<slug>.json` et le fragment d'index
`data/raw-scrapes/index-fragments/<slug>.json`. **Ne pas toucher au
`data/decklists-index.json` global.**

## 2. Valider — jamais sauter

```bash
npm run validate:decks     # dépasse 5 min, prévoir une limite large
```

Sortie 1 = une decklist ne correspond pas à son scrape brut, donc a été
fabriquée. Corriger ou supprimer avant de seeder. Voir le skill `decklists`.

## 3. Seeder

```bash
npx tsx scripts/seed-tournament-decks.ts <prefixe> "<contexte tournoi>" <set> "<tags,csv>"
# ex. : ... s4-chengdu "S4 Chengdu City Challenge (2026-08-02)" Unleashed "city-challenge,s4"
```

Le `<contexte tournoi>` sert de clé partout ensuite : le réutiliser à l'identique.

## 4. Lever les best-of

```bash
npx tsx scripts/mark-bestof-tournois.mts "<contexte tournoi>"
```

Pour chaque Légende jouée, la liste la mieux classée passe en `featured`. Le
script ne crée rien et il est idempotent. **Best-of = le meilleur deck de chaque
Légende**, pas le top 8.

## 5. Drapeau, pays et set

`src/lib/tournament-flags.ts` porte le pays, le continent et le set de chaque
tournoi. Un set mal étiqueté fausse les tier lists : six tournois s'étaient
retrouvés dans le mauvais set en juillet. La méthode qui tranche : chercher dans
les decks une des 14 Légendes exclusives à Déchaînement.

## 6. Vérifier et pousser

`npm run verify`, puis le skill `verifier`. Regarder la page du tournoi dans un
navigateur avant de pousser : un nombre de joueurs ou une date faux se voient
tout de suite et ne se voient jamais dans un diff.
