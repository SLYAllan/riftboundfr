import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(__dirname, "pagination.tsx"), "utf8");

describe("pagination", () => {
  it("offre des cibles de 44 px sur mobile", () => {
    expect(source.match(/h-11/g)).toHaveLength(3);
    expect(source.match(/sm:h-9/g)).toHaveLength(3);
  });
});
