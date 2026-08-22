import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { getBinders, withBinderLock } from "@/lib/collection-server";

export const MAX_BINDERS = 3;

// GET /api/collection/binders → liste des classeurs de l'user (avec compteurs)
export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ binders: await getBinders(user.id), max: MAX_BINDERS });
}

// POST /api/collection/binders { name, description?, color? } → crée un classeur
export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 60) : "";
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });

  const binder = await withBinderLock(user.id, async (tx) => {
    const count = await tx.binder.count({ where: { userId: user.id } });
    if (count >= MAX_BINDERS) return null;
    return tx.binder.create({
      data: {
        userId: user.id,
        name,
        description: typeof body?.description === "string" ? body.description.slice(0, 200) : null,
        color: typeof body?.color === "string" ? body.color.slice(0, 20) : null,
        position: count,
      },
    });
  });
  if (!binder) return NextResponse.json({ error: "limit_reached", max: MAX_BINDERS }, { status: 409 });
  return NextResponse.json({ ok: true, binder });
}
