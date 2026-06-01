import { cn } from "@/lib/utils";
import type { BracketSlot } from "@/types";

interface BracketRound {
  name: string;
  matches: { a: BracketSlot; b: BracketSlot }[];
}

function Slot({ slot, champion }: { slot: BracketSlot; champion?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-2 px-2.5 py-1.5", slot.win ? "bg-gold/10" : "")}>
      <div className="flex min-w-0 items-baseline gap-1.5">
        <span className={cn("truncate text-[13px] font-semibold leading-tight", slot.win ? "text-gold" : "text-ink")}>
          {champion && slot.win && <span aria-hidden className="mr-0.5">🏆</span>}
          {slot.player}
        </span>
        {slot.legend && <span className="shrink-0 text-[10px] text-ink-muted">{slot.legend}</span>}
      </div>
      {slot.score && (
        <span
          className={cn(
            "shrink-0 rounded px-1.5 text-[11px] font-bold tabular-nums leading-5",
            slot.win ? "bg-gold/20 text-gold" : "bg-surface-raised text-ink-muted",
          )}
        >
          {slot.score}
        </span>
      )}
    </div>
  );
}

export function TournamentBracket({ title, rounds }: { title?: string; rounds: BracketRound[] }) {
  return (
    <div className="my-6">
      {title && (
        <h3 className="mb-3 text-base font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {title}
        </h3>
      )}
      <div className="grid gap-3 sm:grid-cols-3">
        {rounds.map((round, ri) => {
          const isFinal = ri === rounds.length - 1;
          return (
            <div key={round.name} className="flex flex-col justify-around gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:text-center">
                {round.name}
              </div>
              {round.matches.map((m, mi) => (
                <div
                  key={mi}
                  className={cn(
                    "overflow-hidden rounded-lg border bg-surface",
                    isFinal ? "border-gold/40" : "border-hairline",
                  )}
                >
                  <Slot slot={m.a} champion={isFinal} />
                  <div className="h-px bg-hairline/70" />
                  <Slot slot={m.b} champion={isFinal} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
