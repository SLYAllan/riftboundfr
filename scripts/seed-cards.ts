import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE_URL = "https://api.riftcodex.com";

interface RiftcodexCard {
  id: string;
  name: string;
  riftbound_id: string;
  collector_number: number;
  attributes: { energy: number | null; might: number | null; power: number | null };
  classification: { type: string; supertype: string | null; rarity: string; domain: string[] };
  text: { rich: string | null; plain: string | null; flavour: string | null };
  set: { set_id: string; label: string };
  media: { image_url: string; artist: string | null };
  tags: string[];
  metadata: { clean_name: string; alternate_art: boolean; overnumbered: boolean; signature: boolean };
}

interface RiftcodexSet {
  id: string;
  name: string;
  set_id: string;
  card_count: number;
  published_on: string;
}

async function fetchAllCards(): Promise<RiftcodexCard[]> {
  const all: RiftcodexCard[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const url = `${BASE_URL}/cards?page=${page}&per_page=100`;
    console.log(`  Fetching page ${page}/${totalPages}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    all.push(...data.items);
    totalPages = data.pages;
    page++;
  } while (page <= totalPages);

  return all;
}

async function fetchSets(): Promise<RiftcodexSet[]> {
  const res = await fetch(`${BASE_URL}/sets`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.items;
}

async function main() {
  console.log("=== Seed Riftbound DB ===\n");

  console.log("[1/3] Fetching sets...");
  const sets = await fetchSets();
  console.log(`  ${sets.length} sets found`);

  for (const s of sets) {
    await prisma.cardSet.upsert({
      where: { setId: s.set_id },
      update: { name: s.name, cardCount: s.card_count, publishedOn: s.published_on ? new Date(s.published_on) : null },
      create: { id: s.id, setId: s.set_id, name: s.name, cardCount: s.card_count, publishedOn: s.published_on ? new Date(s.published_on) : null },
    });
  }
  console.log(`  Sets upserted.\n`);

  console.log("[2/3] Fetching cards...");
  const cards = await fetchAllCards();
  console.log(`  ${cards.length} cards fetched\n`);

  console.log("[3/3] Upserting cards...");
  let count = 0;
  for (const c of cards) {
    await prisma.card.upsert({
      where: { riftboundId: c.riftbound_id },
      update: {
        name: c.name,
        cleanName: c.metadata.clean_name,
        collectorNumber: c.collector_number,
        set: c.set.set_id,
        setName: c.set.label,
        type: c.classification.type,
        supertype: c.classification.supertype,
        rarity: c.classification.rarity,
        domains: c.classification.domain,
        energy: c.attributes.energy,
        might: c.attributes.might,
        power: c.attributes.power,
        textRich: c.text.rich,
        textPlain: c.text.plain,
        flavorText: c.text.flavour,
        imageUrl: c.media.image_url,
        artist: c.media.artist,
        tags: c.tags,
        alternateArt: c.metadata.alternate_art,
        overnumbered: c.metadata.overnumbered,
        signature: c.metadata.signature,
      },
      create: {
        id: c.id,
        riftboundId: c.riftbound_id,
        name: c.name,
        cleanName: c.metadata.clean_name,
        collectorNumber: c.collector_number,
        set: c.set.set_id,
        setName: c.set.label,
        type: c.classification.type,
        supertype: c.classification.supertype,
        rarity: c.classification.rarity,
        domains: c.classification.domain,
        energy: c.attributes.energy,
        might: c.attributes.might,
        power: c.attributes.power,
        textRich: c.text.rich,
        textPlain: c.text.plain,
        flavorText: c.text.flavour,
        imageUrl: c.media.image_url,
        artist: c.media.artist,
        tags: c.tags,
        alternateArt: c.metadata.alternate_art,
        overnumbered: c.metadata.overnumbered,
        signature: c.metadata.signature,
      },
    });
    count++;
    if (count % 100 === 0) console.log(`  ${count}/${cards.length} cards...`);
  }

  console.log(`\n=== Done! ${count} cards, ${sets.length} sets imported. ===`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
