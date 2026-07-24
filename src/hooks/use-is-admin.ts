"use client";

import { useEffect, useState } from "react";

// Une seule requête par page, même si dix decklists demandent le rôle
// (un article best-of en affiche une par Légende).
let adminCheck: Promise<boolean> | null = null;

export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    adminCheck ??= fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d?.role === "admin")
      .catch(() => false);

    let active = true;
    adminCheck.then((v) => {
      if (active) setIsAdmin(v);
    });
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
}
