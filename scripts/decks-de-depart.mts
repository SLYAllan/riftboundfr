/**
 * Les decks de départ (Showdown Decks, Champion Decks) depuis les pages officielles de
 * Riot, gardées telles quelles dans `data/raw-scrapes/decks-de-depart/`. Écrit
 * `data/decks-de-depart.json`, que lit `/guides/decks-de-depart`.
 *
 *   env -u DATABASE_URL npx tsx --env-file=.env scripts/decks-de-depart.mts [--sec]
 *
 * Sort en 1 si une carte ne se retrouve pas en base : aucune n'est devinée. Les noms
 * que Riot écrit mal sont corrigés dans CORRECTIONS, un par un, avec la page qui le dit.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { buildCardLookup, findCard } from "../src/lib/card-printing";

const DOSSIER = join("data", "raw-scrapes", "decks-de-depart");
const SORTIE = join("data", "decks-de-depart.json");

/** Page source → set et produit. Une page sans liste (l'aperçu d'Unleashed) n'y est pas. */
const PAGES = [
  { fichier: "the-radiance-overview.html", set: "RAD", produit: "Showdown Deck", url: "https://playriftbound.com/en-us/news/announcements/the-radiance-overview/" },
  { fichier: "the-vendetta-overview.html", set: "VEN", produit: "Showdown Deck", url: "https://playriftbound.com/en-us/news/announcements/the-vendetta-overview/" },
  { fichier: "vi--vex-champion-decks.html", set: "UNL", produit: "Champion Deck", url: "https://playriftbound.com/en-us/news/announcements/vi--vex-champion-decks/" },
  { fichier: "spiritforged-precons-fiora-rumble.html", set: "SFD", produit: "Champion Deck", url: "https://playriftbound.com/en-us/news/announcements/spiritforged-precons-fiora-rumble/" },
];

/** Fautes de frappe des pages Riot. Clé = texte de la page, valeur = carte en base. */
const CORRECTIONS: Record<string, string> = {
  // Deck Vex (vi--vex-champion-decks) : une seule carte de ce nom et de ce titre en base.
  "Evelyn, Entrancing": "Evelynn, Entrancing",
  "Carion Dredger": "Carrion Dredger",
};

/**
 * Cartes qu'aucune source ne permet de trancher : on les montre comme inconnues,
 * sans les remplacer. « Shadowcloaked Assassin » (deck Zed, 3 exemplaires) n'existe
 * ni en base ni dans les recherches du 19 novembre 2026 ; Shadow Assassin est déjà
 * dans la liste, et Shadowblade Lurker n'est qu'un nom voisin.
 */
const INCONNUES = new Set(["Shadowcloaked Assassin"]);

interface Ligne { quantite: number; nom: string; numero?: string }
interface DeckBrut { titreLegende: string; principal: Ligne[]; champsDeBataille: Ligne[]; runes: Ligne[] }

function texte(html: string): string {
  return html
    .replace(/<br\s*\/?>|<\/(p|li|h\d|tr)>/gi, "\n")
    .replace(/<\/td>/gi, "\t")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;|’/g, "'")
    .replace(/&quot;/g, '"');
}

/** RAD, VEN, UNL : des rubriques « Legend: », « Main Deck: »… suivies de lignes « 2 Nom ». */
function lireRubriques(t: string): DeckBrut[] {
  const decks: DeckBrut[] = [];
  let deck: DeckBrut | null = null;
  let rubrique = "";
  for (const brut of t.split("\n")) {
    const ligne = brut.replace(/\t/g, " ").trim();
    if (!ligne) continue;
    const titre = /^(Legend|Champion (?:Unit )?Options|Main Deck|Cards|Battlefields|Rune Pool|Runes|Tokens)\s*:\s*(.*)$/i.exec(ligne);
    let contenu = ligne;
    if (titre) {
      rubrique = titre[1].toLowerCase();
      if (rubrique === "legend") {
        deck = { titreLegende: "", principal: [], champsDeBataille: [], runes: [] };
        decks.push(deck);
      }
      contenu = titre[2].trim();
      if (!contenu) continue;
    }
    if (!deck || rubrique === "tokens" || !rubrique) continue;
    if (rubrique === "legend") {
      deck.titreLegende = contenu;
      continue;
    }
    const m = /^(\d+)\s+(.+)$/.exec(contenu);
    if (rubrique === "battlefields") {
      deck.champsDeBataille.push({ quantite: 1, nom: m ? m[2] : contenu });
    } else if (!m) {
      throw new Error(`Ligne sans quantité dans « ${rubrique} » : « ${contenu} »`);
    } else if (rubrique.startsWith("rune")) {
      deck.runes.push({ quantite: Number(m[1]), nom: / Rune$/.test(m[2]) ? m[2] : `${m[2]} Rune` });
    } else {
      deck.principal.push({ quantite: Number(m[1]), nom: m[2] });
    }
  }
  return decks;
}

/** SFD : un tableau ITEM | QTY | Card Number par deck, sous un titre au nom du champion. */
function lireTableaux(html: string): { lignes: Ligne[] }[] {
  return [...html.matchAll(/<table[\s\S]*?<\/table>/gi)].map((m) => ({
    // Chaque case porte un <p> : sans ce retrait, une ligne du tableau tenait sur trois.
    lignes: texte(m[0].replace(/<\/p>/gi, ""))
      .split("\n")
      .map((l) => l.split("\t").map((c) => c.trim()))
      .filter((c) => c.length >= 3 && /^\d+$/.test(c[1]))
      .map(([nom, q, numero]) => ({ nom, quantite: Number(q), numero })),
  }));
}

const cartes = await prisma.card.findMany({ select: { riftboundId: true, name: true, type: true, set: true } });
await prisma.$disconnect();
const parId = new Map(cartes.map((c) => [c.riftboundId, c]));
const lookup = buildCardLookup(cartes);
const erreurs: string[] = [];

function resoudre(l: Ligne, page: string) {
  if (INCONNUES.has(l.nom)) return null;
  const nom = CORRECTIONS[l.nom] ?? l.nom;
  let carte = findCard(lookup, nom);
  if (l.numero) {
    // « SFD-021/221 » → sfd-021-221 ; le numéro et le nom doivent désigner la même carte.
    const id = l.numero.toLowerCase().replace("/", "-");
    const parNumero = parId.get(id);
    if (!parNumero) erreurs.push(`${page} : numéro ${l.numero} (${l.nom}) absent de la base`);
    else if (carte && carte.name !== parNumero.name) erreurs.push(`${page} : ${l.numero} est ${parNumero.name}, pas ${l.nom}`);
    carte = parNumero ?? carte;
  }
  if (!carte) {
    erreurs.push(`${page} : « ${l.nom} » introuvable en base`);
    return null;
  }
  return { riftboundId: carte.riftboundId, name: carte.name, type: carte.type, quantity: l.quantite };
}

const sortie = [];
for (const p of PAGES) {
  const html = readFileSync(join(DOSSIER, p.fichier), "utf-8");
  // La page répète son contenu échappé dans le JSON de Next : on lit le rendu seul.
  const rendu = html.split('<script id="__NEXT_DATA__"')[0];
  const bruts = p.set === "SFD" ? null : lireRubriques(texte(rendu));
  const decks = bruts
    ? bruts.map((d) => ({
        legende: cartes.find((c) => c.type === "Legend" && (c.name === d.titreLegende || c.name.endsWith(`, ${d.titreLegende}`)) && !/\(/.test(c.name)) ?? null,
        titreLegende: d.titreLegende,
        lignes: [...d.principal, ...d.champsDeBataille, ...d.runes].map((l) => resoudre(l, p.fichier)),
        inconnues: d.principal.filter((l) => INCONNUES.has(l.nom)).map((l) => ({ nom: l.nom, quantity: l.quantite })),
      }))
    : lireTableaux(rendu).map((t) => {
        const lignes = t.lignes.filter((l) => !/Token$/i.test(l.nom)).map((l) => resoudre(l, p.fichier));
        const legende = lignes.find((c) => c?.type === "Legend");
        return { legende: legende ? parId.get(legende.riftboundId)! : null, titreLegende: legende?.name ?? "?", lignes: lignes.filter((c) => c?.type !== "Legend"), inconnues: t.lignes.filter((l) => INCONNUES.has(l.nom)).map((l) => ({ nom: l.nom, quantity: l.quantite })) };
      });

  for (const d of decks) {
    if (!d.legende) {
      erreurs.push(`${p.fichier} : Légende « ${d.titreLegende} » introuvable en base`);
      continue;
    }
    const lignes = d.lignes.filter((c) => c !== null);
    const section = (c: (typeof lignes)[number]) =>
      c.type === "Battlefield" ? "champsDeBataille" : c.type === "Rune" ? "runes" : "principal";
    const deck = {
      set: p.set,
      produit: p.produit,
      source: p.url,
      legende: { riftboundId: d.legende.riftboundId, name: d.legende.name },
      principal: lignes.filter((c) => section(c) === "principal").map(({ type: _t, ...c }) => c),
      champsDeBataille: lignes.filter((c) => section(c) === "champsDeBataille").map(({ type: _t, ...c }) => c),
      runes: lignes.filter((c) => section(c) === "runes").map(({ type: _t, ...c }) => c),
      inconnues: d.inconnues,
    };
    const n = [...deck.principal, ...deck.inconnues].reduce((s, c) => s + c.quantity, 0);
    const r = deck.runes.reduce((s, c) => s + c.quantity, 0);
    console.log(`${p.set} ${d.legende.name} : ${n} cartes, ${r} runes, ${deck.champsDeBataille.length} champs de bataille`);
    sortie.push(deck);
  }
}

if (erreurs.length) {
  console.error(`\n${erreurs.length} erreur(s) :\n  ${erreurs.join("\n  ")}`);
  process.exit(1);
}
if (process.argv.includes("--sec")) console.log("\nEssai à blanc : rien n'est écrit.");
else {
  writeFileSync(SORTIE, JSON.stringify({ releveLe: new Date().toISOString().slice(0, 10), decks: sortie }, null, 2) + "\n");
  console.log(`\n${sortie.length} decks écrits dans ${SORTIE}`);
}
