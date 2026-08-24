/**
 * Répare quatre défauts de la table des decks, trouvés en enquêtant sur Hartford
 * et Bologna le 24 août 2026.
 *
 *   DATABASE_URL="…" npx tsx scripts/reparer-decks-24aout.mts
 *   DATABASE_URL="…" npx tsx scripts/reparer-decks-24aout.mts --ecrire
 *
 * Sans `--ecrire`, il compte et ne touche à rien.
 *
 * Quatre choses à réparer :
 *
 * 1. `prisma/seed-scraped-decks.ts` traduisait « Bologna Regional Qualifier » en
 *    « RQ Bologna 2026 » — un nom que `tournament-flags.ts` ne connaît pas. Cinq
 *    tournois perdaient ainsi leur pays, leur date et leur nombre de joueurs sur
 *    leur propre page. La table du seed est corrigée ; ici on rattrape les lignes
 *    déjà écrites.
 *
 * 2. Les deux bases ont dérivé du disque sur Hartford et Bologna : la base locale
 *    porte 142 et 126 decks là où le disque en a 105 et 120, la production 47 et
 *    148. Les 225 fichiers du disque, eux, sont vérifiés un par un contre le relevé
 *    brut. C'est donc le disque qui fait foi.
 *
 * 3. Le suffixe anglais des places ne regardait que 1, 2 et 3 : la base dit
 *    « 71th » et « 233th » au lieu de « 71st » et « 233rd ». Ce n'est pas
 *    qu'une faute d'affichage — la place entre dans la clé de dédoublonnage du
 *    seed, donc chaque passage recréait ces decks en double.
 *
 * 4. Le nom de la Légende venait du fichier, pas de la carte : « Rek'Sai » d'un
 *    côté, « Rek'sai » de l'autre. Mêmes conséquences, et les compteurs par
 *    Légende se coupaient en deux.
 *
 * Les causes 1, 3 et 4 sont corrigées dans `prisma/seed-scraped-decks.ts` ; ici on
 * rattrape les lignes déjà écrites.
 *
 * On ne supprime QUE les decks absents du disque ET sans « j'aime » : la production
 * en porte 8 sur Hartford, et un « j'aime » est une donnée d'utilisateur, pas un
 * sous-produit d'import. Ce qui manque se rajoute avec
 * `prisma/seed-scraped-decks.ts hartford bologna-rq`, jamais sans préfixe.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const ecrire = process.argv.includes("--ecrire");
// La production garde ses best-of comme des lignes à part (slug « best-of-… »,
// `featured`), la base locale les marque sur la ligne du classement. Deux modèles,
// donc une suppression juste d'un côté est une perte de contenu de l'autre :
// `--sans-suppression` laisse les lignes en trop tranquilles.
const supprimer = !process.argv.includes("--sans-suppression");

const RENOMMAGES: Array<[string, string]> = [
  ["RQ Atlanta 2026", "Atlanta Regional Qualifier"],
  ["RQ Bologna 2026", "Bologna Regional Qualifier"],
  ["RQ Houston 2025", "Houston Regional Qualifier"],
  ["RQ Las Vegas 2026", "Las Vegas Regional Qualifier"],
  ["RQ Lille 2026", "Lille Regional Qualifier"],
];

/**
 * La place, réduite au nombre. Les deux bases n'écrivent pas le suffixe pareil :
 * la production dit « 3e » et « 48e » là où le disque dit 3 et 48, et certaines
 * lignes n'ont pas de place du tout. Comparer les chaînes ne donnait aucune
 * correspondance ; on compare le nombre.
 */
const placeNue = (p: string | number | null): string => {
  const m = String(p ?? "").match(/\d+/);
  return m ? m[0] : "";
};

/** riftdecks laisse passer des lettres cyrilliques qui ressemblent aux latines. */
const HOMOGLYPHES: Record<string, string> = {
  "а": "a", "е": "e", "о": "o", "с": "c", "р": "p",
  "х": "x", "у": "y", "і": "i", "А": "A", "Е": "E",
  "О": "O", "С": "C", "Р": "P", "Х": "X", "І": "I",
};
/** Le suffixe anglais correct : « 71st », pas « 71th ». */
function ordinalAnglais(n: number): string {
  const reste = n % 100;
  if (reste >= 11 && reste <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

const cleJoueur = (n: string | null) =>
  (n ?? "").replace(/./g, (c) => HOMOGLYPHES[c] ?? c).trim().toLowerCase();

function surDisque(tournoi: string) {
  const racine = "data/decklists";
  const cles = new Map<string, number>();
  for (const dossier of readdirSync(racine)) {
    let noms: string[];
    try {
      noms = readdirSync(join(racine, dossier));
    } catch {
      continue;
    }
    for (const f of noms) {
      if (!f.endsWith(".json")) continue;
      const o = JSON.parse(readFileSync(join(racine, dossier, f), "utf8"));
      if (String(o.tournament ?? "") !== tournoi) continue;
      const cle = `${cleJoueur(o.player)}|${placeNue(o.placement)}`;
      cles.set(cle, (cles.get(cle) ?? 0) + 1);
    }
  }
  return cles;
}

async function main() {
  console.log(ecrire ? "=== MODE ÉCRITURE" : "=== essai à blanc, rien ne sera écrit");

  console.log("\n-- noms de tournoi que tournament-flags.ts ne connaît pas");
  for (const [vieux, neuf] of RENOMMAGES) {
    const n = await prisma.deck.count({ where: { tournamentContext: vieux } });
    if (!n) continue;
    console.log(`   ${String(n).padStart(4)} « ${vieux} » -> « ${neuf} »`);
    if (ecrire) {
      const r = await prisma.deck.updateMany({
        where: { tournamentContext: vieux },
        data: { tournamentContext: neuf },
      });
      console.log(`      renommés : ${r.count}`);
    }
  }

  // Les places d'abord : tant que « 71th » et « 71st » cohabitent, le rapprochement
  // avec le disque voit deux decks là où il n'y en a qu'un.
  console.log("\n-- places à suffixe anglais faux (« 71th » au lieu de « 71st »)");
  const enTh = await prisma.deck.findMany({
    where: { placement: { endsWith: "th" } },
    select: { id: true, placement: true },
  });
  const aCorriger = enTh
    .map((d) => ({ id: d.id, avant: d.placement!, apres: ordinalAnglais(Number(d.placement!.replace(/[^0-9]/g, ""))) }))
    .filter((x) => x.avant !== x.apres && Number.isFinite(Number(x.avant.replace(/[^0-9]/g, ""))));
  console.log(`   ${aCorriger.length} places fausses sur ${enTh.length} qui finissent en « th »`);
  for (const x of aCorriger.slice(0, 5)) console.log(`      ${x.avant} -> ${x.apres}`);
  if (ecrire) {
    for (const x of aCorriger) {
      await prisma.deck.update({ where: { id: x.id }, data: { placement: x.apres } });
    }
    console.log(`      corrigées : ${aCorriger.length}`);
  }

  console.log("\n-- noms de Légende qui ne sont pas ceux de la carte");
  const cartesLegende = await prisma.card.findMany({ where: { type: "Legend" }, select: { name: true } });
  const canon = new Map(cartesLegende.map((c) => [c.name.toLowerCase(), c.name]));
  const groupes = await prisma.deck.groupBy({ by: ["legendName"], _count: true });
  let recales = 0;
  for (const g of groupes) {
    const bon = canon.get((g.legendName ?? "").toLowerCase());
    if (!bon || bon === g.legendName) continue;
    console.log(`   ${String(g._count).padStart(4)} « ${g.legendName} » -> « ${bon} »`);
    recales += g._count;
    if (ecrire) {
      await prisma.deck.updateMany({ where: { legendName: g.legendName }, data: { legendName: bon } });
    }
  }
  if (!recales) console.log("   aucun");

  console.log("\n-- decks en base qui n'ont aucun fichier derrière eux");
  for (const [tournoiFichier, contextes] of [
    ["RQ Hartford 2026", ["RQ Hartford 2026"]],
    // Le renommage n'a peut-être pas encore eu lieu : on regarde les deux noms.
    ["Bologna Regional Qualifier", ["Bologna Regional Qualifier", "RQ Bologna 2026"]],
  ] as const) {
    const ctx = contextes[0];
    const disque = surDisque(tournoiFichier);
    const enBase = await prisma.deck.findMany({
      where: { tournamentContext: { in: [...contextes] } },
      // Du plus ancien au plus récent : quand deux lignes décrivent le même deck,
      // c'est la vieille qu'on garde. Elle peut être le best-of du tournoi, porter
      // des « j'aime » ou être mise en avant ; la neuve n'est qu'un doublon de seed.
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        playerName: true,
        placement: true,
        featured: true,
        _count: { select: { deckLikes: true } },
      },
    });
    const restant = new Map(disque);
    const aEffacer: string[] = [];
    const gardes: string[] = [];
    for (const d of enBase) {
      const cle = `${cleJoueur(d.playerName)}|${placeNue(d.placement)}`;
      const n = restant.get(cle) ?? 0;
      if (n > 0) {
        restant.set(cle, n - 1);
        continue;
      }
      if (d._count.deckLikes > 0 || d.featured) gardes.push(`${d.placement} ${d.playerName}`);
      else aEffacer.push(d.id);
    }
    const manquants = [...restant.values()].reduce((s, n) => s + n, 0);
    console.log(
      `   ${ctx} : disque ${[...disque.values()].reduce((s, n) => s + n, 0)} · base ${enBase.length} · sans fichier ${aEffacer.length + gardes.length} · manquants en base ${manquants}${supprimer ? "" : " · suppression désactivée"}`,
    );
    if (gardes.length) console.log(`      gardés malgré tout (ils ont des j'aime) : ${gardes.join(", ")}`);
    if (!ecrire && aEffacer.length) {
      const apercu = await prisma.deck.findMany({
        where: { id: { in: aEffacer.slice(0, 8) } },
        select: { playerName: true, placement: true, legendName: true },
      });
      for (const a of apercu) console.log(`      sans fichier : ${a.placement} ${a.playerName} (${a.legendName})`);
    }
    if (!ecrire && manquants) {
      for (const [cle, n] of restant) if (n > 0) console.log(`      absent de la base : ${cle}`);
    }
    if (ecrire && supprimer && aEffacer.length) {
      const r = await prisma.deck.deleteMany({ where: { id: { in: aEffacer } } });
      console.log(`      effacés : ${r.count}`);
    }
  }

  console.log("\nCe qui manque se rajoute avec :");
  console.log("   npx tsx prisma/seed-scraped-decks.ts hartford bologna-rq");
  await prisma.$disconnect();
}

main();
