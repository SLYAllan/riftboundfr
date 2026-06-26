import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

type DeckJson = {
  legend: string; champion: string | null; player: string;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

function buildDeckCode(d: DeckJson): string {
  const parts: string[] = [];
  if (d.champion) { parts.push("== Champion =="); parts.push(`1x ${d.champion}`); }
  parts.push("== Main Deck ==");
  for (const c of d.mainDeck) {
    if ((c.type ?? "").toLowerCase() === "champion") continue;
    parts.push(`${c.quantity}x ${c.name}`);
  }
  const runes = Object.entries(d.runes ?? {}).map(([n, q]) => `${q}x ${n.endsWith(" Rune") ? n : n + " Rune"}`);
  if (runes.length) { parts.push("== Runes =="); parts.push(...runes); }
  if (d.battlefields.length) { parts.push("== Battlefield =="); for (const b of d.battlefields) parts.push(`1x ${b}`); }
  const side = d.sideDeck ?? [];
  if (side.length) { parts.push("== Side Deck =="); for (const s of side) parts.push(`${s.quantity}x ${s.name}`); }
  return parts.join("\n");
}

function deckBlock(file: string, id: string, place: string) {
  const d: DeckJson = JSON.parse(readFileSync(file, "utf-8"));
  return {
    type: "decklist" as const,
    id,
    deckCode: buildDeckCode(d),
    deckName: `${d.legend.split(",")[0]} - ${d.player}`,
    legendName: d.legend,
    playerName: d.player,
    context: `${place} · RQ Hartford`,
  };
}

const blocks = [
  {
    type: "text",
    id: "intro",
    content: `Dernier Regional Qualifier du format Unleashed, et un champion totalement neuf : à Hartford, **Factor** offre à [[Master Yi, Wuju Bladesman|Master Yi]] son premier titre sur le circuit occidental, là où Sydney, Vancouver et Utrecht avaient sacré Irelia, Diana puis Azir. 1 953 joueurs, treize rondes de Suisse, un Top 8 à élimination directe, et au bout du compte un premier trophée pour Factor.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
  },
  {
    type: "text",
    id: "meta",
    content: `## Un méta Diana, un champion Master Yi

Hartford, c'est d'abord le tournoi de [[Diana, Scorn of the Moon|Diana]]. La Lunari place **trois listes dans le Top 8** (2e, 4e et 5e) et reste la deuxième Légende la plus jouée du week-end, derrière le [[Master Yi, Wuju Bladesman|Master Yi]] qui, lui, truste la première place du field. Le couple de domaines Chaos/Mind, celui de Diana et d'[[Ezreal, Prodigal Explorer|Ezreal]], a saturé la dernière ligne droite.

Et pourtant, c'est bien la Légende la plus jouée qui l'emporte. Master Yi convertit là où les autres se neutralisent : un plan de jeu Body/Calm tout en patience, bâti autour du [[Ruin Runner]], cette unité à six énergie qui ne peut être ciblée ni par les sorts ni par les capacités, le cauchemar des decks Chaos.`,
  },
  {
    type: "text",
    id: "top8-table",
    content: `## Le Top 8 de Hartford

| Place | Joueur | Record | Légende | Domaines |
|---|---|---|---|---|
| 🥇 1er | **Factor** | 14-1-1 | [[Master Yi, Wuju Bladesman]] | Body/Calm |
| 🥈 2e | **bsweitz** | 13-2-1 | [[Diana, Scorn of the Moon]] | Chaos/Mind |
| 🥉 3e | **Bradykin** | 12-1-2 | [[Ezreal, Prodigal Explorer]] | Chaos/Mind |
| 4e | **linsanity** | 12-2-1 | [[Diana, Scorn of the Moon]] | Chaos/Mind |
| 5e | **ASC Evansrhim** | 11-2-1 | [[Diana, Scorn of the Moon]] | Chaos/Mind |
| 6e | **CTCG Relivia** | 11-2-1 | [[Lux, Lady of Luminosity]] | Mind/Order |
| 7e | **Prismaticismism** | 11-2-1 | [[Annie, Dark Child]] | Chaos/Fury |
| 8e | **Mirru** | 11-2-1 | [[Pyke, Bloodharbor Ripper]] | Chaos/Fury |

Cinq Légendes différentes, mais une bascule très claire vers le contrôle Chaos/Mind : cinq des huit sièges. La liste de **ASC Evansrhim** (5e) n'a pas été publiée, on ne la reconstruit pas ici.`,
  },
  {
    type: "bracket",
    id: "bracket",
    title: "Le parcours du Top 8",
    rounds: [
      {
        name: "Quarts de finale",
        matches: [
          { a: { player: "Factor", legend: "Master Yi", win: true }, b: { player: "Evansrhim", legend: "Diana" } },
          { a: { player: "Bradykin", legend: "Ezreal", win: true }, b: { player: "Mirru", legend: "Pyke" } },
          { a: { player: "linsanity", legend: "Diana", score: "2", win: true }, b: { player: "Relivia", legend: "Lux", score: "0" } },
          { a: { player: "bsweitz", legend: "Diana", win: true }, b: { player: "Prismaticismism", legend: "Annie" } },
        ],
      },
      {
        name: "Demi-finales",
        matches: [
          { a: { player: "Factor", legend: "Master Yi", win: true }, b: { player: "Bradykin", legend: "Ezreal" } },
          { a: { player: "bsweitz", legend: "Diana", score: "2", win: true }, b: { player: "linsanity", legend: "Diana", score: "1" } },
        ],
      },
      {
        name: "Finale",
        matches: [
          { a: { player: "Factor", legend: "Master Yi", score: "2", win: true }, b: { player: "bsweitz", legend: "Diana", score: "0" } },
        ],
      },
    ],
  },
  {
    type: "text",
    id: "qfs",
    content: `## Le boss du Top 8 tombe en quart

Le grand favori du plateau s'appelait **Prismaticismism**. Vainqueur d'Atlanta, c'était lui que les commentateurs désignaient comme le patron de ce Top 8. Son [[Annie, Dark Child|Annie]] Chaos/Fury tombe pourtant dès les quarts, dans un duel d'usure interminable face au [[Diana, Scorn of the Moon|Diana]] de **bsweitz**. La sortie du favori garantit déjà une chose : Hartford aura un tout premier champion.

À côté, **Bradykin**, seul [[Ezreal, Prodigal Explorer|Ezreal]] du Top 8, écarte le [[Pyke, Bloodharbor Ripper|Pyke]] de **Mirru**, tandis que **linsanity** s'offre le seul miroir gagnant du week-end contre une autre Diana, en sortant le [[Lux, Lady of Luminosity|Lux]] de **CTCG Relivia** sur un sec 2 à 0. Et **Factor** lance sa course en battant la troisième Diana du tableau, celle d'**ASC Evansrhim**.`,
  },
  {
    type: "text",
    id: "sfs",
    content: `## Deux demies, deux trajectoires

En haut du tableau, **Factor** déroule contre l'[[Ezreal, Prodigal Explorer|Ezreal]] de **Bradykin**. Le plan est limpide : poser le [[Ruin Runner]], le protéger avec le [[Sabotage]], et laisser le [[Punch First]] passer par-dessus les blocs. Deux Ruin Runners par partie, intouchables pour les sorts adverses, et un Ezreal bleu-violet qui finit à court de réponses. Direction la finale.

En bas, le miroir Diana annoncé : **bsweitz** contre **linsanity**. Bsweitz l'emporte 2 à 1 dans une série où sa tech de terrain, l'[[The Arena's Greatest|Arena's Greatest]] glissé dans une Diana pour accélérer le miroir, fait la différence. Une Diana en finale, un Master Yi en face : exactement l'affiche que tout le monde voyait venir.`,
  },
  {
    type: "image",
    id: "img-finale",
    src: "/img/articles/hartford2.webp",
    alt: "La table de la finale du Regional Qualifier Hartford entre Factor et bsweitz",
    caption: "La finale en feature : le Master Yi de Factor face à la Diana de bsweitz.",
  },
  {
    type: "text",
    id: "finale",
    content: `## La finale : la revanche de Vancouver

Il y avait une histoire dans cette finale, et Factor l'a racontée lui-même après coup : **bsweitz l'avait battu à Vancouver**, quelques semaines plus tôt. Hartford, c'était la revanche.

La première manche tourne à l'avantage du [[Master Yi, Wuju Bladesman|Master Yi]]. Une fois le [[Ruin Runner]] en jeu, protégé par le [[Sabotage]] et hors de portée des [[Moonfall]] de la [[Diana, Scorn of the Moon|Diana]], bsweitz n'a tout simplement pas assez de puissance pour passer par-dessus. La manche se referme sans bavure.

La deuxième restera la signature du week-end. En Riftbound, chaque joueur n'engage qu'un seul terrain - et cette fois **les deux finalistes posent un [[The Arena's Greatest|The Arena's Greatest]]**. Comme la Légende de l'arène donne un point de départ à son joueur, ce « double Arena's Greatest » fait démarrer chacun à deux points : il n'en reste que six à conquérir, et la manche vire au sprint. Voyant la Légende de l'arène en face, Factor a aligné la sienne. « Donnons-leur un spectacle », lâche-t-il. Et alors qu'il joue second, là où chaque action compte double, c'est lui qui trouve la dernière ligne et conclut. **2 à 0.**

Et le clou de l'histoire : le [[Ruin Runner]], Factor le qualifiait de pire carte de son week-end. Elle est pourtant remontée au sommet de son deck manche après manche, jusqu'à le porter au titre.`,
  },
  {
    type: "text",
    id: "decks-intro",
    content: `## Les deux decks de la finale

Les listes complètes des deux finalistes : le [[Master Yi, Wuju Bladesman|Master Yi]] Body/Calm de Factor, et la [[Diana, Scorn of the Moon|Diana]] Chaos/Mind de bsweitz.`,
  },
  deckBlock("data/decklists/master-yi-wuju-bladesman/hartford-rq-1-factor.json", "deck-factor", "1re place"),
  deckBlock("data/decklists/diana-scorn-of-the-moon/hartford-rq-2-bsweitz.json", "deck-bsweitz", "2e place"),
  { type: "separator", id: "sep-rest" },
  {
    type: "text",
    id: "rest-intro",
    content: `## Le reste du Top 8

Les autres listes disponibles du Top 8 de Hartford.`,
  },
  deckBlock("data/decklists/ezreal-prodigal-explorer/hartford-rq-3-bradykin.json", "deck-bradykin", "3e place"),
  deckBlock("data/decklists/diana-scorn-of-the-moon/hartford-rq-4-linsanity.json", "deck-linsanity", "4e place"),
  deckBlock("data/decklists/lux-lady-of-luminosity/hartford-rq-6-ctcg-relivia.json", "deck-relivia", "6e place"),
  deckBlock("data/decklists/annie-dark-child/hartford-rq-7-prismaticismism.json", "deck-prismaticismism", "7e place"),
  deckBlock("data/decklists/pyke-bloodharbor-ripper/hartford-rq-8-mirru.json", "deck-mirru", "8e place"),
  { type: "separator", id: "sep-fin" },
  {
    type: "text",
    id: "conclusion",
    content: `## Ce que Hartford nous laisse

C'était le dernier Regional Qualifier d'Unleashed avant le set Vendetta et ses paires de couleurs ennemies. Un format arrivé à pleine maturité, où les meilleurs joueurs se départagent au tech près, et qui offre pour sa sortie un champion totalement neuf.

[[Master Yi, Wuju Bladesman|Master Yi]] s'invite enfin sur le mur des champions de Regional Qualifier occidentaux, après avoir vu Irelia, Diana et Azir s'y inscrire avant lui. Et Factor, lui, a transformé une défaite à Vancouver en trophée à Hartford. Belle manière de refermer Unleashed.

*Allan, Riftbound France*`,
  },
];

const data = {
  title: "RQ Hartford : Factor sacre Master Yi et venge sa défaite de Vancouver",
  slug: "recap-hartford-rq-top8",
  excerpt:
    "Sur le dernier Regional Qualifier du format Unleashed, Factor porte Master Yi à son premier titre de RQ occidental et prend sa revanche sur bsweitz, qui l'avait battu à Vancouver. Récap du Top 8 de Hartford.",
  coverImage: "/img/articles/hartford1.webp",
  category: "tournoi",
  tags: ["Regional Qualifier", "Hartford", "Unleashed", "Master Yi", "Diana"],
  blocks: blocks as object[],
  tournamentName: "Hartford Regional Qualifier",
  tournamentDate: new Date("2026-06-20"),
  tournamentLocation: "Hartford, CT, USA",
  tournamentPlayerCount: 1953,
  published: true,
  featured: true,
  publishedAt: new Date("2026-06-23"),
};

const article = await prisma.article.upsert({
  where: { slug: "recap-hartford-rq-top8" },
  update: data,
  create: data,
});
console.log(`Article Hartford seedé : /articles/${article.slug}`);
await prisma.$disconnect();
