# Rapport, 22 juillet 2026

National Open S3, règles Vendetta, pages Légendes, référencement, mise en prod.

## 1. National Open S3, de bout en bout

Le plus gros tournoi Unleashed jamais joué : 2 048 joueurs, le 19 juillet 2026.

- **Scrape** terminé à 2 032 pages sur 2 032 (drip + Firecrawl, deux comptes).
- **Conversion** : 1 957 decklists écrites. 75 pages refusées : 73 sans une seule
  carte, 2 où la ligne de légende affiche « Volibear, Furious » (un champion, pas
  une légende lisible). Rien n'est reconstitué.
- **Tier** inchangé : 9 555 decks classés, seuil de conversion 2,76 %. Le scrape
  complet confirme l'index, donc pas de re-seed du tier.
- **Cores de deckbuilding refaits** : ils avaient été calculés sur un scrape partiel
  et disaient faux. Corrigés sur le jeu complet (Irelia : Draven Audacious n'existe
  pas, c'était un artefact ; LeBlanc : Vi Peacekeeper reste au core ; ordre des
  champs de bataille inversé ; Master Yi : 82 % Tempered / 18 % Honed sur 307 listes).
- **Article** best-of du National créé, la meilleure liste de chacune des 40 Légendes,
  avec la couverture `S3-national.webp`.
- **Best-of** : 40 decks, vérifiés ligne à ligne contre la source, 0 écart.

## 2. Règles et ban list Vendetta (24 juillet 2026)

Source : annonces officielles + PDF FR du Rules Hub, rangés en texte cherchable dans
`data/meta-reports/regles-*-2026-07-16.txt` (le PDF de mars est marqué périmé).

- **Ban list Standard** : Stealthy Pursuer, plus deux champs de bataille lourds,
  Aspirant's Climb (23 % des decks) et The Arena's Greatest (18 %).
- **Aucune légende bannie** dans les formats du site. L'annonce en bannit une en 2v2
  construit, format non couvert : ne jamais la faire remonter côté site.
- **Nouvelle page `/guides/ban-list`** (index guides, sitemap, llms.txt).
- **Glossaire** : amplification, amplifié, désamplifier, Flux, brûler, passer, plus
  défausser et bannir. Tous les « Voir aussi » pointent vers un terme existant.
- META-KNOWLEDGE et DECKBUILDING portent les deux annonces ; les 5 champs de bataille
  bannis sont barrés dans le tableau.

## 3. Référencement

- **Cannibalisation résolue** : l'accueil affichait la tier list entière et captait
  les requêtes à la place de `/tier-list`. Renommé « Aperçu du méta », lien vers la
  page dédiée. La carte a une hauteur fixe (555 px), elle ne saute plus au changement
  d'onglet.
- **`/decks`** : texte d'entrée + recherche par deck, Légende, joueur ou carte.
- **14 Légendes** qui pesaient dans le méta avaient des decklists mais aucune page,
  dont Kai'Sa (3 013 listes). Fiches générées depuis les données mesurées, sans prose
  inventée. Puis guides « Comment jouer » écrits pour les 14 (Lee Sin, Kai'Sa, etc.) :
  129 cartes citées, toutes résolues en base.
- **Validateur anti-fabrication** : lisait 3 dossiers de scrape en dur, il les lit
  tous. 20 955 listes vérifiées contre leur source, 0 fabrication.

## 4. Audit du site (22 juillet)

- 1 109 liens internes testés, 0 cassé.
- Un H1, un titre, une description, un canonical par page. JSON-LD présent partout.
- Deckbuilder : refuse les 3 bans de juillet, laisse passer Master Yi.
- **`/decks` corrigé** : ne montre plus les 1 957 listes brutes du National. Il garde
  le meilleur deck de chaque Légende par tournoi, les decks avec guide et ceux de la
  communauté. Les listes complètes restent sur `/tournois/[slug]`. Catégorie
  « Tournois » retirée, filtre par tournoi = best-of.
- **Chiffre périmé** : description de `/tier-list` passée de 7 903 à 9 555 decks.
- **Mot « field »** retiré du texte du site (anglicisme).

## 5. Mise en prod

Seed prod via le tunnel public `178.104.237.33:15432` (le tunnel local `5435` reste
fermé). Résultat vérifié : 1 957 decks du National, 40 best-of, article présent.

Un défaut de données prod trouvé et corrigé : la carte « Mischevious Marai » (faute de
frappe, `i` manquant) décrochait 31 decks. Renommée `Mischievous Marai`, re-seed
lancé, la carte est maintenant liée à 33 decks.

**Reste à la charge d'Allan** :
- Le déploiement Coolify ne s'est pas relancé (`/guides/ban-list` en 404 en ligne). Le
  code est sur `main`, il part au prochain déploiement. Vérifier la case Auto Deploy.
- Base cartes prod à resynchroniser : la faute « Mischevious » suggère un décalage plus
  large entre la base cartes locale et prod.

## Commits poussés sur main

- `9301c677` National complet, règles Vendetta, pages Légendes, recherche decks
- `3dde6f13` tier list accueil figée, terrains au survol, textes de 14 Légendes
- `e19b6a87` /decks best-of seulement, tier list 9555
