# Audit des autres pages, 12 novembre 2026

Demandé par Allan après l'application de la version « actuel en mieux » à l'accueil, à
`/decks/[slug]` et à `/legendes/[slug]` : regarder les autres pages pour les améliorer
dans le même esprit (ce qui compte en haut, des chiffres lisibles, moins de vide, pas
d'identité nouvelle).

**Méthode.** 23 pages chargées sur le build de production local (base locale), à 1 440
puis 390 px, deux écrans capturés par page, mesures prises dans la page. Script :
`comparaison-audit/outils/audit-pages.mjs`. Chaque constat ci-dessous a été vérifié dans
le code. Non vu : les pages connectées (`/collection`, `/profil`), Safari sur iPhone.

## Corrigé le jour même

| Page | Constat | Commit |
|---|---|---|
| `/tier-list` | 36 icônes sans nom ; l'infobulle ne s'ouvre pas au doigt. Les noms passent sous les icônes, comme sur l'accueil. | `cd1b3228a` |
| `/meta` | Les chiffres comptent les joueurs classés (`meta-parts.json`) mais s'appelaient « decklists complètes » et « decks ». | `617525d00` |
| `/decks/[slug]` | Six erreurs `react/jsx-key` dans la ligne d'en-tête du 11 novembre : la CI aurait rejeté le push. | `f7ef8cf85` |

## À faire, du plus utile au moins utile

Rien n'est appliqué à `main` : chaque ligne attend le oui d'Allan. Les dix sont codées
sur la branche `propal/autres-pages`, un commit par proposition, et se voient avant/après
dans `comparaison-audit/propal/` (http://localhost:3004/propal/). Pour en prendre une :
`git cherry-pick <commit>` sur `main`, puis la porte.

| # | Commits sur `propal/autres-pages` |
|---|---|
| 1 | `ab55a2350` `e19713c1a` |
| 2 | `63c7517a8` |
| 3 | `8796bdabd` |
| 4 | `49bd0a2db` `d11a73052` |
| 5 | `505987345` |
| 6 | `73e7517ad` |
| 7 | `5cf6eca8b` (à noter au journal SEO : le texte du `h1` change pour un moteur) |
| 8 | `b9de00d5a` |
| 9 | `2954a40bf` |
| 10 | `1d48a0c0c` |
| Traductions | `6b7c73491` `a04951952` (phrases anglaises des 4, 7 et 10) |

Deux écarts avec le tableau ci-dessous, vus en codant : la 2 remonte le nom et la rareté,
pas le prix, qui reste juste sous l'image ; la 3 place « À lire aussi » dans la colonne
(les titres d'un article n'ont pas d'ancre, un sommaire aurait demandé de toucher au rendu
des blocs).

| # | Page | Mesure | Proposition |
|---|---|---|---|
| 1 | `/legendes` | 5,6 écrans sur ordinateur, 12,9 sur téléphone : une bannière par ligne pour 54 Légendes. | Deux vignettes par ligne sur téléphone ; sous le nom, les joueurs classés et la part du champ (`parts-classement.ts`). |
| 2 | `/cartes/[id]` | Sur téléphone le titre arrive à 719 px : l'image prend tout le premier écran, le nom et le prix sont dessous. | Titre, rareté et prix au-dessus de l'image sur téléphone ; image limitée à 60 % de la hauteur d'écran. |
| 3 | `/articles/[slug]` | Le texte tient sur 75 caractères à gauche, les decklists prennent toute la largeur : la moitié droite reste vide sur un écran. | Un sommaire collant à droite sur ordinateur (les titres de l'article), ou le texte centré. |
| 4 | `/outils/regles` | 149 écrans sur ordinateur, 344 sur téléphone, 2 Mo de HTML, aucun bloc replié. | Un chapitre ouvert à la fois (`<details>`), le sommaire en tête ; la recherche du navigateur continue de trouver le texte. |
| 5 | `/articles` | 14,6 écrans sur téléphone : une grande carte par article. | Les trois derniers en grand, la suite en lignes (vignette, titre, date). |
| 6 | `/meta` | Le titre finit à 309 px sur ordinateur : surtitre, titre sur deux lignes, chapô, puis trois chiffres, avant le premier filtre. | En-tête resserré, le sélecteur de set à côté du titre. |
| 7 | `/tournois` | Le `h1` porte deux libellés (un court pour téléphone, un long pour le reste) : Google lit « Tournois RiftboundTournois Riftbound - Résultats et calendrier ». | Un seul libellé, raccourci par CSS si besoin. Touche un titre : à écrire au journal SEO. |
| 8 | `/guides/glossaire` | Contenu sur toute la largeur de l'écran (`glossaire-client.tsx`, conteneur sans `max-w-7xl`) quand les autres pages tiennent 1 280 px (choix E2 du 12 novembre). | Le ramener à 1 280 px. |
| 9 | `/tournois/[slug]` | Titres de section en capitales espacées (« MÉTA DU TOURNOI », « TOP 8 ») : seule page hors de l'échelle de titres choisie (E5). | Les passer à l'échelle commune. |
| 10 | `/collection` (déconnecté) | Un seul bouton sur un écran vide. | Trois lignes qui disent ce qu'on y gagne (classeurs, cartes manquantes, decks jouables), avant le bouton. |

## Rien à signaler

`/decks`, `/cartes`, `/guides`, `/guides/debuter`, `/guides/ban-list`, `/guides/domaines`,
`/deckbuilder`, `/decks/compare`, `/outils/tier-list`, `/community-decks`, `/a-propos` :
pas de débordement, titre dans le premier écran, composition cohérente avec le reste.
`/profil` redirige vers la connexion Discord quand on n'est pas connecté : voulu.
