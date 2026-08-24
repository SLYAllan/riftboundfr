// force-dynamic : la recherche lit la base de cartes à chaque requête.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "@/components/lien";
import { prisma, safeQuery } from "@/lib/prisma";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { ERRATA_2026_07 } from "@/lib/errata-2026-07";
import { BAN_ENTRIES } from "@/lib/bans";
import { CardTextRenderer } from "@/components/card-text-renderer";
import { RuleText } from "@/components/rule-text";
import { loadCoreRules, loadRuleChapters, pdfDesRegles, CORE_RULES_UPDATED, type CoreRule } from "@/lib/core-rules";
import { langueCourante, metaTraduite, tr } from "@/lib/i18n-server";
import { etiquetteLocale, type Langue } from "@/lib/i18n";

const metadata: Metadata = {
  title: { absolute: "Règles de Riftbound en français - le texte officiel, cherchable" },
  description:
    "Les règles officielles de Riftbound en français, en entier et cherchables : texte des règles de base, erratas, cartes interdites, mots-clés et texte des cartes.",
  alternates: { canonical: "/outils/regles" },
  openGraph: {
    type: "website",
    siteName: "Riftbound France",
    locale: "fr_FR",
    title: "Règles de Riftbound en français",
    description:
      "Le texte officiel des règles, en entier et cherchable, avec les erratas et les cartes interdites.",
    images: ["/img/og-default.png"],
  },
};

// Recherche insensible à la casse et aux accents : on tape « reserve », on trouve
// « Réserve ». Les joueurs écrivent rarement les accents dans une recherche.
function fold(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Raccourcis sous la barre : les questions qui reviennent le plus souvent.
// Ces mots sont cherchés DANS le texte des règles : ils doivent être écrits dans la
// langue du règlement affiché, sinon aucun ne rend de résultat sur la version anglaise.
const SUGGESTIONS: Record<Langue, string[]> = {
  fr: ["Réserve", "Amplifié", "Flux", "Bannir", "Épuiser", "Conquête", "Caché", "Mulligan"],
  en: ["Sideboard", "Amplified", "Flux", "Banish", "Exhaust", "Conquer", "Hidden", "Mulligan"],
};

// Une carte de résultat et un bloc de règle partagent la même géométrie : rayon
// extérieur 12, rembourrage 16, donc rayon intérieur 8 pour rester concentrique.
const CARD = "rounded-xl border border-hairline bg-surface p-4 shadow-[0_1px_2px_rgba(0,0,0,0.28)]";

export default async function ReglesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await tr();
  // Les règles existent dans les deux langues, avec la même numérotation. Sans ça,
  // un lecteur anglophone recevait le règlement français en entier.
  const langue = await langueCourante();
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const needle = fold(query);
  const hasQuery = needle.length >= 2;

  const allRules = await loadCoreRules(langue);

  const terms = hasQuery
    ? GLOSSARY_TERMS.filter(
        (t) =>
          fold(t.term).includes(needle) || fold(t.en).includes(needle) || fold(t.definition).includes(needle),
      )
    : [];

  const erratas = hasQuery
    ? ERRATA_2026_07.filter(
        (e) => fold(e.name).includes(needle) || fold(e.change).includes(needle) || fold(e.after).includes(needle),
      )
    : [];

  const rules = hasQuery
    ? allRules.filter((r) => fold(r.text).includes(needle) || fold(r.section).includes(needle))
    : [];

  const bans = hasQuery
    ? BAN_ENTRIES.filter((b) => fold(b.en).includes(needle) || fold(b.fr ?? "").includes(needle))
    : [];

  // Le texte des cartes est en anglais en base : on cherche sur le nom et sur le texte.
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
            select: { name: true, riftboundId: true, type: true, textPlain: true },
            orderBy: [{ set: "asc" }, { collectorNumber: "asc" }],
            take: 24,
          }),
        [],
      )
    : [];

  const seen = new Set<string>();
  const uniqueCards = cards.filter((c) => (seen.has(c.name) ? false : (seen.add(c.name), true)));

  const total = terms.length + erratas.length + bans.length + rules.length + uniqueCards.length;

  // Le règlement complet, groupé par section dans l'ordre du document.
  const chapters = hasQuery ? [] : await loadRuleChapters(langue);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        // « Outils » est un menu déroulant, pas une page : le fil d'Ariane pointait
        // vers /outils, qui répond 404. Le lien partait aussi dans le JSON-LD.
        items={[{ name: "Règles", href: "/outils/regles" }]}
        className="mb-6"
      />

      <header className="max-w-3xl">
        <h1 className="text-balance text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
          {t("Les règles de Riftbound, en français")}
        </h1>
        <p className="mt-3 text-pretty text-ink-secondary">
          {t("Le texte officiel en entier, tel que Riot le publie, plus les erratas, les cartes interdites et les mots-clés. Cherchez un terme pendant une partie, ou déroulez le règlement en entier.")}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          {t("Règles de base, mise à jour du")} {t(CORE_RULES_UPDATED)}.{" "}
          <a
            href={pdfDesRegles(langue)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-arcane underline-offset-2 transition-colors duration-150 hover:underline"
          >
            {t("Document original")}
          </a>
        </p>
      </header>

      <form action="/outils/regles" method="get" className="mt-7 max-w-2xl">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={t("Réserve, Amplifié, mulligan, Aspirant's Climb...")}
          aria-label={t("Chercher dans les règles")}
          className="h-12 w-full rounded-xl border border-hairline-strong bg-surface px-4 text-base text-ink shadow-[0_1px_2px_rgba(0,0,0,0.28)] outline-none transition-colors duration-150 placeholder:text-ink-muted/60 focus:border-arcane"
        />
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS[langue].map((s) => (
          <Link
            key={s}
            href={`/outils/regles?q=${encodeURIComponent(s)}`}
            className="inline-flex h-10 items-center rounded-full border border-hairline bg-surface px-3.5 text-xs font-semibold text-ink-secondary transition-[color,border-color,background-color,scale] duration-150 hover:border-hairline-accent hover:text-ink active:scale-[0.96]"
          >
            {s}
          </Link>
        ))}
        {hasQuery && (
          <Link
            href="/outils/regles"
            className="inline-flex h-10 items-center rounded-full px-3.5 text-xs font-semibold text-ink-muted transition-[color,scale] duration-150 hover:text-ink active:scale-[0.96]"
          >
            Tout afficher
          </Link>
        )}
      </div>

      {hasQuery ? (
        <div className="mt-8">
          <p className="text-sm text-ink-muted">
            {total === 0
              ? `Rien pour « ${query} ». Essayez le nom anglais de la carte, ou un mot du texte.`
              : `${total} résultat${total > 1 ? "s" : ""} pour « ${query} »`}
          </p>

          {bans.length > 0 && (
            <Section title={t("Interdit en tournoi")} tone="text-error">
              {bans.map((b) => (
                <div key={b.en} className={`${CARD} border-error/30`}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{b.en}</span>
                    {b.fr && <span className="text-sm text-ink-secondary">{b.fr}</span>}
                    <span className="text-xs text-ink-muted">{b.type}</span>
                  </div>
                  <p className="mt-1 text-pretty text-sm text-ink-secondary">
                    Interdite depuis le {b.date}. Jouable en draft et en scellé, pas en construit.
                  </p>
                  {b.source.startsWith("http") && (
                    <a
                      href={b.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-arcane underline-offset-2 transition-colors duration-150 hover:underline"
                    >
                      Annonce officielle
                    </a>
                  )}
                </div>
              ))}
            </Section>
          )}

          {erratas.length > 0 && (
            <Section title={t("Texte corrigé par un errata")} tone="text-gold">
              {erratas.map((e) => (
                <div key={e.name} className={CARD}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{e.name}</span>
                    <span className="text-xs text-ink-muted">{e.set}</span>
                  </div>
                  <p className="mt-2 text-pretty text-sm text-ink-secondary">{e.change}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-hairline bg-surface-raised p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Avant</div>
                      <div className="mt-1 text-sm text-ink-secondary line-through decoration-ink-muted/40">
                        <CardTextRenderer text={e.before} />
                      </div>
                    </div>
                    <div className="rounded-lg border border-hairline bg-surface-raised p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">{t("Après")}</div>
                      <div className="mt-1 text-sm text-ink">
                        <CardTextRenderer text={e.after} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Section>
          )}

          {rules.length > 0 && (
            <Section title={`Règles officielles (${rules.length})`} tone="text-ink">
              {rules.slice(0, 60).map((r) => (
                <RuleRow key={r.id} rule={r} />
              ))}
              {rules.length > 60 && (
                <p className="text-sm text-ink-muted">
                  {rules.length - 60} autres règles contiennent ce mot. Affinez la recherche, ou
                  parcourez le règlement complet.
                </p>
              )}
            </Section>
          )}

          {terms.length > 0 && (
            <Section title={t("Termes et mots-clés")} tone="text-arcane">
              {terms.map((t) => (
                <div key={t.term} className={CARD}>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold text-ink">{t.term}</span>
                    {t.en && <span className="text-sm text-ink-muted">{t.en}</span>}
                    <span className="text-xs text-ink-muted">{t.subcategory ?? t.category}</span>
                  </div>
                  <p className="mt-1 text-pretty text-sm text-ink-secondary">{t.definition}</p>
                </div>
              ))}
            </Section>
          )}

          {uniqueCards.length > 0 && (
            <Section title="Cartes" tone="text-ink">
              <div className="grid gap-2 sm:grid-cols-2">
                {uniqueCards.map((c) => (
                  <Link
                    key={c.riftboundId}
                    href={`/cartes/${c.riftboundId}`}
                    className={`${CARD} block transition-[border-color,scale] duration-150 hover:border-hairline-accent active:scale-[0.99]`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="font-semibold text-ink">{c.name}</span>
                      <span className="text-xs text-ink-muted">{c.type}</span>
                    </div>
                    {c.textPlain && (
                      <div className="mt-1 text-pretty text-sm text-ink-secondary">
                        <CardTextRenderer text={c.textPlain} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
      ) : (
        <div className="mt-10 gap-10 lg:flex lg:items-start">
          {/* Sommaire, collé en haut sur grand écran */}
          <nav
            aria-label={t("Sommaire des règles")}
            className="mb-8 shrink-0 lg:sticky lg:top-20 lg:mb-0 lg:max-h-[calc(100dvh-6rem)] lg:w-64 lg:overflow-y-auto lg:pr-2 thin-scrollbar"
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{t("Sommaire")}</p>
            <ul className="mt-2 space-y-px">
              {chapters.map((c) => (
                <li key={c.anchor}>
                  <a
                    href={`#${c.anchor}`}
                    className="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-sm text-ink-secondary transition-colors duration-150 hover:bg-surface hover:text-ink"
                  >
                    <span className="text-pretty">{c.title}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-ink-muted">{c.rules.length}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-muted">
              {allRules.length.toLocaleString(etiquetteLocale(langue))}{" "}
              {t("règles, dans l’ordre du document officiel. Le numéro à gauche est celui qu’un arbitre vous demandera, et les termes du glossaire sont cliquables.")}
            </p>
            {chapters.map((c) => (
              <section key={c.anchor} id={c.anchor} className="mt-8 scroll-mt-24">
                <h2
                  className="text-balance border-b border-hairline pb-2 text-lg font-semibold text-arcane"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {c.title}
                </h2>
                {/* Les styles sont portés par la liste, pas répétés sur deux mille
                    lignes : la page pesait un tiers de plus rien qu'en attributs. */}
                <dl className="mt-3 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-3 text-sm leading-relaxed [&>dd]:text-pretty [&>dd]:text-ink-secondary [&>dt]:font-mono [&>dt]:text-xs [&>dt]:tabular-nums [&>dt]:text-ink-muted">
                  {(() => {
                    // Un compteur par chapitre : un terme est relié à sa première
                    // apparition, pas aux cent suivantes.
                    const seen = new Set<string>();
                    return c.rules.map((r) => (
                      <Fragment key={r.id}>
                        <dt>{r.id}</dt>
                        <dd>
                          <RuleText text={r.text} seen={seen} />
                        </dd>
                      </Fragment>
                    ));
                  })()}
                </dl>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, tone, children }: { title: string; tone: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className={`text-balance text-lg font-semibold ${tone}`} style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

// Dans les résultats de recherche, les termes du glossaire sont cliquables : peu de
// règles, et c'est là que le lien sert. Le règlement complet reste en texte brut.
function RuleRow({ rule }: { rule: CoreRule }) {
  return (
    <div className={CARD}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {rule.section && <span className="text-sm font-semibold text-ink">{rule.section}</span>}
        <span className="font-mono text-[11px] tabular-nums text-ink-muted">{rule.id}</span>
      </div>
      <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-secondary">
        <RuleText text={rule.text} />
      </p>
    </div>
  );
}

export const generateMetadata = () => metaTraduite(metadata);
