import { BulkMovementType, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appliquerMouvement } from "@/lib/bulking-stock";
import { validerTransfert, type TransfertBulk } from "@/lib/bulking-validation";

export async function POST(req: NextRequest) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const validation = validerTransfert(raw);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const data = raw as TransfertBulk;

  const [carte, langue, depart, arrivee] = await Promise.all([
    prisma.card.findUnique({ where: { id: data.cardId }, select: { id: true } }),
    prisma.bulkLanguage.findUnique({ where: { id: data.languageId }, select: { id: true } }),
    prisma.bulkStorageLocation.findUnique({ where: { id: data.fromLocationId }, select: { id: true } }),
    prisma.bulkStorageLocation.findUnique({ where: { id: data.toLocationId }, select: { id: true } }),
  ]);
  if (!carte || !langue || !depart || !arrivee) return NextResponse.json({ error: "Carte, langue ou emplacement introuvable" }, { status: 404 });

  try {
    const resultat = await prisma.$transaction(async (tx) => {
      const stockDepart = await tx.bulkInventory.findUnique({
        where: {
          cardId_languageId_condition_finish_storageLocationId: {
            cardId: data.cardId,
            languageId: data.languageId,
            condition: data.condition,
            finish: data.finish,
            storageLocationId: data.fromLocationId,
          },
        },
        select: { averageAcquisitionCost: true },
      });
      if (!stockDepart) throw new Error("Stock insuffisant");
      const coutReporte = stockDepart.averageAcquisitionCost;

      const sortie = await appliquerMouvement(tx, {
        cardId: data.cardId,
        languageId: data.languageId,
        condition: data.condition,
        finish: data.finish,
        storageLocationId: data.fromLocationId,
        physicalDelta: -data.quantity,
        type: BulkMovementType.TRANSFER_OUT,
        source: data.source.trim(),
        adminUserId: actor.adminUserId,
        adminLabel: actor.adminLabel,
      });
      const entree = await appliquerMouvement(tx, {
        cardId: data.cardId,
        languageId: data.languageId,
        condition: data.condition,
        finish: data.finish,
        storageLocationId: data.toLocationId,
        physicalDelta: data.quantity,
        type: BulkMovementType.TRANSFER_IN,
        source: data.source.trim(),
        acquisitionUnitCost: coutReporte,
        adminUserId: actor.adminUserId,
        adminLabel: actor.adminLabel,
      });
      return { sortie, entree };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    return NextResponse.json({ movementOutId: resultat.sortie.id, movementInId: resultat.entree.id });
  } catch (error) {
    // Un message Prisma exposerait la requête et le schéma : seules nos erreurs d'invariant, écrites en français, ressortent telles quelles.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const conflit = error.code === "P2034";
      return NextResponse.json({ error: conflit ? "Écriture concurrente, réessayez" : "Transfert impossible" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientUnknownRequestError || error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json({ error: "Transfert impossible" }, { status: 409 });
    }
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 409 });
    return NextResponse.json({ error: "Transfert impossible" }, { status: 409 });
  }
}
