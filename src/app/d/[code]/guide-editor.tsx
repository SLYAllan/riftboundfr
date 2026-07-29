"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import { MarkdownRenderer } from "@/components/markdown-renderer";

interface Props {
  shareCode: string;
  initialGuide: string | null;
  ownerId: string | null;
}

export function CommunityDeckGuide({ shareCode, initialGuide, ownerId }: Props) {
  const [guide, setGuide] = useState(initialGuide ?? "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(guide);
  const [saving, setSaving] = useState(false);
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

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/community-decks/${shareCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guide: draft }),
    });
    if (res.ok) {
      setGuide(draft);
      setEditing(false);
    }
    setSaving(false);
  }

  if (!guide && !isOwner) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-3">
        <h2
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-rubik), sans-serif" }}
        >
          Guide du deck
        </h2>
        {isOwner && !editing && (
          <button
            onClick={() => {
              setDraft(guide);
              setEditing(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <Pencil size={12} />
            {guide ? "Modifier" : "Ajouter un guide"}
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            maxLength={5000}
            placeholder="Décrivez votre stratégie, les matchups, les choix de cartes..."
            className="w-full rounded-lg border border-hairline bg-surface p-4 text-sm text-ink placeholder:text-ink-muted focus:border-arcane resize-y"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110 disabled:opacity-50"
            >
              <Check size={14} />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-raised px-4 py-2 text-sm text-ink-secondary hover:text-ink"
            >
              <X size={14} />
              Annuler
            </button>
            <span className="ml-auto text-xs text-ink-muted">
              {draft.length}/5000
            </span>
          </div>
        </div>
      ) : guide ? (
        <div className="mt-4">
          <MarkdownRenderer content={guide} />
        </div>
      ) : null}
    </div>
  );
}
