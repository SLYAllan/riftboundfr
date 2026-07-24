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
  type: "text" | "exhaust" | "might" | "rune" | "energy" | "keyword";
  value: string;
  runeKey?: string;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  // Symboles :rb_...: ET mots-clés entre crochets [Predict], [Assault 2]...
  const regex = /:rb_exhaust:|:rb_might:|:rb_rune_(\w+):|:rb_energy_(\w+):|:rb_(\w+):|\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    if (match[0] === ":rb_exhaust:") {
      tokens.push({ type: "exhaust", value: "Épuiser" });
    } else if (match[0] === ":rb_might:") {
      tokens.push({ type: "might", value: "Puissance" });
    } else if (match[1]) {
      tokens.push({ type: "rune", value: match[1], runeKey: match[1] });
    } else if (match[2]) {
      tokens.push({ type: "energy", value: match[2] === "O" ? "0" : match[2] });
    } else if (match[3]) {
      // Autre symbole :rb_...: sans icône connue -> mot-clé stylé.
      tokens.push({ type: "keyword", value: match[3] });
    } else if (match[4]) {
      // [NO TEXT] est un marqueur de gabarit vide, on le masque.
      if (match[4] === "NO TEXT") tokens.push({ type: "text", value: "" });
      else tokens.push({ type: "keyword", value: match[4] });
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
        return <img key={i} src="/icons/Tap.webp" alt="Épuiser" title="Épuiser" className="inline h-3.5 w-3.5 align-text-bottom" />;
      case "might":
        // Icône rendue en blanc (brightness-0 invert) : les fonds sont sombres.
        return <img key={i} src="/icons/SwordIconRB.webp" alt="Puissance" title="Puissance" className="inline h-3.5 w-3.5 align-text-bottom brightness-0 invert" />;
      case "rune": {
        const rune = RUNE_ICONS[token.runeKey!];
        if (!rune) return <span key={i}>{token.value}</span>;
        return <img key={i} src={rune.src} alt={rune.label} title={rune.label} className="inline h-3.5 w-3.5 align-text-bottom" />;
      }
      case "energy":
        return <span key={i} className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-canvas align-text-bottom">{token.value}</span>;
      case "keyword":
        return <span key={i} className="mx-px rounded bg-surface-raised px-1 py-px text-[0.85em] font-bold text-ink">{token.value}</span>;
      default:
        return <span key={i}>{token.value}</span>;
    }
  });

  return <span className="inline leading-relaxed">{elements}</span>;
}
