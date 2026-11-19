// Requête DB -> rendu à la requête, pas au build (le build Coolify utilise une
// fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { LigneDeck } from "@/components/ligne-deck";
import { cartesInterdites } from "@/lib/banned-cards";
import { rangPlacement } from "@/lib/card-play";
import { chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { legendHref } from "@/lib/legend-fiche";
import { bilanDuBan, dernierBanAnnonce, listesApresBan } from "@/lib/listes-classees";
import { listesClassees } from "@/lib/listes-classees-serveur";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { displayLegendName, formatDate } from "@/lib/utils";

const heading = { fontFamily: "var(--font-rubik), sans-serif" };
/** Sous ce nombre de listes, une part en pourcentage ne dit rien. */
const LISTES_MIN = 10;

const donnees = unstable_cache(
  async () => {
    const ban = dernierBanAnnonce();
    const listes = await listesClassees(SET_EN_COURS);
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const apres = listesApresBan(listes, ban.effet, aujourdhui);
    const avant = listes.filter((l) => l.date && l.date < ban.effet);

    const parTournoi = new Map<string, typeof apres>();
    for (const l of apres) parTournoi.set(l.tournoi, [...(parTournoi.get(l.tournoi) ?? []), l]);
    const tournois = [...parTournoi]
      .map(([nom, ls]) => ({
        nom,
        date: ls[0].date ?? null,
        joueurs: ls[0].joueurs ?? null,
        top: ls
          .filter((l) => rangPlacement(l.placement) <= 8)
          .sort((a, b) => rangPlacement(a.placement) - rangPlacement(b.placement))
          .map((l) => ({
            slug: l.slug,
            placement: l.placement,
            legende: l.legende,
            joueur: l.joueur,
            interdites: cartesInterdites(l.noms),
            prix: chiffrerDeck(l.cartes).total,
            lienAchat: lienAchatDeck(l.cartes),
          })),
      }))
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    const top8 = new Map<string, number>();
    for (const t of tournois) for (const l of t.top) top8.set(l.legende, (top8.get(l.legende) ?? 0) + 1);

    return {
      ban,
      listesAvant: avant.length,
      bilan: bilanDuBan(avant, ban.cartes).filter((b) => b.listes >= LISTES_MIN),
      tournois: tournois.slice(0, 6),
      top8: [...top8].sort((a, b) => b[1] - a[1]),
    };
  },
  ["guide-apres-ban-v1"],
  { revalidate: 3600, tags: ["decks"] },
);

function titrePage(effet: string) {
  return `Après le ban du ${formatDate(effet)} : quels decks jouer`;
}

export async function generateMetadata(): Promise<Metadata> {
  const { effet } = dernierBanAnnonce();
  const title = titrePage(effet);
  const description = `Ce que le ban du ${formatDate(effet)} retire à chaque Légende de Riftbound, et les listes qui gagnent en tournoi sans ces cartes. Mis à jour à chaque tournoi.`;
  return metaTraduite({
    title: { absolute: `${title} | Riftbound France` },
    description,
    alternates: { canonical: "/guides/apres-ban" },
    openGraph: { type: "article", siteName: "Riftbound France", locale: "fr_FR", title, description, images: ["/img/og-default.png"] },
  });
}

const pourcent = (n: number, sur: number) => `${Math.round((100 * n) / sur)} %`;

export default async function ApresBanPage() {
  const t = await tr();
  const { ban, listesAvant, bilan, tournois, top8 } = await donnees();
  const jour = formatDate(ban.effet);
  const epargnees = bilan.filter((b) => b.touchees / b.listes < 0.1);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Après le ban", href: "/guides/apres-ban" }]} />

      <h1 className="mt-4 text-4xl font-bold" style={heading}>{titrePage(ban.effet)}</h1>
      <p className="mt-3 max-w-[75ch] text-ink-secondary">
        {`Le ${jour}, ${ban.cartes.length} cartes quittent le Standard. Voici, Légende par Légende, la part des listes de tournoi ${SET_EN_COURS} qui en jouent au moins une, puis les listes qui gagnent sans elles. La page se met à jour à chaque tournoi relevé.`}
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        {t("Les cartes visées et les dates sont sur la")}{" "}
        <Link href="/guides/ban-list" className="text-arcane hover:underline">{t("ban list")}</Link>.
      </p>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Les listes qui gagnent depuis le ban")}</h2>
      {tournois.length === 0 ? (
        <p className="mt-3 max-w-[75ch] rounded-card border border-hairline bg-surface p-4 text-ink-secondary">
          {`Aucun tournoi joué depuis le ${jour} n'est encore relevé. Les huit premières listes de chaque tournoi apparaîtront ici dès le premier.`}
        </p>
      ) : (
        <>
          <p className="mt-3 max-w-[75ch] text-ink-secondary">
            {`Légendes dans le top 8 depuis le ${jour} : `}
            {top8.map(([legende, n], i) => (
              <span key={legende}>
                {i > 0 && ", "}
                <Link href={legendHref(legende)} className="text-arcane hover:underline">{displayLegendName(legende)}</Link>
                {` (${n})`}
              </span>
            ))}
            .
          </p>
          {tournois.map((tournoi) => (
            <section key={tournoi.nom} className="mt-6">
              <h3 className="text-lg font-semibold" style={heading}>{tournoi.nom}</h3>
              <p className="text-sm text-ink-muted">
                {[tournoi.date && formatDate(tournoi.date), tournoi.joueurs && `${tournoi.joueurs} joueurs`].filter(Boolean).join(" · ")}
              </p>
              {tournoi.top.length === 0 ? (
                <p className="mt-2 text-sm text-ink-secondary">{t("Aucune liste du top 8 n'est publiée pour ce tournoi.")}</p>
              ) : (
                <div className="mt-2 divide-y divide-hairline rounded-card border border-hairline bg-surface">
                  {tournoi.top.map((l) => (
                    <LigneDeck
                      key={l.slug}
                      slug={l.slug}
                      placement={l.placement}
                      titre={displayLegendName(l.legende)}
                      sous={l.joueur}
                      interdites={l.interdites}
                      prix={l.prix}
                      lienAchat={l.lienAchat}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </>
      )}

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Ce que le ban retire à chaque Légende")}</h2>
      <p className="mt-3 max-w-[75ch] text-ink-secondary">
        {`Sur les ${listesAvant.toLocaleString("fr-FR")} listes classées de ${SET_EN_COURS} jouées avant le ${jour}, la part de chaque Légende qui joue au moins une des ${ban.cartes.length} cartes, et celle qui revient le plus. Seules les Légendes qui ont au moins ${LISTES_MIN} listes sont comptées.`}
      </p>
      {epargnees.length > 0 && (
        <p className="mt-2 max-w-[75ch] text-ink-secondary">
          {"Moins d'une liste sur dix perd une carte chez "}
          {epargnees.map((b, i) => (
            <span key={b.legende}>
              {i > 0 && (i === epargnees.length - 1 ? " et " : ", ")}
              {/* Le nom avant la virgule : « Rek'sai, Void Burrower, Lillia, Bashful Bloom » ne se lisait pas. */}
              <Link href={legendHref(b.legende)} className="text-arcane hover:underline">{displayLegendName(b.legende).split(",")[0]}</Link>
            </span>
          ))}
          {"."}
        </p>
      )}
      <div className="mt-4 overflow-x-auto rounded-card border border-hairline bg-surface">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead className="text-xs text-ink-muted">
            <tr className="border-b border-hairline">
              <th className="px-4 py-2 font-semibold">{t("Légende")}</th>
              <th className="px-4 py-2 text-right font-semibold">{t("Listes")}</th>
              <th className="px-4 py-2 text-right font-semibold">{t("Touchées")}</th>
              <th className="px-4 py-2 font-semibold">{t("Carte visée la plus jouée")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {bilan.map((b) => (
              <tr key={b.legende}>
                <td className="px-4 py-2">
                  <Link href={legendHref(b.legende)} className="font-semibold text-ink hover:text-arcane">{displayLegendName(b.legende)}</Link>
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-ink-secondary">{b.listes}</td>
                <td className="px-4 py-2 text-right font-semibold tabular-nums text-ink">{pourcent(b.touchees, b.listes)}</td>
                <td className="px-4 py-2 text-ink-secondary">{b.carte ?? "·"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-bold" style={heading}>{t("Pour aller plus loin")}</h2>
      <p className="mt-2 max-w-[75ch] text-ink-secondary">
        {t("Un budget serré ? Les")}{" "}
        <Link href="/guides/decks-pas-chers" className="text-arcane hover:underline">{t("decks pas chers qui gagnent en tournoi")}</Link>{" "}
        {t("ne gardent que des listes sans carte interdite. Le classement de chaque Légende est dans la")}{" "}
        <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list")}</Link>.
      </p>
    </div>
  );
}
