"use client";

import Link from "@/components/lien";
import { usePathname, useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const t = useT();
  const searchParams = useSearchParams();

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          aria-label={t("Page précédente")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-ink"
        >
          <ChevronLeft size={16} />
        </Link>
      )}
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} aria-hidden="true" className="px-2 text-ink-muted">...</span>
        ) : (
          <Link
            key={p}
            href={getPageUrl(p)}
            aria-current={p === currentPage ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium",
              p === currentPage
                ? "bg-arcane text-canvas"
                : "text-ink-secondary hover:bg-surface-raised hover:text-ink"
            )}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          aria-label={t("Page suivante")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary hover:bg-surface-raised hover:text-ink"
        >
          <ChevronRight size={16} />
        </Link>
      )}
    </nav>
  );
}
