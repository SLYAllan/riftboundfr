"use client";
import { useEffect, useState } from "react";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import type { OverlayPlayer, OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";

// Gabarit calé sur la maquette : deux colonnes de 300 px, le centre laissé
// transparent pour la zone de jeu. Tout est en pixels, la page fait 1920x1080 et
// n'est jamais redimensionnée : OBS la capture telle quelle.
const COL = 300;
const PAD = 34;
// Hauteurs fixes : les deux colonnes doivent s'aligner au pixel, quitte à laisser du
// vide en dessous. Une caméra qui flotte de dix pixels d'un côté à l'autre se voit.
const CAM_H = 470;
const BF_H = 104;

// Illustrations des champs de bataille : l'état ne transporte que des noms. On les
// résout une fois par nom via l'aperçu de carte déjà en place, et on garde le
// résultat pour toute la durée du direct — un tournoi ne change pas d'illustration.
const bfArt = new Map<string, string | null>();

function useBattlefieldArt(names: string[]): Record<string, string | null> {
  const [art, setArt] = useState<Record<string, string | null>>({});
  const key = names.join("|");
  useEffect(() => {
    let annule = false;
    const manquants = names.filter((n) => n && !bfArt.has(n));
    if (manquants.length === 0) {
      setArt(Object.fromEntries(names.filter(Boolean).map((n) => [n, bfArt.get(n) ?? null])));
      return;
    }
    Promise.all(
      manquants.map(async (n) => {
        try {
          const r = await fetch(`/api/cards/preview?name=${encodeURIComponent(n)}`);
          const c = r.ok ? await r.json() : null;
          bfArt.set(n, c?.imageUrl ?? null);
        } catch {
          bfArt.set(n, null);
        }
      }),
    ).then(() => {
      if (!annule) setArt(Object.fromEntries(names.filter(Boolean).map((n) => [n, bfArt.get(n) ?? null])));
    });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return art;
}

function Points({ max, a, b }: { max: number; a: number; b: number }) {
  const cells: { side: "a" | "b"; v: number }[] = [];
  for (let i = 1; i <= max; i++) cells.push({ side: "a", v: i });
  for (let i = max; i >= 1; i--) cells.push({ side: "b", v: i });
  return (
    <div className="absolute left-1/2 top-0 flex -translate-x-1/2 overflow-hidden rounded-b-xl border border-t-0 border-white/15 bg-black/80 shadow-[0_2px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm">
      {cells.map((c, i) => {
        const reached = c.side === "a" ? c.v <= a : c.v <= b;
        const current = (c.side === "a" && c.v === a) || (c.side === "b" && c.v === b);
        return (
          <span
            key={i}
            className={[
              "flex h-11 w-11 items-center justify-center border-r border-white/10 text-base font-bold tabular-nums last:border-r-0",
              current ? "bg-gold text-black" : reached ? "bg-white/15 text-white" : "text-white/45",
              i === max - 1 ? "border-r-2 border-r-white/30" : "",
            ].join(" ")}
          >
            {c.v}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Cadre vide : la maquette réserve la place, le contenu vient d'OBS ou plus tard.
 * Aucun fond, pas même un noir à 10 % : la caméra se pose dessous dans OBS et le
 * moindre voile la grisait. Il ne reste que le trait, plus une seconde ligne à
 * l'intérieur pour le liseré des cadres de Riftbound.
 */
function Slot({ label, className = "", style }: { label: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-label={label}
      style={style}
      className={`rounded-lg border border-white/30 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35),inset_0_0_0_4px_rgba(255,255,255,0.12)] ${className}`}
    />
  );
}

function Side({
  p,
  side,
  format,
  footer,
}: {
  p: OverlayPlayer;
  side: "left" | "right";
  format: OverlayStateData["format"];
  footer: React.ReactNode;
}) {
  // Bannière large plutôt que la vignette carrée : c'est ce que montre la
  // retransmission officielle, et l'illustration porte le panneau.
  const banner = p.legendName ? getBannerUrl(p.legendName) : null;
  const icon = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const rounds = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  // Un seul champ de bataille : c'est celui en jeu, choisi depuis le tableau de bord.
  const bf = p.battlefields[0] ?? "";
  const art = useBattlefieldArt(bf ? [bf] : []);
  return (
    <div
      className="absolute top-0 flex h-full flex-col gap-3 py-8"
      style={{ width: COL, [side]: PAD } as React.CSSProperties}
    >
      {/* Pseudo */}
      <div className="shrink-0 truncate rounded-lg bg-black/80 px-3 py-2 text-center text-xl font-bold tracking-wide text-white shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
        {p.name || "—"}
      </div>

      {/* Légende : la bannière en fond, le nom et le champion élu par-dessus */}
      <div className="relative h-[124px] shrink-0 overflow-hidden rounded-lg bg-black/70 shadow-[0_2px_10px_rgba(0,0,0,0.45)] outline outline-1 outline-white/15">
        {(banner ?? icon) && (
          <img src={(banner ?? icon)!} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />
        )}
        <div className="absolute inset-x-0 bottom-0 top-1/3 bg-gradient-to-t from-black/90 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 px-2 pb-2">
          <div className="truncate text-center text-sm font-bold uppercase leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {p.legendName || "Légende"}
          </div>
          <div className="truncate text-center text-xs leading-tight text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {p.championName || "Champion"}
          </div>
        </div>
      </div>

      {/* Caméra : le lien VDO.Ninja s'affiche dans le cadre. Sans lien, le cadre
          reste vide et transparent, la source se pose dessous dans OBS. */}
      {p.camEnabled &&
        (p.camUrl ? (
          <div
            style={{ height: CAM_H }}
            className="shrink-0 overflow-hidden rounded-lg border border-white/30 shadow-[inset_0_0_0_3px_rgba(0,0,0,0.35),inset_0_0_0_4px_rgba(255,255,255,0.12)]"
          >
            <iframe
              src={p.camUrl}
              title={`Caméra de ${p.name || "joueur"}`}
              allow="autoplay; camera; microphone; fullscreen"
              className="h-full w-full border-0"
            />
          </div>
        ) : (
          <Slot label="Caméra" className="shrink-0" style={{ height: CAM_H }} />
        ))}

      {/* Le champ de bataille en jeu, son illustration en fond, et les manches
          gagnées posées dessus comme sur la retransmission officielle. */}
      <div
        style={{ height: BF_H }}
        className="relative shrink-0 overflow-hidden rounded-lg bg-black/70 shadow-[0_2px_10px_rgba(0,0,0,0.45)] outline outline-1 outline-white/15"
      >
        {/* Agrandi de 40 % pour sortir du cadre de la carte : sans ça on voyait le
            liseré et le bandeau de titre de l'illustration. Voile léger, et un
            dégradé sous le texte seulement, pour ne pas éteindre l'art. */}
        {art[bf] && (
          <img src={art[bf]!} alt="" className="absolute inset-0 h-full w-full scale-[1.4] object-cover object-[50%_38%]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 top-1/4 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="relative flex h-full flex-col justify-end px-2 pb-2">
          <div className="truncate text-center text-sm font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {bf || "Champ de bataille"}
          </div>
          {rounds > 0 && (
            <div className="mt-2 flex justify-center gap-2.5">
              {Array.from({ length: rounds }).map((_, i) => (
                <Manche key={i} gagnee={i < p.gamesWon} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bas de colonne : chrono et logo à gauche, cartes à droite. `mt-auto` colle
          le bloc en bas, le vide reste au milieu comme demandé. */}
      <div className="mt-auto shrink-0">{footer}</div>
    </div>
  );
}

/** Manche du Bo3 : cercle vide, et le logo au centre dès qu'elle est gagnée. */
function Manche({ gagnee }: { gagnee: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
        gagnee ? "border-gold bg-gold/20" : "border-white/50 bg-black/30"
      }`}
    >
      {gagnee && <img src="/icons/RainbowRune.webp" alt="" className="h-4 w-4 object-contain" />}
    </span>
  );
}

function Timer({ endsAt, round }: { endsAt?: string | null; round: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = endsAt ? Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000)) : null;
  const mm = left === null ? "--" : String(Math.floor(left / 60)).padStart(2, "0");
  const ss = left === null ? "--" : String(left % 60).padStart(2, "0");
  return (
    <div className="rounded-lg bg-black/85 px-3 py-2 text-center shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
      <div className="text-3xl font-bold tabular-nums leading-none text-white">
        {mm}:{ss}
      </div>
      {round && <div className="mt-1 truncate text-xs font-semibold uppercase tracking-wide text-white/70">{round}</div>}
    </div>
  );
}

export function OverlayFull({ token }: { token: string }) {
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  const { event } = state;
  return (
    <div className={styles.root}>
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} />
      <Side
        p={state.players[0]}
        side="left"
        format={state.format}
        footer={
          <div className="mt-3 flex flex-col gap-3">
            {event.logoUrl ? (
              <img src={event.logoUrl} alt="" className="mx-auto max-h-[150px] w-auto object-contain" />
            ) : (
              <Slot label="Logo du tournoi" style={{ height: 150 }} />
            )}
            <Timer endsAt={event.endsAt} round={event.round} />
          </div>
        }
      />
      <Side
        p={state.players[1]}
        side="right"
        format={state.format}
        footer={<Slot label="Cartes" className="mt-3" style={{ height: 340 }} />}
      />
    </div>
  );
}
