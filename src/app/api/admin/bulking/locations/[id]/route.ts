import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let data: unknown;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { code, label, notes } = data as Record<string, unknown>;
  if (typeof code !== "string" || !/^[A-Z0-9_-]{2,40}$/.test(code)) return NextResponse.json({ error: "Code invalide" }, { status: 400 });
  if (label != null && typeof label !== "string" || notes != null && typeof notes !== "string") return NextResponse.json({ error: "Libellé ou notes invalides" }, { status: 400 });
  try {
    const { id } = await params;
    const location = await prisma.bulkStorageLocation.update({ where: { id }, data: { code, label: typeof label === "string" ? label.trim() || null : null, notes: typeof notes === "string" ? notes.trim() || null : null } });
    return NextResponse.json(location);
  } catch {
    return NextResponse.json({ error: "Emplacement introuvable ou code déjà pris" }, { status: 409 });
  }
}
