"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface Props {
  shareCode: string;
  ownerId: string | null;
}

// Le bouton menait à un champ où il fallait coller un deck code à la main. Il ouvre
// maintenant le deckbuilder avec la liste chargée : on modifie les cartes, puis on
// valide avec un changelog depuis la fenêtre d'export.
export function UpdateDeckButton({ shareCode, ownerId }: Props) {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!ownerId) return;
    fetch("/api/community-decks/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.id === ownerId) setIsOwner(true);
      })
      .catch(() => {});
  }, [ownerId]);

  if (!isOwner) return null;

  return (
    <a
      href={`/deckbuilder?maj=${encodeURIComponent(shareCode)}`}
      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors border border-hairline"
    >
      <RefreshCw size={13} />
      Modifier le deck
    </a>
  );
}
