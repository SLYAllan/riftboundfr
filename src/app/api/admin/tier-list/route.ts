import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

const SET_CODES: Record<string, string[]> = {
  Origins: ["OGN", "OGS"],
  Spiritforged: ["SFD"],
  Unleashed: ["UNL"],
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

  const data = await req.json();
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

  const data = await req.json();
  const { id, entries, ...fields } = data;
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  const setCtx = fields.setContext;
  if (setCtx && setCtx !== "Global" && entries?.length) {
    const setCodes = SET_CODES[setCtx];
    if (setCodes) {
      const validLegends = await prisma.card.findMany({
        where: { type: "Legend", set: { in: setCodes }, alternateArt: false },
        select: { riftboundId: true },
      });
      const validIds = new Set(validLegends.map((l) => l.riftboundId));
      const invalid = entries.filter((e: { legendId: string; legendName: string }) => !validIds.has(e.legendId));
      if (invalid.length > 0) {
        return NextResponse.json({
          error: `Légendes hors-set ${setCtx} : ${invalid.map((e: { legendName: string }) => e.legendName).join(", ")}`,
        }, { status: 400 });
      }
    }
  }

  await prisma.tierList.update({
    where: { id },
    data: {
      ...(fields.title !== undefined && { title: fields.title }),
      ...(fields.description !== undefined && { description: fields.description }),
      ...(fields.setContext !== undefined && { setContext: fields.setContext }),
      ...(fields.published !== undefined && { published: fields.published }),
      ...(fields.current !== undefined && { current: fields.current }),
    },
  });

  if (entries && Array.isArray(entries)) {
    await prisma.tierListEntry.deleteMany({ where: { tierListId: id } });
    if (entries.length > 0) {
      await prisma.tierListEntry.createMany({
        data: entries.map((e: { legendId: string; legendName: string; tier: string; position?: number; comment?: string | null; deckId?: string | null }, i: number) => ({
          tierListId: id,
          legendId: e.legendId,
          legendName: e.legendName,
          tier: e.tier,
          position: e.position ?? i,
          comment: e.comment ?? null,
          deckId: e.deckId ?? null,
        })),
      });
    }
  }

  const updated = await prisma.tierList.findUnique({
    where: { id },
    include: { entries: { orderBy: { position: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID manquant" }, { status: 400 });

  await prisma.tierList.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
