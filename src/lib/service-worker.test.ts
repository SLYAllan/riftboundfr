import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { expect, it } from "vitest";

it("ne met ni les pages de compte ni les réponses React ou API dans le cache", () => {
  let intercepter: (evenement: { request: Request; respondWith: () => void }) => void = () => {};
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    URL, self: { location: { origin: "https://riftboundfrance.fr" }, addEventListener: (nom: string, fn: typeof intercepter) => { if (nom === "fetch") intercepter = fn; } },
  });
  for (const chemin of ["/profil", "/en/profil/overlay", "/compagnon/jeton", "/api/auth/me", "/zh/api/auth/me", "/decks?_rsc=1"]) {
    let interception = false;
    intercepter({ request: new Request(`https://riftboundfrance.fr${chemin}`), respondWith: () => { interception = true; } });
    expect(interception, chemin).toBe(false);
  }
});
