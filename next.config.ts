import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  // La pastille de développement de Next se pose en bas à gauche de CHAQUE page,
  // donc dans la source navigateur d'OBS : elle se voyait à l'écran pendant un
  // direct lancé sur le serveur de dev. Les erreurs de compilation restent affichées.
  devIndicators: false,
  experimental: {
    // Tree-shaking ciblé des gros barrels d'icônes (L12).
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cmsassets.rgpub.io",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
  async redirects() {
    return [
      // Consolide les signaux SEO : Google indexait des URLs en www (la canonical seule ne suffit pas).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.riftboundfrance.fr" }],
        destination: "https://riftboundfrance.fr/:path*",
        permanent: true,
      },
      // Les articles "meilleur deck par légende" ont été supprimés mais Google les
      // affiche toujours et ils renvoyaient un 404. Le slug d'article reprend celui
      // de la fiche : meilleur-deck-irelia-blade-dancer -> irelia-blade-dancer.
      {
        source: "/articles/meilleur-deck-:slug",
        destination: "/legendes/:slug",
        permanent: true,
      },
      // Cinq Regional Qualifiers portaient en base un nom que `tournament-flags.ts`
      // ne connaissait pas (« RQ Bologna 2026 »), donc leur page s'affichait sans
      // pays, sans date et sans nombre de joueurs. Le nom corrigé change l'adresse,
      // puisqu'elle est calculée depuis ce nom : les anciens liens sont redirigés.
      { source: "/tournois/rq-atlanta-2026", destination: "/tournois/atlanta-regional-qualifier", permanent: true },
      { source: "/tournois/rq-bologna-2026", destination: "/tournois/bologna-regional-qualifier", permanent: true },
      { source: "/tournois/rq-houston-2025", destination: "/tournois/houston-regional-qualifier", permanent: true },
      { source: "/tournois/rq-las-vegas-2026", destination: "/tournois/las-vegas-regional-qualifier", permanent: true },
      { source: "/tournois/rq-lille-2026", destination: "/tournois/lille-regional-qualifier", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
