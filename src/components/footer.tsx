import Link from "@/components/lien";
import Image from "next/image";
import { tr } from "@/lib/i18n-server";

const liens = [
  { href: "/cartes", label: "Cartes" },
  { href: "/decks", label: "Decks" },
  { href: "/tier-list", label: "Tier List" },
  { href: "/guides/debuter", label: "Guides" },
  { href: "/tournois", label: "Tournois" },
  { href: "/articles", label: "Articles" },
  { href: "/deckbuilder", label: "Deckbuilder" },
  { href: "/a-propos", label: "À propos" },
];

export async function Footer() {
  const t = await tr();

  return (
    <footer data-chrome="site" className="border-t border-hairline bg-surface">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* py-1 sur chaque lien : sans lui la cible fait 16px de haut et les
            cercles de 24px de deux liens voisins se chevauchent (WCAG 2.5.8). */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1.5 text-xs text-ink-muted [&_a]:py-1">
          {liens.map((lien) => (
            <span key={lien.href} className="flex items-center gap-x-4">
              <Link href={lien.href} className="hover:text-ink transition-colors">{t(lien.label)}</Link>
              {/* Pas de couleur propre : text-hairline est une couleur de
                  BORDURE (10 % d'opacité), le point tombait à 1,19:1. Il hérite
                  maintenant du text-ink-muted du conteneur. */}
              <span aria-hidden="true">·</span>
            </span>
          ))}
          <a href="mailto:contact@riftboundfrance.fr" className="hover:text-ink transition-colors">Contact</a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-hairline py-3">
          <div className="flex items-center gap-3">
            <Image src="/logorbfr.png" alt="Riftbound France" width={224} height={112} className="h-7 w-auto" />
          </div>
          <p className="text-[11px] leading-snug text-ink-muted sm:ml-auto sm:max-w-3xl sm:text-right">
            &copy; {new Date().getFullYear()} Riftbound France &middot; riftboundfrance.fr.{" "}
            {t("Site non approuvé par Riot Games. Riot Games et toutes les propriétés associées sont des marques de Riot Games, Inc.")}
          </p>
        </div>
      </div>
    </footer>
  );
}
