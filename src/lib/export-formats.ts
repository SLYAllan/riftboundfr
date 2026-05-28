export interface ExportCard {
  cardId: string;
  name: string;
  quantity: number;
  section: "legend" | "main" | "rune" | "battlefield" | "side";
  set?: string;
}

export function exportAsCardNames(cards: ExportCard[]): string {
  const sections: Record<string, ExportCard[]> = {};
  for (const c of cards) {
    if (!sections[c.section]) sections[c.section] = [];
    sections[c.section].push(c);
  }

  const order = ["legend", "main", "rune", "battlefield", "side"];
  const labels: Record<string, string> = {
    legend: "Legend",
    main: "Main Deck",
    rune: "Runes",
    battlefield: "Battlefield",
    side: "Side Deck",
  };

  const parts: string[] = [];
  for (const section of order) {
    const group = sections[section];
    if (!group?.length) continue;
    parts.push(`== ${labels[section]} ==`);
    for (const c of group) {
      parts.push(`${c.quantity}x ${c.name}`);
    }
    parts.push("");
  }

  return parts.join("\n").trim();
}

export function exportAsTTS(cards: ExportCard[]): string {
  return cards
    .filter((c) => c.cardId)
    .flatMap((c) => {
      const entries: string[] = [];
      for (let i = 0; i < c.quantity; i++) {
        entries.push(`${c.cardId}-1`);
      }
      return entries;
    })
    .join(" ");
}

export function parseCardNamesImport(text: string): ExportCard[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const cards: ExportCard[] = [];
  let currentSection: ExportCard["section"] = "main";

  const sectionHeaders: Record<string, ExportCard["section"]> = {
    legend: "legend", legends: "legend", champion: "legend",
    "main deck": "main", maindeck: "main", main: "main", deck: "main",
    runes: "rune", rune: "rune",
    battlefield: "battlefield", battlefields: "battlefield",
    side: "side", "side deck": "side", sideboard: "side",
  };

  for (const line of lines) {
    if (line.startsWith("//") || line.startsWith("#")) continue;

    const headerMatch = line.match(/^==\s*(.+?)\s*==$/) ?? line.match(/^([A-Za-z\s]+):$/);
    if (headerMatch) {
      const key = headerMatch[1].trim().toLowerCase();
      currentSection = sectionHeaders[key] ?? "main";
      continue;
    }

    const cardMatch = line.match(/^(\d+)x?\s+(.+?)(?:\s+\(([^)]+)\))?$/i);
    if (cardMatch) {
      cards.push({
        cardId: "",
        name: cardMatch[2].trim(),
        quantity: parseInt(cardMatch[1], 10),
        section: currentSection,
        set: cardMatch[3]?.trim(),
      });
    }
  }

  return cards;
}

export function parseTTSImport(text: string): { cardId: string; quantity: number }[] {
  const ids = text.trim().split(/\s+/);
  const counts = new Map<string, number>();

  for (const raw of ids) {
    const cardId = raw.replace(/-\d+$/, "");
    counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([cardId, quantity]) => ({ cardId, quantity }));
}
