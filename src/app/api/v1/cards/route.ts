import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const search = url.get("search");
  const type = url.get("type");
  const domain = url.get("domain");
  const set = url.get("set");
  const rarity = url.get("rarity");
  const supertype = url.get("supertype");
  const page = Math.max(1, Number(url.get("page")) || 1);
  const perPage = Math.min(100, Math.max(1, Number(url.get("per_page")) || 50));

  const where: Record<string, unknown> = { alternateArt: false };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { cleanName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (type) where.type = type;
  if (rarity) where.rarity = rarity;
  if (set) where.set = set;
  if (supertype) where.supertype = supertype;
  if (domain) where.domains = { has: domain };

  const [items, total] = await Promise.all([
    prisma.card.findMany({
      where,
      select: {
        riftboundId: true,
        name: true,
        cleanName: true,
        type: true,
        supertype: true,
        rarity: true,
        set: true,
        setName: true,
        energy: true,
        power: true,
        might: true,
        domains: true,
        imageUrl: true,
        textPlain: true,
      },
      orderBy: [{ set: "asc" }, { name: "asc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.card.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((c) => ({
      id: c.riftboundId,
      name: c.name,
      cleanName: c.cleanName,
      type: c.type,
      supertype: c.supertype,
      rarity: c.rarity,
      set: c.set,
      setName: c.setName,
      energy: c.energy,
      power: c.power,
      might: c.might,
      domains: c.domains,
      imageUrl: c.imageUrl,
      text: c.textPlain,
    })),
    total,
    page,
    perPage,
    pages: Math.ceil(total / perPage),
  });
}
