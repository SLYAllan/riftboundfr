import fs from "fs";
import os from "os";
import { PrismaClient } from "@prisma/client";
import { parsePiltoverCsv, aggregateByCard, type PiltoverRow } from "../src/lib/piltover-import";

const prisma = new PrismaClient();

type CardVariant = { id: string; alternateArt: boolean; overnumbered: boolean; signature: boolean };

function pickVariant(cards: CardVariant[], row: PiltoverRow): string {
  if (cards.length === 1) return cards[0].id;
  const label = `${row.variantType} ${row.variantLabel}`.toLowerCase();
  const wantAlt = label.includes("alt");
  const wantOver = label.includes("overnumbered");
  const wantSig =
    label.includes("showcase") || label.includes("signature") || label.includes("pre-rift") || label.includes("promo");
  const match = cards.find((c) => c.alternateArt === wantAlt && c.overnumbered === wantOver && c.signature === wantSig);
  const fallback = cards.find((c) => !c.alternateArt && !c.overnumbered && !c.signature);
  return (match ?? fallback ?? cards[0]).id;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { discordId: "dev-local-test" },
    update: {},
    create: { discordId: "dev-local-test", discordName: "testeur", username: "Testeur Local", role: "user" },
  });
  console.log("Test user:", user.username, user.id);

  // Cherche un CSV Piltover dans les Téléchargements pour peupler la collection.
  const dir = `${os.homedir()}/Downloads`;
  const csv = fs.existsSync(dir)
    ? fs.readdirSync(dir).find((f) => f.startsWith("piltover-collection") && f.endsWith(".csv"))
    : undefined;

  if (!csv) {
    console.log("Aucun CSV Piltover trouvé dans ~/Downloads — collection laissée vide.");
    return;
  }

  const text = fs.readFileSync(`${dir}/${csv}`, "utf8");
  const rows = parsePiltoverCsv(text);
  const resolved: { cardId: string; quantity: number }[] = [];
  for (const row of rows) {
    if (row.collectorNumber == null) continue;
    const cards = await prisma.card.findMany({
      where: { set: row.setPrefix, collectorNumber: row.collectorNumber },
      select: { id: true, alternateArt: true, overnumbered: true, signature: true },
    });
    if (cards.length === 0) continue;
    resolved.push({ cardId: pickVariant(cards, row), quantity: row.quantity });
  }
  const agg = aggregateByCard(resolved);

  await prisma.collectionItem.deleteMany({ where: { userId: user.id } });
  await prisma.$transaction(
    agg.map((i) =>
      prisma.collectionItem.create({ data: { userId: user.id, cardId: i.cardId, quantity: i.quantity } }),
    ),
  );

  const total = agg.reduce((s, i) => s + i.quantity, 0);
  console.log(`Collection importée depuis ${csv} : ${agg.length} cartes distinctes, ${total} exemplaires.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
