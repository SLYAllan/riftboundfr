"use client";

import { useState } from "react";

// Avatar Discord robuste : si l'URL est vide OU renvoie une erreur (hash périmé
// après changement d'avatar → 404), on affiche le fallback au lieu d'une image
// cassée. `unoptimized` (img direct) car l'optimiseur sature le petit serveur.
export function DiscordAvatar({
  src, alt, size, className, fallback,
}: {
  src: string | null;
  alt: string;
  size: number;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [ok, setOk] = useState(true);
  if (!src || !ok) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setOk(false)}
      className={className}
    />
  );
}
