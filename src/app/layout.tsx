import type { Metadata, Viewport } from "next";
import { Rubik, Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Analytics, CookieBanner } from "@/components/analytics";

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
    default: "Riftbound France — La référence Riftbound en français",
    template: "%s | Riftbound France",
  },
  description:
    "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound. Tout en français.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  keywords: ["Riftbound", "TCG", "cartes", "decks", "tier list", "guides", "tournois", "France", "français"],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Riftbound France",
    title: "Riftbound France — La référence Riftbound en français",
    description: "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@FRRiftbound",
    title: "Riftbound France",
    description: "La référence francophone pour le TCG Riftbound.",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Riftbound France",
  url: "https://riftboundfrance.fr",
  description: "Base de cartes, tier lists, decks, guides et tournois pour le TCG Riftbound. Tout en français.",
  inLanguage: "fr",
  publisher: {
    "@type": "Organization",
    name: "Riftbound France",
    url: "https://riftboundfrance.fr",
    email: "contact@riftboundfrance.fr",
  },
  potentialAction: {
    "@type": "SearchAction",
    target: "https://riftboundfrance.fr/cartes?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${rubik.variable} ${jakarta.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col" style={{ fontFamily: "var(--font-jakarta), sans-serif" }}>
        <Analytics />
        <ServiceWorkerRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
