import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const cards = await prisma.card.findMany({
    where: { alternateArt: false },
    select: {
      riftboundId: true,
      name: true,
      type: true,
      supertype: true,
      rarity: true,
      domains: true,
      energy: true,
      might: true,
      power: true,
      imageUrl: true,
      set: true,
      setName: true,
      textPlain: true,
      tags: true,
      signature: true,
    },
    orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
  });

  return NextResponse.json(cards, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
