import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

// ── TOP 8 ATLANTA ─────────────────────────────────────────────────────
const TOP8_ATLANTA = [
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismаticismism",
    placement: "1st",
    record: "14-1-1",
    domains: "Fury/Chaos",
    deckCode: `== Main Deck ==
3x Noxus Hopeful
3x Stacked Deck
3x Traveling Merchant
3x Flash
3x Ferrous Forerunner
3x Overzealous Fan
2x Cleave
2x Rebuke
2x Ride the Wind
2x Tideturner
2x Long Sword
2x Hard Bargain
3x Kai'Sa, Survivor
3x Rengar, Pouncing
3x Rek'Sai, Breacher

== Runes ==
6x Fury Rune
6x Chaos Rune

== Battlefield ==
1x The Arena's Greatest
1x Zaun Warrens
1x Seat of Power

== Side Deck ==
1x Thermo Beam
1x Gust
1x Rebuke
1x Mindsplitter
1x Against the Odds
1x Factory Recall
1x Hard Bargain
1x Switcheroo`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "CTCG Koko Lopez",
    placement: "2nd",
    record: "13-1-2",
    domains: "Fury/Chaos",
    deckCode: `== Main Deck ==
3x Noxus Hopeful
3x Kai'Sa, Survivor
3x Rebuke
3x Stacked Deck
3x Tideturner
3x Gem Jammer
3x Ferrous Forerunner
3x Overzealous Fan
3x Spinning Axe
2x Darius, Trifarian
2x Rek'Sai, Breacher
1x Cleave
1x Brynhir Thundersong
1x Falling Star
1x Flash
1x Blood Rush
1x Beast Below
1x Hard Bargain
1x Switcheroo

== Runes ==
6x Fury Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Targon's Peak
1x Zaun Warrens

== Side Deck ==
2x Last Rites
1x Thermo Beam
1x Brynhir Thundersong
1x Against the Odds
1x Beast Below
1x Factory Recall
1x Hard Bargain`,
  },
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "HаruKаze",
    placement: "3-4th",
    record: "12-2-1",
    domains: "Calm/Chaos",
    deckCode: `== Main Deck ==
2x Boots of Swiftness
2x Guardian Angel
1x Fizz, Trickster
3x Stellacorn Herder
1x Mindsplitter
1x Vex, Cheerless
1x Zhonya's Hourglass
2x Tideturner
3x En Garde
3x Discipline
3x Defiant Dance
2x Rebuke
3x Charm
3x Desert's Call
2x Defy
2x Flash
2x Hard Bargain
1x Not So Fast
2x Ride the Wind

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Zaun Warrens
1x Ravenbloom Conservatory
1x Sunken Temple

== Side Deck ==
2x Adaptatron
1x Factory Recall
2x Find Your Center
1x Fizz, Trickster
1x Not So Fast
1x Vex, Cheerless`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "CTG Alаnzq",
    placement: "3-4th",
    record: "12-2-1",
    domains: "Chaos/Mind",
    deckCode: `== Main Deck ==
3x Gust
3x Stupefy
2x Smoke Screen
3x Stacked Deck
2x Arcane Shift
3x Wages of Pain
3x Bellows Breath
1x Hard Bargain
1x Singularity
2x Rebuke
3x Plundering Poro
3x Ravenbloom Student
2x Thousand-Tailed Watcher
2x Fizz, Trickster
1x Factory Recall
3x Card Sharp
2x Mindsplitter

== Runes ==
6x Chaos Rune
6x Mind Rune

== Battlefield ==
1x Void Gate
1x Sigil of the Storm
1x Aspirant's Climb

== Side Deck ==
1x Mindsplitter
2x Vex, Cheerless
1x Dr. Mundo, Expert
1x Hard Bargain
1x Arcane Shift
2x Acceptable Losses`,
  },
  {
    legend: "Kai'Sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "Frosty",
    placement: "5-8th",
    record: "11-2-1",
    domains: "Fury/Mind",
    deckCode: `== Main Deck ==
3x Hextech Ray
3x Noxus Hopeful
3x Falling Star
3x Stupefy
3x Watchful Sentry
3x Thousand-Tailed Watcher
3x Ferrous Forerunner
3x Plundering Poro
2x Cleave
2x Lecturing Yordle
2x Smoke Screen
2x Time Warp
2x Forecaster
2x Bellows Breath
1x Retreat
2x Darius, Trifarian

== Runes ==
7x Fury Rune
5x Mind Rune

== Battlefield ==
1x The Arena's Greatest
1x The Candlelit Sanctum
1x Void Gate

== Side Deck ==
2x Thermo Beam
2x Singularity
2x Progress Day
1x Lecturing Yordle
1x Icathian Rain`,
  },
  {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    player: "CTCG Collin K",
    placement: "5-8th",
    record: "11-2-1",
    domains: "Body/Order",
    deckCode: `== Main Deck ==
3x Arena Bar
3x First Mate
3x Pit Rookie
3x Cithria of Cloudfield
3x Sabotage
3x Call to Glory
3x Fiora, Victorious
3x Showstopper
3x Punch First
3x Lucian, Merciless
2x Challenge
2x Hidden Blade
2x Fae Dragon
1x Kinkou Monk
1x Sea Monkey
1x Akshan, Mischievous

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Grove of the God-Willow
1x Monastery of Hirana
1x Sunken Temple

== Side Deck ==
2x Unyielding Spirit
2x Facebreaker
2x Akshan, Mischievous
1x Sett, Brawler
1x Hidden Blade`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "StаrDust",
    placement: "5-8th (8th)",
    record: "11-2-1",
    domains: "Fury/Chaos",
    deckCode: `== Main Deck ==
1x Acceptable Losses
1x Brynhir Thundersong
3x Cleave
3x Darius, Trifarian
1x Falling Star
2x Ferrous Forerunner
1x Flash
1x Hard Bargain
3x Kai'Sa, Survivor
3x Noxus Hopeful
2x Rebuke
2x Rek'Sai, Breacher
3x Ride the Wind
3x Spinning Axe
3x Stacked Deck
3x Tideturner
3x Traveling Merchant
1x Vi, Destructive

== Runes ==
5x Chaos Rune
7x Fury Rune

== Battlefield ==
1x Aspirant's Climb
1x Targon's Peak
1x Zaun Warrens

== Side Deck ==
2x Acceptable Losses
1x Against the Odds
1x Brynhir Thundersong
1x Falling Star
1x Ferrous Forerunner
1x Hard Bargain
1x Thermo Beam`,
  },
];

// ── TOP 8 SYDNEY ──────────────────────────────────────────────────────
const TOP8_SYDNEY = [
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "EDG Rico1997",
    placement: "1st",
    record: "14-1-1",
    domains: "Calm/Chaos",
    deckCode: `== Main Deck ==
3x Lonely Poro
3x Scuttle Crab
2x Vex, Apathetic
2x Baron Nashor
3x Zhonya's Hourglass
2x Boots of Swiftness
2x Charm
3x Defiant Dance
3x Defy
2x En Garde
1x Gust
1x Stacked Deck
1x Abandon
3x Discipline
1x Flash
2x Ride the Wind
3x Find Your Center
1x Star-Crossed
1x Tricksy Tentacles

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Aspirant's Climb
1x Sunken Temple

== Side Deck ==
2x Factory Recall
2x Gust
2x Guardian Angel
1x Hard Bargain
1x Baron Nashor`,
  },
  {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "TSS SouledOut",
    placement: "2nd",
    record: "14-2-0",
    domains: "Body/Chaos",
    deckCode: `== Main Deck ==
1x Gentle Gemdragon
1x Soulgorger
1x Baron Nashor
3x Elder Dragon
2x Scryer's Bloom
3x Treasure Trove
1x Boots of Swiftness
1x Last Rites
3x Dazzling Aurora
2x Flurry of Blades
3x Gust
1x Punch First
1x Repulse
3x Stacked Deck
1x Abandon
1x Challenge
3x Mobilize
1x Ride the Wind
2x Invert Timelines
2x Lunar Boon
3x Catalyst of Aeons

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x The Papertree

== Side Deck ==
3x Acceptable Losses
1x Repulse
1x Abandon
1x Beast Below
1x Soulgorger
1x Baron Nashor`,
  },
  {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "nice boy",
    placement: "3rd",
    record: "12-2-1",
    domains: "Chaos/Mind",
    deckCode: `== Main Deck ==
3x Plundering Poro
3x Ravenbloom Student
2x Bewitching Spirit
1x Diana, Lunari
1x Fizz, Trickster
3x Nocturne, Horrifying
2x Hwei, Brooding Painter
2x Thousand-Tailed Watcher
3x Gust
3x Stacked Deck
3x Stupefy
1x Abandon
1x Rebuke
2x Ride the Wind
3x Eclipse
2x Moonfall
2x Star-Crossed
2x Wages of Pain

== Runes ==
7x Chaos Rune
5x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Frozen Fortress
1x Ravenbloom Conservatory

== Side Deck ==
1x Abandon
1x Rebuke
2x Turn to Dust
1x Star-Crossed
3x Vex, Apathetic`,
  },
  {
    legend: "Vex, Gloomist",
    champion: "Vex, Apathetic",
    player: "EEP Bonk Repeаt",
    placement: "4th",
    record: "12-2-1",
    domains: "Calm/Chaos",
    deckCode: `== Main Deck ==
1x Evelynn, Entrancing
3x Mutated Mouser
3x Overzealous Fan
2x Tideturner
1x Shadow
3x Sona, Harmonious
1x Boots of Swiftness
2x Edge of Night
2x Charm
3x Defy
2x Existential Dread
3x Stacked Deck
2x Discipline
2x Flash
1x Hard Bargain
2x Meditation
1x Switcheroo
3x Back Off
2x Star-Crossed

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Ravenbloom Conservatory
1x Star Spring
1x Startipped Peak

== Side Deck ==
3x Gust
1x Abandon
1x Hard Bargain
1x Not So Fast
2x Ahri, Alluring`,
  },
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "Ghosterdriver",
    placement: "5th",
    record: "11-2-1",
    domains: "Calm/Chaos",
    deckCode: `== Main Deck ==
3x Lonely Poro
3x Scuttle Crab
2x Vex, Apathetic
2x Baron Nashor
1x Honeyfruit
2x Zhonya's Hourglass
2x Boots of Swiftness
2x Charm
3x Defiant Dance
3x Defy
2x En Garde
2x Gust
1x Stacked Deck
1x Abandon
3x Discipline
1x Hard Bargain
1x Ride the Wind
3x Find Your Center
1x Star-Crossed
1x Tricksy Tentacles

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Aspirant's Climb
1x Sunken Temple

== Side Deck ==
2x Factory Recall
2x Invert Timelines
1x Star-Crossed
2x Tasty Faefolk
1x Baron Nashor`,
  },
  {
    legend: "Leblanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "CTCG DZiden",
    placement: "7th",
    record: "11-3-0",
    domains: "Mind/Order",
    deckCode: `== Main Deck ==
2x Honest Broker
3x Soaring Scout
3x Watchful Sentry
1x Black Rose Dignitary
3x Karthus, Eternal
2x Xin Zhao, Vigilant
1x Spectral Matron
2x Glasc Mixologist
1x Ruined Rex
3x Thousand-Tailed Watcher
1x Bellows Breath
1x Sacrifice
3x Cull the Weak
3x Deathgrip
1x Facebreaker
2x Hidden Blade
1x Salvage
2x Shadow's Call
1x Tactical Retreat
2x Mirror Image
1x Imperial Decree

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x Dusk Rose Lab
1x Forbidding Waste
1x Windswept Hillock`,
  },
  {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "CTG Alаnzq",
    placement: "8th",
    record: "11-3-0",
    domains: "Chaos/Mind",
    deckCode: `== Main Deck ==
3x Ravenbloom Student
2x Fizz, Trickster
3x Vex, Apathetic
3x Hwei, Brooding Painter
2x Vex, Cheerless
2x Mindsplitter
2x Existential Dread
3x Gust
3x Stacked Deck
3x Stupefy
1x Hard Bargain
2x Ride the Wind
2x Eclipse
3x Moonfall
1x Star-Crossed
3x Deadly Flourish
1x Singularity

== Runes ==
7x Chaos Rune
5x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Ravenbloom Conservatory
1x Targon's Peak

== Side Deck ==
3x Acceptable Losses
1x Invert Timelines
1x Star-Crossed
1x Thousand-Tailed Watcher
1x Unchecked Power
1x Dr. Mundo, Expert`,
  },
];

async function createTop8Article(
  title: string,
  slug: string,
  excerpt: string,
  decks: typeof TOP8_ATLANTA,
  tournament: {
    name: string;
    date: string;
    location: string;
    players: number;
    set: string;
    intro: string;
  },
) {
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    console.log(`Article already exists: ${slug}, skipping`);
    return;
  }

  const blocks: any[] = [
    {
      type: "text",
      id: "intro",
      content: tournament.intro,
    },
  ];

  for (let i = 0; i < decks.length; i++) {
    const d = decks[i];
    blocks.push({
      type: "separator",
      id: `sep-${i}`,
    });
    blocks.push({
      type: "text",
      id: `header-${i}`,
      content: `### ${d.placement} — ${d.legend}\n**${d.player}** ${d.record !== "—" ? `(${d.record})` : ""} — ${d.domains}`,
    });
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      deckName: `${d.legend} — Top 8 ${tournament.name.includes("Atlanta") ? "Atlanta" : "Sydney"}`,
      legendName: d.legend,
      playerName: d.player,
      context: `${d.placement} — ${tournament.name} (${d.domains})`,
    });
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt,
      category: "tournoi",
      tags: [
        slug.includes("atlanta") ? "atlanta" : "sydney",
        "rq",
        "top-8",
        tournament.set.toLowerCase(),
        "2026",
      ],
      blocks: blocks as any,
      published: true,
      featured: false,
      publishedAt: new Date(),
      tournamentName: tournament.name,
      tournamentDate: new Date(tournament.date),
      tournamentLocation: tournament.location,
      tournamentPlayerCount: tournament.players,
    },
  });

  console.log(`Article created: /articles/${article.slug}`);
}

async function main() {
  // Top 8 Atlanta
  await createTop8Article(
    "Top 8 Atlanta Regional Qualifier 2026",
    "top-8-atlanta-rq-2026",
    "Les 8 decklists du Top 8 au Regional Qualifier d'Atlanta 2026 — dernier Regional Spiritforged. Annie championne, Draven finaliste.",
    TOP8_ATLANTA,
    {
      name: "Atlanta Regional Qualifier 2026",
      date: "2026-04-29",
      location: "Atlanta, USA",
      players: 1500,
      set: "Spiritforged",
      intro: `Le **Top 8 du Regional Qualifier d'Atlanta** — le dernier Regional de la saison Spiritforged, ~1500 joueurs.

**Annie** remporte le titre avec un record de **14-1-1**, sa 2e victoire en Regional. **Draven** finaliste (13-1-2) confirme sa domination — légende la plus jouée à chaque phase du tournoi. Le duo Fury/Chaos monopolise le Top 2.

Surprise : **Sett** en Top 8 malgré un win rate global de seulement 44%, prouvant qu'un bon joueur peut dépasser les statistiques.

- **3 Draven** en Top 8 (2nd, 8th + un éliminé en quarts)
- **4/6 légendes** sont Fury ou Chaos
- Seul **Sett** (Body/Order) échappe à la domination Fury/Chaos`,
    },
  );

  // Top 8 Sydney
  await createTop8Article(
    "Top 8 Sydney Regional Qualifier 2026",
    "top-8-sydney-rq-2026",
    "Les 8 decklists du Top 8 au Regional Qualifier de Sydney 2026 — 1405 joueurs, format Unleashed. Irelia championne.",
    TOP8_SYDNEY,
    {
      name: "Sydney Regional Qualifier 2026",
      date: "2026-05-16",
      location: "Sydney, Australie",
      players: 1405,
      set: "Unleashed",
      intro: `Le **Top 8 du Regional Qualifier de Sydney** — 1405 joueurs, format Unleashed.

**Irelia** remporte le titre, confirmant la domination du tempo Calm/Chaos dans ce format. La méta Sydney se distingue par une grande diversité : 6 légendes différentes en Top 8.

Points clés :
- **Chaos** présent dans **7/8** decks du Top 8
- **Irelia** et **Vex** en Calm/Chaos — le tempo réactif domine
- **Diana** apparaît 2 fois (3e et 8e) — le seul doublon
- **LeBlanc** représente l'archétype Deathknell Engine (Mind/Order)
- **Master Yi** en Calm/Body — seul représentant des archetypes Hold/Midrange`,
    },
  );

  console.log("\nDone! 2 Top 8 articles created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
