import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    include: {
      history: { orderBy: { version: "desc" }, take: 10 },
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  // PAS d'incrément de vues ici : ce GET sert aux fetches programmatiques (import par
  // lien, rafraîchissement du bouton like). Les vues réelles sont comptées par le rendu
  // de la page /d/[code] elle-même.

  return NextResponse.json(deck);
}

const VALID_TAGS = ["aggro", "contrôle", "combo", "midrange", "tempo", "budget", "compétitif"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise" }, { status: 401 });
  }

  const deck = await prisma.communityDeck.findUnique({
    where: { shareCode: code },
    select: { id: true, userId: true },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  if (deck.userId !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  // Champs indépendants de la version : ils se calculent une fois, avant le verrou.
  const data: Record<string, unknown> = {};
  if (typeof body.description === "string") data.description = body.description.slice(0, 500) || null;
  if (typeof body.guide === "string") data.guide = body.guide.slice(0, 5000) || null;
  if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
  if (Array.isArray(body.tags)) {
    data.tags = body.tags.filter((t: string) => VALID_TAGS.includes(t)).slice(0, 5);
  }

  const nouveauDeckCode = typeof body.deckCode === "string" ? body.deckCode : "";
  const changelog = typeof body.changelog === "string" ? body.changelog.slice(0, 500) || null : null;

  const updated = await prisma.$transaction(async (tx) => {
    // Verrou sur la ligne : deux PATCH en parallèle liraient le même numéro de
    // version et écriraient deux entrées d'historique pour le même numéro. Le
    // FOR UPDATE force le second à attendre et à relire la version incrémentée.
    const verrous = await tx.$queryRaw<{ id: string }[]>`
      SELECT id FROM "CommunityDeck" WHERE id = ${deck.id} FOR UPDATE
    `;
    if (verrous.length === 0) {
      throw new Error("Deck introuvable");
    }

    const courant = await tx.communityDeck.findUnique({
      where: { id: deck.id },
      select: { version: true, deckCode: true },
    });
    if (!courant) {
      throw new Error("Deck introuvable");
    }

    const dataFinal = { ...data };
    if (nouveauDeckCode.trim() && nouveauDeckCode !== courant.deckCode) {
      await tx.communityDeckVersion.create({
        data: {
          communityDeckId: deck.id,
          version: courant.version,
          deckCode: courant.deckCode,
          changelog,
        },
      });
      dataFinal.deckCode = nouveauDeckCode.slice(0, 10000);
      dataFinal.version = courant.version + 1;
    }

    if (Object.keys(dataFinal).length === 0) {
      return null;
    }

    return tx.communityDeck.update({ where: { id: deck.id }, data: dataFinal });
  });

  if (updated === null) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  return NextResponse.json(updated);
}
