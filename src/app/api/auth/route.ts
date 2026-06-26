import { NextRequest, NextResponse } from "next/server";
import { checkPassword, SESSION_COOKIE, createSessionValue } from "@/lib/auth";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Login admin : strict (5 tentatives/min/IP).
  if (!rateLimit(req, { bucket: "admin-login", limit: 5 })) {
    return tooMany("Trop de tentatives. Réessayez dans une minute.");
  }

  const { password } = await req.json();

  if (!checkPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  const sessionValue = createSessionValue();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
