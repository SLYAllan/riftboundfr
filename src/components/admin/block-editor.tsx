"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { ArticleBlock } from "@/types";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Copy, GripVertical, Upload } from "lucide-react";
import { parseDeckCode } from "@/lib/deck-code";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function emptyBlock(type: ArticleBlock["type"]): ArticleBlock {
  switch (type) {
    case "text":
      return { type: "text", id: generateId(), content: "" };
    case "decklist":
      return { type: "decklist", id: generateId(), deckCode: "", deckName: "", legendName: "" };
    case "sponsor_link":
      return { type: "sponsor_link", id: generateId(), title: "", ctaText: "En savoir plus", url: "", style: "standard", isSponsored: false };
    case "image":
      return { type: "image", id: generateId(), src: "", alt: "" };
    case "video":
      return { type: "video", id: generateId(), src: "" };
    case "tweet":
      return { type: "tweet", id: generateId(), url: "", author: "", handle: "", content: "" };
    case "bracket":
      return {
        type: "bracket",
        id: generateId(),
        title: "Le parcours du Top 8",
        rounds: [
          { name: "Quarts de finale", matches: [{ a: { player: "", legend: "", score: "2", win: true }, b: { player: "", legend: "", score: "1" } }] },
          { name: "Demi-finales", matches: [{ a: { player: "", legend: "", score: "2", win: true }, b: { player: "", legend: "", score: "1" } }] },
          { name: "Finale", matches: [{ a: { player: "", legend: "", score: "2", win: true }, b: { player: "", legend: "", score: "1" } }] },
        ],
      };
    case "separator":
      return { type: "separator", id: generateId() };
  }
}

const blockTypeLabels: Record<ArticleBlock["type"], string> = {
  text: "Texte",
  decklist: "Decklist",
  sponsor_link: "Lien sponsorise",
  image: "Image",
  video: "Video",
  tweet: "Tweet (X)",
  bracket: "Bracket (tournoi)",
  separator: "Separateur",
};

const SECTION_LABELS: Record<string, string> = {
  legend: "Legende",
  champion: "Champion",
  main: "Main Deck",
  rune: "Runes",
  battlefield: "Champs de bataille",
  side: "Reserve",
};

interface BlockEditorProps {
  article?: {
    id: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    category: string;
    tags: string[];
    blocks: ArticleBlock[];
    published: boolean;
    featured: boolean;
    tournamentName: string | null;
    tournamentDate: string | null;
    tournamentLocation: string | null;
    tournamentPlayerCount: number | null;
  };
}

function TextBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "text" }>; onChange: (b: ArticleBlock) => void }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor={`text-content-${block.id}`} className="text-xs text-ink-muted">Markdown</label>
        <button onClick={() => setPreview(!preview)} className="text-xs text-ink-muted hover:text-ink flex items-center gap-1">
          {preview ? <EyeOff size={12} /> : <Eye size={12} />}
          {preview ? "Editer" : "Preview"}
        </button>
      </div>
      {preview ? (
        <div className="rounded-lg border border-hairline bg-canvas p-4 min-h-[100px]">
          <MarkdownRenderer content={block.content} />
        </div>
      ) : (
        <textarea
          id={`text-content-${block.id}`}
          value={block.content}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink font-mono text-sm focus:border-arcane resize-y"
          placeholder="Contenu markdown..."
        />
      )}
      {!preview && (
        <p className="mt-1.5 text-[11px] text-ink-muted">
          Astuce : <code className="rounded bg-surface-raised px-1 text-arcane">[[Vex, Apathetic]]</code> ou{" "}
          <code className="rounded bg-surface-raised px-1 text-arcane">[[Vex, Apathetic|Vex]]</code> affiche un aperçu de la carte au survol.
        </p>
      )}
    </div>
  );
}

function DecklistBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "decklist" }>; onChange: (b: ArticleBlock) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const isBinary = /^[A-Za-z0-9_-]{20,}$/.test(block.deckCode.trim());

  function handleDeckCodeChange(newCode: string) {
    const newIsBinary = /^[A-Za-z0-9_-]{20,}$/.test(newCode.trim());
    let legendName = block.legendName;
    if (!legendName && !newIsBinary) {
      const parsed = parseDeckCode(newCode);
      const legendEntry = parsed.entries.find((e) => e.section === "legend");
      if (legendEntry) legendName = legendEntry.name.replace(" - ", ", ");
    }
    onChange({ ...block, deckCode: newCode, legendName });
  }

  const parsed = showPreview && block.deckCode && !isBinary ? parseDeckCode(block.deckCode) : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`deck-name-${block.id}`} className="block text-xs text-ink-muted mb-1">Nom du deck</label>
          <input id={`deck-name-${block.id}`} type="text" value={block.deckName} onChange={(e) => onChange({ ...block, deckName: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`deck-legend-${block.id}`} className="block text-xs text-ink-muted mb-1">Legende</label>
          <input id={`deck-legend-${block.id}`} type="text" value={block.legendName} onChange={(e) => onChange({ ...block, legendName: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`deck-player-${block.id}`} className="block text-xs text-ink-muted mb-1">Joueur</label>
          <input id={`deck-player-${block.id}`} type="text" value={block.playerName ?? ""} onChange={(e) => onChange({ ...block, playerName: e.target.value || undefined })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`deck-context-${block.id}`} className="block text-xs text-ink-muted mb-1">Contexte</label>
          <input id={`deck-context-${block.id}`} type="text" value={block.context ?? ""} onChange={(e) => onChange({ ...block, context: e.target.value || undefined })}
            placeholder="Top 4 - RQ Sydney" className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor={`deck-code-${block.id}`} className="text-xs text-ink-muted">Deck code</label>
          {block.deckCode && (
            <button onClick={() => setShowPreview(!showPreview)} className="text-xs text-ink-muted hover:text-ink flex items-center gap-1">
              {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
              {showPreview ? "Editer" : "Preview"}
            </button>
          )}
        </div>
        {showPreview && parsed ? (
          <div className="rounded-lg border border-hairline bg-canvas p-4 space-y-3">
            {parsed.entries.length === 0 && parsed.errors.length === 0 && (
              <p className="text-xs text-ink-muted italic">Aucune carte detectee</p>
            )}
            {Object.entries(
              parsed.entries.reduce<Record<string, { name: string; quantity: number }[]>>((acc, e) => {
                if (!acc[e.section]) acc[e.section] = [];
                acc[e.section].push({ name: e.name, quantity: e.quantity });
                return acc;
              }, {})
            ).map(([section, cards]) => (
              <div key={section}>
                <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
                  {SECTION_LABELS[section] ?? section} ({cards.reduce((s, c) => s + c.quantity, 0)})
                </p>
                <ul className="mt-1 space-y-0.5">
                  {cards.map((c, i) => (
                    <li key={i} className="text-xs text-ink">
                      {c.quantity}x {c.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {parsed.errors.length > 0 && (
              <div className="border-t border-hairline pt-2">
                <p className="text-xs font-semibold text-red-400">Erreurs :</p>
                {parsed.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-400">{err}</p>
                ))}
              </div>
            )}
          </div>
        ) : showPreview && isBinary ? (
          <div className="rounded-lg border border-hairline bg-canvas p-4">
            <p className="text-xs text-ink-muted italic">Code binaire - preview non disponible</p>
          </div>
        ) : (
          <textarea
            id={`deck-code-${block.id}`}
            value={block.deckCode}
            onChange={(e) => handleDeckCodeChange(e.target.value)}
            rows={8}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink font-mono text-xs focus:border-arcane resize-y"
            placeholder={"Legend:\n1 Master Yi - Wuju Bladesman\nChampion:\n1 Master Yi - Tempered\nMainDeck:\n3 Wuju Style\n3 Meditate\n...\nRunes:\n1 Rune Name\nBattlefields:\n1 Battlefield Name"}
          />
        )}
        <p className="mt-1 text-[10px] text-ink-muted">Format texte (Legend: / MainDeck: / Runes: / ...) ou code binaire - la legende est remplie automatiquement</p>
      </div>
    </div>
  );
}

function SponsorBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "sponsor_link" }>; onChange: (b: ArticleBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`sponsor-title-${block.id}`} className="block text-xs text-ink-muted mb-1">Titre</label>
          <input id={`sponsor-title-${block.id}`} type="text" value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`sponsor-cta-${block.id}`} className="block text-xs text-ink-muted mb-1">Texte CTA</label>
          <input id={`sponsor-cta-${block.id}`} type="text" value={block.ctaText} onChange={(e) => onChange({ ...block, ctaText: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`sponsor-url-${block.id}`} className="block text-xs text-ink-muted mb-1">URL destination</label>
          <input id={`sponsor-url-${block.id}`} type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`sponsor-image-${block.id}`} className="block text-xs text-ink-muted mb-1">Image URL</label>
          <input id={`sponsor-image-${block.id}`} type="url" value={block.imageUrl ?? ""} onChange={(e) => onChange({ ...block, imageUrl: e.target.value || undefined })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
      </div>
      <div>
        <label htmlFor={`sponsor-description-${block.id}`} className="block text-xs text-ink-muted mb-1">Description</label>
        <input id={`sponsor-description-${block.id}`} type="text" value={block.description ?? ""} onChange={(e) => onChange({ ...block, description: e.target.value || undefined })}
          className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
      </div>
      <div className="flex items-center gap-6">
        <div>
          <label htmlFor={`sponsor-style-${block.id}`} className="block text-xs text-ink-muted mb-1">Style</label>
          <select id={`sponsor-style-${block.id}`} value={block.style} onChange={(e) => onChange({ ...block, style: e.target.value as "standard" | "highlight" | "minimal" })}
            className="px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane">
            <option value="standard">Standard</option>
            <option value="highlight">Highlight (or)</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer mt-4">
          <input type="checkbox" checked={block.isSponsored} onChange={(e) => onChange({ ...block, isSponsored: e.target.checked })} className="accent-arcane" />
          Sponsorise
        </label>
      </div>
    </div>
  );
}

function ImageBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "image" }>; onChange: (b: ArticleBlock) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`image-src-${block.id}`} className="block text-xs text-ink-muted mb-1">URL de l&apos;image</label>
          <input id={`image-src-${block.id}`} type="url" value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`image-alt-${block.id}`} className="block text-xs text-ink-muted mb-1">Texte alternatif</label>
          <input id={`image-alt-${block.id}`} type="text" value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`image-caption-${block.id}`} className="block text-xs text-ink-muted mb-1">Legende (optionnel)</label>
          <input id={`image-caption-${block.id}`} type="text" value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
        </div>
        <div>
          <label htmlFor={`image-width-${block.id}`} className="block text-xs text-ink-muted mb-1">Largeur</label>
          <select id={`image-width-${block.id}`} value={block.width ?? "full"} onChange={(e) => onChange({ ...block, width: e.target.value === "narrow" ? "narrow" : undefined })}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane">
            <option value="full">Pleine largeur</option>
            <option value="narrow">Centree (portrait/poster)</option>
          </select>
        </div>
      </div>
      {block.src && (
        <img src={block.src} alt={block.alt} className="max-h-40 rounded-lg object-cover" />
      )}
    </div>
  );
}

function VideoBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "video" }>; onChange: (b: ArticleBlock) => void }) {
  const inputCls = "w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          {/* Fichier du site : la CSP `default-src 'self'` refuse un lecteur externe. */}
          <label htmlFor={`video-src-${block.id}`} className="block text-xs text-ink-muted mb-1">Fichier video (/video/...)</label>
          <input id={`video-src-${block.id}`} type="text" value={block.src} onChange={(e) => onChange({ ...block, src: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`video-poster-${block.id}`} className="block text-xs text-ink-muted mb-1">Affiche (optionnel)</label>
          <input id={`video-poster-${block.id}`} type="text" value={block.poster ?? ""} onChange={(e) => onChange({ ...block, poster: e.target.value || undefined })} className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`video-caption-${block.id}`} className="block text-xs text-ink-muted mb-1">Legende (optionnel)</label>
          <input id={`video-caption-${block.id}`} type="text" value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value || undefined })} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`video-loop-${block.id}`} className="block text-xs text-ink-muted mb-1">Lecture</label>
          <select id={`video-loop-${block.id}`} value={block.loop === false ? "once" : "loop"} onChange={(e) => onChange({ ...block, loop: e.target.value === "once" ? false : undefined })} className={inputCls}>
            <option value="loop">En boucle</option>
            <option value="once">Une seule fois</option>
          </select>
        </div>
      </div>
      {block.src && <video src={block.src} poster={block.poster} controls muted playsInline preload="metadata" className="max-h-40 rounded-lg" />}
    </div>
  );
}

function TweetBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "tweet" }>; onChange: (b: ArticleBlock) => void }) {
  const inputCls = "w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane";
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label htmlFor={`tweet-author-${block.id}`} className="block text-xs text-ink-muted mb-1">Auteur</label>
          <input id={`tweet-author-${block.id}`} type="text" value={block.author} onChange={(e) => onChange({ ...block, author: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`tweet-handle-${block.id}`} className="block text-xs text-ink-muted mb-1">Handle (sans @)</label>
          <input id={`tweet-handle-${block.id}`} type="text" value={block.handle} onChange={(e) => onChange({ ...block, handle: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`tweet-date-${block.id}`} className="block text-xs text-ink-muted mb-1">Date</label>
          <input id={`tweet-date-${block.id}`} type="text" value={block.date ?? ""} onChange={(e) => onChange({ ...block, date: e.target.value || undefined })} className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor={`tweet-url-${block.id}`} className="block text-xs text-ink-muted mb-1">Lien vers le post (X)</label>
        <input id={`tweet-url-${block.id}`} type="url" value={block.url} onChange={(e) => onChange({ ...block, url: e.target.value })} className={inputCls} />
      </div>
      <div>
        <label htmlFor={`tweet-content-${block.id}`} className="block text-xs text-ink-muted mb-1">Contenu</label>
        <textarea id={`tweet-content-${block.id}`} value={block.content} onChange={(e) => onChange({ ...block, content: e.target.value })} rows={4} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`tweet-avatar-${block.id}`} className="block text-xs text-ink-muted mb-1">Avatar (URL locale)</label>
          <input id={`tweet-avatar-${block.id}`} type="text" value={block.avatar ?? ""} onChange={(e) => onChange({ ...block, avatar: e.target.value || undefined })} className={inputCls} />
        </div>
        <div>
          <label htmlFor={`tweet-media-${block.id}`} className="block text-xs text-ink-muted mb-1">Image attachee (URL locale)</label>
          <input id={`tweet-media-${block.id}`} type="text" value={block.media ?? ""} onChange={(e) => onChange({ ...block, media: e.target.value || undefined })} className={inputCls} />
        </div>
      </div>
      {block.media && (
        <div>
          <label htmlFor={`tweet-media-alt-${block.id}`} className="block text-xs text-ink-muted mb-1">Texte alternatif de l&apos;image</label>
          <input id={`tweet-media-alt-${block.id}`} type="text" value={block.mediaAlt ?? ""} onChange={(e) => onChange({ ...block, mediaAlt: e.target.value || undefined })} className={inputCls} />
        </div>
      )}
    </div>
  );
}

function BlockEditorItem({ block, onChange, onRemove, onDuplicate, onMoveUp, onMoveDown, isFirst, isLast, onDragStart, onDragOver, onDrop, onDragEnd, isDragTarget }:
  { block: ArticleBlock; onChange: (b: ArticleBlock) => void; onRemove: () => void; onDuplicate: () => void; onMoveUp: () => void; onMoveDown: () => void; isFirst: boolean; isLast: boolean; onDragStart: () => void; onDragOver: (e: React.DragEvent) => void; onDrop: () => void; onDragEnd: () => void; isDragTarget: boolean }) {
  const gripRef = useRef<HTMLDivElement>(null);

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (!gripRef.current?.contains(e.target as Node)) {
          e.preventDefault();
          return;
        }
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      onDragEnd={onDragEnd}
      className={`rounded-xl border bg-surface p-4 transition-colors ${isDragTarget ? "border-arcane bg-arcane/5" : "border-hairline"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div ref={gripRef} className="cursor-grab active:cursor-grabbing text-ink-muted hover:text-ink">
            <GripVertical size={16} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-light">{blockTypeLabels[block.type]}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onDuplicate} aria-label="Dupliquer le bloc" className="p-1 text-ink-muted hover:text-arcane" title="Dupliquer"><Copy size={16} /></button>
          <button onClick={onMoveUp} aria-label="Monter le bloc" disabled={isFirst} className="p-1 text-ink-muted hover:text-ink disabled:opacity-30"><ChevronUp size={16} /></button>
          <button onClick={onMoveDown} aria-label="Descendre le bloc" disabled={isLast} className="p-1 text-ink-muted hover:text-ink disabled:opacity-30"><ChevronDown size={16} /></button>
          <button onClick={onRemove} aria-label="Supprimer le bloc" className="p-1 text-ink-muted hover:text-red-400"><Trash2 size={16} /></button>
        </div>
      </div>
      {block.type === "text" && <TextBlockEditor block={block} onChange={onChange} />}
      {block.type === "decklist" && <DecklistBlockEditor block={block} onChange={onChange} />}
      {block.type === "sponsor_link" && <SponsorBlockEditor block={block} onChange={onChange} />}
      {block.type === "image" && <ImageBlockEditor block={block} onChange={onChange} />}
      {block.type === "video" && <VideoBlockEditor block={block} onChange={onChange} />}
      {block.type === "tweet" && <TweetBlockEditor block={block} onChange={onChange} />}
      {block.type === "bracket" && <BracketBlockEditor block={block} onChange={onChange} />}
      {block.type === "separator" && <hr className="border-hairline" />}
    </div>
  );
}

function BracketBlockEditor({ block, onChange }: { block: Extract<ArticleBlock, { type: "bracket" }>; onChange: (b: ArticleBlock) => void }) {
  const [raw, setRaw] = useState(() => JSON.stringify(block.rounds, null, 2));
  const [err, setErr] = useState<string | null>(null);
  const inputCls = "w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane";
  return (
    <div className="space-y-2">
      <label htmlFor={`bracket-title-${block.id}`} className="text-xs text-ink-muted">Titre</label>
      <input
        id={`bracket-title-${block.id}`}
        type="text"
        value={block.title ?? ""}
        onChange={(e) => onChange({ ...block, title: e.target.value || undefined })}
        placeholder="Le parcours du Top 8"
        className={inputCls}
      />
      <label htmlFor={`bracket-rounds-${block.id}`} className="text-xs text-ink-muted">Rounds (JSON)</label>
      <textarea
        id={`bracket-rounds-${block.id}`}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          try {
            const parsed = JSON.parse(e.target.value);
            if (!Array.isArray(parsed)) throw new Error("doit etre un tableau de rounds");
            onChange({ ...block, rounds: parsed });
            setErr(null);
          } catch (ex) {
            setErr((ex as Error).message);
          }
        }}
        rows={12}
        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-hairline text-ink font-mono text-xs focus:border-arcane resize-y"
      />
      {err && <p className="text-xs text-red-400">JSON invalide : {err}</p>}
      <p className="text-[11px] text-ink-muted">
        Chaque round : <code className="text-arcane">{`{ "name": "Quarts", "matches": [{ "a": {"player":"AlanZQ","legend":"Diana","score":"2","win":true}, "b": {"player":"Sam","legend":"Rengar","score":"1"} }] }`}</code>. Le dernier round affiche un 🏆 sur le gagnant.
      </p>
    </div>
  );
}

function AddBlockMenu({ onAdd }: { onAdd: (type: ArticleBlock["type"]) => void }) {
  const [open, setOpen] = useState(false);
  const types: ArticleBlock["type"][] = ["text", "decklist", "sponsor_link", "image", "video", "tweet", "bracket", "separator"];
  return (
    <div className="relative flex justify-center">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full border border-dashed border-hairline-strong px-4 py-1.5 text-xs text-ink-muted hover:text-arcane hover:border-arcane transition-colors"
      >
        <Plus size={14} /> Ajouter un bloc
      </button>
      {open && (
        <div className="absolute top-full mt-1 z-10 rounded-lg border border-hairline bg-surface shadow-xl py-1 min-w-[180px]">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => { onAdd(t); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm text-ink-secondary hover:text-ink hover:bg-surface-raised"
            >
              {blockTypeLabels[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BulkDeckImport({ onImport }: { onImport: (blocks: ArticleBlock[]) => void }) {
  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [context, setContext] = useState("");

  function handleImport() {
    const chunks = raw.split(/^---+$/m).map((c) => c.trim()).filter(Boolean);
    const blocks: ArticleBlock[] = chunks.map((chunk) => {
      const parsed = parseDeckCode(chunk);
      const legendEntry = parsed.entries.find((e) => e.section === "legend");
      return {
        type: "decklist" as const,
        id: generateId(),
        deckCode: chunk,
        deckName: legendEntry ? legendEntry.name.replace(" - ", ", ") : "",
        legendName: legendEntry ? legendEntry.name.replace(" - ", ", ") : "",
        playerName: playerName || undefined,
        context: context || undefined,
      };
    });
    if (blocks.length > 0) {
      onImport(blocks);
      setRaw("");
      setPlayerName("");
      setContext("");
      setOpen(false);
    }
  }

  const previewCount = raw ? raw.split(/^---+$/m).filter((c) => c.trim()).length : 0;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 rounded-full border border-dashed border-hairline-strong px-4 py-1.5 text-xs text-ink-muted hover:text-violet-light hover:border-violet transition-colors"
      >
        <Upload size={14} /> Import en masse
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-violet/30 bg-violet/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-light">Import en masse</p>
        <button onClick={() => setOpen(false)} className="text-xs text-ink-muted hover:text-ink">&times; Fermer</button>
      </div>
      <p className="text-[11px] text-ink-muted">
        Collez plusieurs decklists separees par <code className="bg-surface-raised px-1 rounded">---</code>. Chaque decklist cree un bloc.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bulk-player" className="block text-xs text-ink-muted mb-1">Joueur (tous)</label>
          <input id="bulk-player" type="text" value={playerName} onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-violet" />
        </div>
        <div>
          <label htmlFor="bulk-context" className="block text-xs text-ink-muted mb-1">Contexte (tous)</label>
          <input id="bulk-context" type="text" value={context} onChange={(e) => setContext(e.target.value)}
            placeholder="Top 8 - RQ Sydney" className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-violet" />
        </div>
      </div>
      <label htmlFor="bulk-decklists" className="sr-only">Decklists à importer</label>
      <textarea
        id="bulk-decklists"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={12}
        className="w-full px-3 py-2 rounded-lg bg-surface-raised border border-hairline text-ink font-mono text-xs focus:border-violet resize-y"
        placeholder={"Legend:\n1 Master Yi - Wuju Bladesman\nMainDeck:\n3 Wuju Style\n...\n---\nLegend:\n1 Ahri - Foxfire\nMainDeck:\n3 Orb of Deception\n..."}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-muted">
          {previewCount} decklist{previewCount > 1 ? "s" : ""} detectee{previewCount > 1 ? "s" : ""}
        </span>
        <button
          onClick={handleImport}
          disabled={previewCount === 0}
          className="px-4 py-1.5 rounded-lg bg-violet-dark text-white text-sm font-semibold hover:bg-violet-light transition-colors disabled:opacity-50"
        >
          Importer {previewCount} bloc{previewCount > 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}

export function BlockEditor({ article }: BlockEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState<ArticleBlock[]>(article?.blocks ?? []);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: article?.title ?? "",
    excerpt: article?.excerpt ?? "",
    coverImage: article?.coverImage ?? "",
    category: article?.category ?? "actualite",
    tags: article?.tags.join(", ") ?? "",
    published: article?.published ?? false,
    featured: article?.featured ?? false,
    tournamentName: article?.tournamentName ?? "",
    tournamentDate: article?.tournamentDate ?? "",
    tournamentLocation: article?.tournamentLocation ?? "",
    tournamentPlayerCount: article?.tournamentPlayerCount ?? "",
  });

  const updateBlock = useCallback((index: number, block: ArticleBlock) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? block : b)));
  }, []);

  const removeBlock = useCallback((index: number) => {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const moveBlock = useCallback((index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const addBlock = useCallback((type: ArticleBlock["type"], afterIndex?: number) => {
    const block = emptyBlock(type);
    setBlocks((prev) => {
      if (afterIndex === undefined) return [...prev, block];
      const next = [...prev];
      next.splice(afterIndex + 1, 0, block);
      return next;
    });
  }, []);

  const duplicateBlock = useCallback((index: number) => {
    setBlocks((prev) => {
      const source = prev[index];
      const clone = { ...source, id: generateId() };
      const next = [...prev];
      next.splice(index + 1, 0, clone);
      return next;
    });
  }, []);

  const handleDrop = useCallback((targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setBlocks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex]);

  const clearDrag = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const bulkImport = useCallback((newBlocks: ArticleBlock[]) => {
    setBlocks((prev) => [...prev, ...newBlocks]);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      title: form.title,
      excerpt: form.excerpt || null,
      coverImage: form.coverImage || null,
      category: form.category,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      blocks,
      published: form.published,
      featured: form.featured,
      tournamentName: form.tournamentName || null,
      tournamentDate: form.tournamentDate || null,
      tournamentLocation: form.tournamentLocation || null,
      tournamentPlayerCount: form.tournamentPlayerCount ? parseInt(String(form.tournamentPlayerCount), 10) : null,
    };

    const url = article ? `/api/admin/articles/${article.id}` : "/api/admin/articles";
    const method = article ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      router.push("/admin/articles");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="article-title" className="block text-sm text-ink-secondary mb-1">Titre</label>
          <input id="article-title" type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink focus:border-arcane" required />
        </div>
        <div>
          <label htmlFor="article-category" className="block text-sm text-ink-secondary mb-1">Categorie</label>
          <select id="article-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink focus:border-arcane">
            <option value="actualite">Actualite</option>
            <option value="guide">Guide</option>
            <option value="meta">Meta</option>
            <option value="tournoi">Tournoi</option>
            <option value="patch-notes">Patch Notes</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="article-excerpt" className="block text-sm text-ink-secondary mb-1">Extrait</label>
        <textarea id="article-excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2}
          className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink focus:border-arcane" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="article-cover-image" className="block text-sm text-ink-secondary mb-1">Image de couverture (URL)</label>
          <input id="article-cover-image" type="url" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink focus:border-arcane" />
        </div>
        <div>
          <label htmlFor="article-tags" className="block text-sm text-ink-secondary mb-1">Tags (separes par des virgules)</label>
          <input id="article-tags" type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-surface-raised border border-hairline text-ink focus:border-arcane" />
        </div>
      </div>

      {form.category === "tournoi" && (
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gold">Infos tournoi</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="article-tournament-name" className="block text-xs text-ink-muted mb-1">Nom du tournoi</label>
              <input id="article-tournament-name" type="text" value={form.tournamentName} onChange={(e) => setForm({ ...form, tournamentName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
            </div>
            <div>
              <label htmlFor="article-tournament-date" className="block text-xs text-ink-muted mb-1">Date</label>
              <input id="article-tournament-date" type="date" value={form.tournamentDate} onChange={(e) => setForm({ ...form, tournamentDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
            </div>
            <div>
              <label htmlFor="article-tournament-location" className="block text-xs text-ink-muted mb-1">Lieu</label>
              <input id="article-tournament-location" type="text" value={form.tournamentLocation} onChange={(e) => setForm({ ...form, tournamentLocation: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
            </div>
            <div>
              <label htmlFor="article-tournament-player-count" className="block text-xs text-ink-muted mb-1">Nombre de joueurs</label>
              <input id="article-tournament-player-count" type="number" value={form.tournamentPlayerCount} onChange={(e) => setForm({ ...form, tournamentPlayerCount: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-ink text-sm focus:border-arcane" />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-rubik)" }}>Contenu</h2>
          <span className="text-xs text-ink-muted">{blocks.length} bloc{blocks.length > 1 ? "s" : ""}</span>
        </div>

        <BulkDeckImport onImport={bulkImport} />

        {blocks.length === 0 && (
          <p className="text-sm text-ink-muted text-center py-8 border border-dashed border-hairline rounded-xl">
            Aucun bloc. Ajoutez-en un pour commencer.
          </p>
        )}
        {blocks.map((block, i) => (
          <div key={block.id}>
            <BlockEditorItem
              block={block}
              onChange={(b) => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
              onDuplicate={() => duplicateBlock(i)}
              onMoveUp={() => moveBlock(i, -1)}
              onMoveDown={() => moveBlock(i, 1)}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => { e.preventDefault(); setDragOverIndex(i); }}
              onDrop={() => handleDrop(i)}
              onDragEnd={clearDrag}
              isDragTarget={dragOverIndex === i && dragIndex !== i}
            />
            <div className="my-2">
              <AddBlockMenu onAdd={(type) => addBlock(type, i)} />
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
          <AddBlockMenu onAdd={(type) => addBlock(type)} />
        )}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-hairline">
        <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
          <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="accent-arcane" />
          Publier
        </label>
        <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-arcane" />
          Mettre en avant
        </label>
        <button type="submit" disabled={loading}
          className="ml-auto px-6 py-3 rounded-lg bg-arcane text-canvas font-semibold hover:bg-arcane-light transition-colors disabled:opacity-50">
          {loading ? "Enregistrement..." : article ? "Mettre a jour" : "Creer l'article"}
        </button>
      </div>
    </form>
  );
}
