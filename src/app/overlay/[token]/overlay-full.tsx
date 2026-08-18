"use client";
import { useEffect, useRef, useState } from "react";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { entrelace, type OverlayPlayer, type OverlayStateData } from "@/lib/overlay";
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
  // Descendue de 906 à 900 pour ne plus chevaucher le bas du logo (qui finit à 892).
  round: { top: 900, height: 50 },
  // Calés sur l'intérieur des cadres dessinés dans cartes_gauche/droite.webp
  // (contours dorés, bbox : gauche 41-316 x 682-1045, droite 1604-1879 x 682-1045),
  // avec un léger retrait pour que la carte tienne dans le contour.
  // La carte tient DANS le cadre, pas dessus : plus petite, centrée dans le contour
  // (cadre gauche 41-316 x 682-1045, droite 1604-1879). ~30px de marge par côté.
  cardsLeft: { left: 61, top: 708, width: 235, height: 310 },
  cards: { left: 1624, top: 708, width: 235, height: 310 },
} as const;

// Deux décors possibles, même gabarit 1920x1080, mêmes découpes — sauf les deux
// cadres portrait de webcam, absents du second. Beaucoup de locales n'ont qu'une
// caméra plateau : le cadre vide se voyait, et on ne pouvait rien y faire.
const FOND = "/stream/test.webp";
const FOND_SANS_CAM = "/stream/layout_sanscam.webp";

// Le décor sans caméra n'a QUE deux ouvertures par colonne, relevées sur son canal
// alpha : y 251-543 (l'ancienne case caméra) et y 547-630 (le champ de bataille). La
// fenêtre à bannière de Légende n'existe plus. La Légende prend donc la grande case,
// et comme celle-ci est presque carrée (278 x 293), on y met l'icône carrée et non la
// bannière large, qui serait rognée des deux côtés.

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

function Points({ max, a, b, visible }: { max: number; a: number; b: number; visible: boolean }) {
  const cells: { side: "a" | "b"; v: number }[] = [];
  for (let i = 1; i <= max; i++) cells.push({ side: "a", v: i });
  for (let i = max; i >= 1; i--) cells.push({ side: "b", v: i });
  return (
    // Pastilles = images fournies (public/stream/<n>_empty|full.webp), pas de rond
    // dessiné en code. La pastille du score courant de chaque joueur est « full »,
    // les autres « empty ». Espacement régulier : l'ancienne marge centrale (ml-3)
    // créait un écart de 62px au milieu contre 50px ailleurs.
    <div
      className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {cells.map((c, i) => {
        const full = (c.side === "a" && c.v === a) || (c.side === "b" && c.v === b);
        // Le point final (celui qui donne la manche) est mis en avant : un poil plus
        // gros et un peu détaché du reste. Les autres restent à 50 px, collés.
        const finalPoint = c.v === max;
        return (
          <img
            key={`${i}-${full}`}
            src={`/stream/${c.v}_${full ? "full" : "empty"}.webp`}
            alt=""
            className={`${styles.apparait} object-contain ${finalPoint ? "mx-1.5 h-[58px] w-[58px]" : "h-[50px] w-[50px]"}`}
          />
        );
      })}
    </div>
  );
}

/**
 * Le flux VDO.Ninja dans sa découpe, avec son témoin d'attente.
 *
 * Composant à part pour que « Relancer » suffise : on le remonte par sa clé et
 * l'état du témoin repart de zéro tout seul.
 */
function CadreCamera({ cam, nom }: { cam: string; nom: string }) {
  const t = useT();
  const [charge, setCharge] = useState(false);
  return (
    <>
      {/* Bac à sable rétabli : sans lui la page encadrée peut naviguer la fenêtre
          du dessus. `allow-scripts` et `allow-same-origin` sont le minimum pour que
          WebRTC tourne. Une webcam est en 16:9, le cadre est en portrait : on
          agrandit le flux jusqu'à couvrir le cadre et on garde le centre. */}
      <iframe
        src={cam}
        title={`Caméra de ${nom || "joueur"}`}
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => setCharge(true)}
        className="absolute left-1/2 top-0 border-0 transition-opacity duration-300 ease-out"
        style={{
          width: Math.round((SLOT.cam.height * 16) / 9),
          height: SLOT.cam.height,
          transform: "translateX(-50%)",
          opacity: charge ? 1 : 0,
        }}
      />
      <span
        className="absolute inset-x-0 bottom-1 text-center text-[11px] font-semibold uppercase tracking-wide text-white/70 transition-opacity duration-300 ease-out"
        style={{ opacity: charge ? 0 : 1 }}
      >
        {t("caméra en attente")}
      </span>
    </>
  );
}

/** Nom de Légende et Champion posés en bas d'une case, sur un dégradé. */
function EtiquetteLegende({ legende, champion }: { legende: string; champion: string }) {
  const t = useT();
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden px-2 pb-2">
        <FitText chars={26} className="text-base font-bold uppercase leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
          {legende || t("Légende")}
        </FitText>
        <FitText chars={34} className="text-sm leading-tight text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {champion || "Champion"}
        </FitText>
      </div>
    </>
  );
}

function Side({
  p,
  side,
  format,
  sansCam,
  footer,
}: {
  p: OverlayPlayer;
  side: "left" | "right";
  format: OverlayStateData["format"];
  sansCam: boolean;
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

      {/* Légende : la bannière remplit la découpe, le nom et le champion par-dessus.
          Le décor sans caméra n'a pas cette fenêtre : la Légende passe dans la grande
          case en dessous. */}
      {!sansCam && (
        <div
          className="absolute overflow-hidden"
          style={{ left: SLOT.x[side], width: SLOT.width, top: SLOT.legend.top, height: SLOT.legend.height }}
        >
          <ImageFondu src={banner ?? icon} imgClassName="object-cover object-[50%_28%]" />
          <EtiquetteLegende legende={p.legendName} champion={p.championName} />
        </div>
      )}

      {/* Caméra : le lien VDO.Ninja s'affiche dans le cadre. Sans lien, le cadre
          reste vide et transparent, la source se pose dessous dans OBS. */}
      {/* Le cadre caméra est toujours là : transparent si rien (une source OBS peut se
          poser dessous), le fond webcam s'il est coché, le flux VDO.Ninja par-dessus. */}
      {/* Décor sans caméra : la grande case porte la Légende, en icône carrée. */}
      {sansCam && (
        <div
          style={{ left: SLOT.x[side] - 3, width: SLOT.width + 6, top: SLOT.cam.top, height: SLOT.cam.height } as React.CSSProperties}
          className="absolute overflow-hidden"
        >
          {/* L'icône d'abord, la bannière seulement en secours : la case est presque
              carrée, une bannière large y perdrait les deux côtés du dessin. */}
          <ImageFondu src={icon ?? banner} imgClassName="object-cover" />
          <EtiquetteLegende legende={p.legendName} champion={p.championName} />
        </div>
      )}

      {!sansCam && (
        <div
          // Élargi de 3 px de chaque côté (centre conservé), comme le champ de
          // bataille en dessous : l'ouverture dessinée dans le décor est un peu plus
          // large que la case mesurée, et il restait un trait clair de 2 px à gauche
          // et 1 px à droite sur toute la hauteur — transparent dans OBS, blanc au
          // navigateur. Le cadre doré passe au-dessus, on ne fait que combler.
          style={{ left: SLOT.x[side] - 3, width: SLOT.width + 6, top: SLOT.cam.top, height: SLOT.cam.height } as React.CSSProperties}
          className="absolute overflow-hidden"
          aria-label={t("Caméra")}
        >
          {/* Fond de webcam en OPTION (case à cocher par joueur) : le cadre n'est pas
              vide sans caméra. Le flux VDO.Ninja, quand il arrive, se pose par-dessus. */}
          <ImageFondu src={p.camBackground ? "/stream/webcam_default.png" : null} imgClassName="object-cover" />
          {/* Bac à sable rétabli : sans lui la page encadrée peut naviguer la fenêtre
              du dessus. `allow-scripts` et `allow-same-origin` sont le minimum pour que
              WebRTC tourne. Une webcam est en 16:9, le cadre est en portrait : on
              agrandit le flux jusqu'à couvrir le cadre et on garde le centre — c'est le
              buste qu'on veut voir. Le témoin dit si le cadre a fini de charger. */}
          {/* La clé porte le nonce : « Relancer » le change, React jette le cadre
              et en monte un neuf — le flux repart et le témoin d'attente aussi,
              sans effet de bord à écrire. Sans ça, un VDO.Ninja figé reste figé. */}
          {cam && <CadreCamera key={`${cam}-${p.camNonce ?? 0}`} cam={cam} nom={p.name} />}
        </div>
      )}

      {/* Le champ de bataille en jeu, son illustration en fond, et les manches
          gagnées posées dessus comme sur la retransmission officielle. */}
      <div
        // Élargi de 8px de chaque côté (centre conservé) : l'ombre allait moins
        // loin que l'ouverture du cadre, il restait une bande bleue à gauche et à
        // droite. Le cadre doré (dans test.webp) reste au-dessus, on remplit juste
        // le vide sous ses bords.
        style={{ left: SLOT.x[side] - 8, width: SLOT.width + 16, top: SLOT.bf.top, height: SLOT.bf.height } as React.CSSProperties}
        className="absolute overflow-hidden bg-black/70"
      >
        {/* Agrandi de 40 % pour sortir du cadre de la carte : sans ça on voyait le
            liseré et le bandeau de titre de l'illustration. Voile léger, et un
            dégradé sous le texte seulement, pour ne pas éteindre l'art. */}
        <ImageFondu src={art[bf] ?? null} imgClassName="scale-[1.4] object-cover object-[50%_38%]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        <div className="relative z-20 flex h-full flex-col justify-end overflow-hidden px-2 pb-2">
          <FitText chars={24} className="text-base font-bold uppercase tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {bf || "Champ de bataille"}
          </FitText>
          {rounds > 0 && (
            // mb-2 : posées au ras du bas de la découpe, les pastilles touchaient
            // le trait doré du cadre. Remontées de 8 px.
            <div className="mt-2 mb-2 flex justify-center gap-2.5">
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
 * Image qui se remplace en fondu enchaîné au lieu de sauter d'un coup.
 *
 * Même procédé que la carte montrée : la nouvelle couche apparaît par-dessus
 * l'ancienne, puis l'ancienne est retirée une fois le fondu fini. `src` à null fait
 * disparaître en fondu. Sert à tout ce qui change en direct — Légende, champ de
 * bataille, logo, fond de webcam : sans ça, changer de Légende faisait un à-coup.
 */
function ImageFondu({ src, imgClassName = "", className = "" }: { src: string | null; imgClassName?: string; className?: string }) {
  const [calques, setCalques] = useState<{ id: number; src: string }[]>([]);
  const idRef = useRef(0);
  const precRef = useRef<string | null>(null);
  useEffect(() => {
    if (src === precRef.current) return;
    precRef.current = src;
    if (src) {
      const id = ++idRef.current;
      setCalques((c) => [...c.slice(-1), { id, src }]);
      // 500 ms > la durée du fondu : l'ancienne couche part une fois recouverte.
      const t = setTimeout(() => setCalques((c) => c.filter((x) => x.id === id)), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCalques([]), 340);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 ease-out ${className}`}
      style={{ opacity: src ? 1 : 0 }}
    >
      {calques.map((l) => (
        <img key={l.id} src={l.src} alt="" className={`${styles.apparait} absolute inset-0 h-full w-full ${imgClassName}`} />
      ))}
    </div>
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
  const cible = nom ? art[nom] ?? null : null;
  // Calques empilés pour le cross-fade : la nouvelle carte apparaît en fondu
  // par-dessus la précédente, puis l'ancienne est retirée (500 ms > durée du fondu).
  // Quand la carte part (cible = null), le conteneur passe en opacité 0 — fondu de
  // disparition — puis on vide les calques.
  const [calques, setCalques] = useState<{ id: number; src: string }[]>([]);
  const idRef = useRef(0);
  const precRef = useRef<string | null>(null);
  useEffect(() => {
    if (cible === precRef.current) return;
    precRef.current = cible;
    if (cible) {
      const id = ++idRef.current;
      setCalques((c) => [...c.slice(-1), { id, src: cible }]);
      const t = setTimeout(() => setCalques((c) => c.filter((x) => x.id === id)), 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCalques([]), 340);
    return () => clearTimeout(t);
  }, [cible]);

  return (
    <div
      className="absolute z-20 overflow-hidden transition-opacity duration-300 ease-out"
      style={{ ...slot, opacity: cible ? 1 : 0 }}
    >
      {calques.map((l) => (
        <img
          key={l.id}
          src={l.src}
          alt=""
          className={`${styles.fonduCarte} absolute inset-0 m-auto max-h-full max-w-full object-contain`}
        />
      ))}
    </div>
  );
}

// Cartes qui défilent dans un cadre. En diapo auto seulement, `ignored` retire des
// cartes ; en manuel on garde toute la liste pour pouvoir cliquer n'importe laquelle.
function activesCadre(liste: string[], ignored: string[], auto: boolean): string[] {
  return auto ? liste.filter((c) => !ignored.includes(c)) : liste;
}

// Un cadre = une liste déjà résolue (le mode décide côté appelant qui la remplit).
// En diapo auto, un minuteur LOCAL avance la carte toutes les `seconds` : jamais
// poussé en base, sinon on écrirait l'API toutes les 5 s. En manuel, l'index vient
// du tableau de bord (choix d'une carte au clic). Liste vide = rien, l'affiche se fond.
function CarteAffiche({ actives, auto, index, seconds, slot }: { actives: string[]; auto: boolean; index: number; seconds: number; slot: SlotStyle }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!auto || actives.length < 2) return;
    const id = setInterval(() => setTick((t) => t + 1), Math.max(1, seconds) * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, seconds, actives.length]);
  const brut = auto ? tick : index;
  const nom = actives.length ? actives[((brut % actives.length) + actives.length) % actives.length] : null;
  return <CarteMontree nom={nom} slot={slot} />;
}

function Timer({ endsAt, paused }: { endsAt?: string | null; paused?: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // En pause : on fige les secondes restantes. Sinon : décompte depuis endsAt.
  const left = paused != null
    ? Math.max(0, Math.floor(paused))
    : endsAt ? Math.max(0, Math.floor((new Date(endsAt).getTime() - now) / 1000)) : null;
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
  const cards = state.cards;
  const mode = cards?.mode ?? "none";
  // Ce que montre chaque cadre selon le mode. "split" = un deck par cadre ; "mixed" =
  // les deux decks mêlés, à droite seulement (la gauche garde le chrono). La gauche
  // ne montre des cartes qu'en "split".
  const gauche = mode === "split" ? activesCadre(cards.lists?.[0] ?? [], cards.ignored?.[0] ?? [], cards.auto) : [];
  const droite =
    mode === "mixed"
      ? entrelace(
          activesCadre(cards.lists?.[0] ?? [], cards.ignored?.[0] ?? [], cards.auto),
          activesCadre(cards.lists?.[1] ?? [], cards.ignored?.[1] ?? [], cards.auto),
        )
      : mode === "split"
        ? activesCadre(cards.lists?.[1] ?? [], cards.ignored?.[1] ?? [], cards.auto)
        : [];
  // Le chrono, le logo et le titre vivent dans la colonne GAUCHE. On ne les cache
  // donc qu'en mode "split", où le cadre GAUCHE est à l'écran (même vide). En "mixed"
  // la gauche est libre, tout reste. Le score et les Légendes restent toujours.
  const vitrine = mode === "split";
  const sansCam = event.layout === "nocam";
  // Version simple : sans cadre, sans caméra, sans logo. Pour qui n'a ni décor ni
  // webcam et veut quand même le score, les Légendes et la carte à l'écran.
  if (compact) return <OverlayCompact state={state} />;
  return (
    <div className={styles.root}>
      {/* Le cadre fourni, en fond : ses découpes sont transparentes, tout le reste
          de l'habillage vient de lui. */}
      {/* Décor : celui du streamer s'il en a envoyé un (gabarit Photoshop), sinon
          celui du site. Repli sur le décor d'origine si l'image ne charge pas : une
          image cassée en pleine diffusion coûte plus cher qu'un cadre en trop. */}
      <img
        src={event.backgroundUrl || (sansCam ? FOND_SANS_CAM : FOND)}
        onError={(e) => { if (!e.currentTarget.src.endsWith(FOND)) e.currentTarget.src = FOND; }}
        alt=""
        className="absolute inset-0 z-10 h-full w-full"
      />
      {/* Calques cadres, plein écran (le cadre est dessiné à sa place) : la case du
          chrono avec le timer, les contours des cartes quand l'affiche est visible.
          Entre le fond (z-10) et le contenu texte/carte (z-20). */}
      <img
        src="/stream/Chrono.webp"
        alt=""
        className="absolute inset-0 z-[11] h-full w-full transition-opacity duration-300 ease-out"
        style={{ opacity: !vitrine && event.timerVisible !== false ? 1 : 0 }}
      />
      {/* Cadres liés au MODE, pas au nombre de cartes : on peut poser un cadre vide
          (deck pas encore collé) puis y charger les cartes. */}
      <img
        src="/stream/cartes_gauche.webp"
        alt=""
        className="absolute inset-0 z-[11] h-full w-full transition-opacity duration-300 ease-out"
        style={{ opacity: mode === "split" ? 1 : 0 }}
      />
      <img
        src="/stream/cartes_droite.webp"
        alt=""
        className="absolute inset-0 z-[11] h-full w-full transition-opacity duration-300 ease-out"
        style={{ opacity: mode === "mixed" || mode === "split" ? 1 : 0 }}
      />
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} visible={event.pointsVisible !== false} />
      <Side
        p={state.players[0]}
        side="left"
        format={state.format}
        sansCam={sansCam}
        footer={
          <>
            {/* De haut en bas : titre du tournoi, logo, ronde, chrono. Le titre se pose
                juste au-dessus du logo ; sans logo il descend dans la place laissée
                libre pour ne pas flotter tout en haut avec du vide dessous. */}
            {event.title && (
              <div
                className={`absolute z-20 flex flex-col overflow-hidden px-1 text-center transition-opacity duration-300 ease-out ${event.logoUrl ? "justify-end" : "justify-center"}`}
                // Avec logo, le titre est ancré en bas de sa case : il collait au
                // trait doré du cadre au-dessus. Descendu de 12 px, le logo suit
                // d'autant pour ne pas se faire recouvrir (il finit toujours à 892,
                // au-dessus de la ronde).
                style={{ left: SLOT.x.left, width: SLOT.width, top: event.logoUrl ? 640 : 700, height: event.logoUrl ? 66 : 190, opacity: vitrine ? 0 : 1 }}
              >
                {/* Gros titre sur une ou deux lignes : FitText montre TOUT le texte en
                    réduisant si besoin, sans jamais couper ni « … », et sans dépasser
                    deux lignes. Avec logo : ancré juste au-dessus, il grandit vers le haut. */}
                <FitText chars={13} lines={2} className="text-2xl font-bold uppercase leading-[1.05] tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {event.title}
                </FitText>
              </div>
            )}
            {/* z-20 : sans lui le logo passait sous le cadre du fond, donc invisible. */}
            <div className="absolute z-20" style={{ left: SLOT.x.left, width: SLOT.width, top: 708, height: 184 }}>
              <ImageFondu src={!vitrine && event.logoUrl ? event.logoUrl : null} imgClassName="object-contain" />
            </div>
            {/* La ronde au-dessus, sur le fond bleu ; le chrono dans la case dorée,
                en encre sombre puisque le fond est jaune. Cachée en vitrine (deux
                cadres) comme le reste de la colonne gauche. */}
            {event.round && (
              <div
                className="absolute z-20 flex flex-col justify-center overflow-hidden px-2 transition-opacity duration-300 ease-out"
                style={{ left: SLOT.x.left, width: SLOT.width, top: SLOT.round.top, height: SLOT.round.height, opacity: vitrine ? 0 : 1 }}
              >
                <FitText chars={11} className="text-3xl font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  {event.round}
                </FitText>
              </div>
            )}
            <div
              className="absolute z-20 transition-opacity duration-300 ease-out"
              style={{
                left: SLOT.timer.left, width: SLOT.timer.width, top: SLOT.timer.top, height: SLOT.timer.height,
                opacity: !vitrine && event.timerVisible !== false ? 1 : 0,
              }}
            >
              <Timer endsAt={event.endsAt} paused={event.paused} />
            </div>
          </>
        }
      />
      <Side
        p={state.players[1]}
        side="right"
        format={state.format}
        sansCam={sansCam}
        footer={null}
      />
      {/* Deux cadres, gauche et droite, au-dessus du décor (z-20). Le mode a déjà
          rempli `gauche`/`droite` : un deck chacun, ou les deux mêlés à droite. */}
      <CarteAffiche actives={gauche} auto={cards.auto} index={cards.index?.[0] ?? 0} seconds={cards.seconds} slot={SLOT.cardsLeft} />
      <CarteAffiche actives={droite} auto={cards.auto} index={cards.index?.[1] ?? 0} seconds={cards.seconds} slot={SLOT.cards} />
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
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} visible={state.event.pointsVisible !== false} />
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
              <ImageFondu src={getBannerUrl(p.legendName)} imgClassName="object-cover object-[50%_28%]" />
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
      {/* Pas d'affiche de cartes sur le compact : c'est la version minimale. */}
    </div>
  );
}
