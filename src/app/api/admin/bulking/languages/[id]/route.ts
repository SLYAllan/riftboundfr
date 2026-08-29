import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let data: unknown;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { code, label } = data as Record<string, unknown>;
  if (typeof code !== "string" || !/^[A-Z0-9_-]{2,16}$/.test(code) || typeof label !== "string" || !label.trim()) return NextResponse.json({ error: "Code ou libellé invalide" }, { status: 400 });
  try {
    const { id } = await params;
    return NextResponse.json(await prisma.bulkLanguage.update({ where: { id }, data: { code, label: label.trim() } }));
  } catch {
    return NextResponse.json({ error: "Langue introuvable ou code déjà pris" }, { status: 409 });
  }
}
