import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getBulkAdminActor } from "@/lib/auth";
import { comptabiliserEntree, serialiserEntree } from "@/lib/bulking-intake-server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getBulkAdminActor();
  if (!actor) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json({ intake: serialiserEntree(await comptabiliserEntree(id, actor)) });
  } catch (error) {
    const tropLong = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2028";
    const message = tropLong ? "La comptabilisation a pris trop de temps. Aucun stock n'a été modifié." : error instanceof Error ? error.message : "Comptabilisation impossible";
    const conflict = message.includes("déjà") || error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
    return NextResponse.json({ error: message }, { status: conflict ? 409 : 400 });
  }
}
