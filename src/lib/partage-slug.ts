import crypto from "crypto";

/**
 * Lien de partage d'un classeur : identifiant public, aléatoire cryptographique.
 *
 * Avant, le slug était tiré de `Math.random().toString(36)` : prévisible pour
 * qui lit le code source, et un classeur partagé n'a pas d'autre protection que
 * son adresse. 12 octets = 24 caractères hexadécimaux minuscules, assez pour ne
 * pas être deviné et pour tenir dans une URL.
 */
export function creerSlugPartage(): string {
  return crypto.randomBytes(12).toString("hex");
}
