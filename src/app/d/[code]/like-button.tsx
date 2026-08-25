"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { lireEtatLike } from "@/lib/reponses-utilisateur";
import { useT } from "@/components/i18n-provider";

interface Props {
  shareCode: string;
  initialLikes: number;
  isLoggedIn: boolean;
}

export function LikeButton({ shareCode, initialLikes, isLoggedIn }: Props) {
  const t = useT();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetch(`/api/community-decks/${shareCode}/like`)
      .then(lireEtatLike)
      .then((data) => {
        setError(null);
        setLiked(data.liked);
        setLikes(data.likes);
      })
      .catch(() => setError(t("Impossible de charger les J’aime. Réessayez.")));
  }, [shareCode, isLoggedIn, t]);

  async function handleToggle() {
    if (!isLoggedIn || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/community-decks/${shareCode}/like`, { method: "POST" });
      const data = await lireEtatLike(res);
      setLiked(data.liked);
      setLikes(data.likes); // valeur serveur (recomptée), pas d'optimiste divergent
    } catch {
      setError(t("Votre J’aime n’a pas été enregistré. Réessayez."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleToggle}
        disabled={!isLoggedIn || loading}
        title={t(isLoggedIn ? (liked ? "Retirer mon J’aime" : "J’aime ce deck") : "Connectez-vous pour aimer ce deck")}
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
      {error && <span role="alert" className="max-w-56 text-xs text-error-light">{error}</span>}
    </div>
  );
}
