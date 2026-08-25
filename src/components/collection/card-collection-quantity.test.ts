import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./card-collection-quantity.tsx", import.meta.url), "utf8");

describe("quantité d'une carte en collection", () => {
  test("réutilise la collection globale avec des commandes nommées", () => {
    expect(source).toContain("useCollection()");
    expect(source).toContain('aria-label={t("Retirer une copie")}');
    expect(source).toContain('aria-label={t("Ajouter une copie")}');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('href="/api/auth/discord"');
  });
});
