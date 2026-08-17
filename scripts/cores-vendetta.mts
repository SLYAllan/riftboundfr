/**
 * Taux d'inclusion des cartes par Légende, lus sur les decklists réelles.
 *
 * DECKBUILDING-RULES.md annonce des « cores observés » recalculables à tout
 * moment : ce script est ce calcul. Il ne lit que `data/decklists/`, c'est-à-dire
 * ce que le scrape brut a produit et que le validateur a confirmé. Rien n'est
 * déduit, rien n'est complété.
 *
 *   npx tsx scripts/cores-vendetta.mts [set] [minListes]
 *   npx tsx scripts/cores-vendetta.mts Vendetta 30
 *
 * Sortie : une puce Markdown par Légende, prête à coller dans le doc.
 * Core = présent dans 90 % et plus des listes, standard = 60 à 89 %.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const set = process.argv[2] ?? "Vendetta";
const minListes = Number(process.argv[3] ?? 30);
const RACINE = join(import.meta.dirname, "../data/decklists");

interface Decklist {
  legend: string;
  set: string;
  mainDeck: { name: string; quantity: number }[];
}

function fichiersJson(dossier: string): string[] {
  const out: string[] = [];
  for (const entree of readdirSync(dossier)) {
    const chemin = join(dossier, entree);
    if (statSync(chemin).isDirectory()) out.push(...fichiersJson(chemin));
    else if (entree.endsWith(".json")) out.push(chemin);
  }
  return out;
}

const parLegende = new Map<string, { listes: number; cartes: Map<string, number[]> }>();

for (const chemin of fichiersJson(RACINE)) {
  let deck: Decklist;
  try {
    deck = JSON.parse(readFileSync(chemin, "utf-8"));
  } catch {
    continue; // un index ou un fragment, pas une decklist
  }
  if (deck.set !== set || !deck.legend || !Array.isArray(deck.mainDeck)) continue;

  const e = parLegende.get(deck.legend) ?? { listes: 0, cartes: new Map<string, number[]>() };
  e.listes++;
  // Une carte comptée UNE fois par liste, même si le JSON la répète.
  const vues = new Map<string, number>();
  for (const c of deck.mainDeck) {
    if (!c?.name) continue;
    vues.set(c.name, (vues.get(c.name) ?? 0) + (c.quantity ?? 0));
  }
  for (const [nom, qte] of vues) {
    const copies = e.cartes.get(nom) ?? [];
    copies.push(qte);
    e.cartes.set(nom, copies);
  }
  parLegende.set(deck.legend, e);
}

const mediane = (xs: number[]): number => {
  const t = [...xs].sort((a, b) => a - b);
  const m = Math.floor(t.length / 2);
  return t.length % 2 ? t[m] : Math.round((t[m - 1] + t[m]) / 2);
};

const legendes = [...parLegende.entries()]
  .filter(([, e]) => e.listes >= minListes)
  .sort((a, b) => b[1].listes - a[1].listes);

for (const [legende, e] of legendes) {
  const taux = [...e.cartes.entries()]
    .map(([nom, copies]) => ({ nom, part: (copies.length / e.listes) * 100, copies: mediane(copies) }))
    .sort((a, b) => b.part - a.part);
  const core = taux.filter((c) => c.part >= 90);
  const standard = taux.filter((c) => c.part >= 60 && c.part < 90);
  const fmt = (c: { nom: string; part: number; copies: number }) =>
    `${c.nom} ${c.copies}x (${Math.round(c.part)} %)`;

  const bloc = [`- **${legende}** (${e.listes} listes)`];
  bloc.push(core.length ? ` — core : ${core.map(fmt).join(", ")}.` : " — aucun core à 90 %.");
  if (standard.length) bloc.push(` Standard : ${standard.slice(0, 12).map(fmt).join(", ")}.`);
  console.log(bloc.join(""));
}

console.error(
  `\n${legendes.length} Légendes avec au moins ${minListes} listes, sur ${parLegende.size} vues en set ${set}.`,
);
