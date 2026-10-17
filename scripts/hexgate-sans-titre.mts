/**
 * Complète `data/hexgate-cartes-sans-titre.json` pour un relevé hexgate.
 *
 *   npx tsx --env-file=.env scripts/hexgate-sans-titre.mts 281 287 288
 *
 * Depuis le 7 octobre 2026 (tournoi 281), hexgate écrit les Champions sans leur
 * titre : « Kennen » pour deux cartes différentes, VEN-113 et VEN-135. La table
 * rend le vrai nom ; la conversion ET le validateur la lisent. Une ligne fausse
 * les tromperait donc tous les deux : elle n'entre que sur preuve.
 *
 * Preuve exigée : l'image que l'API hexgate affiche pour ce numéro désigne une
 * seule carte de la base, du même personnage et de la même énergie, et le numéro
 * hexgate désigne la même carte. Sinon la ligne n'est PAS écrite : le script la
 * liste, à trancher à la main (FND-196 s'affiche avec l'image d'OGN-197, et FND
 * n'est pas un set de la base).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";

const TABLE = "data/hexgate-cartes-sans-titre.json";
const RACINE_BRUT = "data/raw-scrapes/hexgate";
const NAVIGATEUR =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";

interface CarteBrute { card_no: string; en_name: string; slot_type: string; energy: number | null }
interface DeckBrut { source: string; deck_id: number; cartes: CarteBrute[] }
interface CarteApi { card_no: string; image_path: string | null; energy: number | null }

const ids = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
if (!ids.length) {
  console.error("Usage : npx tsx --env-file=.env scripts/hexgate-sans-titre.mts <id> [<id>…]");
  process.exit(1);
}

const table = JSON.parse(readFileSync(TABLE, "utf8")) as {
  commentaire: string;
  cartes: Record<string, { nom: string; preuve: string }>;
};
const base = await prisma.card.findMany({ select: { name: true, riftboundId: true, energy: true } });
const noms = new Set(base.map((c) => c.name.trim().toLowerCase()));
const personnage = (nom: string) => nom.split(",")[0].trim().toLowerCase();

// Une seule lecture d'API par numéro : le premier deck qui porte la carte.
const aVoir = new Map<string, { carte: CarteBrute; source: string }>();
for (const id of ids) {
  const brut = JSON.parse(readFileSync(join(RACINE_BRUT, `tournoi-${id}-decks.json`), "utf8")) as DeckBrut[];
  for (const deck of brut) {
    for (const c of deck.cartes) {
      if (["legend", "rune", "battlefield"].includes(c.slot_type)) continue;
      if (noms.has(c.en_name.trim().toLowerCase()) || table.cartes[c.card_no] || aVoir.has(c.card_no)) continue;
      aVoir.set(c.card_no, { carte: c, source: deck.source });
    }
  }
}
console.log(`${aVoir.size} numéro(s) sans nom reconnu, hors table`);

const aTrancher: string[] = [];
for (const [numero, { carte, source }] of aVoir) {
  const api = source.replace("hexgate.cn/tournaments/", "hexgate.cn/api/tournaments/");
  const rep = await fetch(api, { headers: { "user-agent": NAVIGATEUR } });
  if (!rep.ok) {
    aTrancher.push(`${numero} ${carte.en_name} : ${rep.status} sur ${api}`);
    continue;
  }
  const corps = (await rep.json()) as { cards?: CarteApi[] };
  if (!Array.isArray(corps.cards)) {
    aTrancher.push(`${numero} ${carte.en_name} : réponse sans « cards » sur ${api}`);
    continue;
  }
  const image = corps.cards.find((c) => c.card_no === numero)?.image_path ?? null;
  // « card_images/OGN-246a_298.webp » → « ogn-246a-298 » ; « VEN-167.webp » → « ven-167- » + total.
  const cle = image?.replace(/^.*\//, "").replace(/\.\w+$/, "").toLowerCase().replace("_", "-");
  const candidates = cle
    ? base.filter((c) => c.riftboundId === cle || c.riftboundId.startsWith(`${cle}-`))
    : [];
  const nomsCandidats = [...new Set(candidates.map((c) => c.name.replace(/\s*\(.*\)$/, "")))];
  // Le numéro et l'image peuvent désigner deux impressions de la même carte
  // (Jayce SFD-084 affiché avec sa réimpression VEN-175) : on compare les cartes.
  const [setHex, numHex] = numero.toLowerCase().match(/^([a-z0-9]+)-(\d+)/)?.slice(1) ?? [];
  const motifNumero = new RegExp(`^${setHex}-${numHex?.padStart(3, "0")}[a-z*]*-`);
  const nomsAuNumero = new Set(
    base.filter((c) => motifNumero.test(c.riftboundId)).map((c) => c.name.replace(/\s*\(.*\)$/, "")),
  );
  const numeroConcorde = nomsAuNumero.size === 1 && nomsAuNumero.has(nomsCandidats[0]);
  const carteBase = candidates[0];

  const refus =
    !image ? "pas d'image dans l'API"
    : nomsCandidats.length !== 1 ? `image ${image} : ${nomsCandidats.length} carte(s) en base`
    : personnage(nomsCandidats[0]) !== personnage(carte.en_name) ? `image ${image} = ${nomsCandidats[0]}, autre personnage`
    : carteBase.energy !== carte.energy ? `image ${image} = ${nomsCandidats[0]}, énergie ${carteBase.energy} ≠ ${carte.energy}`
    : !numeroConcorde ? `image ${image} = ${nomsCandidats[0]}, mais le numéro ${numero} ne concorde pas`
    : null;
  if (refus) {
    aTrancher.push(`${numero} ${carte.en_name} : ${refus} (${api})`);
    continue;
  }
  table.cartes[numero] = {
    nom: nomsCandidats[0],
    preuve: `${api} : image ${image}, ${carte.energy} énergie, numéro concordant`,
  };
  console.log(`  + ${numero} ${carte.en_name} → ${nomsCandidats[0]}`);
  await new Promise((r) => setTimeout(r, 500)); // on ne martèle pas la source
}

table.cartes = Object.fromEntries(Object.entries(table.cartes).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(TABLE, `${JSON.stringify(table, null, 1)}\n`);

if (aTrancher.length) {
  console.log(`\n${aTrancher.length} à trancher à la main (rien d'écrit pour eux) :`);
  for (const l of aTrancher) console.log(`  ${l}`);
}
await prisma.$disconnect();
process.exit(aTrancher.length ? 1 : 0);
