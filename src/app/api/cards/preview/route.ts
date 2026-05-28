import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json(null, { status: 400 });

  const card = await prisma.card.findFirst({
    where: {
      alternateArt: false,
      OR: [
        { name: { equals: name, mode: "insensitive" } },
        { cleanName: { equals: name, mode: "insensitive" } },
      ],
    },
    select: { name: true, imageUrl: true, type: true, energy: true, might: true, rarity: true, domains: true },
  });

  if (!card) return NextResponse.json(null, { status: 404 });

  return NextResponse.json(card, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
  });
}
