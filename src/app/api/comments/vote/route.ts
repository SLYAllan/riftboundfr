import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(req, { bucket: "comments-vote", limit: 30 })) return tooMany();
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const { commentId, value } = await req.json();
  if (!commentId || (value !== 1 && value !== -1)) {
    return NextResponse.json({ error: "Valeur invalide" }, { status: 400 });
  }

  // Le vote et le compteur du commentaire bougent ensemble : une panne entre les
  // deux laissait un vote enregistré sans son point, ou l'inverse. La transaction
  // rend la lecture, l'écriture du vote et la mise à jour du compteur indivisibles.
  try {
    const vote = await prisma.$transaction(async (tx) => {
      // Tous les votes du même commentaire passent par la même ligne verrouillée.
      // Sans ça, deux requêtes du même utilisateur pouvaient toutes deux lire
      // « aucun vote », puis l'une échouait sur la contrainte unique.
      const commentaires = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Comment" WHERE id = ${commentId} FOR UPDATE
      `;
      if (commentaires.length === 0) throw new Error("Commentaire introuvable");

      const existing = await tx.commentVote.findUnique({
        where: { userId_commentId: { userId: user.id, commentId } },
      });

      if (existing) {
        if (existing.value === value) {
          await tx.commentVote.delete({ where: { id: existing.id } });
          await tx.comment.update({
            where: { id: commentId },
            data: value === 1 ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
          });
          return null;
        }

        await tx.commentVote.update({ where: { id: existing.id }, data: { value } });
        await tx.comment.update({
          where: { id: commentId },
          data:
            value === 1
              ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
              : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        });
        return value;
      }

      await tx.commentVote.create({ data: { userId: user.id, commentId, value } });
      await tx.comment.update({
        where: { id: commentId },
        data: value === 1 ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
      });
      return value;
    });

    return NextResponse.json({ vote });
  } catch {
    return NextResponse.json({ error: "Le vote n'a pas pu être enregistré" }, { status: 500 });
  }
}
