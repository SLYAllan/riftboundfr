"use client";

import { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { CardImage } from "@/components/card-image";
import { CardHover } from "@/components/collection/card-hover";
import { ImportPiltover } from "@/components/collection/import-piltover";
import { DOMAIN_LABELS_FR, TYPE_LABELS_FR, RARITY_LABELS_FR, DOMAIN_COLORS, DOMAIN_ICONS } from "@/lib/domains";
import { Upload, Download, Share2, Lock, Globe, ChevronDown } from "lucide-react";
import { downloadBlob } from "@/lib/download";
import { useT } from "@/components/i18n-provider";

const DOMAIN_ORDER = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];

export interface BinderCard {
  id: string; riftboundId: string; name: string; imageUrl: string | null;
  set: string; setName: string; type: string; supertype: string | null; rarity: string;
  domains: string[]; energy: number | null; might: number | null; power: number | null;
  collectorNumber: number | null; alternateArt: boolean; overnumbered: boolean; signature: boolean;
}
export interface BinderSetMeta { setId: string; name: string }
interface BinderInfo { id: string; name: string; isPublic: boolean; shareSlug: string | null }
type Owned = "all" | "owned" | "missing";
type SortKey = "id" | "name" | "rarity" | "energy";

const RARITY_ORDER: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Showcase: 4, Mythic: 5, Legendary: 6 };
const PAGE_SIZE = 42;

function variantOf(c: BinderCard): string {
  if (c.signature) return "sig";
  if (c.overnumbered) return "over";
  if (c.alternateArt) return "alt";
  return "normal";
}
const VARIANT_LABELS: Record<string, string> = { normal: "Normale", alt: "Alt Art", over: "Overnumbered", sig: "Signature" };

export function BinderExplorer({
  binder, cards, sets, initialQuantities,
}: {
  binder: BinderInfo; cards: BinderCard[]; sets: BinderSetMeta[];
  initialQuantities: Record<string, number>;
}) {
  const t = useT();
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);
  const [isPublic, setIsPublic] = useState(binder.isPublic);
  const [shareSlug, setShareSlug] = useState(binder.shareSlug);

  const [q, setQ] = useState("");
  const [setF, setSetF] = useState("all");
  const [typeF, setTypeF] = useState("all");
  const [superF, setSuperF] = useState("all");
  const [variantF, setVariantF] = useState("all");
  const [rarityF, setRarityF] = useState("all");
  const [domainF, setDomainF] = useState("all");
  const [owned, setOwned] = useState<Owned>("all");
  // Plafonds tirés des cartes, jamais écrits en dur : le curseur Might était
  // bloqué à 10 alors que la base monte à 12, donc Baron Nashor et Master Yi,
  // Unstoppable étaient introuvables quoi qu'on fasse. Un futur set qui dépasse
  // ces valeurs ne peut plus escamoter de cartes.
  const capE = useMemo(() => Math.max(1, ...cards.map((c) => c.energy ?? 0)), [cards]);
  const capP = useMemo(() => Math.max(1, ...cards.map((c) => c.power ?? 0)), [cards]);
  const capM = useMemo(() => Math.max(1, ...cards.map((c) => c.might ?? 0)), [cards]);
  const [maxE, setMaxE] = useState(capE);
  const [maxP, setMaxP] = useState(capP);
  const [maxM, setMaxM] = useState(capM);
  const [sort, setSort] = useState<SortKey>("id");
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);

  const types = useMemo(() => [...new Set(cards.map((c) => c.type))].sort(), [cards]);
  const supers = useMemo(() => [...new Set(cards.map((c) => c.supertype).filter(Boolean) as string[])].sort(), [cards]);
  const rarities = useMemo(() => [...new Set(cards.map((c) => c.rarity))].sort((a, b) => (RARITY_ORDER[a] ?? 9) - (RARITY_ORDER[b] ?? 9)), [cards]);
  const domains = useMemo(() => [...new Set(cards.flatMap((c) => c.domains))].sort(), [cards]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = cards.filter((c) => {
      if (needle && !c.name.toLowerCase().includes(needle)) return false;
      if (setF !== "all" && c.set !== setF) return false;
      if (typeF !== "all" && c.type !== typeF) return false;
      if (superF !== "all" && c.supertype !== superF) return false;
      if (variantF !== "all" && variantOf(c) !== variantF) return false;
      if (rarityF !== "all" && c.rarity !== rarityF) return false;
      if (domainF !== "all" && !c.domains.includes(domainF)) return false;
      if (c.energy != null && c.energy > maxE) return false;
      if (c.power != null && c.power > maxP) return false;
      if (c.might != null && c.might > maxM) return false;
      const has = (quantities[c.id] ?? 0) > 0;
      if (owned === "owned" && !has) return false;
      if (owned === "missing" && has) return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "rarity") return (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0);
      if (sort === "energy") return (a.energy ?? 99) - (b.energy ?? 99);
      return a.set.localeCompare(b.set) || (a.collectorNumber ?? 0) - (b.collectorNumber ?? 0);
    });
    return out;
  }, [cards, q, setF, typeF, superF, variantF, rarityF, domainF, maxE, maxP, maxM, owned, sort, quantities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageClamped = Math.min(page, totalPages);
  const visible = filtered.slice((pageClamped - 1) * PAGE_SIZE, pageClamped * PAGE_SIZE);

  const distinctOwned = cards.filter((c) => (quantities[c.id] ?? 0) > 0).length;
  const copies = Object.values(quantities).reduce((s, v) => s + v, 0);

  const setQuantity = useCallback((cardId: string, qty: number) => {
    const next = Math.max(0, qty);
    setQuantities((prev) => {
      const u = { ...prev };
      if (next <= 0) delete u[cardId]; else u[cardId] = next;
      return u;
    });
    fetch("/api/collection", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ binderId: binder.id, cardId, quantity: next }),
    }).catch(() => {});
  }, [binder.id]);

  function exportCsv() {
    const rows = [["name", "set", "number", "rarity", "quantity"]];
    for (const c of cards) {
      const qty = quantities[c.id] ?? 0;
      if (qty > 0) rows.push([c.name, c.set, String(c.collectorNumber ?? ""), c.rarity, String(qty)]);
    }
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${binder.name.replace(/\s+/g, "-").toLowerCase()}.csv`);
  }

  async function toggleShare() {
    const res = await fetch(`/api/collection/binders/${binder.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !isPublic }),
    });
    if (res.ok) {
      const { binder: b } = await res.json();
      setIsPublic(b.isPublic); setShareSlug(b.shareSlug);
      if (b.isPublic && b.shareSlug) {
        const url = `${location.origin}/collection/partage/${b.shareSlug}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        window.alert(`Classeur partagé ! Lien copié :\n${url}`);
      }
    }
  }

  function clearAll() {
    setQ(""); setSetF("all"); setTypeF("all"); setSuperF("all"); setVariantF("all");
    setRarityF("all"); setDomainF("all"); setOwned("all"); setMaxE(capE); setMaxP(capP); setMaxM(capM); setPage(1);
  }

  const activeFilters = [setF, typeF, superF, variantF, rarityF, domainF].filter((v) => v !== "all").length
    + (owned !== "all" ? 1 : 0) + (q ? 1 : 0) + (maxE < capE || maxP < capP || maxM < capM ? 1 : 0);

  return (
    <div className="mt-2">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-bold">{binder.name}</h1>
        <span className="text-sm text-ink-muted">{distinctOwned} cartes · {copies} exemplaires</span>
      </div>

      {/* Filters - label + valeur, icônes de domaine */}
      <details className="group mt-4 rounded-xl border border-hairline bg-surface-raised/30 p-3">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between font-semibold text-ink sm:hidden [&::-webkit-details-marker]:hidden">
          <span>{t("Filtres")}{activeFilters > 0 ? ` (${activeFilters})` : ""}</span>
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="hidden group-open:block sm:block">
        {/* Ligne 1 : recherche + statut + tri */}
        <div className="flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={t("Rechercher une carte…")}
            aria-label={t("Rechercher une carte")} type="search"
            className="h-9 min-w-[200px] flex-1 rounded-lg border border-hairline bg-surface px-3 text-base focus:border-arcane sm:text-sm" />
          <div className="flex rounded-lg border border-hairline bg-surface p-0.5">
            {([["all", "Toutes"], ["owned", "Possédées"], ["missing", "Manquantes"]] as [Owned, string][]).map(([v, l]) => (
              <button key={v} onClick={() => { setOwned(v); setPage(1); }}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${owned === v ? "bg-arcane text-canvas" : "text-ink-secondary hover:text-ink"}`}>{l}</button>
            ))}
          </div>
          <FilterPill label="Tri" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="id">ID</option><option value="name">Nom</option><option value="rarity">{t("Rareté")}</option><option value="energy">{t("Énergie")}</option>
          </FilterPill>
        </div>

        {/* Ligne 2 : domaines (icônes) + sélecteurs */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            {DOMAIN_ORDER.filter((d) => domains.includes(d) && DOMAIN_ICONS[d]).map((d) => {
              const active = domainF === d;
              return (
                <button key={d} onClick={() => { setDomainF(active ? "all" : d); setPage(1); }} title={DOMAIN_LABELS_FR[d] ?? d}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${active ? "" : "border-hairline opacity-50 hover:opacity-100"}`}
                  style={active ? { borderColor: DOMAIN_COLORS[d], backgroundColor: `${DOMAIN_COLORS[d]}22` } : undefined}>
                  <Image src={DOMAIN_ICONS[d]} alt={DOMAIN_LABELS_FR[d] ?? d} width={20} height={20} className="h-5 w-5" />
                </button>
              );
            })}
          </div>
          <span className="mx-1 hidden h-6 w-px bg-hairline sm:block" />
          <FilterPill label="Set" value={setF} onChange={(e) => { setSetF(e.target.value); setPage(1); }}>
            <option value="all">{t("Tous")}</option>{sets.map((s) => <option key={s.setId} value={s.setId}>{s.name}</option>)}
          </FilterPill>
          <FilterPill label="Type" value={typeF} onChange={(e) => { setTypeF(e.target.value); setPage(1); }}>
            <option value="all">{t("Tous")}</option>{types.map((t) => <option key={t} value={t}>{TYPE_LABELS_FR[t] ?? t}</option>)}
          </FilterPill>
          <FilterPill label="Supertype" value={superF} onChange={(e) => { setSuperF(e.target.value); setPage(1); }}>
            <option value="all">{t("Tous")}</option>{supers.map((t) => <option key={t} value={t}>{t}</option>)}
          </FilterPill>
          <FilterPill label="Variante" value={variantF} onChange={(e) => { setVariantF(e.target.value); setPage(1); }}>
            <option value="all">{t("Toutes")}</option>{["normal", "alt", "over", "sig"].map((v) => <option key={v} value={v}>{VARIANT_LABELS[v]}</option>)}
          </FilterPill>
          <FilterPill label={t("Rareté")} value={rarityF} onChange={(e) => { setRarityF(e.target.value); setPage(1); }}>
            <option value="all">{t("Toutes")}</option>{rarities.map((r) => <option key={r} value={r}>{RARITY_LABELS_FR[r] ?? r}</option>)}
          </FilterPill>
        </div>

        {/* Ligne 3 : sliders */}
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Slider label={t("Énergie max")} value={maxE} max={capE} onChange={(v) => { setMaxE(v); setPage(1); }} />
          <Slider label="Pouvoir max" value={maxP} max={capP} onChange={(v) => { setMaxP(v); setPage(1); }} />
          <Slider label="Might max" value={maxM} max={capM} onChange={(v) => { setMaxM(v); setPage(1); }} />
        </div>

        {/* Footer */}
        <div className="mt-3 flex min-h-10 items-center gap-3 border-t border-hairline pt-3 text-xs">
          <span className="text-ink-muted">{t("Actif :")} {activeFilters > 0 ? activeFilters : t("aucun")}</span>
          {activeFilters > 0 && <button onClick={clearAll} className="text-arcane hover:underline">{t("Tout effacer")}</button>}
          <span className="ml-auto font-semibold text-arcane">{filtered.length} {t(filtered.length === 1 ? "carte" : "cartes")}</span>
        </div>
        </div>
      </details>

      {/* Toolbar */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button onClick={() => setShowImport((v) => !v)} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink"><Upload size={13} /> Importer</button>
        <button onClick={exportCsv} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink"><Download size={13} /> Exporter CSV</button>
        <button onClick={toggleShare} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink">
          {isPublic ? <><Globe size={13} />{" "}{t("Partagé")}</> : <><Lock size={13} /> Rendre public</>}
        </button>
      </div>
      {showImport && <div className="mt-3"><ImportPiltover binderId={binder.id} /></div>}
      {isPublic && shareSlug && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted"><Share2 size={12} /> Lien public : <code className="rounded bg-surface-raised px-1.5 py-0.5">/collection/partage/{shareSlug}</code></p>
      )}

      {/* Grid */}
      {visible.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">{t("Aucune carte ne correspond aux filtres.")}</p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
          {visible.map((c) => {
            const qty = quantities[c.id] ?? 0;
            const has = qty > 0;
            return (
              <div key={c.id} className="group relative">
                {/* L'aperçu au survol ne se déclenche QUE sur l'image, pas sur le stepper */}
                <CardHover
                  src={c.imageUrl}
                  alt={c.name}
                  name={c.name}
                  type={c.type}
                  energy={c.energy}
                  might={c.might}
                  domains={c.domains}
                  note={has ? <span className="font-semibold text-arcane">×{qty} en collection</span> : <span className="text-ink-muted">{t("Non possédée")}</span>}
                >
                  <div className={`relative overflow-hidden rounded-game-card transition group-hover:ring-2 group-hover:ring-arcane/70 ${has ? "" : "opacity-40 grayscale"}`}>
                    <CardImage src={c.imageUrl} alt={c.name} size="sm" />
                    {has && <span className="absolute right-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-arcane px-1.5 text-xs font-bold text-canvas shadow">×{qty}</span>}
                  </div>
                </CardHover>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <button disabled={qty === 0} onClick={() => setQuantity(c.id, qty - 1)} className="flex size-8 items-center justify-center rounded bg-surface-raised text-ink-secondary hover:text-ink disabled:opacity-30 sm:size-6">−</button>
                  <span className={`min-w-4 text-center text-sm tabular-nums ${has ? "font-semibold text-arcane" : "text-ink-muted"}`}>{qty}</span>
                  <button onClick={() => setQuantity(c.id, qty + 1)} className="flex size-8 items-center justify-center rounded bg-surface-raised text-ink-secondary hover:text-ink sm:size-6">+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button disabled={pageClamped <= 1} onClick={() => setPage(pageClamped - 1)} className="rounded-lg bg-surface-raised px-3 py-1.5 text-sm disabled:opacity-30">←</button>
          <span className="text-sm text-ink-muted">Page {pageClamped} / {totalPages}</span>
          <button disabled={pageClamped >= totalPages} onClick={() => setPage(pageClamped + 1)} className="rounded-lg bg-surface-raised px-3 py-1.5 text-sm disabled:opacity-30">→</button>
        </div>
      )}
    </div>
  );
}

function FilterPill({ label, value, onChange, children }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode;
}) {
  const active = value !== "all" && value !== "id";
  return (
    // max-w : un select natif se dimensionne sur son option la plus longue.
    // Sans plafond, « Riftbound Organized Play Promotional Cards » pousse la
    // pastille à 361px et fait défiler toute la page sur mobile.
    <div className={`relative flex h-11 max-w-full items-center gap-1.5 rounded-lg border bg-surface pl-2.5 pr-7 transition-colors hover:border-arcane/40 sm:h-9 ${active ? "border-arcane/50" : "border-hairline"}`}>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-ink-muted">{label}</span>
      <select value={value} onChange={onChange} aria-label={label} className="min-w-0 max-w-[150px] cursor-pointer appearance-none bg-transparent text-sm text-ink">
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 text-ink-muted" />
    </div>
  );
}

function Slider({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-ink-muted"><span>{label}</span><span>{value >= max ? "Tout" : `≤ ${value}`}</span></div>
      <input type="range" min={0} max={max} value={value} aria-label={label} onChange={(e) => onChange(Number(e.target.value))} className="h-6 w-full accent-arcane" />
    </div>
  );
}
