import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/g, "")
    .replace(/^-+/, "");
}

// --- TIER LIST UPDATE ---

interface TierEntry {
  legendName: string;
  tier: string;
  comment?: string;
}

const unleashedTier: TierEntry[] = [
  // Tier 1 (riftbound.gg) = S
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "Won Sydney 14-1-1. 4x top 8 Xi'an. Finalist Suzhou. T1 absolu" },
  { legendName: "Diana, Scorn of the Moon", tier: "S", comment: "2nd Xi'an. Top 4 Sydney. 3 Win / 10 Top 8 CC" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "Won Suzhou. 35 top 8 CC. Hold +2 Might dominant" },
  { legendName: "LeBlanc, Deceiver", tier: "S", comment: "Top 8 Xi'an + Sydney. 3 Win / 11 Top 8 CC. Deathknell engine" },
  // Tier 2 (riftbound.gg) = A
  { legendName: "Vex, Gloomist", tier: "A", comment: "4th Sydney. 5th Xi'an. Hold-control. 23 decks Suzhou" },
  { legendName: "Sivir, Battle Mistress", tier: "A", comment: "2nd Sydney. Top 4 Suzhou. Aurora ramp. Meta s'adapte" },
  { legendName: "Azir, Emperor of the Sands", tier: "A", comment: "Won Xi'an. Equipment tokens Calm/Order" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "A", comment: "2nd Bologna. 17 decks Suzhou. Aurora Ganking" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "2x Top 8 Suzhou. Control-burn Chaos/Mind" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "2nd Fuzhou. 2 CC wins (Beijing, Tianjin). 26 decks Suzhou" },
  { legendName: "Kha'Zix, Voidreaver", tier: "A", comment: "15 decks Suzhou. Aggro-combo Body/Chaos" },
  // Tier 3 (riftbound.gg) = B
  { legendName: "Teemo, Swift Scout", tier: "B", comment: "6th Sydney. 15 decks Suzhou. Sprites build" },
  { legendName: "Draven, Glorious Executioner", tier: "B", comment: "Won Fuzhou (35.8% du field). 13 decks Suzhou" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "B", comment: "3rd Suzhou. Yordle aggro" },
  { legendName: "Annie, Dark Child", tier: "B", comment: "CC win Shenzhen + Atlanta. 5th Fuzhou. 11 decks Suzhou" },
  { legendName: "Sett, The Boss", tier: "B", comment: "CC win Nanjing. 12 decks Suzhou/Fuzhou" },
  { legendName: "Viktor, Herald of the Arcane", tier: "B", comment: "28 decks Fuzhou. 19 decks Suzhou. Volume sans top cut" },
  { legendName: "Lillia, Bashful Bloom", tier: "B", comment: "Won Shanghai CC. 32 decks Suzhou. Control-tempo" },
  { legendName: "Rengar, Pridestalker", tier: "B", comment: "CC win Guangzhou. 18 decks Suzhou. Dark horse" },
  { legendName: "Kai'sa, Daughter of the Void", tier: "B", comment: "39 decks Fuzhou. 15 decks Suzhou. En déclin post-Origins" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "B", comment: "5th Beijing CC. 12 decks Fuzhou. Gear-value" },
  { legendName: "Vi, Piltover Enforcer", tier: "B", comment: "9 decks Suzhou. Bruiser tempo" },
  { legendName: "Lux, Lady of Luminosity", tier: "B", comment: "8 decks Fuzhou. 6 decks Suzhou. Control Mind/Order" },
  // Tier 4 (riftbound.gg) = C
  { legendName: "Pyke, Bloodharbor Ripper", tier: "C", comment: "10 decks Suzhou. Assassin aggro" },
  { legendName: "Rek'Sai, Void Burrower", tier: "C", comment: "11 decks Fuzhou. 7 decks Suzhou. Aggro tunneler" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "2 decks Fuzhou. 3 decks Suzhou" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "3 decks Fuzhou. 12 decks Suzhou. Ramp midrange" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "10 decks Fuzhou. 4 decks Suzhou. Aggro equip" },
  { legendName: "Master Yi, Wuju Master", tier: "C", comment: "10 decks Suzhou (1.6%). 0 top 8. Variante aggro-synergy" },
  // Tier 5 (riftbound.gg) = D
  { legendName: "Ahri, Nine-Tailed Fox", tier: "D", comment: "5 decks Fuzhou. 16 decks Suzhou. Value Calm/Mind" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "2 decks Fuzhou. Très rare. Aurora ramp" },
  { legendName: "Leona, Radiant Dawn", tier: "D", comment: "2 decks Fuzhou. 9 decks Suzhou. Midrange défensif" },
  { legendName: "Yasuo, Unforgiven", tier: "D", comment: "6 decks Fuzhou. 7 decks Suzhou. Tempo" },
  { legendName: "Lee Sin, Blind Monk", tier: "D", comment: "5 decks Fuzhou. 7 decks Suzhou. Tempo Body/Calm" },
  { legendName: "Jinx, Loose Cannon", tier: "D", comment: "2 decks Fuzhou. 9 decks Suzhou. Aggro" },
  { legendName: "Jax, Grandmaster at Arms", tier: "D", comment: "7 decks Fuzhou. 3 decks Suzhou" },
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "4 decks Fuzhou. 12 decks Suzhou. Aggro burn" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "6 decks Fuzhou. 5 decks Suzhou. Contrôle toxique" },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "9 decks Suzhou. Combo précision" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "7 decks Suzhou. Support ramp" },
];

const globalTier: TierEntry[] = [
  // S — dominants cross-set
  { legendName: "Kai'sa, Daughter of the Void", tier: "S", comment: "~1379 decks. Reine Origins (30-38%). 5 RQ wins" },
  { legendName: "Master Yi, Wuju Bladesman", tier: "S", comment: "~1113 decks. Won Suzhou. T1 cross-set. 35 CC top 8" },
  { legendName: "Irelia, Blade Dancer", tier: "S", comment: "~493 decks. Won Sydney+Shenzhen. T1 cross-set. Finalist Suzhou" },
  { legendName: "Draven, Glorious Executioner", tier: "S", comment: "~660 decks. Won Fuzhou (35.8%). Roi Spiritforged. 4 RQ wins" },
  // A — T1-T2 Unleashed, forts historiquement
  { legendName: "Diana, Scorn of the Moon", tier: "A", comment: "~83 decks. 2nd Xi'an. T1 Unleashed (riftbound.gg)" },
  { legendName: "Viktor, Herald of the Arcane", tier: "A", comment: "~627 decks. #3 Origins volume. Jamais top 4" },
  { legendName: "Annie, Dark Child", tier: "A", comment: "~103 decks. 3 Regional wins. Meilleure conversion" },
  { legendName: "Ezreal, Prodigal Explorer", tier: "A", comment: "~175 decks. Won Bologna. 2x top 8 Suzhou" },
  { legendName: "Fiora, Grand Duelist", tier: "A", comment: "~210 decks. 2nd Fuzhou. Flex slots max. 2 CC wins" },
  { legendName: "LeBlanc, Deceiver", tier: "A", comment: "~69 decks. T1 Unleashed. Deathknell engine unique" },
  // B — solides, résultats réguliers
  { legendName: "Azir, Emperor of the Sands", tier: "B", comment: "Won Lille 14-0-2 + Won Xi'an. Equipment tokens" },
  { legendName: "Sivir, Battle Mistress", tier: "B", comment: "~136 decks. 2nd Sydney. Top 4 Suzhou. Aurora ciblé" },
  { legendName: "Miss Fortune, Bounty Hunter", tier: "B", comment: "~192 decks. 2nd Bologna. Aurora Ganking" },
  { legendName: "Sett, The Boss", tier: "B", comment: "~143 decks. CC win Nanjing. Sous-représenté, surperformant" },
  { legendName: "Ahri, Nine-Tailed Fox", tier: "B", comment: "~159 decks. Calm/Mind value. Stable" },
  { legendName: "Vex, Gloomist", tier: "B", comment: "~48 decks. 4th Sydney. Hold-control" },
  { legendName: "Kha'Zix, Voidreaver", tier: "B", comment: "~24 decks. T2 Unleashed (riftbound.gg). Aggro-combo" },
  // C — compétitifs niche
  { legendName: "Teemo, Swift Scout", tier: "C", comment: "~148 decks. 6th Sydney. Sprites build" },
  { legendName: "Jinx, Loose Cannon", tier: "C", comment: "~105 decks. Aggro Chaos/Fury" },
  { legendName: "Volibear, Relentless Storm", tier: "C", comment: "~106 decks. Ramp midrange" },
  { legendName: "Lee Sin, Blind Monk", tier: "C", comment: "~101 decks. Tempo Body/Calm" },
  { legendName: "Darius, Hand of Noxus", tier: "C", comment: "~78 decks. Aggro Body/Fury" },
  { legendName: "Leona, Radiant Dawn", tier: "C", comment: "~83 decks. Midrange défensif" },
  { legendName: "Yasuo, Unforgiven", tier: "C", comment: "~82 decks. Tempo Calm/Chaos" },
  { legendName: "Lucian, Purifier", tier: "C", comment: "~80 decks. Aggro equip" },
  { legendName: "Jax, Grandmaster at Arms", tier: "C", comment: "~75 decks. 7th Vegas" },
  { legendName: "Rengar, Pridestalker", tier: "C", comment: "~33 decks. CC win Guangzhou. Dark horse" },
  { legendName: "Kai'sa, Daughter of the Void", tier: "C" },
  // D — peu de résultats
  { legendName: "Rumble, Mechanized Menace", tier: "D", comment: "~75 decks. Aggro burn" },
  { legendName: "Lux, Lady of Luminosity", tier: "D", comment: "~72 decks. Control Mind/Order" },
  { legendName: "Rek'Sai, Void Burrower", tier: "D", comment: "~73 decks. Aggro tunneler" },
  { legendName: "Ornn, Fire Below the Mountain", tier: "D", comment: "~63 decks. Gear-value unique" },
  { legendName: "Lillia, Bashful Bloom", tier: "D", comment: "~49 decks. Won Shanghai CC. En déclin" },
  { legendName: "Garen, Might of Demacia", tier: "D", comment: "~23 decks. Rare. Aurora ramp" },
  { legendName: "Renata Glasc, Chem-Baroness", tier: "D", comment: "~38 decks. Contrôle toxique" },
  { legendName: "Master Yi, Wuju Master", tier: "D", comment: "~21 decks. Variante aggro Unleashed. 0 top 8 Regional" },
  { legendName: "Jhin, Virtuoso", tier: "D", comment: "~16 decks. Unleashed. Combo précision" },
  { legendName: "Poppy, Keeper of the Hammer", tier: "D", comment: "~11 decks. 3rd Suzhou. Yordle aggro" },
  { legendName: "Ivern, Green Father", tier: "D", comment: "~7 decks. Unleashed. Support ramp" },
  { legendName: "Pyke, Bloodharbor Ripper", tier: "D", comment: "~20 decks. Assassin aggro" },
  { legendName: "Vi, Piltover Enforcer", tier: "D", comment: "~20 decks. Bruiser tempo" },
];

// Remove duplicate Kai'Sa from global (she's S already)
const globalTierClean = globalTier.filter(
  (e, i) => !(e.legendName === "Kai'sa, Daughter of the Void" && e.tier === "C"),
);

async function seedTierList(
  title: string,
  setContext: string,
  entries: TierEntry[],
  isCurrent: boolean,
) {
  const existing = await prisma.tierList.findFirst({ where: { title } });
  if (existing) {
    await prisma.tierListEntry.deleteMany({ where: { tierListId: existing.id } });
    await prisma.tierList.delete({ where: { id: existing.id } });
  }

  const legendCards = await prisma.card.findMany({
    where: { type: "Legend" },
    select: { riftboundId: true, name: true },
  });

  const legendMap = new Map<string, string>();
  for (const c of legendCards) {
    legendMap.set(c.name.toLowerCase(), c.riftboundId);
  }

  const resolvedEntries = entries.map((e, i) => {
    let legendId = "";
    const exactKey = e.legendName.toLowerCase();
    if (legendMap.has(exactKey)) {
      legendId = legendMap.get(exactKey)!;
    } else {
      const prefix = e.legendName.split(",")[0].toLowerCase().replace("’", "'");
      for (const [name, id] of legendMap) {
        if (name.startsWith(prefix) && !name.includes("(")) {
          legendId = id;
          break;
        }
      }
    }
    return {
      legendId,
      legendName: e.legendName,
      tier: e.tier,
      position: i + 1,
      comment: e.comment ?? null,
    };
  });

  const unresolved = resolvedEntries.filter((e) => !e.legendId);
  if (unresolved.length > 0) {
    console.warn(`  ⚠ ${unresolved.length} legends not found:`, unresolved.map((e) => e.legendName));
  }

  const tierList = await prisma.tierList.create({
    data: {
      title,
      description: `Tier list ${setContext} — mise à jour 28 mai 2026`,
      setContext,
      published: true,
      current: isCurrent,
      entries: {
        create: resolvedEntries.filter((e) => e.legendId),
      },
    },
  });

  console.log(`✓ ${title}: ${resolvedEntries.filter((e) => e.legendId).length} entries (${unresolved.length} unresolved)`);
  return tierList;
}

// --- TOURNAMENT ARTICLES ---

async function createTournamentArticle(
  title: string,
  excerpt: string,
  tags: string[],
  blocks: any[],
  tournamentName: string,
  tournamentDate: string,
  tournamentLocation: string,
  tournamentPlayerCount: number,
) {
  const slug = slugify(title);
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    console.log(`  SKIP article "${slug}" — already exists`);
    return existing;
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      category: "tournoi",
      tags,
      blocks,
      published: true,
      publishedAt: new Date(),
      tournamentName,
      tournamentDate: new Date(tournamentDate),
      tournamentLocation,
      tournamentPlayerCount,
    },
  });

  console.log(`✓ Article créé: "${slug}"`);
  return article;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// --- MAIN ---

async function main() {
  console.log("=== Mise à jour Fuzhou + Suzhou ===\n");

  // 1. Fix tier lists
  console.log("--- Tier Lists ---");
  await prisma.tierList.updateMany({ where: { current: true }, data: { current: false } });
  await seedTierList("Tier List Unleashed", "Unleashed", unleashedTier, false);
  await seedTierList("Tier List Globale", "Global", globalTierClean, true);
  console.log("");

  // 2. Create Fuzhou article
  console.log("--- Articles ---");

  await createTournamentArticle(
    "Fuzhou Regional Qualifier — Draven règne sur le méta Spiritforged",
    "Avec 183 decklists sur 511 (35.8%), Draven domine sans partage le Regional Qualifier de Fuzhou. Aipotu remporte le tournoi dans un top 8 marqué par 4 Draven.",
    ["tournoi", "spiritforged", "fuzhou", "regional", "draven"],
    [
      {
        type: "text",
        id: makeId(),
        content: `<h2>Fuzhou Regional Qualifier</h2>
<p><strong>Date :</strong> 15 janvier 2026<br/>
<strong>Lieu :</strong> Fuzhou, Chine<br/>
<strong>Joueurs :</strong> ~800<br/>
<strong>Decklists analysées :</strong> 511<br/>
<strong>Set :</strong> Spiritforged</p>

<p>Le Regional Qualifier de Fuzhou est l'un des premiers gros tournois du set Spiritforged en Chine. Avec 511 decklists collectées sur environ 800 joueurs, c'est un dataset conséquent qui montre clairement la domination de <strong>Draven</strong> dans le méta Spiritforged chinois.</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Top 8</h2>
<table>
<thead><tr><th>Place</th><th>Joueur</th><th>Légende</th></tr></thead>
<tbody>
<tr><td>🥇 1er</td><td>Aipotu</td><td>Draven, Glorious Executioner</td></tr>
<tr><td>🥈 2e</td><td>EDG.BTM.少侠SNnnnn</td><td>Fiora, Grand Duelist</td></tr>
<tr><td>🥉 3e</td><td>天堂制造</td><td>Draven, Glorious Executioner</td></tr>
<tr><td>4e</td><td>赤月星宿</td><td>Irelia, Blade Dancer</td></tr>
<tr><td>5e</td><td>Ai.EDG.张伯伦</td><td>Annie, Dark Child</td></tr>
<tr><td>6e</td><td>海盗帕奇斯</td><td>Draven, Glorious Executioner</td></tr>
<tr><td>7e</td><td>布启</td><td>Draven, Glorious Executioner</td></tr>
<tr><td>8e</td><td>Trails</td><td>Irelia, Blade Dancer</td></tr>
</tbody>
</table>
<p><strong>4 Draven, 2 Irelia, 1 Fiora, 1 Annie</strong> en top 8. Draven est omniprésent.</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Distribution du méta</h2>
<p>Sur 511 decklists analysées :</p>
<table>
<thead><tr><th>Légende</th><th>Decks</th><th>%</th></tr></thead>
<tbody>
<tr><td><strong>Draven</strong></td><td>183</td><td>35.8%</td></tr>
<tr><td><strong>Irelia</strong></td><td>62</td><td>12.1%</td></tr>
<tr><td>Kai'Sa</td><td>39</td><td>7.6%</td></tr>
<tr><td>Viktor</td><td>28</td><td>5.5%</td></tr>
<tr><td>Fiora</td><td>24</td><td>4.7%</td></tr>
<tr><td>Sivir</td><td>17</td><td>3.3%</td></tr>
<tr><td>Master Yi (Bladesman)</td><td>16</td><td>3.1%</td></tr>
<tr><td>Azir</td><td>12</td><td>2.3%</td></tr>
<tr><td>Sett</td><td>12</td><td>2.3%</td></tr>
<tr><td>Ornn</td><td>12</td><td>2.3%</td></tr>
</tbody>
</table>
<p><strong>28 légendes</strong> représentées au total. Draven représente plus d'un tiers du field — sa domination est encore plus marquée qu'au Shenzhen National Open (18%).</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Analyse</h2>
<ul>
<li><strong>Draven S-Tier confirmé</strong> : 35.8% du field ET 4/8 top 8. Deux archétypes coexistent — Midrange classique et Miracle (avant les bans).</li>
<li><strong>Irelia en embuscade</strong> : 12.1% du field, 2 en top 8. La meilleure réponse à Draven grâce à son package réactif Calm/Chaos.</li>
<li><strong>Fiora surprise finaliste</strong> : seulement 4.7% du field mais une finale — builds midrange equipment et OGN-242 coexistent.</li>
<li><strong>Annie 5e</strong> : faible représentation mais excellente conversion. Counter naturel des decks contrôle.</li>
<li><strong>Kai'Sa en déclin</strong> : 7.6% du field — une chute drastique comparée à ses 30-38% en Origins.</li>
</ul>
<p>Ce tournoi confirme la tendance du méta Spiritforged chinois : Draven est roi, Irelia est la meilleure réponse, et le rest du field lutte pour les miettes.</p>`,
      },
    ],
    "Fuzhou Regional Qualifier",
    "2026-01-15",
    "Fuzhou, Chine",
    800,
  );

  // 3. Create Suzhou article
  await createTournamentArticle(
    "Suzhou Regional Qualifier — Master Yi Bladesman triomphe dans un méta diversifié",
    "Avec 637 decklists et 41 légendes représentées, le Suzhou Regional Qualifier offre le méta le plus diversifié de l'ère Unleashed. Master Yi, Wuju Bladesman remporte le titre.",
    ["tournoi", "unleashed", "suzhou", "regional", "master-yi"],
    [
      {
        type: "text",
        id: makeId(),
        content: `<h2>Suzhou Regional Qualifier</h2>
<p><strong>Date :</strong> 10 mai 2026<br/>
<strong>Lieu :</strong> Suzhou, Chine<br/>
<strong>Joueurs :</strong> ~800<br/>
<strong>Decklists analysées :</strong> 637<br/>
<strong>Set :</strong> Unleashed</p>

<p>Le Regional Qualifier de Suzhou est l'un des premiers grands tournois du set Unleashed en Chine. Avec 637 decklists et <strong>41 légendes</strong> représentées, c'est le méta le plus diversifié jamais enregistré dans un tournoi majeur de Riftbound.</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Top 8</h2>
<table>
<thead><tr><th>Place</th><th>Joueur</th><th>Légende</th></tr></thead>
<tbody>
<tr><td>🥇 1er</td><td>燐川</td><td>Master Yi, Wuju Bladesman</td></tr>
<tr><td>🥈 2e</td><td>LineKa·OAK</td><td>Irelia, Blade Dancer</td></tr>
<tr><td>🥉 3e</td><td>卓卡-坦尼斯</td><td>Poppy, Keeper of the Hammer</td></tr>
<tr><td>4e</td><td>藏宝 嗯哼</td><td>Sivir, Battle Mistress</td></tr>
<tr><td>5e</td><td>andy1996</td><td>Ezreal, Prodigal Explorer</td></tr>
<tr><td>6e</td><td>TXG·高远</td><td>Ezreal, Prodigal Explorer</td></tr>
<tr><td>7e</td><td>JIYAN- YADA</td><td>Irelia, Blade Dancer</td></tr>
<tr><td>8e</td><td>夺冠就结婚</td><td>Sivir, Battle Mistress</td></tr>
</tbody>
</table>
<p><strong>6 légendes différentes</strong> en top 8 : Master Yi Bladesman, 2x Irelia, Poppy (!), 2x Sivir, 2x Ezreal. Diversité remarquable.</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Distribution du méta</h2>
<p>Sur 637 decklists analysées, <strong>41 légendes</strong> représentées :</p>
<table>
<thead><tr><th>Légende</th><th>Decks</th><th>%</th></tr></thead>
<tbody>
<tr><td><strong>Master Yi, Wuju Bladesman</strong></td><td>66</td><td>10.4%</td></tr>
<tr><td><strong>Irelia</strong></td><td>62</td><td>9.7%</td></tr>
<tr><td>Diana</td><td>47</td><td>7.4%</td></tr>
<tr><td>LeBlanc</td><td>37</td><td>5.8%</td></tr>
<tr><td>Lillia</td><td>32</td><td>5.0%</td></tr>
<tr><td>Fiora</td><td>26</td><td>4.1%</td></tr>
<tr><td>Vex</td><td>23</td><td>3.6%</td></tr>
<tr><td>Viktor</td><td>19</td><td>3.0%</td></tr>
<tr><td>Sivir / Rengar</td><td>18 chacun</td><td>2.8%</td></tr>
<tr><td>Miss Fortune</td><td>17</td><td>2.7%</td></tr>
</tbody>
</table>
<p><em>Note :</em> Master Yi, Wuju Master (variante Unleashed) n'a que 10 decks (1.6%) et n'apparaît pas en top 8. Les deux Master Yi sont des légendes distinctes.</p>`,
      },
      {
        type: "text",
        id: makeId(),
        content: `<h2>Analyse</h2>
<ul>
<li><strong>Master Yi Bladesman gagne</strong> : le vétéran d'Origins prouve qu'il reste compétitif dans Unleashed. Son Hold +2 Might reste quasi-imbattable en défense.</li>
<li><strong>Poppy 3e — la vraie surprise</strong> : seulement 4 decks dans tout le tournoi mais un placement top 4. Un outlier statistique impressionnant.</li>
<li><strong>Ezreal en force</strong> : 2 joueurs en top 8 avec seulement 7 decks dans le field (28.6% de conversion). Control-burn redoutable.</li>
<li><strong>Sivir tient bon</strong> : 2 en top 8 malgré l'adaptation du méta contre Aurora (Dazzling Aurora). Le build reste viable.</li>
<li><strong>41 légendes</strong> — c'est le tournoi le plus diversifié du dataset. En comparaison, les tournois Origins n'avaient que 16 légendes.</li>
<li><strong>Wuju Master ≠ Wuju Bladesman</strong> : la variante Unleashed (Wuju Master) est à 1.6% sans résultat notable — à ne pas confondre avec le Bladesman vainqueur.</li>
</ul>`,
      },
    ],
    "Suzhou Regional Qualifier",
    "2026-05-10",
    "Suzhou, Chine",
    800,
  );

  console.log("\n=== Terminé ===");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
