import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { sujetValide } from "@/lib/abonnements";

export const dynamic = "force-dynamic";

/** Ce que le membre suit. Sert à cocher les boutons au chargement d'une page. */
export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  const abonnements = await prisma.abonnement.findMany({
    where: { userId: user.id },
    select: { genre: true, cible: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ abonnements });
}

/**
 * S'abonner ou se désabonner. Un seul verbe pour les deux : le client envoie
 * l'état voulu (`suivre`), pas l'action. Deux clics rapides sur le même bouton
 * finissent donc au même endroit, au lieu de basculer deux fois.
 */
export async function POST(req: NextRequest) {
  if (!rateLimit(req, { bucket: "abonnements", limit: 30 })) return tooMany();

  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Connexion requise" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Corps de requête illisible" }, { status: 400 });
  }

  const genre = typeof body.genre === "string" ? body.genre : "";
  const cible = typeof body.cible === "string" ? body.cible.trim() : "";
  const suivre = body.suivre !== false;

  if (!sujetValide(genre, cible)) {
    return NextResponse.json({ error: "Sujet d’abonnement inconnu" }, { status: 400 });
  }

  if (suivre) {
    // `upsert` et pas `create` : recliquer sur « Suivre » depuis deux onglets
    // aurait levé sur la contrainte d'unicité, et affiché une erreur pour un
    // geste sans conséquence.
    await prisma.abonnement.upsert({
      where: { userId_genre_cible: { userId: user.id, genre, cible } },
      create: { userId: user.id, genre, cible },
      update: {},
    });
  } else {
    await prisma.abonnement.deleteMany({ where: { userId: user.id, genre, cible } });
  }

  return NextResponse.json({ suivi: suivre });
}
