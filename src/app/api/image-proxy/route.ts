import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_HOST = "cmsassets.rgpub.io";
/** Dix secondes : au-delà, l'hôte distant ne répond pas, il fait attendre. */
const DELAI_MS = 10_000;
/** Une illustration de carte pèse quelques centaines de kilo-octets. */
const TAILLE_MAX = 8 * 1024 * 1024;
/** Formats matriciels seulement. Un SVG servi depuis NOTRE domaine porte du script. */
const TYPES_SERVIS = ["image/webp", "image/png", "image/jpeg", "image/gif", "image/avif"];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    // redirect: "manual" → on ne SUIT pas un 3xx vers une cible interne (SSRF).
    // Le délai, lui, évite qu'un hôte lent immobilise une connexion serveur.
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(DELAI_MS) });
    if (res.status >= 300 && res.status < 400) {
      return NextResponse.json({ error: "Redirect refused" }, { status: 502 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const contentType = (res.headers.get("content-type") ?? "image/webp").split(";")[0].trim().toLowerCase();
    if (!TYPES_SERVIS.includes(contentType)) {
      return NextResponse.json({ error: "Not an image" }, { status: 415 });
    }
    // La taille annoncée d'abord, puis la vraie pendant la lecture : sans la
    // seconde, un hôte qui ment sur Content-Length remplissait la mémoire du
    // serveur, puisque tout était chargé d'un bloc.
    if (Number(res.headers.get("content-length") ?? 0) > TAILLE_MAX) {
      return NextResponse.json({ error: "Image too large" }, { status: 502 });
    }

    const flux = res.body;
    if (!flux) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const morceaux: Uint8Array[] = [];
    let recus = 0;
    const lecteur = flux.getReader();
    for (;;) {
      const { done, value } = await lecteur.read();
      if (done) break;
      recus += value.byteLength;
      if (recus > TAILLE_MAX) {
        await lecteur.cancel();
        return NextResponse.json({ error: "Image too large" }, { status: 502 });
      }
      morceaux.push(value);
    }
    const octets = new Uint8Array(recus);
    let position = 0;
    for (const morceau of morceaux) {
      octets.set(morceau, position);
      position += morceau.byteLength;
    }

    return new NextResponse(octets, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
