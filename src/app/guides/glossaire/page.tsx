// force-dynamic: queries the DB; `revalidate` froze it empty at Docker build.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { prisma, safeQuery } from "@/lib/prisma";
import { GlossaireClient } from "./glossaire-client";
import { GLOSSARY_TERMS, type GlossaryTerm, type GlossaryCategory } from "@/lib/glossary";

export const metadata: Metadata = {
  title: { absolute: "Glossaire Riftbound - Tous les termes du jeu expliqués" },
  description:
    "Dictionnaire complet des termes Riftbound : Conquer, Hold, Showdown, Rune, Domaine, Might et tous les keywords expliqués en français.",
  alternates: { canonical: "/guides/glossaire" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Glossaire Riftbound - Tous les termes du jeu expliqués",
    description:
      "Conquer, Hold, Showdown, Rune, Domaine, Might et tous les keywords Riftbound expliqués en français.",
    images: ["/img/og-default.png"],
  },
};



const terms = GLOSSARY_TERMS;

export default async function GlossairePage() {
  const mechanicTerms = terms.filter(
    (t) => t.category === "Mécaniques" || t.category === "Timing" || t.category === "Actions"
  );

  const cards = await safeQuery(() => prisma.card.findMany({
    where: {
      textPlain: { not: null },
      alternateArt: false,
      type: { not: "Legend" },
    },
    select: {
      name: true,
      imageUrl: true,
      textPlain: true,
      type: true,
      energy: true,
      might: true,
      rarity: true,
    },
  }), []);

  const cardByKeyword: Record<string, { name: string; imageUrl: string | null; type: string; energy: number | null; might: number | null; rarity: string }> = {};

  for (const t of mechanicTerms) {
    const searchKey = (t.en || t.term).toLowerCase().replace("quick-draw", "Quick-Draw");
    const match = cards.find((c) => c.textPlain?.toLowerCase().includes(searchKey));
    if (match) {
      cardByKeyword[t.term] = match;
    }
  }

  return <GlossaireClient terms={terms} cardByKeyword={cardByKeyword} />;
}
