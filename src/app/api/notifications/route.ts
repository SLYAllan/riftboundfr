import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/session";
import { notificationsDe } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const compte = await prisma.user.findUnique({
    where: { id: user.id },
    select: { notificationsVuesLe: true },
  });
  if (!compte) return NextResponse.json({ error: "Compte introuvable" }, { status: 404 });

  const { liste, nonLues } = await notificationsDe(user.id, compte.notificationsVuesLe);
  return NextResponse.json({ liste, nonLues });
}

/** Marque tout comme lu : la cloche ne garde qu'une date, pas un état par ligne. */
export async function POST() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  await prisma.user.update({ where: { id: user.id }, data: { notificationsVuesLe: new Date() } });
  return NextResponse.json({ ok: true });
}
