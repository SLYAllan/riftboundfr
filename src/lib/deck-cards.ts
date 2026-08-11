import { prisma } from "./prisma";
import { buildCardLookup, findCard, normalizeCardName, VARIANT_SUFFIX } from "./card-printing";
import type { DeckCodeData } from "./deck-codec";

// Point de passage UNIQUE entre un code de deck et les cartes en base.
//
// Ce bloc était copié dans quatre fichiers (/d/[code], /decks/compare et deux
// fois /api/decklist-image), chacun avec le même défaut : une heuristique
// « contient un espace donc c'est un nom », un filtre `alternateArt: false` qui
// escamotait les cartes n'existant qu'en alt-art, et un `continue` muet qui
// supprimait sans rien dire ce qui n'était pas trouvé. Corriger une copie en
// laissait trois cassées. Tout passe désormais par ici.

/**
 * Toutes les formes sous lesquelles chercher un identifiant en base.
 * `cleanName` retire l'apostrophe ET la virgule (« Kai'Sa, Survivor » y est
 * stocké « KaiSa Survivor »), d'où la variante sans ponctuation.
 */
export function queryKeys(identifier: string): string[] {
  const base = identifier.replace(VARIANT_SUFFIX, "").trim().replace(/\s+/g, " ");
  const sansApostrophe = base.replace(/[‘’ʼ`´']/g, "");
  const sansPonctuation = sansApostrophe.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
  return [...new Set([identifier, base, sansApostrophe, sansPonctuation].filter(Boolean))];
}

/** Les identifiants cités par un deck décodé, dans l'ordre des sections. */
export function deckIdentifiers(deck: DeckCodeData): string[] {
  const ids: string[] = [];
  if (deck.legend) ids.push(deck.legend.cardId);
  if (deck.champion) ids.push(deck.champion.cardId);
  for (const e of [...deck.main, ...deck.rune, ...deck.battlefield, ...deck.side]) {
    ids.push(e.cardId);
  }
  return ids;
}

export interface ResolvedDeckCards<T> {
  /** Indexé par riftboundId, nom exact, minuscules et nom normalisé. */
  map: Map<string, T>;
  /** Identifiants cités par le deck et introuvables en base. Jamais silencieux. */
  missing: string[];
}

/**
 * Retrouve les cartes d'un deck, que le code porte des identifiants ou des noms,
 * avec ou sans apostrophe, avec ou sans suffixe de variante.
 */
export async function resolveDeckCards(
  identifiers: string[],
): Promise<ResolvedDeckCards<Awaited<ReturnType<typeof prisma.card.findMany>>[number]>> {
  const keys = [...new Set(identifiers.flatMap(queryKeys))];
  if (keys.length === 0) return { map: new Map(), missing: [] };

  const cards = await prisma.card.findMany({
    where: {
      OR: [
        { riftboundId: { in: keys } },
        { name: { in: keys, mode: "insensitive" } },
        { cleanName: { in: keys, mode: "insensitive" } },
      ],
    },
  });

  const map = buildCardLookup(cards);
  // cleanName est la variante sans apostrophe stockée en base : on l'indexe
  // aussi, sinon « Zhonyas Hourglass » trouve la ligne mais pas la clé.
  for (const c of cards) {
    if (!c.cleanName) continue;
    const key = normalizeCardName(c.cleanName);
    if (key && !map.has(key)) map.set(key, c);
  }

  const missing = [...new Set(identifiers.filter((id) => !findCard(map, id)))];
  return { map, missing };
}
