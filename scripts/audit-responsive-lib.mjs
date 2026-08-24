export function extraireCheminsSitemap(xml, base) {
  const origine = new URL(base).origin;
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, valeur]) => new URL(valeur.trim()));
  const comptes = new Map();
  for (const url of urls) comptes.set(url.origin, (comptes.get(url.origin) ?? 0) + 1);
  const origineSitemap = [...comptes].sort((a, b) => b[1] - a[1])[0]?.[0];
  const chemins = urls
    .filter((url) => url.origin === origine || url.origin === origineSitemap)
    .map((url) => `${url.pathname}${url.search}`);
  return [...new Set(chemins)].sort();
}

const ACTION_DANGEREUSE = /déconnexion|supprimer|enregistrer|publier|synchroniser|acheter|ajouter aux favoris|retirer des favoris|j[’']aime|voter|partager|rendre (?:public|privé)|lancer la partie|fin de manche|marquer un point/i;

export function interactionAutorisee(libelle) {
  return !ACTION_DANGEREUSE.test(libelle.trim());
}
