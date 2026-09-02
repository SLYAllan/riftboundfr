"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronUp, ChevronDown, MessageSquare, Send, User as UserIcon } from "lucide-react";
import { DiscordAvatar } from "@/components/discord-avatar";
import { useT } from "@/components/i18n-provider";
import { EmotePicker } from "@/components/emote-picker";
import { TexteAvecEmotes } from "@/components/emote";
import { lireTableauJson } from "@/lib/reponse-json";

interface CommentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface CommentData {
  id: string;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  user: CommentUser;
  replies?: CommentData[];
}

interface CurrentUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface CommentsSectionProps {
  articleId?: string;
  communityDeckId?: string;
}

export function CommentsSection({ articleId, communityDeckId }: CommentsSectionProps) {
  const t = useT();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreurChargement, setErreurChargement] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [body, setBody] = useState("");
  const [erreurEnvoi, setErreurEnvoi] = useState(false);
  const champRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);

  const queryParam = articleId
    ? `articleId=${articleId}`
    : `communityDeckId=${communityDeckId}`;
  const postPayload = articleId ? { articleId } : { communityDeckId };

  // `r.ok` puis la forme : un 500 `{ error: … }` ou un corps qui n'est pas une
  // liste ne doivent jamais atterrir dans `comments` (le `.map` du rendu levait).
  const chargerCommentaires = useCallback(
    async (silencieux = false) => {
      if (!silencieux) setChargement(true);
      setErreurChargement(false);
      try {
        const reponse = await fetch(`/api/comments?${queryParam}`);
        setComments(await lireTableauJson<CommentData>(reponse));
      } catch {
        setErreurChargement(true);
      } finally {
        if (!silencieux) setChargement(false);
      }
    },
    [queryParam],
  );

  useEffect(() => {
    queueMicrotask(() => {
      void chargerCommentaires();
    });
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d && typeof d === "object" ? (d as CurrentUser) : null))
      .catch(() => {});
  }, [chargerCommentaires]);

  const submit = async (parentId?: string) => {
    if (!body.trim() || sending) return;
    setSending(true);
    setErreurEnvoi(false);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...postPayload, body, parentId }),
      });
      if (!res.ok) {
        setErreurEnvoi(true);
        return;
      }
      setBody("");
      await chargerCommentaires(true);
    } catch {
      setErreurEnvoi(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="commentaires" className="mt-12 border-t border-hairline pt-8">
      <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-rubik)" }}>
        <MessageSquare size={20} className="inline mr-2 -mt-0.5" />
        Commentaires ({comments.reduce((a, c) => a + 1 + (c.replies?.length || 0), 0)})
      </h2>

      {/* New comment form */}
      {user ? (
        <div className="flex gap-3 mb-8">
          <DiscordAvatar src={user.avatarUrl} alt="" size={36} className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
            fallback={<div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-surface-raised"><UserIcon size={16} className="text-ink-muted" /></div>} />
          <div className="flex-1">
            <textarea
              ref={champRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("Ajouter un commentaire...")}
              aria-label={t("Votre commentaire")}
              rows={3}
              className="w-full rounded-lg bg-surface-raised border border-hairline px-3 py-2 text-base sm:text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50 resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <EmotePicker champRef={champRef} onTexte={setBody} />
              <button
                onClick={() => submit()}
                disabled={!body.trim() || sending}
                className="flex min-h-11 items-center gap-1.5 rounded-lg bg-arcane px-4 text-sm font-medium text-canvas disabled:opacity-40 hover:bg-arcane-light transition-colors"
              >
                <Send size={14} />
                Envoyer
              </button>
            </div>
            {erreurEnvoi && (
              <p role="alert" className="mt-2 text-xs text-error-light">
                Impossible d&apos;enregistrer votre commentaire.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-lg border border-hairline bg-surface p-4 text-center">
          <p className="text-sm text-ink-secondary mb-2">{t("Connectez-vous pour commenter")}</p>
          <a
            href="/api/auth/discord"
            className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-medium text-white hover:bg-[#4752C4] transition-colors"
          >
            Connexion Discord
          </a>
        </div>
      )}

      {/* Comments list */}
      {chargement ? (
        <p className="text-center text-sm text-ink-muted py-8">{t("Chargement…")}</p>
      ) : erreurChargement ? (
        <div role="alert" className="rounded-lg border border-hairline bg-surface p-4 text-center">
          <p className="text-sm text-ink-secondary mb-2">{t("Les commentaires n’ont pas pu se charger. Vérifiez votre connexion, puis réessayez.")}</p>
          <button
            onClick={() => void chargerCommentaires()}
            className="min-h-11 rounded-lg bg-surface-raised px-4 text-sm font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            {t("Réessayer")}
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentThread key={comment.id} comment={comment} postPayload={postPayload} queryParam={queryParam} user={user} onRefresh={() => void chargerCommentaires(true)} />
            ))}
          </div>

          {comments.length === 0 && (
            <p className="text-center text-sm text-ink-muted py-8">{t("Aucun commentaire pour le moment. Soyez le premier !")}</p>
          )}
        </>
      )}
    </div>
  );
}

function CommentThread({
  comment,
  postPayload,
  queryParam,
  user,
  onRefresh,
  depth = 0,
}: {
  comment: CommentData;
  postPayload: Record<string, string | undefined>;
  queryParam: string;
  user: CurrentUser | null;
  onRefresh: () => void;
  depth?: number;
}) {
  const t = useT();
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const reponseRef = useRef<HTMLTextAreaElement>(null);
  const [sending, setSending] = useState(false);
  const [erreurVote, setErreurVote] = useState(false);
  const [erreurReponse, setErreurReponse] = useState(false);

  const score = comment.upvotes - comment.downvotes;
  const timeAgo = formatTimeAgo(comment.createdAt);

  const vote = async (value: number) => {
    if (!user) return;
    setErreurVote(false);
    try {
      const res = await fetch("/api/comments/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id, value }),
      });
      if (!res.ok) {
        setErreurVote(true);
        return;
      }
      onRefresh();
    } catch {
      setErreurVote(true);
    }
  };

  const submitReply = async () => {
    if (!replyBody.trim() || sending) return;
    setSending(true);
    setErreurReponse(false);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...postPayload, body: replyBody, parentId: comment.id }),
      });
      if (!res.ok) {
        setErreurReponse(true);
        return;
      }
      setReplyBody("");
      setReplying(false);
      onRefresh();
    } catch {
      setErreurReponse(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-hairline" : ""}>
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button onClick={() => vote(1)} aria-label={t("Voter pour")} className="flex min-h-11 min-w-11 items-center justify-center text-ink-muted hover:text-arcane transition-colors">
            <ChevronUp size={18} />
          </button>
          <span className={`text-xs font-bold tabular-nums ${score > 0 ? "text-arcane" : score < 0 ? "text-error-light" : "text-ink-muted"}`}>
            {score}
          </span>
          <button onClick={() => vote(-1)} aria-label={t("Voter contre")} className="flex min-h-11 min-w-11 items-center justify-center text-ink-muted hover:text-error transition-colors">
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <DiscordAvatar src={comment.user.avatarUrl} alt="" size={20} className="h-5 w-5 rounded-full object-cover"
              fallback={<div className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-raised"><UserIcon size={10} className="text-ink-muted" /></div>} />
            <span className="text-sm font-medium text-ink">{comment.user.username}</span>
            <span className="text-xs text-ink-muted">{timeAgo}</span>
          </div>

          {/* Body */}
          <p className="text-sm text-ink/90 whitespace-pre-wrap">
            <TexteAvecEmotes texte={comment.body} />
          </p>

          {erreurVote && (
            <p role="alert" className="mt-1 text-xs text-error-light">
              Impossible d&apos;enregistrer votre vote.
            </p>
          )}

          {/* Actions */}
          {user && depth === 0 && (
            <button
              onClick={() => setReplying(!replying)}
              className="mt-1 flex min-h-11 items-center text-xs text-ink-muted hover:text-arcane transition-colors"
            >{t("Répondre")}</button>
          )}

          {/* Reply form */}
          {replying && (
            <>
              <div className="mt-2 flex gap-2">
                <textarea
                  ref={reponseRef}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={t("Votre réponse...")}
                  aria-label={t("Votre réponse")}
                  rows={2}
                  autoFocus
                  className="flex-1 rounded-lg bg-surface-raised border border-hairline px-3 py-1.5 text-base sm:text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50 resize-none"
                />
                <div className="flex flex-col justify-end gap-1">
                  <EmotePicker champRef={reponseRef} onTexte={setReplyBody} />
                  <button
                    onClick={submitReply}
                    disabled={!replyBody.trim() || sending}
                    aria-label={t("Envoyer la réponse")}
                    className="flex size-9 items-center justify-center rounded-lg bg-arcane text-xs font-medium text-canvas disabled:opacity-40 hover:bg-arcane-light transition-colors"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
              {erreurReponse && (
                <p role="alert" className="mt-1 text-xs text-error-light">
                  Impossible d&apos;enregistrer votre réponse.
                </p>
              )}
            </>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentThread key={reply.id} comment={reply} postPayload={postPayload} queryParam={queryParam} user={user} onRefresh={onRefresh} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR");
}
