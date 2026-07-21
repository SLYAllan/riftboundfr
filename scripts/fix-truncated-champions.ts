// riftdecks tronque certains noms de champion dans ses decklists : « Yi, Meditative »
// au lieu de « Master Yi, Meditative ». Les seeds ne retrouvaient pas la carte et le
// deck perdait son champion en silence.
//
// Ce script relit les fiches locales (data/decklists), retrouve le deck correspondant
// en base et lui rattache le champion manquant. Il n'invente rien : il ne touche qu'aux
// decks dont la fiche source porte vraiment ce champion.
//
//   npx tsx scripts/fix-truncated-champions.ts          # repérage, n'écrit rien
//   npx tsx scripts/fix-truncated-champions.ts --apply  # applique
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

// Nom tronqué tel qu'écrit par riftdecks -> nom réel en base.
const TRUNCATED: Record<string, string> = {
  "Yi, Meditative": "Master Yi, Meditative",
};

type DeckJson = {
  id: string; legend: string; champion: string | null; player: string | null;
  tournament?: string; placement: number | null;
  mainDeck?: { name: string; quantity: number }[];
  sideDeck?: { name: string; quantity: number }[];
};

// Où le nom tronqué apparaît et en quelle quantité. Le champion se range en section
// "legend" comme dans tous les seeds ; le reste garde sa section d'origine.
function occurrences(d: DeckJson): { real: string; quantity: number; section: string }[] {
  const out: { real: string; quantity: number; section: string }[] = [];
  if (d.champion && TRUNCATED[d.champion]) out.push({ real: TRUNCATED[d.champion], quantity: 1, section: "legend" });
  for (const c of d.mainDeck ?? []) {
    if (TRUNCATED[c.name]) out.push({ real: TRUNCATED[c.name], quantity: c.quantity, section: "main" });
  }
  for (const c of d.sideDeck ?? []) {
    if (TRUNCATED[c.name]) out.push({ real: TRUNCATED[c.name], quantity: c.quantity, section: "side" });
  }
  return out;
}

function load(): DeckJson[] {
  const root = join(process.cwd(), "data", "decklists");
  const out: DeckJson[] = [];
  for (const dir of readdirSync(root)) {
    let files: string[] = [];
    try { files = readdirSync(join(root, dir)).filter((f) => f.endsWith(".json")); } catch { continue; }
    for (const f of files) {
      try { out.push(JSON.parse(readFileSync(join(root, dir, f), "utf-8"))); } catch { /* fiche illisible */ }
    }
  }
  return out;
}

async function main() {
  const targets = load().filter((d) => d.champion && TRUNCATED[d.champion]);
  console.log(`${targets.length} fiches locales portent un champion tronqué`);

  const cards = new Map<string, string>();
  for (const real of new Set(Object.values(TRUNCATED))) {
    // Print de base d'abord (ogs/ogn), le promo OPP seulement en repli.
    const found =
      (await prisma.card.findFirst({ where: { name: real, riftboundId: { not: { startsWith: "opp-" } } } })) ??
      (await prisma.card.findFirst({ where: { name: real } }));
    if (!found) throw new Error(`carte introuvable en base : ${real}`);
    cards.set(real, found.id);
    console.log(`  ${real} -> ${found.riftboundId}`);
  }

  let fixed = 0, already = 0, noDeck = 0;
  const orphans: string[] = [];

  for (const d of targets) {
    const cardId = cards.get(TRUNCATED[d.champion!])!;
    let deck = await prisma.deck.findUnique({ where: { slug: d.id }, select: { id: true, slug: true } });
    if (!deck && d.player && d.tournament) {
      deck = await prisma.deck.findFirst({
        where: { tournamentContext: d.tournament, playerName: d.player, legendName: d.legend },
        select: { id: true, slug: true },
      });
    }
    if (!deck) { noDeck++; orphans.push(`${d.id} (${d.tournament ?? "?"} / ${d.player ?? "?"})`); continue; }

    const has = await prisma.deckCard.findFirst({ where: { deckId: deck.id, cardId } });
    if (has) { already++; continue; }
    if (APPLY) {
      await prisma.deckCard.create({ data: { deckId: deck.id, cardId, quantity: 1, section: "legend" } });
    }
    fixed++;
  }

  console.log(
    `\n${APPLY ? "corrigés" : "à corriger"} : ${fixed} | champion déjà présent : ${already} | deck absent de la base : ${noDeck}`,
  );
  if (orphans.length) {
    console.log("\nFiches sans deck en base (normal si le tournoi n'a jamais été seedé) :");
    for (const o of orphans.slice(0, 15)) console.log(`  ${o}`);
    if (orphans.length > 15) console.log(`  ... et ${orphans.length - 15} autres`);
  }
  if (!APPLY) console.log("\nRepérage seul. Relancer avec --apply pour écrire.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
