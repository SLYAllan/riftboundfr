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
  if ((!articleId && !communityDeckId) || !body?.trim()) {
    return NextResponse.json({ error: "Champs requis" }, { status: 400 });
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
