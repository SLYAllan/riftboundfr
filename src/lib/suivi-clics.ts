// Nomme l'événement GA4 d'un clic, pour l'écouteur unique de `analytics.tsx`.
//
// Vit à part de `cardnexus.ts`, qui lit le disque et ne peut pas partir dans le
// navigateur. Les liens d'achat sont fabriqués là-bas, sous trois formes : le
// panier passe par notre route, le produit et la boutique vont droit chez
// l'affilié. Sans ces événements, on ne savait pas quelle page amenait des
// ventes ni des comptes : Search Console dit qui arrive, pas qui agit.

export type TypeAchat = "panier" | "manquantes" | "produit" | "boutique";

// Le préfixe de langue (/en, /zh) peut précéder une route.
const LANGUE = "(\\/(en|zh))?";

export function typeClicAchat(href: string, origine: string): TypeAchat | null {
  let url: URL;
  try {
    url = new URL(href, origine);
  } catch {
    return null;
  }
  if (url.origin === new URL(origine).origin) {
    if (!new RegExp(`^${LANGUE}/api/cardnexus/panier$`).test(url.pathname)) return null;
    // Le panier des seules cartes qui manquent à la collection : compté à part.
    return url.searchParams.has("manquantes") ? "manquantes" : "panier";
  }
  if (url.hostname !== "af.cardnexus.link") return null;
  // af.cardnexus.link/<partenaire>/cn/<id>/<nom> = produit,
  // /<partenaire>/products/cn/<lignes> = panier, le reste = boutique.
  const segment = url.pathname.split("/")[2];
  return segment === "cn" ? "produit" : segment === "products" ? "panier" : "boutique";
}

export interface Evenement {
  nom: string;
  params: Record<string, string>;
}

/**
 * `suivi` = valeur de l'attribut `data-suivi` de l'élément cliqué (ou de son
 * parent), posé à la main sur une action à mesurer. Les liens d'achat et de
 * connexion se reconnaissent seuls : les oublier sur une page ne coûte rien.
 */
export function evenementClic(href: string | null, suivi: string | null, origine: string): Evenement | null {
  if (href) {
    const achat = typeClicAchat(href, origine);
    if (achat) return { nom: "clic_cardnexus", params: { type_achat: achat } };
    try {
      const url = new URL(href, origine);
      if (url.origin === new URL(origine).origin && new RegExp(`^${LANGUE}/api/auth/discord$`).test(url.pathname)) {
        return { nom: "connexion_discord", params: {} };
      }
    } catch {
      // href illisible : on retombe sur data-suivi.
    }
  }
  return suivi ? { nom: suivi, params: {} } : null;
}
