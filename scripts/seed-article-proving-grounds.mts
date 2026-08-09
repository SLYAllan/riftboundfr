// Seed de l'article "Proving Grounds : quel deck monter".
//
// Les quatre decklists ne sont PAS écrites à la main : elles sont relues depuis la base
// à chaque exécution, à partir de leur slug. Aucune carte n'est saisie ici, donc aucune
// possibilité d'en inventer une. Si un deck disparaît de la base, le script s'arrête.
//
// Rejouable : upsert sur le slug de l'article.
//
//   npx tsx --env-file=.env scripts/seed-article-proving-grounds.mts
import { prisma } from "../src/lib/prisma";

const SLUG = "proving-grounds-quel-deck-monter";

// Les quatre listes retenues : la moins chère parmi les Top 8 du format Déchaînement,
// pour chacune des quatre Légendes de Proving Grounds.
const DECKS = {
  yi: "best-of-hartford-master-yi-wuju-bladesman",
  annie: "s3-shenzhen-city-challenge-2026-05-16-1st-dd-annie",
  lux: "best-of-hartford-lux-lady-of-luminosity",
  garen: "s3-shanghai-city-challenge-2026-05-10-8th-watneylaw-garen",
} as const;

const LABELS: Record<string, string> = {
  legend: "Legend",
  champion: "Champion",
  main: "Main Deck",
  rune: "Runes",
  battlefield: "Battlefield",
  side: "Sideboard",
};
const ORDER = ["legend", "champion", "main", "rune", "battlefield", "side"];

async function deckCode(slug: string): Promise<string> {
  const deck = await prisma.deck.findUnique({
    where: { slug },
    include: { cards: { include: { card: true }, orderBy: [{ card: { energy: "asc" } }, { card: { name: "asc" } }] } },
  });
  if (!deck) throw new Error(`deck absent de la base : ${slug}`);

  const bySection = new Map<string, string[]>();
  for (const dc of deck.cards) {
    // Un champion arrive en section "legend" sans être de type Legend : on le remet
    // dans sa propre section, comme partout ailleurs sur le site.
    const section = dc.section === "legend" && dc.card.type !== "Legend" ? "champion" : dc.section;
    const list = bySection.get(section) ?? [];
    list.push(`${dc.quantity}x ${dc.card.name}`);
    bySection.set(section, list);
  }

  const parts: string[] = [];
  for (const s of ORDER) {
    const lines = bySection.get(s);
    if (!lines?.length) continue;
    parts.push(`== ${LABELS[s]} ==`, ...lines);
  }
  return parts.join("\n");
}

const t = (id: string, content: string) => ({ id, type: "text", content });
const sep = (id: string) => ({ id, type: "separator" });
// `deckName`, `legendName` et `playerName` sont obligatoires : la page /articles les lit
// pour l'aperçu, et la decklist les affiche en en-tête. Sans eux, les deux plantent.
const list = (
  id: string,
  o: { deckName: string; legendName: string; playerName?: string; championName?: string; context: string },
  code: string,
) => ({ id, type: "decklist", deckCode: code, ...o });

async function main() {
  const codes = {
    yi: await deckCode(DECKS.yi),
    annie: await deckCode(DECKS.annie),
    lux: await deckCode(DECKS.lux),
    garen: await deckCode(DECKS.garen),
  };

  const blocks = [
    t(
      "intro",
      `Sur le format Déchaînement, Master Yi, Wuju Bladesman a placé 50 listes dans un Top 8. Lux en a placé une, Garen aussi. Les quatre Légendes viennent pourtant du même produit d'initiation, Proving Grounds.

| Légende | Top 8 sur Déchaînement | La liste qui a fait le résultat |
|---|---|---|
| Master Yi, Wuju Bladesman | 50 | **Aussi la moins chère, ou presque** |
| Annie, Dark Child | 8 | Deux fois le prix d'une liste jouable |
| Lux, Lady of Luminosity | 1 | Quatre fois le prix d'une liste jouable |
| Garen, Might of Demacia | 1 | Trois fois le prix d'une liste jouable |

Le nombre de résultats ne dit pas tout. Chez Master Yi, la liste qui gagne est aussi celle qui coûte le moins cher. Chez les trois autres, la liste qui a fait un classement et celle qu'on peut se payer sont deux decks différents.

Ces chiffres décrivent Déchaînement. Vendetta est sorti le 31 juillet et les premiers tournois du nouveau format viennent tout juste de se jouer, donc ce qui suit raconte un format qui se termine.

## Ce qu'il y a dans le produit

Proving Grounds contient **24 cartes** : les quatre Légendes, deux cartes Champion pour chacune d'elles, quatre cartes Signature dont [[Tibbers]] et [[Final Spark]], et une poignée de sorts et d'unités comme [[Firestorm]], [[Flash]] ou [[Recruit the Vanguard]].

Les listes qui suivent montrent bien à quoi sert ce produit. Dans le deck de Master Yi qui a gagné le Regional Qualifier de Hartford, **aucune carte ne vient de Proving Grounds** en dehors de la Légende et de son champion. Chez Annie, on en trouve deux exemplaires sur quarante-sept. Chez Lux et chez Garen, un seul.

Le produit vous donne donc une Légende et de quoi jouer tout de suite entre amis, mais le deck de tournoi se construit avec des cartes achetées ailleurs. C'est le rôle d'un produit d'initiation, et il le remplit bien. Autant le savoir avant d'espérer y trouver un deck complet.`,
    ),
    sep("sep-yi"),
    t(
      "yi",
      `## Master Yi, Wuju Bladesman

La liste à copier est celle de **Factor, qui a gagné le RQ Hartford 2026**, le dernier Regional Qualifier de la saison.

Le deck joue Corps et Calme et gagne par le contrôle du terrain. Il pose des unités bon marché qui survivent au premier échange, [[Ruin Runner]] et [[Lonely Poro]] en tête, il protège ce qui compte avec [[Defy]] et [[Discipline]], et il prend un champ de bataille après l'autre pendant que l'adversaire cherche encore par où entrer. Le champion désigné est [[Master Yi, Honed]], qui coûte quelques centimes.

Une seule carte pèse vraiment dans le budget : [[Zhonya's Hourglass]] représente à elle seule la moitié de la valeur du deck. Le reste est bon marché, et les runes comme les champs de bataille ne coûtent presque rien.

Sur les 970 listes de Master Yi publiées sur le format, la moins chère de toutes descend à peine sous celle-ci. Inutile, donc, de chercher une version économique : celle qui a gagné le Regional en est déjà une.

Si vous démarrez, montez les neuf dixièmes du deck maintenant et gardez les Zhonya's pour plus tard. Il reste jouable en attendant.`,
    ),
    list(
      "deck-yi",
      {
        deckName: "Master Yi Control",
        legendName: "Master Yi, Wuju Bladesman",
        championName: "Master Yi, Honed",
        playerName: "Factor",
        context: "1er - RQ Hartford 2026",
      },
      codes.yi,
    ),
    sep("sep-annie"),
    t(
      "annie",
      `## Annie, Dark Child

Huit listes d'Annie ont fini dans un Top 8 sur le format. Celle retenue ici a **gagné le City Challenge de Shenzhen du 16 mai**. Deux listes coûtent un peu moins cher, mais aucune des deux n'a de réserve : impossible de les jouer telles quelles en Bo3.

C'est un deck qui carbure aux ressources. [[Traveling Merchant]] et [[Treasure Trove]] enchaînent les cartes, [[Rhasa the Sunderer]] et [[Brynhir Thundersong]] ferment la partie, et [[Heedless Resurrection]] ramène ce qui est tombé. Le champion désigné est [[Annie, Stubborn]], qui ne coûte rien.

La facture est nettement plus lourde que chez Master Yi, mais elle se concentre sur peu de cartes : [[Seal of Discord]] représente à elle seule la moitié du prix du deck, devant les [[Ezreal, Prodigy]] et la Légende.

Autrement dit, ce n'est pas le plan de jeu d'Annie qui coûte cher, c'est une carte. D'autres joueurs l'ont d'ailleurs montée pour moitié moins : sur les 132 listes d'Annie publiées, la moins chère revient à peu près à la moitié de celle-ci. Aucune n'a fait de Top 8, mais elles tournent. Commencer sans les Seal of Discord reste donc une bonne façon d'entrer dans le deck.`,
    ),
    list(
      "deck-annie",
      {
        deckName: "Annie Value",
        legendName: "Annie, Dark Child",
        championName: "Annie, Stubborn",
        playerName: "DD",
        context: "1er - City Challenge de Shenzhen (16 mai 2026)",
      },
      codes.annie,
    ),
    sep("sep-lux"),
    t(
      "lux",
      `## Lux, Lady of Luminosity

Sur tout le format, Lux ne compte **qu'une seule** liste en Top 8 : la sixième place de CTCG Relivia au RQ Hartford. Un archétype ne s'installe pas avec un résultat, et personne n'a encore refait celui-là. Ça ne veut pas dire que le deck est mauvais, seulement qu'on n'en sait pas grand-chose.

C'est un deck de contrôle Esprit et Ordre. Il accumule les ressources avec [[Progress Day]] et [[Forge of the Future]], puis il referme la partie avec [[Time Warp]] et [[Unchecked Power]]. Le champion désigné est [[Lux, Crownguard]].

Le budget ressemble à celui d'Annie et tient lui aussi à quelques cartes : [[Time Warp]] et [[Unchecked Power]] représentent à elles deux les trois quarts du prix du deck.

Un point à corriger avant de la monter : cette liste joue [[Aspirant's Climb]], bannie depuis le 24 juillet. Elle date d'avant. Remplacez ce champ de bataille par [[The Papertree]] ou [[Forgotten Monument]].

Sauf que l'écart avec les versions économiques est bien plus large ici. Sur les 88 listes de Lux publiées, la moins chère coûte environ le quart de celle-ci, mais elle ne joue pas le même jeu : les deux cartes chères sont justement celles qui font gagner. Contrairement à Annie, vous ne pouvez pas commencer petit puis compléter.`,
    ),
    list(
      "deck-lux",
      {
        deckName: "Lux Control",
        legendName: "Lux, Lady of Luminosity",
        championName: "Lux, Crownguard",
        playerName: "CTCG Relivia",
        context: "6e - RQ Hartford 2026",
      },
      codes.lux,
    ),
    sep("sep-garen"),
    t(
      "garen",
      `## Garen, Might of Demacia

Une seule liste classée sur tout le format, sur 49 publiées. Garen n'a pas encore trouvé sa place en tournoi.

Celle qui existe a pris la **huitième place au City Challenge de Shanghai du 10 mai**, jouée par WatneyLaw. C'est un deck Corps et Ordre de rampe : il accélère avec [[Mobilize]] et [[Catalyst of Aeons]], puis déroule [[Dazzling Aurora]], [[Rengar, Trophy Hunter]] et [[Elder Dragon]]. Un plan connu, qui ne doit d'ailleurs presque rien à Garen : le champion désigné, [[Garen, Rugged]], est parmi les cartes les moins chères du deck.

Le prix est élevé, tiré par [[Dazzling Aurora]] et [[Rengar, Trophy Hunter]], pour un deck qui n'exploite pas vraiment sa Légende. Les listes de Garen les moins chères descendent au tiers de ce prix, mais aucune n'a de résultat à montrer.

Elle joue elle aussi [[Aspirant's Climb]], bannie depuis le 24 juillet : à remplacer par [[Sunken Temple]], [[Forgotten Monument]] ou [[Frozen Fortress]].

Deux réserves pour finir. D'abord, la liste date de mai et le méta a changé depuis : les decks construits autour de [[Dazzling Aurora]] se font désormais démonter par les cartes qui retirent l'équipement. Ensuite, une huitième place isolée ne suffit pas à faire une tendance.`,
    ),
    list(
      "deck-garen",
      {
        deckName: "Garen Ramp",
        legendName: "Garen, Might of Demacia",
        championName: "Garen, Rugged",
        playerName: "WatneyLaw",
        context: "8e - City Challenge de Shanghai (10 mai 2026)",
      },
      codes.garen,
    ),
    sep("sep-fin"),
    t(
      "conclusion",
      `## Par où commencer

Avec Master Yi, la question du budget ne se pose pas vraiment : la liste qui a gagné Hartford est déjà la moins chère que vous trouverez.

Avec Annie, vous pouvez commencer par tout le reste du deck et acheter les [[Seal of Discord]] plus tard, quand vous en aurez les moyens. Le deck tourne sans, moins bien, mais il tourne.

Avec Lux, cette solution n'existe pas. Les deux cartes qui coûtent cher sont précisément celles qui font gagner la partie. Vous les achetez, ou vous jouez autre chose.

Quant à Garen, il n'a qu'un seul résultat à son actif, et sur une liste de mai que les decks d'aujourd'hui savent démonter. Attendez de voir.

Et n'oubliez pas d'où vous partez : Proving Grounds vous donne quatre Légendes et de quoi jouer dès le soir même, mais les decks présentés ici se construisent presque entièrement avec des cartes d'autres sets.

Tout cela décrit Déchaînement. Vendetta vient de sortir, la Réserve passe à dix cartes, neuf Légendes arrivent, et les premiers résultats commencent à peine à tomber. Si Master Yi tient le choc, il restera le meilleur point d'entrée. Si le format ralentit, Annie devrait en profiter. On y verra plus clair après les premiers Regional Qualifiers.`,
    ),
  ];

  const data = {
    title: "Proving Grounds : quel deck monter avec Annie, Master Yi, Lux ou Garen",
    excerpt:
      "Vous avez ouvert le set d'initiation et vous voulez jouer en tournoi. Voici, pour chacune des quatre Légendes, la meilleure liste vraiment classée et ce qu'elle demande.",
    coverImage: "/img/articles/proving.webp",
    category: "guide",
    tags: ["proving-grounds", "budget", "debutant", "decks"],
    blocks,
    published: true,
    publishedAt: new Date(),
  };

  const a = await prisma.article.upsert({
    where: { slug: SLUG },
    create: { slug: SLUG, ...data },
    update: data,
  });
  console.log(`Article ${a.published ? "publié" : "en brouillon"} : /articles/${a.slug}`);
  console.log(`${blocks.length} blocs, 4 decklists relues depuis la base.`);
  console.log(`Couverture : ${a.coverImage}`);
}

main().finally(() => prisma.$disconnect());
