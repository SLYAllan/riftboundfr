import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:text-ink prose-p:text-ink-secondary prose-a:text-arcane prose-strong:text-ink prose-code:text-arcane prose-pre:bg-surface-raised prose-pre:border prose-pre:border-hairline">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
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
    </div>
  );
}
