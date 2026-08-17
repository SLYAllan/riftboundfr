/**
 * Ce que jouent vraiment les Légendes, calculé sur les decks de tournoi en base.
 *
 * Les fiches de `data/fiches/` ont été écrites à la main à l'époque de
 * Déchaînement : leurs cartes clés, leurs champions et leurs terrains décrivent
 * un format qui n'existe plus. Ce script relit les decklists réelles et sort les
 * chiffres qui remplacent ces sections, sans jamais inventer une carte.
 *
 *   npx tsx --env-file=.env scripts/fiches-stats.mts [set] [minDecks] > sortie.json
 *   npx tsx --env-file=.env scripts/fiches-stats.mts --debug
 *
 * Une carte n'est retenue que si elle apparaît dans au moins 30 % des listes :
 * en dessous, c'est un choix personnel, pas le cœur d'un archétype.
 */
import { PrismaClient } from "@prisma/client";

export type StatsLegende = {
  decks: number;
  top8: number;
  titres: number;
  conversion: number;
  tournois: number;
  meilleuresPlaces: { placement: string | null; player: string | null; tournament: string | null }[];
  cartes: { nom: string; part: number; copies: number }[];
  champions: { nom: string; part: number; copies: number }[];
  terrains: { nom: string; part: number }[];
  runes: { nom: string; part: number; copies: number }[];
};

const prisma = new PrismaClient();
const set = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "Vendetta";
const minDecks = Number(process.argv[3] ?? 10);

const decks = await prisma.deck.findMany({
  where: { published: true, setTag: set, NOT: { tournamentContext: null } },
  select: {
    id: true,
    legendName: true,
    placement: true,
    playerName: true,
    tournamentContext: true,
    cards: {
      select: {
        quantity: true,
        section: true,
        card: { select: { name: true, type: true, supertype: true, domains: true } },
      },
    },
  },
});

if (process.argv.includes("--debug")) {
  const types = new Map<string, number>();
  const sections = new Map<string, number>();
  for (const d of decks)
    for (const c of d.cards) {
      const cle = `${c.card.type}${c.card.supertype ? ` / ${c.card.supertype}` : ""}`;
      types.set(cle, (types.get(cle) ?? 0) + 1);
      sections.set(c.section, (sections.get(c.section) ?? 0) + 1);
    }
  console.log(`${decks.length} decks ${set}`);
  console.log("types :", [...types].sort((a, b) => b[1] - a[1]));
  console.log("sections :", [...sections]);
  process.exit(0);
}

/** Place d'un deck, ou l'infini quand riftdecks ne la donne pas : ça ne doit pas passer devant un vrai Top 8. */
const place = (p: string | null): number => {
  const n = p ? parseInt(p.match(/\d+/)?.[0] ?? "", 10) : NaN;
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

const mediane = (xs: number[]): number => {
  const t = [...xs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : (t[m - 1] + t[m]) / 2;
};

type Compte = { listes: number; copies: number[]; type: string; supertype: string | null };

const parLegende = new Map<string, typeof decks>();
for (const d of decks) {
  const l = parLegende.get(d.legendName) ?? [];
  l.push(d);
  parLegende.set(d.legendName, l);
}

const sortie: Record<string, unknown> = {};

for (const [legende, lot] of [...parLegende].sort((a, b) => b[1].length - a[1].length)) {
  if (lot.length < minDecks) continue;

  const cartes = new Map<string, Compte>();
  for (const d of lot) {
    // Une carte comptée une fois par deck, même si elle est en main ET en réserve.
    const vues = new Map<string, number>();
    for (const c of d.cards) {
      if (c.card.type === "Legend") continue;
      // La réserve est un choix de match-up, pas le cœur du deck : elle fausserait les parts.
      if (c.section === "side") continue;
      vues.set(c.card.name, (vues.get(c.card.name) ?? 0) + c.quantity);
      if (!cartes.has(c.card.name))
        cartes.set(c.card.name, { listes: 0, copies: [], type: c.card.type, supertype: c.card.supertype });
    }
    for (const [nom, q] of vues) {
      const e = cartes.get(nom)!;
      e.listes++;
      e.copies.push(q);
    }
  }

  const lignes = [...cartes.entries()]
    .map(([nom, e]) => ({
      nom,
      type: e.type,
      supertype: e.supertype,
      part: e.listes / lot.length,
      copies: mediane(e.copies),
    }))
    .filter((c) => c.part >= 0.3)
    .sort((a, b) => b.part - a.part || b.copies - a.copies);

  const estChampion = (c: (typeof lignes)[number]) => c.supertype === "Champion";
  const estTerrain = (c: (typeof lignes)[number]) => c.type === "Battlefield";
  const estRune = (c: (typeof lignes)[number]) => c.type === "Rune";

  const top8 = lot.filter((d) => place(d.placement) <= 8).length;
  const titres = lot.filter((d) => place(d.placement) === 1).length;

  sortie[legende] = {
    decks: lot.length,
    top8,
    titres,
    conversion: +((top8 / lot.length) * 100).toFixed(1),
    tournois: new Set(lot.map((d) => d.tournamentContext)).size,
    meilleuresPlaces: lot
      .filter((d) => Number.isFinite(place(d.placement)))
      .sort((a, b) => place(a.placement) - place(b.placement))
      .slice(0, 5)
      .map((d) => ({ placement: d.placement, player: d.playerName, tournament: d.tournamentContext })),
    cartes: lignes
      .filter((c) => !estChampion(c) && !estTerrain(c) && !estRune(c))
      .slice(0, 14)
      .map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
    champions: lignes.filter(estChampion).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
    terrains: lignes.filter(estTerrain).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100) })),
    runes: lignes.filter(estRune).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
  };
}

console.log(JSON.stringify(sortie, null, 2));
await prisma.$disconnect();
