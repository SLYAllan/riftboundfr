// force-dynamic: queries the DB; `revalidate` froze it empty at Docker build.
export const dynamic = "force-dynamic";

import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { displayLegendName } from "@/lib/utils";
import { MetaFilters } from "./meta-filters";
import { Breadcrumbs } from "@/components/breadcrumbs";
import Link from "@/components/lien";
import { metaTraduite, tr } from "@/lib/i18n-server";

const getMetaData = unstable_cache(
  async () => {
    const [groupes, tierList] = await Promise.all([
      prisma.deck.groupBy({
        by: ["legendName", "tournamentContext", "setTag"],
        where: { published: true, tournamentContext: { not: null } },
        _count: { _all: true },
      }),
      prisma.tierList.findFirst({
        where: { current: true, published: true },
        select: { updatedAt: true, setContext: true },
      }),
    ]);

    return {
      tranches: groupes.map((groupe) => ({
        legendName: groupe.legendName,
        tournament: groupe.tournamentContext!,
        set: groupe.setTag,
        count: groupe._count._all,
      })),
      tierList,
    };
  },
  ["meta-snapshot-v3"],
  { revalidate: 300, tags: ["meta"] },
);

const metadata: Metadata = {
  title: { absolute: "Méta Riftbound Vendetta - Decks et Légendes les plus joués en tournoi" },
  description:
    "Le méta deck Riftbound par set et tournoi : les decks et Légendes les plus joués, avec parts de terrain et conversions, recalculés sur les decklists complètes publiées.",
  alternates: { canonical: "/meta" },
};

export default async function MetaSnapshotPage() {
  const t = await tr();
  type MetaData = Awaited<ReturnType<typeof getMetaData>>;
  let data: MetaData;
  try {
    data = await getMetaData();
  } catch {
    data = { tranches: [], tierList: null };
  }

  if (data.tranches.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-4xl font-bold font-display">{t("Méta Riftbound")}</h1>
        <p className="mt-4 text-ink-secondary">{t("Les données de la méta ne sont pas encore disponibles. Revenez après la prochaine mise à jour.")}</p>
      </div>
    );
  }

  const noms = [...new Set(data.tranches.map((tranche) => tranche.legendName))];
  const legendes = noms.map((legendName) => ({
    legendName,
    shortName: displayLegendName(legendName),
    iconUrl: getLegendIconUrl(legendName),
  }));
  const sets = [...new Set(data.tranches.map((tranche) => tranche.set))]
    .filter(Boolean)
    .sort((a, b) => (a === "Vendetta" ? -1 : b === "Vendetta" ? 1 : a.localeCompare(b)));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Breadcrumbs items={[{ name: t("Méta"), href: "/meta" }]} className="mb-6" />

      <header className="grid gap-5 border-b border-hairline pb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-arcane">{t("Données de tournoi")}</p>
          <h1 className="mt-2 text-balance text-3xl font-bold font-display sm:text-5xl">{t("Le méta Riftbound : decks et Légendes, tournoi par tournoi")}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-base leading-relaxed text-ink-secondary">
            {t("Comparez la présence des Légendes par set ou par événement. Chaque classement est recalculé sur la sélection affichée.")}
          </p>
        </div>
        <Link
          href="/tier-list"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-hairline bg-surface px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface-raised"
        >
          {t("Voir la tier list")}
        </Link>
      </header>

      <MetaFilters tranches={data.tranches} legendes={legendes} sets={sets} />

      <footer className="mt-8 border-t border-hairline pt-5">
        <p className="max-w-4xl text-sm leading-relaxed text-ink-muted">
          {t("Ces chiffres mesurent la représentation dans les decklists publiées, pas le taux de victoire. Les listes incomplètes ne sont pas comptabilisées.")}
        </p>
      </footer>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
