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
    deckName: `${d.legend.split(",")[0]} — ${d.player}`,
    legendName: d.legend,
    playerName: d.player,
    context: `${place} · RQ Utrecht`,
  };
}

const blocks = [
  {
    type: "text",
    id: "intro",
    content: `Quelques semaines après AlanZQ à Vancouver, Riftbound tient son deuxième double champion de Regional Qualifier. À Utrecht, **Squirtle** a défendu sa couronne européenne avec [[Azir, Emperor of the Sands|Azir]] et remporte un second titre d'affilée, de Lille jusqu'aux Pays-Bas. Sur l'un des Top 8 les plus ouverts jamais vus, huit Légendes différentes pour huit joueurs, le capitaine de Micelion n'a pas tremblé.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
  },
  {
    type: "text",
    id: "diversite",
    content: `## Huit Légendes pour huit joueurs

C'est le chiffre qui résume le week-end. Là où Vancouver alignait six Légendes en Top 8, Utrecht en présente huit, une par joueur. [[Azir, Emperor of the Sands|Azir]], [[Viktor, Herald of the Arcane|Viktor]], [[Sett, The Boss|Sett]], [[Diana, Scorn of the Moon|Diana]], [[Rek'Sai, Void Burrower|Rek'Sai]], [[Darius, Hand of Noxus|Darius]], [[Master Yi, Wuju Bladesman|Master Yi]] et [[Annie, Dark Child|Annie]] : tout le monde avait sa carte à jouer.

| Place | Joueur | Record | Légende |
|---|---|---|---|
| 🥇 1er | **Squirtle** (Micelion) | 15-0-1 | [[Azir, Emperor of the Sands]] |
| 🥈 2e | **Rednaxell** | 13-2-1 | [[Viktor, Herald of the Arcane]] |
| 🥉 3e/4e | **Collin K** (CTCG) | 12-2-1 | [[Sett, The Boss]] |
| 3e/4e | **Dhawally** | 12-2-1 | [[Diana, Scorn of the Moon]] |
| 5e-8e | **Ramekiano** (Micelion) | 11-1-2 | [[Rek'Sai, Void Burrower]] |
| 5e-8e | **DiamondHat** (Micelion) | 11-2-1 | [[Darius, Hand of Noxus]] |
| 5e-8e | **Bakura** | 11-2-1 | [[Master Yi, Wuju Bladesman]] |
| 5e-8e | **Prismaticismism** | 11-3 | [[Annie, Dark Child]] |

Un méta aussi étalé, c'est la marque d'un format en pleine santé. Les decks Order, Azir en tête, ont dominé la dernière ligne droite, et les stratégies de jetons ont fini par rafler les deux sièges de la finale.`,
  },
  {
    type: "image",
    id: "img-bracket",
    src: "/img/articles/utrecht-bracket.webp",
    alt: "Le bracket du Top 8 du Regional Qualifier Utrecht",
    caption: "Le Top 8 d'Utrecht : huit Légendes différentes pour huit joueurs.",
  },
  {
    type: "bracket",
    id: "bracket",
    title: "Le parcours du Top 8",
    rounds: [
      {
        name: "Quarts de finale",
        matches: [
          { a: { player: "Squirtle", legend: "Azir", win: true }, b: { player: "Prismaticismism", legend: "Annie" } },
          { a: { player: "Collin K", legend: "Sett", win: true }, b: { player: "Bakura", legend: "Master Yi" } },
          { a: { player: "Rednaxell", legend: "Viktor", win: true }, b: { player: "Ramekiano", legend: "Rek'Sai" } },
          { a: { player: "Dhawally", legend: "Diana", win: true }, b: { player: "DiamondHat", legend: "Darius" } },
        ],
      },
      {
        name: "Demi-finales",
        matches: [
          { a: { player: "Squirtle", legend: "Azir", win: true }, b: { player: "Collin K", legend: "Sett" } },
          { a: { player: "Rednaxell", legend: "Viktor", score: "2", win: true }, b: { player: "Dhawally", legend: "Diana", score: "1" } },
        ],
      },
      {
        name: "Finale",
        matches: [
          { a: { player: "Squirtle", legend: "Azir", score: "2", win: true }, b: { player: "Rednaxell", legend: "Viktor", score: "1" } },
        ],
      },
    ],
  },
  {
    type: "text",
    id: "squirtle",
    content: `## Squirtle, la machine de Micelion

En une ligne : trois Regional Qualifiers disputés, et toujours invaincu en série. Les chiffres avancés à l'antenne donnent le vertige, autour de 28 séries sans défaite et un bilan de 38-2-4 en parties. Squirtle arrive à Utrecht en tenant du titre européen, sorti vainqueur de Lille, et repart avec un second trophée.

Son [[Azir, Emperor of the Sands|Azir]] est un moteur qui ne s'éteint jamais. On enchaîne les pièces d'équipement, on déclenche la capacité de Légende pour invoquer des Sand Soldiers à la chaîne, et on transmet l'équipement d'un soldat à l'autre au fil des conquêtes. Ajoutez [[Arise]] pour reconstruire un plateau entier en un tour, [[Death Grip]] pour passer par-dessus n'importe quel mur, et une discipline de fer dans la gestion des ressources. C'est lent à tuer, mais ça ne lâche jamais prise.

En quart, il écarte l'[[Annie, Dark Child|Annie]] de **Prismaticismism**, le huitième seed qui s'était glissé dans le Top 8 à l'arraché sur les départages. En demie, il déroule contre le [[Sett, The Boss|Sett]] de **Collin K**. Direction la finale, sans trembler.`,
  },
  {
    type: "text",
    id: "rednaxell",
    content: `## Rednaxell, le conte de fées grec

S'il y a une histoire à raconter cette fois, c'est celle de **Rednaxell**. Premier Regional Qualifier de sa vie, venu seul d'Athènes, sans équipe ni staff pour décortiquer les matchups, sur un [[Viktor, Herald of the Arcane|Viktor]] qu'il joue depuis Origines. Le David parfait face au Goliath Micelion.

Son Viktor est l'autre deck à jetons du format. Le Victor Leader transforme chaque unité qui meurt en recrue prête à frapper, [[Sprite Fountain]] inonde le plateau au meilleur moment, et un arsenal de sorts comme [[Bellows Breath]], [[Cull the Weak]], [[Stupefy]] et [[Hidden Blade]] vient gérer tout ce qui dépasse.

Sa demi-finale contre Dhawally restera dans les mémoires. La [[Diana, Scorn of the Moon|Diana]] de **Dhawally**, déjà vainqueur du RQ Houston et demi-finaliste à Vancouver, sort une défense d'anthologie et garde la partie en vie jusqu'au dernier souffle. Mais sur le tirage de conquête à sept points, Rednaxell pioche le [[Sprite Fountain]] pile au bon moment et s'offre la finale. Un crève-cœur pour Dhawally, dont le rêve d'un second trophée s'arrête à une carte près.`,
  },
  {
    type: "text",
    id: "finale",
    content: `## La finale : un miroir de jetons

[[Azir, Emperor of the Sands|Azir]] contre [[Viktor, Herald of the Arcane|Viktor]], ce sont deux armées qui se gonflent à vue d'œil. Les Sand Soldiers d'un côté, les recrues de l'autre, et très vite la question n'est plus de savoir qui développe le plus vite, mais qui calcule le mieux ses combats.

La clé du week-end pour Rednaxell tenait dans sa réserve : [[Pickpocket]]. La carte détruit les équipements à coût 1, et Azir en joue une pleine fournée, [[BF Sword|Lame BF]], [[Soul Sword|Épée des Âmes]], [[Doran's Shield|Bouclier de Doran]], [[Eye of the Herald|Œil du Héraut]]. En venant disséquer le moteur d'équipement pièce par pièce, Rednaxell privait Squirtle de son carburant.

La première manche bascule pour Squirtle dans une remontée à zéro rune, tout misé sur l'économie, un empire posé sous ses pieds. Rednaxell réplique dans la deuxième en montant à huit points grâce à un [[Cull the Weak]] décisif. Tout se joue dans une troisième manche serrée, sur les terrains fétiches de Viktor. Mais Squirtle trouve juste assez de puissance pour conclure et garder son invincibilité intacte.`,
  },
  {
    type: "image",
    id: "img-finale",
    src: "/img/articles/utrcht2.webp",
    alt: "La table de la finale du Regional Qualifier Utrecht entre Squirtle et Rednaxell",
    caption: "La finale : la machine Azir de Squirtle face au Viktor de Rednaxell.",
  },
  {
    type: "text",
    id: "decks-intro",
    content: `## Les deux decks de la finale

Les listes complètes des deux finalistes, la machine Azir de Squirtle et le Viktor à jetons de Rednaxell.`,
  },
  deckBlock("data/decklists/azir-emperor-of-the-sands/utrecht-rq-1-squirtle.json", "deck-squirtle", "1re place"),
  deckBlock("data/decklists/viktor-herald-of-the-arcane/utrecht-rq-2-redn-xell.json", "deck-rednaxell", "2e place"),
  {
    type: "text",
    id: "micelion",
    content: `## Micelion rafle la mise

Squirtle s'incline parfois, il le reconnaît lui-même, chaque série passée par un 2 à 1. Mais il rejoint AlanZQ dans l'un des clubs les plus fermés de Riftbound, celui des doubles champions de Regional Qualifier, et signe deux titres européens consécutifs.

L'équipe **Micelion** repart d'Utrecht avec un week-end magnifique, trois joueurs en Top 8. Squirtle bien sûr, mais aussi **Ramekiano** sur un [[Rek'Sai, Void Burrower|Rek'Sai]] surprise et **DiamondHat** sur [[Darius, Hand of Noxus|Darius]]. Quand on parle d'avantage d'équipe, de matchups testés et d'informations partagées, c'est exactement ça que ça donne sur la scène européenne.`,
  },
  { type: "separator", id: "sep1" },
  {
    type: "text",
    id: "conclusion",
    content: `## Ce qu'Utrecht nous apprend

Le format respire. Huit Légendes en Top 8, des archétypes de jetons qui montent en puissance, Order qui s'affirme, et une scène européenne qui produit ses propres histoires. Un tenant du titre qui défend sa couronne et entre dans l'histoire, un parfait inconnu qui touche la finale du doigt à son tout premier tournoi.

Utrecht avait tout d'un grand. Il a tenu ses promesses.

*Allan, Riftbound France*`,
  },
];

const data = {
  title: "RQ Utrecht : Squirtle conserve sa couronne et entre dans l'histoire",
  slug: "recap-utrecht-rq-top8",
  excerpt:
    "Squirtle défend son titre européen avec Azir et devient le deuxième double champion de Regional Qualifier de Riftbound. Récap du Top 8 d'Utrecht, le plus ouvert à ce jour.",
  coverImage: "/img/articles/utrcht1.webp",
  category: "tournoi",
  tags: ["Regional Qualifier", "Utrecht", "Unleashed", "Azir", "Viktor"],
  blocks: blocks as object[],
  tournamentName: "Utrecht Regional Qualifier",
  tournamentDate: new Date("2026-06-14"),
  tournamentLocation: "Utrecht, Pays-Bas",
  tournamentPlayerCount: 1953,
  published: true,
  featured: true,
  publishedAt: new Date("2026-06-15"),
};

const article = await prisma.article.upsert({
  where: { slug: "recap-utrecht-rq-top8" },
  update: data,
  create: data,
});
console.log(`Article Utrecht seedé : /articles/${article.slug}`);
await prisma.$disconnect();
