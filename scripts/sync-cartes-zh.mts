/**
 * LA routine de mise à jour des cartes chinoises. Un seul point d'entrée.
 *
 *   npm run maj:cartes-zh            # relève et écrit data/cards-zh.json
 *   npm run maj:cartes-zh -- --sec   # dit ce qui changerait, n'écrit rien
 *   npm run maj:cartes-zh -- --force # écrit même si la relève a maigri
 *
 * À lancer à chaque sortie de set. Elle ne touche pas à la base : tout ce qu'elle
 * produit est `data/cards-zh.json`, lu par `src/lib/cards-zh.ts`.
 *
 * SOURCE : le figurier chinois OFFICIEL, celui de playloltcg.com, l'éditeur du jeu
 * en Chine. Son adresse ne se trouve nulle part écrite : elle est dans le
 * `js/request/request.js` du site. Elle rend d'un coup le nom, le texte et
 * l'ADRESSE OFFICIELLE de l'image de chaque carte, tous sets confondus.
 *
 * Elle a remplacé un miroir communautaire sur GitHub, qui coûtait trois choses : son
 * figurier s'arrêtait à Spiritforged (ni Unleashed ni Vendetta n'avaient de nom), son
 * README interdisait l'usage commercial, et il pouvait disparaître du jour au
 * lendemain. Les images sortent maintenant du CDN de l'éditeur, comme le reste du
 * site sort de celui de Riot.
 *
 * Deux choses à savoir avant de promettre quoi que ce soit :
 *   - ces cartes sont en chinois SIMPLIFIÉ (le code « SC » est imprimé en bas de
 *     chacune). Aucune source en traditionnel n'existe, alors que l'interface de
 *     l'overlay, elle, est en traditionnel ;
 *   - les champs de bataille sont rangés TOURNÉS d'un quart de tour (une carte
 *     paysage dans un fichier portrait), chez l'éditeur comme chez le miroir. C'est
 *     pour ça que `cards-zh.ts` les écarte des images.
 *
 * Le garde-fou qui compte : un nom et une image ne sont retenus que si l'énergie ET
 * la puissance concordent avec notre carte. Le numéro seul ne prouve rien — dans
 * Vendetta, les cartes des decks de départ portent aussi les numéros 1 à 4.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const API = "https://lol-api.playloltcg.com/xcx/card/searchCardCraftWeb";
const FICHIER = join(process.cwd(), "data", "cards-zh.json");

const sec = process.argv.includes("--sec");
const force = process.argv.includes("--force");

type CarteZh = {
  cardNo: string;
  cardName: string;
  subTitle: string;
  hero: string;
  energy: number | null;
  power: number | null;
  cardCategoryNameList: string[];
  frontImage: string;
};
type Sortie = {
  source: string;
  langue: string;
  releve: string;
  parSet: Record<string, number>;
  images: Record<string, string>;
  noms: Record<string, string>;
};

/**
 * Le numéro imprimé sur la carte, `UNL-116a`. Seule clé commune aux deux figuriers.
 *
 * Le figurier chinois écrit ses numéros de deux façons (`VEN·001` et `UNL-001/219`),
 * et le suffixe compte : `a` = art alternatif, `*` = surnuméroté. Notre `riftboundId`
 * porte le même numéro et le même suffixe, d'où la clé commune.
 */
function numeroChinois(cardNo: string): string | null {
  const m = /^([A-Z]+)[·-]([0-9]+[a-z*]?)/i.exec(cardNo ?? "");
  return m ? `${m[1].toUpperCase()}-${m[2]}` : null;
}

function numeroMaison(riftboundId: string): string | null {
  const m = /^([a-z]+)-([0-9]+[a-z*]?)-/i.exec(riftboundId);
  return m ? `${m[1].toUpperCase()}-${m[2]}` : null;
}

/**
 * Le nom chinois d'une carte, tel qu'il est IMPRIMÉ dessus.
 *
 * Une Légende porte le champion sur sa ligne de type (`hero`) et son titre dans le
 * bandeau (`cardName`) ; une unité champion porte les deux dans `cardName` et
 * `subTitle`. On les joint par la virgule, comme le site le fait déjà en français.
 * Rien n'est inventé : les deux moitiés viennent du figurier.
 */
function nomChinois(c: CarteZh): string {
  const moities = c.cardCategoryNameList?.includes("传奇")
    ? [c.hero, c.cardName]
    : [c.cardName, c.subTitle];
  return moities.filter(Boolean).join("，");
}

async function figurierOfficiel(): Promise<CarteZh[]> {
  const reponse = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Le figurier est appelé depuis le site de l'éditeur : on se présente comme lui.
      "User-Agent": "Mozilla/5.0",
      Referer: "https://www.playloltcg.com/",
    },
    body: JSON.stringify({ pageNum: 1, pageSize: 5000 }),
  });
  if (!reponse.ok) throw new Error(`Figurier chinois : ${reponse.status}`);
  const recu = (await reponse.json()) as { result?: { total?: number; list?: CarteZh[] } };
  const liste = recu.result?.list ?? [];
  const total = recu.result?.total ?? 0;
  // Une page partielle passerait inaperçue et retirerait leurs images à des centaines
  // de cartes. On refuse plutôt que d'écrire une relève amputée.
  if (liste.length !== total) throw new Error(`Figurier tronqué : ${liste.length} reçues sur ${total}`);
  if (liste.length === 0) throw new Error("Figurier vide");
  return liste;
}

async function relever() {
  const figurier = await figurierOfficiel();
  const parNumero = new Map<string, CarteZh>();
  for (const c of figurier) {
    const n = numeroChinois(c.cardNo);
    if (n && !parNumero.has(n)) parNumero.set(n, c);
  }

  const prisma = new PrismaClient();
  const nos = await prisma.card.findMany({
    select: { name: true, riftboundId: true, set: true, energy: true, might: true },
  });
  await prisma.$disconnect();

  const images: Record<string, string> = {};
  const noms: Record<string, string> = {};
  const parSet: Record<string, number> = {};
  let refuses = 0;
  let sansImage = 0;

  for (const carte of nos) {
    const n = numeroMaison(carte.riftboundId);
    const zh = n ? parNumero.get(n) : null;
    if (!zh) continue;
    if ((carte.energy ?? null) !== (zh.energy ?? null) || (carte.might ?? null) !== (zh.power ?? null)) {
      refuses++;
      continue;
    }
    if (zh.frontImage) {
      images[n!] = zh.frontImage;
      parSet[carte.set] = (parSet[carte.set] ?? 0) + 1;
    } else {
      sansImage++;
    }
    const nom = nomChinois(zh);
    // Un nom par nom anglais : c'est lui qui voyage dans l'état de l'overlay.
    if (nom && !noms[carte.name]) noms[carte.name] = nom;
  }

  return { images, noms, parSet, refuses, sansImage, figurier: figurier.length, notres: nos.length };
}

async function ancien(): Promise<Sortie | null> {
  try {
    return JSON.parse(await readFile(FICHIER, "utf8")) as Sortie;
  } catch {
    return null;
  }
}

function diff(avant: string[], apres: string[]) {
  const a = new Set(avant);
  const b = new Set(apres);
  return { ajouts: apres.filter((x) => !a.has(x)), retraits: avant.filter((x) => !b.has(x)) };
}

async function main() {
  const releve = await relever();
  const precedent = await ancien();
  const images = Object.keys(releve.images);
  const noms = Object.keys(releve.noms);

  if (precedent) {
    const di = diff(Object.keys(precedent.images ?? {}), images);
    const dn = diff(Object.keys(precedent.noms ?? {}), noms);
    console.log(`images : ${images.length} (+${di.ajouts.length} / -${di.retraits.length})`);
    if (di.ajouts.length) console.log("  + " + di.ajouts.slice(0, 12).join(", ") + (di.ajouts.length > 12 ? "…" : ""));
    if (di.retraits.length) console.log("  - " + di.retraits.slice(0, 12).join(", ") + (di.retraits.length > 12 ? "…" : ""));
    console.log(`noms   : ${noms.length} (+${dn.ajouts.length} / -${dn.retraits.length})`);
  } else {
    console.log(`images : ${images.length}`);
    console.log(`noms   : ${noms.length}`);
  }
  console.log("par set :", releve.parSet);
  console.log(
    `figurier officiel : ${releve.figurier} cartes · nos cartes : ${releve.notres} · ${releve.refuses} refusées (chiffres discordants) · ${releve.sansImage} sans image`,
  );

  // Une relève qui maigrit veut presque toujours dire que le figurier a mal répondu,
  // pas que des cartes ont disparu. Sans ce garde-fou, un écrit de trop retirait leurs
  // images à des cartes en plein direct.
  if (precedent) {
    const perte = Object.keys(precedent.images ?? {}).length - images.length;
    if (perte > Object.keys(precedent.images ?? {}).length * 0.1 && !force) {
      console.error(`\nRefus d'écrire : ${perte} images en moins qu'au relevé précédent. Relancer, ou --force si c'est voulu.`);
      process.exit(1);
    }
  }

  if (sec) {
    console.log("\nEssai à blanc : rien n'a été écrit.");
    return;
  }

  const trier = (o: Record<string, string>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  const sortie: Sortie = {
    source: API,
    langue: "zh-Hans",
    releve: new Date().toISOString().slice(0, 10),
    parSet: releve.parSet,
    images: trier(releve.images),
    noms: trier(releve.noms),
  };
  await writeFile(FICHIER, JSON.stringify(sortie, null, 2) + "\n", "utf8");
  console.log("\ndata/cards-zh.json écrit.");
}

main();
