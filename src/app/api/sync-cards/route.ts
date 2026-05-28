import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchAllCards, fetchSets } from "@/lib/riftcodex";
import { isAdmin } from "@/lib/auth";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const sets = await fetchSets();
    for (const s of sets) {
      await prisma.cardSet.upsert({
        where: { setId: s.set_id },
        update: { name: s.name, cardCount: s.card_count, publishedOn: s.published_on ? new Date(s.published_on) : null },
        create: { id: s.id, name: s.name, setId: s.set_id, cardCount: s.card_count, publishedOn: s.published_on ? new Date(s.published_on) : null },
      });
    }

    const cards = await fetchAllCards();
    let synced = 0;
    for (const c of cards) {
      await prisma.card.upsert({
        where: { riftboundId: c.riftbound_id },
        update: {
          name: c.name,
          cleanName: c.metadata?.clean_name ?? null,
          collectorNumber: c.collector_number ?? null,
          set: c.set?.set_id ?? "",
          setName: c.set?.label ?? "",
          type: c.classification?.type ?? "Unknown",
          supertype: c.classification?.supertype ?? null,
          rarity: c.classification?.rarity ?? "Common",
          domains: c.classification?.domain ?? [],
          energy: c.attributes?.energy ?? null,
          might: c.attributes?.might ?? null,
          power: c.attributes?.power ?? null,
          textRich: c.text?.rich ?? null,
          textPlain: c.text?.plain ?? null,
          flavorText: c.text?.flavour ?? null,
          imageUrl: c.media?.image_url ?? null,
          artist: c.media?.artist ?? null,
          tags: c.tags ?? [],
          alternateArt: c.metadata?.alternate_art ?? false,
          overnumbered: c.metadata?.overnumbered ?? false,
          signature: c.metadata?.signature ?? false,
        },
        create: {
          id: c.id,
          riftboundId: c.riftbound_id,
          name: c.name,
          cleanName: c.metadata?.clean_name ?? null,
          collectorNumber: c.collector_number ?? null,
          set: c.set?.set_id ?? "",
          setName: c.set?.label ?? "",
          type: c.classification?.type ?? "Unknown",
          supertype: c.classification?.supertype ?? null,
          rarity: c.classification?.rarity ?? "Common",
          domains: c.classification?.domain ?? [],
          energy: c.attributes?.energy ?? null,
          might: c.attributes?.might ?? null,
          power: c.attributes?.power ?? null,
          textRich: c.text?.rich ?? null,
          textPlain: c.text?.plain ?? null,
          flavorText: c.text?.flavour ?? null,
          imageUrl: c.media?.image_url ?? null,
          artist: c.media?.artist ?? null,
          tags: c.tags ?? [],
          alternateArt: c.metadata?.alternate_art ?? false,
          overnumbered: c.metadata?.overnumbered ?? false,
          signature: c.metadata?.signature ?? false,
        },
      });
      synced++;
    }

    return NextResponse.json({ ok: true, sets: sets.length, cards: synced });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
