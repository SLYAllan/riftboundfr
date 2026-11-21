import type { Metadata } from "next";
import { formatDate } from "./utils";

/**
 * L'aperçu de lien : ce que Discord, X et les messageries affichent quand on colle
 * une adresse du site.
 *
 * Next fusionne les métadonnées à plat : un `openGraph` posé par une page REMPLACE
 * celui du layout, et une page qui n'en pose pas garde celui de l'accueil. Relevé du
 * 21 novembre 2026 sur le site en ligne : `/meta`, `/guides`, `/collection` et
 * `/decks/compare` s'affichaient dans Discord avec le titre de l'accueil, `/d/…` sans
 * nom de site, et X lisait « Riftbound France » comme titre de toute page sans bloc
 * `twitter`. Une seule fonction complète donc ce que la page n'a pas dit.
 */

const NOM_DU_SITE = "Riftbound France";
const COMPTE_X = "@FRRiftbound";
const IMAGE_PAR_DEFAUT = "/img/og-default.png";

/** Le titre tel que la page l'a écrit, sans le gabarit « %s | Riftbound France ». */
function texteDuTitre(title: Metadata["title"]): string | undefined {
  if (typeof title === "string") return title;
  if (!title || typeof title !== "object") return undefined;
  if ("absolute" in title && typeof title.absolute === "string") return title.absolute;
  if ("default" in title && typeof title.default === "string") return title.default;
  return undefined;
}

/**
 * Complète l'aperçu d'une page à partir de ce qu'elle a déjà posé.
 *
 * Une page qui ne donne ni titre, ni description, ni `openGraph` est rendue telle
 * quelle : elle garde l'aperçu du layout (c'est le cas de l'accueil `/en`, qui ne pose
 * que son canonical). L'image par défaut n'est ajoutée qu'aux pages SANS `openGraph` :
 * une page qui en pose un sans image a parfois son propre fichier `opengraph-image`,
 * et une image de plus sortirait en double balise.
 */
export function completerApercu(m: Metadata): Metadata {
  const titre = texteDuTitre(m.title);
  const description = typeof m.description === "string" ? m.description : undefined;
  if (!m.openGraph && !titre && !description) return m;

  const pose = (m.openGraph ?? {}) as Record<string, unknown>;
  const openGraph: Record<string, unknown> = { type: "website", siteName: NOM_DU_SITE, locale: "fr_FR", ...pose };
  if (openGraph.title === undefined && titre) openGraph.title = titre;
  if (openGraph.description === undefined && description) openGraph.description = description;
  if (!m.openGraph) openGraph.images = [IMAGE_PAR_DEFAUT];

  const x = (m.twitter ?? {}) as Record<string, unknown>;
  const twitter: Record<string, unknown> = { card: "summary_large_image", site: COMPTE_X, ...x };
  if (twitter.title === undefined && openGraph.title !== undefined) twitter.title = openGraph.title;
  if (twitter.description === undefined && openGraph.description !== undefined) twitter.description = openGraph.description;
  if (twitter.images === undefined && openGraph.images !== undefined) twitter.images = openGraph.images;

  return { ...m, openGraph: openGraph as Metadata["openGraph"], twitter: twitter as Metadata["twitter"] };
}

/**
 * Écrit en français les dates de machine d'un texte : « (2026-11-07) » devient
 * « (7 novembre 2026) ». Le nom d'un tournoi en base porte sa date sous cette forme,
 * et elle remontait telle quelle dans le titre de l'aperçu.
 */
export function datesEnFrancais(texte: string): string {
  return texte.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (brut, annee, mois, jour) => {
    // Midi UTC : à minuit, un serveur à l'ouest de Greenwich écrirait la veille.
    const date = new Date(`${annee}-${mois}-${jour}T12:00:00Z`);
    if (Number.isNaN(date.getTime())) return brut;
    return formatDate(date).replace(/^1 /, "1er ");
  });
}

/**
 * Le texte d'une carte sans ses codes d'icône. La page les dessine, un aperçu de lien
 * ne le peut pas : Discord affichait « You may pay :rb_energy_1::rb_rune_fury: as an
 * additional cost ».
 */
export function texteSansCodes(texte: string): string {
  return texte
    .replace(/:rb_energy_(\w+):/g, " $1 ")
    .replace(/:rb_rune_(\w+):/g, (_, domaine: string) => ` ${domaine.charAt(0).toUpperCase()}${domaine.slice(1)} `)
    .replace(/:rb_(\w+):/g, " $1 ")
    .replace(/\s+/g, " ")
    .replace(/\(\s/g, "(")
    .replace(/\s([.,;:)])/g, "$1")
    .trim();
}

const RANG_RARETE: Record<string, number> = { Epic: 0, Rare: 1, Uncommon: 2, Common: 3 };

/**
 * Les cartes clés d'un deck, pour son image d'aperçu : les plus rares d'abord, puis les
 * plus jouées. Ni la Légende, ni les runes, ni les champs de bataille, et jamais deux
 * fois la même carte. `rarete` vient de la base, par nom de carte.
 */
export function cartesCles<T extends { name: string; imageUrl: string | null; quantity: number; type: string }>(
  cartes: T[],
  rarete: Map<string, string>,
  nombre = 4,
): T[] {
  const rang = (c: T) => RANG_RARETE[rarete.get(c.name) ?? ""] ?? 4;
  const vues = new Set<string>();
  return cartes
    .filter((c) => c.imageUrl && !["Legend", "Rune", "Battlefield"].includes(c.type))
    .filter((c) => (vues.has(c.name) ? false : Boolean(vues.add(c.name))))
    .sort((a, b) => rang(a) - rang(b) || b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, nombre);
}

/** Coupe un texte au dernier mot entier qui tient dans `max` caractères. */
export function couperAuMot(texte: string, max: number): string {
  if (texte.length <= max) return texte;
  const coupe = texte.slice(0, max - 1);
  const dernierEspace = coupe.lastIndexOf(" ");
  return `${(dernierEspace > max / 2 ? coupe.slice(0, dernierEspace) : coupe).replace(/[\s,;:(]+$/, "")}…`;
}
