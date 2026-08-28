import { describe, expect, it } from "vitest";
import { cleLegende, getBannerUrl, getLegendIconUrl } from "./banners";

describe("cleLegende", () => {
  it("garde le champion, quel que soit le séparateur du titre", () => {
    expect(cleLegende("Annie, Dark Child")).toBe("annie");
    expect(cleLegende("Annie - Fiery")).toBe("annie");
    expect(cleLegende("Rek'Sai, Void Burrower")).toBe("rek'sai");
  });
});

describe("habillage d’une Légende", () => {
  it("rend la bannière et l’icône d’une Légende connue", () => {
    expect(getBannerUrl("Annie, Dark Child")).toBe("/bannieres/annie.webp");
    expect(getLegendIconUrl("Annie, Dark Child")).toBe("/img/legend_icon/annie.webp");
  });

  it("distingue les DEUX Master Yi", () => {
    // Wuju Bladesman et Wuju Master sont deux Légendes différentes. Sans ce cas,
    // les deux tombaient sur la même icône.
    expect(getLegendIconUrl("Master Yi, Wuju Master")).toBe("/img/legend_icon/masteryi_2.webp");
    expect(getLegendIconUrl("Master Yi, Wuju Bladesman")).toBe("/img/legend_icon/masteryi_1.webp");
  });

  it("rend null pour une Légende sans habillage", () => {
    // C'est ce cas que `npm run maj:overlay` inventorie : un cadre vide à l'écran.
    expect(getBannerUrl("Champion inconnu, Titre")).toBeNull();
    expect(getLegendIconUrl("Champion inconnu, Titre")).toBeNull();
  });
});
