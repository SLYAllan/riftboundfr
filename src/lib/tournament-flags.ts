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
    date: "2025-08-24",
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
    set: "Spiritforged",
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
    set: "Spiritforged",
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
    set: "Spiritforged",
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
    set: "Spiritforged",
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
    set: "Spiritforged",
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
    set: "Unleashed",
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
  "S3 Tianjin Regional Open (2026-06-07)": {
    name: "S3 Tianjin Regional Open",
    shortName: "Tianjin RO S3",
    countryCode: "CN",
    city: "Tianjin",
    location: "Tianjin, Chine",
    playerCount: 640,
    type: "regional",
    date: "2026-06-07",
    set: "Unleashed",
    format: "Conquest",
  },
  "S3 Changsha Regional Open (2026-06-14)": {
    name: "S3 Changsha Regional Open",
    shortName: "Changsha RO S3",
    countryCode: "CN",
    city: "Changsha",
    location: "Changsha, Chine",
    playerCount: 640,
    type: "regional",
    date: "2026-06-14",
    set: "Unleashed",
    format: "Conquest",
  },
  "RQ Utrecht 2026": {
    name: "Utrecht Regional Qualifier 2026",
    shortName: "Utrecht RQ",
    countryCode: "NL",
    city: "Utrecht",
    location: "Utrecht, Pays-Bas",
    playerCount: 1953,
    type: "regional",
    date: "2026-06-13",
    set: "Unleashed",
    format: "Conquest",
  },
  "RQ Vancouver 2026": {
    name: "Vancouver Regional Qualifier 2026",
    shortName: "Vancouver RQ",
    countryCode: "CA",
    city: "Vancouver",
    location: "Vancouver, Canada",
    playerCount: 1833,
    type: "regional",
    date: "2026-05-30",
    set: "Unleashed",
    format: "Conquest",
  },
  "S3 National Open (2026-07-19)": {
    name: "S3 National Open",
    shortName: "National Open S3",
    countryCode: "CN",
    city: "Chine",
    location: "Chine",
    playerCount: 2048,
    type: "regional",
    date: "2026-07-19",
    set: "Unleashed",
    format: "Conquest",
  },
  "RQ Hartford 2026": {
    name: "Hartford Regional Qualifier 2026",
    shortName: "Hartford RQ",
    countryCode: "US",
    city: "Hartford",
    location: "Hartford, CT, USA",
    playerCount: 1953,
    type: "regional",
    date: "2026-06-20",
    set: "Unleashed",
    format: "Conquest",
  },

  // ── 25 tournois CN Spiritforged scrapés le 31 mai (clé = tournamentContext exact, nom unique avec date) ──
  "S2 Regional Open Chengdu (2026-01-25)": { name: "S2 Regional Open Chengdu", shortName: "Chengdu RO S2", countryCode: "CN", city: "Chengdu", location: "Chengdu, Chine", playerCount: 512, type: "regional", date: "2026-01-25", set: "Spiritforged", format: "Conquest" },
  "S2 Regional Open - Dalian (2026-02-01)": { name: "S2 Regional Open Dalian", shortName: "Dalian RO S2", countryCode: "CN", city: "Dalian", location: "Dalian, Chine", playerCount: 510, type: "regional", date: "2026-02-01", set: "Spiritforged", format: "Conquest" },
  "S2 Regional Open - Nanjing (2026-02-08)": { name: "S2 Regional Open Nanjing", shortName: "Nanjing RO S2", countryCode: "CN", city: "Nanjing", location: "Nanjing, Chine", playerCount: 508, type: "regional", date: "2026-02-08", set: "Spiritforged", format: "Conquest" },
  "S2 Shanghai City Challenge (2026-03-15)": { name: "S2 Shanghai City Challenge (15 mars)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-03-15", set: "Spiritforged", format: "Standard" },
  "S2 Hangzhou City Challenge (2026-03-08)": { name: "S2 Hangzhou City Challenge", shortName: "Hangzhou CC", countryCode: "CN", city: "Hangzhou", location: "Hangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-03-08", set: "Spiritforged", format: "Standard" },
  "S2 Guangzhou City Challenge (2026-03-08)": { name: "S2 Guangzhou City Challenge", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-03-08", set: "Spiritforged", format: "Standard" },
  "S2 Shanghai City Challenge (2026-03-07)": { name: "S2 Shanghai City Challenge (7 mars)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-03-07", set: "Spiritforged", format: "Standard" },
  "Guangzhou City Challenge (2026-02-07)": { name: "Guangzhou City Challenge (7 fév)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-02-07", set: "Spiritforged", format: "Standard" },
  "Shanghai City Challenge (2026-01-31)": { name: "Shanghai City Challenge (31 jan)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-31", set: "Spiritforged", format: "Standard" },
  "Shanghai City Challenge (2026-01-24)": { name: "Shanghai City Challenge (24 jan)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-24", set: "Spiritforged", format: "Standard" },
  "Guangzhou City Challenge (2026-01-11)": { name: "Guangzhou City Challenge (11 jan)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-11", set: "Spiritforged", format: "Standard" },
  "Shenyang City Challenge (2026-01-10)": { name: "Shenyang City Challenge", shortName: "Shenyang CC", countryCode: "CN", city: "Shenyang", location: "Shenyang, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-10", set: "Spiritforged", format: "Standard" },
  "Shanghai City Challenge (2026-01-02)": { name: "Shanghai City Challenge (2 jan)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-02", set: "Spiritforged", format: "Standard" },
  "Fuzhou City Challenge (2026-01-02)": { name: "Fuzhou City Challenge (2 jan)", shortName: "Fuzhou CC", countryCode: "CN", city: "Fuzhou", location: "Fuzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-02", set: "Spiritforged", format: "Standard" },
  "Shenzhen City Challenge (2026-01-01)": { name: "Shenzhen City Challenge (1 jan)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2026-01-01", set: "Spiritforged", format: "Standard" },
  "Wuhan City Challenge (2025-12-27)": { name: "Wuhan City Challenge", shortName: "Wuhan CC", countryCode: "CN", city: "Wuhan", location: "Wuhan, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-27", set: "Spiritforged", format: "Standard" },
  "Shanghai City Challenge (2025-12-27)": { name: "Shanghai City Challenge (27 déc)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-27", set: "Spiritforged", format: "Standard" },
  "Fuzhou City Challenge (2025-12-27)": { name: "Fuzhou City Challenge (27 déc)", shortName: "Fuzhou CC", countryCode: "CN", city: "Fuzhou", location: "Fuzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-27", set: "Spiritforged", format: "Standard" },
  "Shenzhen City Challenge (2025-12-27)": { name: "Shenzhen City Challenge (27 déc)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-27", set: "Spiritforged", format: "Standard" },
  "Guangzhou City Challenge (2025-12-28)": { name: "Guangzhou City Challenge (28 déc)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-28", set: "Spiritforged", format: "Standard" },
  "Nanjing City Challenge (2025-12-28)": { name: "Nanjing City Challenge", shortName: "Nanjing CC", countryCode: "CN", city: "Nanjing", location: "Nanjing, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-28", set: "Spiritforged", format: "Standard" },
  "Shanghai City Challenge (2025-12-20)": { name: "Shanghai City Challenge (20 déc)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-20", set: "Spiritforged", format: "Standard" },
  "Hangzhou City Challenge (2025-12-20)": { name: "Hangzhou City Challenge", shortName: "Hangzhou CC", countryCode: "CN", city: "Hangzhou", location: "Hangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-20", set: "Spiritforged", format: "Standard" },
  "Shenzhen City Challenge (2025-12-21)": { name: "Shenzhen City Challenge (21 déc)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-21", set: "Spiritforged", format: "Standard" },
  "Guangzhou City Challenge (2025-12-20)": { name: "Guangzhou City Challenge (20 déc)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-12-20", set: "Spiritforged", format: "Standard" },

  // ── 47 tournois ajoutés v3 (25 S3 Unleashed + Hangzhou RO + 21 CC Origins) ──
  "S3 Guangzhou City Challenge (2026-05-30)": { name: "S3 Guangzhou City Challenge (2026-05-30)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-30", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-05-24)": { name: "S3 Shanghai City Challenge (2026-05-24)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-24", set: "Unleashed", format: "Standard" },
  "S3 Guangzhou City Challenge (2026-05-17)": { name: "S3 Guangzhou City Challenge (2026-05-17)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-17", set: "Unleashed", format: "Standard" },
  "S3 Shenzhen City Challenge (2026-05-16)": { name: "S3 Shenzhen City Challenge (2026-05-16)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-16", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-05-10)": { name: "S3 Shanghai City Challenge (2026-05-10)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-10", set: "Unleashed", format: "Standard" },
  "S3 Shenzhen City Challenge (2026-05-05)": { name: "S3 Shenzhen City Challenge (2026-05-05)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-05", set: "Unleashed", format: "Standard" },
  "S3 Guangzhou City Challenge (2026-05-04)": { name: "S3 Guangzhou City Challenge (2026-05-04)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-04", set: "Unleashed", format: "Standard" },
  "S3 Shenzhen City Challenge (2026-05-04)": { name: "S3 Shenzhen City Challenge (2026-05-04)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-04", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-05-04)": { name: "S3 Shanghai City Challenge (2026-05-04)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-04", set: "Unleashed", format: "Standard" },
  "S3 Beijing City Challenge (2026-05-03)": { name: "S3 Beijing City Challenge (2026-05-03)", shortName: "Beijing CC", countryCode: "CN", city: "Beijing", location: "Beijing, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-03", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-05-02)": { name: "S3 Shanghai City Challenge (2026-05-02)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-05-02", set: "Unleashed", format: "Standard" },
  "S3 Fuzhou City Challenge (2026-04-26)": { name: "S3 Fuzhou City Challenge (2026-04-26)", shortName: "Fuzhou CC", countryCode: "CN", city: "Fuzhou", location: "Fuzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-26", set: "Unleashed", format: "Standard" },
  "S3 Beijing City Challenge (2026-04-25)": { name: "S3 Beijing City Challenge (2026-04-25)", shortName: "Beijing CC", countryCode: "CN", city: "Beijing", location: "Beijing, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Guangzhou City Challenge (2026-04-25)": { name: "S3 Guangzhou City Challenge (2026-04-25)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-04-25)": { name: "S3 Shanghai City Challenge (2026-04-25)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Chengdu City Challenge (2026-04-25)": { name: "S3 Chengdu City Challenge (2026-04-25)", shortName: "Chengdu CC", countryCode: "CN", city: "Chengdu", location: "Chengdu, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Changzhou City Challenge (2026-04-25)": { name: "S3 Changzhou City Challenge (2026-04-25)", shortName: "Changzhou CC", countryCode: "CN", city: "Changzhou", location: "Changzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Wuhan City Challenge (2026-04-25)": { name: "S3 Wuhan City Challenge (2026-04-25)", shortName: "Wuhan CC", countryCode: "CN", city: "Wuhan", location: "Wuhan, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-25", set: "Unleashed", format: "Standard" },
  "S3 Shenyang City Challenge (2026-04-26)": { name: "S3 Shenyang City Challenge (2026-04-26)", shortName: "Shenyang CC", countryCode: "CN", city: "Shenyang", location: "Shenyang, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-26", set: "Unleashed", format: "Standard" },
  "S3 Hangzhou City Challenge (2026-04-19)": { name: "S3 Hangzhou City Challenge (2026-04-19)", shortName: "Hangzhou CC", countryCode: "CN", city: "Hangzhou", location: "Hangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-19", set: "Unleashed", format: "Standard" },
  "S3 Guangzhou City Challenge (2026-04-19)": { name: "S3 Guangzhou City Challenge (2026-04-19)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-19", set: "Unleashed", format: "Standard" },
  "S3 Tianjin City Challenge (2026-04-19)": { name: "S3 Tianjin City Challenge (2026-04-19)", shortName: "Tianjin CC", countryCode: "CN", city: "Tianjin", location: "Tianjin, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-19", set: "Unleashed", format: "Standard" },
  "S3 Shanghai City Challenge (2026-04-19)": { name: "S3 Shanghai City Challenge (2026-04-19)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-19", set: "Unleashed", format: "Standard" },
  "S3 Nanjing City Challenge (2026-04-18)": { name: "S3 Nanjing City Challenge (2026-04-18)", shortName: "Nanjing CC", countryCode: "CN", city: "Nanjing", location: "Nanjing, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-18", set: "Unleashed", format: "Standard" },
  "S3 Shenzhen City Challenge (2026-04-18)": { name: "S3 Shenzhen City Challenge (2026-04-18)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2026-04-18", set: "Unleashed", format: "Standard" },
  "Hangzhou Regional Open (2025-09-14)": { name: "Hangzhou Regional Open (2025-09-14)", shortName: "Hangzhou RO", countryCode: "CN", city: "Hangzhou", location: "Hangzhou, Chine", playerCount: 510, type: "regional", date: "2025-09-14", set: "Origins", format: "Conquest" },
  "Fuzhou City Challenge (2025-09-27)": { name: "Fuzhou City Challenge (2025-09-27)", shortName: "Fuzhou CC", countryCode: "CN", city: "Fuzhou", location: "Fuzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-09-27", set: "Origins", format: "Standard" },
  "Shenzhen City Challenge (2025-09-27)": { name: "Shenzhen City Challenge (2025-09-27)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2025-09-27", set: "Origins", format: "Standard" },
  "Shanghai City Challenge (2025-09-27)": { name: "Shanghai City Challenge (2025-09-27)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-09-27", set: "Origins", format: "Standard" },
  "Beijing City Challenge (2025-09-27)": { name: "Beijing City Challenge (2025-09-27)", shortName: "Beijing CC", countryCode: "CN", city: "Beijing", location: "Beijing, Chine", playerCount: 128, type: "city_challenge", date: "2025-09-27", set: "Origins", format: "Standard" },
  "Guangzhou City Challenge (2025-09-27)": { name: "Guangzhou City Challenge (2025-09-27)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-09-27", set: "Origins", format: "Standard" },
  "Guangzhou City Challenge (2025-10-06)": { name: "Guangzhou City Challenge (2025-10-06)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-06", set: "Origins", format: "Standard" },
  "Beijing City Challenge (2025-10-06)": { name: "Beijing City Challenge (2025-10-06)", shortName: "Beijing CC", countryCode: "CN", city: "Beijing", location: "Beijing, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-06", set: "Origins", format: "Standard" },
  "Shenzhen City Challenge (2025-10-07)": { name: "Shenzhen City Challenge (2025-10-07)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-07", set: "Origins", format: "Standard" },
  "Shanghai City Challenge (2025-10-07)": { name: "Shanghai City Challenge (2025-10-07)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-07", set: "Origins", format: "Standard" },
  "Hangzhou City Challenge (2025-10-07)": { name: "Hangzhou City Challenge (2025-10-07)", shortName: "Hangzhou CC", countryCode: "CN", city: "Hangzhou", location: "Hangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-07", set: "Origins", format: "Standard" },
  "Shanghai City Challenge (2025-10-12)": { name: "Shanghai City Challenge (2025-10-12)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Nanjing City Challenge (2025-10-12)": { name: "Nanjing City Challenge (2025-10-12)", shortName: "Nanjing CC", countryCode: "CN", city: "Nanjing", location: "Nanjing, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Beijing City Challenge (2025-10-12)": { name: "Beijing City Challenge (2025-10-12)", shortName: "Beijing CC", countryCode: "CN", city: "Beijing", location: "Beijing, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Shenyang City Challenge (2025-10-12)": { name: "Shenyang City Challenge (2025-10-12)", shortName: "Shenyang CC", countryCode: "CN", city: "Shenyang", location: "Shenyang, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Wuhan City Challenge (2025-10-12)": { name: "Wuhan City Challenge (2025-10-12)", shortName: "Wuhan CC", countryCode: "CN", city: "Wuhan", location: "Wuhan, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Guangzhou City Challenge (2025-10-12)": { name: "Guangzhou City Challenge (2025-10-12)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Chengdu City Challenge (2025-10-12)": { name: "Chengdu City Challenge (2025-10-12)", shortName: "Chengdu CC", countryCode: "CN", city: "Chengdu", location: "Chengdu, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Shenzhen City Challenge (2025-10-12)": { name: "Shenzhen City Challenge (2025-10-12)", shortName: "Shenzhen CC", countryCode: "CN", city: "Shenzhen", location: "Shenzhen, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-12", set: "Origins", format: "Standard" },
  "Guangzhou City Challenge (2025-10-18)": { name: "Guangzhou City Challenge (2025-10-18)", shortName: "Guangzhou CC", countryCode: "CN", city: "Guangzhou", location: "Guangzhou, Chine", playerCount: 128, type: "city_challenge", date: "2025-10-18", set: "Origins", format: "Standard" },
  "Shanghai City Challenge (2025-11-08)": { name: "Shanghai City Challenge (2025-11-08)", shortName: "Shanghai CC", countryCode: "CN", city: "Shanghai", location: "Shanghai, Chine", playerCount: 128, type: "city_challenge", date: "2025-11-08", set: "Origins", format: "Standard" },
  "Chengdu City Challenge (2025-11-09)": { name: "Chengdu City Challenge (2025-11-09)", shortName: "Chengdu CC", countryCode: "CN", city: "Chengdu", location: "Chengdu, Chine", playerCount: 128, type: "city_challenge", date: "2025-11-09", set: "Origins", format: "Standard" },
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

// Tier des tournois : S = tous les Regional (Open + Qualifier, toutes régions),
// A = le reste (City Challenges, online, etc.)
export function getTournamentTier(tournamentContext: string): "S" | "A" {
  const info = getTournamentInfo(tournamentContext);
  if (info && info.type === "regional") return "S";
  return "A";
}

export function getTournamentCountryCode(tournamentContext: string): string | null {
  const info = getTournamentInfo(tournamentContext);
  if (info) return info.countryCode;
  const lower = tournamentContext.toLowerCase();
  if (lower.includes("sydney")) return "AU";
  if (lower.includes("atlanta")) return "US";
  if (lower.includes("hartford")) return "US";
  if (lower.includes("vancouver")) return "CA";
  if (lower.includes("utrecht")) return "NL";
  if (lower.includes("chine") || lower.includes("china") || lower.includes("changsha") || lower.includes("tianjin")) return "CN";
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
