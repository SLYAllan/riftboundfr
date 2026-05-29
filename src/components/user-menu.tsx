"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, Layers, Shield } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  avatarUrl: string | null;
  discordName: string | null;
  riotGameName: string | null;
  role: string;
}

export function UserMenu() {
  const [user, setUser] = useState<UserData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setOpen(false);
  };

  if (loading) return null;

  if (!user) {
    return (
      <a
        href="/api/auth/discord"
        className="flex items-center gap-2 rounded-lg bg-[#5865F2] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#4752C4]"
      >
        <svg width="16" height="12" viewBox="0 0 71 55" fill="currentColor">
          <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54 54 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 4.9a.2.2 0 00-.1.1C1.5 18 -.9 30.6.3 43a.3.3 0 00.1.2 58.7 58.7 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.7 38.7 0 01-5.5-2.6.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 41.9 41.9 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4 36.4 36.4 0 01-5.5 2.6.2.2 0 00-.1.3 47.2 47.2 0 003.6 5.9.2.2 0 00.3.1A58.5 58.5 0 0070.6 43a.2.2 0 00.1-.2c1.4-14.5-2.4-27-10.1-38.2a.2.2 0 00-.1 0zM23.7 35.2c-3.3 0-6-3-6-6.7s2.7-6.7 6-6.7c3.4 0 6.1 3 6 6.7 0 3.7-2.6 6.7-6 6.7zm22.2 0c-3.3 0-6-3-6-6.7s2.6-6.7 6-6.7c3.3 0 6 3 6 6.7 0 3.7-2.6 6.7-6 6.7z" />
        </svg>
        Connexion
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-surface-raised"
      >
        {user.avatarUrl ? (
          <Image src={user.avatarUrl} alt="" width={28} height={28} className="rounded-full" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-raised">
            <UserIcon size={14} className="text-ink-muted" />
          </div>
        )}
        <span className="hidden text-sm font-medium text-ink sm:block">{user.username}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-hairline bg-surface p-1 shadow-xl">
          <div className="px-3 py-2 border-b border-hairline mb-1">
            <p className="text-sm font-medium text-ink truncate">{user.username}</p>
            {user.discordName && (
              <p className="text-xs text-ink-muted truncate">@{user.discordName}</p>
            )}
          </div>
          {user.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gold hover:bg-surface-raised transition-colors"
            >
              <Shield size={14} />
              Administration
            </Link>
          )}
          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary hover:bg-surface-raised transition-colors"
          >
            <UserIcon size={14} />
            Mon profil
          </Link>
          <Link
            href="/profil#mes-decks"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary hover:bg-surface-raised transition-colors"
          >
            <Layers size={14} />
            Mes decks
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-secondary hover:bg-surface-raised transition-colors"
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
