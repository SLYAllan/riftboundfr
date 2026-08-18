"use client";

import Link from "@/components/lien";
import { ChevronRight } from "lucide-react";
import { useT } from "@/components/i18n-provider";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://riftboundfrance.fr";

export interface Crumb {
  name: string;
  href: string;
}

/**
 * Fil d'Ariane visible + JSON-LD BreadcrumbList.
 * "Accueil" est ajouté automatiquement en tête - ne passer que les segments suivants.
 *
 * Composant client pour une seule raison : les libellés passent par le dictionnaire,
 * et le fil d'Ariane restait en français sur tout le site anglais. Le rendu initial
 * se fait quand même sur le serveur, le JSON-LD est donc bien dans le HTML servi.
 */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const t = useT();
  const all: Crumb[] = [{ name: "Accueil", href: "/" }, ...items].map((c) => ({ ...c, name: t(c.name) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.href}`,
    })),
  };

  return (
    <nav
      aria-label={t("Fil d'Ariane")}
      className={`text-sm text-ink-muted ${className ?? ""}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((c, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={14} className="shrink-0 text-ink-muted/50" />}
              {isLast ? (
                <span className="truncate text-ink-secondary" aria-current="page">
                  {c.name}
                </span>
              ) : (
                <Link href={c.href} className="hover:text-arcane">
                  {c.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
