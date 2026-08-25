# Essais réversibles du site

## But

Tester les pistes issues de l'audit sans mêler leurs effets ni imposer une refonte.
Chaque essai doit pouvoir être évalué seul, puis gardé ou annulé par un commit local.

## Lots

1. Contrôler les corrections responsive à 320 px, 375 px, 768 px et à 200 %.
2. Clarifier l'accueil avec trois entrées : trouver un deck, voir les cartes, débuter.
3. Relier les parcours déjà présents : carte, deck, collection et deckbuilder.
4. Guider le premier usage du deckbuilder sans ajouter d'assistant ni de nouvel état.
5. Rendre visibles les dates déjà disponibles pour les prix, tier lists et tournois.
6. Repérer le français restant sous `/en` avec un contrôle automatique.
7. Mesurer les images avant de remplacer les seules qui coûtent réellement.
8. Séparer les dettes de lint, de limitation de débit et de CSP en chantiers techniques.

## Règles de réversibilité

- Un lot produit un commit local, jamais poussé ni déployé sans demande d'Allan.
- Un lot ne modifie pas les fichiers d'un autre lot sauf nécessité prouvée.
- Chaque compte rendu donne le hash du commit et la commande `git revert <hash>`.
- Aucune donnée, aucun seed et aucune base de production ne sont touchés.
- Les essais reprennent les composants et les routes qui existent déjà.

## Critères

- Aucun débordement horizontal ni contenu inaccessible à 320 px et à 200 %.
- Les trois actions principales de l'accueil sont visibles sans ouvrir un menu.
- Un visiteur peut passer d'une carte ou d'un deck aux outils liés sans chercher la route.
- Le deckbuilder explique la prochaine action quand le deck est vide.
- Les dates affichées viennent d'une source existante, jamais d'un texte recopié.
- La version anglaise ne retombe pas en français sans que le contrôle le signale.
- Une image n'est changée qu'après une mesure de poids ou de rendu.
- `npm test` et `npm run verify` passent après chaque lot de code.

## Hors périmètre des essais visuels

La limitation de débit, la CSP et l'exposition réseau demandent chacune un audit de
sécurité séparé. Les essais peuvent produire un constat et un plan, mais aucune
modification de sécurité ne part avec un changement d'interface.
