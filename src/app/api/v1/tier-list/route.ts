import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLegendIconUrl } from "@/lib/banners";

export async function GET() {
  const tierLists = await prisma.tierList.findMany({
    where: { published: true },
    include: {
      entries: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    items: tierLists.map((tl) => ({
      id: tl.id,
      title: tl.title,
      description: tl.description,
      format: tl.format,
      setContext: tl.setContext,
      current: tl.current,
      createdAt: tl.createdAt,
      updatedAt: tl.updatedAt,
      entries: tl.entries.map((e) => ({
        legendId: e.legendId,
        legendName: e.legendName,
        tier: e.tier,
        position: e.position,
        comment: e.comment,
        iconUrl: getLegendIconUrl(e.legendName),
      })),
    })),
  });
}
