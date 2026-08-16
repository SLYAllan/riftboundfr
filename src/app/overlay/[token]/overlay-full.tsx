"use client";
import { useEffect, useState } from "react";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import type { OverlayPlayer, OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";
import { FitText } from "./fit-text";
import { useT } from "@/components/i18n-provider";

// Gabarit calé sur la maquette : deux colonnes de 300 px, le centre laissé
// transparent pour la zone de jeu. Tout est en pixels, la page fait 1920x1080 et
// n'est jamais redimensionnée : OBS la capture telle quelle.
// Le fond fourni (public/stream/test.webp) porte les cadres dorés et ses découpes
// sont transparentes. Tout ce qui suit est mesuré dessus au pixel, en 1920x1080 :
// on remplit ses trous, on ne redessine rien.
const SLOT = {
  x: { left: 43, right: 1606 },
  width: 275,
  name: { top: 24, height: 56 },
  legend: { top: 88, height: 141 },
  cam: { top: 246, height: 299 },
  bf: { top: 545, height: 90 },
  // Case dorée du bas relevée au pixel sur le fond : x 102-253, y 968-1019.
  timer: { left: 102, top: 968, width: 152, height: 52 },
  round: { top: 906, height: 52 },
  cardsLeft: { left: 43, top: 688, width: 268, height: 366 },
  cards: { left: 1608, top: 688, width: 268, height: 366 },
} as const;

// Illustrations des champs de bataille : l'état ne transporte que des noms. On les
// résout une fois par nom via l'aperçu de carte déjà en place, et on garde le
// résultat pour toute la durée du direct — un tournoi ne change pas d'illustration.
const bfArt = new Map<string, string | null>();

function useBattlefieldArt(names: string[]): Record<string, string | null> {
  const [art, setArt] = useState<Record<string, string | null>>({});
  const key = names.join("|");
  const cached = Object.fromEntries(names.filter(Boolean).map((n) => [n, bfArt.get(n) ?? null]));
  useEffect(() => {
    let annule = false;
    const manquants = names.filter((n) => n && !bfArt.has(n));
    if (manquants.length === 0) return;
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
  return Object.fromEntries(names.filter(Boolean).map((n) => [n, art[n] ?? cached[n] ?? null]));
}

/**
 * Le lien de caméra vient de l'état, que plusieurs personnes peuvent remplir, et la
 * page d'overlay est ouverte par d'autres. Une URL `javascript:` dans un iframe
 * s'exécuterait sur le domaine du site : on n'accepte donc que du https chez
 * VDO.Ninja, et rien d'autre ne s'affiche.
 */
function camSrc(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return null;
    if (!/(^|\.)vdo\.ninja$/i.test(u.hostname)) return null;
    // Le son doit rester coupé : la voix passe déjà par la table de mixage, sinon
    // c'est du double son et de l'écho en direct.
    if (!u.searchParams.has("muted")) u.searchParams.set("muted", "1");
    return u.toString();
  } catch {
    return null;
  }
}

function Points({ max, a, b }: { max: number; a: number; b: number }) {
  const cells: { side: "a" | "b"; v: number }[] = [];
  for (let i = 1; i <= max; i++) cells.push({ side: "a", v: i });
  for (let i = max; i >= 1; i--) cells.push({ side: "b", v: i });
  return (
    // Ronds detaches, anneau dore sur fond sombre, comme sur la retransmission. Le
    // score courant est rempli en dore, chiffre en encre sombre. Les deux 8 du
    // milieu, le seuil de victoire, portent un double anneau.
    <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2.5">
      {cells.map((c, i) => {
        const actif = (c.side === "a" && c.v === a) || (c.side === "b" && c.v === b);
        const seuil = c.v === max;
        return (
          <span
            key={`${i}-${actif}`}
            className={[
              styles.apparait,
              "flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold tabular-nums ring-1 ring-gold/80",
              i === max ? "ml-3" : "",
              actif ? "bg-gold text-[#1b1408]" : "bg-[#0b1220]/85 text-white",
            ].join(" ")}
            style={{
              boxShadow: seuil
                ? "0 0 0 3px rgba(11,18,32,0.85), 0 0 0 4px rgba(212,168,67,0.85), 0 2px 8px rgba(0,0,0,0.5)"
                : "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {c.v}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Emplacement laissé vide : rien du tout, ni fond ni trait. Le cadre doré vient de
 * l'image de fond ; en dessiner un second par-dessus donnait une double bordure sur
 * la sortie OBS. Le composant ne sert plus qu'à réserver la place et à nommer la
 * zone pour les lecteurs d'écran et les captures.
 */
function Slot({ label, className = "", style }: { label: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-label={label}
      style={style}
      className={className}
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
  const t = useT();
  // Bannière large plutôt que la vignette carrée : c'est ce que montre la
  // retransmission officielle, et l'illustration porte le panneau.
  const banner = p.legendName ? getBannerUrl(p.legendName) : null;
  const icon = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const rounds = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  // Un seul champ de bataille : c'est celui en jeu, choisi depuis le tableau de bord.
  const bf = p.battlefields[0] ?? "";
  const art = useBattlefieldArt(bf ? [bf] : []);
  const cam = camSrc(p.camUrl);
  const [camCharge, setCamCharge] = useState(false);
  return (
    <div className="absolute inset-0">
      {/* Pseudo, sur le bandeau au-dessus du premier cadre */}
      <div
        className="absolute z-20 flex flex-col justify-center overflow-hidden px-2"
        style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.name.top, height: SLOT.name.height }}
      >
        <FitText chars={13} className="text-2xl font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {p.name || "—"}
        </FitText>
      </div>

      {/* Légende : la bannière remplit la découpe, le nom et le champion par-dessus */}
      <div
        className="absolute overflow-hidden"
        style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.legend.top, height: SLOT.legend.height }}
      >
        {(banner ?? icon) && (
          <img src={(banner ?? icon)!} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden px-2 pb-2">
          <FitText chars={26} className="text-base font-bold uppercase leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {p.legendName || t("Légende")}
          </FitText>
          <FitText chars={34} className="text-sm leading-tight text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {p.championName || "Champion"}
          </FitText>
        </div>
      </div>

      {/* Caméra : le lien VDO.Ninja s'affiche dans le cadre. Sans lien, le cadre
          reste vide et transparent, la source se pose dessous dans OBS. */}
      {p.camEnabled &&
        (cam ? (
          <div
            style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.cam.top, height: SLOT.cam.height } as React.CSSProperties}
            className="absolute overflow-hidden"
          >
            {/* Bac à sable rétabli : sans lui la page encadrée peut naviguer la
                fenêtre du dessus. `allow-scripts` et `allow-same-origin` sont le
                minimum pour que WebRTC tourne. Le témoin ci-dessous dit si le
                cadre a fini de charger, pour ne plus avoir à deviner. */}
            {/* Une webcam est en 16:9, le cadre est en portrait : à pleine largeur
                l'image ne remplirait qu'un tiers de la hauteur. On agrandit donc le
                flux jusqu'à couvrir le cadre et on garde le centre, les côtés
                partent hors champ — c'est le buste qu'on veut voir. */}
            <iframe
              src={cam}
              title={`Caméra de ${p.name || "joueur"}`}
              allow="autoplay; fullscreen"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setCamCharge(true)}
              className="absolute left-1/2 top-0 border-0"
              style={{
                width: Math.round((SLOT.cam.height * 16) / 9),
                height: SLOT.cam.height,
                transform: "translateX(-50%)",
              }}
            />
            {!camCharge && (
              <span className="absolute inset-x-0 bottom-1 text-center text-[11px] font-semibold uppercase tracking-wide text-white/70">
                {t("caméra en attente")}
              </span>
            )}
          </div>
        ) : (
          <Slot
            label={t("Caméra")}
            className="absolute"
            style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.cam.top, height: SLOT.cam.height } as React.CSSProperties}
          />
        ))}

      {/* Le champ de bataille en jeu, son illustration en fond, et les manches
          gagnées posées dessus comme sur la retransmission officielle. */}
      <div
        style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.bf.top, height: SLOT.bf.height } as React.CSSProperties}
        className="absolute overflow-hidden bg-black/70"
      >
        {/* Agrandi de 40 % pour sortir du cadre de la carte : sans ça on voyait le
            liseré et le bandeau de titre de l'illustration. Voile léger, et un
            dégradé sous le texte seulement, pour ne pas éteindre l'art. */}
        {art[bf] && (
          <img src={art[bf]!} alt="" className="absolute inset-0 h-full w-full scale-[1.4] object-cover object-[50%_38%]" />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="relative z-20 flex h-full flex-col justify-end overflow-hidden px-2 pb-2">
          <FitText chars={24} className="text-base font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {bf || "Champ de bataille"}
          </FitText>
          {rounds > 0 && (
            <div className="mt-2 flex justify-center gap-2.5">
              {Array.from({ length: rounds }).map((_, i) => (
                <Manche key={i} gagnee={i < p.gamesWon} />
              ))}
            </div>
          )}
        </div>
      </div>

      {footer}
    </div>
  );
}

/**
 * Manche du Bo3. Les deux pastilles se ressemblent, c'est le logo qui distingue la
 * manche gagnee : un anneau dore sur fond sombre dans les deux cas, comme sur la
 * retransmission. Pas de fond dore delave, qui jurait avec l orange du logo.
 */
function Manche({ gagnee }: { gagnee: boolean }) {
  return (
    <span
      key={String(gagnee)}
      className={`${styles.apparait} flex h-8 w-8 items-center justify-center rounded-full bg-black/55 ring-2 ${
        gagnee ? "ring-gold" : "ring-white/35"
      }`}
      style={{ boxShadow: gagnee ? "0 0 10px rgba(212,168,67,0.55)" : "0 1px 4px rgba(0,0,0,0.5)" }}
    >
      {gagnee && <img src="/stream/RB_riftbound_icon.svg" alt="" className="h-5 w-5 object-contain" />}
    </span>
  );
}

/**
 * Carte affichée dans le cadre de droite, choisie depuis le tableau de bord.
 *
 * L'image reste montée le temps de disparaître : sans ça « Masquer » la faisait
 * sauter d'un coup, sans le fondu qu'on a partout ailleurs.
 */
type SlotStyle = { left?: number; right?: number; top: number; width: number; height: number };

function CarteMontree({ nom, slot }: { nom: string | null; slot: SlotStyle }) {
  const art = useBattlefieldArt(nom ? [nom] : []);
  const cible = nom ? art[nom] : null;
  const [affichee, setAffichee] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let annule = false;
    if (cible) {
      queueMicrotask(() => {
        if (!annule) setAffichee(cible);
      });
      return () => { annule = true; };
    }
    // On éteint, puis on retire une fois le fondu terminé.
    queueMicrotask(() => {
      if (!annule) setVisible(false);
    });
    const t = setTimeout(() => {
      if (!annule) setAffichee(null);
    }, 320);
    return () => { annule = true; clearTimeout(t); };
  }, [cible]);

  return (
    <div className="absolute z-20 overflow-hidden" style={slot}>
      {affichee && (
        <img
          key={affichee}
          src={affichee}
          alt=""
          onLoad={() => setVisible(true)}
          className={`absolute inset-0 m-auto max-h-full max-w-full object-contain transition-opacity duration-300 ease-out ${
            visible && cible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}

// Carte courante d'un côté : les cartes cochées de la decklist (les décochées sont
// ignorées), à l'index manuel du tableau de bord ou au `tick` de la rotation auto.
// Côté caché = null (l'affiche se fond).
function carteCourante(cards: OverlayStateData["cards"], side: 0 | 1, tick: number): string | null {
  if (!cards?.visible?.[side]) return null;
  const actives = (cards.lists?.[side] ?? []).filter((c) => !(cards.ignored?.[side] ?? []).includes(c));
  if (!actives.length) return null;
  const brut = cards.auto?.[side] ? tick : cards.index?.[side] ?? 0;
  const i = ((brut % actives.length) + actives.length) % actives.length;
  return actives[i];
}

// Une affiche = un côté. En rotation auto, un minuteur LOCAL avance la carte toutes
// les `seconds` : jamais poussé en base, sinon on écrirait l'API toutes les 5 s. En
// manuel, l'index vient du tableau de bord.
function CarteAffiche({ cards, side, slot }: { cards: OverlayStateData["cards"]; side: 0 | 1; slot: SlotStyle }) {
  const auto = cards?.auto?.[side] ?? false;
  const seconds = cards?.seconds ?? 5;
  const actives = (cards?.lists?.[side] ?? []).filter((c) => !(cards?.ignored?.[side] ?? []).includes(c));
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!auto || actives.length < 2) return;
    const id = setInterval(() => setTick((t) => t + 1), Math.max(1, seconds) * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, seconds, actives.length]);
  return <CarteMontree nom={carteCourante(cards, side, tick)} slot={slot} />;
}

function Timer({ endsAt }: { endsAt?: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = endsAt ? Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000)) : null;
  const mm = left === null ? "--" : String(Math.floor(left / 60)).padStart(2, "0");
  const ss = left === null ? "--" : String(left % 60).padStart(2, "0");
  return (
    <div className="flex h-full items-center justify-center overflow-hidden">
      <div
        className="text-[34px] font-bold leading-none tabular-nums text-[#1b1408]"
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
      >
        {mm}:{ss}
      </div>
    </div>
  );
}

export function OverlayFull({ token, compact = false }: { token: string; compact?: boolean }) {
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  const { event } = state;
  // Mode vitrine : dès qu'une affiche de cartes est visible, on cache le chrono et
  // le logo (le score et les Légendes restent).
  const vitrine = !!(state.cards?.visible?.[0] || state.cards?.visible?.[1]);
  // Version simple : sans cadre, sans caméra, sans logo. Pour qui n'a ni décor ni
  // webcam et veut quand même le score, les Légendes et la carte à l'écran.
  if (compact) return <OverlayCompact state={state} />;
  return (
    <div className={styles.root}>
      {/* Le cadre fourni, en fond : ses découpes sont transparentes, tout le reste
          de l'habillage vient de lui. */}
      <img src="/stream/test.webp" alt="" className="absolute inset-0 z-10 h-full w-full" />
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} />
      <Side
        p={state.players[0]}
        side="left"
        format={state.format}
        footer={
          <>
            {/* z-20 : sans lui le logo passait sous le cadre du fond, donc invisible. */}
            {!vitrine && event.logoUrl && (
              <img
                src={event.logoUrl}
                alt=""
                className="absolute z-20 object-contain"
                style={{ left: SLOT.x.left, width: SLOT.width, top: 700, height: 220 }}
              />
            )}
            {/* La ronde au-dessus, sur le fond bleu ; le chrono dans la case dorée,
                en encre sombre puisque le fond est jaune. */}
            {event.round && (
              <div
                className="absolute z-20 flex flex-col justify-center overflow-hidden px-2"
                style={{ left: SLOT.x.left, width: SLOT.width, top: SLOT.round.top, height: SLOT.round.height }}
              >
                <FitText chars={11} className="text-3xl font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {event.round}
                </FitText>
              </div>
            )}
            {!vitrine && event.timerVisible !== false && (
              <div
                className="absolute z-20"
                style={{ left: SLOT.timer.left, width: SLOT.timer.width, top: SLOT.timer.top, height: SLOT.timer.height }}
              >
                <Timer endsAt={event.endsAt} />
              </div>
            )}
          </>
        }
      />
      <Side
        p={state.players[1]}
        side="right"
        format={state.format}
        footer={null}
      />
      {/* Deux affiches de cartes, gauche et droite, au-dessus du cadre (z-20). */}
      <CarteAffiche cards={state.cards} side={0} slot={SLOT.cardsLeft} />
      <CarteAffiche cards={state.cards} side={1} slot={SLOT.cards} />
    </div>
  );
}

/**
 * Habillage réduit : les points en haut, un bandeau par joueur avec son pseudo, sa
 * Légende et son champion, et la carte montrée à droite. Rien d'autre, et un fond
 * transparent : ça se pose sur n'importe quelle scène.
 */
function OverlayCompact({ state }: { state: OverlayStateData }) {
  const t = useT();
  const [a, b] = state.players;
  return (
    <div className={styles.root}>
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} />
      {[a, b].map((p, i) => (
        <div
          key={i}
          className="absolute top-20 w-[330px] overflow-hidden rounded-xl bg-black/75 shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
          style={{ [i === 0 ? "left" : "right"]: 40 } as React.CSSProperties}
        >
          {/* La banniere de la Legende, meme sans habillage : c'est elle qui donne
              sa couleur au bandeau et qui identifie le joueur d'un coup d'oeil. */}
          {p.legendName && getBannerUrl(p.legendName) && (
            <div className="relative h-[104px]">
              <img src={getBannerUrl(p.legendName)!} alt="" className="absolute inset-0 h-full w-full object-cover object-[50%_28%]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
          )}
          <div className="p-3 pt-2">
          <FitText chars={15} className="text-2xl font-bold uppercase tracking-wide text-white">
            {p.name || "—"}
          </FitText>
          <div className="mt-1 border-t border-white/15 pt-1">
            <FitText chars={26} className="text-base font-bold uppercase leading-tight text-white/95">
              {p.legendName || t("Légende")}
            </FitText>
            <FitText chars={32} className="text-sm leading-tight text-white/70">
              {p.championName || "Champion"}
            </FitText>
          </div>
          {p.battlefields[0] && (
            <FitText chars={30} className="mt-1 text-xs uppercase tracking-wide text-white/60">
              {p.battlefields[0]}
            </FitText>
          )}
          </div>
        </div>
      ))}
      <CarteAffiche cards={state.cards} side={1} slot={{ right: 40, top: 300, width: 260, height: 364 }} />
    </div>
  );
}
