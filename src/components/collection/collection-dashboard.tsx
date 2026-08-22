"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "@/components/lien";
import Image from "next/image";
import { CardImage } from "@/components/card-image";
import { Plus, Globe, Lock, MoreVertical, Pencil, Trash2, Share2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TYPE_LABELS_FR, RARITY_LABELS_FR, DOMAIN_LABELS_FR, DOMAIN_COLORS, DOMAIN_ICONS,
  RARITY_COLORS, rarityRank,
} from "@/lib/domains";
import { useT } from "@/components/i18n-provider";

export interface DashCard { id: string; set: string; setName: string; type: string; rarity: string; domains: string[] }
/** Une barre du rail. `setIds` peut en regrouper plusieurs (les promos). */
export interface DashSet { key: string; setIds: string[]; name: string; cardCount: number }
export interface PocketCard { id: string; name: string; imageUrl: string | null; rarity: string }
export interface DashBinder {
  id: string; name: string; description: string | null; isPublic: boolean;
  shareSlug: string | null; color: string | null; position: number; distinct: number; copies: number;
}
interface DashItem { binderId: string; cardId: string; quantity: number }

const DOMAIN_ORDER = ["Fury", "Calm", "Mind", "Body", "Chaos", "Order"];
const TYPE_ORDER = ["Legend", "Unit", "Spell", "Gear", "Battlefield", "Rune"];
// Une page de classeur physique : 3 x 3 pochettes.
const POCKETS = 9;

// Types inconnus (ajoutés par un futur set) passent en fin de liste.
const typeRank = (type: string) => {
  const i = TYPE_ORDER.indexOf(type);
  return i === -1 ? 99 : i;
};

export function CollectionDashboard({
  cards, sets, binders: initialBinders, items, pockets, maxBinders,
}: {
  cards: DashCard[]; sets: DashSet[]; binders: DashBinder[]; items: DashItem[];
  pockets: Record<string, PocketCard[]>; maxBinders: number;
}) {
  const t = useT();
  const router = useRouter();
  const [binders, setBinders] = useState(initialBinders);
  const [scope, setScope] = useState<string>("all"); // "all" | binderId
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DashBinder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const ty = byType.get(c.type) ?? { owned: 0, total: 0 }; ty.owned += owned; ty.total++; byType.set(c.type, ty);
      const r = byRarity.get(c.rarity) ?? { owned: 0, total: 0 }; r.owned += owned; r.total++; byRarity.set(c.rarity, r);
      const s = bySet.get(c.set) ?? { owned: 0, total: 0 }; s.owned += owned; s.total++; bySet.set(c.set, s);
      for (const d of c.domains) {
        const dd = byDomain.get(d) ?? { owned: 0, total: 0 }; dd.owned += owned; dd.total++; byDomain.set(d, dd);
      }
    }
    return { distinct, total, copies, byType, byRarity, bySet, byDomain };
  }, [qtyByCard, cards]);

  const pct = stats.total ? (stats.distinct / stats.total) * 100 : 0;

  async function createBinder(name: string) {
    setError(null);
    try {
      const res = await fetch("/api/collection/binders", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      const { binder } = await res.json();
      setBinders((b) => [...b, { ...binder, distinct: 0, copies: 0 }]);
      setCreating(false);
      return true;
    } catch {
      setError("Impossible de créer le classeur.");
      return false;
    }
  }

  async function renameBinder(b: DashBinder, name: string) {
    if (name === b.name) return true;
    setError(null);
    try {
      const res = await fetch(`/api/collection/binders/${b.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      setBinders((arr) => arr.map((x) => (x.id === b.id ? { ...x, name } : x)));
      return true;
    } catch {
      setError("Impossible de renommer le classeur.");
      return false;
    }
  }

  async function toggleShare(b: DashBinder) {
    setError(null);
    try {
      const res = await fetch(`/api/collection/binders/${b.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: !b.isPublic }),
      });
      if (!res.ok) throw new Error();
      const { binder } = await res.json();
      setBinders((arr) => arr.map((x) => (x.id === b.id ? { ...x, isPublic: binder.isPublic, shareSlug: binder.shareSlug } : x)));
      if (binder.isPublic && binder.shareSlug) {
        if (!navigator.clipboard) {
          setError("Le classeur est public, mais le lien n'a pas pu être copié.");
          return true;
        }
        try {
          await navigator.clipboard.writeText(`${location.origin}/collection/partage/${binder.shareSlug}`);
        } catch {
          setError("Le classeur est public, mais le lien n'a pas pu être copié.");
          return true;
        }
        setCopied(b.id);
        setTimeout(() => setCopied((c) => (c === b.id ? null : c)), 2500);
      }
      return true;
    } catch {
      setError("Impossible de modifier le partage.");
      return false;
    }
  }

  async function deleteBinder(b: DashBinder) {
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/collection/binders/${b.id}`, { method: "DELETE" });
      if (res.ok) {
        setBinders((arr) => arr.filter((x) => x.id !== b.id));
        if (scope === b.id) setScope("all");
        router.refresh();
        setPendingDelete(null);
      } else {
        setError("Impossible de supprimer le classeur.");
      }
    } catch {
      setError("Impossible de supprimer le classeur.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* En-tête : le rail des sets porte à la fois le total et la progression
          set par set. La largeur d'un segment = la taille du set. */}
      <header className="rounded-2xl border border-hairline bg-surface p-5 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Ma collection</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              <span className="font-semibold text-ink">{stats.distinct.toLocaleString("fr-FR")}</span>
              {" "}cartes différentes sur {stats.total.toLocaleString("fr-FR")}
              <span className="text-ink-muted"> · {stats.copies.toLocaleString("fr-FR")} exemplaires</span>
            </p>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-extrabold leading-none tabular-nums text-arcane">
                {pct.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}
              </span>
              <span className="font-display text-2xl font-bold text-arcane/70">%</span>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-muted">{t("des cartes du jeu")}</p>
          </div>
        </div>

        {/* La largeur d'un segment suit la taille du set : un set de 300 cartes
            pèse trois fois plus qu'un set de 100 dans la barre. */}
        <div className="mt-6 flex flex-wrap gap-x-3 gap-y-4">
          {sets.map((s) => {
            const st = s.setIds.reduce(
              (acc, id) => {
                const x = stats.bySet.get(id);
                return { owned: acc.owned + (x?.owned ?? 0), total: acc.total + (x?.total ?? 0) };
              },
              { owned: 0, total: 0 }
            );
            if (!st.total) st.total = s.cardCount;
            const p = st.total ? Math.round((st.owned / st.total) * 100) : 0;
            return (
              <div key={s.key} className="min-w-[122px] flex-1" style={{ flexGrow: Math.max(1, st.total) }}>
                <div className="flex items-baseline justify-between gap-1.5">
                  <span className="truncate text-xs font-medium text-ink-secondary" title={s.name}>{s.name}</span>
                  <span className="shrink-0 text-xs font-semibold tabular-nums text-arcane">{p}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas ring-1 ring-inset ring-hairline-strong">
                  <div className="h-full rounded-full bg-arcane transition-[width] duration-500" style={{ width: `${p}%` }} />
                </div>
                <div className="mt-1 text-[11px] tabular-nums text-ink-muted">{st.owned}/{st.total}</div>
              </div>
            );
          })}
        </div>
      </header>

      {/* Classeurs : chacun s'affiche comme une vraie page de classeur,
          9 pochettes avec tes cartes les plus rares dedans. */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="shrink-0 font-display text-lg font-bold">{t("Tes classeurs")}</h2>
          <span className="text-xs text-ink-muted">{t("Ouvre un classeur pour parcourir et gérer tes cartes")}</span>
        </div>
        {error && <p role="alert" className="mb-4 text-sm text-error-light">{error}</p>}

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {binders.map((b) => (
            <BinderPage
              key={b.id}
              binder={b}
              cards={pockets[b.id] ?? []}
              copied={copied === b.id}
              onRename={(name) => renameBinder(b, name)}
              onShare={() => toggleShare(b)}
              onDelete={() => setPendingDelete(b)}
            />
          ))}

          {binders.length < maxBinders && (
            creating ? (
              <NameForm
                label={t("Nom du classeur")}
                onSubmit={createBinder}
                onCancel={() => setCreating(false)}
                className="flex items-center justify-center rounded-2xl border border-dashed border-hairline-strong p-5"
              />
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hairline-strong text-ink-muted transition-[color,border-color,scale] hover:border-arcane hover:text-arcane active:scale-[0.98]"
              >
                <Plus size={22} />
                <span className="text-sm font-semibold">{t("Nouveau classeur")}</span>
                <span className="text-xs">{maxBinders - binders.length} {maxBinders - binders.length > 1 ? "restants" : "restant"}</span>
              </button>
            )
          )}
        </div>
      </section>

      {/* Répartition : un seul panneau, trois colonnes. */}
      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">{t("Répartition")}</h2>
          <div className="thin-scrollbar max-w-full overflow-x-auto">
            <div className="flex w-max rounded-lg border border-hairline bg-surface p-0.5">
              {[{ id: "all", name: t("Tout") }, ...binders.map((b) => ({ id: b.id, name: b.name }))].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setScope(o.id)}
                  aria-pressed={scope === o.id}
                  title={o.name}
                  className={`max-w-[140px] truncate rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    scope === o.id ? "bg-arcane text-canvas" : "text-ink-secondary hover:text-ink"
                  }`}
                >{o.name}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-hairline rounded-2xl border border-hairline bg-surface md:grid-cols-3 md:divide-x md:divide-y-0">
          <Column title={t("Par rareté")}
            rows={[...stats.byRarity.entries()]
              .sort((a, b) => rarityRank(a[0]) - rarityRank(b[0]))
              .map(([k, v]) => ({ label: RARITY_LABELS_FR[k] ?? k, owned: v.owned, total: v.total, color: RARITY_COLORS[k] ?? "#9ca3af" }))} />

          <Column title={t("Par type")}
            rows={[...stats.byType.entries()]
              .sort((a, b) => typeRank(a[0]) - typeRank(b[0]) || a[0].localeCompare(b[0]))
              .map(([k, v]) => ({ label: TYPE_LABELS_FR[k] ?? k, owned: v.owned, total: v.total, color: "var(--color-arcane)" }))} />

          <Column title={t("Par domaine")}
            rows={DOMAIN_ORDER.filter((d) => stats.byDomain.has(d)).map((d) => {
              const st = stats.byDomain.get(d)!;
              return {
                label: DOMAIN_LABELS_FR[d] ?? d, owned: st.owned, total: st.total,
                color: DOMAIN_COLORS[d] ?? "#9ca3af", icon: DOMAIN_ICONS[d],
              };
            })} />
        </div>
      </section>

      {/* Suppression : dialogue bloquant plutôt que window.confirm. Base UI gère
          le piège de focus, Échap et le retour du focus au bouton. Un clic à
          côté ferme sans supprimer : ça échoue du bon côté. */}
      <Dialog open={pendingDelete !== null} onOpenChange={(o) => { if (!o) setPendingDelete(null); }}>
        <DialogContent role="alertdialog" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{t("Supprimer ce classeur ?")}</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.name} » et les ${pendingDelete.distinct} cartes qu'il contient seront perdus. C'est définitif.`
                : ""}
            </DialogDescription>
            {error && <p role="alert" className="text-sm text-error-light">{error}</p>}
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setPendingDelete(null)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink"
            >{t("Annuler")}</button>
            <button
              onClick={() => pendingDelete && deleteBinder(pendingDelete)}
              disabled={deleting}
              className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition-[background-color,scale] hover:bg-error/90 active:scale-[0.96] disabled:opacity-60"
            >{deleting ? t("Suppression…") : t("Supprimer le classeur")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Un classeur rendu comme une page physique : perforations + 9 pochettes. */
function BinderPage({ binder: b, cards, copied, onRename, onShare, onDelete }: {
  binder: DashBinder; cards: PocketCard[]; copied: boolean;
  onRename: (name: string) => Promise<boolean>; onShare: () => Promise<boolean>; onDelete: () => void;
}) {
  const t = useT();
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const empty = b.distinct === 0;

  function closeMenu(restoreFocus = false) {
    setMenu(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  // Menu ouvert : focus sur la première entrée, Échap ferme et rend le focus au
  // bouton, un clic à côté ferme. Pas de calque plein écran, qui ajouterait un
  // arrêt de tabulation fantôme.
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector("button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeMenu(true); };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) closeMenu();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  return (
    <div className="relative rounded-2xl border border-hairline bg-surface transition-colors hover:border-hairline-accent">
      <Link href={`/collection/${b.id}`} className="flex flex-wrap gap-4 p-4" aria-label={`${t("Ouvrir le classeur")} ${b.name}`}>
        {/* Perforations de la reliure */}
        <div className="flex w-3 shrink-0 flex-col items-center justify-around py-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-canvas ring-1 ring-inset ring-hairline-strong" />
          ))}
        </div>

        {/* La page : 3 x 3 pochettes, largeur fixe pour que la carte reste un
            aperçu et pas une affiche. */}
        <div className="grid w-[168px] shrink-0 grid-cols-3 gap-1.5 sm:w-[186px]">
          {Array.from({ length: POCKETS }, (_, i) => {
            const c = cards[i];
            return (
              <div
                key={c?.id ?? `empty-${i}`}
                className="animate-fade-in overflow-hidden rounded-[3px] bg-canvas shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)] ring-1 ring-inset ring-hairline [animation-fill-mode:backwards]"
                style={{ animationDelay: `${i * 35}ms`, aspectRatio: "140 / 195" }}
              >
                {c ? <CardImage src={c.imageUrl} alt={c.name} size="sm" hoverZoom={false} className="rounded-none" /> : null}
              </div>
            );
          })}
        </div>

        {/* Sous 380 px la colonne passe sous la page plutôt que d'être écrasée. */}
        <div className="flex min-w-[170px] flex-1 flex-col justify-center gap-1 pr-8">
          <div className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: b.color ?? "var(--color-arcane)" }} aria-hidden="true" />
            <h3 className="min-w-0 truncate font-display text-lg font-bold" title={b.name}>{b.name}</h3>
          </div>

          {empty ? (
            <p className="text-sm text-ink-secondary">{t("Vide pour l'instant. Ouvre-le pour ajouter tes cartes.")}</p>
          ) : (
            <p className="text-sm text-ink-secondary">
              <span className="font-semibold tabular-nums text-ink">{b.distinct.toLocaleString("fr-FR")}</span> cartes
              <span className="text-ink-muted"> · {b.copies.toLocaleString("fr-FR")} exemplaires</span>
            </p>
          )}

          {copied ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-success"><Check size={13} /> {t("Lien copié")}</p>
          ) : b.isPublic ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-ink-muted"><Globe size={12} /> {t("Classeur public")}</p>
          ) : null}
        </div>
      </Link>

      {editing && (
        <div className="border-t border-hairline p-3">
          <NameForm
            defaultValue={b.name}
            label={t("Nom du classeur")}
            onSubmit={async (name) => {
              const success = await onRename(name);
              if (success) setEditing(false);
              return success;
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}

      <button
        ref={triggerRef}
        onClick={() => (menu ? closeMenu() : setMenu(true))}
        aria-expanded={menu}
        aria-haspopup="menu"
        aria-label={`${t("Gérer le classeur")} ${b.name}`}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-[color,background-color,scale] hover:bg-surface-raised hover:text-ink active:scale-[0.96]"
      >
        <MoreVertical size={16} />
      </button>

      {menu && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute right-2 top-12 z-20 w-52 overflow-hidden rounded-xl border border-hairline-strong bg-surface-raised py-1 shadow-2xl"
        >
          <MenuItem icon={<Pencil size={14} />} onClick={() => { setEditing(true); closeMenu(); }}>{t("Renommer")}</MenuItem>
          <MenuItem icon={b.isPublic ? <Lock size={14} /> : <Share2 size={14} />} onClick={async () => { if (await onShare()) closeMenu(true); }}>
            {b.isPublic ? t("Rendre privé") : t("Partager le lien")}
          </MenuItem>
          <MenuItem icon={<Trash2 size={14} />} danger onClick={() => { onDelete(); closeMenu(true); }}>{t("Supprimer le classeur")}</MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, children, onClick, danger }: {
  icon: React.ReactNode; children: React.ReactNode; onClick: () => void | Promise<void>; danger?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-overlay ${danger ? "text-error-light" : ""}`}
    >{icon}{children}</button>
  );
}

/** Saisie du nom d'un classeur, en ligne. Entrée valide, Échap annule, cliquer
    ailleurs valide. Le drapeau `done` évite qu'Échap déclenche aussi le blur. */
function NameForm({ defaultValue = "", label, onSubmit, onCancel, className }: {
  defaultValue?: string; label: string;
  onSubmit: (name: string) => Promise<boolean>; onCancel: () => void; className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  useEffect(() => { ref.current?.select(); }, []);

  async function commit(value: string) {
    if (done.current) return;
    done.current = true;
    const name = value.trim();
    if (name && !(await onSubmit(name))) done.current = false;
    else if (!name) onCancel();
  }

  return (
    <form className={className} onSubmit={(e) => { e.preventDefault(); commit(ref.current?.value ?? ""); }}>
      <input
        ref={ref}
        defaultValue={defaultValue}
        aria-label={label}
        placeholder={label}
        maxLength={60}
        autoFocus
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Escape") { done.current = true; onCancel(); } }}
        className="h-9 w-full rounded-lg border border-arcane bg-canvas px-2.5 text-base sm:text-sm"
      />
    </form>
  );
}

function Column({ title, rows }: {
  title: string;
  rows: { label: string; owned: number; total: number; color: string; icon?: string }[];
}) {
  return (
    <div className="p-5">
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{title}</h3>
      <div className="space-y-2.5">
        {rows.map((r) => {
          const p = r.total ? (r.owned / r.total) * 100 : 0;
          return (
            <div key={r.label}>
              <div className="flex items-baseline gap-1.5 text-xs">
                {r.icon && <Image src={r.icon} alt="" width={13} height={13} className="h-[13px] w-[13px] self-center" />}
                <span className="min-w-0 flex-1 truncate text-ink-secondary">{r.label}</span>
                <span className="shrink-0 tabular-nums text-ink-muted">{r.owned}/{r.total}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${p}%`, backgroundColor: r.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
