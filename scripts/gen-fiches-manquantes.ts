// Genere les fiches data/fiches/*.json manquantes pour les Legendes qui pesent
// dans le meta. AUCUNE prose inventee : uniquement des donnees mesurees sur les
// decklists locales (data/decklists) et la base cartes.
//   - keyCards = cartes presentes dans >= 60 % des listes, role = frequence reelle
//   - competitiveResults = comptage reel des placements
//   - archetype / gameplan / forces / faiblesses : volontairement absents, la page
//     les rend optionnels. Allan les ecrit a la main quand il veut.
import { PrismaClient } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";

const prisma = new PrismaClient();

// Legendes sans fiche qui pesent >= 100 decklists locales. Vi, Jhin, Poppy et
// Ivern sont laissees de cote : moins de 80 listes et aucun top 8.
const TARGETS = [
  "Kai'Sa, Daughter of the Void",
  "Annie, Dark Child",
  "Yasuo, Unforgiven",
  "Darius, Hand of Noxus",
  "Jinx, Loose Cannon",
  "Lux, Lady of Luminosity",
  "Lee Sin, Blind Monk",
  "Lucian, Purifier",
  "Jax, Grandmaster At Arms",
  "Rumble, Mechanized Menace",
  "Rek'Sai, Void Burrower",
  "Pyke, Bloodharbor Ripper",
  "Garen, Might of Demacia",
  "Renata Glasc, Chem-Baroness",
];

const TIER_NUM: Record<string, number> = { S: 1, A: 2, B: 3, C: 3, D: 4 };

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface LocalDeck {
  legend: string;
  placement: number | null;
  mainDeck?: { name: string; quantity: number; riftboundId?: string | null }[];
}

async function readAllDecklists(): Promise<LocalDeck[]> {
  const root = path.join(process.cwd(), "data", "decklists");
  const out: LocalDeck[] = [];
  for (const dir of await fs.readdir(root)) {
    const full = path.join(root, dir);
    if (!(await fs.stat(full)).isDirectory()) continue;
    for (const file of await fs.readdir(full)) {
      if (!file.endsWith(".json")) continue;
      try {
        out.push(JSON.parse(await fs.readFile(path.join(full, file), "utf-8")));
      } catch {
        /* fichier illisible : on l'ignore plutot que d'arreter la generation */
      }
    }
  }
  return out;
}

async function main() {
  const all = await readAllDecklists();
  const tierEntries = await prisma.tierList.findMany({
    where: { published: true },
    include: { entries: true },
  });

  for (const legendName of TARGETS) {
    const slug = slugify(legendName);
    const dest = path.join(process.cwd(), "data", "fiches", `${slug}.json`);
    try {
      await fs.access(dest);
      console.log(`SKIP ${slug} : fiche deja presente`);
      continue;
    } catch {
      /* pas de fiche : on la genere */
    }

    const lists = all.filter((d) => d.legend === legendName);
    if (lists.length === 0) {
      console.log(`SKIP ${slug} : aucune decklist locale`);
      continue;
    }

    const card = await prisma.card.findFirst({
      where: { type: "Legend", name: { equals: legendName, mode: "insensitive" } },
    });
    if (!card) {
      console.log(`SKIP ${slug} : legende introuvable en base`);
      continue;
    }

    // frequence : nombre de listes ou la carte apparait, pas le nombre d'exemplaires
    const seen = new Map<string, { id: string | null; n: number }>();
    for (const d of lists) {
      const uniq = new Set<string>();
      for (const c of d.mainDeck ?? []) uniq.add(c.name);
      for (const name of uniq) {
        const prev = seen.get(name);
        const id = (d.mainDeck ?? []).find((c) => c.name === name)?.riftboundId ?? null;
        seen.set(name, { id: prev?.id ?? id, n: (prev?.n ?? 0) + 1 });
      }
    }

    // On écrit le vrai nom de carte, pas le code : les codes des scrapes ne sont pas
    // zéro-remplis (OGN-39) alors que la base attend « ogn-039- ». L'id n'est gardé
    // que s'il résout vraiment, sinon la page afficherait un code mort.
    const keyCards: { name: string; id?: string; role: string }[] = [];
    const ranked = [...seen.entries()]
      .map(([name, v]) => ({ name, code: v.id, pct: Math.round((100 * v.n) / lists.length) }))
      .filter((c) => c.pct >= 60)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8);
    for (const c of ranked) {
      let id: string | undefined;
      const m = c.code?.match(/^([A-Za-z]+)-(\d+)$/);
      if (m) {
        const pref = `${m[1].toLowerCase()}-${m[2].padStart(3, "0")}-`;
        const hit = await prisma.card.findFirst({ where: { riftboundId: { startsWith: pref } } });
        if (hit) id = `${m[1].toUpperCase()}-${m[2].padStart(3, "0")}`;
      }
      keyCards.push({
        name: c.name,
        ...(id ? { id } : {}),
        role: `Présente dans ${c.pct} % des ${lists.length} listes recensées.`,
      });
    }

    const tierLetter = tierEntries
      .flatMap((tl) => tl.entries.map((e) => ({ set: tl.setContext, ...e })))
      .find((e) => e.legendName === legendName && e.set === "Unleashed")?.tier;

    const top8 = lists.filter((d) => d.placement != null && d.placement <= 8).length;
    const wins = lists.filter((d) => d.placement === 1).length;

    const fiche = {
      legendName,
      legendId: card.riftboundId,
      domains: card.domains,
      set: card.setName,
      tier: tierLetter ? TIER_NUM[tierLetter] ?? null : null,
      keyCards,
      competitiveResults: {
        decklistsRecensees: lists.length,
        top8,
        victoires: wins,
        source: "Decklists de tournoi scrapées, data/decklists.",
      },
      sourceUrl: null,
    };

    await fs.writeFile(dest, JSON.stringify(fiche, null, 2) + "\n", "utf-8");
    console.log(
      `${slug} : ${lists.length} listes, ${keyCards.length} cartes cœur, tier ${tierLetter ?? "?"}, ${top8} top 8`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
