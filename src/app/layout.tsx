import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics, CookieBanner } from "@/components/analytics";
import { CollectionProvider } from "@/components/collection/collection-provider";

import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-rubik",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "Riftbound France - Decks, cartes et guides du TCG en français",
    template: "%s | Riftbound France",
  },
  description:
    // "tier list" retiré du titre et rétrogradé ici : la page /tier-list vise cette
    // requête et l'accueil la lui prenait (position 4, 109 impressions captées par l'accueil).
    "La référence francophone Riftbound : decklists de tournois, base de cartes, guides débutants et résultats compétitifs.",
  // Fallback sur l'apex PROD (pas localhost) : si NEXT_PUBLIC_SITE_URL manque au build,
  // les og:image/canonical pointent quand même vers la prod, jamais vers localhost.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr"),
  keywords: ["Riftbound", "TCG", "cartes", "decks", "tier list", "guides", "tournois", "France", "français"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Riftbound France",
    title: "Riftbound France - Decks, cartes et guides du TCG en français",
    description: "La référence francophone Riftbound : decklists de tournois, base de cartes, guides et résultats.",
    images: ["/img/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@FRRiftbound",
    title: "Riftbound France",
    description: "La référence francophone pour le TCG Riftbound.",
    images: ["/img/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Riftbound France",
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

// @graph lie le WebSite et l'Organisation via @id. L'Organization (name + logo +
// sameAs) est le signal d'entité que Google utilise pour reconnaître la marque
// "Riftbound France" comme distincte du jeu Riftbound (Riot) → requête de marque.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://riftboundfrance.fr/#website",
      name: "Riftbound France",
      url: "https://riftboundfrance.fr",
      description: "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound. Tout en français.",
      inLanguage: "fr",
      publisher: { "@id": "https://riftboundfrance.fr/#organization" },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://riftboundfrance.fr/cartes?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://riftboundfrance.fr/#organization",
      name: "Riftbound France",
      alternateName: "RiftboundFrance",
      url: "https://riftboundfrance.fr",
      email: "contact@riftboundfrance.fr",
      description: "La référence francophone pour le TCG Riftbound : tier lists, decks de tournois, guides et base de cartes.",
      logo: {
        "@type": "ImageObject",
        url: "https://riftboundfrance.fr/logorbfr.png",
        width: 224,
        height: 112,
      },
      sameAs: ["https://x.com/FRRiftbound"],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${rubik.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="application/rss+xml" title="Riftbound France" href="/rss.xml" />
        {/* Vérification de propriété du site pour Impact. Leur balise attend `value`
            et non `content` : elle est écrite telle qu'ils la donnent, sinon la
            vérification échoue. L'API Metadata de Next ne sait produire que
            `content`, d'où la balise en clair ici. */}
        <meta name="impact-site-verification" {...{ value: "593585bf-09ed-4e6d-a416-3c83a58c46d6" }} />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-arcane focus:px-4 focus:py-2 focus:text-white">
          Aller au contenu
        </a>
        <Analytics />
        <ServiceWorkerRegister />
        <CollectionProvider>
          <Navbar />
          <main id="contenu" className="flex-1">{children}</main>
          <Footer />
        </CollectionProvider>
        <CookieBanner />
      </body>
    </html>
  );
}
