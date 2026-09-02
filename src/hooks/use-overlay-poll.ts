"use client";
import { useEffect, useRef, useState } from "react";
import type { OverlayStateData } from "@/lib/overlay";

export function useOverlayPoll(token: string, intervalMs = 1500) {
  const [state, setState] = useState<OverlayStateData | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Un seul appel en vol. Sans ce verrou, une réponse lente arrivait APRÈS la
    // suivante et remettait à l'écran un score, une manche ou une carte périmés,
    // en plein direct. La requête en cours est aussi coupée au démontage.
    let enCours = false;
    let controleur: AbortController | null = null;

    async function tick() {
      if (enCours) return;
      enCours = true;
      controleur = new AbortController();
      try {
        const r = await fetch(`/api/overlay/${token}`, { cache: "no-store", signal: controleur.signal });
        if (!r.ok) return;
        const data = (await r.json()) as OverlayStateData;
        if (!cancelled) setState(data);
      } catch {
        /* réseau ou requête coupée : on retentera au prochain tick */
      } finally {
        enCours = false;
      }
    }

    void tick();
    timer.current = setInterval(() => void tick(), intervalMs);
    return () => {
      cancelled = true;
      controleur?.abort();
      if (timer.current) clearInterval(timer.current);
    };
  }, [token, intervalMs]);

  return state;
}
