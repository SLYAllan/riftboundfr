import { prisma } from "@/lib/prisma";
import { rangPlacement } from "@/lib/card-play";
import { slugify, displayLegendName } from "@/lib/utils";
import { getTournamentInfo } from "@/lib/tournament-flags";
import { getLegendIconUrl } from "@/lib/banners";
import { datesEnFrancais } from "@/lib/apercu";
import { TAILLE_APERCU, apercuTournoi, nomEtTitre } from "@/lib/apercu-image";

export const runtime = "nodejs";
export const alt = "Résultats de tournoi sur Riftbound France";
export const size = TAILLE_APERCU;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Le tournoi d'une adresse se retrouve par son nom en base, comme le fait la page.
  // La page écarte en plus les tournois de moins de six listes : sans page, personne
  // ne demande cette image, la règle n'a donc pas à être recopiée ici.
  const contextes = await prisma.deck.findMany({
    where: { published: true, tournamentContext: { not: null }, placement: { not: null } },
    distinct: ["tournamentContext"],
    select: { tournamentContext: true },
  });
  const contexte = contextes.map((c) => c.tournamentContext!).find((c) => slugify(c) === slug);
  if (!contexte) return apercuTournoi({ nom: "Tournoi introuvable", pied: ["riftboundfrance.fr"], podium: [] });

  const info = getTournamentInfo(contexte);
  const listes = await prisma.deck.findMany({
    where: { published: true, tournamentContext: contexte, placement: { not: null } },
    select: { legendName: true, placement: true },
  });
  const podium = listes
    .sort((a, b) => rangPlacement(a.placement) - rangPlacement(b.placement))
    .slice(0, 4)
    .map((d) => ({ nom: nomEtTitre(displayLegendName(d.legendName)).nom, icone: getLegendIconUrl(d.legendName) }));

  const lieu = [info?.date ? datesEnFrancais(info.date) : null, info?.city ?? null].filter(Boolean).join(", ");
  return apercuTournoi({
    nom: info?.name ?? datesEnFrancais(contexte),
    sous: info?.playerCount ? `${info.playerCount} joueurs` : undefined,
    pied: lieu ? [lieu] : [],
    podium,
  });
}
