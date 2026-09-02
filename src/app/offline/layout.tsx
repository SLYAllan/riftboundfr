import type { Metadata } from "next";

/**
 * La page hors-ligne héritait du `index, follow` du site : elle finissait dans
 * l'index comme une page ordinaire, alors qu'elle ne dit qu'une chose, « pas de
 * réseau ». Le composant est côté navigateur, d'où ce layout pour les métadonnées.
 */
export const metadata: Metadata = {
  title: { absolute: "Hors ligne - Riftbound France" },
  robots: { index: false, follow: false },
};

export default function LayoutHorsLigne({ children }: { children: React.ReactNode }) {
  return children;
}
