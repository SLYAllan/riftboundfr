import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Langue } from "./i18n";

// Règles de base officielles, extraites des PDF par `scripts/parse-core-rules.py`.
// Les PDF pèsent plus de 40 Mo et ne sont pas versionnés ; les JSON font foi pour la
// recherche. Même révision des deux côtés (16 juillet 2026) et MÊME numérotation :
// la règle 103.2 porte le même numéro en français et en anglais.
//
// La version anglaise a été ajoutée parce que `/en/outils/regles` servait les règles
// françaises à un lecteur anglophone — 2 600 phrases dans la mauvaise langue.
export const CORE_RULES_UPDATED = "16 juillet 2026";

/**
 * Langues où le règlement officiel existe. Le chinois n'a pas de PDF chez Riot : il
 * n'est là que pour l'overlay, et retombe sur l'anglais plutôt que sur le français,
 * qui laisserait un lecteur chinois devant 2 600 phrases dans une langue de moins.
 */
export type LangueRegles = "fr" | "en";

export function langueRegles(langue: Langue): LangueRegles {
  return langue === "fr" ? "fr" : "en";
}

const PDF: Record<LangueRegles, string> = {
  fr: "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/f668751be265e4bdf828145b593a74e0ddab6a9f.pdf",
  en: "https://static.dotgg.gg/media/sites/67/2026/03/Riftbound-Core-Rules-RUP4-July-16-2026.pdf",
};

/** Le PDF officiel de la langue demandée. */
export function pdfDesRegles(langue: Langue): string {
  return PDF[langueRegles(langue)];
}

export interface CoreRule {
  id: string;
  text: string;
  section: string;
  top: string;
}

// Le fichier est lu une fois par processus et par langue : 2 300 règles, on ne relit
// pas à chaque recherche.
const cache = new Map<LangueRegles, CoreRule[]>();

export async function loadCoreRules(demandee: Langue = "fr"): Promise<CoreRule[]> {
  const langue = langueRegles(demandee);
  const deja = cache.get(langue);
  if (deja) return deja;
  let rules: CoreRule[];
  try {
    const buf = await readFile(join(process.cwd(), "data", "rules", `core-rules-${langue}.json`), "utf8");
    rules = JSON.parse(buf) as CoreRule[];
  } catch {
    rules = []; // fichier absent : la recherche marche sans, avec les autres sources
  }
  cache.set(langue, rules);
  return rules;
}

export interface RuleChapter {
  title: string;
  anchor: string;
  rules: CoreRule[];
}

// Le regroupement par chapitre ne dépend pas de la requête : on le calcule une fois
// par processus et par langue, pas à chaque affichage de la page.
const chapters = new Map<LangueRegles, RuleChapter[]>();

export async function loadRuleChapters(demandee: Langue = "fr"): Promise<RuleChapter[]> {
  const langue = langueRegles(demandee);
  const deja = chapters.get(langue);
  if (deja) return deja;
  const rules = await loadCoreRules(langue);
  const out: RuleChapter[] = [];
  // Le regroupement suit l'ordre du document : un même titre qui revient plus
  // loin ouvre un second chapitre. Sans suffixe, les deux portaient le même id
  // et le sommaire renvoyait toujours au premier (« Équiper », « Amplification »,
  // « Champs de bataille », « Présence sur les permanents »).
  const used = new Map<string, number>();
  for (const r of rules) {
    const last = out[out.length - 1];
    if (last && last.title === r.section) last.rules.push(r);
    else {
      const title = r.section || "Règles générales";
      const base =
        "s-" +
        title
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      out.push({ title, anchor: n === 1 ? base : `${base}-${n}`, rules: [r] });
    }
  }
  chapters.set(langue, out);
  return out;
}
