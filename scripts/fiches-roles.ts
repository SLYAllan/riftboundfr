/**
 * Le texte du champ `role` d'une fiche Légende : un rang calculé, la part et le
 * nombre d'exemplaires, et le mot écrit à la main s'il y en a un.
 *
 * À part dans son fichier parce que `fiches-maj.mts` lit un JSON dès l'import :
 * un test ne peut pas l'importer sans lancer toute la routine.
 */

/** Les morceaux que la routine écrit elle-même : la part, le nombre d'exemplaires. */
const CHIFFRE = /^\d|% des listes|exemplaires? en moyenne/i;
/** Le rang, que `role` remet devant à chaque passage. */
const RANG = /^(?:Core|Standard|Flex|Tech|Cœur du deck|Souple)$/i;

/**
 * Rend le mot rédigé à la main dans un rôle : « Core, protection, 100% à 2.9x. » → « protection ».
 * Il décrit la carte, pas le méta, alors il survit au recalcul.
 *
 * On ne peut pas se contenter d'ignorer un rôle déjà engendré. Le premier passage
 * écrit « Cœur du deck, protection, 100 % des listes, 3 exemplaires » ; le deuxième
 * y voyait sa propre sortie et jetait « protection ». La fiche de Leona a perdu ses
 * onze descripteurs comme ça. On retire donc les morceaux chiffrés et le rang, et
 * ce qui reste est le mot écrit à la main, s'il y en a un.
 */
export function descripteurExistant(role: string | undefined): string | null {
  if (!role) return null;
  const mots = role
    .split(/[,;—–]/)
    .map((m) => m.trim().replace(/\.$/, ""))
    .filter((m) => m.length >= 3 && !CHIFFRE.test(m) && !RANG.test(m));
  return mots[0] ?? null;
}

export const exemplaires = (n: number) =>
  `${n % 1 === 0 ? n : n.toFixed(1)} exemplaire${n >= 2 ? "s" : ""}`;

export function role(part: number, copies: number, ancien?: string): string {
  const rang = part >= 90 ? "Cœur du deck" : part >= 60 ? "Standard" : "Souple";
  return [rang, descripteurExistant(ancien), `${part} % des listes`, exemplaires(copies)]
    .filter(Boolean)
    .join(", ");
}

/** Le rôle d'un champion : pas de rang, seulement le mot et la moyenne. */
export function roleChampion(copies: number, ancien?: string): string {
  return [descripteurExistant(ancien), `${exemplaires(copies)} en moyenne`].filter(Boolean).join(", ");
}
