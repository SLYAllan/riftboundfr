"use client";
import { useEffect, useRef, useState } from "react";
import { useOverlayPoll } from "@/hooks/use-overlay-poll";
import { getBannerUrl, getLegendIconUrl } from "@/lib/banners";
import { normaliserLienCamera } from "@/lib/overlay-cam";
import { caseOverlay, decoupeCss, type Cote, type NomCase } from "@/lib/overlay-decor";
import { COULEURS_POINTS, echelleOverlay, encreSur, entrelace, nomEtTitre, secondesChrono, type OverlayPlayer, type OverlayStateData } from "@/lib/overlay";
import styles from "./overlay.module.css";
import { FitText } from "./fit-text";
import { useLangue, useT } from "@/components/i18n-provider";
import { useNomsZh } from "@/hooks/use-noms-zh";

// Toile de 1920x1080, que `useEchelle` met ensuite à la taille de la source d'OBS.
// Le décor et les cases du joueur viennent de `src/lib/overlay-decor.ts`, ce fichier
// ne garde que ce qui n'existe qu'à gauche, sous le joueur.
const BAS_GAUCHE = {
  x: 36,
  largeur: 275,
  // Descendu de 12 px quand il y a un logo : ancré en bas de sa case, le titre collait
  // aux manches au-dessus.
  titreAvecLogo: { top: 640, height: 66 },
  titreSeul: { top: 700, height: 190 },
  logo: { top: 708, height: 184 },
  ronde: { top: 930, height: 38 },
  chrono: { left: 98, top: 968, width: 150, height: 50 },
} as const;

// Le cadre de cartes est dessiné à demeure dans une image pleine toile : on ne peut que
// transformer le calque entier, et la carte suit parce qu'elle est dedans. Ces images
// sont centrées 6 px à côté de la colonne, d'où le décalage. En compact, elles sont
// réduites et ramenées sous le bloc du joueur : les deux images sont la même à 1563 px
// d'écart, et chacune se cale sur le milieu de son bloc.
const CARTES = {
  complet: { left: "translateX(-6px)", right: "translateX(6px)" },
  compact: { left: "translate(16.3px, 162px) scale(0.85)", right: "translate(271.7px, 162px) scale(0.85)" },
} as const;
const CASE_CARTE = {
  left: { left: 61, top: 708, width: 235, height: 310 },
  right: { left: 1624, top: 708, width: 235, height: 310 },
} as const;

// Les décors du site, tirés de `overlay-decor.ts` par `npm run gen:decor`. Avec ou sans
// caméra, c'est le même : sans caméra, la Légende occupe simplement la case.
const FOND = "/stream/decor.webp";
const FOND_COMPACT = "/stream/decor_compact.webp";

// Combien de caractères tiennent par pixel de largeur, à la taille de chaque texte.
// `FitText` compte les caractères plutôt que de mesurer (la mesure ment dans le
// navigateur d'OBS). Relevé sur les noms les plus larges, en majuscules Arpona.
const PX_PAR_CARACTERE = { nom: 10.2, titre: 8, pseudo: 15.5, terrain: 9 };

// Illustrations des champs de bataille : l'état ne transporte que des noms. On les
// résout une fois par nom via l'aperçu de carte déjà en place, et on garde le
// résultat pour toute la durée du direct — un tournoi ne change pas d'illustration.
const bfArt = new Map<string, string | null>();

function useBattlefieldArt(names: string[]): Record<string, string | null> {
  // La langue de la page décide de la langue des cartes : un overlay ouvert sous
  // /zh montre les cartes chinoises. Elle entre dans la clé du cache, sinon la
  // première carte résolue figerait la langue de toutes les suivantes.
  const langue = useLangue();
  const [art, setArt] = useState<Record<string, string | null>>({});
  const key = `${langue}|${names.join("|")}`;
  const cached = Object.fromEntries(names.filter(Boolean).map((n) => [n, bfArt.get(`${langue}|${n}`) ?? null]));
  useEffect(() => {
    let annule = false;
    const manquants = names.filter((n) => n && !bfArt.has(`${langue}|${n}`));
    if (manquants.length === 0) return;
    Promise.all(
      manquants.map(async (n) => {
        try {
          const r = await fetch(`/api/cards/preview?name=${encodeURIComponent(n)}${langue === "zh" ? "&langue=zh" : ""}`);
          const c = r.ok ? await r.json() : null;
          bfArt.set(`${langue}|${n}`, c?.imageUrl ?? null);
        } catch {
          bfArt.set(`${langue}|${n}`, null);
        }
      }),
    ).then(() => {
      if (!annule) setArt(Object.fromEntries(names.filter(Boolean).map((n) => [n, bfArt.get(`${langue}|${n}`) ?? null])));
    });
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return Object.fromEntries(names.filter(Boolean).map((n) => [n, art[n] ?? cached[n] ?? null]));
}

/**
 * La rangée de points, comme sur la retransmission : 1 à 7 de chaque côté et un seul 8
 * au milieu, dans un écu, puisque les deux joueurs visent le même. Dessinée ici et pas
 * en image : elle se pose sur tous les décors, et ses couleurs se changent.
 */
function Points({ max, a, b, visible, couleurPoint, couleurChiffres, echelle = 1 }: { max: number; a: number; b: number; visible: boolean; couleurPoint?: string; couleurChiffres?: string; echelle?: number }) {
  const fond = couleurPoint || COULEURS_POINTS.fond;
  const chiffre = couleurChiffres || COULEURS_POINTS.chiffres;
  const chiffreMarque = couleurChiffres || encreSur(fond);
  const pastille = (v: number, score: number, cle: string) => {
    const marque = v === score;
    return (
      <span
        key={cle}
        className="mt-[14.5px] flex size-[33px] shrink-0 items-center justify-center rounded-full text-[20px] leading-none transition-colors duration-200 ease-out"
        style={{
          backgroundColor: marque ? fond : "#172636",
          color: marque ? chiffreMarque : chiffre,
          boxShadow: marque ? undefined : "inset 0 0 0 1.2px #a38d5c",
        }}
      >
        {v}
      </span>
    );
  };
  const montants = Array.from({ length: max - 1 }, (_, i) => i + 1);
  const ecuMarque = a === max || b === max;
  return (
    <div
      className="absolute left-1/2 top-0 z-20 transition-opacity duration-300 ease-out"
      style={{ opacity: visible ? 1 : 0, transform: `translateX(-50%) scale(${echelle})`, transformOrigin: "top center" }}
    >
      {/* Le bandeau et son filet s'éteignent avec les points, ils sont donc ici et pas dans le décor. */}
      {/* Pas opaque : le bandeau couvrait la vidéo d'un bloc, et ses bords se voyaient. */}
      <div className="absolute -inset-x-24 top-0 h-[61px]" style={{ background: "linear-gradient(90deg, transparent, rgba(23,36,51,.2) 6%, rgba(23,36,51,.55) 12%, rgba(23,36,51,.8) 20%, rgba(23,36,51,.8) 80%, rgba(23,36,51,.55) 88%, rgba(23,36,51,.2) 94%, transparent)" }} />
      <div className="absolute -inset-x-3 top-[60px] h-[1.5px]" style={{ background: "linear-gradient(90deg, transparent, #c8a55c 42%, #c8a55c 58%, transparent)" }} />
      <div className="relative flex items-start gap-[5.33px]">
        {montants.map((v) => pastille(v, a, `a${v}`))}
        <svg viewBox="929 4 62 70" width={62} height={70} className="mx-[3px] mt-[4px] shrink-0" aria-hidden>
          <polygon points="930,15 938,8 982,8 990,15 990,55 960,73 930,55" fill="#0f1b28" stroke="#c8a55c" strokeWidth="1.5" />
          <polygon points="936,19 941,13 979,13 984,19 984,52 960,67 936,52" fill={ecuMarque ? fond : "#0f2a3c"} stroke="#6f6240" strokeWidth="1" className="transition-colors duration-200 ease-out" />
          <rect x="955.5" y="6.5" width="9" height="9" transform="rotate(45 960 11)" fill="#172938" stroke="#c8a55c" strokeWidth="1.2" />
          <text x="960" y="53" textAnchor="middle" fontSize={max >= 10 ? 32 : 40} fill={ecuMarque ? chiffreMarque : chiffre}>{max}</text>
        </svg>
        {[...montants].reverse().map((v) => pastille(v, b, `b${v}`))}
      </div>
    </div>
  );
}

/**
 * Le flux VDO.Ninja dans sa découpe, avec son témoin d'attente.
 *
 * Composant à part pour que « Relancer » suffise : on le remonte par sa clé et
 * l'état du témoin repart de zéro tout seul.
 */
function CadreCamera({ cam, nom, hauteur }: { cam: string; nom: string; hauteur: number }) {
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
          width: Math.round((hauteur * 16) / 9),
          height: hauteur,
          transform: "translateX(-50%)",
          opacity: charge ? 1 : 0,
        }}
      />
      {/* bottom-5 : le bas de la case passe sous la plaque du pseudo. */}
      <span
        className="absolute inset-x-0 bottom-5 text-center text-[11px] font-semibold uppercase tracking-wide text-white/70 transition-opacity duration-300 ease-out"
        style={{ opacity: charge ? 0 : 1 }}
      >
        {t("caméra en attente")}
      </span>
    </>
  );
}

/** Une ligne du panneau : le nom de la carte, puis son titre en plus petit. */
function NomCarte({ nom, repli, cas, side, compact }: { nom: string; repli: string; cas: NomCase; side: Cote; compact: boolean }) {
  const nomZh = useNomsZh();
  const place = caseOverlay(cas, side, compact);
  const [principal, titre] = nomEtTitre(nom ? nomZh(nom) : repli);
  const alignement = side === "left" ? "text-left" : "text-right";
  // La bannière se referme en flèche : au bas de sa case, le titre du champion n'a plus
  // que 171 px sur 196. « Leader of the Kinkou Order » (Shen) en sortait de 16 px.
  const largeurTitre = cas === "champion" ? (place.width * 171) / 196 : place.width;
  return (
    <div className="absolute z-20 flex flex-col justify-center overflow-hidden" style={place}>
      <FitText chars={Math.floor(place.width / PX_PAR_CARACTERE.nom)} alignement={alignement} className="text-[18px] uppercase leading-[1.1] tracking-[0.3px] text-white">
        {principal}
      </FitText>
      {titre && (
        <FitText chars={Math.floor(largeurTitre / PX_PAR_CARACTERE.titre)} alignement={alignement} className="mt-px text-[11.9px] uppercase leading-[1.2] tracking-[0.2px] text-[#e6edf1]">
          {titre}
        </FitText>
      )}
    </div>
  );
}

/**
 * Tout ce qu'un joueur a à l'écran, sans le décor : d'abord ce qui se voit à travers
 * ses découpes (sans z-index, donc dessous), puis les textes, au-dessus.
 */
function Colonne({ p, side, format, sansCam = false, compact = false }: { p: OverlayPlayer; side: Cote; format: OverlayStateData["format"]; sansCam?: boolean; compact?: boolean }) {
  const t = useT();
  const nomsZh = useNomsZh();
  const icone = p.legendName ? getLegendIconUrl(p.legendName) : null;
  const banniere = p.legendName ? getBannerUrl(p.legendName) : null;
  const manches = format === "BO5" ? 3 : format === "BO3" ? 2 : 0;
  // Un seul champ de bataille : c'est celui en jeu, choisi depuis le tableau de bord.
  const bf = p.battlefields[0] ?? "";
  const art = useBattlefieldArt(bf ? [bf] : []);
  const cam = normaliserLienCamera(p.camUrl);
  const place = (nom: NomCase) => caseOverlay(nom, side, compact);
  const classement = p.classement?.trim() ?? "";
  return (
    <>
      {/* L'icône d'abord, la bannière en secours : ces deux cases sont presque carrées,
          une bannière large y perdrait les deux côtés du dessin. */}
      <div className="absolute overflow-hidden bg-[#0f1824]" style={{ ...place("portrait"), clipPath: decoupeCss("portrait", side) }}>
        <ImageFondu src={icone ?? banniere} imgClassName="object-cover" />
      </div>

      {!compact && (
        <div className={`absolute overflow-hidden ${sansCam ? "bg-[#0f1824]" : ""}`} style={place("camera")} aria-label={t("Caméra")}>
          {sansCam ? (
            <ImageFondu src={icone ?? banniere} imgClassName="object-cover" />
          ) : (
            <>
              {/* Sans lien ni fond coché, la case reste transparente : une source OBS
                  peut se poser dessous. */}
              {/* Assombri : l'image est dessinée pour l'ancien fond, plus clair, et
                  sautait aux yeux sur le bleu nuit. */}
              <ImageFondu src={p.camBackground ? "/stream/webcam_default.png" : null} imgClassName="object-cover brightness-[.55]" />
              {/* La clé porte le nonce : « Relancer » le change, React jette le cadre
                  et en monte un neuf. Sans ça, un VDO.Ninja figé reste figé. */}
              {cam && <CadreCamera key={`${cam}-${p.camNonce ?? 0}`} cam={cam} nom={p.name} hauteur={place("camera").height} />}
            </>
          )}
        </div>
      )}

      <div className="absolute overflow-hidden bg-[#0f1824]" style={{ ...place("terrainArt"), clipPath: decoupeCss("terrainArt", side) }}>
        {/* Agrandi de 40 % pour sortir du cadre de la carte : sans ça on voyait le
            liseré et le bandeau de titre de l'illustration. */}
        <ImageFondu src={art[bf] ?? null} imgClassName="scale-[1.4] object-cover object-[50%_38%]" />
      </div>

      <NomCarte nom={p.legendName} repli={t("Légende")} cas="legende" side={side} compact={compact} />
      <NomCarte nom={p.championName} repli="Champion" cas="champion" side={side} compact={compact} />

      <div className="absolute z-20 flex items-center overflow-hidden" style={place("pseudo")}>
        <FitText chars={Math.floor(place("pseudo").width / PX_PAR_CARACTERE.pseudo)} className="text-[21.5px] uppercase tracking-[0.4px] text-white">
          {p.name}
        </FitText>
      </div>

      {classement && (
        <div
          className="absolute z-20 flex items-center overflow-hidden bg-[#d4a745]"
          style={{ ...place("classement"), clipPath: "polygon(0 0, 100% 0, 82.7% 100%, 17.3% 100%)" }}
        >
          <FitText chars={6} className="text-[16px] uppercase leading-none text-[#3a3325]">{classement}</FitText>
        </div>
      )}

      <div className="absolute z-20 flex items-center overflow-hidden" style={place("terrainNom")}>
        <FitText chars={Math.floor(place("terrainNom").width / PX_PAR_CARACTERE.terrain)} className="text-[13px] uppercase leading-none tracking-[0.3px] text-white">
          {bf ? nomsZh(bf) : t("Champ de bataille")}
        </FitText>
      </div>

      {manches > 0 && (
        <div className="absolute z-20 flex items-center justify-center gap-4" style={place("manches")}>
          {Array.from({ length: manches }).map((_, i) => (
            <Manche key={i} gagnee={i < p.gamesWon} petite={compact} />
          ))}
        </div>
      )}
    </>
  );
}

/**
 * Manche d'un Bo3 : un anneau sur fond sombre dans les deux cas, c'est le logo qui
 * distingue la manche gagnée.
 */
// `petite` : la version compacte tombe a 24 px. L'anneau d'une manche perdue a 35 %
// de blanc y disparaissait sur une illustration sombre, et le score ne se lisait plus.
function Manche({ gagnee, petite = false }: { gagnee: boolean; petite?: boolean }) {
  return (
    <span
      key={String(gagnee)}
      className={`${styles.apparait} flex items-center justify-center rounded-full bg-[#0b121b] ring-2 ${
        petite ? "size-6" : "size-7"
      } ${gagnee ? "ring-[#c8a55c]" : petite ? "ring-white/60" : "ring-white/35"}`}
    >
      {gagnee && <img src="/stream/RB_riftbound_icon.svg" alt="" className={`${petite ? "size-4" : "size-5"} object-contain`} />}
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
 * les deux decks mêlés, à droite seulement (dans l'overlay complet, la gauche garde
 * le chrono). La gauche ne montre des cartes qu'en "split".
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

/** Un cadre de cartes : le calque du gabarit et sa carte, transformés ensemble. */
function CadreCartes({ side, visible, cards, actives, compact }: { side: Cote; visible: boolean; cards: OverlayStateData["cards"]; actives: string[]; compact: boolean }) {
  return (
    <div
      className="absolute inset-0 z-[11]"
      style={{ transform: CARTES[compact ? "compact" : "complet"][side], transformOrigin: "0 0" }}
    >
      {/* Le cadre suit le MODE et pas le nombre de cartes : on peut le poser vide, puis
          y charger le deck. */}
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
        slot={CASE_CARTE[side]}
      />
    </div>
  );
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
      {/* Encre rouge sombre pour le dépassement : sur la case orange, un rouge clair
          passerait inaperçu. */}
      <div className={`w-full text-[41px] leading-none tabular-nums ${enRetard ? "text-[#5c0b08]" : "text-[#211a29]"}`}>
        {/* Au-delà de 99 minutes il y a un chiffre de plus, et « +180:00 » débordait
            de la case. `FitText` réduit alors ce qu'il faut, sans jamais couper. */}
        {/* `fondu={false}` : le chrono change chaque seconde, l'apparition en fondu
            le faisait clignoter en continu. */}
        <FitText chars={6} fondu={false}>{`${enRetard ? "+" : ""}${mm}:${ss}`}</FitText>
      </div>
    </div>
  );
}

/** Sous le joueur de gauche : titre du tournoi, logo, ronde et chrono. */
function BasGauche({ event, vitrine }: { event: OverlayStateData["event"]; vitrine: boolean }) {
  const { x, largeur } = BAS_GAUCHE;
  const titre = event.logoUrl ? BAS_GAUCHE.titreAvecLogo : BAS_GAUCHE.titreSeul;
  return (
    <>
      {/* De haut en bas : titre du tournoi, logo, ronde, chrono. Le titre se pose juste
          au-dessus du logo ; sans logo il descend dans la place laissée libre pour ne
          pas flotter tout en haut avec du vide dessous. */}
      {event.title && (
        <div
          className={`absolute z-20 flex flex-col overflow-hidden px-1 text-center transition-opacity duration-300 ease-out ${event.logoUrl ? "justify-end" : "justify-center"}`}
          style={{ left: x, width: largeur, ...titre, opacity: vitrine ? 0 : 1 }}
        >
          {/* Gros titre sur une ou deux lignes : FitText montre TOUT le texte en
              réduisant si besoin, sans jamais couper ni « … », et sans dépasser deux
              lignes. Avec logo : ancré juste au-dessus, il grandit vers le haut. */}
          <FitText chars={13} lines={2} className="text-2xl font-normal uppercase leading-[1.05] tracking-wide text-white">
            {event.title}
          </FitText>
        </div>
      )}
      {/* z-20 : sans lui le logo passait sous le fond du décor, donc invisible. */}
      <div className="absolute z-20" style={{ left: x, width: largeur, ...BAS_GAUCHE.logo }}>
        <ImageFondu src={!vitrine && event.logoUrl ? event.logoUrl : null} imgClassName="object-contain" />
      </div>
      {event.round && (
        <div
          className="absolute z-20 flex flex-col justify-center overflow-hidden px-2 transition-opacity duration-300 ease-out"
          style={{ left: x, width: largeur, ...BAS_GAUCHE.ronde, opacity: vitrine ? 0 : 1 }}
        >
          <FitText chars={18} className="text-[25px] font-normal uppercase leading-none tracking-[0.5px] text-white">
            {event.round}
          </FitText>
        </div>
      )}
      <div
        className="absolute z-20 transition-opacity duration-300 ease-out"
        style={{ ...BAS_GAUCHE.chrono, opacity: !vitrine && event.timerVisible !== false ? 1 : 0 }}
      >
        <Timer endsAt={event.endsAt} paused={event.paused} depassement={event.timerDepassement} monte={event.timerMonte} />
      </div>
    </>
  );
}

/**
 * Met la toile 1920x1080 à la taille de la source d'OBS.
 *
 * Sans ça, une source réglée à autre chose que 1920x1080 gardait la toile ancrée en
 * haut à gauche : le décor débordait à droite et tout l'overlay paraissait poussé
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

/**
 * `compact` : les points et le bloc de chaque joueur, sans colonne, sans caméra, sans
 * chrono ni logo, sur un fond transparent. Pour qui stream depuis un téléphone
 * (Moblin), où l'image tient dans une main : d'où les points plus gros.
 */
export function OverlayFull({ token, compact = false }: { token: string; compact?: boolean }) {
  useEchelle();
  const state = useOverlayPoll(token);
  if (!state) return <div className={styles.root} />;
  const { event, cards } = state;
  const mode = cards?.mode ?? "none";
  const { gauche, droite } = cartesParCadre(cards);
  // Le chrono, le logo et le titre vivent dans la colonne GAUCHE. On ne les cache
  // donc qu'en mode "split", où le cadre GAUCHE est à l'écran (même vide). En "mixed"
  // la gauche est libre, tout reste. Le score et les Légendes restent toujours.
  const vitrine = mode === "split";
  const sansCam = event.layout === "nocam";
  const fond = compact ? FOND_COMPACT : FOND;
  const decorEnvoye = compact ? event.backgroundCompactUrl : sansCam ? event.backgroundNocamUrl : event.backgroundUrl;
  return (
    <div className={styles.root}>
      {/* Décor : celui du streamer s'il en a envoyé un (gabarit Photoshop), sinon celui
          du site. Repli sur celui du site si l'image ne charge pas : une image cassée
          en pleine diffusion coûte plus cher qu'un cadre en trop. */}
      <img
        src={decorEnvoye || fond}
        onError={(e) => { if (!e.currentTarget.src.endsWith(fond)) e.currentTarget.src = fond; }}
        alt=""
        className="absolute inset-0 z-10 h-full w-full"
      />
      {!compact && (
        <img
          src="/stream/Chrono.webp"
          alt=""
          className="absolute inset-0 z-[11] h-full w-full transition-opacity duration-300 ease-out"
          style={{ opacity: !vitrine && event.timerVisible !== false ? 1 : 0 }}
        />
      )}
      <Points
        max={state.maxPoints}
        a={state.points.a}
        b={state.points.b}
        visible={event.pointsVisible !== false}
        couleurPoint={event.couleurPoint}
        couleurChiffres={event.couleurChiffres}
        echelle={compact ? 1.35 : 1}
      />
      <Colonne p={state.players[0]} side="left" format={state.format} sansCam={sansCam} compact={compact} />
      <Colonne p={state.players[1]} side="right" format={state.format} sansCam={sansCam} compact={compact} />
      {!compact && <BasGauche event={event} vitrine={vitrine} />}
      {/* Deux cadres, gauche et droite. Le mode a déjà rempli `gauche`/`droite` : un
          deck chacun, ou les deux mêlés à droite. */}
      <CadreCartes side="left" visible={mode === "split"} cards={cards} actives={gauche} compact={compact} />
      <CadreCartes side="right" visible={mode === "mixed" || mode === "split"} cards={cards} actives={droite} compact={compact} />
    </div>
  );
}
