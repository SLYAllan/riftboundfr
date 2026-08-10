"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, MessageSquare, Send, User as UserIcon } from "lucide-react";
import { DiscordAvatar } from "@/components/discord-avatar";
import { useT } from "@/components/i18n-provider";

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
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const queryParam = articleId
    ? `articleId=${articleId}`
    : `communityDeckId=${communityDeckId}`;
  const postPayload = articleId ? { articleId } : { communityDeckId };

  useEffect(() => {
    fetch(`/api/comments?${queryParam}`)
      .then((r) => r.json())
      .then(setComments);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d));
  }, [queryParam]);

  const submit = async (parentId?: string) => {
    if (!body.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...postPayload, body, parentId }),
    });
    if (res.ok) {
      setBody("");
      const fresh = await fetch(`/api/comments?${queryParam}`).then((r) => r.json());
      setComments(fresh);
    }
    setSending(false);
  };

  return (
    <div className="mt-12 border-t border-hairline pt-8">
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
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("Ajouter un commentaire...")}
              rows={3}
              className="w-full rounded-lg bg-surface-raised border border-hairline px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => submit()}
                disabled={!body.trim() || sending}
                className="flex items-center gap-1.5 rounded-lg bg-arcane px-4 py-1.5 text-sm font-medium text-canvas disabled:opacity-40 hover:bg-arcane-light transition-colors"
              >
                <Send size={14} />
                Envoyer
              </button>
            </div>
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
      <div className="space-y-4">
        {comments.map((comment) => (
          <CommentThread key={comment.id} comment={comment} postPayload={postPayload} queryParam={queryParam} user={user} onRefresh={async () => {
            const fresh = await fetch(`/api/comments?${queryParam}`).then((r) => r.json());
            setComments(fresh);
          }} />
        ))}
      </div>

      {comments.length === 0 && (
        <p className="text-center text-sm text-ink-muted py-8">{t("Aucun commentaire pour le moment. Soyez le premier !")}</p>
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
  const [sending, setSending] = useState(false);

  const score = comment.upvotes - comment.downvotes;
  const timeAgo = formatTimeAgo(comment.createdAt);

  const vote = async (value: number) => {
    if (!user) return;
    await fetch("/api/comments/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: comment.id, value }),
    });
    onRefresh();
  };

  const submitReply = async () => {
    if (!replyBody.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...postPayload, body: replyBody, parentId: comment.id }),
    });
    if (res.ok) {
      setReplyBody("");
      setReplying(false);
      onRefresh();
    }
    setSending(false);
  };

  return (
    <div className={depth > 0 ? "ml-6 pl-4 border-l border-hairline" : ""}>
      <div className="flex gap-3">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <button onClick={() => vote(1)} className="text-ink-muted hover:text-arcane transition-colors">
            <ChevronUp size={18} />
          </button>
          <span className={`text-xs font-bold tabular-nums ${score > 0 ? "text-arcane" : score < 0 ? "text-error" : "text-ink-muted"}`}>
            {score}
          </span>
          <button onClick={() => vote(-1)} className="text-ink-muted hover:text-error transition-colors">
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
          <p className="text-sm text-ink/90 whitespace-pre-wrap">{comment.body}</p>

          {/* Actions */}
          {user && depth === 0 && (
            <button
              onClick={() => setReplying(!replying)}
              className="mt-1 text-xs text-ink-muted hover:text-arcane transition-colors"
            >{t("Répondre")}</button>
          )}

          {/* Reply form */}
          {replying && (
            <div className="mt-2 flex gap-2">
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={t("Votre réponse...")}
                aria-label={t("Votre réponse")}
                rows={2}
                autoFocus
                className="flex-1 rounded-lg bg-surface-raised border border-hairline px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-arcane/50 resize-none"
              />
              <button
                onClick={submitReply}
                disabled={!replyBody.trim() || sending}
                className="self-end rounded-lg bg-arcane px-3 py-1.5 text-xs font-medium text-canvas disabled:opacity-40 hover:bg-arcane-light transition-colors"
              >
                <Send size={12} />
              </button>
            </div>
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
