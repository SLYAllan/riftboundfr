import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

export async function GET() {
  const user = await getUserFromSession();
  // `null` en 200, comme /api/auth/me : les deux boutons de /d/<code> ne veulent
  // que savoir si le visiteur est l'auteur, et le 401 sortait en erreur console
  // deux fois par page vue par un visiteur sans compte.
  if (!user) return NextResponse.json(null);
  return NextResponse.json({ id: user.id });
}
