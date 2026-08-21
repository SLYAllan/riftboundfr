import { NextResponse, type NextRequest } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { creerSlugPartage } from "@/lib/partage-slug";

// PATCH /api/collection/binders/[id] { name?, description?, isPublic?, color? }
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const binder = await prisma.binder.findFirst({ where: { id, userId: user.id } });
  if (!binder) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const data: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) data.name = body.name.trim().slice(0, 60);
  if (typeof body?.description === "string") data.description = body.description.slice(0, 200) || null;
  if (typeof body?.color === "string") data.color = body.color.slice(0, 20) || null;
  if (typeof body?.isPublic === "boolean") {
    data.isPublic = body.isPublic;
    if (body.isPublic && !binder.shareSlug) data.shareSlug = creerSlugPartage();
  }

  const updated = await prisma.binder.update({ where: { id }, data });
  return NextResponse.json({ ok: true, binder: updated });
}

// DELETE /api/collection/binders/[id] → supprime le classeur (cartes en cascade)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;

  const binder = await prisma.binder.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!binder) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.binder.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
