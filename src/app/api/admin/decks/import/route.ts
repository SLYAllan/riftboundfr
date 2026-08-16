import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { parseDeckCode } from "@/lib/deck-code";
import { validerImportDeck } from "@/lib/admin-validation";
import { buildCardLookup, findCard } from "@/lib/card-printing";

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerImportDeck(body);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { deckCode, title, playerName, placement, tournamentName, tournamentTier, date, record, description } = body;

  if (!deckCode || !title) {
    return NextResponse.json({ error: "Deck code et titre requis" }, { status: 400 });
  }

  const parsed = parseDeckCode(deckCode);
  if (parsed.errors.length > 0) {
    return NextResponse.json({ error: "Code de deck invalide", errors: parsed.errors }, { status: 400 });
  }
  if (parsed.entries.length === 0) {
    return NextResponse.json({ error: "Aucune carte trouvee dans le deck code", errors: parsed.errors }, { status: 400 });
  }

  const allCards = await prisma.card.findMany({
    where: { alternateArt: false },
    select: { id: true, riftboundId: true, name: true, type: true, supertype: true },
  });

  const cardByName = buildCardLookup(allCards);

  const matched: { cardId: string; quantity: number; section: string }[] = [];
  const notFound: string[] = [];
  let legendId: string | null = null;
  let legendName: string | null = null;

  for (const entry of parsed.entries) {
    const card = findCard(cardByName, entry.name);
    if (!card) {
      notFound.push(entry.name);
      continue;
    }

    let section = entry.section;
    if (card.type === "Legend" || card.supertype === "Champion") {
      section = "legend";
      if (card.type === "Legend") {
        legendId = card.id;
        legendName = card.name;
      }
    }
    if (section === "legend" && card.supertype === "Champion") {
      section = "legend" as typeof section;
    }

    matched.push({ cardId: card.id, quantity: entry.quantity, section });
  }

  if (!legendId) {
    const firstLegend = matched.find((m) => m.section === "legend");
    if (firstLegend) {
      const card = allCards.find((c) => c.id === firstLegend.cardId);
      if (card) {
        legendId = card.id;
        legendName = card.name;
      }
    }
  }

  if (notFound.length > 0) {
    return NextResponse.json({ error: "Cartes introuvables dans la base", notFound }, { status: 400 });
  }

  let slug = slugify(title);
  const existing = await prisma.deck.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const deck = await prisma.deck.create({
    data: {
      title,
      slug,
      legendId: legendId ?? "",
      legendName: legendName ?? "Inconnu",
      description: description || null,
      playerName: playerName || null,
      placement: placement || null,
      tournamentContext: tournamentName || null,
      tournamentTier: tournamentTier || null,
      record: record || null,
      published: true,
      createdAt: date ? new Date(date) : new Date(),
    },
  });

  if (matched.length > 0) {
    await prisma.deckCard.createMany({
      data: matched.map((card) => ({
        deckId: deck.id,
        cardId: card.cardId,
        quantity: card.quantity,
        section: card.section,
      })),
    });
  }

  return NextResponse.json({
    id: deck.id,
    slug: deck.slug,
    matched: matched.length,
    notFound,
    errors: parsed.errors,
  }, { status: 201 });
}
