/**
 * Article de récap du Regional Qualifier de Barcelone (23 août 2026).
 *
 *   npx tsx scripts/seed-barcelone-article.mts
 *
 * Les chiffres viennent de deux sources qui se recoupent :
 *   - le classement complet relevé sur riftdecks (2 126 lignes) ;
 *   - l'article officiel de Riot, `data/raw-scrapes/barcelona-rq-officiel.md`,
 *     qui donne le partage du méta jour 1 / jour 2 et les listes des Best-Of.
 * Les deux comptages ne s'écartent jamais de plus d'une ou deux places par
 * Légende. Rien ici n'est estimé.
 */
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
    deckName: `${d.legend.split(",")[0]} · ${d.player}`,
    legendName: d.legend,
    playerName: d.player,
    context: `${place} · RQ Barcelone`,
  };
}

const blocks = [
  {
    type: "text",
    id: "intro",
    content: `Le Regional Qualifier de Barcelone a réuni 2 224 inscrits. Parmi eux, 2 131 joueurs ont été classés et 379 ont joué le dimanche. C'est le plus grand Regional Qualifier de l'ère Vendetta.

[[Ornn, Fire Below the Mountain|Ornn]] a gagné malgré ses 42 joueurs, soit 2 % du tournoi. **MICE TheManLand** l'a joué jusqu'en finale, où il a battu Kennen, la Légende la plus présente.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
  },
  {
    type: "text",
    id: "top8",
    content: `## Le Top 8

| Place | Joueur | Bilan | Légende |
|---|---|---|---|
| 🥇 1er | **MICE TheManLand** | 14-1-1 | [[Ornn, Fire Below the Mountain]] |
| 🥈 2e | **CTCG Koko Lopez** | 13-1-2 | [[Kennen, Heart of the Tempest]] |
| 🥉 3e | **MICE Squirtle** | 12-2-1 | [[Azir, Emperor of the Sands]] |
| 4e | **HXN Gonkra** | 12-2-1 | [[Kennen, Heart of the Tempest]] |
| 5e | **ECL Mosik** | 11-1-2 | [[Kennen, Heart of the Tempest]] |
| 6e | **DSG Prismaticism** | 11-2-1 | [[Rengar, Pridestalker]] |
| 7e | **Shaßßat Shalom** | 11-2-1 | [[Master Yi, Wuju Bladesman]] |
| 8e | **Hisoka** | 11-2-1 | [[Master Yi, Wuju Bladesman]] |

Cinq Légendes occupent les huit places, dont trois Kennen. **MICE Squirtle** finit troisième avec [[Azir, Emperor of the Sands|Azir]], après avoir gagné le dernier Regional Qualifier européen à Utrecht avec la même Légende.`,
  },
  {
    type: "text",
    id: "kennen",
    content: `## Kennen a dominé le week-end

Samedi, 270 joueurs jouaient Kennen, soit 12,7 % du tournoi. Dimanche, ils étaient encore 81 sur 379, soit 21,4 %. Sa part a donc gagné près de neuf points entre les deux jours : Kennen s'est mieux qualifié que la moyenne.

| Légende | Samedi | Part | Dimanche | Part |
|---|---:|---:|---:|---:|
| [[Kennen, Heart of the Tempest]] | 270 | 12,7 % | 81 | 21,4 % |
| [[Master Yi, Wuju Bladesman]] | 199 | 9,3 % | 47 | 12,4 % |
| [[Irelia, Blade Dancer]] | 164 | 7,7 % | 36 | 9,5 % |
| [[Rek'sai, Void Burrower]] | 109 | 5,1 % | 21 | 5,5 % |
| [[Nasus, Curator of the Sands]] | 103 | 4,8 % | 14 | 3,7 % |
| [[Rengar, Pridestalker]] | 96 | 4,5 % | 26 | 6,9 % |
| [[Ornn, Fire Below the Mountain]] | 42 | 2,0 % | 5 | 1,3 % |

Seuls cinq joueurs sur Ornn ont atteint le dimanche. L'un d'eux a gagné le tournoi.

Nasus passe de 4,8 % à 3,7 % entre les deux jours, et Draven de 4,2 % à 2,4 %. Rengar monte de 4,5 % à 6,9 % et place un joueur dans le Top 8.`,
  },
  {
    type: "text",
    id: "absents",
    content: `## Huit Légendes sans un seul pilote

Sur 2 131 joueurs, personne n'a joué Ahri, Darius, Garen, Jinx, Lee Sin, Leona, Volibear ni Yasuo. Ces huit Légendes d'Origines ne donnent plus droit à un prix Best-Of depuis la rotation, ce qui peut expliquer leur absence.

Miss Fortune, Sett et Teemo n'ont eu qu'un joueur chacun sur plus de deux mille.`,
  },
  { type: "separator", id: "sep1" },
  {
    type: "text",
    id: "decks-intro",
    content: `## Les deux decks de la finale

L'Ornn du champion et le Kennen de son finaliste.`,
  },
  deckBlock("data/decklists/ornn/barcelona-rq-1-mice-themanland.json", "deck-themanland", "1re place"),
  deckBlock("data/decklists/kennen/barcelona-rq-2-ctcg-koko-lopez.json", "deck-koko-lopez", "2e place"),
  {
    type: "text",
    id: "bestof",
    content: `## Best-Of : Riot change le vocabulaire

Riot a publié les listes des 34 Best-Of de Barcelone et précisé le sens de ce terme. Jusqu'ici, « Best-Of » pouvait désigner le résultat du joueur ou sa récompense. Avec les Showdown Series, il ne désigne plus que le résultat.

- **Best-Of** : finir premier avec sa Légende sur un tournoi. C'est la performance, rien d'autre.
- **Foil Plated Legend** : la carte gagnée en étant Best-Of sur un Regional Qualifier.
- **Foil Overnumber Plated Legend** : celle des futurs Regional Championships.
- **Plated Legend** : celle des Showdown Series, aussi disponible au mur de lots d'un Regional Qualifier.

Sur le site, la page [Best of](/decks?cat=bestof) liste le meilleur deck de chaque Légende, ce qui correspond au premier sens.`,
  },
  {
    type: "text",
    id: "conclusion",
    content: `## Un favori battu en finale

Kennen reste la référence du tournoi : la Légende compte 270 joueurs le samedi et trois places dans le Top 8. Elle perd pourtant la finale contre Ornn, joué par 2 % des participants. Master Yi et Irelia ont aussi mieux passé le samedi que la moyenne.

Barcelone a distribué les premiers billets pour les Regional Championships.

*Allan, Riftbound France*`,
  },
];

const data = {
  title: "RQ Barcelone : Ornn bat Kennen sur son propre terrain",
  slug: "recap-barcelone-rq-top8",
  excerpt:
    "MICE TheManLand gagne Barcelone avec Ornn, joué par 2 % des 2 224 participants. Retrouvez le Top 8, le partage du méta et les decks de la finale.",
  coverImage: "/img/articles/barcelone.webp",
  category: "tournoi",
  tags: ["Regional Qualifier", "Barcelone", "Vendetta", "Ornn", "Kennen"],
  blocks: blocks as object[],
  tournamentName: "Barcelona Regional Qualifier",
  tournamentDate: new Date("2026-08-23"),
  tournamentLocation: "Barcelone, Espagne",
  tournamentPlayerCount: 2224,
  published: true,
  featured: true,
  publishedAt: new Date("2026-08-26"),
};

const article = await prisma.article.upsert({
  where: { slug: data.slug },
  update: data,
  create: data,
});
console.log(`Article Barcelone seedé : /articles/${article.slug}`);
await prisma.$disconnect();
