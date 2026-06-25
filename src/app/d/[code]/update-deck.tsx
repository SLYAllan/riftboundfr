"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Check, X } from "lucide-react";

interface Props {
  shareCode: string;
  ownerId: string | null;
}

export function UpdateDeckButton({ shareCode, ownerId }: Props) {
  const [isOwner, setIsOwner] = useState(false);
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [changelog, setChangelog] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function handleUpdate() {
    if (!newCode.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/community-decks/${shareCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckCode: newCode.trim(),
        changelog: changelog.trim() || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la mise à jour");
      setSaving(false);
      return;
    }
    setSaving(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors border border-hairline"
      >
        <RefreshCw size={13} />
        Mettre à jour le deck
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4 space-y-3">
      <h4 className="text-sm font-semibold text-ink">Mettre à jour le deck code</h4>
      <p className="text-xs text-ink-muted">L&apos;ancienne version sera conservée dans l&apos;historique.</p>
      <textarea
        value={newCode}
        onChange={(e) => setNewCode(e.target.value)}
        placeholder="Collez le nouveau deck code ici..."
        rows={4}
        className="w-full rounded-lg border border-hairline bg-surface-raised p-3 text-sm font-mono text-ink placeholder:text-ink-muted/50 resize-y"
      />
      <input
        value={changelog}
        onChange={(e) => setChangelog(e.target.value.slice(0, 500))}
        placeholder="Changelog (optionnel) - ex: ajout de 2 Rune of Haste"
        className="w-full rounded-lg border border-hairline bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleUpdate}
          disabled={saving || !newCode.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
        >
          <Check size={14} />
          {saving ? "Mise à jour..." : "Mettre à jour"}
        </button>
        <button
          onClick={() => { setOpen(false); setNewCode(""); setChangelog(""); setError(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-4 py-2 text-sm text-ink-secondary hover:text-ink"
        >
          <X size={14} />
          Annuler
        </button>
      </div>
    </div>
  );
}
