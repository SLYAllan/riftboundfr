# Rapport d'audit — Riftbound France

**Date :** 25 mai 2026
**Stack :** Next.js 16.2.6 / React 19 / Prisma 6 / PostgreSQL / Tailwind CSS 4

---

## Architecture

| Categorie | Nombre |
|-----------|--------|
| Pages publiques | 17 routes |
| Pages admin | 8 routes |
| API endpoints | 13 |
| Composants | 39 |
| Lib/utils | 10 |
| Modeles Prisma | 8 |
| Assets statiques | 47 fichiers |

## Pages principales

- **/** — Homepage avec hero carousel
- **/cartes** — Base de donnees (~2000+ cartes)
- **/decks** — 68 decks publies (40 Unleashed + 28 Spiritforged)
- **/deckbuilder** — Constructeur de deck interactif
- **/articles** — 4 articles publies (best-of, top 8 Atlanta & Sydney)
- **/guides** — Debutant, deckbuilding, domaines, glossaire
- **/tier-list** — Tier list par legende
- **/community-decks** — Decks partages par la communaute
- **/tournois** — Calendrier des evenements

## Donnees en base

- **Cartes :** Import Riftcodex (sets Unleashed, Spiritforged, Origins)
- **Decks :** 68 publies — 40 Unleashed (Sydney best-of, city challenges), 28 Spiritforged (Atlanta best-of)
- **Articles :** 4 publies — best-of-sydney, best-of-atlanta, top-8-atlanta, top-8-sydney
- **Decklists JSON :** 134 fichiers (45 Sydney + 89 Atlanta)
- **Tournaments :** atlanta-regional.json, sydney-regional (index)

## Fonctionnalites

| Feature | Statut |
|---------|--------|
| Base de cartes avec filtres | OK |
| Pages de deck avec guide | OK |
| Deckbuilder interactif | OK |
| Import/export deck code | OK |
| Export PNG des decklists | CORRIGE (CORS fix) |
| Partage de deck communautaire | OK |
| Articles avec blocs (texte, decklist, image, sponsor) | OK |
| Tier list editable (admin) | OK |
| Calendrier des evenements | OK |
| Systeme admin (auth JWT) | OK |
| Sync cartes Riftcodex | OK |
| SEO (robots.txt, sitemap, metadata) | OK |

## Changements de cette session

### Nouveautes
1. **Analytics Google (GA4)** — Script + banniere cookies RGPD (`src/components/analytics.tsx`)
2. **Glossaire enrichi** — Chaque mot-cle affiche une carte exemple au hover (`glossaire-client.tsx`)
3. **Drapeaux de tournois** — Emoji flags pour Regional Qualifiers (US, AU, etc.) (`tournament-flags.ts`)
4. **Filtres par tournoi/pays/continent** — Page /decks filtre par tournoi, region Occident/Asie
5. **Legendes dans les articles** — Tags de legendes affichees sur les cartes articles

### Corrections
6. **Export PNG repare** — Pre-conversion des images en data URLs, suppression srcset, pixelRatio 2x
7. **Tooltips cartes enrichis** — Domaines (runes colores), cout energy/power, might, rarete coloree
8. **Vue liste enrichie** — Colonnes Might et Domaines ajoutees

### Optimisations
9. **Images WebP** — Bannieres et logos convertis en `<Image>` Next.js (auto WebP, lazy loading)
10. **Footer nettoye** — Tournois retire, liens communaute ajoutes (deckbuilder, decks communautaires)

## Points techniques a noter

- **Prisma client DLL lock** — Le dev server bloque `prisma generate`. Workaround : `$queryRaw`/`$executeRaw` pour le champ `setTag`. Corriger en stoppant le dev server puis `npx prisma generate`.
- **41 cartes champion/variant** non en DB — Cartes comme "Kai'Sa, Survivor", "Irelia, Fervent" qui sont dans les decklists mais pas dans la table Card. N'affecte pas le fonctionnement.
- **tournament_page.html** — Fichier de 6.3 MB dans public. A nettoyer si non utilise.

## Erreurs TypeScript

2 erreurs pre-existantes dans `deckbuilder.tsx` (types DeckEntry) et 1 dans `admin/decks/import` (section "champion"). Aucune nouvelle erreur introduite.

## Taches en attente (screenshots requis)

- **Ombre des images de decklist** — Allan envoie une capture pour voir le probleme
- **Problemes de hover des cartes** — Allan envoie une capture pour diagnostiquer
- **Accents dans les articles** — Besoin de voir le rendu exact sur le site

## Prochaines etapes suggerees

1. Regenerer le client Prisma (stop dev → `npx prisma generate` → restart)
2. Ajouter `NEXT_PUBLIC_GA_ID=G-...` dans le `.env` pour activer les analytics
3. Ajouter de nouveaux tournois dans `tournament-flags.ts` quand ils arrivent
4. Convertir les bannieres PNG en WebP physiquement pour le build statique
5. Nettoyer tournament_page.html si non necessaire
6. Ajouter des cover images aux articles pour la page /articles
