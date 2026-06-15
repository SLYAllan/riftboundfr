"use client";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getLegendIconUrl } from "@/lib/banners";
import type { OverlayPlayer, OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";

function PointsTrack({ max, a, b }: { max: number; a: number; b: number }) {
  const cells: { side: "a" | "b"; v: number }[] = [];
  for (let i = 1; i <= max; i++) cells.push({ side: "a", v: i });
  for (let i = max; i >= 1; i--) cells.push({ side: "b", v: i });
  return (
    <div className="absolute left-1/2 top-3 -translate-x-1/2 flex gap-1">
      {cells.map((c, i) => {
        const active = (c.side === "a" && c.v === a) || (c.side === "b" && c.v === b);
        return (
          <span
            key={i}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold ${active ? "bg-gold text-black border-gold" : "bg-black/60 text-white/70 border-white/20"}`}
          >
            {c.v}
          </span>
        );
      })}
    </div>
  );
}

function SidePanel({ p, side, format }: { p: OverlayPlayer; side: "left" | "right"; format: OverlayStateData["format"] }) {
  const icon = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const rounds = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  return (
    <div className={`absolute top-0 ${side === "left" ? "left-0" : "right-0"} flex h-full w-[310px] flex-col items-center gap-3 bg-gradient-to-b from-[#0b1320]/95 to-[#0b1320]/80 p-3`}>
      <div className="w-full rounded bg-black/50 py-2 text-center text-2xl font-bold tracking-wide">{p.name || "—"}</div>
      <div className="w-full rounded border border-gold/40 p-2 text-center">
        {icon && <img src={icon} alt="" className="mx-auto h-24 object-contain" />}
        <div className="mt-1 text-sm font-semibold uppercase">{p.legendName}</div>
        <div className="text-xs text-white/70">{p.championName}</div>
      </div>
      {p.camEnabled && <div className="w-full flex-1 rounded border border-white/15 bg-black/20" aria-label="cam" />}
      <div className="w-full space-y-1">
        {p.battlefields.map((b, i) => (
          <div key={i} className="rounded bg-black/50 px-2 py-1 text-center text-sm font-semibold">{b}</div>
        ))}
      </div>
      {rounds > 0 && (
        <div className="flex gap-2">
          {Array.from({ length: rounds }).map((_, i) => (
            <span key={i} className={`h-5 w-5 rounded-full border-2 ${i < p.gamesWon ? "bg-gold border-gold" : "border-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

export function OverlayFull({ token }: { token: string }) {
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  return (
    <div className={styles.root}>
      <PointsTrack max={state.maxPoints} a={state.points.a} b={state.points.b} />
      <SidePanel p={state.players[0]} side="left" format={state.format} />
      <SidePanel p={state.players[1]} side="right" format={state.format} />
    </div>
  );
}
