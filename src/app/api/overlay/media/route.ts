import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getOrCreateOverlayState, saveState } from "@/lib/overlay-server";
import { TYPES_IMAGE, estGenreMedia, TAILLE_MAX_MEDIA, typeReel, CLE_URL_MEDIA } from "@/lib/overlay";

export const dynamic = "force-dynamic";

/**
 * Reçoit une image d'habillage : le logo du tournoi, ou le décor entier.
 *
 * Le navigateur redimensionne avant d'envoyer ; les bornes ici servent à ce qu'un
 * envoi qui contourne le tableau de bord n'écrive pas vingt méga-octets dans la base.
 * Un décor pèse plus lourd qu'un logo : il fait 1920x1080 et garde sa transparence.
 */
export async function POST(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const genre = new URL(req.url).searchParams.get("kind") ?? "logo";
  if (!estGenreMedia(genre)) return NextResponse.json({ error: "Genre d’image inconnu." }, { status: 400 });

  const mime = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!TYPES_IMAGE.includes(mime)) {
    return NextResponse.json({ error: "Format refusé : PNG, JPEG, WebP ou GIF." }, { status: 415 });
  }
  const maxi = TAILLE_MAX_MEDIA[genre];
  const kio = Math.round(maxi / 1024);
  // On refuse sur la taille annoncée avant de tout charger en mémoire.
  if (Number(req.headers.get("content-length") ?? 0) > maxi) {
    return NextResponse.json({ error: `L’image dépasse ${kio} Kio.` }, { status: 413 });
  }

  const octets = new Uint8Array(await req.arrayBuffer());
  if (octets.length === 0) return NextResponse.json({ error: "Fichier vide." }, { status: 400 });
  if (octets.length > maxi) return NextResponse.json({ error: `L’image dépasse ${kio} Kio.` }, { status: 413 });

  // On ne croit pas l'en-tête sur parole : c'est l'envoyeur qui l'écrit. Le type
  // gardé est celui lu dans les octets, et c'est sous celui-là qu'on resservira.
  const vrai = typeReel(octets);
  if (!vrai) return NextResponse.json({ error: "Ce fichier n’est pas une image PNG, JPEG, WebP ou GIF." }, { status: 415 });

  // Le jeton sert d'adresse publique : l'image se sert sur la même route que
  // l'habillage, donc sans session, puisque OBS n'en a pas.
  const row = await getOrCreateOverlayState(user.id);
  await prisma.overlayMedia.upsert({
    where: { userId_kind: { userId: user.id, kind: genre } },
    create: { userId: user.id, kind: genre, mime: vrai, data: octets },
    update: { mime: vrai, data: octets },
  });

  // L'adresse porte un numéro de version : sans lui, une image remplacée resterait
  // l'ancienne dans le cache d'OBS jusqu'au prochain redémarrage de la source.
  return NextResponse.json({ url: `/api/overlay/${row.token}/media/${genre}?v=${Date.now()}` });
}

export async function DELETE(req: Request) {
  const user = await getUserFromSession();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const genre = new URL(req.url).searchParams.get("kind") ?? "logo";
  if (!estGenreMedia(genre)) return NextResponse.json({ error: "Genre d’image inconnu." }, { status: 400 });
  // Les octets ET l'adresse partent ensemble. Le tableau de bord vidait l'adresse
  // de son côté puis lançait ce DELETE sans en lire la réponse : quand il échouait,
  // l'image restait en base pour toujours, invisible et impossible à retirer.
  await prisma.overlayMedia.deleteMany({ where: { userId: user.id, kind: genre } });
  const etat = await saveState(user.id, { event: { [CLE_URL_MEDIA[genre]]: "" } });
  return NextResponse.json({ ok: true, state: etat });
}
