// ISR : les fiches viennent du système de fichiers (dispo au build), mais la
// résolution des codes cartes (UNL-059 -> nom réel) interroge la DB, indispo au
// build Docker. On rend en ISR + try/catch : si la DB manque, on affiche le code
// brut, et la revalidation résoudra le vrai nom au premier rendu en prod.
export const revalidate = 3600;

import { promises as fs } from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Sparkles, AlertTriangle, Swords, Video } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CardRef } from "@/components/card-ref";
import { DOMAIN_COLORS, DOMAIN_LABELS_FR, DOMAIN_ICONS } from "@/lib/domains";
import { displayLegendName } from "@/lib/utils";

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
interface VodInsights {
  source?: string;
  matchups?: string[] | string;
  techCards?: string[] | string;
  note?: string;
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
  matchups?: { favorable?: string[]; unfavorable?: string[]; even?: string[] };
  competitiveResults?: Record<string, unknown>;
  difficulty?: string;
  tipsBeginners?: string[];
  tipsAdvanced?: string[];
  sourceUrl?: string;
  vodInsights?: VodInsights;
}

async function listSlugs(): Promise<string[]> {
  const files = await fs.readdir(FICHES_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
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

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.map((slug) => ({ slug }));
}

const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 (haut du méta)",
  2: "Tier 2 (solide)",
  3: "Tier 3 (jouable)",
  4: "Tier 4 (de niche)",
};

const RESULT_LABELS: Record<string, string> = {
  tier: "Tier",
  preRegionals: "Avant les Régionaux",
  regionalResults: "Résultats en Régional",
  cityChallengWins: "Victoires City Challenge",
  sydneyWinRate: "Winrate à Sydney",
  sydneyConversionRate: "Taux de conversion à Sydney",
  sydneyStats: "Statistiques Sydney",
  winRate: "Winrate",
  matches: "Matchs",
  bestPlacement: "Meilleur placement",
  bestPlacements: "Meilleurs placements",
  placement: "Placement",
  player: "Joueur",
  tournament: "Tournoi",
};

function labelFor(key: string): string {
  return RESULT_LABELS[key] ?? key;
}

function renderValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((v) =>
        v && typeof v === "object"
          ? Object.values(v as Record<string, unknown>).filter(Boolean).join(", ")
          : String(v),
      )
      .join(" · ");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${labelFor(k)} : ${renderValue(v)}`)
      .join(" · ");
  }
  return String(value);
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
  const title = `${name} : guide & analyse VOD${setPart}`;
  const archetype = fiche.archetype ? `${fiche.archetype}. ` : "";
  const description =
    `${name} à Riftbound : ${archetype}plan de jeu, cartes clés, forces, faiblesses et analyse VOD (matchups et tech).`.slice(
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

  // Résolution des codes cartes -> noms réels. Les keyCards portent parfois un code
  // (UNL-059) dans `name`, parfois le vrai nom. On collecte tous les codes et on
  // interroge la DB une seule fois. try/catch : la page reste rendue même sans DB.
  const codes = new Set<string>();
  for (const kc of fiche.keyCards ?? []) {
    if (kc.id && CODE_RE.test(kc.id)) codes.add(kc.id);
    else if (kc.name && CODE_RE.test(kc.name)) codes.add(kc.name);
  }
  const cardMap: Record<string, string> = {};
  if (codes.size > 0) {
    try {
      const cards = await prisma.card.findMany({
        where: { riftboundId: { in: [...codes] } },
        select: { riftboundId: true, name: true },
      });
      for (const c of cards) cardMap[c.riftboundId] = c.name;
    } catch {
      /* DB indispo (build Docker) : on affichera les codes bruts, l'ISR résoudra ensuite. */
    }
  }

  const domains = fiche.domains ?? [];
  const tierLabel = fiche.tier ? TIER_LABELS[fiche.tier] ?? `Tier ${fiche.tier}` : null;
  const gp = fiche.gameplan ?? {};
  const vod = fiche.vodInsights;
  const vodMatchups = Array.isArray(vod?.matchups)
    ? vod!.matchups
    : vod?.matchups
      ? [vod.matchups]
      : [];
  const vodTech = Array.isArray(vod?.techCards) ? vod!.techCards : vod?.techCards ? [vod.techCards] : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${name} : guide et analyse VOD à Riftbound`,
    description: fiche.archetype ?? `Guide de la Légende ${name} à Riftbound.`,
    inLanguage: "fr",
    about: "Riftbound",
    author: { "@type": "Person", name: "Allan", url: "https://twitter.com/solary_allan" },
    publisher: { "@type": "Organization", name: "Riftbound France", url: "https://riftboundfrance.fr" },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
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

      <header>
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
          {fiche.set && <span className="rounded bg-violet/15 px-2 py-0.5 font-semibold text-violet">{fiche.set}</span>}
          {fiche.difficulty && <span className="text-ink-muted">Difficulté : {fiche.difficulty}</span>}
        </div>
        <h1 className="mt-3 text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {name}
        </h1>
        {fiche.archetype && <p className="mt-2 text-lg text-ink-secondary">{fiche.archetype}</p>}
      </header>

      <div className="mt-10 space-y-12">
        {fiche.legendAbility && (
          <Section title="Capacité de la Légende" icon={<Sparkles size={20} />}>
            <p className="text-sm leading-relaxed text-ink-secondary">{fiche.legendAbility}</p>
          </Section>
        )}

        {(gp.earlyGame || gp.midGame || gp.lateGame || gp.winCondition) && (
          <Section title="Plan de jeu" icon={<Swords size={20} />}>
            <div className="space-y-2">
              {gp.earlyGame && (
                <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
                  <strong className="text-ink">Début de partie : </strong>
                  {gp.earlyGame}
                </div>
              )}
              {gp.midGame && (
                <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
                  <strong className="text-ink">Milieu de partie : </strong>
                  {gp.midGame}
                </div>
              )}
              {gp.lateGame && (
                <div className="rounded-lg border border-hairline bg-surface p-3 text-sm text-ink-secondary">
                  <strong className="text-ink">Fin de partie : </strong>
                  {gp.lateGame}
                </div>
              )}
              {gp.winCondition && (
                <div className="rounded-lg border-2 border-gold/20 bg-gold-glow p-3 text-sm text-gold">
                  <strong>Condition de victoire : </strong>
                  {gp.winCondition}
                </div>
              )}
            </div>
          </Section>
        )}

        {(fiche.keyCards?.length ?? 0) > 0 && (
          <Section title="Cartes clés" icon={<TrendingUp size={20} />}>
            <div className="space-y-2">
              {fiche.keyCards!.map((kc, i) => {
                const code = kc.id && CODE_RE.test(kc.id) ? kc.id : kc.name && CODE_RE.test(kc.name) ? kc.name : null;
                const resolved = code ? cardMap[code] : null;
                const nameIsCode = !!kc.name && CODE_RE.test(kc.name);
                // Vrai nom à afficher : résolu en priorité, sinon le name de la fiche s'il
                // n'est pas un code, sinon le code brut (non résolu, affiché tel quel).
                const display = resolved ?? kc.name ?? code ?? "";
                const wrapName = resolved ?? (!nameIsCode ? kc.name : null);
                return (
                  <div key={i} className="rounded-lg border border-hairline bg-surface p-3">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
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
          </Section>
        )}

        {fiche.champions && Object.keys(fiche.champions).length > 0 && (
          <Section title="Champions joués">
            <div className="space-y-2">
              {Object.entries(fiche.champions).map(([champName, info]) => (
                <div key={champName} className="rounded-lg border border-hairline bg-surface p-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
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
          </Section>
        )}

        {(fiche.topBattlefields?.length ?? 0) > 0 && (
          <Section title="Champs de bataille fréquents">
            <div className="flex flex-wrap gap-2">
              {fiche.topBattlefields!.map((bf) => (
                <span key={bf} className="rounded-full bg-surface-raised px-3 py-1 text-xs text-ink-secondary">
                  {bf}
                </span>
              ))}
            </div>
          </Section>
        )}

        {((fiche.strengths?.length ?? 0) > 0 || (fiche.weaknesses?.length ?? 0) > 0) && (
          <Section title="Forces & faiblesses">
            <div className="grid gap-4 sm:grid-cols-2">
              {(fiche.strengths?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-hairline bg-surface p-4">
                  <h3 className="text-sm font-semibold text-emerald-500" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
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
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-red-400" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
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
          </Section>
        )}

        {fiche.matchups && (fiche.matchups.favorable || fiche.matchups.unfavorable || fiche.matchups.even) && (
          <Section title="Matchups">
            <div className="grid gap-2 sm:grid-cols-3">
              {(["favorable", "even", "unfavorable"] as const).map((k) => {
                const list = fiche.matchups?.[k];
                if (!list || list.length === 0) return null;
                const label = k === "favorable" ? "Favorables" : k === "even" ? "Équilibrés" : "Défavorables";
                const color = k === "favorable" ? "text-emerald-500" : k === "even" ? "text-ink-secondary" : "text-red-400";
                return (
                  <div key={k} className="rounded-lg border border-hairline bg-surface p-3">
                    <h3 className={`text-xs font-semibold uppercase tracking-wider ${color}`}>{label}</h3>
                    <ul className="mt-1.5 space-y-1 text-sm text-ink-secondary">
                      {list.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {((fiche.tipsBeginners?.length ?? 0) > 0 || (fiche.tipsAdvanced?.length ?? 0) > 0) && (
          <Section title="Conseils de pilotage">
            <div className="space-y-3">
              {(fiche.tipsBeginners?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    Débutants
                  </h3>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-secondary">
                    {fiche.tipsBeginners!.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {(fiche.tipsAdvanced?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    Avancés
                  </h3>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-secondary">
                    {fiche.tipsAdvanced!.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>
        )}

        {fiche.competitiveResults && Object.keys(fiche.competitiveResults).length > 0 && (
          <Section title="Résultats compétitifs">
            <dl className="space-y-1.5 rounded-lg border border-hairline bg-surface p-4 text-sm">
              {Object.entries(fiche.competitiveResults).map(([k, v]) => {
                const rendered = renderValue(v);
                if (!rendered) return null;
                return (
                  <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
                    <dt className="font-semibold text-ink-secondary sm:w-48 sm:shrink-0">{labelFor(k)}</dt>
                    <dd className="text-ink-muted">{rendered}</dd>
                  </div>
                );
              })}
            </dl>
          </Section>
        )}

        {vod && (vodMatchups.length > 0 || vodTech.length > 0 || vod.note) && (
          <Section title="Analyse VOD" icon={<Video size={20} />}>
            <div className="rounded-xl border-2 border-arcane/20 bg-arcane/5 p-4">
              <p className="text-xs text-ink-muted">
                Synthèse tirée des casts compétitifs (cf. analyses vidéo internes). Avis des commentateurs.
              </p>
              {vodMatchups.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    Matchups & lecture du méta
                  </h3>
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-ink-secondary">
                    {vodMatchups.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
              {vodTech.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-sm font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
                    Cartes tech
                  </h3>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {vodTech.map((t, i) => (
                      <span key={i} className="rounded-full bg-surface px-3 py-1 text-xs text-ink-secondary">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {vod.note && (
                <p className="mt-3 rounded-lg bg-surface-raised p-3 text-xs text-ink-secondary">{vod.note}</p>
              )}
            </div>
          </Section>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/decks?legend=${encodeURIComponent(fiche.legendName ?? name)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Voir les decklists
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
