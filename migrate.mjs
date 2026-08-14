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

    // Schéma "collection" (classeurs) via SQL direct — le CLI prisma n'est pas
    // dispo dans le runtime. Idempotent + met à niveau l'ancienne CollectionItem
    // (qui n'avait pas de binderId) vers le modèle Binder/CollectionItem/WishlistItem.
    if (!tableNames.includes("Binder")) {
      console.log("Creating Binder table...");
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "Binder" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "isPublic" BOOLEAN NOT NULL DEFAULT false, "shareSlug" TEXT, "color" TEXT, "position" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Binder_pkey" PRIMARY KEY ("id"))`,
      );
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Binder_shareSlug_key" ON "Binder"("shareSlug")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Binder_userId_idx" ON "Binder"("userId")`);
      try {
        await prisma.$executeRawUnsafe(
          `ALTER TABLE "Binder" ADD CONSTRAINT "Binder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
      } catch (e) {
        console.log("Binder FK skipped:", e.message);
      }
      console.log("Binder table ready.");
    }

    // CollectionItem : créer si absent, sinon mettre à niveau (ajout binderId +
    // contrainte/index binderId/cardId, suppression de l'ancien unique userId/cardId).
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "CollectionItem" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "binderId" TEXT, "cardId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "CollectionItem_pkey" PRIMARY KEY ("id"))`,
    );
    await prisma.$executeRawUnsafe(`ALTER TABLE "CollectionItem" ADD COLUMN IF NOT EXISTS "binderId" TEXT`);
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "CollectionItem_userId_cardId_key"`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "CollectionItem_binderId_cardId_key" ON "CollectionItem"("binderId", "cardId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CollectionItem_userId_idx" ON "CollectionItem"("userId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CollectionItem_binderId_idx" ON "CollectionItem"("binderId")`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "CollectionItem_cardId_idx" ON "CollectionItem"("cardId")`);
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`); } catch {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_binderId_fkey" FOREIGN KEY ("binderId") REFERENCES "Binder"("id") ON DELETE CASCADE ON UPDATE CASCADE`); } catch {}
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE`); } catch {}

    // WishlistItem
    if (!tableNames.includes("WishlistItem")) {
      console.log("Creating WishlistItem table...");
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "WishlistItem" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "cardId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id"))`,
      );
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "WishlistItem_userId_cardId_key" ON "WishlistItem"("userId", "cardId")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "WishlistItem_userId_idx" ON "WishlistItem"("userId")`);
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
      } catch (e) {
        console.log("WishlistItem FK skipped:", e.message);
      }
      console.log("WishlistItem table ready.");
    }

    // OverlayState
    if (!tableNames.includes("OverlayState")) {
      console.log("Creating OverlayState table...");
      await prisma.$executeRawUnsafe(
        `CREATE TABLE IF NOT EXISTS "OverlayState" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "token" TEXT NOT NULL, "state" JSONB NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "OverlayState_pkey" PRIMARY KEY ("id"))`,
      );
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "OverlayState_userId_key" ON "OverlayState"("userId")`);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "OverlayState_token_key" ON "OverlayState"("token")`);
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "OverlayState_token_idx" ON "OverlayState"("token")`);
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "OverlayState" ADD CONSTRAINT "OverlayState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
      } catch (e) {
        console.log("OverlayState FK skipped:", e.message);
      }
      console.log("OverlayState table ready.");
    }
  } catch (e) {
    console.error("Migration check failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
