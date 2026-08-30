/**
 * Convertit un relevé hexgate (`data/raw-scrapes/hexgate/tournoi-<id>-decks.json`)
 * au format des decklists du site, dans `data/decklists/<legende>/`.
 *
 *   npx tsx --env-file=.env scripts/parse-hexgate.mts 238 239 240
 *
 * Demande la base : chaque carte est rattachée à une carte réelle, jamais à un nom
 * lu au hasard. Deux clés, dans cet ordre :
 *   1. le nom anglais donné par hexgate (`en_name`) ;
 *   2. à défaut, le couple set + numéro de collection tiré de `card_no`.
 * Une carte qu'on ne retrouve pas fait ÉCARTER le deck entier, avec sa raison.
 * On ne complète pas, on ne devine pas (règle d'intégrité, AGENTS.md).
 *
 * Pourquoi pas le numéro d'abord : hexgate numérote « FND-196/298 » ce que la base
 * appelle `ogn-197-298`. Les numéros ne se correspondent pas d'un set à l'autre,
 * les noms anglais si.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";

const RACINE_BRUT = "data/raw-scrapes/hexgate";
const RACINE_SORTIE = "data/decklists";

// Les villes relevées sur hexgate. Table explicite : on ne translittère pas
// un nom chinois à la volée, on écrit celui que la base emploie déjà pour les
// City Challenge précédentes (« S4 Beijing City Challenge (2026-08-15) »).
const VILLES: Record<string, string> = {
  "北京": "Beijing",
  "深圳": "Shenzhen",
  "苏州": "Suzhou",
  "上海": "Shanghai",
  "广州": "Guangzhou",
  "济南": "Jinan",
  "西安": "Xi'an",
  "东莞": "Dongguan",
  "武汉": "Wuhan",
};

/**
 * Les épreuves qui ne sont pas des City Challenge n'ont pas de nom déductible :
 * « 东莞·符文战场 漫博杯 » ne suit aucun gabarit. On les nomme ici une par une,
 * par identifiant hexgate, plutôt que de traduire un titre chinois à la volée —
 * un nom inventé se retrouverait ensuite dans les URL et les drapeaux.
 * 符文战场 est le nom chinois de Riftbound lui-même ; 漫博杯 est translittéré.
 */
const NOMS_PARTICULIERS: Record<number, string> = {
  220: "Dongguan Manbo Cup",
};

interface CarteBrute {
  card_no: string;
  en_name: string;
  cn_name: string;
  quantity: number;
  slot_type: string;
  card_type: string;
  energy: number | null;
}

interface DeckBrut {
  source: string;
  tournoi: { id: number; nom: string; date: string; joueurs: number; set: string };
  deck_id: number;
  rang: number;
  joueur: string;
  legende_en: string;
  legende_no: string | null;
  cartes: CarteBrute[];
}

interface CarteBase {
  name: string;
  type: string;
  supertype: string | null;
  rarity: string;
  domains: string[];
  set: string;
  collectorNumber: number | null;
}

/** Le tirage à retenir quand un nom existe en plusieurs exemplaires. */
function meilleurTirage(a: CarteBase, b: CarteBase): CarteBase {
  const note = (c: CarteBase) =>
    (c.set.toLowerCase() === "pr" ? 4 : 0) + (c.name.includes("(") ? 2 : 0);
  return note(a) <= note(b) ? a : b;
}

/**
 * Additionne les lignes qui portent le même numéro de collection.
 *
 * hexgate rend parfois deux lignes pour la même carte — « SFD-057/221 » deux fois,
 * une copie chacune. Le compte total reste juste, mais le deck ressortait avec
 * « Champion ambigu (Irelia, Fervent, Irelia, Fervent) », c'est-à-dire écarté pour
 * un doublon d'affichage. Vingt listes sautaient comme ça sur le seul Wuhan.
 */
function fusionnerDoublons(cartes: CarteBrute[]): CarteBrute[] {
  const parNumero = new Map<string, CarteBrute>();
  for (const c of cartes) {
    const vu = parNumero.get(c.card_no);
    if (vu) vu.quantity += c.quantity;
    else parNumero.set(c.card_no, { ...c });
  }
  return [...parNumero.values()];
}

function slugLegende(nom: string): string {
  return nom
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugJoueur(nom: string): string {
  const s = nom.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);
  return s || "sans-nom";
}

/**
 * « 【城市挑战赛】北京站-8.23 » → « S4 Beijing City Challenge (2026-08-23) »
 * « 第四赛季区域公开赛 - 武汉站 » → « S4 Wuhan Regional Open (2026-08-29) »
 *
 * Les deux gabarits suivent le nom déjà employé en base (`tournament-flags.ts`) :
 * « S3 Tianjin Regional Open (2026-06-07) ». La saison vient de `set` (« S4 »),
 * pas du 第四赛季 du titre : c'est le champ que hexgate remplit toujours.
 */
function nomTournoi(brut: DeckBrut["tournoi"]): string | null {
  const particulier = NOMS_PARTICULIERS[brut.id];
  if (particulier) return `${particulier} (${brut.date})`;
  const ville = Object.keys(VILLES).find((cn) => brut.nom.includes(cn));
  if (!ville) return null;
  if (brut.nom.includes("城市挑战赛")) return `S4 ${VILLES[ville]} City Challenge (${brut.date})`;
  if (brut.nom.includes("区域公开赛")) {
    return `${brut.set} ${VILLES[ville]} Regional Open (${brut.date})`;
  }
  return null;
}

async function main() {
  const ids = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
  if (!ids.length) {
    console.error("Usage : npx tsx --env-file=.env scripts/parse-hexgate.mts <id> [<id>…]");
    process.exit(1);
  }

  const cartes = await prisma.card.findMany({
    select: { name: true, type: true, supertype: true, rarity: true, domains: true, set: true, collectorNumber: true },
  });
  const parNom = new Map<string, CarteBase>();
  const parNumero = new Map<string, CarteBase>();
  for (const c of cartes) {
    const cle = c.name.trim().toLowerCase();
    const vu = parNom.get(cle);
    parNom.set(cle, vu ? meilleurTirage(vu, c) : c);
    if (c.collectorNumber !== null) {
      const cleNum = `${c.set.toLowerCase()}|${c.collectorNumber}`;
      const vuNum = parNumero.get(cleNum);
      parNumero.set(cleNum, vuNum ? meilleurTirage(vuNum, c) : c);
    }
  }

  for (const id of ids) {
    const brut = JSON.parse(
      await readFile(join(RACINE_BRUT, `tournoi-${id}-decks.json`), "utf8"),
    ) as DeckBrut[];
    if (!brut.length) {
      console.log(`${id} : relevé vide`);
      continue;
    }

    const contexte = nomTournoi(brut[0].tournoi);
    if (!contexte) {
      console.log(`${id} : nom de tournoi non reconnu (« ${brut[0].tournoi.nom} ») — rien écrit`);
      continue;
    }
    console.log(`\n=== ${id} · ${contexte} · ${brut.length} listes relevées`);

    const ecrits: string[] = [];
    const ecartes: Array<{ deck_id: number; joueur: string; raison: string }> = [];

    for (const deck of brut) {
      const trouver = (c: CarteBrute): CarteBase | null => {
        const parLeNom = parNom.get(c.en_name.trim().toLowerCase());
        if (parLeNom) return parLeNom;
        const m = c.card_no.match(/^([A-Za-z]+)-(\d+)/);
        if (!m) return null;
        return parNumero.get(`${m[1].toLowerCase()}|${Number(m[2])}`) ?? null;
      };

      const inconnues = deck.cartes.filter((c) => !trouver(c)).map((c) => `${c.en_name} (${c.card_no})`);
      if (inconnues.length) {
        ecartes.push({ deck_id: deck.deck_id, joueur: deck.joueur, raison: `carte(s) absente(s) de la base : ${inconnues.join(", ")}` });
        continue;
      }

      const legendeBrute = deck.cartes.find((c) => c.slot_type === "legend");
      const legendeBase = legendeBrute ? trouver(legendeBrute) : null;
      if (!legendeBase) {
        ecartes.push({ deck_id: deck.deck_id, joueur: deck.joueur, raison: "Légende introuvable" });
        continue;
      }
      const personnage = legendeBase.name.split(",")[0].trim().toLowerCase();

      // Le Champion du deck est la carte Champion qui porte le nom du personnage de
      // la Légende. Quand plusieurs y répondent, hexgate ne dit pas laquelle a été
      // désignée : on écarte plutôt que de choisir à sa place.
      const principales = fusionnerDoublons(deck.cartes.filter((c) => c.slot_type === "main"));
      const champions = principales.filter((c) => {
        const base = trouver(c)!;
        return base.supertype === "Champion" && base.name.split(",")[0].trim().toLowerCase() === personnage;
      });
      if (champions.length !== 1) {
        ecartes.push({
          deck_id: deck.deck_id,
          joueur: deck.joueur,
          raison: champions.length === 0 ? "aucun Champion lié à la Légende" : `Champion ambigu (${champions.map((c) => c.en_name).join(", ")})`,
        });
        continue;
      }
      const champion = champions[0];

      const enCarte = (c: CarteBrute, quantite: number) => {
        const base = trouver(c)!;
        return {
          name: base.name,
          quantity: quantite,
          type: base.type,
          rarity: base.rarity.toLowerCase(),
          domain: base.domains.map((d) => d.toLowerCase()).join("/") || "colorless",
        };
      };

      const mainDeck = principales
        .map((c) => (c === champion ? enCarte(c, c.quantity - 1) : enCarte(c, c.quantity)))
        .filter((c) => c.quantity > 0);

      const runes: Record<string, number> = {};
      for (const c of deck.cartes.filter((x) => x.slot_type === "rune")) {
        const domaine = c.en_name.replace(/\s*Runes?$/i, "").trim();
        runes[domaine] = (runes[domaine] ?? 0) + c.quantity;
      }

      const battlefields = deck.cartes
        .filter((c) => c.slot_type === "battlefield")
        .flatMap((c) => Array.from({ length: c.quantity }, () => trouver(c)!.name));

      const sideDeck = deck.cartes
        .filter((c) => c.slot_type === "sideboard")
        .map((c) => enCarte(c, c.quantity));

      const total = mainDeck.reduce((s, c) => s + c.quantity, 0);
      if (total !== 39) {
        ecartes.push({ deck_id: deck.deck_id, joueur: deck.joueur, raison: `deck principal à ${total} cartes hors Champion` });
        continue;
      }

      const sortie = {
        id: `hexgate-${deck.tournoi.id}-${deck.deck_id}`,
        legend: legendeBase.name,
        legendId: null,
        champion: trouver(champion)!.name,
        player: deck.joueur,
        tournament: contexte,
        date: deck.tournoi.date,
        placement: deck.rang,
        playerCount: deck.tournoi.joueurs,
        set: "Vendetta",
        format: "Constructed",
        archetype: null,
        domains: [...new Set(mainDeck.flatMap((c) => c.domain.split("/")))].filter((d) => d && d !== "colorless"),
        mainDeck,
        runes,
        battlefields,
        sideDeck,
        totalCards:
          total + Object.values(runes).reduce((s, q) => s + q, 0) + battlefields.length + 1 + 1,
        stats: {
          unitCount: mainDeck.filter((c) => c.type === "Unit").reduce((s, c) => s + c.quantity, 0),
          spellCount: mainDeck.filter((c) => c.type === "Spell").reduce((s, c) => s + c.quantity, 0),
          gearCount: mainDeck.filter((c) => c.type === "Gear").reduce((s, c) => s + c.quantity, 0),
          averageCost: null,
        },
        sourceUrl: deck.source,
      };

      const dossier = join(RACINE_SORTIE, slugLegende(legendeBase.name));
      mkdirSync(dossier, { recursive: true });
      const fichier = `hexgate-${deck.tournoi.id}-${deck.rang}-${slugJoueur(deck.joueur)}.json`;
      writeFileSync(join(dossier, fichier), `${JSON.stringify(sortie, null, 2)}\n`);
      ecrits.push(`${slugLegende(legendeBase.name)}/${fichier}`);
    }

    writeFileSync(
      join(RACINE_BRUT, `tournoi-${id}-conversion.json`),
      `${JSON.stringify({ contexte, ecrits, ecartes }, null, 2)}\n`,
    );
    console.log(`    écrits ${ecrits.length} · écartés ${ecartes.length}`);
    const raisons = new Map<string, number>();
    for (const e of ecartes) {
      const cle = e.raison.split(" (")[0].split(" : ")[0];
      raisons.set(cle, (raisons.get(cle) ?? 0) + 1);
    }
    for (const [r, n] of raisons) console.log(`      ${n} × ${r}`);
  }

  await prisma.$disconnect();
}

main();
