import type { Metadata } from "next";
import { cache } from "react";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { prisma, safeQuery } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { legendFicheSlug } from "@/lib/legend-fiche";
import { displayLegendName } from "@/lib/utils";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { RANGS, classementVide, lireClassement, lireTitre, nomsCourts, type Classement, type Rang } from "@/lib/tier-list-perso";
import { TierListPerso, type LegendeATrier } from "./tier-list-perso";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const metadata: Metadata = {
  title: { absolute: "Créer une tier list Riftbound - classez les Légendes" },
  description:
    "Rangez les Légendes de Riftbound en S, A, B, C et D, en partant de zéro ou de la tier list du site, puis partagez votre classement par un simple lien.",
  alternates: { canonical: "/outils/tier-list" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Créer une tier list Riftbound",
    description: "Rangez les Légendes en S, A, B, C et D, puis partagez votre classement par un simple lien.",
    images: ["/img/og-default.png"],
  },
};

/**
 * Les Légendes à classer : celles de la tier list en cours du site. La base porte
 * 146 cartes Légende, variantes comprises (« Overnumbered », « Signature ») ; la
 * tier list n'en garde qu'une par Légende, sous le nom que tout le site emploie.
 * `cache` : le titre de l'onglet et la page la demandent chacun à chaque visite.
 */
const chargerLegendes = cache(async (): Promise<{ legendes: LegendeATrier[]; officiel: Classement | null }> => {
  return safeQuery(
    async () => {
      const liste = await prisma.tierList.findFirst({
        where: { current: true, published: true },
        include: { entries: { orderBy: { position: "asc" } } },
      });
      if (!liste) return { legendes: [], officiel: null };
      const cartes = await prisma.card.findMany({
        where: { riftboundId: { in: liste.entries.map((e) => e.legendId) } },
        select: { riftboundId: true, imageUrl: true },
      });
      const imageParId = new Map(cartes.map((c) => [c.riftboundId, c.imageUrl]));
      const legendes: LegendeATrier[] = [];
      const officiel = classementVide();
      const vues = new Set<string>();
      for (const e of liste.entries) {
        const slug = legendFicheSlug(e.legendName);
        if (vues.has(slug)) continue;
        vues.add(slug);
        legendes.push({
          slug,
          nom: displayLegendName(e.legendName),
          icone: getLegendIconUrl(e.legendName) ?? imageParId.get(e.legendId) ?? null,
        });
        if ((RANGS as readonly string[]).includes(e.tier)) officiel[e.tier as Rang].push(slug);
      }
      return { legendes, officiel };
    },
    { legendes: [], officiel: null },
    "tier list à créer",
  );
});

function lireParams(brut: Record<string, string | string[] | undefined>): URLSearchParams {
  return new URLSearchParams(
    Object.entries(brut).flatMap(([cle, valeur]) => (typeof valeur === "string" ? [[cle, valeur]] : [])),
  );
}

/**
 * Un lien partagé s'annonce avec son titre et son haut de classement : c'est ce que
 * montrent Discord et X dans l'aperçu, faute d'image de la tier list.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = lireParams(await searchParams);
  const titre = lireTitre(params);
  const { legendes } = await chargerLegendes();
  // Les noms écrits sous les icônes : « Master Yi, Master Yi » ne disait pas lequel.
  const nomParSlug = nomsCourts(legendes);
  const classement = lireClassement(params, new Set(nomParSlug.keys()));
  const resume = RANGS.filter((r) => classement[r].length)
    .map((r) => `${r} : ${classement[r].map((s) => nomParSlug.get(s)).join(", ")}`)
    .join(" · ");
  if (!titre && !resume) return metaTraduite(metadata);
  const t = await tr();
  const titrePartage = `${titre || t("Tier list Riftbound")} - Riftbound France`;
  const description = resume.length > 155 ? `${resume.slice(0, 152).trimEnd()}…` : resume;
  const traduite = await metaTraduite(metadata);
  return {
    ...traduite,
    title: { absolute: titrePartage },
    description: description || traduite.description,
    openGraph: { ...traduite.openGraph, title: titrePartage, description: description || undefined },
  };
}

export default async function CreerTierListPage({ searchParams }: PageProps) {
  const t = await tr();
  const params = lireParams(await searchParams);
  const { legendes, officiel } = await chargerLegendes();
  const connues = new Set(legendes.map((l) => l.slug));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: t("Tier List"), href: "/tier-list" }, { name: t("Créer une tier list"), href: "/outils/tier-list" }]} className="mb-6" />
      <h1 className="text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {t("Créer une tier list")}
      </h1>
      <p className="mt-2 max-w-3xl text-ink-secondary">
        {t("Rangez les Légendes en S, A, B, C et D, puis partagez le lien : votre classement tient tout entier dedans.")}{" "}
        <Link href="/tier-list" className="text-arcane hover:underline">{t("Voir la tier list du site")}</Link>
      </p>
      {legendes.length === 0 ? (
        <p className="mt-8 rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-ink-secondary">
          {t("La liste des Légendes n’a pas pu être chargée. Réessayez dans un instant.")}
        </p>
      ) : (
        <TierListPerso
          legendes={legendes}
          initial={lireClassement(params, connues)}
          titreInitial={lireTitre(params)}
          officiel={officiel}
        />
      )}
    </div>
  );
}
