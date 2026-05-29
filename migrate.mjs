import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tableNames = tables.map((t) => t.tablename);

    if (!tableNames.includes("Card") || !tableNames.includes("DeckLike")) {
      console.log("Tables missing, running schema push...");
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --skip-generate --accept-data-loss", {
        stdio: "inherit",
        env: { ...process.env, PATH: process.env.PATH },
      });
    } else {
      console.log(`Database OK (${tableNames.length} tables found)`);
    }
  } catch (e) {
    console.error("Migration check failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
