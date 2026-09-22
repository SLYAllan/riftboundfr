import { describe, expect, it } from "vitest";
import { classementVide, ecrireClassement, lireClassement, lireTitre, nomsCourts, ranger, TITRE_MAX } from "./tier-list-perso";

const connues = new Set(["kennen-heart-of-the-tempest", "irelia-blade-dancer", "master-yi-wuju-master", "azir-emperor-of-the-sands"]);

describe("tier list d'un visiteur", () => {
  it("relit ce qu'elle a écrit", () => {
    let c = classementVide();
    c = ranger(c, "kennen-heart-of-the-tempest", "S");
    c = ranger(c, "irelia-blade-dancer", "S");
    c = ranger(c, "azir-emperor-of-the-sands", "C");
    const params = ecrireClassement(c, "  Ma tier list  ");
    expect(params.toString()).toBe("titre=Ma+tier+list&s=kennen-heart-of-the-tempest.irelia-blade-dancer&c=azir-emperor-of-the-sands");
    expect(lireClassement(params, connues)).toEqual(c);
    expect(lireTitre(params)).toBe("Ma tier list");
  });

  it("ignore une Légende inconnue ou citée deux fois", () => {
    const params = new URLSearchParams("s=kennen-heart-of-the-tempest.teemo-inconnu&a=kennen-heart-of-the-tempest.irelia-blade-dancer");
    expect(lireClassement(params, connues)).toEqual({ ...classementVide(), S: ["kennen-heart-of-the-tempest"], A: ["irelia-blade-dancer"] });
  });

  it("déplace une Légende sans la dupliquer, et la rend à la réserve", () => {
    let c = ranger(classementVide(), "master-yi-wuju-master", "B");
    c = ranger(c, "master-yi-wuju-master", "A");
    expect(c.A).toEqual(["master-yi-wuju-master"]);
    expect(c.B).toEqual([]);
    expect(ranger(c, "master-yi-wuju-master", null)).toEqual(classementVide());
  });

  it("écrit le personnage sous l'icône, ou le titre quand deux Légendes le partagent", () => {
    const courts = nomsCourts([
      { slug: "kennen-heart-of-the-tempest", nom: "Kennen, Heart of the Tempest" },
      { slug: "master-yi-wuju-bladesman", nom: "Master Yi, Wuju Bladesman" },
      { slug: "master-yi-wuju-master", nom: "Master Yi, Wuju Master" },
    ]);
    expect(courts.get("kennen-heart-of-the-tempest")).toBe("Kennen");
    expect(courts.get("master-yi-wuju-bladesman")).toBe("Wuju Bladesman");
    expect(courts.get("master-yi-wuju-master")).toBe("Wuju Master");
  });

  it("borne le titre", () => {
    const long = "x".repeat(TITRE_MAX + 20);
    expect(lireTitre(new URLSearchParams({ titre: long }))).toHaveLength(TITRE_MAX);
    expect(ecrireClassement(classementVide(), long).get("titre")).toHaveLength(TITRE_MAX);
    expect(ecrireClassement(classementVide(), "   ").toString()).toBe("");
  });
});
