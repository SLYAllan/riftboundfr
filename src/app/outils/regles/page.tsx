// force-dynamic : la recherche lit la base de cartes à chaque requête.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { prisma, safeQuery } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { ERRATA_2026_07 } from "@/lib/errata-2026-07";
import { BAN_ENTRIES } from "@/lib/bans";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { loadCoreRules, CORE_RULES_PDF, CORE_RULES_UPDATED } from "@/lib/core-rules";

export const metadata: Metadata = {
  title: { absolute: "Chercher une règle Riftbound - termes, erratas et cartes" },
  description:
    "Une seule recherche pour retrouver un terme de règle, un errata, une carte interdite ou le texte exact d'une carte Riftbound, en français.",
  alternates: { canonical: "/outils/regles" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Chercher une règle Riftbound",
    description:
      "Termes de règle, erratas, cartes interdites et texte des cartes, dans une seule recherche.",
    images: ["/img/og-default.png"],
  },
};

// Recherche insensible à la casse et aux accents : on tape « reserve », on trouve
// « Réserve ». Les joueurs écrivent rarement les accents dans une recherche.
function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Raccourcis proposés sous la barre : les questions qui reviennent le plus souvent.
const SUGGESTIONS = [
  "Réserve",
  "Contrer",
  "Amplifié",
  "Flux",
  "Bannir",
  "Épuiser",
  "Conquête",
  "Caché",
  "Defy",
  "Aspirant's Climb",
];

export default async function ReglesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const needle = fold(query);
  const hasQuery = needle.length >= 2;

  const terms = hasQuery
    ? GLOSSARY_TERMS.filter(
        (t) =>
          fold(t.term).includes(needle) ||
          fold(t.en).includes(needle) ||
          fold(t.definition).includes(needle),
      )
    : [];

  const erratas = hasQuery
    ? ERRATA_2026_07.filter(
        (e) =>
          fold(e.name).includes(needle) ||
          fold(e.change).includes(needle) ||
          fold(e.after).includes(needle),
      )
    : [];

  const allRules = await loadCoreRules();
  const rules = hasQuery
    ? allRules.filter((r) => fold(r.text).includes(needle) || fold(r.section).includes(needle)).slice(0, 30)
    : [];

  const bans = hasQuery
    ? BAN_ENTRIES.filter(
        (b) => fold(b.en).includes(needle) || fold(b.fr ?? "").includes(needle),
      )
    : [];

  // Le texte des cartes est en anglais en base : on cherche sur le nom et sur le
  // texte, la recherche insensible à la casse est faite par Postgres.
  const cards = hasQuery
    ? await safeQuery(
        () =>
          prisma.card.findMany({
            where: {
              alternateArt: false,
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { textPlain: { contains: query, mode: "insensitive" } },
              ],
            },
            select: { name: true, riftboundId: true, type: true, textPlain: true, imageUrl: true },
            orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
            take: 24,
          }),
        [],
      )
    : [];

  // Une carte peut exister en plusieurs impressions : une ligne par nom suffit.
  const seen = new Set<string>();
  const uniqueCards = cards.filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)));

  const total = terms.length + erratas.length + bans.length + rules.length + uniqueCards.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[{ name: "Outils", href: "/outils" }, { name: "Chercher une règle", href: "/outils/regles" }]}
        className="mb-6"
      />

      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        Chercher une règle
      </h1>
      <p className="mt-2 max-w-3xl text-ink-secondary">
        Une question en pleine partie, un mot-clé dont vous n&apos;êtes plus sûr, une carte
        dont le texte a changé. Tapez un terme, un mot-clé ou un nom de carte : la recherche
        passe sur les termes de règle, les erratas officiels, les cartes interdites et le
        texte exact des cartes.
      </p>

      <form action="/outils/regles" method="get" className="mt-6">
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Réserve, Amplifié, Defy, Aspirant's Climb..."
          aria-label="Chercher une règle, un mot-clé ou une carte"
          className="h-12 w-full rounded-xl border border-hairline-strong bg-surface px-4 text-base text-ink placeholder:text-ink-muted/60 focus:border-arcane"
        />
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Link
            key={s}
            href={`/outils/regles?q=${encodeURIComponent(s)}`}
            className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-semibold text-ink-secondary hover:text-ink hover:border-hairline-accent transition-colors"
          >
            {s}
          </Link>
        ))}
      </div>

      {hasQuery && (
        <p className="mt-6 text-sm text-ink-muted">
          {total === 0
            ? `Rien pour « ${query} ». Essayez le nom anglais de la carte, ou un mot du texte.`
            : `${total} résultat${total > 1 ? "s" : ""} pour « ${query} »`}
        </p>
      )}

      {bans.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-error" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Interdit en tournoi
          </h2>
          <div className="mt-3 space-y-2">
            {bans.map((b) => (
              <div key={b.en} className="rounded-xl border border-error/30 bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink">{b.en}</span>
                  {b.fr && <span className="text-sm text-ink-secondary">{b.fr}</span>}
                  <span className="text-xs text-ink-muted">{b.type}</span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">
                  Interdite depuis le {b.date}. Jouable en draft et en scellé, pas en construit.
                </p>
                {b.source.startsWith("http") && (
                  <a href={b.source} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-arcane hover:underline">
                    Annonce officielle
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {erratas.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Texte corrigé par un errata
          </h2>
          <div className="mt-3 space-y-3">
            {erratas.map((e) => (
              <div key={e.name} className="rounded-xl border border-hairline bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink">{e.name}</span>
                  <span className="text-xs text-ink-muted">{e.set}</span>
                </div>
                <p className="mt-2 text-sm text-ink-secondary">{e.change}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-hairline bg-surface-raised p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Avant</div>
                    <div className="mt-1 text-sm text-ink-secondary line-through decoration-ink-muted/40">
                      <CardTextRenderer text={e.before} />
                    </div>
                  </div>
                  <div className="rounded-lg border border-hairline bg-surface-raised p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Après</div>
                    <div className="mt-1 text-sm text-ink">
                      <CardTextRenderer text={e.after} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {rules.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Règles officielles
          </h2>
          <p className="mt-1 text-xs text-ink-muted">
            Texte français des règles de base, mise à jour du {CORE_RULES_UPDATED}.{" "}
            <a href={CORE_RULES_PDF} target="_blank" rel="noopener noreferrer" className="text-arcane hover:underline">
              Document complet
            </a>
          </p>
          <div className="mt-3 space-y-2">
            {rules.map((r) => (
              <div key={r.id} className="rounded-xl border border-hairline bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  {r.section && <span className="text-sm font-semibold text-ink">{r.section}</span>}
                  <span className="font-mono text-[11px] text-ink-muted">{r.id}</span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {terms.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-arcane" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Termes et mots-clés
          </h2>
          <div className="mt-3 space-y-2">
            {terms.map((t) => (
              <div key={t.term} className="rounded-xl border border-hairline bg-surface p-4">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink">{t.term}</span>
                  {t.en && <span className="text-sm text-ink-muted">{t.en}</span>}
                  <span className="text-xs text-ink-muted">{t.subcategory ?? t.category}</span>
                </div>
                <p className="mt-1 text-sm text-ink-secondary">{t.definition}</p>
              </div>
            ))}
          </div>
          <Link href="/guides/glossaire" className="mt-3 inline-block text-sm text-arcane hover:underline">
            Voir tout le glossaire
          </Link>
        </section>
      )}

      {uniqueCards.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Cartes
          </h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {uniqueCards.map((c) => (
              <Link
                key={c.riftboundId}
                href={`/cartes/${c.riftboundId}`}
                className="rounded-xl border border-hairline bg-surface p-4 hover:border-hairline-accent transition-colors"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold text-ink">{c.name}</span>
                  <span className="text-xs text-ink-muted">{c.type}</span>
                </div>
                {c.textPlain && (
                  <div className="mt-1 text-sm text-ink-secondary">
                    <CardTextRenderer text={c.textPlain} />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!hasQuery && (
        <div className="mt-10 rounded-xl border border-hairline bg-surface p-6 text-sm text-ink-secondary">
          <p className="font-semibold text-ink">Ce que la recherche couvre</p>
          <ul className="mt-2 space-y-1">
            <li>Les {allRules.length} règles du document officiel français, mise à jour du {CORE_RULES_UPDATED}.</li>
            <li>Les {GLOSSARY_TERMS.length} termes et mots-clés du glossaire, avec leur nom anglais.</li>
            <li>Les {ERRATA_2026_07.length} erratas officiels, avec le texte avant et après.</li>
            <li>Les {BAN_ENTRIES.length} cartes interdites en construit, avec leur date.</li>
            <li>Le texte de toutes les cartes, pour retrouver celles qui parlent d&apos;un mot-clé.</li>
          </ul>
          <p className="mt-3">
            Le texte des cartes reste en anglais, c&apos;est la seule version officielle à ce
            jour : cherchez « Defy » plutôt que « Contrer » pour tomber sur les cartes.
          </p>
        </div>
      )}
    </div>
  );
}
