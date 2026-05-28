import { cn } from "@/lib/utils";

const FLAG_EMOJI: Record<string, string> = {
  US: "\u{1F1FA}\u{1F1F8}",
  AU: "\u{1F1E6}\u{1F1FA}",
  FR: "\u{1F1EB}\u{1F1F7}",
  DE: "\u{1F1E9}\u{1F1EA}",
  GB: "\u{1F1EC}\u{1F1E7}",
  ES: "\u{1F1EA}\u{1F1F8}",
  IT: "\u{1F1EE}\u{1F1F9}",
  JP: "\u{1F1EF}\u{1F1F5}",
  KR: "\u{1F1F0}\u{1F1F7}",
  CN: "\u{1F1E8}\u{1F1F3}",
  BR: "\u{1F1E7}\u{1F1F7}",
  CA: "\u{1F1E8}\u{1F1E6}",
  NL: "\u{1F1F3}\u{1F1F1}",
  BE: "\u{1F1E7}\u{1F1EA}",
  CH: "\u{1F1E8}\u{1F1ED}",
  PL: "\u{1F1F5}\u{1F1F1}",
  SE: "\u{1F1F8}\u{1F1EA}",
  PT: "\u{1F1F5}\u{1F1F9}",
  MX: "\u{1F1F2}\u{1F1FD}",
  AR: "\u{1F1E6}\u{1F1F7}",
  TW: "\u{1F1F9}\u{1F1FC}",
  SG: "\u{1F1F8}\u{1F1EC}",
  PH: "\u{1F1F5}\u{1F1ED}",
  TH: "\u{1F1F9}\u{1F1ED}",
  ONLINE: "\u{1F310}",
};

const FLAG_COLORS: Record<string, { bg: string; text: string }> = {
  US: { bg: "bg-blue-600/15", text: "text-blue-300" },
  AU: { bg: "bg-blue-700/15", text: "text-blue-300" },
  FR: { bg: "bg-blue-600/15", text: "text-blue-300" },
  DE: { bg: "bg-yellow-500/15", text: "text-yellow-300" },
  GB: { bg: "bg-red-600/15", text: "text-red-300" },
  ES: { bg: "bg-red-600/15", text: "text-red-300" },
  IT: { bg: "bg-green-600/15", text: "text-green-300" },
  JP: { bg: "bg-red-500/15", text: "text-red-300" },
  KR: { bg: "bg-blue-600/15", text: "text-blue-300" },
  CN: { bg: "bg-red-600/15", text: "text-red-300" },
  BR: { bg: "bg-green-600/15", text: "text-green-300" },
  CA: { bg: "bg-red-600/15", text: "text-red-300" },
  ONLINE: { bg: "bg-arcane/15", text: "text-arcane" },
};

const DEFAULT = { bg: "bg-surface-raised", text: "text-ink-secondary" };

export function CountryBadge({ code, className }: { code: string; className?: string }) {
  const colors = FLAG_COLORS[code] ?? DEFAULT;
  const emoji = FLAG_EMOJI[code];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-wider",
        colors.bg, colors.text, className
      )}
      title={code}
    >
      {emoji ? <span className="text-sm leading-none">{emoji}</span> : code}
    </span>
  );
}
