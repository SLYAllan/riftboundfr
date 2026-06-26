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
    select: { id: true, userId: true, deckCode: true, version: true },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck introuvable" }, { status: 404 });
  }

  if (deck.userId !== user.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.description === "string") data.description = body.description.slice(0, 500) || null;
  if (typeof body.guide === "string") data.guide = body.guide.slice(0, 5000) || null;
  if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
  if (Array.isArray(body.tags)) {
    data.tags = body.tags.filter((t: string) => VALID_TAGS.includes(t)).slice(0, 5);
  }

  if (typeof body.deckCode === "string" && body.deckCode.trim() && body.deckCode !== deck.deckCode) {
    await prisma.communityDeckVersion.create({
      data: {
        communityDeckId: deck.id,
        version: deck.version,
        deckCode: deck.deckCode,
        changelog: typeof body.changelog === "string" ? body.changelog.slice(0, 500) || null : null,
      },
    });
    data.deckCode = body.deckCode.slice(0, 10000);
    data.version = deck.version + 1;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à mettre à jour" }, { status: 400 });
  }

  const updated = await prisma.communityDeck.update({
    where: { id: deck.id },
    data,
  });

  return NextResponse.json(updated);
}
