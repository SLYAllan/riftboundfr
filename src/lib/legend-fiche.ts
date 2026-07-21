// Lien d'une Légende vers sa fiche /legendes/[slug].
//
// Le slug est le nom de fichier dans data/fiches/ (ex. "irelia-blade-dancer").
// Il se déduit du nom canonique, apostrophes retirées : "Kha'Zix, Voidreaver"
// -> "khazix-voidreaver". On ne renvoie un lien QUE si la fiche existe, sinon on
// enverrait le lecteur (et Google) sur un 404 : seules 22 Légendes en ont une.

import { promises as fs } from "fs";
import path from "path";

const FICHES_DIR = path.join(process.cwd(), "data", "fiches");
let slugs: Set<string> | null = null;

export function legendFicheSlug(legendName: string): string {
  return legendName
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function legendFicheHref(legendName: string | null | undefined): Promise<string | null> {
  if (!legendName) return null;
  if (!slugs) {
    try {
      const files = await fs.readdir(FICHES_DIR);
      slugs = new Set(files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
    } catch {
      slugs = new Set();
    }
  }
  const slug = legendFicheSlug(legendName);
  return slugs.has(slug) ? `/legendes/${slug}` : null;
}
