"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/components/user-menu";


const mainLinks = [
  { href: "/tier-list", label: "Tier List" },
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
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [outilsOpen, setOutilsOpen] = useState(false);
  const outilsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (outilsRef.current && !outilsRef.current.contains(e.target as Node)) setOutilsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const isOutilsActive = outilsLinks.some((l) => pathname.startsWith(l.href));

  return (
    <header className="sticky top-0 z-50 glass border-b border-hairline">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logorbfr.png" alt="Riftbound France" width={96} height={32} className="h-8 w-auto" priority />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {/* Outils dropdown */}
          <div ref={outilsRef} className="relative">
            <button
              onClick={() => setOutilsOpen(!outilsOpen)}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isOutilsActive ? "text-arcane" : "text-ink-secondary hover:text-ink"
              )}
            >
              Outils
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
                    {link.label}
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
              {link.label}
            </Link>
          ))}
          <div className="ml-2 flex items-center gap-1 border-l border-hairline pl-3">
            <UserMenu />
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-ink-secondary md:hidden"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div id="mobile-menu" className="border-t border-hairline px-4 py-4 md:hidden glass">
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">Outils</p>
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
              {link.label}
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
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-2 border-t border-hairline pt-3 px-3">
            <UserMenu />
          </div>
        </div>
      )}
    </header>
  );
}
