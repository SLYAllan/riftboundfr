import { Prisma, BulkMovementType, type BulkCardCondition, type BulkCardFinish } from "@prisma/client";

type StockActuel = {
  physicalQuantity: number;
  reservedQuantity: number;
  averageAcquisitionCost: Prisma.Decimal.Value;
};

type ChangementStock = StockActuel & {
  physicalDelta: number;
  reservedDelta: number;
  acquisitionUnitCost?: Prisma.Decimal.Value;
};

export function calculerCoutUniforme(totalPrice: Prisma.Decimal.Value, accountedCards: number) {
  if (!Number.isInteger(accountedCards) || accountedCards <= 0) {
    throw new Error("Impossible de répartir le coût sur aucune carte");
  }
  return new Prisma.Decimal(totalPrice).div(accountedCards);
}

export function calculerNouveauStock(input: ChangementStock) {
  if (![input.physicalQuantity, input.reservedQuantity, input.physicalDelta, input.reservedDelta].every(Number.isInteger)) {
    throw new Error("Les quantités doivent être des entiers");
  }
  if (input.acquisitionUnitCost !== undefined && new Prisma.Decimal(input.acquisitionUnitCost).isNegative()) {
    throw new Error("Le coût d'acquisition ne peut pas être négatif");
  }
  const physicalQuantity = input.physicalQuantity + input.physicalDelta;
  const reservedQuantity = input.reservedQuantity + input.reservedDelta;
  if (physicalQuantity < 0) throw new Error("Stock physique insuffisant");
  if (reservedQuantity < 0) throw new Error("Quantité réservée insuffisante");
  if (reservedQuantity > physicalQuantity) throw new Error("Stock disponible insuffisant");

  const ancienCout = new Prisma.Decimal(input.averageAcquisitionCost);
  let averageAcquisitionCost = ancienCout;
  if (physicalQuantity === 0) averageAcquisitionCost = new Prisma.Decimal(0);
  else if (input.physicalDelta > 0) {
    if (input.acquisitionUnitCost === undefined) throw new Error("Le coût unitaire manque");
    averageAcquisitionCost = ancienCout
      .mul(input.physicalQuantity)
      .add(new Prisma.Decimal(input.acquisitionUnitCost).mul(input.physicalDelta))
      .div(physicalQuantity);
  }

  return {
    physicalQuantity,
    reservedQuantity,
    availableQuantity: physicalQuantity - reservedQuantity,
    averageAcquisitionCost,
  };
}

type TransactionStock = Pick<Prisma.TransactionClient, "bulkInventory" | "bulkInventoryMovement">;

export type MouvementBulkInput = {
  cardId: string;
  languageId: string;
  condition: BulkCardCondition;
  finish: BulkCardFinish;
  storageLocationId: string;
  physicalDelta: number;
  reservedDelta?: number;
  type: BulkMovementType;
  source: string;
  acquisitionUnitCost?: Prisma.Decimal.Value;
  intakeId?: string;
  recipeId?: string;
  relatedReference?: string;
  reversalOfId?: string;
  adminUserId: string | null;
  adminLabel: string;
};

export async function appliquerMouvement(tx: TransactionStock, input: MouvementBulkInput) {
  if (!Number.isInteger(input.physicalDelta) || !Number.isInteger(input.reservedDelta ?? 0)) {
    throw new Error("Les deltas doivent être des entiers");
  }
  if (input.physicalDelta === 0 && (input.reservedDelta ?? 0) === 0) {
    throw new Error("Le mouvement ne change aucune quantité");
  }

  const cle = {
    cardId_languageId_condition_finish_storageLocationId: {
      cardId: input.cardId,
      languageId: input.languageId,
      condition: input.condition,
      finish: input.finish,
      storageLocationId: input.storageLocationId,
    },
  };
  const existant = await tx.bulkInventory.findUnique({ where: cle });
  const actuel = existant ?? {
    physicalQuantity: 0,
    reservedQuantity: 0,
    averageAcquisitionCost: new Prisma.Decimal(0),
  };
  const nouveau = calculerNouveauStock({
    ...actuel,
    physicalDelta: input.physicalDelta,
    reservedDelta: input.reservedDelta ?? 0,
    acquisitionUnitCost: input.acquisitionUnitCost,
  });

  const inventory = await tx.bulkInventory.upsert({
    where: cle,
    create: {
      cardId: input.cardId,
      languageId: input.languageId,
      condition: input.condition,
      finish: input.finish,
      storageLocationId: input.storageLocationId,
      physicalQuantity: nouveau.physicalQuantity,
      reservedQuantity: nouveau.reservedQuantity,
      averageAcquisitionCost: nouveau.averageAcquisitionCost,
    },
    update: {
      physicalQuantity: nouveau.physicalQuantity,
      reservedQuantity: nouveau.reservedQuantity,
      averageAcquisitionCost: nouveau.averageAcquisitionCost,
    },
  });

  return tx.bulkInventoryMovement.create({
    data: {
      inventoryId: inventory.id,
      physicalDelta: input.physicalDelta,
      reservedDelta: input.reservedDelta ?? 0,
      type: input.type,
      source: input.source,
      acquisitionUnitCost: input.acquisitionUnitCost,
      intakeId: input.intakeId,
      recipeId: input.recipeId,
      relatedReference: input.relatedReference,
      reversalOfId: input.reversalOfId,
      adminUserId: input.adminUserId,
      adminLabel: input.adminLabel,
    },
  });
}
