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

async function syncSets() {
  console.log("Syncing sets...");
  const res = await fetch(`${BASE_URL}/sets`);
  const data = await res.json();
  const sets: RiftcodexSet[] = data.items;

  for (const s of sets) {
    await prisma.cardSet.upsert({
      where: { setId: s.set_id },
      update: { name: s.name, cardCount: s.card_count },
      create: {
        id: s.id,
        name: s.name,
        setId: s.set_id,
        cardCount: s.card_count,
        publishedOn: s.published_on ? new Date(s.published_on) : null,
      },
    });
  }
  console.log(`Synced ${sets.length} sets`);
}

async function syncCards() {
  console.log("Syncing cards...");
  let page = 1;
  let totalPages = 1;
  let total = 0;

  do {
    const res = await fetch(`${BASE_URL}/cards?page=${page}&per_page=100`);
    const data = await res.json();
    const cards: RiftcodexCard[] = data.items;
    totalPages = data.pages;

    for (const c of cards) {
      await prisma.card.upsert({
        where: { id: c.id },
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
    }

    total += cards.length;
    console.log(`Page ${page}/${totalPages} - ${total} cards synced`);
    page++;
  } while (page <= totalPages);

  console.log(`Done! Total: ${total} cards`);
}

async function main() {
  try {
    await syncSets();
    await syncCards();
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
