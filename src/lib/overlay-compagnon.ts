import crypto from "crypto";

/**
 * Clé du lien compagnon, dérivée du jeton de l'habillage.
 *
 * Le jeton seul ne doit pas suffire à ÉCRIRE : il est collé dans OBS, il passe
 * dans un partage d'écran, il finit lu par un viewer attentif. Qui l'a peut voir
 * l'habillage, c'est déjà dit au streamer ; il ne doit pas pouvoir le piloter.
 * Le compagnon demande donc une seconde moitié, calculée à partir du secret de
 * session : rien de plus à stocker, et « Nouveau lien » la change en même temps
 * que le jeton, donc l'ancien lien de partage meurt avec lui.
 */
function secret(): string {
  // Même règle que les cookies signés : pas de repli, on lève.
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET environment variable is required");
  return s;
}

export function cleCompagnon(token: string): string {
  return crypto.createHmac("sha256", secret()).update(`compagnon:${token}`).digest("hex").slice(0, 32);
}

export function cleCompagnonValide(token: string, cle: unknown): boolean {
  if (typeof cle !== "string") return false;
  const attendue = cleCompagnon(token);
  // Longueurs comparées d'abord : `timingSafeEqual` lève si elles diffèrent.
  if (cle.length !== attendue.length) return false;
  return crypto.timingSafeEqual(Buffer.from(cle), Buffer.from(attendue));
}
