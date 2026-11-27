/**
 * Lecture du figurier chinois OFFICIEL (playloltcg.com). Partagée par
 * `sync-cartes-zh.mts` (noms et images chinois) et `sync-set-riot.mts` (type d'une
 * carte que la galerie de Riot n'a pas encore rempli, et domaine de chaque carte).
 */
export const API = "https://lol-api.playloltcg.com/xcx/card/searchCardCraftWeb";

export type CarteZh = {
  cardNo: string;
  cardName: string;
  subTitle: string;
  hero: string;
  energy: number | null;
  power: number | null;
  cardCategoryList: string[];
  cardCategoryNameList: string[];
  cardColorList?: string[];
  frontImage: string;
};

// Couleur chinoise → domaine. Relevé le 27 novembre 2026 sur les 1 100 cartes
// mono-domaine d'Origins à Vendetta : aucune exception hors des 30 cartes Radiance
// que la galerie de Riot range dans le mauvais domaine.
export const DOMAINE_PAR_COULEUR: Record<string, string> = {
  red: "Fury", green: "Calm", blue: "Mind", orange: "Body", purple: "Chaos", yellow: "Order",
  colorless: "Colorless", neutral: "Colorless",
};

export async function figurierOfficiel(): Promise<CarteZh[]> {
  const reponse = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Le figurier est appelé depuis le site de l'éditeur : on se présente comme lui.
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.playloltcg.com/",
    },
    body: JSON.stringify({ pageNum: 1, pageSize: 5000 }),
  });
  if (!reponse.ok) throw new Error(`Figurier chinois : ${reponse.status}`);
  const recu = (await reponse.json()) as { result?: { total?: number; list?: CarteZh[] } };
  const liste = recu.result?.list ?? [];
  const total = recu.result?.total ?? 0;
  // Une page partielle passerait inaperçue et retirerait leurs images à des centaines
  // de cartes. On refuse plutôt que d'écrire une relève amputée.
  if (liste.length !== total) throw new Error(`Figurier tronqué : ${liste.length} reçues sur ${total}`);
  if (liste.length === 0) throw new Error("Figurier vide");
  return liste;
}
