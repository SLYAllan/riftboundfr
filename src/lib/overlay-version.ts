/**
 * Les deux versions de l'overlay vivent côte à côte jusqu'à la bascule (demande d'Allan,
 * 15 novembre 2026). Avant elle, le lien collé dans OBS garde l'ancienne : personne n'a
 * rien à changer, et un décor envoyé reste à sa place. `?version=2` montre la nouvelle,
 * pour préparer sa scène. À la bascule, le même lien passe tout seul à la nouvelle.
 *
 * Après la bascule : supprimer l'ancienne version (la liste est en tête de
 * `overlay-v1.tsx`), ce module et le bandeau du tableau de bord.
 */

/**
 * Le 1er décembre 2026 à minuit, heure de Paris. Le bandeau du tableau de bord écrit
 * cette date en toutes lettres, en trois langues : la changer ici oblige à le relire.
 */
export const BASCULE_OVERLAY = Date.parse("2026-12-01T00:00:00+01:00");

/** Vrai tant que le lien OBS montre encore l'ancienne version. */
export function avantBascule(maintenant = Date.now()): boolean {
  return maintenant < BASCULE_OVERLAY;
}

/** La version à montrer : celle qu'on demande, sinon celle de la date. */
export function versionOverlay(demandee?: string, maintenant = Date.now()): 1 | 2 {
  if (demandee === "1") return 1;
  if (demandee === "2") return 2;
  return avantBascule(maintenant) ? 1 : 2;
}

/**
 * Un décor envoyé avant la bascule part de l'ancien gabarit : posé sur la nouvelle
 * version, ses découpes cacheraient le portrait et la caméra. L'adresse d'un décor envoyé
 * porte l'heure de son envoi (`?v=`), c'est elle qu'on lit. Sans elle, rien ne dit d'où
 * vient l'image : la nouvelle version ne la pose pas et garde le décor du site.
 */
export function decorDuNouveauGabarit(url: string): boolean {
  const envoi = Number(new URLSearchParams(url.split("?")[1] ?? "").get("v"));
  return envoi >= BASCULE_OVERLAY;
}
