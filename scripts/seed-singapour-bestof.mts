/**
 * L'article Best-Of du Regional Qualifier de Singapour.
 *
 *   npx tsx scripts/seed-singapour-bestof.mts
 *
 * Jumeau de `seed-barcelone-bestof.mts`, même règle : un Best-Of, c'est le
 * meilleur deck de CHAQUE Légende jouée. Rien n'est choisi à la main, le script
 * reprend les decks marqués `featured` par `mark-bestof-tournois.mts` et les
 * regroupe par rang de la tier list Vendetta.
 *
 * Une différence avec Barcelone, et elle vient de la source : les 38 listes
 * viennent toutes de l'article officiel de Riot, relevé dans
 * `singapore-rq-officiel.md`, qui publie la liste du n°1 de CHAQUE Légende. Aucune
 * Légende ne manque donc pour cause de liste non envoyée : les 34 marquées
 * best-of sont exactement les 34 « Legend Rank #1 » de Riot, recoupées une à une.
 * Pas d'option `--sauf` ici.
 *
 * Le classement complet vient de riftdecks (`singapore-rq-classement/`) et nourrit
 * le corpus des tier lists ; les listes riftdecks, elles, ne sont pas importées.
 *
 * Les intitulés de rang ne comptent AUCUNE Légende. Celui de Barcelone disait
 * « les deux Légendes » du Tier S ; elles sont trois depuis Wuhan, et le texte
 * est resté faux sans que rien ne le signale. Une phrase qui ne compte pas ne
 * peut pas vieillir.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { vendettaTier } from "./tier-tables";
import { buildDeckCode } from "./deck-code-article";
import { join } from "node:path";

const prisma = new PrismaClient();

const CONTEXTE = "Singapore Regional Qualifier";
const PREFIXE = "singapore-rq-";

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string;
  placement: number | null;
  mainDeck: { name: string; quantity: number; type?: string }[];
  runes: Record<string, number>; battlefields: string[];
  sideDeck?: { name: string; quantity: number }[];
};

const ordinal = (n: number) => (n === 1 ? "1re" : `${n}e`);

async function main() {
  // Les decks marqués best-of en base, source unique.
  const featured = await prisma.deck.findMany({
    where: { tournamentContext: CONTEXTE, featured: true, published: true },
    select: { slug: true, legendName: true, playerName: true, placement: true },
  });
  const parSlug = new Map(featured.map((d) => [d.slug, d]));

  // Les fichiers de decklist, seule source des cartes.
  const racine = "data/decklists";
  const fichiers: DeckJson[] = [];
  for (const dossier of readdirSync(racine)) {
    const p = join(racine, dossier);
    if (!statSync(p).isDirectory()) continue;
    for (const f of readdirSync(p)) {
      if (!f.startsWith(PREFIXE) || !f.endsWith(".json")) continue;
      const d: DeckJson = JSON.parse(readFileSync(join(p, f), "utf-8"));
      if (parSlug.has(d.id)) fichiers.push(d);
    }
  }
  if (fichiers.length !== featured.length) {
    throw new Error(
      `${featured.length} best-of en base mais ${fichiers.length} fichiers retrouvés : ne pas publier un article incomplet.`,
    );
  }

  // Le rang de chaque Légende, IMPORTÉ de la table Vendetta. Relire du texte
  // dans le source d'un autre script a déjà fait tomber les 38 decks de
  // Barcelone en Tier D, sans erreur pour le dire.
  const cle = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");
  const rangs = new Map<string, string>();
  for (const entree of vendettaTier) rangs.set(cle(entree.legendName), entree.tier);
  if (rangs.size === 0) throw new Error("Table Vendetta vide : ne pas publier un article sans classement.");

  // Une Légende absente de la table tomberait en Tier D sans un mot. Le dire.
  const horsTable = fichiers.filter((d) => !rangs.has(cle(d.legend)));
  if (horsTable.length) {
    throw new Error(`Légendes absentes de la table Vendetta : ${horsTable.map((d) => d.legend).join(", ")}`);
  }
  const rangDe = (nom: string) => rangs.get(cle(nom))!;

  fichiers.sort((a, b) => (a.placement ?? 9999) - (b.placement ?? 9999));

  const GROUPES: { tier: string; titre: string; intro: string }[] = [
    { tier: "S", titre: "Tier S", intro: "Les Légendes dont l'écart à la moyenne du format tient un test statistique. Elles convertissent mieux que le champ, et pas d'un peu." },
    { tier: "A", titre: "Tier A", intro: "Au-dessus de la moyenne, sans que l'échantillon permette de le prouver. Des choix solides, souvent moins joués que le haut du tableau." },
    { tier: "B", titre: "Tier B", intro: "Autour de la moyenne du format, 10 % de conversion. Ces Légendes rendent ce qu'on leur donne." },
    { tier: "C", titre: "Tier C", intro: "Sous la moyenne, ou trop peu jouées pour qu'on puisse trancher. Akali, la championne de Singapour, sort d'ici." },
    { tier: "D", titre: "Tier D", intro: "Les écarts en dessous les mieux établis du format. Les Légendes d'Origines y sont parce qu'elles n'ont plus de Best-Of à gagner, pas parce qu'elles sont faibles." },
  ];

  const blocks: object[] = [
    {
      type: "text",
      id: "intro",
      content: `## Best of Singapour, Regional Qualifier

Le **Regional Qualifier de Singapour** s'est joué du 4 au 6 septembre 2026 au Singapore Expo. **1 893 joueurs** le samedi, **303** encore là le dimanche. C'est l'avant-dernier Regional Qualifier de l'année.

Gorica l'emporte avec **Akali**, que notre tier list Vendetta classe en C. Kennen, lui, prend quatre des huit places du Top 8 après avoir été la Légende la plus jouée les deux jours : 11,5 % du champ le samedi, 19,3 % le dimanche. Les quatre autres places reviennent à Master Yi, Wuju Bladesman (deux fois), à Fiora et à Akali.

Voici le meilleur deck de chaque Légende jouée à Singapour : pour chacune, la liste la mieux classée. Les 34 sont regroupées par rang de la tier list Vendetta.

Les listes viennent de l'article officiel de Riot, qui publie la meilleure de chaque Légende : aucune ne manque.

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
      const meta = parSlug.get(d.id)!;
      blocks.push({
        type: "decklist",
        id: `deck-${d.id}`,
        deckCode: buildDeckCode(d),
        deckName: `${d.legend.split(",")[0]} · ${d.player}`,
        legendName: d.legend,
        playerName: d.player,
        context: `${d.placement ? `${ordinal(d.placement)} place` : "classement inconnu"} · ${meta.legendName}`,
      });
      total++;
    }
  }

  const data = {
    title: "Best of Singapour : le meilleur deck de chaque Légende",
    slug: "best-of-singapour-rq",
    excerpt: `Les ${total} meilleures decklists, une par Légende, au Regional Qualifier de Singapour (1 893 joueurs). Gorica champion avec Akali, devant un Top 8 pris pour moitié par Kennen.`,
    coverImage: "/img/articles/singapore.webp",
    category: "tournoi",
    tags: ["singapour", "rq", "best-of", "meta", "vendetta"],
    blocks,
    tournamentName: CONTEXTE,
    tournamentDate: new Date("2026-09-06"),
    tournamentLocation: "Singapour",
    tournamentPlayerCount: 1893,
    published: true,
    featured: true,
    publishedAt: new Date("2026-09-11"),
  };

  const article = await prisma.article.upsert({ where: { slug: data.slug }, update: data, create: data });
  console.log(`Article Best-Of seedé : /articles/${article.slug} — ${total} decks, ${blocks.length} blocs.`);
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
