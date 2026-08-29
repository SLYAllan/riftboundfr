import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  return NextResponse.json(await prisma.bulkLanguage.findMany({ orderBy: [{ position: "asc" }, { code: "asc" }] }));
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  let data: unknown;
  try { data = await req.json(); } catch { return NextResponse.json({ error: "JSON invalide" }, { status: 400 }); }
  if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { code, label } = data as Record<string, unknown>;
  if (typeof code !== "string" || !/^[A-Z0-9_-]{2,16}$/.test(code) || typeof label !== "string" || !label.trim()) {
    return NextResponse.json({ error: "Code ou libellé invalide" }, { status: 400 });
  }
  try {
    const language = await prisma.bulkLanguage.create({ data: { code, label: label.trim() } });
    return NextResponse.json(language, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Cette langue existe déjà" }, { status: 409 });
  }
}
