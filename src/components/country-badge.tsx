import { cn } from "@/lib/utils";

// Drapeaux hébergés localement dans public/img/flags/{code}.svg (CSP-safe, pas de dépendance externe).
// Les emojis drapeaux ne s'affichent pas sous Windows → on utilise de vraies images SVG.
const HAS_FLAG = new Set([
  "US", "AU", "FR", "DE", "GB", "ES", "IT", "JP", "KR", "CN", "BR", "CA",
  "NL", "BE", "CH", "PL", "SE", "PT", "MX", "AR", "TW", "SG", "PH", "TH",
]);

export function CountryBadge({ code, className }: { code: string; className?: string }) {
  if (code === "ONLINE") {
    return (
      <span
        className={cn("inline-flex items-center text-sm leading-none", className)}
        title="En ligne"
        aria-label="En ligne"
      >
        {"\u{1F310}"}
      </span>
    );
  }

  if (!HAS_FLAG.has(code)) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-ink-secondary",
          className,
        )}
        title={code}
      >
        {code}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/img/flags/${code.toLowerCase()}.svg`}
      alt={code}
      title={code}
      width={24}
      height={16}
      className={cn(
        "inline-block h-4 w-6 shrink-0 rounded-[3px] object-cover align-middle shadow-sm ring-1 ring-black/15",
        className,
      )}
      loading="lazy"
    />
  );
}
