/**
 * L'article Best-Of du Regional Open S5 de Ningbo (hexgate 330).
 *
 *   npx tsx --env-file=.env scripts/seed-ningbo-bestof.mts
 *
 * Jumeau de `seed-chengdu-bestof.mts`, même règle : un Best-Of, c'est le meilleur
 * deck de CHAQUE Légende jouée. Rien n'est choisi à la main, le script reprend les
 * decks marqués `featured` par `mark-bestof-tournois.mts` et les regroupe par rang
 * de la tier list Radiance.
 *
 * Trois Légendes manquent, Mordekaiser, Master Yi, Wuju Master et Zed (`--sauf` au
 * marquage, choix d'Allan du 22 novembre) : la liste de leur n°1 n'a pas été
 * convertie, Champion ambigu ou liste incomplète chez hexgate.
 *
 * Le tournoi s'est joué deux jours avant le ban du 23 novembre : 24 des 45 listes
 * jouent une carte interdite. Elles restent telles qu'elles ont été jouées, la page
 * best-of nomme les cartes interdites sous chaque liste, et l'intro le dit avant.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildDeckCode } from "./deck-code-article";
import { radianceTier } from "./tier-tables";

const prisma = new PrismaClient();

const CONTEXTE = "S5 Ningbo Regional Open (2026-11-21)";
const PREFIXE = "hexgate-330-";

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

const ordinal = (n: number) => (n === 1 ? "1re" : `${n}e`);
const rang = (p: string | null) => (p ? parseInt(p, 10) : NaN);

async function main() {
  // Les decks marqués best-of en base, source unique.
  const featured = await prisma.deck.findMany({
    where: { tournamentContext: CONTEXTE, featured: true, published: true },
    select: { legendName: true, playerName: true, placement: true },
  });
  const parRang = new Map(featured.map((d) => [rang(d.placement), d]));
  if (parRang.size !== featured.length) throw new Error("Deux best-of au même rang : le rattachement par rang ne tient plus.");

  // Les fichiers de decklist, seule source des cartes. Le slug en base ne reprend
  // pas l'`id` du fichier : on les relie par le rang, unique dans un tournoi.
  const racine = "data/decklists";
  const fichiers: DeckJson[] = [];
  for (const dossier of readdirSync(racine)) {
    const p = join(racine, dossier);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p)) {
      if (!f.startsWith(PREFIXE) || !f.endsWith(".json")) continue;
      const d: DeckJson = JSON.parse(readFileSync(join(p, f), "utf-8"));
      const meta = d.placement ? parRang.get(d.placement) : undefined;
      if (meta && meta.legendName.toLowerCase() === d.legend.toLowerCase()) fichiers.push(d);
    }
  }
  if (fichiers.length !== featured.length) {
    throw new Error(
      `${featured.length} best-of en base mais ${fichiers.length} fichiers retrouvés : ne pas publier un article incomplet.`,
    );
  }

  // Le rang de chaque Légende, IMPORTÉ de la table Radiance.
  const cle = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rangs = new Map<string, string>();
  for (const entree of radianceTier) rangs.set(cle(entree.legendName), entree.tier);
  if (rangs.size === 0) throw new Error("Table Radiance vide : ne pas publier un article sans classement.");
  // Une Légende absente de la table (moins de 15 joueurs sur Radiance au 18 novembre)
  // a sa section à elle : la ranger en Tier D lui inventerait un rang.
  const rangDe = (nom: string) => rangs.get(cle(nom)) ?? "hors";

  fichiers.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));

  const GROUPES: { tier: string; titre: string; intro: string }[] = [
    { tier: "S", titre: "Tier S", intro: "Les deux Légendes dont l'écart à la moyenne du format tient un test statistique. Kennen gagne Ningbo, Riven y place deux decks dans le Top 8." },
    { tier: "A", titre: "Tier A", intro: "Classées A dans notre tier list Radiance, sans que leur écart à la moyenne tienne le test." },
    { tier: "B", titre: "Tier B", intro: "Autour de la moyenne du format, 10 % de conversion. Lillia, deuxième à Ningbo, et Master Yi, Wuju Bladesman, sixième, sortent d'ici." },
    { tier: "C", titre: "Tier C", intro: "Sous la moyenne, ou trop peu jouées pour qu'on puisse trancher. Kha'Zix, quatrième à Ningbo, en fait partie." },
    { tier: "D", titre: "Tier D", intro: "Les écarts en dessous les mieux établis du format, et des Légendes encore trop peu jouées pour être lues." },
    { tier: "hors", titre: "Hors tier list", intro: "Trop peu jouées en Radiance pour avoir un rang dans la tier list." },
  ];

  const blocks: object[] = [
    {
      type: "text",
      id: "intro",
      content: `## Best of Ningbo, Regional Open

Le **Regional Open S5 de Ningbo** s'est joué le 21 novembre 2026 : **1 280 joueurs** inscrits. C'est le premier grand tournoi chinois de Radiance, et le dernier joué avant le ban du 23 novembre.

**Kennen** l'emporte et place trois decks dans le Top 8, à la première, la cinquième et la septième place. Lillia finit deuxième, Riven troisième, Kha'Zix quatrième. Riven reste la Légende la plus jouée : 237 joueurs, près d'un sur cinq, et deux places dans le Top 8.

Voici le meilleur deck de chaque Légende jouée à Ningbo : pour chacune, la liste la mieux classée. Les ${featured.length} sont regroupées par rang de la tier list Radiance.

**24 de ces listes jouent une carte interdite depuis le 23 novembre**, Riven, Broken Blade, Zhonya's Hourglass ou Star Spring en tête. Elles sont publiées telles qu'elles ont été jouées, et chaque liste nomme ses cartes interdites : pour jouer aujourd'hui, il faut les remplacer.

Les listes viennent de hexgate, le site chinois qui publie celles des tournois officiels. Il en donne 1 280 ; 1 204 sont publiées sur le site, les autres sont incomplètes ou ne disent pas quel Champion a été désigné. C'est ce qui prive Mordekaiser, Master Yi, Wuju Master et Zed de leur meilleure liste : présenter la suivante l'aurait fait passer pour la meilleure.

Toutes ces listes viennent d'un tournoi chinois : le méta européen peut s'en écarter.

> 💡 Survolez les noms de cartes surlignés pour voir la carte. Sur mobile, touchez-les pour ouvrir la fiche.`,
    },
  ];

  let total = 0;
  for (const g of GROUPES) {
    const lot = fichiers.filter((d) => rangDe(d.legend) === g.tier);
    if (!lot.length) continue;
    blocks.push({ type: "separator", id: `sep-${g.tier}` });
    blocks.push({ type: "text", id: `titre-${g.tier}`, content: `## ${g.titre}\n\n${g.intro}` });
    for (const d of lot) {
      blocks.push({
        type: "decklist",
        id: `deck-${d.id}`,
        deckCode: buildDeckCode(d),
        deckName: `${d.legend.split(",")[0]} · ${d.player}`,
        legendName: d.legend,
        playerName: d.player,
        context: `${d.placement ? `${ordinal(d.placement)} place` : "classement inconnu"} · ${d.legend}`,
      });
      total++;
    }
  }

  const data = {
    title: "Best of Ningbo : le meilleur deck de chaque Légende au Regional Open",
    slug: "best-of-regional-open-ningbo",
    excerpt: `Les ${total} meilleures decklists, une par Légende, au Regional Open S5 de Ningbo (1 280 joueurs), le dernier grand tournoi d'avant le ban du 23 novembre. Kennen l'emporte, Lillia et Riven complètent le podium.`,
    // Le vainqueur sur scène, capture de la retransmission bilibili du 21 novembre,
    // fournie par Allan le 23.
    coverImage: "/img/articles/ningbo.webp",
    category: "tournoi",
    tags: ["ningbo", "regional-open", "best-of", "meta", "radiance"],
    blocks,
    tournamentName: CONTEXTE,
    tournamentDate: new Date("2026-11-21"),
    tournamentLocation: "Ningbo, Chine",
    tournamentPlayerCount: 1280,
    published: true,
    featured: true,
    publishedAt: new Date("2026-11-23"),
  };

  const article = await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  console.log(`Article Best-Of seedé : /articles/${article.slug} — ${total} decks, ${blocks.length} blocs.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
