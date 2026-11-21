import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";
import { allowSvgInSharp } from "./og-sharp";

/**
 * Les images d'aperçu de lien, en 1200 × 630 : ce que Discord et X posent sous le
 * titre quand on colle une adresse du site.
 *
 * Jusqu'au 21 novembre 2026, 29 pages sur 33 montraient le logo seul, et le lien d'un
 * deck demandait l'image carrée complète : 2000 × 2000, 4,4 Mo, 5 à 7 secondes à
 * chaque demande. Toutes ces images partagent maintenant le même gabarit, choisi par
 * Allan sur une page d'essai : un panneau de texte sombre à gauche, le visuel à droite.
 */

export const TAILLE_APERCU = { width: 1200, height: 630 };

const FOND = "#1c1c1e";
const SURFACE = "#232328";
const ENCRE = "#f1f5f9";
const ENCRE_DOUCE = "#a3afc0";
const ACCENT = "#38bdf8";
const MARGE = 60;

// Les couleurs de palier de la tier list du site (scripts/gen-tierlist-image.mts).
const COULEURS_PALIER: Record<string, string> = { S: "#ef4444", A: "#f97316", B: "#eab308", C: "#22c55e", D: "#38bdf8" };

type Police = { name: string; data: Buffer; weight: 500 | 600; style: "normal" };
let polices: Promise<Police[]> | null = null;

/** Les polices du site, lues une fois : sans elles next/og dessine en Noto Sans. */
function chargerPolices(): Promise<Police[]> {
  polices ??= Promise.all([
    readFile(join(process.cwd(), "public", "fonts", "rubik-600.ttf")),
    readFile(join(process.cwd(), "public", "fonts", "plus-jakarta-sans-500.ttf")),
  ]).then(([rubik, jakarta]) => [
    { name: "Rubik", data: rubik, weight: 600, style: "normal" },
    { name: "Jakarta", data: jakarta, weight: 500, style: "normal" },
  ]);
  return polices;
}

/**
 * Une image du dossier `public`, recadrée et rendue en PNG : next/og ne lit pas le
 * WebP, format des bannières et des icônes de Légende. `null` si le fichier manque :
 * l'image d'aperçu se dessine alors sans ce visuel, et le journal le dit.
 */
export async function imagePublique(chemin: string, largeur: number, hauteur: number, position = "centre"): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const brut = await readFile(join(process.cwd(), "public", chemin.replace(/^\//, "")));
    const png = await sharp(brut)
      .resize(largeur, hauteur, { fit: "cover", position: position === "haut" ? "top" : "centre" })
      .png()
      .toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch (erreur) {
    console.warn(`[aperçu] image introuvable ou illisible : ${chemin}`, erreur);
    return null;
  }
}

/** L'image d'une carte à la largeur demandée : le CDN de Riot la fabrique à la volée. */
export function carteALaTaille(url: string, largeur: number): string {
  if (!url.includes("cmsassets.rgpub.io")) return url;
  // Arrondie à 50 px, comme dans la route de l'image de deck : chaque nouvelle largeur
  // est fabriquée par le CDN au premier appel.
  return `${url}${url.includes("?") ? "&" : "?"}w=${Math.ceil(largeur / 50) * 50}`;
}

/** « Ahri, Nine-Tailed Fox » : le nom du champion en grand, son titre en dessous. */
export function nomEtTitre(legende: string): { nom: string; titre: string } {
  const [nom, ...reste] = legende.split(/,| - /);
  return { nom: nom.trim(), titre: reste.join(",").trim() };
}

/** La plus grande taille de texte qui fait tenir `texte` sur une ligne de `largeur` px. */
export function tailleQuiTient(texte: string, largeur: number, max: number, min: number): number {
  // Rubik demi-gras : un caractère fait à peu près 0,58 fois la taille du texte.
  const taille = Math.floor(largeur / (0.58 * Math.max(texte.length, 1)));
  return Math.max(min, Math.min(max, taille));
}

function Panneau({ largeur, grand, tailleGrand, sous, pied }: { largeur: number; grand: string; tailleGrand: number; sous?: string; pied?: string[] }) {
  return (
    <div style={{ width: largeur, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: `0 ${MARGE}px`, backgroundColor: FOND }}>
      <div style={{ display: "flex", fontFamily: "Rubik", fontSize: 30, color: ENCRE_DOUCE, marginBottom: 34 }}>Riftbound France</div>
      <div style={{ display: "flex", fontFamily: "Rubik", fontSize: tailleGrand, lineHeight: 1.05, color: ENCRE, letterSpacing: "-0.01em" }}>{grand}</div>
      {sous ? <div style={{ display: "flex", fontFamily: "Rubik", fontSize: 44, lineHeight: 1.15, color: ACCENT, marginTop: 14 }}>{sous}</div> : null}
      {pied?.length ? (
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Jakarta", fontSize: 31, lineHeight: 1.4, color: ENCRE_DOUCE, marginTop: 30 }}>
          {pied.map((ligne) => (
            <div key={ligne} style={{ display: "flex" }}>{ligne}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

async function reponse(contenu: ReactElement): Promise<ImageResponse> {
  await allowSvgInSharp();
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: FOND, color: ENCRE }}>{contenu}</div>,
    {
      ...TAILLE_APERCU,
      fonts: await chargerPolices(),
      // Un jour chez le visiteur et chez le robot : l'image ne change qu'avec les stats.
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" },
    },
  );
}

/** Une fiche Légende : son nom, son titre, et son illustration sur plus de la moitié de l'image. */
export async function apercuLegende({ legende, banniere, pied }: { legende: string; banniere: string | null; pied: string }): Promise<ImageResponse> {
  const { nom, titre } = nomEtTitre(legende);
  const largeurTexte = 528;
  const art = banniere ? await imagePublique(banniere, TAILLE_APERCU.width - largeurTexte, TAILLE_APERCU.height, "haut") : null;
  return reponse(
    <>
      <Panneau largeur={art ? largeurTexte : TAILLE_APERCU.width} grand={nom} tailleGrand={tailleQuiTient(nom, largeurTexte - 2 * MARGE, 100, 52)} sous={titre} pied={[pied]} />
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art} alt="" width={TAILLE_APERCU.width - largeurTexte} height={TAILLE_APERCU.height} />
      ) : null}
    </>,
  );
}

/**
 * Un deck : l'illustration de sa Légende, et ses cartes clés posées en bas, détachées
 * par un liseré clair (la « taille A » retenue par Allan : 14 % de la largeur chacune).
 */
export async function apercuDeck({ legende, sous, pied, banniere, cartes }: { legende: string; sous: string; pied: string[]; banniere: string | null; cartes: string[] }): Promise<ImageResponse> {
  const { nom } = nomEtTitre(legende);
  const largeurTexte = 468;
  const largeurVisuel = TAILLE_APERCU.width - largeurTexte;
  const art = banniere ? await imagePublique(banniere, largeurVisuel, TAILLE_APERCU.height, "haut") : null;
  const largeurCarte = 168;
  const hauteurCarte = Math.round((largeurCarte * 1039) / 744);
  return reponse(
    <>
      <Panneau largeur={largeurTexte} grand={nom} tailleGrand={tailleQuiTient(nom, largeurTexte - 2 * MARGE, 100, 48)} sous={sous} pied={pied} />
      <div style={{ width: largeurVisuel, height: "100%", display: "flex", position: "relative", backgroundColor: SURFACE }}>
        {art ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" width={largeurVisuel} height={TAILLE_APERCU.height} style={{ position: "absolute", top: 0, left: 0 }} />
        ) : null}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 38, display: "flex", justifyContent: "center" }}>
          {cartes.slice(0, 4).map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={carteALaTaille(url, largeurCarte)}
              alt=""
              width={largeurCarte}
              height={hauteurCarte}
              style={{ marginLeft: i === 0 ? 0 : 11, borderRadius: 10, border: "3px solid rgba(241, 245, 249, 0.85)", boxShadow: "0 12px 30px rgba(0, 0, 0, 0.75)" }}
            />
          ))}
        </div>
      </div>
    </>,
  );
}

/** Un tournoi : son nom, son nombre de joueurs, sa date, et les quatre premiers. */
export async function apercuTournoi({ nom, sous, pied, podium }: { nom: string; sous?: string; pied: string[]; podium: { nom: string; icone: string | null }[] }): Promise<ImageResponse> {
  const largeurTexte = podium.length ? 624 : TAILLE_APERCU.width;
  const icones = await Promise.all(podium.map((p) => (p.icone ? imagePublique(p.icone, 84, 84) : null)));
  return reponse(
    <>
      <Panneau largeur={largeurTexte} grand={nom} tailleGrand={nom.length > 26 ? 54 : 66} sous={sous} pied={pied} />
      {podium.length ? (
        <div style={{ width: TAILLE_APERCU.width - largeurTexte, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 54px", backgroundColor: SURFACE }}>
          {podium.map((p, i) => (
            <div key={`${i}-${p.nom}`} style={{ display: "flex", alignItems: "center", marginTop: i === 0 ? 0 : 20, fontFamily: "Rubik", fontSize: 40 }}>
              <div style={{ display: "flex", width: 48, justifyContent: "flex-end", marginRight: 24, fontSize: 36, color: i === 0 ? ACCENT : ENCRE_DOUCE }}>{i + 1}</div>
              {icones[i] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={icones[i]!} alt="" width={84} height={84} style={{ borderRadius: 42, marginRight: 24 }} />
              ) : (
                <div style={{ display: "flex", width: 84, height: 84, borderRadius: 42, marginRight: 24, backgroundColor: FOND }} />
              )}
              <div style={{ display: "flex" }}>{p.nom}</div>
            </div>
          ))}
        </div>
      ) : null}
    </>,
  );
}

/** Une carte : entière, à gauche, dans une image large. X rognait la carte seule, en portrait. */
export async function apercuCarte({ nom, sous, pied, image }: { nom: string; sous: string; pied: string[]; image: string | null }): Promise<ImageResponse> {
  const largeurImage = image ? 456 : 0;
  const hauteurCarte = 542;
  const largeurCarte = Math.round((hauteurCarte * 744) / 1039);
  const largeurTexte = TAILLE_APERCU.width - largeurImage;
  return reponse(
    <>
      {image ? (
        <div style={{ width: largeurImage, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: SURFACE }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={carteALaTaille(image, largeurCarte)} alt="" width={largeurCarte} height={hauteurCarte} style={{ borderRadius: 16, boxShadow: "0 10px 26px rgba(0, 0, 0, 0.5)" }} />
        </div>
      ) : null}
      <Panneau largeur={largeurTexte} grand={nom} tailleGrand={nom.length > 22 ? 52 : 66} sous={sous} pied={pied} />
    </>,
  );
}

/** La tier list : toutes ses Légendes, rangées par palier, aux couleurs que le site emploie déjà. */
export async function apercuTierList({ set, pied, paliers }: { set: string; pied: string; paliers: { lettre: string; icones: (string | null)[] }[] }): Promise<ImageResponse> {
  const largeurTexte = 372;
  const largeurRangees = TAILLE_APERCU.width - largeurTexte;
  const lettre = 60;
  const place = largeurRangees - 2 * 31 - lettre - 17;
  const plusLongue = Math.max(1, ...paliers.map((p) => p.icones.length));
  // L'icône rétrécit pour que le palier le plus fourni tienne sur une ligne.
  const cote = Math.max(26, Math.min(49, Math.floor((place - (plusLongue - 1) * 6) / plusLongue)));
  const images = await Promise.all(paliers.map((p) => Promise.all(p.icones.map((i) => (i ? imagePublique(i, cote, cote) : null)))));
  return reponse(
    <>
      <Panneau largeur={largeurTexte} grand="Tier list" tailleGrand={66} sous={set} pied={[pied]} />
      <div style={{ width: largeurRangees, height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 31px", backgroundColor: SURFACE }}>
        {paliers.map((p, r) => (
          <div key={p.lettre} style={{ display: "flex", alignItems: "center", marginTop: r === 0 ? 0 : 13 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: lettre, height: lettre, borderRadius: 11, marginRight: 17, backgroundColor: COULEURS_PALIER[p.lettre] ?? ENCRE_DOUCE, color: "#14171c", fontFamily: "Rubik", fontSize: 36 }}>
              {p.lettre}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", width: place }}>
              {images[r].map((src, i) =>
                src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" width={cote} height={cote} style={{ borderRadius: cote / 2, marginRight: 6 }} />
                ) : (
                  <div key={i} style={{ display: "flex", width: cote, height: cote, borderRadius: cote / 2, marginRight: 6, backgroundColor: FOND }} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
    </>,
  );
}
