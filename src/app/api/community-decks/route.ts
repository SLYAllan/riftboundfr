import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";
import { verifierCodeDeck } from "@/lib/deck-publication";
import crypto from "crypto";

function generateShareCode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

const TITLE_MAX = 200;
const DECKCODE_MAX = 10000;
const DESC_MAX = 500;

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, { bucket: "community-decks-post", limit: 5 })) {
      return tooMany();
    }

    const user = await getUserFromSession();
    if (!user) {
      return NextResponse.json({ error: "Connexion requise pour publier un deck" }, { status: 401 });
    }

    const body = await req.json();
    const { title, deckCode, description, isPublic, tags } = body;

    if (!title || typeof title !== "string" || !deckCode || typeof deckCode !== "string") {
      return NextResponse.json({ error: "Titre et deck code requis" }, { status: 400 });
    }

    if (title.length > TITLE_MAX || deckCode.length > DECKCODE_MAX) {
      return NextResponse.json({ error: "Données trop longues" }, { status: 400 });
    }

    // Le navigateur envoyait aussi mainCount, runeCount, bfCount, legendId et
    // domains. Trois compteurs qu'il déclarait lui-même, ignorés s'ils
    // manquaient : un appel direct à l'API publiait n'importe quoi. Tout se
    // recalcule ici depuis le code de deck et la base.
    const verification = await verifierCodeDeck(deckCode);
    if (!verification.ok) {
      return NextResponse.json({ error: verification.erreur }, { status: 400 });
    }

    const safeTitle = title.slice(0, TITLE_MAX).trim();
    const safeDesc = typeof description === "string" ? description.slice(0, DESC_MAX).trim() || null : null;
    const safeLegendId = verification.deck.legendId;
    const safeLegendName = verification.deck.legendName;
    const safeDomains = verification.deck.domains;

    let shareCode = generateShareCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.communityDeck.findUnique({ where: { shareCode } });
      if (!existing) break;
      shareCode = generateShareCode();
      attempts++;
    }

    const VALID_TAGS = ["aggro", "contrôle", "combo", "midrange", "tempo", "budget", "compétitif"];
    const safeTags = Array.isArray(tags) ? tags.filter((t: string) => VALID_TAGS.includes(t)).slice(0, 5) : [];

    const deck = await prisma.communityDeck.create({
      data: {
        shareCode,
        title: safeTitle,
        legendId: safeLegendId,
        legendName: safeLegendName,
        domains: safeDomains,
        deckCode: deckCode.slice(0, DECKCODE_MAX),
        tags: safeTags,
        description: safeDesc,
        authorName: user.username,
        isPublic: isPublic !== false,
        userId: user?.id ?? null,
      },
    });

    return NextResponse.json({ shareCode: deck.shareCode, id: deck.id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Math.min(100, Number(searchParams.get("page")) || 1));
  const legend = searchParams.get("legend");
  const domain = searchParams.get("domain");
  const tag = searchParams.get("tag");
  const sort = searchParams.get("sort");
  const perPage = 20;

  const user = await getUserFromSession();
  const baseWhere: Record<string, unknown> = {};
  if (legend) baseWhere.legendName = { contains: legend.slice(0, 100), mode: "insensitive" as const };
  if (domain) baseWhere.domains = { has: domain };
  if (tag) baseWhere.tags = { has: tag };

  const mine = searchParams.get("mine") === "1";
  let where: Record<string, unknown>;
  if (mine && user) {
    where = { ...baseWhere, userId: user.id };
  } else {
    where = { ...baseWhere, isPublic: true };
  }

  const orderBy = sort === "popular" ? { likes: "desc" as const }
    : sort === "views" ? { views: "desc" as const }
    : { createdAt: "desc" as const };

  const [decks, total] = await Promise.all([
    prisma.communityDeck.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        shareCode: true,
        title: true,
        legendName: true,
        domains: true,
        authorName: true,
        description: true,
        tags: true,
        views: true,
        likes: true,
        version: true,
        createdAt: true,
      },
    }),
    prisma.communityDeck.count({ where }),
  ]);

  return NextResponse.json({ decks, total, page, pages: Math.ceil(total / perPage) });
}
