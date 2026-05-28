# Rapport de build — Riftbound France

**Date** : 27 mai 2026  
**Domaine** : riftboundfrance.fr  
**Nom du site** : Riftbound France

---

## Resultat

Le projet compile avec **0 erreur TypeScript** et le **build Next.js 16 passe** (30 routes generees). La base de donnees contient 178 decks (best-of de 9 tournois), 15 articles (top 8 + best-of), 4 tier lists (Origins/Spiritforged/Unleashed/Global), et toutes les cartes.

---

## Stack technique

| Composant | Version |
|-----------|---------|
| Next.js | 16.2.6 (App Router, Turbopack) |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | 4 (config CSS, @theme inline) |
| shadcn/ui | 4.8 (New York style) |
| Prisma | 6 (PostgreSQL) |
| Polices | Rubik (display) + Plus Jakarta Sans (body) |

---

## Contenu de la base de donnees

| Entite | Quantite |
|--------|----------|
| Cartes | ~1500 (3 sets + promos) |
| Decks | 178 (tous best-of, featured) |
| Articles | 15 (5 top 8 + 7 best-of RQ + 3 best-of Chine) |
| Tier Lists | 4 (Origins, Spiritforged, Unleashed, Global) |
| Tournois couverts | 9 (Houston, Bologna, Las Vegas, Lille, Atlanta, Sydney, Shanghai CC, Shanghai NO, Xi'an) |

---

## Pages publiques

### Principales
- `/` — accueil (decks aleatoires, guides, tier list compacte avec onglets OGN/SFD/UNL/ALL)
- `/cartes` — base de cartes avec recherche, filtres, pagination (48/page)
- `/cartes/[id]` — detail carte (image, stats, texte, artiste)
- `/tier-list` — tier lists visuelles avec grille coloree S/A/B/C/D et portraits de legendes
- `/decks` — tous les decks avec filtres (legende, set, tournoi, region, categorie best-of/tournois/guide/communautaire)
- `/decks/[slug]` — detail deck avec visualiseur par sections
- `/articles` — liste articles avec filtres par categorie
- `/articles/[slug]` — article avec blocs (texte, decklists interactives, images, separateurs)
- `/tournois` — calendrier tournois
- `/deckbuilder` — constructeur de deck interactif avec partage communautaire

### Guides
- `/guides` — hub des guides
- `/guides/debuter` — guide debutant avec icones de domaines
- `/guides/deckbuilding` — guide construction de deck
- `/guides/domaines` — presentation des 6 domaines avec icones
- `/guides/glossaire` — glossaire des termes Riftbound
- `/guides/jouer-en-ligne` — jouer sur TCG Arena et RiftAtlas

### SEO
- `/sitemap.xml` — sitemap dynamique (cartes, decks, articles, guides, tournois)
- `/robots.txt` — bloque /admin/ et /api/
- JSON-LD schema.org (WebSite + Organization + SearchAction) dans le layout racine

---

## Design system

- **Canvas** : #06060b (fond principal)
- **Surface** : #0c0c14 → #12121e → #1a1a2e (cartes, overlays)
- **Arcane Blue** : #0ea5e9 (accent principal)
- **Runic Gold** : #f59e0b (accent secondaire)
- **Mystic Violet** : #8b5cf6 (accent tertiaire)
- **Ink** : #f1f5f9 → #94a3b8 → #64748b (texte)

### Tier list visuelle
- S = rouge, A = orange, B = jaune, C = teal, D = gris
- Portraits de legendes (bannieres /bannieres/*.webp) au lieu d'images de cartes completes
- Tooltip au hover avec nom de legende et commentaire
- Onglets par set (Origins/Spiritforged/Unleashed/Global) + indicateur "current"

---

## Corrections et ameliorations (session 27 mai 2026)

### Tier lists
1. **Seed 4 tier lists** : Origins, Spiritforged, Unleashed, Global avec correspondance de noms complexe (virgule/tiret, variantes, Master Yi Wuju Master vs Bladesman)
2. **Redesign visuel** : grille coloree S/A/B/C/D avec portraits de legendes, tooltips, onglets par set
3. **Images portraits** : correction des images qui affichaient la carte complete au lieu du portrait — utilisation de `getBannerUrl()` pour les bannieres `/bannieres/*.webp`

### Articles et decks
4. **Cover images** : assignation d'images de couverture a tous les articles (images dans `/img/articles/` + fallback `/bannieres/tournois.webp`)
5. **Best-of dans /decks** : creation de 110 Deck records depuis les blocs decklists des 7 articles best-of manquants (Houston, Bologna, Las Vegas, Lille, Shanghai CC, Shanghai NO, Xi'an) — total 178 decks
6. **Resolution legendes** : correction dans articles et decks pour gerer le format comma ("Kai'sa, Daughter") vs tiret ("Kai'Sa - Daughter") et les legendes variantes-seulement (Annie, Lux)

### Accueil
7. **Suppression "Base de cartes"** du bloc guides sur la homepage

### Cartes
8. **Battlefield centering** : les cartes Battlefield (format paysage) sont maintenant centrees dans la grille sans etre croppees — conteneur portrait avec image centree verticalement

### Guides
9. **Icones de domaines** : remplacement des cercles colores par les vrais icones `/icons/{Domain}.webp` dans les guides debuter et domaines
10. **Accents francais** : correction des accents manquants dans deckbuilding, domaines (energie, deployer, degats, unites, etc.)

### SEO
11. **Sitemap** : ajout des pages manquantes (domaines, jouer-en-ligne, tournois)
12. **JSON-LD** : schema WebSite + Organization + SearchAction dans le layout racine

### TypeScript
13. **3 erreurs pre-existantes corrigees** :
    - `seed-remaining-top8.ts` : type `string` → union litterale pour section
    - `admin/decks/import/route.ts` : "champion" → "legend" dans DeckSection
    - `deckbuilder.tsx` : assertions de type pour indexation DeckState

---

## Demarrage rapide

```bash
# 1. Installer les dependances
npm install

# 2. Configurer l'environnement
cp .env.example .env

# 3. Demarrer PostgreSQL + appliquer le schema
docker compose up db -d
npx prisma db push

# 4. Synchroniser les cartes
npm run sync-cards

# 5. Seeder les donnees
npx tsx scripts/seed-tier-lists.ts
npx tsx prisma/seed-bestof-articles.ts
npx tsx prisma/seed-atlanta-bestof.ts
npx tsx prisma/seed-sydney-bestof.ts
npx tsx scripts/seed-bestof-decks.ts
npx tsx prisma/seed-remaining-top8.ts

# 6. Demarrer le serveur de developpement
npm run dev
```
