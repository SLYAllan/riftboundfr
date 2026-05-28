import { BANNED_CARD_NAMES } from "@/lib/banned-cards";

export interface DeckValidationIssue {
  id: string;
  section: "legend" | "main" | "rune" | "battlefield" | "side";
  severity: "error" | "warning";
  message: string;
}

export interface DeckCounts {
  legend: boolean;
  legendFirstName: string | null;
  mainTotal: number;
  runeTotal: number;
  battlefieldTotal: number;
  sideTotal: number;
}

export interface DeckCardInfo {
  cardId: string;
  name: string;
  type: string;
  supertype: string | null;
  domains: string[];
  quantity: number;
}

export function validateDeck(
  counts: DeckCounts,
  mainCards: DeckCardInfo[],
  runeCards: DeckCardInfo[],
  sideCards: DeckCardInfo[],
  legendDomains: string[],
): DeckValidationIssue[] {
  const issues: DeckValidationIssue[] = [];

  if (!counts.legend) {
    issues.push({ id: "no-legend", section: "legend", severity: "error", message: "Aucune Légende sélectionnée" });
  }

  if (counts.legend && counts.legendFirstName) {
    const firstName = counts.legendFirstName.toLowerCase();
    const hasChampion = mainCards.some(
      (c) => c.supertype === "Champion" && c.name.toLowerCase().startsWith(firstName),
    );
    if (!hasChampion) {
      issues.push({ id: "no-champion", section: "main", severity: "error", message: "Champion (élu) correspondant à la Légende absent du deck" });
    }
  }

  if (counts.mainTotal < 40) {
    issues.push({ id: "main-under", section: "main", severity: "error", message: `Deck principal : ${counts.mainTotal}/40 cartes (minimum 40)` });
  } else if (counts.mainTotal > 40) {
    issues.push({ id: "main-over", section: "main", severity: "warning", message: `Deck principal : ${counts.mainTotal} cartes (40 recommandé pour la consistance)` });
  }

  if (counts.runeTotal !== 12) {
    issues.push({
      id: "rune-count",
      section: "rune",
      severity: "error",
      message: counts.runeTotal < 12
        ? `Deck de runes : ${counts.runeTotal}/12 (besoin exactement 12)`
        : `Deck de runes : ${counts.runeTotal}/12 (maximum 12)`,
    });
  }

  if (counts.battlefieldTotal !== 3) {
    issues.push({
      id: "bf-count",
      section: "battlefield",
      severity: "error",
      message: counts.battlefieldTotal < 3
        ? `Champs de bataille : ${counts.battlefieldTotal}/3 (besoin exactement 3)`
        : `Champs de bataille : ${counts.battlefieldTotal}/3 (maximum 3)`,
    });
  }

  if (counts.sideTotal > 0 && counts.sideTotal !== 8) {
    issues.push({
      id: "side-count",
      section: "side",
      severity: "error",
      message: `Réserve : ${counts.sideTotal}/8 (doit être 0 ou exactement 8)`,
    });
  }

  const allCards = [...mainCards, ...sideCards];
  for (const card of allCards) {
    if (BANNED_CARD_NAMES.has(card.name)) {
      issues.push({
        id: `banned-${card.cardId}`,
        section: "main",
        severity: "error",
        message: `${card.name} est bannie`,
      });
    }
  }

  if (legendDomains.length > 0) {
    for (const card of mainCards) {
      if (card.domains.length > 0 && !card.domains.some((d) => legendDomains.includes(d))) {
        issues.push({
          id: `domain-${card.cardId}`,
          section: "main",
          severity: "error",
          message: `${card.name} n'est pas dans les domaines de la Légende`,
        });
      }
    }
  }

  return issues;
}

export function isDeckValid(counts: DeckCounts, mainCards: DeckCardInfo[], runeCards: DeckCardInfo[], sideCards: DeckCardInfo[], legendDomains: string[]): boolean {
  return validateDeck(counts, mainCards, runeCards, sideCards, legendDomains).length === 0;
}
