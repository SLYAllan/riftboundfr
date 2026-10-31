import crypto from "node:crypto";

/**
 * Jetons signés des deux sessions : `riftbound_admin` (mot de passe) et
 * `riftbound_session` (compte Discord). Contenu `<qui>:<horodatage>:<aléa>`, puis
 * `.` et le HMAC-SHA256 du contenu par SESSION_SECRET.
 *
 * Les deux sessions partagent le secret et le format. Jusqu'au 31 octobre 2026,
 * la vérification admin ne regardait pas le contenu : la session d'un membre,
 * recopiée dans le cookie admin, ouvrait tout le back-office. Le type d'un jeton
 * se lit donc dans son contenu (préfixe `admin:`), jamais dans le nom du cookie.
 * La comparaison et les durées vivaient aussi en deux copies, comparées par `!==`.
 */
const PREFIXE_ADMIN = "admin:";
// Les durées des cookies posés par `api/auth` et le retour Discord.
export const AGE_MAX_ADMIN_MS = 7 * 24 * 60 * 60 * 1000;
export const AGE_MAX_MEMBRE_MS = 30 * 24 * 60 * 60 * 1000;
// Un horodatage venu du futur n'est jamais légitime ; une minute couvre un recalage d'horloge.
const AVANCE_TOLEREE_MS = 60 * 1000;

function empreinte(contenu: string): string {
  // Pas de repli : un secret faible signerait des sessions admin.
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is required");
  return crypto.createHmac("sha256", secret).update(contenu).digest("hex");
}

function signer(contenu: string): string {
  return `${contenu}.${empreinte(contenu)}`;
}

/** Le contenu si la signature et la date tiennent, sinon null. */
function contenuValide(jeton: string, ageMaxMs: number, maintenant: number): string | null {
  const point = jeton.lastIndexOf(".");
  if (point === -1) return null;
  const contenu = jeton.slice(0, point);
  const recue = Buffer.from(jeton.slice(point + 1));
  const attendue = Buffer.from(empreinte(contenu));
  // timingSafeEqual lève sur deux longueurs différentes.
  if (recue.length !== attendue.length || !crypto.timingSafeEqual(recue, attendue)) return null;
  const date = Number(contenu.split(":")[1]);
  if (!Number.isFinite(date) || date > maintenant + AVANCE_TOLEREE_MS || maintenant - date > ageMaxMs) return null;
  return contenu;
}

export function creerJetonAdmin(maintenant = Date.now()): string {
  return signer(`${PREFIXE_ADMIN}${maintenant}:${crypto.randomBytes(16).toString("hex")}`);
}

export function creerJetonMembre(userId: string, maintenant = Date.now()): string {
  return signer(`${userId}:${maintenant}:${crypto.randomBytes(8).toString("hex")}`);
}

export function jetonAdminValide(jeton: string, maintenant = Date.now()): boolean {
  return contenuValide(jeton, AGE_MAX_ADMIN_MS, maintenant)?.startsWith(PREFIXE_ADMIN) ?? false;
}

/** L'identifiant du membre, ou null. Un jeton admin n'ouvre pas de session membre. */
export function membreDuJeton(jeton: string, maintenant = Date.now()): string | null {
  const contenu = contenuValide(jeton, AGE_MAX_MEMBRE_MS, maintenant);
  if (!contenu || contenu.startsWith(PREFIXE_ADMIN)) return null;
  return contenu.split(":")[0];
}
