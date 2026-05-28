"use client";

import { useState, useEffect } from "react";
import { X, Upload, FileText, Hash, Gamepad2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [activeTab, setActiveTab] = useState<ImportFormat>("deckcode");
  const [text, setText] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleLinkImport() {
    const input = text.trim();
    const match = input.match(/\/d\/([a-zA-Z0-9]+)/);
    if (!match) {
      setLinkError("Lien invalide — format attendu : /d/xxxxxxxx");
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
      <div className="w-full max-w-lg rounded-card border border-hairline bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-2">
            <Upload size={18} className="text-arcane" />
            <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
              Importer un deck
            </h3>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
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
                Collez un lien de deck communautaire pour l&apos;importer dans le deckbuilder.
              </p>
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); setLinkError(null); }}
                className="w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 py-2.5 text-sm font-mono text-ink focus:border-arcane focus:outline-none placeholder:text-ink-muted/50"
                placeholder={currentTab.placeholder}
              />
              {linkError && <p className="text-xs text-red-400">{linkError}</p>}
            </div>
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink focus:border-arcane focus:outline-none placeholder:text-ink-muted/50"
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
              className="rounded-lg bg-arcane px-4 py-2 text-sm font-semibold text-white hover:brightness-110 transition-all disabled:opacity-30"
            >
              {linkLoading ? "Chargement..." : "Importer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
