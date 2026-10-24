import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.card.findMany({
    // Seul l'overlay lit cette liste : la surnumérotée y faisait un doublon
    // (« Packed Amphitheater (Overnumbered) »). La carte reste en base et partout ailleurs.
    where: { type: "Battlefield", overnumbered: false },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const names = [...new Set(rows.map((r) => r.name))];
  return NextResponse.json(names);
}
