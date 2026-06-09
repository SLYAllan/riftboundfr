"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Folder, Plus, Globe, Lock, Layers, Hash, PieChart, Heart, MoreVertical, Pencil, Trash2, Share2 } from "lucide-react";
import { TYPE_LABELS_FR, RARITY_LABELS_FR, DOMAIN_LABELS_FR, DOMAIN_COLORS, DOMAIN_ICONS } from "@/lib/domains";

export interface DashCard { id: string; set: string; setName: string; type: string; rarity: string; domains: string[] }
export interface DashSet { setId: string; name: string; cardCount: number }
const DOMAIN_ORDER = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];
export interface DashBinder {
  id: string; name: string; description: string | null; isPublic: boolean;
  shareSlug: string | null; color: string | null; position: number; distinct: number; copies: number;
}
interface DashItem { binderId: string; cardId: string; quantity: number }

const TYPE_ORDER = ["Legend", "Unit", "Spell", "Gear", "Battlefield", "Rune"];
const RARITY_ORDER = ["Common", "Uncommon", "Rare", "Epic", "Showcase", "Mythic", "Legendary"];
const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af", Uncommon: "#34d399", Rare: "#60a5fa", Epic: "#c084fc", Showcase: "#fbbf24", Mythic: "#fb7185", Legendary: "#f59e0b",
};

export function CollectionDashboard({
  cards, sets, binders: initialBinders, items, wishlistCount, maxBinders,
}: {
  cards: DashCard[]; sets: DashSet[]; binders: DashBinder[]; items: DashItem[];
  wishlistCount: number; maxBinders: number;
}) {
  const router = useRouter();
  const [binders, setBinders] = useState(initialBinders);
  const [scope, setScope] = useState<string>("all"); // "all" | binderId
  const [busy, setBusy] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  // quantités cardId -> qty selon le scope sélectionné
  const qtyByCard = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) {
      if (scope !== "all" && it.binderId !== scope) continue;
      m.set(it.cardId, (m.get(it.cardId) ?? 0) + it.quantity);
    }
    return m;
  }, [items, scope]);

  const stats = useMemo(() => {
    const distinct = qtyByCard.size;
    const total = cards.length;
    let copies = 0;
    for (const q of qtyByCard.values()) copies += q;

    const byType = new Map<string, { owned: number; total: number }>();
    const byRarity = new Map<string, { owned: number; total: number }>();
    const bySet = new Map<string, { owned: number; total: number }>();
    const byDomain = new Map<string, { owned: number; total: number }>();
    for (const c of cards) {
      const owned = qtyByCard.has(c.id) ? 1 : 0;
      const t = byType.get(c.type) ?? { owned: 0, total: 0 }; t.owned += owned; t.total++; byType.set(c.type, t);
      const r = byRarity.get(c.rarity) ?? { owned: 0, total: 0 }; r.owned += owned; r.total++; byRarity.set(c.rarity, r);
      const s = bySet.get(c.set) ?? { owned: 0, total: 0 }; s.owned += owned; s.total++; bySet.set(c.set, s);
      for (const d of c.domains) {
        const dd = byDomain.get(d) ?? { owned: 0, total: 0 }; dd.owned += owned; dd.total++; byDomain.set(d, dd);
      }
    }
    return { distinct, total, copies, byType, byRarity, bySet, byDomain };
  }, [qtyByCard, cards]);

  const completion = stats.total ? ((stats.distinct / stats.total) * 100).toFixed(2) : "0";

  async function createBinder() {
    if (binders.length >= maxBinders) return;
    const name = window.prompt("Nom du nouveau classeur :")?.trim();
    if (!name) return;
    setBusy(true);
    try {
      const res = await fetch("/api/collection/binders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const { binder } = await res.json();
        setBinders((b) => [...b, { ...binder, distinct: 0, copies: 0 }]);
      }
    } finally { setBusy(false); }
  }

  async function renameBinder(b: DashBinder) {
    const name = window.prompt("Renommer le classeur :", b.name)?.trim();
    if (!name || name === b.name) return;
    const res = await fetch(`/api/collection/binders/${b.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
    });
    if (res.ok) setBinders((arr) => arr.map((x) => (x.id === b.id ? { ...x, name } : x)));
    setMenuFor(null);
  }

  async function toggleShare(b: DashBinder) {
    const res = await fetch(`/api/collection/binders/${b.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !b.isPublic }),
    });
    if (res.ok) {
      const { binder } = await res.json();
      setBinders((arr) => arr.map((x) => (x.id === b.id ? { ...x, isPublic: binder.isPublic, shareSlug: binder.shareSlug } : x)));
      if (binder.isPublic && binder.shareSlug) {
        const url = `${location.origin}/collection/partage/${binder.shareSlug}`;
        navigator.clipboard?.writeText(url).catch(() => {});
        window.alert(`Classeur partagé ! Lien copié :\n${url}`);
      }
    }
    setMenuFor(null);
  }

  async function deleteBinder(b: DashBinder) {
    if (!window.confirm(`Supprimer le classeur « ${b.name} » et toutes ses cartes ?`)) return;
    const res = await fetch(`/api/collection/binders/${b.id}`, { method: "DELETE" });
    if (res.ok) {
      setBinders((arr) => arr.filter((x) => x.id !== b.id));
      if (scope === b.id) setScope("all");
      router.refresh();
    }
    setMenuFor(null);
  }

  return (
    <div>
      {/* Hero RBF */}
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface p-6 sm:p-8">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 50%, var(--color-arcane) 0%, transparent 55%), radial-gradient(circle at 85% 30%, var(--color-violet) 0%, transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-arcane to-violet">
              <Layers className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                Ma collection Riftbound
              </h1>
              <p className="text-sm text-ink-secondary">
                {stats.distinct} / {stats.total} cartes collectées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <div className="text-3xl font-extrabold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{completion}%</div>
              <div className="text-[11px] uppercase tracking-wider text-ink-muted">complétion</div>
            </div>
            <div className="hidden h-14 w-14 sm:block">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-hairline, #2a2a35)" strokeWidth="4" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-arcane)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(Number(completion) / 100) * 97.4} 97.4`} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Binders */}
      <section className="mt-6">
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Tes classeurs</h2>
          <span className="text-xs text-ink-muted">Ouvre un classeur pour parcourir et gérer tes cartes</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {binders.map((b) => (
            <div key={b.id} className="relative rounded-xl border border-hairline bg-surface-raised/40 p-4 hover:border-arcane/40">
              <Link href={`/collection/${b.id}`} className="block">
                <div className="flex items-center gap-2">
                  <Folder size={18} className="text-arcane" style={b.color ? { color: b.color } : undefined} />
                  <span className="font-semibold">{b.name}</span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-ink-muted">
                    {b.isPublic ? <><Globe size={11} /> Partagé</> : <><Lock size={11} /> Privé</>}
                  </span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div><span className="text-2xl font-bold text-arcane">{b.distinct}</span> <span className="text-xs text-ink-muted">cartes</span></div>
                  <span className="text-xs text-ink-muted">{b.copies} ex.</span>
                </div>
              </Link>
              <button onClick={() => setMenuFor(menuFor === b.id ? null : b.id)} className="absolute right-2 top-2 rounded p-1 text-ink-muted hover:text-ink" aria-label="Gérer">
                <MoreVertical size={15} />
              </button>
              {menuFor === b.id && (
                <div className="absolute right-2 top-9 z-20 w-40 rounded-lg border border-hairline bg-surface py-1 shadow-xl">
                  <button onClick={() => renameBinder(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-surface-raised"><Pencil size={13} /> Renommer</button>
                  <button onClick={() => toggleShare(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-surface-raised"><Share2 size={13} /> {b.isPublic ? "Rendre privé" : "Partager"}</button>
                  <button onClick={() => deleteBinder(b)} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-400 hover:bg-surface-raised"><Trash2 size={13} /> Supprimer</button>
                </div>
              )}
            </div>
          ))}
          {binders.length < maxBinders && (
            <button onClick={createBinder} disabled={busy} className="flex min-h-[104px] items-center justify-center gap-2 rounded-xl border border-dashed border-hairline-strong text-ink-muted hover:border-arcane hover:text-arcane disabled:opacity-50">
              <Plus size={16} /> Nouveau classeur <span className="text-xs">({maxBinders - binders.length} restant{maxBinders - binders.length > 1 ? "s" : ""})</span>
            </button>
          )}
        </div>
      </section>

      {/* Statistics */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Statistiques</h2>
          <select value={scope} onChange={(e) => setScope(e.target.value)} className="h-9 rounded-lg border border-hairline bg-surface px-3 text-sm">
            <option value="all">Tous les classeurs</option>
            {binders.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Layers size={16} />} label="Cartes collectées" value={String(stats.distinct)} sub={`sur ${stats.total} disponibles`} accent />
          <StatCard icon={<Hash size={16} />} label="Total de cartes" value={stats.copies.toLocaleString("fr-FR")} sub="doublons inclus" />
          <StatCard icon={<PieChart size={16} />} label="Complétion" value={`${completion}%`} sub="progression globale" />
          <StatCard icon={<Heart size={16} />} label="Wishlist" value={String(wishlistCount)} sub="cartes désirées" />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Breakdown title="Cartes par type"
            rows={[...stats.byType.entries()].sort((a, b) => TYPE_ORDER.indexOf(a[0]) - TYPE_ORDER.indexOf(b[0]))
              .map(([k, v]) => ({ label: TYPE_LABELS_FR[k] ?? k, owned: v.owned, total: v.total, color: "var(--color-arcane, #8b5cf6)" }))} />
          <Breakdown title="Cartes par rareté"
            rows={[...stats.byRarity.entries()].sort((a, b) => RARITY_ORDER.indexOf(a[0]) - RARITY_ORDER.indexOf(b[0]))
              .map(([k, v]) => ({ label: RARITY_LABELS_FR[k] ?? k, owned: v.owned, total: v.total, color: RARITY_COLORS[k] ?? "#9ca3af" }))} />
        </div>
      </section>

      {/* Progression par domaine */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-secondary">Progression par domaine</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {DOMAIN_ORDER.map((d) => {
            const st = stats.byDomain.get(d) ?? { owned: 0, total: 0 };
            const pct = st.total ? Math.round((st.owned / st.total) * 100) : 0;
            const color = DOMAIN_COLORS[d] ?? "#9ca3af";
            return (
              <div key={d} className="rounded-xl border border-hairline bg-surface-raised/40 p-4">
                <div className="flex items-center gap-2">
                  {DOMAIN_ICONS[d] && (
                    <Image src={DOMAIN_ICONS[d]} alt={DOMAIN_LABELS_FR[d] ?? d} width={18} height={18} className="h-[18px] w-[18px]" />
                  )}
                  <span className="text-sm font-semibold" style={{ color }}>{DOMAIN_LABELS_FR[d] ?? d}</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-muted"><span>{st.owned}/{st.total}</span><span>{pct}%</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-surface"><div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: color }} /></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sets */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-secondary">Progression par set</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sets.map((s) => {
            const st = stats.bySet.get(s.setId) ?? { owned: 0, total: s.cardCount };
            const pct = st.total ? Math.round((st.owned / st.total) * 100) : 0;
            return (
              <div key={s.setId} className="rounded-xl border border-hairline bg-surface-raised/40 p-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-xs font-semibold text-arcane">{pct}%</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-ink-muted"><span>{st.owned}/{st.total} cartes</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded bg-surface"><div className="h-full rounded bg-gradient-to-r from-arcane to-violet" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-raised/40 p-4">
      <div className="flex items-center justify-between text-ink-muted"><span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>{icon}</div>
      <div className={`mt-2 text-2xl font-bold ${accent ? "text-arcane" : ""}`}>{value}</div>
      <div className="text-xs text-ink-muted">{sub}</div>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; owned: number; total: number; color: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  return (
    <div className="rounded-xl border border-hairline bg-surface-raised/40 p-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{title}</h3>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-sm">
            <span className="w-24 shrink-0 text-ink-secondary">{r.label}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded bg-surface">
              <div className="h-full rounded" style={{ width: `${(r.owned / max) * 100}%`, backgroundColor: r.color }} />
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-ink-muted">{r.owned}/{r.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
