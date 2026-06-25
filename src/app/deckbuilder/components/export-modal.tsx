"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Link2, Hash, Gamepad2, Image } from "lucide-react";
import { cn } from "@/lib/utils";

type ExportTab = "link" | "deckcode" | "tts" | "image";

interface UserData {
  id: string;
  username: string;
  avatarUrl: string | null;
  discordName: string | null;
}

interface ExportModalProps {
  shareUrl: string;
  textCode: string;
  ttsCode: string;
  deckTitle: string;
  isEmpty: boolean;
  isDeckValid: boolean;
  onPublish: (isPublic: boolean, opts: { tags: string[]; description: string }) => Promise<string | null>;
  onExportImage: () => void;
  onClose: () => void;
}

const AVAILABLE_TAGS = [
  { value: "aggro", label: "Aggro" },
  { value: "contrôle", label: "Contrôle" },
  { value: "combo", label: "Combo" },
  { value: "midrange", label: "Midrange" },
  { value: "tempo", label: "Tempo" },
  { value: "budget", label: "Budget" },
  { value: "compétitif", label: "Compétitif" },
] as const;

const TABS: { key: ExportTab; label: string; icon: typeof Hash }[] = [
  { key: "link", label: "Lien", icon: Link2 },
  { key: "deckcode", label: "Deck Code", icon: Hash },
  { key: "tts", label: "TTS", icon: Gamepad2 },
  { key: "image", label: "Image", icon: Image },
];

export function ExportModal({
  shareUrl, textCode, ttsCode, deckTitle, isEmpty, isDeckValid,
  onPublish, onExportImage, onClose,
}: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>("link");
  const [copied, setCopied] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [unlisted, setUnlisted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setUserLoading(false);
      })
      .catch(() => setUserLoading(false));
  }, []);

  async function copyToClipboard(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 5 ? [...prev, tag] : prev,
    );
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishError(null);
    const result = await onPublish(!unlisted, { tags: selectedTags, description: description.trim() });
    if (result?.startsWith("http")) {
      setPublishedUrl(result);
    } else if (result) {
      setPublishError(result);
    }
    setPublishing(false);
  }

  const canPublish = !isEmpty && isDeckValid && !!user && !publishing;

  const validationIssues: string[] = [];
  if (!isDeckValid && !isEmpty) {
    validationIssues.push("Le deck doit être complet (légende, min. 40 cartes, 12 runes, 1-3 champs de bataille)");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-card border border-hairline bg-surface" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            Exporter - {deckTitle}
          </h3>
          <button onClick={onClose} className="text-ink-muted hover:text-ink"><X size={20} /></button>
        </div>

        <div className="flex border-b border-hairline overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors relative whitespace-nowrap",
                activeTab === tab.key ? "text-arcane" : "text-ink-muted hover:text-ink",
              )}
            >
              <tab.icon size={13} />
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-arcane" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "link" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-ink-secondary">Lien de partage</label>
                <div className="mt-1.5 flex gap-2">
                  <input readOnly value={shareUrl} className="flex-1 h-9 rounded-lg border border-hairline-strong bg-surface-raised px-3 text-sm text-ink font-mono" />
                  <button
                    onClick={() => copyToClipboard(shareUrl, "url")}
                    className="flex items-center gap-1 rounded-lg bg-arcane px-3 py-1 text-xs font-semibold text-white hover:brightness-110"
                  >
                    {copied === "url" ? <Check size={13} /> : <Copy size={13} />}
                    {copied === "url" ? "Copié !" : "Copier"}
                  </button>
                </div>
              </div>

              <div className="border-t border-hairline pt-4">
                <label className="text-sm font-semibold text-ink-secondary">Publier dans la communauté</label>

                {userLoading ? (
                  <p className="text-xs text-ink-muted mt-2">Chargement...</p>
                ) : !user ? (
                  <div className="mt-3">
                    <p className="text-xs text-ink-muted mb-3">Connectez-vous avec Discord pour publier votre deck.</p>
                    <a
                      href="/api/auth/discord"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
                    >
                      <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
                        <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18 -.9 30.6.3 43a.3.3 0 00.1.2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.6 43a.2.2 0 00.1-.2c1.4-14.5-2.4-27-10.1-38.2a.2.2 0 00-.1 0zM23.7 35.2c-3.3 0-6-3-6-6.7s2.7-6.7 6-6.7c3.4 0 6.1 3 6 6.7 0 3.7-2.6 6.7-6 6.7zm22.2 0c-3.3 0-6-3-6-6.7s2.6-6.7 6-6.7c3.3 0 6 3 6 6.7 0 3.7-2.6 6.7-6 6.7z" />
                      </svg>
                      Se connecter avec Discord
                    </a>
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3 rounded-lg bg-surface-raised px-3 py-2">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-arcane/20 text-arcane text-xs font-bold">
                          {user.username[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink truncate">{user.username}</p>
                        {user.discordName && (
                          <p className="text-xs text-ink-muted truncate">@{user.discordName}</p>
                        )}
                      </div>
                    </div>

                    {validationIssues.length > 0 && (
                      <p className="text-xs text-amber-400">{validationIssues[0]}</p>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-ink-secondary">Tags (optionnel)</label>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {AVAILABLE_TAGS.map((tag) => (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => toggleTag(tag.value)}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                              selectedTags.includes(tag.value)
                                ? "bg-violet text-white"
                                : "bg-surface-raised text-ink-muted hover:text-ink hover:bg-surface-raised/80 border border-hairline",
                            )}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-ink-secondary">Description (optionnel)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                        placeholder="Décrivez brièvement votre deck..."
                        rows={2}
                        className="mt-1.5 w-full rounded-lg border border-hairline-strong bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted/50 resize-none"
                      />
                      <p className="text-[10px] text-ink-muted text-right">{description.length}/500</p>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-ink-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={unlisted}
                        onChange={(e) => setUnlisted(e.target.checked)}
                        className="accent-arcane rounded"
                      />
                      Non listé
                      <span className="text-xs text-ink-muted">- accessible via lien uniquement</span>
                    </label>

                    <button
                      onClick={handlePublish}
                      disabled={!canPublish}
                      className="w-full rounded-lg bg-violet px-3 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-30 transition-all"
                    >
                      {publishing ? "Publication..." : unlisted ? "Créer le lien" : "Publier le deck"}
                    </button>

                    {publishError && (
                      <p className="text-xs text-red-400">{publishError}</p>
                    )}

                    {publishedUrl && (
                      <div className="flex items-center gap-2">
                        <input readOnly value={publishedUrl} className="flex-1 h-8 rounded-lg border border-hairline-strong bg-surface-raised px-3 text-xs text-violet font-mono" />
                        <button onClick={() => copyToClipboard(publishedUrl!, "pub")} className="text-[10px] text-violet hover:underline">
                          {copied === "pub" ? "Copié !" : "Copier"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "deckcode" && (
            <div className="relative">
              <textarea readOnly value={textCode} rows={12} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink" />
              <button
                onClick={() => copyToClipboard(textCode, "code")}
                className="absolute top-2 right-2 flex items-center gap-1 rounded bg-surface px-2 py-1 text-[10px] text-ink-secondary hover:text-ink"
              >
                {copied === "code" ? <Check size={11} /> : <Copy size={11} />}
                {copied === "code" ? "Copié !" : "Copier"}
              </button>
            </div>
          )}

          {activeTab === "tts" && (
            <div className="space-y-3">
              <p className="text-xs text-ink-muted">Format Tabletop Simulator - collez dans TTS ou Pixelborn.</p>
              <div className="relative">
                <textarea readOnly value={ttsCode} rows={6} className="w-full rounded-lg border border-hairline-strong bg-surface-raised p-3 text-sm font-mono text-ink break-all" />
                <button
                  onClick={() => copyToClipboard(ttsCode, "tts")}
                  className="absolute top-2 right-2 flex items-center gap-1 rounded bg-surface px-2 py-1 text-[10px] text-ink-secondary hover:text-ink"
                >
                  {copied === "tts" ? <Check size={11} /> : <Copy size={11} />}
                  {copied === "tts" ? "Copié !" : "Copier"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "image" && (
            <div className="text-center py-6">
              <p className="text-sm text-ink-secondary mb-4">Exportez votre deck en image PNG.</p>
              <button
                onClick={onExportImage}
                className="rounded-lg bg-arcane px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
              >
                <Image size={15} className="inline mr-1.5" />
                Générer l&apos;image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
