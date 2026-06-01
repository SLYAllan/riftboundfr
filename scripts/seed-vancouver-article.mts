import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const prisma = new PrismaClient();

// Real decklists scraped from riftdecks.com (top 7), parsed to text deck codes.
const deckData: { key: string; player: string; placement: string; legend: string; deckName: string; deckCode: string }[] =
  JSON.parse(readFileSync("data/raw-scrapes/vancouver-deckcodes.json", "utf-8"));
const byKey = Object.fromEntries(deckData.map((d) => [d.key, d]));

function dl(key: string, blockId: string) {
  const d = byKey[key];
  if (!d) throw new Error(`deck not found: ${key}`);
  return {
    type: "decklist" as const,
    id: blockId,
    deckCode: d.deckCode,
    deckName: `${d.legend.split(",")[0]} — ${d.player}`,
    legendName: d.legend,
    playerName: d.player,
    context: `${d.placement} · RQ Vancouver`,
  };
}

const blocks = [
  {
    type: "text",
    id: "intro",
    content: `Le Regional Qualifier de Vancouver a livré son verdict sur l'un des Top 8 les plus variés du méta **Unleashed** : six Légendes pour huit joueurs. C'est **AlanZQ** qui soulève le trophée avec [[Diana, Scorn of the Moon|Diana]], et devient le **premier double champion de Regional Qualifier de l'histoire de Riftbound**.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
  },
  {
    type: "text",
    id: "top8",
    content: `## Le Top 8

Six Légendes différentes pour huit joueurs : l'un des Top 8 les plus diversifiés du format.

| Place | Joueur | Record | Légende |
|---|---|---|---|
| 🥇 1er | **AlanZQ** (CTG) | 15-0-2 | [[Diana, Scorn of the Moon]] |
| 🥈 2e | **Sam D Sherman** | 14-2-1 | [[Rengar, Pridestalker]] |
| 🥉 3e | **Houses Are Big** (TSS) | 13-3 | [[Master Yi, Wuju Bladesman]] |
| 4e | **Diwali** | 12-2-2 | [[Diana, Scorn of the Moon]] |
| 5e | **Rocklho** | 11-2-1 | [[Azir, Emperor of the Sands]] |
| 6e | **Arito** | 11-2-1 | [[Irelia, Blade Dancer]] |
| 7e | **SwagYOLO420** | 11-3 | [[Sivir, Battle Mistress]] (Aurora) |
| 8e | **Baobao** | 11-3 | [[Irelia, Blade Dancer]] |`,
  },
  {
    type: "bracket",
    id: "bracket",
    title: "Le parcours du Top 8",
    rounds: [
      {
        name: "Quarts de finale",
        matches: [
          { a: { player: "Sam D Sherman", legend: "Rengar", score: "2", win: true }, b: { player: "Rocklho", legend: "Azir", score: "1" } },
          { a: { player: "Diwali", legend: "Diana", score: "2", win: true }, b: { player: "SwagYOLO420", legend: "Sivir", score: "0" } },
          { a: { player: "Houses Are Big", legend: "Master Yi", win: true }, b: { player: "Baobao", legend: "Irelia" } },
          { a: { player: "AlanZQ", legend: "Diana", win: true }, b: { player: "Arito", legend: "Irelia" } },
        ],
      },
      {
        name: "Demi-finales",
        matches: [
          { a: { player: "Sam D Sherman", legend: "Rengar", score: "2", win: true }, b: { player: "Houses Are Big", legend: "Master Yi", score: "1" } },
          { a: { player: "AlanZQ", legend: "Diana", score: "2", win: true }, b: { player: "Diwali", legend: "Diana", score: "1" } },
        ],
      },
      {
        name: "Finale",
        matches: [
          { a: { player: "AlanZQ", legend: "Diana", score: "2", win: true }, b: { player: "Sam D Sherman", legend: "Rengar", score: "1" } },
        ],
      },
    ],
  },
  {
    type: "image",
    id: "img-qf",
    src: "/img/articles/vancouver-qf-azir-rengar.webp",
    alt: "Quart de finale Rocklho (Azir) contre Sam D Sherman (Rengar) au RQ Vancouver",
    caption: "Quart de finale : Rocklho (Azir, Emperor of the Sands) contre le Rengar de Sam D Sherman.",
  },
  {
    type: "text",
    id: "aurora",
    content: `## Aurora retombe, le méta riposte

La grande question d'avant-tournoi : continuer à miser sur Aurora, ou anticiper sa chute après la correction de Xi'an ? Vancouver a tranché. Un seul deck [[Dazzling Aurora|Aurora]] a atteint le Top 8 (le Sivir de SwagYOLO420), sorti dès les quarts.

L'anti-équipement a fait son travail, et il ne punit pas que l'Aurora pur : les versions d'Irelia bâties autour de l'équipement ont souffert aussi. Les deux Irelia présents sont tombés en quarts.`,
  },
  {
    type: "text",
    id: "rengar",
    content: `## La surprise Rengar de Sam D Sherman

L'histoire du tournoi, c'est **Sam D Sherman**. Déjà champion à Las Vegas avec un Draven mid-range, il débarque à Vancouver avec un [[Rengar, Pridestalker|Rengar]] hyper-agressif et sans Aurora. Personne ne l'attendait : il file jusqu'en finale.

La carte qui a porté ce run, c'est [[Irresistible Faefolk]]. Boudée à la sortie d'Unleashed, elle transforme l'agro en agro-contrôle : on la buff via le passif de Rengar, on attire une unité adverse sur le bon champ de bataille pour un trade favorable, puis on pousse l'avantage. Ajoutez trois [[Kai'Sa, Survivor|Kai'Sa Survivor]] en moteur, les [[Thrill of the Hunt]] pour conquérir tôt puis se déplacer, et un double [[Sabotage]] pour l'information.`,
  },
  dl("2-samdsherman-rengar", "dl-sam"),
  {
    type: "text",
    id: "vex",
    content: `## Vex, la tech de tout le week-end

Face à cette agressivité, Diana avait deux réponses : [[Vex, Apathetic|Vex Apathetic]] et [[Vex, Cheerless|Vex Cheerless]]. Le stun à l'entrée et le blocage des mécaniques ambush et accelerate étouffent complètement le plan de jeu de Rengar. Un Vex posé au tour 2, c'est presque une condamnation pour Rengar. Seul outil fiable pour passer côté Sam : [[Punch First]], en envoyant simplement plus de might.`,
  },
  {
    type: "text",
    id: "finale",
    content: `## La finale : AlanZQ 2-1 contre Sam D Sherman

**Game 1 (Sam)** — Alan pose Vex Apathetic au tour 2, mais Sam le dégage au [[Punch First]]. Pire, les cartes gear-hate d'Alan ([[Turn to Dust]]) sont mortes : Sam n'a aucun équipement.

**Game 2 (Alan, le coup décisif du tournoi)** — un double [[Hwei, Brooding Painter|Hwei]] devient ingérable pour Rengar. Au dernier tour, Alan joue *main ouverte*, garde une seule carte cachée — [[Hard Bargain]] — et son [[Stacked Deck]] trouve pile le contre. La boucle [[Fizz, Trickster|Fizz]] + [[Star-Crossed]] fait le reste.

**Game 3 (Alan, titre)** — double verrou [[Vex, Apathetic|Vex Apathetic]] + [[Vex, Cheerless|Vex Cheerless]], [[Moonfall]] pour nettoyer, et [[Tideturner|Tide Turner]] qui conclut. Tuer la Kai'Sa de Sam fut dévastateur, et sa [[Nidalee, Cat Form|Nidalee]] est restée coincée en main presque tout le match.`,
  },
  {
    type: "image",
    id: "img-finale",
    src: "/img/articles/vancouver-finale.webp",
    alt: "Finale du RQ Vancouver : AlanZQ (Diana) contre Sam D Sherman (Rengar) sur The Arena's Greatest",
    caption: "La finale sur The Arena's Greatest : la Diana d'AlanZQ contre le Rengar de Sam D Sherman.",
  },
  {
    type: "text",
    id: "diana",
    content: `## Diana, valeur sûre du format

Deux Diana en demi-finale, dont le champion. Le deck garde longtemps ses [[Stacked Deck]] pour trouver la réponse exacte, s'appuie sur [[Moonfall]] pour nettoyer le plateau et sur la [[Ravenbloom Conservatory]] comme moteur de cartes. La variante de Diwali ajoutait [[Frigid Jewel]] et [[Consult the Past]] contre les coups de mou.`,
  },
  dl("1-alanzq-diana", "dl-alanzq"),
  {
    type: "text",
    id: "yi",
    content: `## Master Yi et la team Secret Sauce

L'autre demi-finaliste, Houses Are Big, a sorti un [[Master Yi, Wuju Bladesman|Master Yi]] mid-range unique, avec [[Akshan, Mischievous|Akshan]] en main deck, [[Primal Strength]] et [[Zhonya's Hourglass]]. Il s'incline face au Rengar, qui trouvait toujours juste assez de might pour passer ses holds. La team Secret Sauce repart avec trois Best Ofs.`,
  },
  {
    type: "text",
    id: "decks-rest-h",
    content: `## Tous les decks du Top 7

Les listes complètes du Top 7 — survolez ou cliquez les cartes pour les détails, ou ouvrez-les dans le deckbuilder. La 8e place (Baobao, Irelia) n'a pas rendu sa liste publique.`,
  },
  dl("3-housesarebig-masteryi", "dl-houses"),
  dl("4-diwali-diana", "dl-diwali"),
  dl("5-rocklho-azir", "dl-rocklho"),
  dl("6-arito-irelia", "dl-arito"),
  dl("7-swagyolo420-sivir", "dl-swag"),
  { type: "separator", id: "sep1" },
  {
    type: "text",
    id: "outro",
    content: `## Ce que Vancouver nous apprend

L'anti-équipement et la tech Vex sont devenus incontournables. La Furie n'est pas morte, mais il faut un pilote d'exception pour l'amener aussi loin. Et Diana confirme qu'elle reste l'une des meilleures Légendes du format.

Six Légendes en Top 8, un champion qui entre dans l'histoire : Vancouver a tenu toutes ses promesses.`,
  },
];

const slug = "recap-regional-qualifier-vancouver";

const article = await prisma.article.upsert({
  where: { slug },
  update: {
    title: "RQ Vancouver : AlanZQ entre dans l'histoire avec Diana",
    excerpt:
      "Récap du Top 8 du Regional Qualifier Vancouver : AlanZQ devient le premier double champion sur Diana, le Rengar surprise de Sam D Sherman, decks et analyses méta.",
    coverImage: "/img/articles/vancouver.webp",
    category: "tournoi",
    tags: ["Regional Qualifier", "Vancouver", "Unleashed", "Diana", "Rengar"],
    blocks: blocks as object[],
    tournamentName: "Vancouver Regional Qualifier",
    tournamentDate: new Date("2026-05-31"),
    tournamentLocation: "Vancouver, Canada",
    published: true,
    featured: true,
    publishedAt: new Date("2026-06-01"),
  },
  create: {
    slug,
    title: "RQ Vancouver : AlanZQ entre dans l'histoire avec Diana",
    excerpt:
      "Récap du Top 8 du Regional Qualifier Vancouver : AlanZQ devient le premier double champion sur Diana, le Rengar surprise de Sam D Sherman, decks et analyses méta.",
    coverImage: "/img/articles/vancouver.webp",
    category: "tournoi",
    tags: ["Regional Qualifier", "Vancouver", "Unleashed", "Diana", "Rengar"],
    blocks: blocks as object[],
    tournamentName: "Vancouver Regional Qualifier",
    tournamentDate: new Date("2026-05-31"),
    tournamentLocation: "Vancouver, Canada",
    published: true,
    featured: true,
    publishedAt: new Date("2026-06-01"),
  },
});

console.log("Article upserted:", article.slug, "id:", article.id);
await prisma.$disconnect();
