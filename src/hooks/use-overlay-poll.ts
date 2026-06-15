"use client";
import { useEffect, useRef, useState } from "react";
import type { OverlayStateData } from "@/lib/overlay";

export function useOverlayPoll(token: string, intervalMs = 1500) {
  const [state, setState] = useState<OverlayStateData | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function tick() {
      try {
        const r = await fetch(`/api/overlay/${token}`, { cache: "no-store" });
        if (!r.ok) return;
        const data = (await r.json()) as OverlayStateData;
        if (!cancelled) setState(data);
      } catch {
        /* réseau : on retentera au prochain tick */
      }
    }
    tick();
    timer.current = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [token, intervalMs]);

  return state;
}
