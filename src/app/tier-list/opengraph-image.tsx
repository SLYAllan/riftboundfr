import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";
import { TAILLE_APERCU, apercuTierList } from "@/lib/apercu-image";

export const runtime = "nodejs";
// Sans paramètre dans son adresse, Next dessinait cette image une fois pour toutes au
// build. Dans Docker, la base n'est pas joignable à ce moment-là : le build aurait
// échoué, ou figé une tier list vide.
export const dynamic = "force-dynamic";
export const alt = "Tier list Riftbound sur Riftbound France";
export const size = TAILLE_APERCU;
export const contentType = "image/png";

const ORDRE = ["S", "A", "B", "C", "D"];

export default async function Image() {
  // La tier list en cours, celle que la page ouvre par défaut.
  const liste =
    (await prisma.tierList.findFirst({ where: { published: true, current: true }, include: { entries: { orderBy: { position: "asc" } } } })) ??
    (await prisma.tierList.findFirst({ where: { published: true }, orderBy: { updatedAt: "desc" }, include: { entries: { orderBy: { position: "asc" } } } }));
  if (!liste) return apercuTierList({ set: "Riftbound", pied: "Les Légendes classées sur les résultats de tournoi", paliers: [] });

  const paliers = ORDRE.map((lettre) => ({
    lettre,
    icones: liste.entries.filter((e) => String(e.tier) === lettre).map((e) => getLegendIconUrl(e.legendName)),
  })).filter((p) => p.icones.length > 0);
  return apercuTierList({
    set: liste.setContext ?? "Riftbound",
    pied: `${liste.entries.length} Légendes, sur les résultats de tournoi`,
    paliers,
  });
}
