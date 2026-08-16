"use client";

import Link from "@/components/lien";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";
import { useLangue, useT } from "@/components/i18n-provider";
import { PREFIXE_EN, sansPrefixe } from "@/lib/i18n";


const mainLinks = [
  { href: "/tier-list", label: "Tier List" },
  { href: "/legendes", label: "Légendes" },
  { href: "/decks", label: "Decks" },
  { href: "/guides", label: "Guides" },
  { href: "/tournois", label: "Tournois" },
  { href: "/articles", label: "Articles" },
];

const outilsLinks = [
  { href: "/cartes", label: "Cartes" },
  { href: "/deckbuilder", label: "Deckbuilder" },
  { href: "/collection", label: "Ma collection" },
  { href: "/outils/compteur", label: "Compteur" },
  { href: "/outils/regles", label: "Chercher une règle" },
  { href: "/profil/overlay", label: "Habillage de stream" },
];

/**
 * Rechargement complet plutôt que navigation client : changer de langue change
 * tout ce que le serveur a rendu, y compris les métadonnées et le `lang` de la
 * page. Un lien brut est ici plus sûr qu'un composant Link.
 */
function SelecteurLangue({ chemin, compact = false }: { chemin: string; compact?: boolean }) {
  const langue = useLangue();
  const nu = chemin === "/" ? "" : chemin;
  return (
    <div className={cn("flex items-center gap-0.5 rounded-lg border border-hairline p-0.5", compact && "w-max")}>
      {([
        { code: "fr", href: nu || "/" },
        { code: "en", href: `${PREFIXE_EN}${nu}` },
      ] as const).map((l) => (
        <a
          key={l.code}
          href={l.href}
          hrefLang={l.code}
          aria-current={langue === l.code ? "true" : undefined}
          className={cn(
            "flex h-8 min-w-8 items-center justify-center rounded-md px-1.5 text-xs font-bold uppercase transition-colors",
            langue === l.code ? "bg-arcane text-canvas" : "text-ink-muted hover:text-ink",
          )}
        >
          {l.code}
        </a>
      ))}
    </div>
  );
}

export function Navbar({ chemin = "/" }: { chemin?: string }) {
  const pathname = sansPrefixe(usePathname());
  const t = useT();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outilsOpen, setOutilsOpen] = useState(false);
  const outilsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (outilsRef.current && !outilsRef.current.contains(e.target as Node)) setOutilsOpen(false);
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOutilsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isOutilsActive = outilsLinks.some((l) => pathname.startsWith(l.href));

  return (
    <header className="sticky top-0 z-50 glass border-b border-hairline">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logorbfr.png" alt="Riftbound France" width={224} height={112} className="h-8 w-auto" priority />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {/* Outils dropdown */}
          <div ref={outilsRef} className="relative">
            <button
              onClick={() => setOutilsOpen(!outilsOpen)}
              aria-expanded={outilsOpen}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOutilsActive ? "text-arcane" : "text-ink-secondary hover:text-ink"
              )}
            >
              {t("Outils")}
              <ChevronDown size={14} className={cn("transition-transform", outilsOpen && "rotate-180")} />
            </button>
            {outilsOpen && (
              <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-hairline bg-surface p-1 shadow-xl">
                {outilsLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOutilsOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      pathname.startsWith(link.href)
                        ? "text-arcane bg-arcane/5"
                        : "text-ink-secondary hover:text-ink hover:bg-surface-raised"
                    )}
                  >
                    {t(link.label)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "text-arcane"
                  : "text-ink-secondary hover:text-ink"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-2 border-l border-hairline pl-3">
            <SelecteurLangue chemin={chemin} />
            <UserMenu />
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-secondary md:hidden"
          aria-label={mobileOpen ? t("Fermer le menu") : t("Ouvrir le menu")}
          aria-expanded={mobileOpen}
          // Pas d'aria-controls : le panneau n'existe dans le DOM que lorsqu'il est
          // ouvert, la référence pointait donc dans le vide sur toutes les pages.
          // aria-expanded + le panneau juste après le bouton suffisent.
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-hairline px-4 py-4 md:hidden glass">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">{t("Outils")}</p>
          {outilsLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                pathname.startsWith(link.href) ? "text-arcane" : "text-ink-secondary"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
          <div className="my-2 border-t border-hairline" />
          {mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-medium",
                pathname.startsWith(link.href) ? "text-arcane" : "text-ink-secondary"
              )}
            >
              {t(link.label)}
            </Link>
          ))}
          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-hairline pt-3 px-3">
            <UserMenu />
            <SelecteurLangue chemin={chemin} compact />
          </div>
        </div>
      )}
    </header>
  );
}
