import Link from "next/link";
import { GLOSSARY_TERMS } from "@/lib/glossary";

// Slug identique à celui des ancres du glossaire, pour que le lien tombe sur la
// bonne définition.
function slugify(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Termes triés du plus long au plus court : « Champ de bataille » doit gagner sur
// « Champ ». On ne garde que les termes d'au moins quatre lettres, sinon « Base »
// et « Rune » surlignent la moitié du document.
const LINKABLE = GLOSSARY_TERMS.filter((t) => t.term.length >= 5)
  .map((t) => t.term)
  .sort((a, b) => b.length - a.length);

const ESCAPE = /[.*+?^${}()|[\]\\]/g;
const PATTERN = new RegExp(
  `(?<![\\p{L}])(${LINKABLE.map((t) => t.replace(ESCAPE, "\\$&")).join("|")})(?![\\p{L}])`,
  "giu",
);

/**
 * Rend le texte d'une règle en reliant au glossaire les termes qu'il cite. Le
 * surlignage reste neutre : jamais de fond teinté sous du texte teinté, comme
 * partout ailleurs sur le site. Un terme n'est relié qu'à sa première occurrence,
 * sinon un paragraphe de règle devient un sapin de Noël.
 */
export function RuleText({ text, seen = new Set<string>() }: { text: string; seen?: Set<string> }) {
  const parts = text.split(PATTERN);

  return (
    <>
      {parts.map((part, i) => {
        // Les captures tombent sur les indices impairs.
        if (i % 2 === 0) return part;
        const key = part.toLowerCase();
        if (seen.has(key)) return part;
        seen.add(key);
        const term = LINKABLE.find((t) => t.toLowerCase() === key);
        if (!term) return part;
        return (
          <Link
            key={i}
            href={`/guides/glossaire#${slugify(term)}`}
            title={`Définition de « ${term} »`}
            className="rounded-[3px] bg-ink/10 px-1 py-px text-ink decoration-ink-muted/40 underline-offset-2 transition-colors duration-150 hover:bg-ink/20 hover:underline"
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}
