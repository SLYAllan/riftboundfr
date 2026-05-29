/**
 * Recover the missing Champion Unit (élu) in ARTICLE decklists only.
 *
 * The text->binary migration (migrate-article-deckcodes.ts) kept only
 * legendEntries[0] and dropped the champion that lived in the same "legend"
 * section, so article deck codes have `L:` but no `C:`. The Deck table still
 * holds the champion (legend section = Legend + Champion) — so /decks pages were
 * never affected. We match each article decklist block to its source deck by
 * MAIN-deck card-name overlap (robust to alt-art legend ids / player names) and
 * re-encode the deck code with the recovered champion. Touches article.blocks
 * ONLY. Idempotent (skips blocks that already have a champion).
 *
 * Plain ESM JS so it runs with `node` inside the standalone prod container.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── inlined base64 deck codec (mirror of src/lib/deck-codec) ──
function fromB64Url(s) {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  return Buffer.from(b, "base64").toString("latin1");
}
function toB64Url(s) {
  return Buffer.from(s, "latin1").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decEntries(str) {
  if (!str) return [];
  return str.split(",").map((part) => {
    const [cardId, q] = part.split(".");
    return { cardId, quantity: q ? parseInt(q, 10) : 1 };
  });
}
function decode(code) {
  if (!code || code.includes("\n")) return null;
  try {
    const raw = fromB64Url(code.trim());
    if (!raw.includes("|") && !raw.startsWith("L:") && !raw.startsWith("M:")) return null;
    const d = { legend: null, champion: null, main: [], rune: [], battlefield: [], side: [] };
    for (const part of raw.split("|")) {
      const i = part.indexOf(":");
      if (i === -1) continue;
      const k = part.slice(0, i);
      const v = part.slice(i + 1);
      if (k === "L") d.legend = { cardId: v, quantity: 1 };
      else if (k === "C") d.champion = { cardId: v, quantity: 1 };
      else if (k === "M") d.main = decEntries(v);
      else if (k === "R") d.rune = decEntries(v);
      else if (k === "B") d.battlefield = decEntries(v);
      else if (k === "S") d.side = decEntries(v);
    }
    return d;
  } catch {
    return null;
  }
}
function encEntries(es) {
  return es.map((e) => (e.quantity === 1 ? e.cardId : `${e.cardId}.${e.quantity}`)).join(",");
}
function encode(d) {
  const parts = [];
  if (d.legend) parts.push("L:" + d.legend.cardId);
  if (d.champion) parts.push("C:" + d.champion.cardId);
  if (d.main.length) parts.push("M:" + encEntries(d.main));
  if (d.rune.length) parts.push("R:" + encEntries(d.rune));
  if (d.battlefield.length) parts.push("B:" + encEntries(d.battlefield));
  if (d.side.length) parts.push("S:" + encEntries(d.side));
  return toB64Url(parts.join("|"));
}

async function main() {
  const allCards = await prisma.card.findMany({ select: { riftboundId: true, name: true } });
  const nameById = new Map(allCards.map((c) => [c.riftboundId, c.name.toLowerCase()]));

  const decks = await prisma.deck.findMany({
    select: { slug: true, cards: { select: { section: true, card: { select: { riftboundId: true, name: true, type: true } } } } },
  });
  const deckInfo = decks.map((d) => {
    const main = new Set(d.cards.filter((c) => c.section === "main").map((c) => c.card.name.toLowerCase()));
    const champ = d.cards.find((c) => c.section === "legend" && c.card.type !== "Legend");
    return { slug: d.slug, main, champRid: champ ? champ.card.riftboundId : null };
  });

  const articles = await prisma.article.findMany({ select: { id: true, slug: true, blocks: true } });

  let fixed = 0, alreadyOk = 0, nomatch = 0, nochamp = 0;
  for (const art of articles) {
    const blocks = Array.isArray(art.blocks) ? art.blocks : [];
    let changed = false;
    const nb = blocks.map((b) => {
      if (b.type !== "decklist") return b;
      const dec = decode(b.deckCode);
      if (!dec || !dec.legend) return b;
      if (dec.champion) { alreadyOk++; return b; }
      const mainNames = new Set(dec.main.map((e) => nameById.get(e.cardId)).filter(Boolean));
      if (mainNames.size < 5) return b;
      let best = null, bestScore = 0;
      for (const di of deckInfo) {
        let o = 0;
        for (const n of mainNames) if (di.main.has(n)) o++;
        if (o > bestScore) { bestScore = o; best = di; }
      }
      if (!best || bestScore < mainNames.size * 0.9) { nomatch++; return b; }
      if (!best.champRid) { nochamp++; return b; }
      dec.champion = { cardId: best.champRid, quantity: 1 };
      changed = true;
      fixed++;
      return { ...b, deckCode: encode(dec) };
    });
    if (changed) {
      await prisma.article.update({ where: { id: art.id }, data: { blocks: nb } });
      console.log(`OK ${art.slug}`);
    }
  }
  console.log(`\nfixed=${fixed} alreadyOk=${alreadyOk} nomatch=${nomatch} nochamp=${nochamp}`);
}

main().catch((e) => { console.error("ERR", e.message); process.exit(1); }).finally(() => prisma.$disconnect());
