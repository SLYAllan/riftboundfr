import type { Prisma } from "@prisma/client";

export interface FiltresDecks {
  cat?: "bestof" | "guide" | "all";
  legend?: string;
  set?: string;
  tournament?: string;
  q: string;
  sort?: "popular" | "placement";
  owned: boolean;
  offset: number;
}

export interface DeckListe {
  id: string;
  slug: string;
  title: string;
  legendName: string;
  legendId: string;
  playerName: string | null;
  authorName: string | null;
  placement: string | null;
  record: string | null;
  tournamentContext: string | null;
  tournamentTier: string | null;
  featured: boolean;
  setTag: string;
  sourceUrl: string | null;
  guide: string | null;
  createdAt: string;
  description: string | null;
  format: string;
  likes: number;
  sourceArticle: { slug: string; title: string } | null;
  coverage?: { owned: number; required: number; missing: number };
}

export interface LotDecks {
  decks: DeckListe[];
  total: number;
  suivant: number | null;
}

export function comparerPlacements(a: string | null, b: string | null): number {
  const rangA = a ? Number.parseInt(a, 10) : Number.POSITIVE_INFINITY;
  const rangB = b ? Number.parseInt(b, 10) : Number.POSITIVE_INFINITY;
  return rangA - rangB;
}

export function lireFiltresDecks(params: Record<string, string | undefined>): FiltresDecks {
  const offset = Number.parseInt(params.offset ?? "0", 10);
  return {
    cat: params.cat === "bestof" || params.cat === "guide" || params.cat === "all" ? params.cat : undefined,
    legend: params.legend || undefined,
    set: params.set || undefined,
    tournament: params.tournament || undefined,
    q: (params.q ?? "").trim(),
    sort: params.sort === "popular" || params.sort === "placement" ? params.sort : undefined,
    owned: params.owned === "1",
    offset: Number.isFinite(offset) && offset > 0 ? offset : 0,
  };
}

export function parametresDecks(filtres: FiltresDecks): URLSearchParams {
  const params = new URLSearchParams();
  if (filtres.cat) params.set("cat", filtres.cat);
  if (filtres.legend) params.set("legend", filtres.legend);
  if (filtres.set) params.set("set", filtres.set);
  if (filtres.tournament) params.set("tournament", filtres.tournament);
  if (filtres.q) params.set("q", filtres.q);
  if (filtres.sort) params.set("sort", filtres.sort);
  if (filtres.owned) params.set("owned", "1");
  if (filtres.offset) params.set("offset", String(filtres.offset));
  return params;
}

export function modifierParametresDecks(
  courants: URLSearchParams,
  changements: Record<string, string | null>,
): URLSearchParams {
  const suivants = new URLSearchParams(courants);
  for (const [nom, valeur] of Object.entries(changements)) {
    if (valeur) suivants.set(nom, valeur);
    else suivants.delete(nom);
  }
  suivants.delete("offset");
  return suivants;
}

export function construireWhere(filtres: FiltresDecks): Prisma.DeckWhereInput {
  const where: Prisma.DeckWhereInput = { published: true };
  if (filtres.cat === "guide") where.guide = { not: null };
  else if (filtres.cat === "bestof") where.featured = true;
  // Hors du bloc ci-dessus : sinon `?cat=guide&tournament=X` perdait le tournoi.
  if (filtres.tournament) where.tournamentContext = filtres.tournament;
  if (filtres.legend) where.legendName = { contains: filtres.legend, mode: "insensitive" };
  if (filtres.set) where.setTag = filtres.set;
  if (filtres.q) {
    const like = { contains: filtres.q, mode: "insensitive" as const };
    where.AND = [{ OR: [
      { title: like }, { legendName: like }, { playerName: like },
      { tournamentContext: like }, { cards: { some: { card: { name: like } } } },
    ] }];
  }
  return where;
}
