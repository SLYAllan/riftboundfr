// Requête DB -> rendu à la requête, pas au build (le build Coolify utilise une
// fausse DATABASE_URL injoignable).
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Image from "next/image";
import { unstable_cache } from "next/cache";
import { ExternalLink, Layers, ShoppingCart, Trophy } from "lucide-react";
import Link from "@/components/lien";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CarteBanniere } from "@/components/carte-banniere";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { LigneDeck } from "@/components/ligne-deck";
import { getBannerUrl } from "@/lib/banners";
import { findCard } from "@/lib/card-printing";
import { chiffrerDeck, lienAchatDeck, type Carte } from "@/lib/cardnexus";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { resolveDeckCards } from "@/lib/deck-cards";
import { ancreDeckDeDepart, contenuDeck, meilleureMontee, type DeckDeDepart } from "@/lib/decks-de-depart";
import { DOMAIN_COLORS, DOMAIN_ICONS, DOMAIN_LABELS_FR } from "@/lib/domains";
import { metaTraduite, tr } from "@/lib/i18n-server";
import { legendHref } from "@/lib/legend-fiche";
import { RANG_MAX_PAS_CHER } from "@/lib/listes-classees";
import { listesClassees } from "@/lib/listes-classees-serveur";
import { SET_EN_COURS } from "@/lib/tournament-order";
import { displayLegendName, formatDate } from "@/lib/utils";
import type { DecklistCard, DeckSection } from "@/types";
import releve from "../../../../data/decks-de-depart.json";

const rubik = { fontFamily: "var(--font-rubik), sans-serif" };
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const decks = releve.decks as DeckDeDepart[];

const ancre = (deck: DeckDeDepart) => ancreDeckDeDepart(deck.legende.name);
const domaines = (deck: DeckDeDepart) => deck.runes.map((r) => r.name.replace(/ Rune$/, ""));

function codeDeckbuilder(deck: DeckDeDepart) {
  const refs = (cartes: Carte[]) => cartes.map((c) => ({ cardId: c.riftboundId, quantity: c.quantity }));
  // Pas de champion désigné : Riot ne dit pas lequel, le deckbuilder laisse choisir.
  return encodeDeckBase64({
    legend: { cardId: deck.legende.riftboundId, quantity: 1 },
    champion: null,
    main: refs(deck.principal),
    rune: refs(deck.runes),
    battlefield: refs(deck.champsDeBataille),
    side: [],
  });
}

// Le prix chiffré ici est celui des cartes qui MANQUENT pour passer du deck de départ
// à une liste de tournoi : l'exception que garde la règle du 22 septembre 2026.
const donnees = unstable_cache(
  async () => {
    const listes = await listesClassees(SET_EN_COURS);
    const { map, missing } = await resolveDeckCards(decks.flatMap((d) => contenuDeck(d).map((c) => c.riftboundId)));
    return {
      introuvables: missing,
      decks: decks.map((deck) => {
        const section = (s: DeckSection) => (c: Carte) => ({ ...c, section: s });
        const cartes: DecklistCard[] = [
          section("legend")({ ...deck.legende, quantity: 1 }),
          ...deck.principal.map(section("main")),
          ...deck.runes.map(section("rune")),
          ...deck.champsDeBataille.map(section("battlefield")),
        ].flatMap((c) => {
          const carte = findCard(map, c.riftboundId);
          if (!carte) return [];
          return [{
            cardId: carte.id, name: carte.name, artUrl: carte.imageUrl, type: carte.type, cost: carte.energy,
            power: carte.power, energy: carte.energy, might: carte.might, rarity: carte.rarity,
            domains: carte.domains, description: carte.textPlain, quantity: c.quantity, section: c.section,
          }];
        });
        const m = meilleureMontee(deck, listes, (c) => chiffrerDeck(c));
        return {
          cartes,
          montee: m && {
            slug: m.liste.slug,
            placement: m.liste.placement,
            joueur: m.liste.joueur,
            tournoi: m.liste.tournoi,
            prix: m.prix,
            nombre: m.manquantes.reduce((s, c) => s + c.quantity, 0),
            lienAchat: lienAchatDeck(m.manquantes),
            // Les plus chères d'abord : c'est là que part le budget.
            lignes: chiffrerDeck(m.manquantes).lignes.sort((a, b) => (b.eur ?? 0) - (a.eur ?? 0)),
          },
        };
      }),
    };
  },
  ["guide-decks-de-depart-v2"],
  { revalidate: 3600, tags: ["decks"] },
);

const metadata: Metadata = {
  title: { absolute: "Decks préconstruits Riftbound : listes et cartes à ajouter" },
  description:
    "La liste des Champion Decks et Showdown Decks de Riftbound (Vex, Vi, Fiora, Rumble, Shen, Zed, Seraphine, Evelynn) et les cartes à acheter pour le tournoi.",
  alternates: { canonical: "/guides/decks-de-depart" },
  openGraph: {
    type: "article",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Decks préconstruits Riftbound : listes et cartes à ajouter",
    description: "Ce que contient chaque deck préconstruit, et ce qu'il faut acheter pour l'emmener en tournoi.",
    images: ["/img/og-default.png"],
  },
};
export const generateMetadata = () => metaTraduite(metadata);

function Domaines({ deck }: { deck: DeckDeDepart }) {
  return (
    <>
      {domaines(deck).map((d) => (
        <span key={d} className="inline-flex items-center gap-1 rounded bg-surface-raised px-2 py-0.5 text-xs font-semibold" style={{ color: DOMAIN_COLORS[d] ?? "#6b7280" }}>
          {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3.5 w-3.5" />}
          {DOMAIN_LABELS_FR[d] ?? d}
        </span>
      ))}
    </>
  );
}

export default async function DecksDeDepartPage() {
  const t = await tr();
  const { decks: calcules, introuvables } = await donnees();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Decks de départ", href: "/guides/decks-de-depart" }]} />

      <div className="mt-4 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-arcane">{t("Decks préconstruits")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={rubik}>{t("Decks préconstruits Riftbound : listes et cartes à ajouter").replace(" :", " :")}</h1>
        <p className="mt-3 text-ink-secondary">
          {`Huit decks prêts à jouer, vendus par paire (Showdown Decks) ou à l'unité (Champion Decks). Pour chacun : son contenu carte par carte, et ce qu'il faut acheter pour jouer une liste de la même Légende qui a fini dans les ${RANG_MAX_PAS_CHER} premiers d'un tournoi ${SET_EN_COURS}.`}
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          {`Listes relevées le ${formatDate(releve.releveLe)} sur les pages officielles de Riot. Prix CardNexus, à l'impression la moins chère.`}
        </p>
      </div>

      {/* Sommaire en cartes : on choisit son deck à l'œil, comme sur /decks. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {decks.map((deck, i) => {
          const m = calcules[i].montee;
          return (
            <CarteBanniere
              key={deck.legende.riftboundId}
              legende={deck.legende.name}
              titre={displayLegendName(deck.legende.name)}
              href={`#${ancre(deck)}`}
              haut={<span className="rounded bg-violet-dark px-2 py-0.5 text-[11px] font-bold text-white shadow">{`${deck.produit} · ${deck.set}`}</span>}
            >
              {m ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold tabular-nums text-gold">{`+ ${euros.format(m.prix)}`}</span>
                  <span>{t("pour le tournoi")}</span>
                </div>
              ) : (
                <div>{t("Pas encore de liste de tournoi")}</div>
              )}
            </CarteBanniere>
          );
        })}
      </div>

      <div className="mt-12 space-y-16">
        {decks.map((deck, i) => {
          const { cartes, montee } = calcules[i];
          const nom = displayLegendName(deck.legende.name);
          const banniere = getBannerUrl(deck.legende.name);
          return (
            <section key={deck.legende.riftboundId} id={ancre(deck)} className="scroll-mt-20">
              <header className="relative flex min-h-40 flex-col justify-end overflow-clip rounded-card border border-hairline bg-surface sm:min-h-48">
                {banniere && (
                  <Image src={banniere} alt="" fill sizes="(max-width: 1024px) 100vw, 1232px" className="object-cover object-[50%_22%]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                <div className="relative flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-white drop-shadow sm:text-3xl" style={rubik}>{nom}</h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Domaines deck={deck} />
                      <span className="rounded bg-violet-dark px-2 py-0.5 text-xs font-semibold text-white">{`${deck.produit} · ${deck.set}`}</span>
                    </div>
                  </div>
                  <Link href={legendHref(deck.legende.name)} className="relative z-10 inline-flex min-h-11 items-center rounded-lg bg-canvas/70 px-3 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur transition-colors hover:bg-canvas/90 sm:min-h-9">
                    {t("Fiche de la Légende")}
                  </Link>
                </div>
              </header>

              <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="min-w-0">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-arcane" style={rubik}>
                    <Layers size={18} aria-hidden="true" />
                    {t("Dans la boîte")}
                  </h3>
                  <div className="mt-3">
                    <DecklistInteractive
                      compact
                      cards={cartes}
                      deckName={`${nom} (${deck.produit})`}
                      legendName={deck.legende.name}
                      showCopyCode
                      showExportPng
                      deckbuilderCode={codeDeckbuilder(deck)}
                    />
                  </div>
                  {deck.inconnues.length > 0 && (
                    <p className="mt-3 rounded-lg border border-amber-400/30 bg-surface p-3 text-sm text-ink-secondary">
                      {deck.inconnues.map((c) => `${c.quantity} ${c.nom}`).join(", ")}
                      {t(" : carte nommée ainsi par Riot, introuvable dans toutes les bases. Elle manque à la liste ci-dessus plutôt que d'y être devinée.")}
                    </p>
                  )}
                  <a href={deck.source} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-1 text-sm text-ink-muted hover:text-arcane">
                    {t("Liste officielle chez Riot")}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>

                <aside className="space-y-3 max-lg:order-first">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-arcane" style={rubik}>
                    <Trophy size={18} aria-hidden="true" />
                    {t("Pour jouer en tournoi")}
                  </h3>
                  {montee ? (
                    <>
                      <dl className="grid grid-cols-2 overflow-hidden rounded-card border border-hairline bg-surface">
                        <div className="border-r border-hairline px-4 py-3">
                          <dd className="text-2xl font-bold tabular-nums text-ink" style={rubik}>{montee.nombre}</dd>
                          <dt className="text-xs text-ink-muted">{t("cartes à ajouter, réserve comprise")}</dt>
                        </div>
                        <div className="px-4 py-3">
                          <dd className="text-2xl font-bold tabular-nums text-gold" style={rubik}>{euros.format(montee.prix)}</dd>
                          <dt className="text-xs text-ink-muted">{t("chez CardNexus")}</dt>
                        </div>
                      </dl>
                      <div className="rounded-card border border-hairline bg-surface">
                        <LigneDeck
                          slug={montee.slug}
                          placement={montee.placement}
                          titre={montee.joueur ?? nom}
                          sous={montee.tournoi}
                          prix={null}
                          lienAchat={null}
                        />
                      </div>
                      {montee.lienAchat && (
                        <a
                          href={montee.lienAchat}
                          target="_blank"
                          rel="sponsored nofollow noopener"
                          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-gold px-4 text-sm font-bold text-canvas transition-colors hover:bg-gold-light"
                        >
                          <ShoppingCart size={16} aria-hidden="true" />
                          {t("Acheter les cartes qui manquent")}
                        </a>
                      )}
                      <details className="group rounded-card border border-hairline bg-surface">
                        <summary className="flex min-h-11 cursor-pointer items-center justify-between px-4 text-sm font-semibold text-ink-secondary hover:text-ink">
                          {t("Le détail des cartes à acheter")}
                        </summary>
                        <ul className="divide-y divide-hairline border-t border-hairline text-sm">
                          {montee.lignes.map((l) => (
                            <li key={l.riftboundId} className="flex items-baseline justify-between gap-3 px-4 py-1.5">
                              <span className="min-w-0 truncate text-ink-secondary">
                                <span className="tabular-nums text-ink">{l.quantite}</span> {l.nom}
                              </span>
                              <span className="shrink-0 tabular-nums text-ink-muted">{l.eur != null ? euros.format(l.eur) : "·"}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </>
                  ) : (
                    <p className="rounded-card border border-hairline bg-surface p-4 text-sm text-ink-secondary">
                      {`Aucune liste de cette Légende n'a fini dans les ${RANG_MAX_PAS_CHER} premiers d'un tournoi ${SET_EN_COURS} sans carte interdite, avec un prix pour chaque carte. Ses résultats sont sur sa `}
                      <Link href={legendHref(deck.legende.name)} className="text-arcane hover:underline">{t("fiche")}</Link>.
                    </p>
                  )}
                </aside>
              </div>
            </section>
          );
        })}
      </div>

      {introuvables.length > 0 && (
        <p className="mt-10 text-sm text-ink-muted">{`Cartes absentes de la base, donc absentes des listes : ${introuvables.join(", ")}.`}</p>
      )}

      <div className="mt-16 rounded-card border border-hairline bg-surface p-5">
        <h2 className="text-lg font-semibold" style={rubik}>{t("Pour aller plus loin")}</h2>
        <p className="mt-2 max-w-[75ch] text-sm text-ink-secondary">
          {t("Les règles de base sont dans le guide pour")}{" "}
          <Link href="/guides/debuter" className="text-arcane hover:underline">{t("débuter")}</Link>.{" "}
          {t("Pour partir d'une autre Légende, les")}{" "}
          <Link href="/guides/decks-pas-chers" className="text-arcane hover:underline">{t("decks pas chers qui gagnent en tournoi")}</Link>{" "}
          {t("donnent la liste la moins chère de chacune.")}
        </p>
      </div>
    </div>
  );
}
