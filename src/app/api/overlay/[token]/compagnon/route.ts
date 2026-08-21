import { NextResponse } from "next/server";
import { saveStateByToken } from "@/lib/overlay-server";
import { cleCompagnonValide } from "@/lib/overlay-compagnon";
import { TAILLE_MAX_PATCH_OVERLAY, validerPatchOverlay } from "@/lib/overlay-validation";
import { rateLimit, tooMany } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * Écriture depuis le compagnon : pas de session Discord, le joueur qui tient le
 * téléphone n'est pas forcément celui qui diffuse. La clé du lien de partage tient
 * lieu de mot de passe ; elle voyage en en-tête et non dans l'adresse, pour ne pas
 * s'écrire dans les journaux du serveur à chaque point marqué.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  // Limite par IP avant même de vérifier la clé : le compagnon écrit à chaque
  // point marqué, et une clé devinable ne doit pas se tenter à volonté.
  if (!rateLimit(req, { bucket: "overlay-compagnon", limit: 60 })) {
    return tooMany("Trop de requêtes, réessayez dans une minute");
  }
  const { token } = await params;
  if (!cleCompagnonValide(token, req.headers.get("x-cle-compagnon"))) {
    return NextResponse.json({ error: "Lien de partage invalide" }, { status: 403 });
  }
  const tailleAnnoncee = Number(req.headers.get("content-length") ?? 0);
  if (tailleAnnoncee > TAILLE_MAX_PATCH_OVERLAY) {
    return NextResponse.json({ error: "Le patch overlay dépasse 32 Kio" }, { status: 413 });
  }
  let patch: unknown;
  try {
    patch = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }
  const validation = validerPatchOverlay(patch);
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  const merged = await saveStateByToken(token, validation.value);
  if (!merged) return NextResponse.json({ error: "Habillage introuvable" }, { status: 404 });
  return NextResponse.json({ state: merged });
}
