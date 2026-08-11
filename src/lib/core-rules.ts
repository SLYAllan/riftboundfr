import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Règles de base officielles, version française, extraites du PDF du Hub des règles
// (playriftbound.com/fr-fr/rules-hub/, dernière mise à jour du 16 juillet 2026) par
// `scripts/parse-core-rules.py`. Le PDF fait 44 Mo et n'est pas versionné ; le JSON
// est la source de la recherche.
export const CORE_RULES_UPDATED = "16 juillet 2026";
export const CORE_RULES_PDF =
  "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/f668751be265e4bdf828145b593a74e0ddab6a9f.pdf";

export interface CoreRule {
  id: string;
  text: string;
  section: string;
  top: string;
}

// Le fichier est lu une fois par processus : 2 000 règles, on ne relit pas à chaque
// recherche.
let cache: CoreRule[] | null = null;

export async function loadCoreRules(): Promise<CoreRule[]> {
  if (cache) return cache;
  try {
    const buf = await readFile(join(process.cwd(), "data", "rules", "core-rules-fr.json"), "utf8");
    cache = JSON.parse(buf) as CoreRule[];
  } catch {
    cache = []; // fichier absent : la recherche marche sans, avec les autres sources
  }
  return cache;
}

export interface RuleChapter {
  title: string;
  anchor: string;
  rules: CoreRule[];
}

// Le regroupement par chapitre ne dépend pas de la requête : on le calcule une fois
// par processus, pas à chaque affichage de la page.
let chapters: RuleChapter[] | null = null;

export async function loadRuleChapters(): Promise<RuleChapter[]> {
  if (chapters) return chapters;
  const rules = await loadCoreRules();
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
  chapters = out;
  return chapters;
}
