import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { lireReferenceCollection } from "@/lib/bulking-card-search";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const set = req.nextUrl.searchParams.get("set")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json([]);
  const reference = lireReferenceCollection(q, set);
  const cards = await prisma.card.findMany({
    where: reference ? {
      ...(reference.set ? { set: { equals: reference.set, mode: "insensitive" as const } } : {}),
      collectorNumber: reference.collectorNumber,
    } : {
      ...(set ? { set: { equals: set, mode: "insensitive" as const } } : {}),
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { cleanName: { contains: q, mode: "insensitive" } },
        { riftboundId: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, riftboundId: true, name: true, set: true, setName: true, collectorNumber: true, rarity: true, imageUrl: true, alternateArt: true, overnumbered: true, signature: true },
    orderBy: reference ? [{ alternateArt: "asc" }, { overnumbered: "asc" }, { signature: "asc" }] : [{ name: "asc" }, { collectorNumber: "asc" }],
    take: 30,
  });
  return NextResponse.json(cards);
}
