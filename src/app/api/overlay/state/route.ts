import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { getOrCreateOverlayState, saveState } from "@/lib/overlay-server";
import { TAILLE_MAX_PATCH_OVERLAY, validerPatchOverlay } from "@/lib/overlay-validation";

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
  const tailleAnnoncee = Number(req.headers.get("content-length") ?? 0);
  if (tailleAnnoncee > TAILLE_MAX_PATCH_OVERLAY) {
    return NextResponse.json({ error: "Le patch overlay dépasse 32 Kio" }, { status: 413 });
  }
  let patch: unknown;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerPatchOverlay(patch);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const merged = await saveState(user.id, validation.value);
  return NextResponse.json({ state: merged });
}
