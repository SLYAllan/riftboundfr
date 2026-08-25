import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("ne recharge la page qu'après une rotation de lien réussie", () => {
  const source = readFileSync(new URL("./overlay-dashboard.tsx", import.meta.url), "utf8");
  expect(source).toContain("async function renouvelerLienOverlay()");
  expect(source).toContain("if (!reponse.ok) throw new Error");
  expect(source).toContain("location.reload()");
  expect(source).toContain('t("Impossible de créer un nouveau lien. Réessayez.")');
});
