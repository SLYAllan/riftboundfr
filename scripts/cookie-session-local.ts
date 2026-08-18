// Signe un cookie de session pour ouvrir une page connectee en local (audit).
// Usage : npx tsx --env-file=.env scripts/cookie-session-local.ts
import crypto from "crypto";
import { prisma } from "../src/lib/prisma";

async function main() {
  const u = await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });
  if (!u) throw new Error("aucun utilisateur en base");
  const payload = `${u.id}:${Date.now()}:${crypto.randomBytes(8).toString("hex")}`;
  const hmac = crypto.createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("hex");
  console.log(JSON.stringify({ user: u.username, cookie: `${payload}.${hmac}` }));
  await prisma.$disconnect();
}
main();
