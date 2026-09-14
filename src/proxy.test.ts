import { expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

it("refuse les écritures étrangères dans les trois langues", () => {
  for (const prefixe of ["", "/en", "/zh"]) {
    const requete = new NextRequest(`https://riftboundfrance.fr${prefixe}/api/auth/logout`, {
      method: "POST", headers: { host: "riftboundfrance.fr", origin: "https://autre.fr" },
    });
    expect(proxy(requete).status).toBe(403);
  }
});

it("refuse aussi une origine HTTP et accepte la même origine HTTPS", () => {
  for (const [origine, statut] of [["http://riftboundfrance.fr", 403], ["https://riftboundfrance.fr", 200]] as const) {
    expect(proxy(new NextRequest("https://riftboundfrance.fr/api/auth/logout", {
      method: "POST", headers: { host: "riftboundfrance.fr", origin: origine },
    })).status).toBe(statut);
  }
});
