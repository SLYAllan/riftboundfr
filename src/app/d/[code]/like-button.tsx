"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  shareCode: string;
  initialLikes: number;
  isLoggedIn: boolean;
}

export function LikeButton({ shareCode, initialLikes, isLoggedIn }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/community-decks/${shareCode}/like`)
      .then((r) => r.json())
      .then((data) => {
        setLiked(data.liked);
        setLikes(data.likes);
      })
      .catch(() => {});
  }, [shareCode, isLoggedIn]);

  async function handleToggle() {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/community-decks/${shareCode}/like`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setLiked(data.liked);
        setLikes(data.likes); // valeur serveur (recomptée), pas d'optimiste divergent
      }
    } catch {}
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={!isLoggedIn || loading}
      title={isLoggedIn ? (liked ? "Retirer le like" : "Liker ce deck") : "Connectez-vous pour liker"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        liked
          ? "bg-red-500 text-canvas hover:opacity-90"
          : isLoggedIn
            ? "bg-surface border border-hairline text-ink-muted hover:text-red-400 hover:border-red-400/30"
            : "bg-surface border border-hairline text-ink-muted opacity-60 cursor-not-allowed",
      )}
    >
      <Heart size={16} className={cn(liked && "fill-current")} />
      {likes}
    </button>
  );
}
