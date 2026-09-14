import { expect, it } from "vitest";
import { parcourirLots } from "./collection-lots";

it("parcourt aussi les résultats au-delà du premier lot sans les garder en mémoire", async () => {
  const vus: number[] = [];
  await parcourirLots(async (offset, taille) => [0, 1, 2, 3, 4].slice(offset, offset + taille), (lot) => { vus.push(...lot); }, 2);
  expect(vus).toEqual([0, 1, 2, 3, 4]);
});
