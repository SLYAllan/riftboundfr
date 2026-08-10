import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState, saveState } from "@/lib/overlay-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const row = await getOrCreateOverlayState(user.id);
  return NextResponse.json({ token: row.token, state: row.state });
}

export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const patch = await req.json();
  const merged = await saveState(user.id, patch);
  return NextResponse.json({ state: merged });
}
