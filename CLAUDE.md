@AGENTS.md

# Riftbound France — repère technique

Site francophone du jeu de cartes Riftbound : base de cartes, decks de tournoi,
tier lists, articles, deckbuilder, collection, habillage de stream.
En production sur https://riftboundfrance.fr.

Les règles de travail (intégrité des decklists, sources de vérité, ne jamais
deviner) sont dans `AGENTS.md`, importé ci-dessus. Ce fichier décrit la machine.

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
- **`entrypoint.sh`** — démarrage du conteneur : `node migrate.mjs` (pousse le
  schéma si les tables manquent) puis `node server.js`.

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

Toutes vérifiées le 12 août 2026 sur `main`. Un agent doit s'y fier pour valider
son travail.

| Commande | État | Ce qu'elle fait |
|---|---|---|
| `npm run dev` | ✅ | Serveur de développement sur http://localhost:3000. |
| `npm run build` | ✅ | Build de production. Quelques minutes. |
| `npx tsc --noEmit` | ✅ | Vérification des types. Sortie 0, aucune erreur. |
| `npm test` | ✅ | Vitest. **10 fichiers, 85 tests, tous verts, ~1,2 s.** |
| `npm run verify` | ✅ | `tsc --noEmit && next build`. **La porte avant tout push.** |
| `npm run lint` | ❌ | **Échoue : 15 erreurs, 96 avertissements.** Voir plus bas. |
| `npm run validate:names` | ⚠️ | Demande la base. Corrige avec `npm run fix:names`. |
| `npm run validate:decks` | ⚠️ | **Dépasse 5 minutes.** Lancer avec une longue limite. |
| `docker compose up -d db` | ✅ | PostgreSQL 16 local sur le port **5433**. |

Lancer un seul test : `npx vitest run src/lib/deck-code.test.ts`
Un seul cas : `npx vitest run -t "nom du test"`

**`npm run lint` échoue aujourd'hui** — 15 erreurs, dont 11 sont la règle React 19
`react-hooks/set-state-in-effect` et 3 des `prefer-const` réparables par
`npx eslint --fix`. Ce n'est pas une régression de ton travail : vérifie que tu
n'as pas **ajouté** d'erreur, ne prends pas la sortie non vide pour un échec.

**`rtk` masque le code de sortie.** Ne jamais écrire `rtk tsc && git commit` :
du code cassé a déjà été committé comme ça. Pour vérifier, toujours
`npx tsc --noEmit ; echo "EXIT=$?"`.

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
  On teste **la logique**, jamais le rendu des composants : 8 des 10 fichiers
  sont dans `src/lib/`, les deux autres testent une fonction pure rangée à côté
  de sa page (`deckbuilder/lib/champion.test.ts`, `overlay/[token]/cam-src.test.ts`).
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
