# Riftbound France — le projet en entier

Document de référence. Écrit le 12 août 2026 pour quelqu'un qui arrive sans rien
savoir : ce qu'est le site, ce qu'il contient, comment il est fait, comment on le
fait tourner et comment on le nourrit.

Les trois autres portes d'entrée : `CLAUDE.md` (architecture et commandes),
`HANDOFF.md` (état du chantier et pièges), `AGENTS.md` (règles de travail).

---

## 1. Ce que c'est

Riftbound France est le site francophone de référence sur **Riftbound**, le jeu de
cartes à collectionner de l'univers League of Legends édité par Riot Games.
Il est en ligne sur **https://riftboundfrance.fr**, tenu par Allan
(`contact@riftboundfrance.fr`, `@FRRiftbound`).

Le jeu n'a pas de ressource francophone sérieuse : les données de tournoi, les
listes de decks et l'analyse de la méta existent en anglais et en chinois, sur des
sites qui ne traduisent rien. Le projet comble ce trou. Il traduit, recoupe et
publie — sans jamais fabriquer une donnée.

Ce que le site offre aujourd'hui :

- une base de cartes complète, en français, avec filtres et aperçus au survol ;
- les decks de tous les tournois majeurs, avec un « best of » par Légende ;
- des tier lists par set et une tier list globale ;
- des articles rédigés (compte-rendus de tournoi, guides) ;
- un constructeur de deck avec import, export et code de partage ;
- un suivi de collection avec classeurs et calcul des cartes manquantes ;
- des decks publiés par la communauté, avec commentaires et « j'aime » ;
- un habillage de stream pour les diffusions de tournoi ;
- une version anglaise sous `/en`.

## 2. Le vocabulaire du jeu

Sans ça, le code est illisible.

| Terme | Ce que c'est |
|---|---|
| **Légende** (`Legend`) | La carte qui définit le deck. Une par deck. C'est l'axe de classement de tout le site. |
| **Champion** (`Champion Unit`) | Une unité, pas une Légende. **Les deux sont distincts** : `Legend` est un type, `Champion Unit` un supertype. Confondre les deux est l'erreur classique. |
| **Domaine** | La couleur : Furie, Calme, Esprit, Corps, Chaos, Ordre, Sorcellerie. |
| **Rune** | Ressource. Dans un code de deck, les runes sont un objet `{Domaine: nombre}`, pas une liste. |
| **Champ de bataille** (`Battlefield`) | Zone que le deck emmène. |
| **Réserve** (`side`) | 10 cartes depuis le set Vendetta (8 avant). Valeur dans `SIDE_SIZE`. |
| **Set** | Origines, Armes spirituelles, Déchaînement, Vendetta. |
| **RQ / RO** | Regional Qualifier, Regional Open. Un « best of » ne se calcule que sur les Regional Qualifiers. |

Deux pièges de nommage à retenir :

- **Deux Légendes s'appellent Master Yi** (Wuju Bladesman et Wuju Master). Toujours
  lire la vraie Légende du deck, jamais retomber sur le set ou le champion.
- Les noms à apostrophe (Kha'Zix, Kai'Sa, Rek'Sai) ont toujours un alias sans
  apostrophe. `cleanName` retire l'apostrophe **et** la virgule.
- La convention d'écriture est `Nom, Titre` avec une virgule, jamais `Nom - Titre`.

## 3. Les pages

43 pages, plus le back-office. Toutes existent aussi sous `/en`.

**Découverte** — `/` (accueil avec tier list), `/cartes` et `/cartes/[id]`,
`/legendes` et `/legendes/[slug]`, `/meta`, `/tier-list`.

**Tournois et decks** — `/tournois` et `/tournois/[slug]`, `/decks` et
`/decks/[slug]`, `/decks/compare`, `/d/[code]` (deck partagé par code).

Règle de contenu : **`/decks` ne montre que les « best of » par tournoi**, plus les
guides et les decks de la communauté. Les listes brutes vivent sur
`/tournois/[slug]`.

**Outils** — `/deckbuilder`, `/collection` (+ `/collection/[binderId]` et
`/collection/partage/[shareSlug]`), `/community-decks`, `/outils/compteur`,
`/outils/regles`.

**Guides et articles** — `/guides` avec sept guides (débuter, deckbuilding,
domaines, glossaire, ban list, méta, jouer en ligne), `/articles` et
`/articles/[slug]`.

**Compte** — `/profil`, `/profil/overlay`.

**Stream** — `/overlay/[token]`, adressée par jeton, seule route à la CSP élargie.

**Back-office** — `/admin` (login par mot de passe unique) avec la gestion des
articles, des decks, des événements et des tier lists.

**Technique** — `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/manifest.webmanifest`,
`/offline`, `/a-propos`.

## 4. Comment c'est fait

Détail complet dans `CLAUDE.md`. En bref : **Next.js 16.3** en App Router,
**React 19**, **Prisma 6** sur **PostgreSQL 16**, **Tailwind 4**, TypeScript strict,
Vitest. Sortie `standalone`, image Docker, déployée par Coolify derrière Caddy sur
un serveur Hetzner.

Trois principes tiennent l'ensemble :

1. **Toute la logique métier est dans `src/lib/`.** Les pages assemblent, elles ne
   calculent pas.
2. **Un seul passage par sujet.** `resolveDeckCards` pour les cartes d'un deck,
   `TIER_BANNER` pour les couleurs de tier, `deckCoverageItems` pour les cartes
   manquantes. Chaque fois que ces blocs ont été copiés, les copies ont divergé et
   le même deck n'affichait pas la même chose selon la page.
3. **Le code est écrit en français**, et les commentaires disent ce qui cassait
   avant, pas ce que fait la ligne suivante.

### La base

18 modèles. Les axes : cartes (`Card`, `CardSet`), decks officiels (`Deck`,
`DeckCard`, `Event`), decks de la communauté (`CommunityDeck`,
`CommunityDeckVersion`), collection (`CollectionItem`, `Binder`), éditorial
(`Article`, `TierList`, `TierListEntry`), comptes (`User`, `Comment`,
`CommentVote`), stream (`OverlayState`), et **deux systèmes de « j'aime »
séparés** (`DeckLike`, `CommunityDeckLike`).

Pas de migrations : `prisma db push`. Aucun retour arrière possible.

### Les codes de deck

Un deck se résume à une chaîne. Trois formes coexistent :

- le **texte** collé depuis un autre site, lu par `deck-code.ts` (il reconnaît une
  vingtaine d'en-têtes de section : `Main Deck`, `maindeck`, `Sideboard`…) ;
- le **code court base64** de `deck-codec.ts`, utilisé dans les URL `/d/<code>` ;
- les **lignes en base** (`DeckCard`) pour les decks officiels.

`resolveDeckCards` les ramène tous aux vraies cartes, et rend explicitement ce
qu'il n'a pas trouvé.

## 5. Les données et d'où elles viennent

C'est le cœur du projet, et sa règle la plus stricte.

### La règle : ne jamais fabriquer

**On n'invente jamais une decklist, un deck, un résultat ou une carte.** Si la
donnée réelle n'existe pas ou n'est pas vérifiable, on saute le deck ou on le
supprime. Un deck manquant vaut mieux qu'un deck faux.

En clair : on source toujours depuis le scrape brut, jamais « de mémoire » ni par
déduction d'archétype. On ne complète pas un deck partiel — si la source affiche
« Missing / Not available », le deck n'a pas de liste et on ne la fabrique pas.

Cette règle n'est pas théorique. L'audit du 16 juin a trouvé un tournoi entier
(Changsha) dont le « best of » était fabriqué, et le « best of » de Sydney a dû
être refait à partir d'un vrai scrape de 130 decks. Le garde-fou est
`npm run validate:decks`, qui compare chaque decklist en base à sa source brute et
sort en erreur au moindre écart.

### La chaîne, du site source à la page publiée

1. **Scraper.** La source est riftdecks, protégée par Cloudflare. Un scrapeur seul
   échoue : il faut ouvrir un navigateur pour résoudre le défi, récupérer le cookie
   `cf_clearance`, puis passer par `curl_cffi` en espaçant les requêtes de 2,5 à
   3,5 secondes. Pour le reste du web, l'outil est **Firecrawl** — `WebFetch` et
   `curl` se prennent des 403.
2. **Stocker le brut** dans `data/raw-scrapes/<tournoi>-pageN.md`. Ce fichier n'est
   plus jamais modifié : c'est la preuve.
3. **Convertir** avec un script `parse-*.ts` vers `data/decklists/`.
4. **Vérifier** : `npm run validate:decks`. Corriger ou supprimer tout écart.
5. **Seeder** en base locale avec un script `seed-*`.
6. **Calculer le best of** : le meilleur deck de chaque Légende, uniquement sur les
   Regional Qualifiers, choisi automatiquement — pas de filtre manuel.
7. **Publier** : article, page de tournoi, mise à jour de la tier list.

### Les autres sources

- **Les cartes** viennent de l'API Riftcodex, par `scripts/sync-cards.ts`. Attention :
  cette API a des particularités connues (403 sans `User-Agent`, recherche en 422,
  noms passés au tiret) documentées dans les mémoires du projet.
- **La connaissance de la méta** vient de VOD de tournoi transcrites par Whisper.
  Whisper massacre les noms propres (« Aurelia » pour Irelia, « Cold Shot » pour
  Called Shot) : d'où `npm run validate:names`, qui confronte chaque nom cité à la
  vraie base et corrige tout seul en dessous d'une distance de 2. Le pipeline et la
  hiérarchie des documents sont dans `data/video-insights/README.md`.
- **Les règles du jeu** (bans, domaines, errata) sont codées en dur dans
  `src/lib/`, pas en base : `banned-cards.ts` (10 cartes, deux annonces cumulées),
  `domains.ts`, `errata-2026-07.ts`, `core-rules.ts`.

### Le réflexe qui compte

**Recouper toute donnée nouvelle contre l'existant avant de la figer.** Base de
cartes, ban list, table des domaines, scrapes bruts, rapports de méta. Ne jamais
traiter une information isolément — c'est comme ça que les sets de six tournois se
sont retrouvés mal étiquetés, et que des « best of » ont perdu leur carte Légende.

## 6. Le contenu éditorial

Les articles sont signés Allan et suivent `docs/ARTICLE-STYLE.md`.

Ce qui est imposé :

- **Écrire comme un humain, pas comme un droïde.** Ton de forum ou d'article, zéro
  anglicisme (« field » ne s'écrit jamais), aucune note interne, aucun numéro de
  règle affiché.
- **Aucun tiret cadratin dans le contenu rendu.** Toléré dans les docs internes.
- **Ne jamais citer riftdecks** comme source dans un article publié.
- La syntaxe `[[nom de carte]]` produit un aperçu au survol.
- Les images vont dans `/img/articles/` en WebP, avec une couverture obligatoire.
- Les images Open Graph des articles sont générées en **PNG** : X ne lit pas le WebP.

**Changer un deck oblige à réécrire le texte autour.** Le bloc de decklist est relu
en base, mais la prose, elle, ment en silence : elle continue de décrire l'ancienne
liste et les anciennes parts de prix.

## 7. Faire tourner le projet

```bash
docker compose up -d db          # PostgreSQL 16 sur 127.0.0.1:5433
cp .env.example .env             # puis remplir DATABASE_URL et SESSION_SECRET
npx prisma db push
npx prisma generate
npx tsx scripts/seed-cards.ts
npm run dev                      # http://localhost:3000
```

`SESSION_SECRET` n'est pas facultatif : sans lui, toute page qui lit une session
lève une erreur. Le générer avec `openssl rand -hex 32`.

Avant tout push : `npm run verify` (c'est `tsc --noEmit && next build`). Vérifier le
code de sortie pour de vrai — `rtk` le masque et a déjà laissé passer du code cassé.

L'état exact de chaque commande, y compris celles qui échouent, est dans `CLAUDE.md`
et `HANDOFF.md`.

## 8. Déploiement

Coolify construit l'image depuis le `Dockerfile` et gère le proxy. Le
`docker-compose.yml` du dépôt ne sert qu'au développement local. Au démarrage du
conteneur, `entrypoint.sh` lance `node migrate.mjs` (qui pousse le schéma si les
tables manquent) puis `node server.js`.

**Un déploiement ne seede pas les decks.** Le contenu se pousse séparément.

Détail dans `docs/DEPLOIEMENT.md`.

## 9. Sécurité

Ce qui est en place : sessions signées HMAC-SHA256 avec expiration à 30 jours et
aucun repli si le secret manque, refus des écritures API cross-origin, en-têtes de
sécurité et CSP posés par le middleware, limitation de débit sur une partie des
routes, contrôles de propriété sur les objets d'un utilisateur.

Ce qui ne l'est pas, et qui est prioritaire :

- **la base de production est exposée sur une IP publique** (`178.104.237.33:15432`,
  via un tunnel socat) — première tâche du `HANDOFF.md` ;
- la CSP garde `unsafe-inline` et `unsafe-eval` ;
- la limitation de débit vit en mémoire et ne couvre pas toutes les routes qui
  écrivent.

## 10. Historique

Le site est né fin mai 2026 et a grossi par vagues. Les grandes étapes :

| Quand | Quoi |
|---|---|
| 25-31 mai 2026 | Premier build, audits, deckbuilder v2, mise en production. |
| 8-9 juin | Fonctionnalité Collection : cartes possédées, classeurs, import Piltover. Fusionnée et déployée. |
| 15-17 juin | Audits sécurité et SEO. Audit d'intégrité des decklists : Changsha trouvé fabriqué, Sydney refait. |
| 26 juin | Audit global multi-agents. Le point **C1** (base de production exposée) est ouvert ce jour-là. |
| Juin-juillet | Vagues de tournois scrapés et seedés : Changsha, Vancouver, Utrecht, Hartford, Tianjin, Fuzhou, Suzhou. |
| 24 juillet | Import du set **Vendetta** : 227 cartes, 9 nouvelles Légendes, nouvelle ban list, réserve passée à 10. |
| 27-29 juillet | Correction de six tournois mal étiquetés. Audit d'interface complet avec les skills `better-*`. |
| 2-9 août | Rapports Google APIs et GEO. Montée en Node 24 et Next 16.3. |
| 11 août | Refonte de la page collection, retrait de la wishlist, passe d'accessibilité, 13 commits. |
| 12 août | Rangement du dépôt : audits fusionnés, prompts regroupés, documentation refaite. |

Le détail de chaque audit est dans `docs/AUDITS.md`.

## 11. Le paysage autour

Les sites concurrents : riftbound.gg (éditorial et guides), riftdecks (données de
tournoi brutes), Magical Meta, Runes & Rift, riftboundstats. Tous en anglais.

Ce que Riftbound France n'a pas encore et que les autres ont, ou l'inverse : prix
en euros, notion de « decks jouables » selon la collection, bot Discord, agenda des
événements français. C'est la matière à idées, pas une feuille de route validée.

## 12. Les règles de travail

Elles sont dans `AGENTS.md` et s'appliquent à tout le monde, humain ou agent.
Les quatre qui reviennent le plus :

1. **Vérifier, jamais deviner.** L'outil existe déjà : le chercher avant d'en écrire
   un. Le visuel de deck, par exemple, c'est `/api/decklist-image` et rien d'autre.
   Une supposition non vérifiée coûte plus cher que la question.
2. **Ne jamais fabriquer une donnée de deck.** Sauter plutôt que publier du faux.
3. **Recouper le nouveau contre l'ancien** avant de figer quoi que ce soit.
4. **Lancer les agents par vagues de trois ou quatre.** Au-delà, l'API limite le
   débit — c'est arrivé trois fois.
