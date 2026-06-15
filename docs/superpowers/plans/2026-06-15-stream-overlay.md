# Stream Overlay + Dashboard — Implementation Plan (Phase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un overlay OBS par profil connecté, piloté en direct depuis un dashboard, pour streamer une partie Riftbound 1v1 à l'image de la diffusion officielle.

**Architecture:** Modèle Prisma `OverlayState` (1 par utilisateur, `state` JSON, `token` public). Le dashboard (`/profil/overlay`) POST le state ; l'overlay public (`/overlay/[token]`) le lit par polling HTTP toutes les 1,5 s. Logique pure (état par défaut, clamp des points, merge des updates) isolée dans `src/lib/overlay.ts` et testée en vitest.

**Tech Stack:** Next.js (App Router), Prisma + Postgres local, auth Discord (`getUserFromSession`), Tailwind, vitest 4.

Spec : `docs/superpowers/specs/2026-06-15-stream-overlay-design.md`.

---

## File Structure

- `prisma/schema.prisma` — modèle `OverlayState` + relation sur `User` (modifier)
- `src/lib/overlay.ts` — types, état par défaut, `clampPoints`, `applyStateUpdate`, `makeToken` (créer)
- `src/lib/overlay.test.ts` — tests unitaires de la logique pure (créer)
- `src/lib/overlay-server.ts` — `getOrCreateOverlayState(userId)`, `getStateByToken(token)`, `saveState`, `regenerateToken` (créer)
- `src/app/api/overlay/[token]/route.ts` — GET public du state (créer)
- `src/app/api/overlay/state/route.ts` — GET/POST du state propriétaire (créer)
- `src/app/api/overlay/token/route.ts` — POST régénération token (créer)
- `src/hooks/use-overlay-poll.ts` — hook client de polling 1,5 s (créer)
- `src/app/overlay/[token]/page.tsx` — page overlay full (créer)
- `src/app/overlay/[token]/overlay-full.tsx` — composant client de rendu (créer)
- `src/app/overlay/[token]/overlay.module.css` — fond transparent + reset (créer)
- `src/app/profil/overlay/page.tsx` — page dashboard (server) (créer)
- `src/app/profil/overlay/overlay-dashboard.tsx` — composant client du dashboard (créer)
- `src/app/profil/page.tsx` — ajouter un lien vers `/profil/overlay` (modifier)

---

## Task 1: Modèle Prisma `OverlayState` + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Ajouter le modèle + la relation User**

Dans `prisma/schema.prisma`, ajouter le modèle :

```prisma
model OverlayState {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  state     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([token])
}
```

Et dans `model User { ... }`, ajouter la relation inverse parmi les autres relations :

```prisma
  overlayState   OverlayState?
```

- [ ] **Step 2: Créer la migration (DB locale)**

Run: `npx prisma migrate dev --name overlay_state`
Expected: migration créée + appliquée, `Prisma Client` régénéré, "Your database is now in sync".

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(overlay): modèle Prisma OverlayState"
```

---

## Task 2: Logique pure de l'overlay (`src/lib/overlay.ts`) — TDD

**Files:**
- Create: `src/lib/overlay.ts`
- Test: `src/lib/overlay.test.ts`

- [ ] **Step 1: Écrire les tests d'abord**

`src/lib/overlay.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { defaultOverlayState, clampPoints, applyStateUpdate, makeToken } from "./overlay";

describe("overlay logic", () => {
  it("default state has two players, BO3, maxPoints 8, points 0", () => {
    const s = defaultOverlayState();
    expect(s.players).toHaveLength(2);
    expect(s.format).toBe("BO3");
    expect(s.maxPoints).toBe(8);
    expect(s.points).toEqual({ a: 0, b: 0 });
    expect(s.players[0].camEnabled).toBe(true);
  });

  it("clampPoints bornes 0..max", () => {
    expect(clampPoints(-3, 8)).toBe(0);
    expect(clampPoints(12, 8)).toBe(8);
    expect(clampPoints(9, 9)).toBe(9);
    expect(clampPoints(4, 8)).toBe(4);
  });

  it("applyStateUpdate merge en profondeur et re-clampe les points sur maxPoints", () => {
    const base = defaultOverlayState();
    const next = applyStateUpdate(base, { maxPoints: 9, points: { a: 9, b: 0 }, players: [{ name: "Squirtle" }, {}] });
    expect(next.maxPoints).toBe(9);
    expect(next.points.a).toBe(9);
    expect(next.players[0].name).toBe("Squirtle");
    // baisser maxPoints re-clampe
    const back = applyStateUpdate(next, { maxPoints: 8 });
    expect(back.points.a).toBe(8);
  });

  it("makeToken génère un slug url-safe de 16+ chars, unique", () => {
    const a = makeToken();
    const b = makeToken();
    expect(a).toMatch(/^[a-z0-9]{16,}$/);
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Lancer pour vérifier l'échec**

Run: `npx vitest run src/lib/overlay.test.ts`
Expected: FAIL ("Failed to resolve import ./overlay" / functions undefined).

- [ ] **Step 3: Implémenter `src/lib/overlay.ts`**

```ts
export type OverlayFormat = "BO1" | "BO3" | "BO5";

export interface OverlayPlayer {
  name: string;
  legendId: string | null;
  legendName: string;
  championName: string;
  battlefields: string[];
  gamesWon: number;
  camEnabled: boolean;
}

export interface OverlayStateData {
  event: { title: string; round: string };
  format: OverlayFormat;
  maxPoints: number; // 8 ou 9
  points: { a: number; b: number };
  players: [OverlayPlayer, OverlayPlayer];
}

function emptyPlayer(name: string): OverlayPlayer {
  return { name, legendId: null, legendName: "", championName: "", battlefields: [], gamesWon: 0, camEnabled: true };
}

export function defaultOverlayState(): OverlayStateData {
  return {
    event: { title: "Riftbound France", round: "" },
    format: "BO3",
    maxPoints: 8,
    points: { a: 0, b: 0 },
    players: [emptyPlayer("Joueur 1"), emptyPlayer("Joueur 2")],
  };
}

export function clampPoints(n: number, max: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(max, Math.round(n)));
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export function applyStateUpdate(base: OverlayStateData, patch: DeepPartial<OverlayStateData> & { players?: Array<Partial<OverlayPlayer>> }): OverlayStateData {
  const next: OverlayStateData = {
    ...base,
    ...patch,
    event: { ...base.event, ...(patch.event ?? {}) },
    points: { ...base.points, ...(patch.points ?? {}) },
    players: [
      { ...base.players[0], ...(patch.players?.[0] ?? {}) },
      { ...base.players[1], ...(patch.players?.[1] ?? {}) },
    ] as [OverlayPlayer, OverlayPlayer],
  };
  const max = next.maxPoints === 9 ? 9 : 8;
  next.maxPoints = max;
  next.points = { a: clampPoints(next.points.a, max), b: clampPoints(next.points.b, max) };
  return next;
}

export function makeToken(): string {
  // 20 chars base36, url-safe
  let t = "";
  while (t.length < 20) t += Math.random().toString(36).slice(2);
  return t.slice(0, 20);
}
```

- [ ] **Step 4: Lancer pour vérifier le succès**

Run: `npx vitest run src/lib/overlay.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/overlay.ts src/lib/overlay.test.ts
git commit -m "feat(overlay): logique pure (état, clamp points, merge) + tests"
```

---

## Task 3: Accès serveur (`src/lib/overlay-server.ts`)

**Files:**
- Create: `src/lib/overlay-server.ts`

- [ ] **Step 1: Implémenter les helpers serveur**

```ts
import "server-only";
import { prisma } from "@/lib/prisma";
import { defaultOverlayState, makeToken, applyStateUpdate, type OverlayStateData } from "@/lib/overlay";

export async function getOrCreateOverlayState(userId: string) {
  const existing = await prisma.overlayState.findUnique({ where: { userId } });
  if (existing) return existing;
  return prisma.overlayState.create({
    data: { userId, token: makeToken(), state: defaultOverlayState() as object },
  });
}

export async function getStateByToken(token: string): Promise<OverlayStateData | null> {
  const row = await prisma.overlayState.findUnique({ where: { token } });
  return row ? (row.state as unknown as OverlayStateData) : null;
}

export async function saveState(userId: string, patch: Partial<OverlayStateData> & { players?: unknown }) {
  const row = await getOrCreateOverlayState(userId);
  const merged = applyStateUpdate(row.state as unknown as OverlayStateData, patch as never);
  await prisma.overlayState.update({ where: { userId }, data: { state: merged as object } });
  return merged;
}

export async function regenerateToken(userId: string) {
  await getOrCreateOverlayState(userId);
  const token = makeToken();
  await prisma.overlayState.update({ where: { userId }, data: { token } });
  return token;
}
```

- [ ] **Step 2: Vérifier la compilation TS**

Run: `npx tsc --noEmit`
Expected: pas d'erreur sur `src/lib/overlay-server.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/overlay-server.ts
git commit -m "feat(overlay): helpers serveur (getOrCreate, getByToken, save, regenerate)"
```

---

## Task 4: API publique GET `/api/overlay/[token]`

**Files:**
- Create: `src/app/api/overlay/[token]/route.ts`

- [ ] **Step 1: Implémenter la route**

```ts
import { NextResponse } from "next/server";
import { getStateByToken } from "@/lib/overlay-server";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const state = await getStateByToken(token);
  if (!state) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}
```

- [ ] **Step 2: Test manuel**

Lancer le dev (`npm run dev`), créer un état via le dashboard (Task 9) OU temporairement via `npx prisma studio`. Puis :
Run: `curl -s http://localhost:3000/api/overlay/<token>`
Expected: le JSON du state (ou 404 si token inconnu).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/overlay/[token]/route.ts
git commit -m "feat(overlay): API publique GET /api/overlay/[token]"
```

---

## Task 5: API propriétaire `/api/overlay/state` (GET + POST)

**Files:**
- Create: `src/app/api/overlay/state/route.ts`

- [ ] **Step 1: Implémenter la route**

```ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState, saveState } from "@/lib/overlay-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const row = await getOrCreateOverlayState(user.id);
  return NextResponse.json({ token: row.token, state: row.state });
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patch = await req.json();
  const merged = await saveState(user.id, patch);
  return NextResponse.json({ state: merged });
}
```

- [ ] **Step 2: Test manuel**

Connecté en dev (`/api/auth/dev-login`), puis :
Run: `curl -s -X POST http://localhost:3000/api/overlay/state -H "Content-Type: application/json" --cookie "<session>" -d '{"points":{"a":3}}'`
Expected: `{"state":{...,"points":{"a":3,...}}}`. Sans cookie → 401.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/overlay/state/route.ts
git commit -m "feat(overlay): API propriétaire GET/POST /api/overlay/state"
```

---

## Task 6: API régénération token `/api/overlay/token`

**Files:**
- Create: `src/app/api/overlay/token/route.ts`

- [ ] **Step 1: Implémenter la route**

```ts
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { regenerateToken } from "@/lib/overlay-server";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = await regenerateToken(user.id);
  return NextResponse.json({ token });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/overlay/token/route.ts
git commit -m "feat(overlay): API régénération du token OBS"
```

---

## Task 7: Hook de polling client

**Files:**
- Create: `src/hooks/use-overlay-poll.ts`

- [ ] **Step 1: Implémenter le hook**

```ts
"use client";
import { useEffect, useRef, useState } from "react";
import type { OverlayStateData } from "@/lib/overlay";

export function useOverlayPoll(token: string, intervalMs = 1500) {
  const [state, setState] = useState<OverlayStateData | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch(`/api/overlay/${token}`, { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as OverlayStateData;
        if (!cancelled) setState(data);
      } catch {
        /* réseau : on retentera au prochain tick */
      }
    }
    tick();
    timer.current = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [token, intervalMs]);

  return state;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-overlay-poll.ts
git commit -m "feat(overlay): hook de polling client (1,5s)"
```

---

## Task 8: Overlay full (`/overlay/[token]`)

**Files:**
- Create: `src/app/overlay/[token]/overlay.module.css`
- Create: `src/app/overlay/[token]/overlay-full.tsx`
- Create: `src/app/overlay/[token]/page.tsx`

- [ ] **Step 1: CSS transparent + reset**

`src/app/overlay/[token]/overlay.module.css` :

```css
.root {
  position: fixed;
  inset: 0;
  width: 1920px;
  height: 1080px;
  background: transparent;
  overflow: hidden;
  pointer-events: none;
  color: #fff;
  font-family: var(--font-rubik), system-ui, sans-serif;
}
```

- [ ] **Step 2: Composant de rendu (bandeaux + piste de points)**

`src/app/overlay/[token]/overlay-full.tsx` — structure conforme à l'image (header nom, bloc légende+champion+domaines, espace cam masquable, battlefields, branding+ronds BO, piste de points haut-centre). Le polish pixel s'affinera ; cette base est fonctionnelle.

```tsx
"use client";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getLegendIconUrl } from "@/lib/banners";
import type { OverlayPlayer, OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";

function PointsTrack({ max, a, b }: { max: number; a: number; b: number }) {
  const cells = [];
  for (let i = 1; i <= max; i++) cells.push({ side: "a", v: i });
  for (let i = max; i >= 1; i--) cells.push({ side: "b", v: i });
  return (
    <div className="absolute left-1/2 top-3 -translate-x-1/2 flex gap-1">
      {cells.map((c, i) => {
        const active = (c.side === "a" && c.v === a) || (c.side === "b" && c.v === b);
        return (
          <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${active ? "bg-gold text-black border-gold" : "bg-black/60 text-white/70 border-white/20"}`}>
            {c.v}
          </span>
        );
      })}
    </div>
  );
}

function SidePanel({ p, side, format }: { p: OverlayPlayer; side: "left" | "right"; format: OverlayStateData["format"] }) {
  const icon = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const rounds = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  return (
    <div className={`absolute top-0 ${side === "left" ? "left-0" : "right-0"} flex h-full w-[310px] flex-col items-center gap-3 bg-gradient-to-b from-[#0b1320]/95 to-[#0b1320]/80 p-3`}>
      <div className="w-full rounded bg-black/50 py-2 text-center text-2xl font-bold tracking-wide">{p.name || "—"}</div>
      <div className="w-full rounded border border-gold/40 p-2 text-center">
        {icon && <img src={icon} alt="" className="mx-auto h-24 object-contain" />}
        <div className="mt-1 text-sm font-semibold uppercase">{p.legendName}</div>
        <div className="text-xs text-white/70">{p.championName}</div>
      </div>
      {p.camEnabled && <div className="w-full flex-1 rounded border border-white/15 bg-black/20" aria-label="cam" />}
      <div className="w-full space-y-1">
        {p.battlefields.map((b, i) => (
          <div key={i} className="rounded bg-black/50 px-2 py-1 text-center text-sm font-semibold">{b}</div>
        ))}
      </div>
      {rounds > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: rounds }).map((_, i) => (
            <span key={i} className={`h-5 w-5 rounded-full border-2 ${i < p.gamesWon ? "bg-gold border-gold" : "border-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OverlayFull({ token }: { token: string }) {
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  return (
    <div className={styles.root}>
      <PointsTrack max={state.maxPoints} a={state.points.a} b={state.points.b} />
      <SidePanel p={state.players[0]} side="left" format={state.format} />
      <SidePanel p={state.players[1]} side="right" format={state.format} />
    </div>
  );
}
```

Note : `DOMAIN_ICONS` est importé pour l'itération suivante (icônes de domaine à côté de la légende) ; placer les icônes des `domains` de la légende quand le picker renverra les domaines dans le state (Phase visuelle).

- [ ] **Step 3: Page overlay**

`src/app/overlay/[token]/page.tsx` :

```tsx
import { OverlayFull } from "./overlay-full";

export const dynamic = "force-dynamic";

export default async function OverlayPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OverlayFull token={token} />;
}
```

- [ ] **Step 4: Vérif manuelle**

Ouvrir `http://localhost:3000/overlay/<token>` : fond transparent, deux bandeaux, piste de points. Modifier le state via le dashboard (Task 9) et voir l'overlay évoluer sous ~1,5 s.

- [ ] **Step 5: Commit**

```bash
git add src/app/overlay
git commit -m "feat(overlay): page overlay full (bandeaux + piste de points + polling)"
```

---

## Task 9: Dashboard `/profil/overlay`

**Files:**
- Create: `src/app/profil/overlay/page.tsx`
- Create: `src/app/profil/overlay/overlay-dashboard.tsx`

- [ ] **Step 1: Page server (auth + état initial)**

`src/app/profil/overlay/page.tsx` :

```tsx
import { redirect } from "next/navigation";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState } from "@/lib/overlay-server";
import type { OverlayStateData } from "@/lib/overlay";
import { OverlayDashboard } from "./overlay-dashboard";

export const dynamic = "force-dynamic";

export default async function OverlayDashboardPage() {
  const user = await getUserFromSession();
  if (!user) redirect("/profil");
  const row = await getOrCreateOverlayState(user.id);
  return <OverlayDashboard token={row.token} initial={row.state as unknown as OverlayStateData} />;
}
```

- [ ] **Step 2: Composant dashboard (contrôles + lien + aperçu)**

`src/app/profil/overlay/overlay-dashboard.tsx` — état local, POST debounce vers `/api/overlay/state`, sélecteur de légende (`/api/legends`), steppers points/gamesWon, toggles cam, format, maxPoints, swap/reset, copie du lien, iframe d'aperçu.

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { applyStateUpdate, type OverlayStateData } from "@/lib/overlay";

type Legend = { id: string; name: string; imageUrl: string | null; domains: string[] };

export function OverlayDashboard({ token, initial }: { token: string; initial: OverlayStateData }) {
  const [state, setState] = useState<OverlayStateData>(initial);
  const [legends, setLegends] = useState<Legend[]>([]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { fetch("/api/legends").then((r) => r.json()).then(setLegends).catch(() => {}); }, []);

  function update(patch: Parameters<typeof applyStateUpdate>[1]) {
    setState((s) => {
      const next = applyStateUpdate(s, patch);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch("/api/overlay/state", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
      }, 300);
      return next;
    });
  }

  const overlayUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/overlay/${token}`;

  function setPlayer(i: 0 | 1, p: Partial<OverlayStateData["players"][0]>) {
    update({ players: i === 0 ? [p, {}] : [{}, p] } as never);
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-2xl font-bold">Overlay de stream</h1>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline p-3 text-sm">
        <span className="font-medium">Lien OBS :</span>
        <code className="rounded bg-surface-raised px-2 py-1">{overlayUrl}</code>
        <button onClick={() => navigator.clipboard.writeText(overlayUrl)} className="rounded bg-arcane px-3 py-1 text-white">Copier</button>
        <button onClick={() => fetch("/api/overlay/token", { method: "POST" }).then((r) => r.json()).then((d) => location.reload())} className="rounded border border-hairline px-3 py-1">Régénérer</button>
      </div>

      <div className="flex flex-wrap gap-4">
        {([0, 1] as const).map((i) => {
          const p = state.players[i];
          return (
            <div key={i} className="flex-1 min-w-[280px] space-y-2 rounded-lg border border-hairline p-3">
              <h2 className="font-semibold">Joueur {i + 1}</h2>
              <input value={p.name} onChange={(e) => setPlayer(i, { name: e.target.value })} placeholder="Nom" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <select value={p.legendId ?? ""} onChange={(e) => { const l = legends.find((x) => x.id === e.target.value); setPlayer(i, { legendId: l?.id ?? null, legendName: l?.name ?? "" }); }} className="w-full rounded border border-hairline bg-surface px-2 py-1">
                <option value="">— Légende —</option>
                {legends.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <input value={p.championName} onChange={(e) => setPlayer(i, { championName: e.target.value })} placeholder="Champion" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <input value={p.battlefields.join(", ")} onChange={(e) => setPlayer(i, { battlefields: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Battlefields (séparés par ,)" className="w-full rounded border border-hairline bg-surface px-2 py-1" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.camEnabled} onChange={(e) => setPlayer(i, { camEnabled: e.target.checked })} /> Cam visible</label>
              <div className="flex items-center gap-3 text-sm">
                <span>Points</span>
                <button onClick={() => update({ points: { [i === 0 ? "a" : "b"]: (i === 0 ? state.points.a : state.points.b) - 1 } } as never)} className="rounded border px-2">−</button>
                <span>{i === 0 ? state.points.a : state.points.b}</span>
                <button onClick={() => update({ points: { [i === 0 ? "a" : "b"]: (i === 0 ? state.points.a : state.points.b) + 1 } } as never)} className="rounded border px-2">+</button>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>Manches</span>
                <button onClick={() => setPlayer(i, { gamesWon: Math.max(0, p.gamesWon - 1) })} className="rounded border px-2">−</button>
                <span>{p.gamesWon}</span>
                <button onClick={() => setPlayer(i, { gamesWon: p.gamesWon + 1 })} className="rounded border px-2">+</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline p-3 text-sm">
        <label>Format
          <select value={state.format} onChange={(e) => update({ format: e.target.value as OverlayStateData["format"] })} className="ml-2 rounded border border-hairline bg-surface px-2 py-1">
            <option>BO1</option><option>BO3</option><option>BO5</option>
          </select>
        </label>
        <label>Points max
          <select value={state.maxPoints} onChange={(e) => update({ maxPoints: Number(e.target.value) })} className="ml-2 rounded border border-hairline bg-surface px-2 py-1">
            <option value={8}>8</option><option value={9}>9</option>
          </select>
        </label>
        <input value={state.event.title} onChange={(e) => update({ event: { title: e.target.value } })} placeholder="Titre event" className="rounded border border-hairline bg-surface px-2 py-1" />
        <input value={state.event.round} onChange={(e) => update({ event: { round: e.target.value } })} placeholder="Round (TOP 8…)" className="rounded border border-hairline bg-surface px-2 py-1" />
        <button onClick={() => update({ players: [state.players[1], state.players[0]] as never, points: { a: state.points.b, b: state.points.a } })} className="rounded border px-3 py-1">Swap joueurs</button>
        <button onClick={() => update({ points: { a: 0, b: 0 } })} className="rounded border px-3 py-1">Reset game</button>
        <button onClick={() => update({ points: { a: 0, b: 0 }, players: [{ gamesWon: 0 }, { gamesWon: 0 }] as never })} className="rounded border px-3 py-1">Reset match</button>
      </div>

      <div>
        <h2 className="mb-2 font-semibold">Aperçu</h2>
        <iframe src={`/overlay/${token}`} className="h-[360px] w-[640px] rounded border border-hairline" style={{ background: "#111" }} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Vérif manuelle (le cœur de la feature)**

Connecté (`/api/auth/dev-login`), ouvrir `/profil/overlay`. Changer un nom / une légende / les points → l'aperçu iframe ET un onglet `/overlay/<token>` reflètent le changement sous ~1,5 s. Décocher « Cam visible » → l'espace cam disparaît et le bandeau se recentre.

- [ ] **Step 4: Commit**

```bash
git add src/app/profil/overlay
git commit -m "feat(overlay): dashboard de contrôle /profil/overlay"
```

---

## Task 10: Lien vers le dashboard depuis `/profil`

**Files:**
- Modify: `src/app/profil/page.tsx`

- [ ] **Step 1: Ajouter un lien/bouton vers `/profil/overlay`**

Dans le rendu de `src/app/profil/page.tsx`, ajouter (à un endroit cohérent avec les actions existantes) :

```tsx
<a href="/profil/overlay" className="inline-flex items-center gap-2 rounded-lg border border-hairline px-4 py-2 text-sm font-medium hover:border-hairline-accent">
  🎥 Overlay de stream
</a>
```

- [ ] **Step 2: Vérif + commit**

Vérifier que le lien apparaît sur `/profil` et mène au dashboard.

```bash
git add src/app/profil/page.tsx
git commit -m "feat(overlay): lien vers le dashboard depuis le profil"
```

---

## Vérification finale (Phase 1)

- [ ] `npx vitest run src/lib/overlay.test.ts` → PASS
- [ ] `npx tsc --noEmit` → pas d'erreur sur les fichiers overlay
- [ ] Flux complet : dashboard → modifications → overlay reflète sous 1,5 s ; cam off → reflow ; points 0–9 ; BO1/3/5 → bons ronds ; lien OBS copiable + régénérable (l'ancien renvoie 404).

## Notes pour la Phase 2 (hors de ce plan)

- Overlay compact (`/overlay/[token]/compact`) au pixel sur les images compactes à venir.
- Polish visuel pixel-perfect du full (icônes de domaine, art carte légende complète, branding RB/timer) sur l'image fournie.
- Sélecteur de champion alimenté par les Champion Units de la légende choisie.
