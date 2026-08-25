import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("chargement global", () => {
  it("annonce l'attente sans bloquer la page", () => {
    const source = readFileSync(resolve(__dirname, "loading.tsx"), "utf8");
    expect(source).toContain('import { tr } from "@/lib/i18n-server"');
    expect(source).toContain("const t = await tr()");
    expect(source).toContain('{t("Chargement…")}');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
  });
});
