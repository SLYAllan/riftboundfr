export interface ParsedDeckEntry {
  quantity: number;
  name: string;
  setCode?: string;
  section: "legend" | "champion" | "main" | "rune" | "battlefield" | "side";
}

export interface ParsedDeck {
  entries: ParsedDeckEntry[];
  errors: string[];
}

const SECTION_HEADERS: Record<string, ParsedDeckEntry["section"]> = {
  "legend": "legend",
  "legends": "legend",
  "champion": "champion",
  "main deck": "main",
  "maindeck": "main",
  "main": "main",
  "deck": "main",
  "runes": "rune",
  "rune": "rune",
  "rune pool": "rune",
  "battlefield": "battlefield",
  "battlefields": "battlefield",
  "side": "side",
  "side deck": "side",
  "sideboard": "side",
};

export function parseDeckCode(code: string): ParsedDeck {
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: ParsedDeckEntry[] = [];
  const errors: string[] = [];
  let currentSection: ParsedDeckEntry["section"] = "main";

  for (const line of lines) {
    if (line.startsWith("//") || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^==\s*(.+?)\s*==$/) ?? line.match(/^([A-Za-z\s]+):$/);
    if (sectionMatch) {
      const key = sectionMatch[1].trim().toLowerCase();
      currentSection = SECTION_HEADERS[key] ?? "main";
      continue;
    }

    const cardMatch = line.match(/^(\d+)x?\s+(.+?)(?:\s+\(([^)]+)\))?$/i);
    if (cardMatch) {
      const quantity = parseInt(cardMatch[1], 10);
      let name = cardMatch[2].trim();
      let setCode = cardMatch[3]?.trim();
      // Une parenthèse n'est un code d'extension que si elle en a la forme (ex. OGN, SFD-123).
      // Sinon (ex. "Master Yi (Wuju Master)") elle fait partie du nom et doit être conservée.
      if (setCode && !/^[A-Z]{2,4}(-\d+){0,2}$/i.test(setCode)) {
        name = `${name} (${setCode})`;
        setCode = undefined;
      }
      entries.push({ quantity, name, section: currentSection, setCode });
      continue;
    }

    if (line.length > 2) {
      errors.push(`Ligne non reconnue : "${line}"`);
    }
  }

  return { entries, errors };
}

export function entriesToDeckCode(entries: ParsedDeckEntry[]): string {
  const sections: Record<string, ParsedDeckEntry[]> = {};
  for (const e of entries) {
    if (!sections[e.section]) sections[e.section] = [];
    sections[e.section].push(e);
  }

  const order: ParsedDeckEntry["section"][] = ["legend", "champion", "main", "battlefield", "rune", "side"];
  const labels: Record<string, string> = {
    legend: "Legend",
    champion: "Champion",
    main: "MainDeck",
    rune: "Runes",
    battlefield: "Battlefields",
    side: "Sideboard",
  };

  const parts: string[] = [];
  for (const section of order) {
    const cards = sections[section];
    if (!cards?.length) continue;
    parts.push(`${labels[section]}:`);
    for (const c of cards) {
      parts.push(`${c.quantity} ${c.name}${c.setCode ? ` (${c.setCode})` : ""}`);
    }
    parts.push("");
  }

  return parts.join("\n").trim();
}
