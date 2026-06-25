export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { CardGrid } from "@/components/card-grid";
import { CardFilters } from "@/components/card-filters";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: { absolute: "Cartes Riftbound en français - base de données complète et filtres" },
  description:
    "Toutes les cartes Riftbound en français : recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged et Unleashed.",
  alternates: { canonical: "/cartes" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Cartes Riftbound en français - base de données complète et filtres",
    description:
      "Recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged et Unleashed.",
    images: ["/img/og-default.png"],
  },
};

const PER_PAGE = 48;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CartesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.q;
  const set = params.set;
  const type = params.type;
  const rarity = params.rarity;
  const domain = params.domain;

  const where: Prisma.CardWhereInput = {};
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (set && set !== "all") {
    const setMap: Record<string, string[]> = {
      origins: ["OGN", "OGS"],
      spiritforged: ["SFD"],
      unleashed: ["UNL"],
      promo: ["PR", "OPP", "JDG"],
    };
    const setIds = setMap[set];
    if (setIds) where.set = { in: setIds };
    else where.set = set;
  }
  if (set !== "promo") {
    where.signature = false;
  }
  if (type && type !== "all") where.type = type;
  if (rarity && rarity !== "all") where.rarity = rarity;
  if (domain && domain !== "all") where.domains = { has: domain };

  const [cards, total, sets] = await Promise.all([
    prisma.card.findMany({
      where,
      orderBy: [{ name: "asc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.card.count({ where }),
    prisma.cardSet.findMany({ orderBy: { publishedOn: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const activeFilters = [set, type, rarity, domain, search].filter((f) => f && f !== "all").length;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Base de données des cartes Riftbound</h1>
      <p className="mt-2 max-w-3xl text-ink-secondary">
        Parcourez toutes les cartes du TCG Riftbound - sets Origins, Spiritforged et Unleashed. Filtrez par set, type, rareté et domaine, et consultez le texte complet et les statistiques de chaque carte en français.
      </p>
      <div className="mt-6"><Suspense><SearchBar /></Suspense></div>
      <div className="mt-4"><Suspense><CardFilters sets={sets.map((s) => ({ setId: s.setId, name: s.name }))} /></Suspense></div>
      <div className="mt-4 flex items-center gap-2 text-sm text-ink-secondary">
        <span>{total} carte{total !== 1 ? "s" : ""}</span>
        {activeFilters > 0 && <span className="text-ink-muted">&middot; {activeFilters} filtre{activeFilters !== 1 ? "s" : ""} actif{activeFilters !== 1 ? "s" : ""}</span>}
        <span className="text-ink-muted">&middot; Page {page} sur {totalPages || 1}</span>
      </div>
      <div className="mt-6"><CardGrid cards={cards} /></div>
      <div className="mt-8"><Suspense><Pagination currentPage={page} totalPages={totalPages} /></Suspense></div>
    </div>
  );
}
