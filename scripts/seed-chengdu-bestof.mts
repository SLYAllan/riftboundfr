/**
 * L'article Best-Of du National Open S4 de Chengdu (hexgate 289).
 *
 *   npx tsx --env-file=.env scripts/seed-chengdu-bestof.mts
 *
 * Jumeau de `seed-singapour-bestof.mts`, même règle : un Best-Of, c'est le
 * meilleur deck de CHAQUE Légende jouée. Rien n'est choisi à la main, le script
 * reprend les decks marqués `featured` par `mark-bestof-tournois.mts` et les
 * regroupe par rang de la tier list Vendetta.
 *
 * Deux différences, qui viennent de la source. Les listes viennent de hexgate, et
 * le slug d'un deck en base ne reprend pas l'`id` de son fichier : on les relie
 * par le rang, unique dans un tournoi. Et deux Légendes manquent, Rengar et
 * Master Yi, Wuju Master (`--sauf` au marquage) : la liste de leur n°1 porte deux
 * Champions différents du personnage, hexgate ne dit pas lequel a été désigné.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildDeckCode } from "./deck-code-article";
import { vendettaTier } from "./tier-tables";

const prisma = new PrismaClient();

const CONTEXTE = "S4 Chengdu National Open (2026-10-10)";
const PREFIXE = "hexgate-289-";

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
      if (meta && meta.legendName.toLowerCase() === d.legend.toLowerCase()) fichiers.push(d);
    }
  }
  if (fichiers.length !== featured.length) {
    throw new Error(
      `${featured.length} best-of en base mais ${fichiers.length} fichiers retrouvés : ne pas publier un article incomplet.`,
    );
  }

  // Le rang de chaque Légende, IMPORTÉ de la table Vendetta.
  const cle = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rangs = new Map<string, string>();
  for (const entree of vendettaTier) rangs.set(cle(entree.legendName), entree.tier);
  if (rangs.size === 0) throw new Error("Table Vendetta vide : ne pas publier un article sans classement.");
  // Une Légende absente de la table (Garen, trois joueurs sur tout Vendetta) a sa
  // section à elle : la ranger en Tier D lui inventerait un rang.
  const rangDe = (nom: string) => rangs.get(cle(nom)) ?? "hors";

  fichiers.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));

  const GROUPES: { tier: string; titre: string; intro: string }[] = [
    { tier: "S", titre: "Tier S", intro: "Les Légendes dont l'écart à la moyenne du format tient un test statistique. Elles convertissent mieux que le champ, et pas d'un peu." },
    { tier: "A", titre: "Tier A", intro: "Au-dessus de la moyenne, sans que l'échantillon permette de le prouver. Azir, le vainqueur de Chengdu, en fait partie." },
    { tier: "B", titre: "Tier B", intro: "Autour de la moyenne du format, 10 % de conversion. Ces Légendes rendent ce qu'on leur donne." },
    { tier: "C", titre: "Tier C", intro: "Sous la moyenne, ou trop peu jouées pour qu'on puisse trancher. Vex et Nasus, deuxième et troisième à Chengdu, sortent d'ici." },
    { tier: "D", titre: "Tier D", intro: "Les écarts en dessous les mieux établis du format. Les Légendes d'Origines y sont parce qu'elles n'ont plus de Best-Of à gagner, pas parce qu'elles sont faibles." },
    { tier: "hors", titre: "Hors tier list", intro: "Trop peu jouées en Vendetta pour avoir un rang dans la tier list." },
  ];

  const blocks: object[] = [
    {
      type: "text",
      id: "intro",
      content: `## Best of Chengdu, National Open

Le **National Open S4 de Chengdu** s'est joué le 10 octobre 2026 : **1 835 joueurs** inscrits. C'est le premier grand tournoi depuis le ban du 18 septembre, qui a retiré Stacked Deck et Ekko, Recurrent du format.

**Azir** l'emporte, alors que notre tier list Vendetta le classe en A. Vex finit deuxième et Nasus troisième, deux Légendes classées en C. Irelia est la Légende la plus jouée du tournoi, avec 194 joueurs, soit 10,6 % du champ, et place deux decks dans le Top 8.

Voici le meilleur deck de chaque Légende jouée à Chengdu : pour chacune, la liste la mieux classée. Les ${featured.length} sont regroupées par rang de la tier list Vendetta.

Les listes viennent de hexgate, le site chinois qui publie celles des tournois officiels. Il en donne 1 830 ; 1 695 sont publiées sur le site, les autres sont incomplètes ou ne disent pas quel Champion a été désigné. C'est ce qui prive Rengar et Master Yi, Wuju Master de leur meilleure liste : présenter la suivante l'aurait fait passer pour la meilleure.

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
    title: "Best of Chengdu : le meilleur deck de chaque Légende au National Open",
    slug: "best-of-national-open-chengdu",
    excerpt: `Les ${total} meilleures decklists, une par Légende, au National Open S4 de Chengdu (1 835 joueurs), le premier grand tournoi d'après le ban. Azir l'emporte, Vex et Nasus complètent le podium.`,
    coverImage: "/bannieres/azir.webp",
    category: "tournoi",
    tags: ["chengdu", "national-open", "best-of", "meta", "vendetta"],
    blocks,
    tournamentName: CONTEXTE,
    tournamentDate: new Date("2026-10-10"),
    tournamentLocation: "Chengdu, Chine",
    tournamentPlayerCount: 1835,
    published: true,
    featured: true,
    publishedAt: new Date("2026-10-17"),
  };

  const article = await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  console.log(`Article Best-Of seedé : /articles/${article.slug} — ${total} decks, ${blocks.length} blocs.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
