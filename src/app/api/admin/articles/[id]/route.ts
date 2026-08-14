import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();
  const article = await prisma.article.update({
    where: { id },
    data: {
      title: data.title,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      category: data.category,
      tags: data.tags,
      blocks: data.blocks,
      featured: data.featured,
      published: data.published,
      publishedAt: data.published ? new Date() : null,
      tournamentName: data.tournamentName,
      tournamentDate: data.tournamentDate ? new Date(data.tournamentDate) : null,
      tournamentLocation: data.tournamentLocation,
      tournamentPlayerCount: data.tournamentPlayerCount,
    },
  });
  return NextResponse.json(article);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  await prisma.article.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
