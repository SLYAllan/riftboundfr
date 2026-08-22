export interface PiltoverRow {
  variantNumber: string;
  setPrefix: string;
  collectorNumber: number | null;
  cardName: string;
  variantType: string;
  variantLabel: string;
  foil: string;
  quantity: number;
}

export interface CollectionImportItem {
  cardId: string;
  quantity: number;
}

export function validerLotCollection(value: unknown): CollectionImportItem[] | null {
  if (!Array.isArray(value)) return null;
  const ids = new Set<string>();
  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.cardId !== "string" ||
      !item.cardId ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 0 ||
      item.quantity > 9999 ||
      ids.has(item.cardId)
    ) {
      return null;
    }
    ids.add(item.cardId);
  }
  return value as CollectionImportItem[];
}

// Parse une ligne CSV conforme RFC 4180 (champs entre guillemets, virgules et
// guillemets échappés `""` à l'intérieur).
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parsePiltoverCsv(text: string): PiltoverRow[] {
  const lines = text.split(/\r?\n/);
  const rows: PiltoverRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const c = parseCsvLine(raw);
    const variantNumber = (c[0] ?? "").trim();
    // Préfixe = colonne "Set Prefix" dédiée (fiable), fallback sur le segment
    // avant le premier tiret du numéro de variante.
    const firstDash = variantNumber.indexOf("-");
    const setPrefix =
      (c[3] ?? "").trim() ||
      (firstDash > 0 ? variantNumber.slice(0, firstDash) : variantNumber);
    // Numéro = premiers chiffres après un tiret (gère "OGN-025" et "UNL-169-PreRelease").
    const numMatch = variantNumber.match(/-(\d+)/);
    const num = numMatch ? parseInt(numMatch[1], 10) : NaN;
    const quantiteBrute = (c[8] ?? "").trim();
    const quantity = /^\d+$/.test(quantiteBrute) ? Number(quantiteBrute) : NaN;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
      throw new Error(`quantite invalide ligne ${i + 1}`);
    }
    rows.push({
      variantNumber,
      setPrefix,
      collectorNumber: Number.isFinite(num) ? num : null,
      cardName: (c[1] ?? "").trim(),
      variantType: (c[5] ?? "").trim(),
      variantLabel: (c[6] ?? "").trim(),
      foil: (c[7] ?? "").trim(),
      quantity,
    });
  }
  return rows;
}

// Somme les quantités des entrées qui pointent vers la même carte (Piltover
// exporte une ligne par binder/propriétaire → plusieurs lignes = même impression).
export function aggregateByCard(
  resolved: { cardId: string; quantity: number }[],
): { cardId: string; quantity: number }[] {
  const totals = new Map<string, number>();
  for (const r of resolved) {
    const quantity = (totals.get(r.cardId) ?? 0) + r.quantity;
    if (quantity > 9999) throw new Error("quantite invalide");
    totals.set(r.cardId, quantity);
  }
  return [...totals.entries()].map(([cardId, quantity]) => ({ cardId, quantity }));
}
