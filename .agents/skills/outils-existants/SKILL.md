---
name: outils-existants
description: Carte des outils déjà écrits sur Riftbound France. À consulter AVANT de produire un visuel, une image de deck, un lien d'achat, un prix, un export ou un script. Empêche d'écrire un deuxième rendu qui ne ressemblera pas au reste du site.
---

# L'outil existe déjà — le chercher avant d'en écrire un

Règle absolue du dépôt. Un deuxième rendu écrit à côté ne ressemblera jamais au
reste du site et finira à la poubelle. Avant de produire quoi que ce soit, lister
ce que le site fait déjà et s'en servir.

## Images de deck

**`GET /api/decklist-image?slug=<slug>`** — aussi `?code=`, `?share=`. Route
publique, serveur de dev lancé. C'est **le** visuel de deck.

- Carré **2000x2000** par défaut.
- `&format=story` : 9:16, **1620x2880**.
- Les dimensions vivent dans `FORMATS`, `src/app/api/decklist-image/route.tsx`.

Le rendu à plat paysage **2258x1518** est autre chose : `generateDeckImage` de
`src/lib/export-image.ts`, déclenché par le bouton « Exporter » d'une page deck.

**Ne jamais écrire un autre rendu d'image de deck, ne jamais inventer un format.**

## Prix et achat

**`src/lib/cardnexus.ts`, et lui seul.** Il porte les liens affiliés
(identifiant de partenaire Impact). Un lien CardNexus écrit à la main ailleurs
est un lien non tracké : une vente perdue en silence.

- Prix affichés : `data/prices/card-prices.json`, relevé par `npm run sync-prices`.
- Panier prêt à payer : `/api/cardnexus/panier?slug=` (aussi `?code=`, `?share=`).

## Visuels de tier list

`scripts/gen-tierlist-image.mts`. Voir `content/tweets/README.md`.

## Cartes d'un deck

`resolveDeckCards` (`src/lib/deck-cards.ts`) : passage unique entre un code de
deck et les cartes en base. Jamais de requête carte écrite à la main.

## En cas de doute

**Ne pas deviner un format, un nom ou un chemin : vérifier dans le code, ou
demander.** Une supposition non vérifiée coûte plus cher que la question. Si la
vérification est impossible, le dire et s'arrêter — ne pas livrer une
approximation.
