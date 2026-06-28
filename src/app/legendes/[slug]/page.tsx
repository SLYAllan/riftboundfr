// Page dynamique : la résolution des codes cartes (UNL-059 -> nom réel) et les
// decklists interrogent la DB d'exécution, indisponible au build Docker. En
// "force-dynamic", le rendu se fait toujours à la requête, donc la DB est joignable
// en prod et les codes sont résolus en vrais noms (fini les UNL-059 affichés bruts).
export const dynamic = "force-dynamic";

import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Sparkles, AlertTriangle, Layers } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { getBannerUrl } from "@/lib/banners";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";
import { displayLegendName } from "@/lib/utils";
import type { DecklistCard, DeckSection } from "@/types";

const FICHES_DIR = path.join(process.cwd(), "data", "fiches");
const CODE_RE = /^[A-Z]{2,4}-\d+$/;

interface KeyCard {
  name?: string;
  id?: string;
  cost?: number | null;
  role?: string;
}
interface Gameplan {
  earlyGame?: string;
  midGame?: string;
  lateGame?: string;
  winCondition?: string;
}
interface Fiche {
  legendName?: string;
  legendId?: string | null;
  domains?: string[];
  set?: string;
  tier?: number;
  archetype?: string;
  legendAbility?: string;
  gameplan?: Gameplan;
  keyCards?: KeyCard[];
  champions?: Record<string, { role?: string; usage?: string }>;
  topBattlefields?: string[];
  strengths?: string[];
  weaknesses?: string[];
  difficulty?: string;
  sourceUrl?: string;
}

// Le contenu rendu du site ne doit jamais contenir de tiret cadratin (—) ni demi-cadratin
// (–). Les fiches en contiennent parfois : on normalise à la lecture (transformation
// d'affichage, on ne touche pas aux JSON sources). Les codes cartes (UNL-059) utilisent
// le trait d'union ordinaire (-) et ne sont donc pas affectés.
function deepClean<T>(v: T): T {
  if (typeof v === "string") return v.replace(/\s*[—–]\s*/g, ", ") as unknown as T;
  if (Array.isArray(v)) return v.map((x) => deepClean(x)) as unknown as T;
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) o[k] = deepClean(val);
    return o as unknown as T;
  }
  return v;
}

async function getFiche(slug: string): Promise<Fiche | null> {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const raw = await fs.readFile(path.join(FICHES_DIR, `${slug}.json`), "utf-8");
    return deepClean(JSON.parse(raw) as Fiche);
  } catch {
    return null;
  }
}

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 (haut du méta)",
  2: "Tier 2 (solide)",
  3: "Tier 3 (jouable)",
  4: "Tier 4 (de niche)",
};

// Ordre de tri des decks par niveau de tournoi, identique à la page /decks.
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
function placementRank(p: string | null): number {
  if (!p) return 9999;
  const m = p.match(/\d+/);
  return m ? parseInt(m[0], 10) : 9999;
}

// Nom de deck affiché sur la page d'une Légende : pas de tiret cadratin (règle du site),
// FR ("Best of" -> "Meilleur de"), et on retire le préfixe redondant du nom de la Légende
// (on est déjà sur sa page).
function displayDeckName(title: string, legendName: string): string {
  let t = title.replace(/\s*[—–]\s*/g, " · ").replace(/\bBest of\b/gi, "Meilleur de");
  const legPrefix = legendName.replace(/\s*[—–]\s*/g, " · ");
  if (t.startsWith(legPrefix)) t = t.slice(legPrefix.length).replace(/^[\s·:,-]+/, "");
  return t.trim() || title;
}

// Decklists réelles de la Légende (uniquement des decks publiés en base, jamais
// d'invention). try/catch : si la DB est indisponible, on rend la page sans decks.
async function fetchLegendDecks(legendName: string) {
  try {
    return await prisma.deck.findMany({
      where: { published: true, legendName: { contains: legendName, mode: "insensitive" } },
      include: {
        cards: { include: { card: true }, orderBy: [{ section: "asc" }, { card: { name: "asc" } }] },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fiche = await getFiche(slug);
  if (!fiche) return { title: "Légende introuvable" };
  const name = displayLegendName(fiche.legendName ?? slug);
  const setPart = fiche.set ? ` (set ${fiche.set})` : "";
  const title = `${name} : guide & decklists${setPart}`;
  const archetype = fiche.archetype ? `${fiche.archetype}. ` : "";
  const description =
    `${name} à Riftbound : ${archetype}decklists, plan de jeu, cartes clés, forces et faiblesses.`.slice(
      0,
      158,
    );
  return {
    title: { absolute: `${title} | Riftbound France` },
    description,
    alternates: { canonical: `/legendes/${slug}` },
    openGraph: {
      type: "article",
      siteName: "Riftbound France",
      locale: "fr_FR",
      title,
      description,
      images: ["/img/og-default.png"],
    },
  };
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        className="flex items-center gap-2 text-2xl font-semibold text-arcane"
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
      >
        {icon}
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function LegendePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fiche = await getFiche(slug);
  if (!fiche) notFound();

  const name = displayLegendName(fiche.legendName ?? slug);
  const legendName = fiche.legendName ?? name;
  const bannerUrl = getBannerUrl(legendName);

  // Résolution des codes cartes -> noms réels. Les keyCards portent parfois un code
  // (UNL-059) dans `name`, parfois le vrai nom. On collecte tous les codes et on
  // interroge la DB une seule fois. En force-dynamic la DB est joignable : les codes
  // sont résolus en prod (plus de UNL-059 affichés bruts).
  const codes = new Set<string>();
  for (const kc of fiche.keyCards ?? []) {
    if (kc.id && CODE_RE.test(kc.id)) codes.add(kc.id);
    else if (kc.name && CODE_RE.test(kc.name)) codes.add(kc.name);
  }
  const cardMap: Record<string, string> = {};
  if (codes.size > 0) {
    try {
      // Les fiches utilisent un code court (UNL-059) ; en base le riftboundId est en
      // minuscules sur 3 segments (unl-059-219). On matche par préfixe "unl-059-" (le
      // tiret final exclut les variantes alt-art type "unl-059a-").
      const codeList = [...codes];
      const cards = await prisma.card.findMany({
        where: { OR: codeList.map((c) => ({ riftboundId: { startsWith: `${c.toLowerCase()}-` } })) },
        select: { riftboundId: true, name: true },
      });
      for (const code of codeList) {
        const pref = `${code.toLowerCase()}-`;
        const match = cards.find((c) => c.riftboundId.startsWith(pref));
        if (match) cardMap[code] = match.name;
      }
    } catch {
      /* DB indispo : on affichera les codes bruts (cas de repli). */
    }
  }

  // On récupère un pool puis on garde les 3 meilleures (tier de tournoi puis placement).
  const legendDecks = await fetchLegendDecks(legendName);

  legendDecks.sort((a, b) => {
    const ta = a.tournamentTier ? (TIER_ORDER[a.tournamentTier] ?? 5) : 5;
    const tb = b.tournamentTier ? (TIER_ORDER[b.tournamentTier] ?? 5) : 5;
    if (ta !== tb) return ta - tb;
    return placementRank(a.placement) - placementRank(b.placement);
  });
  const topDecks = legendDecks.slice(0, 3);

  // Mappe un deck (DeckCard[] + carte incluse) vers DecklistCard[], avec le repli
  // d'injection de la Légende (reprise fidèle de /decks/[slug]).
  const buildDecklistCards = async (
    deck: (typeof topDecks)[number],
  ): Promise<DecklistCard[]> => {
    const hasLegendSection = deck.cards.some(
      (dc) => dc.section === "legend" && dc.card.type === "Legend",
    );
    let decklistCards: DecklistCard[] = deck.cards.map((dc) => ({
      cardId: dc.card.id,
      name: dc.card.name,
      artUrl: dc.card.imageUrl,
      type: dc.card.type,
      cost: dc.card.energy,
      power: dc.card.power,
      energy: dc.card.energy,
      might: dc.card.might,
      rarity: dc.card.rarity,
      domains: dc.card.domains,
      description: dc.card.textPlain,
      quantity: dc.quantity,
      section: dc.section as DeckSection,
    }));

    if (!hasLegendSection) {
      const dashName = deck.legendName.replace(", ", " - ");
      const prefix = deck.legendName.split(",")[0].split(" - ")[0].trim();
      let legendCard = await prisma.card.findFirst({
        where: {
          OR: [
            { riftboundId: deck.legendId },
            { type: "Legend", name: { equals: deck.legendName, mode: "insensitive" } },
            { type: "Legend", name: { equals: dashName, mode: "insensitive" } },
          ],
        },
      });
      if (!legendCard) {
        legendCard = await prisma.card.findFirst({
          where: {
            type: "Legend",
            name: { startsWith: prefix, mode: "insensitive" },
            NOT: { name: { contains: "Overnumbered" } },
          },
        });
      }
      if (legendCard && !decklistCards.some((c) => c.cardId === legendCard!.id)) {
        decklistCards = [
          {
            cardId: legendCard.id,
            name: legendCard.name,
            artUrl: legendCard.imageUrl,
            type: legendCard.type,
            cost: legendCard.energy,
            power: legendCard.power,
            energy: legendCard.energy,
            might: legendCard.might,
            rarity: legendCard.rarity,
            domains: legendCard.domains,
            description: legendCard.textPlain,
            quantity: 1,
            section: "legend" as DeckSection,
          },
          ...decklistCards,
        ];
      }
    }
    return decklistCards;
  };

  // Code deckbuilder (même encodage que /decks/[slug]) pour le bouton « Ouvrir dans le deckbuilder ».
  const sectionRefs = (deck: (typeof topDecks)[number], s: string) =>
    deck.cards.filter((dc) => dc.section === s).map((dc) => ({ cardId: dc.card.riftboundId, quantity: dc.quantity }));
  const decklists = await Promise.all(
    topDecks.map(async (deck) => {
      const champ = deck.cards.find(
        (dc) => dc.section === "legend" && dc.card.supertype === "Champion" && dc.card.type !== "Legend",
      );
      const leg =
        deck.cards.find((dc) => dc.section === "legend" && dc.card.type === "Legend") ??
        deck.cards.find((dc) => dc.section === "legend");
      const deckbuilderCode = encodeDeckBase64({
        legend: leg ? { cardId: leg.card.riftboundId, quantity: 1 } : null,
        champion: champ ? { cardId: champ.card.riftboundId, quantity: champ.quantity } : null,
        main: sectionRefs(deck, "main"),
        rune: sectionRefs(deck, "rune"),
        battlefield: sectionRefs(deck, "battlefield"),
        side: sectionRefs(deck, "side"),
      });
      return { deck, cards: await buildDecklistCards(deck), deckbuilderCode };
    }),
  );

  const domains = fiche.domains ?? [];
  const tierLabel = fiche.tier ? TIER_LABELS[fiche.tier] ?? `Tier ${fiche.tier}` : null;
  const decksHref = `/decks?legend=${encodeURIComponent(legendName)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${name} : guide et decklists à Riftbound`,
    description: fiche.archetype ?? `Guide de la Légende ${name} à Riftbound.`,
    inLanguage: "fr",
    about: "Riftbound",
    author: { "@type": "Person", name: "Allan", url: "https://twitter.com/solary_allan" },
    publisher: { "@type": "Organization", name: "Riftbound France", url: "https://riftboundfrance.fr" },
  };

  const Badges = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {domains.map((d) => (
        <span
          key={d}
          className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-semibold"
          style={{
            backgroundColor: `${DOMAIN_COLORS[d] ?? "#6b7280"}20`,
            color: DOMAIN_COLORS[d] ?? "#6b7280",
          }}
        >
          {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3.5 w-3.5" />}
          {DOMAIN_LABELS_FR[d] ?? d}
        </span>
      ))}
      {tierLabel && (
        <span className="rounded bg-gold/15 px-2 py-0.5 font-semibold text-gold">{tierLabel}</span>
      )}
      {fiche.set && (
        <span className="rounded bg-violet/15 px-2 py-0.5 font-semibold text-violet">{fiche.set}</span>
      )}
      {fiche.difficulty && (
        <span className="rounded bg-surface-raised px-2 py-0.5 text-ink-muted">
          Difficulté : {fiche.difficulty}
        </span>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Breadcrumbs
        items={[
          { name: "Légendes", href: "/legendes" },
          { name, href: `/legendes/${slug}` },
        ]}
        className="mb-6"
      />

      {/* Bannière héro */}
      {bannerUrl ? (
        <header className="relative overflow-hidden rounded-card border border-hairline">
          <img
            src={bannerUrl}
            alt={`Bannière ${name}`}
            className="block h-auto w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <h1
              className="text-3xl font-bold text-white drop-shadow sm:text-4xl"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              {name}
            </h1>
            {fiche.archetype && (
              <p className="mt-1 max-w-2xl text-sm text-white/85 sm:text-base">{fiche.archetype}</p>
            )}
            <div className="mt-3">{Badges}</div>
          </div>
        </header>
      ) : (
        <header className="rounded-card border border-hairline bg-surface p-5">
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {name}
          </h1>
          {fiche.archetype && <p className="mt-2 text-lg text-ink-secondary">{fiche.archetype}</p>}
          <div className="mt-3">{Badges}</div>
        </header>
      )}

      {/* Capacité de la Légende */}
      {fiche.legendAbility && (
        <div className="mt-6 rounded-card border border-hairline bg-surface p-4">
          <h2
            className="flex items-center gap-2 text-sm font-semibold text-arcane"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            <Sparkles size={16} /> Capacité de la Légende
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{fiche.legendAbility}</p>
        </div>
      )}

      <div className="mt-10 space-y-12">
        {/* Decklists, contenu principal */}
        <Section title="Decklists de la Légende" icon={<Layers size={20} />}>
          {decklists.length === 0 ? (
            <p className="rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
              Pas encore de decklist classée pour cette Légende.
            </p>
          ) : decklists.length === 1 ? (
            <DecklistInteractive
              compact
              cards={decklists[0].cards}
              deckName={displayDeckName(decklists[0].deck.title, legendName)}
              legendName={legendName}
              playerName={decklists[0].deck.playerName ?? undefined}
              context={
                [decklists[0].deck.tournamentContext, decklists[0].deck.placement]
                  .filter(Boolean)
                  .join(" · ") || undefined
              }
              showCopyCode
              showExportPng
              deckbuilderCode={decklists[0].deckbuilderCode}
            />
          ) : (
            <div className="space-y-3">
              {decklists.map(({ deck, cards, deckbuilderCode }, i) => (
                <details
                  key={deck.id}
                  open={i === 0}
                  className="group rounded-card border border-hairline bg-surface"
                >
                  <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-4 py-3 text-sm font-semibold">
                    <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{displayDeckName(deck.title, legendName)}</span>
                    {deck.playerName && (
                      <span className="font-normal text-ink-muted">par {deck.playerName}</span>
                    )}
                    {deck.tournamentTier && (
                      <span className="rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">
                        {deck.tournamentTier}
                      </span>
                    )}
                    {deck.placement && (
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">
                        {deck.placement}
                      </span>
                    )}
                  </summary>
                  <div className="px-3 pb-3">
                    <DecklistInteractive
                      compact
                      cards={cards}
                      deckName={displayDeckName(deck.title, legendName)}
                      legendName={legendName}
                      playerName={deck.playerName ?? undefined}
                      context={deck.tournamentContext ?? undefined}
                      showCopyCode
                      showExportPng
                      deckbuilderCode={deckbuilderCode}
                    />
                  </div>
                </details>
              ))}
            </div>
          )}
        </Section>

        {/* À savoir : cartes clés + forces/faiblesses côte à côte */}
        {((fiche.keyCards?.length ?? 0) > 0 ||
          (fiche.strengths?.length ?? 0) > 0 ||
          (fiche.weaknesses?.length ?? 0) > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {(fiche.keyCards?.length ?? 0) > 0 && (
              <section>
                <h2
                  className="flex items-center gap-2 text-xl font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  <TrendingUp size={18} /> Cartes clés
                </h2>
                <div className="mt-3 space-y-2">
                  {fiche.keyCards!.map((kc, i) => {
                    const code =
                      kc.id && CODE_RE.test(kc.id)
                        ? kc.id
                        : kc.name && CODE_RE.test(kc.name)
                          ? kc.name
                          : null;
                    const resolved = code ? cardMap[code] : null;
                    const nameIsCode = !!kc.name && CODE_RE.test(kc.name);
                    const display = resolved ?? kc.name ?? code ?? "";
                    const wrapName = resolved ?? (!nameIsCode ? kc.name : null);
                    return (
                      <div key={i} className="rounded-lg border border-hairline bg-surface p-3">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                          >
                            {wrapName ? <CardRef name={wrapName}>{display}</CardRef> : display}
                          </span>
                          {kc.cost != null && (
                            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-arcane">
                              {kc.cost} énergie
                            </span>
                          )}
                        </div>
                        {kc.role && <p className="mt-0.5 text-xs text-ink-secondary">{kc.role}</p>}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {((fiche.strengths?.length ?? 0) > 0 || (fiche.weaknesses?.length ?? 0) > 0) && (
              <section>
                <h2
                  className="text-xl font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Forces &amp; faiblesses
                </h2>
                <div className="mt-3 space-y-4">
                  {(fiche.strengths?.length ?? 0) > 0 && (
                    <div className="rounded-lg border border-hairline bg-surface p-4">
                      <h3
                        className="text-sm font-semibold text-emerald-500"
                        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                      >
                        Forces
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-secondary">
                        {fiche.strengths!.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(fiche.weaknesses?.length ?? 0) > 0 && (
                    <div className="rounded-lg border border-hairline bg-surface p-4">
                      <h3
                        className="flex items-center gap-1.5 text-sm font-semibold text-red-400"
                        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                      >
                        <AlertTriangle size={15} /> Faiblesses
                      </h3>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-secondary">
                        {fiche.weaknesses!.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Champions + Champs de bataille côte à côte */}
        {((fiche.champions && Object.keys(fiche.champions).length > 0) ||
          (fiche.topBattlefields?.length ?? 0) > 0) && (
          <div className="grid gap-6 lg:grid-cols-2">
            {fiche.champions && Object.keys(fiche.champions).length > 0 && (
              <section>
                <h2
                  className="text-xl font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Champions joués
                </h2>
                <div className="mt-3 space-y-2">
                  {Object.entries(fiche.champions).map(([champName, info]) => (
                    <div key={champName} className="rounded-lg border border-hairline bg-surface p-3">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                        >
                          {champName}
                        </span>
                        {info?.usage && (
                          <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-violet">
                            {info.usage}
                          </span>
                        )}
                      </div>
                      {info?.role && <p className="mt-0.5 text-xs text-ink-secondary">{info.role}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(fiche.topBattlefields?.length ?? 0) > 0 && (
              <section>
                <h2
                  className="text-xl font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  Champs de bataille fréquents
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {fiche.topBattlefields!.map((bf) => (
                    <span
                      key={bf}
                      className="rounded-full bg-surface-raised px-3 py-1 text-xs text-ink-secondary"
                    >
                      {bf}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={decksHref}
            className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Voir tous les decks de {name}
          </Link>
          <Link
            href="/tier-list"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink"
          >
            Tier List
          </Link>
          <Link
            href="/legendes"
            className="inline-flex items-center gap-2 rounded-lg bg-surface-raised px-4 py-2 text-sm font-semibold text-ink-secondary hover:text-ink"
          >
            Toutes les Légendes
          </Link>
        </div>
      </div>
    </div>
  );
}
