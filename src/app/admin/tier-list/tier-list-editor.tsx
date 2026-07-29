"use client";

import { useState, useMemo } from "react";
import { cn, displayLegendName } from "@/lib/utils";
import { TIER_BANNER, TIER_TEXT_CLASS } from "@/lib/tier-colors";

interface Legend {
  riftboundId: string;
  name: string;
  set: string;
  setName: string;
  imageUrl: string | null;
  iconUrl: string | null;
  domains: string[];
}

interface TierEntry {
  legendId: string;
  legendName: string;
  tier: string;
  position: number;
  comment: string | null;
  deckId: string | null;
}

interface TierListData {
  id: string;
  title: string;
  description: string | null;
  format: string;
  setContext: string | null;
  published: boolean;
  current: boolean;
  entries: TierEntry[];
}

const TIERS = ["S", "A", "B", "C", "D"] as const;

// Les couleurs viennent de la source partagée : l'éditeur montrait S en ambre alors
// que le site le montre en rouge, et l'accueil/tier-list encore autrement.

const SET_OPTIONS = [
  { value: "Global", label: "Globale (toutes les légendes)" },
  { value: "Origins", label: "Origins (OGN)" },
  { value: "Spiritforged", label: "Spiritforged (SFD)" },
  { value: "Unleashed", label: "Unleashed (UNL)" },
];

interface Props {
  initialTierLists: TierListData[];
  allLegends: Legend[];
  idAliases?: Record<string, string>;
}

export function TierListEditor({ initialTierLists, allLegends, idAliases = {} }: Props) {
  const [tierLists, setTierLists] = useState<TierListData[]>(() => {
    return initialTierLists.map((tl) => {
      const seen = new Set<string>();
      const entries = tl.entries
        .map((e) => ({
          ...e,
          legendId: idAliases[e.legendId] ?? e.legendId,
        }))
        .filter((e) => {
          if (seen.has(e.legendId)) return false;
          seen.add(e.legendId);
          return true;
        });
      return { ...tl, entries };
    });
  });
  const [activeId, setActiveId] = useState<string | null>(
    tierLists[0]?.id ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);
  const [assigningLegend, setAssigningLegend] = useState<string | null>(null);

  const active = tierLists.find((tl) => tl.id === activeId) ?? null;

  const availableLegends = useMemo(() => {
    if (!active) return [];
    const assignedIds = new Set(active.entries.map((e) => e.legendId));
    return allLegends.filter((l) => !assignedIds.has(l.riftboundId));
  }, [active, allLegends]);

  const totalForSet = allLegends.length;

  function updateActive(fn: (tl: TierListData) => TierListData) {
    setTierLists((prev) =>
      prev.map((tl) => (tl.id === activeId ? fn(tl) : tl)),
    );
  }

  function addToTier(legendId: string, tier: string) {
    const legend = allLegends.find((l) => l.riftboundId === legendId);
    if (!legend || !active) return;
    updateActive((tl) => ({
      ...tl,
      entries: [
        ...tl.entries,
        {
          legendId,
          legendName: legend.name,
          tier,
          position: tl.entries.filter((e) => e.tier === tier).length,
          comment: null,
          deckId: null,
        },
      ],
    }));
    setAssigningLegend(null);
  }

  function removeEntry(legendId: string) {
    updateActive((tl) => ({
      ...tl,
      entries: tl.entries.filter((e) => e.legendId !== legendId),
    }));
  }

  function moveEntry(legendId: string, newTier: string) {
    updateActive((tl) => ({
      ...tl,
      entries: tl.entries.map((e) =>
        e.legendId === legendId ? { ...e, tier: newTier } : e,
      ),
    }));
  }

  function findLegend(legendId: string): Legend | undefined {
    const resolved = idAliases[legendId] ?? legendId;
    return allLegends.find((l) => l.riftboundId === resolved);
  }

  async function handleSave() {
    if (!active) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/tier-list", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: active.id,
          title: active.title,
          description: active.description,
          setContext: active.setContext,
          published: active.published,
          current: active.current,
          entries: active.entries.map((e, i) => ({ ...e, position: i })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Erreur" });
      } else {
        setMessage({ type: "ok", text: "Sauvegardé" });
        setTierLists((prev) =>
          prev.map((tl) => (tl.id === data.id ? data : tl)),
        );
      }
    } catch {
      setMessage({ type: "err", text: "Erreur réseau" });
    }
    setSaving(false);
  }

  async function handleCreate() {
    try {
      const res = await fetch("/api/admin/tier-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nouvelle Tier List",
          setContext: "Global",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTierLists((prev) => [...prev, data]);
        setActiveId(data.id);
        setMessage(null);
      }
    } catch {
      setMessage({ type: "err", text: "Erreur création" });
    }
  }

  async function handleDelete() {
    if (!active || !confirm("Supprimer cette tier list ?")) return;
    try {
      const res = await fetch("/api/admin/tier-list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: active.id }),
      });
      if (res.ok) {
        const remaining = tierLists.filter((tl) => tl.id !== active.id);
        setTierLists(remaining);
        setActiveId(remaining[0]?.id ?? null);
        setMessage(null);
      }
    } catch {
      setMessage({ type: "err", text: "Erreur suppression" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {tierLists.map((tl) => (
          <button
            key={tl.id}
            onClick={() => {
              setActiveId(tl.id);
              setMessage(null);
              setAssigningLegend(null);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              activeId === tl.id
                ? "bg-arcane text-canvas"
                : "bg-surface border border-hairline text-ink-secondary hover:text-ink",
            )}
          >
            {tl.setContext ?? tl.title}
            {!tl.published && (
              <span className="ml-1 text-xs opacity-60">(brouillon)</span>
            )}
          </button>
        ))}
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-surface border border-dashed border-hairline text-ink-muted hover:text-ink hover:border-ink-muted transition-colors"
        >
          + Créer
        </button>
      </div>

      {active && (
        <>
          {/* Settings */}
          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink-muted mb-1">
                  Titre
                </label>
                <input aria-label="Titre"
                  type="text"
                  value={active.title}
                  onChange={(e) =>
                    updateActive((tl) => ({ ...tl, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-hairline text-ink text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-muted mb-1">Set</label>
                <select aria-label="Set"
                  value={active.setContext ?? "Global"}
                  onChange={(e) =>
                    updateActive((tl) => ({
                      ...tl,
                      setContext: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-lg bg-canvas border border-hairline text-ink text-sm"
                >
                  {SET_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={active.published}
                  onChange={(e) =>
                    updateActive((tl) => ({
                      ...tl,
                      published: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Publiée
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-secondary">
                <input
                  type="checkbox"
                  checked={active.current}
                  onChange={(e) =>
                    updateActive((tl) => ({
                      ...tl,
                      current: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
                Actuelle (tab par défaut)
              </label>
              <span className="text-xs text-ink-muted ml-auto">
                {active.entries.length} / {totalForSet} légendes classées
              </span>
            </div>
          </div>

          {/* Tier rows */}
          <div className="rounded-xl border border-hairline overflow-hidden">
            {TIERS.map((tier) => {
              const entries = active.entries.filter((e) => e.tier === tier);
              return (
                <div
                  key={tier}
                  className="flex border-b border-hairline last:border-b-0"
                >
                  <div
                    className={cn(
                      "flex w-16 shrink-0 items-center justify-center text-2xl font-black",
                      TIER_BANNER[tier]?.bg,
                      TIER_BANNER[tier]?.text,
                    )}
                    style={{ fontFamily: "var(--font-rubik)" }}
                  >
                    {tier}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 p-3 flex-1 min-h-[68px] bg-surface">
                    {entries.map((entry) => {
                      const legend = findLegend(entry.legendId);
                      const imgSrc =
                        legend?.iconUrl ?? legend?.imageUrl ?? null;
                      return (
                        <div key={entry.legendId} className="group relative">
                          <div className="rounded-lg overflow-hidden">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={entry.legendName}
                                title={entry.legendName}
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-raised text-[9px] text-ink-muted"
                                title={entry.legendName}
                              >
                                {displayLegendName(entry.legendName).split(",")[0].slice(0, 6)}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeEntry(entry.legendId)}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-canvas text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Retirer"
                          >
                            &times;
                          </button>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {TIERS.filter((t) => t !== tier).map((t) => (
                              <button
                                key={t}
                                onClick={() => moveEntry(entry.legendId, t)}
                                className={cn(
                                  "h-6 w-6 rounded-sm bg-surface-raised text-[10px] font-bold flex items-center justify-center shadow ring-1 ring-hairline",
                                  TIER_TEXT_CLASS[t],
                                )}
                                title={`Vers ${t}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {entries.length === 0 && (
                      <span className="text-xs text-ink-muted italic">
                        Vide
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Available legends */}
          <div className="p-4 rounded-xl bg-surface border border-hairline">
            <h2 className="text-sm font-semibold text-ink mb-3">
              Légendes disponibles ({availableLegends.length})
            </h2>
            {availableLegends.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {availableLegends.map((legend) => {
                  const imgSrc = legend.iconUrl ?? legend.imageUrl ?? null;
                  const isOpen = assigningLegend === legend.riftboundId;
                  return (
                    <div key={legend.riftboundId} className="relative">
                      <button
                        onClick={() =>
                          setAssigningLegend(isOpen ? null : legend.riftboundId)
                        }
                        className={cn(
                          "rounded-lg transition hover:scale-105",
                          isOpen && "ring-2 ring-arcane scale-105",
                        )}
                        title={legend.name}
                      >
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={legend.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-raised text-[9px] text-ink-muted">
                            {legend.name.split(",")[0].slice(0, 6)}
                          </div>
                        )}
                      </button>
                      {isOpen && (
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                          {TIERS.map((t) => (
                            <button
                              key={t}
                              onClick={() => addToTier(legend.riftboundId, t)}
                              className={cn(
                                "h-7 w-7 rounded bg-surface-raised text-xs font-bold flex items-center justify-center shadow-lg ring-1 ring-hairline hover:scale-110 transition-transform",
                                TIER_TEXT_CLASS[t],
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-ink-muted">
                Toutes les légendes sont classées
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-arcane text-canvas font-semibold text-sm hover:bg-arcane-light transition-colors disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-2.5 rounded-lg bg-red-500/10 text-red-400 font-semibold text-sm hover:bg-red-500/20 transition-colors"
            >
              Supprimer
            </button>
            {message && (
              <span
                className={cn(
                  "text-sm font-medium",
                  message.type === "ok" ? "text-green-400" : "text-red-400",
                )}
              >
                {message.text}
              </span>
            )}
          </div>
        </>
      )}

      {!active && tierLists.length === 0 && (
        <div className="p-12 rounded-xl bg-surface border border-hairline text-center">
          <p className="text-ink-muted">
            Aucune tier list. Cliquez sur &laquo; + Créer &raquo; pour
            commencer.
          </p>
        </div>
      )}
    </div>
  );
}
