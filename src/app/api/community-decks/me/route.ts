import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json(null, { status: 401 });
  return NextResponse.json({ id: user.id });
}
