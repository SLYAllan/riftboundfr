"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface CommunityActionsProps {
  shareCode: string;
  title: string;
  isPublic: boolean;
}

export function CommunityActions({ shareCode, title, isPublic }: CommunityActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleVisibility() {
    setLoading(true);
    await fetch(`/api/admin/community-decks/${shareCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !isPublic }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${title}" ?`)) return;
    setLoading(true);
    await fetch(`/api/admin/community-decks/${shareCode}`, {
      method: "DELETE",
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleVisibility}
        disabled={loading}
        className="text-xs px-2 py-1 rounded bg-surface-overlay text-ink-secondary hover:text-ink transition-colors disabled:opacity-50"
        title={isPublic ? "Rendre privé" : "Rendre public"}
      >
        {isPublic ? "Masquer" : "Afficher"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs px-2 py-1 rounded bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
        title="Supprimer"
      >
        Suppr
      </button>
    </div>
  );
}
