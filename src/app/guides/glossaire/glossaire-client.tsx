"use client";

import { useState, useRef, useCallback, useMemo, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import type { GlossaryCategory, GlossaryTerm } from "@/lib/glossary";

interface CardInfo {
  name: string;
  imageUrl: string | null;
  type: string;
  energy: number | null;
  might: number | null;
  rarity: string;
}

interface GlossaireClientProps {
  terms: GlossaryTerm[];
  cardByKeyword: Record<string, CardInfo>;
}

/* ── Helpers ── */

const ALL_CATEGORIES: GlossaryCategory[] = [
  "Mécaniques",
  "Types de cartes",
  "Phases de jeu",
  "Zones de jeu",
  "Actions",
  "Timing",
  "Ressources",
  "Formats & Règles",
];

const CATEGORY_COLORS: Record<GlossaryCategory, string> = {
  "Mécaniques": "bg-surface-raised text-violet-light",
  "Types de cartes": "bg-surface-raised text-arcane-light",
  "Phases de jeu": "bg-surface-raised text-gold-light",
  "Zones de jeu": "bg-surface-raised text-domain-calm",
  "Actions": "bg-surface-raised text-domain-fury",
  "Timing": "bg-surface-raised text-domain-chaos",
  "Ressources": "bg-surface-raised text-domain-body",
  "Formats & Règles": "bg-surface-raised text-ink-secondary",
};

const CATEGORY_ACTIVE: Record<GlossaryCategory, string> = {
  "Mécaniques": "bg-violet-dark text-white",
  "Types de cartes": "bg-arcane text-canvas",
  "Phases de jeu": "bg-gold text-canvas",
  "Zones de jeu": "bg-domain-calm text-canvas",
  "Actions": "bg-domain-fury text-canvas",
  "Timing": "bg-violet-dark text-white",
  "Ressources": "bg-domain-body text-canvas",
  "Formats & Règles": "bg-ink-muted text-canvas",
};

function slugify(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/* ── Card tooltip component ── */

function CardTooltip({ item, card }: { item: GlossaryTerm; card?: CardInfo }) {
  const [hovered, setHovered] = useState(false);
  const [tooltip, setTooltip] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // Mesure la taille réelle du tooltip puis le place à droite du terme (ou à
  // gauche faute de place), borné dans le viewport. Jamais hors écran.
  useLayoutEffect(() => {
    if (!hovered || !ref.current || !popRef.current || !card?.imageUrl) return;
    const rect = ref.current.getBoundingClientRect();
    const pop = popRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = pop.width;
    const h = pop.height;
    let left = vw - rect.right > w + 20 ? rect.right + 12 : rect.left - w - 12;
    left = Math.max(8, Math.min(left, vw - w - 8));
    const top = Math.max(8, Math.min(rect.top - 40, vh - h - 8));
    setTooltip({ top, left });
  }, [hovered, card]);

  if (!card) return null;

  return (
    <div
      ref={ref}
      className="mt-2 flex items-center gap-2 text-xs text-ink-muted cursor-help"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTooltip(null); }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-arcane" />
      Ex&nbsp;: <span className="text-arcane">{card.name}</span>
      <span className="text-ink-muted">({card.type})</span>
      {hovered && card.imageUrl && (
        <div
          ref={popRef}
          className="hidden md:block fixed z-50 pointer-events-none"
          style={{ top: tooltip?.top ?? 0, left: tooltip?.left ?? 0, opacity: tooltip ? 1 : 0 }}
        >
          <div className="rounded-card border border-hairline bg-surface p-2 shadow-xl">
            <Image
              src={card.imageUrl}
              alt={card.name}
              width={280}
              height={392}
              className="rounded-game-card"
            />
            <div className="mt-2 text-center text-sm text-ink-secondary font-medium">{card.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Single term card ── */

function TermCard({
  item,
  card,
  onNavigate,
}: {
  item: GlossaryTerm;
  card?: CardInfo;
  onNavigate: (term: string) => void;
}) {
  const slug = slugify(item.term);
  const isMechanic = item.category === "Mécaniques" || item.category === "Timing" || item.category === "Actions";

  return (
    <div
      id={slug}
      className="group rounded-lg border border-hairline bg-surface p-4 scroll-mt-32 transition-colors duration-150 hover:border-hairline-strong hover:bg-surface-raised"
    >
      <div className="flex flex-wrap items-center gap-2">
        <dt
          className={`font-semibold ${isMechanic ? "text-arcane" : "text-gold"}`}
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          {item.term}
          {item.en && item.en !== item.term && (
            <span className="ml-1.5 text-xs font-normal text-ink-muted">({item.en})</span>
          )}
        </dt>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[item.category]}`}
        >
          {item.category}
        </span>
        {item.subcategory && (
          <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] text-ink-muted">
            {item.subcategory}
          </span>
        )}
      </div>
      <dd className="mt-1.5 text-sm leading-relaxed text-ink-secondary">{item.definition}</dd>
      <CardTooltip item={item} card={card} />
      {item.related && item.related.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-ink-muted">Voir aussi&nbsp;:</span>
          {item.related.map((rel) => (
            <button
              key={rel}
              onClick={() => onNavigate(rel)}
              className="rounded-md bg-surface-raised px-1.5 py-1 text-arcane transition-colors hover:bg-arcane/15 hover:text-arcane-light"
            >
              {rel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main client component ── */

export function GlossaireClient({ terms, cardByKeyword }: GlossaireClientProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GlossaryCategory | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Handle hash on mount
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
        el.classList.add("ring-2", "ring-arcane", "ring-offset-2", "ring-offset-canvas");
        setTimeout(() => el.classList.remove("ring-2", "ring-arcane", "ring-offset-2", "ring-offset-canvas"), 3000);
      }
    }
  }, []);

  // Filter terms
  const filteredTerms = useMemo(() => {
    const q = normalize(search.trim());
    return terms.filter((t) => {
      if (activeCategory && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        normalize(t.term).includes(q) ||
        normalize(t.en).includes(q) ||
        normalize(t.definition).includes(q) ||
        (t.subcategory && normalize(t.subcategory).includes(q))
      );
    });
  }, [terms, search, activeCategory]);

  // Group by first letter
  const letterGroups = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    const sorted = [...filteredTerms].sort((a, b) =>
      a.term.localeCompare(b.term, "fr", { sensitivity: "base" })
    );
    for (const t of sorted) {
      const first = t.term[0]
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toUpperCase();
      if (!groups[first]) groups[first] = [];
      groups[first].push(t);
    }
    return groups;
  }, [filteredTerms]);

  const letters = Object.keys(letterGroups).sort((a, b) => a.localeCompare(b, "fr"));

  // All possible first letters for the alphabet bar
  const allLetters = useMemo(() => {
    const set = new Set<string>();
    for (const t of terms) {
      set.add(
        t.term[0]
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toUpperCase()
      );
    }
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, [terms]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const q = normalize(search.trim());
    const counts: Record<string, number> = {};
    for (const cat of ALL_CATEGORIES) {
      counts[cat] = terms.filter((t) => {
        if (t.category !== cat) return false;
        if (!q) return true;
        return (
          normalize(t.term).includes(q) ||
          normalize(t.en).includes(q) ||
          normalize(t.definition).includes(q) ||
          (t.subcategory && normalize(t.subcategory).includes(q))
        );
      }).length;
    }
    return counts;
  }, [terms, search]);

  const navigateToTerm = useCallback((termName: string) => {
    const slug = slugify(termName);
    // Clear filters to ensure the term is visible
    setSearch("");
    setActiveCategory(null);
    // Use a short delay so the DOM re-renders with all terms visible
    setTimeout(() => {
      const el = document.getElementById(slug);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-arcane", "ring-offset-2", "ring-offset-canvas");
        setTimeout(() => el.classList.remove("ring-2", "ring-arcane", "ring-offset-2", "ring-offset-canvas"), 3000);
        window.history.replaceState(null, "", `#${slug}`);
      }
    }, 50);
  }, []);

  const scrollToLetter = useCallback((letter: string) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ name: "Guides", href: "/guides" }, { name: "Glossaire", href: "/guides/glossaire" }]} className="mb-6" />
      {/* Header */}
      <h1 className="text-4xl font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
        Glossaire Riftbound
      </h1>
      <p className="mt-2 text-ink-secondary">
        Tous les mots-clés officiels et termes du TCG Riftbound expliqués en
        fran&ccedil;ais.
        <span className="ml-2 text-xs text-ink-muted">
          Source&nbsp;:{" "}
          <a
            href="https://riftboundsymbols.com/riftbound-keywords/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-arcane hover:underline"
          >
            riftboundsymbols.com
          </a>
        </span>
      </p>

      {/* Search bar */}
      <div className="relative mt-6 max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un terme, un mot-clé, une mécanique..."

          aria-label="Rechercher dans le glossaire"
          className="h-12 w-full rounded-full border border-hairline-strong bg-surface pl-12 pr-12 text-ink placeholder:text-ink-muted focus:border-arcane focus:ring-2 focus:ring-arcane-glow"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); searchRef.current?.focus(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            aria-label="Effacer la recherche"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === null
              ? "bg-ink text-canvas border-ink"
              : "border-hairline-strong bg-surface text-ink-secondary hover:bg-surface-raised hover:text-ink"
          }`}
        >
          Tout ({terms.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          const count = categoryCounts[cat] ?? 0;
          if (count === 0 && search) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                isActive ? CATEGORY_ACTIVE[cat] : CATEGORY_COLORS[cat] + " hover:brightness-125"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Alphabet navigation */}
      <nav className="mt-5 flex flex-wrap gap-1" aria-label="Navigation alphabétique">
        {allLetters.map((letter) => {
          const hasResults = letters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => hasResults && scrollToLetter(letter)}
              disabled={!hasResults}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                hasResults
                  ? "bg-surface-raised text-ink hover:bg-arcane hover:text-white cursor-pointer"
                  : "bg-surface text-ink-disabled cursor-default"
              }`}
              aria-label={`Aller à la lettre ${letter}`}
            >
              {letter}
            </button>
          );
        })}
      </nav>

      {/* Results count */}
      <div className="mt-6 text-sm text-ink-muted">
        {filteredTerms.length === terms.length ? (
          <span>{terms.length} termes</span>
        ) : (
          <span>
            {filteredTerms.length} résultat{filteredTerms.length !== 1 ? "s" : ""} sur {terms.length}
          </span>
        )}
        {search && (
          <span>
            {" "}pour &laquo;&nbsp;{search}&nbsp;&raquo;
          </span>
        )}
        {activeCategory && (
          <span> dans {activeCategory}</span>
        )}
      </div>

      {/* Terms grouped by letter */}
      {filteredTerms.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-lg text-ink-muted">
            Aucun terme ne correspond à votre recherche.
          </p>
          <button
            onClick={() => { setSearch(""); setActiveCategory(null); searchRef.current?.focus(); }}
            className="mt-3 text-sm text-arcane hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <dl className="mt-4 space-y-8">
          {letters.map((letter) => (
            <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              <div className="sticky top-16 z-10 mb-3 flex items-center gap-3 bg-canvas/95 py-2 backdrop-blur-sm">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-arcane text-lg font-bold text-canvas"
                  style={{ fontFamily: "var(--font-rubik), sans-serif" }}
                >
                  {letter}
                </span>
                <div className="h-px flex-1 bg-hairline" />
                <span className="text-xs text-ink-muted">
                  {letterGroups[letter].length} terme{letterGroups[letter].length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {letterGroups[letter].map((item) => (
                  <TermCard
                    key={item.term}
                    item={item}
                    card={cardByKeyword[item.term]}
                    onNavigate={navigateToTerm}
                  />
                ))}
              </div>
            </section>
          ))}
        </dl>
      )}

      {/* Scroll to top */}
      <div className="mt-12 text-center">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-sm text-ink-muted hover:text-arcane transition-colors"
        >
          Retour en haut
        </button>
      </div>
    </div>
  );
}
