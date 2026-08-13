"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "@/components/lien";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { useCollection } from "@/components/collection/collection-provider";
import { CardImage } from "@/components/card-image";
import { CardHover } from "@/components/collection/card-hover";
import type { DeckCoverage } from "@/lib/collection";
import type { DeckChiffre } from "@/lib/cardnexus";
import { useT } from "@/components/i18n-provider";

export interface CoverageItem {
  cardId: string;
  quantity: number;
  section?: string;
  name?: string;
}

const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

interface Props {
  items: CoverageItem[];
  /** Chiffrage du deck. Absent sur le deckbuilder, qui ne lit pas le relevé de prix. */
  prix?: DeckChiffre;
  /** Où mène « Acheter ce deck ». Voir /api/cardnexus/panier. */
  lienAchat?: string;
}

// Prix et cartes manquantes répondent à la même question — « qu'est-ce qu'il me
// faut pour jouer ce deck » — et tenaient dans deux encarts qui se suivaient.
// Réunis, le prix d'une carte s'affiche sur l'aperçu de celles qui te manquent.
//
// `quantities` du contexte sert juste de déclencheur : quand la collection change
// (stepper, import), on recalcule. Le calcul fiable (alt-art) vient du serveur.
export function DeckCoveragePanel({ items, prix, lienAchat }: Props) {
  const t = useT();
  const { loggedIn, quantities } = useCollection();
  const [coverage, setCoverage] = useState<DeckCoverage | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);

  // Signature stable des items + de la collection pour limiter les appels.
  const itemsKey = useMemo(
    () => items.map((i) => `${i.cardId}:${i.quantity}`).join("|"),
    [items],
  );
  const collKey = useMemo(() => Object.entries(quantities).map(([k, v]) => `${k}:${v}`).sort().join("|"), [quantities]);

  // La couverture est indexée par identifiant de carte, le relevé de prix par nom :
  // le nom est la seule clé que les deux partagent.
  const prixParNom = useMemo(() => {
    const m = new Map<string, { unitaire: number; lien: string | null }>();
    for (const l of prix?.lignes ?? []) {
      if (l.eurUnitaire != null) m.set(l.nom, { unitaire: l.eurUnitaire, lien: l.lien });
    }
    return m;
  }, [prix]);

  useEffect(() => {
    if (!loggedIn || items.length === 0) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      fetch("/api/collection/coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data?.coverage) setCoverage(data.coverage);
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn, itemsKey, collKey]);

  const missing = coverage?.totals.missing ?? null;
  const manquantes = coverage?.entries.filter((e) => e.missing > 0) ?? [];

  // Ce que coûterait le complément : le chiffre qui décide vraiment de l'achat.
  const resteAAcheter = manquantes.reduce((s, e) => s + (prixParNom.get(e.name)?.unitaire ?? 0) * e.missing, 0);

  const achat = prix && prix.total > 0 && lienAchat;
  const releve = prix?.releveLe ? new Date(prix.releveLe).toLocaleDateString("fr-FR") : null;

  return (
    <div className="rounded-lg border border-line bg-surface-raised/40 p-4">
      {achat && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div>
              <div className="text-sm font-semibold text-ink-secondary">Prix du deck</div>
              <div className="mt-1 text-3xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                {euros.format(prix.total)}
              </div>
              <p className="mt-1 text-xs text-ink-muted">
                Prix le plus bas sur CardNexus{releve ? `, relevé le ${releve}` : ""}.
                {prix.exemplairesSansPrix > 0 &&
                  ` ${prix.exemplairesSansPrix} carte${prix.exemplairesSansPrix > 1 ? "s" : ""} sans prix connu.`}
              </p>
            </div>
            <a
              href={lienAchat}
              target="_blank"
              rel="noopener sponsored nofollow"
              // scale au clic : le seul retour tactile d'un lien qui part sur un autre site.
              className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2.5 font-semibold text-canvas transition-[background-color,transform] duration-150 hover:bg-arcane-light active:scale-[0.96]"
            >
              {/* Logo blanc : le site n'a que le thème sombre, et le fond du bouton est foncé. */}
              <Image src="/cardnexus/mini-blanc.svg" alt="CardNexus" width={101} height={100} className="h-5 w-5" />
              Acheter ce deck
            </a>
          </div>

        </>
      )}

      <div className={achat ? "mt-5 border-t border-hairline pt-4" : ""}>
        {!loggedIn ? (
          <p className="text-sm text-ink-muted">
            <Link href="/api/auth/discord" className="text-arcane hover:underline">{t("Connecte-toi avec Discord")}</Link>{" "}
            pour voir combien de cartes il te manque pour ce deck.{" "}
            <Link href="/collection" className="text-arcane hover:underline">
              Ma collection
            </Link>
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 font-semibold transition-colors hover:text-arcane">
                <ChevronDown size={14} className={`text-ink-muted transition-transform duration-200 ${!open ? "-rotate-90" : ""}`} />
                Ma collection
              </button>
              <div className="flex items-center gap-3">
                {loading && missing === null ? (
                  <span className="text-sm text-ink-muted">Calcul…</span>
                ) : missing === 0 ? (
                  <span className="text-sm font-medium text-emerald-400">Deck complet ✓</span>
                ) : missing != null ? (
                  <button onClick={() => setOpen(!open)} className="text-sm font-medium text-amber-400 hover:underline">
                    Il te manque {missing} carte{missing > 1 ? "s" : ""}
                    {resteAAcheter > 0 && <span className="text-ink-muted"> · {euros.format(resteAAcheter)}</span>}
                  </button>
                ) : null}
                {open && missing != null && missing > 0 && (
                  <div className="flex rounded-lg border border-hairline bg-surface p-0.5">
                    <button onClick={() => setMode("grid")} aria-label="Vue cartes"
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${mode === "grid" ? "bg-arcane text-canvas" : "text-ink-muted hover:text-ink"}`}>
                      <LayoutGrid size={13} />
                    </button>
                    <button onClick={() => setMode("list")} aria-label="Vue liste"
                      className={`flex h-6 w-6 items-center justify-center rounded-md transition-colors ${mode === "list" ? "bg-arcane text-canvas" : "text-ink-muted hover:text-ink"}`}>
                      <List size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {open && manquantes.length > 0 && mode === "list" && (
              <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-0.5 text-sm sm:grid-cols-2">
                {manquantes.map((e, i) => {
                  const p = prixParNom.get(e.name);
                  return (
                    <li key={`${e.cardId}-${i}`} className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-surface-raised">
                      <span className="flex h-5 min-w-5 items-center justify-center rounded bg-amber-500 px-1 text-[11px] font-bold text-canvas">{e.missing}×</span>
                      {/* La vue liste porte les liens carte par carte : c'est le seul
                          endroit qui reste pour acheter une carte seule. */}
                      {p?.lien ? (
                        <a
                          href={p.lien}
                          target="_blank"
                          rel="noopener sponsored nofollow"
                          className="min-w-0 flex-1 truncate text-ink-secondary transition-colors hover:text-arcane hover:underline"
                        >
                          {e.name}
                        </a>
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-ink-secondary">{e.name}</span>
                      )}
                      {p && <span className="shrink-0 tabular-nums text-xs text-ink-muted">{euros.format(p.unitaire * e.missing)}</span>}
                    </li>
                  );
                })}
              </ul>
            )}

            {open && manquantes.length > 0 && mode === "grid" && (
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                {manquantes.map((e, i) => {
                  const W = 84, H = 117, OFFSET = 16;
                  const shown = Math.min(e.missing, 5);
                  const p = prixParNom.get(e.name);
                  return (
                    <CardHover
                      key={`${e.cardId}-${i}`}
                      className="group"
                      src={e.imageUrl ?? null}
                      alt={e.name}
                      width={190}
                      name={e.name}
                      type={e.type}
                      energy={e.energy}
                      might={e.might}
                      domains={e.domains}
                      note={
                        <span className="font-semibold text-amber-400">
                          Il t&apos;en manque {e.missing}
                          {p && <span className="font-normal text-ink-muted"> · {euros.format(p.unitaire * e.missing)}</span>}
                        </span>
                      }
                    >
                      <div style={{ width: W + (shown - 1) * OFFSET }}>
                        <div className="relative" style={{ height: H }}>
                          {Array.from({ length: shown }).map((_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 overflow-hidden rounded-game-card transition duration-200 group-hover:ring-2 group-hover:ring-arcane/70"
                              style={{ left: i * OFFSET, width: W, zIndex: i }}
                            >
                              <CardImage src={e.imageUrl ?? null} alt={e.name} size="sm" />
                            </div>
                          ))}
                          {e.missing > 1 && (
                            <span
                              className="absolute -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-amber-500 px-1.5 text-xs font-bold text-canvas shadow"
                              style={{ left: (shown - 1) * OFFSET + W - 18, zIndex: shown + 1 }}
                            >
                              {e.missing}×
                            </span>
                          )}
                        </div>
                        {/* Le prix sous la pile : ce qu'il en coûte de compléter CETTE
                            carte. Le nom reste dans l'aperçu au survol, l'écrire ici
                            aussi doublerait la même information. */}
                        <div className="mt-1.5 truncate text-center text-xs tabular-nums text-ink-muted">
                          {p ? euros.format(p.unitaire * e.missing) : "—"}
                        </div>
                      </div>
                    </CardHover>
                  );
                })}
              </div>
            )}

            {coverage && coverage.totals.required > 0 && (
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded bg-surface-raised">
                  <div
                    className="h-2 rounded bg-arcane transition-[width] duration-300"
                    style={{ width: `${coverage.totals.completionPct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-muted">
                  {coverage.totals.owned}/{coverage.totals.required} cartes possédées ({coverage.totals.completionPct}%)
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Note de bas d'encart : l'espace suffit à la détacher, un second trait
          dans la même carte ferait du bruit. */}
      {achat && (
        <div className="mt-6 flex items-start gap-3">
          <Image
            src="/cardnexus/logo-blanc.svg"
            alt="CardNexus"
            width={857}
            height={170}
            className="mt-0.5 h-4 w-auto shrink-0 opacity-60"
          />
          <p className="text-xs text-ink-muted">
            Riftbound France est partenaire de CardNexus. CardNexus compare les vendeurs et retient le total le
            plus bas, frais de port compris. Un achat passé par ces liens nous verse une commission, sans changer
            ton prix.
          </p>
        </div>
      )}
    </div>
  );
}
