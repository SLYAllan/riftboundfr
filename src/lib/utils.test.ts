import { describe, it, expect } from "vitest";
import { slugify, formatDate, cn } from "./utils";

describe("slugify", () => {
  it("converts text to kebab-case slug", () => {
    expect(slugify("RQ Houston 2025")).toBe("rq-houston-2025");
  });

  it("handles accented characters", () => {
    expect(slugify("Xi'an Regional Open S3")).toBe("xi-an-regional-open-s3");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("--test--")).toBe("test");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats ISO date string in French", () => {
    const result = formatDate("2026-05-16T00:00:00.000Z");
    expect(result).toContain("mai");
    expect(result).toContain("2026");
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2025-12-01"));
    expect(result).toContain("2025");
  });
});

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("deduplicates tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
