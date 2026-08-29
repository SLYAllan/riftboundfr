import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { donneesLignes, serialiserEntree, verifierReferencesBrouillon } from "@/lib/bulking-intake-server";
import { validerBrouillonEntree, type BrouillonEntreeBulk } from "@/lib/bulking-validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const intake = await prisma.bulkIntake.findUnique({ where: { id }, include: { language: true, lines: { include: { card: { select: { id: true, riftboundId: true, name: true, set: true, collectorNumber: true, rarity: true, imageUrl: true, alternateArt: true, overnumbered: true, signature: true } }, storageLocation: true }, orderBy: { createdAt: "asc" } } } });
  if (!intake) return NextResponse.json({ error: "Entrée introuvable" }, { status: 404 });
  const { lines, ...entree } = intake;
  return NextResponse.json({ intake: serialiserEntree(entree), lines: lines.map((line) => ({ ...line, acquisitionUnitCost: line.acquisitionUnitCost?.toString() ?? null })) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const validation = validerBrouillonEntree(raw);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const data = raw as BrouillonEntreeBulk;
  try {
    const lines = await verifierReferencesBrouillon(data);
    const { id } = await params;
    const intake = await prisma.$transaction(async (tx) => {
      const current = await tx.bulkIntake.findUnique({ where: { id }, select: { status: true } });
      if (!current) throw new Error("Entrée introuvable");
      if (current.status !== "DRAFT") throw new Error("Cette entrée a déjà été comptabilisée");
      const updated = await tx.bulkIntake.update({ where: { id }, data: { sellerSource: data.sellerSource.trim(), acquisitionDate: new Date(`${data.acquisitionDate}T12:00:00.000Z`), totalPrice: new Prisma.Decimal(data.totalPrice), costAllocationMethod: data.costAllocationMethod, languageId: data.languageId, defaultCondition: data.defaultCondition, defaultFinish: data.defaultFinish, knownSet: data.knownSet?.trim() || null, declaredCardCount: data.declaredCardCount, notes: data.notes?.trim() || null } });
      await tx.bulkIntakeLine.deleteMany({ where: { intakeId: id } });
      if (lines.length) await tx.bulkIntakeLine.createMany({ data: donneesLignes(id, lines) });
      return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ id, intake: serialiserEntree(intake), savedBy: actor.adminLabel });
  } catch (error) {
    const status = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034" || error instanceof Error && error.message.includes("déjà été comptabilisée") ? 409 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : "Modification impossible" }, { status });
  }
}
