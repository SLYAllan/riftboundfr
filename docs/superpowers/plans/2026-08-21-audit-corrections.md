# Audit Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les défauts confirmés le 21 août sans seed, sans déploiement et sans inventer de donnée.

**Architecture:** Quatre lots indépendants suivent les passages uniques déjà présents : services serveur pour les écritures, dictionnaire et métadonnées pour la langue, composants natifs pour l’accessibilité, puis suppression du code sans appelant. Chaque lot garde un diff court et possède sa propre vérification avant le lot suivant.

**Tech Stack:** Next.js 16.3, React 19, TypeScript strict, Prisma 6.19, PostgreSQL 16, Vitest 4.1, Tailwind CSS 4.

**Spec:** `docs/superpowers/specs/2026-08-21-audit-corrections-design.md`

## Global Constraints

- Aucun seed, `prisma db push`, accès à la base de production, déploiement ou push.
- Ne jamais ajouter ni compléter une decklist ; `data/raw-scrapes/` reste la source.
- Réutiliser `resolveDeckCards`, `cardnexus.ts`, `/api/decklist-image`, `overlay-server.ts` et `overlay-envoi.ts`.
- Aucun tiret cadratin dans le texte rendu ; code, noms et commentaires en français.
- Aucune dépendance nouvelle.
- Lire le guide Next.js local lié à toute API touchée avant son édition.

---

### Task 1: Sérialiser les écritures de l’habillage

**Files:**
- Modify: `src/lib/overlay-server.ts`
- Modify: `src/lib/overlay-server.test.ts` or create it beside the service

**Interfaces:**
- Consumes: `applyStateUpdate(etat, patch)` and Prisma `overlayState`.
- Produces: `fusionnerEtatOverlay(etat, patch): OverlayStateData`; `saveState` and `saveStateByToken` keep their public signatures.

- [ ] **Step 1: Write the failing test**

Add a test proving that two disjoint patches applied in sequence preserve both fields through `fusionnerEtatOverlay`.

```ts
it("conserve deux patchs sur des champs distincts", () => {
  const premier = fusionnerEtatOverlay(defaultOverlayState(), { scoreJ1: 1 });
  const second = fusionnerEtatOverlay(premier, { scoreJ2: 2 });
  expect(second.scoreJ1).toBe(1);
  expect(second.scoreJ2).toBe(2);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/overlay-server.test.ts`
Expected: FAIL because `fusionnerEtatOverlay` is not exported.

- [ ] **Step 3: Write minimal implementation**

Extract the pure merge and wrap read, row lock, merge and update in one interactive transaction. Lock by the unique key used by each public function.

```ts
export const fusionnerEtatOverlay = (etat: OverlayStateData, patch: PatchOverlay) =>
  applyStateUpdate(etat, patch as never);
```

Inside the transaction, use a parameterized Prisma query equivalent to `SELECT id FROM "OverlayState" WHERE "userId" = ${userId} FOR UPDATE`, then reread and update through the transaction client. Do not interpolate SQL text.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/overlay-server.test.ts src/lib/overlay.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "overlay: les écritures concurrentes gardent tous les changements"`

### Task 2: Fiabiliser la collection et ses frontières

**Files:**
- Create: `src/lib/collection-envoi.ts`
- Create: `src/lib/collection-envoi.test.ts`
- Modify: `src/components/collection/collection-provider.tsx`
- Modify: `src/components/collection/binder-explorer.tsx`
- Modify: `src/app/api/collection/route.ts`
- Modify: `src/app/api/collection/bulk/route.ts`
- Modify: `src/app/api/collection/import/route.ts`

**Interfaces:**
- Consumes: `creerFileEnvoi` from `src/lib/overlay-envoi.ts`.
- Produces: `creerFileCollection(envoyer, surEtat)` with `ajouter({cardId, quantity})` and `renvoyer()`.

- [ ] **Step 1: Write the failing test**

Test that two updates for the same card send only one request at a time and retain the last absolute quantity; test that a rejected send stays pending until `renvoyer()`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/collection-envoi.test.ts`
Expected: FAIL because the module does not exist.

- [ ] **Step 3: Write minimal implementation**

Wrap `creerFileEnvoi` with a merge keyed by `cardId`. Expose `etat: "envoi" | "a-jour" | "hors-ligne"` in the provider, render one `role="alert"` message and a `Réessayer` button. Reject non-integers and values outside `0..9999` in single and bulk routes. Reject imports above 2 MiB or 5,000 non-empty lines before DB work.

- [ ] **Step 4: Run targeted tests**

Run: `npx vitest run src/lib/collection-envoi.test.ts src/lib/overlay-envoi.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "collection: les quantités attendent leur sauvegarde"`

### Task 3: Rendre commentaires et écritures communautaires cohérents

**Files:**
- Create: `src/lib/reponse-json.ts`
- Create: `src/lib/reponse-json.test.ts`
- Modify: `src/components/comments.tsx`
- Modify: `src/app/d/[code]/guide-editor.tsx`
- Modify: `src/app/d/[code]/visibility-toggle.tsx`
- Modify: `src/app/deckbuilder/deckbuilder.tsx`
- Modify: `src/app/api/comments/vote/route.ts`
- Modify: `src/app/api/decks/[slug]/like/route.ts`
- Modify: `src/app/api/community-decks/[code]/route.ts`

**Interfaces:**
- Produces: `lireTableauJson<T>(response: Response): Promise<T[]>`, which throws on non-2xx or non-array JSON.

- [ ] **Step 1: Write the failing test**

Cover a valid array, HTTP 500 `{error}`, and HTTP 200 object.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/reponse-json.test.ts`
Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Write minimal implementation**

Use native `Response`; no schema package. Replace direct `r.json()` calls in comments, add loading/error states and a stable retry control. Wrap vote mutations and counter updates in one Prisma transaction. Catch only Prisma `P2002` for duplicate likes. Serialize community-deck version creation and deck update in one transaction with a row lock. Show errors for guide, visibility and `?maj=` loading.

- [ ] **Step 4: Run targeted tests**

Run: `npx vitest run src/lib/reponse-json.test.ts src/lib/admin-validation.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "communauté: les erreurs ne passent plus pour des sauvegardes"`

### Task 4: Durcir secrets, limites et CardNexus

**Files:**
- Modify: `src/app/api/collection/binders/[id]/route.ts`
- Modify: `src/app/api/cardnexus/panier/route.ts`
- Modify: `src/app/api/overlay/[token]/compagnon/route.ts`
- Modify: `src/app/api/overlay/token/route.ts`
- Test: closest existing route-independent helper tests

**Interfaces:**
- Consumes: `rateLimit`, `tooMany`, Node `crypto.randomBytes`.

- [ ] **Step 1: Write the failing test**

Extract and test `creerSlugPartage()` for the expected lowercase hexadecimal length and uniqueness over 100 calls.

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL because the exported helper does not exist.

- [ ] **Step 3: Write minimal implementation**

Use `randomBytes(12).toString("hex")`. Add existing in-memory rate limits to CardNexus, companion writes and token rotation. Bound `listesConnues` by deleting its oldest entry above 1,000 keys.

- [ ] **Step 4: Run targeted tests**

Run the new helper test and `src/lib/cardnexus.test.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "api: les liens partagés et les appels externes sont bornés"`

### Task 5: Mettre Vendetta et les sources de données au même niveau

**Files:**
- Modify: `src/app/guides/meta/page.tsx`
- Modify: `src/app/guides/debuter/page.tsx`
- Modify: `docs/META-KNOWLEDGE.md`
- Modify: `data/raw-scrapes/AGENT-INSTRUCTIONS.md`
- Modify: `data/decklists-index.json` only after checking every referenced file
- Modify: `prisma/seed-scraped-decks.ts`

**Interfaces:**
- Consumes: verified Vendetta figures in `docs/META-KNOWLEDGE.md`, tier-list seed and raw scrapes.

- [ ] **Step 1: Prove every content value**

List each replacement value with its source file and line. If a current-format number lacks a source, remove the dated number instead of replacing it.

- [ ] **Step 2: Write failing integrity tests**

Extend the existing integrity script or add a test that every `decklists-index.json` path exists and every index id is unique. Add a pure test for exact Master Yi matching.

- [ ] **Step 3: Run tests to verify they fail**

Run only the new integrity tests. Expected: FAIL on the known Atlanta duplicates and broad Master Yi match.

- [ ] **Step 4: Apply the minimum corrections**

Remove only duplicate broken index entries after matching them to existing real files. Store `riftboundId`, not Prisma `id`; fail the seeder when any deck fails; use `sideDeck` and object-form runes in the agent instructions. Do not seed.

- [ ] **Step 5: Validate**

Run new integrity tests, then `npm run validate:decks`. Expected: 0 mismatch.

- [ ] **Step 6: Commit**

`git commit -m "données: Vendetta et les imports suivent les mêmes sources"`

### Task 6: Corriger l’anglais et les signaux SEO

**Files:**
- Modify: `src/lib/i18n-server.ts`
- Modify: `src/lib/i18n-en.ts`
- Modify: `src/app/sitemap.ts`
- Modify: `public/llms.txt`
- Modify: components with French labels already present in the dictionary
- Create or modify: i18n metadata tests beside `i18n-server.ts`

**Interfaces:**
- Produces: metadata whose canonical matches the current language; sitemap entries for French and English public pages.

- [ ] **Step 1: Write failing tests**

Test a pure canonical helper: `/guides/debuter` yields `/guides/debuter` in French and `/en/guides/debuter` in English. Test that the tier-list title has an English entry.

- [ ] **Step 2: Run tests to verify they fail**

Expected: FAIL on the English canonical and missing translation.

- [ ] **Step 3: Write minimal implementation**

Have `metaTraduite` rewrite `alternates.canonical` for English. Add English sitemap variants only for public routes; use real `updatedAt` where available and stable dates for static content. Pass existing translated labels through `t()`. Update `llms.txt` to Vendetta, 109 tournaments and 23,815 decklists.

- [ ] **Step 4: Verify rendered output**

Run i18n tests and `BASE=http://localhost:3000 node scripts/audit-version-anglaise.mjs` on all edited routes. Inspect canonical and hreflang in rendered HTML.

- [ ] **Step 5: Commit**

`git commit -m "anglais: les pages publient leur vraie langue"`

### Task 7: Corriger les parcours clavier et les noms accessibles

**Files:**
- Modify: `src/components/decklist-interactive.tsx`
- Modify: `src/app/deckbuilder/components/card-browser.tsx`
- Modify: `src/app/deckbuilder/components/deck-panel.tsx`
- Modify: `src/components/user-menu.tsx`
- Modify: `src/components/deck-like-button.tsx`
- Modify: `src/app/deckbuilder/components/export-modal.tsx`
- Modify: `src/components/collection/binder-explorer.tsx`
- Modify: `src/components/collection/import-piltover.tsx`
- Test: add one static accessibility test beside the largest changed component

**Interfaces:**
- Uses native `button`, `label`, `aria-expanded`, `aria-pressed`, `role="status"` and existing focus styles.

- [ ] **Step 1: Write failing accessibility tests**

Assert that range controls have labels, collapsible buttons expose `aria-expanded`, and compact like buttons have an explicit name.

- [ ] **Step 2: Run tests to verify they fail**

Expected: FAIL on each missing attribute.

- [ ] **Step 3: Apply native fixes**

Replace clickable images and divs with buttons or links where layout permits. Otherwise add `tabIndex=0` and Enter/Space handling. Keep action buttons visible when focusable. Link labels with `htmlFor`; add live status regions for quantity and import results; remove false `role="menu"` from the user disclosure.

- [ ] **Step 4: Run tests and browser checks**

Run targeted tests, then traverse the edited flows with Tab, Enter, Space and Escape at 320 px and 200% zoom when browser control is available.

- [ ] **Step 5: Commit**

`git commit -m "accessibilité: les actions restent lisibles au clavier"`

### Task 8: Retirer le code mort sûr

**Files:**
- Delete: unused files under `src/components/ui/` after a fresh import search
- Delete: `src/app/deckbuilder/lib/export-formats.ts`
- Delete: `src/app/deckbuilder/lib/export-image.ts`
- Modify: `src/app/deckbuilder/deckbuilder.tsx`
- Modify: `src/lib/utils.ts` and its test
- Modify: exact files containing duplicate local `slugify`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Direct imports replace the two deckbuilder re-export files.

- [ ] **Step 1: Recheck every usage**

Use repository-wide import searches. Keep `button.tsx`, `dialog.tsx`, `shadcn/tailwind.css` and `tw-animate-css`. Do not delete one-shot scripts.

- [ ] **Step 2: Remove the unused files and exports**

Delete only zero-caller code. Import `slugify` from `@/lib/utils` in the two exact duplicate callers. Remove `html-to-image` and `tailwindcss-animate` through the package manager so the lockfile matches.

- [ ] **Step 3: Run focused checks**

Run `npx tsc --noEmit`, `npm test` and `npm run lint`. Expected: no missing import and no new lint error.

- [ ] **Step 4: Commit**

`git commit -m "nettoyage: retire les composants et dépendances sans appelant"`

### Task 9: Porte finale

**Files:**
- Modify: `HANDOFF.md` only if unfinished work remains

- [ ] **Step 1: Run the complete test suite**

Run `npm test`; record passed files and tests.

- [ ] **Step 2: Run lint and build gates**

Run `npm run lint`, then `npm run verify` while preserving the real exit code.

- [ ] **Step 3: Validate decklists**

Run `npm run validate:decks` with a long timeout. Require `MISMATCH=0`.

- [ ] **Step 4: Check the diff**

Run `git diff --check`, inspect every commit and ensure no `.env`, seed output, generated database file or unrelated user change entered the branch.

- [ ] **Step 5: Report without pushing**

Give the exact checks, remaining limits and commit list. Do not deploy or push without a new explicit request.
