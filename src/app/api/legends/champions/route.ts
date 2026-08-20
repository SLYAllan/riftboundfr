import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Champion Units d'une légende donnée (ex: "Azir, Emperor of the Sands" -> "Azir, Sovereign"…).
// Convention du repo : les champions sont des cartes supertype "Champion" dont le nom
// commence par le prénom de la légende suivi d'une virgule.
export async function GET(req: Request) {
  const legend = new URL(req.url).searchParams.get("legend") ?? "";
  const first = legend.split(",")[0].trim();
  if (!first) return NextResponse.json([]);
  const rows = await prisma.card.findMany({
    where: {
      supertype: "Champion",
      // Certaines Légendes des Origines (Annie, Lux, Garen, Master Yi…) portent aussi
      // supertype "Champion" en base. Une Légende n'est pas un Champion Unit : sans ce
      // filtre, « Annie, Dark Child » (la Légende) s'affichait comme champion possible.
      type: { not: "Legend" },
      // `mode: "insensitive"` : PostgreSQL compare la casse, et la base ne l'écrit pas
      // toujours pareil des deux côtés. « Rek'sai, Void Burrower » est une Légende à
      // s minuscule, ses champions « Rek'Sai, Breacher » à S majuscule : la liste des
      // champions élus restait vide pour elle seule. Sur les 49 Légendes, c'était la
      // seule touchée, mais rien n'empêche la prochaine.
      name: { startsWith: `${first},`, mode: "insensitive" },
      NOT: { name: { contains: "(" } }, // exclut (Alternate Art), (Signature)…
    },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const names = [...new Set(rows.map((r) => r.name))];
  return NextResponse.json(names);
}
