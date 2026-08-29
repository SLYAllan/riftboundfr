const FINITIONS = new Set(["NORMAL", "FOIL"]);
const ALLOCATIONS = new Set(["UNIFORM", "MANUAL"]);
const SECTIONS = new Set(["LEGEND", "CHAMPION", "MAIN_DECK", "BATTLEFIELD", "SIDEBOARD", "GENERIC"]);

type Validation = { ok: true } | { ok: false; error: string };

export type BrouillonEntreeBulk = {
  sellerSource: string;
  acquisitionDate: string;
  totalPrice: string;
  costAllocationMethod: "UNIFORM" | "MANUAL";
  languageId: string;
  defaultCondition: "NM";
  defaultFinish: "NORMAL" | "FOIL";
  knownSet?: string | null;
  declaredCardCount: number;
  notes?: string | null;
  lines: Array<{
    cardId: string;
    quantity: number;
    condition: "NM";
    finish: "NORMAL" | "FOIL";
    storageLocationId: string;
    acquisitionUnitCost?: string | null;
  }>;
};

export type CorrectionStockBulk = {
  cardId: string;
  languageId: string;
  condition: "NM";
  finish: "NORMAL" | "FOIL";
  storageLocationId: string;
  physicalDelta: number;
  reservedDelta: number;
  acquisitionUnitCost?: string | null;
  source: string;
};

export type TransfertBulk = {
  cardId: string;
  languageId: string;
  condition: "NM";
  finish: "NORMAL" | "FOIL";
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  source: string;
};

export type RecetteBulk = {
  name: string;
  description?: string | null;
  sourceDeckId?: string | null;
  lines: Array<{
    cardId: string;
    languageId: string;
    section?: "LEGEND" | "CHAMPION" | "MAIN_DECK" | "BATTLEFIELD" | "SIDEBOARD" | "GENERIC";
    quantity: number;
  }>;
};

function objet(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clesConnues(value: Record<string, unknown>, cles: string[]) {
  return Object.keys(value).every((cle) => cles.includes(cle));
}

function entierDelta(value: unknown) {
  return Number.isInteger(value) && Number(value) >= -100_000 && Number(value) <= 100_000;
}

export function validerBrouillonEntree(value: unknown): Validation {
  const cles = ["sellerSource", "acquisitionDate", "totalPrice", "costAllocationMethod", "languageId", "defaultCondition", "defaultFinish", "knownSet", "declaredCardCount", "notes", "lines"];
  if (!objet(value) || !clesConnues(value, cles)) return { ok: false, error: "Champs d'entrée invalides" };
  if (typeof value.sellerSource !== "string" || value.sellerSource.trim().length < 1 || value.sellerSource.length > 120) return { ok: false, error: "La source est invalide" };
  if (typeof value.acquisitionDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.acquisitionDate)) return { ok: false, error: "La date est invalide" };
  if (typeof value.totalPrice !== "string" || !/^\d{1,8}(\.\d{1,2})?$/.test(value.totalPrice)) return { ok: false, error: "Le prix total est invalide" };
  if (typeof value.costAllocationMethod !== "string" || !ALLOCATIONS.has(value.costAllocationMethod)) return { ok: false, error: "La méthode de coût est invalide" };
  if (typeof value.languageId !== "string" || !value.languageId) return { ok: false, error: "La langue est invalide" };
  if (value.defaultCondition !== "NM") return { ok: false, error: "L'état est invalide" };
  if (typeof value.defaultFinish !== "string" || !FINITIONS.has(value.defaultFinish)) return { ok: false, error: "La finition est invalide" };
  if (!Number.isInteger(value.declaredCardCount) || Number(value.declaredCardCount) < 1 || Number(value.declaredCardCount) > 100_000) return { ok: false, error: "Le nombre de cartes est invalide" };
  if (!Array.isArray(value.lines) || value.lines.length > 5_000) return { ok: false, error: "Les lignes sont invalides" };

  for (const line of value.lines) {
    const lineKeys = ["cardId", "quantity", "condition", "finish", "storageLocationId", "acquisitionUnitCost"];
    if (!objet(line) || !clesConnues(line, lineKeys)) return { ok: false, error: "Une ligne est invalide" };
    if (typeof line.cardId !== "string" || !line.cardId || typeof line.storageLocationId !== "string" || !line.storageLocationId) return { ok: false, error: "Une carte ou un emplacement manque" };
    if (!Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 100_000) return { ok: false, error: "Une quantité est invalide" };
    if (line.condition !== "NM" || typeof line.finish !== "string" || !FINITIONS.has(line.finish)) return { ok: false, error: "Une variante est invalide" };
    if (value.costAllocationMethod === "MANUAL" && (typeof line.acquisitionUnitCost !== "string" || !/^\d{1,6}(\.\d{1,8})?$/.test(line.acquisitionUnitCost))) return { ok: false, error: "Le coût unitaire manque sur une ligne" };
  }
  return { ok: true };
}

export function validerCorrectionStock(value: unknown): Validation {
  const cles = ["cardId", "languageId", "condition", "finish", "storageLocationId", "physicalDelta", "reservedDelta", "acquisitionUnitCost", "source"];
  if (!objet(value) || !clesConnues(value, cles)) return { ok: false, error: "Champs de correction invalides" };
  if (typeof value.cardId !== "string" || !value.cardId) return { ok: false, error: "La carte est invalide" };
  if (typeof value.languageId !== "string" || !value.languageId) return { ok: false, error: "La langue est invalide" };
  if (value.condition !== "NM") return { ok: false, error: "L'état est invalide" };
  if (typeof value.finish !== "string" || !FINITIONS.has(value.finish)) return { ok: false, error: "La finition est invalide" };
  if (typeof value.storageLocationId !== "string" || !value.storageLocationId) return { ok: false, error: "L'emplacement est invalide" };
  if (!entierDelta(value.physicalDelta) || !entierDelta(value.reservedDelta)) return { ok: false, error: "Un delta est invalide" };
  if (Number(value.physicalDelta) === 0 && Number(value.reservedDelta) === 0) return { ok: false, error: "Le mouvement ne change aucune quantité" };
  if (value.acquisitionUnitCost !== undefined && value.acquisitionUnitCost !== null) {
    if (typeof value.acquisitionUnitCost !== "string" || !/^\d{1,6}(\.\d{1,4})?$/.test(value.acquisitionUnitCost)) return { ok: false, error: "Le coût unitaire est invalide" };
  }
  if (Number(value.physicalDelta) > 0 && typeof value.acquisitionUnitCost !== "string") return { ok: false, error: "Le coût unitaire manque" };
  if (typeof value.source !== "string" || value.source.trim().length < 1 || value.source.length > 120) return { ok: false, error: "La source est invalide" };
  return { ok: true };
}

export function validerTransfert(value: unknown): Validation {
  const cles = ["cardId", "languageId", "condition", "finish", "fromLocationId", "toLocationId", "quantity", "source"];
  if (!objet(value) || !clesConnues(value, cles)) return { ok: false, error: "Champs de transfert invalides" };
  if (typeof value.cardId !== "string" || !value.cardId) return { ok: false, error: "La carte est invalide" };
  if (typeof value.languageId !== "string" || !value.languageId) return { ok: false, error: "La langue est invalide" };
  if (value.condition !== "NM") return { ok: false, error: "L'état est invalide" };
  if (typeof value.finish !== "string" || !FINITIONS.has(value.finish)) return { ok: false, error: "La finition est invalide" };
  if (typeof value.fromLocationId !== "string" || !value.fromLocationId || typeof value.toLocationId !== "string" || !value.toLocationId) return { ok: false, error: "Un emplacement manque" };
  if (value.fromLocationId === value.toLocationId) return { ok: false, error: "Les emplacements doivent différer" };
  if (!Number.isInteger(value.quantity) || Number(value.quantity) < 1 || Number(value.quantity) > 100_000) return { ok: false, error: "La quantité est invalide" };
  if (typeof value.source !== "string" || value.source.trim().length < 1 || value.source.length > 120) return { ok: false, error: "La source est invalide" };
  return { ok: true };
}

export function validerRecette(value: unknown): Validation {
  const cles = ["name", "description", "sourceDeckId", "lines"];
  if (!objet(value) || !clesConnues(value, cles)) return { ok: false, error: "Champs de recette invalides" };
  if (typeof value.name !== "string" || value.name.trim().length < 1 || value.name.length > 160) return { ok: false, error: "Le nom est invalide" };
  if (value.description !== undefined && value.description !== null && typeof value.description !== "string") return { ok: false, error: "La description est invalide" };
  if (value.sourceDeckId !== undefined && value.sourceDeckId !== null && (typeof value.sourceDeckId !== "string" || !value.sourceDeckId)) return { ok: false, error: "Le deck source est invalide" };
  if (!Array.isArray(value.lines) || value.lines.length < 1 || value.lines.length > 5_000) return { ok: false, error: "Les lignes sont invalides" };

  const vues = new Set<string>();
  for (const line of value.lines) {
    const lineKeys = ["cardId", "languageId", "section", "quantity"];
    if (!objet(line) || !clesConnues(line, lineKeys)) return { ok: false, error: "Une ligne est invalide" };
    if (typeof line.cardId !== "string" || !line.cardId) return { ok: false, error: "Une carte manque" };
    if (typeof line.languageId !== "string" || !line.languageId) return { ok: false, error: "Une langue manque" };
    if (line.section !== undefined && (typeof line.section !== "string" || !SECTIONS.has(line.section))) return { ok: false, error: "Une section est invalide" };
    if (!Number.isInteger(line.quantity) || Number(line.quantity) < 1 || Number(line.quantity) > 100_000) return { ok: false, error: "Une quantité est invalide" };
    const cle = `${line.cardId}|${line.languageId}|${line.section ?? "GENERIC"}`;
    if (vues.has(cle)) return { ok: false, error: "Une ligne est en double" };
    vues.add(cle);
  }
  return { ok: true };
}
