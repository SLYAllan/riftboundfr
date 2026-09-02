import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Sonde de disponibilité, lue par le HEALTHCHECK de l'image et par Coolify.
 *
 * Elle interroge la base : sans elle, un conteneur dont la base est tombée
 * restait « en ligne » pendant que toutes les pages répondaient en erreur. Le
 * schéma vide ou incomplet, lui, est refusé plus tôt, au démarrage.
 */
export async function GET() {
  try {
    await prisma.card.count();
    return NextResponse.json({ etat: "ok" });
  } catch {
    return NextResponse.json({ etat: "base injoignable" }, { status: 503 });
  }
}
