import { readFileSync } from "node:fs";
import { expect, test } from "vitest";

test("le lien Guides ouvre l’index des guides", () => {
  const source = readFileSync(new URL("./footer.tsx", import.meta.url), "utf8");
  expect(source).toContain('{ href: "/guides", label: "Guides" }');
});
