import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Explicit component styling so articles render with real typographic hierarchy
// (headings, tables, lists) without depending on the Tailwind Typography plugin.
const components: Components = {
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
    <p className="my-4 leading-relaxed text-ink-secondary">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined} className="font-medium text-arcane underline-offset-2 hover:underline">{children}</a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-1.5 pl-6 text-ink-secondary marker:text-ink-muted">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-1.5 pl-6 text-ink-secondary marker:text-ink-muted">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
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
    <td className="border-b border-hairline/60 px-3 py-2.5 align-top text-ink-secondary">{children}</td>
  ),
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={components}
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
