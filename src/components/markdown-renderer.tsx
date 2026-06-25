import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CardRef } from "@/components/card-ref";

// Card-reference syntax for article prose: [[Card Name]] or [[Card Name|Label]].
// Renders an inline CardRef (hover preview + link to the card page).
const CARD_REF_RE = /\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;

// cardLinks (optionnel) : map nom-de-carte minuscule -> riftboundId, pour rendre
// chaque [[carte]] comme un VRAI lien SSR vers /cartes/[id] (maillage interne).
function withCardRefs(children: ReactNode, cardLinks?: Record<string, string>): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child !== "string") {
      // Recurse into element children so refs inside <strong>/<em> still work.
      if (isValidElement(child)) {
        const el = child as ReactElement<{ children?: ReactNode }>;
        if (el.props?.children) {
          return cloneElement(el, undefined, withCardRefs(el.props.children, cardLinks));
        }
      }
      return child;
    }
    if (!child.includes("[[")) return child;
    const parts: ReactNode[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    CARD_REF_RE.lastIndex = 0;
    while ((match = CARD_REF_RE.exec(child)) !== null) {
      if (match.index > last) parts.push(child.slice(last, match.index));
      const name = match[1].trim();
      const label = (match[2] ?? match[1]).trim();
      const id = cardLinks?.[name.toLowerCase()];
      parts.push(
        <CardRef key={`cr-${key++}`} name={name} href={id ? `/cartes/${id}` : undefined}>
          {label}
        </CardRef>,
      );
      last = match.index + match[0].length;
    }
    if (last < child.length) parts.push(child.slice(last));
    return parts;
  });
}

// Explicit component styling so articles render with real typographic hierarchy
// (headings, tables, lists) without depending on the Tailwind Typography plugin.
// Factory : capture cardLinks pour que les [[carte]] deviennent des liens SSR.
const makeComponents = (cardLinks?: Record<string, string>): Components => ({
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 font-display text-3xl font-bold leading-tight text-ink">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-10 mb-4 border-b border-hairline pb-2 font-display text-2xl font-bold leading-tight text-ink">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-8 mb-3 font-display text-xl font-semibold leading-snug text-ink">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 mb-2 text-lg font-semibold text-ink">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="my-4 leading-relaxed text-ink-secondary">{withCardRefs(children, cardLinks)}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} className="font-medium text-arcane underline-offset-2 hover:underline">{children}</a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 text-ink-secondary marker:text-ink-muted">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 text-ink-secondary marker:text-ink-muted">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{withCardRefs(children, cardLinks)}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-arcane/60 bg-surface-raised/40 py-1 pl-4 italic text-ink-secondary">{children}</blockquote>
  ),
  hr: () => <hr className="my-8 border-hairline" />,
  code: ({ children }) => (
    <code className="rounded bg-surface-raised px-1.5 py-0.5 text-sm text-arcane">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-card border border-hairline bg-surface-raised p-4 text-sm">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto rounded-card border border-hairline">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-raised">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-hairline px-3 py-2.5 text-left font-semibold text-ink">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-hairline/60 px-3 py-2.5 align-top text-ink-secondary">{withCardRefs(children, cardLinks)}</td>
  ),
});

export function MarkdownRenderer({ content, cardLinks }: { content: string; cardLinks?: Record<string, string> }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={makeComponents(cardLinks)}
      allowedElements={[
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "a", "em", "strong", "del", "br", "hr",
        "ul", "ol", "li",
        "blockquote", "code", "pre",
        "table", "thead", "tbody", "tr", "th", "td",
        "img",
      ]}
    >
      {content}
    </ReactMarkdown>
  );
}
