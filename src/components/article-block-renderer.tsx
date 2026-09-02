"use client";

import type { ArticleBlock, DecklistCard } from "@/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SponsorCard } from "@/components/sponsor-card";
import { tailleImage } from "@/lib/images-articles";
import { DecklistInteractive } from "@/components/decklist-interactive";
import { TournamentBracket } from "@/components/tournament-bracket";
import { useT } from "@/components/i18n-provider";

interface ArticleBlockRendererProps {
  blocks: ArticleBlock[];
  resolvedDecks?: Record<string, DecklistCard[]>;
  deckbuilderCodes?: Record<string, string>;
  /** Map nom-de-carte minuscule -> riftboundId pour lier les [[carte]] (maillage SSR). */
  cardLinks?: Record<string, string>;
}

export function ArticleBlockRenderer({ blocks, resolvedDecks, deckbuilderCodes, cardLinks }: ArticleBlockRendererProps) {
  const t = useT();
  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case "text":
            return (
              <div key={block.id}>
                <MarkdownRenderer content={t(block.content)} cardLinks={cardLinks} />
              </div>
            );

          case "decklist": {
            const cards = resolvedDecks?.[block.id] ?? [];
            const list = (
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
            );
            if (block.collapsed) {
              return (
                <details key={block.id} className="group my-6 rounded-card border border-border bg-surface-raised">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-card px-4 py-3 font-semibold text-ink transition-colors hover:bg-surface group-open:rounded-b-none [&::-webkit-details-marker]:hidden">
                    <span>
                      {block.deckName}
                      {block.context && <span className="ml-2 text-sm font-normal text-ink-muted">· {block.context}</span>}
                    </span>
                    <span className="shrink-0 text-sm text-ink-muted transition-transform group-open:rotate-180" aria-hidden>▾</span>
                  </summary>
                  <div className="border-t border-border p-4">{list}</div>
                </details>
              );
            }
            return (
              <div key={block.id} className="my-8">
                {list}
              </div>
            );
          }

          case "sponsor_link":
            return (
              // `max-w-xs` : la carte est carrée, l'étirer sur toute la colonne
              // donnerait une image de 1200 px de haut pour un lien de trois mots.
              <div key={block.id} className="my-6 mx-auto max-w-xs">
                <SponsorCard
                  title={t(block.title)}
                  description={block.description ? t(block.description) : undefined}
                  imageUrl={block.imageUrl}
                  ctaText={t(block.ctaText)}
                  url={block.url}
                  style={block.style}
                  isSponsored={block.isSponsored}
                />
              </div>
            );

          case "image":
            return (
              <figure
                key={block.id}
                className={block.width === "narrow" ? "my-6 mx-auto max-w-sm" : "my-6 mx-auto max-w-3xl"}
              >
                <div className="overflow-hidden rounded-card">
                  {/* width/height servent au seul rapport de forme (la largeur reste
                      w-full) : sans eux le navigateur ne peut rien réserver et le
                      texte saute sous chaque illustration au chargement. */}
                  <img
                    src={block.src}
                    alt={t(block.alt)}
                    loading="lazy"
                    decoding="async"
                    {...(tailleImage(block.src) ?? {})}
                    className="h-auto w-full object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-ink-muted">{t(block.caption)}</figcaption>
                )}
              </figure>
            );

          case "tweet":
            return (
              <div key={block.id} className="my-6 mx-auto max-w-xl">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-card border border-hairline bg-surface-raised p-4 transition-colors hover:border-arcane/60 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    {block.avatar ? (
                      <img src={block.avatar} alt={block.author} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white">
                        <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-ink">{block.author}</div>
                      <div className="truncate text-sm text-ink-muted">@{block.handle}</div>
                    </div>
                    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0 fill-ink-muted">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-ink-secondary">{block.content}</p>
                  {block.media && (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-hairline">
                      <img src={block.media} alt={block.mediaAlt ?? ""} loading="lazy" decoding="async" {...(tailleImage(block.media) ?? {})} className="h-auto w-full object-cover" />
                    </div>
                  )}
                  {block.date && <div className="mt-3 text-sm text-ink-muted">{block.date}</div>}
                  <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-arcane">{t("Voir sur X")} &rarr;</div>
                </a>
              </div>
            );

          case "bracket":
            return (
              <div key={block.id} className="my-8">
                <TournamentBracket title={block.title} rounds={block.rounds} />
              </div>
            );

          case "video":
            // Pas de `max-w` : la vidéo prend toute la colonne. Une démonstration
            // côte à côte fait 1920 px de large pour 540 de haut, la brider à la
            // largeur du texte rendait les deux écrans illisibles.
            return (
              <figure key={block.id} className="my-8 w-full">
                {/* `controls` malgré la lecture auto : sans lui, personne ne peut
                    revenir en arrière sur un geste qui vient de passer. `playsInline`
                    évite le plein écran forcé sur iPhone, qui masque la légende. */}
                <video
                  src={block.src}
                  poster={block.poster}
                  controls
                  autoPlay
                  muted
                  loop={block.loop !== false}
                  playsInline
                  preload="metadata"
                  className="w-full rounded-card"
                />
                {block.caption && (
                  <figcaption className="mt-2 text-center text-sm text-ink-muted">{t(block.caption)}</figcaption>
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
