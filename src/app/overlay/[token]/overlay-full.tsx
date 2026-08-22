"use client";
import { useEffect, useRef, useState } from "react";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { normaliserLienCamera } from "@/lib/overlay-cam";
import { echelleOverlay, entrelace, secondesChrono, TOILE, type OverlayPlayer, type OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";
import { FitText } from "./fit-text";
import { useT } from "@/components/i18n-provider";

// Gabarit calé sur la maquette : deux colonnes de 300 px, le centre laissé
// transparent pour la zone de jeu. Tout est en pixels sur une toile de 1920x1080,
// que `useEchelle` met ensuite à la taille de la source d'OBS.
// Le fond fourni (public/stream/test.webp) porte les cadres dorés et ses découpes
// sont transparentes. Tout ce qui suit est mesuré dessus au pixel, en 1920x1080 :
// on remplit ses trous, on ne redessine rien.
const SLOT = {
  x: { left: 43, right: 1606 },
  width: 275,
  name: { top: 24, height: 56 },
  // Décor sans caméra : il n'y a pas de bandeau en haut, le pseudo flottait seul à
  // 160 px au-dessus du cadre. Le trait doré du cadre commence à y 243 (mesuré sur
  // layout_sanscam.webp) : on pose le pseudo juste dessus.
  nameSansCam: { top: 181, height: 56 },
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

// Découpes de public/stream/compact.webp, relevées au pixel sur son canal alpha.
//
// UN SEUL panneau par joueur : les rails dorés portent une coupure décorative de
// 130 à 206, ce n'est pas un séparateur. La Légende passe dessous et descend jusqu'au
// trait plein (246-248), le champ de bataille occupe tout ce qui reste. Découper la
// Légende à la coupure laissait un trou en plein milieu.
//
// Les mesures sont celles de l'INTÉRIEUR des rails, pas de la boîte du dessin :
// rails verticaux à 30-32 et 249-251 à gauche, bordures à 26-28 et 254-255. Se caler
// sur la boîte faisait passer l'illustration par-dessus les traits, et ça se voyait.
//
// Le pseudo, lui, tombe SOUS le panneau, à l'air libre : comme dans le décor sans
// caméra, il ne prend pas de place dans l'encadré.
//
// Le décor du 22 août rend les deux côtés identiques au pixel : le cadre de droite
// est celui de gauche décalé de 1635 px (rails 1665-1667 et 1884-1886, mêmes lignes
// horizontales). Avant, il était plus large de 8 px et descendait de 7, d'où deux
// jeux de mesures. On garde deux jeux quand même : rien ne garantit que le prochain
// décor reste symétrique, et c'est ce qu'on avait supposé la dernière fois.
const CADRE_COMPACT = {
  left: {
    x: 33, largeur: 216,
    hero: { top: 26, hauteur: 220 },
    bf: { top: 249, hauteur: 62 },
    pseudo: { top: 333, hauteur: 38 },
    // Le cadre de cartes est dessiné à demeure dans cartes_gauche.webp : on ne peut
    // pas le déplacer, seulement transformer son calque. Réduit de 0,85 et ancré au
    // coin du bas — d'où le décalage, `transform-origin` étant en haut à gauche.
    cartes: { echelle: 0.85, x: 0, y: 162 },
  },
  right: {
    x: 1668, largeur: 216,
    hero: { top: 26, hauteur: 220 },
    bf: { top: 249, hauteur: 62 },
    pseudo: { top: 333, hauteur: 38 },
    // Le cadre de cartes se cale sur le panneau du dessus, pas sur le milieu de la
    // toile. Les deux images de cadre sont la même à 1563 px d'écart, les deux
    // panneaux à 1635 px : le décalage est donc 1635 - 1563 x 0,85 = 306,45, et le
    // cadre de droite retombe au même retrait qu'à gauche. 288 le posait 18 px trop
    // à gauche depuis que le panneau a bougé.
    cartes: { echelle: 0.85, x: 306.45, y: 162 },
  },
} as const;
const FOND_COMPACT = "/stream/compact.webp";


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
            key={i}
            src={`/stream/${c.v}_${full ? "full" : "empty"}.webp`}
            alt=""
            className={`object-contain ${finalPoint ? "mx-1.5 h-[58px] w-[58px]" : "h-[50px] w-[50px]"}`}
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
function EtiquetteLegende({
  legende, champion, charsLegende = 26, charsChampion = 34,
}: { legende: string; champion: string; charsLegende?: number; charsChampion?: number }) {
  const t = useT();
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-20 overflow-hidden px-2 pb-2">
        <FitText chars={charsLegende} className="text-base font-bold uppercase leading-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
          {legende || t("Légende")}
        </FitText>
        <FitText chars={charsChampion} className="text-sm leading-tight text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
  const cam = normaliserLienCamera(p.camUrl);
  return (
    <div className="absolute inset-0">
      {/* Pseudo, juste au-dessus du premier cadre. */}
      <div
        className="absolute z-20 flex flex-col justify-center overflow-hidden px-2"
        style={{
          left: SLOT.x[side],
          width: SLOT.width,
          top: (sansCam ? SLOT.nameSansCam : SLOT.name).top,
          height: (sansCam ? SLOT.nameSansCam : SLOT.name).height,
        }}
      >
        <FitText chars={13} className="text-2xl font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {p.name}
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
// `petite` : la version compacte tombe a 24 px. L'anneau d'une manche perdue a 35 %
// de blanc y disparaissait sur une illustration sombre, et le score ne se lisait plus.
function Manche({ gagnee, petite = false }: { gagnee: boolean; petite?: boolean }) {
  return (
    <span
      key={String(gagnee)}
      className={`${styles.apparait} flex items-center justify-center rounded-full bg-black/55 ring-2 ${
        petite ? "h-6 w-6" : "h-8 w-8"
      } ${gagnee ? "ring-gold" : petite ? "ring-white/60" : "ring-white/35"}`}
      style={{ boxShadow: gagnee ? "0 0 10px rgba(212,168,67,0.55)" : "0 1px 4px rgba(0,0,0,0.5)" }}
    >
      {gagnee && <img src="/stream/RB_riftbound_icon.svg" alt="" className={`${petite ? "h-4 w-4" : "h-5 w-5"} object-contain`} />}
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

/**
 * Ce que montre chaque cadre, selon le mode. "split" = un deck par cadre ; "mixed" =
 * les deux decks mêlés, à droite seulement (dans l'habillage complet, la gauche garde
 * le chrono). La gauche ne montre des cartes qu'en "split".
 *
 * Lue par l'habillage complet ET par le compact : le calcul était écrit une seule
 * fois, dans le complet, et le compact n'avait donc pas de cartes du tout.
 */
function cartesParCadre(cards: OverlayStateData["cards"]): { gauche: string[]; droite: string[] } {
  const mode = cards?.mode ?? "none";
  const liste = (i: 0 | 1) => activesCadre(cards.lists?.[i] ?? [], cards.ignored?.[i] ?? [], cards.auto);
  if (mode === "split") return { gauche: liste(0), droite: liste(1) };
  if (mode === "mixed") return { gauche: [], droite: entrelace(liste(0), liste(1)) };
  return { gauche: [], droite: [] };
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
  // `brut < 0` = cadre vidé à la main (on a recliqué la carte à l'écran). Sans ce
  // test, le modulo ramènerait -1 sur la DERNIÈRE carte de la liste au lieu de rien.
  const nom = actives.length && brut >= 0 ? actives[((brut % actives.length) + actives.length) % actives.length] : null;
  return <CarteMontree nom={nom} slot={slot} />;
}

function Timer({ endsAt, paused, depassement, monte }: { endsAt?: string | null; paused?: number | null; depassement?: boolean; monte?: boolean }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  // La règle vit dans `src/lib/overlay.ts` : elle a des branches, elle tourne en
  // direct, et un composant client ne se teste pas ici.
  const left = secondesChrono({ endsAt, paused, timerDepassement: depassement, timerMonte: monte }, now);
  // Un chrono qui monte ne dépasse rien, il mesure : ni plus devant, ni rouge. Le
  // dépassement d'un décompte, lui, doit sauter aux yeux.
  const enRetard = !monte && left !== null && left < 0;
  const abs = left === null ? 0 : Math.abs(left);
  const mm = left === null ? "--" : String(Math.floor(abs / 60)).padStart(2, "0");
  const ss = left === null ? "--" : String(abs % 60).padStart(2, "0");
  return (
    <div className="flex h-full items-center justify-center overflow-hidden">
      <div
        // Encre rouge sombre pour le dépassement : sur la case dorée du décor, un
        // rouge clair passerait inaperçu.
        className={`w-full text-[34px] font-bold leading-none tabular-nums ${enRetard ? "text-[#7a1310]" : "text-[#1b1408]"}`}
        style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
      >
        {/* Au-delà de 99 minutes il y a un chiffre de plus, et « +180:00 » débordait
            de la case dorée. `FitText` réduit alors ce qu'il faut, sans jamais couper. */}
        {/* `fondu={false}` : le chrono change chaque seconde, l'apparition en fondu
            le faisait clignoter en continu. */}
        <FitText chars={6} fondu={false}>{`${enRetard ? "+" : ""}${mm}:${ss}`}</FitText>
      </div>
    </div>
  );
}

/**
 * Met la toile 1920x1080 à la taille de la source d'OBS.
 *
 * Sans ça, une source réglée à autre chose que 1920x1080 gardait la toile ancrée en
 * haut à gauche : le décor débordait à droite et tout l'habillage paraissait poussé
 * vers la droite. Le facteur est posé en variable CSS, le centrage est fait par la
 * feuille de style.
 */
function useEchelle() {
  useEffect(() => {
    const poser = () => {
      const e = echelleOverlay(window.innerWidth, window.innerHeight);
      document.documentElement.style.setProperty("--echelle-overlay", String(e));
    };
    poser();
    window.addEventListener("resize", poser);
    return () => window.removeEventListener("resize", poser);
  }, []);
}

export function OverlayFull({ token, compact = false }: { token: string; compact?: boolean }) {
  useEchelle();
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  const { event } = state;
  const cards = state.cards;
  const mode = cards?.mode ?? "none";
  const { gauche, droite } = cartesParCadre(cards);
  // Le chrono, le logo et le titre vivent dans la colonne GAUCHE. On ne les cache
  // donc qu'en mode "split", où le cadre GAUCHE est à l'écran (même vide). En "mixed"
  // la gauche est libre, tout reste. Le score et les Légendes restent toujours.
  const vitrine = mode === "split";
  const sansCam = event.layout === "nocam";
  // Overlay compact : sans cadre, sans caméra, sans logo. Pour qui n'a ni décor ni
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
        src={(sansCam ? event.backgroundNocamUrl : event.backgroundUrl) || (sansCam ? FOND_SANS_CAM : FOND)}
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
              <Timer endsAt={event.endsAt} paused={event.paused} depassement={event.timerDepassement} monte={event.timerMonte} />
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
 * Le bloc d'un joueur dans le décor compact.
 *
 * `compact.webp` porte deux cadres par côté : la Légende en haut, et en bas un cadre
 * coupé en deux par un trait — le pseudo au-dessus, le champ de bataille et les
 * manches en dessous. On ne redessine rien, on remplit ses découpes, comme pour
 * l'habillage complet.
 */
function BlocJoueurCompact({ p, side, format }: { p: OverlayPlayer; side: "left" | "right"; format: OverlayStateData["format"] }) {
  const cote = CADRE_COMPACT[side];
  const banner = p.legendName ? getBannerUrl(p.legendName) : null;
  const icon = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const bf = p.battlefields[0] ?? "";
  const art = useBattlefieldArt(bf ? [bf] : []);
  const rounds = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  const decoupe = (d: { top: number; hauteur: number }) => ({ left: cote.x, width: cote.largeur, top: d.top, height: d.hauteur });
  // Combien de caractères tiennent. `FitText` ne mesure pas (la mesure ment dans le
  // navigateur d'OBS) : il compte les caractères. Mesuré au navigateur sur les noms
  // les plus larges, une majuscule grasse en `text-base` prend 0,70 em ; d'où le
  // 11,2 px par caractère, moins la marge intérieure. « Ravenbloom Conservatory »
  // débordait de son cadre de 3 px avec une règle de trois sur 275.
  const charsLarge = Math.floor((cote.largeur - 8) / 11.2);
  // La ligne du champion est en `text-sm` et sans majuscules forcées : elle tient
  // bien plus de caractères.
  const charsFin = Math.floor((cote.largeur - 8) / 7.6);
  return (
    <>
      <div className="absolute z-20 overflow-hidden" style={decoupe(cote.hero)}>
        {/* L'icône carrée d'abord, la bannière en secours : la case fait 216x220,
            presque carrée comme celle du décor sans caméra. Une bannière large y
            perdrait les deux côtés du dessin. */}
        <ImageFondu src={icon ?? banner} imgClassName="object-cover" />
        <EtiquetteLegende legende={p.legendName} champion={p.championName} charsLegende={charsLarge} charsChampion={charsFin} />
      </div>

      <div className="absolute z-20 overflow-hidden" style={decoupe(cote.bf)}>
        <ImageFondu src={art[bf] ?? null} imgClassName="scale-[1.4] object-cover object-[50%_38%]" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
        {/* Même disposition que l'habillage complet : le nom en haut sur toute la
            largeur, les manches dessous. Côte à côte, le nom n'avait plus que la
            moitié du cadre et un long champ de bataille tombait à une taille
            illisible. Les pastilles sont réduites, la découpe ne fait que 62 px. */}
        <div className="relative z-20 flex h-full flex-col justify-center overflow-hidden px-1">
          <FitText chars={charsLarge} lines={rounds > 0 ? 1 : 2} className="text-base font-bold uppercase leading-tight tracking-wide text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
            {bf || "Champ de bataille"}
          </FitText>
          {rounds > 0 && (
            <div className="mt-1 flex justify-center gap-2">
              {Array.from({ length: rounds }).map((_, i) => (
                <Manche key={i} gagnee={i < p.gamesWon} petite />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Le pseudo sous le panneau, sans cadre autour : le décor n'a pas de case pour
          lui, et le loger dedans mangeait la Légende. */}
      <div className="absolute z-20 flex flex-col justify-center overflow-hidden px-2" style={decoupe(cote.pseudo)}>
        <FitText chars={11} className="text-xl font-bold uppercase tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {p.name}
        </FitText>
      </div>
    </>
  );
}

/**
 * Un cadre de cartes du compact : le calque du gabarit et sa carte, ramenés sous le
 * bloc du joueur. Le cadre est dessiné à demeure dans une image pleine toile, on ne
 * peut donc que transformer le calque entier — la carte suit, elle est dedans.
 */
function CadreCartesCompact({
  side,
  visible,
  cards,
  actives,
}: {
  side: "left" | "right";
  visible: boolean;
  cards: NonNullable<OverlayStateData["cards"]>;
  actives: string[];
}) {
  const { echelle, x, y } = CADRE_COMPACT[side].cartes;
  return (
    <div
      className="absolute inset-0 z-[11]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${echelle})`, transformOrigin: "0 0" }}
    >
      <img
        src={side === "left" ? "/stream/cartes_gauche.webp" : "/stream/cartes_droite.webp"}
        alt=""
        className="absolute inset-0 h-full w-full transition-opacity duration-300 ease-out"
        style={{ opacity: visible ? 1 : 0 }}
      />
      <CarteAffiche
        actives={actives}
        auto={cards.auto}
        index={cards.index?.[side === "left" ? 0 : 1] ?? 0}
        seconds={cards.seconds}
        slot={side === "left" ? SLOT.cardsLeft : SLOT.cards}
      />
    </div>
  );
}

/**
 * Habillage réduit : les points en haut, le bloc de chaque joueur dans son cadre
 * (Légende, champ de bataille, manches) et les cartes en bas. Rien d'autre, et un
 * fond transparent : ça se pose sur n'importe quelle scène.
 *
 * Tout y est repris du décor sans caméra, en plus petit : cette version part sur un
 * téléphone (Moblin), où l'image du stream tient dans une main.
 */
function OverlayCompact({ state }: { state: OverlayStateData }) {
  const [a, b] = state.players;
  const cards = state.cards;
  const mode = cards?.mode ?? "none";
  const { gauche, droite } = cartesParCadre(cards);
  return (
    <div className={styles.root}>
      <Points max={state.maxPoints} a={state.points.a} b={state.points.b} visible={state.event.pointsVisible !== false} />
      <BlocJoueurCompact p={a} side="left" format={state.format} />
      <BlocJoueurCompact p={b} side="right" format={state.format} />
      {/* Le décor PAR-DESSUS le contenu : ses traits dorés encadrent alors les images,
          au lieu de passer dessous et de disparaître. Il est transparent partout
          ailleurs, il ne masque donc rien. */}
      <img src={state.event.backgroundCompactUrl || FOND_COMPACT} alt="" className="pointer-events-none absolute inset-0 z-30 h-full w-full" />
      {/* Les mêmes cadres dorés que l'habillage complet, et les cartes dans leurs
          découpes : en bas de la toile, aux deux coins, un peu réduits. Comme dans le
          complet, le cadre suit le MODE et pas le nombre de cartes : on peut le poser
          vide, puis y charger le deck. */}
      <CadreCartesCompact side="left" visible={mode === "split"} cards={cards} actives={gauche} />
      <CadreCartesCompact side="right" visible={mode === "mixed" || mode === "split"} cards={cards} actives={droite} />
    </div>
  );
}
