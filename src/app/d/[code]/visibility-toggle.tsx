"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  shareCode: string;
  initialIsPublic: boolean;
}

export function VisibilityToggle({ shareCode, initialIsPublic }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState(false);

  async function handleToggle() {
    setLoading(true);
    setErreur(false);
    try {
      const res = await fetch(`/api/community-decks/${shareCode}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (!res.ok) {
        setErreur(true);
        return;
      }
      setIsPublic(!isPublic);
    } catch {
      setErreur(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          isPublic
            ? "bg-success/10 text-success hover:bg-success/20"
            : "bg-surface border border-hairline text-ink-muted hover:text-ink",
        )}
      >
        {isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
        {isPublic ? "Public" : "Non listé"}
      </button>
      {erreur && (
        <span role="alert" className="text-xs text-error-light">
          Impossible d&apos;enregistrer la visibilité.
        </span>
      )}
    </span>
  );
}
