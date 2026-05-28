export interface RuneSuggestion {
  domain: string;
  count: number;
}

interface CardWithDomains {
  domains: string[];
  quantity: number;
}

export function calculateRuneSuggestion(mainDeck: CardWithDomains[], legendDomains: string[]): RuneSuggestion[] {
  if (legendDomains.length === 0) return [];

  const domainPowerCounts = new Map<string, number>();
  for (const d of legendDomains) domainPowerCounts.set(d, 0);

  for (const card of mainDeck) {
    const matchingDomains = card.domains.filter((d) => legendDomains.includes(d));
    if (matchingDomains.length === 0) continue;
    const share = card.quantity / matchingDomains.length;
    for (const d of matchingDomains) {
      domainPowerCounts.set(d, (domainPowerCounts.get(d) ?? 0) + share);
    }
  }

  const total = Array.from(domainPowerCounts.values()).reduce((a, b) => a + b, 0);
  if (total === 0) {
    const per = Math.floor(12 / legendDomains.length);
    const remainder = 12 - per * legendDomains.length;
    return legendDomains.map((d, i) => ({
      domain: d,
      count: per + (i < remainder ? 1 : 0),
    }));
  }

  const suggestions: RuneSuggestion[] = [];
  let allocated = 0;

  const entries = Array.from(domainPowerCounts.entries()).sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < entries.length; i++) {
    const [domain, count] = entries[i];
    if (i === entries.length - 1) {
      suggestions.push({ domain, count: 12 - allocated });
    } else {
      const share = Math.round((count / total) * 12);
      const clamped = Math.max(4, Math.min(share, 12 - allocated - (entries.length - 1 - i) * 4));
      suggestions.push({ domain, count: clamped });
      allocated += clamped;
    }
  }

  return suggestions.sort((a, b) => b.count - a.count);
}
