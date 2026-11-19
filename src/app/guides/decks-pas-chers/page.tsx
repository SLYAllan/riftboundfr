// Requête DB -> rendu à la requête, pas au build (le build Coolify utilise une
// fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { ShoppingCart } from "lucide-react";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CarteBanniere } from "@/components/carte-banniere";
import { CountryBadge } from "@/components/country-badge";
import { rangPlacement } from "@/lib/card-play";
import { chargerPrix, chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { afficherPlacement } from "@/lib/deck-listing-params";
import { langueCourante, metaTraduite, tr } from "@/lib/i18n-server";
import { RANG_MAX_PAS_CHER, decksPasChers } from "@/lib/listes-classees";
import { listesClassees } from "@/lib/listes-classees-serveur";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { cn, displayLegendName, formatDate } from "@/lib/utils";

const rubik = { fontFamily: "var(--font-rubik), sans-serif" };
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

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
        joueur: liste.joueur,
        tournoi: liste.tournoi,
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
  const langue = await langueCourante();
  const { releveLe, decks } = await donnees();
  const tuiles = decks.length
    ? [
        { valeur: String(decks.length), libelle: t("Légendes avec une liste chiffrée") },
        { valeur: euros.format(decks[0].prix), libelle: `${t("la moins chère")} (${displayLegendName(decks[0].legende).split(",")[0]})` },
        { valeur: euros.format(decks[Math.floor(decks.length / 2)].prix), libelle: t("prix médian") },
        { valeur: `Top ${RANG_MAX_PAS_CHER}`, libelle: `${t("de tournois")} ${SET_EN_COURS}` },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Decks pas chers", href: "/guides/decks-pas-chers" }]} />

      <div className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">{t("Petit budget")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={rubik}>{t("Decks Riftbound pas chers qui gagnent en tournoi")}</h1>
        <p className="mt-3 text-ink-secondary">
          {`Pour chaque Légende, la liste la moins chère qui a fini dans les ${RANG_MAX_PAS_CHER} premiers d'un tournoi ${SET_EN_COURS}, sans aucune carte interdite. Le prix compte la réserve et prend, pour chaque carte, l'impression la moins chère chez CardNexus. La page se met à jour seule, à chaque tournoi et à chaque relevé de prix.`}
        </p>
        {releveLe && <p className="mt-2 text-xs text-ink-muted">{`Prix relevés le ${formatDate(releveLe)}.`}</p>}
      </div>

      {tuiles.length > 0 && (
        <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-card border border-hairline bg-surface lg:grid-cols-4">
          {tuiles.map((c) => (
            <div key={c.libelle} className="border-hairline px-5 py-4 max-lg:border-b lg:border-r lg:last:border-r-0">
              <dd className="text-2xl font-bold tabular-nums text-ink" style={rubik}>{c.valeur}</dd>
              <dt className="text-xs text-ink-muted">{c.libelle}</dt>
            </div>
          ))}
        </dl>
      )}

      {decks.length === 0 ? (
        <p className="mt-6 max-w-[75ch] rounded-card border border-hairline bg-surface p-4 text-ink-secondary">
          {t("Aucune liste n'a de prix complet pour l'instant. Reviens après le prochain relevé.")}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d, i) => {
            const pays = getTournamentCountryCode(d.tournoi);
            return (
              <CarteBanniere
                key={d.slug}
                legende={d.legende}
                titre={displayLegendName(d.legende)}
                href={`/decks/${d.slug}`}
                haut={
                  <>
                    <span className="rounded bg-canvas/85 px-2 py-0.5 text-[11px] font-bold tabular-nums text-ink shadow">{`#${i + 1}`}</span>
                    <span className={cn("rounded px-2 py-0.5 text-[11px] font-bold shadow", rangPlacement(d.placement) === 1 ? "bg-gold text-canvas" : "bg-canvas/85 text-ink")}>
                      {afficherPlacement(d.placement, langue)}
                    </span>
                  </>
                }
                pied={
                  <>
                    <div className="mr-auto">
                      <div className="text-[11px] text-ink-muted">{t("Le deck complet")}</div>
                      <div className="text-xl font-bold tabular-nums text-gold" style={rubik}>{euros.format(d.prix)}</div>
                    </div>
                    {d.lienAchat && (
                      <a
                        href={d.lienAchat}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        aria-label={`${t("Acheter ce deck")} : ${displayLegendName(d.legende)}`}
                        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-gold px-3 text-sm font-bold text-canvas transition-colors hover:bg-gold-light sm:min-h-9"
                      >
                        <ShoppingCart size={15} aria-hidden="true" />
                        {t("Acheter")}
                      </a>
                    )}
                  </>
                }
              >
                <div className="flex min-w-0 items-center gap-1">
                  {pays && <CountryBadge code={pays} />}
                  <span className="truncate">{d.tournoi}</span>
                </div>
                {d.joueur && <div className="truncate text-white/75">{`par ${d.joueur}`}</div>}
              </CarteBanniere>
            );
          })}
        </div>
      )}
      <p className="mt-3 max-w-[75ch] text-sm text-ink-muted">
        {t("Une Légende manque quand aucune de ses listes du top 16 n'a de prix pour toutes ses cartes : un total incomplet serait un faux prix bas.")}
      </p>

      <div className="mt-12 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-lg font-semibold" style={rubik}>{t("Pour aller plus loin")}</h2>
        <p className="mt-2 max-w-[75ch] text-sm text-ink-secondary">
          {t("Ce que le dernier ban change à chaque Légende est sur la page")}{" "}
          <Link href="/guides/apres-ban" className="text-arcane hover:underline">{t("après le ban")}</Link>.{" "}
          {t("Tu pars d'un deck préconstruit ? Les")}{" "}
          <Link href="/guides/decks-de-depart" className="text-arcane hover:underline">{t("decks de départ")}</Link>{" "}
          {t("chiffrent seulement les cartes à ajouter. Si tu as déjà une partie des cartes, la page de chaque deck chiffre celles qui te manquent, une fois ta")}{" "}
          <Link href="/collection" className="text-arcane hover:underline">{t("collection")}</Link>{" "}
          {t("remplie.")}
        </p>
      </div>
    </div>
  );
}
