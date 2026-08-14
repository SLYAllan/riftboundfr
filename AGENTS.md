<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Ce fichier est la source unique

**Tout le fond est ici** : règles de travail, architecture, commandes, conventions,
et ce qui n'existe que d'un côté (dernière section). Raison : **Codex lit
`AGENTS.md` et ne lit pas `CLAUDE.md`**, alors que Claude Code lit les deux
(`CLAUDE.md` commence par `@AGENTS.md`). `CLAUDE.md` est donc vide de fond, exprès :
une consigne posée là serait invisible à Codex, puis divergerait. **Toute nouvelle
consigne va ici.**

Autres portes d'entrée : `HANDOFF.md` (état du chantier, ce qui est cassé, pièges) ·
`docs/PROJET.md` (le projet en entier) · `docs/README.md` (index des docs et carte
des données) · `.hermes/PROJECT.md` (brief court pour l'orchestrateur).

# Vérifier, jamais deviner — RÈGLE ABSOLUE

**L'outil existe déjà. Cherche-le avant d'en écrire un.** Avant de produire quoi que
ce soit (visuel, export, script), lister ce que le site fait déjà et s'en servir. Ne
JAMAIS créer un nouveau rendu quand une route, un composant ou un script couvre le
besoin : le résultat ne ressemblera pas au reste du site et sera à jeter.

- **Prix et achat d'un deck** → `src/lib/cardnexus.ts`, et lui seul. Il porte les
  liens affiliés (identifiant de partenaire Impact) : un lien CardNexus écrit à la
  main ailleurs est un lien non tracké, donc une vente perdue en silence.
  Prix affichés = `data/prices/card-prices.json`, relevé par `npm run sync-prices`.
  Panier prêt à payer = `/api/cardnexus/panier?slug=` ou `?code=`.
- **Images de deck** → `GET /api/decklist-image?slug=<slug>` (aussi `?code=`,
  `?share=`), publique, serveur dev lancé. C'est **le** visuel de deck.
  Carré **2000x2000** par défaut, `&format=story` pour le 9:16 **1620x2880**
  (dimensions dans `FORMATS`, `src/app/api/decklist-image/route.tsx`).
  Rendu à plat paysage 2258x1518 = `generateDeckImage` de
  `src/lib/export-image.ts`, déclenché par le bouton « Exporter » d'une page deck.
- **Visuels de tier list** → `scripts/gen-tierlist-image.mts`, voir
  `content/tweets/README.md`.

**Ne pas deviner un format, un nom ou un chemin : vérifier dans le code ou demander.**
Une supposition non vérifiée coûte plus cher que la question. Si la vérification est
impossible, le dire et s'arrêter — ne pas livrer une approximation.

# Intégrité des données decklists — RÈGLE ABSOLUE

**N'invente JAMAIS une decklist, un deck, un résultat ou des cartes.** Si la donnée
réelle (riftdecks / scrape brut dans `data/raw-scrapes/`) n'existe pas ou n'est pas
vérifiable, **SKIP ou SUPPRIME** le deck — on ne publie jamais de données fausses ou
incertaines. Mieux vaut un deck manquant qu'un deck faux.

- Toujours sourcer les cartes depuis le scrape brut réel ; jamais "de mémoire" ni par
  inférence d'archétype.
- Ne pas "compléter" un deck partiel : si riftdecks affiche "Missing / Not available",
  le deck n'a pas de liste → on ne la fabrique pas.
- **Avant tout seed/publication**, lancer le validateur :
  `python -X utf8 scripts/validate-decklists.py` (exit 1 si une decklist ne correspond
  pas à sa source brute = fabrication). Corriger ou supprimer tout MISMATCH.
- Les articles Top 8 avec decklists codées en dur (`prisma/seed-top8-articles.ts`)
  doivent refléter le scrape fidèle, pas une couche approximée.

# Automatismes & sources de vérité (lire avant d'agir)

**Commandes one-shot** (codes de sortie réels — NE PAS passer par `rtk` comme garde dans un `&&`, `rtk` masque l'exit code) :
- `npm run verify` → `tsc --noEmit && next build` (à lancer avant tout push ; vérifier l'EXIT).
- `npm run fix:names <doc.md>` → auto-corrige les noms Whisper (distance ≤ 2 vs DB cartes) ; `npm run validate:names` = gate (exit 1 si suspects).
- `npm run validate:decks` → garde-fou anti-fabrication decklists (exit 1 si MISMATCH vs scrape brut).

**Sources de vérité (où vit quoi) :**
- Cartes / noms canoniques → **DB cartes** + `src/lib/banned-cards.ts` (10 bans : 7 du 31 mars 2026 + 3 du 24 juillet 2026) + `data/raw-scrapes/` (riftdecks). **Les liens web fournis par Allan + la DB priment sur les transcriptions Whisper pour les noms.**
- Connaissance VOD (méta, matchups, cores) → `data/video-insights/README.md` (index + hiérarchie + pipeline). Matchups = `matchups-reference.md` (source unique).
- Méta/tier/rulings → `docs/META-KNOWLEDGE.md` · règles deckbuilding/cores → `docs/DECKBUILDING-RULES.md` · par Légende → `data/fiches/*.json`.
- Architecture, commandes vérifiées et conventions → **plus bas dans ce fichier** · état du chantier et pièges → `HANDOFF.md` · index des docs → `docs/README.md` · le projet en entier → `docs/PROJET.md`.

**Réflexes :**
- **Coupler le nouveau à l'ancien** : recouper toute donnée importée contre les sources ci-dessus AVANT de la figer ; ne jamais traiter une info isolément.
- **Agents/Workflow par vagues de 3-4 max** (jamais plus → rate-limit API). Pas 2 gros workflows en même temps.
- Contenu **site** rendu : **pas de tiret cadratin (—)**, terminologie FR officielle. Docs internes (META/DECKBUILDING/video-insights) : em-dash toléré.

---


# Riftbound France — repère technique

Site francophone du jeu de cartes Riftbound : base de cartes, decks de tournoi,
tier lists, articles, deckbuilder, collection, habillage de stream.
En production sur https://riftboundfrance.fr.

Les règles de travail (ne jamais deviner, ne jamais fabriquer une decklist,
sources de vérité) sont plus haut. Ce qui suit décrit la machine.

## Stack

| Quoi | Version | Où c'est fixé |
|---|---|---|
| Next.js, App Router, `output: standalone` | 16.3 | `next.config.ts` |
| React | 19.2.4 | `package.json` |
| TypeScript, `strict` | 5 | `tsconfig.json` |
| Prisma + PostgreSQL 16 | 6.19 | `prisma/schema.prisma` |
| Tailwind CSS (v4, config dans le CSS) | 4 | `src/app/globals.css` |
| Vitest (Node, pas de DOM) | 4.1 | fichiers `*.test.ts` à côté du code |
| Node | >= 22 | `engines` de `package.json` |

Les composants d'interface viennent de `@base-ui/react` et shadcn
(`components.json`), les icônes de `lucide-react`.

## Arborescence

```
src/app/          Routes (App Router). Un dossier = une URL.
  api/            Routes serveur (voir « API » plus bas).
  admin/          Back-office, protégé par mot de passe.
  d/[code]/       Deck partagé par code, avec image Open Graph.
  deckbuilder/    Constructeur de deck (gros composant client).
  overlay/[token] Habillage de stream, la seule route qui encadre un site tiers.
src/lib/          TOUTE la logique métier. Pas de logique dans les pages.
src/components/   Composants partagés entre plusieurs pages.
src/middleware.ts CSRF, version anglaise, en-têtes de sécurité.
prisma/           Schéma + scripts de seed par tournoi.
scripts/          ~77 scripts one-shot : scraping, seed, audit, validation.
data/             Sources de vérité hors base : scrapes bruts, fiches, insights VOD.
content/          Textes rédigés à la main (articles, aide de jeu, tweets).
docs/             Connaissance du projet + archive des audits (voir docs/README.md).
public/           Fichiers servis tels quels. Rien d'autre ne doit y atterrir.
```

## Où vit la logique métier

Tout est dans `src/lib/`. Les points d'entrée qui comptent :

- **`deck-cards.ts` — passage unique entre un code de deck et les cartes en base.**
  `resolveDeckCards` est le seul chemin autorisé. Le bloc était copié dans quatre
  fichiers, chacun avec le même défaut (une carte introuvable disparaissait en
  silence). Ne jamais refaire la requête carte à la main : la fonction rend les
  cartes trouvées **et** la liste `missing`.
- `deck-code.ts` / `deck-codec.ts` — lecture d'une decklist en texte, et
  encodage/décodage du code court partagé dans les URL `/d/<code>`.
- `card-printing.ts` — un nom de carte a plusieurs formes (apostrophe, virgule,
  suffixe de variante). `findCard` et `normalizeCardName` réconcilient tout ça.
- `auth.ts` / `session.ts` — deux sessions distinctes, deux cookies :
  `riftbound_admin` pour le back-office, `riftbound_session` pour le compte
  Discord. Les deux sont signées HMAC-SHA256 avec `SESSION_SECRET` et expirent
  au bout de 30 jours. Aucun repli si le secret manque : le code lève.
- `prisma.ts` — client unique (`globalThis` en dev pour survivre au rechargement).
  `safeQuery(fn, fallback)` sert aux pages qui doivent s'afficher même si la base
  répond mal.
- `i18n.ts` (client) et `i18n-server.ts` (serveur) — **ne pas fusionner** :
  `next/headers` n'existe pas côté client, et les mélanger casse tout le site au
  chargement. Le dictionnaire `i18n-en.ts` est indexé **par le texte français
  lui-même**, donc une phrase non traduite retombe sur le français.
- `collection.ts` / `collection-server.ts` — même découpage client/serveur.
- `banned-cards.ts`, `bans.ts`, `core-rules.ts`, `domains.ts`,
  `tournament-flags.ts`, `errata-2026-07.ts` — règles du jeu et métadonnées de
  tournoi codées en dur, relues par plusieurs pages.
- `export-image.ts` — rendu paysage 2258x1518 dans un canvas côté navigateur,
  déclenché par le bouton « Exporter » d'une page de deck.

## Points d'entrée

- **`src/middleware.ts`** tourne avant toute page. Il fait quatre choses :
  1. refuse les écritures API cross-origin (403) ;
  2. réécrit `/en/...` vers la page française et pose les en-têtes `x-langue` et
     `x-chemin` que lit `i18n-server.ts` — aucune page n'est dupliquée ;
  3. pose les en-têtes de sécurité et la CSP ;
  4. élargit la CSP pour `/overlay/` seulement (iframe VDO.Ninja + images de
     n'importe quel hôte). Ne pas élargir ailleurs.
- **`src/app/layout.tsx`** — coquille du site, `metadataBase`, polices, analytics.
- **`entrypoint.sh`** — démarrage du conteneur : `node migrate.mjs` (vérifie les
  18 tables et refuse une base vide ou incomplète) puis `node server.js`.

## API

- `/api/v1/*` — API publique en lecture seule (cartes, decks, tier list).
- `/api/admin/*` — écriture, protégée par le cookie `riftbound_admin`.
- `/api/auth/*` — OAuth Discord, session, profil.
- `/api/collection/*`, `/api/community-decks/*`, `/api/comments/*` — espace
  connecté.
- **`/api/decklist-image`** — LE visuel de deck, généré par `next/og`.
  Paramètres : `?slug=`, `?code=` ou `?share=`, plus `?format=story`.
  Carré **2000x2000** par défaut, `story` = **1620x2880** (9:16).
  Ne jamais écrire un autre rendu d'image de deck.
- `/api/overlay/*` — état de l'habillage de stream, adressé par jeton.
- `/api/image-proxy` — sert les images distantes en respectant la CSP.

## Base de données

18 modèles dans `prisma/schema.prisma`. Les axes :

- **Cartes** : `Card`, `CardSet`.
- **Decks officiels** : `Deck` + `DeckCard`, rattachés à un `Event`.
- **Decks de la communauté** : `CommunityDeck` + `CommunityDeckVersion`.
- **Deux systèmes de « j'aime » distincts** : `DeckLike` (decks officiels) et
  `CommunityDeckLike`. La page Favoris fusionne les deux. Ne pas les confondre.
- **Collection** : `CollectionItem`, `Binder`.
- **Éditorial** : `Article`, `TierList` + `TierListEntry`.
- **Comptes** : `User`, `Comment`, `CommentVote`.
- **Stream** : `OverlayState`.

Pas de dossier `migrations/` : le schéma est poussé avec `prisma db push`.

# Commandes

Toutes vérifiées le 14 août 2026 sur `main`. Un agent doit s'y fier pour valider
son travail.

| Commande | État | Ce qu'elle fait |
|---|---|---|
| `npm run dev` | ✅ | Serveur de développement sur http://localhost:3000. |
| `npm run build` | ✅ | Build de production. Quelques minutes. |
| `npx tsc --noEmit` | ✅ | Vérification des types. Sortie 0, aucune erreur. |
| `npm test` | ✅ | Vitest. **22 fichiers, 140 tests, tous verts.** |
| `npm run verify` | ✅ | `tsc --noEmit && next build`. **La porte avant tout push.** |
| `npm run lint` | ✅ | **0 erreur, 97 avertissements.** Les avertissements restent à réduire. |
| `npm run sync-prices` | ✅ | Relève les prix CardNexus (~30 s). Demande la base et `CARDNEXUS_API_KEY`. |
| `npm run validate:names` | ⚠️ | Demande la base. Corrige avec `npm run fix:names`. |
| `npm run validate:decks` | ⚠️ | **Dépasse 5 minutes.** Lancer avec une longue limite. |
| `docker compose up -d db` | ✅ | PostgreSQL 16 local sur le port **5433**. |

Lancer un seul test : `npx vitest run src/lib/deck-code.test.ts`
Un seul cas : `npx vitest run -t "nom du test"`

**`npm run lint` passe au dernier relevé du 14 août 2026** — 0 erreur et
97 avertissements. La commande fait désormais partie de la porte CI ; les
avertissements restent à réduire sans les confondre avec des erreurs.

**`rtk` masque le code de sortie.** Ne jamais écrire `rtk tsc && git commit` :
du code cassé a déjà été committé comme ça. Pour vérifier, toujours
en PowerShell `npx tsc --noEmit; Write-Output "EXIT=$LASTEXITCODE"`, et en bash
`npx tsc --noEmit; echo "EXIT=$?"`.

## Base de données locale

```bash
docker compose up -d db                    # PostgreSQL 16 sur 127.0.0.1:5433
npx prisma db push                         # crée les tables (pas de migrations)
npx prisma generate                        # après toute modif du schéma
npx tsx scripts/seed-cards.ts              # cartes
npx tsx prisma/seed-scraped-decks.ts       # decks de tournoi
```

## Déploiement

Coolify construit l'image depuis le `Dockerfile` et gère le reverse proxy ; le
`docker-compose.yml` du dépôt sert **uniquement au développement local**. Les
variables d'environnement sont posées dans Coolify, pas dans un fichier.
Le détail est dans `docs/DEPLOIEMENT.md`.

Un déploiement Coolify ne seede pas les decks. Pour pousser du contenu en
production, voir `docs/DEPLOIEMENT.md` — et lire d'abord la mise en garde sur la
base de production exposée, dans `HANDOFF.md`.

# Conventions

Déduites du code existant. À suivre, pas à discuter.

## Langue

- **Écris le code en français** : noms de fonctions, de variables et commentaires.
  `traduire`, `langueCourante`, `cheminNu`, `estOverlay`. Les termes du domaine
  restent en anglais quand la base les stocke ainsi (`Card`, `deck`, `slug`).
- **Les commentaires expliquent pourquoi, jamais quoi.** Le style du dépôt est
  d'écrire ce qui cassait avant : « Sans ça, `default-src 'self'` interdit
  l'iframe et la caméra n'apparaît jamais : c'était la cause du cadre vide. »
  Un commentaire qui paraphrase la ligne suivante n'a rien à faire là.
- **Aucun tiret cadratin (—) dans le contenu rendu du site.** Toléré dans les
  docs internes et les commentaires.
- Terminologie française officielle du jeu : voir `docs/META-KNOWLEDGE.md`.

## Nommage

- Fichiers en `kebab-case.ts` / `kebab-case.tsx`, toujours.
- Test à côté du code qu'il teste : `deck-code.ts` → `deck-code.test.ts`.
- Imports internes par l'alias `@/` (`@/lib/prisma`), jamais en relatif long.
- Un composant client porte `"use client"` en première ligne. Par défaut une
  page est un composant serveur : ne pose `"use client"` que si tu as besoin
  d'un état ou d'un événement.

## Messages de commit

Format observé sur toute l'histoire : `portée: ce qui change`, en français, en
minuscules, à l'indicatif.

```
fix(decks): la quantité redevient obligatoire dans un code de deck
legendes: classement en S/A/B/C comme le reste du site
docs: rapport des corrections du 11 août
```

Dire ce qui change et pourquoi, en mots simples. Pas de ton triomphal, pas de
« complet », « exhaustif », « robuste », « optimal ». Un relecteur doit
comprendre à la première lecture.

## Tests

- Vitest sans fichier de config, donc environnement Node par défaut, sans DOM.
  On teste **la logique**, jamais le rendu des composants. Les tests de fonctions
  pures peuvent rester rangés à côté de leur page (`deckbuilder/lib/champion.test.ts`,
  `overlay/[token]/cam-src.test.ts`).
- Pas de fixtures ni de mocks de base : les tests portent sur des fonctions
  pures (analyse de code de deck, normalisation de nom, calcul de couverture).
- Toute nouvelle fonction de `src/lib/` qui contient une branche ou une boucle
  repart avec son test.

## Erreurs

- Une variable d'environnement manquante **lève tout de suite**, sans repli.
  `SESSION_SECRET` en est le modèle : un repli sur `ADMIN_PASSWORD` aurait
  signé les cookies avec une entropie faible.
- Une page qui peut s'afficher dégradée passe par `safeQuery(fn, fallback)`
  plutôt que de renvoyer une erreur 500.
- Une route API renvoie `{ error: "message en français" }` avec le bon code
  HTTP, jamais une trace d'exécution.
- **Ne jamais avaler une donnée manquante en silence.** Une carte introuvable
  se remonte dans `missing` et s'affiche ; un `continue` muet est un bug.

## Interface

- Pastille de couleur unie + texte neutre, **ou** texte coloré sur fond neutre.
  Jamais de fond teinté sous un texte de la même couleur, jamais de dégradé.
- Élargir les pages de contenu : viser `max-w-5xl` et plus, pas `max-w-3xl`.
- Un aperçu de carte au survol ne doit jamais sortir de l'écran.
- Les classes Tailwind construites par concaténation ne sont pas générées :
  utiliser une valeur arbitraire ou un style en ligne.

---

# Travailler à deux : Claude Code et Codex

Ce dépôt est travaillé par deux exécutants, Claude Code et Codex. Ils lisent tous
les deux ce fichier. Cette section dit ce qu'ils partagent, ce qui reste propre à
chacun, et comment se passer le travail sans le refaire.

## Ce qui est partagé

| Quoi | Où | Lu par |
|---|---|---|
| Règles, architecture, commandes, conventions | `AGENTS.md` (ce fichier) | les deux |
| État du chantier, ce qui est cassé, pièges | `HANDOFF.md` | les deux |
| Skills du dépôt | `.agents/skills/` | Codex, depuis n'importe quel sous-dossier |
| Réglages Codex, garde-fous, sous-agents | `.codex/` — voir son `README.md` | Codex, si le dépôt est de confiance |
| Réglages Claude Code | `.claude/settings.json` | Claude Code |

Six skills vivent dans `.agents/skills/` : `reecrire`, `accroche`, `verifier`,
`decklists`, `scraper-tournoi`, `outils-existants`. Ils **renvoient** à ce fichier
au lieu de le recopier : deux copies de la même règle finissent toujours par
diverger.

Les six règles d'écriture française ne sont donc plus réservées à Claude Code : le
skill `reecrire` les porte des deux côtés. Une tâche qui produit du texte français
pour les visiteurs peut se terminer de chaque côté.

## Ce qui reste d'un seul côté

- **Passes d'interface** (`better-*`) et **scraping par `firecrawl`** : côté Claude
  Code, ces skills vivent dans `~/.claude/`. `.hermes/SKILLS.md` dit lequel sert à
  quoi ici ; `.hermes/skills/` en garde une copie de secours (ils ne viennent
  d'aucun marketplace et se sont déjà perdus une fois dans System32). Pour les
  rapatrier côté Codex : `/import` dans une session, choisir Claude Code.
- **Mémoire par projet** : côté Claude Code, pour des faits absents du dépôt.
  Un fait déjà écrit ici, dans `HANDOFF.md` ou dans `docs/` n'y a pas sa place.
- **Serveur MCP `dataforseo`** : demande des identifiants, donc il reste dans la
  config personnelle de chacun, jamais dans le dépôt.

Un skill propose une méthode, il ne connaît pas le projet. Ce fichier prime.

## Garde-fous : deux fichiers, à faire bouger ensemble

`.claude/settings.json` et `.codex/hooks/garde-fous.py` refusent la même chose :
`rm -rf`, `push --force`, les remises à zéro de base, la lecture des `.env`.

**Chacun ne protège que son exécutant.** Une règle ajoutée d'un seul côté laisse
l'autre à découvert. Ça compte ici plus qu'ailleurs : `prisma db push` n'a aucun
retour arrière, et la base de production est encore joignable depuis Internet
(cf. `HANDOFF.md`). Après toute modification du hook : `python
.codex/hooks/garde-fous.py --test`, et le réapprouver par `/hooks` — Codex retient
son empreinte et l'ignore tant qu'il n'est pas relu.

## Se passer le travail

Celui qui s'arrête en cours de route écrit dans `HANDOFF.md` : ce qui est fait, ce
qui ne l'est pas, et la commande qui le prouve. Un diff ne dit pas pourquoi une
piste a été abandonnée.

Les deux ne travaillent pas sur le même fichier en même temps : le dernier à
écrire écrase l'autre sans prévenir. Se répartir par fichier, pas par tâche.

## Mémoire : côté Claude Code seulement

Claude Code tient un dossier de mémoire par projet, pour des faits qui ne sont pas
dans le dépôt (préférences d'Allan, pièges d'API, historique de décisions). Un fait
qui vit déjà dans ce fichier, dans `HANDOFF.md` ou dans `docs/` n'y a pas sa place :
il y serait dupliqué, puis désynchronisé.
