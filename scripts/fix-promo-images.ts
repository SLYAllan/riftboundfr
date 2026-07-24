// Les promos (OPP/PR/JDG) avaient dans la DB l'image de la carte de base
// (art normal) au lieu de l'art promo réel (Metal, Launch Exclusive, GG EZ...).
// L'API Riftcodex a la bonne image sous le même riftbound_id. On met à jour
// QUE imageUrl, par riftboundId, sans toucher aux noms ni au reste.
// Rejouable : si l'image est déjà bonne, 0 ligne touchée.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "https://api.riftcodex.com";
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RiftboundFrance-sync" };
const SETS = ["OPP", "PR", "JDG"];

interface ApiCard {
  riftbound_id: string;
  media: { image_url: string };
  metadata: { updated_on: string | null };
}

async function fetchSet(setId: string): Promise<ApiCard[]> {
  const all: ApiCard[] = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await fetch(`${BASE_URL}/cards?set_id=${setId}&size=100&page=${page}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`GET /cards ${setId} p${page} -> ${res.status}`);
    const data = await res.json();
    pages = data.pages;
    all.push(...data.items);
    page++;
  } while (page <= pages);
  return all;
}

async function main() {
  // Doublons spoiler : garder la fiche la plus récente par riftbound_id.
  const byRid = new Map<string, string>();
  for (const setId of SETS) {
    const cards = await fetchSet(setId);
    const seen = new Map<string, ApiCard>();
    for (const c of cards) {
      const prev = seen.get(c.riftbound_id);
      if (!prev || (c.metadata.updated_on ?? "") > (prev.metadata.updated_on ?? "")) seen.set(c.riftbound_id, c);
    }
    for (const c of seen.values()) byRid.set(c.riftbound_id, c.media.image_url);
    console.log(`${setId} : ${cards.length} fiches API -> ${seen.size} uniques`);
  }

  let fixed = 0;
  let missing = 0;
  const dbCards = await prisma.card.findMany({
    where: { set: { in: SETS } },
    select: { riftboundId: true, imageUrl: true, name: true },
  });
  for (const c of dbCards) {
    const url = byRid.get(c.riftboundId);
    if (!url) {
      missing++;
      console.log(`  absent de l'API : ${c.riftboundId} ${c.name}`);
      continue;
    }
    if (url !== c.imageUrl) {
      await prisma.card.update({ where: { riftboundId: c.riftboundId }, data: { imageUrl: url } });
      fixed++;
    }
  }
  console.log(`Terminé : ${fixed} image(s) corrigée(s), ${missing} carte(s) DB sans correspondance API`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
