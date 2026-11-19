// Requête DB -> rendu à la requête, pas au build (le build Coolify utilise une
// fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LigneDeck } from "@/components/ligne-deck";
import { chargerPrix, chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { RANG_MAX_PAS_CHER, decksPasChers } from "@/lib/listes-classees";
import { listesClassees } from "@/lib/listes-classees-serveur";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { displayLegendName, formatDate } from "@/lib/utils";

const heading = { fontFamily: "var(--font-rubik), sans-serif" };

// Seule page bâtie sur le prix d'un deck entier : demande d'Allan du 19 novembre
// 2026, qui lève pour elle la règle du 22 septembre (aucune fonction de prix).
const donnees = unstable_cache(
  async () => {
    const listes = await listesClassees(SET_EN_COURS);
    return {
      releveLe: chargerPrix()?.fetchedAt ?? null,
      decks: decksPasChers(listes, (c) => chiffrerDeck(c)).map(({ liste, prix }) => ({
        slug: liste.slug,
        placement: liste.placement,
        legende: liste.legende,
        sous: [liste.joueur, liste.tournoi].filter(Boolean).join(" · "),
        prix,
        lienAchat: lienAchatDeck(liste.cartes),
      })),
    };
  },
  ["guide-decks-pas-chers-v1"],
  { revalidate: 3600, tags: ["decks"] },
);

const metadata: Metadata = {
  title: { absolute: "Decks Riftbound pas chers qui gagnent en tournoi | Riftbound France" },
  description:
    "Pour chaque Légende de Riftbound, la liste la moins chère qui a fini dans les 16 premiers d'un tournoi, sans carte interdite. Prix CardNexus du jour.",
  alternates: { canonical: "/guides/decks-pas-chers" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Decks Riftbound pas chers qui gagnent en tournoi",
    description: "La liste la moins chère de chaque Légende parmi celles qui finissent dans les 16 premiers.",
    images: ["/img/og-default.png"],
  },
};
export const generateMetadata = () => metaTraduite(metadata);

export default async function DecksPasChersPage() {
  const t = await tr();
  const { releveLe, decks } = await donnees();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Decks pas chers", href: "/guides/decks-pas-chers" }]} />

      <h1 className="mt-4 text-4xl font-bold" style={heading}>{t("Decks Riftbound pas chers qui gagnent en tournoi")}</h1>
      <p className="mt-3 max-w-[75ch] text-ink-secondary">
        {`Pour chaque Légende, la liste la moins chère qui a fini dans les ${RANG_MAX_PAS_CHER} premiers d'un tournoi ${SET_EN_COURS}, sans aucune carte interdite. Le prix compte la réserve et prend, pour chaque carte, l'impression la moins chère chez CardNexus. La page se met à jour seule, à chaque tournoi et à chaque relevé de prix.`}
      </p>
      {releveLe && <p className="mt-2 text-sm text-ink-muted">{`Prix relevés le ${formatDate(releveLe)}.`}</p>}

      {decks.length === 0 ? (
        <p className="mt-6 max-w-[75ch] rounded-card border border-hairline bg-surface p-4 text-ink-secondary">
          {t("Aucune liste n'a de prix complet pour l'instant. Reviens après le prochain relevé.")}
        </p>
      ) : (
        <div className="mt-6 divide-y divide-hairline rounded-card border border-hairline bg-surface">
          {decks.map((d) => (
            <LigneDeck
              key={d.slug}
              slug={d.slug}
              placement={d.placement}
              titre={displayLegendName(d.legende)}
              sous={d.sous}
              prix={d.prix}
              lienAchat={d.lienAchat}
            />
          ))}
        </div>
      )}
      <p className="mt-3 max-w-[75ch] text-sm text-ink-muted">
        {t("Une Légende manque quand aucune de ses listes du top 16 n'a de prix pour toutes ses cartes : un total incomplet serait un faux prix bas.")}
      </p>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Pour aller plus loin")}</h2>
      <p className="mt-2 max-w-[75ch] text-ink-secondary">
        {t("Ce que le dernier ban change à chaque Légende est sur la page")}{" "}
        <Link href="/guides/apres-ban" className="text-arcane hover:underline">{t("après le ban")}</Link>.{" "}
        {t("Si tu as déjà une partie des cartes, la page de chaque deck chiffre seulement celles qui te manquent, une fois ta")}{" "}
        <Link href="/collection" className="text-arcane hover:underline">{t("collection")}</Link>{" "}
        {t("remplie.")}
      </p>
    </div>
  );
}
