"use client";
import styles from "./overlay.module.css";

/**
 * Texte qui rentre toujours, sans troncature ni coupe.
 *
 * La version precedente mesurait le texte rendu puis appliquait une reduction. Ca
 * marchait dans un navigateur ordinaire et jamais dans celui d'OBS, ou la mesure
 * revenait toujours egale a la largeur du cadre. On ne mesure donc plus rien : la
 * taille se deduit du nombre de caracteres, contre le nombre qui tient a taille
 * pleine (`chars`). C'est moins fin qu'une mesure, mais c'est deterministe, rendu
 * cote serveur, et identique dans tous les navigateurs.
 *
 * Le fondu se rejoue a chaque changement de valeur, grace a la cle sur le contenu.
 */
export function FitText({
  children,
  chars,
  className = "",
}: {
  children: string;
  /** Nombre de caracteres qui tiennent sur une ligne a taille pleine. */
  chars: number;
  className?: string;
}) {
  const n = children.length;
  const k = n > chars ? Math.max(0.45, chars / n) : 1;
  return (
    <span className={`block w-full overflow-hidden text-center ${className}`}>
      <span
        key={children}
        className={`inline-block whitespace-nowrap ${styles.apparait}`}
        style={{ fontSize: `${k}em` }}
      >
        {children}
      </span>
    </span>
  );
}
