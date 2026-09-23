import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import Lien from "@/components/lien";
import { cn } from "@/lib/utils";

/**
 * LE bouton principal du site : l'« Arrow Fill Button » d'obsidianui.dev, réglage
 * choisi par Allan le 23 septembre 2026. Au repos, une pastille au bout ; au
 * survol ou au focus clavier, elle s'étend à tout le bouton. Le style vit dans
 * globals.css (`.bouton`), pour qu'un bouton plein ne se réécrive plus classe par
 * classe dans chaque page.
 *
 * `BoutonLien` pour aller quelque part, `Bouton` pour une action. Les bascules
 * (onglets, filtres, vues) ne passent pas par ici : ce sont des choix, pas des
 * actions, et une flèche y ferait croire qu'on change de page.
 */

const VARIANTES = {
  primaire: "",
  contour: "bouton-contour",
  neutre: "bouton-neutre",
} as const;

export type VarianteBouton = keyof typeof VARIANTES;

interface Commun {
  variante?: VarianteBouton;
  /**
   * Ce que montre la pastille. Par défaut une flèche qui glisse au survol : elle
   * dit « on va ailleurs ». Une action (copier, publier) passe sa propre icône.
   */
  icone?: ReactNode;
  /** Mise en page seulement (largeur, marges) : le style appartient au bouton. */
  className?: string;
  children: ReactNode;
}

function Fleche() {
  // Deux flèches superposées : l'une entre par la gauche pendant que l'autre
  // sort par la droite.
  return (
    <svg className="bouton-fleche" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g>
        <path d="M1.5 6h8.5M6.5 2.5 10 6l-3.5 3.5" />
      </g>
      <g>
        <path d="M1.5 6h8.5M6.5 2.5 10 6l-3.5 3.5" />
      </g>
    </svg>
  );
}

function Contenu({ children, icone }: { children: ReactNode; icone?: ReactNode }) {
  return (
    <>
      <span className="inline-flex items-center gap-2">{children}</span>
      {/* Le calque répète le libellé dans les couleurs inversées : il est caché aux
          lecteurs d'écran, sinon le bouton se lirait deux fois. */}
      <span className="bouton-calque" aria-hidden="true">
        <span className="inline-flex items-center gap-2">{children}</span>
        <span className="bouton-icone">{icone ?? <Fleche />}</span>
      </span>
    </>
  );
}

export function BoutonLien({
  href,
  variante = "primaire",
  icone,
  className,
  children,
  ...reste
}: Commun & { href: string } & Omit<ComponentProps<typeof Lien>, "href" | "className" | "children">) {
  return (
    <Lien href={href} className={cn("bouton", VARIANTES[variante], className)} {...reste}>
      <Contenu icone={icone}>{children}</Contenu>
    </Lien>
  );
}

export function Bouton({
  variante = "primaire",
  icone,
  className,
  children,
  type = "button",
  ...reste
}: Commun & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">) {
  return (
    <button type={type} className={cn("bouton", VARIANTES[variante], className)} {...reste}>
      <Contenu icone={icone}>{children}</Contenu>
    </button>
  );
}
