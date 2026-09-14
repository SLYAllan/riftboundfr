import "server-only";
import { prisma } from "@/lib/prisma";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { DATES_BANS } from "@/lib/banned-cards";

/**
 * Ce qui est arrivé au contenu d'un membre depuis son dernier passage.
 *
 * Rien n'est stocké : tout se recalcule à la lecture, depuis les commentaires,
 * les j'aime et les votes qui existent déjà. Une table de notifications aurait
 * demandé d'écrire à chaque geste de chaque visiteur, et de la tenir en accord
 * avec les suppressions en cascade. Le seul champ ajouté est la date du dernier
 * passage, sur le compte.
 */
export type GenreNotification =
  | "reponse"
  | "commentaire"
  | "jaime"
  | "vote"
  | "legende"
  | "deck"
  | "tournois-fr"
  | "regles";

/** Les genres venus d'un abonnement choisi, par opposition à ce qui arrive sur
 *  le contenu du membre. Sert au filtre du panneau. */
export const GENRES_SUIVIS: GenreNotification[] = ["legende", "deck", "tournois-fr", "regles"];

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
  const commentairesVus = new Set<string>();

  for (const [genre, source] of [["reponse", reponses], ["commentaire", surMesDecks]] as const) {
    for (const c of source) {
      if (commentairesVus.has(c.id)) continue;
      commentairesVus.add(c.id);
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

  liste.push(...(await notificationsAbonnees(userId, depuis, vuesLe)));

  liste.sort((a, b) => b.date.localeCompare(a.date));
  const gardees = liste.slice(0, TOTAL);
  // Chaque source est bornée : la cloche annonce une présence, jamais un faux total.
  return { liste: gardees, nonLues: liste.some((n) => n.nouvelle) ? 1 : 0 };
}

/**
 * Ce que les abonnements du membre font remonter.
 *
 * Rien n'est stocké non plus ici : on lit les abonnements, puis on demande à la
 * base ce qui est arrivé depuis, sur ces sujets-là. Un membre sans abonnement ne
 * coûte qu'une requête qui ne rend rien.
 */
async function notificationsAbonnees(
  userId: string,
  depuis: Date,
  vuesLe: Date,
): Promise<Notification[]> {
  const abonnements = await prisma.abonnement.findMany({
    where: { userId },
    select: { genre: true, cible: true },
  });
  if (abonnements.length === 0) return [];

  const legendes = abonnements.filter((a) => a.genre === "legende").map((a) => a.cible);
  const decks = abonnements.filter((a) => a.genre === "deck").map((a) => a.cible);
  const suitTournoisFr = abonnements.some((a) => a.genre === "tournois-fr");
  const suitRegles = abonnements.some((a) => a.genre === "regles");

  const [listesLegende, versions, tournois] = await Promise.all([
    // Une liste de tournoi neuve pour une Légende suivie, et seulement les
    // BEST-OF. Un import de tournoi entre par milliers de listes : sans ce
    // filtre, suivre une Légende remontait dix listes classées 1262e et 1280e,
    // ce qui n'est pas une nouvelle. C'est la même règle que /decks, qui ne met
    // en avant que le meilleur deck de chaque Légende par tournoi.
    //
    // `mode: "insensitive"` parce que la base n'écrit pas toujours un nom pareil
    // des deux côtés (« Rek'sai » la Légende, « Rek'Sai » ses champions).
    legendes.length === 0 ? [] : prisma.deck.findMany({
      where: {
        published: true,
        featured: true,
        createdAt: { gte: depuis },
        OR: legendes.map((nom) => ({ legendName: { equals: nom, mode: "insensitive" as const } })),
      },
      select: { id: true, slug: true, title: true, legendName: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: PAR_SOURCE,
    }),
    // Une nouvelle version d'un deck suivi. L'entrée d'historique est écrite au
    // moment de la mise à jour : sa date EST celle du changement.
    decks.length === 0 ? [] : prisma.communityDeckVersion.findMany({
      where: { deck: { shareCode: { in: decks } }, createdAt: { gte: depuis } },
      select: {
        id: true, version: true, changelog: true, createdAt: true,
        deck: { select: { shareCode: true, title: true, userId: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PAR_SOURCE,
    }),
    // Les tournois français : le pays vient de `tournament-flags.ts`, pas de la
    // base, qui ne stocke que le libellé du contexte.
    !suitTournoisFr ? ([] as Array<{ tournamentContext: string | null; _max: { createdAt: Date | null } }>) : prisma.deck.groupBy({
      by: ["tournamentContext"],
      where: { published: true, createdAt: { gte: depuis }, tournamentContext: { not: null } },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      take: 50,
    }),
  ]);

  const notifications: Notification[] = [];

  for (const d of listesLegende) {
    notifications.push({
      id: `legende-${d.id}`,
      genre: "legende",
      auteur: null,
      sujet: d.legendName,
      extrait: d.title,
      lien: `/decks/${d.slug}`,
      date: d.createdAt.toISOString(),
      nouvelle: d.createdAt > vuesLe,
    });
  }

  for (const v of versions) {
    // Pas d'alerte à l'auteur pour sa propre mise à jour : il vient de la faire.
    if (v.deck.userId === userId) continue;
    notifications.push({
      id: `deck-${v.id}`,
      genre: "deck",
      auteur: null,
      sujet: v.deck.title,
      extrait: v.changelog ?? `Version ${v.version + 1}`,
      lien: `/d/${v.deck.shareCode}`,
      date: v.createdAt.toISOString(),
      nouvelle: v.createdAt > vuesLe,
    });
  }

  for (const t of tournois) {
    const contexte = t.tournamentContext!;
    if (getTournamentCountryCode(contexte) !== "FR") continue;
    const date = t._max.createdAt;
    if (!date) continue;
    notifications.push({
      id: `tournois-fr-${contexte}`,
      genre: "tournois-fr",
      auteur: null,
      sujet: contexte,
      extrait: null,
      lien: `/decks?tournament=${encodeURIComponent(contexte)}&set=all`,
      date: date.toISOString(),
      nouvelle: date > vuesLe,
    });
  }

  if (suitRegles) {
    // Les dates de bans sont codées en dur (`banned-cards.ts`) : c'est une
    // décision de l'éditeur, elle ne vit pas en base. On ne remonte que celles
    // qui tombent dans la fenêtre, comme le reste de la cloche.
    for (const ban of DATES_BANS) {
      const date = new Date(ban.date);
      if (date < depuis) continue;
      notifications.push({
        id: `regles-${ban.date}`,
        genre: "regles",
        auteur: null,
        sujet: ban.libelle,
        extrait: null,
        lien: "/guides/ban-list",
        date: date.toISOString(),
        nouvelle: date > vuesLe,
      });
    }
  }

  return notifications;
}
