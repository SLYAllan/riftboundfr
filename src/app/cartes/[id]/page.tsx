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
import { displayLegendName } from "@/lib/utils";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { riftboundId: id } });
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
  return {
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
  };
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { riftboundId: id } });
  if (!card) notFound();

  const errata = getErrata(card.name);

  const relatedDeckCards = await prisma.deckCard.findMany({
    where: { cardId: card.id, deck: { published: true } },
    include: {
      deck: {
        select: {
          id: true, slug: true, title: true, legendName: true,
          featured: true, placement: true, tournamentContext: true,
        },
      },
    },
    take: 30,
  });

  function parsePlacement(p: string | null): number {
    if (!p) return 9999;
    const n = parseInt(p.replace(/[^0-9]/g, ""));
    return isNaN(n) ? 9999 : n;
  }

  const relatedDecks = relatedDeckCards
    .sort((a, b) => {
      if (a.deck.featured !== b.deck.featured) return a.deck.featured ? -1 : 1;
      const aP = parsePlacement(a.deck.placement);
      const bP = parsePlacement(b.deck.placement);
      if (aP !== bP) return aP - bP;
      if (a.deck.tournamentContext && !b.deck.tournamentContext) return -1;
      if (!a.deck.tournamentContext && b.deck.tournamentContext) return 1;
      return 0;
    })
    .slice(0, 5);

  // JSON-LD d'entité (M14) : rend la fiche carte citable (Google rich results / GEO).
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";
  const cardJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: card.name,
    ...(card.imageUrl ? { image: card.imageUrl } : {}),
    description: card.textPlain?.replace(/\s+/g, " ").trim() || `${card.name}, carte ${card.type} du set ${card.setName} de Riftbound.`,
    category: card.supertype ?? card.type,
    brand: { "@type": "Brand", name: "Riftbound" },
    url: `${SITE}/cartes/${card.riftboundId}`,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Set", value: card.setName },
      { "@type": "PropertyValue", name: "Rareté", value: card.rarity },
      ...(card.domains?.length ? [{ "@type": "PropertyValue", name: "Domaines", value: card.domains.join(", ") }] : []),
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cardJsonLd).replace(/</g, "\\u003c") }} />
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
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Rareté</div>
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
                    <div className="text-xs text-ink-muted">Energie</div>
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Errata du 23 juillet 2026</span>
                </div>
                <div className="mt-2"><ErrataDiff before={errata.before} after={errata.after} /></div>
                <p className="mt-2 text-sm text-ink-secondary">{errata.change}</p>
                <Link href="/guides/ban-list" className="mt-2 inline-block text-xs text-arcane hover:underline">Voir tous les erratas</Link>
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
          {relatedDecks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>Decks utilisant cette carte</h2>
              <div className="mt-3 space-y-2">
                {relatedDecks.map(({ deck }) => (
                  <Link key={deck.id} href={`/decks/${deck.slug}`} className="block rounded-lg border border-hairline bg-surface p-3 transition-colors hover:border-hairline-accent">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{deck.title}</span>
                      {deck.placement && (
                        <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-canvas">{deck.placement}</span>
                      )}
                      {deck.featured && (
                        <span className="rounded-full bg-violet-dark px-2 py-0.5 text-[10px] font-bold text-white">Best of</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-sm">
                      <span className="text-arcane">{displayLegendName(deck.legendName)}</span>
                      {deck.tournamentContext && <span className="text-ink-muted">&middot; {deck.tournamentContext}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
