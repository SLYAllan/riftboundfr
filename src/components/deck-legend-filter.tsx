"use client";

import Image from "next/image";
import { Popover } from "@base-ui/react/popover";
import { ChevronDown, Users } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLien, useT } from "@/components/i18n-provider";
import { getLegendIconUrl } from "@/lib/banners";
import { modifierParametresDecks } from "@/lib/deck-listing-params";
import { displayLegendName } from "@/lib/utils";

export function DeckLegendFilter({ legends }: { legends: string[] }) {
  const t = useT();
  const router = useRouter();
  const lien = useLien();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = searchParams.get("legend") ?? "";
  const currentIcon = current ? getLegendIconUrl(current) : null;
  const seen = new Map<string, string>();
  for (const name of legends) if (!seen.has(name.toLowerCase())) seen.set(name.toLowerCase(), name);
  const uniqueLegends = [...seen.values()].sort((a, b) => a.localeCompare(b, "fr"));

  function choisir(value: string) {
    const params = modifierParametresDecks(searchParams, { legend: value || null });
    setOpen(false);
    router.push(lien(params.size ? `/decks?${params}` : "/decks"));
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="group flex h-11 min-w-56 cursor-pointer items-center gap-2 rounded-lg border border-hairline-strong bg-canvas px-2.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-arcane">
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-md bg-surface-raised">
          {currentIcon ? <Image src={currentIcon} alt="" fill sizes="28px" className="object-cover" /> : <Users className="m-1.5 text-ink-muted" size={16} />}
        </span>
        <span className="min-w-0 flex-1 truncate">{current ? displayLegendName(current) : t("Toutes les Légendes")}</span>
        <ChevronDown size={15} className={`shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </Popover.Trigger>
      <Popover.Portal>
      <Popover.Positioner sideOffset={8} align="start" className="z-50">
      <Popover.Popup className="w-[min(36rem,calc(100vw-2rem))] rounded-xl border border-hairline-strong bg-surface p-3 shadow-2xl shadow-black/50 focus:outline-none">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Choisir une Légende")}</span>
          {current && <button type="button" onClick={() => choisir("")} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-arcane hover:bg-surface-raised">{t("Voir toutes")}</button>}
        </div>
        <div className="thin-scrollbar grid max-h-[min(60vh,32rem)] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
          {uniqueLegends.map((name) => {
            const icon = getLegendIconUrl(name);
            const active = name.toLowerCase() === current.toLowerCase();
            return (
              <button key={name} type="button" title={displayLegendName(name)} aria-pressed={active} onClick={() => choisir(name)} className={`group/tile min-w-0 rounded-lg border p-1.5 text-center transition-colors ${active ? "border-arcane bg-surface-raised text-arcane" : "border-transparent text-ink-secondary hover:border-hairline-strong hover:bg-surface-raised hover:text-ink"}`}>
                <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-md bg-canvas">
                  {icon ? <Image src={icon} alt="" fill sizes="80px" className="object-cover transition-transform group-hover/tile:scale-105" /> : <Users className="absolute inset-0 m-auto text-ink-muted" size={22} />}
                </span>
                <span className="mt-1 block truncate text-[11px] font-semibold">{displayLegendName(name).split(",")[0]}</span>
              </button>
            );
          })}
        </div>
      </Popover.Popup>
      </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
