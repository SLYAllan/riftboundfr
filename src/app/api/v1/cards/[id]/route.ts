import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const card = await prisma.card.findFirst({
    where: { riftboundId: id },
  });

  if (!card) {
    return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    id: card.riftboundId,
    name: card.name,
    cleanName: card.cleanName,
    type: card.type,
    supertype: card.supertype,
    rarity: card.rarity,
    set: card.set,
    setName: card.setName,
    energy: card.energy,
    power: card.power,
    might: card.might,
    domains: card.domains,
    imageUrl: card.imageUrl,
    text: card.textPlain,
    textRich: card.textRich,
    tags: card.tags,
    alternateArt: card.alternateArt,
    overnumbered: card.overnumbered,
    signature: card.signature,
  });
}
