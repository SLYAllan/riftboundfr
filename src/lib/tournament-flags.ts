export const COUNTRY_FLAGS: Record<string, { code: string; country: string; continent: string }> = {
  US: { code: "US", country: "États-Unis", continent: "Amérique" },
  AU: { code: "AU", country: "Australie", continent: "Océanie" },
  FR: { code: "FR", country: "France", continent: "Europe" },
  DE: { code: "DE", country: "Allemagne", continent: "Europe" },
  GB: { code: "GB", country: "Royaume-Uni", continent: "Europe" },
  ES: { code: "ES", country: "Espagne", continent: "Europe" },
  IT: { code: "IT", country: "Italie", continent: "Europe" },
  JP: { code: "JP", country: "Japon", continent: "Asie" },
  KR: { code: "KR", country: "Corée du Sud", continent: "Asie" },
  CN: { code: "CN", country: "Chine", continent: "Asie" },
  BR: { code: "BR", country: "Brésil", continent: "Amérique" },
  CA: { code: "CA", country: "Canada", continent: "Amérique" },
  NL: { code: "NL", country: "Pays-Bas", continent: "Europe" },
  BE: { code: "BE", country: "Belgique", continent: "Europe" },
  CH: { code: "CH", country: "Suisse", continent: "Europe" },
  PL: { code: "PL", country: "Pologne", continent: "Europe" },
  SE: { code: "SE", country: "Suède", continent: "Europe" },
  PT: { code: "PT", country: "Portugal", continent: "Europe" },
  MX: { code: "MX", country: "Mexique", continent: "Amérique" },
  AR: { code: "AR", country: "Argentine", continent: "Amérique" },
  TW: { code: "TW", country: "Taïwan", continent: "Asie" },
  SG: { code: "SG", country: "Singapour", continent: "Asie" },
  PH: { code: "PH", country: "Philippines", continent: "Asie" },
  TH: { code: "TH", country: "Thaïlande", continent: "Asie" },
  ONLINE: { code: "WEB", country: "En ligne", continent: "Global" },
};

export interface TournamentInfo {
  name: string;
  shortName: string;
  countryCode: string;
  city: string;
  location?: string;
  playerCount?: number;
  type: "regional" | "city_challenge" | "worlds" | "online" | "other";
  date?: string;
  set?: "Origins" | "Unleashed" | "Spiritforged";
  format?: "Conquest" | "Standard";
  hidden?: boolean;
}

export const TOURNAMENTS: Record<string, TournamentInfo> = {
  "Guangzhou Regional Open": {
    name: "Guangzhou Regional Open",
    shortName: "Guangzhou RO",
    countryCode: "CN",
    city: "Guangzhou",
    location: "Guangzhou, Chine",
    playerCount: 506,
    type: "regional",
    date: "2025-08-23",
    set: "Origins",
    format: "Conquest",
  },
  "Chongqing Regional Open": {
    name: "Chongqing Regional Open",
    shortName: "Chongqing RO",
    countryCode: "CN",
    city: "Chongqing",
    location: "Chongqing, Chine",
    playerCount: 507,
    type: "regional",
    date: "2025-09-07",
    set: "Origins",
    format: "Conquest",
  },
  "Beijing Regional Open": {
    name: "Beijing Regional Open",
    shortName: "Beijing RO",
    countryCode: "CN",
    city: "Beijing",
    location: "Beijing, Chine",
    playerCount: 509,
    type: "regional",
    date: "2025-08-31",
    set: "Origins",
    format: "Conquest",
  },
  "Beijing Regional Open Day 1": {
    name: "Beijing Regional Open Day 1",
    shortName: "Beijing RO D1",
    countryCode: "CN",
    city: "Beijing",
    location: "Beijing, Chine",
    playerCount: 512,
    type: "regional",
    date: "2025-08-30",
    set: "Origins",
    format: "Conquest",
    hidden: true,
  },
  "Shanghai National Open": {
    name: "Shanghai National Open",
    shortName: "Shanghai NO",
    countryCode: "CN",
    city: "Shanghai",
    location: "Shanghai, Chine",
    playerCount: 2048,
    type: "regional",
    date: "2025-11-02",
    set: "Origins",
    format: "Conquest",
  },
  "Shanghai City Challenge": {
    name: "Shanghai City Challenge",
    shortName: "Shanghai CC",
    countryCode: "CN",
    city: "Shanghai",
    location: "Shanghai, Chine",
    playerCount: 128,
    type: "city_challenge",
    date: "2025-11-23",
    set: "Origins",
    format: "Standard",
  },
  "Houston Regional Qualifier": {
    name: "Houston Regional Qualifier 2025",
    shortName: "Houston RQ",
    countryCode: "US",
    city: "Houston",
    location: "Houston, TX, USA",
    playerCount: 1347,
    type: "regional",
    date: "2025-12-07",
    set: "Origins",
    format: "Conquest",
  },
  "Bologna Regional Qualifier": {
    name: "Bologna Regional Qualifier 2026",
    shortName: "Bologna RQ",
    countryCode: "IT",
    city: "Bologna",
    location: "Bologna, Italie",
    playerCount: 1719,
    type: "regional",
    date: "2026-02-21",
    set: "Unleashed",
    format: "Conquest",
  },
  "Las Vegas Regional Qualifier": {
    name: "Las Vegas Regional Qualifier 2026",
    shortName: "Vegas RQ",
    countryCode: "US",
    city: "Las Vegas",
    location: "Las Vegas, NV, USA",
    playerCount: 1670,
    type: "regional",
    date: "2026-03-01",
    set: "Unleashed",
    format: "Conquest",
  },
  "Shenzhen National Open S2": {
    name: "Shenzhen National Open S2",
    shortName: "Shenzhen NO S2",
    countryCode: "CN",
    city: "Shenzhen",
    location: "Shenzhen, Chine",
    playerCount: 2048,
    type: "regional",
    date: "2026-03-22",
    set: "Unleashed",
    format: "Conquest",
  },
  "Sydney RQ 2026": {
    name: "Sydney Regional Qualifier 2026",
    shortName: "Sydney RQ",
    countryCode: "AU",
    city: "Sydney",
    location: "Sydney, Australie",
    playerCount: 1405,
    type: "regional",
    date: "2026-03-22",
    set: "Unleashed",
    format: "Conquest",
  },
  "Lille Regional Qualifier": {
    name: "Lille Regional Qualifier 2026",
    shortName: "Lille RQ",
    countryCode: "FR",
    city: "Lille",
    location: "Lille, France",
    playerCount: 1949,
    type: "regional",
    date: "2026-04-18",
    set: "Unleashed",
    format: "Conquest",
  },
  "Atlanta RQ 2026": {
    name: "Atlanta Regional Qualifier 2026",
    shortName: "Atlanta RQ",
    countryCode: "US",
    city: "Atlanta",
    location: "Atlanta, USA",
    playerCount: 1832,
    type: "regional",
    date: "2026-04-29",
    set: "Unleashed",
    format: "Conquest",
  },
  "Xi'an Regional Open S3": {
    name: "Xi'an Regional Open S3",
    shortName: "Xi'an RO S3",
    countryCode: "CN",
    city: "Xi'an",
    location: "Xi'an, Chine",
    playerCount: 640,
    type: "regional",
    date: "2026-05-24",
    set: "Spiritforged",
    format: "Conquest",
  },
  "Fuzhou Regional Qualifier": {
    name: "Fuzhou Regional Qualifier",
    shortName: "Fuzhou RQ",
    countryCode: "CN",
    city: "Fuzhou",
    location: "Fuzhou, Chine",
    playerCount: 800,
    type: "regional",
    date: "2026-01-15",
    set: "Spiritforged",
    format: "Conquest",
  },
  "Suzhou Regional Qualifier": {
    name: "Suzhou Regional Qualifier",
    shortName: "Suzhou RQ",
    countryCode: "CN",
    city: "Suzhou",
    location: "Suzhou, Chine",
    playerCount: 800,
    type: "regional",
    date: "2026-05-10",
    set: "Unleashed",
    format: "Conquest",
  },
};

export function getTournamentInfo(tournamentContext: string): TournamentInfo | null {
  const lower = tournamentContext.toLowerCase();
  const entries = Object.entries(TOURNAMENTS);
  for (const [key, info] of entries) {
    if (lower === key.toLowerCase()) return info;
  }
  const sorted = [...entries].sort((a, b) => b[0].length - a[0].length);
  for (const [key, info] of sorted) {
    if (lower.includes(key.toLowerCase())) return info;
  }
  for (const [, info] of sorted) {
    if (lower.includes(info.shortName.toLowerCase())) return info;
  }
  for (const [, info] of entries) {
    if (lower.includes(info.city.toLowerCase())) return info;
  }
  return null;
}

export function getTournamentCountryCode(tournamentContext: string): string | null {
  const info = getTournamentInfo(tournamentContext);
  if (info) return info.countryCode;
  const lower = tournamentContext.toLowerCase();
  if (lower.includes("sydney")) return "AU";
  if (lower.includes("atlanta")) return "US";
  if (lower.includes("online") || lower.includes("en ligne")) return "ONLINE";
  return null;
}

export function getTournamentTypeBadge(type: string): { label: string; className: string } {
  switch (type) {
    case "regional":
      return { label: "Regional", className: "bg-amber-500/15 text-amber-400 border border-amber-500/25" };
    case "city_challenge":
      return { label: "City Challenge", className: "bg-arcane/15 text-arcane border border-arcane/25" };
    case "worlds":
      return { label: "Worlds", className: "bg-violet-500/15 text-violet-400 border border-violet-500/25" };
    case "online":
      return { label: "En ligne", className: "bg-sky-500/15 text-sky-400 border border-sky-500/25" };
    default:
      return { label: "Autre", className: "bg-surface-raised text-ink-secondary border border-hairline" };
  }
}

export function isTournamentHidden(tournamentContext: string): boolean {
  const info = getTournamentInfo(tournamentContext);
  return info?.hidden === true;
}
