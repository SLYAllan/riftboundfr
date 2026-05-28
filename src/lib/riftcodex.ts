import type { RiftcodexCard, RiftcodexSet, PaginatedResponse } from "@/types";

const BASE_URL = "https://api.riftcodex.com";

export async function fetchCards(
  page = 1,
  perPage = 50,
  params?: Record<string, string>
): Promise<PaginatedResponse<RiftcodexCard>> {
  const url = new URL(`${BASE_URL}/cards`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Riftcodex API error: ${res.status}`);
  return res.json();
}

export async function fetchAllCards(): Promise<RiftcodexCard[]> {
  const allCards: RiftcodexCard[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const data = await fetchCards(page, 100);
    allCards.push(...data.items);
    totalPages = data.pages;
    page++;
  } while (page <= totalPages);

  return allCards;
}

export async function fetchSets(): Promise<RiftcodexSet[]> {
  const res = await fetch(`${BASE_URL}/sets`);
  if (!res.ok) throw new Error(`Riftcodex API error: ${res.status}`);
  const data: PaginatedResponse<RiftcodexSet> = await res.json();
  return data.items;
}
