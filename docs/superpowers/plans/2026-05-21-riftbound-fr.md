# Riftbound.fr Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Riftbound.fr, the French reference site for the Riftbound TCG, with card database, editorial tier lists, curated decklists, guides, tournament results, and admin panel.

**Architecture:** Next.js 14+ App Router with TypeScript, Tailwind CSS, shadcn/ui. PostgreSQL via Prisma ORM for data. Cards synced from Riftcodex API (`https://api.riftcodex.com`). Docker Compose for deployment (app + postgres + caddy). Dark gaming theme with arcane blue/runic gold/mystic violet accents.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, Docker, Caddy

**Key API finding:** Riftcodex API base is `https://api.riftcodex.com` (NOT `/api/` prefix). Card fields use nested objects: `classification.type`, `attributes.energy`, `text.plain`, `media.image_url`, `metadata.alternate_art`. Domain is an array (e.g. `["Fury", "Mind"]`). Sets use `set_id` as code.

---

## File Structure

```
riftbound-fr/
├── docker-compose.yml
├── Dockerfile
├── Caddyfile
├── .env.example
├── .env                          # Local dev (gitignored)
├── DESIGN.md                     # Design system reference
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── sync-cards.ts             # Cron: sync cards from Riftcodex API
├── public/
│   ├── favicon.ico
│   └── uploads/                  # Admin uploaded images
├── src/
│   ├── app/
│   │   ├── globals.css           # Tailwind + custom design tokens
│   │   ├── layout.tsx            # Root layout (fonts, navbar, footer, dark theme)
│   │   ├── page.tsx              # Homepage
│   │   ├── cartes/
│   │   │   ├── page.tsx          # Card database (search, filters, grid)
│   │   │   └── [id]/page.tsx     # Card detail
│   │   ├── decks/
│   │   │   ├── page.tsx          # Deck list
│   │   │   └── [slug]/page.tsx   # Deck detail + guide
│   │   ├── tier-list/
│   │   │   └── page.tsx          # Current tier list
│   │   ├── guides/
│   │   │   ├── page.tsx          # Guide index
│   │   │   ├── debuter/page.tsx
│   │   │   ├── deckbuilding/page.tsx
│   │   │   └── glossaire/page.tsx
│   │   ├── tournois/
│   │   │   ├── page.tsx          # Tournament list + calendar
│   │   │   └── [slug]/page.tsx   # Tournament detail
│   │   ├── actualites/
│   │   │   ├── page.tsx          # News/articles list
│   │   │   └── [slug]/page.tsx   # Article detail
│   │   ├── admin/
│   │   │   ├── layout.tsx        # Admin auth layout
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── login/page.tsx    # Login page
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx      # List articles
│   │   │   │   ├── new/page.tsx  # Create article
│   │   │   │   └── [id]/page.tsx # Edit article
│   │   │   ├── decks/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── tier-list/
│   │   │   │   └── page.tsx      # Tier list editor
│   │   │   ├── tournois/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── events/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/page.tsx
│   │   └── api/
│   │       ├── auth/route.ts         # Admin login API
│   │       ├── sync-cards/route.ts   # Manual card sync trigger
│   │       ├── admin/
│   │       │   ├── articles/route.ts
│   │       │   ├── articles/[id]/route.ts
│   │       │   ├── decks/route.ts
│   │       │   ├── decks/[id]/route.ts
│   │       │   ├── tier-list/route.ts
│   │       │   ├── tournois/route.ts
│   │       │   ├── tournois/[id]/route.ts
│   │       │   ├── events/route.ts
│   │       │   └── events/[id]/route.ts
│   │       └── cards/
│   │           └── search/route.ts   # Card search API for client
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── card-grid.tsx
│   │   ├── card-image.tsx            # Card image with hover glow
│   │   ├── card-filters.tsx
│   │   ├── deck-viewer.tsx
│   │   ├── deck-export-template.tsx
│   │   ├── tier-list-display.tsx
│   │   ├── tier-badge.tsx
│   │   ├── rarity-badge.tsx
│   │   ├── search-bar.tsx
│   │   ├── markdown-renderer.tsx
│   │   ├── pagination.tsx
│   │   └── admin/
│   │       ├── admin-sidebar.tsx
│   │       ├── markdown-editor.tsx
│   │       └── card-picker.tsx       # Pick cards for deck editor
│   ├── lib/
│   │   ├── prisma.ts                 # Prisma singleton
│   │   ├── riftcodex.ts              # API client
│   │   ├── auth.ts                   # Admin auth helpers
│   │   └── utils.ts                  # Shared utilities
│   └── types/
│       └── index.ts                  # TypeScript types
```

---

## Task 1: Project Scaffolding & Configuration

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `.env`, `.gitignore`, `docker-compose.yml`, `Dockerfile`, `Caddyfile`, `DESIGN.md`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:\Users\Allan\Documents\Claude\RiftboundFr
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Accept defaults. This creates the base Next.js 14+ project with App Router, TypeScript, Tailwind CSS, and ESLint.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client
npm install next-mdx-remote react-markdown remark-gfm
npm install html-to-image
npm install lucide-react
npm install clsx tailwind-merge class-variance-authority
npm install --save-dev @types/node
```

- [ ] **Step 3: Install shadcn/ui**

```bash
npx shadcn@latest init
```

Choose: New York style, Zinc base color, CSS variables = yes. Then install needed components:

```bash
npx shadcn@latest add button card badge input select dialog dropdown-menu separator sheet tabs accordion table textarea label tooltip scroll-area
```

- [ ] **Step 4: Create `.env.example` and `.env`**

`.env.example`:
```
DATABASE_URL=postgresql://riftbound:changeme@localhost:5432/riftbound
ADMIN_PASSWORD=changeme
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`.env` (for local dev — gitignored):
```
DATABASE_URL=postgresql://riftbound:riftbound@localhost:5432/riftbound
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 5: Create `docker-compose.yml`**

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://riftbound:${DB_PASSWORD:-riftbound}@db:5432/riftbound
      - ADMIN_PASSWORD=${ADMIN_PASSWORD:-changeme}
      - NEXT_PUBLIC_SITE_URL=${SITE_URL:-https://riftbound.fr}
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=riftbound
      - POSTGRES_USER=riftbound
      - POSTGRES_PASSWORD=${DB_PASSWORD:-riftbound}
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U riftbound"]
      interval: 5s
      timeout: 5s
      retries: 5
  caddy:
    image: caddy:2-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    depends_on:
      - app
volumes:
  pgdata:
  caddy_data:
```

- [ ] **Step 6: Create `Dockerfile`**

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

- [ ] **Step 7: Create `Caddyfile`**

```
riftbound.fr {
    reverse_proxy app:3000
}
```

- [ ] **Step 8: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cmsassets.rgpub.io",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 9: Update `tailwind.config.ts` with design system**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#06060b",
        surface: {
          DEFAULT: "#0c0c14",
          raised: "#12121e",
          overlay: "#1a1a2e",
        },
        "surface-glass": "rgba(12, 12, 20, 0.8)",
        arcane: {
          DEFAULT: "#0ea5e9",
          light: "#38bdf8",
          dark: "#0284c7",
          glow: "rgba(14, 165, 233, 0.15)",
        },
        gold: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          glow: "rgba(245, 158, 11, 0.12)",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
        },
        tier: {
          s: "#f59e0b",
          a: "#ef4444",
          b: "#8b5cf6",
          c: "#0ea5e9",
          d: "#6b7280",
          "s-bg": "rgba(245, 158, 11, 0.08)",
          "a-bg": "rgba(239, 68, 68, 0.08)",
          "b-bg": "rgba(139, 92, 246, 0.08)",
          "c-bg": "rgba(14, 165, 233, 0.08)",
          "d-bg": "rgba(107, 114, 128, 0.08)",
        },
        rarity: {
          common: "#9ca3af",
          rare: "#0ea5e9",
          epic: "#8b5cf6",
          champion: "#f59e0b",
          legend: "#ef4444",
        },
        ink: {
          DEFAULT: "#f1f5f9",
          secondary: "#94a3b8",
          muted: "#64748b",
          disabled: "#475569",
        },
        hairline: {
          DEFAULT: "rgba(148, 163, 184, 0.1)",
          strong: "rgba(148, 163, 184, 0.2)",
          accent: "rgba(14, 165, 233, 0.3)",
        },
      },
      fontFamily: {
        display: ["var(--font-rajdhani)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        "game-card": "8px",
        feature: "24px",
      },
      spacing: {
        section: "64px",
        "section-lg": "96px",
        hero: "120px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 10: Update `.gitignore`**

Add these entries to the existing `.gitignore`:
```
.env
/public/uploads/*
!/public/uploads/.gitkeep
```

- [ ] **Step 11: Create `DESIGN.md`**

Copy the full DESIGN.md content from the spec (the YAML block in the prompt file) to `DESIGN.md` at the project root.

- [ ] **Step 12: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, Docker, design system"
```

---

## Task 2: Prisma Schema & Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: Create Prisma schema**

`prisma/schema.prisma` — adapted from spec but corrected to match actual Riftcodex API data:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Card {
  id              String   @id
  riftboundId     String   @unique
  name            String
  cleanName       String?
  collectorNumber Int?
  set             String
  setName         String
  type            String
  supertype       String?
  rarity          String
  domains         String[]
  energy          Int?
  might           Int?
  power           Int?
  textRich        String?
  textPlain       String?
  flavorText      String?
  imageUrl        String?
  artist          String?
  tags            String[]
  alternateArt    Boolean  @default(false)
  overnumbered    Boolean  @default(false)
  signature       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  deckCards DeckCard[]

  @@index([set])
  @@index([type])
  @@index([rarity])
  @@index([name])
}

model CardSet {
  id          String   @id
  name        String
  setId       String   @unique
  cardCount   Int?
  publishedOn DateTime?
  createdAt   DateTime @default(now())

  @@map("sets")
}

model Deck {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  legendId    String
  legendName  String
  description String?
  guide       String?
  format      String   @default("constructed")
  tags        String[]
  authorName  String?
  sourceUrl   String?
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
  section  String @default("main")

  deck Deck @relation(fields: [deckId], references: [id], onDelete: Cascade)
  card Card @relation(fields: [cardId], references: [id])

  @@unique([deckId, cardId, section])
}

model TierList {
  id          String   @id @default(cuid())
  title       String
  description String?
  format      String   @default("constructed")
  setContext  String?
  published   Boolean  @default(false)
  current     Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  entries TierListEntry[]
}

model TierListEntry {
  id          String  @id @default(cuid())
  tierListId  String
  legendId    String
  legendName  String
  tier        String
  position    Int
  comment     String?
  deckId      String?

  tierList TierList @relation(fields: [tierListId], references: [id], onDelete: Cascade)

  @@index([tierListId])
}

model Article {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String?
  content     String
  category    String
  tags        String[]
  coverImage  String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

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
  organizer   String?
  description String?
  sourceUrl   String?
  createdAt   DateTime @default(now())

  results TournamentResult[]
}

model TournamentResult {
  id           String  @id @default(cuid())
  tournamentId String
  playerName   String
  placement    Int
  legendName   String
  deckId       String?

  tournament Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)

  @@index([tournamentId])
}

model Event {
  id          String    @id @default(cuid())
  title       String
  date        DateTime
  endDate     DateTime?
  location    String?
  type        String
  description String?
  url         String?
  createdAt   DateTime  @default(now())
}
```

- [ ] **Step 2: Create Prisma client singleton**

`src/lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: Start database and run migration**

Start a local PostgreSQL (via Docker or local install):
```bash
docker compose up db -d
```

Generate and run the initial migration:
```bash
npx prisma migrate dev --name init
```

- [ ] **Step 4: Commit**

```bash
git add prisma/ src/lib/prisma.ts
git commit -m "feat: add Prisma schema with all models and database migration"
```

---

## Task 3: TypeScript Types & Utilities

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/riftcodex.ts`

- [ ] **Step 1: Create TypeScript types**

`src/types/index.ts`:

```ts
export interface RiftcodexCard {
  id: string;
  name: string;
  riftbound_id: string;
  tcgplayer_id: string;
  collector_number: number;
  attributes: {
    energy: number | null;
    might: number | null;
    power: number | null;
  };
  classification: {
    type: string;
    supertype: string | null;
    rarity: string;
    domain: string[];
  };
  text: {
    rich: string | null;
    plain: string | null;
    flavour: string | null;
  };
  set: {
    set_id: string;
    label: string;
  };
  media: {
    image_url: string;
    artist: string | null;
    accessibility_text: string | null;
  };
  tags: string[];
  orientation: string;
  metadata: {
    clean_name: string;
    updated_on: string;
    alternate_art: boolean;
    overnumbered: boolean;
    signature: boolean;
  };
}

export interface RiftcodexSet {
  id: string;
  name: string;
  set_id: string;
  card_count: number;
  tcgplayer_id: string;
  cardmarket_id: string | string[] | null;
  published_on: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type CardType = "Unit" | "Spell" | "Gear" | "Rune" | "Battlefield" | "Legend";
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Showcase";
export type Domain = "Fury" | "Sorcery" | "Order" | "Calm" | "Mind" | "Body" | "Chaos";
export type Tier = "S" | "A" | "B" | "C" | "D";
export type DeckSection = "legend" | "main" | "rune" | "battlefield" | "side";

export interface CardFilters {
  search?: string;
  set?: string;
  type?: string;
  rarity?: string;
  domain?: string;
  supertype?: string;
  energyMin?: number;
  energyMax?: number;
  powerMin?: number;
  powerMax?: number;
  mightMin?: number;
  mightMax?: number;
  alternateArt?: boolean;
  page?: number;
  perPage?: number;
}
```

- [ ] **Step 2: Create utility functions**

`src/lib/utils.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function getRarityColor(rarity: string): string {
  const map: Record<string, string> = {
    Common: "text-rarity-common",
    Uncommon: "text-rarity-common",
    Rare: "text-rarity-rare",
    Epic: "text-rarity-epic",
    Champion: "text-rarity-champion",
    Showcase: "text-rarity-legend",
    Legend: "text-rarity-legend",
  };
  return map[rarity] ?? "text-ink-secondary";
}

export function getRarityBgColor(rarity: string): string {
  const map: Record<string, string> = {
    Common: "bg-rarity-common/20 text-rarity-common",
    Uncommon: "bg-rarity-common/20 text-rarity-common",
    Rare: "bg-rarity-rare/20 text-rarity-rare",
    Epic: "bg-rarity-epic/20 text-rarity-epic",
    Champion: "bg-rarity-champion/20 text-rarity-champion",
    Showcase: "bg-rarity-legend/20 text-rarity-legend",
  };
  return map[rarity] ?? "bg-ink-muted/20 text-ink-secondary";
}

export function getTierColor(tier: string): string {
  const map: Record<string, string> = {
    S: "text-tier-s",
    A: "text-tier-a",
    B: "text-tier-b",
    C: "text-tier-c",
    D: "text-tier-d",
  };
  return map[tier] ?? "text-ink-secondary";
}

export function getTierBgColor(tier: string): string {
  const map: Record<string, string> = {
    S: "bg-tier-s-bg border-tier-s/30",
    A: "bg-tier-a-bg border-tier-a/30",
    B: "bg-tier-b-bg border-tier-b/30",
    C: "bg-tier-c-bg border-tier-c/30",
    D: "bg-tier-d-bg border-tier-d/30",
  };
  return map[tier] ?? "";
}

export const CARD_TYPES = ["Unit", "Spell", "Gear", "Rune", "Battlefield", "Legend"] as const;
export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Showcase"] as const;
export const DOMAINS = ["Fury", "Sorcery", "Order", "Calm", "Mind", "Body", "Chaos"] as const;
export const TIERS = ["S", "A", "B", "C", "D"] as const;
```

- [ ] **Step 3: Create Riftcodex API client**

`src/lib/riftcodex.ts`:

```ts
import type { RiftcodexCard, RiftcodexSet, PaginatedResponse } from "@/types";

const BASE_URL = "https://api.riftcodex.com";

export async function fetchCards(
  page = 1,
  perPage = 50,
  params?: Record<string, string>
): Promise<PaginatedResponse<RiftcodexCard>> {
  const url = new URL(`${BASE_URL}/cards`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Riftcodex API error: ${res.status}`);
  return res.json();
}

export async function fetchAllCards(): Promise<RiftcodexCard[]> {
  const allCards: RiftcodexCard[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const data = await fetchCards(page, 100);
    allCards.push(...data.items);
    totalPages = data.pages;
    page++;
  } while (page <= totalPages);

  return allCards;
}

export async function fetchSets(): Promise<RiftcodexSet[]> {
  const res = await fetch(`${BASE_URL}/sets`);
  if (!res.ok) throw new Error(`Riftcodex API error: ${res.status}`);
  const data: PaginatedResponse<RiftcodexSet> = await res.json();
  return data.items;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/types/ src/lib/utils.ts src/lib/riftcodex.ts
git commit -m "feat: add TypeScript types, utilities, and Riftcodex API client"
```

---

## Task 4: Card Sync Script

**Files:**
- Create: `scripts/sync-cards.ts`
- Modify: `package.json` (add script)

- [ ] **Step 1: Create sync script**

`scripts/sync-cards.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://api.riftcodex.com";

interface RiftcodexCard {
  id: string;
  name: string;
  riftbound_id: string;
  collector_number: number;
  attributes: { energy: number | null; might: number | null; power: number | null };
  classification: { type: string; supertype: string | null; rarity: string; domain: string[] };
  text: { rich: string | null; plain: string | null; flavour: string | null };
  set: { set_id: string; label: string };
  media: { image_url: string; artist: string | null };
  tags: string[];
  metadata: { clean_name: string; alternate_art: boolean; overnumbered: boolean; signature: boolean };
}

interface RiftcodexSet {
  id: string;
  name: string;
  set_id: string;
  card_count: number;
  published_on: string;
}

async function syncSets() {
  console.log("Syncing sets...");
  const res = await fetch(`${BASE_URL}/sets`);
  const data = await res.json();
  const sets: RiftcodexSet[] = data.items;

  for (const s of sets) {
    await prisma.cardSet.upsert({
      where: { setId: s.set_id },
      update: { name: s.name, cardCount: s.card_count },
      create: {
        id: s.id,
        name: s.name,
        setId: s.set_id,
        cardCount: s.card_count,
        publishedOn: s.published_on ? new Date(s.published_on) : null,
      },
    });
  }
  console.log(`Synced ${sets.length} sets`);
}

async function syncCards() {
  console.log("Syncing cards...");
  let page = 1;
  let totalPages = 1;
  let total = 0;

  do {
    const res = await fetch(`${BASE_URL}/cards?page=${page}&per_page=100`);
    const data = await res.json();
    const cards: RiftcodexCard[] = data.items;
    totalPages = data.pages;

    for (const c of cards) {
      await prisma.card.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          cleanName: c.metadata.clean_name,
          collectorNumber: c.collector_number,
          set: c.set.set_id,
          setName: c.set.label,
          type: c.classification.type,
          supertype: c.classification.supertype,
          rarity: c.classification.rarity,
          domains: c.classification.domain,
          energy: c.attributes.energy,
          might: c.attributes.might,
          power: c.attributes.power,
          textRich: c.text.rich,
          textPlain: c.text.plain,
          flavorText: c.text.flavour,
          imageUrl: c.media.image_url,
          artist: c.media.artist,
          tags: c.tags,
          alternateArt: c.metadata.alternate_art,
          overnumbered: c.metadata.overnumbered,
          signature: c.metadata.signature,
        },
        create: {
          id: c.id,
          riftboundId: c.riftbound_id,
          name: c.name,
          cleanName: c.metadata.clean_name,
          collectorNumber: c.collector_number,
          set: c.set.set_id,
          setName: c.set.label,
          type: c.classification.type,
          supertype: c.classification.supertype,
          rarity: c.classification.rarity,
          domains: c.classification.domain,
          energy: c.attributes.energy,
          might: c.attributes.might,
          power: c.attributes.power,
          textRich: c.text.rich,
          textPlain: c.text.plain,
          flavorText: c.text.flavour,
          imageUrl: c.media.image_url,
          artist: c.media.artist,
          tags: c.tags,
          alternateArt: c.metadata.alternate_art,
          overnumbered: c.metadata.overnumbered,
          signature: c.metadata.signature,
        },
      });
    }

    total += cards.length;
    console.log(`Page ${page}/${totalPages} — ${total} cards synced`);
    page++;
  } while (page <= totalPages);

  console.log(`Done! Total: ${total} cards`);
}

async function main() {
  try {
    await syncSets();
    await syncCards();
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

- [ ] **Step 2: Add sync script to package.json**

Add to `scripts` in `package.json`:
```json
"sync-cards": "npx tsx scripts/sync-cards.ts"
```

Also install tsx:
```bash
npm install --save-dev tsx
```

- [ ] **Step 3: Run sync to test**

```bash
npm run sync-cards
```

Expected: Cards and sets are synced from the API into the local database.

- [ ] **Step 4: Commit**

```bash
git add scripts/ package.json package-lock.json
git commit -m "feat: add card sync script from Riftcodex API"
```

---

## Task 5: Global Styles, Fonts & Layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/components/navbar.tsx`
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Update `globals.css`**

`src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 50% 2%;
    --foreground: 210 40% 96%;
    --card: 240 30% 5%;
    --card-foreground: 210 40% 96%;
    --popover: 240 25% 7%;
    --popover-foreground: 210 40% 96%;
    --primary: 199 89% 48%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 20% 10%;
    --secondary-foreground: 210 40% 96%;
    --muted: 240 15% 15%;
    --muted-foreground: 215 20% 55%;
    --accent: 240 20% 12%;
    --accent-foreground: 210 40% 96%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    --border: 215 20% 18%;
    --input: 215 20% 18%;
    --ring: 199 89% 48%;
    --radius: 0.75rem;
  }
}

@layer base {
  * {
    @apply border-hairline;
  }
  body {
    @apply bg-canvas text-ink font-body antialiased;
  }
}

@layer components {
  .card-hover {
    @apply transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-hairline-accent;
  }
  .game-card-hover {
    @apply transition-all duration-200 ease-out hover:scale-105;
    &:hover {
      box-shadow: 0 0 24px rgba(14, 165, 233, 0.15);
    }
  }
  .glow-blue {
    box-shadow: 0 0 20px rgba(14, 165, 233, 0.15);
  }
  .glow-gold {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.12);
  }
  .glass {
    @apply bg-surface-glass backdrop-blur-xl;
  }
}
```

- [ ] **Step 2: Create Navbar**

`src/components/navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/cartes", label: "Cartes" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/decks", label: "Decks" },
  { href: "/tournois", label: "Tournois" },
  { href: "/guides", label: "Guides" },
  { href: "/actualites", label: "Actus" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-hairline">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-2xl font-bold tracking-tight">
          <span className="text-arcane">Rift</span>
          <span className="text-ink">bound</span>
          <span className="text-gold">.fr</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "text-arcane"
                  : "text-ink-secondary hover:text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-ink-secondary md:hidden"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-hairline px-4 py-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                pathname.startsWith(link.href)
                  ? "text-arcane"
                  : "text-ink-secondary"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
```

- [ ] **Step 3: Create Footer**

`src/components/footer.tsx`:

```tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">
              <span className="text-arcane">Rift</span>bound<span className="text-gold">.fr</span>
            </h3>
            <p className="mt-2 text-sm text-ink-muted">
              La reference francophone pour le TCG Riftbound.
            </p>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Explorer
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/cartes" className="text-ink-muted hover:text-ink">Base de cartes</Link></li>
              <li><Link href="/tier-list" className="text-ink-muted hover:text-ink">Tier List</Link></li>
              <li><Link href="/decks" className="text-ink-muted hover:text-ink">Decks</Link></li>
              <li><Link href="/tournois" className="text-ink-muted hover:text-ink">Tournois</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Apprendre
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/guides/debuter" className="text-ink-muted hover:text-ink">Guide debutant</Link></li>
              <li><Link href="/guides/deckbuilding" className="text-ink-muted hover:text-ink">Deckbuilding</Link></li>
              <li><Link href="/guides/glossaire" className="text-ink-muted hover:text-ink">Glossaire</Link></li>
              <li><Link href="/actualites" className="text-ink-muted hover:text-ink">Actualites</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-secondary">
              Communaute
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/tournois" className="text-ink-muted hover:text-ink">Calendrier</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-hairline pt-8">
          <p className="text-xs leading-relaxed text-ink-disabled">
            Riftbound.fr n&apos;est pas approuve par Riot Games et ne reflete pas les opinions de Riot
            Games ou de toute personne officiellement impliquee dans la production ou la gestion des
            proprietes de Riot Games. Riot Games et toutes les proprietes associees sont des marques
            commerciales ou des marques deposees de Riot Games, Inc.
          </p>
          <p className="mt-4 text-xs text-ink-disabled">
            &copy; {new Date().getFullYear()} Riftbound.fr
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update root layout**

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Rajdhani, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Riftbound.fr — La reference Riftbound en francais",
    template: "%s | Riftbound.fr",
  },
  description:
    "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound. Tout en francais.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className={`${rajdhani.variable} ${jakarta.variable} font-body`}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx src/components/navbar.tsx src/components/footer.tsx
git commit -m "feat: add global layout with dark theme, navbar, footer, and Google Fonts"
```

---

## Task 6: Shared Components (Card Image, Badges, Pagination, Search)

**Files:**
- Create: `src/components/card-image.tsx`
- Create: `src/components/rarity-badge.tsx`
- Create: `src/components/tier-badge.tsx`
- Create: `src/components/pagination.tsx`
- Create: `src/components/search-bar.tsx`
- Create: `src/components/markdown-renderer.tsx`

- [ ] **Step 1: Create CardImage component**

`src/components/card-image.tsx`:

```tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface CardImageProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  priority?: boolean;
}

const sizes = {
  sm: { width: 140, height: 195 },
  md: { width: 200, height: 279 },
  lg: { width: 300, height: 419 },
  xl: { width: 400, height: 558 },
};

export function CardImage({ src, alt, size = "md", className, priority }: CardImageProps) {
  const { width, height } = sizes[size];

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-game-card bg-surface-raised text-ink-muted",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">No image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={cn("rounded-game-card object-cover game-card-hover", className)}
      priority={priority}
    />
  );
}
```

- [ ] **Step 2: Create RarityBadge component**

`src/components/rarity-badge.tsx`:

```tsx
import { cn, getRarityBgColor } from "@/lib/utils";

export function RarityBadge({ rarity, className }: { rarity: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        getRarityBgColor(rarity),
        className
      )}
    >
      {rarity}
    </span>
  );
}
```

- [ ] **Step 3: Create TierBadge component**

`src/components/tier-badge.tsx`:

```tsx
import { cn, getTierColor } from "@/lib/utils";

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  const bgMap: Record<string, string> = {
    S: "bg-tier-s/20",
    A: "bg-tier-a/20",
    B: "bg-tier-b/20",
    C: "bg-tier-c/20",
    D: "bg-tier-d/20",
  };

  return (
    <span
      className={cn(
        "inline-flex min-w-[48px] items-center justify-center rounded-md px-3 py-1 font-display text-lg font-bold",
        getTierColor(tier),
        bgMap[tier],
        className
      )}
    >
      {tier}
    </span>
  );
}
```

- [ ] **Step 4: Create Pagination component**

`src/components/pagination.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-ink"
        >
          <ChevronLeft size={16} />
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-ink-muted">...</span>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p)}
            className={cn(
              "flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium",
              p === currentPage
                ? "bg-arcane text-white"
                : "text-ink-secondary hover:bg-surface-raised hover:text-ink"
            )}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-ink"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
```

- [ ] **Step 5: Create SearchBar component**

`src/components/search-bar.tsx`:

```tsx
"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  basePath?: string;
}

export function SearchBar({ placeholder = "Rechercher une carte...", basePath = "/cartes" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-full border border-hairline-strong bg-surface pl-12 pr-4 text-ink placeholder:text-ink-muted focus:border-arcane focus:outline-none focus:ring-2 focus:ring-arcane-glow"
      />
    </form>
  );
}
```

- [ ] **Step 6: Create MarkdownRenderer component**

`src/components/markdown-renderer.tsx`:

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:text-ink prose-p:text-ink-secondary prose-a:text-arcane prose-strong:text-ink prose-code:text-arcane prose-pre:bg-surface-raised prose-pre:border prose-pre:border-hairline">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add shared components (card image, badges, pagination, search, markdown)"
```

---

## Task 7: Homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build the homepage**

`src/app/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/card-image";
import { TierBadge } from "@/components/tier-badge";
import { ArrowRight, BookOpen, Swords, Trophy, Layers } from "lucide-react";

async function getFeaturedData() {
  const [tierList, featuredDecks, latestArticles, cardCount] = await Promise.all([
    prisma.tierList.findFirst({
      where: { current: true, published: true },
      include: {
        entries: {
          orderBy: { position: "asc" },
          take: 5,
        },
      },
    }),
    prisma.deck.findMany({
      where: { published: true, featured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.findMany({
      where: { published: true },
      take: 3,
      orderBy: { publishedAt: "desc" },
    }),
    prisma.card.count(),
  ]);

  const legendIds = tierList?.entries.map((e) => e.legendId) ?? [];
  const legendCards = legendIds.length
    ? await prisma.card.findMany({ where: { riftboundId: { in: legendIds } } })
    : [];
  const legendMap = new Map(legendCards.map((c) => [c.riftboundId, c]));

  return { tierList, featuredDecks, latestArticles, cardCount, legendMap };
}

export default async function HomePage() {
  const { tierList, featuredDecks, latestArticles, cardCount, legendMap } = await getFeaturedData();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-arcane/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl font-bold tracking-tight sm:text-7xl">
            La reference <span className="text-arcane">Riftbound</span> en{" "}
            <span className="text-gold">francais</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-ink-secondary">
            Base de cartes, tier lists, decks, guides et tournois.
            Tout ce qu&apos;il faut pour debuter et progresser au TCG Riftbound.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/guides/debuter"
              className="inline-flex items-center gap-2 rounded-full bg-arcane px-6 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-arcane-glow"
            >
              <BookOpen size={18} />
              Guide debutant
            </Link>
            <Link
              href="/cartes"
              className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-arcane hover:text-arcane"
            >
              <Layers size={18} />
              {cardCount} cartes
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: Layers, label: "Cartes", value: String(cardCount), href: "/cartes" },
            { icon: Swords, label: "Decks", value: String(featuredDecks.length) + "+", href: "/decks" },
            { icon: Trophy, label: "Tournois", value: "Resultats", href: "/tournois" },
            { icon: BookOpen, label: "Guides", value: "FR", href: "/guides" },
          ].map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="card-hover rounded-card border border-hairline bg-surface p-4 text-center"
            >
              <stat.icon className="mx-auto mb-2 text-arcane" size={24} />
              <div className="font-display text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-ink-secondary">{stat.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tier List Preview */}
      {tierList && tierList.entries.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold">Tier List</h2>
            <Link href="/tier-list" className="flex items-center gap-1 text-sm text-arcane hover:text-arcane-light">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {tierList.entries.map((entry) => {
              const card = legendMap.get(entry.legendId);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 rounded-card border border-hairline bg-surface p-3"
                >
                  <TierBadge tier={entry.tier} />
                  {card?.imageUrl && (
                    <CardImage src={card.imageUrl} alt={entry.legendName} size="sm" className="h-16 w-12 object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-display font-semibold">{entry.legendName}</div>
                    {entry.comment && (
                      <p className="text-sm text-ink-secondary">{entry.comment}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Decks */}
      {featuredDecks.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold">Decks populaires</h2>
            <Link href="/decks" className="flex items-center gap-1 text-sm text-arcane hover:text-arcane-light">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDecks.map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.slug}`}
                className="card-hover rounded-card border border-hairline bg-surface p-4"
              >
                <div className="font-display text-lg font-semibold">{deck.title}</div>
                <div className="mt-1 text-sm text-arcane">{deck.legendName}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {deck.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-ink-secondary">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Latest Articles */}
      {latestArticles.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 pb-16 sm:px-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-3xl font-bold">Derniers articles</h2>
            <Link href="/actualites" className="flex items-center gap-1 text-sm text-arcane hover:text-arcane-light">
              Voir tout <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.id}
                href={`/actualites/${article.slug}`}
                className="card-hover rounded-card border border-hairline bg-surface p-5"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-violet">
                  {article.category}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">{article.title}</h3>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{article.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: build homepage with hero, tier list preview, featured decks, articles"
```

---

## Task 8: Cards Database Page

**Files:**
- Create: `src/app/cartes/page.tsx`
- Create: `src/app/cartes/[id]/page.tsx`
- Create: `src/components/card-grid.tsx`
- Create: `src/components/card-filters.tsx`

- [ ] **Step 1: Create CardFilters component**

`src/components/card-filters.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CARD_TYPES, RARITIES, DOMAINS } from "@/lib/utils";

interface CardFiltersProps {
  sets: { setId: string; name: string }[];
}

export function CardFilters({ sets }: CardFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/cartes?${params.toString()}`);
  }

  function selectValue(key: string) {
    return searchParams.get(key) ?? "all";
  }

  const filterClass =
    "h-9 rounded-lg border border-hairline-strong bg-surface px-3 text-sm text-ink focus:border-arcane focus:outline-none focus:ring-1 focus:ring-arcane-glow";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select className={filterClass} value={selectValue("set")} onChange={(e) => updateFilter("set", e.target.value)}>
        <option value="all">Tous les sets</option>
        {sets.map((s) => (
          <option key={s.setId} value={s.setId}>{s.name}</option>
        ))}
      </select>

      <select className={filterClass} value={selectValue("type")} onChange={(e) => updateFilter("type", e.target.value)}>
        <option value="all">Tous les types</option>
        {CARD_TYPES.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select className={filterClass} value={selectValue("rarity")} onChange={(e) => updateFilter("rarity", e.target.value)}>
        <option value="all">Toutes les raretes</option>
        {RARITIES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <select className={filterClass} value={selectValue("domain")} onChange={(e) => updateFilter("domain", e.target.value)}>
        <option value="all">Tous les domaines</option>
        {DOMAINS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {searchParams.toString() && (
        <button
          onClick={() => router.push("/cartes")}
          className="rounded-lg px-3 py-1.5 text-sm text-ink-muted hover:text-ink"
        >
          Reinitialiser
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create CardGrid component**

`src/components/card-grid.tsx`:

```tsx
import Link from "next/link";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import type { Card } from "@prisma/client";

interface CardGridProps {
  cards: Card[];
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="py-20 text-center text-ink-muted">
        Aucune carte trouvee.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => (
        <Link
          key={card.id}
          href={`/cartes/${card.riftboundId}`}
          className="group relative"
        >
          <CardImage src={card.imageUrl} alt={card.name} size="md" />
          <div className="mt-2">
            <div className="truncate text-sm font-medium group-hover:text-arcane">
              {card.name}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <RarityBadge rarity={card.rarity} />
              <span className="text-xs text-ink-muted">{card.setName}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create cards list page**

`src/app/cartes/page.tsx`:

```tsx
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { CardGrid } from "@/components/card-grid";
import { CardFilters } from "@/components/card-filters";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Base de cartes",
  description: "Explorez toutes les cartes du TCG Riftbound avec filtres et recherche.",
};

const PER_PAGE = 48;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CartesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q;
  const set = params.set;
  const type = params.type;
  const rarity = params.rarity;
  const domain = params.domain;

  const where: Prisma.CardWhereInput = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (set && set !== "all") where.set = set;
  if (type && type !== "all") where.type = type;
  if (rarity && rarity !== "all") where.rarity = rarity;
  if (domain && domain !== "all") where.domains = { has: domain };

  const [cards, total, sets] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.card.count({ where }),
    prisma.cardSet.findMany({ orderBy: { publishedOn: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const activeFilters = [set, type, rarity, domain, search].filter(
    (f) => f && f !== "all"
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Base de cartes</h1>

      <div className="mt-6">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      <div className="mt-4">
        <Suspense>
          <CardFilters sets={sets.map((s) => ({ setId: s.setId, name: s.name }))} />
        </Suspense>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-ink-secondary">
        <span>{total} carte{total !== 1 ? "s" : ""}</span>
        {activeFilters > 0 && (
          <span className="text-ink-muted">
            &middot; {activeFilters} filtre{activeFilters !== 1 ? "s" : ""} actif{activeFilters !== 1 ? "s" : ""}
          </span>
        )}
        <span className="text-ink-muted">&middot; Page {page} sur {totalPages}</span>
      </div>

      <div className="mt-6">
        <CardGrid cards={cards} />
      </div>

      <div className="mt-8">
        <Suspense>
          <Pagination currentPage={page} totalPages={totalPages} />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create card detail page**

`src/app/cartes/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { riftboundId: id } });
  if (!card) return { title: "Carte introuvable" };
  return {
    title: card.name,
    description: `${card.name} — ${card.type} ${card.rarity} du set ${card.setName}`,
    openGraph: card.imageUrl ? { images: [card.imageUrl] } : undefined,
  };
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { riftboundId: id } });

  if (!card) notFound();

  const relatedDecks = await prisma.deckCard.findMany({
    where: { cardId: card.id },
    include: { deck: true },
    take: 5,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/cartes" className="text-sm text-ink-muted hover:text-arcane">
        &larr; Retour aux cartes
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
        <div>
          <CardImage src={card.imageUrl} alt={card.name} size="xl" priority />
        </div>

        <div>
          <h1 className="font-display text-4xl font-bold">{card.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={card.rarity} />
            <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-xs font-semibold text-violet">
              {card.setName}
            </span>
            <span className="text-sm text-ink-secondary">{card.riftboundId}</span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Type", value: card.type },
                { label: "Rarete", value: card.rarity },
                { label: "Domaine", value: card.domains.join(", ") || "—" },
                { label: "Supertype", value: card.supertype || "—" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm">{item.value}</div>
                </div>
              ))}
            </div>

            {(card.energy !== null || card.power !== null || card.might !== null) && (
              <div className="grid grid-cols-3 gap-4">
                {card.energy !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">Energie</div>
                    <div className="font-display text-2xl font-bold text-arcane">{card.energy}</div>
                  </div>
                )}
                {card.might !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">Puissance</div>
                    <div className="font-display text-2xl font-bold text-gold">{card.might}</div>
                  </div>
                )}
                {card.power !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">Power</div>
                    <div className="font-display text-2xl font-bold text-violet">{card.power}</div>
                  </div>
                )}
              </div>
            )}

            {card.textPlain && (
              <div className="rounded-lg border border-hairline bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  Texte
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {card.textPlain}
                </p>
              </div>
            )}

            {card.flavorText && (
              <p className="border-l-2 border-violet/30 pl-4 text-sm italic text-ink-muted">
                {card.flavorText}
              </p>
            )}

            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {card.artist && (
              <div className="text-sm text-ink-muted">
                Artiste : <span className="text-ink-secondary">{card.artist}</span>
              </div>
            )}
          </div>

          {relatedDecks.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold">Decks utilisant cette carte</h2>
              <div className="mt-3 space-y-2">
                {relatedDecks.map(({ deck }) => (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.slug}`}
                    className="block rounded-lg border border-hairline bg-surface p-3 transition-colors hover:border-hairline-accent"
                  >
                    <div className="font-medium">{deck.title}</div>
                    <div className="text-sm text-arcane">{deck.legendName}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/cartes/ src/components/card-grid.tsx src/components/card-filters.tsx
git commit -m "feat: add card database with filters, search, pagination, and card detail page"
```

---

## Task 9: Tier List Page

**Files:**
- Create: `src/app/tier-list/page.tsx`

- [ ] **Step 1: Build tier list page**

`src/app/tier-list/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/card-image";
import { TierBadge } from "@/components/tier-badge";
import { getTierBgColor, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tier List",
  description: "Classement editorial des legendes Riftbound par tier. Guide francais pour choisir votre legende.",
};

export default async function TierListPage() {
  const tierList = await prisma.tierList.findFirst({
    where: { current: true, published: true },
    include: {
      entries: { orderBy: { position: "asc" } },
    },
  });

  if (!tierList) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold">Tier List</h1>
        <p className="mt-4 text-ink-secondary">Aucune tier list publiee pour le moment.</p>
      </div>
    );
  }

  const legendIds = tierList.entries.map((e) => e.legendId);
  const legendCards = await prisma.card.findMany({
    where: { riftboundId: { in: legendIds } },
  });
  const legendMap = new Map(legendCards.map((c) => [c.riftboundId, c]));

  const grouped = tierList.entries.reduce(
    (acc, entry) => {
      if (!acc[entry.tier]) acc[entry.tier] = [];
      acc[entry.tier].push(entry);
      return acc;
    },
    {} as Record<string, typeof tierList.entries>
  );

  const tierOrder = ["S", "A", "B", "C", "D"];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold">{tierList.title}</h1>
        {tierList.description && (
          <p className="mt-2 text-ink-secondary">{tierList.description}</p>
        )}
        <p className="mt-2 text-sm text-ink-muted">
          Derniere mise a jour : {formatDate(tierList.updatedAt)}
          {tierList.setContext && ` — ${tierList.setContext}`}
        </p>
      </div>

      <div className="mt-10 space-y-6">
        {tierOrder.map((tier) => {
          const entries = grouped[tier];
          if (!entries || entries.length === 0) return null;

          return (
            <div key={tier}>
              <div
                className={cn(
                  "flex items-center gap-4 rounded-t-lg border px-4 py-3",
                  getTierBgColor(tier)
                )}
              >
                <TierBadge tier={tier} />
                <span className="font-display text-lg font-semibold">
                  TIER {tier}
                </span>
              </div>
              <div className="space-y-1 rounded-b-lg border border-t-0 border-hairline bg-surface p-2">
                {entries.map((entry, idx) => {
                  const card = legendMap.get(entry.legendId);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-surface-raised"
                    >
                      <span className="w-8 text-center font-display text-lg font-bold text-ink-muted">
                        {idx + 1}
                      </span>
                      {card?.imageUrl && (
                        <CardImage src={card.imageUrl} alt={entry.legendName} size="sm" className="h-14 w-10 object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="font-display font-semibold">{entry.legendName}</div>
                        {entry.comment && (
                          <p className="mt-0.5 text-sm text-ink-secondary">{entry.comment}</p>
                        )}
                      </div>
                      {entry.deckId && (
                        <Link
                          href={`/decks/${entry.deckId}`}
                          className="rounded-full bg-arcane/10 px-3 py-1 text-xs font-medium text-arcane hover:bg-arcane/20"
                        >
                          Voir le deck
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 rounded-lg border border-hairline bg-surface p-6 text-center">
        <p className="text-sm text-ink-muted">
          Cette tier list est basee sur notre analyse des resultats de tournois publics.
          Elle ne reflete pas de donnees statistiques automatisees.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/tier-list/
git commit -m "feat: add tier list page with grouped tiers, legend portraits, and editorial comments"
```

---

## Task 10: Decks Pages

**Files:**
- Create: `src/app/decks/page.tsx`
- Create: `src/app/decks/[slug]/page.tsx`
- Create: `src/components/deck-viewer.tsx`

- [ ] **Step 1: Create DeckViewer component**

`src/components/deck-viewer.tsx`:

```tsx
import { CardImage } from "@/components/card-image";
import Link from "next/link";
import type { Card, DeckCard } from "@prisma/client";

type DeckCardWithCard = DeckCard & { card: Card };

interface DeckViewerProps {
  cards: DeckCardWithCard[];
}

const sectionLabels: Record<string, string> = {
  legend: "Legende",
  main: "Deck Principal",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Side Deck",
};

const sectionOrder = ["legend", "main", "rune", "battlefield", "side"];

export function DeckViewer({ cards }: DeckViewerProps) {
  const grouped = cards.reduce(
    (acc, dc) => {
      const s = dc.section || "main";
      if (!acc[s]) acc[s] = [];
      acc[s].push(dc);
      return acc;
    },
    {} as Record<string, DeckCardWithCard[]>
  );

  return (
    <div className="space-y-8">
      {sectionOrder.map((section) => {
        const sectionCards = grouped[section];
        if (!sectionCards || sectionCards.length === 0) return null;
        const total = sectionCards.reduce((sum, dc) => sum + dc.quantity, 0);

        return (
          <div key={section}>
            <h3 className="font-display text-lg font-semibold">
              {sectionLabels[section] || section}{" "}
              <span className="text-ink-muted">({total} carte{total !== 1 ? "s" : ""})</span>
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {sectionCards.map((dc) => (
                <Link
                  key={dc.id}
                  href={`/cartes/${dc.card.riftboundId}`}
                  className="group relative"
                >
                  <CardImage src={dc.card.imageUrl} alt={dc.card.name} size="sm" />
                  {dc.quantity > 1 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-arcane text-xs font-bold text-white">
                      {dc.quantity}
                    </span>
                  )}
                  <div className="mt-1 truncate text-xs text-ink-secondary group-hover:text-arcane">
                    {dc.card.name}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create decks list page**

`src/app/decks/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Decks",
  description: "Decklists curatees pour le TCG Riftbound avec guides en francais.",
};

export default async function DecksPage() {
  const decks = await prisma.deck.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Decks</h1>
      <p className="mt-2 text-ink-secondary">
        Decklists curatees avec guides et explications en francais.
      </p>

      {decks.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">Aucun deck publie pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link
              key={deck.id}
              href={`/decks/${deck.slug}`}
              className="card-hover rounded-card border border-hairline bg-surface p-5"
            >
              <div className="font-display text-xl font-semibold">{deck.title}</div>
              <div className="mt-1 text-sm text-arcane">{deck.legendName}</div>
              {deck.description && (
                <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{deck.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {deck.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-raised px-2 py-0.5 text-xs text-ink-secondary">
                    {tag}
                  </span>
                ))}
                <span className="text-xs text-ink-muted">{deck._count.cards} cartes</span>
              </div>
              {deck.authorName && (
                <div className="mt-2 text-xs text-ink-muted">par {deck.authorName}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create deck detail page**

`src/app/decks/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DeckViewer } from "@/components/deck-viewer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({ where: { slug } });
  if (!deck) return { title: "Deck introuvable" };
  return {
    title: `${deck.title} — ${deck.legendName}`,
    description: deck.description || `Decklist ${deck.title} pour le TCG Riftbound`,
  };
}

export default async function DeckDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: {
      cards: {
        include: { card: true },
        orderBy: [{ section: "asc" }, { card: { name: "asc" } }],
      },
    },
  });

  if (!deck || !deck.published) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/decks" className="text-sm text-ink-muted hover:text-arcane">
        &larr; Retour aux decks
      </Link>

      <div className="mt-6">
        <h1 className="font-display text-4xl font-bold">{deck.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-lg text-arcane">{deck.legendName}</span>
          <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-secondary">
            {deck.format}
          </span>
          {deck.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-violet/10 px-2.5 py-0.5 text-xs text-violet">
              {tag}
            </span>
          ))}
        </div>
        {deck.authorName && (
          <div className="mt-2 text-sm text-ink-muted">
            par {deck.authorName}
            {deck.sourceUrl && (
              <>
                {" "}&middot;{" "}
                <a href={deck.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">
                  Source
                </a>
              </>
            )}
          </div>
        )}
        {deck.description && (
          <p className="mt-4 text-ink-secondary">{deck.description}</p>
        )}
      </div>

      <div className="mt-8">
        <DeckViewer cards={deck.cards} />
      </div>

      {deck.guide && (
        <div className="mt-12">
          <h2 className="font-display text-2xl font-bold">Guide du deck</h2>
          <div className="mt-4">
            <MarkdownRenderer content={deck.guide} />
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/decks/ src/components/deck-viewer.tsx
git commit -m "feat: add deck list page and deck detail with card viewer and guide"
```

---

## Task 11: Guide Pages

**Files:**
- Create: `src/app/guides/page.tsx`
- Create: `src/app/guides/debuter/page.tsx`
- Create: `src/app/guides/deckbuilding/page.tsx`
- Create: `src/app/guides/glossaire/page.tsx`

- [ ] **Step 1: Create guide index page**

`src/app/guides/page.tsx`:

```tsx
import Link from "next/link";
import { BookOpen, Layers, BookText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides",
  description: "Guides pour debuter et progresser au TCG Riftbound. En francais.",
};

const guides = [
  {
    href: "/guides/debuter",
    icon: BookOpen,
    title: "Guide du debutant",
    description: "Apprenez les bases du jeu : regles, phases de tour, types de cartes, et premiers pas.",
  },
  {
    href: "/guides/deckbuilding",
    icon: Layers,
    title: "Guide de deckbuilding",
    description: "Comment construire un deck equilibre : choix de legende, courbe de mana, synergies.",
  },
  {
    href: "/guides/glossaire",
    icon: BookText,
    title: "Glossaire",
    description: "Tous les termes du jeu expliques en francais : mots-cles, mecaniques, jargon TCG.",
  },
];

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Guides</h1>
      <p className="mt-2 text-ink-secondary">
        Tout ce qu&apos;il faut pour debuter et progresser au TCG Riftbound.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="card-hover rounded-feature border border-hairline bg-surface p-6"
          >
            <guide.icon className="text-arcane" size={32} />
            <h2 className="mt-4 font-display text-xl font-semibold">{guide.title}</h2>
            <p className="mt-2 text-sm text-ink-secondary">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create beginner guide page**

`src/app/guides/debuter/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide du debutant",
  description: "Apprenez les bases du TCG Riftbound : regles, types de cartes, et conseils pour debuter.",
};

export default function GuideDebuterPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Guide du debutant</h1>
      <p className="mt-2 text-lg text-ink-secondary">
        Bienvenue dans Riftbound ! Ce guide vous explique tout pour commencer a jouer.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">Qu&apos;est-ce que Riftbound ?</h2>
          <p className="mt-3 text-ink-secondary leading-relaxed">
            Riftbound est un jeu de cartes a collectionner (TCG) base sur l&apos;univers de League of Legends,
            developpe par Riot Games. Deux joueurs s&apos;affrontent en deployant des unites sur des champs de
            bataille, en lançant des sorts et en utilisant des legendes pour remporter la victoire.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">Les types de cartes</h2>
          <div className="mt-4 space-y-3">
            {[
              { name: "Legende", desc: "Votre champion. Chaque deck est construit autour d'une legende qui donne des capacites speciales." },
              { name: "Unite", desc: "Les creatures que vous deployez sur le terrain pour combattre." },
              { name: "Sort", desc: "Des effets ponctuels : dommages, pioche, buff, removal..." },
              { name: "Equipement (Gear)", desc: "Des objets a attacher a vos unites pour les renforcer." },
              { name: "Rune", desc: "Des cartes speciales qui modifient les regles du jeu." },
              { name: "Champ de bataille", desc: "Le terrain ou se deroulent les combats. Certains ont des effets speciaux." },
            ].map((type) => (
              <div key={type.name} className="rounded-lg border border-hairline bg-surface p-4">
                <h3 className="font-display font-semibold">{type.name}</h3>
                <p className="mt-1 text-sm text-ink-secondary">{type.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">Domaines</h2>
          <p className="mt-3 text-ink-secondary leading-relaxed">
            Les cartes appartiennent a des domaines qui definissent leur style de jeu. Votre legende determine
            quels domaines vous pouvez utiliser. Les six domaines sont : Fury, Sorcery, Order, Calm, Mind et Body,
            plus Chaos qui est neutre.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">Conseils pour debuter</h2>
          <ul className="mt-3 space-y-2 text-ink-secondary">
            {[
              "Commencez avec un deck pre-construit pour apprendre les mecaniques.",
              "Concentrez-vous sur une seule legende au debut.",
              "Lisez bien le texte de chaque carte — les mots-cles sont importants.",
              "Ne negligez pas les champs de bataille, ils sont cruciaux.",
              "Participez a des tournois locaux pour progresser rapidement.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-gold">&#x2022;</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create deckbuilding guide page**

`src/app/guides/deckbuilding/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide de deckbuilding",
  description: "Comment construire un deck Riftbound equilibre : choix de legende, courbe d'energie, synergies.",
};

export default function GuideDeckbuildingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Guide de deckbuilding</h1>
      <p className="mt-2 text-lg text-ink-secondary">
        Construisez des decks solides en suivant ces principes fondamentaux.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">1. Choisir sa legende</h2>
          <p className="mt-3 text-ink-secondary leading-relaxed">
            Votre legende determine les domaines accessibles et la strategie de base de votre deck.
            Choisissez une legende dont le style de jeu vous plait, puis construisez autour de ses forces.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">2. La courbe d&apos;energie</h2>
          <p className="mt-3 text-ink-secondary leading-relaxed">
            Un bon deck a une courbe d&apos;energie equilibree. Vous voulez pouvoir jouer des cartes a chaque tour,
            pas attendre le tour 6 pour poser votre premiere unite. Visez une majorite de cartes entre 2 et 5
            d&apos;energie, avec quelques cartes puissantes en haut de courbe.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">3. Synergies</h2>
          <p className="mt-3 text-ink-secondary leading-relaxed">
            Les meilleures cartes seules ne font pas un bon deck. Cherchez des synergies entre vos cartes :
            des mots-cles partages, des effets qui se combinent, des tags qui s&apos;activent mutuellement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl font-semibold text-arcane">4. Ratio recommande</h2>
          <div className="mt-4 space-y-2">
            {[
              { label: "Unites", value: "20-25 cartes", desc: "Le coeur de votre deck." },
              { label: "Sorts", value: "8-12 cartes", desc: "Removal, pioche, buff." },
              { label: "Equipements", value: "3-6 cartes", desc: "Renforcez vos unites cles." },
              { label: "Runes", value: "4-6 cartes", desc: "Selon votre strategie." },
              { label: "Champs de bataille", value: "3-4 cartes", desc: "Controle du terrain." },
            ].map((ratio) => (
              <div key={ratio.label} className="flex items-center gap-4 rounded-lg border border-hairline bg-surface p-3">
                <div className="min-w-[120px] font-display font-semibold">{ratio.label}</div>
                <div className="text-sm text-arcane">{ratio.value}</div>
                <div className="text-sm text-ink-muted">{ratio.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create glossary page**

`src/app/guides/glossaire/page.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossaire",
  description: "Tous les termes du TCG Riftbound expliques en francais.",
};

const terms = [
  { term: "Ambush", definition: "Mot-cle. L'unite peut etre deployee directement sur un champ de bataille au lieu de la base." },
  { term: "Base", definition: "Zone ou vos unites arrivent avant d'etre deployees sur un champ de bataille." },
  { term: "Buff", definition: "Donner +1 Might a une unite de façon permanente." },
  { term: "Champ de bataille (Battlefield)", definition: "Zone de combat partagee entre les deux joueurs. Scorer des champs de bataille est la condition de victoire." },
  { term: "Channel", definition: "Activer des runes depuis votre deck de runes." },
  { term: "Combat", definition: "Affrontement entre unites sur un meme champ de bataille." },
  { term: "Conquer", definition: "Prendre le controle d'un champ de bataille adverse." },
  { term: "Deathknell", definition: "Effet qui se declenche quand l'unite meurt." },
  { term: "Domaine (Domain)", definition: "La couleur/faction d'une carte : Fury, Sorcery, Order, Calm, Mind, Body, Chaos." },
  { term: "Energy", definition: "Ressource pour jouer des cartes. Augmente chaque tour." },
  { term: "Exhaust", definition: "Tourner une carte pour indiquer qu'elle a ete utilisee ce tour." },
  { term: "Hold", definition: "Maintenir le controle d'un champ de bataille a la fin du tour." },
  { term: "Legende (Legend)", definition: "Carte de champion qui definit votre deck. Pas jouee sur le terrain, elle fournit un pouvoir passif ou activable." },
  { term: "Might", definition: "Puissance d'attaque/defense d'une unite." },
  { term: "Mulligan", definition: "Au debut de la partie, possibilite de remettre des cartes et d'en piocher de nouvelles." },
  { term: "Power", definition: "Cout en Power pour jouer certaines cartes, paye par les runes channeled." },
  { term: "Recycle", definition: "Remettre une carte sous votre deck." },
  { term: "Removal", definition: "Terme generique pour les cartes qui detruisent ou retirent des unites adverses." },
  { term: "Rune", definition: "Type de carte special qui se channel depuis un deck de runes separe." },
  { term: "Showdown", definition: "Phase de combat entre unites sur un champ de bataille." },
  { term: "Temporary", definition: "Mot-cle. L'unite est detruite a la fin du tour." },
  { term: "XP", definition: "Points d'experience accumules par certaines legendes pour debloquer des capacites." },
];

export default function GlossairePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Glossaire</h1>
      <p className="mt-2 text-ink-secondary">
        Tous les termes importants du TCG Riftbound expliques en francais.
      </p>

      <div className="mt-8 space-y-2">
        {terms.map((item) => (
          <div key={item.term} className="rounded-lg border border-hairline bg-surface p-4">
            <dt className="font-display font-semibold text-arcane">{item.term}</dt>
            <dd className="mt-1 text-sm text-ink-secondary">{item.definition}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/guides/
git commit -m "feat: add guide pages (beginner, deckbuilding, glossary)"
```

---

## Task 12: Tournament Pages

**Files:**
- Create: `src/app/tournois/page.tsx`
- Create: `src/app/tournois/[slug]/page.tsx`

- [ ] **Step 1: Create tournament list page**

`src/app/tournois/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournois",
  description: "Resultats de tournois et calendrier des evenements Riftbound en France.",
};

export default async function TournoisPage() {
  const [tournaments, events] = await Promise.all([
    prisma.tournament.findMany({
      orderBy: { date: "desc" },
      include: { _count: { select: { results: true } } },
    }),
    prisma.event.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 10,
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Tournois</h1>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-2xl font-semibold">Evenements a venir</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-card border border-hairline bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-violet">
                  {event.type}
                </div>
                <h3 className="mt-1 font-display font-semibold">{event.title}</h3>
                <div className="mt-2 space-y-1 text-sm text-ink-secondary">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDate(event.date)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {event.location}
                    </div>
                  )}
                </div>
                {event.url && (
                  <a href={event.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-arcane hover:underline">
                    Voir les details
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Tournaments */}
      <div className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Resultats de tournois</h2>
        <p className="mt-1 text-sm text-ink-muted">{tournaments.length} tournoi{tournaments.length !== 1 ? "s" : ""}</p>

        {tournaments.length === 0 ? (
          <p className="mt-8 text-center text-ink-muted">Aucun tournoi enregistre pour le moment.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {tournaments.map((t) => (
              <Link
                key={t.id}
                href={`/tournois/${t.slug}`}
                className="flex items-center justify-between rounded-lg border border-hairline bg-surface p-4 transition-colors hover:border-hairline-accent"
              >
                <div>
                  <div className="font-display font-semibold">{t.name}</div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-ink-secondary">
                    <span>{formatDate(t.date)}</span>
                    {t.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {t.location}
                      </span>
                    )}
                    {t.format && <span>{t.format}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  {t.playerCount && (
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {t.playerCount}
                    </span>
                  )}
                  <span>{t._count.results} resultats</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create tournament detail page**

`src/app/tournois/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { CardImage } from "@/components/card-image";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = await prisma.tournament.findUnique({ where: { slug } });
  if (!t) return { title: "Tournoi introuvable" };
  return {
    title: t.name,
    description: `Resultats du tournoi ${t.name} — ${formatDate(t.date)}`,
  };
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    include: {
      results: { orderBy: { placement: "asc" } },
    },
  });

  if (!tournament) notFound();

  const legendNames = [...new Set(tournament.results.map((r) => r.legendName))];
  const legendCards = await prisma.card.findMany({
    where: {
      type: "Legend",
      name: { in: legendNames },
      alternateArt: false,
      overnumbered: false,
      signature: false,
    },
  });
  const legendMap = new Map(legendCards.map((c) => [c.name, c]));

  const top8 = tournament.results.filter((r) => r.placement <= 8);
  const allResults = tournament.results;

  const breakdown = allResults.reduce(
    (acc, r) => {
      acc[r.legendName] = (acc[r.legendName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const breakdownSorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/tournois" className="text-sm text-ink-muted hover:text-arcane">
        &larr; Retour aux tournois
      </Link>

      <div className="mt-6">
        <h1 className="font-display text-4xl font-bold">{tournament.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-secondary">
          <span>{formatDate(tournament.date)}</span>
          {tournament.location && <span>{tournament.location}</span>}
          {tournament.format && <span>{tournament.format}</span>}
          {tournament.playerCount && <span>{tournament.playerCount} joueurs</span>}
        </div>
      </div>

      {/* Top 8 */}
      {top8.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Top 8</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {top8.map((r) => {
              const card = legendMap.get(r.legendName);
              const isWinner = r.placement === 1;
              return (
                <div
                  key={r.id}
                  className={`rounded-card border p-4 ${isWinner ? "border-gold/50 bg-gold/5 glow-gold" : "border-hairline bg-surface"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-display text-2xl font-bold ${isWinner ? "text-gold" : "text-ink-muted"}`}>
                      #{r.placement}
                    </span>
                    {card?.imageUrl && (
                      <CardImage src={card.imageUrl} alt={r.legendName} size="sm" className="h-12 w-9 object-cover" />
                    )}
                  </div>
                  <div className="mt-2 font-medium">{r.playerName}</div>
                  <div className="text-sm text-arcane">{r.legendName}</div>
                  {r.deckId && (
                    <Link href={`/decks/${r.deckId}`} className="mt-1 text-xs text-arcane hover:underline">
                      Voir le deck
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meta Breakdown */}
      {breakdownSorted.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Repartition du metagame</h2>
          <div className="mt-4 space-y-2">
            {breakdownSorted.map(([legend, count]) => {
              const pct = ((count / allResults.length) * 100).toFixed(1);
              return (
                <div key={legend} className="flex items-center gap-4 rounded-lg border border-hairline bg-surface p-3">
                  <div className="flex-1 font-medium">{legend}</div>
                  <div className="text-sm text-ink-secondary">{count} joueur{count > 1 ? "s" : ""}</div>
                  <div className="w-16 text-right text-sm font-semibold text-arcane">{pct}%</div>
                  <div className="w-24">
                    <div className="h-2 rounded-full bg-surface-raised">
                      <div className="h-2 rounded-full bg-arcane" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Description */}
      {tournament.description && (
        <div className="mt-10">
          <h2 className="font-display text-2xl font-semibold">Recap</h2>
          <div className="mt-4 text-ink-secondary leading-relaxed whitespace-pre-line">
            {tournament.description}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/tournois/
git commit -m "feat: add tournament list page and tournament detail with top 8 and meta breakdown"
```

---

## Task 13: Articles/News Pages

**Files:**
- Create: `src/app/actualites/page.tsx`
- Create: `src/app/actualites/[slug]/page.tsx`

- [ ] **Step 1: Create articles list page**

`src/app/actualites/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Actualites",
  description: "News, analyses et articles sur le TCG Riftbound.",
};

export default async function ActualitesPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-4xl font-bold">Actualites</h1>

      {articles.length === 0 ? (
        <p className="mt-12 text-center text-ink-muted">Aucun article publie pour le moment.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/actualites/${article.slug}`}
              className="card-hover rounded-card border border-hairline bg-surface overflow-hidden"
            >
              {article.coverImage && (
                <div className="aspect-video bg-surface-raised">
                  <img src={article.coverImage} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-violet">
                    {article.category}
                  </span>
                  {article.publishedAt && (
                    <span className="text-xs text-ink-muted">{formatDate(article.publishedAt)}</span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-lg font-semibold">{article.title}</h2>
                {article.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm text-ink-secondary">{article.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create article detail page**

`src/app/actualites/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.title,
    description: article.excerpt || `${article.title} — Riftbound.fr`,
    openGraph: article.coverImage ? { images: [article.coverImage] } : undefined,
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.published) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/actualites" className="text-sm text-ink-muted hover:text-arcane">
        &larr; Retour aux actualites
      </Link>

      <article className="mt-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-violet">
            {article.category}
          </span>
          {article.publishedAt && (
            <span className="text-xs text-ink-muted">{formatDate(article.publishedAt)}</span>
          )}
        </div>

        <h1 className="mt-4 font-display text-4xl font-bold leading-tight">{article.title}</h1>

        {article.coverImage && (
          <div className="mt-6 overflow-hidden rounded-card">
            <img src={article.coverImage} alt="" className="w-full object-cover" />
          </div>
        )}

        <div className="mt-8">
          <MarkdownRenderer content={article.content} />
        </div>

        {article.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-surface-raised px-3 py-1 text-xs text-ink-secondary">
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/actualites/
git commit -m "feat: add articles list page and article detail with markdown rendering"
```

---

## Task 14: Admin Authentication

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/route.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/admin/layout.tsx`

- [ ] **Step 1: Create auth helpers**

`src/lib/auth.ts`:

```ts
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "riftbound_admin";
const SESSION_VALUE = "authenticated";

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) {
    redirect("/admin/login");
  }
}

export function checkPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD;
}

export { SESSION_COOKIE, SESSION_VALUE };
```

- [ ] **Step 2: Create auth API route**

`src/app/api/auth/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { checkPassword, SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
```

- [ ] **Step 3: Create login page**

`src/app/admin/login/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Mot de passe incorrect");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-feature border border-hairline bg-surface p-8">
        <h1 className="text-center font-display text-2xl font-bold">
          <span className="text-arcane">Admin</span> Riftbound.fr
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-ink-secondary">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 text-ink focus:border-arcane focus:outline-none focus:ring-2 focus:ring-arcane-glow"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-full bg-arcane font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create admin layout**

`src/app/admin/layout.tsx`:

```tsx
import { verifyAdmin } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, FileText, Layers, Trophy, Swords, Calendar, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/articles", icon: FileText, label: "Articles" },
  { href: "/admin/decks", icon: Layers, label: "Decks" },
  { href: "/admin/tier-list", icon: Swords, label: "Tier List" },
  { href: "/admin/tournois", icon: Trophy, label: "Tournois" },
  { href: "/admin/events", icon: Calendar, label: "Evenements" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 flex-col border-r border-hairline bg-surface p-4 md:flex">
        <Link href="/admin" className="font-display text-lg font-bold">
          <span className="text-arcane">Admin</span>
        </Link>
        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink"
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-hairline pt-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted hover:text-ink">
            <LogOut size={16} />
            Retour au site
          </Link>
        </div>
      </aside>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/app/admin/login/ src/app/admin/layout.tsx
git commit -m "feat: add admin authentication with password login, session cookie, and admin layout"
```

---

## Task 15: Admin Dashboard & Card Sync

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/api/sync-cards/route.ts`

- [ ] **Step 1: Create sync API route**

`src/app/api/sync-cards/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAllCards, fetchSets } from "@/lib/riftcodex";

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  if (session?.value !== SESSION_VALUE) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [apiCards, apiSets] = await Promise.all([fetchAllCards(), fetchSets()]);

    for (const s of apiSets) {
      await prisma.cardSet.upsert({
        where: { setId: s.set_id },
        update: { name: s.name, cardCount: s.card_count },
        create: {
          id: s.id,
          name: s.name,
          setId: s.set_id,
          cardCount: s.card_count,
          publishedOn: s.published_on ? new Date(s.published_on) : null,
        },
      });
    }

    for (const c of apiCards) {
      await prisma.card.upsert({
        where: { id: c.id },
        update: {
          name: c.name,
          cleanName: c.metadata.clean_name,
          collectorNumber: c.collector_number,
          set: c.set.set_id,
          setName: c.set.label,
          type: c.classification.type,
          supertype: c.classification.supertype,
          rarity: c.classification.rarity,
          domains: c.classification.domain,
          energy: c.attributes.energy,
          might: c.attributes.might,
          power: c.attributes.power,
          textRich: c.text.rich,
          textPlain: c.text.plain,
          flavorText: c.text.flavour,
          imageUrl: c.media.image_url,
          artist: c.media.artist,
          tags: c.tags,
          alternateArt: c.metadata.alternate_art,
          overnumbered: c.metadata.overnumbered,
          signature: c.metadata.signature,
        },
        create: {
          id: c.id,
          riftboundId: c.riftbound_id,
          name: c.name,
          cleanName: c.metadata.clean_name,
          collectorNumber: c.collector_number,
          set: c.set.set_id,
          setName: c.set.label,
          type: c.classification.type,
          supertype: c.classification.supertype,
          rarity: c.classification.rarity,
          domains: c.classification.domain,
          energy: c.attributes.energy,
          might: c.attributes.might,
          power: c.attributes.power,
          textRich: c.text.rich,
          textPlain: c.text.plain,
          flavorText: c.text.flavour,
          imageUrl: c.media.image_url,
          artist: c.media.artist,
          tags: c.tags,
          alternateArt: c.metadata.alternate_art,
          overnumbered: c.metadata.overnumbered,
          signature: c.metadata.signature,
        },
      });
    }

    return NextResponse.json({ synced: apiCards.length, sets: apiSets.length });
  } catch (error) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create admin dashboard**

`src/app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { FileText, Layers, Swords, Trophy, Calendar, Database } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [cardCount, articleCount, deckCount, tierListCount, tournamentCount, eventCount] =
    await Promise.all([
      prisma.card.count(),
      prisma.article.count(),
      prisma.deck.count(),
      prisma.tierList.count(),
      prisma.tournament.count(),
      prisma.event.count(),
    ]);

  const stats = [
    { icon: Database, label: "Cartes", count: cardCount, href: "/cartes" },
    { icon: FileText, label: "Articles", count: articleCount, href: "/admin/articles" },
    { icon: Layers, label: "Decks", count: deckCount, href: "/admin/decks" },
    { icon: Swords, label: "Tier Lists", count: tierListCount, href: "/admin/tier-list" },
    { icon: Trophy, label: "Tournois", count: tournamentCount, href: "/admin/tournois" },
    { icon: Calendar, label: "Evenements", count: eventCount, href: "/admin/events" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-hover rounded-card border border-hairline bg-surface p-5"
          >
            <stat.icon className="text-arcane" size={24} />
            <div className="mt-3 font-display text-3xl font-bold">{stat.count}</div>
            <div className="text-sm text-ink-secondary">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <SyncButton />
          <Link
            href="/admin/articles/new"
            className="rounded-full bg-violet/20 px-4 py-2 text-sm font-semibold text-violet hover:bg-violet/30"
          >
            Nouvel article
          </Link>
          <Link
            href="/admin/decks/new"
            className="rounded-full bg-arcane/20 px-4 py-2 text-sm font-semibold text-arcane hover:bg-arcane/30"
          >
            Nouveau deck
          </Link>
        </div>
      </div>
    </div>
  );
}

function SyncButton() {
  return (
    <form
      action={async () => {
        "use server";
        // This is just a trigger — the actual sync goes through the API
      }}
    >
      <SyncButtonClient />
    </form>
  );
}

function SyncButtonClient() {
  return <SyncButtonInner />;
}

// This needs to be a client component for the fetch call
import { SyncButtonInner } from "./sync-button";
```

Wait — we need a separate client component for the sync button. Let me include it.

Create `src/app/admin/sync-button.tsx`:

```tsx
"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function SyncButtonInner() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    const res = await fetch("/api/sync-cards", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setResult(`${data.synced} cartes, ${data.sets} sets synchronises`);
    } else {
      setResult("Erreur de synchronisation");
    }
    setSyncing(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 rounded-full bg-gold/20 px-4 py-2 text-sm font-semibold text-gold hover:bg-gold/30 disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
        {syncing ? "Synchronisation..." : "Synchroniser les cartes"}
      </button>
      {result && <span className="text-sm text-ink-secondary">{result}</span>}
    </div>
  );
}
```

Now fix `src/app/admin/page.tsx` to properly import (replace the broken version above):

```tsx
import { prisma } from "@/lib/prisma";
import { FileText, Layers, Swords, Trophy, Calendar, Database } from "lucide-react";
import Link from "next/link";
import { SyncButtonInner } from "./sync-button";

export default async function AdminDashboardPage() {
  const [cardCount, articleCount, deckCount, tierListCount, tournamentCount, eventCount] =
    await Promise.all([
      prisma.card.count(),
      prisma.article.count(),
      prisma.deck.count(),
      prisma.tierList.count(),
      prisma.tournament.count(),
      prisma.event.count(),
    ]);

  const stats = [
    { icon: Database, label: "Cartes", count: cardCount, href: "/cartes" },
    { icon: FileText, label: "Articles", count: articleCount, href: "/admin/articles" },
    { icon: Layers, label: "Decks", count: deckCount, href: "/admin/decks" },
    { icon: Swords, label: "Tier Lists", count: tierListCount, href: "/admin/tier-list" },
    { icon: Trophy, label: "Tournois", count: tournamentCount, href: "/admin/tournois" },
    { icon: Calendar, label: "Evenements", count: eventCount, href: "/admin/events" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card-hover rounded-card border border-hairline bg-surface p-5"
          >
            <stat.icon className="text-arcane" size={24} />
            <div className="mt-3 font-display text-3xl font-bold">{stat.count}</div>
            <div className="text-sm text-ink-secondary">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold">Actions rapides</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <SyncButtonInner />
          <Link
            href="/admin/articles/new"
            className="rounded-full bg-violet/20 px-4 py-2 text-sm font-semibold text-violet hover:bg-violet/30"
          >
            Nouvel article
          </Link>
          <Link
            href="/admin/decks/new"
            className="rounded-full bg-arcane/20 px-4 py-2 text-sm font-semibold text-arcane hover:bg-arcane/30"
          >
            Nouveau deck
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/page.tsx src/app/admin/sync-button.tsx src/app/api/sync-cards/
git commit -m "feat: add admin dashboard with stats and card sync trigger"
```

---

## Task 16: Admin CRUD — Articles

**Files:**
- Create: `src/app/api/admin/articles/route.ts`
- Create: `src/app/api/admin/articles/[id]/route.ts`
- Create: `src/app/admin/articles/page.tsx`
- Create: `src/app/admin/articles/new/page.tsx`
- Create: `src/app/admin/articles/[id]/page.tsx`
- Create: `src/components/admin/article-form.tsx`

- [ ] **Step 1: Create articles API routes**

`src/app/api/admin/articles/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const slug = slugify(body.title);

  const article = await prisma.article.create({
    data: {
      slug,
      title: body.title,
      excerpt: body.excerpt || null,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      coverImage: body.coverImage || null,
      published: body.published ?? false,
      publishedAt: body.published ? new Date() : null,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
```

`src/app/api/admin/articles/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const article = await prisma.article.update({
    where: { id },
    data: {
      title: body.title,
      excerpt: body.excerpt || null,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      coverImage: body.coverImage || null,
      published: body.published ?? false,
      publishedAt: body.published ? (body.publishedAt ?? new Date()) : null,
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create article form component**

`src/components/admin/article-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ArticleFormProps {
  initial?: {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    category: string;
    tags: string[];
    coverImage: string | null;
    published: boolean;
  };
}

export function ArticleForm({ initial }: ArticleFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "actualite");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      excerpt: excerpt || null,
      content,
      category,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage || null,
      published,
    };

    const url = initial ? `/api/admin/articles/${initial.id}` : "/api/admin/articles";
    const method = initial ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
    setSaving(false);
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 text-ink focus:border-arcane focus:outline-none focus:ring-2 focus:ring-arcane-glow";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-ink-secondary">Titre</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} required />
      </div>
      <div>
        <label className="text-sm text-ink-secondary">Extrait</label>
        <input type="text" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-ink-secondary">Categorie</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
          <option value="actualite">Actualite</option>
          <option value="guide">Guide</option>
          <option value="tournoi">Tournoi</option>
          <option value="meta">Meta</option>
        </select>
      </div>
      <div>
        <label className="text-sm text-ink-secondary">Tags (separes par des virgules)</label>
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-ink-secondary">Image de couverture (URL)</label>
        <input type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="text-sm text-ink-secondary">Contenu (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={20}
          className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 font-mono text-sm text-ink focus:border-arcane focus:outline-none focus:ring-2 focus:ring-arcane-glow"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          id="published"
          className="h-4 w-4 rounded border-hairline-strong bg-surface-raised text-arcane focus:ring-arcane"
        />
        <label htmlFor="published" className="text-sm text-ink-secondary">Publier</label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-arcane px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : initial ? "Mettre a jour" : "Creer"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create admin articles pages**

`src/app/admin/articles/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-full bg-arcane px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> Nouveau
        </Link>
      </div>
      <div className="mt-6 space-y-2">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/admin/articles/${a.id}`}
            className="flex items-center justify-between rounded-lg border border-hairline bg-surface p-4 hover:border-hairline-accent"
          >
            <div>
              <div className="font-medium">{a.title}</div>
              <div className="text-sm text-ink-muted">{a.category} &middot; {formatDate(a.createdAt)}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${a.published ? "bg-green-500/20 text-green-400" : "bg-ink-muted/20 text-ink-muted"}`}>
              {a.published ? "Publie" : "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

`src/app/admin/articles/new/page.tsx`:

```tsx
import { ArticleForm } from "@/components/admin/article-form";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Nouvel article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}
```

`src/app/admin/articles/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleForm } from "@/components/admin/article-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Modifier l&apos;article</h1>
      <div className="mt-6">
        <ArticleForm initial={article} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/articles/ src/app/admin/articles/ src/components/admin/article-form.tsx
git commit -m "feat: add admin CRUD for articles with markdown editor"
```

---

## Task 17: Admin CRUD — Decks, Tier List, Tournaments, Events

This task follows the same CRUD pattern as Task 16. Due to the repetitive nature, I'll provide the key files for each entity. Each follows the same pattern: API routes (POST, PUT, DELETE), form component, list/new/edit pages.

**Files:**
- Create: API routes for decks, tier-list, tournois, events
- Create: Admin pages for each entity
- Create: Form components for each entity

- [ ] **Step 1: Create deck admin API routes**

`src/app/api/admin/decks/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = slugify(body.title);

  const deck = await prisma.deck.create({
    data: {
      slug,
      title: body.title,
      legendId: body.legendId,
      legendName: body.legendName,
      description: body.description || null,
      guide: body.guide || null,
      format: body.format || "constructed",
      tags: body.tags || [],
      authorName: body.authorName || null,
      sourceUrl: body.sourceUrl || null,
      featured: body.featured ?? false,
      published: body.published ?? false,
      cards: {
        create: (body.cards || []).map((c: { cardId: string; quantity: number; section: string }) => ({
          cardId: c.cardId,
          quantity: c.quantity,
          section: c.section,
        })),
      },
    },
  });

  return NextResponse.json(deck, { status: 201 });
}
```

`src/app/api/admin/decks/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  await prisma.deckCard.deleteMany({ where: { deckId: id } });

  const deck = await prisma.deck.update({
    where: { id },
    data: {
      title: body.title,
      legendId: body.legendId,
      legendName: body.legendName,
      description: body.description || null,
      guide: body.guide || null,
      format: body.format || "constructed",
      tags: body.tags || [],
      authorName: body.authorName || null,
      sourceUrl: body.sourceUrl || null,
      featured: body.featured ?? false,
      published: body.published ?? false,
      cards: {
        create: (body.cards || []).map((c: { cardId: string; quantity: number; section: string }) => ({
          cardId: c.cardId,
          quantity: c.quantity,
          section: c.section,
        })),
      },
    },
  });

  return NextResponse.json(deck);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create deck admin pages**

`src/app/admin/decks/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";

export default async function AdminDecksPage() {
  const decks = await prisma.deck.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Decks</h1>
        <Link href="/admin/decks/new" className="flex items-center gap-2 rounded-full bg-arcane px-4 py-2 text-sm font-semibold text-white">
          <Plus size={16} /> Nouveau
        </Link>
      </div>
      <div className="mt-6 space-y-2">
        {decks.map((d) => (
          <Link key={d.id} href={`/admin/decks/${d.id}`} className="flex items-center justify-between rounded-lg border border-hairline bg-surface p-4 hover:border-hairline-accent">
            <div>
              <div className="font-medium">{d.title}</div>
              <div className="text-sm text-ink-muted">{d.legendName} &middot; {d.format}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs ${d.published ? "bg-green-500/20 text-green-400" : "bg-ink-muted/20 text-ink-muted"}`}>
              {d.published ? "Publie" : "Brouillon"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

`src/app/admin/decks/new/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDeckPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [legendId, setLegendId] = useState("");
  const [legendName, setLegendName] = useState("");
  const [description, setDescription] = useState("");
  const [guide, setGuide] = useState("");
  const [format, setFormat] = useState("constructed");
  const [tags, setTags] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, legendId, legendName, description, guide, format,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        authorName, sourceUrl, featured, published, cards: [],
      }),
    });
    if (res.ok) { router.push("/admin/decks"); router.refresh(); }
    setSaving(false);
  }

  const inputClass = "h-11 w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 text-ink focus:border-arcane focus:outline-none focus:ring-2 focus:ring-arcane-glow";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Nouveau deck</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div><label className="text-sm text-ink-secondary">Titre</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="text-sm text-ink-secondary">ID Legende (riftbound_id)</label><input type="text" value={legendId} onChange={e => setLegendId(e.target.value)} className={inputClass} required /></div>
          <div><label className="text-sm text-ink-secondary">Nom Legende</label><input type="text" value={legendName} onChange={e => setLegendName(e.target.value)} className={inputClass} required /></div>
        </div>
        <div><label className="text-sm text-ink-secondary">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm text-ink focus:border-arcane focus:outline-none" /></div>
        <div><label className="text-sm text-ink-secondary">Guide (Markdown)</label><textarea value={guide} onChange={e => setGuide(e.target.value)} rows={10} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 font-mono text-sm text-ink focus:border-arcane focus:outline-none" /></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><label className="text-sm text-ink-secondary">Format</label><select value={format} onChange={e => setFormat(e.target.value)} className={inputClass}><option value="constructed">Constructed</option><option value="sealed">Sealed</option><option value="draft">Draft</option></select></div>
          <div><label className="text-sm text-ink-secondary">Tags (virgules)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} className={inputClass} /></div>
          <div><label className="text-sm text-ink-secondary">Auteur</label><input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} className={inputClass} /></div>
        </div>
        <div><label className="text-sm text-ink-secondary">URL source</label><input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className={inputClass} /></div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-ink-secondary"><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Featured</label>
          <label className="flex items-center gap-2 text-sm text-ink-secondary"><input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} /> Publie</label>
        </div>
        <button type="submit" disabled={saving} className="rounded-full bg-arcane px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">
          {saving ? "Enregistrement..." : "Creer le deck"}
        </button>
      </form>
    </div>
  );
}
```

`src/app/admin/decks/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface PageProps { params: Promise<{ id: string }>; }

export default async function EditDeckPage({ params }: PageProps) {
  const { id } = await params;
  const deck = await prisma.deck.findUnique({ where: { id }, include: { cards: { include: { card: true } } } });
  if (!deck) notFound();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Modifier : {deck.title}</h1>
      <p className="mt-2 text-ink-muted">Edition du deck — l&apos;editeur complet de cartes sera ajoute dans une prochaine version.</p>
      <pre className="mt-4 rounded-lg bg-surface-raised p-4 text-xs text-ink-secondary overflow-auto">
        {JSON.stringify(deck, null, 2)}
      </pre>
    </div>
  );
}
```

- [ ] **Step 3: Create tier list admin page**

`src/app/api/admin/tier-list/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.current) {
    await prisma.tierList.updateMany({ where: { current: true }, data: { current: false } });
  }

  const tierList = await prisma.tierList.create({
    data: {
      title: body.title,
      description: body.description || null,
      format: body.format || "constructed",
      setContext: body.setContext || null,
      published: body.published ?? false,
      current: body.current ?? false,
      entries: {
        create: (body.entries || []).map((e: { legendId: string; legendName: string; tier: string; position: number; comment?: string; deckId?: string }) => ({
          legendId: e.legendId,
          legendName: e.legendName,
          tier: e.tier,
          position: e.position,
          comment: e.comment || null,
          deckId: e.deckId || null,
        })),
      },
    },
  });

  return NextResponse.json(tierList, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.current) {
    await prisma.tierList.updateMany({ where: { current: true }, data: { current: false } });
  }

  await prisma.tierListEntry.deleteMany({ where: { tierListId: body.id } });

  const tierList = await prisma.tierList.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description || null,
      format: body.format || "constructed",
      setContext: body.setContext || null,
      published: body.published ?? false,
      current: body.current ?? false,
      entries: {
        create: (body.entries || []).map((e: { legendId: string; legendName: string; tier: string; position: number; comment?: string; deckId?: string }) => ({
          legendId: e.legendId,
          legendName: e.legendName,
          tier: e.tier,
          position: e.position,
          comment: e.comment || null,
          deckId: e.deckId || null,
        })),
      },
    },
  });

  return NextResponse.json(tierList);
}
```

`src/app/admin/tier-list/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminTierListPage() {
  const tierLists = await prisma.tierList.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Tier Lists</h1>
      <p className="mt-2 text-ink-secondary">
        Gerez vos tier lists editoriales. Utilisez l&apos;API pour creer et modifier les tier lists.
      </p>
      <div className="mt-6 space-y-2">
        {tierLists.map((tl) => (
          <div key={tl.id} className="rounded-lg border border-hairline bg-surface p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{tl.title}</div>
                <div className="text-sm text-ink-muted">
                  {tl._count.entries} entries &middot; {formatDate(tl.updatedAt)}
                  {tl.setContext && ` &middot; ${tl.setContext}`}
                </div>
              </div>
              <div className="flex gap-2">
                {tl.current && <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">Active</span>}
                <span className={`rounded-full px-2 py-0.5 text-xs ${tl.published ? "bg-green-500/20 text-green-400" : "bg-ink-muted/20 text-ink-muted"}`}>
                  {tl.published ? "Publiee" : "Brouillon"}
                </span>
              </div>
            </div>
          </div>
        ))}
        {tierLists.length === 0 && (
          <p className="text-center text-ink-muted py-8">Aucune tier list. Utilisez l&apos;API POST /api/admin/tier-list pour en creer une.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create tournament & event admin API routes and pages**

`src/app/api/admin/tournois/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = slugify(body.name);

  const tournament = await prisma.tournament.create({
    data: {
      slug,
      name: body.name,
      date: new Date(body.date),
      location: body.location || null,
      format: body.format || null,
      playerCount: body.playerCount || null,
      organizer: body.organizer || null,
      description: body.description || null,
      sourceUrl: body.sourceUrl || null,
      results: {
        create: (body.results || []).map((r: { playerName: string; placement: number; legendName: string; deckId?: string }) => ({
          playerName: r.playerName,
          placement: r.placement,
          legendName: r.legendName,
          deckId: r.deckId || null,
        })),
      },
    },
  });

  return NextResponse.json(tournament, { status: 201 });
}
```

`src/app/api/admin/tournois/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.tournament.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

`src/app/api/admin/events/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function POST(req: NextRequest) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const event = await prisma.event.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location || null,
      type: body.type,
      description: body.description || null,
      url: body.url || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
```

`src/app/api/admin/events/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function authorize() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

`src/app/admin/tournois/page.tsx`:

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminTournoisPage() {
  const tournaments = await prisma.tournament.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Tournois</h1>
      <p className="mt-2 text-ink-secondary">Utilisez l&apos;API POST /api/admin/tournois pour ajouter un tournoi.</p>
      <div className="mt-6 space-y-2">
        {tournaments.map((t) => (
          <div key={t.id} className="rounded-lg border border-hairline bg-surface p-4">
            <div className="font-medium">{t.name}</div>
            <div className="text-sm text-ink-muted">{formatDate(t.date)} {t.location && `&middot; ${t.location}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

`src/app/admin/events/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({ orderBy: { date: "asc" } });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Evenements</h1>
      <p className="mt-2 text-ink-secondary">Utilisez l&apos;API POST /api/admin/events pour ajouter un evenement.</p>
      <div className="mt-6 space-y-2">
        {events.map((e) => (
          <div key={e.id} className="rounded-lg border border-hairline bg-surface p-4">
            <div className="font-medium">{e.title}</div>
            <div className="text-sm text-ink-muted">{e.type} &middot; {formatDate(e.date)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/ src/app/admin/decks/ src/app/admin/tier-list/ src/app/admin/tournois/ src/app/admin/events/
git commit -m "feat: add admin CRUD for decks, tier lists, tournaments, and events"
```

---

## Task 18: SEO — Sitemap, robots.txt, Metadata

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create sitemap**

`src/app/sitemap.ts`:

```ts
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftbound.fr";

  const cards = await prisma.card.findMany({ select: { riftboundId: true, updatedAt: true } });
  const decks = await prisma.deck.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const articles = await prisma.article.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
  const tournaments = await prisma.tournament.findMany({ select: { slug: true } });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/cartes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/tier-list`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/decks`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/tournois`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/guides`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guides/debuter`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/guides/deckbuilding`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/guides/glossaire`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/actualites`, changeFrequency: "daily", priority: 0.7 },
    ...cards.map((c) => ({
      url: `${baseUrl}/cartes/${c.riftboundId}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...decks.map((d) => ({
      url: `${baseUrl}/decks/${d.slug}`,
      lastModified: d.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: `${baseUrl}/actualites/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...tournaments.map((t) => ({
      url: `${baseUrl}/tournois/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
```

- [ ] **Step 2: Create robots.txt**

`src/app/robots.ts`:

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftbound.fr";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add dynamic sitemap and robots.txt for SEO"
```

---

## Task 19: Deck Export PNG

**Files:**
- Create: `src/components/deck-export-template.tsx`
- Modify: `src/app/decks/[slug]/page.tsx` (add export button)

- [ ] **Step 1: Create DeckExportTemplate component**

`src/components/deck-export-template.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { Card, DeckCard } from "@prisma/client";

type DeckCardWithCard = DeckCard & { card: Card };

interface DeckExportProps {
  title: string;
  legendName: string;
  authorName: string | null;
  cards: DeckCardWithCard[];
}

const sectionOrder = ["main", "rune", "battlefield", "side"];
const sectionLabels: Record<string, string> = {
  main: "Main Deck",
  rune: "Runes",
  battlefield: "Battlefields",
  side: "Side",
};

export function DeckExportButton({ title, legendName, authorName, cards }: DeckExportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (!ref.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(ref.current, {
        backgroundColor: "#06060b",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  }

  const grouped = cards.reduce(
    (acc, dc) => {
      const s = dc.section || "main";
      if (!acc[s]) acc[s] = [];
      acc[s].push(dc);
      return acc;
    },
    {} as Record<string, DeckCardWithCard[]>
  );

  return (
    <>
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-[#1a1a2e] hover:brightness-110 disabled:opacity-50"
      >
        {exporting ? "Export en cours..." : "Exporter en image"}
      </button>

      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={ref} style={{ width: 1200, padding: 40, background: "#06060b", fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#f1f5f9" }}>{title}</div>
              <div style={{ fontSize: 18, color: "#0ea5e9", marginTop: 4 }}>{legendName}</div>
              {authorName && <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>par {authorName}</div>}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#94a3b8" }}>
              <span style={{ color: "#0ea5e9" }}>Rift</span>bound<span style={{ color: "#f59e0b" }}>.fr</span>
            </div>
          </div>

          {sectionOrder.map((section) => {
            const sectionCards = grouped[section];
            if (!sectionCards || sectionCards.length === 0) return null;
            return (
              <div key={section} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  {sectionLabels[section] || section}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {sectionCards.map((dc) => (
                    <div key={dc.id} style={{ position: "relative" }}>
                      {dc.card.imageUrl && (
                        <img src={dc.card.imageUrl} alt={dc.card.name} style={{ width: 90, height: 126, borderRadius: 6, objectFit: "cover" }} />
                      )}
                      {dc.quantity > 1 && (
                        <div style={{
                          position: "absolute", top: -4, right: -4,
                          background: "#0ea5e9", color: "white",
                          borderRadius: "50%", width: 20, height: 20,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 11, fontWeight: 700,
                        }}>
                          {dc.quantity}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(148,163,184,0.1)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
            <span>riftbound.fr/decks/{title.toLowerCase().replace(/\s+/g, "-")}</span>
            <span>Riftbound.fr is not endorsed by Riot Games</span>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add export button to deck detail page**

In `src/app/decks/[slug]/page.tsx`, add the DeckExportButton import and render it after the deck header. Insert after the tags/author section and before the DeckViewer:

```tsx
// Add import at top:
import { DeckExportButton } from "@/components/deck-export-template";

// Add in JSX, after the description paragraph and before <DeckViewer>:
<div className="mt-4">
  <DeckExportButton
    title={deck.title}
    legendName={deck.legendName}
    authorName={deck.authorName}
    cards={deck.cards}
  />
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/deck-export-template.tsx src/app/decks/[slug]/page.tsx
git commit -m "feat: add deck PNG export with html-to-image"
```

---

## Task 20: Final Verification & Build

- [ ] **Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any type errors.

- [ ] **Step 2: Run the dev server and verify**

```bash
npm run dev
```

Verify:
- Homepage loads with hero, stats
- `/cartes` loads card grid (after sync)
- `/cartes/[riftbound_id]` shows card detail
- `/tier-list` loads (empty if no tier list created)
- `/decks` loads
- `/guides` and sub-pages load
- `/tournois` loads
- `/actualites` loads
- `/admin/login` shows login form
- Admin panel loads after login

- [ ] **Step 3: Build for production**

```bash
npm run build
```

Fix any build errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: fix build errors and finalize project"
```
