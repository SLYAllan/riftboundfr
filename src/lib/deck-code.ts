import { VARIANT_SUFFIX } from "./card-printing";

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
  // Libellés français : ce sont ceux que le site affiche, donc ceux que les
  // joueurs recopient. Sans eux, tout retombait dans le deck principal.
  "légende": "legend",
  "legende": "legend",
  "légendes": "legend",
  "deck principal": "main",
  "principal": "main",
  "réserve": "side",
  "reserve": "side",
  "champs de bataille": "battlefield",
  "champ de bataille": "battlefield",
};

// Un en-tête peut porter un accent (« Réserve: ») ou un compte
// (« Sideboard (10): »). L'ancienne forme n'acceptait que des lettres ASCII :
// la ligne partait en « ligne non reconnue » et ses cartes tombaient en main.
const SECTION_LINE = /^([\p{L}\s]+?)(?:\s*\(\s*\d+\s*\))?\s*:$/u;

function sectionKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function parseDeckCode(code: string): ParsedDeck {
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  const entries: ParsedDeckEntry[] = [];
  const errors: string[] = [];
  let currentSection: ParsedDeckEntry["section"] = "main";

  for (const line of lines) {
    if (line.startsWith("//") || line.startsWith("#")) continue;

    const sectionMatch = line.match(/^==\s*(.+?)\s*==$/) ?? line.match(SECTION_LINE);
    if (sectionMatch) {
      currentSection = SECTION_HEADERS[sectionKey(sectionMatch[1])] ?? "main";
      continue;
    }

    // La quantité est OBLIGATOIRE. La rendre facultative transformait la moindre
    // ligne parasite d'un scrape (« Missing / Not available », une URL, « Total:
    // 64 ») en carte fantôme, sans plus aucune erreur signalée : exactement ce
    // que le garde-fou anti-fabrication doit empêcher.
    const cardMatch = line.match(/^(\d+)\s*x?\s+(.+?)(?:\s+\(([^)]+)\))?$/i);
    if (cardMatch) {
      const quantity = parseInt(cardMatch[1], 10);
      let name = cardMatch[2].trim().replace(/\s+/g, " ");
      let setCode: string | undefined = cardMatch[3]?.trim();
      if (setCode) {
        if (VARIANT_SUFFIX.test(`(${setCode})`)) {
          // « Vilemaw (Alternate Art) » est le VRAI nom d'une vraie carte
          // (unl-060a-219) : on le garde entier pour retrouver l'illustration
          // choisie. C'est resolveDeckCards qui retombe sur l'impression de base
          // si cette variante n'existe pas, au lieu de perdre la carte.
          name = `${name} (${setCode})`;
          setCode = undefined;
        } else if (!/^[A-Z]{2,4}(-\d+){0,2}$/i.test(setCode)) {
          // Une parenthèse n'est un code d'extension que si elle en a la forme
          // (ex. OGN, SFD-123). Sinon (ex. "Master Yi (Wuju Master)") elle fait
          // partie du nom et doit être conservée.
          name = `${name} (${setCode})`;
          setCode = undefined;
        }
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
