import donnees from "../../data/cards-zh.json";

/**
 * Cartes en chinois : noms et images.
 *
 * Riftcodex, d'où viennent toutes nos cartes, n'a AUCUNE notion de langue : son
 * OpenAPI ne porte ni locale ni traduction. Le chinois vient donc du figurier
 * OFFICIEL de l'éditeur chinois, relevé par `npm run maj:cartes-zh` dans
 * `data/cards-zh.json`. Les images sont servies depuis SON CDN, comme le reste du
 * site l'est depuis celui de Riot : rien n'est réhébergé.
 *
 * Ces cartes sont en chinois SIMPLIFIÉ (le code « SC » est imprimé en bas de
 * chacune) alors que l'interface de l'overlay est en traditionnel : aucune source
 * d'images en traditionnel n'existe à ce jour.
 */

/**
 * Nom chinois par nom anglais, tel qu'IMPRIMÉ sur la carte. Jamais écrit à la main,
 * jamais composé : le figurier donne les deux moitiés (le champion et son titre), la
 * routine les joint et refuse tout nom dont les chiffres ne concordent pas avec notre
 * carte.
 */
export const NOMS_ZH: Record<string, string> = donnees.noms;

/** Le nom chinois d'une carte, ou le nom d'origine si le figurier ne l'a pas. */
export function nomChinois(nom: string): string {
  return NOMS_ZH[nom] ?? nom;
}

/** L'hôte des images chinoises, à autoriser dans la politique de sécurité. */
export const HOTE_IMAGES_ZH = "https://cdn.playloltcg.com";

const IMAGES: Record<string, string> = donnees.images;

/**
 * L'image chinoise d'une carte, ou `null` si le figurier ne l'a pas.
 *
 * La clé est le `riftboundId`, PAS `set` + `collectorNumber` : dans Vendetta, les
 * cartes des decks de départ (`ven-sp4-006`) portent elles aussi les numéros 1 à 4,
 * et demander VEN numéro 1 rendait « Kai'Sa, Survivor » au lieu de « Baccai
 * Sandspinner », qui est la vraie VEN-001. Le deuxième segment du `riftboundId` est
 * le numéro imprimé sur la carte, suffixe compris (`116a` art alternatif, `229*`
 * surnuméroté), et le figurier chinois numérote pareil.
 */
export function imageChinoise(riftboundId: string | null | undefined): string | null {
  const m = /^([a-z]+)-([0-9]+[a-z*]?)-/i.exec(riftboundId ?? "");
  if (!m) return null;
  return IMAGES[`${m[1].toUpperCase()}-${m[2]}`] ?? null;
}
