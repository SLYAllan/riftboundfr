import { NextRequest, NextResponse } from "next/server";
import { checkPassword, SESSION_COOKIE, createSessionValue } from "@/lib/auth";

const loginAttempts = new Map<string, number[]>();

function rateLimitLogin(ip: string, windowMs = 60_000, max = 5): boolean {
  const now = Date.now();
  const hits = (loginAttempts.get(ip) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  loginAttempts.set(ip, hits);
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimitLogin(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez dans une minute." },
      { status: 429 },
    );
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
