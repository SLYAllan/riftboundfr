"use client";

import type { ReactNode } from "react";

const RUNE_ICONS: Record<string, { src: string; label: string }> = {
  rainbow: { src: "/icons/RainbowRune.webp", label: "n'importe quelle Rune" },
  calm: { src: "/icons/Calm.webp", label: "Rune Calme" },
  fury: { src: "/icons/Fury.webp", label: "Rune Furie" },
  mind: { src: "/icons/Mind.webp", label: "Rune Esprit" },
  body: { src: "/icons/Body.webp", label: "Rune Corps" },
  chaos: { src: "/icons/Chaos.webp", label: "Rune Chaos" },
  order: { src: "/icons/Order.webp", label: "Rune Ordre" },
};

interface Token {
  type: "text" | "exhaust" | "rune" | "energy";
  value: string;
  runeKey?: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const regex = /:rb_exhaust:|:rb_rune_(\w+):|:rb_energy_(\w+):|:rb_(\w+):/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[0] === ":rb_exhaust:") {
      tokens.push({ type: "exhaust", value: "Épuiser" });
    } else if (match[1]) {
      tokens.push({ type: "rune", value: match[1], runeKey: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "energy", value: match[2] === "O" ? "0" : match[2] });
    } else if (match[3]) {
      tokens.push({ type: "text", value: `[${match[3]}]` });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }

  return tokens;
}

export function CardTextRenderer({ text }: { text: string }) {
  const tokens = tokenize(text);

  const elements: ReactNode[] = tokens.map((token, i) => {
    switch (token.type) {
      case "exhaust":
        return (
          <span key={i} className="inline-flex items-center gap-0.5">
            <img src="/icons/Tap.webp" alt="Épuiser" className="inline h-3.5 w-3.5" />
          </span>
        );
      case "rune": {
        const rune = RUNE_ICONS[token.runeKey!];
        if (!rune) return <span key={i}>{token.value}</span>;
        return (
          <span key={i} className="inline-flex items-center gap-0.5">
            <img src={rune.src} alt={rune.label} className="inline h-3.5 w-3.5" title={rune.label} />
          </span>
        );
      }
      case "energy":
        return <span key={i} className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-yellow-500/20 text-[10px] font-bold text-yellow-400">{token.value}</span>;
      default:
        return <span key={i}>{token.value}</span>;
    }
  });

  return <span className="inline leading-relaxed">{elements}</span>;
}
