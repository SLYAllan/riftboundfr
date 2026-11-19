// Requête DB -> rendu à la requête, pas au build (le build Coolify utilise une
// fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { Ban, ShoppingCart, Trophy } from "lucide-react";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";
import { CarteBanniere } from "@/components/carte-banniere";
import { CountryBadge } from "@/components/country-badge";
import { getLegendIconUrl } from "@/lib/banners";
import { rangPlacement } from "@/lib/card-play";
import { findCard } from "@/lib/card-printing";
import { chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { resolveDeckCards } from "@/lib/deck-cards";
import { afficherPlacement } from "@/lib/deck-listing-params";
import { langueCourante, metaTraduite, tr } from "@/lib/i18n-server";
import { legendHref } from "@/lib/legend-fiche";
import { bilanDuBan, dernierBanAnnonce, listesApresBan } from "@/lib/listes-classees";
import { listesClassees } from "@/lib/listes-classees-serveur";
import { getTournamentCountryCode } from "@/lib/tournament-flags";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { cn, displayLegendName, formatDate } from "@/lib/utils";

const rubik = { fontFamily: "var(--font-rubik), sans-serif" };
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
/** Sous ce nombre de listes, une part en pourcentage ne dit rien. */
const LISTES_MIN = 10;

const donnees = unstable_cache(
  async () => {
    const ban = dernierBanAnnonce();
    const listes = await listesClassees(SET_EN_COURS);
    const aujourdhui = new Date().toISOString().slice(0, 10);
    const apres = listesApresBan(listes, ban.effet, aujourdhui);
    const avant = listes.filter((l) => l.date && l.date < ban.effet);
    const { map } = await resolveDeckCards(ban.cartes);

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
            prix: chiffrerDeck(l.cartes).total,
            lienAchat: lienAchatDeck(l.cartes),
          })),
      }))
      .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    const top8 = new Map<string, number>();
    for (const t of tournois) for (const l of t.top) top8.set(l.legende, (top8.get(l.legende) ?? 0) + 1);

    return {
      ban,
      cartes: ban.cartes.map((nom) => {
        const c = findCard(map, nom);
        return { nom, image: c?.imageUrl ?? null, type: c?.type ?? null, id: c?.riftboundId ?? null };
      }),
      listesAvant: avant.length,
      bilan: bilanDuBan(avant, ban.cartes).filter((b) => b.listes >= LISTES_MIN),
      tournois: tournois.slice(0, 6),
      top8: [...top8].sort((a, b) => b[1] - a[1]),
    };
  },
  ["guide-apres-ban-v2"],
  { revalidate: 3600, tags: ["decks"] },
);

function titrePage(effet: string) {
  // Sans l'année : le titre passait 60 caractères, et la date du ban suffit.
  return `Après le ban Riftbound du ${formatDate(effet).replace(/ \d{4}$/, "")} : quels decks jouer`;
}

export async function generateMetadata(): Promise<Metadata> {
  const { effet } = dernierBanAnnonce();
  const title = titrePage(effet);
  const description = `Ce que le ban du ${formatDate(effet)} retire à chaque Légende de Riftbound, et les listes qui gagnent en tournoi sans ces cartes. Mis à jour à chaque tournoi.`;
  return metaTraduite({
    title: { absolute: title },
    description,
    alternates: { canonical: "/guides/apres-ban" },
    openGraph: { type: "article", siteName: "Riftbound France", locale: "fr_FR", title, description, images: ["/img/og-default.png"] },
  });
}

const part = (n: number, sur: number) => Math.round((100 * n) / sur);
const nomCourt = (legende: string) => displayLegendName(legende).split(",")[0];

function Titre({ icone, children }: { icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-2xl font-semibold text-arcane" style={rubik}>
      {icone}
      {children}
    </h2>
  );
}

function IconeLegende({ legende, taille = 28 }: { legende: string; taille?: number }) {
  const icone = getLegendIconUrl(legende);
  return icone ? (
    <Image src={icone} alt="" width={taille} height={taille} className="shrink-0 rounded-full" />
  ) : (
    <span className="shrink-0 rounded-full bg-surface-raised" style={{ width: taille, height: taille }} />
  );
}

export default async function ApresBanPage() {
  const t = await tr();
  const langue = await langueCourante();
  const { ban, cartes, listesAvant, bilan, tournois, top8 } = await donnees();
  const jour = formatDate(ban.effet);
  const touchees = bilan.filter((b) => b.touchees / b.listes >= 0.9).length;
  const epargnees = bilan.filter((b) => b.touchees / b.listes < 0.1);
  const tuiles = [
    { valeur: String(ban.cartes.length), libelle: t("cartes retirées du Standard") },
    { valeur: `${touchees} / ${bilan.length}`, libelle: t("Légendes touchées dans 9 listes sur 10") },
    { valeur: listesAvant.toLocaleString("fr-FR"), libelle: `${t("listes classées")} ${SET_EN_COURS} ${t("comptées")}` },
    { valeur: String(tournois.length), libelle: t("tournois relevés depuis le ban") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Après le ban", href: "/guides/apres-ban" }]} />

      <div className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">{`Ban du ${jour}`}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={rubik}>{titrePage(ban.effet).replace(" :", " :")}</h1>
        <p className="mt-3 text-ink-secondary">
          {`Le ${jour}, ${ban.cartes.length} cartes quittent le Standard. Voici, Légende par Légende, la part des listes de tournoi ${SET_EN_COURS} qui en jouent au moins une, puis les listes qui gagnent sans elles. La page se met à jour à chaque tournoi relevé.`}
        </p>
      </div>

      <dl className="mt-6 grid grid-cols-2 overflow-hidden rounded-card border border-hairline bg-surface lg:grid-cols-4">
        {tuiles.map((c) => (
          <div key={c.libelle} className="border-hairline px-5 py-4 max-lg:border-b lg:border-r lg:last:border-r-0">
            <dd className="text-2xl font-bold tabular-nums text-ink" style={rubik}>{c.valeur}</dd>
            <dt className="text-xs text-ink-muted">{c.libelle}</dt>
          </div>
        ))}
      </dl>

      <section className="mt-10">
        <Titre icone={<Ban size={20} aria-hidden="true" />}>{t("Les cartes retirées")}</Titre>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
          {cartes.map((c) => (
            <li key={c.nom} className="min-w-0">
              {c.image && c.id ? (
                // Même vignette que la ban list : <img> et non next/image, l'hôte des
                // images de cartes n'est pas déclaré dans next.config.
                <Link href={`/cartes/${c.id}`} className="group block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.image.includes("cmsassets.rgpub.io") ? `${c.image}${c.image.includes("?") ? "&" : "?"}w=240&q=75&auto=format` : c.image}
                    alt={c.nom}
                    loading="lazy"
                    className={cn("w-full rounded-lg object-cover ring-1 ring-hairline transition-transform group-hover:-translate-y-0.5 group-hover:ring-arcane/50", c.type === "Battlefield" ? "aspect-[5/7] object-contain ring-0" : "aspect-[5/7]")}
                  />
                </Link>
              ) : (
                <span className="flex aspect-[5/7] items-center justify-center rounded-lg border border-hairline bg-surface p-2 text-center text-xs text-ink-muted">{c.nom}</span>
              )}
              <div className="mt-1 truncate text-xs text-ink-secondary">{c.nom}</div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-muted">
          {t("Le détail de chaque interdiction est sur la")}{" "}
          <Link href="/guides/ban-list" className="text-arcane hover:underline">{t("ban list")}</Link>.
        </p>
      </section>

      <section className="mt-12">
        <Titre icone={<Trophy size={20} aria-hidden="true" />}>{t("Les listes qui gagnent depuis le ban")}</Titre>
        {tournois.length === 0 ? (
          <div className="mt-4 rounded-card border border-dashed border-hairline-strong bg-surface p-6 text-center">
            <p className="font-semibold text-ink" style={rubik}>{`Premier tournoi attendu après le ${jour}`}</p>
            <p className="mx-auto mt-1 max-w-[60ch] text-sm text-ink-secondary">
              {t("Les huit premières listes de chaque tournoi joué sans les cartes retirées s'afficheront ici dès qu'il sera relevé, avec leur prix.")}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {top8.map(([legende, n]) => (
                <Link key={legende} href={legendHref(legende)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface py-1 pl-1 pr-3 text-sm text-ink-secondary transition-colors hover:border-hairline-strong hover:text-ink sm:min-h-9">
                  <IconeLegende legende={legende} taille={26} />
                  {nomCourt(legende)}
                  <span className="font-semibold tabular-nums text-ink">{n}</span>
                </Link>
              ))}
            </div>
            {tournois.map((tournoi) => {
              const pays = getTournamentCountryCode(tournoi.nom);
              return (
                <div key={tournoi.nom} className="mt-8">
                  <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold" style={rubik}>
                    {pays && <CountryBadge code={pays} />}
                    {tournoi.nom}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {[tournoi.date && formatDate(tournoi.date), tournoi.joueurs && `${tournoi.joueurs} joueurs`].filter(Boolean).join(" · ")}
                  </p>
                  {tournoi.top.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-secondary">{t("Aucune liste du top 8 n'est publiée pour ce tournoi.")}</p>
                  ) : (
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {tournoi.top.map((l) => (
                        <CarteBanniere
                          key={l.slug}
                          legende={l.legende}
                          titre={displayLegendName(l.legende)}
                          href={`/decks/${l.slug}`}
                          haut={
                            <span className={cn("rounded px-2 py-0.5 text-[11px] font-bold shadow", rangPlacement(l.placement) === 1 ? "bg-gold text-canvas" : "bg-canvas/85 text-ink")}>
                              {afficherPlacement(l.placement, langue)}
                            </span>
                          }
                          pied={
                            l.prix > 0 ? (
                              <>
                                <span className="mr-auto text-lg font-bold tabular-nums text-gold" style={rubik}>{euros.format(l.prix)}</span>
                                {l.lienAchat && (
                                  <a href={l.lienAchat} target="_blank" rel="sponsored nofollow noopener" aria-label={`${t("Acheter ce deck")} : ${displayLegendName(l.legende)}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-gold px-3 text-sm font-bold text-canvas transition-colors hover:bg-gold-light sm:min-h-9">
                                    <ShoppingCart size={15} aria-hidden="true" />
                                    {t("Acheter")}
                                  </a>
                                )}
                              </>
                            ) : undefined
                          }
                        >
                          {l.joueur && <div className="truncate">{`par ${l.joueur}`}</div>}
                        </CarteBanniere>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </section>

      <section className="mt-12">
        <Titre icone={<Ban size={20} aria-hidden="true" />}>{t("Ce que le ban retire à chaque Légende")}</Titre>
        <p className="mt-3 max-w-[75ch] text-ink-secondary">
          {`Sur les ${listesAvant.toLocaleString("fr-FR")} listes classées de ${SET_EN_COURS} jouées avant le ${jour}, la part de chaque Légende qui joue au moins une des ${ban.cartes.length} cartes, et celle qui revient le plus. Seules les Légendes qui ont au moins ${LISTES_MIN} listes sont comptées.`}
        </p>
        {epargnees.length > 0 && (
          <p className="mt-2 max-w-[75ch] text-ink-secondary">
            {"Moins d'une liste sur dix perd une carte chez "}
            {epargnees.map((b, i) => (
              <span key={b.legende}>
                {i > 0 && (i === epargnees.length - 1 ? " et " : ", ")}
                <Link href={legendHref(b.legende)} className="text-arcane hover:underline">{nomCourt(b.legende)}</Link>
              </span>
            ))}
            {"."}
          </p>
        )}
        <div className="mt-4 overflow-hidden rounded-card border border-hairline bg-surface">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_5rem_minmax(0,1fr)_minmax(0,1fr)] gap-4 border-b border-hairline px-4 py-2 text-xs font-semibold text-ink-muted sm:grid">
            <span>{t("Légende")}</span>
            <span className="text-right">{t("Listes")}</span>
            <span>{t("Listes touchées")}</span>
            <span>{t("Carte visée la plus jouée")}</span>
          </div>
          <ul className="divide-y divide-hairline">
            {bilan.map((b) => {
              const p = part(b.touchees, b.listes);
              return (
                <li key={b.legende} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-2.5 sm:grid-cols-[minmax(0,1.4fr)_5rem_minmax(0,1fr)_minmax(0,1fr)]">
                  <Link href={legendHref(b.legende)} className="flex min-w-0 items-center gap-2.5 font-semibold text-ink transition-colors hover:text-arcane">
                    <IconeLegende legende={b.legende} />
                    {/* Sur téléphone, le nom entier laissait « Kai'Sa,… » à côté de la carte visée. */}
                    <span className="truncate sm:hidden">{nomCourt(b.legende)}</span>
                    <span className="hidden truncate sm:inline">{displayLegendName(b.legende)}</span>
                  </Link>
                  <span className="text-right text-sm tabular-nums text-ink-muted max-sm:hidden">{b.listes}</span>
                  <span className="flex items-center gap-2 max-sm:col-span-2 max-sm:row-start-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-raised">
                      <span className={cn("block h-full rounded-full", p >= 90 ? "bg-red-400" : p >= 50 ? "bg-amber-400" : "bg-arcane")} style={{ width: `${p}%` }} />
                    </span>
                    <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">{p} %</span>
                  </span>
                  <span className="min-w-0 truncate text-sm text-ink-secondary max-sm:col-start-2 max-sm:row-start-1 max-sm:text-right">
                    {b.carte ? <CardRef name={b.carte}>{b.carte}</CardRef> : "·"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <div className="mt-12 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-lg font-semibold" style={rubik}>{t("Pour aller plus loin")}</h2>
        <p className="mt-2 max-w-[75ch] text-sm text-ink-secondary">
          {t("Un budget serré ? Les")}{" "}
          <Link href="/guides/decks-pas-chers" className="text-arcane hover:underline">{t("decks pas chers qui gagnent en tournoi")}</Link>{" "}
          {t("ne gardent que des listes sans carte interdite. Le classement de chaque Légende est dans la")}{" "}
          <Link href="/tier-list" className="text-arcane hover:underline">{t("tier list")}</Link>.
        </p>
      </div>
    </div>
  );
}
