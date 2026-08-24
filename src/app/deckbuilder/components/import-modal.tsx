"use client";

import { useState } from "react";
import { X, Upload, FileText, Hash, Gamepad2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDialogA11y } from "@/hooks/use-dialog-a11y";
import { useT } from "@/components/i18n-provider";

type ImportFormat = "deckcode" | "cardnames" | "tts" | "link";

interface ImportModalProps {
  onImport: (text: string, format: ImportFormat) => void;
  onClose: () => void;
}

const TABS: { key: ImportFormat; label: string; icon: typeof FileText; placeholder: string }[] = [
  {
    key: "deckcode",
    label: "Deck Code",
    icon: Hash,
    placeholder: "Collez votre deck code encodé ici...",
  },
  {
    key: "cardnames",
    label: "Noms de cartes",
    icon: FileText,
    placeholder: "== Legend ==\n1x Irelia - Blade Dancer\n== Main Deck ==\n3x Card Name\n2x Another Card\n== Runes ==\n7x Fury Rune\n5x Calm Rune\n== Battlefield ==\n1x Battlefield Name",
  },
  {
    key: "tts",
    label: "TTS",
    icon: Gamepad2,
    placeholder: "OGN-249-1 OGN-046-1 OGN-046-1 OGN-046-1 ...",
  },
  {
    key: "link",
    label: "Lien",
    icon: Link2,
    placeholder: "https://riftboundfrance.fr/d/abc12345",
  },
];

export function ImportModal({ onImport, onClose }: ImportModalProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<ImportFormat>("deckcode");
  const [text, setText] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Escape + piège de focus + retour de focus gérés par le hook a11y.
  const dialogRef = useDialogA11y(onClose);

  async function handleLinkImport() {
    const input = text.trim();
    const match = input.match(/\/d\/([a-zA-Z0-9]+)/);
    if (!match) {
      setLinkError("Lien invalide - format attendu : /d/xxxxxxxx");
      return;
    }
    setLinkLoading(true);
    setLinkError(null);
    try {
      const res = await fetch(`/api/community-decks/${match[1]}`);
      if (!res.ok) {
        setLinkError("Deck introuvable");
        setLinkLoading(false);
        return;
      }
      const data = await res.json();
      if (data.deckCode) {
        onImport(data.deckCode, "cardnames");
      } else {
        setLinkError("Pas de deck code trouvé");
      }
    } catch {
      setLinkError("Erreur de connexion");
    }
    setLinkLoading(false);
  }

  function handleDetectAndImport() {
    if (!text.trim()) return;

    if (activeTab === "link") {
      handleLinkImport();
      return;
    }

    let format = activeTab;

    if (activeTab === "deckcode") {
      if (text.includes("==") || /^\d+x?\s+/m.test(text)) {
        format = "cardnames";
      } else if (/^[A-Z]{2,3}-\d+-\d+/.test(text.trim())) {
        format = "tts";
      }
    }

    onImport(text, format);
  }

  const currentTab = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="import-modal-title" tabIndex={-1} className="w-full max-w-lg rounded-card border border-hairline bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-arcane" />
            <h3 id="import-modal-title" className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              {t("Importer un deck")}
            </h3>
          </div>
          <button onClick={onClose} aria-label={t("Fermer")} className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b border-hairline">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setText(""); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors relative",
                activeTab === tab.key ? "text-arcane" : "text-ink-muted hover:text-ink",
              )}
            >
              <tab.icon size={13} />
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcane" />}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3">
          {activeTab === "link" ? (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">
                {t("Collez un lien de deck communautaire pour l’importer dans le deckbuilder.")}
              </p>
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); setLinkError(null); }}
                className="w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 py-2.5 text-sm font-mono text-ink focus:border-arcane placeholder:text-ink-muted/50"
                placeholder={currentTab.placeholder}
              />
              {linkError && <p className="text-xs text-red-400">{linkError}</p>}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink focus:border-arcane placeholder:text-ink-muted/50"
              placeholder={currentTab.placeholder}
            />
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-ink-secondary hover:text-ink transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDetectAndImport}
              disabled={!text.trim() || linkLoading}
              className="rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-canvas hover:brightness-110 transition disabled:opacity-30"
            >
              {linkLoading ? "Chargement..." : "Importer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
