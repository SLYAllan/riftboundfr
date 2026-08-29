import { Prisma, BulkMovementType, type BulkIntake } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appliquerMouvement } from "@/lib/bulking-stock";
import { coutsPourComptabilisation, fusionnerLignesEntree, type LigneEntreeBulk } from "@/lib/bulking-intake";
import type { BrouillonEntreeBulk } from "@/lib/bulking-validation";

export type BulkAdminActor = { adminUserId: string | null; adminLabel: string };

export async function verifierReferencesBrouillon(data: BrouillonEntreeBulk) {
  const lines = fusionnerLignesEntree(data.lines as LigneEntreeBulk[]);
  const [language, cards, locations, knownSet] = await Promise.all([
    prisma.bulkLanguage.findUnique({ where: { id: data.languageId }, select: { id: true } }),
    prisma.card.findMany({ where: { id: { in: [...new Set(lines.map((line) => line.cardId))] } }, select: { id: true } }),
    prisma.bulkStorageLocation.findMany({ where: { id: { in: [...new Set(lines.map((line) => line.storageLocationId))] } }, select: { id: true } }),
    data.knownSet ? prisma.cardSet.findUnique({ where: { setId: data.knownSet }, select: { id: true } }) : Promise.resolve({ id: "none" }),
  ]);
  if (!language) throw new Error("Langue introuvable");
  if (cards.length !== new Set(lines.map((line) => line.cardId)).size) throw new Error("Une carte est introuvable");
  if (locations.length !== new Set(lines.map((line) => line.storageLocationId)).size) throw new Error("Un emplacement est introuvable");
  if (!knownSet) throw new Error("Set introuvable");
  return lines;
}

export function donneesEntree(data: BrouillonEntreeBulk, actor: BulkAdminActor) {
  return {
    sellerSource: data.sellerSource.trim(),
    acquisitionDate: new Date(`${data.acquisitionDate}T12:00:00.000Z`),
    totalPrice: new Prisma.Decimal(data.totalPrice),
    costAllocationMethod: data.costAllocationMethod,
    languageId: data.languageId,
    defaultCondition: data.defaultCondition,
    defaultFinish: data.defaultFinish,
    knownSet: data.knownSet?.trim() || null,
    declaredCardCount: data.declaredCardCount,
    notes: data.notes?.trim() || null,
    createdById: actor.adminUserId,
    createdByLabel: actor.adminLabel,
  };
}

export function donneesLignes(intakeId: string, lines: LigneEntreeBulk[]) {
  return lines.map((line) => ({
    intakeId,
    cardId: line.cardId,
    quantity: line.quantity,
    condition: line.condition,
    finish: line.finish,
    acquisitionUnitCost: line.acquisitionUnitCost ? new Prisma.Decimal(line.acquisitionUnitCost) : null,
    storageLocationId: line.storageLocationId,
  }));
}

export async function comptabiliserEntree(id: string, actor: BulkAdminActor) {
  return prisma.$transaction(async (tx) => {
    const intake = await tx.bulkIntake.findUnique({ where: { id }, include: { lines: true } });
    if (!intake) throw new Error("Entrée introuvable");
    if (intake.status !== "DRAFT") throw new Error("Cette entrée a déjà été comptabilisée");
    const accountedCards = intake.lines.reduce((total, line) => total + line.quantity, 0);
    if (accountedCards !== intake.declaredCardCount) throw new Error(`Le lot contient ${accountedCards} cartes sur ${intake.declaredCardCount} annoncées`);
    const lines = intake.lines.map((line) => ({ ...line, acquisitionUnitCost: line.acquisitionUnitCost?.toString() ?? null }));
    const costs = coutsPourComptabilisation(intake.costAllocationMethod, intake.totalPrice, lines);
    for (const [index, line] of intake.lines.entries()) {
      await appliquerMouvement(tx, {
        cardId: line.cardId,
        languageId: intake.languageId,
        condition: line.condition,
        finish: line.finish,
        storageLocationId: line.storageLocationId,
        physicalDelta: line.quantity,
        type: BulkMovementType.INTAKE,
        source: `Entrée ${intake.id} · ${intake.sellerSource}`,
        acquisitionUnitCost: costs[index],
        intakeId: intake.id,
        adminUserId: actor.adminUserId,
        adminLabel: actor.adminLabel,
      });
    }
    return tx.bulkIntake.update({
      where: { id },
      data: { status: "POSTED", postedAt: new Date(), postedById: actor.adminUserId, postedByLabel: actor.adminLabel },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10_000, timeout: 60_000 });
}

export function serialiserEntree(intake: BulkIntake) {
  return { ...intake, totalPrice: intake.totalPrice.toString() };
}
