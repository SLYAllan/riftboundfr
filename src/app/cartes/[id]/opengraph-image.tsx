import { prisma } from "@/lib/prisma";
import { DOMAIN_LABELS_FR, RARITY_LABELS_FR, TYPE_LABELS_FR } from "@/lib/domains";
import { TAILLE_APERCU, apercuCarte } from "@/lib/apercu-image";

export const runtime = "nodejs";
export const alt = "Carte Riftbound sur Riftbound France";
export const size = TAILLE_APERCU;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const carte = await prisma.card.findUnique({
    where: { riftboundId: id },
    select: { name: true, type: true, supertype: true, domains: true, setName: true, rarity: true, energy: true, might: true, imageUrl: true },
  });
  if (!carte) return apercuCarte({ nom: "Carte introuvable", sous: "", pied: ["riftboundfrance.fr"], image: null });

  const type = carte.supertype === "Champion Unit" ? "Unité Champion" : (TYPE_LABELS_FR[carte.type] ?? carte.type);
  const domaines = (carte.domains ?? []).map((d) => DOMAIN_LABELS_FR[d] ?? d).join(" / ");
  const chiffres = [carte.energy != null ? `${carte.energy} énergie` : null, carte.might != null ? `${carte.might} puissance` : null].filter(Boolean).join(", ");
  return apercuCarte({
    nom: carte.name,
    sous: [type, domaines].filter(Boolean).join(" "),
    pied: [`${carte.setName}, ${(RARITY_LABELS_FR[carte.rarity] ?? carte.rarity).toLowerCase()}`, chiffres].filter(Boolean),
    image: carte.imageUrl,
  });
}
