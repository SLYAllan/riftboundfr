import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 });
  }

  const body = await req.json();
  const username = typeof body.username === "string" ? body.username.trim().slice(0, 30) : undefined;
  const riotGameName = typeof body.riotGameName === "string" ? body.riotGameName.trim().slice(0, 30) || null : undefined;
  const riotTagLine = typeof body.riotTagLine === "string" ? body.riotTagLine.trim().slice(0, 5) || null : undefined;

  const data: Record<string, unknown> = {};
  if (username && username.length >= 2) data.username = username;
  if (riotGameName !== undefined) data.riotGameName = riotGameName;
  if (riotTagLine !== undefined) data.riotTagLine = riotTagLine;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Rien à modifier" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
  });

  return NextResponse.json({
    username: updated.username,
    riotGameName: updated.riotGameName,
    riotTagLine: updated.riotTagLine,
  });
}
