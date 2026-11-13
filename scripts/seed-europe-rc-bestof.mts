/**
 * L'article Best-Of du Regional Championship d'Europe (Stuttgart, 6 au 8 novembre 2026).
 *
 *   npx tsx --env-file=.env scripts/seed-europe-rc-bestof.mts
 *
 * Jumeau de `seed-singapour-bestof.mts`, même règle : un Best-Of, c'est le meilleur
 * deck de CHAQUE Légende jouée. Rien n'est choisi à la main, le script reprend les
 * decks marqués `featured` par `mark-bestof-tournois.mts` et les regroupe par rang
 * de la tier list Radiance.
 *
 * Deux sources de listes : l'article officiel de Riot (`europe-rc-officiel.md`,
 * 17 « Legend Rank #1 », Top 8 compris) et le relevé du tournoi pour cinq Légendes
 * dont le n°1 a publié sa liste sans figurer chez Riot. Trois Légendes sont écartées
 * par `--sauf` (Master Yi, Wuju Bladesman, Lucian et Viktor) : le classement complet
 * dit que leur n°1 n'a pas publié de liste complète, et la mieux classée des listes
 * publiées serait un faux best-of.
 *
 * Le nombre de listes touchées par le ban du 23 novembre est COMPTÉ ici, sur les
 * cartes des fichiers : écrit à la main, il serait faux au premier relevé.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { radianceTier } from "./tier-tables";
import { buildDeckCode } from "./deck-code-article";
import { cartesInterdites } from "../src/lib/banned-cards";

const prisma = new PrismaClient();

const CONTEXTE = "Europe Regional Championship";
const PREFIXE = "europe-rc-";

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

const ordinal = (n: number) => (n === 1 ? "1re" : `${n}e`);
const rang = (p: string | null) => (p ? parseInt(p, 10) : NaN);
const cle = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");

async function main() {
  // Les decks marqués best-of en base, source unique.
  const featured = await prisma.deck.findMany({
    where: { tournamentContext: CONTEXTE, featured: true, published: true },
    select: { legendName: true, playerName: true, placement: true },
  });
  if (featured.length === 0) throw new Error("Aucun best-of en base : lancer mark-bestof-tournois.mts d'abord.");
  const parRang = new Map(featured.map((d) => [rang(d.placement), d]));
  if (parRang.size !== featured.length) throw new Error("Deux best-of au même rang : le rattachement par rang ne tient plus.");

  // Les fichiers de decklist, seule source des cartes.
  const racine = "data/decklists";
  const fichiers: DeckJson[] = [];
  for (const dossier of readdirSync(racine)) {
    const p = join(racine, dossier);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p)) {
      if (!f.startsWith(PREFIXE) || !f.endsWith(".json")) continue;
      const d: DeckJson = JSON.parse(readFileSync(join(p, f), "utf-8"));
      const meta = d.placement ? parRang.get(d.placement) : undefined;
      if (meta && cle(meta.legendName) === cle(d.legend)) fichiers.push(d);
    }
  }
  if (fichiers.length !== featured.length) {
    throw new Error(
      `${featured.length} best-of en base mais ${fichiers.length} fichiers retrouvés : ne pas publier un article incomplet.`,
    );
  }

  // Le rang de chaque Légende, IMPORTÉ de la table Radiance. Une Légende sous le
  // seuil de la table (Ornn, Teemo, Poppy) a sa section à elle : la ranger en
  // Tier D lui inventerait un rang.
  const rangs = new Map<string, string>();
  for (const entree of radianceTier) rangs.set(cle(entree.legendName), entree.tier);
  if (rangs.size === 0) throw new Error("Table Radiance vide : ne pas publier un article sans classement.");
  const rangDe = (nom: string) => rangs.get(cle(nom)) ?? "hors";

  fichiers.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));

  const cartesDe = (d: DeckJson) => [
    ...(d.champion ? [d.champion] : []),
    ...d.mainDeck.map((c) => c.name),
    ...d.battlefields,
    ...(d.sideDeck ?? []).map((c) => c.name),
  ];
  const touchees = fichiers.filter((d) => cartesInterdites(cartesDe(d)).length > 0).length;
  const total = fichiers.length;

  const GROUPES: { tier: string; titre: string; intro: string }[] = [
    { tier: "S", titre: "Tier S", intro: "Les Légendes dont l'écart au-dessus de la moyenne du format tient un test statistique. Ce sont aussi les decks que la ban list du 23 novembre vise en premier." },
    { tier: "A", titre: "Tier A", intro: "Au-dessus de la moyenne, sans que l'échantillon permette de le prouver." },
    { tier: "B", titre: "Tier B", intro: "Autour de la moyenne du format. Ces Légendes rendent ce qu'on leur donne." },
    { tier: "C", titre: "Tier C", intro: "Sous la moyenne, ou trop peu jouées pour qu'on puisse trancher." },
    { tier: "D", titre: "Tier D", intro: "Les écarts en dessous les mieux établis du format." },
    { tier: "hors", titre: "Hors tier list", intro: "Trop peu jouées sur Radiance pour avoir un rang dans la tier list." },
  ];

  const blocks: object[] = [
    {
      type: "text",
      id: "intro",
      content: `## Best of Stuttgart, Regional Championship d'Europe

Le premier **Regional Championship** de Riftbound s'est joué du 6 au 8 novembre 2026 à Stuttgart, sur invitation : il fallait un Top 64 de Regional Qualifier pour y entrer. **315 inscrits**, deux semaines après la sortie de Radiance.

ASC Evansrhim l'emporte avec **Kennen**, au bout d'un Top 8 de quatre Riven, trois Kennen et une Kai'Sa. **Riven** était partout : 126 joueurs le premier jour, 40,9 % du champ, puis 49 % le second. Kai'Sa (16,9 %) et Kennen (14,6 %) suivent, et à elles trois ces Légendes font près de trois decks sur quatre.

Voici le meilleur deck de chaque Légende : pour chacune, la liste la mieux classée. Il y en a ${total}, regroupées par rang de la tier list Radiance. C'est moins qu'à un Regional Qualifier : Riot a réduit le poids des prix Best-Of sur ce tournoi, et peu de joueurs sont venus avec une Légende rare. Master Yi, Lucian et Viktor manquent, leur joueur le mieux classé n'ayant pas publié sa liste complète.

**Avant de copier une liste, un détour par la ban list.** Riot a annoncé dix interdictions le 13 novembre, en vigueur le lundi 23 novembre 2026. ${touchees} de ces ${total} listes jouent au moins une des cartes visées, à commencer par celles du Top 8. Elles restent affichées telles qu'elles ont été jouées ; les dix cartes sont sur la page [ban list](/guides/ban-list).

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
    },
  ];

  for (const g of GROUPES) {
    const lot = fichiers.filter((d) => rangDe(d.legend) === g.tier);
    if (!lot.length) continue;
    blocks.push({ type: "separator", id: `sep-${g.tier}` });
    blocks.push({ type: "text", id: `titre-${g.tier}`, content: `## ${g.titre}\n\n${g.intro}` });
    for (const d of lot) {
      const meta = parRang.get(d.placement!)!;
      blocks.push({
        type: "decklist",
        id: `deck-${d.id}`,
        deckCode: buildDeckCode(d),
        deckName: `${d.legend.split(",")[0]} · ${d.player}`,
        legendName: d.legend,
        playerName: d.player,
        context: `${ordinal(d.placement!)} place · ${meta.legendName}`,
      });
    }
  }

  const data = {
    title: "Best of Stuttgart : le meilleur deck de chaque Légende au Regional Championship d'Europe",
    slug: "best-of-regional-championship-europe",
    excerpt: `Les ${total} meilleures decklists, une par Légende, au Regional Championship d'Europe à Stuttgart. ASC Evansrhim champion avec Kennen, devant un Top 8 pris pour moitié par Riven.`,
    coverImage: "/img/articles/stuttgart.webp",
    category: "tournoi",
    tags: ["stuttgart", "regional-championship", "best-of", "meta", "radiance"],
    blocks,
    tournamentName: CONTEXTE,
    tournamentDate: new Date("2026-11-08"),
    tournamentLocation: "Stuttgart, Allemagne",
    tournamentPlayerCount: 315,
    published: true,
    featured: true,
    publishedAt: new Date("2026-11-13"),
  };

  const article = await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  console.log(`Article Best-Of seedé : /articles/${article.slug}, ${total} decks dont ${touchees} avec une carte du ban, ${blocks.length} blocs.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
