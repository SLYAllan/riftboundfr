import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams;
  const legend = url.get("legend");
  const page = Math.max(1, Number(url.get("page")) || 1);
  const perPage = Math.min(100, Math.max(1, Number(url.get("per_page")) || 20));

  const where: Record<string, unknown> = { published: true };
  if (legend) where.legendName = { contains: legend, mode: "insensitive" };

  const [items, total] = await Promise.all([
    prisma.deck.findMany({
      where,
      select: {
        slug: true,
        title: true,
        legendName: true,
        legendId: true,
        authorName: true,
        tournamentContext: true,
        format: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.deck.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((d) => ({
      slug: d.slug,
      title: d.title,
      legendName: d.legendName,
      legendId: d.legendId,
      author: d.authorName,
      tournament: d.tournamentContext,
      format: d.format,
      description: d.description,
      createdAt: d.createdAt,
      url: `/decks/${d.slug}`,
    })),
    total,
    page,
    perPage,
    pages: Math.ceil(total / perPage),
  });
}
