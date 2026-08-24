import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics, CookieBanner } from "@/components/analytics";
import { CollectionProvider } from "@/components/collection/collection-provider";

import { ServiceWorkerRegister } from "@/components/sw-register";
import { FournisseurLangue } from "@/components/i18n-provider";
import { traduire, PREFIXE_EN } from "@/lib/i18n";
import { cheminCourant, langueCourante } from "@/lib/i18n-server";
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

const metadataFR: Metadata = {
  title: {
    default: "Riftbound France - Decks, cartes et guides du TCG en français",
    template: "%s | Riftbound France",
  },
  description:
    // "tier list" retiré du titre et rétrogradé ici : la page /tier-list vise cette
    // requête et l'accueil la lui prenait (position 4, 109 impressions captées par l'accueil).
    "Decklists de tournois, cartes, guides et résultats Riftbound en français.",
  // Fallback sur l'apex PROD (pas localhost) : si NEXT_PUBLIC_SITE_URL manque au build,
  // les og:image/canonical pointent quand même vers la prod, jamais vers localhost.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr"),
  keywords: ["Riftbound", "TCG", "cartes", "decks", "tier list", "guides", "tournois", "France", "français"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Riftbound France",
    title: "Riftbound France - Decks, cartes et guides du TCG en français",
    description: "Decklists de tournois, cartes, guides et résultats Riftbound en français.",
    images: ["/img/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@FRRiftbound",
    title: "Riftbound France",
    description: "Decklists, cartes et guides Riftbound en français.",
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

// Seul ce qui change d'une langue à l'autre est réécrit : le reste (metadataBase,
// robots, twitter, icônes) est commun aux deux versions.
export async function generateMetadata(): Promise<Metadata> {
  if ((await langueCourante()) === "fr") return metadataFR;
  return {
    ...metadataFR,
    title: {
      default: "Riftbound France - Decks, cards and guides for the TCG",
      template: "%s | Riftbound France",
    },
    description:
      "Riftbound in French and English: tournament decklists, card database, tier list, beginner guides and competitive results.",
    keywords: ["Riftbound", "TCG", "cards", "decks", "tier list", "guides", "tournaments", "France"],
    openGraph: {
      ...metadataFR.openGraph,
      locale: "en_GB",
      title: "Riftbound France - Decks, cards and guides for the TCG",
      description: "Tournament decklists, card database, guides and results for Riftbound.",
    },
    twitter: {
      ...metadataFR.twitter,
      description: "Decks, cards and guides for the Riftbound TCG.",
    },
  };
}

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
      description: "Tier lists, decks de tournois, guides et cartes Riftbound en français.",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const langue = await langueCourante();
  const chemin = await cheminCourant();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const cheminFr = chemin === "/" ? "" : chemin;

  return (
    <html lang={langue} className={`dark ${rubik.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="alternate" type="application/rss+xml" title="Riftbound France" href="/rss.xml" />
        {/* Déclaré ici plutôt que page par page : le middleware nous donne le
            chemin sans préfixe, ce qui couvre les 44 pages d'un coup. */}
        <link rel="alternate" hrefLang="fr" href={`${site}${cheminFr}`} />
        <link rel="alternate" hrefLang="en" href={`${site}${PREFIXE_EN}${cheminFr}`} />
        <link rel="alternate" hrefLang="x-default" href={`${site}${cheminFr}`} />
        {/* Vérification de propriété du site pour Impact. Leur balise attend `value`
            et non `content` : elle est écrite telle qu'ils la donnent, sinon la
            vérification échoue. L'API Metadata de Next ne sait produire que
            `content`, d'où la balise en clair ici. */}
        <meta name="impact-site-verification" {...{ value: "593585bf-09ed-4e6d-a416-3c83a58c46d6" }} />
      </head>
      <body className="min-h-dvh flex flex-col" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-arcane focus:px-4 focus:py-2 focus:text-canvas">
          {traduire("Aller au contenu", langue)}
        </a>
        <Analytics />
        <ServiceWorkerRegister />
        <FournisseurLangue langue={langue}>
          <CollectionProvider>
            <Navbar chemin={chemin} />
            <main id="contenu" className="flex-1">{children}</main>
            <Footer />
          </CollectionProvider>
          <CookieBanner />
        </FournisseurLangue>
      </body>
    </html>
  );
}
