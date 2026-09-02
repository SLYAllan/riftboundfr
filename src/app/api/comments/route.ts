import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("articleId");
  const communityDeckId = req.nextUrl.searchParams.get("communityDeckId");
  if (!articleId && !communityDeckId) return NextResponse.json([]);

  const where: Record<string, unknown> = { parentId: null };
  if (articleId) where.articleId = articleId;
  if (communityDeckId) where.communityDeckId = communityDeckId;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
      replies: {
        include: {
          user: { select: { id: true, username: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req, { bucket: "comments-post", limit: 10 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { articleId, communityDeckId, body, parentId } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
  }
  // EXACTEMENT une cible. Avec « au moins une », un commentaire pouvait porter
  // les deux, apparaître sur un article ET sur un deck, et n'être modérable
  // depuis aucun des deux.
  if (Boolean(articleId) === Boolean(communityDeckId)) {
    return NextResponse.json({ error: "Un commentaire porte sur un article ou sur un deck, pas les deux" }, { status: 400 });
  }

  // La cible doit exister : sinon on écrivait des lignes rattachées à rien.
  const cibleExiste = articleId
    ? await prisma.article.findUnique({ where: { id: articleId }, select: { id: true } })
    : await prisma.communityDeck.findUnique({ where: { id: communityDeckId }, select: { id: true } });
  if (!cibleExiste) {
    return NextResponse.json({ error: "Contenu introuvable" }, { status: 404 });
  }

  // Une réponse reste sous SON commentaire. Rien ne vérifiait que le parent
  // portait la même cible : une réponse pouvait se coller sous un fil d'un autre
  // article, où elle s'affichait sans contexte.
  if (parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { articleId: true, communityDeckId: true, parentId: true },
    });
    const memeCible = parent
      && parent.articleId === (articleId || null)
      && parent.communityDeckId === (communityDeckId || null);
    if (!memeCible) {
      return NextResponse.json({ error: "Commentaire parent introuvable" }, { status: 400 });
    }
    // Un seul niveau de réponses, comme l'affichage : le fil ne rend que
    // `replies` des commentaires racine, une réponse de réponse disparaissait.
    if (parent.parentId) {
      return NextResponse.json({ error: "On ne répond pas à une réponse" }, { status: 400 });
    }
  }

  const trimmedBody = body.trim().slice(0, 2000);

  const comment = await prisma.comment.create({
    data: {
      body: trimmedBody,
      userId: user.id,
      articleId: articleId || null,
      communityDeckId: communityDeckId || null,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(comment);
}
