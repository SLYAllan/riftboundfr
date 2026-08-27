/**
 * Écrit la fiche de tournoi (`data/tournaments/<slug>.json`) d'un relevé hexgate.
 *
 *   npx tsx scripts/tournois-hexgate.mts 238 239 240
 *
 * Les 330 decklists converties par `parse-hexgate.mts` ne suffisent pas : une page
 * de tournoi lit aussi une fiche (nom, date, lieu, nombre de joueurs, Top 8,
 * répartition par Légende) et une entrée de drapeau dans `src/lib/tournament-flags.ts`.
 *
 * Tout est compté sur les listes retenues, jamais annoncé à la louche : le Top 8
 * vient des rangs 1 à 8 réellement relevés, la répartition des Légendes du corpus
 * converti. Le nombre de joueurs, lui, vient de hexgate.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RACINE_BRUT = "data/raw-scrapes/hexgate";
const RACINE_DECKS = "data/decklists";

interface Conversion {
  contexte: string;
  ecrits: string[];
  ecartes: Array<{ deck_id: number; joueur: string; raison: string }>;
}

interface Decklist {
  legend: string;
  player: string;
  placement: number;
  playerCount: number;
  date: string;
  domains: string[];
  sourceUrl: string;
}

const ids = process.argv.slice(2).filter((a) => /^\d+$/.test(a));
if (!ids.length) {
  console.error("Usage : npx tsx scripts/tournois-hexgate.mts <id> [<id>…]");
  process.exit(1);
}

for (const id of ids) {
  const conv = JSON.parse(
    readFileSync(join(RACINE_BRUT, `tournoi-${id}-conversion.json`), "utf8"),
  ) as Conversion;
  const decks = conv.ecrits.map(
    (chemin) => JSON.parse(readFileSync(join(RACINE_DECKS, chemin), "utf8")) as Decklist,
  );
  if (!decks.length) {
    console.log(`${id} : aucune liste convertie`);
    continue;
  }

  // « S4 Suzhou City Challenge (2026-08-23) » → ville « Suzhou », épreuve de ville.
  // Une épreuve qui n'est pas une City Challenge (« Dongguan Manbo Cup (…) ») ne
  // suit pas ce gabarit : la découper pareil donnait une ville nommée
  // « Dongguan Manbo Cup (2026-08-08) » et un slug avec des espaces et des
  // parenthèses. On lit alors la ville dans le premier mot du nom.
  const estCityChallenge = conv.contexte.includes("City Challenge");
  const sansDate = conv.contexte.replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, "");
  const ville = estCityChallenge
    ? sansDate.replace(/^S4 /, "").replace(/ City Challenge.*/, "")
    : sansDate.split(" ")[0];
  const slugSource = estCityChallenge ? `s4-${ville}-cc-${id}` : `${sansDate}-${id}`;
  const slug = slugSource.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const parLegende = new Map<string, number>();
  for (const d of decks) parLegende.set(d.legend, (parLegende.get(d.legend) ?? 0) + 1);

  const fiche = {
    name: conv.contexte,
    slug,
    date: decks[0].date,
    location: `${ville}, Chine`,
    playerCount: decks[0].playerCount,
    format: "Constructed",
    set: "Vendetta",
    organizer: null,
    // Ce que le site publie, pas ce que la source annonce : les listes écartées
    // (Champion ambigu) n'apparaissent nulle part, donc elles ne se comptent pas.
    decklistsPublished: decks.length,
    sourceUrl: `https://hexgate.cn/tournaments/${id}`,
    topPlacements: decks
      .filter((d) => d.placement <= 8)
      .sort((a, b) => a.placement - b.placement)
      .map((d) => ({
        rank: d.placement,
        player: d.player,
        legend: d.legend,
        domains: d.domains.map((x) => x[0].toUpperCase() + x.slice(1)),
      })),
    legendBreakdown: [...parLegende.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([legend, count]) => ({
        legend,
        count,
        pct: Math.round((count / decks.length) * 100),
      })),
  };

  writeFileSync(join("data/tournaments", `${slug}.json`), `${JSON.stringify(fiche, null, 2)}\n`);

  const nomAffiche = estCityChallenge ? `S4 ${ville} City Challenge` : sansDate;
  const nomCourt = estCityChallenge ? `${ville} CC` : sansDate.replace(/^S4 /, "");
  const drapeau =
    `  "${conv.contexte}": { name: "${nomAffiche}", shortName: "${nomCourt}", ` +
    `countryCode: "CN", city: "${ville}", location: "${ville}, Chine", playerCount: ${fiche.playerCount}, ` +
    `type: "city_challenge", date: "${fiche.date}", set: "Vendetta", format: "Standard" },`;

  console.log(`\n=== ${slug} · ${decks.length} listes publiées sur ${fiche.playerCount} joueurs`);
  console.log(`    Top 8 relevé : ${fiche.topPlacements.length} places`);
  console.log(`    Légendes : ${fiche.legendBreakdown.length}, la plus jouée ${fiche.legendBreakdown[0].legend} (${fiche.legendBreakdown[0].count})`);
  console.log(`    ligne à poser dans src/lib/tournament-flags.ts :\n${drapeau}`);
}
