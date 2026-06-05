"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

interface CollectionCtx {
  quantities: Record<string, number>;
  loggedIn: boolean;
  setQuantity: (cardId: string, qty: number) => void;
}

const Ctx = createContext<CollectionCtx>({
  quantities: {},
  loggedIn: false,
  setQuantity: () => {},
});

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/collection")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data === "object" && !("error" in data)) {
          setQuantities(data as Record<string, number>);
          setLoggedIn(true);
        }
      })
      .catch(() => {});
  }, []);

  const setQuantity = useCallback((cardId: string, qty: number) => {
    const next = Math.max(0, qty);
    setQuantities((prev) => {
      const updated = { ...prev };
      if (next <= 0) delete updated[cardId];
      else updated[cardId] = next;
      return updated;
    });
    fetch("/api/collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, quantity: next }),
    }).catch(() => {});
  }, []);

  return <Ctx.Provider value={{ quantities, loggedIn, setQuantity }}>{children}</Ctx.Provider>;
}

export const useCollection = () => useContext(Ctx);
