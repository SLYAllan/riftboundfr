import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Les articles "meilleur-deck-<legende>" (seedés par seed-fiche-articles.mts) font
// désormais doublon avec la section /legendes (qui affiche directement les decklists).
// On les supprime. FK : Deck.sourceArticleId est optionnel (SetNull au delete), les
// commentaires cascadent. Aucune decklist réelle n'est perdue (ces articles rendaient
// des codes de deck en texte, pas des lignes Deck).
async function main() {
  const before = await prisma.article.count({ where: { slug: { startsWith: "meilleur-deck-" } } });
  console.log(`Articles "meilleur-deck-*" présents : ${before}`);
  if (before === 0) {
    console.log("Rien à supprimer.");
    return;
  }
  const res = await prisma.article.deleteMany({ where: { slug: { startsWith: "meilleur-deck-" } } });
  console.log(`✅ ${res.count} articles supprimés.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
