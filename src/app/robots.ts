import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
      // L'image d'aperçu d'un deck vit sous /api/. Les robots d'aperçu qui respectent ce
      // fichier (X, Facebook, LinkedIn) ne la chargeaient donc pas, et le lien d'un deck
      // s'affichait sans image. Eux seuls y ont droit : un moteur de recherche qui
      // parcourrait 34 000 images de deck mettrait le serveur à genoux.
      {
        userAgent: ["Twitterbot", "facebookexternalhit", "LinkedInBot", "Slackbot", "TelegramBot", "WhatsApp", "Discordbot"],
        allow: ["/", "/api/decklist-image"],
        disallow: ["/admin", "/api/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Applebot-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
