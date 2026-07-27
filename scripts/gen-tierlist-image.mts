/**
 * Génère les pages HTML des visuels de tier list à partir des tier lists en base.
 * Une page par set, à capturer ensuite en PNG 1600x1600.
 *
 * La maquette reste dessinée en 1000 px de large ; `html { zoom }` la rend en
 * 1600 px, donc tout (texte et icônes) est rasterisé x1,6 : net même après la
 * recompression de X.
 *
 * Usage : npx tsx scripts/gen-tierlist-image.mts Spiritforged Unleashed
 * Sortie : content/tweets/images/tier-list-<set>.html
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getTournamentInfo } from "../src/lib/tournament-flags";

const prisma = new PrismaClient();

// Chaud vers froid, comme les tier lists que les joueurs ont l'habitude de lire :
// on comprend le classement sans relire les lettres.
const TIER_COLORS: Record<string, string> = {
  S: "#ef4444", A: "#f97316", B: "#eab308", C: "#22c55e", D: "#38bdf8",
};
// Numéro de saison, pour dire de quel format parle le visuel.
const SET_NUMBER: Record<string, string> = {
  Origins: "Set 1", Spiritforged: "Set 2", Unleashed: "Set 3", Vendetta: "Set 4",
};
const SET_COLORS: Record<string, string> = {
  Origins: "#f59e0b", Spiritforged: "#10b981", Unleashed: "#0ea5e9", Vendetta: "#a855f7",
};
// Noms de set en français, tels qu'affichés sur les visuels.
const SET_FR: Record<string, string> = {
  Origins: "Origines", Spiritforged: "Armes spirituelles",
  Unleashed: "Déchaînement", Vendetta: "Vendetta",
};

// Même table que src/lib/banners.ts, dupliquée ici pour garder le script autonome.
const ICONS: Record<string, string> = {
  irelia: "irelia", sivir: "sivir", diana: "diana", vex: "vex", "master yi": "masteryi_1",
  leblanc: "leblanc", fiora: "fiora", "miss fortune": "missfortune", sett: "sett",
  draven: "draven", rengar: "rengar", azir: "azir", poppy: "poppy", annie: "annie",
  viktor: "viktor", ezreal: "ezreal", "kha'zix": "khazix", khazix: "khazix",
  "kai'sa": "kaisa", kaisa: "kaisa",
  lillia: "lillia", teemo: "teemo", lucian: "lucian", ornn: "ornn", pyke: "pyke",
  darius: "darius", jax: "jax", "rek'sai": "reksai", reksai: "reksai", jhin: "jhin",
  "renata glasc": "renataglasc", volibear: "volibear", vi: "vi", jinx: "jinx",
  ahri: "ahri", leona: "leona", lux: "lux", "lee sin": "leesin", yasuo: "yasuo",
  rumble: "rumble", ivern: "ivern", garen: "garen", akali: "akali", ambessa: "ambessa",
  jayce: "jayce", kennen: "kennen", mel: "mel", nasus: "nasus", renekton: "renekton",
  shen: "shen", zed: "zed",
};

// Une Légende sans icône afficherait le portrait d'une autre : on refuse de générer
// plutôt que de publier une image fausse.
function iconFile(legendName: string): string {
  const lower = legendName.toLowerCase();
  // Les deux Master Yi ne partagent pas la même icône.
  const file = lower.includes("wuju master")
    ? "masteryi_2"
    : ICONS[lower.split(",")[0].trim()];
  if (!file) throw new Error(`Aucune icône pour la Légende « ${legendName} »`);
  if (!existsSync(join(process.cwd(), "public", "img", "legend_icon", `${file}.webp`))) {
    throw new Error(`Icône manquante : public/img/legend_icon/${file}.webp (${legendName})`);
  }
  return file;
}

// Nom court affiché sous l'icône. Les deux Master Yi doivent rester distinguables.
function shortName(legendName: string): string {
  const lower = legendName.toLowerCase();
  if (lower.includes("wuju master")) return "Yi Wuju Master";
  if (lower.includes("wuju bladesman")) return "Yi Fine lame";
  return legendName.split(",")[0].trim();
}

// Largeur utile d'une rangée d'icônes, en px de maquette
// (1000 - marges de page 2x20 - barre de tier 56 - gouttière 10 - padding de .cells 2x8).
const ROW_WIDTH = 878;
// Hauteur utile pour les barres, une fois l'en-tête et le pied de page retirés.
const MAIN_HEIGHT = 790;
const GAP = 11; // x1,6 au rendu = 18 px entre deux icônes.
const BAR_GAP = 12; // entre deux barres de tier
const BAR_PAD = 24; // padding vertical d'une barre
const MAX_PER_ROW = 8; // au-delà, le tier passe sur deux rangées plutôt que de rétrécir

// Un tier de 13 Légendes sur une seule rangée écrase toutes les icônes de l'image.
// On le coupe en rangées de taille égale : pas d'orphelin en bout de ligne.
function splitRows<T>(list: T[]): T[][] {
  const rows = Math.ceil(list.length / MAX_PER_ROW);
  const per = Math.ceil(list.length / rows);
  return Array.from({ length: rows }, (_, i) => list.slice(i * per, (i + 1) * per));
}

// Une seule taille d'icône, la même partout et sur tous les visuels d'un run :
// la plus grande qui tienne à la fois en largeur et en hauteur.
function cellSize(layouts: number[][][]): number {
  let size = 999;
  for (const tiers of layouts) {
    const widest = Math.max(...tiers.flat());
    const totalRows = tiers.reduce((s, r) => s + r.length, 0);
    const byWidth = (ROW_WIDTH - GAP * (widest - 1)) / widest;
    const free = MAIN_HEIGHT - BAR_PAD * tiers.length - BAR_GAP * (tiers.length - 1)
      - GAP * (totalRows - tiers.length);
    size = Math.min(size, byWidth, free / totalRows);
  }
  return Math.floor(size);
}

function page(
  set: string, tiers: Record<string, string[]>, root: string, size: number, source: string,
): string {
  const accent = SET_COLORS[set] ?? "#0ea5e9";
  const setFr = SET_FR[set] ?? set;
  const rows = ["S", "A", "B", "C", "D"].filter((t) => tiers[t]?.length).map((t) => {
    const cells = splitRows(tiers[t]).map((line) => `
        <div class="line">${line.map((l) => `
          <img class="cell" src="${root}/public/img/legend_icon/${iconFile(l)}.webp" alt="${shortName(l)}">`).join("")}
        </div>`).join("");
    return `
    <div class="row t${t}">
      <div class="tier" style="background:${TIER_COLORS[t]}">${t}</div>
      <div class="cells">${cells}</div>
    </div>`;
  }).join("");

  return `<meta charset="utf-8">
<style>
  /* Rubik : la police du site, pour que les visuels soient reconnaissables. */
  @import url("https://fonts.googleapis.com/css2?family=Rubik:wght@500;700;900&display=swap");
  * { margin:0; padding:0; box-sizing:border-box; }
  /* Maquette dessinée en 1000 px, rendue en 1600 : tout est rasterisé x1,6. */
  html { zoom:1.6; }
  /* Même fond que les images de deck : fond-export.png + voile sombre uni. */
  body { width:1000px; height:1000px; background:#0a0a12; color:#f1f5f9;
         font-family:Rubik,"Segoe UI",Roboto,Arial,sans-serif; display:flex; flex-direction:column;
         padding:30px 20px 24px; overflow:hidden; }
  body::before { content:""; position:fixed; inset:0;
                 background:url("${root}/public/img/fond-export.png") center/cover; }
  body::after { content:""; position:fixed; inset:0; background:rgba(10,10,18,.82); }
  header, main, footer { position:relative; z-index:1; }
  header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:10px; }
  .kicker { font-size:19px; letter-spacing:.22em; text-transform:uppercase; color:#a8b6c8; font-weight:700; }
  h1 { font-size:${setFr.length > 13 ? 50 : 64}px; line-height:1; font-weight:800; color:${accent}; margin-top:4px; }
  .site { font-size:22px; font-weight:800; color:#f1f5f9; padding-bottom:6px; }
  main { flex:1; display:flex; flex-direction:column; justify-content:space-between; gap:${BAR_GAP}px; }
  .row { display:flex; align-items:stretch; gap:10px; }
  /* Matière verre : reflet en haut, bord interne fin, ombre portée. Aucun halo coloré. */
  .tier { width:56px; flex:none; border-radius:12px; color:#101014; font-size:36px; font-weight:900;
          display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;
          box-shadow:0 6px 16px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.3); }
  .tier::before { content:""; position:absolute; inset:0 0 auto 0; height:40%;
                  background:linear-gradient(rgba(255,255,255,.26), rgba(255,255,255,0)); }
  /* Aligné à gauche partout : l'ordre dans un tier veut dire quelque chose. */
  .cells { flex:1; display:flex; flex-direction:column; justify-content:center; gap:${GAP}px;
           background:rgba(255,255,255,.05); border-radius:12px; padding:${BAR_PAD / 2}px 8px;
           box-shadow:inset 0 1px 0 rgba(255,255,255,.09), inset 0 0 0 1px rgba(255,255,255,.06); }
  .line { display:flex; gap:${GAP}px; }
  .cell { width:${size}px; height:${size}px; border-radius:11px; object-fit:cover; display:block;
          box-shadow:0 0 0 1px rgba(255,255,255,.12), 0 5px 12px rgba(0,0,0,.6); }
  /* Le D recule par son fond, pas par ses portraits : ils doivent rester identifiables. */
  .tD .cells { background:rgba(255,255,255,.025); }
  footer { margin-top:14px; display:flex; justify-content:space-between; align-items:baseline; gap:16px;
           font-size:18px; color:#e8eef6; white-space:nowrap; }
  footer b { color:#fff; }
</style>
<header>
  <div><div class="kicker">Tier list Riftbound · ${SET_NUMBER[set] ?? ""}</div><h1>${setFr}</h1></div>
  <div class="site">riftboundfrance.fr</div>
</header>
<main>${rows}</main>
<footer>
  <span>Classement d'après les résultats de tournoi</span>
  <span>${source}</span>
</footer>`;
}

// Sur quoi repose le classement : nombre de tournois, de résultats, période
// couverte. C'est la première question qu'on posera sous le tweet.
//
// On annonce la base du CALCUL, pas le nombre de decklists en base : les tiers sont
// établis sur les classements complets (rang + Légende), et tous les joueurs classés
// n'ont pas publié leur liste — Hartford, par exemple, n'en a que 142 sur 1 659.
// `scripts/tier-unleashed.py` écrit ces compteurs ; sans eux, on retombe sur la DB.
async function sourceLine(set: string): Promise<string> {
  const decks = await prisma.deck.findMany({
    where: { setTag: set, tournamentContext: { not: null } },
    select: { tournamentContext: true },
  });
  const contexts = new Set(decks.map((d) => d.tournamentContext as string));
  const dates = [...contexts]
    .map((c) => getTournamentInfo(c)?.date)
    .filter((d): d is string => !!d)
    .sort();
  const fr = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");
  const period = dates.length ? ` · du ${fr(dates[0])} au ${fr(dates[dates.length - 1])}` : "";

  const countsPath = join(process.cwd(), "data", "tier-source-counts.json");
  const counts = existsSync(countsPath)
    ? (JSON.parse(readFileSync(countsPath, "utf-8")) as Record<string, { results: number; tournaments: number }>)
    : {};
  const c = counts[set];
  return c
    ? `${c.tournaments} tournois · ${c.results.toLocaleString("fr-FR")} résultats${period}`
    : `${contexts.size} tournois · ${decks.length.toLocaleString("fr-FR")} decks${period}`;
}

async function main() {
  const sets = process.argv.slice(2);
  const outDir = join(process.cwd(), "content", "tweets", "images");
  mkdirSync(outDir, { recursive: true });
  // Les icônes sont servies par un serveur statique lancé à la racine du repo
  // (python -m http.server), le protocole file:// étant bloqué par le navigateur.
  const root = "";

  const loaded: { set: string; tiers: Record<string, string[]> }[] = [];
  for (const set of sets) {
    const tl = await prisma.tierList.findFirst({
      where: { setContext: set, published: true },
      include: { entries: true },
    });
    if (!tl) { console.log(`${set} : aucune tier list`); continue; }
    const tiers: Record<string, string[]> = {};
    for (const e of tl.entries) (tiers[e.tier] ??= []).push(e.legendName);
    loaded.push({ set, tiers });
  }
  if (!loaded.length) return;

  // Taille commune à tous les visuels du run : celle qu'impose la ligne la plus
  // chargée, tous sets confondus.
  const size = cellSize(loaded.map(({ tiers }) =>
    Object.values(tiers).map((list) => splitRows(list).map((r) => r.length)),
  ));

  for (const { set, tiers } of loaded) {
    const source = await sourceLine(set);
    const slug = set.toLowerCase();
    const file = join(outDir, `tier-list-${slug}.html`);
    writeFileSync(file, page(set, tiers, root, size, source), "utf-8");

    // Le contenu d'une image n'est pas indexable : on sort le texte à coller dans
    // l'alt du tweet.
    const setFr = SET_FR[set] ?? set;
    const alt = [
      `Tier list Riftbound ${setFr} (${SET_NUMBER[set] ?? ""}) — ${source}.`,
      ...["S", "A", "B", "C", "D"].filter((t) => tiers[t]?.length)
        .map((t) => `${t} : ${tiers[t].map(shortName).join(", ")}.`),
    ].join("\n");
    writeFileSync(join(outDir, `tier-list-${slug}-alt.txt`), alt, "utf-8");

    const n = Object.values(tiers).reduce((s, a) => s + a.length, 0);
    console.log(`${set} : ${n} Légendes, icônes ${size}px -> ${file}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
