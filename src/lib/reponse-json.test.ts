import { describe, expect, it } from "vitest";
import { lireTableauJson } from "./reponse-json";

describe("lireTableauJson", () => {
  it("renvoie un tableau valide", async () => {
    const reponse = new Response(JSON.stringify([{ id: "a" }, { id: "b" }]), {
      status: 200,
    });
    const liste = await lireTableauJson<{ id: string }>(reponse);
    expect(liste).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("lève sur un 500 qui renvoie un objet d'erreur", async () => {
    const reponse = new Response(JSON.stringify({ error: "en panne" }), {
      status: 500,
    });
    await expect(lireTableauJson(reponse)).rejects.toThrow();
  });

  it("lève sur un 200 dont le corps n'est pas un tableau", async () => {
    const reponse = new Response(JSON.stringify({ id: "a" }), { status: 200 });
    await expect(lireTableauJson(reponse)).rejects.toThrow();
  });
});
