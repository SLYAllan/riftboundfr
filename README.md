# Riftbound France

Site francophone du jeu de cartes Riftbound : base de cartes, decks de tournoi,
tier lists, articles, constructeur de deck, suivi de collection.

En ligne sur **https://riftboundfrance.fr**.

## Démarrer

```bash
docker compose up -d db          # PostgreSQL 16 sur 127.0.0.1:5433
cp .env.example .env             # remplir DATABASE_URL et SESSION_SECRET
npx prisma db push
npx prisma generate
npx tsx scripts/seed-cards.ts
npm run dev                      # http://localhost:3000
```

`SESSION_SECRET` est obligatoire : sans lui, toute page qui lit une session lève
une erreur. Le générer avec `openssl rand -hex 32`.

## Commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | Serveur de développement. |
| `npm run verify` | `tsc --noEmit && next build`. **À lancer avant tout push.** |
| `npm test` | Vitest. |
| `npm run lint` | ESLint. **Échoue aujourd'hui**, voir `HANDOFF.md`. |
| `npm run validate:decks` | Garde-fou anti-fabrication de decklists. |
| `npm run validate:names` | Vérifie les noms de cartes cités dans les docs. |

## Où lire quoi

| Fichier | Pour quoi |
|---|---|
| `docs/PROJET.md` | **Le projet en entier** : ce que c'est, les données, l'histoire. Commencer ici. |
| `AGENTS.md` | **Règles de travail + architecture, commandes vérifiées, conventions.** Lu par Claude Code ET par Codex. |
| `CLAUDE.md` | Importe `AGENTS.md`, rien d'autre. Vide de fond exprès : Codex ne le lit pas. |
| `HANDOFF.md` | Ce qui marche, ce qui est cassé, le chantier en cours, les pièges. |
| `docs/README.md` | Index de toute la documentation et carte des données. |

## Stack

Next.js 16 (App Router) · React 19 · Prisma 6 · PostgreSQL 16 · Tailwind 4 ·
TypeScript · Vitest. Node 22 ou plus. Déployé par Coolify derrière Caddy.
