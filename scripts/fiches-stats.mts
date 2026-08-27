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
import { bilanParLegende, chargerCorpus } from "./corpus-tournois";

export type StatsLegende = {
  /** Listes publiées : ce sur quoi les CARTES sont comptées. */
  decks: number;
  /** Vrai quand les résultats portent sur toutes les ères et non sur le set demandé. */
  toutesEres?: boolean;
  /** Joueurs classés, listes publiées ou non : ce sur quoi les RÉSULTATS le sont. */
  joueurs: number;
  coupe: number;
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

/**
 * Les résultats se comptent sur LE corpus partagé (`corpus-tournois.mts`), le
 * même que la tier list. Chacun avait le sien : la tier list donnait 802 joueurs
 * à Ahri, la fiche 283, et les deux pages du site se contredisaient.
 *
 * `classement` porte le set demandé, `classementToutesEres` toutes les ères. Le
 * second sert aux Légendes qui ne sont plus jouées dans le format en cours : leur
 * fiche restait sinon figée sur un ancien relevé, sans le dire.
 */
const classement = bilanParLegende((await chargerCorpus(set)).places);
const classementToutesEres = bilanParLegende((await chargerCorpus(null)).places);

const parLegende = new Map<string, typeof decks>();
for (const d of decks) {
  const l = parLegende.get(d.legendName) ?? [];
  l.push(d);
  parLegende.set(d.legendName, l);
}

const sortie: Record<string, unknown> = {};

for (const [legende, lot] of [...parLegende].sort((a, b) => b[1].length - a[1].length)) {
  if (lot.length < minDecks) {
    const global = classementToutesEres.get(legende);
    if (!global) continue;
    sortie[legende] = {
      decks: lot.length,
      toutesEres: true,
      joueurs: global.joueurs,
      coupe: global.coupe,
      titres: global.titres,
      conversion: +((global.coupe / global.joueurs) * 100).toFixed(1),
      tournois: global.tournois,
      meilleuresPlaces: global.meilleures,
      // Aucune carte : sous le seuil, un « cœur » n'est qu'une coïncidence, et
      // `fiches-maj` ne touche pas aux cartes quand la liste est vide.
      cartes: [], champions: [], terrains: [], runes: [],
    };
    continue;
  }

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

  // Les RÉSULTATS se comptent sur le classement complet, jamais sur `lot` :
  // `lot` ne contient que les listes publiées, et ce sont les joueurs qui
  // performent qui publient. Sur Barcelone, 106 listes pour 2 127 classés. Les
  // CARTES, elles, restent comptées sur `lot` : on ne peut pas lire le deck d'un
  // joueur qui n'a pas envoyé sa liste.
  const cl = classement.get(legende);
  const joueurs = cl?.joueurs ?? lot.length;
  const coupe = cl?.coupe ?? 0;
  const titres = cl?.titres ?? lot.filter((d) => place(d.placement) === 1).length;

  sortie[legende] = {
    decks: lot.length,
    joueurs,
    coupe,
    titres,
    conversion: +((coupe / joueurs) * 100).toFixed(1),
    tournois: cl?.tournois ?? new Set(lot.map((d) => d.tournamentContext)).size,
    meilleuresPlaces: (cl?.meilleures ?? lot
      .filter((d) => Number.isFinite(place(d.placement)))
      .sort((a, b) => place(a.placement) - place(b.placement))
      .slice(0, 5)
      .map((d) => ({ placement: d.placement, player: d.playerName, tournament: d.tournamentContext }))),
    cartes: lignes
      .filter((c) => !estChampion(c) && !estTerrain(c) && !estRune(c))
      .slice(0, 14)
      .map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
    champions: lignes.filter(estChampion).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
    terrains: lignes.filter(estTerrain).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100) })),
    runes: lignes.filter(estRune).map((c) => ({ nom: c.nom, part: Math.round(c.part * 100), copies: c.copies })),
  };
}

// Les Légendes qui n'ont AUCUNE liste dans le format en cours n'entrent jamais
// dans la boucle ci-dessus, qui part des decks du set. Garen en est le cas :
// zéro deck Vendetta, donc sa fiche restait figée sur un vieux relevé. On leur
// donne ici leur bilan toutes ères, comme aux Légendes sous le seuil.
for (const [legende, global] of classementToutesEres) {
  if (sortie[legende]) continue;
  sortie[legende] = {
    decks: 0,
    toutesEres: true,
    joueurs: global.joueurs,
    coupe: global.coupe,
    titres: global.titres,
    conversion: +((global.coupe / global.joueurs) * 100).toFixed(1),
    tournois: global.tournois,
    meilleuresPlaces: global.meilleures,
    cartes: [], champions: [], terrains: [], runes: [],
  };
}

console.log(JSON.stringify(sortie, null, 2));
await prisma.$disconnect();
