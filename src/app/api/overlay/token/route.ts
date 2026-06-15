import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { regenerateToken } from "@/lib/overlay-server";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const token = await regenerateToken(user.id);
  return NextResponse.json({ token });
}
