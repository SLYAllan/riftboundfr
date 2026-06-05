# Système de Collection — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à un utilisateur connecté (Discord) de suivre sa collection de cartes Riftbound, voir le nombre de cartes manquantes sur chaque decklist et dans le deckbuilder, et importer sa collection depuis un CSV Piltover Archive.

**Architecture:** Collection stockée en base (`CollectionItem`, par impression + quantité). Calcul de couverture par fonctions pures testées (`src/lib/collection.ts`). API REST derrière la session Discord existante. Contexte client `useCollection` partagé par les surfaces interactives (cartes, page collection, deckbuilder). Pages decks en rendu serveur.

**Tech Stack:** Next.js 16, React 19, Prisma 6 (PostgreSQL), Vitest 4, Tailwind 4.

Spec : `docs/superpowers/specs/2026-06-05-collection-design.md`.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---------|----------------|
| `prisma/schema.prisma` (modif) | modèle `CollectionItem` + relations inverses |
| `src/lib/collection.ts` (create) | fonctions pures : `buildOwnedByName`, `computeDeckCoverage` |
| `src/lib/collection.test.ts` (create) | tests des fonctions pures |
| `src/lib/piltover-import.ts` (create) | parseur CSV Piltover + mapping → cardId |
| `src/lib/piltover-import.test.ts` (create) | tests du parseur |
| `src/app/api/collection/route.ts` (create) | GET (liste) + POST (set quantité) |
| `src/app/api/collection/bulk/route.ts` (create) | POST édition en masse |
| `src/app/api/collection/import/route.ts` (create) | POST import CSV Piltover |
| `src/lib/collection-server.ts` (create) | helpers DB : `getOwnedByName(userId)`, `getCollectionMap(userId)` |
| `src/components/collection/collection-provider.tsx` (create) | contexte `useCollection()` |
| `src/components/collection/quantity-stepper.tsx` (create) | stepper +/− réutilisable |
| `src/components/card-grid.tsx` (modif) | injecter le stepper quand connecté |
| `src/app/collection/page.tsx` (create) | page collection (complétion par set + import) |
| `src/components/collection/collection-board.tsx` (create) | UI client de la page collection |
| `src/components/collection/import-piltover.tsx` (create) | upload CSV + rapport |
| `src/components/collection/deck-coverage-panel.tsx` (create) | panneau « cartes manquantes » |
| `src/components/decklist-interactive.tsx` (modif) | surlignage cartes manquantes |
| `src/app/deckbuilder/deckbuilder.tsx` (modif) | indicateur live manquantes |

---

## Task 1 : Modèle Prisma `CollectionItem`

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Ajouter le modèle et les relations inverses**

Dans `prisma/schema.prisma`, ajouter à la fin :

```prisma
model CollectionItem {
  id        String   @id @default(cuid())
  userId    String
  cardId    String
  quantity  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  card Card @relation(fields: [cardId], references: [id])

  @@unique([userId, cardId])
  @@index([userId])
  @@index([cardId])
}
```

Dans `model Card { ... }`, ajouter sous `deckCards DeckCard[]` :

```prisma
  collectionItems CollectionItem[]
```

Dans `model User { ... }`, ajouter sous `comments Comment[]` :

```prisma
  collection CollectionItem[]
```

- [ ] **Step 2: Appliquer la migration en dev**

Run: `npx prisma migrate dev --name add_collection_item`
Expected: migration créée dans `prisma/migrations/`, client régénéré, "Your database is now in sync".

- [ ] **Step 3: Vérifier la génération du client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client". Le type `CollectionItem` est disponible.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(collection): modele CollectionItem"
```

---

## Task 2 : Fonctions pures de couverture (TDD)

**Files:**
- Create: `src/lib/collection.ts`
- Test: `src/lib/collection.test.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

`src/lib/collection.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { buildOwnedByName, computeDeckCoverage } from "./collection";

const card = (cleanName: string, name = cleanName) => ({ cleanName, name });

describe("buildOwnedByName", () => {
  it("agrège les quantités par cleanName (variantes confondues)", () => {
    const owned = buildOwnedByName([
      { card: card("blind-fury", "Blind Fury"), quantity: 2 },
      { card: card("blind-fury", "Blind Fury (Alt)"), quantity: 1 },
      { card: card("falling-star", "Falling Star"), quantity: 3 },
    ]);
    expect(owned.get("blind-fury")).toBe(3);
    expect(owned.get("falling-star")).toBe(3);
  });

  it("retombe sur name si cleanName manquant", () => {
    const owned = buildOwnedByName([
      { card: { cleanName: null, name: "Gust" }, quantity: 2 },
    ]);
    expect(owned.get("gust")).toBe(2);
  });
});

describe("computeDeckCoverage", () => {
  const deck = [
    { cardId: "c1", name: "Gust", section: "main", cleanName: "gust", quantity: 3 },
    { cardId: "c2", name: "Flash", section: "main", cleanName: "flash", quantity: 1 },
  ];

  it("0 manquantes quand tout est possédé", () => {
    const owned = new Map([["gust", 3], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(0);
    expect(cov.totals.completionPct).toBe(100);
  });

  it("compte les copies manquantes (2/3)", () => {
    const owned = new Map([["gust", 2], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(1);
    expect(cov.entries.find((e) => e.cardId === "c1")!.missing).toBe(1);
  });

  it("carte totalement absente = toutes manquantes", () => {
    const owned = new Map([["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.totals.missing).toBe(3);
    expect(cov.totals.required).toBe(4);
    expect(cov.totals.owned).toBe(1);
  });

  it("l'alt-art compte (possédé via cleanName)", () => {
    const owned = new Map([["gust", 3], ["flash", 1]]);
    const cov = computeDeckCoverage(owned, deck);
    expect(cov.entries.every((e) => e.missing === 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Lancer les tests (échec attendu)**

Run: `npx vitest run src/lib/collection.test.ts`
Expected: FAIL — "Failed to resolve import ./collection".

- [ ] **Step 3: Implémenter les fonctions pures**

`src/lib/collection.ts` :

```ts
export type OwnedByName = Map<string, number>;

function nameKey(cleanName: string | null, name: string): string {
  return (cleanName || name).trim().toLowerCase();
}

export function buildOwnedByName(
  items: { card: { cleanName: string | null; name: string }; quantity: number }[],
): OwnedByName {
  const owned: OwnedByName = new Map();
  for (const it of items) {
    const key = nameKey(it.card.cleanName, it.card.name);
    owned.set(key, (owned.get(key) ?? 0) + it.quantity);
  }
  return owned;
}

export interface DeckCardLike {
  cardId: string;
  name: string;
  section: string;
  cleanName: string | null;
  quantity: number;
}

export interface CoverageEntry {
  cardId: string;
  name: string;
  section: string;
  required: number;
  owned: number;
  missing: number;
}

export interface DeckCoverage {
  entries: CoverageEntry[];
  totals: { required: number; owned: number; missing: number; completionPct: number };
}

export function computeDeckCoverage(
  owned: OwnedByName,
  deckCards: DeckCardLike[],
): DeckCoverage {
  const entries: CoverageEntry[] = deckCards.map((dc) => {
    const key = nameKey(dc.cleanName, dc.name);
    const have = owned.get(key) ?? 0;
    const usableForCard = Math.min(have, dc.quantity);
    return {
      cardId: dc.cardId,
      name: dc.name,
      section: dc.section,
      required: dc.quantity,
      owned: usableForCard,
      missing: Math.max(0, dc.quantity - have),
    };
  });
  const required = entries.reduce((s, e) => s + e.required, 0);
  const ownedTotal = entries.reduce((s, e) => s + e.owned, 0);
  const missing = entries.reduce((s, e) => s + e.missing, 0);
  const completionPct = required === 0 ? 100 : Math.round((ownedTotal / required) * 100);
  return { entries, totals: { required, owned: ownedTotal, missing, completionPct } };
}
```

- [ ] **Step 4: Lancer les tests (succès attendu)**

Run: `npx vitest run src/lib/collection.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/collection.ts src/lib/collection.test.ts
git commit -m "feat(collection): fonctions pures de couverture de deck"
```

---

## Task 3 : Parseur CSV Piltover (TDD)

**Files:**
- Create: `src/lib/piltover-import.ts`
- Test: `src/lib/piltover-import.test.ts`

- [ ] **Step 1: Écrire les tests qui échouent**

`src/lib/piltover-import.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { parsePiltoverCsv } from "./piltover-import";

const HEADER =
  "Variant Number,Card Name,Set,Set Prefix,Rarity,Variant Type,Variant Label,Foil,Quantity,Language,Condition,Grading Company,Grading Value,Grading Label,Notes";

describe("parsePiltoverCsv", () => {
  it("parse une ligne simple", () => {
    const rows = parsePiltoverCsv(
      `${HEADER}\nOGN-025,Blind Fury,Origins,OGN,Rare,Standard,Standard,true,2,English,Near Mint,,,,Allan`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      setPrefix: "OGN",
      collectorNumber: 25,
      cardName: "Blind Fury",
      variantType: "Standard",
      quantity: 2,
    });
  });

  it("gère les virgules dans un nom entre guillemets", () => {
    const rows = parsePiltoverCsv(
      `${HEADER}\nOGN-027,"Darius, Trifarian",Origins,OGN,Rare,Standard,Standard,true,1,English,Near Mint,,,,Allan`,
    );
    expect(rows[0].cardName).toBe("Darius, Trifarian");
    expect(rows[0].collectorNumber).toBe(27);
    expect(rows[0].quantity).toBe(1);
  });

  it("ignore les lignes vides", () => {
    const rows = parsePiltoverCsv(`${HEADER}\n\n`);
    expect(rows).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Lancer les tests (échec attendu)**

Run: `npx vitest run src/lib/piltover-import.test.ts`
Expected: FAIL — "Failed to resolve import ./piltover-import".

- [ ] **Step 3: Implémenter le parseur**

`src/lib/piltover-import.ts` :

```ts
export interface PiltoverRow {
  variantNumber: string;
  setPrefix: string;
  collectorNumber: number | null;
  cardName: string;
  variantType: string;
  foil: string;
  quantity: number;
}

// Parse CSV conforme RFC 4180 (gère les champs entre guillemets avec virgules/quotes).
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parsePiltoverCsv(text: string): PiltoverRow[] {
  const lines = text.split(/\r?\n/);
  const rows: PiltoverRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const c = parseCsvLine(raw);
    const variantNumber = c[0]?.trim() ?? "";
    const dash = variantNumber.lastIndexOf("-");
    const setPrefix = dash > 0 ? variantNumber.slice(0, dash) : variantNumber;
    const numStr = dash > 0 ? variantNumber.slice(dash + 1) : "";
    const num = parseInt(numStr, 10);
    rows.push({
      variantNumber,
      setPrefix,
      collectorNumber: Number.isFinite(num) ? num : null,
      cardName: (c[1] ?? "").trim(),
      variantType: (c[5] ?? "").trim(),
      foil: (c[7] ?? "").trim(),
      quantity: parseInt(c[8] ?? "0", 10) || 0,
    });
  }
  return rows;
}
```

- [ ] **Step 4: Lancer les tests (succès attendu)**

Run: `npx vitest run src/lib/piltover-import.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/piltover-import.ts src/lib/piltover-import.test.ts
git commit -m "feat(collection): parseur CSV Piltover"
```

---

## Task 4 : Helpers DB collection

**Files:**
- Create: `src/lib/collection-server.ts`

- [ ] **Step 1: Implémenter les helpers serveur**

`src/lib/collection-server.ts` :

```ts
import { prisma } from "@/lib/prisma";
import { buildOwnedByName, type OwnedByName } from "@/lib/collection";

// Map cardId -> quantité, pour hydrater le client.
export async function getCollectionMap(userId: string): Promise<Record<string, number>> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { cardId: true, quantity: true },
  });
  return Object.fromEntries(items.map((i) => [i.cardId, i.quantity]));
}

// Quantités possédées agrégées par cleanName, pour le calcul de couverture.
export async function getOwnedByName(userId: string): Promise<OwnedByName> {
  const items = await prisma.collectionItem.findMany({
    where: { userId, quantity: { gt: 0 } },
    select: { quantity: true, card: { select: { cleanName: true, name: true } } },
  });
  return buildOwnedByName(items);
}
```

- [ ] **Step 2: Vérifier la compilation TypeScript**

Run: `npx tsc --noEmit`
Expected: pas d'erreur sur `src/lib/collection-server.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/collection-server.ts
git commit -m "feat(collection): helpers DB (getCollectionMap, getOwnedByName)"
```

---

## Task 5 : API `/api/collection` (GET + POST)

**Files:**
- Create: `src/app/api/collection/route.ts`

- [ ] **Step 1: Implémenter GET et POST**

`src/app/api/collection/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getCollectionMap } from "@/lib/collection-server";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await getCollectionMap(user.id));
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const cardId = typeof body?.cardId === "string" ? body.cardId : null;
  const quantity = Number(body?.quantity);
  if (!cardId || !Number.isInteger(quantity) || quantity < 0) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const card = await prisma.card.findUnique({ where: { id: cardId }, select: { id: true } });
  if (!card) return NextResponse.json({ error: "card_not_found" }, { status: 404 });

  if (quantity === 0) {
    await prisma.collectionItem.deleteMany({ where: { userId: user.id, cardId } });
  } else {
    await prisma.collectionItem.upsert({
      where: { userId_cardId: { userId: user.id, cardId } },
      create: { userId: user.id, cardId, quantity },
      update: { quantity },
    });
  }
  return NextResponse.json({ ok: true, cardId, quantity });
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: pas d'erreur.

- [ ] **Step 3: Test manuel (non connecté = 401)**

Run: `npm run dev` puis dans un autre terminal `curl -s -X POST localhost:3000/api/collection -H "Content-Type: application/json" -d '{"cardId":"x","quantity":1}'`
Expected: `{"error":"unauthorized"}` avec code 401.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/collection/route.ts
git commit -m "feat(collection): API GET/POST quantite"
```

---

## Task 6 : API `/api/collection/bulk`

**Files:**
- Create: `src/app/api/collection/bulk/route.ts`

- [ ] **Step 1: Implémenter le POST en masse**

`src/app/api/collection/bulk/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

interface BulkItem { cardId: string; quantity: number }

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const items: BulkItem[] = Array.isArray(body?.items) ? body.items : [];
  const valid = items.filter(
    (i) => typeof i.cardId === "string" && Number.isInteger(i.quantity) && i.quantity >= 0,
  );

  await prisma.$transaction(
    valid.map((i) =>
      i.quantity === 0
        ? prisma.collectionItem.deleteMany({ where: { userId: user.id, cardId: i.cardId } })
        : prisma.collectionItem.upsert({
            where: { userId_cardId: { userId: user.id, cardId: i.cardId } },
            create: { userId: user.id, cardId: i.cardId, quantity: i.quantity },
            update: { quantity: i.quantity },
          }),
    ),
  );
  return NextResponse.json({ ok: true, count: valid.length });
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/collection/bulk/route.ts
git commit -m "feat(collection): API bulk"
```

---

## Task 7 : API `/api/collection/import` (Piltover)

**Files:**
- Create: `src/app/api/collection/import/route.ts`

- [ ] **Step 1: Implémenter l'import avec mapping et rapport**

`src/app/api/collection/import/route.ts` :

```ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parsePiltoverCsv, type PiltoverRow } from "@/lib/piltover-import";

// Choisit l'impression Card correspondant à la variante Piltover.
function pickVariant(
  cards: { id: string; alternateArt: boolean; overnumbered: boolean; signature: boolean }[],
  row: PiltoverRow,
): string | null {
  if (cards.length === 1) return cards[0].id;
  const label = `${row.variantType} ${row.foil}`.toLowerCase();
  const wantAlt = label.includes("alt");
  const wantOver = label.includes("overnumbered");
  const wantSig = label.includes("showcase") || label.includes("signature");
  const match = cards.find(
    (c) => c.alternateArt === wantAlt && c.overnumbered === wantOver && c.signature === wantSig,
  );
  return (match ?? cards.find((c) => !c.alternateArt && !c.overnumbered && !c.signature) ?? cards[0]).id;
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const text = await req.text();
  const rows = parsePiltoverCsv(text);
  const unmatched: { variantNumber: string; name: string; raison: string }[] = [];
  const toUpsert: { cardId: string; quantity: number }[] = [];

  for (const row of rows) {
    if (row.collectorNumber == null) {
      unmatched.push({ variantNumber: row.variantNumber, name: row.cardName, raison: "numero illisible" });
      continue;
    }
    const cards = await prisma.card.findMany({
      where: { set: row.setPrefix, collectorNumber: row.collectorNumber },
      select: { id: true, alternateArt: true, overnumbered: true, signature: true },
    });
    if (cards.length === 0) {
      unmatched.push({ variantNumber: row.variantNumber, name: row.cardName, raison: "carte introuvable" });
      continue;
    }
    const cardId = pickVariant(cards, row);
    if (cardId) toUpsert.push({ cardId, quantity: row.quantity });
  }

  await prisma.$transaction(
    toUpsert.map((i) =>
      prisma.collectionItem.upsert({
        where: { userId_cardId: { userId: user.id, cardId: i.cardId } },
        create: { userId: user.id, cardId: i.cardId, quantity: i.quantity },
        update: { quantity: i.quantity },
      }),
    ),
  );

  return NextResponse.json({ imported: toUpsert.length, unmatched });
}
```

- [ ] **Step 2: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: pas d'erreur.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/collection/import/route.ts
git commit -m "feat(collection): API import CSV Piltover avec rapport"
```

---

## Task 8 : Contexte client `useCollection`

**Files:**
- Create: `src/components/collection/collection-provider.tsx`

- [ ] **Step 1: Implémenter le provider + hook**

`src/components/collection/collection-provider.tsx` :

```tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface CollectionCtx {
  quantities: Record<string, number>;
  loggedIn: boolean;
  setQuantity: (cardId: string, qty: number) => void;
}

const Ctx = createContext<CollectionCtx>({ quantities: {}, loggedIn: false, setQuantity: () => {} });

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/collection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object") {
          setQuantities(data);
          setLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const setQuantity = useCallback((cardId: string, qty: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[cardId];
      else next[cardId] = qty;
      return next;
    });
    fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, quantity: Math.max(0, qty) }),
    }).catch(() => {});
  }, []);

  return <Ctx.Provider value={{ quantities, loggedIn, setQuantity }}>{children}</Ctx.Provider>;
}

export const useCollection = () => useContext(Ctx);
```

- [ ] **Step 2: Monter le provider dans le layout racine**

Dans `src/app/layout.tsx`, importer `CollectionProvider` et envelopper `{children}` (à l'intérieur du `<body>`, autour du contenu existant).

- [ ] **Step 3: Vérifier la compilation**

Run: `npx tsc --noEmit`
Expected: pas d'erreur.

- [ ] **Step 4: Commit**

```bash
git add src/components/collection/collection-provider.tsx src/app/layout.tsx
git commit -m "feat(collection): contexte client useCollection"
```

---

## Task 9 : Stepper réutilisable + intégration `/cartes`

**Files:**
- Create: `src/components/collection/quantity-stepper.tsx`
- Modify: `src/components/card-grid.tsx`

- [ ] **Step 1: Implémenter le stepper**

`src/components/collection/quantity-stepper.tsx` :

```tsx
"use client";

import { useCollection } from "@/components/collection/collection-provider";

export function QuantityStepper({ cardId }: { cardId: string }) {
  const { quantities, loggedIn, setQuantity } = useCollection();
  if (!loggedIn) return null;
  const qty = quantities[cardId] ?? 0;
  return (
    <div className="flex items-center justify-center gap-2 text-sm" onClick={(e) => e.preventDefault()}>
      <button
        type="button"
        aria-label="Retirer un exemplaire"
        className="h-6 w-6 rounded bg-surface-2 disabled:opacity-40"
        disabled={qty === 0}
        onClick={() => setQuantity(cardId, qty - 1)}
      >
        −
      </button>
      <span className={qty > 0 ? "font-semibold text-gold" : "text-ink-muted"}>{qty}</span>
      <button
        type="button"
        aria-label="Ajouter un exemplaire"
        className="h-6 w-6 rounded bg-surface-2"
        onClick={() => setQuantity(cardId, qty + 1)}
      >
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Injecter le stepper dans la grille de cartes**

Dans `src/components/card-grid.tsx`, importer `QuantityStepper` et l'afficher sous chaque carte (après le bloc image/nom, à l'intérieur de la cellule de la carte) :

```tsx
import { QuantityStepper } from "@/components/collection/quantity-stepper";
// ... dans le rendu de chaque carte, après le <Link> :
<QuantityStepper cardId={card.id} />
```

Note : le stepper ne s'affiche que si l'utilisateur est connecté (géré dans le composant).

- [ ] **Step 3: Vérifier en dev**

Run: `npm run dev`, ouvrir `/cartes` connecté → steppers visibles ; cliquer + → quantité persiste après rechargement. Non connecté → pas de stepper.

- [ ] **Step 4: Commit**

```bash
git add src/components/collection/quantity-stepper.tsx src/components/card-grid.tsx
git commit -m "feat(collection): stepper quantite sur /cartes"
```

---

## Task 10 : Page `/collection` (complétion par set + import)

**Files:**
- Create: `src/app/collection/page.tsx`
- Create: `src/components/collection/import-piltover.tsx`
- Create: `src/components/collection/collection-board.tsx`

- [ ] **Step 1: Composant d'import**

`src/components/collection/import-piltover.tsx` :

```tsx
"use client";

import { useState } from "react";

interface Report { imported: number; unmatched: { variantNumber: string; name: string; raison: string }[] }

export function ImportPiltover() {
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const text = await file.text();
    const res = await fetch("/api/collection/import", { method: "POST", body: text });
    setReport(res.ok ? await res.json() : null);
    setBusy(false);
    if (res.ok) location.reload();
  }

  return (
    <div className="rounded-lg border border-line p-4">
      <h2 className="mb-2 font-semibold">Importer depuis Piltover Archive</h2>
      <p className="mb-3 text-sm text-ink-muted">Exporte ta collection en CSV depuis Piltover, puis dépose le fichier ici.</p>
      <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={busy} />
      {busy && <p className="mt-2 text-sm">Import en cours…</p>}
      {report && (
        <div className="mt-3 text-sm">
          <p className="text-gold">{report.imported} cartes importées.</p>
          {report.unmatched.length > 0 && (
            <details className="mt-1">
              <summary>{report.unmatched.length} non reconnues</summary>
              <ul className="mt-1 list-disc pl-5 text-ink-muted">
                {report.unmatched.map((u) => (
                  <li key={u.variantNumber}>{u.variantNumber} — {u.name} ({u.raison})</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Tableau de bord collection (complétion par set)**

`src/components/collection/collection-board.tsx` :

```tsx
"use client";

import { useCollection } from "@/components/collection/collection-provider";

interface SetInfo { set: string; name: string; cardCount: number; cardIds: string[] }

export function CollectionBoard({ sets }: { sets: SetInfo[] }) {
  const { quantities, loggedIn } = useCollection();
  if (!loggedIn) return <p>Connecte-toi avec Discord pour suivre ta collection.</p>;

  return (
    <div className="space-y-4">
      {sets.map((s) => {
        const ownedDistinct = s.cardIds.filter((id) => (quantities[id] ?? 0) > 0).length;
        const pct = s.cardCount ? Math.round((ownedDistinct / s.cardCount) * 100) : 0;
        return (
          <div key={s.set}>
            <div className="flex justify-between text-sm">
              <span>{s.name}</span>
              <span className="text-ink-muted">{ownedDistinct}/{s.cardCount} ({pct}%)</span>
            </div>
            <div className="mt-1 h-2 rounded bg-surface-2">
              <div className="h-2 rounded bg-gold" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Page serveur `/collection`**

`src/app/collection/page.tsx` :

```tsx
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ImportPiltover } from "@/components/collection/import-piltover";
import { CollectionBoard } from "@/components/collection/collection-board";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Ma collection — Riftbound France" },
  description: "Suis ta collection de cartes Riftbound et le nombre de cartes qu'il te manque pour chaque deck.",
  alternates: { canonical: "/collection" },
};

export default async function CollectionPage() {
  const dbSets = await prisma.cardSet.findMany();
  const cards = await prisma.card.findMany({ select: { id: true, set: true } });
  const sets = dbSets.map((s) => {
    const ids = cards.filter((c) => c.set === s.setId).map((c) => c.id);
    return { set: s.setId, name: s.name, cardCount: s.cardCount ?? ids.length, cardIds: ids };
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Ma collection</h1>
      <div className="mb-6"><ImportPiltover /></div>
      <CollectionBoard sets={sets} />
    </main>
  );
}
```

Note : confirmer `Card.set` vs `CardSet.setId` à l'implémentation (les deux doivent correspondre, ex. `OGN`). Adapter le filtre si nécessaire.

- [ ] **Step 4: Lien navbar**

Dans `src/components/navbar.tsx`, ajouter un lien « Ma collection » → `/collection` (suivre le style des liens existants).

- [ ] **Step 5: Vérifier en dev**

Run: `npm run dev`, ouvrir `/collection` connecté → import + barres de complétion ; importer le CSV Piltover réel → rapport affiché, complétion mise à jour.

- [ ] **Step 6: Commit**

```bash
git add src/app/collection src/components/collection/import-piltover.tsx src/components/collection/collection-board.tsx src/components/navbar.tsx
git commit -m "feat(collection): page /collection avec import Piltover et completion par set"
```

---

## Task 11 : Panneau « cartes manquantes » sur les pages decks

**Files:**
- Create: `src/components/collection/deck-coverage-panel.tsx`
- Modify: `src/app/decks/[slug]/page.tsx`

- [ ] **Step 1: Composant panneau de couverture (client)**

`src/components/collection/deck-coverage-panel.tsx` :

```tsx
"use client";

import { useCollection } from "@/components/collection/collection-provider";
import { computeDeckCoverage, type DeckCardLike } from "@/lib/collection";

export function DeckCoveragePanel({ deckCards }: { deckCards: DeckCardLike[] }) {
  const { quantities, loggedIn } = useCollection();
  if (!loggedIn) {
    return (
      <div className="rounded-lg border border-line p-4 text-sm text-ink-muted">
        Connecte-toi avec Discord pour voir combien de cartes il te manque pour ce deck.
      </div>
    );
  }
  // Reconstruit owned par cleanName à partir des quantités possédées (cardId -> qty)
  // en s'appuyant sur les cleanName fournis dans deckCards.
  const owned = new Map<string, number>();
  for (const dc of deckCards) {
    const key = (dc.cleanName || dc.name).trim().toLowerCase();
    const q = quantities[dc.cardId] ?? 0;
    if (q > 0) owned.set(key, (owned.get(key) ?? 0) + q);
  }
  const cov = computeDeckCoverage(owned, deckCards);
  return (
    <div className="rounded-lg border border-line p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Ma collection</span>
        <span className={cov.totals.missing === 0 ? "text-emerald-400" : "text-amber-400"}>
          {cov.totals.missing === 0 ? "Deck complet ✓" : `Il te manque ${cov.totals.missing} carte(s)`}
        </span>
      </div>
      {cov.totals.missing > 0 && (
        <ul className="mt-2 space-y-1 text-sm text-ink-muted">
          {cov.entries.filter((e) => e.missing > 0).map((e) => (
            <li key={e.cardId}>{e.missing}× {e.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Limite connue : ce panneau client n'utilise que les `cardId` exacts du deck pour `quantities`. La prise en compte de l'alt-art passe par le calcul serveur (Step 2), qui agrège par `cleanName`. Le panneau client sert d'aperçu live ; la source fiable reste le serveur.

- [ ] **Step 2: Calcul serveur fiable dans la page deck**

Dans `src/app/decks/[slug]/page.tsx`, après avoir chargé le deck et ses cartes (`deck.cards` avec `include: { card: true }`), calculer la couverture côté serveur si l'utilisateur est connecté :

```tsx
import { getUserFromSession } from "@/lib/session";
import { getOwnedByName } from "@/lib/collection-server";
import { computeDeckCoverage, type DeckCardLike } from "@/lib/collection";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";

// après chargement du deck (avec cards + card) :
const deckCards: DeckCardLike[] = deck.cards.map((dc) => ({
  cardId: dc.cardId,
  name: dc.card.name,
  section: dc.section,
  cleanName: dc.card.cleanName,
  quantity: dc.quantity,
}));

const user = await getUserFromSession();
let serverCoverage = null;
if (user) {
  const owned = await getOwnedByName(user.id);
  serverCoverage = computeDeckCoverage(owned, deckCards);
}
```

Rendre, près de la decklist : si `serverCoverage` existe, afficher un encart « Il te manque {serverCoverage.totals.missing} carte(s) » (source serveur, alt-art inclus) ; sinon afficher `<DeckCoveragePanel deckCards={deckCards} />` (aperçu/invite connexion).

Note : vérifier que la page deck charge bien `cards: { include: { card: true } }`. Si la page utilise déjà une transformation `DecklistCard`, réutiliser cette source plutôt que recharger.

- [ ] **Step 3: Vérifier en dev**

Run: `npm run dev`, ouvrir une page deck connecté avec une collection partielle → « Il te manque N cartes » correct ; deck entièrement possédé → « Deck complet ✓ ».

- [ ] **Step 4: Commit**

```bash
git add src/components/collection/deck-coverage-panel.tsx "src/app/decks/[slug]/page.tsx"
git commit -m "feat(collection): panneau cartes manquantes sur pages decks"
```

---

## Task 12 : Indicateur live dans le deckbuilder

**Files:**
- Modify: `src/app/deckbuilder/deckbuilder.tsx`

- [ ] **Step 1: Intégrer la couverture live**

Dans `src/app/deckbuilder/deckbuilder.tsx`, à partir de la liste des cartes du deck en cours de construction (qui contient `cardId`, `name`, `cleanName` si dispo, `quantity`, `section`), construire `deckCards: DeckCardLike[]` et afficher `<DeckCoveragePanel deckCards={deckCards} />` dans la colonne de résumé du deck (à côté des stats/runes).

Si les cartes du deckbuilder n'exposent pas `cleanName`, l'ajouter à la structure de carte du builder (provient de `Card.cleanName`).

```tsx
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
// dans le panneau de résumé :
<DeckCoveragePanel deckCards={builderDeckCards} />
```

- [ ] **Step 2: Vérifier en dev**

Run: `npm run dev`, construire un deck connecté → l'indicateur « Il te manque N cartes » se met à jour en direct à chaque ajout/retrait.

- [ ] **Step 3: Commit**

```bash
git add src/app/deckbuilder/deckbuilder.tsx
git commit -m "feat(collection): indicateur cartes manquantes live dans le deckbuilder"
```

---

## Task 13 : Vérification finale

- [ ] **Step 1: Lint + types + tests**

Run: `npm run lint && npx tsc --noEmit && npx vitest run`
Expected: aucun warning/erreur ; tous les tests passent.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build réussi, route `/collection` listée.

- [ ] **Step 3: Parcours complet manuel**

Connecté : importer le CSV Piltover → `/collection` montre la complétion → ouvrir un deck → « cartes manquantes » cohérent → deckbuilder live. Déconnecté : aucune fuite, invites à se connecter.

- [ ] **Step 4: Commit final éventuel (ajustements)**

```bash
git add -A
git commit -m "chore(collection): ajustements post-verification"
```

---

## Déploiement (après merge)

Appliquer la migration en prod (cf. leçons Coolify : `prisma migrate deploy` au démarrage via `entrypoint.sh`, ne pas fragmenter la donnée). Vérifier que `CollectionItem` existe en prod avant d'exposer la page.

## Auto-revue du plan

- Couverture spec : modèle (T1), helpers purs (T2), parseur CSV (T3), helpers DB (T4), API GET/POST/bulk/import (T5-7), contexte client (T8), steppers /cartes (T9), page /collection + import (T10), manquantes decks (T11), deckbuilder (T12), vérif (T13). ✓
- Périmètre « tout le deck » : `computeDeckCoverage` traite toutes les sections présentes dans `deckCards` (main/champion/legend/battlefield/rune) — l'appelant inclut toutes les sections. ✓
- Types cohérents : `DeckCardLike`, `OwnedByName`, `CoverageEntry`, `DeckCoverage`, `PiltoverRow` réutilisés à l'identique entre tasks. ✓
- Inconnues signalées : `Card.set` vs `CardSet.setId`, exposition `cleanName` dans le deckbuilder, source des cartes de la page deck — notées dans les tasks concernées.
