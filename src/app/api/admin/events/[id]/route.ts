import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { validerEvenement } from "@/lib/admin-validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Evenement introuvable" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerEvenement(data, "mise à jour");
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const present = (cle: string) => Object.prototype.hasOwnProperty.call(data, cle);
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(present("title") && { title: data.title }),
      ...(present("description") && { description: data.description }),
      ...(present("date") && { date: data.date ? new Date(data.date) : undefined }),
      ...(present("endDate") && { endDate: data.endDate ? new Date(data.endDate) : null }),
      ...(present("location") && { location: data.location }),
      ...(present("url") && { url: data.url }),
      ...(present("type") && { type: data.type }),
      ...(present("published") && { published: data.published }),
    },
  });
  return NextResponse.json(event);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const { id } = await params;
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
