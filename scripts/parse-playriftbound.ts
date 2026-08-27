/**
 * Convertit un article « Top Decks » de playriftbound.com en decklists JSON.
 *
 *   npx tsx scripts/parse-playriftbound.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> <set> <url-article>
 *
 * Exemple :
 *   npx tsx scripts/parse-playriftbound.ts barcelona-rq "Barcelona Regional Qualifier" \
 *     2026-08-23 2224 Vendetta \
 *     https://playriftbound.com/en-us/news/organizedplay/barcelonas-top-decks/
 *
 * Lit `data/raw-scrapes/<slug>-officiel.md`, le scrape brut de l'article.
 *
 * Pourquoi une deuxième source. riftdecks ne publie que les listes que les
 * joueurs lui envoient : sur Barcelone, 118 sur 2 131 classés. Riot, lui,
 * publie les Best-Of et le Top 8 avec leur liste complète. Sans cet apport, une
 * Légende dont le n°1 n'a rien envoyé à riftdecks n'a AUCUNE liste sur le site,
 * et `mark-bestof-tournois.mts` lève le drapeau best-of sur un deck moins bien
 * classé — un best-of faux, sans le moindre signe.
 *
 * Ce script n'invente rien : chaque carte vient du texte de l'article, et son
 * type, sa rareté et son domaine sont relus dans la base de cartes. Un nom
 * introuvable arrête tout plutôt que de laisser passer une carte fantôme.
 *
 * Un joueur déjà couvert par le scrape riftdecks n'est PAS réécrit : sa liste
 * riftdecks est comparée à celle de Riot et toute divergence est signalée, à
 * trancher à la main. Deux vérités pour un même deck, ça se regarde.
 */
import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { decklistVendettaComplete } from "./decklist-integrity";
import { sansHomoglyphes } from "./parse-riftdecks-integrity";

const prisma = new PrismaClient();

interface CarteDeck {
  name: string;
  quantity: number;
  type: string;
  rarity: string;
  domain: string;
}

interface DeckOfficiel {
  player: string;
  legendRank: number;
  legendPlayed: number;
  overall: number;
  section: string;
  legend: string;
  champion: string | null;
  mainDeck: { name: string; quantity: number }[];
  battlefields: string[];
  runes: Record<string, number>;
  sideDeck: { name: string; quantity: number }[];
}

/**
 * L'article range chaque deck dans un tableau à deux cellules : le joueur et son
 * classement en en-tête, puis les cartes, coupées en « Legend / Champion / Main
 * Deck » d'un côté et « Battlefields / Rune Pool / Sideboard » de l'autre. Les
 * sauts de ligne sont des `<br>`, pas de vraies lignes.
 */
export function lireArticle(md: string): DeckOfficiel[] {
  const lignes = md.split(/\r?\n/);
  const decks: DeckOfficiel[] = [];
  let section = "";

  for (let i = 0; i < lignes.length; i++) {
    if (/^#\s+Best-of Decks/.test(lignes[i])) { section = "bestof"; continue; }
    if (/^##\s+Top 8 Decks/.test(lignes[i])) { section = "top8"; continue; }

    const entete = lignes[i].match(
      /^\|\s*### (.+?)<br>\*\*Legend Rank:\*\*\s*#(\d+)\/(\d+)<br>\*\*Overall Ranking:\*\*\s*#(\d+)\s*\|/,
    );
    if (!entete) continue;
    const corps = lignes[i + 1];
    if (!corps || !corps.includes("**Legend:**")) {
      throw new Error(`Deck sans liste de cartes ligne ${i + 2} : ${entete[1]}`);
    }

    const deck: DeckOfficiel = {
      player: entete[1].trim(), legendRank: +entete[2], legendPlayed: +entete[3],
      overall: +entete[4], section, legend: "", champion: null,
      mainDeck: [], battlefields: [], runes: {}, sideDeck: [],
    };

    let cle = "";
    const bouts = corps
      .replace(/^\|\s*/, "").replace(/\s*\|\s*$/, "").split(/\s*\|\s*/).join("<br>")
      .split("<br>").map((s) => s.trim()).filter(Boolean);

    for (const bout of bouts) {
      const titre = bout.match(/^\*\*(.+?):\*\*$/);
      if (titre) { cle = titre[1]; continue; }
      const carte = bout.match(/^(\d+)\s+(.+)$/);
      if (!carte) throw new Error(`Ligne illisible sous « ${cle} » : ${bout}`);
      const quantite = +carte[1];
      const nom = carte[2].trim();
      if (cle === "Legend") deck.legend = nom;
      else if (cle === "Champion") deck.champion = nom;
      else if (cle === "Main Deck") deck.mainDeck.push({ name: nom, quantity: quantite });
      // Un champ de bataille est toujours en un exemplaire, mais la quantité est
      // écrite quand même : on la déplie plutôt que de la supposer à 1.
      else if (cle === "Battlefields") for (let k = 0; k < quantite; k++) deck.battlefields.push(nom);
      else if (cle === "Rune Pool") deck.runes[nom.replace(/\s+Rune$/, "")] = quantite;
      else if (cle === "Sideboard") deck.sideDeck.push({ name: nom, quantity: quantite });
      else throw new Error(`Section inconnue « ${cle} » pour ${deck.player}`);
    }
    decks.push(deck);
  }
  return decks;
}

/**
 * Les quatre du Top 8 qui sont aussi Best-Of paraissent deux fois. Le joueur et
 * son classement général les identifient ; le « Legend Rank » ne suffit pas, une
 * coquille de l'article donne #1/26 d'un côté et #1/96 de l'autre pour le même
 * deck de Rengar.
 */
export function dedoublonner(decks: DeckOfficiel[]): DeckOfficiel[] {
  const vus = new Map<string, DeckOfficiel>();
  for (const deck of decks) {
    const cle = `${deck.player}|${deck.overall}`;
    const garde = vus.get(cle);
    if (!garde) { vus.set(cle, deck); continue; }
    const identique =
      garde.legend === deck.legend &&
      JSON.stringify(garde.mainDeck) === JSON.stringify(deck.mainDeck);
    if (!identique) throw new Error(`Deux listes différentes pour ${cle} dans l'article`);
    garde.section = "bestof+top8";
    garde.legendPlayed = Math.max(garde.legendPlayed, deck.legendPlayed);
  }
  return [...vus.values()].sort((a, b) => a.overall - b.overall);
}

/** Les sources n'écrivent pas les apostrophes pareil (« Kai'Sa », « Kai’Sa »). */
const cleNom = (nom: string) =>
  nom.toLowerCase().replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const glisse = (nom: string) =>
  sansHomoglyphes(nom).toLowerCase().replace(/[^a-z0-9]+/g, "");

async function main() {
  const [slug, nomTournoi, date, joueurs, set, lienArticle] = process.argv.slice(2);
  if (!slug || !nomTournoi || !date || !joueurs || !set || !lienArticle) {
    console.error(
      'Usage : npx tsx scripts/parse-playriftbound.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> <set> <url-article>',
    );
    process.exit(2);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Date attendue au format AAAA-MM-JJ, reçu « ${date} ».`);
    process.exit(2);
  }

  const racine = path.join(__dirname, "..");
  const source = path.join(racine, "data/raw-scrapes", `${slug}-officiel.md`);

  const decks = dedoublonner(lireArticle(fs.readFileSync(source, "utf-8")));
  console.log(`${decks.length} decks lus dans l'article officiel.`);

  // Index des cartes. Une carte a plusieurs impressions (variante, surnumérotée) :
  // on garde la première impression normale, celle dont le type et la rareté font
  // foi. Les prendre au hasard donnerait une rareté « showcase » à une commune.
  const cartes = await prisma.card.findMany({
    select: { name: true, cleanName: true, type: true, rarity: true, domains: true,
              alternateArt: true, overnumbered: true, collectorNumber: true },
    orderBy: [{ alternateArt: "asc" }, { overnumbered: "asc" }, { collectorNumber: "asc" }],
  });
  const parNom = new Map<string, (typeof cartes)[number]>();
  for (const c of cartes) {
    for (const nom of [c.name, c.cleanName, c.name.replace(/ - /g, ", ")]) {
      if (nom && !parNom.has(cleNom(nom))) parNom.set(cleNom(nom), c);
    }
  }

  // Préflight : on résout TOUT avant d'écrire quoi que ce soit. Une carte
  // introuvable au milieu d'une boucle d'écriture laisse des decks à moitié posés.
  const introuvables = new Set<string>();
  for (const d of decks) {
    for (const nom of [d.legend, d.champion, ...d.mainDeck.map((c) => c.name),
                       ...d.sideDeck.map((c) => c.name), ...d.battlefields]) {
      if (nom && !parNom.has(cleNom(nom))) introuvables.add(nom);
    }
  }
  if (introuvables.size) {
    throw new Error(`Cartes introuvables en base : ${[...introuvables].join(", ")}`);
  }

  const decrire = (nom: string, quantite: number): CarteDeck => {
    const c = parNom.get(cleNom(nom))!;
    return {
      name: c.name,
      quantity: quantite,
      type: c.type,
      rarity: c.rarity.toLowerCase(),
      domain: c.domains.map((d) => d.toLowerCase()).join("/") || "colorless",
    };
  };

  // Ce que riftdecks a déjà, indexé par pseudo glissé (casse et ponctuation en
  // moins) : « CTG Alanzq » côté Riot, « CTG Alаnzq » côté riftdecks.
  const dossierDecklists = path.join(racine, "data/decklists");
  const dejaLa = new Map<string, { fichier: string; pool: Map<string, number> }>();
  for (const dossier of fs.readdirSync(dossierDecklists)) {
    const chemin = path.join(dossierDecklists, dossier);
    if (!fs.statSync(chemin).isDirectory()) continue;
    for (const f of fs.readdirSync(chemin)) {
      if (!f.startsWith(`${slug}-`) || !f.endsWith(".json") || f.includes("-officiel-")) continue;
      const o = JSON.parse(fs.readFileSync(path.join(chemin, f), "utf-8"));
      const pool = new Map<string, number>();
      for (const c of o.mainDeck ?? []) pool.set(cleNom(c.name), (pool.get(cleNom(c.name)) ?? 0) + c.quantity);
      dejaLa.set(glisse(o.player ?? ""), { fichier: `${dossier}/${f}`, pool });
    }
  }
  console.log(`${dejaLa.size} decks riftdecks déjà écrits pour ${slug}.`);

  const verite: { url: string; main: { name: string; quantity: number; type: string }[] }[] = [];
  const ecrits: string[] = [];
  const divergences: string[] = [];
  let doublons = 0;

  for (const d of decks) {
    const ancre = d.player.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const url = `${lienArticle}#${ancre}`;

    const mainDeck = d.mainDeck.map((c) => decrire(c.name, c.quantity));
    // La vérité brute que relit `validate:decks`. Le Champion y est compté avec
    // le deck principal (40), c'est un des deux totaux que le valideur accepte.
    verite.push({
      url,
      main: [...mainDeck.map((c) => ({ name: c.name, quantity: c.quantity, type: "unit" })),
             ...(d.champion ? [{ name: parNom.get(cleNom(d.champion))!.name, quantity: 1, type: "unit" }] : [])],
    });

    const connu = dejaLa.get(glisse(d.player));
    if (connu) {
      doublons++;
      const attendu = new Map<string, number>();
      for (const c of mainDeck) attendu.set(cleNom(c.name), (attendu.get(cleNom(c.name)) ?? 0) + c.quantity);
      const champ = d.champion ? cleNom(d.champion) : null;
      const noms = new Set([...attendu.keys(), ...connu.pool.keys()]);
      const ecarts = [...noms].filter((n) => n !== champ && (attendu.get(n) ?? 0) !== (connu.pool.get(n) ?? 0));
      if (ecarts.length) {
        divergences.push(`${d.player} (${connu.fichier}) : ${ecarts.slice(0, 6).join(", ")}`);
      }
      continue;
    }

    const deckJson = {
      id: `${slug}-officiel-${ancre}`,
      legend: parNom.get(cleNom(d.legend))!.name,
      legendId: null,
      champion: d.champion ? parNom.get(cleNom(d.champion))!.name : null,
      player: d.player,
      tournament: nomTournoi,
      date,
      placement: d.overall,
      playerCount: parseInt(joueurs, 10),
      set,
      format: "Constructed",
      archetype: null,
      domains: Object.keys(d.runes).filter((r) => r !== "Colorless"),
      mainDeck,
      runes: d.runes,
      battlefields: d.battlefields.map((b) => parNom.get(cleNom(b))!.name),
      sideDeck: d.sideDeck.map((c) => decrire(c.name, c.quantity)),
      totalCards:
        mainDeck.reduce((s, c) => s + c.quantity, 0) +
        Object.values(d.runes).reduce((s, q) => s + q, 0) +
        d.battlefields.length + 1 + (d.champion ? 1 : 0),
      stats: {
        unitCount: mainDeck.filter((c) => c.type === "Unit").reduce((s, c) => s + c.quantity, 0),
        spellCount: mainDeck.filter((c) => c.type === "Spell").reduce((s, c) => s + c.quantity, 0),
        gearCount: mainDeck.filter((c) => c.type === "Gear").reduce((s, c) => s + c.quantity, 0),
        averageCost: null,
      },
      sourceUrl: url,
    };

    const manques = decklistVendettaComplete(deckJson);
    if (!manques.complete) {
      throw new Error(`${d.player} : decklist incomplète (${manques.missing.join(", ")})`);
    }

    const dossierLegende = deckJson.legend.split(",")[0].trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const cible = path.join(dossierDecklists, dossierLegende);
    fs.mkdirSync(cible, { recursive: true });
    const fichier = `${slug}-${d.overall}-officiel-${ancre}.json`.slice(0, 90);
    fs.writeFileSync(path.join(cible, fichier), JSON.stringify(deckJson, null, 2), "utf-8");
    ecrits.push(`${dossierLegende}/${fichier}`);
  }

  const dossierVerite = path.join(racine, "data/raw-scrapes", `${slug}-officiel`);
  fs.mkdirSync(dossierVerite, { recursive: true });
  fs.writeFileSync(path.join(dossierVerite, "verite.json"), JSON.stringify(verite, null, 2), "utf-8");

  console.log(`\n${ecrits.length} decklists écrites (absentes de riftdecks) :`);
  for (const f of ecrits) console.log(`   ${f}`);
  console.log(`\n${doublons} joueurs déjà couverts par riftdecks.`);
  if (divergences.length) {
    console.log(`\n⚠ ${divergences.length} divergence(s) entre riftdecks et l'article officiel :`);
    for (const d of divergences) console.log(`   ${d}`);
  } else if (doublons) {
    console.log("Aucune divergence : les deux sources disent la même chose.");
  }
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
