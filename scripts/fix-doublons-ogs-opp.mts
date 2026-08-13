// Retire les champions comptés deux fois dans les decks.
//
// Le problème : Riftcodex publie 14 cartes sous DEUX impressions, « Proving
// Grounds » (préfixe OGS) et sa réimpression Organized Play (préfixe OPP). Même
// carte, même illustration, seule la rareté change (« Promo »). Nos decks
// portaient parfois les deux lignes à la fois dans la section legend, et la page
// affichait alors « Champion (2) » avec deux fois la même carte.
//
// Ce que dit la source : riftdecks cite TOUJOURS l'impression OGS (8964
// occurrences dans data/raw-scrapes/, zéro OPP) et annonce « champion (1) ».
// Le deuxième exemplaire ne vient donc d'aucune source : c'est notre pipeline
// qui l'a ajouté. On supprime la ligne OPP et on garde OGS, sans jamais toucher
// aux quantités : un deck qui avait un champion en garde un.
//
// Usage :
//   npx tsx --env-file=.env scripts/fix-doublons-ogs-opp.mts            liste sans rien changer
//   npx tsx --env-file=.env scripts/fix-doublons-ogs-opp.mts --apply    applique
import { prisma } from "../src/lib/prisma";

const applique = process.argv.includes("--apply");

const lignes = await prisma.deckCard.findMany({
  where: { card: { set: { in: ["OGS", "OPP"] } } },
  include: {
    card: { select: { name: true, set: true, riftboundId: true } },
    deck: { select: { slug: true, published: true } },
  },
});

// Regroupe par deck + section + nom de carte : c'est là que le doublon se voit.
const groupes = new Map<string, typeof lignes>();
for (const l of lignes) {
  const cle = `${l.deckId}|${l.section}|${l.card.name}`;
  groupes.set(cle, [...(groupes.get(cle) ?? []), l]);
}

const aSupprimer: typeof lignes = [];
const suspects: string[] = [];

for (const groupe of groupes.values()) {
  if (groupe.length < 2) continue;
  const ogs = groupe.filter((l) => l.card.set === "OGS");
  const opp = groupe.filter((l) => l.card.set === "OPP");
  if (ogs.length !== 1 || opp.length === 0) continue;

  // Garde-fou : on ne touche qu'aux exemplaires uniques. Une quantité autre que
  // 1 voudrait dire que le deck joue vraiment plusieurs copies, et la décision
  // ne serait plus évidente : on le signale au lieu de trancher tout seul.
  if (groupe.some((l) => l.quantity !== 1)) {
    suspects.push(`${groupe[0].deck.slug} | ${groupe[0].card.name} | ${groupe.map((l) => `${l.card.riftboundId}=${l.quantity}`).join(" ")}`);
    continue;
  }
  aSupprimer.push(...opp);
}

const parDeck = new Map<string, typeof lignes>();
for (const l of aSupprimer) parDeck.set(l.deck.slug, [...(parDeck.get(l.deck.slug) ?? []), l]);

console.log(`${parDeck.size} decks, ${aSupprimer.length} lignes en trop\n`);
for (const [slug, l] of parDeck) {
  console.log(`  ${slug}${l[0].deck.published ? "" : " (non publié)"}`);
  for (const x of l) console.log(`     retire ${x.card.riftboundId} ${x.card.name} (section ${x.section})`);
}

if (suspects.length > 0) {
  console.log(`\n${suspects.length} cas à regarder à la main (quantité autre que 1) :`);
  console.log(suspects.map((s) => `  ${s}`).join("\n"));
}

if (!applique) {
  console.log("\nRien n'a été modifié. Relancer avec --apply pour appliquer.");
} else {
  const { count } = await prisma.deckCard.deleteMany({ where: { id: { in: aSupprimer.map((l) => l.id) } } });
  console.log(`\n${count} lignes supprimées.`);
}
process.exit(0);
