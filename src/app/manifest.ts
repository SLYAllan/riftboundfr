import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Riftbound France",
    short_name: "RiftboundFR",
    description:
      "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound. Tout en francais.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#1c1c1e",
    theme_color: "#0ea5e9",
    orientation: "any",
    categories: ["games", "entertainment"],
    lang: "fr",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
  };
}
