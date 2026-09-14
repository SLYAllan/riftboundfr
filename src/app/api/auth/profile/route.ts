import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, getUserSessionCookieName } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await req.json();
  const username = typeof body.username === "string" ? body.username.trim().slice(0, 30) : undefined;
  const riotGameName = typeof body.riotGameName === "string" ? body.riotGameName.trim().slice(0, 30) || null : undefined;
  const riotTagLine = typeof body.riotTagLine === "string" ? body.riotTagLine.trim().slice(0, 5) || null : undefined;

  const data: Record<string, unknown> = {};
  if (username && username.length >= 2) data.username = username;
  if (riotGameName !== undefined) data.riotGameName = riotGameName;
  if (riotTagLine !== undefined) data.riotTagLine = riotTagLine;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à modifier" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({
    username: updated.username,
    riotGameName: updated.riotGameName,
    riotTagLine: updated.riotTagLine,
  });
}

/**
 * Suppression du compte, à la demande de son porteur.
 *
 * Trois tables portent un `userId` SANS relation vers `User` — `DeckLike`,
 * `CommunityDeckLike` et `CommentVote` — donc rien ne les efface en cascade :
 * un `user.delete` nu laissait des j'aime et des votes rattachés à un compte
 * disparu, qui continuaient de compter dans les totaux. Elles se vident ici, à
 * la main, dans la même transaction.
 *
 * Les decks publiés survivent : le schéma met leur `userId` à NULL (d'autres
 * les ont likés, commentés, mis en lien). Le pseudo, lui, est une trace visible
 * du compte : il repasse à « Anonyme ».
 *
 * Le reste part en cascade : commentaires, collection, classeurs, habillage de
 * stream et ses médias.
 */
export async function DELETE() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  await prisma.$transaction([
    prisma.$executeRaw`
      WITH retires AS (DELETE FROM "DeckLike" WHERE "userId" = ${user.id} RETURNING "deckId"),
      comptes AS (SELECT "deckId", COUNT(*)::int AS n FROM retires GROUP BY "deckId")
      UPDATE "Deck" SET likes = GREATEST(0, likes - comptes.n)
      FROM comptes WHERE "Deck".id = comptes."deckId"
    `,
    prisma.$executeRaw`
      WITH retires AS (DELETE FROM "CommunityDeckLike" WHERE "userId" = ${user.id} RETURNING "communityDeckId"),
      comptes AS (SELECT "communityDeckId", COUNT(*)::int AS n FROM retires GROUP BY "communityDeckId")
      UPDATE "CommunityDeck" SET likes = GREATEST(0, likes - comptes.n)
      FROM comptes WHERE "CommunityDeck".id = comptes."communityDeckId"
    `,
    prisma.$executeRaw`
      WITH retires AS (DELETE FROM "CommentVote" WHERE "userId" = ${user.id} RETURNING "commentId", value),
      comptes AS (
        SELECT "commentId", COUNT(*) FILTER (WHERE value = 1)::int AS positifs,
          COUNT(*) FILTER (WHERE value = -1)::int AS negatifs FROM retires GROUP BY "commentId"
      )
      UPDATE "Comment" SET upvotes = GREATEST(0, upvotes - comptes.positifs),
        downvotes = GREATEST(0, downvotes - comptes.negatifs)
      FROM comptes WHERE "Comment".id = comptes."commentId"
    `,
    // Les réponses partent en cascade, y compris celles écrites par d'autres comptes.
    prisma.$executeRaw`
      WITH RECURSIVE supprimes AS (
        SELECT id FROM "Comment" WHERE "userId" = ${user.id}
        UNION
        SELECT c.id FROM "Comment" c JOIN supprimes s ON c."parentId" = s.id
      )
      DELETE FROM "CommentVote" WHERE "commentId" IN (SELECT id FROM supprimes)
    `,
    prisma.communityDeck.updateMany({ where: { userId: user.id }, data: { authorName: "Anonyme" } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);

  // Le cookie part avec le compte : sans ça le navigateur garde une session
  // signée qui désigne un identifiant qui n'existe plus.
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(getUserSessionCookieName());
  return res;
}
