// Applique en base tous les errata de src/lib/errata.ts. On remplace before ->
// after dans textPlain ET textRich (textRich = même texte dans des <p>). Les éditions alt-art / overnumbered partagent le même
// texte -> le WHERE porte sur le contenu, pas le nom.
// Rejouable : si le texte est déjà à jour, 0 ligne touchée.
import { PrismaClient } from "@prisma/client";
import { ERRATA } from "../src/lib/errata";

const prisma = new PrismaClient();

async function main() {
  for (const e of ERRATA) {
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
