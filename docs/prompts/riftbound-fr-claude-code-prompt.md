# Prompt Claude Code — Projet Riftbound.fr

## Contexte du projet

Tu vas construire **Riftbound.fr**, le site de référence francophone pour le jeu de cartes à collectionner **Riftbound** (TCG League of Legends par Riot Games). Le positionnement clé : **accessible et pensé pour les débutants**, contrairement aux sites EN existants (riftdecks.com, riftbound.gg, piltoverarchive.com) qui sont excellents mais complexes.

Le site doit combiner :
- Une **base de données de cartes** avec images et infos en français
- Des **tier lists éditoriales** (classement de légendes/decks par tiers, rédigées manuellement — PAS de winrates/playrates automatisés, c'est interdit par Riot)
- Des **decklists curatées** avec explications en français
- Des **guides pour débutants** (comment jouer, deckbuilding basics, glossaire)
- Des **résultats de tournois** (récapitulatifs éditoriaux)
- Une section **boutique** avec liens vers ta boutique (eBay, Cardmarket) et potentiellement Shopify
- Un **calendrier des événements/tournois** FR
- Une section optionnelle **Solary Riftbound** (contenu créateur)
- Un **panneau d'administration** pour gérer le contenu (articles, tier lists, decklists) sans toucher au code

## Stack technique

### Framework & Language
- **Next.js 14+ (App Router)** avec TypeScript
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants de base
- Design sombre (dark theme) avec accents inspirés de l'univers LoL (bleu/or/violet)

### Base de données
- **PostgreSQL** (hébergé sur le même serveur Hetzner)
- **Prisma** comme ORM
- Tables principales : cards, sets, decks, deck_cards, articles, tier_lists, tier_list_entries, tournaments, tournament_results, events

### Source de données cartes
- **API principale : Riftcodex** — `https://api.riftcodex.com`
  - Gratuite, sans authentification, réponses JSON
  - GET `/api/cards` — liste paginée avec filtres (set_id, sort, dir)
  - GET `/api/cards/search?q=...` — recherche full-text
  - GET `/api/cards/name?exact=...` ou `?fuzzy=...` — recherche par nom
  - GET `/api/cards/{id}` — carte par ID
  - GET `/api/cards/riftbound/{riftbound_id}` — carte par ID Riftbound
  - GET `/api/sets` — liste des sets
- **Cron job** : sync des cartes toutes les 24h via script Node.js (`npm run sync-cards`)
- Stocker les données en local dans PostgreSQL pour ne pas dépendre des APIs en temps réel

### Hébergement & Infra
- **Hetzner VPS** (CX22, Ubuntu)
- **Caddy** comme reverse proxy (SSL auto avec Let's Encrypt)
- **Docker Compose** pour tout orchestrer (app Next.js + PostgreSQL + Caddy)
- **GitHub Actions** ou déploiement manuel via `git pull && docker compose up -d --build`
- Domaine : `riftbound.fr` (à configurer via DNS vers IP Hetzner)

### Structure Docker Compose
```yaml
services:
  app:
    build: .
    environment:
      - DATABASE_URL=postgresql://riftbound:password@db:5432/riftbound
      - NEXT_PUBLIC_SITE_URL=https://riftbound.fr
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=riftbound
      - POSTGRES_USER=riftbound
      - POSTGRES_PASSWORD=${DB_PASSWORD}
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
volumes:
  pgdata:
  caddy_data:
```

## Structure du projet

```
riftbound-fr/
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── .env.example
├── prisma/
│   └── schema.prisma
├── scripts/
│   ├── sync-cards.ts          # Cron: sync cartes depuis Riftcodex API
│   └── seed.ts                # Seed initial (sets, données de base)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Layout global (nav, footer, dark theme)
│   │   ├── page.tsx           # Homepage
│   │   ├── cartes/
│   │   │   ├── page.tsx       # Base de données cartes (recherche, filtres)
│   │   │   └── [id]/page.tsx  # Détail d'une carte
│   │   ├── decks/
│   │   │   ├── page.tsx       # Liste des decklists
│   │   │   └── [slug]/page.tsx # Détail d'un deck
│   │   ├── tier-list/
│   │   │   └── page.tsx       # Tier list actuelle
│   │   ├── guides/
│   │   │   ├── page.tsx       # Liste des guides
│   │   │   ├── debuter/page.tsx        # Guide débutant
│   │   │   ├── deckbuilding/page.tsx   # Guide deckbuilding
│   │   │   └── glossaire/page.tsx      # Glossaire FR
│   │   ├── tournois/
│   │   │   ├── page.tsx       # Résultats & calendrier
│   │   │   └── [slug]/page.tsx
│   │   ├── actualites/
│   │   │   ├── page.tsx       # Blog/news
│   │   │   └── [slug]/page.tsx
│   │   └── admin/
│   │       ├── layout.tsx     # Layout admin (auth basique)
│   │       ├── page.tsx       # Dashboard
│   │       ├── articles/      # CRUD articles
│   │       ├── decks/         # CRUD decklists
│   │       ├── tier-list/     # Éditeur tier list (drag & drop)
│   │       ├── tournois/      # CRUD tournois
│   │       └── events/        # CRUD calendrier
│   ├── components/
│   │   ├── ui/                # shadcn components
│   │   ├── card-grid.tsx      # Grille de cartes avec filtres
│   │   ├── card-detail.tsx    # Vue détaillée carte
│   │   ├── deck-viewer.tsx    # Affichage d'un deck (liste + visuels)
│   │   ├── tier-list-display.tsx  # Affichage tier list (S/A/B/C/D)
│   │   ├── search-bar.tsx     # Recherche globale
│   │   ├── navbar.tsx         # Navigation principale
│   │   └── footer.tsx         # Footer avec liens + mention légale Riot
│   ├── lib/
│   │   ├── prisma.ts          # Client Prisma singleton
│   │   ├── riftcodex.ts       # Client API Riftcodex
│   │   └── utils.ts
│   └── types/
│       └── index.ts           # Types TypeScript
```

## Schéma Prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Card {
  id              String   @id // Riftbound ID (ex: OGN-001)
  name            String
  nameFr          String?  // Traduction FR quand dispo
  set             String   // OGN, SFD, UNL...
  setName         String
  type            String   // Unit, Spell, Gear, Rune, Battlefield, Legend
  rarity          String   // Common, Rare, Epic, Champion, Legend
  faction         String?  // Fury, Sorcery, etc.
  domain          String?
  cost            Int?
  power           Int?
  energy          Int?
  description     String?
  flavorText      String?
  artUrl          String?  // URL image depuis API
  artUrlHd        String?
  keywords        String[] // Array de keywords
  artist          String?
  // Meta
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  deckCards DeckCard[]

  @@index([set])
  @@index([type])
  @@index([rarity])
  @@index([name])
}

model Set {
  id          String   @id // OGN, SFD, UNL
  name        String
  nameFr      String?
  code        String
  releaseDate DateTime?
  cardCount   Int?
  logoUrl     String?
  createdAt   DateTime @default(now())
}

model Deck {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  legendId    String   // Card ID de la légende
  legendName  String
  description String?  // Explication FR du deck
  guide       String?  // Guide détaillé (Markdown)
  format      String   @default("constructed") // constructed, sealed, draft
  tags        String[] // budget, competitif, debutant, etc.
  authorName  String?
  sourceUrl   String?  // Lien source si deck repris d'un tournoi
  featured    Boolean  @default(false)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  cards DeckCard[]

  @@index([slug])
  @@index([legendName])
}

model DeckCard {
  id       String @id @default(cuid())
  deckId   String
  cardId   String
  quantity Int    @default(1)
  section  String @default("main") // main, rune, side, battlefield

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  card Card @relation(fields: [cardId], references: [id])

  @@unique([deckId, cardId, section])
}

model TierList {
  id          String   @id @default(cuid())
  title       String
  description String?
  format      String   @default("constructed")
  setContext  String?  // "Unleashed", "Spiritforged", etc.
  published   Boolean  @default(false)
  current     Boolean  @default(false) // La tier list active
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entries TierListEntry[]
}

model TierListEntry {
  id          String  @id @default(cuid())
  tierListId  String
  legendId    String  // Card ID de la légende
  legendName  String
  tier        String  // S, A, B, C, D
  position    Int     // Ordre dans le tier
  comment     String? // Explication courte
  deckId      String? // Lien vers un deck recommandé

  tierList TierList @relation(fields: [tierListId], references: [id], onDelete: Cascade)

  @@index([tierListId])
}

model Article {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String?
  content     String   // Markdown
  category    String   // actualite, guide, tournoi, meta
  tags        String[]
  coverImage  String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([category])
}

model Tournament {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  date        DateTime
  location    String?
  format      String?
  playerCount Int?
  description String?  // Markdown recap
  sourceUrl   String?
  createdAt   DateTime @default(now())

  results TournamentResult[]
}

model TournamentResult {
  id           String  @id @default(cuid())
  tournamentId String
  playerName   String
  placement    Int     // 1, 2, 3, top8, etc.
  legendName   String
  deckId       String? // Lien vers deck si dispo

  tournament Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@index([tournamentId])
}

model Event {
  id          String   @id @default(cuid())
  title       String
  date        DateTime
  endDate     DateTime?
  location    String?
  type        String   // tournoi, avant-premiere, meetup
  description String?
  url         String?
  createdAt   DateTime @default(now())
}
```

## Design & UX

### DESIGN.md — Système de design Riftbound.fr

Crée un fichier `DESIGN.md` à la racine du projet avec le contenu suivant. Ce fichier sert de référence pour tout le design du site. Le format est inspiré du standard getdesign.md (structure utilisée par les AI coding agents).

```yaml
---
version: alpha
name: riftbound-fr-design
description: >
  Riftbound.fr est le portail gaming francophone de référence pour le TCG Riftbound.
  Dark theme immersif inspiré de l'univers League of Legends / Runeterra, avec des accents
  bleu arcane, or runique et violet mystique. L'esthétique est "portail gaming premium mais
  accessible" — pensé pour un joueur de 16 ans qui découvre Riftbound autant que pour un
  compétiteur chevronné. Les cartes TCG sont le hero visuel : elles brillent, flottent
  légèrement, et attirent le regard. Le layout est aéré et lisible, jamais surchargé.

colors:
  # Fond & surfaces
  canvas: "#06060b"                    # Fond principal très sombre, presque noir bleuté
  surface: "#0c0c14"                   # Cartes, panels, sidebars
  surface-raised: "#12121e"            # Éléments surélevés (modals, dropdowns, hover cards)
  surface-overlay: "#1a1a2e"           # Overlays, tooltips
  surface-glass: "rgba(12, 12, 20, 0.8)" # Effet glass morphism (navbar sticky, etc.)

  # Accents principaux
  arcane-blue: "#0ea5e9"               # Accent principal — liens, CTAs, sélections actives
  arcane-blue-light: "#38bdf8"         # Hover states sur bleu
  arcane-blue-dark: "#0284c7"          # Pressed states
  arcane-blue-glow: "rgba(14, 165, 233, 0.15)" # Glow subtil derrière éléments bleus

  runic-gold: "#f59e0b"               # Accent secondaire — badges, tier S, éléments premium
  runic-gold-light: "#fbbf24"          # Hover sur or
  runic-gold-dark: "#d97706"           # Pressed sur or
  runic-gold-glow: "rgba(245, 158, 11, 0.12)"

  mystic-violet: "#8b5cf6"            # Accent tertiaire — tags, catégories, éléments décoratifs
  mystic-violet-light: "#a78bfa"
  mystic-violet-dark: "#7c3aed"

  # Tiers (pour tier list)
  tier-s: "#f59e0b"                    # Or — S tier
  tier-a: "#ef4444"                    # Rouge — A tier
  tier-b: "#8b5cf6"                    # Violet — B tier
  tier-c: "#0ea5e9"                    # Bleu — C tier
  tier-d: "#6b7280"                    # Gris — D tier
  tier-s-bg: "rgba(245, 158, 11, 0.08)"
  tier-a-bg: "rgba(239, 68, 68, 0.08)"
  tier-b-bg: "rgba(139, 92, 246, 0.08)"
  tier-c-bg: "rgba(14, 165, 233, 0.08)"
  tier-d-bg: "rgba(107, 114, 128, 0.08)"

  # Raretés de cartes
  rarity-common: "#9ca3af"
  rarity-rare: "#0ea5e9"
  rarity-epic: "#8b5cf6"
  rarity-champion: "#f59e0b"
  rarity-legend: "#ef4444"

  # Texte
  ink: "#f1f5f9"                       # Texte principal (quasi blanc)
  ink-secondary: "#94a3b8"             # Texte secondaire
  ink-muted: "#64748b"                 # Texte tertiaire, placeholders
  ink-disabled: "#475569"              # Texte désactivé
  on-accent: "#ffffff"                 # Texte sur fond coloré
  on-gold: "#1a1a2e"                   # Texte sur fond or (sombre pour contraste)

  # Bordures & séparateurs
  hairline: "rgba(148, 163, 184, 0.1)"
  hairline-strong: "rgba(148, 163, 184, 0.2)"
  hairline-accent: "rgba(14, 165, 233, 0.3)"

  # Sémantique
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"
  info: "#0ea5e9"

typography:
  # Font display pour titres — Rajdhani (geometric, gaming feel, lisible)
  # Font body — Plus Jakarta Sans (moderne, arrondi, très lisible)
  # Charger via Google Fonts ou next/font

  hero-display:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -1.5px
  display-lg:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.10
    letterSpacing: -1px
  heading-1:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 36px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.5px
  heading-2:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
  heading-3:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.25
  heading-4:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.30
  subtitle:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.50
  body-md:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.60
  body-sm:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
  caption:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.40
  micro:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.40
    letterSpacing: 0.5px
    textTransform: uppercase
  button-md:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.30

rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 20px
  card: 12px          # Cartes de contenu (articles, decks)
  game-card: 8px      # Cartes TCG (image de carte)
  feature: 24px       # Feature cards, hero sections
  full: 9999px        # Boutons pill, badges

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  section: 64px
  section-lg: 96px
  hero: 120px

components:
  # Boutons
  button-primary:
    backgroundColor: "{colors.arcane-blue}"
    textColor: "{colors.on-accent}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    hover: "brightness(1.1) + shadow 0 0 20px {colors.arcane-blue-glow}"
  button-gold:
    backgroundColor: "{colors.runic-gold}"
    textColor: "{colors.on-gold}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button-md}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
    border: "1px solid {colors.hairline-strong}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body-sm}"
    padding: "8px 12px"

  # Cartes de contenu
  card-base:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
    hover: "border-color {colors.hairline-accent} + translateY(-2px)"
  card-feature:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.feature}"
    padding: "{spacing.xl}"
    border: "1px solid {colors.hairline}"
    shadow: "0 8px 32px rgba(0, 0, 0, 0.3)"
  card-game-card:
    backgroundColor: "transparent"
    rounded: "{rounded.game-card}"
    padding: "0"
    hover: "scale(1.05) + shadow 0 0 24px {colors.arcane-blue-glow}"
    transition: "transform 0.2s ease, box-shadow 0.2s ease"

  # Tier list
  tier-row:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.md} {spacing.lg}"
    border: "1px solid {colors.hairline}"
  tier-badge:
    typography: "{typography.heading-3}"
    rounded: "{rounded.md}"
    padding: "{spacing.xs} {spacing.md}"
    minWidth: "48px"
    textAlign: "center"
    fontWeight: "700"
  tier-legend-chip:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm}"
    border: "1px solid {colors.hairline}"
    hover: "border-color {colors.arcane-blue} + glow"

  # Badges & tags
  badge-rarity:
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  badge-tag:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "4px 12px"
    border: "1px solid {colors.hairline}"
  badge-set:
    backgroundColor: "{colors.mystic-violet}"
    textColor: "{colors.on-accent}"
    typography: "{typography.micro}"
    rounded: "{rounded.full}"
    padding: "4px 10px"

  # Inputs
  text-input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm} {spacing.md}"
    border: "1px solid {colors.hairline-strong}"
    height: "44px"
    focus: "border-color {colors.arcane-blue} + ring 0 0 0 3px {colors.arcane-blue-glow}"
  search-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm} {spacing.lg}"
    border: "1px solid {colors.hairline-strong}"
    height: "48px"
    icon: "magnifying glass, {colors.ink-muted}"

  # Navigation
  navbar:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.ink}"
    backdropFilter: "blur(12px)"
    padding: "{spacing.sm} {spacing.lg}"
    borderBottom: "1px solid {colors.hairline}"
    position: "sticky top-0 z-50"
  nav-link:
    textColor: "{colors.ink-secondary}"
    typography: "{typography.body-sm}"
    hover: "color {colors.ink}"
    active: "color {colors.arcane-blue}"
  nav-link-active:
    textColor: "{colors.arcane-blue}"
    borderBottom: "2px solid {colors.arcane-blue}"

  # Footer
  footer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.body-sm}"
    padding: "{spacing.section} {spacing.xl}"
    borderTop: "1px solid {colors.hairline}"

  # Filtres
  filter-pill:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "{spacing.xs} {spacing.md}"
    border: "1px solid {colors.hairline}"
  filter-pill-active:
    backgroundColor: "{colors.arcane-blue}"
    textColor: "{colors.on-accent}"
    border: "1px solid {colors.arcane-blue}"

  # Accordion / FAQ
  accordion-item:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.hairline}"
    marginBottom: "{spacing.sm}"
---

## Overview

Riftbound.fr adopte une esthétique "dark gaming premium" accessible. Le fond quasi-noir
bleuté ({colors.canvas}) fait ressortir les illustrations de cartes TCG qui sont le centre
visuel du site. Trois accents structurent la hiérarchie : le bleu arcane ({colors.arcane-blue})
pour les interactions et CTAs, l'or runique ({colors.runic-gold}) pour les éléments premium
et le tier S, le violet mystique ({colors.mystic-violet}) pour les tags et la décoration.

Les surfaces utilisent des nuances subtiles de bleu-noir ({colors.surface}, {colors.surface-raised})
pour créer de la profondeur sans surcharger. Un léger effet glass morphism sur la navbar sticky
({colors.surface-glass} + backdrop-filter blur) donne un aspect moderne.

Les cartes TCG bénéficient d'un traitement spécial : léger scale au hover (1.05x), glow
bleu subtil, et ombre portée. Elles doivent "flotter" visuellement au-dessus de la surface.

La typographie utilise Rajdhani (Google Fonts) pour les titres — son caractère géométrique
et légèrement angular évoque l'univers gaming sans être illisible. Plus Jakarta Sans
(Google Fonts) pour le corps — arrondi, moderne, très lisible même en petite taille.

**Caractéristiques clés :**
- Dark theme immersif avec fond quasi-noir bleuté
- Trois accents : bleu arcane (actions), or runique (premium/S-tier), violet mystique (déco)
- Cartes TCG comme éléments hero visuels avec hover glow
- Glass morphism subtil sur la navbar
- Tier list avec code couleur distinct par tier (or/rouge/violet/bleu/gris)
- Badges de rareté colorés (commun gris, rare bleu, épique violet, champion or, légende rouge)
- Mobile-first : grilles qui passent de 4 colonnes à 2 sur mobile
- Animations subtiles : fade-in au scroll, hover lift sur les cartes
- Jamais surchargé — aéré, lisible, accessible pour un débutant
```

Tu peux aussi créer un fichier `DESIGN.md` séparé à la racine du projet avec ce contenu YAML.
L'agent Claude Code doit s'y référer pour toutes les décisions de design : couleurs, spacing, composants, typographie.

### Pages clés

**Homepage**
- Hero avec titre accrocheur "La référence Riftbound en français"
- Tier list résumée (top 5 légendes actuelles avec portrait)
- 3 derniers articles/guides
- CTA vers guide débutant
- Section "Décks populaires" (3-4 decks featured)
- Lien boutique

**Page Cartes** *(s'inspirer de Piltover Archive — piltoverarchive.com/cards)*
- Layout : barre de recherche prominente en haut (recherche par nom/ID), puis une rangée de filtres horizontaux sous forme de dropdowns inline
- Filtres disponibles (tous en dropdown, style compact) :
  - Set (All / Origins / Spiritforged / Unleashed)
  - Type (All / Unit / Spell / Gear / Rune / Battlefield / Legend)
  - Supertype (All / Champion / Token / etc.)
  - Variant (All / Base / Alternate Art / Full Art)
  - Rarity (All / Common / Rare / Epic / Champion / Legend)
  - Energy : slider ou boutons chiffrés (0, 2, 4, 6, 8, 10, 12) — style "Any" par défaut
  - Power : boutons chiffrés (0, 1, 2, 3, 4)
  - Might : boutons chiffrés (0, 2, 3, 5, 7, 8, 10)
- Indicateur "Filtres actifs : Aucun" (ou liste des filtres appliqués) + compteur "990 cartes · Page 1 sur 21"
- Grille responsive de cartes : 4 colonnes desktop, 3 tablette, 2 mobile
- Chaque carte affichée en image avec hover : léger scale (1.05x) + glow bleu subtil + tooltip rapide (nom, set, rareté)
- Toggle vue : Compact (image seule) / Full (image + nom + set + rareté en overlay)
- Pagination en bas
- **Vue détaillée carte** (`/cartes/[id]`) :
  - Image HD de la carte (grande, centrée ou à gauche)
  - Panel infos à droite : nom FR + EN, set, rarity badge coloré, type, cost/power/might, domain, keywords
  - Description / texte de règle
  - Section "Décks utilisant cette carte" : liste des decklists où la carte apparaît
  - Flavor text en italique

**Tier List** *(s'inspirer de Riftbound Stats — riftboundstats.com/stats)*
- En-tête : titre "Tier List Riftbound — Set Unleashed", date de dernière mise à jour, nombre d'événements analysés (ex: "Basée sur 90+ tournois")
- Layout principal : tableau/grille avec chaque légende en ligne
- Colonnes du tableau :
  - Rang (#)
  - Portrait de la légende (image miniature de la carte)
  - Nom de la légende
  - Tier (badge coloré : S or, A rouge, B violet, C bleu, D gris)
  - Commentaire éditorial court (1-2 phrases)
  - Bouton "Voir le deck →"
- Les tiers sont séparés visuellement par des headers colorés : "TIER S", "TIER A", etc. avec la couleur de fond subtile correspondante ({colors.tier-s-bg}, {colors.tier-a-bg}...)
- Chaque légende est cliquable → ouvre un panel/modal avec :
  - Explication détaillée (éditorial, en français)
  - Decklist recommandée (miniature cliquable vers la page deck)
  - Forces / Faiblesses résumées
  - "Bon pour les débutants ?" indicateur simple (oui/non/moyen)
- Rappel : PAS de winrates/playrates/matchup% automatisés (restriction Riot). Tout est éditorial.
- Note en bas : "Cette tier list est basée sur notre analyse des résultats de tournois publics. Elle ne reflète pas de données statistiques automatisées."

**Page Tournois** *(s'inspirer de RiftDecks — riftdecks.com/riftbound-tournaments)*
- **Liste des tournois** (`/tournois`) :
  - Liste chronologique inverse des tournois
  - Chaque entrée : nom du tournoi, date, lieu, nombre de joueurs, organisateur
  - Filtres : par pays/région, par taille (>64 joueurs, >256, etc.), par format
  - Compteur total : "1670 tournois publiés"
- **Page tournoi détaillée** (`/tournois/[slug]`) :
  - Header : nom du tournoi, date, lieu, nombre de joueurs, format, organisateur
  - **Top 8** : grille visuelle des 8 meilleurs joueurs
    - Chaque slot : placement (#1, #2, ..., Top 8), nom du joueur, portrait de la légende jouée, lien vers la decklist
    - Le vainqueur (#1) est mis en avant avec un style doré/highlight
  - **Breakdown métagame** : 
    - Graphique en barres ou pie chart montrant la répartition des légendes jouées dans le tournoi
    - Tableau : Légende | Nombre de joueurs | % du champ
  - **Toutes les decklists** : liste paginée de tous les decks soumis
    - Chaque deck : joueur, légende (portrait), placement, lien vers deck détaillé
    - Tri possible : par placement, par légende, par date

**Page Deck** (`/decks/[slug]`)
- **Header du deck** :
  - Nom du deck (ex: "Kai'Sa Aggro Budget")
  - Portrait de la légende (grande image)
  - Tags : badges (budget, compétitif, débutant, tournoi)
  - Auteur + source (lien vers tournoi d'origine si applicable)
  - Format + Set context
- **Vue des cartes du deck** — layout inspiré de Piltover Archive :
  - Sections séparées : Légende, Champion, Main Deck (Units / Spells / Gear), Runes, Battlefields, Side Deck
  - Chaque section avec compteur (ex: "Main Deck (40 cartes)")
  - Cartes affichées en grille d'images miniatures avec quantité (badge x2, x3 en overlay)
  - Hover sur une carte : popup avec image agrandie + stats rapides
  - Vue alternative : liste textuelle (nom + quantité + set)
- **Guide du deck** :
  - Contenu Markdown rendu : stratégie, mulligan, matchups clés, combos, tips
  - En français, rédigé éditorialement
- **Export PNG** *(fonctionnalité clé, inspirée de Piltover Archive)* :
  - Bouton "📸 Exporter en image" bien visible
  - Génère une image PNG du deck complet, prête à partager sur Discord/Twitter/Reddit
  - L'image contient :
    - Header : nom du deck + légende + auteur + logo Riftbound.fr
    - Grille compacte de toutes les cartes (images miniatures organisées par section)
    - Sections étiquetées : Main Deck, Runes, Battlefields, Side
    - Quantité par carte visible
    - Footer : URL du deck sur Riftbound.fr + mention légale Riot mini
  - Implémentation technique :
    - Utiliser `html-to-image` (npm) ou `html2canvas` côté client
    - Créer un composant React caché `<DeckExportTemplate />` avec le layout PNG
    - Au clic sur "Exporter", render le composant en canvas, convertir en PNG, trigger le download
    - Le composant doit être stylé spécifiquement pour l'export (fond sombre, dimensions fixes ~1200x800 ou adaptatif selon nombre de cartes)
    - Alternative serveur : API route Next.js qui génère le PNG via `@vercel/og` ou `puppeteer` (plus lourd mais plus fiable pour le rendu)
  - Option additionnelle : bouton "📋 Copier le deck code" (format texte, compatible avec les simulateurs en ligne)

**Admin Panel**
- Auth simple (un seul admin, via env var `ADMIN_PASSWORD` + cookie session)
- CRUD pour : articles, decks, tier lists, tournois, événements
- Éditeur Markdown pour le contenu texte
- Upload d'images (stockées dans /public/uploads ou S3-compatible)
- Bouton "Synchroniser les cartes" (trigger le sync depuis l'API)

## SEO

- Métadonnées dynamiques sur chaque page (title, description, og:image)
- Sitemap.xml auto-généré
- URLs propres en français : `/cartes/OGN-001`, `/decks/kaisa-aggro-budget`, `/guides/debuter`
- Schema.org markup pour les articles
- `robots.txt` configuré

## Mention légale Riot (OBLIGATOIRE)

Dans le footer de CHAQUE page :
> Riftbound.fr n'est pas approuvé par Riot Games et ne reflète pas les opinions de Riot Games ou de toute personne officiellement impliquée dans la production ou la gestion des propriétés de Riot Games. Riot Games et toutes les propriétés associées sont des marques commerciales ou des marques déposées de Riot Games, Inc.

## Instructions de développement

1. Commence par le setup Docker Compose + Prisma schema + seed
2. Implémente le script de sync des cartes (`sync-cards.ts`) qui fetch depuis Riftcodex et stocke en DB
3. Construis le layout global (navbar, footer, dark theme)
4. Homepage avec les sections principales
5. Page cartes avec filtres et recherche
6. Page tier list
7. Page decks
8. Admin panel basique
9. Pages guides (contenu statique en MDX ou Markdown dans la DB)
10. SEO (sitemap, métadonnées, robots.txt)

## Variables d'environnement (.env.example)

```
DATABASE_URL=postgresql://riftbound:changeme@db:5432/riftbound
ADMIN_PASSWORD=changeme
NEXT_PUBLIC_SITE_URL=https://riftbound.fr
```

## Caddyfile

```
riftbound.fr {
    reverse_proxy app:3000
}
```

## Notes importantes

- **PAS de données méta automatisées** (winrates, playrates, matchup%) — interdit par Riot. Les tier lists sont éditoriales.
- **Toutes les images de cartes** doivent venir de l'API Riot ou Riftcodex (pas de scraping)
- **Mention légale Riot** obligatoire dans le footer
- **Tier gratuit obligatoire** si monétisation — pas de paywall sur le contenu principal
- Le contenu éditorial (tier lists, guides, analyses) est la vraie valeur ajoutée — c'est ce qui différencie des outils purement data
- Penser "mobile first" — beaucoup de joueurs TCG consultent sur mobile en boutique/tournoi
- Interface en français uniquement (pas de i18n nécessaire)
