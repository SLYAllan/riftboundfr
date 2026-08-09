import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Sets promotionnels : Organized Play, promos génériques, cartes de juge.
const PROMO_SETS = new Set(["OPP", "PR", "JDG"]);

// Une même carte existe souvent en plusieurs éditions. 70 noms sur les 100 tirages
// promo ont aussi une édition de base. `findFirst` sans tri rendait n'importe
// laquelle, au gré de Postgres : tant que les entrées promo portaient l'art de la
// carte de base, ça ne se voyait pas. Depuis que `scripts/fix-promo-images.ts` leur
// a rendu leur vrai art, l'aperçu au survol pouvait afficher la version promo de
// n'importe quelle carte. Le script n'est pas en cause, il a révélé le tri absent.
//
// On classe donc les éditions et on rend la plus ordinaire : ni variante, ni promo,
// et à égalité le plus petit numéro de collection.
function canonicalScore(c: { set: string; overnumbered: boolean; signature: boolean }): number {
  return (c.overnumbered ? 4 : 0) + (c.signature ? 2 : 0) + (PROMO_SETS.has(c.set) ? 1 : 0);
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json(null, { status: 400 });

  const cards = await prisma.card.findMany({
    where: {
      alternateArt: false,
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { cleanName: { equals: name, mode: "insensitive" } },
      ],
    },
    select: {
      name: true, imageUrl: true, type: true, energy: true, might: true, rarity: true, domains: true,
      // L'effet, illisible sur une image de 300 px de large. Décisif pour un
      // Équipement, dont le texte EST la carte.
      textPlain: true,
      set: true, collectorNumber: true, overnumbered: true, signature: true,
    },
  });

  if (cards.length === 0) return NextResponse.json(null, { status: 404 });

  const best = cards.reduce((a, b) => {
    const d = canonicalScore(a) - canonicalScore(b);
    if (d !== 0) return d < 0 ? a : b;
    return (a.collectorNumber ?? 9999) <= (b.collectorNumber ?? 9999) ? a : b;
  });

  const { set: _set, collectorNumber: _n, overnumbered: _o, signature: _s, ...card } = best;

  return NextResponse.json(card, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
