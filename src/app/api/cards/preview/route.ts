import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { imageChinoise } from "@/lib/cards-zh";

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
  // `langue=zh` : l'overlay d'un stream chinois montre la carte chinoise. Le repli
  // sur l'image d'origine est voulu — le miroir n'a pas toutes les cartes, et un
  // trou en plein direct serait pire qu'une carte dans la mauvaise langue.
  const enChinois = req.nextUrl.searchParams.get("langue") === "zh";

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
      set: true, collectorNumber: true, overnumbered: true, signature: true, riftboundId: true,
    },
  });

  if (cards.length === 0) return NextResponse.json(null, { status: 404 });

  const best = cards.reduce((a, b) => {
    const d = canonicalScore(a) - canonicalScore(b);
    if (d !== 0) return d < 0 ? a : b;
    return (a.collectorNumber ?? 9999) <= (b.collectorNumber ?? 9999) ? a : b;
  });

  const { set: _set, collectorNumber: _n, overnumbered: _o, signature: _s, riftboundId, ...card } = best;
  // Les champs de bataille sont exclus : le miroir range ces cartes paysage dans un
  // fichier portrait, tournées d'un quart de tour. L'overlay en montre un morceau
  // d'illustration, et le texte chinois s'y retrouvait à la verticale. L'art est le
  // même des deux côtés, seul le texte change : on ne perd rien à garder l'original.
  if (enChinois && card.type !== "Battlefield") {
    card.imageUrl = imageChinoise(riftboundId) ?? card.imageUrl;
  }

  return NextResponse.json(card, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      // La réponse dépend du paramètre `langue`, qui est dans l'URL : rien à varier
      // côté en-têtes. Ce commentaire est là pour qu'on ne le déplace pas en cookie.
    },
  });
}
