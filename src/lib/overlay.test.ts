import { describe, it, expect } from "vitest";
import { defaultOverlayState, clampPoints, applyStateUpdate, makeToken } from "./overlay";

describe("overlay logic", () => {
  it("default state has two players, BO3, maxPoints 8, points 0", () => {
    const s = defaultOverlayState();
    expect(s.players).toHaveLength(2);
    expect(s.format).toBe("BO3");
    expect(s.maxPoints).toBe(8);
    expect(s.points).toEqual({ a: 0, b: 0 });
    expect(s.players[0].camEnabled).toBe(true);
  });

  it("clampPoints bornes 0..max", () => {
    expect(clampPoints(-3, 8)).toBe(0);
    expect(clampPoints(12, 8)).toBe(8);
    expect(clampPoints(9, 9)).toBe(9);
    expect(clampPoints(4, 8)).toBe(4);
  });

  it("applyStateUpdate merge en profondeur et re-clampe les points sur maxPoints", () => {
    const base = defaultOverlayState();
    const next = applyStateUpdate(base, { maxPoints: 9, points: { a: 9, b: 0 }, players: [{ name: "Squirtle" }, {}] });
    expect(next.maxPoints).toBe(9);
    expect(next.points.a).toBe(9);
    expect(next.players[0].name).toBe("Squirtle");
    const back = applyStateUpdate(next, { maxPoints: 8 });
    expect(back.points.a).toBe(8);
  });

  it("makeToken génère un slug url-safe de 16+ chars, unique", () => {
    const a = makeToken();
    const b = makeToken();
    expect(a).toMatch(/^[a-z0-9]{16,}$/);
    expect(a).not.toBe(b);
  });
});
