"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "liked-decks";

function getLikedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setLikedSlugs(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {}
}

interface DeckLikeButtonProps {
  slug: string;
  initialLikes: number;
  compact?: boolean;
}

export function DeckLikeButton({ slug, initialLikes, compact }: DeckLikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [animating, setAnimating] = useState(false);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setLiked(getLikedSlugs().includes(slug));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setLoggedIn(data !== null))
      .catch(() => setLoggedIn(false));
  }, [slug]);

  const toggle = useCallback(async () => {
    if (!loggedIn) {
      window.location.href = "/api/auth/discord";
      return;
    }

    const wasLiked = liked;
    const newLiked = !wasLiked;

    setLiked(newLiked);
    setLikes((prev) => prev + (newLiked ? 1 : -1));

    if (newLiked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }

    const slugs = getLikedSlugs();
    if (newLiked) {
      if (!slugs.includes(slug)) slugs.push(slug);
    } else {
      const idx = slugs.indexOf(slug);
      if (idx !== -1) slugs.splice(idx, 1);
    }
    setLikedSlugs(slugs);

    try {
      const res = await fetch(`/api/decks/${encodeURIComponent(slug)}/like`, {
        method: newLiked ? "POST" : "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
      } else if (res.status === 401) {
        window.location.href = "/api/auth/discord";
        return;
      } else {
        setLiked(wasLiked);
        setLikes((prev) => prev + (wasLiked ? 1 : -1));
        const revertSlugs = getLikedSlugs();
        if (wasLiked) {
          if (!revertSlugs.includes(slug)) revertSlugs.push(slug);
        } else {
          const idx = revertSlugs.indexOf(slug);
          if (idx !== -1) revertSlugs.splice(idx, 1);
        }
        setLikedSlugs(revertSlugs);
      }
    } catch {
      setLiked(wasLiked);
      setLikes((prev) => prev + (wasLiked ? 1 : -1));
    }
  }, [liked, slug, loggedIn]);

  if (compact) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle();
        }}
        className={cn(
          // min-h-6 : sans lui la pastille fait 23px, juste sous le minimum de
          // 24px de WCAG 2.5.8.
          "inline-flex min-h-6 items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-semibold backdrop-blur-sm transition-colors",
          liked ? "text-red-400" : "text-white hover:text-red-400",
        )}
        title={loggedIn === false ? "Connectez-vous pour aimer" : liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart
          size={15}
          className={cn(
            "transition-transform",
            liked && "fill-current",
            animating && "scale-125",
          )}
        />
        {likes > 0 && <span>{likes}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
        liked
          ? "bg-red-500 text-canvas hover:opacity-90"
          : "bg-surface-raised text-ink-muted hover:text-red-400",
      )}
      title={loggedIn === false ? "Connectez-vous pour aimer" : liked ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart
        size={16}
        className={cn(
          "transition-transform duration-200",
          liked && "fill-current",
          animating && "scale-125",
        )}
      />
      <span>{likes}</span>
      <span className="hidden sm:inline">J&apos;aime</span>
    </button>
  );
}
