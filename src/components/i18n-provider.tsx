"use client";

import { createContext, useContext, useMemo } from "react";
import { prefixerLien, traduire, type Langue } from "@/lib/i18n";

const Contexte = createContext<Langue>("fr");

/**
 * Posé une fois dans le layout racine. Les composants serveur rendus à
 * l'intérieur peuvent contenir des composants client qui lisent ce contexte :
 * c'est ce qui évite de faire descendre la langue en props sur tout le site.
 */
export function FournisseurLangue({
  langue,
  children,
}: {
  langue: Langue;
  children: React.ReactNode;
}) {
  return <Contexte.Provider value={langue}>{children}</Contexte.Provider>;
}

export function useLangue(): Langue {
  return useContext(Contexte);
}

/**
 * Pour les navigations faites à la main (`router.push`), que le composant
 * `Lien` ne voit pas passer.
 */
export function useLien(): (href: string) => string {
  const langue = useLangue();
  return useMemo(() => (href: string) => prefixerLien(href, langue), [langue]);
}

/** `const t = useT()` puis `t("Tous les decks")`. */
export function useT(): (texte: string) => string {
  const langue = useLangue();
  return useMemo(() => (texte: string) => traduire(texte, langue), [langue]);
}
