/**
 * Supprime en base un import ancien qui double un tournoi déjà seedé proprement.
 *
 *   npx tsx --env-file=.env scripts/supprimer-doublons-sans-source.mts "<contexte à retirer>" "<contexte à garder>"
 *   … --appliquer   pour supprimer pour de vrai
 *
 * Le cas typique : un même tournoi a été importé deux fois, une fois sans URL de
 * source et sans date dans le nom (« Shanghai City Challenge »), une fois avec
 * (« Shanghai City Challenge (2025-11-23) »). Les decks sans source sont les
 * anciens : ils ne se recoupent contre rien et faussent les compteurs.
 *
 * Trois garde-fous avant de toucher à quoi que ce soit :
 *   1. aucun deck du contexte à retirer ne porte d'URL de source ;
 *   2. chacun retrouve son jumeau dans le contexte à garder, par classement et
 *      par Légende ;
 *   3. le contexte à garder compte au moins autant de decks.
 * Au moindre écart, on n'efface rien.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== "--appliquer");
  const appliquer = process.argv.includes("--appliquer");
  const [aRetirer, aGarder] = args;
  if (!aRetirer || !aGarder) {
    console.error('Usage : npx tsx --env-file=.env scripts/supprimer-doublons-sans-source.mts "<à retirer>" "<à garder>" [--appliquer]');
    process.exit(1);
  }

  const select = { id: true, placement: true, legendName: true, playerName: true, sourceUrl: true } as const;
  const vieux = await prisma.deck.findMany({ where: { tournamentContext: aRetirer }, select });
  const bons = await prisma.deck.findMany({ where: { tournamentContext: aGarder }, select });

  console.log(`« ${aRetirer} » : ${vieux.length} decks`);
  console.log(`« ${aGarder} » : ${bons.length} decks`);
  if (!vieux.length) return;

  const avecSource = vieux.filter((d) => d.sourceUrl);
  if (avecSource.length) {
    console.error(`REFUS : ${avecSource.length} deck(s) à retirer portent une URL de source. Ce ne sont pas de vieux imports.`);
    process.exit(1);
  }
  if (bons.length < vieux.length) {
    console.error("REFUS : le contexte à garder compte moins de decks que celui à retirer.");
    process.exit(1);
  }

  const cle = (d: { placement: string | null; legendName: string }) => `${d.placement}|${d.legendName.toLowerCase()}`;
  const presents = new Set(bons.map(cle));
  const orphelins = vieux.filter((d) => !presents.has(cle(d)));
  if (orphelins.length) {
    console.error(`REFUS : ${orphelins.length} deck(s) n'ont pas de jumeau dans « ${aGarder} ». Exemples :`);
    for (const o of orphelins.slice(0, 5)) console.error(`   ${o.placement} · ${o.legendName} · ${o.playerName}`);
    process.exit(1);
  }

  console.log(`\n${vieux.length} decks doublonnés, tous sans source et tous retrouvés dans « ${aGarder} ».`);
  if (!appliquer) {
    console.log("Rien n'a été supprimé. Relancer avec --appliquer.");
    return;
  }

  // Cartes, « j'aime » et commentaires partent en cascade (schema.prisma).
  const res = await prisma.deck.deleteMany({ where: { tournamentContext: aRetirer } });
  console.log(`${res.count} decks supprimés.`);
}

main().finally(() => prisma.$disconnect());
