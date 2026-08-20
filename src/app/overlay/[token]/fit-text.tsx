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
  lines = 1,
  className = "",
  fondu = true,
}: {
  children: string;
  /** Nombre de caracteres qui tiennent sur une ligne a taille pleine. */
  chars: number;
  /** Nombre de lignes autorisees. Au-dela, le texte retrecit pour tout montrer sans
   *  jamais couper : ni troncature, ni « … », mais jamais plus de `lines` lignes. */
  lines?: number;
  className?: string;
  /** Le fondu se rejoue a chaque changement de contenu. Bien pour un nom de Legende
   *  qui change une fois par match, insupportable pour un chrono : il clignotait a
   *  chaque seconde. `fondu={false}` pour ce qui bouge tout seul. */
  fondu?: boolean;
}) {
  const n = children.length;
  const capacite = chars * lines;
  const k = n > capacite ? Math.max(0.45, capacite / n) : 1;
  const multi = lines > 1;
  return (
    <span className={`block w-full overflow-hidden text-center ${className}`}>
      <span
        key={fondu ? children : undefined}
        className={`${fondu ? styles.apparait : ""} ${multi ? "block [text-wrap:balance]" : "inline-block whitespace-nowrap"}`}
        // line-clamp en style en ligne : la classe Tailwind dynamique ne serait pas
        // generee. Comme `k` reduit deja pour tout faire tenir, le clamp ne coupe qu'en
        // ultime secours.
        style={multi ? { fontSize: `${k}em`, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: lines, overflow: "hidden" } : { fontSize: `${k}em` }}
      >
        {children}
      </span>
    </span>
  );
}
