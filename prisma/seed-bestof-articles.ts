import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";
import { entriesToDeckCode, type ParsedDeckEntry } from "../src/lib/deck-code";

function uid(): string {
  return crypto.randomBytes(6).toString("hex");
}

const prisma = new PrismaClient();

interface DeckJson {
  id: string;
  legend: string;
  champion: string | null;
  player: string;
  placement: number | null;
  tournament: string;
  date: string;
  playerCount: number;
  set: string;
  domains: string[];
  mainDeck: { name: string; quantity: number; type: string; rarity?: string }[];
  runes: { name: string; quantity: number }[];
  battlefields: string[];
  sideboard: { name: string; quantity: number }[];
}

function buildDeckCode(deck: DeckJson): string {
  const entries: ParsedDeckEntry[] = [];
  if (deck.champion) entries.push({ quantity: 1, name: deck.champion, section: "legend" });
  for (const c of deck.mainDeck) entries.push({ quantity: c.quantity, name: c.name, section: "main" });
  for (const r of deck.runes) entries.push({ quantity: r.quantity, name: r.name, section: "rune" });
  for (const bf of deck.battlefields) entries.push({ quantity: 1, name: bf, section: "battlefield" });
  for (const s of deck.sideboard) entries.push({ quantity: s.quantity, name: s.name, section: "side" });
  return entriesToDeckCode(entries);
}

function loadDecks(prefix: string): DeckJson[] {
  const decklistsDir = path.join(__dirname, "../data/decklists");
  const results: DeckJson[] = [];
  const legendDirs = fs.readdirSync(decklistsDir).filter(f =>
    fs.statSync(path.join(decklistsDir, f)).isDirectory()
  );
  for (const dir of legendDirs) {
    const files = fs.readdirSync(path.join(decklistsDir, dir)).filter(f => f.startsWith(prefix) && f.endsWith(".json"));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(decklistsDir, dir, file), "utf-8");
        results.push(JSON.parse(raw));
      } catch {}
    }
  }
  return results.sort((a, b) => (a.placement || 999) - (b.placement || 999));
}

function placementLabel(p: number | null): string {
  if (!p) return "";
  if (p === 1) return "1er";
  return `${p}e`;
}

interface BestOfDeck {
  deck: DeckJson;
  comment: string;
}

interface BestOfArticle {
  title: string;
  slug: string;
  excerpt: string;
  intro: string;
  coverImage: string;
  decks: BestOfDeck[];
}

// ──────────────────────────────────────────────────────
// HOUSTON RQ — Best of
// ──────────────────────────────────────────────────────
function selectHoustonBestOf(): BestOfArticle {
  const all = loadDecks("houston-rq-");
  const legendCounts: Record<string, number> = {};
  all.forEach(d => { legendCounts[d.legend] = (legendCounts[d.legend] || 0) + 1; });

  const picks: BestOfDeck[] = [];

  const find = (legend: string, maxPlacement?: number) =>
    all.find(d => d.legend.includes(legend) && (!maxPlacement || (d.placement && d.placement <= maxPlacement)));

  // Annie winner (dominant story)
  const annie1 = all.find(d => d.placement === 1);
  if (annie1) picks.push({ deck: annie1, comment: "Le vainqueur du tournoi. Annie Chaos/Fury s'impose face au méta Kai'Sa avec un gameplan agressif implacable. 4 Annie dans le Top 8 — la reine de Houston." });

  // Master Yi 2nd (the counterweight)
  const yi2 = all.find(d => d.placement === 2);
  if (yi2) picks.push({ deck: yi2, comment: "Finaliste avec Master Yi Body/Calm, le contrepoids défensif face à l'agression d'Annie. Un matchup classique qui définit le méta Origins." });

  // Miss Fortune 15th (off-meta performing)
  const mf15 = find("Miss Fortune", 20);
  if (mf15) picks.push({ deck: mf15, comment: "Miss Fortune en Body/Chaos — un choix audacieux dans un méta dominé par Annie et Kai'Sa. Trinity John prouve que MF a sa place dans le format." });

  // Sett (rare, 3 copies)
  const sett = find("Sett", 66);
  if (sett) picks.push({ deck: sett, comment: "Sett Body/Calm, le bruiser sous-estimé. Seulement 3 Sett dans tout le tournoi mais des résultats solides. Un choix pour les joueurs qui aiment le combat au corps-à-corps." });

  // Viktor (rare tech legend)
  const viktor = find("Viktor", 66);
  if (viktor) picks.push({ deck: viktor, comment: "Viktor Order/Mind — la légende contrôle du format Origins. Peu jouée à Houston (3 exemplaires) mais capable de punir les decks trop agressifs." });

  // Teemo 36th
  const teemo = find("Teemo", 60);
  if (teemo) picks.push({ deck: teemo, comment: "Teemo Swift Scout en Chaos/Mind — le petit yordle peut surprendre ! Un archétype burn/aggro alternatif qui prend les adversaires au dépourvu." });

  // Volibear (only 1!)
  const voli = find("Volibear", 66);
  if (voli) picks.push({ deck: voli, comment: "L'unique Volibear du tournoi — et il finit dans le Top 64 ! Un choix ultra-spicy qui prouve que le bear est viable même dans un méta hostile." });

  // Lee Sin (only 1)
  const lee = find("Lee Sin", 66);
  if (lee) picks.push({ deck: lee, comment: "Lee Sin Blind Monk — un seul exemplaire dans tout Houston. Le kick master récompense la maîtrise technique avec des retournements spectaculaires." });

  // Ahri (2 copies, interesting)
  const ahri = find("Ahri", 66);
  if (ahri) picks.push({ deck: ahri, comment: "Ahri en Calm/Mind — seulement 2 dans le tournoi. Le renard à neuf queues apporte une dimension combo unique absente du reste du méta." });

  // Darius (only 1)
  const darius = find("Darius", 66);
  if (darius) picks.push({ deck: darius, comment: "L'unique Darius de Houston. Le Main de Noxus en Fury/Order apporte une brutalité frontale rare dans ce format." });

  return {
    title: "Best of Houston RQ 2025",
    slug: "best-of-houston-rq-2025",
    excerpt: "Sélection des decklists les plus intéressantes et surprenantes du Regional Qualifier de Houston 2025 — 1347 joueurs, format Origins.",
    coverImage: "/img/articles/houston-1.webp",
    intro: "Le Regional Qualifier de Houston (décembre 2025) réunissait 1 347 joueurs en format Origins. Si Annie a dominé le Top 8 avec 4 places, le tournoi regorgeait de decklists créatives et audacieuses. Voici notre sélection des builds les plus remarquables.",
    decks: picks.filter(p => p.deck),
  };
}

// ──────────────────────────────────────────────────────
// BOLOGNA RQ — Best of
// ──────────────────────────────────────────────────────
function selectBolognaBestOf(): BestOfArticle {
  const all = loadDecks("bologna-rq-");
  const picks: BestOfDeck[] = [];

  const find = (legend: string, maxP?: number) =>
    all.find(d => d.legend.includes(legend) && (!maxP || (d.placement && d.placement <= maxP)));

  // Ezreal winner
  const ez1 = all.find(d => d.placement === 1);
  if (ez1) picks.push({ deck: ez1, comment: "Alanzq1 remporte Bologne avec Ezreal Chaos/Mind — une légende peu jouée (7 dans le tournoi) qui brille en finale. La preuve que le skill > le méta." });

  // Miss Fortune 2nd (ONLY 1 in tournament!)
  const mf2 = all.find(d => d.placement === 2);
  if (mf2) picks.push({ deck: mf2, comment: "L'unique Miss Fortune du tournoi... et elle finit 2e ! Sebiqqqqqqqqqqqq défie tout le monde avec un choix ultra-spicy en Body/Chaos." });

  // Irelia 3rd
  const ire3 = find("Irelia", 5);
  if (ire3) picks.push({ deck: ire3, comment: "krowz emmène Irelia Calm/Chaos en 3e place. La Blade Dancer profite de la transition vers Spiritforged pour s'imposer comme force majeure." });

  // Viktor 4th
  const vik4 = find("Viktor", 5);
  if (vik4) picks.push({ deck: vik4, comment: "Ghosterdriver pilote Viktor Order/Mind en 4e. Un archétype contrôle patient qui grind les matchups de valeur." });

  // Rek'Sai (4 copies, off-meta)
  const reksai = find("Rek'Sai", 120);
  if (reksai) picks.push({ deck: reksai, comment: "Rek'Sai Void Burrower — un pick underground avec seulement 4 copies. Le prédateur du Void fait surface pour dévorer les légendes tier 1." });

  // Renata Glasc (2 copies!)
  const renata = find("Renata Glasc", 120);
  if (renata) picks.push({ deck: renata, comment: "Renata Glasc Chem-Baroness — 2 exemplaires seulement ! La baronne de Zaun apporte un gameplan toxique unique avec son contrôle chimique." });

  // Ornn (ONLY 1!)
  const ornn = find("Ornn", 120);
  if (ornn) picks.push({ deck: ornn, comment: "L'unique Ornn du tournoi ! Fire Below the Mountain en Fury/Body — le forgeron crée ses propres armes et écrase la concurrence." });

  // Rumble (4 copies)
  const rumble = find("Rumble", 120);
  if (rumble) picks.push({ deck: rumble, comment: "Rumble Mechanized Menace — le mecha yordle en Fury/Body. Agressif et explosif, un archétype qui punit les decks trop lents." });

  // Sivir 10th
  const sivir = find("Sivir", 15);
  if (sivir) picks.push({ deck: sivir, comment: "Sivir Battle Mistress en Top 16 — XTacio montre que la mercenaire reste compétitive même dans le nouveau format Spiritforged." });

  // Azir (ONLY 1!)
  const azir = find("Azir", 120);
  if (azir) picks.push({ deck: azir, comment: "L'unique Azir de Bologne — l'Empereur des Sables garde sa dignité même en tant que pick solitaire. Un builder audacieux." });

  return {
    title: "Best of Bologna RQ 2026",
    slug: "best-of-bologna-rq-2026",
    excerpt: "Les decklists les plus créatives du Regional Qualifier de Bologne 2026 — 1719 joueurs, premier RQ Spiritforged. Draven domine mais la diversité surprend.",
    coverImage: "/img/articles/bologna-2.webp",
    intro: "Bologne (février 2026) marque le premier Regional Qualifier du set Spiritforged avec 1 719 joueurs. Si Draven Chaos/Fury domine le méta (14%), c'est Ezreal qui remporte le titre. Voici les decks les plus audacieux et créatifs du tournoi.",
    decks: picks.filter(p => p.deck),
  };
}

// ──────────────────────────────────────────────────────
// LAS VEGAS RQ — Best of
// ──────────────────────────────────────────────────────
function selectVegasBestOf(): BestOfArticle {
  const all = loadDecks("las-vegas-rq-");
  const picks: BestOfDeck[] = [];

  const find = (legend: string, maxP?: number) =>
    all.find(d => d.legend.includes(legend) && (!maxP || (d.placement && d.placement <= maxP)));

  // Draven 1st
  const draven1 = all.find(d => d.placement === 1);
  if (draven1) picks.push({ deck: draven1, comment: "Samdsherman prend la couronne avec Draven Chaos/Fury. Le Top 4 ENTIER est Draven — un niveau de domination jamais vu en compétitif." });

  // Jax 7th (off-meta in top 8!)
  const jax = find("Jax", 8);
  if (jax) picks.push({ deck: jax, comment: "Theverybestgamer brise le mur Draven en Top 8 avec Jax Body/Calm ! Le seul non-Draven à atteindre les quarts avec l'un des 3 seuls Jax du tournoi." });

  // Ezreal 8th (Alanzq back-to-back!)
  const ez = find("Ezreal", 10);
  if (ez) picks.push({ deck: ez, comment: "Alanzq1 de retour en Top 8 avec Ezreal après sa victoire à Bologne ! La preuve que le champion de Bologne n'était pas un one-shot." });

  // Irelia (best non-Draven)
  const ire = find("Irelia", 15);
  if (ire) picks.push({ deck: ire, comment: "Irelia Calm/Chaos — le meilleur counter Draven. La Blade Dancer exploite sa mobilité pour contourner le gameplan agressif de l'Exécuteur." });

  // Sivir 9th
  const sivir = find("Sivir", 15);
  if (sivir) picks.push({ deck: sivir, comment: "NoVeggies (4e à Houston avec Annie) revient avec Sivir Body/Chaos en 9e place. Une versatilité de builder impressionnante." });

  // Azir (7 copies, interesting)
  const azir = find("Azir", 64);
  if (azir) picks.push({ deck: azir, comment: "Azir Emperor of the Sands — un pick de niche à Vegas mais qui prépare sa domination future (spoiler : il gagnera Lille). Les early adopters récompensés." });

  // Ornn (6 copies)
  const ornn = find("Ornn", 64);
  if (ornn) picks.push({ deck: ornn, comment: "Ornn Fire Below the Mountain en Fury/Order — le forgeron apporte un angle d'attaque unique avec sa création d'équipements." });

  // Renata Glasc
  const renata = find("Renata Glasc", 129);
  if (renata) picks.push({ deck: renata, comment: "Renata Glasc fait surface à Vegas — la Chem-Baroness de Zaun prouve que même face au mur Draven, les picks toxiques ont leur mot à dire." });

  // Kai'Sa (normally dominant, reduced at Vegas)
  const kaisa = find("Kai'sa", 15);
  if (kaisa) picks.push({ deck: kaisa, comment: "Kai'Sa survit à la transition Spiritforged ! Réduite de 30% (Houston) à 3% du field, mais toujours capable de Top 16." });

  // Master Yi (only 2!)
  const yi = find("Master Yi", 129);
  if (yi) picks.push({ deck: yi, comment: "Master Yi réduit à 2 copies à Vegas — loin de sa gloire Origins. Les rares fidèles du Wuju Bladesman méritent le respect." });

  return {
    title: "Best of Las Vegas RQ 2026",
    slug: "best-of-las-vegas-rq-2026",
    excerpt: "Les meilleures decklists du Regional Qualifier de Las Vegas 2026 — 1670 joueurs. Draven verrouille le Top 4 mais les rebelles résistent.",
    coverImage: "/img/articles/lasvegas-1.webp",
    intro: "Las Vegas (mars 2026) est LE tournoi de Draven : 18% du field, Top 4 intégralement Draven, 5 places dans le Top 8. Mais au-delà de cette domination, des builders courageux ont trouvé des angles d'attaque alternatifs. Voici les rebelles de Vegas.",
    decks: picks.filter(p => p.deck),
  };
}

// ──────────────────────────────────────────────────────
// LILLE RQ — Best of
// ──────────────────────────────────────────────────────
function selectLilleBestOf(): BestOfArticle {
  const all = loadDecks("lille-rq-");
  const picks: BestOfDeck[] = [];

  const find = (legend: string, maxP?: number) =>
    all.find(d => d.legend.includes(legend) && (!maxP || (d.placement && d.placement <= maxP)));

  // Azir 1st (invaincu!)
  const azir1 = all.find(d => d.placement === 1);
  if (azir1) picks.push({ deck: azir1, comment: "Squirtle remporte Lille invaincu (14-0-2) avec Azir Calm/Order ! Seulement 2 Azir dans le tournoi — une masterclass absolue." });

  // Master Yi 2nd
  const yi2 = all.find(d => d.placement === 2);
  if (yi2) picks.push({ deck: yi2, comment: "Master Yi Body/Calm en finale — Schorn rappelle que le Wuju Bladesman reste un pilier du format avec un gameplan résilient." });

  // Draven 3rd
  const draven3 = find("Draven", 5);
  if (draven3) picks.push({ deck: draven3, comment: "CTCG DZiden avec Draven Chaos/Fury en 3e — le champion de Vegas perd sa couronne mais reste dangereux. Lille marque le début de la fin pour l'ère Draven." });

  // Annie 4th
  const annie4 = find("Annie", 5);
  if (annie4) picks.push({ deck: annie4, comment: "Annie fait son retour en Top 4 ! Après sa domination à Houston (Origins), la Dark Child prouve qu'elle reste redoutable en Spiritforged." });

  // Irelia (3/8 top 8 — dominant!)
  const ire = find("Irelia", 10);
  if (ire) picks.push({ deck: ire, comment: "Irelia envahit le Top 8 avec 3 places ! La Blade Dancer s'impose comme la légende la plus représentée au sommet de Lille." });

  // Fiora 11th
  const fiora = find("Fiora", 20);
  if (fiora) picks.push({ deck: fiora, comment: "Fiora Grand Duelist dans le Top 16 — la dueliste fait un retour fracassant à Lille. Un archétype puncher qui récompense la précision." });

  // Rek'Sai
  const reksai = find("Rek'Sai", 63);
  if (reksai) picks.push({ deck: reksai, comment: "Rek'Sai Void Burrower — le prédateur souterrain. Un pick de niche (2 exemplaires) qui offre un angle d'attaque surprenant." });

  // Lucian
  const lucian = find("Lucian", 63);
  if (lucian) picks.push({ deck: lucian, comment: "Lucian Purifier — seulement 2 à Lille mais le pistolero de Demacia apporte un aggro raffiné différent de Draven." });

  // Yasuo (only 1!)
  const yasuo = find("Yasuo", 63);
  if (yasuo) picks.push({ deck: yasuo, comment: "L'unique Yasuo du RQ de Lille — Unforgiven porte bien son nom. Un one-of audacieux dans le plus gros RQ Spiritforged." });

  // Sett (only 1!)
  const sett = find("Sett", 63);
  if (sett) picks.push({ deck: sett, comment: "L'unique Sett de Lille ! The Boss en solo — un statement de confiance absolu dans le bruiser." });

  return {
    title: "Best of Lille RQ 2026",
    slug: "best-of-lille-rq-2026",
    excerpt: "Le meilleur du Regional Qualifier de Lille 2026 — 1949 joueurs, plus gros RQ Spiritforged. Azir invaincu, Irelia dominante, et des picks spicy.",
    coverImage: "/img/articles/lille.webp",
    intro: "Lille (avril 2026) : le plus gros Regional Qualifier Spiritforged avec 1 949 joueurs, et le premier RQ en France ! Azir remporte le titre invaincu, Irelia domine le Top 8, et le méta montre enfin de la diversité après l'ère Draven. Voici les decks qui ont marqué ce tournoi historique.",
    decks: picks.filter(p => p.deck),
  };
}

// ──────────────────────────────────────────────────────
// XI'AN RO — Best of (all legends, auto-pick)
// ──────────────────────────────────────────────────────
function selectXianBestOf(): BestOfArticle {
  const all = loadDecks("s3-xian-");

  const byLegend = new Map<string, DeckJson[]>();
  for (const d of all) {
    const key = d.legend;
    if (!byLegend.has(key)) byLegend.set(key, []);
    byLegend.get(key)!.push(d);
  }

  const legendCounts = new Map<string, number>();
  for (const [legend, decks] of byLegend) {
    legendCounts.set(legend, decks.length);
  }

  const picks: BestOfDeck[] = [];
  for (const [legend, decks] of byLegend) {
    const best = decks[0];
    const count = legendCounts.get(legend) || 0;
    const shortName = legend.split(",")[0].trim();
    const domains = best.domains.join("/");
    const plStr = best.placement ? `${placementLabel(best.placement)} place` : "";
    const comment = count <= 5
      ? `${shortName} ${domains} — seulement ${count} exemplaire${count > 1 ? "s" : ""} à Xi'an${plStr ? `, meilleur résultat : ${plStr}` : ""}. Un pick audacieux dans un field de 640 joueurs.`
      : `${shortName} ${domains} — ${count} copies à Xi'an${plStr ? `, meilleur résultat : ${plStr}` : ""}. ${count >= 30 ? "Un pilier du méta Unleashed chinois." : "Un choix solide dans le méta Unleashed."}`;
    picks.push({ deck: best, comment });
  }

  picks.sort((a, b) => (a.deck.placement || 999) - (b.deck.placement || 999));

  return {
    title: "Best of Xi'an Regional Open S3",
    slug: "best-of-xian-regional-open-s3",
    excerpt: "Le meilleur du Xi'an Regional Open S3 — 640 joueurs, 636 decklists, format Unleashed. Le plus gros tournoi compétitif chinois.",
    coverImage: "/img/articles/xian-1.webp",
    intro: "Le Xi'an Regional Open S3 (mai 2026) est le plus gros tournoi Unleashed avec 640 joueurs et 636 decklists publiées. Irelia domine (68 copies) devant Master Yi (54) et Diana (36). Voici le meilleur deck de chaque légende présente au tournoi.",
    decks: picks,
  };
}

// ──────────────────────────────────────────────────────
// SEED ALL ARTICLES
// ──────────────────────────────────────────────────────
async function main() {
  const articles = [
    selectHoustonBestOf(),
    selectBolognaBestOf(),
    selectVegasBestOf(),
    selectLilleBestOf(),
    selectXianBestOf(),
  ];

  for (const article of articles) {
    console.log(`\n=== ${article.title} (${article.decks.length} decks) ===`);

    if (article.decks.length === 0) {
      console.log("  SKIP: no decks found");
      continue;
    }

    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (existing) {
      if (process.argv.includes("--force")) {
        await prisma.article.delete({ where: { slug: article.slug } });
        console.log(`  DELETED existing article (id=${existing.id})`);
      } else {
        console.log(`  SKIP: article already exists (id=${existing.id})`);
        continue;
      }
    }

    const blocks: any[] = [
      { type: "text", id: uid(), content: article.intro },
      { type: "separator", id: uid() },
    ];

    for (const { deck, comment } of article.decks) {
      const deckCode = buildDeckCode(deck);
      const placementStr = deck.placement ? ` — ${placementLabel(deck.placement)} place` : "";
      blocks.push({
        type: "text",
        id: uid(),
        content: `### ${deck.legend.split(",")[0]} de ${deck.player}${placementStr}`,
      });
      blocks.push({ type: "text", id: uid(), content: comment });
      blocks.push({
        type: "decklist",
        id: uid(),
        legendName: deck.legend,
        deckName: `${deck.legend.split(",")[0]} — ${deck.player}`,
        playerName: deck.player,
        deckCode,
      });
    }

    const created = await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        category: "tournois",
        blocks: blocks as any,
        published: true,
      },
    });

    console.log(`  CREATED: ${created.title} (id=${created.id}, ${article.decks.length} decks)`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);
