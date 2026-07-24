import { cn, getRarityBgColor } from "@/lib/utils";
import { RARITY_LABELS_FR } from "@/lib/domains";

export function RarityBadge({ rarity, className }: { rarity: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        getRarityBgColor(rarity),
        className
      )}
    >
      {RARITY_LABELS_FR[rarity] ?? rarity}
    </span>
  );
}
