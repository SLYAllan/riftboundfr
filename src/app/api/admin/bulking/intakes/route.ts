import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { donneesEntree, donneesLignes, serialiserEntree, verifierReferencesBrouillon } from "@/lib/bulking-intake-server";
import { validerBrouillonEntree, type BrouillonEntreeBulk } from "@/lib/bulking-validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const intakes = await prisma.bulkIntake.findMany({ include: { language: true, _count: { select: { lines: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(intakes.map((intake) => ({ ...intake, totalPrice: intake.totalPrice.toString() })));
}

export async function POST(req: NextRequest) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let raw: unknown;
  try { raw = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  const validation = validerBrouillonEntree(raw);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const data = raw as BrouillonEntreeBulk;
  try {
    const lines = await verifierReferencesBrouillon(data);
    const intake = await prisma.$transaction(async (tx) => {
      const created = await tx.bulkIntake.create({ data: donneesEntree(data, actor) });
      if (lines.length) await tx.bulkIntakeLine.createMany({ data: donneesLignes(created.id, lines) });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ id: intake.id, intake: serialiserEntree(intake) }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") return NextResponse.json({ error: "Écriture concurrente, réessayez" }, { status: 409 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Création impossible" }, { status: 400 });
  }
}
