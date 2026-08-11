import { describe, it, expect } from "vitest";
import { decouperEmotes, trouverEmote, LISTE_EMOTES } from "./emotes";

const textes = (t: string) => decouperEmotes(t).map((m) => (m.type === "texte" ? m.valeur : `<${m.emote.nom}>`)).join("");

describe("vocabulaire", () => {
  it("connaît les six domaines en français et en anglais", () => {
    for (const nom of ["furie", "calme", "esprit", "corps", "chaos", "ordre", "fury", "calm", "mind", "body", "order"]) {
      expect(trouverEmote(nom), nom).toBeDefined();
    }
    expect(trouverEmote("furie")!.src).toBe("/icons/Fury.webp");
  });

  it("connaît les Légendes, y compris celles à apostrophe", () => {
    for (const nom of ["irelia", "diana", "sett", "khazix", "kaisa", "reksai"]) {
      expect(trouverEmote(nom), nom).toBeDefined();
    }
    expect(trouverEmote("irelia")!.src).toBe("/img/legend_icon/irelia.webp");
  });

  it("ignore la casse", () => {
    expect(trouverEmote("IRELIA")?.nom).toBe("irelia");
  });

  it("liste les domaines avant les Légendes pour le menu", () => {
    expect(LISTE_EMOTES[0].categorie).toBe("domaine");
    expect(LISTE_EMOTES.at(-1)!.categorie).toBe("legende");
  });

  // « calme » et « calm » pointent la même image : le menu n'en montre qu'une,
  // sinon le même logo apparaît deux fois de suite.
  it("ne montre qu'une entrée par icône dans le menu", () => {
    const srcs = LISTE_EMOTES.map((e) => e.src);
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(LISTE_EMOTES.filter((e) => e.categorie === "domaine")).toHaveLength(6);
    // les alias restent reconnus à la lecture
    expect(trouverEmote("calm")!.src).toBe(trouverEmote("calme")!.src);
  });
});

describe("decouperEmotes", () => {
  it("remplace une incrustation isolée", () => {
    expect(textes("je joue :furie: ici")).toBe("je joue <furie> ici");
  });

  it("en remplace plusieurs à la suite", () => {
    expect(textes(":furie::calme:")).toBe("<furie><calme>");
  });

  it("laisse le texte intact quand le nom est inconnu", () => {
    expect(textes("un :truc: inconnu")).toBe("un :truc: inconnu");
  });

  // Sans garde, « rendez-vous à 12:30: » ou une URL deviendraient des images.
  it("ne touche pas aux deux-points ordinaires", () => {
    for (const t of ["rendez-vous à 12:30", "https://exemple.fr/page", "note : ceci", "a:b"]) {
      expect(textes(t)).toBe(t);
    }
  });

  it("renvoie un seul morceau quand il n'y a rien à remplacer", () => {
    const m = decouperEmotes("texte simple");
    expect(m).toHaveLength(1);
    expect(m[0]).toEqual({ type: "texte", valeur: "texte simple" });
  });

  it("gère le texte vide", () => {
    expect(decouperEmotes("")).toEqual([{ type: "texte", valeur: "" }]);
  });
});
