"use client";

import { Popover } from "@base-ui/react/popover";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useT } from "@/components/i18n-provider";
import { rechercherMotsCles, type FiltreMotCle } from "@/lib/card-keywords";

const CATEGORIES = [
  { value: "mot-cle", label: "Mots-clés" },
  { value: "declencheur", label: "Déclencheurs" },
  { value: "ressource", label: "Ressources" },
] as const;

export function KeywordFilter({ options, value, onChange }: {
  options: FiltreMotCle[];
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [recherche, setRecherche] = useState("");
  const selection = options.find((option) => option.value === value);
  const visibles = rechercherMotsCles(options, recherche);

  function choisir(nouvelleValeur: string) {
    onChange(nouvelleValeur);
    setRecherche("");
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={(ouvert) => { setOpen(ouvert); if (!ouvert) setRecherche(""); }}>
      <Popover.Trigger className="group flex min-h-11 max-w-52 items-center gap-2 rounded-lg border border-hairline-strong bg-surface px-2.5 text-xs text-ink transition-colors hover:border-arcane focus-visible:outline-2 focus-visible:outline-arcane sm:min-h-8">
        <Sparkles size={14} className="shrink-0 text-arcane" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{selection ? t(selection.label) : t("Mécaniques")}</span>
        <ChevronDown size={14} aria-hidden="true" className={`shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} align="start" className="z-50">
          <Popover.Popup className="flex max-h-[min(70vh,34rem,var(--available-height))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-hairline-strong bg-surface p-2 shadow-2xl shadow-black/50 focus:outline-none">
            <div className="relative mb-2">
              <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input autoFocus value={recherche} onChange={(event) => setRecherche(event.target.value)} aria-label={t("Rechercher une mécanique")} placeholder={t("Rechercher une mécanique")} className="h-11 w-full rounded-lg border border-hairline bg-canvas pl-9 pr-9 text-sm text-ink placeholder:text-ink-muted focus:border-arcane focus:outline-none" />
              {recherche && <button type="button" onClick={() => setRecherche("")} aria-label={t("Effacer la recherche")} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-arcane"><X size={14} /></button>}
            </div>

            <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
              <button type="button" onClick={() => choisir("")} aria-pressed={!value} className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm text-ink-secondary hover:bg-surface-raised hover:text-ink focus-visible:outline-2 focus-visible:outline-arcane"><span className="flex-1">{t("Toutes les mécaniques")}</span></button>
              {CATEGORIES.map((categorie) => {
                const elements = visibles.filter((option) => option.categorie === categorie.value);
                if (elements.length === 0) return null;
                return <section key={categorie.value} className="mt-2 border-t border-hairline pt-2 first:mt-0 first:border-0 first:pt-0">
                  <h3 className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">{t(categorie.label)}</h3>
                  {elements.map((option) => {
                    const active = value === option.value;
                    return <button key={option.value} type="button" onClick={() => choisir(option.value)} aria-pressed={active} className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-arcane ${active ? "bg-surface-raised font-semibold text-arcane" : "text-ink-secondary hover:bg-surface-raised hover:text-ink"}`}><span className="min-w-0 flex-1 truncate">{t(option.label)}</span><span className="min-w-7 rounded-md bg-canvas px-1.5 py-0.5 text-center text-xs tabular-nums text-ink-muted">{option.count}</span></button>;
                  })}
                </section>;
              })}
              {visibles.length === 0 && <p className="px-3 py-8 text-center text-sm text-ink-muted">{t("Aucune mécanique disponible")}</p>}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
