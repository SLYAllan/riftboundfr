/**
 * Marque les best-of d'un tournoi déjà seedé : pour chaque Légende jouée, la liste
 * la mieux classée passe en `featured` et apparaît dans /decks?cat=bestof.
 *
 * Rien n'est créé ni réécrit : on ne fait que lever un drapeau sur des decks qui
 * viennent du scrape brut. Idempotent (les autres decks du tournoi repassent à
 * featured=false).
 *
 * Usage : npx tsx scripts/mark-bestof-tournois.mts "Beijing Regional Open" "..."
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const rank = (placement: string | null): number | null => {
  const m = placement?.match(/\d+/);
  return m ? parseInt(m[0], 10) : null;
};

async function main() {
  const contexts = process.argv.slice(2);
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
