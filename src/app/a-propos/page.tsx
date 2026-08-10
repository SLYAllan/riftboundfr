import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { metaTraduite, tr } from "@/lib/i18n-server";

const metadata: Metadata = {
  title: { absolute: "À propos - Riftbound France" },
  description:
    "Qui est derrière Riftbound France, la référence francophone du TCG Riftbound : mission, sources des données et contact.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "À propos - Riftbound France",
    description: "La référence francophone du TCG Riftbound : mission, sources des données et contact.",
    images: ["/img/og-default.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "À propos de Riftbound France",
  url: "https://riftboundfrance.fr/a-propos",
  inLanguage: "fr",
  mainEntity: {
    "@type": "Organization",
    name: "Riftbound France",
    url: "https://riftboundfrance.fr",
    email: "contact@riftboundfrance.fr",
    sameAs: ["https://twitter.com/FRRiftbound"],
    founder: {
      "@type": "Person",
      name: "Allan",
      sameAs: ["https://twitter.com/solary_allan"],
    },
  },
};

export default async function AProposPage() {
  const t = await tr();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs items={[{ name: t("À propos"), href: "/a-propos" }]} />

      <h1
        className="mt-6 text-4xl font-bold"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {t("À propos de Riftbound France")}
      </h1>

      <div className="mt-4 space-y-4 leading-relaxed text-ink-secondary">
        <p>
          <strong className="text-ink">Riftbound France</strong>{" "}
          {t("est le site communautaire francophone dédié au TCG Riftbound de Riot Games : base de cartes, decklists de tournois, tier lists, guides et deckbuilder.")}
        </p>
        <p>
          {t("Le site est édité par")} <strong className="text-ink">Allan</strong>.{" "}
          {t("Les cartes et leurs visuels proviennent de l’API publique Riftcodex. Les decks et résultats de tournois sont recoupés depuis les événements officiels et tenus à jour manuellement.")}
        </p>
        <p>
          {t("Nous suivre :")}{" "}
          <a
            href="https://twitter.com/FRRiftbound"
            target="_blank"
            rel="noopener noreferrer"
            className="text-arcane hover:underline"
          >
            @FRRiftbound
          </a>
          {" · "}
          <a
            href="https://twitter.com/solary_allan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-arcane hover:underline"
          >
            @solary_allan
          </a>
          {" · "}
          <a
            href="mailto:contact@riftboundfrance.fr"
            className="text-arcane hover:underline"
          >
            contact@riftboundfrance.fr
          </a>
        </p>
        <p className="text-xs text-ink-muted">
          {t("Site non approuvé par Riot Games. Riftbound et les propriétés associées sont des marques de Riot Games, Inc.")}
        </p>
      </div>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
