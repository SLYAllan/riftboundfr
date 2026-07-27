/**
 * Génère les pages HTML des visuels de tier list (1000x1000) à partir des tier
 * lists en base. Une page par set, à capturer ensuite en PNG.
 *
 * Usage : npx tsx scripts/gen-tierlist-image.mts Spiritforged Unleashed
 * Sortie : content/tweets/images/tier-list-<set>.html
 */
import { PrismaClient } from "@prisma/client";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

const TIER_COLORS: Record<string, string> = {
  S: "#f59e0b", A: "#ef4444", B: "#8b5cf6", C: "#0ea5e9", D: "#6b7280",
};
const SET_COLORS: Record<string, string> = {
  Origins: "#f59e0b", Spiritforged: "#10b981", Unleashed: "#0ea5e9", Vendetta: "#a855f7",
};

// Même table que src/lib/banners.ts, dupliquée ici pour garder le script autonome.
const ICONS: Record<string, string> = {
  irelia: "irelia", sivir: "sivir", diana: "diana", vex: "vex", "master yi": "masteryi_1",
  leblanc: "leblanc", fiora: "fiora", "miss fortune": "missfortune", sett: "sett",
  draven: "draven", rengar: "rengar", azir: "azir", poppy: "poppy", annie: "annie",
  viktor: "viktor", ezreal: "ezreal", "kha'zix": "khazix", "kai'sa": "kaisa",
  lillia: "lillia", teemo: "teemo", lucian: "lucian", ornn: "ornn", pyke: "pyke",
  darius: "darius", jax: "jax", "rek'sai": "reksai", jhin: "jhin",
  "renata glasc": "renataglasc", volibear: "volibear", vi: "vi", jinx: "jinx",
  ahri: "ahri", leona: "leona", lux: "lux", "lee sin": "leesin", yasuo: "yasuo",
  rumble: "rumble", ivern: "ivern", garen: "garen", akali: "akali", ambessa: "ambessa",
  jayce: "jayce", kennen: "kennen", mel: "mel", nasus: "nasus", renekton: "renekton",
  shen: "shen", zed: "zed",
};

function iconFile(legendName: string): string {
  const lower = legendName.toLowerCase();
  if (lower.includes("wuju master")) return "masteryi_2";
  return ICONS[lower.split(",")[0].trim()] ?? "irelia";
}

// Nom court affiché sous l'icône. Les deux Master Yi doivent rester distinguables.
function shortName(legendName: string): string {
  const lower = legendName.toLowerCase();
  if (lower.includes("wuju master")) return "Yi Wuju Master";
  if (lower.includes("wuju bladesman")) return "Yi Fine lame";
  return legendName.split(",")[0].trim();
}

function page(set: string, tiers: Record<string, string[]>, root: string): string {
  const rows = ["S", "A", "B", "C", "D"].filter((t) => tiers[t]?.length).map((t) => {
    const cells = tiers[t].map((l) => `
      <img class="cell" src="${root}/public/img/legend_icon/${iconFile(l)}.webp" alt="${shortName(l)}">`).join("");
    return `
    <div class="row">
      <div class="tier" style="background:${TIER_COLORS[t]}">${t}</div>
      <div class="cells">${cells}</div>
    </div>`;
  }).join("");

  return `<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  /* Même fond que les images de deck : fond-export.png + voile sombre uni. */
  body { width:1000px; height:1000px; background:#0a0a12; color:#f1f5f9;
         font-family:"Segoe UI",Roboto,Arial,sans-serif; display:flex; flex-direction:column;
         padding:30px 24px 22px; overflow:hidden; }
  body::before { content:""; position:fixed; inset:0;
                 background:url("${root}/public/img/fond-export.png") center/cover; }
  body::after { content:""; position:fixed; inset:0; background:rgba(10,10,18,.82); }
  header, main, footer { position:relative; z-index:1; }
  header { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:8px; }
  .kicker { font-size:19px; letter-spacing:.22em; text-transform:uppercase; color:#94a3b8; font-weight:700; }
  h1 { font-size:62px; line-height:1; font-weight:800; color:${SET_COLORS[set] ?? "#0ea5e9"}; margin-top:6px; }
  .site { font-size:20px; font-weight:700; color:#94a3b8; padding-bottom:8px; }
  main { flex:1; display:flex; flex-direction:column; justify-content:space-evenly; }
  .row { display:flex; align-items:stretch; gap:12px; }
  .tier { width:68px; flex:none; border-radius:12px; color:#101014; font-size:38px; font-weight:900;
          display:flex; align-items:center; justify-content:center; }
  .cells { flex:1; display:flex; flex-wrap:wrap; align-content:center; gap:6px;
           background:rgba(255,255,255,.05); border-radius:12px; padding:10px; }
  .cell { width:78px; height:78px; border-radius:10px; object-fit:cover; display:block; }
  footer { margin-top:10px; display:flex; justify-content:space-between; font-size:16px; color:#94a3b8; }
  footer b { color:#f1f5f9; }
</style>
<header>
  <div><div class="kicker">Tier list Riftbound</div><h1>${set}</h1></div>
  <div class="site">riftboundfrance.fr</div>
</header>
<main>${rows}</main>
<footer>
  <span>Classement des Légendes d'après les résultats de tournoi</span>
  <span><b>Set ${set}</b> · en français</span>
</footer>`;
}

async function main() {
  const sets = process.argv.slice(2);
  const outDir = join(process.cwd(), "content", "tweets", "images");
  mkdirSync(outDir, { recursive: true });
  // Les icônes sont servies par un serveur statique lancé à la racine du repo
  // (python -m http.server), le protocole file:// étant bloqué par le navigateur.
  const root = "";

  for (const set of sets) {
    const tl = await prisma.tierList.findFirst({
      where: { setContext: set, published: true },
      include: { entries: true },
    });
    if (!tl) { console.log(`${set} : aucune tier list`); continue; }
    const tiers: Record<string, string[]> = {};
    for (const e of tl.entries) (tiers[e.tier] ??= []).push(e.legendName);
    const file = join(outDir, `tier-list-${set.toLowerCase()}.html`);
    writeFileSync(file, page(set, tiers, root), "utf-8");
    const n = Object.values(tiers).reduce((s, a) => s + a.length, 0);
    console.log(`${set} : ${n} Légendes -> ${file}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
