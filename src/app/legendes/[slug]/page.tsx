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
import { BoutonLien } from "@/components/bouton";
import Image from "next/image";
import { TrendingUp, Sparkles, AlertTriangle, Layers, Swords, Trophy, ChevronDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { LEGEND_GUIDES } from "@/lib/legend-guides";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { DeckCoveragePanel } from "@/components/collection/deck-coverage-panel";
import { cartesDeck, chiffrerDeck, lienAchatDeck } from "@/lib/cardnexus";
import { encodeDeckBase64 } from "@/lib/deck-codec";
import { getBannerUrl } from "@/lib/banners";
import { cartesInterdites, isBanned } from "@/lib/banned-cards";
import { PastilleInterdite } from "@/components/pastille-interdite";
import { dateAnalyseFiche } from "@/lib/fiche-date";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";
import { legendFicheSlug, legendWithDecks } from "@/lib/legend-fiche";
import { ecartEnPoints, partsDuSet } from "@/lib/parts-classement";
import { rangPlacement } from "@/lib/card-play";
import { TIER_BANNER } from "@/lib/tier-colors";
import { etiquetteLocale } from "@/lib/i18n";
import { BoutonSuivre } from "@/components/bouton-suivre";
import { getUserFromSession } from "@/lib/session";
import { estAbonne } from "@/lib/abonnements";
import { cn, displayLegendName, formatDate } from "@/lib/utils";
import { afficherPlacement } from "@/lib/deck-listing-params";
import type { DecklistCard, DeckSection } from "@/types";
import { tr, metaTraduite, langueCourante } from "@/lib/i18n-server";
import { jsonLdHtml, langueSchema } from "@/lib/json-ld";
import { rangSet } from "@/lib/tournament-order";
import { cache } from "react";

const FICHES_DIR = path.join(process.cwd(), "data", "fiches");
const euros = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
// « Cœur du deck, 100 % des listes, 3 exemplaires » : le taux et les exemplaires que
// `fiches-maj` écrit dans le rôle d'une carte. Un rôle écrit autrement rend null.
const tauxDuRole = (role: string | null | undefined) => {
  const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(role ?? "");
  return m ? Number(m[1].replace(",", ".")) : null;
};
const exemplairesDuRole = (role: string | null | undefined) => {
  const m = /(\d+)\s+exemplaires?/.exec(role ?? "");
  return m ? Number(m[1]) : null;
};
const CODE_RE = /^[A-Z]{2,4}-\d+$/;

// Les fiches notent un champ de bataille « Minefield (88 %) ». Cherchée telle quelle,
// la carte n'existe pas : la vignette restait vide et le nom s'affichait avec sa part
// collée dessus. On sépare le nom de la part.
const nomTerrain = (bf: string) => bf.replace(/\s*\(\s*[\d.,]+\s*%?\s*\)\s*$/, "").trim();
const partTerrain = (bf: string) => bf.match(/\(\s*([\d.,]+)\s*%?\s*\)\s*$/)?.[1] ?? null;

interface KeyCard {
  name?: string;
  id?: string;
  cost?: number | null;
  role?: string;
  /** Posé par `fiches-maj` : la carte est dans au moins 9 listes sur 10. */
  noyau?: boolean;
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
  // Porte la vraie date du releve (« Releve du 17 aout 2026 »). Absent de 14 fiches.
  dataSource?: string;
  // Le set dont viennent cartes, champions et terrains. Absent : ils datent d'un
  // ancien set, et une Kai'Sa d'Origins ne joue pas les cartes de sa version Vendetta.
  setDesChiffres?: string;
  // Présent quand les cartes ne viennent que des tournois joués depuis le dernier ban.
  cartesDepuisBan?: string;
  // Compté sur le CLASSEMENT complet des tournois, pas sur les listes publiées :
  // `joueursClasses` compte tous ceux qui ont joué la Légende, `coupe10` ceux qui
  // ont fini dans les 10 % de tête de leur tournoi. Voir `scripts/fiches-stats.mts`.
  competitiveResults?: {
    joueursClasses?: number;
    coupe10?: number;
    conversion?: string;
    tournois?: number;
    listesPubliees?: number;
    titres?: number;
    bestPlacements?: { placement?: string; player?: string; tournament?: string }[];
  };
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
// Une seule requête pour la page ET ses métadonnées : Next appelle
// generateMetadata puis le composant, et la même ligne partait deux fois en
// base à chaque visite. `cache` de React les réunit le temps d'une requête.
const resolveLegend = cache(async (
  slug: string,
): Promise<{ fiche: Fiche; deckCount: number } | null> => {
  const [fiche, fromDecks] = await Promise.all([getFiche(slug), legendWithDecks(slug)]);
  if (fiche) return { fiche, deckCount: fromDecks?.deckCount ?? 0 };
  if (!fromDecks) return null;
  return { fiche: await ficheFromDb(fromDecks.legendName), deckCount: fromDecks.deckCount };
});

// S/A/B/C comme /tier-list et /legendes : un seul vocabulaire de classement.
// « Tier » reste réservé au niveau des tournois.
const TIER_LABELS: Record<number, string> = {
  1: "S (haut du méta)",
  2: "A (solide)",
  3: "B (jouable)",
  4: "C (de niche)",
  5: "D (anecdotique)",
};

// Ordre de tri des decks par niveau de tournoi, identique à la page /decks.
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

/**
 * Les sets du plus récent au plus ancien.
 *
 * Une fiche Légende doit ouvrir sur une liste JOUABLE aujourd'hui. Sans ce
 * critère, le tri partait du niveau de tournoi et du classement : une 1re place
 * de Déchaînement passait devant un best-of de Vendetta, et le visiteur copiait
 * une liste qui n'est plus légale dans le format en cours.
 *
 * Une Légende qui n'a aucun deck dans le set courant ouvre sur le set le plus
 * récent où elle en a un : le tri s'en charge tout seul, il n'y a rien à filtrer.
 */
function placementRank(p: string | null): number {
  if (!p) return 9999;
  const m = p.match(/\d+/);
  return m ? parseInt(m[0], 10) : 9999;
}

// Ce qu'une ligne de deck annonce, sur la page d'une Légende.
//
// Une decklist de tournoi s'intitule « Irelia, Blade Dancer · konaha (1st) », et
// la ligne montre déjà, chacun à sa place, la Légende, le joueur, le rang et le
// tournoi. Elle disait donc « konaha (1st) par konaha 1st », et pour les listes
// dont le titre reprend le tournoi, celui-ci sortait deux fois.
//
// `nomDeDeck` ne garde que ce qui reste APRÈS avoir retiré les quatre, et rend
// null s'il ne reste rien : le titre d'un guide écrit à la main, jamais un
// résumé de ce qui est déjà là. La ligne mène alors avec le tournoi.
function nomDeDeck(
  deck: {
    title: string;
    playerName?: string | null;
    placement?: string | null;
    tournamentContext?: string | null;
  },
  legendName: string,
): string | null {
  let t = deck.title.replace(/\s*[—–]\s*/g, " · ").replace(/\bBest of\b/gi, "Meilleur de");
  for (const doublon of [
    legendName.replace(/\s*[—–]\s*/g, " · "),
    deck.playerName,
    deck.placement && `(${deck.placement})`,
    deck.placement,
    deck.tournamentContext,
  ]) {
    if (doublon) t = t.split(doublon).join(" ");
  }
  // On ne rabote que les bords : « (2026-08-22) » perdait ses traits au milieu.
  return t.replace(/\s+/g, " ").replace(/^[\s·:,-]+|[\s·:,-]+$/g, "") || null;
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
      select: { id: true, featured: true, tournamentTier: true, placement: true, createdAt: true, setTag: true },
    });
    keys.sort((a, b) => {
      // Le SET d'abord : la première liste proposée doit être jouable dans le
      // format en cours. Un best-of d'Origines reste un beau résultat, il n'aide
      // personne à monter un deck aujourd'hui.
      const sa = rangSet(a.setTag);
      const sb = rangSet(b.setTag);
      if (sa !== sb) return sa - sb;
      // Puis `featured` : ce sont les best-of, la meilleure liste retenue par tournoi
      // pour cette Légende. Le classer après le niveau de tournoi remontait un 48e
      // d'Utrecht devant eux, parce que `tournamentTier` n'est renseigné que sur 193
      // decks sur 24 962 et vaut null sur la plupart des best-of.
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
  return metaTraduite({
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
  });
}

function Section({
  id,
  title,
  icon,
  children,
}: {
  id?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2
        id={id}
        className="flex scroll-mt-20 items-center gap-2 text-2xl font-semibold text-arcane"
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
// Deux dates distinctes : celle de l'analyse (le relevé qui a produit les cartes
// clés et les forces) et celle du dernier deck ajouté. Les confondre laissait une
// fiche de mai s'annoncer « mise à jour » en août. Sans date de relevé, on ne dit
// rien de l'analyse plutôt que d'emprunter celle des decks.
function DatesFiche({
  analyse,
  dernierDeck,
  className,
}: {
  analyse: Date | null;
  dernierDeck: Date | null;
  className: string;
}) {
  if (!analyse && !dernierDeck) return null;
  return (
    <p className={`mt-2 text-xs ${className}`}>
      {analyse && (
        <>
          Analyse du{" "}
          <time dateTime={analyse.toISOString().slice(0, 10)}>{formatDate(analyse)}</time>
        </>
      )}
      {analyse && dernierDeck && " · "}
      {dernierDeck && (
        <>
          dernier deck le{" "}
          <time dateTime={dernierDeck.toISOString().slice(0, 10)}>{formatDate(dernierDeck)}</time>
        </>
      )}
    </p>
  );
}

function CardTile({
  art,
  label,
  sub,
  badge,
  landscape,
  nom,
  lien,
  taux,
}: {
  art: { name: string; imageUrl: string | null; riftboundId: string } | null;
  label: React.ReactNode;
  sub?: string | null;
  badge?: string | null;
  landscape?: boolean;
  // Sert au contrôle de bannissement quand la carte n'a pas d'art en base.
  nom?: string | null;
  lien?: { href: string; texte: string } | null;
  /** Part des listes qui jouent la carte, de 0 à 100 : dessinée en barre sous le nom. */
  taux?: number | null;
}) {
  const banni = isBanned(nom ?? art?.name ?? "");
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
        {banni && (
          <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">
            Bannie
          </span>
        )}
        {badge && (
          <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-bold text-violet-light">
            {badge}
          </span>
        )}
      </div>
      {taux != null && (
        <div className="flex items-center gap-2">
          <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised">
            <span className="block h-full rounded-full bg-arcane" style={{ width: `${Math.min(100, taux)}%` }} />
          </span>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-ink">{taux} %</span>
        </div>
      )}
      {sub && <p className="text-xs text-ink-secondary">{sub}</p>}
      {lien && (
        <Link href={lien.href} className="inline-flex min-h-6 items-center text-xs text-arcane hover:underline">
          {lien.texte}
        </Link>
      )}
    </div>
  );
}

// Une carte en une ligne, pour la colonne de droite : le nom (avec son aperçu au
// survol), la part des listes en barre, le chiffre. « 93 », « 93 % » ou rien.
function LigneTaux({ nom, part, sub, banni }: { nom: string; part: string | null; sub?: string | null; banni?: boolean }) {
  const taux = tauxDuRole(part && !part.includes("%") ? `${part} %` : part);
  return (
    <div className="flex min-h-11 items-center gap-3 px-4 py-1.5 sm:min-h-9">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-1.5 text-sm text-ink-secondary">
          <CardRef name={nom}>{nom}</CardRef>
          {banni && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[11px] font-bold text-red-400">Bannie</span>}
        </div>
        {sub && <div className="truncate text-xs text-ink-muted">{sub}</div>}
      </div>
      {taux != null && (
        <>
          <span className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-surface-raised">
            <span className="block h-full rounded-full bg-arcane" style={{ width: `${Math.min(100, taux)}%` }} />
          </span>
          <span className="w-11 shrink-0 text-right text-sm font-semibold tabular-nums text-ink">{taux} %</span>
        </>
      )}
    </div>
  );
}

export default async function LegendePage({ params }: { params: Promise<{ slug: string }> }) {
  const t = await tr();
  const langue = await langueCourante();
  const { slug } = await params;
  const resolved = await resolveLegend(slug);
  if (!resolved) notFound();
  const { fiche, deckCount } = resolved;

  const name = displayLegendName(fiche.legendName ?? slug);
  const legendName = fiche.legendName ?? name;
  const bannerUrl = getBannerUrl(legendName);

  // La carte Légende elle-même, pour l'encart d'en-tête. Les variantes portent leur
  // mention dans le nom ((Metal), (Signature)…), donc l'égalité stricte prend l'originale.
  let carteLegende: { riftboundId: string; imageUrl: string | null; textPlain: string | null } | null =
    null;
  try {
    carteLegende = await prisma.card.findFirst({
      where: {
        type: "Legend",
        alternateArt: false,
        OR: [
          { name: { equals: legendName, mode: "insensitive" } },
          { name: { equals: legendName.replace(", ", " - "), mode: "insensitive" } },
        ],
      },
      select: { riftboundId: true, imageUrl: true, textPlain: true },
      orderBy: [{ overnumbered: "asc" }, { set: "asc" }],
    });
  } catch {
    /* DB indispo : l'encart se réduit à l'explication de la fiche. */
  }

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
  for (const bf of fiche.topBattlefields ?? []) collect(nomTerrain(bf));

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

  // Noyau et cartes flex : le partage vient de `fiches-maj`, au même seuil que le
  // rang « Cœur du deck » écrit sous chaque vignette.
  const setDesChiffres = fiche.setDesChiffres ?? null;
  const noyau = (fiche.keyCards ?? []).filter((kc) => kc.noyau);
  const flex = (fiche.keyCards ?? []).filter((kc) => !kc.noyau);
  const listesDuSet = fiche.competitiveResults?.listesPubliees ?? null;
  const listesHref = (carte?: string) => {
    const q = new URLSearchParams({ legend: legendName, set: setDesChiffres ?? "all" });
    if (carte) q.set("q", carte);
    return `/decks?${q}`;
  };
  const tuileCarte = (kc: KeyCard, i: number, avecLien = false) => {
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
        nom={display}
        label={wrapName ? <CardRef name={wrapName}>{display}</CardRef> : display}
        // Le rôle écrit par `fiches-maj` porte le taux et les exemplaires : la barre
        // dit le taux, la ligne dessous les exemplaires. Un rôle écrit autrement
        // s'affiche tel quel.
        taux={tauxDuRole(kc.role)}
        sub={tauxDuRole(kc.role) != null
          ? (exemplairesDuRole(kc.role) != null ? `${exemplairesDuRole(kc.role)} ${t(exemplairesDuRole(kc.role)! > 1 ? "exemplaires" : "exemplaire")}` : null)
          : kc.role}
        // Une carte flex est un choix : on montre qui le fait, liste par liste.
        lien={avecLien && wrapName ? { href: listesHref(wrapName), texte: t("Voir les listes qui la jouent") } : null}
      />
    );
  };

  // Pool déjà trié (niveau de tournoi, puis classement) : les 3 premiers dépliés.
  const legendDecks = await fetchLegendDecks(legendName);
  const topDecks = legendDecks.slice(0, 3);
  // Le reste du pool part en liste de liens (pas de decklist dépliée : la page serait
  // illisible et lourde).
  const otherDecks = legendDecks.slice(6);
  // Les six premières en lignes, avec leur prix. Rien à vendre sur une liste
  // injouable : on la signale, on ne la vend pas.
  const lignesDecks = legendDecks.slice(0, 6).map((deck) => {
    const interdites = cartesInterdites(deck.cards.map((dc) => dc.card.name));
    const cartesAchat = cartesDeck(deck.cards);
    return {
      deck,
      interdites,
      prix: interdites.length > 0 ? 0 : chiffrerDeck(cartesAchat).total,
      lienAchat: interdites.length > 0 ? null : lienAchatDeck(cartesAchat),
    };
  });

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

  // Le même encart que la page de deck. Ces pages sont la première porte d'entrée du
  // site (1 644 clics Google sur 28 jours en octobre) et n'avaient aucun lien d'achat :
  // 0 clic CardNexus, contre 28 pour 1 000 vues sur les pages de deck. Rien sur une
  // liste injouable : on la signale, on ne la vend pas.
  const encartAchat = (deck: (typeof topDecks)[number], cards: DecklistCard[]) => {
    if (cartesInterdites(deck.cards.map((dc) => dc.card.name)).length > 0) return null;
    const cartesAchat = cartesDeck(deck.cards);
    return (
      <div className="mt-3">
        <DeckCoveragePanel
          prix={chiffrerDeck(cartesAchat)}
          lienAchat={lienAchatDeck(cartesAchat)}
          items={cards.map((c) => ({ cardId: c.cardId, quantity: c.quantity, section: c.section, name: c.name }))}
        />
      </div>
    );
  };

  const domains = fiche.domains ?? [];
  const tierLabel = fiche.tier ? TIER_LABELS[fiche.tier] ?? `Tier ${fiche.tier}` : null;

  // La présence en tournoi, quand la fiche a été recalculée sur le classement.
  const cr = fiche.competitiveResults;
  const presence =
    cr?.joueursClasses && cr.joueursClasses > 0
      ? {
          joueurs: cr.joueursClasses,
          coupe: cr.coupe10 ?? 0,
          tournois: cr.tournois ?? 0,
          conversion: cr.conversion?.replace(".", ","),
        }
      : null;
  const decksHref = `/decks?legend=${encodeURIComponent(legendName)}`;

  // Guide "Comment jouer" : prose HUMAINE recopiée des fiches-articles (src/lib/legend-guides.ts),
  // affichée seulement si une entrée existe pour ce slug (jamais d'invention).
  const guide = LEGEND_GUIDES[slug];
  const guideProse = guide
    ? [guide.bref, guide.gagne, guide.plan].filter(Boolean).join("\n\n").replace(/\s*[—–]\s*/g, ", ")
    : null;

  // Deux dates, et pas une seule. Avant, « Mis à jour le » affichait la date du
  // deck importé le plus récemment : une fiche dont les cartes clés dataient de mai
  // s'annonçait à jour parce qu'un deck était tombé la veille. La date du relevé dit
  // quand l'analyse a été calculée, celle des decks quand la liste a bougé.
  const dernierDeck = legendDecks.length
    ? new Date(Math.max(...legendDecks.map((d) => d.createdAt.getTime())))
    : null;
  const dateAnalyse = dateAnalyseFiche(fiche.dataSource);
  // Le JSON-LD annonce la date de l'analyse quand on la connaît : c'est elle qui
  // décrit le contenu rédigé, pas l'arrivée d'un deck de plus.
  const lastUpdated = dateAnalyse ?? dernierDeck;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Decks ${name} : les meilleures listes et le guide`,
    ...(lastUpdated ? { dateModified: lastUpdated.toISOString() } : {}),
    description: fiche.archetype ?? `Guide de la Légende ${name} à Riftbound.`,
    inLanguage: langueSchema(langue),
    about: "Riftbound",
    author: { "@type": "Person", name: "Allan", url: "https://twitter.com/solary_allan" },
    publisher: { "@type": "Organization", name: "Riftbound France", url: "https://riftboundfrance.fr" },
  };

  // Suivre cette Légende : la cloche remontera les listes de tournoi qui
  // arrivent avec elle. Sans compte, le bouton ne s'affiche pas — il n'y aurait
  // nulle part où envoyer l'alerte.
  const membre = await getUserFromSession();
  const abonnements = membre
    ? await prisma.abonnement.findMany({ where: { userId: membre.id }, select: { genre: true, cible: true } })
    : [];
  const BoutonSuivreLegende = (
    <BoutonSuivre
      genre="legende"
      cible={name}
      connecte={!!membre}
      suiviInitial={estAbonne(abonnements, "legende", name)}
      libelle="Suivre cette Légende"
      libelleSuivi="Légende suivie"
    />
  );

  // Rang, part du champ et écart au format : les mêmes parts que l'accueil et /meta
  // (`parts-classement.ts`), lues sur le set des chiffres de la fiche.
  const locale = etiquetteLocale(langue);
  const pourcent = (x: number) => `${(x * 100).toLocaleString(locale, { maximumFractionDigits: 1 })} %`;
  const partsSet = setDesChiffres ? partsDuSet(setDesChiffres) : null;
  const lignePart = partsSet?.lignes.find((l) => l.slug === legendFicheSlug(legendName)) ?? null;
  const tuiles: { valeur: string; libelle: string; ecart?: { texte: string; bon: boolean } }[] = [];
  if (lignePart && partsSet) {
    tuiles.push(
      {
        valeur: langue === "fr" ? (lignePart.rang === 1 ? "1re" : `${lignePart.rang}e`) : `#${lignePart.rang}`,
        libelle: `${t("Légende la plus jouée en")} ${setDesChiffres}`,
      },
      { valeur: lignePart.joueurs.toLocaleString(locale), libelle: `${t("joueurs classés")}, ${pourcent(lignePart.part)} ${t("du champ")}` },
      {
        valeur: pourcent(lignePart.conversion),
        libelle: t("dans les 10 % de tête"),
        ecart: {
          texte: `${ecartEnPoints(lignePart.conversion, partsSet.conversionFormat, locale)} ${t("contre le format")}`,
          bon: lignePart.conversion >= partsSet.conversionFormat,
        },
      },
    );
  } else if (presence) {
    tuiles.push({ valeur: presence.joueurs.toLocaleString(locale), libelle: t("joueurs classés") });
    if (presence.conversion) tuiles.push({ valeur: presence.conversion, libelle: t("dans les 10 % de tête") });
  }
  if (tuiles.length > 0 && cr?.titres != null) tuiles.push({ valeur: String(cr.titres), libelle: t(cr.titres > 1 ? "titres" : "titre") });
  if (tuiles.length > 0 && cr?.listesPubliees != null) tuiles.push({ valeur: cr.listesPubliees.toLocaleString(locale), libelle: t("listes publiées") });

  const lettreTier = fiche.tier ? (["S", "A", "B", "C", "D"][fiche.tier - 1] ?? null) : null;
  const BlocTier = lettreTier ? (
    <div className="hidden items-center gap-3 sm:flex">
      <span
        className={cn("flex h-14 w-14 items-center justify-center rounded-lg text-3xl font-black", TIER_BANNER[lettreTier]?.bg, TIER_BANNER[lettreTier]?.text)}
        style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        aria-label={`Tier ${lettreTier}`}
      >
        {lettreTier}
      </span>
    </div>
  ) : null;
  // Le palmarès de la fiche ne vaut que pour le set de ses chiffres.
  const palmares = setDesChiffres ? (cr?.bestPlacements ?? []).filter((r) => r.tournament) : [];

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
        // Sur ordinateur, la lettre du tier est en grand à droite du bandeau.
        <span className={cn("rounded bg-gold px-2 py-0.5 font-semibold text-canvas", lettreTier && "sm:hidden")}>{tierLabel}</span>
      )}
      {fiche.set && (
        <span className="rounded bg-violet-dark px-2 py-0.5 font-semibold text-white">{fiche.set}</span>
      )}
      {fiche.difficulty && (
        <span className="rounded bg-surface-raised px-2 py-0.5 text-ink-muted">
          Difficulté : {fiche.difficulty}
        </span>
      )}
      {presence && tuiles.length === 0 && (
        // Les joueurs CLASSÉS, pas les listes publiées. L'écart n'est pas un
        // détail : à Barcelone, 106 listes pour 2 127 joueurs, et ce sont ceux
        // qui performent qui publient.
        <span
          className="rounded bg-surface-raised px-2 py-0.5 text-ink-muted"
          title={`${presence.joueurs} joueurs classés sur ${presence.tournois} tournois du format, dont ${presence.coupe} dans les 10 % de tête`}
        >
          {presence.joueurs.toLocaleString("fr-FR")} joueurs en tournoi
          {presence.conversion ? ` · ${presence.conversion} en coupe` : ""}
        </span>
      )}
    </div>
  );

  // Sommaire : la fiche fait 12 écrans sur téléphone. Chaque entrée reprend la
  // condition d'affichage de sa partie, pour ne jamais pointer vers un titre absent.
  const sommaire: Array<[string, string]> = [
    ["meilleurs-decks", t("Meilleurs decks")],
    ...(guideProse ? [["comment-jouer", t("Comment jouer")] as [string, string]] : []),
    ...((fiche.keyCards?.length ?? 0) > 0 && setDesChiffres ? [["noyau", t("Noyau et cartes flex")] as [string, string]] : []),
    ...((fiche.strengths?.length ?? 0) > 0 || (fiche.weaknesses?.length ?? 0) > 0 ? [["forces-faiblesses", t("Forces et faiblesses")] as [string, string]] : []),
    ...(setDesChiffres && fiche.champions && Object.keys(fiche.champions).length > 0 ? [["champions", t("Champions joués")] as [string, string]] : []),
    ...(setDesChiffres && (fiche.topBattlefields?.length ?? 0) > 0 ? [["champs-de-bataille", t("Champs de bataille")] as [string, string]] : []),
    ...(palmares.length > 0 ? [["palmares", t("Palmarès")] as [string, string]] : []),
    ...(otherDecks.length > 0 ? [["autres-listes", t("Autres listes")] as [string, string]] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
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
        // La hauteur suit l'image (7:3) tant que le texte y tient, puis le texte :
        // sous 600 px, l'image devenait plus basse que le bloc et le h1 sortait
        // par le haut du bandeau, invisible. `overflow-clip` et non `hidden` :
        // un bloc qui défile ne grandit plus avec son contenu malgré l'aspect-ratio.
        // Sur ordinateur le bandeau passe à 16:5 : à 7:3 il prenait 528 px, plus de
        // la moitié du premier écran, et les chiffres arrivaient au deuxième.
        <header className="relative flex aspect-[7/3] flex-col justify-end overflow-clip rounded-card border border-hairline lg:aspect-[16/5]">
          <Image
            src={bannerUrl}
            alt={`Bannière ${name}`}
            width={700}
            height={300}
            priority
            sizes="(max-width: 1024px) 100vw, 1232px"
            className="absolute inset-0 h-full w-full object-cover object-[50%_22%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative flex flex-wrap items-end justify-between gap-4 p-4 pt-24 sm:p-6">
            <div className="min-w-0">
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
              <DatesFiche analyse={dateAnalyse} dernierDeck={dernierDeck} className="text-white/70" />
              <div className="mt-3">{BoutonSuivreLegende}</div>
            </div>
            {BlocTier}
          </div>
        </header>
      ) : (
        <header className="flex flex-wrap items-end justify-between gap-4 rounded-card border border-hairline bg-surface p-5">
          <div className="min-w-0">
            <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Decks {name}
            </h1>
            {fiche.archetype && <p className="mt-2 text-lg text-ink-secondary">{fiche.archetype}</p>}
            <div className="mt-3">{Badges}</div>
            <DatesFiche analyse={dateAnalyse} dernierDeck={dernierDeck} className="text-ink-muted" />
            <div className="mt-3">{BoutonSuivreLegende}</div>
          </div>
          {BlocTier}
        </header>
      )}

      {/* Les chiffres sortent du bandeau : ils y tenaient en une pastille de 12 px.
          Les joueurs CLASSÉS, pas les listes publiées : à Barcelone, 106 listes pour
          2 127 joueurs, et ce sont ceux qui performent qui publient. */}
      {tuiles.length > 0 && (
        <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-card border border-hairline bg-surface sm:grid-cols-3 lg:grid-cols-5">
          {tuiles.map((c) => (
            <div key={c.libelle} className="border-hairline px-5 py-4 max-lg:border-b lg:border-r lg:last:border-r-0">
              <dd className="text-2xl font-bold tabular-nums text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{c.valeur}</dd>
              <dt className="text-xs text-ink-muted">{c.libelle}</dt>
              {c.ecart && <div className={cn("mt-0.5 text-xs font-semibold", c.ecart.bon ? "text-emerald-400" : "text-red-400")}>{c.ecart.texte}</div>}
            </div>
          ))}
        </dl>
      )}

      <nav aria-label={t("Sur cette page")} className="mt-4 flex flex-wrap gap-2">
        {sommaire.map(([ancre, libelle]) => (
          <a
            key={ancre}
            href={`#${ancre}`}
            className="inline-flex min-h-11 items-center rounded-lg border border-hairline bg-surface px-3 text-sm text-ink-secondary transition-colors hover:border-hairline-strong hover:text-ink sm:min-h-8"
          >
            {libelle}
          </a>
        ))}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-12">
          {/* Decklists, contenu principal. Six lignes avec leur prix là où une seule
              liste tenait dépliée ; les trois meilleures restent lisibles carte par
              carte juste dessous, repliées. */}
          <Section id="meilleurs-decks" title={`Meilleurs decks ${name}`} icon={<Layers size={20} />}>
            {deckCount > 0 && (
              <p className="mb-3 text-sm text-ink-secondary">
                {`${deckCount.toLocaleString("fr-FR")} decklist${deckCount > 1 ? "s" : ""} ${name} relevée${deckCount > 1 ? "s" : ""} en tournoi. Les meilleures d'abord : niveau du tournoi, puis classement du joueur.`}
              </p>
            )}
            {lignesDecks.length === 0 ? (
              <p className="rounded-lg border border-hairline bg-surface p-4 text-sm text-ink-secondary">
                {t("Pas encore de decklist classée pour cette Légende.")}
              </p>
            ) : (
              <>
                <div className="divide-y divide-hairline rounded-card border border-hairline bg-surface">
                  {lignesDecks.map(({ deck, prix, lienAchat, interdites }) => (
                    <div key={deck.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                      <span className={cn("inline-flex h-8 min-w-11 shrink-0 items-center justify-center rounded-lg px-2 text-sm font-bold tabular-nums", rangPlacement(deck.placement) === 1 ? "bg-gold text-canvas" : "bg-surface-raised text-ink")}>
                        {deck.placement ? afficherPlacement(deck.placement, langue) : "·"}
                      </span>
                      <div className="min-w-0 flex-1 basis-48">
                        <Link href={`/decks/${deck.slug}`} className="block truncate text-sm font-bold text-ink transition-colors hover:text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                          {deck.playerName ?? nomDeDeck(deck, legendName) ?? deck.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
                          <span className="truncate">{deck.tournamentContext}</span>
                          <PastilleInterdite cartes={interdites} className="max-w-[60%]" />
                        </div>
                      </div>
                      {prix > 0 && (
                        <div className="text-right">
                          <div className="text-xs text-ink-muted">{t("À partir de")}</div>
                          <div className="text-sm font-bold tabular-nums text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(prix)}</div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Link href={`/decks/${deck.slug}`} className="inline-flex min-h-11 items-center rounded-lg border border-hairline px-3 text-sm font-semibold text-ink-secondary transition-colors hover:bg-surface-raised hover:text-ink sm:min-h-9">
                          {t("Voir la liste")}
                        </Link>
                        {/* Un vrai lien écrit par le serveur. Rien sur une liste injouable :
                            on la signale, on ne la vend pas. */}
                        {lienAchat && prix > 0 && (
                          <a
                            href={lienAchat}
                            target="_blank"
                            rel="sponsored nofollow noopener"
                            aria-label={`${t("Acheter ce deck")} : ${deck.playerName ?? deck.title}`}
                            className="inline-flex min-h-11 items-center rounded-lg bg-gold px-3 text-sm font-bold text-canvas transition-colors hover:bg-gold-light sm:min-h-9"
                          >
                            {t("Acheter")}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Les trois meilleures listes, carte par carte. Repliées : elles
                    poussaient le guide et le noyau à quatre écrans du haut. */}
                <details className="group mt-3 rounded-card border border-hairline bg-surface">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-ink">
                    {decklists.length > 1 ? t("Les meilleures listes, carte par carte") : t("La meilleure liste, carte par carte")}
                    <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="space-y-6 px-3 pb-3">
                    {decklists.map(({ deck, cards, deckbuilderCode }) => (
                      <div key={deck.id}>
                        <div className="flex flex-wrap items-center gap-2 px-1 pb-2 text-sm font-semibold">
                          <span style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                            {nomDeDeck(deck, legendName) ?? deck.tournamentContext}
                          </span>
                          {deck.playerName && <span className="font-normal text-ink-muted">par {deck.playerName}</span>}
                          {deck.tournamentTier && (
                            <span className="rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-canvas">{deck.tournamentTier}</span>
                          )}
                          {deck.placement && (
                            <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">
                              {afficherPlacement(deck.placement, langue)}
                            </span>
                          )}
                        </div>
                        <DecklistInteractive
                          compact
                          cards={cards}
                          deckName={nomDeDeck(deck, legendName) ?? deck.title}
                          legendName={legendName}
                          playerName={deck.playerName ?? undefined}
                          context={deck.tournamentContext ?? undefined}
                          showCopyCode
                          showExportPng
                          deckbuilderCode={deckbuilderCode}
                        />
                        {encartAchat(deck, cards)}
                      </div>
                    ))}
                  </div>
                </details>
              </>
            )}
          </Section>

          {/* Comment jouer : prose humaine recopiée des fiches-articles, avec aperçu au survol */}
          {guideProse && (
            <Section id="comment-jouer" title={`Comment jouer ${name}`} icon={<Swords size={20} />}>
              <div className="max-w-3xl text-[15px] leading-7 text-ink-secondary">
                <MarkdownRenderer content={guideProse} />
              </div>
            </Section>
          )}

          {/* Noyau et cartes flex, comptés sur les seules listes du set en cours.
              Une fiche dont les cartes datent d'un ancien set les tait au lieu de
              les montrer comme celles du format en cours. */}
          {(fiche.keyCards?.length ?? 0) > 0 &&
            (setDesChiffres ? (
              <section>
                <h2
                  id="noyau"
                  className="flex scroll-mt-20 items-center gap-2 text-xl font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  <TrendingUp size={18} /> {t("Noyau et cartes flex")}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  {listesDuSet ? (
                    <>
                      {t("Compté sur")} {listesDuSet} {t("listes publiées en tournoi")} ({setDesChiffres}
                      {fiche.cartesDepuisBan ? `, ${t("depuis le dernier ban")}` : ""}).{" "}
                    </>
                  ) : null}
                  <Link href={listesHref()} className="text-arcane hover:underline">
                    {t("Voir ces listes")}
                  </Link>
                </p>
                {noyau.length > 0 && (
                  <>
                    <h3 className="mt-5 text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                      {t("Noyau")} <span className="font-normal text-ink-muted">{t("dans au moins 9 listes sur 10")}</span>
                    </h3>
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {noyau.map((kc, i) => tuileCarte(kc, i))}
                    </div>
                  </>
                )}
                {flex.length > 0 && (
                  <>
                    <h3 className="mt-6 text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                      {t("Cartes flex")}{" "}
                      <span className="font-normal text-ink-muted">{t("dans 3 à 9 listes sur 10, là où les listes diffèrent")}</span>
                    </h3>
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                      {flex.map((kc, i) => tuileCarte(kc, i, true))}
                    </div>
                  </>
                )}
              </section>
            ) : (
              <p className="rounded-lg border border-hairline bg-surface px-4 py-3 text-sm text-ink-secondary">
                {t("Trop peu de listes de cette Légende dans le set en cours pour montrer ses cartes.")}
              </p>
            ))}

          {((fiche.strengths?.length ?? 0) > 0 || (fiche.weaknesses?.length ?? 0) > 0) && (
            <section>
              <h2
                id="forces-faiblesses"
                className="scroll-mt-20 text-xl font-semibold text-arcane"
                style={{ fontFamily: "var(--font-rubik), sans-serif" }}
              >
                Forces &amp; faiblesses
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
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

          {/* Palmarès : les meilleures places relevées par la fiche, sur son set. */}
          {palmares.length > 0 && (
            <Section id="palmares" title={t("Palmarès")} icon={<Trophy size={20} />}>
              <ul className="divide-y divide-hairline overflow-hidden rounded-card border border-hairline bg-surface">
                {palmares.map((r, i) => (
                  <li key={i} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                    <span className="w-9 shrink-0 font-bold tabular-nums text-ink">{r.placement ? afficherPlacement(r.placement, langue) : ""}</span>
                    <span className="min-w-0 flex-1 text-ink-secondary">
                      {r.player && <strong className="text-ink">{r.player}</strong>}
                      {r.player && r.tournament ? ", " : ""}
                      {r.tournament}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Les listes suivantes en liens : chemin interne vers les pages deck, que Google
              n'atteint aujourd'hui que par le sitemap. Rendu dans l'ordre de tri déjà
              calculé (niveau de tournoi, puis classement). Placées après les cartes clés :
              une longue liste de liens entre le guide et le reste coupait la lecture. */}
          {otherDecks.length > 0 && (
            <Section id="autres-listes" title={`Autres listes ${name} en tournoi`} icon={<Layers size={20} />}>
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
                        {nomDeDeck(deck, legendName) ?? deck.tournamentContext}
                      </span>
                      {deck.playerName && (
                        <span className="text-ink-muted">par {deck.playerName}</span>
                      )}
                      {deck.placement && (
                        <span className="rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-ink-secondary">
                          {afficherPlacement(deck.placement, langue)}
                        </span>
                      )}
                      <PastilleInterdite cartes={cartesInterdites(deck.cards.map((dc) => dc.card.name))} className="max-w-[45%]" />
                      {deck.tournamentContext && nomDeDeck(deck, legendName) && (
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

          <div className="flex flex-wrap gap-3">
            <BoutonLien href={decksHref}>Voir tous les decks de {name}</BoutonLien>
            <BoutonLien href="/tier-list" variante="neutre">Tier List</BoutonLien>
            <BoutonLien href="/legendes" variante="neutre">
              {t("Toutes les Légendes")}
            </BoutonLien>
          </div>
        </div>

        {/* Ce qu'on consulte en lisant le reste : la capacité, les champions, les champs
            de bataille et l'achat de la liste de tête. Sur ordinateur la colonne suit
            la lecture ; la cellule s'étire sur toute la hauteur pour que le bloc
            collant ait où glisser. */}
        <aside aria-label={t("Capacité, champions et champs de bataille")}>
          <div className="grid gap-4 lg:sticky lg:top-22">
            {/* Capacité de la Légende : la carte, son texte de règles, puis l'explication.
                Le texte de la carte fait foi et reste en anglais, comme sur /cartes ; la
                phrase en dessous dit ce que ça change en partie. Sans carte en base,
                l'encart se réduit à l'explication. */}
            {(carteLegende || fiche.legendAbility) && (
              <section className="rounded-card border border-hairline bg-surface p-4">
                <h2
                  className="titre-bloc flex items-center gap-2 text-sm font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  <Sparkles size={16} /> {t("Capacité de la Légende")}
                </h2>
                <div className="mt-3 flex gap-3">
                  {carteLegende?.imageUrl && (
                    <Link href={`/cartes/${carteLegende.riftboundId}`} className="shrink-0 self-start">
                      <Image
                        src={carteLegende.imageUrl}
                        alt={name}
                        width={214}
                        height={300}
                        sizes="96px"
                        className="w-24 rounded-game-card bg-surface-raised transition-transform duration-200 hover:scale-[1.03]"
                        style={{ aspectRatio: "300 / 419" }}
                      />
                    </Link>
                  )}
                  <div className="min-w-0">
                    {carteLegende?.textPlain && (
                      <p className="text-sm leading-relaxed text-ink">
                        <CardTextRenderer text={carteLegende.textPlain} />
                      </p>
                    )}
                  </div>
                </div>
                {fiche.legendAbility && (
                  <p className={`text-sm leading-relaxed text-ink-secondary ${carteLegende?.textPlain ? "mt-3 border-t border-hairline pt-3" : "mt-1.5"}`}>
                    {fiche.legendAbility}
                  </p>
                )}
              </section>
            )}

            {/* Même règle que les cartes : rien d'un ancien set. */}
            {setDesChiffres && fiche.champions && Object.keys(fiche.champions).length > 0 && (
              <section className="rounded-card border border-hairline bg-surface">
                <h2
                  id="champions"
                  className="titre-bloc scroll-mt-20 border-b border-hairline px-4 py-3 text-sm font-semibold text-ink"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {t("Champions joués")}
                </h2>
                <div className="py-1">
                  {Object.entries(fiche.champions).map(([champName, info]) => (
                    <LigneTaux key={champName} nom={champName} part={info?.usage ?? null} sub={info?.role ?? null} banni={isBanned(cardArt[champName]?.name ?? champName)} />
                  ))}
                </div>
              </section>
            )}

            {setDesChiffres && (fiche.topBattlefields?.length ?? 0) > 0 && (
              <section className="rounded-card border border-hairline bg-surface">
                <h2
                  id="champs-de-bataille"
                  className="titre-bloc scroll-mt-20 border-b border-hairline px-4 py-3 text-sm font-semibold text-ink"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {t("Champs de bataille fréquents")}
                </h2>
                <div className="py-1">
                  {fiche.topBattlefields!.map((bf) => {
                    const nom = nomTerrain(bf);
                    // Le nom de la base d'abord : `isBanned` compare à l'exact, et le
                    // nom écrit dans la fiche peut porter une apostrophe droite là où
                    // la carte en a une courbe. Sans ça, un champ de bataille banni
                    // passerait sans étiquette, en silence.
                    return <LigneTaux key={bf} nom={nom} part={partTerrain(bf)} banni={isBanned(cardArt[nom]?.name ?? nom)} />;
                  })}
                </div>
              </section>
            )}

            {/* La liste de tête, à acheter sans quitter la fiche. */}
            {lignesDecks[0]?.lienAchat && lignesDecks[0].prix > 0 && (
              <div className="rounded-card border border-hairline bg-surface p-4">
                <div className="text-xs text-ink-muted">
                  {lignesDecks[0].deck.playerName ? `${t("La liste de")} ${lignesDecks[0].deck.playerName}, ` : ""}{t("À partir de").toLowerCase()}
                </div>
                <div className="text-xl font-bold leading-tight text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>{euros.format(lignesDecks[0].prix)}</div>
                <BoutonLien href={lignesDecks[0].lienAchat} target="_blank" rel="sponsored nofollow noopener" variante="achat" className="mt-3 w-full">{t("Acheter ce deck")}</BoutonLien>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
