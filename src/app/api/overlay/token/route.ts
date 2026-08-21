import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { regenerateToken } from "@/lib/overlay-server";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // « Nouveau lien » tue l'ancien partage et génère un jeton : rare, mais un
  // abus viderait les adresses déjà collées dans OBS. Limite par IP.
  if (!rateLimit(req, { bucket: "overlay-token", limit: 5 })) {
    return tooMany();
  }
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = await regenerateToken(user.id);
  return NextResponse.json({ token });
}
