/**
 * La table des abonnements de la cloche.
 *
 *   npx tsx --env-file=.env scripts/maj-abonnements-schema.mts --sec       essai à blanc
 *   npx tsx --env-file=.env.prod.local scripts/maj-abonnements-schema.mts --hote 178.104.237.33:15432
 *
 * `--hote` remplace l'hôte et le port de DATABASE_URL, sans toucher au reste.
 * Il existe parce que `.env.prod.local` porte `127.0.0.1:5435`, une adresse où
 * rien n'écoute : la prod se joint par le tunnel public. Le mot de passe reste
 * dans le fichier, il n'est ni lu ni affiché.
 *
 * Pourquoi un script et pas `prisma db push` : la base locale porte aussi les
 * tables d'un autre projet, et `push` veut aligner TOUT le schéma d'un coup —
 * donc les supprimer. Vérifié pendant l'écriture : il annonçait la suppression
 * de huit tables `Bulk*`. Ici on n'ajoute que ce qui manque.
 *
 * `Abonnement` porte ce qu'un membre veut suivre. Rien de plus : la cloche
 * recalcule les notifications à la lecture (`src/lib/notifications.ts`), on ne
 * stocke que l'abonnement. La table est volontairement ABSENTE de
 * `TABLES_ATTENDUES` (`migrate-schema.mjs`) : sinon le conteneur refuse de
 * démarrer entre le déploiement du code et le passage de ce script.
 *
 * Rejouable : tout est en `IF NOT EXISTS`, et la clé étrangère est posée dans un
 * bloc qui avale l'erreur « existe déjà ».
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

async function main() {
  // La cible, sans le mot de passe : on ne migre pas une base sans savoir laquelle.
  const [cible] = await prisma.$queryRaw<Array<{ base: string; hote: string | null; port: number | null }>>`
    SELECT current_database() AS base, inet_server_addr()::text AS hote, inet_server_port() AS port
  `;
  console.log(`Cible : base ${cible.base} sur ${cible.hote ?? "socket locale"}:${cible.port ?? "?"}`);
  const [decks, comptes, cartes] = await Promise.all([
    prisma.deck.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.card.count(),
  ]);
  console.log(`        ${decks} decks publiés · ${comptes} comptes · ${cartes} cartes`);

  const [{ existe }] = await prisma.$queryRaw<Array<{ existe: boolean }>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'Abonnement'
    ) AS existe
  `;
  console.log(`  ${existe ? "déjà là " : "à créer "} table Abonnement`);

  if (sec) {
    console.log(`\nEssai à blanc : rien n'a été écrit. ${existe ? "Rien" : "La table"} à créer.`);
    return;
  }

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Abonnement" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "genre" TEXT NOT NULL,
      "cible" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Abonnement_pkey" PRIMARY KEY ("id")
    )
  `);

  // La contrainte d'unicité porte la règle « un abonnement par personne et par
  // sujet » : sans elle, deux onglets ouverts créeraient deux lignes et la
  // cloche remonterait tout en double.
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "Abonnement_userId_genre_cible_key" ON "Abonnement"("userId","genre","cible")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Abonnement_genre_cible_idx" ON "Abonnement"("genre","cible")`,
  );

  // Un compte supprimé emporte ses abonnements. `duplicate_object` est avalé
  // pour que le script reste rejouable : PostgreSQL n'a pas d'`ADD CONSTRAINT
  // IF NOT EXISTS`.
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "Abonnement" ADD CONSTRAINT "Abonnement_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$
  `);

  const lignes = await prisma.abonnement.count();
  console.log(`  table prête, ${lignes} abonnement(s).`);
  console.log("\nFait.");
}

main()
  .catch((e) => {
    console.error("Échec :", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
