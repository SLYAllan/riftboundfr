"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useT } from "@/components/i18n-provider";

interface ProfileActionsProps {
  userId: string;
  username: string;
  riotGameName: string | null;
  riotTagLine: string | null;
}

export function ProfileActions({ userId, username, riotGameName, riotTagLine }: ProfileActionsProps) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [newRiotName, setNewRiotName] = useState(riotGameName ?? "");
  const [newRiotTag, setNewRiotTag] = useState(riotTagLine ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername.trim() || username,
          riotGameName: newRiotName.trim() || null,
          riotTagLine: newRiotTag.trim() || null,
        }),
      });
      if (res.ok) {
        setEditing(false);
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
      >
        <Pencil size={13} />{" "}{t("Modifier le profil")}</button>
    );
  }

  return (
    <div className="space-y-3 rounded-card border border-hairline bg-surface p-4">
      <div>
        <label className="text-xs font-medium text-ink-muted">Pseudo</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          maxLength={30}
          className="mt-1 w-full rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-sm text-ink focus:border-arcane"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-ink-muted">Riot ID</label>
          <input
            type="text"
            value={newRiotName}
            onChange={(e) => setNewRiotName(e.target.value)}
            placeholder="GameName"
            className="mt-1 w-full rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-arcane"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink-muted">Tag</label>
          <input
            type="text"
            value={newRiotTag}
            onChange={(e) => setNewRiotTag(e.target.value)}
            placeholder="TAG"
            maxLength={5}
            className="mt-1 w-full rounded-lg border border-hairline bg-surface-raised px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-arcane"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-arcane px-3 py-1.5 text-sm font-medium text-canvas hover:bg-arcane-light transition-colors disabled:opacity-50"
        >
          <Check size={14} /> {saving ? "..." : "Enregistrer"}
        </button>
        <button
          onClick={() => { setEditing(false); setNewUsername(username); setNewRiotName(riotGameName ?? ""); setNewRiotTag(riotTagLine ?? ""); }}
          className="flex items-center gap-1.5 rounded-lg bg-surface-raised px-3 py-1.5 text-sm text-ink-secondary hover:text-ink transition-colors"
        >
          <X size={14} /> Annuler
        </button>
      </div>
    </div>
  );
}
