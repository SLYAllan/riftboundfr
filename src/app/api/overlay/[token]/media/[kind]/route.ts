import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { estGenreMedia } from "@/lib/overlay";

export const dynamic = "force-dynamic";

/**
 * Sert une image d'habillage envoyée depuis un fichier (logo ou décor). Adressée par
 * le jeton, comme l'habillage : la source navigateur d'OBS n'a pas de session.
 *
 * L'adresse porte `?v=<horodatage>`, posé à l'envoi : elle change à chaque nouvelle
 * image, donc on peut la laisser en cache pour de bon sans jamais afficher l'ancienne.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string; kind: string }> }) {
  const { token, kind } = await params;
  if (!estGenreMedia(kind)) return NextResponse.json({ error: "not_found" }, { status: 404 });
  try {
    const row = await prisma.overlayState.findUnique({ where: { token }, select: { userId: true } });
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const media = await prisma.overlayMedia.findUnique({ where: { userId_kind: { userId: row.userId, kind } } });
    if (!media) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return new NextResponse(new Uint8Array(media.data), {
      headers: {
        "Content-Type": media.mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // La table peut manquer sur une base pas encore poussée. Un 404 laisse le reste
    // de l'habillage à l'écran ; une erreur 500 ferait un trou en pleine diffusion.
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
