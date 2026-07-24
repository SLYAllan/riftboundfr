// Errata officiel du 23 juillet 2026 (publié avec les règles Vendetta) :
// https://playriftbound.com/en-us/news/announcements/vendetta-errata-updates/
// 8 cartes. On remplace before -> after dans textPlain ET textRich (textRich =
// même texte dans des <p>). Les éditions alt-art / overnumbered partagent le même
// texte -> le WHERE porte sur le contenu, pas le nom.
// Données : src/lib/errata-2026-07.ts (source unique, partagée avec /guides/ban-list).
// Rejouable : si le texte est déjà à jour, 0 ligne touchée.
import { PrismaClient } from "@prisma/client";
import { ERRATA_2026_07 } from "../src/lib/errata-2026-07";

const prisma = new PrismaClient();

async function main() {
  for (const e of ERRATA_2026_07) {
    const touched = await prisma.$executeRaw`
      UPDATE "Card"
      SET "textPlain" = replace("textPlain", ${e.before}, ${e.after}),
          "textRich" = replace("textRich", ${e.before}, ${e.after})
      WHERE name LIKE ${e.name + "%"} AND "textPlain" LIKE ${"%" + e.before + "%"}
    `;
    console.log(`${e.name} : ${touched} édition(s) mise(s) à jour`);
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
