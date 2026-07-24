// Import du set Vendetta (VEN) depuis l'API Riftcodex.
// Script séparé de sync-cards.ts : l'API nomme désormais les cartes
// « Nom - Titre » alors que toute la DB (et les decklists) utilise
// « Nom, Titre ». On convertit le premier « - » en virgule et on ne touche
// QU'AUX cartes VEN pour ne pas écraser les noms existants.
// Rejouable : upsert par id, à relancer quand le set se complète.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://api.riftcodex.com";
// L'API renvoie 403 sans User-Agent (python/urllib bloqué, curl et ce header passent).
const HEADERS = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) RiftboundFrance-sync" };

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
  metadata: { clean_name: string; alternate_art: boolean; overnumbered: boolean; signature: boolean; updated_on: string | null };
}

// Corrections de données API vérifiées à la main :
// - ven-194-166 : seule fiche de la série 189-197 (rééditions overnumbered des
//   légendes) sans préfixe champion ni drapeau overnumbered — c'est la
//   réédition de Jayce (ven-149).
// - ven-155/197 : « Yordle, » est un tag qui a fui dans le nom (la carte est
//   « Kennen - Heart of the Tempest »).
const NAME_FIXUPS: Record<string, string> = {
  "ven-194-166": "Jayce, Defender of Tomorrow (Overnumbered)",
  "ven-155-166": "Kennen, Heart of the Tempest",
  "ven-197-166": "Kennen, Heart of the Tempest (Overnumbered)",
};
const OVERNUMBERED_FIXUPS = new Set(["ven-194-166"]);

// « Zed - Master of Shadows (Overnumbered) » → « Zed, Master of Shadows (Overnumbered) »
function toDbName(c: RiftcodexCard): string {
  return NAME_FIXUPS[c.riftbound_id] ?? c.name.replace(" - ", ", ");
}

async function syncSetRow() {
  const res = await fetch(`${BASE_URL}/sets?size=50`, { headers: HEADERS });
  if (!res.ok) throw new Error(`GET /sets -> ${res.status}`);
  const data = await res.json();
  const ven = data.items.find((s: { set_id: string }) => s.set_id === "VEN");
  if (!ven) throw new Error("Set VEN absent de /sets");

  await prisma.cardSet.upsert({
    where: { setId: "VEN" },
    update: { name: ven.name, cardCount: ven.card_count },
    create: {
      id: ven.id,
      name: ven.name,
      setId: "VEN",
      cardCount: ven.card_count,
      publishedOn: ven.published_on ? new Date(ven.published_on) : null,
    },
  });
  console.log(`Set ${ven.name} (VEN) : ${ven.card_count} cartes annoncées`);
}

async function fetchAllCards(): Promise<RiftcodexCard[]> {
  const all: RiftcodexCard[] = [];
  let page = 1;
  let pages = 1;
  do {
    const res = await fetch(`${BASE_URL}/cards?set_id=VEN&size=100&page=${page}`, { headers: HEADERS });
    if (!res.ok) throw new Error(`GET /cards page ${page} -> ${res.status}`);
    const data = await res.json();
    pages = data.pages;
    all.push(...data.items);
    page++;
  } while (page <= pages);
  return all;
}

async function syncCards() {
  const raw = await fetchAllCards();

  // L'API contient des doublons : d'anciennes fiches de la saison spoiler
  // partagent le riftbound_id des fiches finales (ex. « Rogue Assassin » vs
  // « Akali - Rogue Assassin »). On garde la plus récente (updated_on) par
  // riftbound_id, et on upsert par riftboundId — clé stable de notre DB.
  const byRid = new Map<string, RiftcodexCard>();
  for (const c of raw) {
    const prev = byRid.get(c.riftbound_id);
    if (!prev || (c.metadata.updated_on ?? "") > (prev.metadata.updated_on ?? "")) {
      byRid.set(c.riftbound_id, c);
    }
  }
  console.log(`${raw.length} fiches API -> ${byRid.size} cartes uniques (doublons spoiler ignorés)`);

  let count = 0;
  let renamed = 0;
  for (const c of byRid.values()) {
    const name = toDbName(c);
    if (name !== c.name) renamed++;
    const isOvernumbered = c.metadata.overnumbered || OVERNUMBERED_FIXUPS.has(c.riftbound_id);
    // Les éditions overnumbered sont en rareté Showcase ; l'API VEN garde à tort
    // la rareté de la carte de base. Les alternate art (« a ») gardent la leur.
    const rarity = isOvernumbered ? "Showcase" : c.classification.rarity;
    const fields = {
      name,
      cleanName: c.metadata.clean_name,
      collectorNumber: c.collector_number,
      set: c.set.set_id,
      setName: c.set.label,
      type: c.classification.type,
      supertype: c.classification.supertype,
      rarity,
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
      overnumbered: isOvernumbered,
      signature: c.metadata.signature,
    };
    await prisma.card.upsert({
      where: { riftboundId: c.riftbound_id },
      update: fields,
      create: { id: c.id, riftboundId: c.riftbound_id, ...fields },
    });
    count++;
  }

  console.log(`Terminé : ${count} cartes VEN importées (${renamed} noms « - » convertis en virgule)`);
}

async function main() {
  try {
    await syncSetRow();
    await syncCards();
  } catch (error) {
    console.error("Import VEN échoué :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
