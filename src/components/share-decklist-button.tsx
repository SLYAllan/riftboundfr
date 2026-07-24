"use client";

import { useState } from "react";
import { Share2, Download, Check } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";

interface ShareDecklistButtonProps {
  /** Slug for editorial decks */
  slug?: string;
  /** Share code for community decks */
  shareCode?: string;
  /** Deck title for the tweet text */
  deckTitle: string;
  /** Legend name for the tweet text */
  legendName: string;
  /** Optional player name */
  playerName?: string;
  /** Optional tournament context */
  tournamentContext?: string;
}

export function ShareDecklistButton({
  slug,
  shareCode,
  deckTitle,
  legendName,
  playerName,
  tournamentContext,
}: ShareDecklistButtonProps) {
  const [copied, setCopied] = useState(false);
  // Admin-only feature: the decklist image generator is reserved for the
  // Riftbound France admin (Discord role). Hidden for everyone else.
  const isAdmin = useIsAdmin();

  const imageParam = slug
    ? `slug=${slug}`
    : shareCode
      ? `share=${shareCode}`
      : null;

  if (!isAdmin || !imageParam) return null;

  const imageUrl = `/api/decklist-image?${imageParam}`;

  function handleShareTwitter() {
    const parts: string[] = [];
    parts.push(`${legendName}`);
    if (playerName) parts.push(`par ${playerName}`);
    if (tournamentContext) parts.push(`- ${tournamentContext}`);
    parts.push("");

    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://riftboundfrance.fr";
    const deckUrl = slug
      ? `${siteUrl}/decks/${slug}`
      : shareCode
        ? `${siteUrl}/d/${shareCode}`
        : siteUrl;

    parts.push(deckUrl);

    const tweetText = encodeURIComponent(parts.join("\n"));
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleCopyImageUrl() {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}${imageUrl}`
      : imageUrl;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleShareTwitter}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d9bf0]/10 px-3 py-1.5 text-xs font-medium text-[#1d9bf0] hover:bg-[#1d9bf0]/20 transition-colors"
        title="Partager sur Twitter"
      >
        <Share2 size={14} />
        Twitter
      </button>
      {/* Lien direct : le serveur renvoie l'image avec Content-Disposition, donc
          le fichier arrive nommé et en .png sans passer par un blob. */}
      <a
        href={`${imageUrl}&download=1`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
        title="Admin : image carrée 1000x1000 pour les réseaux"
      >
        <Download size={14} />
        Image 1:1
      </a>
      <button
        onClick={handleCopyImageUrl}
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-2.5 py-1.5 text-xs text-ink-muted hover:text-ink transition-colors"
        title="Copier le lien de l'image"
      >
        {copied ? <Check size={13} className="text-success" /> : <Share2 size={13} />}
      </button>
    </div>
  );
}
