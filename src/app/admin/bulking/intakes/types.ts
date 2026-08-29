export type Langue = { id: string; code: string; label: string };
export type Emplacement = { id: string; code: string; label?: string | null };
export type Carte = { id: string; riftboundId?: string; name: string; set: string; collectorNumber: number | null; rarity?: string | null; imageUrl?: string | null; alternateArt?: boolean; overnumbered?: boolean; signature?: boolean };
export type Ligne = { cardId: string; quantity: number; condition: "NM"; finish: "NORMAL" | "FOIL"; storageLocationId: string; acquisitionUnitCost: string | null; card: Carte };
export type Brouillon = { sellerSource: string; acquisitionDate: string; totalPrice: string; costAllocationMethod: "UNIFORM" | "MANUAL"; languageId: string; defaultCondition: "NM"; defaultFinish: "NORMAL" | "FOIL"; knownSet: string; declaredCardCount: number; notes: string; lines: Ligne[] };
