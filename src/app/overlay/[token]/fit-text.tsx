"use client";
import { useLayoutEffect, useRef, useState } from "react";
import styles from "./overlay.module.css";

/**
 * Texte qui rentre toujours dans sa largeur, sans jamais être coupé : on mesure le
 * texte rendu et on le réduit juste ce qu'il faut. Les points de suspension étaient
 * refusés — un nom de Légende amputé en plein direct ne sert à personne.
 *
 * Le fondu se rejoue à chaque changement de valeur, grâce à la clé sur le contenu.
 */
export function FitText({ children, className = "" }: { children: string; className?: string }) {
  const boite = useRef<HTMLSpanElement>(null);
  const texte = useRef<HTMLSpanElement>(null);
  const [echelle, setEchelle] = useState(1);

  useLayoutEffect(() => {
    let vivant = true;
    const mesure = () => {
      const b = boite.current;
      const t = texte.current;
      if (!vivant || !b || !t) return;
      // On mesure à taille pleine, sinon on rétrécirait à partir d'une valeur déjà réduite.
      t.style.transform = "scale(1)";
      const dispo = b.clientWidth;
      const large = t.getBoundingClientRect().width;
      setEchelle(large > dispo && large > 0 ? Math.max(0.4, dispo / large) : 1);
    };
    mesure();
    // Arpona arrive après le premier calcul : mesurée avec la police de secours, la
    // largeur est fausse et le texte reste coupé. On repasse quand elle est chargée.
    document.fonts?.ready.then(mesure).catch(() => {});
    const obs = new ResizeObserver(mesure);
    if (boite.current) obs.observe(boite.current);
    return () => {
      vivant = false;
      obs.disconnect();
    };
  }, [children]);

  return (
    <span ref={boite} className={`block w-full overflow-hidden text-center ${className}`}>
      <span
        key={children}
        ref={texte}
        className={`inline-block whitespace-nowrap ${styles.apparait}`}
        style={{ transform: `scale(${echelle})`, transformOrigin: "center" }}
      >
        {children}
      </span>
    </span>
  );
}
