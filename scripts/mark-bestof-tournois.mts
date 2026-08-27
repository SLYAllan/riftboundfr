/**
 * Marque les best-of d'un tournoi déjà seedé : pour chaque Légende jouée, la liste
 * la mieux classée passe en `featured` et apparaît dans /decks?cat=bestof.
 *
 * Rien n'est créé ni réécrit : on ne fait que lever un drapeau sur des decks qui
 * viennent du scrape brut. Idempotent (les autres decks du tournoi repassent à
 * featured=false).
 *
 * Usage : npx tsx scripts/mark-bestof-tournois.mts "Beijing Regional Open" "..."
 *
 * `--sauf "<Légende>"` écarte une Légende du calcul, autant de fois que besoin.
 * À employer quand on SAIT que le vrai n°1 d'une Légende n'a pas publié sa
 * liste : le script ne voit que les listes publiées, il désignerait alors le
 * mieux classé d'entre elles, ce qui est faux. Barcelone en donne deux cas —
 * Annie et Viktor, dont les n°1 (#148 et #69) n'ont rien envoyé, là où le mieux
 * classé publié est #683 et #107. Sans ce filtre, deux best-of faux partent en
 * ligne sans le moindre signe. Le savoir vient d'une source extérieure (le
 * classement complet, l'article officiel), jamais d'une supposition.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rank = (placement: string | null): number | null => {
  const m = placement?.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

const cleLegende = (nom: string) => nom.toLowerCase().replace(/[^a-z0-9]/g, "");

async function main() {
  const args = process.argv.slice(2);
  const contexts: string[] = [];
  const ecartees = new Set<string>();
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--sauf") {
      const legende = args[++i];
      if (!legende) {
        console.error("--sauf attend un nom de Légende.");
        process.exit(1);
      }
      ecartees.add(cleLegende(legende));
    } else contexts.push(args[i]);
  }
  if (!contexts.length) {
    console.error("Donne au moins un tournoi (tournamentContext exact).");
    process.exit(1);
  }

  for (const ctx of contexts) {
    const decks = await prisma.deck.findMany({
      where: { tournamentContext: ctx, published: true },
      select: { id: true, legendName: true, placement: true, featured: true },
    });
    if (!decks.length) {
      console.log(`${ctx} : aucun deck, ignoré`);
      continue;
    }

    const best = new Map<string, { id: string; r: number }>();
    for (const d of decks) {
      if (ecartees.has(cleLegende(d.legendName))) continue;
      const r = rank(d.placement);
      if (r === null) continue; // sans classement, on ne peut pas dire "le meilleur"
      const cur = best.get(d.legendName);
      if (!cur || r < cur.r) best.set(d.legendName, { id: d.id, r });
    }

    const keep = new Set([...best.values()].map((b) => b.id));
    const toAdd = [...keep].filter((id) => !decks.find((d) => d.id === id)!.featured);
    const toDrop = decks.filter((d) => d.featured && !keep.has(d.id)).map((d) => d.id);

    if (toAdd.length) await prisma.deck.updateMany({ where: { id: { in: toAdd } }, data: { featured: true } });
    if (toDrop.length) await prisma.deck.updateMany({ where: { id: { in: toDrop } }, data: { featured: false } });

    console.log(
      `${ctx} : ${keep.size} best-of sur ${decks.length} listes (+${toAdd.length} / -${toDrop.length})`,
    );
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
