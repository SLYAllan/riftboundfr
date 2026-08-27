/**
 * LE corpus de places de tournoi. Une seule définition, pour tout le monde.
 *
 * `tier-stats.mts` et `fiches-stats.mts` le calculaient chacun de leur côté, et
 * ils ne tombaient pas d'accord : la tier list donnait 802 joueurs à Ahri, la
 * fiche 283, parce que l'une fusionnait les deux sources et l'autre non. Deux
 * pages du site affichaient alors deux chiffres pour la même Légende.
 *
 * La règle, en un endroit :
 *
 *  - Pour un tournoi dont le CLASSEMENT COMPLET est relevé
 *    (`scripts/scrape-classement.sh` puis `classements-tournois.mts`), on prend
 *    le classement : tous les joueurs y sont, decklist publiée ou non.
 *  - Pour les autres, on prend les listes publiées, mais seulement si le tournoi
 *    en publie au moins 90 %. En dessous, on ne mesure plus le tournoi, on
 *    mesure son top : Utrecht ne publie que 3 % de ses listes.
 *
 * Ne prendre QUE le classement serait aussi faux que de ne prendre que les
 * listes : sur Unleashed, les cinq tournois relevés sont tous occidentaux, et le
 * corpus deviendrait un méta occidental là où il était un méta chinois.
 */
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

export interface Place {
  contexte: string;
  set: string;
  rang: number;
  player: string | null;
  legend: string | null;
}

export interface Corpus {
  places: Place[];
  /** Ce qu'on peut écrire dans un document pour dire d'où viennent les chiffres. */
  source: string;
  /** Tournois trop peu publiés, écartés faute de pouvoir les mesurer. */
  ecartes: string[];
  releves: number;
  publies: number;
}

const COUVERTURE_MINIMALE = 0.9;

/**
 * Les clés de `tournament-flags.ts` ne sont pas toujours le contexte exact
 * (« Sydney RQ 2026 » contre « RQ Sydney 2026 ») : on retombe sur une
 * correspondance par inclusion, comme le fait `getTournamentInfo`.
 */
function joueursDeclares(contexte: string, drapeaux: Map<string, number>): number | null {
  const bas = contexte.toLowerCase();
  for (const [cle, n] of drapeaux) if (bas.includes(cle.toLowerCase())) return n;
  return null;
}

const rangDe = (placement: string | null): number => {
  const n = placement ? parseInt(placement.match(/\d+/)?.[0] ?? "", 10) : NaN;
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
};

/** `set` à `null` pour toutes les ères confondues. */
export async function chargerCorpus(set: string | null): Promise<Corpus> {
  let corpus: Place[] = [];
  try {
    corpus = JSON.parse(readFileSync("data/tournaments/classements.json", "utf8"));
  } catch {
    corpus = [];
  }
  const duCorpus = corpus.filter((p) => (set === null || p.set === set) && p.legend);
  const releves = new Set(duCorpus.map((p) => p.contexte));

  const drapeaux = new Map(
    [...readFileSync("src/lib/tournament-flags.ts", "utf8")
      .matchAll(/"([^"]+)":\s*\{[^}]*playerCount:\s*(\d+)/g)]
      .map((m) => [m[1], Number(m[2])] as const),
  );

  const prisma = new PrismaClient();
  const decks = await prisma.deck.findMany({
    where: { published: true, NOT: { tournamentContext: null }, ...(set ? { setTag: set } : {}) },
    select: { legendName: true, placement: true, tournamentContext: true, setTag: true },
  });
  await prisma.$disconnect();

  const parTournoi = new Map<string, number>();
  for (const d of decks) parTournoi.set(d.tournamentContext!, (parTournoi.get(d.tournamentContext!) ?? 0) + 1);

  const ecartes: string[] = [];
  const gardes = new Set<string>();
  for (const [ctx, n] of parTournoi) {
    if (releves.has(ctx)) continue; // déjà couvert par le classement complet
    const joueurs = joueursDeclares(ctx, drapeaux);
    if (joueurs && n / joueurs < COUVERTURE_MINIMALE) {
      ecartes.push(`${ctx} (${n} listes sur ${joueurs} joueurs, ${Math.round((n / joueurs) * 100)} %)`);
      continue;
    }
    gardes.add(ctx);
  }

  const desListes: Place[] = decks
    .filter((d) => gardes.has(d.tournamentContext!) && Number.isFinite(rangDe(d.placement)))
    .map((d) => ({
      contexte: d.tournamentContext!,
      set: d.setTag,
      rang: rangDe(d.placement),
      player: null,
      legend: d.legendName,
    }));

  const source =
    releves.size && gardes.size
      ? `${releves.size} tournois au classement complet + ${gardes.size} tournois publiés à plus de 90 %`
      : releves.size
        ? `${releves.size} tournois au classement complet`
        : `${gardes.size} tournois publiés à plus de 90 % (aucun classement relevé pour ce set)`;

  return { places: [...duCorpus, ...desListes], source, ecartes, releves: releves.size, publies: gardes.size };
}

/**
 * La coupe est PROPORTIONNELLE, 10 % du champ de chaque tournoi, jamais un Top 8
 * fixe : un Top 8 sur 128 joueurs vaut 6,3 % du champ, sur 2 127 il en vaut 0,4.
 * Les mêler revenait à noter les City Challenge et les Regional sur deux barèmes.
 *
 * La taille d'un tournoi est le nombre de joueurs RELEVÉS, pas le rang le plus
 * élevé : riftdecks laisse des trous dans sa numérotation.
 */
export function seuilsDeCoupe(places: Place[], coupe = 0.1): Map<string, number> {
  const tailles = new Map<string, number>();
  for (const p of places) tailles.set(p.contexte, (tailles.get(p.contexte) ?? 0) + 1);
  return new Map([...tailles].map(([c, n]) => [c, Math.max(1, Math.round(n * coupe))]));
}

export interface BilanLegende {
  joueurs: number;
  coupe: number;
  titres: number;
  tournois: number;
  meilleures: { placement: string; player: string | null; tournament: string }[];
}

const ordinal = (n: number) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);

export function bilanParLegende(places: Place[], coupe = 0.1): Map<string, BilanLegende> {
  const seuils = seuilsDeCoupe(places, coupe);
  const brut = new Map<string, { joueurs: number; coupe: number; titres: number; t: Set<string>; places: Place[] }>();
  for (const p of places) {
    if (!p.legend) continue;
    const e = brut.get(p.legend) ?? { joueurs: 0, coupe: 0, titres: 0, t: new Set<string>(), places: [] };
    e.joueurs++;
    if (p.rang <= seuils.get(p.contexte)!) e.coupe++;
    if (p.rang === 1) e.titres++;
    e.t.add(p.contexte);
    e.places.push(p);
    brut.set(p.legend, e);
  }
  const m = new Map<string, BilanLegende>();
  for (const [nom, e] of brut) {
    m.set(nom, {
      joueurs: e.joueurs,
      coupe: e.coupe,
      titres: e.titres,
      tournois: e.t.size,
      meilleures: e.places
        .slice()
        .sort((a, b) => a.rang - b.rang)
        .slice(0, 5)
        .map((p) => ({ placement: ordinal(p.rang), player: p.player, tournament: p.contexte })),
    });
  }
  return m;
}
