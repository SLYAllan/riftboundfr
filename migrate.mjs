import { PrismaClient } from "@prisma/client";
import { tablesManquantes } from "./migrate-schema.mjs";

const prisma = new PrismaClient();

// Deux échecs très différents, deux codes de sortie. Un schéma vide ou incomplet
// ne se répare pas tout seul : il demande un « prisma db push », et démarrer
// quand même donne un site qui répond 500 partout en se disant en ligne. Une base
// injoignable, elle, revient d'elle-même — c'est l'accroc qui avait mis le site à
// terre en boucle de redémarrage le 16 août. Le premier bloque, le second passe.
const SCHEMA_INCOMPLET = 1;
const VERIFICATION_IMPOSSIBLE = 2;

class SchemaIncomplet extends Error {}

async function verifierSchema() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const tableNames = tables.map((table) => table.tablename);

  if (tableNames.length === 0) {
    throw new SchemaIncomplet(
      "Base vide : initialisez le schéma avec « npx prisma db push » avant de démarrer le conteneur.",
    );
  }

  const missingTables = tablesManquantes(tableNames);
  if (missingTables.length > 0) {
    throw new SchemaIncomplet(
      `Schéma existant incomplet ; tables manquantes : ${missingTables.join(", ")}. Aucune modification de la base n'a été faite.`,
    );
  }

  console.log(`Database OK (${tableNames.length} tables found)`);
}

try {
  await verifierSchema();
} catch (error) {
  console.error("Vérification du schéma échouée :", error.message);
  process.exitCode = error instanceof SchemaIncomplet ? SCHEMA_INCOMPLET : VERIFICATION_IMPOSSIBLE;
} finally {
  await prisma.$disconnect();
}
