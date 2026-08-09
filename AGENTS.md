<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vérifier, jamais deviner — RÈGLE ABSOLUE

**L'outil existe déjà. Cherche-le avant d'en écrire un.** Avant de produire quoi que
ce soit (visuel, export, script), lister ce que le site fait déjà et s'en servir. Ne
JAMAIS créer un nouveau rendu quand une route, un composant ou un script couvre le
besoin : le résultat ne ressemblera pas au reste du site et sera à jeter.

- **Images de deck** → `GET /api/decklist-image?slug=<slug>` (aussi `?code=`,
  `?share=`), carré 1000x1000, publique, serveur dev lancé. C'est **le** visuel de
  deck. Rendu à plat paysage 2258x1518 = `generateDeckImage` de
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
- Cartes / noms canoniques → **DB cartes** + `src/lib/banned-cards.ts` (7 bans) + `data/raw-scrapes/` (riftdecks). **Les liens web fournis par Allan + la DB priment sur les transcriptions Whisper pour les noms.**
- Connaissance VOD (méta, matchups, cores) → `data/video-insights/README.md` (index + hiérarchie + pipeline). Matchups = `matchups-reference.md` (source unique).
- Méta/tier/rulings → `META-KNOWLEDGE.md` · règles deckbuilding/cores → `DECKBUILDING-RULES.md` · par Légende → `data/fiches/*.json`.

**Réflexes :**
- **Coupler le nouveau à l'ancien** : recouper toute donnée importée contre les sources ci-dessus AVANT de la figer ; ne jamais traiter une info isolément.
- **Agents/Workflow par vagues de 3-4 max** (jamais plus → rate-limit API). Pas 2 gros workflows en même temps.
- Contenu **site** rendu : **pas de tiret cadratin (—)**, terminologie FR officielle. Docs internes (META/DECKBUILDING/video-insights) : em-dash toléré.
