import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tableNames = tables.map((t) => t.tablename);

    if (!tableNames.includes("Card")) {
      console.log("Tables missing, running schema push...");
      const { execSync } = await import("child_process");
      execSync("npx prisma db push --skip-generate --accept-data-loss", {
        stdio: "inherit",
        env: { ...process.env, PATH: process.env.PATH },
      });
    } else {
      console.log(`Database OK (${tableNames.length} tables found)`);
    }

    // Garantit la table DeckLike (likes par utilisateur sur les decks officiels)
    // via du SQL direct — le CLI prisma n'est pas dispo dans le conteneur runtime.
    if (!tableNames.includes("DeckLike")) {
      console.log("Creating DeckLike table...");
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "DeckLike" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "deckId" TEXT NOT NULL, CONSTRAINT "DeckLike_pkey" PRIMARY KEY ("id"))`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "DeckLike_userId_deckId_key" ON "DeckLike"("userId", "deckId")`,
      );
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DeckLike_deckId_idx" ON "DeckLike"("deckId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "DeckLike_userId_idx" ON "DeckLike"("userId")`);
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "DeckLike" ADD CONSTRAINT "DeckLike_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
      } catch (e) {
        console.log("DeckLike FK skipped:", e.message);
      }
      console.log("DeckLike table ready.");
    }

    // Garantit la table CollectionItem (collection de cartes par utilisateur)
    // via SQL direct — meme logique que DeckLike (CLI prisma absent du runtime).
    if (!tableNames.includes("CollectionItem")) {
      console.log("Creating CollectionItem table...");
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "CollectionItem" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "cardId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id"))`,
      );
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "CollectionItem_userId_cardId_key" ON "CollectionItem"("userId", "cardId")`,
      );
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CollectionItem_userId_idx" ON "CollectionItem"("userId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CollectionItem_cardId_idx" ON "CollectionItem"("cardId")`);
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
      } catch (e) {
        console.log("CollectionItem FK skipped:", e.message);
      }
      console.log("CollectionItem table ready.");
    }
  } catch (e) {
    console.error("Migration check failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
