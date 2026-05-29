"use client";

import { useState, useEffect } from "react";
import { Share2, Download, Check, Loader2 } from "lucide-react";

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
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  // Admin-only feature: the decklist image generator is reserved for the
  // Riftbound France admin (Discord role). Hidden for everyone else.
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (active) setIsAdmin(data?.role === "admin");
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const imageParam = slug
    ? `slug=${slug}`
    : shareCode
      ? `share=${shareCode}`
      : null;

  if (!isAdmin || !imageParam) return null;

  const imageUrl = `/api/decklist-image?${imageParam}`;

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error("Failed to generate image");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `${deckTitle.replace(/\s+/g, "-").toLowerCase()}-decklist.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent fail
    }
    setDownloading(false);
  }

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
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors disabled:opacity-50"
        title="Telecharger l'image decklist"
      >
        {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
        {downloading ? "..." : "Image 9:16"}
      </button>
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
