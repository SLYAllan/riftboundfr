import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG = "le-rift-tour-circuit-competitif-france";

const blocks = [
  {
    type: "text",
    id: "intro",
    content: `Riftbound a désormais son circuit compétitif français. Il s'appelle **Le Rift Tour**, et c'est la première fois qu'un programme officiel relie les boutiques de tout le pays jusqu'à une grande finale nationale.

Le principe tient en une phrase : jouer dans sa boutique de quartier de juillet à août, gravir les échelons jusqu'à la finale de sa région en septembre, puis viser le titre à la Paris Games Week en octobre. Et pour les deux meilleurs joueurs au bout du parcours, une place est en jeu pour le **Europe Regional Championship 2026**.`,
  },
  {
    type: "tweet",
    id: "tweet-marco",
    url: "https://x.com/RiotMarco_/status/2060300092515487855",
    author: "Riot Marco",
    handle: "RiotMarco_",
    date: "29 mai 2026",
    avatar: "/img/tweets/riotmarco.webp",
    media: "/img/tweets/rift-tour-annonce.webp",
    mediaAlt: "Visuel d'annonce du Rift Tour partagé par Riot Marco",
    content: `Le Rift Tour débarque en France 🇫🇷

Riftbound rejoint LE TOUR pour l'édition 2026 🔥
Nouveau projet, nouveau format :)

Tous les informations ci-dessous 👇`,
  },
  {
    type: "text",
    id: "contexte",
    content: `L'organisation est confiée à l'[Open Tour France](https://www.opentourfrance.fr/fr/le-rift-tour), la structure qui gère déjà plusieurs circuits compétitifs nationaux. C'est une garantie de sérieux dès la première saison : calendrier clair, boutiques sélectionnées, et un format pensé pour accueillir aussi bien les habitués des tournois que les joueurs qui débutent en compétition.

Le format retenu est le **Construit** (Standard), et il n'est pas limité aux cartes en français. Vous pouvez jouer vos cartes habituelles, quelle que soit leur langue.`,
  },
  {
    type: "separator",
    id: "sep-1",
  },
  {
    type: "text",
    id: "phases",
    content: `## Trois phases, un seul objectif

Le Rift Tour se gravit comme un escalier. Chaque phase filtre les joueurs et resserre le plateau, jusqu'aux huit finalistes de la Paris Games Week.

### Phase 1 — Qualifications locales (juillet à août 2026)

Tout commence en boutique. Vous participez aux tournois organisés dans les boutiques partenaires de votre division et vous tentez de finir dans le **Top 2** pour avancer. Chaque boutique qualifie au total **8 joueurs** pour la finale de sa division, soit **128 qualifiés** à l'échelle nationale.

La régularité paie autant que la performance : plus vous jouez les événements de votre boutique, plus vous multipliez vos chances de décrocher une place. Côté cartes, trois extensions sont autorisées dès le départ (Origins, Spiritforged, Unleashed), et **Vendetta** rejoint la liste à partir de la mi-août. Les détails sont sur la page des [qualifications locales](https://www.opentourfrance.fr/fr/news/qualifications-locales).

### Phase 2 — Finales de division (septembre 2026)

En septembre, les qualifiés de chaque boutique se retrouvent pour une finale unique dans leur division. On joue **5 rounds**, suivis d'un cut **Top 8**. Les **2 meilleurs** de chaque finale de division valident leur billet pour la Grande Finale nationale.

Et ce billet ne se résume pas à une place : les finalistes de division reçoivent aussi une **prise en charge transport et hôtel** pour la Paris Games Week. De quoi laisser le niveau de jeu décider, pas le budget. Toutes les extensions, Vendetta comprise, sont jouables. Plus d'infos sur la page des [finales de division](https://www.opentourfrance.fr/fr/news/finales-de-division).

### Phase 3 — Grande Finale à la Paris Games Week (octobre 2026)

Le circuit culmine à la **Paris Games Week**. Les **8 meilleurs joueurs** français s'y affrontent pour le titre national dans un **arbre à élimination directe**, sans round de poule : chaque match peut tout changer.

À l'arrivée, les **2 finalistes** repartent avec une place pour le prochain **Europe Regional Championship 2026**. Le Rift Tour n'est donc pas une fin en soi, c'est une rampe de lancement vers la scène européenne. Le détail se trouve sur la page de la [Grande Finale](https://www.opentourfrance.fr/fr/news/grande-finale).`,
  },
  {
    type: "separator",
    id: "sep-2",
  },
  {
    type: "text",
    id: "divisions",
    content: `## Quatre divisions, seize boutiques

La France est découpée en quatre divisions géographiques, chacune réunissant quatre boutiques partenaires. Voici la carte complète.

**Île-de-France.** Atmos Arena (Paris), Playin Paris BNF (Paris), Geek Factory (Nogent-sur-Marne) et La Compagnie des jeux (Nanterre).

**Nord & Ouest.** Ludotrotter Lille (Lille), Autour des Jeux (Tours), Ludotrotter Nantes Orvault (Orvault) et Au coin du Dé (Vernon).

**Est.** Carta'Ludik (Lyon), Dooz TCG (Strasbourg), La Taverne du Gobelin Farci (Saint-Étienne) et Les Jeux de la Comté (Besançon).

**Sud.** L'antre du TCG (Montpellier), Fantasy Sphère (Toulouse), Artefacts Bordeaux (Bordeaux) et JSST Jeux (Nice).

La liste officielle et les liens d'inscription sont publiés sur la page des [boutiques partenaires](https://www.opentourfrance.fr/fr/news/boutiques-partenaires).`,
  },
  {
    type: "image",
    id: "img-poster",
    src: "/img/articles/rift-tour-poster.webp",
    alt: "Poster officiel du Rift Tour 2026 : carte des quatre divisions françaises et présentation des trois phases du circuit",
    caption: "Le poster officiel du Rift Tour 2026 — les quatre divisions et les trois phases du circuit. © Open Tour France / Riot Games",
    width: "narrow",
  },
  {
    type: "separator",
    id: "sep-3",
  },
  {
    type: "text",
    id: "recompenses",
    content: `## Les récompenses

Le Rift Tour récompense à chaque étape, des premières parties en boutique jusqu'au podium de la Paris Games Week.

Dès la **Phase 1**, tous les participants repartent avec une carte promo de participation, **Jayce, Man of Power**. Simplement jouer suffit pour la recevoir.

Les **Finales de division** passent à la vitesse supérieure :

| Classement | Récompenses |
| --- | --- |
| Gagnant de division | Winner Coin (or), transport + hôtel pour la PGW, 24 boosters, promo Autel d'unité |
| Finaliste de division | Finalist Coin (argent), transport + hôtel pour la PGW, 16 boosters, promo Autel d'unité |
| 3e-4e | Top 8 Coin (bronze), 12 boosters, promo Autel d'unité |
| 5e-8e | Top 8 Coin (bronze), 6 boosters, promo Autel d'unité |
| 9e-16e | 3 boosters, promo Autel d'unité |
| 17e-20e | 2 boosters, promo Autel d'unité |

La **Grande Finale** réserve les plus gros lots, dont les deux fameuses places pour le Regional Championship :

| Classement | Récompenses |
| --- | --- |
| Vainqueur | Carte Plated Legend, place pour l'Europe Regional Championship 2026, veste Riftbound, playmat Autel d'unité, 36 boosters |
| Finaliste | Place pour l'Europe Regional Championship 2026, veste Riftbound, playmat Autel d'unité, 24 boosters |
| 3e-4e | Veste Riftbound, playmat Autel d'unité, 18 boosters |
| 5e-8e | Veste Riftbound, playmat Autel d'unité, 12 boosters |

Le détail complet est disponible sur la page des [récompenses du Rift Tour](https://www.opentourfrance.fr/fr/news/r%C3%A9compenses-du-rift-tour).`,
  },
  {
    type: "separator",
    id: "sep-4",
  },
  {
    type: "text",
    id: "showdown",
    content: `## Le Rift Tour, volet français de la Showdown Series

Le Rift Tour ne sort pas de nulle part. Il s'inscrit dans la **Showdown Series**, le programme mondial d'événements officiels annoncé par Riot Games et organisés par des partenaires expérimentés en Amérique du Nord, en Europe et en Asie-Pacifique. Ce sont des tournois de taille intermédiaire, qui visent des centaines de joueurs plutôt que les milliers d'un Regional Qualifier.

En 2026, les événements se répartissent en trois paliers selon le nombre de joueurs, chacun offrant des invitations au Regional Championship et des passes pour les Regional Qualifiers :

| Palier | Joueurs | Invitations RC | Passes RQ |
| --- | --- | --- | --- |
| Tier I | 512+ | Top 4 | Top 16 |
| Tier II | 256-511 | Top 2 | Top 8 |
| Tier III | 128-255 | Top 1 | Top 4 |

Dix événements sont confirmés entre juillet et octobre 2026, répartis entre les États-Unis, le Canada, la Nouvelle-Zélande, l'Allemagne, l'Italie, l'Espagne, et la France avec le Rift Tour (notamment Fort Worth, Pittsburgh, Gatineau, Auckland, Speyer, Milwaukee, Lucca, Murcie, Baltimore et Orlando). La particularité française : culminer à la Paris Games Week et accompagner le lancement de Riftbound en langue française. Tout est détaillé sur le [site officiel de Riftbound](https://riftbound.leagueoflegends.com/en-us/news/organizedplay/announcing-the-showdown-series-le-rift-tour/).`,
  },
  {
    type: "image",
    id: "img-banner",
    src: "/img/articles/rift-tour-banner.webp",
    alt: "Bannière de la Showdown Series et du Rift Tour Riftbound",
    caption: "Le Rift Tour est le rendez-vous français de la Showdown Series 2026.",
  },
  {
    type: "separator",
    id: "sep-5",
  },
  {
    type: "text",
    id: "participer",
    content: `## Comment participer

La marche à suivre est simple. Repérez la boutique partenaire la plus proche de chez vous dans la liste ci-dessus, surveillez le calendrier des qualifications qui démarrent en juillet, et inscrivez-vous. Les liens d'inscription ouvrent **le 29 mai 2026 à 12h** sur le site de l'Open Tour France. Aucun classement préalable n'est requis : il suffit de jouer.

Que vous soyez un pilier de votre boutique ou que vous cherchiez votre première vraie expérience compétitive, le Rift Tour a été pensé pour vous. La scène française de Riftbound est en train de naître. Rendez-vous cet été dans les boutiques.`,
  },
];

const COVER = "/img/articles/rift-tour-cover.webp";
const TITLE = "Le Rift Tour : le premier circuit compétitif français de Riftbound";
const EXCERPT =
  "Riot Games lance Le Rift Tour, un circuit national en trois phases qui emmènera les joueurs français des boutiques locales jusqu'à la Paris Games Week, avec deux places pour le Regional Championship Europe 2026 à la clé.";
const TAGS = ["rift-tour", "competitif", "france", "showdown-series", "paris-games-week", "regional-championship"];

async function main() {
  const existing = await prisma.article.findUnique({ where: { slug: SLUG } });
  if (existing) {
    console.log(`Article "${SLUG}" already exists (id: ${existing.id}). Updating...`);
    await prisma.article.update({
      where: { slug: SLUG },
      data: {
        title: TITLE,
        excerpt: EXCERPT,
        coverImage: COVER,
        category: "actualite",
        tags: TAGS,
        blocks: blocks,
        featured: true,
        published: true,
        publishedAt: new Date("2026-05-29T12:00:00Z"),
      },
    });
    console.log("Article updated successfully.");
  } else {
    const article = await prisma.article.create({
      data: {
        slug: SLUG,
        title: TITLE,
        excerpt: EXCERPT,
        coverImage: COVER,
        category: "actualite",
        tags: TAGS,
        blocks: blocks,
        featured: true,
        published: true,
        publishedAt: new Date("2026-05-29T12:00:00Z"),
      },
    });
    console.log(`Article created: ${article.id} (slug: ${article.slug})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
