import { prisma } from "@/lib/prisma";
import { legendFicheSlug, legendWithDecks } from "@/lib/legend-fiche";
import { getBannerUrl } from "@/lib/banners";
import { displayLegendName } from "@/lib/utils";
import { TAILLE_APERCU, apercuLegende } from "@/lib/apercu-image";

export const runtime = "nodejs";
export const alt = "Fiche Légende sur Riftbound France";
export const size = TAILLE_APERCU;
export const contentType = "image/png";

/** Le nom de la Légende d'une adresse : par ses decks, sinon par sa carte. */
async function nomDeLaLegende(slug: string): Promise<string | null> {
  const parDecks = await legendWithDecks(slug);
  if (parDecks) return parDecks.legendName;
  // Une Légende sans deck publié a quand même sa fiche : on la retrouve par sa carte.
  const cartes = await prisma.card.findMany({ where: { type: "Legend" }, select: { name: true } });
  return cartes.find((c) => legendFicheSlug(c.name) === slug)?.name ?? null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const nom = await nomDeLaLegende(slug);
  if (!nom) return apercuLegende({ legende: "Légende introuvable", banniere: null, pied: "riftboundfrance.fr" });
  return apercuLegende({
    legende: displayLegendName(nom),
    banniere: getBannerUrl(nom),
    pied: "Decks de tournoi, plan de jeu, cartes clés",
  });
}
