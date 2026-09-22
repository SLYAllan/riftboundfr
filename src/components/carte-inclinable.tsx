"use client";

import { useRef, type ReactNode } from "react";

/**
 * Inclinaison maximale, en degrés. « Douce » : Allan l'a choisie le 23 septembre
 * 2026 sur une page d'essai, contre 12° et contre 12° avec un reflet de lumière.
 */
const ANGLE_MAX = 6;

/**
 * Une carte qui s'incline sous la souris, comme tenue à la main. Le grossissement
 * reprend celui de `.game-card-hover` (3 %) : l'image dedans doit donc couper le
 * sien (`hoverZoom={false}`), sinon les deux se cumulent.
 */
export function CarteInclinable({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function bouger(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    // Au doigt, rien : un doigt qui fait défiler la page ne doit pas tordre la
    // carte au passage.
    if (!el || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 2 * ANGLE_MAX).toFixed(2)}deg) rotateY(${(x * 2 * ANGLE_MAX).toFixed(2)}deg) scale(1.03)`;
  }

  function quitter() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} onPointerMove={bouger} onPointerLeave={quitter} className="transition-transform duration-150 ease-out will-change-transform">
      {children}
    </div>
  );
}
