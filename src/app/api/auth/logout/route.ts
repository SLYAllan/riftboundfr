import { NextResponse } from "next/server";
import { getUserSessionCookieName } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(getUserSessionCookieName());
  return res;
}
