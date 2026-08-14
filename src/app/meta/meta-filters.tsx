"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "@/components/lien";
import { useT } from "@/components/i18n-provider";
import { legendHref } from "@/lib/legend-fiche";
import { cn } from "@/lib/utils";
import { calculerMeta, type TrancheMeta } from "@/lib/meta-stats";

interface LegendeMeta {
  legendName: string;
  shortName: string;
  iconUrl: string | null;
}

interface Props {
  tranches: TrancheMeta[];
  legendes: LegendeMeta[];
  sets: string[];
}

export function MetaFilters({ tranches, legendes, sets }: Props) {
  const t = useT();
  const setInitial = sets.includes("Vendetta") ? "Vendetta" : "all";
  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedSet, setSelectedSet] = useState(setInitial);

  const tournoisDisponibles = useMemo(
    () => [...new Set(
      tranches
        .filter((tranche) => selectedSet === "all" || tranche.set === selectedSet)
        .map((tranche) => tranche.tournament),
    )].sort(),
    [tranches, selectedSet],
  );

  function choisirSet(set: string) {
    setSelectedSet(set);
    setSelectedTournament("all");
  }

  const meta = useMemo(
    () => calculerMeta(tranches, { tournoi: selectedTournament, set: selectedSet }),
    [tranches, selectedTournament, selectedSet],
  );
  const details = useMemo(
    () => new Map(legendes.map((legende) => [legende.legendName, legende])),
    [legendes],
  );
  const tournoisSelectionnes = useMemo(
    () => new Set(
      tranches
        .filter((tranche) => selectedSet === "all" || tranche.set === selectedSet)
        .filter((tranche) => selectedTournament === "all" || tranche.tournament === selectedTournament)
        .map((tranche) => tranche.tournament),
    ).size,
    [tranches, selectedSet, selectedTournament],
  );
  const maximum = meta.legendes[0]?.deckCount ?? 0;

  return (
    <>
      <section className="mt-8 border-y border-hairline py-5" aria-label={t("Périmètre analysé")}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-bold tabular-nums text-ink">{meta.totalDecks.toLocaleString("fr-FR")}</p>
            <p className="mt-1 text-xs text-ink-muted">{t("decklists complètes")}</p>
          </div>
          <div className="border-l border-hairline pl-4">
            <p className="text-2xl font-bold tabular-nums text-ink">{tournoisSelectionnes}</p>
            <p className="mt-1 text-xs text-ink-muted">{t("tournois")}</p>
          </div>
          <div className="col-span-2 border-t border-hairline pt-4 sm:col-span-1 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="text-2xl font-bold tabular-nums text-ink">{meta.legendes.length}</p>
            <p className="mt-1 text-xs text-ink-muted">{t("Légendes représentées")}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-card border border-hairline bg-surface p-4 sm:p-5" aria-label={t("Filtres du méta")}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Set")}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => choisirSet("all")}
                className={cn(
                  "min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors",
                  selectedSet === "all" ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink",
                )}
              >
                {t("Tous")}
              </button>
              {sets.map((set) => (
                <button
                  key={set}
                  type="button"
                  onClick={() => choisirSet(set)}
                  className={cn(
                    "min-h-10 rounded-lg px-3 text-sm font-semibold transition-colors",
                    selectedSet === set ? "bg-arcane text-canvas" : "bg-surface-raised text-ink-muted hover:text-ink",
                  )}
                >
                  {set}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Tournoi")}</span>
            <select
              value={selectedTournament}
              onChange={(event) => setSelectedTournament(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-hairline bg-surface-raised px-3 text-sm text-ink focus:border-arcane focus:outline-none focus-visible:ring-2 focus-visible:ring-arcane"
            >
              <option value="all">{t("Tous les tournois")}</option>
              {tournoisDisponibles.map((tournoi) => <option key={tournoi} value={tournoi}>{tournoi}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="mt-8" aria-labelledby="classement-meta">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="classement-meta" className="text-2xl font-bold font-display">{t("Légendes les plus jouées")}</h2>
            <p className="mt-1 text-sm text-ink-muted">{t("Classement recalculé selon les filtres actifs.")}</p>
          </div>
          <p className="text-sm tabular-nums text-ink-secondary" aria-live="polite">
            {meta.totalDecks.toLocaleString("fr-FR")} {t("decklists")}
          </p>
        </div>

        {meta.legendes.length === 0 ? (
          <div className="mt-6 rounded-card border border-hairline bg-surface p-8 text-center text-ink-secondary">
            {t("Aucune légende trouvée avec ces filtres.")}
          </div>
        ) : (
          <ol className="mt-4 overflow-hidden rounded-card border border-hairline bg-surface">
            {meta.legendes.map((legende, index) => {
              const detail = details.get(legende.legendName);
              return (
                <li key={legende.legendName} className="border-b border-hairline last:border-b-0">
                  <Link
                    href={legendHref(legende.legendName)}
                    className="group grid min-h-20 grid-cols-[2.25rem_3.5rem_minmax(0,1fr)] items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-raised sm:grid-cols-[2.5rem_3.5rem_minmax(180px,0.8fr)_minmax(180px,1.2fr)_6rem] sm:px-5"
                  >
                    <span className="text-center text-sm font-bold tabular-nums text-ink-muted">{index + 1}</span>
                    {detail?.iconUrl ? (
                      <Image src={detail.iconUrl} alt="" width={56} height={56} className="size-14 rounded-lg object-cover" />
                    ) : (
                      <span className="flex size-14 items-center justify-center rounded-lg bg-surface-raised text-xs text-ink-muted">?</span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink group-hover:text-arcane">{detail?.shortName ?? legende.legendName}</p>
                      <p className="mt-1 text-xs text-ink-muted sm:hidden">{legende.deckCount} decks · {legende.popularity}%</p>
                    </div>
                    <div className="col-start-2 col-span-2 h-2 overflow-hidden rounded-full bg-surface-raised sm:col-start-auto sm:col-span-1">
                      <div
                        className="h-full rounded-full bg-arcane"
                        style={{ width: `${maximum ? (legende.deckCount / maximum) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="font-bold tabular-nums text-ink">{legende.popularity}%</p>
                      <p className="text-xs tabular-nums text-ink-muted">{legende.deckCount} decks</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>
  );
}
