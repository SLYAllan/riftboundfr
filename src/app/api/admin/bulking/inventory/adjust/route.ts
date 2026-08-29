import { BulkMovementType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appliquerMouvement } from "@/lib/bulking-stock";
import { validerCorrectionStock, type CorrectionStockBulk } from "@/lib/bulking-validation";

export async function POST(req: NextRequest) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const validation = validerCorrectionStock(raw);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const data = raw as CorrectionStockBulk;

  const [carte, langue, emplacement] = await Promise.all([
    prisma.card.findUnique({ where: { id: data.cardId }, select: { id: true } }),
    prisma.bulkLanguage.findUnique({ where: { id: data.languageId }, select: { id: true } }),
    prisma.bulkStorageLocation.findUnique({ where: { id: data.storageLocationId }, select: { id: true } }),
  ]);
  if (!carte || !langue || !emplacement) return NextResponse.json({ error: "Carte, langue ou emplacement introuvable" }, { status: 404 });

  try {
    const resultat = await prisma.$transaction(async (tx) => {
      const mouvement = await appliquerMouvement(tx, {
        cardId: data.cardId,
        languageId: data.languageId,
        condition: data.condition,
        finish: data.finish,
        storageLocationId: data.storageLocationId,
        physicalDelta: data.physicalDelta,
        reservedDelta: data.reservedDelta,
        type: BulkMovementType.ADJUSTMENT,
        source: data.source.trim(),
        acquisitionUnitCost: data.acquisitionUnitCost ?? undefined,
        adminUserId: actor.adminUserId,
        adminLabel: actor.adminLabel,
      });
      const stock = await tx.bulkInventory.findUnique({
        where: {
          cardId_languageId_condition_finish_storageLocationId: {
            cardId: data.cardId,
            languageId: data.languageId,
            condition: data.condition,
            finish: data.finish,
            storageLocationId: data.storageLocationId,
          },
        },
        select: { physicalQuantity: true, reservedQuantity: true },
      });
      if (!stock) throw new Error("Stock introuvable");
      return { mouvement, stock };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({
      movementId: resultat.mouvement.id,
      physicalQuantity: resultat.stock.physicalQuantity,
      reservedQuantity: resultat.stock.reservedQuantity,
      availableQuantity: resultat.stock.physicalQuantity - resultat.stock.reservedQuantity,
    });
  } catch (error) {
    // Un message Prisma exposerait la requête et le schéma : seules nos erreurs d'invariant, écrites en français, ressortent telles quelles.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const conflit = error.code === "P2034";
      return NextResponse.json({ error: conflit ? "Écriture concurrente, réessayez" : "Correction impossible" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError || error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: "Correction impossible" }, { status: 409 });
    }
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Correction impossible" }, { status: 409 });
  }
}
