/**
 * Les deux tableaux chiffrés de la section Vendetta de docs/META-KNOWLEDGE.md :
 * le champ complet et les résultats par tournoi.
 *
 *   npx tsx --env-file=.env scripts/tables-meta.mts Vendetta > tables.md
 *   npx tsx --env-file=.env scripts/tables-meta.mts tous
 *
 * Ils étaient recopiés à la main d'un relevé à l'autre, d'où des totaux qui ne
 * collaient plus au corpus. Les tableaux par p et IC viennent, eux, de tier-stats.
 */
import { chargerCorpus, bilanParLegende, seuilsDeCoupe } from "./corpus-tournois";
import { prisma } from "../src/lib/prisma";

const fr = (n: number, d = 2) => n.toFixed(d).replace(".", ",");
const mil = (n: number) => n.toLocaleString("fr-FR").replace(/ /g, " ");

const set = process.argv[2] === "tous" ? null : (process.argv[2] ?? "Vendetta");
const corpus = await chargerCorpus(set);
const bilans = bilanParLegende(corpus.places);
const total = [...bilans.values()].reduce((s, b) => s + b.joueurs, 0);
const totalCoupe = [...bilans.values()].reduce((s, b) => s + b.coupe, 0);
const totalTitres = [...bilans.values()].reduce((s, b) => s + b.titres, 0);

console.log("| Légende | Joueurs | Part | Coupe 10 % | Conversion | Titres | Tournois |");
console.log("|---|---:|---:|---:|---:|---:|---:|");
for (const [nom, b] of [...bilans].sort((a, c) => c[1].joueurs - a[1].joueurs)) {
  const tournois = new Set(corpus.places.filter((p) => p.legend === nom).map((p) => p.contexte)).size;
  console.log(
    `| ${nom} | ${b.joueurs} | ${fr((b.joueurs / total) * 100)} % | ${b.coupe} | ${fr((b.coupe / b.joueurs) * 100, 1)} % | ${b.titres} | ${tournois} |`,
  );
}
console.log(
  `\nTotal : **${mil(total)} joueurs classés, ${mil(totalCoupe)} places dans la coupe des 10 %, ${totalTitres} titres**. Conversion moyenne du format : **${fr((totalCoupe / total) * 100, 1)} %**.`,
);

// Résultats par tournoi : classés, coupe, vainqueur, listes publiées en base.
const seuils = seuilsDeCoupe(corpus.places);
const parTournoi = new Map<string, { classes: number; vainqueur: string }>();
for (const p of corpus.places) {
  const e = parTournoi.get(p.contexte) ?? { classes: 0, vainqueur: "" };
  e.classes++;
  // Une place sans Légende identifiée ne nomme pas de vainqueur : la case reste vide.
  if (p.rang === 1 && p.legend) e.vainqueur = p.legend;
  parTournoi.set(p.contexte, e);
}
const publiees = await prisma.deck.groupBy({
  by: ["tournamentContext"],
  _count: { _all: true },
  where: { tournamentContext: { in: [...parTournoi.keys()] } },
});
const nbListes = new Map(
  publiees.flatMap((d) => (d.tournamentContext ? [[d.tournamentContext, d._count._all] as const] : [])),
);

console.log("\n| Contexte | Joueurs classés | Coupe 10 % | Vainqueur | Listes publiées |");
console.log("|---|---:|---:|---|---:|");
for (const [ctx, e] of [...parTournoi].sort((a, b) => b[1].classes - a[1].classes)) {
  console.log(`| ${ctx} | ${e.classes} | ${seuils.get(ctx) ?? 0} | ${e.vainqueur} | ${nbListes.get(ctx) ?? 0} |`);
}
await prisma.$disconnect();
