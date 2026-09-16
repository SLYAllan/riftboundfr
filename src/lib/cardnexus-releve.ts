import { prisma } from "./prisma";
import { cleCatalogue, prixRetenu, type BlocPrix, type FichierPrix, type PrixCarte } from "./cardnexus";

// Le relevé de prix CardNexus, partagé par `scripts/sync-prices.mts` et par le
// serveur lui-même, qui se relève tout seul une fois par jour. Tant que seul le
// script savait le faire, personne ne le lançait : les prix en ligne avaient
// près d'un mois le 16 septembre.

const API = "https://public-api.cardnexus.com/v1";

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'`]/g, "")
    // CardNexus écrit « Annie - Fiery » là où Riftcodex écrit « Annie, Fiery ».
    .replace(/\s*[-,]\s*/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface Produit {
  id: number;
  name: string;
  printNumber: string;
  expansion: { code: string };
  pricesByFinish?: Record<string, BlocPrix>;
}

/** Le catalogue Riftbound entier, 200 par appel. 1400 cartes = 8 requêtes. */
async function catalogue(cle: string): Promise<Produit[]> {
  const out: Produit[] = [];
  for (let offset = 0; ; offset += 200) {
    const res = await fetch(`${API}/products/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cle}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        gameFilters: { game: "riftbound" },
        productType: { op: "or", values: ["card"] },
        limit: 200,
        offset,
      }),
    });
    if (!res.ok) throw new Error(`POST /products/search -> ${res.status} ${await res.text()}`);
    const j = (await res.json()) as { data: Produit[]; pagination: { hasMore: boolean } };
    out.push(...j.data);
    if (!j.pagination.hasMore) break;
  }
  return out;
}

export interface Releve {
  prix: FichierPrix;
  cartes: number;
  parNumero: number;
  parNom: number;
  sansPrix: string[];
  introuvables: string[];
}

export async function releverPrix(cle: string): Promise<Releve> {
  const produits = await catalogue(cle);

  const parNumero = new Map<string, Produit>();
  const parNom = new Map<string, Produit>();
  for (const p of produits) {
    parNumero.set(`${p.expansion.code}-${p.printNumber}`.toUpperCase(), p);
    // Plusieurs impressions d'une même carte : on garde la moins chère, c'est
    // l'exemplaire qu'un joueur achète pour jouer.
    const cleNom = normalizeName(p.name);
    const prec = parNom.get(cleNom);
    const px = prixRetenu(p.pricesByFinish);
    const pxPrec = prec ? prixRetenu(prec.pricesByFinish) : null;
    if (!prec || (px && (!pxPrec || px.eur < pxPrec.eur))) parNom.set(cleNom, p);
  }

  const cartes = await prisma.card.findMany({
    select: { riftboundId: true, name: true, cleanName: true, set: true },
  });

  const cards: Record<string, PrixCarte> = {};
  let parNum = 0;
  let parNomHit = 0;
  const sansPrix: string[] = [];
  const introuvables: string[] = [];

  for (const c of cartes) {
    let p = cleCatalogue(c.riftboundId)
      .map((k) => parNumero.get(k))
      .find(Boolean);
    if (p) parNum++;
    else {
      // Nos préfixes OPP, PR et JDG ne sont pas des codes d'extension CardNexus :
      // pour ces cartes le numéro ne peut pas trancher, seul le nom le peut.
      p = parNom.get(normalizeName(c.name)) ?? (c.cleanName ? parNom.get(normalizeName(c.cleanName)) : undefined);
      if (p) parNomHit++;
    }
    if (!p) {
      introuvables.push(`${c.set} ${c.name}`);
      continue;
    }
    const px = prixRetenu(p.pricesByFinish);
    if (!px) {
      sansPrix.push(`${c.set} ${c.name}`);
      continue;
    }
    cards[c.riftboundId] = { eur: px.eur, productId: p.id, nom: p.name, source: px.source, finition: px.finition };
  }

  return {
    prix: {
      source: "CardNexus (public-api.cardnexus.com), marché européen, en euros",
      fetchedAt: new Date().toISOString(),
      currency: "EUR",
      cards,
    },
    cartes: cartes.length,
    parNumero: parNum,
    parNom: parNomHit,
    sansPrix,
    introuvables,
  };
}
