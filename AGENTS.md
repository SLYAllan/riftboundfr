<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

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
