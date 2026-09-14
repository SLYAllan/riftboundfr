import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const chemin = request.nextUrl.pathname;
  const langue = chemin === "/en" || chemin.startsWith("/en/")
    ? "en"
    : chemin === "/zh" || chemin.startsWith("/zh/")
      ? "zh"
      : "fr";
  const cheminNu = langue === "fr" ? chemin : chemin.slice(3) || "/";

  // Le préfixe de langue doit partir avant le contrôle : /en/api/* reste une API.
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method) &&
    cheminNu.startsWith("/api/")
  ) {
    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).origin !== new URL(process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin).origin) {
          return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
      }
    }
  }

  // /en/decks et /zh/decks servent la page /decks sans dupliquer les routes.
  const entrees = new Headers(request.headers);
  entrees.set("x-langue", langue);
  entrees.set("x-chemin", cheminNu);

  let response: NextResponse;
  if (langue !== "fr") {
    const cible = request.nextUrl.clone();
    cible.pathname = cheminNu;
    response = NextResponse.rewrite(cible, { request: { headers: entrees } });
  } else {
    response = NextResponse.next({ request: { headers: entrees } });
  }
  response.headers.set("Content-Language", langue === "zh" ? "zh-Hant" : langue);

  // Seul l'overlay encadre VDO.Ninja et affiche une image venue de l'organisateur.
  const estOverlay = cheminNu.startsWith("/overlay/");
  if (estOverlay || cheminNu.startsWith("/compagnon/") || langue === "zh") {
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
        ? "img-src 'self' data: blob: https:"
        : "img-src 'self' data: blob: https://cmsassets.rgpub.io https://cdn.discordapp.com https://www.google-analytics.com https://*.google-analytics.com https://*.g.doubleclick.net",
      "connect-src 'self' https://cmsassets.rgpub.io https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://stats.g.doubleclick.net",
      "frame-ancestors 'none'",
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
