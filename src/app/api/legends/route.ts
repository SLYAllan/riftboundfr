import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VARIANT_SUFFIXES = /\s*\((Metal|Overnumbered|Signature|Alternate Art|Starter)\)$/;

export async function GET() {
  const all = await prisma.card.findMany({
    where: { type: "Legend" },
    select: { id: true, name: true, imageUrl: true, domains: true },
    orderBy: { name: "asc" },
  });

  function variantPriority(name: string): number {
    if (!VARIANT_SUFFIXES.test(name)) return 0;
    if (name.includes("(Starter)")) return 1;
    return 2;
  }

  const baseFirst = [...all].sort((a, b) => {
    const pa = variantPriority(a.name);
    const pb = variantPriority(b.name);
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  const seen = new Set<string>();
  const legends = baseFirst.filter((card) => {
    const baseName = card.name.replace(VARIANT_SUFFIXES, "");
    if (seen.has(baseName)) return false;
    seen.add(baseName);
    return true;
  });

  legends.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(legends);
}
