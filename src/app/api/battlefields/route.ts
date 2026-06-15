import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.card.findMany({
    where: { type: "Battlefield" },
    select: { name: true },
    orderBy: { name: "asc" },
  });
  const names = [...new Set(rows.map((r) => r.name))];
  return NextResponse.json(names);
}
