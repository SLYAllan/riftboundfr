import { NextResponse } from "next/server";
import { NOMS_ZH } from "@/lib/cards-zh";

/**
 * La table des noms chinois, pour l'overlay et ses deux tableaux de bord.
 *
 * Servie plutôt qu'importée dans le paquet du navigateur : elle ne sert qu'aux pages
 * en chinois, et l'embarquer alourdirait aussi celles en français. Elle ne change
 * qu'au relevé (`npm run maj:cartes-zh`), d'où le cache long.
 */
export function GET() {
  return NextResponse.json(NOMS_ZH, {
    // `max-age` explicite : sans lui, le navigateur choisit tout seul combien de temps
    // garder la table, et il gardait la précédente après un relevé. Cinq minutes côté
    // navigateur, une journée côté CDN, où un déploiement purge de toute façon.
    headers: { "Cache-Control": "public, max-age=300, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
