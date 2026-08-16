import { PrismaClient } from "@prisma/client";
import { tablesManquantes } from "./migrate-schema.mjs";

const prisma = new PrismaClient();

async function verifierSchema() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  `;
  const tableNames = tables.map((table) => table.tablename);

  if (tableNames.length === 0) {
    throw new Error(
      "Base vide : initialisez le schéma avec « npx prisma db push » avant de démarrer le conteneur.",
    );
  }

  const missingTables = tablesManquantes(tableNames);
  if (missingTables.length > 0) {
    throw new Error(
      `Schéma existant incomplet ; tables manquantes : ${missingTables.join(", ")}. Aucune modification de la base n'a été faite.`,
    );
  }

  console.log(`Database OK (${tableNames.length} tables found)`);
}

try {
  await verifierSchema();
} catch (error) {
  console.error("Vérification du schéma échouée :", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
