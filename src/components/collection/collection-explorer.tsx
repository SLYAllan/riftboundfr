"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CardImage } from "@/components/card-image";
import { useCollection } from "@/components/collection/collection-provider";
import { ImportPiltover } from "@/components/collection/import-piltover";
import { DOMAIN_LABELS_FR } from "@/lib/domains";

export interface CollectionCard {
  id: string;
  riftboundId: string;
  name: string;
  imageUrl: string | null;
  set: string;
  setName: string;
  type: string;
  rarity: string;
  domains: string[];
  collectorNumber: number | null;
}

export interface SetMeta {
  setId: string;
  name: string;
  cardCount: number;
}

type OwnedFilter = "all" | "owned" | "missing";

export function CollectionExplorer({ cards, sets }: { cards: CollectionCard[]; sets: SetMeta[] }) {
  const { quantities, loggedIn, loading, setQuantity } = useCollection();
  const [q, setQ] = useState("");
  const [setFilter, setSetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [owned, setOwned] = useState<OwnedFilter>("owned");
  const [showImport, setShowImport] = useState(false);

  const types = useMemo(() => [...new Set(cards.map((c) => c.type))].sort(), [cards]);
  const rarities = useMemo(() => [...new Set(cards.map((c) => c.rarity))].sort(), [cards]);
  const domains = useMemo(() => [...new Set(cards.flatMap((c) => c.domains))].sort(), [cards]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter((c) => {
      if (needle && !c.name.toLowerCase().includes(needle)) return false;
      if (setFilter !== "all" && c.set !== setFilter) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
      if (domainFilter !== "all" && !c.domains.includes(domainFilter)) return false;
      const has = (quantities[c.id] ?? 0) > 0;
      if (owned === "owned" && !has) return false;
      if (owned === "missing" && has) return false;
      return true;
    });
  }, [cards, q, setFilter, typeFilter, rarityFilter, domainFilter, owned, quantities]);

  // Stats
  const totalCopies = Object.values(quantities).reduce((s, v) => s + v, 0);
  const distinctOwned = cards.filter((c) => (quantities[c.id] ?? 0) > 0).length;
  const globalPct = cards.length ? Math.round((distinctOwned / cards.length) * 100) : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="aspect-[5/7] animate-pulse rounded-game-card bg-surface-raised" />
        ))}
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-line bg-surface-raised/40 p-8 text-center">
        <p className="mb-4 text-ink-secondary">
          Connecte-toi avec Discord pour suivre ta collection et voir tes cartes manquantes sur chaque deck.
        </p>
        <Link
          href="/api/auth/discord"
          className="inline-block rounded-lg bg-arcane px-5 py-2.5 font-semibold text-white hover:bg-arcane/90"
        >
          Se connecter avec Discord
        </Link>
      </div>
    );
  }

  const selectCls =
    "h-9 rounded-lg border border-hairline bg-surface px-2.5 text-sm text-ink focus:border-arcane focus:outline-none";

  return (
    <div>
      {/* Stats header */}
      <div className="mb-5 grid grid-cols-3 gap-3 sm:max-w-md">
        <Stat value={totalCopies} label="exemplaires" />
        <Stat value={distinctOwned} label={`/ ${cards.length} cartes`} />
        <Stat value={`${globalPct}%`} label="complétion" accent />
      </div>

      {/* Completion par set */}
      <div className="mb-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((s) => {
          const od = cards.filter((c) => c.set === s.setId && (quantities[c.id] ?? 0) > 0).length;
          const tot = cards.filter((c) => c.set === s.setId).length || s.cardCount;
          const pct = tot ? Math.round((od / tot) * 100) : 0;
          return (
            <button
              key={s.setId}
              onClick={() => setSetFilter(setFilter === s.setId ? "all" : s.setId)}
              className={`text-left ${setFilter === s.setId ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
            >
              <div className="flex justify-between text-xs">
                <span className={setFilter === s.setId ? "font-semibold text-arcane" : "font-medium"}>{s.name}</span>
                <span className="text-ink-muted">{od}/{tot}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded bg-surface-raised">
                <div className="h-1.5 rounded bg-arcane" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Import (collapsible) */}
      <div className="mb-5">
        <button
          onClick={() => setShowImport((v) => !v)}
          className="rounded-lg border border-hairline bg-surface px-3 py-1.5 text-sm font-medium text-ink-secondary hover:text-ink"
        >
          {showImport ? "▾ " : "▸ "}Importer depuis Piltover Archive
        </button>
        {showImport && <div className="mt-3"><ImportPiltover /></div>}
      </div>

      {/* Filters */}
      <div className="sticky top-[57px] z-10 -mx-4 mb-4 border-y border-hairline bg-canvas/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une carte…"
            className="h-9 min-w-[160px] flex-1 rounded-lg border border-hairline bg-surface px-3 text-sm focus:border-arcane focus:outline-none"
          />
          <div className="flex rounded-lg border border-hairline bg-surface p-0.5">
            {([["all", "Toutes"], ["owned", "Possédées"], ["missing", "Manquantes"]] as [OwnedFilter, string][]).map(
              ([v, label]) => (
                <button
                  key={v}
                  onClick={() => setOwned(v)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    owned === v ? "bg-arcane text-white" : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <select value={setFilter} onChange={(e) => setSetFilter(e.target.value)} className={selectCls}>
            <option value="all">Tous les sets</option>
            {sets.map((s) => <option key={s.setId} value={s.setId}>{s.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
            <option value="all">Tous types</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value)} className={selectCls}>
            <option value="all">Rareté</option>
            {rarities.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={domainFilter} onChange={(e) => setDomainFilter(e.target.value)} className={selectCls}>
            <option value="all">Domaine</option>
            {domains.map((d) => <option key={d} value={d}>{DOMAIN_LABELS_FR[d] ?? d}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs text-ink-muted">{filtered.length} carte{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        owned === "owned" && distinctOwned === 0 ? (
          <div className="rounded-xl border border-line bg-surface-raised/40 p-8 text-center">
            <p className="mb-2 font-medium">Ta collection est vide.</p>
            <p className="mb-4 text-sm text-ink-muted">
              Importe ton fichier Piltover Archive, ou clique « + » sous une carte (passe le filtre sur « Toutes »).
            </p>
            <button
              onClick={() => { setShowImport(true); setOwned("all"); }}
              className="rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-white hover:bg-arcane/90"
            >
              Importer ma collection
            </button>
          </div>
        ) : (
          <p className="py-16 text-center text-ink-muted">Aucune carte ne correspond aux filtres.</p>
        )
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
          {filtered.map((c) => {
            const qty = quantities[c.id] ?? 0;
            const has = qty > 0;
            return (
              <div key={c.id} className="group relative">
                <div className={`relative overflow-hidden rounded-game-card transition ${has ? "" : "opacity-45 grayscale"}`}>
                  <CardImage src={c.imageUrl} alt={c.name} size="sm" />
                  {has && (
                    <span className="absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-arcane px-1.5 text-xs font-bold text-white shadow">
                      ×{qty}
                    </span>
                  )}
                </div>
                {/* Stepper */}
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    aria-label="Retirer"
                    disabled={qty === 0}
                    onClick={() => setQuantity(c.id, qty - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-surface-raised text-ink-secondary hover:text-ink disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className={`min-w-4 text-center text-sm ${has ? "font-semibold text-arcane" : "text-ink-muted"}`}>{qty}</span>
                  <button
                    type="button"
                    aria-label="Ajouter"
                    onClick={() => setQuantity(c.id, qty + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded bg-surface-raised text-ink-secondary hover:text-ink"
                  >
                    +
                  </button>
                </div>
                <div className="mt-0.5 truncate text-center text-[10px] text-ink-muted" title={c.name}>{c.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-raised/40 px-3 py-2">
      <div className={`text-xl font-bold ${accent ? "text-arcane" : ""}`}>{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}
