import { Prisma } from "@prisma/client";
import type {
  BulkRecipeAnalysis,
  BulkRecipeAvailability,
  BulkRecipeRequirement,
  BulkStockBalance,
} from "./bulking-types";

function cleCarte(cardId: string, languageId: string) {
  return `${cardId}|${languageId}`;
}

function fusionnerExigences(exigences: BulkRecipeRequirement[]): BulkRecipeRequirement[] {
  const fusionnees = new Map<string, BulkRecipeRequirement>();
  for (const exigence of exigences) {
    if (!Number.isInteger(exigence.quantity) || exigence.quantity <= 0) {
      throw new Error("La quantité doit être un entier supérieur à zéro");
    }
    const cle = [exigence.cardId, exigence.languageId, exigence.section ?? "GENERIC"].join("|");
    const precedente = fusionnees.get(cle);
    if (precedente) precedente.quantity += exigence.quantity;
    else fusionnees.set(cle, { ...exigence });
  }
  return [...fusionnees.values()];
}

function agregerStock(stock: BulkStockBalance[]) {
  const groupes = new Map<string, { available: number; physicalTotal: number; costSomme: Prisma.Decimal }>();
  for (const ligne of stock) {
    const cle = cleCarte(ligne.cardId, ligne.languageId);
    const disponible = Math.max(0, ligne.physicalQuantity - ligne.reservedQuantity);
    const cout = new Prisma.Decimal(ligne.averageAcquisitionCost).mul(ligne.physicalQuantity);
    const existant = groupes.get(cle);
    if (existant) {
      existant.available += disponible;
      existant.physicalTotal += ligne.physicalQuantity;
      existant.costSomme = existant.costSomme.add(cout);
    } else {
      groupes.set(cle, { available: disponible, physicalTotal: ligne.physicalQuantity, costSomme: cout });
    }
  }

  const resultat = new Map<string, { available: number; averageCost: string }>();
  for (const [cle, groupe] of groupes) {
    resultat.set(cle, {
      available: groupe.available,
      averageCost: groupe.physicalTotal > 0 ? groupe.costSomme.div(groupe.physicalTotal).toFixed(4) : "0.0000",
    });
  }
  return resultat;
}

export function analyserRecette(exigences: BulkRecipeRequirement[], stock: BulkStockBalance[]): BulkRecipeAnalysis {
  const fusionnees = fusionnerExigences(exigences);
  const stockParCarte = agregerStock(stock);

  const lignes: BulkRecipeAvailability[] = fusionnees.map((exigence) => {
    const groupe = stockParCarte.get(cleCarte(exigence.cardId, exigence.languageId)) ?? { available: 0, averageCost: "0.0000" };
    const availableQuantity = groupe.available;
    return {
      cardId: exigence.cardId,
      languageId: exigence.languageId,
      section: exigence.section,
      quantity: exigence.quantity,
      availableQuantity,
      missingQuantity: Math.max(0, exigence.quantity - availableQuantity),
      buildableQuantity: Math.floor(availableQuantity / exigence.quantity),
      averageAcquisitionCost: groupe.averageCost,
      limiting: false,
    };
  });

  let buildableQuantity = lignes.length === 0 ? 0 : lignes[0].buildableQuantity;
  for (const ligne of lignes) {
    buildableQuantity = Math.min(buildableQuantity, ligne.buildableQuantity);
  }

  for (const ligne of lignes) {
    ligne.limiting = ligne.buildableQuantity === buildableQuantity;
  }

  const inventoryCostPerProduct = lignes
    .reduce((total, ligne) => total.add(new Prisma.Decimal(ligne.averageAcquisitionCost).mul(ligne.quantity)), new Prisma.Decimal(0))
    .toFixed(4);

  return { buildableQuantity, inventoryCostPerProduct, lines: lignes };
}
