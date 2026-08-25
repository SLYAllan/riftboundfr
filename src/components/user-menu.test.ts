import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/user-menu.tsx", "utf8");
const anglais = readFileSync("src/lib/i18n-en.ts", "utf8");

describe("menu utilisateur", () => {
  it("refuse les réponses de session invalides et permet de réessayer", () => {
    expect(source).toMatch(/if \(!r\.ok\) throw/);
    expect(source).toMatch(/data !== null/);
    expect(source).toMatch(/typeof data\.username !== "string"/);
    for (const champ of ["avatarUrl", "discordName", "riotGameName"]) {
      expect(source).toContain(`data.${champ} !== null && typeof data.${champ} !== "string"`);
    }
    expect(source).toMatch(/role="alert"/);
    expect(source).toMatch(/Réessayer/);
  });

  it("prépare la relance dans l'action utilisateur, pas dans l'effet", () => {
    const effet = source.slice(source.indexOf("useEffect(() =>"), source.indexOf("}, [reload])"));
    expect(effet).not.toContain("setLoading(true)");
    expect(effet).not.toContain("setLoadError(false)");
    expect(source).toMatch(/const retry = \(\) => \{[\s\S]+setLoading\(true\)[\s\S]+setLoadError\(false\)[\s\S]+setReload/);
    expect(source).toMatch(/onClick=\{retry\}/);
  });

  it("ne masque le compte qu'après une déconnexion réussie", () => {
    const logout = source.slice(source.indexOf("const logout"), source.indexOf("if (loading)"));
    expect(logout).toMatch(/fetch\("\/api\/auth\/logout", \{ method: "POST" \}\)/);
    expect(logout).toMatch(/if \(!r\.ok\) throw[\s\S]+setUser\(null\)/);
    expect(source).toMatch(/disabled=\{logoutLoading\}/);
    expect(source).toMatch(/logoutError[\s\S]+role="alert"/);
  });

  it("rend le focus au déclencheur après Échap", () => {
    expect(source).toMatch(/triggerRef\.current\?\.focus\(\)/);
  });

  it("reste utilisable au clavier et au doigt", () => {
    expect(source).toContain("min-h-11 min-w-11");
    expect(source).toContain("focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arcane");
    expect(source).toMatch(/onBlur=\{\(e\) => \{[\s\S]*e\.currentTarget\.contains\(e\.relatedTarget\)[\s\S]*setOpen\(false\)/);
  });

  it("traduit les nouveaux états en anglais", () => {
    for (const texte of ["Connexion indisponible", "Déconnexion...", "La déconnexion a échoué. Réessayez."]) {
      expect(anglais).toContain(`\"${texte}\":`);
    }
  });
});
