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

// Ordres proposés dans le filtre "Tri". Défaut = numéro de collection par set.
const SORTS: Record<string, Prisma.CardOrderByWithRelationInput[]> = {
  numero: [{ set: "asc" }, { collectorNumber: "asc" }],
  nom: [{ name: "asc" }],
  "energie-asc": [{ energy: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  "energie-desc": [{ energy: { sort: "desc", nulls: "last" } }, { name: "asc" }],
};

const metadata: Metadata = {
  title: { absolute: "Cartes Riftbound en français - base de données complète et filtres" },
  description:
    "Toutes les cartes Riftbound en français : recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged, Unleashed et Vendetta.",
  alternates: { canonical: "/cartes" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Cartes Riftbound en français - base de données complète et filtres",
    description:
      "Recherche par nom, set, type, rareté et domaine. Sets Origins, Spiritforged, Unleashed et Vendetta.",
    images: ["/img/og-default.png"],
  },
};

const PER_PAGE = 48;

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CartesPage({ searchParams }: PageProps) {
  const t = await tr();
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
      vendetta: ["VEN"],
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

  const orderBy = SORTS[params.sort ?? "numero"] ?? SORTS.numero;

  const [cards, total] = await Promise.all([
    prisma.card.findMany({
      where,
      // select léger : pas de textPlain/textHtml (lourds, inutiles dans la grille).
      select: { id: true, riftboundId: true, name: true, imageUrl: true, rarity: true, setName: true, type: true },
      orderBy,
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.card.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold font-display">{t("Base de données des cartes Riftbound")}</h1>
      <p className="mt-2 max-w-3xl text-ink-secondary">
        {t("Parcourez toutes les cartes du TCG Riftbound - sets Origins, Spiritforged, Unleashed et Vendetta. Filtrez par set, type, rareté et domaine, et consultez le texte complet et les statistiques de chaque carte en français.")}
      </p>
      <div className="mt-8"><Suspense><SearchBar /></Suspense></div>
      <div className="mt-4"><Suspense><CardFilters total={total} /></Suspense></div>
      <div className="mt-8"><CardGrid cards={cards} /></div>
      <div className="mt-8"><Suspense><Pagination currentPage={page} totalPages={totalPages} /></Suspense></div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
