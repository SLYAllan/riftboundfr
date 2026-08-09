// Lien d'une Légende vers sa page /legendes/[slug].
//
// Le slug se déduit du nom canonique, apostrophes retirées : "Kha'Zix, Voidreaver"
// -> "khazix-voidreaver". Il absorbe au passage les variantes de casse en base
// ("Rek'sai" et "Rek'Sai" tombent sur le même slug).
//
// Toute Légende qui a au moins un deck publié a une page, fiche rédigée ou non :
// la page se rabat sur la base quand data/fiches/<slug>.json n'existe pas. Un lien
// posé depuis une page deck est donc toujours valide, sans vérification préalable.

import { prisma } from "@/lib/prisma";

export function legendFicheSlug(legendName: string): string {
  return legendName
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function legendHref(legendName: string): string {
  return `/legendes/${legendFicheSlug(legendName)}`;
}

export interface LegendWithDecks {
  slug: string;
  legendName: string;
  deckCount: number;
}

// Légendes ayant au moins un deck publié, regroupées par slug de page. Sert à trois
// endroits (page Légende, index, sitemap) d'où le cache : un groupBy sur 22k decks à
// chaque requête ne se justifie pas pour une liste qui bouge à chaque import, pas à
// chaque visite.
let cache: { at: number; rows: LegendWithDecks[] } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function legendsWithDecks(): Promise<LegendWithDecks[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const groups = await prisma.deck.groupBy({
      by: ["legendName"],
      where: { published: true },
      _count: { _all: true },
    });
    // Deux graphies peuvent tomber sur le même slug ("Rek'sai" / "Rek'Sai") : on
    // additionne les decks et on affiche la graphie la plus fréquente.
    const bySlug = new Map<string, { slug: string; best: string; bestCount: number; total: number }>();
    for (const g of groups) {
      const slug = legendFicheSlug(g.legendName);
      const n = g._count._all;
      const seen = bySlug.get(slug);
      if (!seen) {
        bySlug.set(slug, { slug, best: g.legendName, bestCount: n, total: n });
      } else {
        seen.total += n;
        if (n > seen.bestCount) {
          seen.best = g.legendName;
          seen.bestCount = n;
        }
      }
    }
    const rows: LegendWithDecks[] = [...bySlug.values()]
      .map((e) => ({ slug: e.slug, legendName: e.best, deckCount: e.total }))
      .sort((a, b) => b.deckCount - a.deckCount);
    cache = { at: Date.now(), rows };
    return rows;
  } catch {
    // DB indisponible (build Docker) : on rend sans, jamais d'invention.
    return cache?.rows ?? [];
  }
}

export async function legendWithDecks(slug: string): Promise<LegendWithDecks | null> {
  return (await legendsWithDecks()).find((l) => l.slug === slug) ?? null;
}
