/**
 * La règle du lien de caméra, à un seul endroit.
 *
 * Le lien vient de l'état, que plusieurs personnes peuvent remplir, et la page
 * d'habillage est ouverte par d'autres. Une URL `javascript:` dans un iframe
 * s'exécuterait sur le domaine du site : on n'accepte donc que du https chez
 * VDO.Ninja, et rien d'autre ne s'affiche.
 *
 * Elle a vécu en trois exemplaires — la page d'habillage, le tableau de bord, et une
 * copie à la main dans son test. La copie du test avait déjà cessé de couper le son :
 * elle validait une règle que le site n'appliquait plus. Une règle de sécurité ne se
 * recopie pas.
 */
export function normaliserLienCamera(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const lien = new URL(url);
    if (lien.protocol !== "https:") return null;
    if (!/(^|\.)vdo\.ninja$/i.test(lien.hostname)) return null;
    // Le son doit rester coupé : la voix passe déjà par la table de mixage, sinon
    // c'est du double son et de l'écho en direct.
    if (!lien.searchParams.has("muted")) lien.searchParams.set("muted", "1");
    return lien.toString();
  } catch {
    return null;
  }
}
