# Riftbound France — brief d'orchestration

**But.** Site francophone du jeu de cartes Riftbound (riftboundfrance.fr, en prod) : base de cartes, decks de tournoi, tier lists, articles, deckbuilder, collection.

**Stack.** Next.js 16.3 (App Router) · React 19 · Prisma 6 / PostgreSQL 16 · Tailwind 4 · TypeScript strict · Vitest · Node >= 22. Déployé par Coolify (Docker). Toute la logique métier vit dans `src/lib/` ; les pages assemblent, ne calculent pas.

**Lancer.** `docker compose up -d db` (Postgres sur le port **5433**) → `cp .env.example .env` et remplir `DATABASE_URL` + `SESSION_SECRET` → `npx prisma db push && npx prisma generate` → `npm run dev`.

**Tester.**
- Porte avant tout push : `npm run verify` (= `tsc --noEmit && next build`). Vert.
- `npx vitest run` : 10 fichiers, 85 tests, vert. Un seul : `npx vitest run <fichier>`.
- `npm run lint` : **ÉCHOUE (15 erreurs préexistantes)**. Pas une porte ; vérifier seulement qu'aucune erreur n'a été ajoutée.
- Lire les codes de sortie avec `cmd ; echo EXIT=$?`. **Jamais `rtk cmd && ...`** : `rtk` masque le code de sortie et a déjà laissé committer du code cassé.

**Déployer.** Coolify construit depuis le `Dockerfile` ; le `docker-compose.yml` est local uniquement. Un déploiement **ne seede pas** les decks. Voir `docs/DEPLOIEMENT.md`.

**Ne jamais toucher.**
- **Ne jamais fabriquer une decklist, un deck, un résultat ou une carte.** Sourcer depuis `data/raw-scrapes/`, jamais de mémoire ; donnée invérifiable = on saute. Garde-fou : `npm run validate:decks` (lent, > 5 min).
- **Ne jamais recalculer les cartes d'un deck à la main** : passer par `resolveDeckCards` (`src/lib/deck-cards.ts`), passage unique.
- **Ne jamais fusionner** `i18n.ts` / `i18n-server.ts` ni `collection*.ts` : `next/headers` côté client casse tout le site.
- Ne pas élargir la CSP du middleware hors de `/overlay/`. Ne pas fusionner la branche `feat/stream-overlay`.
- Pas de migrations Prisma : `db push` seulement, **aucun retour arrière**.
- Contenu rendu du site : **pas de tiret cadratin**, français, pas d'anglicisme.

**Lire ensuite.** `CLAUDE.md` (architecture, commandes, conventions) · `HANDOFF.md` (état, chantier en cours, pièges) · `docs/PROJET.md` (tout le projet) · `AGENTS.md` (règles de travail) · `.hermes/SKILLS.md` (quel skill sert à quoi ici ; toute prose FR rendue passe par la commande `reecrire`).
