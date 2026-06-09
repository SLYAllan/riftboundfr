"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // En développement, le SW met en cache (cache-first) les chunks JS de
    // Turbopack dont les noms sont stables → il sert du code périmé malgré le
    // hot reload. On ne l'enregistre qu'en production (où les chunks Next sont
    // hashés, donc un nouveau build = nouveaux noms = pas de cache périmé), et
    // on désinscrit tout SW existant + vide ses caches en dev.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if (typeof caches !== "undefined") {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Service worker registration failed — silently ignore
    });
  }, []);

  return null;
}
