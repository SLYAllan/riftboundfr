import type { DeckSection } from "@/types";

export interface SavedDeckEntry {
  cardId: string;
  name: string;
  imageUrl: string | null;
  type: string;
  rarity: string;
  energy: number | null;
  domains: string[];
  quantity: number;
}

export interface SavedDeck {
  id: string;
  title: string;
  legendId: string | null;
  legendName: string | null;
  legendDomains: string[];
  sections: Record<DeckSection, SavedDeckEntry[]>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "riftbound-decks";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getSavedDecks(): SavedDeck[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDeck(deck: Omit<SavedDeck, "id" | "createdAt" | "updatedAt">): SavedDeck {
  const decks = getSavedDecks();
  const now = new Date().toISOString();
  const saved: SavedDeck = {
    ...deck,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  decks.unshift(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  return saved;
}

export function updateDeck(id: string, deck: Partial<Omit<SavedDeck, "id" | "createdAt">>): SavedDeck | null {
  const decks = getSavedDecks();
  const idx = decks.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  decks[idx] = { ...decks[idx], ...deck, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  return decks[idx];
}

export function deleteDeck(id: string): boolean {
  const decks = getSavedDecks();
  const filtered = decks.filter((d) => d.id !== id);
  if (filtered.length === decks.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
