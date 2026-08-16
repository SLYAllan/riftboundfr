import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { validerArticle } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerArticle(data);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug: slugify(data.title),
      excerpt: data.excerpt ?? null,
      coverImage: data.coverImage ?? null,
      category: data.category ?? "actualite",
      tags: data.tags ?? [],
      blocks: data.blocks ?? [],
      featured: data.featured ?? false,
      published: data.published ?? false,
      publishedAt: data.published ? new Date() : null,
      tournamentName: data.tournamentName ?? null,
      tournamentDate: data.tournamentDate ? new Date(data.tournamentDate) : null,
      tournamentLocation: data.tournamentLocation ?? null,
      tournamentPlayerCount: data.tournamentPlayerCount ?? null,
    },
  });
  return NextResponse.json(article, { status: 201 });
}
