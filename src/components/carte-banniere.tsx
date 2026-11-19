import Image from "next/image";
import Link from "@/components/lien";
import { getBannerUrl } from "@/lib/banners";
import { cn } from "@/lib/utils";

/**
 * Une Légende sur sa bannière, comme les cartes de `/decks` : nom en grand sur l'art,
 * détails dessous, un pied facultatif pour les boutons (hors du lien de la carte, sinon
 * un <a> dans un <a> que le navigateur défait). Servie aux pages de guide qui listent
 * une liste par Légende.
 */
export function CarteBanniere({
  legende,
  titre,
  href,
  haut,
  pied,
  children,
  className,
}: {
  legende: string;
  titre: string;
  href: string;
  haut?: React.ReactNode;
  pied?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  const banniere = getBannerUrl(legende);
  return (
    <article className={cn("card-hover group relative flex flex-col overflow-hidden rounded-card border border-hairline bg-surface", className)}>
      <div className="relative flex h-44 flex-col justify-end">
        <Link href={href} className="absolute inset-0 z-10" aria-label={titre} />
        {banniere ? (
          <Image src={banniere} alt="" fill className="object-cover object-[50%_22%] transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} />
        ) : (
          <div className="absolute inset-0 bg-surface-raised" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/30 to-transparent" />
        {haut && <div className="absolute left-2 right-2 top-2 z-20 flex flex-wrap items-start gap-1.5">{haut}</div>}
        <div className="relative p-4">
          <div className="line-clamp-2 text-xl font-bold leading-tight text-ink drop-shadow-md" style={{ fontFamily: "var(--font-rubik), sans-serif" }}>
            {titre}
          </div>
          {children && <div className="texte-sur-art mt-2 space-y-1 text-xs text-white/90">{children}</div>}
        </div>
      </div>
      {pied && <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-hairline px-4 py-3">{pied}</div>}
    </article>
  );
}
