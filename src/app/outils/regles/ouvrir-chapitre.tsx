"use client";

import { useEffect } from "react";

/**
 * Ouvre le chapitre visé par l'adresse (`#chapitre`). Un lien du sommaire mène à un
 * `<details>` replié : sans ce geste, la page défile jusqu'à un titre fermé.
 */
export function OuvrirChapitre() {
  useEffect(() => {
    const ouvrir = () => {
      const cible = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (cible instanceof HTMLDetailsElement) {
        cible.open = true;
        cible.scrollIntoView({ block: "start" });
      }
    };
    ouvrir();
    addEventListener("hashchange", ouvrir);
    return () => removeEventListener("hashchange", ouvrir);
  }, []);
  return null;
}
