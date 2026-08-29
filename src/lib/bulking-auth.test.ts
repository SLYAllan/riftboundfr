import { describe, expect, it } from "vitest";
import { libelleAdminDiscord } from "./bulking-auth";

describe("libelleAdminDiscord", () => {
  it("préfère le nom Discord", () => {
    expect(libelleAdminDiscord({ id: "1", username: "allan", discordName: "Allan#1" })).toBe("Allan#1");
  });

  it("se replie sur le nom du compte", () => {
    expect(libelleAdminDiscord({ id: "1", username: "allan", discordName: null })).toBe("allan");
  });
});
