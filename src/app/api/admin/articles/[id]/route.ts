import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { validerArticle } from "@/lib/admin-validation";

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
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerArticle(data, "mise à jour");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const present = (cle: string) => Object.prototype.hasOwnProperty.call(data, cle);
  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(present("title") && { title: data.title }),
      ...(present("excerpt") && { excerpt: data.excerpt }),
      ...(present("coverImage") && { coverImage: data.coverImage }),
      ...(present("category") && { category: data.category }),
      ...(present("tags") && { tags: data.tags }),
      ...(present("blocks") && { blocks: data.blocks }),
      ...(present("featured") && { featured: data.featured }),
      ...(present("published") && { published: data.published }),
      ...(present("published") && { publishedAt: data.published ? new Date() : null }),
      ...(present("tournamentName") && { tournamentName: data.tournamentName }),
      ...(present("tournamentDate") && { tournamentDate: data.tournamentDate ? new Date(data.tournamentDate) : null }),
      ...(present("tournamentLocation") && { tournamentLocation: data.tournamentLocation }),
      ...(present("tournamentPlayerCount") && { tournamentPlayerCount: data.tournamentPlayerCount }),
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
