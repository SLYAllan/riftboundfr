import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { commentId, value } = await req.json();
  if (!commentId || (value !== 1 && value !== -1)) {
    return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
  }

  const existing = await prisma.commentVote.findUnique({
    where: { userId_commentId: { userId: user.id, commentId } },
  });

  if (existing) {
    if (existing.value === value) {
      await prisma.commentVote.delete({
        where: { id: existing.id },
      });
      await prisma.comment.update({
        where: { id: commentId },
        data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
      });
      return NextResponse.json({ vote: null });
    }

    await prisma.commentVote.update({
      where: { id: existing.id },
      data: { value },
    });
    await prisma.comment.update({
      where: { id: commentId },
      data:
        value === 1
          ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
          : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
    });
    return NextResponse.json({ vote: value });
  }

  await prisma.commentVote.create({
    data: { userId: user.id, commentId, value },
  });
  await prisma.comment.update({
    where: { id: commentId },
    data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
  });
  return NextResponse.json({ vote: value });
}
