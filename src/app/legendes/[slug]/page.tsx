// Page dynamique : la résolution des codes cartes (UNL-059 -> nom réel) et les
// decklists interrogent la DB d'exécution, indisponible au build Docker. En
// "force-dynamic", le rendu se fait toujours à la requête, donc la DB est joignable
// en prod et les codes sont résolus en vrais noms (fini les UNL-059 affichés bruts).
export const dynamic = "force-dynamic";

import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "@/components/lien";
import Image from "next/image";
import { TrendingUp, Sparkles, AlertTriangle, Layers, Swords } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { LEGEND_GUIDES } from "@/lib/legend-guides";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { getBannerUrl } from "@/lib/banners";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";
import { legendWithDecks } from "@/lib/legend-fiche";
import { displayLegendName, formatDate } from "@/lib/utils";
import type { DecklistCard, DeckSection } from "@/types";
import { tr } from "@/lib/i18n-server";

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

// Une Légende sans fiche rédigée a quand même sa page dès qu'elle a des decks publiés :
// la fiche est alors reconstruite depuis la base. On ne reprend que les domaines, qui
// n'ont pas de langue. Pas le texte de la carte : il est en anglais et truffé de jetons
// d'icônes, illisible dans un bloc de prose française. Rien n'est inventé : sans carte en
// base, la page n'affiche que les decklists.
async function ficheFromDb(legendName: string): Promise<Fiche> {
  const fiche: Fiche = { legendName };
  try {
    const card = await prisma.card.findFirst({
      where: {
        type: "Legend",
        OR: [
          { name: { equals: legendName, mode: "insensitive" } },
          { name: { equals: legendName.replace(", ", " - "), mode: "insensitive" } },
        ],
      },
      select: { domains: true },
    });
    if (card) fiche.domains = card.domains;
  } catch {
    /* DB indispo : page rendue sans domaines. */
  }
  return fiche;
}

// Fiche rédigée si elle existe, sinon repli sur la base. `null` = ni l'une ni l'autre,
// la page n'existe pas.
async function resolveLegend(
  slug: string,
): Promise<{ fiche: Fiche; deckCount: number } | null> {
  const [fiche, fromDecks] = await Promise.all([getFiche(slug), legendWithDecks(slug)]);
  if (fiche) return { fiche, deckCount: fromDecks?.deckCount ?? 0 };
  if (!fromDecks) return null;
  return { fiche: await ficheFromDb(fromDecks.legendName), deckCount: fromDecks.deckCount };
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
//
// Deux requêtes plutôt qu'une : le classement se fait sur `tournamentTier` (S > A > B…)
// et `placement` ("1st", "10th"), que Postgres trierait dans l'ordre alphabétique, donc
// faux. On lit d'abord les clés de tri seules (léger, même sur 3 000 decks), on trie en
// mémoire, puis on ne charge les cartes que des 24 retenus. Avant, le tri portait sur les
// 30 decks les plus récents : la page annonçait les meilleurs et montrait les derniers.
const POOL_SIZE = 24;

async function fetchLegendDecks(legendName: string) {
  try {
    const keys = await prisma.deck.findMany({
      where: { published: true, legendName: { contains: legendName, mode: "insensitive" } },
      select: { id: true, featured: true, tournamentTier: true, placement: true, createdAt: true },
    });
    keys.sort((a, b) => {
      // `featured` d'abord : ce sont les best-of, la meilleure liste retenue par tournoi
      // pour cette Légende. Le classer après le niveau de tournoi remontait un 48e
      // d'Utrecht devant eux, parce que `tournamentTier` n'est renseigné que sur 221
      // decks sur 22 500 et vaut null sur la plupart des best-of.
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const ta = a.tournamentTier ? (TIER_ORDER[a.tournamentTier] ?? 5) : 5;
      const tb = b.tournamentTier ? (TIER_ORDER[b.tournamentTier] ?? 5) : 5;
      if (ta !== tb) return ta - tb;
      const pa = placementRank(a.placement);
      const pb = placementRank(b.placement);
      if (pa !== pb) return pa - pb;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
    const ids = keys.slice(0, POOL_SIZE).map((k) => k.id);
    if (ids.length === 0) return [];
    const decks = await prisma.deck.findMany({
      where: { id: { in: ids } },
      include: {
        cards: { include: { card: true }, orderBy: [{ section: "asc" }, { card: { name: "asc" } }] },
      },
    });
    // `in` ne garantit pas l'ordre : on réapplique celui des ids.
    const rank = new Map(ids.map((id, i) => [id, i]));
    return decks.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
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
  const resolved = await resolveLegend(slug);
  if (!resolved) return { title: "Légende introuvable" };
  const { fiche } = resolved;
  const name = displayLegendName(fiche.legendName ?? slug);
  // Pas de set dans le titre : `fiche.set` est le set d'IMPRESSION de la carte
  // légende (Irelia = Spiritforged, Master Yi = Origins Starter), pas le format
  // où elle se joue. Toutes les fiches sont jouables en Unleashed, donc afficher
  // un vieux set laissait croire à une page périmée.
  const title = `Decks ${name} : les meilleures listes et le guide`;
  const archetype = fiche.archetype ? `${fiche.archetype}. ` : "";
  // La description ne promet que ce que la page contient vraiment : les fiches
  // générées depuis les decklists n'ont ni plan de jeu ni forces et faiblesses.
  const hasGuide = Boolean(fiche.gameplan || fiche.strengths?.length || fiche.weaknesses?.length);
  const promise = hasGuide
    ? "decklists de tournoi, plan de jeu, cartes clés, forces et faiblesses."
    : "decklists de tournoi, cartes clés et résultats mesurés en compétition.";
  const description = `Les meilleurs decks ${name} à Riftbound : ${archetype}${promise}`.slice(0, 158);
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

// Vignette de carte : l'image quand la carte est en base, le texte seul sinon.
// Sert aux cartes clés, aux Champions joués et aux champs de bataille, qui
// étaient trois listes de texte. Les champs de bataille sont en paysage.
function CardTile({
  art,
  label,
  sub,
  badge,
  landscape,
}: {
  art: { name: string; imageUrl: string | null; riftboundId: string } | null;
  label: React.ReactNode;
  sub?: string | null;
  badge?: string | null;
  landscape?: boolean;
}) {
  const image = art?.imageUrl ? (
    <Image
      src={art.imageUrl}
      alt={art.name}
      width={landscape ? 300 : 214}
      height={landscape ? 214 : 300}
      sizes="(max-width: 640px) 45vw, 200px"
      className="w-full rounded-game-card bg-surface-raised object-cover transition-transform duration-200 group-hover:scale-[1.03]"
      style={{ aspectRatio: landscape ? "419 / 300" : "300 / 419" }}
    />
  ) : null;

  return (
    <div className="group flex flex-col gap-1.5">
      {image &&
        (art ? (
          <Link href={`/cartes/${art.riftboundId}`} className="block">
            {image}
          </Link>
        ) : (
          image
        ))}
      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {label}
        </span>
        {badge && (
          <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-violet-light">
            {badge}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-ink-secondary">{sub}</p>}
    </div>
  );
}

export default async function LegendePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tr();
  const { slug } = await params;
  const resolved = await resolveLegend(slug);
  if (!resolved) notFound();
  const { fiche, deckCount } = resolved;

  const name = displayLegendName(fiche.legendName ?? slug);
  const legendName = fiche.legendName ?? name;
  const bannerUrl = getBannerUrl(legendName);

  // Résolution des codes cartes -> noms réels. Les keyCards portent parfois un code
  // (UNL-059) dans `name`, parfois le vrai nom. On collecte tous les codes et on
  // interroge la DB une seule fois. En force-dynamic la DB est joignable : les codes
  // sont résolus en prod (plus de UNL-059 affichés bruts).
  // On résout aussi les noms, pas seulement les codes, et on rapatrie l'image :
  // les cartes clés, les Champions joués et les champs de bataille étaient trois
  // listes de texte, alors que ces pages parlent de cartes.
  const codes = new Set<string>();
  const names = new Set<string>();
  const collect = (v: string | null | undefined) => {
    if (!v) return;
    if (CODE_RE.test(v)) codes.add(v);
    else names.add(v);
  };
  for (const kc of fiche.keyCards ?? []) {
    if (kc.id && CODE_RE.test(kc.id)) codes.add(kc.id);
    else collect(kc.name);
  }
  for (const champName of Object.keys(fiche.champions ?? {})) collect(champName);
  for (const bf of fiche.topBattlefields ?? []) collect(bf);

  interface Art {
    name: string;
    imageUrl: string | null;
    riftboundId: string;
  }
  const cardArt: Record<string, Art> = {};
  if (codes.size > 0 || names.size > 0) {
    try {
      // Les fiches utilisent un code court (UNL-059) ; en base le riftboundId est en
      // minuscules sur 3 segments (unl-059-219). On matche par préfixe "unl-059-" (le
      // tiret final exclut les variantes alt-art type "unl-059a-").
      const codeList = [...codes];
      const nameList = [...names];
      const cards = await prisma.card.findMany({
        where: {
          alternateArt: false,
          OR: [
            ...codeList.map((c) => ({ riftboundId: { startsWith: `${c.toLowerCase()}-` } })),
            ...nameList.flatMap((n) => [
              { name: { equals: n, mode: "insensitive" as const } },
              { cleanName: { equals: n, mode: "insensitive" as const } },
            ]),
          ],
        },
        select: { riftboundId: true, name: true, cleanName: true, imageUrl: true },
      });
      for (const code of codeList) {
        const pref = `${code.toLowerCase()}-`;
        const match = cards.find((c) => c.riftboundId.startsWith(pref));
        if (match) cardArt[code] = match;
      }
      for (const n of nameList) {
        const low = n.toLowerCase();
        const match = cards.find(
          (c) => c.name.toLowerCase() === low || c.cleanName?.toLowerCase() === low,
        );
        if (match) cardArt[n] = match;
      }
    } catch {
      /* DB indispo : on retombe sur le texte seul. */
    }
  }
  // Compat : les rendus qui n'ont besoin que du nom résolu.
  const cardMap: Record<string, string> = Object.fromEntries(
    Object.entries(cardArt).map(([k, v]) => [k, v.name]),
  );

  // Pool déjà trié (niveau de tournoi, puis classement) : les 3 premiers dépliés.
  const legendDecks = await fetchLegendDecks(legendName);
  const topDecks = legendDecks.slice(0, 3);
  // Le reste du pool part en liste de liens (pas de decklist dépliée : la page serait
  // illisible et lourde).
  const otherDecks = legendDecks.slice(3);

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

  // Guide "Comment jouer" : prose HUMAINE recopiée des fiches-articles (src/lib/legend-guides.ts),
  // affichée seulement si une entrée existe pour ce slug (jamais d'invention).
  const guide = LEGEND_GUIDES[slug];
  const guideProse = guide
    ? [guide.bref, guide.gagne, guide.plan].filter(Boolean).join("\n\n").replace(/\s*[—–]\s*/g, ", ")
    : null;

  // Date de fraîcheur : celle du deck le plus récent affiché. Elle décrit exactement
  // ce que la page contient, contrairement à une date de publication figée. Les pages
  // concurrentes affichent la leur dans les résultats de recherche, pas nous.
  const lastUpdated = legendDecks.length
    ? new Date(Math.max(...legendDecks.map((d) => d.createdAt.getTime())))
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Decks ${name} : les meilleures listes et le guide`,
    ...(lastUpdated ? { dateModified: lastUpdated.toISOString() } : {}),
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
          className="inline-flex items-center gap-1 rounded bg-surface-raised px-2 py-0.5 font-semibold"
          style={{ color: DOMAIN_COLORS[d] ?? "#6b7280" }}
        >
          {DOMAIN_ICONS[d] && <img src={DOMAIN_ICONS[d]} alt="" className="h-3.5 w-3.5" />}
          {DOMAIN_LABELS_FR[d] ?? d}
        </span>
      ))}
      {tierLabel && (
        <span className="rounded bg-gold px-2 py-0.5 font-semibold text-canvas">{tierLabel}</span>
      )}
      {fiche.set && (
        <span className="rounded bg-violet-dark px-2 py-0.5 font-semibold text-white">{fiche.set}</span>
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
          <Image
            src={bannerUrl}
            alt={`Bannière ${name}`}
            width={700}
            height={300}
            priority
            sizes="(max-width: 1024px) 100vw, 976px"
            className="block h-auto w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <h1
              className="text-3xl font-bold text-white drop-shadow sm:text-4xl"
              style={{ fontFamily: "var(--font-rubik), sans-serif" }}
            >
              Decks {name}
            </h1>
            {fiche.archetype && (
              <p className="mt-1 max-w-2xl text-sm text-white/85 sm:text-base">{fiche.archetype}</p>
            )}
            <div className="mt-3">{Badges}</div>
            {lastUpdated && (
              <p className="mt-2 text-xs text-white/70">
                Mis à jour le{" "}
                <time dateTime={lastUpdated.toISOString().slice(0, 10)}>{formatDate(lastUpdated)}</time>
              </p>
            )}
          </div>
        </header>
      ) : (
        <header className="rounded-card border border-hairline bg-surface p-5">
          <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Decks {name}
          </h1>
          {fiche.archetype && <p className="mt-2 text-lg text-ink-secondary">{fiche.archetype}</p>}
          <div className="mt-3">{Badges}</div>
          {lastUpdated && (
            <p className="mt-2 text-xs text-ink-muted">
              Mis à jour le{" "}
              <time dateTime={lastUpdated.toISOString().slice(0, 10)}>{formatDate(lastUpdated)}</time>
            </p>
          )}
        </header>
      )}

      {/* Capacité de la Légende */}
      {fiche.legendAbility && (
        <div className="mt-6 rounded-card border border-hairline bg-surface p-4">
          <h2
            className="flex items-center gap-2 text-sm font-semibold text-arcane"
            style={{ fontFamily: "var(--font-rubik), sans-serif" }}
          >
            <Sparkles size={16} /> {t("Capacité de la Légende")}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{fiche.legendAbility}</p>
        </div>
      )}

      <div className="mt-10 space-y-12">
        {/* Decklists, contenu principal */}
        <Section title={`Meilleurs decks ${name}`} icon={<Layers size={20} />}>
          {deckCount > 0 && (
            <p className="mb-3 text-sm text-ink-secondary">
              {`${deckCount.toLocaleString("fr-FR")} decklist${deckCount > 1 ? "s" : ""} ${name} relevée${deckCount > 1 ? "s" : ""} en tournoi. Les meilleures d'abord : niveau du tournoi, puis classement du joueur.`}
            </p>
          )}
          {decklists.length === 0 ? (
            <p className="rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
              {t("Pas encore de decklist classée pour cette Légende.")}
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
                      <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-canvas">
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

        {/* Les listes suivantes en liens : chemin interne vers les pages deck, que Google
            n'atteint aujourd'hui que par le sitemap. Rendu dans l'ordre de tri déjà
            calculé (niveau de tournoi, puis classement). */}
        {otherDecks.length > 0 && (
          <Section title={`Autres listes ${name} en tournoi`} icon={<Layers size={20} />}>
            <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
              {otherDecks.map((deck) => (
                <li key={deck.id}>
                  <Link
                    href={`/decks/${deck.slug}`}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 py-2.5 text-sm hover:bg-surface-raised"
                  >
                    <span
                      className="font-semibold text-arcane"
                      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                    >
                      {displayDeckName(deck.title, legendName)}
                    </span>
                    {deck.playerName && (
                      <span className="text-ink-muted">par {deck.playerName}</span>
                    )}
                    {deck.placement && (
                      <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">
                        {deck.placement}
                      </span>
                    )}
                    {deck.tournamentContext && (
                      <span className="ml-auto truncate text-xs text-ink-muted">
                        {deck.tournamentContext}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {deckCount > legendDecks.length && (
              <p className="mt-3 text-sm">
                <Link href={decksHref} className="text-arcane hover:underline">
                  Voir les {deckCount.toLocaleString("fr-FR")} decks {name}
                </Link>
              </p>
            )}
          </Section>
        )}

        {/* Comment jouer : prose humaine recopiée des fiches-articles, avec aperçu au survol */}
        {guideProse && (
          <Section title={`Comment jouer ${name}`} icon={<Swords size={20} />}>
            <div className="max-w-3xl text-[15px] leading-7 text-ink-secondary">
              <MarkdownRenderer content={guideProse} />
            </div>
          </Section>
        )}

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
                  <TrendingUp size={18} /> {t("Cartes clés")}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fiche.keyCards!.map((kc, i) => {
                    const code =
                      kc.id && CODE_RE.test(kc.id)
                        ? kc.id
                        : kc.name && CODE_RE.test(kc.name)
                          ? kc.name
                          : null;
                    const art = (code ? cardArt[code] : null) ?? (kc.name ? cardArt[kc.name] : null);
                    const nameIsCode = !!kc.name && CODE_RE.test(kc.name);
                    const display = art?.name ?? kc.name ?? code ?? "";
                    const wrapName = art?.name ?? (!nameIsCode ? kc.name : null);
                    return (
                      <CardTile
                        key={i}
                        art={art}
                        label={wrapName ? <CardRef name={wrapName}>{display}</CardRef> : display}
                        sub={kc.role}
                      />
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
                  {t("Champions joués")}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(fiche.champions).map(([champName, info]) => (
                    <CardTile
                      key={champName}
                      art={cardArt[champName] ?? null}
                      label={champName}
                      badge={info?.usage}
                      sub={info?.role}
                    />
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
                  {t("Champs de bataille fréquents")}
                </h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {fiche.topBattlefields!.map((bf) => (
                    <CardTile key={bf} art={cardArt[bf] ?? null} label={bf} landscape />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={decksHref}
            className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90"
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
            {t("Toutes les Légendes")}
          </Link>
        </div>
      </div>
    </div>
  );
}
