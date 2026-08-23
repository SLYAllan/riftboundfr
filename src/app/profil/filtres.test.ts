import { describe, expect, it } from "vitest";
import { lienFiltreProfil } from "./filtres";

describe("lienFiltreProfil", () => {
  it("garde le filtre qu'on ne touche pas", () => {
    expect(lienFiltreProfil({ legende: "Ahri" }, { visibilite: "public" }))
      .toBe("/profil?visibilite=public&legende=Ahri#mes-decks");
  });

  it("efface un filtre quand la clé est passée à undefined", () => {
    expect(lienFiltreProfil({ visibilite: "prive", legende: "Ahri" }, { legende: undefined }))
      .toBe("/profil?visibilite=prive#mes-decks");
  });

  it("ne confond pas « clé absente » et « clé à undefined »", () => {
    const courant = { visibilite: "public" };
    expect(lienFiltreProfil(courant, {})).toBe("/profil?visibilite=public#mes-decks");
    expect(lienFiltreProfil(courant, { visibilite: undefined })).toBe("/profil#mes-decks");
  });

  it("encode les noms de Légende à espace", () => {
    expect(lienFiltreProfil({}, { legende: "Miss Fortune" }))
      .toBe("/profil?legende=Miss+Fortune#mes-decks");
  });
});
