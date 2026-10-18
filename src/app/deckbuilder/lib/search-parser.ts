export interface SearchToken {
  type: "text" | "type" | "domain" | "set" | "energy" | "power" | "might" | "rarity" | "tag";
  value: string;
  raw: string;
  rangeMin?: number;
  rangeMax?: number;
}

export interface ParsedSearch {
  tokens: SearchToken[];
  freeText: string;
}

const FIELD_KEYS = ["type", "domain", "set", "energy", "power", "might", "rarity", "tag"] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

function isFieldKey(key: string): key is FieldKey {
  return (FIELD_KEYS as readonly string[]).includes(key);
}

function parseRange(value: string): { min: number; max: number } | null {
  const rangeDash = value.match(/^(\d+)-(\d+)$/);
  if (rangeDash) return { min: parseInt(rangeDash[1], 10), max: parseInt(rangeDash[2], 10) };

  const rangePlus = value.match(/^(\d+)\+$/);
  if (rangePlus) return { min: parseInt(rangePlus[1], 10), max: 99 };

  const exact = value.match(/^(\d+)$/);
  if (exact) { const n = parseInt(exact[1], 10); return { min: n, max: n }; }

  return null;
}

export function parseSearchQuery(query: string): ParsedSearch {
  const tokens: SearchToken[] = [];
  const freeTextParts: string[] = [];

  const regex = /(\w+):(\S+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(query)) !== null) {
    const before = query.slice(lastIndex, match.index).trim();
    if (before) freeTextParts.push(before);
    lastIndex = regex.lastIndex;

    const key = match[1].toLowerCase();
    const value = match[2];

    if (isFieldKey(key)) {
      const token: SearchToken = { type: key, value: value.toLowerCase(), raw: match[0] };
      if (key === "energy" || key === "power" || key === "might") {
        const range = parseRange(value);
        if (range) {
          token.rangeMin = range.min;
          token.rangeMax = range.max;
        }
      }
      tokens.push(token);
    } else {
      freeTextParts.push(match[0]);
    }
  }

  const remaining = query.slice(lastIndex).trim();
  if (remaining) freeTextParts.push(remaining);

  return { tokens, freeText: freeTextParts.join(" ").trim() };
}

export function tokensToQuery(tokens: SearchToken[], freeText: string): string {
  const parts: string[] = [];
  for (const t of tokens) parts.push(t.raw);
  if (freeText.trim()) parts.push(freeText.trim());
  return parts.join(" ");
}

export const FIELD_SUGGESTIONS: Record<FieldKey, string[]> = {
  type: ["unit", "spell", "gear"],
  domain: ["fury", "calm", "order", "chaos", "mind", "body"],
  set: ["origins", "spiritforged", "unleashed", "vendetta"],
  energy: ["0", "1", "2", "3", "4", "5", "6", "7", "8+", "0-2", "3-5", "6+"],
  power: ["0", "1", "2", "3", "4"],
  might: ["1", "2", "3", "4", "5", "6+"],
  rarity: ["common", "uncommon", "rare", "epic"],
  tag: [],
};

const SET_ALIASES: Record<string, string[]> = {
  origins: ["OGN", "OGS"],
  spiritforged: ["SFD"],
  unleashed: ["UNL"],
  vendetta: ["VEN"],
};

export function getSetCodesFromAlias(alias: string): string[] {
  return SET_ALIASES[alias.toLowerCase()] ?? [alias.toUpperCase()];
}
