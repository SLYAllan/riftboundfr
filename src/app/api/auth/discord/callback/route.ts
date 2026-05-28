import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createUserSession, getUserSessionCookieName } from "@/lib/session";

interface DiscordUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/?auth_error=cancelled", req.url));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("discord_oauth_state")?.value;
  cookieStore.delete("discord_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/?auth_error=invalid_state", req.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID!;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/discord/callback`;

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/?auth_error=token_failed", req.url));
  }

  const { access_token } = await tokenRes.json();

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/?auth_error=user_fetch_failed", req.url));
  }

  const discordUser: DiscordUser = await userRes.json();

  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${discordUser.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;

  const displayName = discordUser.global_name || discordUser.username;

  const user = await prisma.user.upsert({
    where: { discordId: discordUser.id },
    update: {
      discordName: discordUser.username,
      username: displayName,
      avatarUrl,
    },
    create: {
      discordId: discordUser.id,
      discordName: discordUser.username,
      username: displayName,
      avatarUrl,
    },
  });

  const sessionToken = await createUserSession(user.id);

  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set(getUserSessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
