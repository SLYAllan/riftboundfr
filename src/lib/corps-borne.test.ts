import { expect, it } from "vitest";
import { lireCorpsBorne } from "./corps-borne";

it("lit un flux et refuse les octets excédentaires même sans Content-Length", async () => {
  expect(new TextDecoder().decode(await lireCorpsBorne(new Response("abcd"), 4))).toBe("abcd");
  await expect(lireCorpsBorne(new Response("abcde"), 4)).rejects.toThrow("Taille maximale dépassée");
  expect(await lireCorpsBorne(new Response(null), 4)).toHaveLength(0);
});
