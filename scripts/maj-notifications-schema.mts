/**
 * Les trois colonnes de la cloche de notifications.
 *
 *   npx tsx --env-file=.env scripts/maj-notifications-schema.mts --sec       essai à blanc
 *   npx tsx --env-file=.env.prod.local scripts/maj-notifications-schema.mts --hote 178.104.237.33:15432
 *
 * `--hote` remplace l'hôte et le port de DATABASE_URL, sans toucher au reste.
 * Il existe parce que `.env.prod.local` porte `127.0.0.1:5435`, une adresse où
 * rien n'écoute : la prod se joint par le tunnel public. Le mot de passe reste
 * dans le fichier, il n'est ni lu ni affiché.
 *
 * Pourquoi un script et pas `prisma db push` : la base locale porte aussi les
 * tables d'un autre projet, et `push` veut aligner TOUT le schéma d'un coup —
 * donc les supprimer. Ici on n'ajoute que ce qui manque.
 *
 * `notificationsVuesLe` porte la date du dernier passage dans la cloche ; les
 * deux `createdAt` datent un j'aime et un vote, qui ne l'étaient pas : sans eux
 * la cloche ne peut compter qu'un total, jamais dire ce qui est arrivé depuis la
 * dernière visite.
 *
 * Rejouable : tout est en `IF NOT EXISTS`. La remise à zéro des dates de lecture
 * ne se fait QUE si la colonne vient d'être créée — la rejouer marquerait tout
 * comme lu pour tout le monde, à chaque passage.
 */
import { PrismaClient } from "@prisma/client";

const sec = process.argv.includes("--sec");

function urlBase(): string {
  const brute = process.env.DATABASE_URL;
  if (!brute) throw new Error("DATABASE_URL manquante : passer --env-file.");
  const i = process.argv.indexOf("--hote");
  if (i === -1) return brute;
  const cible = process.argv[i + 1];
  if (!cible) throw new Error("--hote attend « hôte:port ».");
  const [hote, port] = cible.split(":");
  const u = new URL(brute);
  u.hostname = hote;
  if (port) u.port = port;
  return u.toString();
}

const prisma = new PrismaClient({ datasources: { db: { url: urlBase() } } });

const COLONNES = [
  { table: "User", colonne: "notificationsVuesLe" },
  { table: "CommunityDeckLike", colonne: "createdAt" },
  { table: "CommentVote", colonne: "createdAt" },
];

const INDEX = [
  { nom: "CommunityDeckLike_createdAt_idx", table: "CommunityDeckLike", colonnes: `"createdAt"` },
  { nom: "CommentVote_commentId_idx", table: "CommentVote", colonnes: `"commentId"` },
  { nom: "CommentVote_createdAt_idx", table: "CommentVote", colonnes: `"createdAt"` },
];

async function main() {
  // La cible, sans le mot de passe : on ne migre pas une base sans savoir laquelle.
  const [cible] = await prisma.$queryRaw<Array<{ base: string; hote: string | null; port: number | null }>>`
    SELECT current_database() AS base, inet_server_addr()::text AS hote, inet_server_port() AS port
  `;
  console.log(`Cible : base ${cible.base} sur ${cible.hote ?? "socket locale"}:${cible.port ?? "?"}`);
  // De quoi reconnaître la base d'un coup d'œil : on n'ajoute pas une colonne à
  // l'aveugle sur une base de production.
  const [decks, comptes, cartes] = await Promise.all([
    prisma.deck.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.card.count(),
  ]);
  console.log(`        ${decks} decks publiés · ${comptes} comptes · ${cartes} cartes`);

  const presentes = await prisma.$queryRaw<Array<{ table_name: string; column_name: string }>>`
    SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'
  `;
  const existe = new Set(presentes.map((c) => `${c.table_name}.${c.column_name}`));
  const manquantes = COLONNES.filter((c) => !existe.has(`${c.table}.${c.colonne}`));

  for (const c of COLONNES) {
    console.log(`  ${existe.has(`${c.table}.${c.colonne}`) ? "déjà là " : "à créer "} ${c.table}.${c.colonne}`);
  }

  if (sec) {
    console.log(`\nEssai à blanc : rien n'a été écrit. ${manquantes.length} colonne(s) à créer.`);
    return;
  }

  for (const c of manquantes) {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${c.table}" ADD COLUMN IF NOT EXISTS "${c.colonne}" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    console.log(`  créée : ${c.table}.${c.colonne}`);
  }

  for (const i of INDEX) {
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "${i.nom}" ON "${i.table}"(${i.colonnes})`);
  }
  console.log(`  ${INDEX.length} index vérifiés.`);

  // Les j'aime et les votes déjà en base viennent de prendre l'heure de CETTE
  // migration comme date de création. Sans cette remise à l'heure, chaque membre
  // découvrirait un arriéré de fausses notifications à sa première visite.
  const vientDEtreCreee = manquantes.some((c) => c.table === "User");
  if (vientDEtreCreee) {
    const lignes = await prisma.$executeRawUnsafe(`UPDATE "User" SET "notificationsVuesLe" = CURRENT_TIMESTAMP`);
    console.log(`  ${lignes} compte(s) partent avec la cloche vide, comme il se doit.`);
  } else {
    console.log("  Dates de lecture laissées telles quelles : la colonne existait déjà.");
  }

  console.log("\nFait.");
}

main()
  .catch((e) => {
    console.error("Échec :", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
