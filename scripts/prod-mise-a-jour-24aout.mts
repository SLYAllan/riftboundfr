/**
 * Mise à jour de la base de PRODUCTION, passe du 24 août 2026.
 *
 *   DATABASE_URL="<url du tunnel>" npx tsx scripts/prod-mise-a-jour-24aout.mts
 *   DATABASE_URL="<url du tunnel>" npx tsx scripts/prod-mise-a-jour-24aout.mts --ecrire
 *
 * Sans `--ecrire` il ne touche à rien : il compte et il dit ce qu'il changerait.
 * Le seed des 692 listes chinoises n'est PAS ici : il passe par
 * `prisma/seed-scraped-decks.ts hexgate`, avec son préfixe, jamais sans argument.
 *
 * Deux corrections, toutes les deux déjà passées en local :
 *
 * 1. Deux Légendes vivent en base sous deux orthographes (« Rek'Sai » contre
 *    « Rek'sai », « Grandmaster at Arms » contre « At Arms »). La carte n'existe
 *    que sous une forme : les compteurs par Légende se coupaient en deux et une
 *    page annonçait 347 listes là où il y en a 387.
 *
 * 2. La production nomme encore deux tournois `RQ Atlanta 2026` et `RQ Lille 2026`.
 *    `tournament-flags.ts` les cherche sous `Atlanta Regional Qualifier` et
 *    `Lille Regional Qualifier` : sans le drapeau, la page perd son pays, sa date
 *    et son nombre de joueurs. Le renommage attendait la réouverture du tunnel.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ecrire = process.argv.includes("--ecrire");

const ORTHOGRAPHES: Array<[string, string]> = [
  ["Rek'Sai, Void Burrower", "Rek'sai, Void Burrower"],
  ["Jax, Grandmaster at Arms", "Jax, Grandmaster At Arms"],
];

const CONTEXTES: Array<[string, string]> = [
  ["RQ Atlanta 2026", "Atlanta Regional Qualifier"],
  ["RQ Lille 2026", "Lille Regional Qualifier"],
  // Deux City Challenge datées du 9 août en production, du 8 partout ailleurs.
  // Ce sont les mêmes tournois : 123 et 119 decks, joueur et place identiques d'un
  // côté comme de l'autre. `tournament-flags.ts` ne connaît que le 8, alors ces
  // deux pages perdent leur pays, leur date et leur nombre de joueurs.
  ["S4 Beijing City Challenge (2026-08-09)", "S4 Beijing City Challenge (2026-08-08)"],
  ["S4 Chengdu City Challenge (2026-08-09)", "S4 Chengdu City Challenge (2026-08-08)"],
];

async function main() {
  console.log(`=== base : ${await prisma.deck.count()} decks, ${await prisma.card.count()} cartes`);
  console.log(ecrire ? "=== MODE ÉCRITURE" : "=== essai à blanc, rien ne sera écrit");

  console.log("\n-- orthographes de Légende");
  for (const [faux, bon] of ORTHOGRAPHES) {
    const n = await prisma.deck.count({ where: { legendName: faux } });
    const dejaBon = await prisma.deck.count({ where: { legendName: bon } });
    console.log(`   ${JSON.stringify(faux)} : ${n} decks · ${JSON.stringify(bon)} : ${dejaBon} decks`);
    if (ecrire && n) {
      const r = await prisma.deck.updateMany({ where: { legendName: faux }, data: { legendName: bon } });
      console.log(`      recalés : ${r.count}`);
    }
  }

  console.log("\n-- noms de tournoi");
  for (const [vieux, neuf] of CONTEXTES) {
    const n = await prisma.deck.count({ where: { tournamentContext: vieux } });
    const dejaBon = await prisma.deck.count({ where: { tournamentContext: neuf } });
    console.log(`   ${JSON.stringify(vieux)} : ${n} decks · ${JSON.stringify(neuf)} : ${dejaBon} decks`);
    if (ecrire && n) {
      const r = await prisma.deck.updateMany({
        where: { tournamentContext: vieux },
        data: { tournamentContext: neuf },
      });
      console.log(`      renommés : ${r.count}`);
    }
  }

  console.log("\n-- 128 decks abîmés sous « Shanghai City Challenge » (sans date)");
  // Ils datent du 27 mai, n'ont aucune source, et surtout : leur deck principal
  // compte entre 21 et 38 cartes là où une liste réelle en a 40. Leurs noms de
  // joueurs sont tronqués (« FG », « XXT », « RS\_MoeNce »). 89 des 128 recoupent
  // le Shanghai du 23 novembre, déjà en base sous sa vraie date. Aucun j'aime, donc
  // rien à perdre. Effacés à la demande d'Allan, le 24 août.
  const abimes = await prisma.deck.findMany({
    where: { tournamentContext: "Shanghai City Challenge" },
    select: { id: true, _count: { select: { cards: true } } },
  });
  const tailles = abimes.map((d) => d._count.cards).sort((a, b) => a - b);
  console.log(`   ${abimes.length} decks · cartes par deck : de ${tailles[0] ?? 0} à ${tailles.at(-1) ?? 0}`);
  if (abimes.length && tailles.at(-1)! >= 40) {
    console.log("   ARRÊT : au moins un deck est complet, ce ne sont pas les mêmes. Rien effacé.");
  } else if (ecrire && abimes.length) {
    const r = await prisma.deck.deleteMany({ where: { id: { in: abimes.map((d) => d.id) } } });
    console.log(`      effacés : ${r.count}`);
  }

  console.log("\n-- tournois chinois attendus (seed séparé)");
  const attendus = [
    "S4 Beijing City Challenge (2026-08-23)",
    "S4 Shenzhen City Challenge (2026-08-23)",
    "S4 Suzhou City Challenge (2026-08-23)",
    "S4 Guangzhou City Challenge (2026-08-16)",
    "S4 Shanghai City Challenge (2026-08-22)",
    "S4 Guangzhou City Challenge (2026-08-22)",
  ];
  for (const c of attendus) {
    console.log(`   ${String(await prisma.deck.count({ where: { tournamentContext: c } })).padStart(4)} ${c}`);
  }

  await prisma.$disconnect();
}

main();
