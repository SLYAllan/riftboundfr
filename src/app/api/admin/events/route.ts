import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { validerEvenement } from "@/lib/admin-validation";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const events = await prisma.event.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerEvenement(data);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      date: new Date(data.date),
      endDate: data.endDate ? new Date(data.endDate) : null,
      location: data.location ?? null,
      url: data.url ?? null,
      type: data.type ?? "online",
      published: data.published ?? false,
    },
  });
  return NextResponse.json(event, { status: 201 });
}
