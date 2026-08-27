/**
 * Lance un script contre la base de PRODUCTION, à travers le tunnel.
 *
 *   npx tsx scripts/prod-tunnel.mts --etat
 *   npx tsx scripts/prod-tunnel.mts scripts/seed-tier-lists.ts
 *
 * Les identifiants viennent de `.env.prod.local` et ne sont jamais affichés :
 * le script les lit, remplace l'hôte par le tunnel ouvert, et passe le tout au
 * processus fils par son environnement.
 *
 * Pourquoi ce remplacement d'hôte. `.env.prod.local` vise `127.0.0.1:5435`, un
 * transfert SSH local. Le tunnel réellement ouvert est le socat public sur
 * `178.104.237.33:15432` (cf. `HANDOFF.md`, section sur la base exposée). Les
 * deux mènent à la même base ; sans ce remplacement, le seed échouait sur un
 * port fermé sans dire pourquoi.
 *
 * ATTENTION : ce qui tourne ici écrit en PRODUCTION. Aucune reprise possible,
 * la base n'a pas de sauvegarde automatique côté Coolify. Toujours passer par
 * `--etat` avant, pour voir ce qu'on s'apprête à remplacer.
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const TUNNEL = process.env.PROD_TUNNEL ?? "178.104.237.33:15432";

function urlProd(): string {
  const brut = readFileSync(".env.prod.local", "utf-8");
  const ligne = brut.split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL="));
  if (!ligne) throw new Error(".env.prod.local ne porte pas de DATABASE_URL");
  const url = new URL(ligne.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, ""));
  const [hote, port] = TUNNEL.split(":");
  url.hostname = hote;
  url.port = port;
  return url.toString();
}

const cible = process.argv[2];
if (!cible) {
  console.error("Usage : npx tsx scripts/prod-tunnel.mts <script.ts | --etat>");
  process.exit(2);
}

const env = { ...process.env, DATABASE_URL: urlProd() };

if (cible === "--etat") {
  // Lecture seule : ce que la prod porte aujourd'hui.
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient({ datasources: { db: { url: env.DATABASE_URL } } });
  const [listes, cartes, decks] = await Promise.all([
    prisma.tierList.findMany({
      select: { title: true, setContext: true, current: true, updatedAt: true, _count: { select: { entries: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.card.count(),
    prisma.deck.count({ where: { published: true } }),
  ]);
  console.log(`PROD via ${TUNNEL} : ${cartes} cartes, ${decks} decks publiés\n`);
  for (const l of listes) {
    console.log(
      `  ${l.updatedAt.toISOString().slice(0, 10)} | ${String(l._count.entries).padStart(3)} entrées | ` +
      `${l.current ? "COURANTE " : "         "}${l.title}`,
    );
  }
  await prisma.$disconnect();
  process.exit(0);
}

console.log(`Lancement de ${cible} contre la PRODUCTION (${TUNNEL}).`);
// Sans `shell`, les arguments passent tels quels. Avec, Windows recoupe sur les
// espaces : `--sauf "Annie, Dark Child"` devenait trois arguments, et le script
// cherchait des tournois nommés « Annie, » puis « Dark » puis « Child ».
const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["tsx", cible, ...process.argv.slice(3)], {
  stdio: "inherit",
  env,
});
process.exit(r.status ?? 1);
