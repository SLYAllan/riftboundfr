import { cn, getTierColor } from "@/lib/utils";

export function TierBadge({ tier, className }: { tier: string; className?: string }) {
  const bgMap: Record<string, string> = {
    S: "bg-tier-s/20",
    A: "bg-tier-a/20",
    B: "bg-tier-b/20",
    C: "bg-tier-c/20",
    D: "bg-tier-d/20",
  };

  return (
    <span
      className={cn(
        "inline-flex min-w-[48px] items-center justify-center rounded-md px-3 py-1 text-lg font-bold",
        getTierColor(tier),
        bgMap[tier],
        className
      )}
      style={{ fontFamily: "var(--font-rubik), sans-serif" }}
    >
      {tier}
    </span>
  );
}
