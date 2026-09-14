export const revalidate = 3600;

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CardImage } from "@/components/card-image";
import { RarityBadge } from "@/components/rarity-badge";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS, TYPE_ICONS } from "@/lib/domains";
import { isBanned } from "@/lib/banned-cards";
import { getErrata } from "@/lib/errata-2026-07";
import { ErrataDiff } from "@/components/errata-diff";
import { displayLegendName, formatDate } from "@/lib/utils";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";
import { tr, metaTraduite, langueCourante } from "@/lib/i18n-server";
import { CardCollectionQuantity } from "@/components/collection/card-collection-quantity";
import { chargerPrix, lienProduit } from "@/lib/cardnexus";
import { libelleSection, nomEvenement, placeSection, statsJeuCarte } from "@/lib/card-play";
import { jsonLdHtml, urlLangue, langueSchema } from "@/lib/json-ld";
import { cache } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Une seule requête pour la page ET ses métadonnées : Next appelle
// generateMetadata puis le composant, et la même ligne partait deux fois en
// base à chaque visite. `cache` de React les réunit le temps d'une requête.
const chargerCarte = cache((id: string) => prisma.card.findUnique({ where: { riftboundId: id } }));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await chargerCarte(id);
  if (!card) return { title: "Carte introuvable" };
  // Title/description orientés recherche FR : les internautes cherchent "<nom> riftbound"
  // et "riftbound fr / french cards" (cf. Search Console). On met le nom + "Carte Riftbound
  // FR" en tête, puis le type et les domaines en français pour la pertinence et le CTR.
  const TYPE_FR: Record<string, string> = {
    Unit: "Unité", Spell: "Sort", Gear: "Équipement", Rune: "Rune",
    Battlefield: "Champ de bataille", Legend: "Légende", Token: "Jeton",
  };
  const typeFR = card.supertype === "Champion Unit" ? "Unité Champion" : (TYPE_FR[card.type] ?? card.type);
  const domFR = (card.domains ?? []).map((d) => DOMAIN_LABELS_FR[d] ?? d);
  const domainPart = domFR.length ? ` ${domFR.join("/")}` : "";
  const title = `${card.name} - Carte Riftbound FR : ${typeFR}${domainPart}`;
  const base = `${card.name}, ${typeFR}${domainPart} du set ${card.setName} sur Riftbound France.`;
  const rule = card.textPlain ? ` ${card.textPlain.replace(/\s+/g, " ").trim()}` : "";
  const full = `${base}${rule}`;
  const description = full.length > 155 ? `${full.slice(0, 152).trimEnd()}…` : full;
  // Anti index-bloat : les variantes (alt-art / overnumbered / signature) ne sont pas
  // indexées (l'impression principale l'est) - elles partagent le même contenu jouable.
  const isVariant = card.alternateArt || card.overnumbered || card.signature;
  return metaTraduite({
    title: { absolute: title },
    description,
    robots: isVariant ? { index: false, follow: true } : undefined,
    alternates: { canonical: `/cartes/${card.riftboundId}` },
    openGraph: {
      type: "article",
      siteName: "Riftbound France",
      locale: "fr_FR",
      title,
      description,
      images: card.imageUrl ? [card.imageUrl] : ["/img/og-default.png"],
    },
  });
}

export default async function CardDetailPage({ params }: PageProps) {
  const t = await tr();
  const langue = await langueCourante();
  const { id } = await params;
  const card = await chargerCarte(id);
  if (!card) notFound();

  const errata = getErrata(card.name);

  // Les chiffres de jeu passent par `statsJeuCarte`, jamais par une requête à la
  // main : ils comptent TOUTES les impressions du même nom. La page comptait sur
  // le seul `card.id`, donc une carte réimprimée avait autant de compteurs que de
  // numéros et aucun ne disait la vérité.
  const jeu = await statsJeuCarte(card.name);

  // Le prix vient de `data/prices/card-prices.json`, relevé par `npm run sync-prices`,
  // et le lien d'achat de `src/lib/cardnexus.ts`, seul endroit qui porte
  // l'identifiant d'affiliation. 1 227 cartes sur 1 275 en ont un.
  const prixCarte = chargerPrix()?.cards[card.riftboundId] ?? null;
  const releveLe = chargerPrix()?.fetchedAt ?? null;

  // JSON-LD d'entité (M14) : rend la fiche carte citable (Google rich results / GEO).
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const cardJsonLd = {
    "@context": "https://schema.org",
    // `Product` seulement quand on peut citer un prix affiché. Sinon `Thing` :
    // un Product sans `offers` est refusé par Google (« Either offers, review,
    // or aggregateRating should be specified »), et inventer une offre pour une
    // carte dont on n'affiche pas le prix serait un balisage qui ne correspond
    // pas au contenu visible, ce qui est pire qu'un avertissement.
    "@type": prixCarte ? "Product" : "Thing",
    name: card.name,
    ...(card.imageUrl ? { image: card.imageUrl } : {}),
    description: card.textPlain?.replace(/\s+/g, " ").trim() || `${card.name}, carte ${card.type} du set ${card.setName} de Riftbound.`,
    category: card.supertype ?? card.type,
    brand: { "@type": "Brand", name: "Riftbound" },
    url: urlLangue(SITE, `/cartes/${card.riftboundId}`, langue),
    inLanguage: langueSchema(langue),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Set", value: card.setName },
      { "@type": "PropertyValue", name: "Rareté", value: card.rarity },
      ...(card.domains?.length ? [{ "@type": "PropertyValue", name: "Domaines", value: card.domains.join(", ") }] : []),
    ],
    ...(prixCarte
      ? {
          offers: {
            "@type": "Offer",
            price: prixCarte.eur.toFixed(2),
            priceCurrency: "EUR",
            url: lienProduit(prixCarte.productId, prixCarte.nom),
            seller: { "@type": "Organization", name: "CardNexus" },
            // Pas d'`availability` : le stock est celui de vendeurs tiers, on ne
            // le connaît pas. Annoncer « InStock » sans le savoir serait faux.
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(cardJsonLd) }} />
      <Breadcrumbs
        items={[
          { name: "Cartes", href: "/cartes" },
          { name: card.name, href: `/cartes/${card.riftboundId}` },
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[400px_1fr]">
        <div><CardImage src={card.imageUrl} alt={card.name} size="xl" priority /></div>
        <div>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RarityBadge rarity={card.rarity} />
            <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-semibold text-violet-light">{card.setName}</span>
            {isBanned(card.name) && <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-bold text-red-400 ring-1 ring-red-500/30">Banni</span>}
            {errata && <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">Errata</span>}
            <span className="text-sm text-ink-secondary">{card.riftboundId}</span>
          </div>
          {prixCarte && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-surface p-3">
              <div>
                <div className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                  {prixCarte.eur.toFixed(2).replace(".", ",")} &euro;
                </div>
                <div className="text-xs text-ink-muted">
                  {t("chez CardNexus")}
                  {releveLe ? ` · ${t("relevé le")} ${formatDate(new Date(releveLe))}` : ""}
                </div>
              </div>
              <a
                href={lienProduit(prixCarte.productId, prixCarte.nom)}
                target="_blank"
                rel="sponsored noopener"
                className="ml-auto inline-flex min-h-11 items-center rounded-lg bg-gold px-4 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
              >
                {t("Acheter cette carte")}
              </a>
            </div>
          )}
          <CardCollectionQuantity cardId={card.id} />
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Type</div>
                <div className="mt-1 flex items-center gap-1.5 text-sm">
                  {TYPE_ICONS[card.type] && <img src={TYPE_ICONS[card.type]} alt="" className="h-4 w-4" />}
                  {card.type}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Rareté")}</div>
                <div className="mt-1 text-sm">{card.rarity}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Supertype</div>
                <div className="mt-1 text-sm">{card.supertype || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Domaines</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {card.domains.length > 0 ? card.domains.map((domain) => (
                    <span
                      key={domain}
                      className="inline-flex items-center gap-1.5 rounded-full bg-surface-raised px-2.5 py-0.5 text-xs font-semibold"
                      style={{ color: DOMAIN_COLORS[domain] ?? "#6b7280" }}
                    >
                      {DOMAIN_ICONS[domain] && <img src={DOMAIN_ICONS[domain]} alt="" className="h-4 w-4" />}
                      {DOMAIN_LABELS_FR[domain] ?? domain}
                    </span>
                  )) : <span className="text-sm text-ink-muted">-</span>}
                </div>
              </div>
            </div>
            {(card.energy !== null || card.power !== null || card.might !== null) && (
              <div className="grid grid-cols-3 gap-4">
                {card.energy !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">{t("Énergie")}</div>
                    <div className="text-2xl font-bold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.energy}</div>
                  </div>
                )}
                {card.might !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">Puissance</div>
                    <div className="text-2xl font-bold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.might}</div>
                  </div>
                )}
                {card.power !== null && (
                  <div className="rounded-lg bg-surface-raised p-3 text-center">
                    <div className="text-xs text-ink-muted">Power</div>
                    <div className="text-2xl font-bold text-violet-light" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{card.power}</div>
                  </div>
                )}
              </div>
            )}
            {card.textPlain && (
              <div className="rounded-lg border border-hairline bg-surface p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Texte</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary"><CardTextRenderer text={card.textPlain} /></p>
              </div>
            )}
            {errata && (
              <div className="rounded-lg border border-hairline bg-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Errata du 23 juillet 2026")}</span>
                </div>
                <div className="mt-2"><ErrataDiff before={errata.before} after={errata.after} /></div>
                <p className="mt-2 text-sm text-ink-secondary">{errata.change}</p>
                <Link href="/guides/ban-list" className="mt-2 inline-block text-xs text-arcane hover:underline">{t("Voir tous les erratas")}</Link>
              </div>
            )}
            {card.flavorText && (
              <p className="border-l-2 border-violet/30 pl-4 text-sm italic text-ink-muted">{card.flavorText}</p>
            )}
            {card.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-ink-secondary">{tag}</span>
                ))}
              </div>
            )}
            {card.artist && <div className="text-sm text-ink-muted">Artiste : <span className="text-ink-secondary">{card.artist}</span></div>}
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {t("En tournoi")}
            </h2>

            {!jeu || jeu.decks === 0 ? (
              // Le dire plutôt que de masquer la section : « aucun deck ne la joue »
              // est une réponse, une section absente n'en est pas une.
              <p className="mt-3 text-sm text-ink-muted">
                {t("Aucun deck de tournoi publié ne joue cette carte pour l’instant.")}
              </p>
            ) : (
              <>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Chiffre valeur={jeu.decks.toLocaleString("fr-FR")} libelle={t(jeu.decks > 1 ? "decks de tournoi" : "deck de tournoi")} />
                  <Chiffre valeur={jeu.decksClasses.toLocaleString("fr-FR")} libelle={t(jeu.decksClasses > 1 ? "listes classées" : "liste classée")} />
                  <Chiffre
                    valeur={jeu.emplacements[0]?.moyenne != null ? String(jeu.emplacements[0].moyenne) : "-"}
                    libelle={`${t("exemplaires en moyenne")}${jeu.emplacements[0] ? ` (${libelleSection(jeu.emplacements[0].section)})` : ""}`}
                  />
                </div>

                {/* Une ligne par emplacement réellement occupé. Une carte peut
                    être au deck principal chez les uns et en réserve chez les
                    autres, et une rune ou un champ de bataille n'est ni l'un ni
                    l'autre. */}
                <ul className="mt-2 space-y-0.5 text-sm text-ink-secondary">
                  {jeu.emplacements.map((e) => (
                    <li key={e.section}>
                      {e.decks.toLocaleString("fr-FR")}{" "}
                      {t(e.decks > 1 ? "listes" : "liste")} {placeSection(e.section)}
                      {e.moyenne != null && <span className="text-ink-muted"> &middot; &times;{e.moyenne} {t("en moyenne")}</span>}
                    </li>
                  ))}
                </ul>

                {jeu.legendes.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Légendes qui l’emploient")}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {jeu.legendes.map((l) => (
                        <Link
                          key={l.nom}
                          href={`/decks?legend=${encodeURIComponent(l.nom)}&set=all`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-sm transition-colors hover:border-hairline-accent"
                        >
                          <span className="text-arcane">{displayLegendName(l.nom)}</span>
                          <span className="tabular-nums text-xs text-ink-muted">{l.decks}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {jeu.evenements.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Événements")}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {jeu.evenements.map((e) => (
                        <span key={e.nom} className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface px-2.5 py-1.5 text-sm">
                          <span className="text-ink-secondary">{nomEvenement(e.nom)}</span>
                          {e.date && <span className="text-xs text-ink-muted">{formatDate(new Date(e.date))}</span>}
                          <span className="tabular-nums text-xs text-ink-muted">{e.decks}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparaison des impressions : à la table elles sont la MÊME
                    carte, le règlement les accepte toutes. Une seule ligne ne
                    servirait à rien, on ne l'affiche donc qu'à partir de deux. */}
                {jeu.impressions.length > 1 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Par impression")}</h3>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-ink-muted">
                            <th className="pb-1 font-semibold">{t("Impression")}</th>
                            <th className="pb-1 font-semibold">Set</th>
                            <th className="pb-1 text-right font-semibold">{t("Listes")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jeu.impressions.map((i) => (
                            <tr key={i.cardId} className={i.cardId === card.id ? "border-t border-hairline text-arcane" : "border-t border-hairline"}>
                              <td className="py-1.5">
                                {i.cardId === card.id ? (
                                  <span className="font-semibold">{i.riftboundId}</span>
                                ) : (
                                  <Link href={`/cartes/${i.riftboundId}`} className="hover:underline">{i.riftboundId}</Link>
                                )}
                                {i.alternateArt && <span className="ml-1.5 text-xs text-ink-muted">{t("art alternatif")}</span>}
                                {i.overnumbered && <span className="ml-1.5 text-xs text-ink-muted">{t("surnumérotée")}</span>}
                              </td>
                              <td className="py-1.5 text-ink-secondary">{i.set}</td>
                              <td className="py-1.5 text-right tabular-nums">{i.decks.toLocaleString("fr-FR")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {jeu.meilleurs.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Les mieux classées")}</h3>
                    <div className="mt-2 space-y-2">
                      {jeu.meilleurs.map((d) => (
                        <Link key={d.slug} href={`/decks/${d.slug}`} className="block rounded-lg border border-hairline bg-surface p-3 transition-colors hover:border-hairline-accent">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{d.title}</span>
                            {d.placement && (
                              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-canvas">{d.placement}</span>
                            )}
                            {d.featured && (
                              <span className="rounded-full bg-violet-dark px-2 py-0.5 text-[10px] font-bold text-white">Best of</span>
                            )}
                            <span className="ml-auto text-xs text-ink-muted">
                              &times;{d.quantite}{d.section !== "main" ? ` ${t("en réserve")}` : ""}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-arcane">{displayLegendName(d.legendName)}</span>
                            {d.tournamentContext && <span className="text-ink-muted">&middot; {nomEvenement(d.tournamentContext)}</span>}
                            {d.date && <span className="text-ink-muted">&middot; {formatDate(new Date(d.date))}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Link
              href={`/decks?q=${encodeURIComponent(card.name)}&set=all`}
              className="mt-4 inline-flex text-sm text-arcane hover:underline"
            >
              {t("Voir tous les decks avec cette carte")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Un chiffre et sa légende. Trois fois le même bloc, une seule écriture. */
function Chiffre({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div className="rounded-lg border border-hairline bg-surface p-3">
      <div className="text-2xl font-bold tabular-nums text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {valeur}
      </div>
      <div className="text-xs text-ink-muted">{libelle}</div>
    </div>
  );
}
