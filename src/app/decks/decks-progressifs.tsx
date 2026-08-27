"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/lien";
import { CountryBadge } from "@/components/country-badge";
import { DeckLikeButton } from "@/components/deck-like-button";
import { getBannerUrl } from "@/lib/banners";
import { parametresDecks, type DeckListe, type FiltresDecks, type LotDecks } from "@/lib/deck-listing-params";
import { getTournamentCountryCode, getTournamentTier } from "@/lib/tournament-flags";
import { cn, displayLegendName } from "@/lib/utils";
import { useT } from "@/components/i18n-provider";

const TIER_BG: Record<string, string> = {
  S: "bg-tier-s", A: "bg-tier-a", B: "bg-tier-b", C: "bg-tier-c", D: "bg-tier-d",
};

function CarteDeck({ deck }: { deck: DeckListe }) {
  const bannerUrl = getBannerUrl(deck.legendName);
  const couverture = deck.coverage;
  const complet = couverture?.missing === 0;
  return (
    <article className="card-hover rounded-card border border-hairline overflow-hidden group relative">
      <Link href={`/decks/${deck.slug}`} className="absolute inset-0 z-10" aria-label={`Voir le deck ${displayLegendName(deck.legendName)}`} />
      <div className="relative flex h-44 flex-col justify-end">
        {bannerUrl ? (
          <Image src={bannerUrl} alt="" fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
        ) : <div className="absolute inset-0 bg-surface-raised" />}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
        {couverture && (
          <span className={cn("absolute right-2 top-2 z-20 rounded-full px-2 py-0.5 text-[11px] font-bold shadow", complet ? "bg-emerald-500/90 text-white" : "bg-canvas/85 text-amber-300 ring-1 ring-amber-400/40")} title={complet ? "Jouable avec votre collection" : `Il vous manque ${couverture.missing} carte${couverture.missing > 1 ? "s" : ""}`}>
            {complet ? "✓ Complet" : `${couverture.owned}/${couverture.required}`}
          </span>
        )}
        <div className="relative p-4">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="line-clamp-2 text-xl font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{displayLegendName(deck.legendName)}</div>
              <div className="texte-sur-art mt-2 space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  {/* Même pastille que la première page de /decks : le tier du TOURNOI, pas `deck.tournamentTier` qui dit la qualité du résultat. Les deux rendus doivent montrer la même chose, sinon la pastille change au scroll. */}
                  {deck.tournamentContext && <span className={cn("inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-black uppercase leading-none tracking-wide text-canvas shadow-sm ring-1 ring-black/20", TIER_BG[getTournamentTier(deck.tournamentContext)] ?? "bg-ink-muted")} style={{ textShadow: "none" }} title={`Tournoi tier ${getTournamentTier(deck.tournamentContext)}`}>Tier {getTournamentTier(deck.tournamentContext)}</span>}
                  {deck.tournamentContext && <span className="flex min-w-0 items-center gap-1 text-white/90">{getTournamentCountryCode(deck.tournamentContext) && <CountryBadge code={getTournamentCountryCode(deck.tournamentContext)!} />}<span className="truncate">{deck.tournamentContext}</span></span>}
                </div>
                {(deck.placement || deck.playerName || deck.authorName) && <div className="flex items-center gap-2">{deck.placement && <span className="shrink-0 font-semibold text-ink">{deck.placement}</span>}{(deck.playerName || deck.authorName) && <span className="truncate text-white/90">par {deck.playerName || deck.authorName}</span>}</div>}
              </div>
            </div>
            <div className="relative z-20 flex shrink-0 items-center gap-1">
              <DeckLikeButton slug={deck.slug} initialLikes={deck.likes} compact />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">{deck.setTag}</span>
              {deck.featured && <span className="rounded-full bg-gold/80 px-2 py-0.5 text-[10px] font-bold text-canvas">Best of</span>}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DecksProgressifs({ initial, filtres }: { initial: LotDecks; filtres: FiltresDecks }) {
  const t = useT();
  const [decks, setDecks] = useState(initial.decks);
  const [suivant, setSuivant] = useState(initial.suivant);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const verrou = useRef(false);
  const sentinelle = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    if (suivant === null || verrou.current) return;
    verrou.current = true;
    setChargement(true);
    setErreur("");
    try {
      const query = parametresDecks({ ...filtres, offset: suivant });
      const response = await fetch(`/api/decks?${query}`);
      if (!response.ok) throw new Error();
      const lot = await response.json() as LotDecks;
      setDecks((courants) => [...courants, ...lot.decks]);
      setSuivant(lot.suivant);
    } catch {
      setErreur("Le chargement a échoué. Réessayez.");
    } finally {
      verrou.current = false;
      setChargement(false);
    }
  }, [filtres, suivant]);

  useEffect(() => {
    const element = sentinelle.current;
    if (!element || suivant === null) return;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) void charger();
      },
      { rootMargin: "300px 0px" },
    );
    observateur.observe(element);
    return () => observateur.disconnect();
  }, [charger, suivant]);

  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => <CarteDeck key={deck.id} deck={deck} />)}
      </div>
      <div ref={sentinelle} className="mt-6 flex min-h-11 flex-col items-center justify-center gap-2" aria-live="polite" aria-busy={chargement}>
        {suivant !== null && <button type="button" onClick={() => void charger()} disabled={chargement} className="min-h-11 rounded-full bg-surface-raised px-5 py-2 text-sm font-semibold text-ink hover:bg-surface disabled:cursor-wait disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-arcane">{chargement ? t("Chargement…") : t("Charger plus de decks")}</button>}
        {erreur && <p role="alert" className="text-sm text-red-400">{erreur}</p>}
        {suivant === null && <p className="text-sm text-ink-muted">{t("Tous les decks sont affichés.")}</p>}
      </div>
    </>
  );
}
