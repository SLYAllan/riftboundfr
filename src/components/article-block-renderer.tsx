"use client";

import type { ArticleBlock, DecklistCard } from "@/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SponsorCard } from "@/components/sponsor-card";
import { DecklistInteractive } from "@/components/decklist-interactive";

interface ArticleBlockRendererProps {
  blocks: ArticleBlock[];
  resolvedDecks?: Record<string, DecklistCard[]>;
  deckbuilderCodes?: Record<string, string>;
}

export function ArticleBlockRenderer({ blocks, resolvedDecks, deckbuilderCodes }: ArticleBlockRendererProps) {
  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case "text":
            return (
              <div key={block.id}>
                <MarkdownRenderer content={block.content} />
              </div>
            );

          case "decklist": {
            const cards = resolvedDecks?.[block.id] ?? [];
            return (
              <div key={block.id} className="my-8">
                <DecklistInteractive
                  cards={cards}
                  deckName={block.deckName}
                  legendName={block.legendName}
                  playerName={block.playerName}
                  context={block.context}
                  showCopyCode
                  showExportPng
                  deckbuilderCode={deckbuilderCodes?.[block.id]}
                />
              </div>
            );
          }

          case "sponsor_link":
            return (
              <div key={block.id} className="my-6">
                <SponsorCard
                  title={block.title}
                  description={block.description}
                  imageUrl={block.imageUrl}
                  ctaText={block.ctaText}
                  url={block.url}
                  style={block.style}
                  isSponsored={block.isSponsored}
                />
              </div>
            );

          case "image":
            return (
              <figure key={block.id} className="my-6">
                <div className="overflow-hidden rounded-card">
                  <img src={block.src} alt={block.alt} className="w-full object-cover" />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-ink-muted">{block.caption}</figcaption>
                )}
              </figure>
            );

          case "separator":
            return (
              <hr key={block.id} className="my-8 border-hairline" />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
