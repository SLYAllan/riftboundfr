import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { validerTierList } from "@/lib/admin-validation";
import { normalizeCardName } from "@/lib/card-printing";

const SET_CODES: Record<string, string[]> = {
  Origins: ["OGN", "OGS"],
  Spiritforged: ["SFD"],
  Unleashed: ["UNL"],
  Vendetta: ["VEN"],
};

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const tierLists = await prisma.tierList.findMany({
    include: { entries: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(tierLists);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerTierList(data);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const tierList = await prisma.tierList.create({
    data: {
      title: data.title ?? "Nouvelle Tier List",
      description: data.description ?? null,
      format: data.format ?? "constructed",
      setContext: data.setContext ?? null,
      published: false,
      current: false,
    },
    include: { entries: true },
  });
  return NextResponse.json(tierList);
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerTierList(data, "mise à jour");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { id, entries, ...fields } = data;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const setCtx = fields.setContext;
  let legendsById = new Map<string, { riftboundId: string; name: string; set: string }>();
  if (entries?.length) {
    const legendIds = entries.map((e: { legendId: string }) => e.legendId);
    const legends = await prisma.card.findMany({
      where: { type: "Legend", alternateArt: false, overnumbered: false, signature: false, set: { not: "OPP" }, riftboundId: { in: legendIds } },
      select: { riftboundId: true, name: true, set: true },
    });
    legendsById = new Map(legends.map((legend) => [legend.riftboundId, legend]));
    const missing = legendIds.filter((legendId: string) => !legendsById.has(legendId));
    if (missing.length > 0) return NextResponse.json({ error: "Légendes introuvables", legendIds: missing }, { status: 400 });
    const mauvaisNoms = entries.filter((e: { legendId: string; legendName: string }) => normalizeCardName(legendsById.get(e.legendId)!.name) !== normalizeCardName(e.legendName));
    if (mauvaisNoms.length > 0) return NextResponse.json({ error: "Nom de légende non canonique", legendNames: mauvaisNoms.map((e: { legendName: string }) => e.legendName) }, { status: 400 });
    const setCodes = setCtx ? SET_CODES[setCtx] : undefined;
    if (setCodes) {
      const invalid = entries.filter((e: { legendId: string; legendName: string }) => !setCodes.includes(legendsById.get(e.legendId)!.set));
      if (invalid.length > 0) return NextResponse.json({ error: `Légendes hors-set ${setCtx} : ${invalid.map((e: { legendName: string }) => e.legendName).join(", ")}` }, { status: 400 });
    }
    const deckIds: string[] = entries.map((e: { deckId?: string | null }) => e.deckId).filter((deckId: string | null | undefined): deckId is string => Boolean(deckId));
    if (deckIds.length > 0) {
      const decks = await prisma.deck.findMany({ where: { id: { in: deckIds } }, select: { id: true } });
      const deckIdsExistants = new Set(decks.map((deck) => deck.id));
      const decksManquants = deckIds.filter((deckId) => !deckIdsExistants.has(deckId));
      if (decksManquants.length > 0) return NextResponse.json({ error: "Decks introuvables", deckIds: decksManquants }, { status: 400 });
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.tierList.update({
      where: { id },
      data: {
        ...(fields.title !== undefined && { title: fields.title }),
        ...(fields.description !== undefined && { description: fields.description }),
        ...(fields.format !== undefined && { format: fields.format }),
        ...(fields.setContext !== undefined && { setContext: fields.setContext }),
        ...(fields.published !== undefined && { published: fields.published }),
        ...(fields.current !== undefined && { current: fields.current }),
      },
    });
    if (entries && Array.isArray(entries)) {
      await tx.tierListEntry.deleteMany({ where: { tierListId: id } });
      if (entries.length > 0) {
        await tx.tierListEntry.createMany({
          data: entries.map((e: { legendId: string; legendName: string; tier: string; position?: number; comment?: string | null; deckId?: string | null }, i: number) => ({
            tierListId: id, legendId: e.legendId, legendName: legendsById.get(e.legendId)!.name, tier: e.tier,
            position: e.position ?? i, comment: e.comment ?? null, deckId: e.deckId ?? null,
          })),
        });
      }
    }
  });

  const updated = await prisma.tierList.findUnique({
    where: { id },
    include: { entries: { orderBy: { position: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerTierList(data, "mise à jour");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { id } = data;

  await prisma.tierList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
