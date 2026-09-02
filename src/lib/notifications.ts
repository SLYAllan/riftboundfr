import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Ce qui est arrivé au contenu d'un membre depuis son dernier passage.
 *
 * Rien n'est stocké : tout se recalcule à la lecture, depuis les commentaires,
 * les j'aime et les votes qui existent déjà. Une table de notifications aurait
 * demandé d'écrire à chaque geste de chaque visiteur, et de la tenir en accord
 * avec les suppressions en cascade. Le seul champ ajouté est la date du dernier
 * passage, sur le compte.
 */
export type GenreNotification = "reponse" | "commentaire" | "jaime" | "vote";

export interface Notification {
  id: string;
  genre: GenreNotification;
  /** Qui a agi. Vide pour un j'aime : la table ne porte pas de lien vers le compte. */
  auteur: string | null;
  /** Le contenu concerné : titre d'article ou de deck. */
  sujet: string;
  /** Début du message, pour reconnaître le fil sans l'ouvrir. */
  extrait: string | null;
  lien: string;
  date: string;
  nouvelle: boolean;
}

const PAR_SOURCE = 10;
const TOTAL = 20;
/** Au-delà, on ne remonte plus : la cloche montre l'actualité, pas l'historique. */
const FENETRE_JOURS = 60;

function extraitDe(corps: string): string {
  const propre = corps.replace(/\s+/g, " ").trim();
  return propre.length > 90 ? `${propre.slice(0, 88)}…` : propre;
}

function lienVers(
  article: { slug: string } | null,
  deck: { shareCode: string } | null,
): string | null {
  if (article) return `/articles/${article.slug}#commentaires`;
  if (deck) return `/d/${deck.shareCode}`;
  return null;
}

export async function notificationsDe(
  userId: string,
  vuesLe: Date,
): Promise<{ liste: Notification[]; nonLues: number }> {
  const depuis = new Date(Date.now() - FENETRE_JOURS * 86_400_000);

  const inclureCible = {
    user: { select: { username: true } },
    article: { select: { slug: true, title: true } },
    communityDeck: { select: { shareCode: true, title: true } },
  } as const;

  const [reponses, surMesDecks, jaimes, mesCommentaires] = await Promise.all([
    // Une réponse à l'un de mes commentaires.
    prisma.comment.findMany({
      where: { parent: { userId }, userId: { not: userId }, createdAt: { gte: depuis } },
      include: inclureCible,
      orderBy: { createdAt: "desc" },
      take: PAR_SOURCE,
    }),
    // Un commentaire sur l'un de mes decks publiés.
    prisma.comment.findMany({
      where: { communityDeck: { userId }, userId: { not: userId }, createdAt: { gte: depuis } },
      include: inclureCible,
      orderBy: { createdAt: "desc" },
      take: PAR_SOURCE,
    }),
    prisma.communityDeckLike.findMany({
      where: { communityDeck: { userId }, userId: { not: userId }, createdAt: { gte: depuis } },
      include: { communityDeck: { select: { shareCode: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: PAR_SOURCE,
    }),
    // `CommentVote` n'a pas de lien Prisma vers `Comment` : on passe par mes
    // identifiants de commentaires. Poser la relation demanderait une clé
    // étrangère, que les votes orphelins des commentaires déjà supprimés
    // feraient échouer.
    prisma.comment.findMany({
      where: { userId },
      select: { id: true, body: true, articleId: true, communityDeckId: true,
                article: { select: { slug: true, title: true } },
                communityDeck: { select: { shareCode: true, title: true } } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  const parId = new Map(mesCommentaires.map((c) => [c.id, c]));
  const votes = mesCommentaires.length === 0 ? [] : await prisma.commentVote.findMany({
    where: { value: 1, userId: { not: userId }, commentId: { in: [...parId.keys()] }, createdAt: { gte: depuis } },
    orderBy: { createdAt: "desc" },
    take: PAR_SOURCE,
  });

  const liste: Notification[] = [];

  for (const [genre, source] of [["reponse", reponses], ["commentaire", surMesDecks]] as const) {
    for (const c of source) {
      const lien = lienVers(c.article, c.communityDeck);
      if (!lien) continue;
      liste.push({
        id: `${genre}-${c.id}`,
        genre,
        auteur: c.user.username,
        sujet: c.article?.title ?? c.communityDeck?.title ?? "",
        extrait: extraitDe(c.body),
        lien,
        date: c.createdAt.toISOString(),
        nouvelle: c.createdAt > vuesLe,
      });
    }
  }

  for (const j of jaimes) {
    liste.push({
      id: `jaime-${j.id}`,
      genre: "jaime",
      auteur: null,
      sujet: j.communityDeck.title,
      extrait: null,
      lien: `/d/${j.communityDeck.shareCode}`,
      date: j.createdAt.toISOString(),
      nouvelle: j.createdAt > vuesLe,
    });
  }

  for (const v of votes) {
    const commentaire = parId.get(v.commentId);
    if (!commentaire) continue;
    const lien = lienVers(commentaire.article, commentaire.communityDeck);
    if (!lien) continue;
    liste.push({
      id: `vote-${v.id}`,
      genre: "vote",
      auteur: null,
      sujet: commentaire.article?.title ?? commentaire.communityDeck?.title ?? "",
      extrait: extraitDe(commentaire.body),
      lien,
      date: v.createdAt.toISOString(),
      nouvelle: v.createdAt > vuesLe,
    });
  }

  liste.sort((a, b) => b.date.localeCompare(a.date));
  const gardees = liste.slice(0, TOTAL);
  // Le compte porte sur TOUT ce qui est nouveau, pas sur les vingt affichées :
  // sinon la pastille disait « 20 » et le panneau en montrait vingt aussi, sans
  // qu'on sache qu'il en restait.
  return { liste: gardees, nonLues: liste.filter((n) => n.nouvelle).length };
}
