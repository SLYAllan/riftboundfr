import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // CSRF (L8) : refuse les écritures cross-origin sur l'API (défense en profondeur
  // au-dessus de SameSite=Lax). Origin absent (clients non-navigateur) = toléré.
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
    request.nextUrl.pathname.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== request.headers.get("host")) {
          return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
      }
    }
  }

  // Version anglaise : /en/decks sert la page /decks avec la langue posée en
  // en-tête. Aucun fichier n'est dupliqué, et une page pas encore traduite
  // reste lisible en français au lieu de renvoyer un 404.
  const chemin = request.nextUrl.pathname;
  const enAnglais = chemin === "/en" || chemin.startsWith("/en/");
  const cheminNu = enAnglais ? chemin.slice(3) || "/" : chemin;

  const entrees = new Headers(request.headers);
  entrees.set("x-langue", enAnglais ? "en" : "fr");
  entrees.set("x-chemin", cheminNu);

  let response: NextResponse;
  if (enAnglais) {
    const cible = request.nextUrl.clone();
    cible.pathname = cheminNu;
    response = NextResponse.rewrite(cible, { request: { headers: entrees } });
  } else {
    response = NextResponse.next({ request: { headers: entrees } });
  }
  response.headers.set("Content-Language", enAnglais ? "en" : "fr");

  // L'habillage de stream est la seule page qui encadre un site tiers (la caméra
  // VDO.Ninja) et affiche une image venue de n'importe où (le logo du tournoi). La
  // politique du site interdit les deux, à juste titre : on ne l'ouvre donc que sur
  // cette route, et seulement pour ce qu'elle a besoin.
  const estOverlay = cheminNu.startsWith("/overlay/");

  // L'adresse d'un habillage porte son jeton, qui donne accès à l'état en lecture.
  // Elle ne doit jamais finir dans un index : il suffit d'un lien collé quelque part
  // de public pour qu'elle y entre et y reste. On la laisse explorable (sinon
  // l'en-tête ne serait jamais lu) et on interdit l'indexation.
  // Même raison pour le compagnon : son adresse porte de quoi ÉCRIRE sur
  // l'habillage, elle n'a rien à faire dans un index.
  if (estOverlay || cheminNu.startsWith("/compagnon/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    estOverlay
      ? "camera=(), microphone=(), geolocation=(), autoplay=(self \"https://vdo.ninja\")"
      : "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      estOverlay
        ? // Le logo du tournoi est une image que l'organisateur héberge où il veut.
          "img-src 'self' data: blob: https:"
        : "img-src 'self' data: blob: https://cmsassets.rgpub.io https://cdn.discordapp.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net",
      "connect-src 'self' https://cmsassets.rgpub.io https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net",
      "frame-ancestors 'none'",
      // Sans ça, `default-src 'self'` interdit l'iframe et la caméra n'apparaît
      // jamais : c'était la cause du cadre vide, pas le code de l'overlay.
      estOverlay ? "frame-src https://vdo.ninja https://*.vdo.ninja" : "frame-src 'none'",
    ].join("; "),
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|img|bannieres|logorbfr).*)",
  ],
};
