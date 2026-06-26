import { parseDeckCode, entriesToDeckCode, type ParsedDeckEntry } from "./deck-code";

export interface DeckCodeEntry {
  cardId: string;
  quantity: number;
}

export interface DeckCodeData {
  legend: DeckCodeEntry | null;
  champion: DeckCodeEntry | null;
  main: DeckCodeEntry[];
  rune: DeckCodeEntry[];
  battlefield: DeckCodeEntry[];
  side: DeckCodeEntry[];
}

function toBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return atob(b64);
}

function decodeEntries(str: string): DeckCodeEntry[] {
  if (!str) return [];
  return str.split(",").map((part) => {
    const [cardId, qtyStr] = part.split(".");
    return { cardId, quantity: qtyStr ? parseInt(qtyStr, 10) : 1 };
  });
}

function decodeLegacyBase64(code: string): DeckCodeData | null {
  try {
    const raw = fromBase64Url(code);
    if (!raw.includes("|") && !raw.startsWith("L:") && !raw.startsWith("M:")) return null;

    const deck: DeckCodeData = {
      legend: null, champion: null, main: [], rune: [], battlefield: [], side: [],
    };

    for (const part of raw.split("|")) {
      const colonIdx = part.indexOf(":");
      if (colonIdx === -1) continue;
      const key = part.slice(0, colonIdx);
      const value = part.slice(colonIdx + 1);

      if (key === "L") deck.legend = { cardId: value, quantity: 1 };
      else if (key === "C") {
        // Rétro-compat : "C:cardId" => qty 1 ; "C:cardId.3" => 3 copies du champion.
        const [cid, qtyStr] = value.split(".");
        deck.champion = { cardId: cid, quantity: qtyStr ? parseInt(qtyStr, 10) : 1 };
      }
      else if (key === "M") deck.main = decodeEntries(value);
      else if (key === "R") deck.rune = decodeEntries(value);
      else if (key === "B") deck.battlefield = decodeEntries(value);
      else if (key === "S") deck.side = decodeEntries(value);
    }

    return deck;
  } catch {
    return null;
  }
}

function isTextFormat(code: string): boolean {
  return code.includes("\n") || /^\d+\s+\S/.test(code) || /^(Legend|Champion|MainDeck|Main|Runes|Battlefields|Sideboard|Rune Pool|Side Deck):/im.test(code);
}

function decodeTextFormat(code: string): DeckCodeData | null {
  const parsed = parseDeckCode(code);
  if (parsed.entries.length === 0) return null;

  const deck: DeckCodeData = {
    legend: null, champion: null, main: [], rune: [], battlefield: [], side: [],
  };

  for (const entry of parsed.entries) {
    const e: DeckCodeEntry = { cardId: entry.name, quantity: entry.quantity };
    if (entry.section === "legend") deck.legend = e;
    else if (entry.section === "champion") deck.champion = e;
    else deck[entry.section].push(e);
  }

  return deck;
}

export function encodeDeck(deck: DeckCodeData): string {
  const entries: ParsedDeckEntry[] = [];

  if (deck.legend) entries.push({ quantity: 1, name: deck.legend.cardId, section: "legend" });
  if (deck.champion) entries.push({ quantity: deck.champion.quantity, name: deck.champion.cardId, section: "champion" });
  for (const e of deck.main) entries.push({ quantity: e.quantity, name: e.cardId, section: "main" });
  for (const e of deck.rune) entries.push({ quantity: e.quantity, name: e.cardId, section: "rune" });
  for (const e of deck.battlefield) entries.push({ quantity: e.quantity, name: e.cardId, section: "battlefield" });
  for (const e of deck.side) entries.push({ quantity: e.quantity, name: e.cardId, section: "side" });

  return entriesToDeckCode(entries);
}

export function encodeDeckBase64(deck: DeckCodeData): string {
  function encodeEntries(entries: DeckCodeEntry[]): string {
    return entries.map((e) => (e.quantity === 1 ? e.cardId : `${e.cardId}.${e.quantity}`)).join(",");
  }
  const parts: string[] = [];
  if (deck.legend) parts.push(`L:${deck.legend.cardId}`);
  if (deck.champion) parts.push(`C:${deck.champion.quantity > 1 ? `${deck.champion.cardId}.${deck.champion.quantity}` : deck.champion.cardId}`);
  if (deck.main.length) parts.push(`M:${encodeEntries(deck.main)}`);
  if (deck.rune.length) parts.push(`R:${encodeEntries(deck.rune)}`);
  if (deck.battlefield.length) parts.push(`B:${encodeEntries(deck.battlefield)}`);
  if (deck.side.length) parts.push(`S:${encodeEntries(deck.side)}`);
  return toBase64Url(parts.join("|"));
}

export function decodeDeck(code: string): DeckCodeData | null {
  if (!code || !code.trim()) return null;
  const trimmed = code.trim();

  if (isTextFormat(trimmed)) {
    return decodeTextFormat(trimmed);
  }

  return decodeLegacyBase64(trimmed);
}
