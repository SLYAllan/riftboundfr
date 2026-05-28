import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

export async function GET() {
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json(null);
  }
  return NextResponse.json({
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl,
    discordName: user.discordName,
    riotGameName: user.riotGameName,
    role: user.role,
  });
}
