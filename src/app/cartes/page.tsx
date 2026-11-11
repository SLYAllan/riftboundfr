export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { SearchBar } from "@/components/search-bar";
import { CardGrid } from "@/components/card-grid";
import { CardFilters } from "@/components/card-filters";
import { Pagination } from "@/components/pagination";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { preparerFiltreMotCle } from "@/lib/card-keywords";
import { comparerCartesParSet } from "@/lib/tournament-order";

// Ordres proposés dans le filtre "Tri". Le défaut, « numero », n'est pas ici :
// Prisma ne trie pas sur une liste de sets, il passe par `comparerCartesParSet`.
const SORTS: Record<string, Prisma.CardOrderByWithRelationInput[]> = {
  nom: [{ name: "asc" }],
  "energie-asc": [{ energy: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  "energie-desc": [{ energy: { sort: "desc", nulls: "last" } }, { name: "asc" }],
};

const metadata: Metadata = {
  title: { absolute: "Cartes Riftbound en français - base de données complète et filtres" },
  description:
    "Toutes les cartes Riftbound en français : recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged, Unleashed, Vendetta et Radiance.",
  alternates: { canonical: "/cartes" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Cartes Riftbound en français - base de données complète et filtres",
    description:
      "Recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged, Unleashed, Vendetta et Radiance.",
    images: ["/img/og-default.png"],
  },
};

const PER_PAGE = 24;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CartesPage({ searchParams }: PageProps) {
  const t = await tr();
  const params = await searchParams;
  const pageDemandee = Math.max(1, Number(params.page) || 1);
  const search = params.q?.trim();
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
      vendetta: ["VEN"],
      radiance: ["RAD"],
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

  const candidates = await prisma.card.findMany({
    where,
    select: { id: true, textPlain: true, set: true, setName: true, collectorNumber: true },
  });
  const filtreMecanique = preparerFiltreMotCle(candidates, params.mechanic);
  const mecaniques = filtreMecanique.options;
  if (filtreMecanique.value) where.id = { in: filtreMecanique.cartes.map(({ id }) => id) };

  const orderBy = SORTS[params.sort ?? ""];

  const total = await prisma.card.count({ where });
  const totalPages = Math.ceil(total / PER_PAGE);
  const page = Math.min(pageDemandee, Math.max(1, totalPages));
  // select léger : pas de textPlain/textHtml (lourds, inutiles dans la grille).
  const select = { id: true, riftboundId: true, name: true, imageUrl: true, rarity: true, setName: true, type: true } as const;
  let cards;
  if (orderBy) {
    cards = await prisma.card.findMany({ where, select, orderBy, skip: (page - 1) * PER_PAGE, take: PER_PAGE });
  } else {
    // Tri en mémoire sur les candidates déjà chargées pour le filtre de mécanique.
    const ids = filtreMecanique.cartes
      .sort(comparerCartesParSet)
      .slice((page - 1) * PER_PAGE, page * PER_PAGE)
      .map(({ id }) => id);
    const trouvees = await prisma.card.findMany({ where: { id: { in: ids } }, select });
    cards = trouvees.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-3xl font-bold font-display sm:text-4xl">{t("Base de données des cartes Riftbound")}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-secondary sm:text-base">
        {t("Consultez toutes les cartes Riftbound des sets Origins, Spiritforged, Unleashed, Vendetta et Radiance. Filtrez-les par set, type, rareté ou domaine, puis lisez leur texte et leurs statistiques en français.")}
      </p>
      <div className="mt-4 sm:mt-8"><Suspense><SearchBar /></Suspense></div>
      <div className="mt-4"><Suspense><CardFilters total={total} mecaniques={mecaniques} /></Suspense></div>
      <div className="mt-6 sm:mt-8"><CardGrid cards={cards} /></div>
      <div className="mt-8"><Suspense><Pagination currentPage={page} totalPages={totalPages} /></Suspense></div>
    </div>
  );
}

/**
 * Les 24 cartes changent d'une page à l'autre, mais toutes annonçaient `/cartes`
 * en canonical : Google ne voyait donc qu'une page sur quarante.
 *
 * Chaque page numérotée se désigne elle-même. Les vues FILTRÉES, elles, se
 * regroupent bien sur `/cartes` : ce sont des combinaisons de la même liste, pas
 * des pages à indexer une par une.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const filtre = ["q", "set", "type", "rarity", "domain", "mechanic", "sort"].some((c) => params[c]);
  const canonical = !filtre && page > 1 ? `/cartes?page=${page}` : "/cartes";
  return metaTraduite({ ...metadata, alternates: { ...metadata.alternates, canonical } });
}
