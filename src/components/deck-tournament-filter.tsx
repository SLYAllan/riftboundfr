"use client";

import { Popover } from "@base-ui/react/popover";
import { ChevronDown, Trophy } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CountryBadge } from "@/components/country-badge";
import { useLien, useT } from "@/components/i18n-provider";
import { modifierParametresDecks } from "@/lib/deck-listing-params";

interface TournoiOption {
  valeur: string;
  libelle: string;
  pays: string | null;
}

export function DeckTournamentFilter({ options }: { options: TournoiOption[] }) {
  const t = useT();
  const router = useRouter();
  const lien = useLien();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = searchParams.get("tournament") ?? "";
  const selection = options.find((option) => option.valeur === current);

  function choisir(value: string) {
    const params = modifierParametresDecks(searchParams, { tournament: value || null });
    setOpen(false);
    router.push(lien(params.size ? `/decks?${params}` : "/decks"));
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="group flex h-11 min-w-52 cursor-pointer items-center gap-2 rounded-lg border border-hairline-strong bg-canvas px-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-arcane">
        {selection?.pays ? <CountryBadge code={selection.pays} /> : <Trophy size={16} className="text-ink-muted" />}
        <span className="min-w-0 flex-1 truncate">{selection?.libelle ?? t("Tous les tournois")}</span>
        <ChevronDown size={15} className={`shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </Popover.Trigger>
      <Popover.Portal>
      <Popover.Positioner sideOffset={8} align="start" className="z-50">
      <Popover.Popup className="thin-scrollbar max-h-[min(65vh,32rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-hairline-strong bg-surface p-2 shadow-2xl shadow-black/50 focus:outline-none">
        <button type="button" onClick={() => choisir("")} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-ink-secondary hover:bg-surface-raised hover:text-ink">
          <Trophy size={16} className="shrink-0 text-ink-muted" /> {t("Tous les tournois")}
        </button>
        {options.map((option) => (
          <button key={option.valeur} type="button" onClick={() => choisir(option.valeur)} aria-pressed={current === option.valeur} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-surface-raised ${current === option.valeur ? "bg-surface-raised font-semibold text-arcane" : "text-ink-secondary hover:text-ink"}`}>
            <span className="w-6 shrink-0">{option.pays ? <CountryBadge code={option.pays} /> : null}</span>
            <span className="truncate">{option.libelle}</span>
          </button>
        ))}
      </Popover.Popup>
      </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
