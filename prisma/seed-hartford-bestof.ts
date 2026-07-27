import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

interface BestOfEntry {
  legend: string;
  champion: string;
  player: string;
  placement: string;
  domains: string;
  tier: string;
  deckCode: string;
}

// ── Best of Hartford RQ (40 légendes) ──────────────────────────────
// Source : article officiel "Hartford's Top Decks" (riftbound.leagueoflegends.com).
// Meilleur deck de chaque Légende ; tier = bucket par classement final au tournoi.
// Dernier RQ Unleashed (Best Of) avant Vendetta. Factor (Master Yi) champion.
const BEST_OF: BestOfEntry[] = [
  // ── S — Top 8 ──────────────────────────────────────────────────
  {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Tempered",
    player: "Factor",
    placement: "1st",
    domains: "Body/Calm",
    tier: "S",
    deckCode: `== Main Deck ==
1x Challenge
3x Charm
3x Defy
3x Discipline
2x En Garde
2x Fiora, Peerless
2x First Mate
3x Lonely Poro
3x Pit Rookie
1x Primal Strength
3x Punch First
3x Rengar, Trophy Hunter
2x Ruin Runner
3x Sabotage
3x Scuttle Crab
2x Zhonya's Hourglass
== Runes ==
7x Body Rune
5x Calm Rune
== Battlefield ==
1x Emperor's Dais
1x Seat of Power
1x The Arena's Greatest
== Side Deck ==
2x Alpha Strike
1x Challenge
3x Disarming Rake
1x Fiora, Peerless
1x Ruin Runner`,
  },
  {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "bsweitz",
    placement: "2nd",
    domains: "Chaos/Mind",
    tier: "S",
    deckCode: `== Main Deck ==
1x Acceptable Losses
1x Eclipse
2x Fizz, Trickster
2x Gust
2x Hard Bargain
2x Hwei, Brooding Painter
1x Kha'Zix, Mutating Horror
2x Moonfall
3x Ravenbloom Student
1x Rebuke
2x Ride the Wind
3x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x Tideturner
3x Traveling Merchant
3x Vex, Apathetic
== Runes ==
7x Chaos Rune
5x Mind Rune
== Battlefield ==
1x Abandoned Hall
1x Seat of Power
1x The Arena's Greatest
== Side Deck ==
1x Acceptable Losses
1x Gust
1x Moonfall
1x Singularity
1x Star-Crossed
1x Switcheroo
2x Turn to Dust`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "Bradykin",
    placement: "3rd",
    domains: "Chaos/Mind",
    tier: "S",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Bewitching Spirit
3x Deadly Flourish
1x Eclipse
3x Fizz, Trickster
2x Gust
3x Pack of Wonders
1x Sprite Fountain
3x Stacked Deck
3x Star-Crossed
3x Stupefy
2x The List
2x Thousand-Tailed Watcher
2x Treasure Trove
1x Turn to Dust
2x Vex, Apathetic
2x Wages of Pain
== Runes ==
7x Chaos Rune
5x Mind Rune
== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Sigil of the Storm
== Side Deck ==
1x Acceptable Losses
2x Angler Beast
2x Kha'Zix, Mutating Horror
1x Mindsplitter
1x Sprite Fountain
1x Turn to Dust`,
  },
  {
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Crownguard",
    player: "CTCG Relivia",
    placement: "6th",
    domains: "Mind/Order",
    tier: "S",
    deckCode: `== Main Deck ==
3x Downstage Dramatics
3x Ekko, Recurrent
3x Forge of the Future
3x Progress Day
1x Promising Future
2x Rally the Troops
1x Retreat
3x Sacrifice
3x Seal of Insight
3x Shadow's Call
3x Soaring Scout
1x Sprite Burst
3x Stupefy
3x Sumpworks Map
1x The Ruination
3x Time Warp
== Runes ==
7x Mind Rune
5x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x The Papertree
== Side Deck ==
1x Ashe, Focused
1x Card Sharp
1x Fiora, Worthy
1x Garbage Grabber
1x Renata Glasc, Mastermind
1x Turn to Dust
2x Wages of Pain`,
  },
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismaticismism",
    placement: "7th",
    domains: "Chaos/Fury",
    tier: "S",
    deckCode: `== Main Deck ==
1x Abandon
2x Cleave
3x Ferrous Forerunner
3x Flash
2x Grim Apothecary
1x Hard Bargain
3x Inferna
3x Kai'Sa, Survivor
3x Long Sword
3x Noxus Hopeful
2x Overzealous Fan
3x Rengar, Pouncing
3x Stacked Deck
2x Star-Crossed
3x Traveling Merchant
2x Vex, Apathetic
== Runes ==
5x Chaos Rune
7x Fury Rune
== Battlefield ==
1x Seat of Power
1x The Arena's Greatest
1x Zaun Warrens
== Side Deck ==
1x Abandon
1x Against the Odds
1x Factory Recall
1x Kha'Zix, Mutating Horror
1x Rebuke
1x Star-Crossed
1x Switcheroo
1x Thermo Beam`,
  },
  {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Dockside Butcher",
    player: "Mirru",
    placement: "8th",
    domains: "Chaos/Fury",
    tier: "S",
    deckCode: `== Main Deck ==
3x Bewitching Spirit
2x Blighted Battleaxe
2x Cleave
1x Ezreal, Prodigy
3x Falling Star
2x Ferrous Forerunner
2x Fizz, Trickster
2x Kai'Sa, Survivor
2x Mindsplitter
2x Rengar, Pouncing
2x Stacked Deck
2x Star-Crossed
2x Switcheroo
3x Tideturner
3x Traveling Merchant
3x Treasure Hunter
3x Void Seeker
== Runes ==
6x Chaos Rune
6x Fury Rune
== Battlefield ==
1x Aspirant's Climb
1x Forbidding Waste
1x Ripper's Bay
== Side Deck ==
1x Brynhir Thundersong
2x Hard Bargain
2x Kha'Zix, Mutating Horror
1x Star-Crossed
2x Thermo Beam`,
  },
  // ── A — Top 16 ─────────────────────────────────────────────────
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "guubums",
    placement: "9th",
    domains: "Calm/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
1x Abandon
3x Boots of Swiftness
3x Charm
3x Defiant Dance
3x Defy
3x Discipline
2x En Garde
2x Guardian Angel
1x Gust
2x Kha'Zix, Mutating Horror
1x Not So Fast
2x Pyke, Returned
2x Ride the Wind
3x Scuttle Crab
1x Star-Crossed
2x Stellacorn Herder
3x Tideturner
2x Vex, Apathetic
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Abandoned Hall
1x Sunken Temple
1x Targon's Peak
== Side Deck ==
3x Adaptatron
1x Gust
1x Not So Fast
1x Star-Crossed
1x Switcheroo
1x Vex, Cheerless`,
  },
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "HXN Strog",
    placement: "11th",
    domains: "Calm/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Arise!
3x B.F. Sword
2x Back Off
3x Brutalizer
3x Deathgrip
3x Defy
3x Discipline
3x Doran's Shield
3x En Garde
3x Eye of the Herald
2x Guards!
3x Hidden Blade
1x Scuttle Crab
3x Soul Sword
1x Vi, Peacekeeper
== Runes ==
7x Calm Rune
5x Order Rune
== Battlefield ==
1x Hall of Legends
1x Seat of Power
1x Trifarian War Camp
== Side Deck ==
2x Ashe, Focused
2x Charm
1x Disarming Rake
2x Salvage
1x Vi, Peacekeeper`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "Zult",
    placement: "12th",
    domains: "Fury/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Blood Rush
3x Carrion Dredger
3x Cleave
3x Cull the Weak
3x Daring Poro
3x Faithful Manufactor
3x Falling Star
3x Honest Broker
3x Inferna
3x Legion Rearguard
3x Noxus Hopeful
3x Undertitan
3x Void Rush
== Runes ==
8x Fury Rune
4x Order Rune
== Battlefield ==
1x Hall of Legends
1x The Arena's Greatest
1x The Candlelit Sanctum
== Side Deck ==
3x Forge of the Future
3x Hextech Ray
2x Salvage`,
  },
  {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "Doctor Snuffles",
    placement: "13th",
    domains: "Body/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
1x Baron Nashor
2x Bullet Time
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
3x Flurry of Blades
3x Gust
2x Last Rites
3x Lunar Boon
1x Mindsplitter
3x Mobilize
3x Pack of Wonders
3x Scryer's Bloom
3x Stacked Deck
3x Treasure Trove
== Runes ==
6x Body Rune
6x Chaos Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Vilemaw's Lair
== Side Deck ==
2x Hard Bargain
2x Mindsplitter
2x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "bloody",
    placement: "16th",
    domains: "Body/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
3x Baron Nashor
1x Boots of Swiftness
3x Catalyst of Aeons
3x Challenge
3x Dazzling Aurora
1x Elder Dragon
1x Existential Dread
2x Gust
2x Last Rites
2x Lunar Boon
3x Mobilize
3x Punch First
3x Ride the Wind
2x Sabotage
3x Scryer's Bloom
3x Stacked Deck
1x Treasure Trove
== Runes ==
6x Body Rune
6x Chaos Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Elder Dragon
2x Flurry of Blades
1x Mindsplitter
1x Pack of Wonders
1x Sabotage
1x Treasure Trove`,
  },
  // ── B — Top 32 ─────────────────────────────────────────────────
  {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Trophy Hunter",
    player: "mom sky",
    placement: "19th",
    domains: "Body/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
1x Brynhir Thundersong
2x Challenge
1x Darius, Trifarian
3x Determined Sentry
1x Ferrous Forerunner
2x Grim Apothecary
3x Inferna
3x Irresistible Faefolk
3x Kai'Sa, Survivor
2x Kinkou Initiate
3x Nidalee, Cat Form
3x Noxus Hopeful
3x Pit Rookie
3x Punch First
2x Pyke, Dockside Butcher
1x Sabotage
3x Thrill of the Hunt
== Runes ==
8x Body Rune
4x Fury Rune
== Battlefield ==
1x Emperor's Dais
1x Seat of Power
1x The Arena's Greatest
== Side Deck ==
1x Against the Odds
1x Brynhir Thundersong
1x Darius, Trifarian
2x Ferrous Forerunner
1x Repulse
2x Sabotage`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "asiptofu",
    placement: "26th",
    domains: "Fury/Order",
    tier: "B",
    deckCode: `== Main Deck ==
2x Blighted Battleaxe
2x Call to Glory
2x Cleave
1x Falling Star
1x Ferrous Forerunner
3x Gem Jammer
3x Hidden Blade
2x Honest Broker
3x Inferna
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Rally the Troops
1x Rek'Sai, Breacher
1x Salvage
3x Trifarian Gloryseeker
3x Vanguard Captain
1x Vengeance
2x Vi, Peacekeeper
== Runes ==
6x Fury Rune
6x Order Rune
== Battlefield ==
1x Seat of Power
1x The Arena's Greatest
1x Trifarian War Camp
== Side Deck ==
2x Ashe, Focused
2x Falling Star
2x Ferrous Forerunner
2x Salvage`,
  },
  {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Meticulous Killer",
    player: "Ksdden",
    placement: "29th",
    domains: "Fury/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Brynhir Thundersong
3x Consult the Past
3x Curtain Call
3x Deadly Flourish
3x Downstage Dramatics
3x Ekko, Recurrent
2x Energy Conduit
1x Falling Comet
2x Gutter Palace
2x Hextech Anomaly
1x Keeper of Masks
3x Progress Day
3x Promising Future
3x Seal of Insight
1x Sprite Burst
3x Time Warp
== Runes ==
2x Fury Rune
10x Mind Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Falling Comet
2x Sprite Burst
1x Thousand-Tailed Watcher
2x Unchecked Power
1x Vi, Destructive`,
  },
  {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "HTO Juicy",
    placement: "30th",
    domains: "Mind/Order",
    tier: "B",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Carrion Dredger
1x Chakram Dancer
3x Cull the Weak
1x Eclipse
3x Hidden Blade
3x Honest Broker
3x Imperial Decree
1x Salvage
2x Shadow's Call
1x Singularity
3x Sprite Fountain
3x Stupefy
3x Vi, Peacekeeper
3x Wages of Pain
3x Xin Zhao, Vigilant
== Runes ==
6x Mind Rune
6x Order Rune
== Battlefield ==
1x Forbidding Waste
1x Rockfall Path
1x The Arena's Greatest
== Side Deck ==
2x Ashe, Focused
1x Eclipse
1x Facebreaker
2x Pickpocket
2x Salvage`,
  },
  // ── C — Top 128 ────────────────────────────────────────────────
  {
    legend: "LeBlanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "Alex",
    placement: "39th",
    domains: "Mind/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Baited Hook
3x Black Rose Dignitary
3x Glasc Mixologist
3x Harnessed Dragon
2x Hidden Blade
3x Karthus, Eternal
3x Mirror Image
2x Rift Herald
3x Ruined Rex
3x Sacrifice
3x Soaring Scout
2x Thousand-Tailed Watcher
3x Vi, Peacekeeper
3x Watchful Sentry
== Runes ==
4x Mind Rune
8x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Star Spring
1x Windswept Hillock
== Side Deck ==
2x Ashe, Focused
1x Atakhan
1x LeBlanc, Everywhere at Once
2x Salvage
1x Thousand-Tailed Watcher
1x Turn to Dust`,
  },
  {
    legend: "Kha'Zix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    player: "AV Dantelush",
    placement: "60th",
    domains: "Body/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
3x Evelynn, Entrancing
3x Irresistible Faefolk
3x Kinkou Initiate
2x Mister Root
2x Nidalee, Cat Form
3x Punch First
2x Pyke, Returned
1x Rebuke
3x Rengar, Trophy Hunter
2x Sabotage
2x Star-Crossed
3x Switcheroo
1x Treasure Hunter
1x Vex, Apathetic
3x Void Assault
3x Yordle Explorer
== Runes ==
7x Body Rune
5x Chaos Rune
== Battlefield ==
1x Forbidding Waste
1x Star Spring
1x Zaun Warrens
== Side Deck ==
1x Akshan, Mischievous
1x Fizz, Trickster
2x Invert Timelines
2x Repulse
1x Sabotage
1x Unyielding Spirit`,
  },
  {
    legend: "Kai'Sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "Flamekilla",
    placement: "71st",
    domains: "Fury/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
1x Bellows Breath
3x Falling Star
3x Ferrous Forerunner
3x Hextech Ray
3x Lecturing Yordle
2x Noxus Hopeful
1x Piercing Light
2x Plundering Poro
2x Ravenbloom Student
1x Retreat
1x Rocket Barrage
2x Singularity
1x Smite
1x Smoke Screen
3x Stupefy
3x Thousand-Tailed Watcher
2x Time Warp
1x Turn to Dust
1x Void Seeker
3x Watchful Sentry
== Runes ==
7x Fury Rune
5x Mind Rune
== Battlefield ==
1x Rockfall Path
1x The Arena's Greatest
1x Void Gate
== Side Deck ==
2x Brynhir Thundersong
1x Progress Day
1x Smite
2x Thermo Beam
1x Turn to Dust
1x Unchecked Power`,
  },
  {
    legend: "Vex, Gloomist",
    champion: "Vex, Apathetic",
    player: "TinyGuy",
    placement: "75th",
    domains: "Calm/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
2x Ahri, Alluring
1x Allay, Eager Admirer
3x Back Off
2x Boots of Swiftness
1x Charm
3x Defy
3x Discipline
3x Evelynn, Entrancing
2x Existential Dread
2x Gust
1x Hard Bargain
3x Mutated Mouser
3x Overzealous Fan
1x Ride the Wind
2x Shadow
3x Sona, Harmonious
2x Star-Crossed
1x Switcheroo
1x Vilemaw
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Ravenbloom Conservatory
1x Startipped Peak
1x The Papertree
== Side Deck ==
2x Disarming Rake
1x Emperor's Divide
1x Hard Bargain
2x Kha'Zix, Mutating Horror
1x Not So Fast
1x Rebuke`,
  },
  {
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Strategist",
    player: "Batsmak",
    placement: "84th",
    domains: "Chaos/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
1x Abandon
3x Consult the Past
1x Evelynn, Entrancing
1x Existential Dread
2x Guerilla Warfare
3x Nocturne, Horrifying
1x Singularity
2x Sneaky Deckhand
3x Sprite Call
3x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Switcheroo
2x Teemo, Scout
2x Teemo, Strategist
3x Tideturner
1x Vex, Apathetic
3x Windsinger
== Runes ==
6x Chaos Rune
6x Mind Rune
== Battlefield ==
1x Grove of the God-Willow
1x Startipped Peak
1x The Arena's Greatest
== Side Deck ==
2x Downwell
1x Evelynn, Entrancing
1x Mindsplitter
1x Rebuke
1x Singularity
1x Sneaky Deckhand
1x Vex, Apathetic`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "TCG SogeKing",
    placement: "94th",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
1x Blighted Battleaxe
3x Cleave
2x Darius, Trifarian
2x Evelynn, Entrancing
2x Falling Star
1x Fizz, Trickster
2x Flash
1x Hard Bargain
3x Jhin, Murderous Artist
2x Kai'Sa, Survivor
3x Pouty Poro
1x Rebuke
2x Rek'Sai, Breacher
2x Ride the Wind
3x Spinning Axe
3x Stacked Deck
2x Star-Crossed
3x Tideturner
1x Vex, Apathetic
== Runes ==
6x Chaos Rune
6x Fury Rune
== Battlefield ==
1x Targon's Peak
1x Vilemaw's Lair
1x Zaun Warrens
== Side Deck ==
2x Ferrous Forerunner
1x Hard Bargain
2x Invert Timelines
2x Switcheroo
1x Thermo Beam`,
  },
  {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    player: "CTCG Collin K",
    placement: "106th",
    domains: "Body/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Arena Bar
3x Call to Glory
2x Challenge
2x Cithria of Cloudfield
3x Fiora, Victorious
3x First Mate
1x Hidden Blade
3x Irresistible Faefolk
2x Kinkou Monk
3x Pit Rookie
3x Punch First
3x Rengar, Trophy Hunter
1x Repulse
3x Sabotage
3x Showstopper
1x Vi, Peacekeeper
== Runes ==
7x Body Rune
5x Order Rune
== Battlefield ==
1x Grove of the God-Willow
1x Monastery of Hirana
1x Valley of Idols
== Side Deck ==
2x Akshan, Mischievous
2x Ashe, Focused
2x Lucian, Merciless
1x Repulse
1x Vi, Peacekeeper`,
  },
  {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    player: "TSS NoVeggies",
    placement: "109th",
    domains: "Body/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Blood Money
3x Catalyst of Aeons
3x Confront
2x Cull the Weak
3x Dazzling Aurora
3x Elder Dragon
3x Flurry of Blades
2x Forge of the Future
1x Grand Strategem
2x Harnessed Dragon
3x Mobilize
1x Rift Herald
3x Sabotage
3x Sacrifice
2x The Ruination
2x Vanguard Armory
== Runes ==
6x Body Rune
6x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Divine Judgment
3x Rengar, Trophy Hunter
3x Salvage`,
  },
  {
    legend: "Lillia, Bashful Bloom",
    champion: "Lillia, Fae Fawn",
    player: "NerfNick",
    placement: "114th",
    domains: "Calm/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
2x Charm
3x Defy
3x Discipline
2x En Garde
2x Heart of Dark Ice
1x Janna, Savior
1x Lillia, Fae Fawn
3x Mask of Foresight
3x Ravenbloom Student
1x Retreat
2x Riptide Rex
2x Smoke and Mirrors
1x Smoke Screen
3x Sprite Burst
3x Sprite Fountain
2x Stalwart Poro
3x Stupefy
2x Thousand-Tailed Watcher
== Runes ==
6x Calm Rune
6x Mind Rune
== Battlefield ==
1x Dusk Rose Lab
1x Seat of Power
1x The Arena's Greatest
== Side Deck ==
1x Charm
2x Disarming Rake
1x Janna, Savior
1x Lilting Lullaby
1x Singularity
1x Turn to Dust
1x Unchecked Power`,
  },
  // ── D — Reste du field ─────────────────────────────────────────
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "Kaillou",
    placement: "154th",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
3x Blighted Battleaxe
2x Challenge
3x Doran's Blade
2x First Mate
3x Gem Jammer
3x Irresistible Faefolk
3x Kai'Sa, Survivor
2x Kinkou Initiate
1x Legion Rearguard
3x Long Sword
2x Noxus Hopeful
1x Poppy, Paragon
3x Punch First
3x Relentless Pursuit
2x Ruin Runner
2x Sabotage
1x Trinity Force
== Runes ==
7x Body Rune
5x Fury Rune
== Battlefield ==
1x Forge of the Fluft
1x Sunken Temple
1x Zaun Warrens
== Side Deck ==
2x Akshan, Mischievous
2x Ferrous Forerunner
1x Ruin Runner
1x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Blacksmith",
    player: "24Goldfish",
    placement: "155th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
2x Brutalizer
3x Charm
3x Defy
3x Discipline
2x Dropboarder
2x Heart of Dark Ice
2x Janna, Savior
3x Lonely Poro
3x Pit Crew
3x Plundering Poro
2x Poro Snax
2x Seal of Focus
1x Shurelya's Requiem
3x Sprite Fountain
3x Sterak's Gage
2x Thousand-Tailed Watcher
== Runes ==
7x Calm Rune
5x Mind Rune
== Battlefield ==
1x Ornn's Forge
1x Rockfall Path
1x The Arena's Greatest
== Side Deck ==
1x Back Off
3x Disarming Rake
1x Forgefire Cape
1x Ornn, Forge God
2x Singularity`,
  },
  {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    player: "ZanBerserker",
    placement: "173rd",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
3x Catalyst of Aeons
2x Challenge
3x Dazzling Aurora
1x Deadbloom Predator
3x Elder Dragon
2x Falling Star
3x Ferrous Forerunner
3x Gentle Gemdragon
1x Get Excited!
3x Kadregrin the Infernal
3x Mobilize
1x Punch First
3x Rengar, Trophy Hunter
3x Sabotage
3x Sky Splitter
2x Stormbringer
== Runes ==
6x Body Rune
6x Fury Rune
== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x The Papertree
== Side Deck ==
1x Challenge
1x Punch First
2x Repulse
2x Thermo Beam
2x Unyielding Spirit`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Inquisitive",
    player: "Sorentity",
    placement: "177th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
1x Back Off
3x Charm
1x Deadly Flourish
3x Defy
2x Desert's Call
3x Diana, Lunari
3x Discipline
1x Emperor's Divide
2x En Garde
1x Falling Comet
1x Flurry of Feathers
2x Hwei, Brooding Painter
1x Not So Fast
3x Plundering Poro
3x Ravenbloom Student
1x Rocket Barrage
1x Sprite Burst
3x Stupefy
1x Thousand-Tailed Watcher
1x Time Warp
2x Zhonya's Hourglass
== Runes ==
7x Calm Rune
5x Mind Rune
== Battlefield ==
1x Abandoned Hall
1x Amateur Recital
1x Zaun Warrens
== Side Deck ==
1x Ahri, Alluring
1x Kai'Sa, Evolutionary
1x Not So Fast
1x Thousand-Tailed Watcher
1x Tricksy Tentacles
3x Turn to Dust`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "Edward Marie",
    placement: "180th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
3x Brutalizer
3x Challenge
3x Counter Strike
3x Defy
3x Discipline
2x Doran's Blade
2x En Garde
3x First Mate
3x Guardian Angel
3x Lonely Poro
2x Lucian, Merciless
1x Punch First
2x Rengar, Trophy Hunter
1x Ruin Runner
2x Scuttle Crab
3x Stellacorn Herder
== Runes ==
6x Body Rune
6x Calm Rune
== Battlefield ==
1x Ornn's Forge
1x Sunken Temple
1x Targon's Peak
== Side Deck ==
2x Akshan, Mischievous
1x Irelia, Fervent
2x Not So Fast
1x Ruin Runner
2x Sabotage`,
  },
  {
    legend: "Master Yi, Wuju Master",
    champion: "Master Yi, Tempered",
    player: "Chairman",
    placement: "189th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
2x Back Off
3x Concentrate
3x Defy
3x Discipline
2x Emperor's Divide
3x Gemhand Hunter
2x Herald of Spring
2x Hunter's Machete
3x Master Yi, Unstoppable
3x Punch First
2x Scuttle Crab
2x Skyward Strike
3x Voracious Gromp
3x Wuju Apprentice
3x Zhonya's Hourglass
== Runes ==
6x Body Rune
6x Calm Rune
== Battlefield ==
1x Amateur Recital
1x Gardens of Becoming
1x Reckoner's Arena
== Side Deck ==
2x Disarming Rake
1x Emperor's Divide
2x Not So Fast
2x Sabotage
1x Skyward Strike`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "Troy",
    placement: "194th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
2x Challenge
3x Charm
3x Defy
3x Discipline
3x En Garde
3x First Mate
2x Irelia, Fervent
3x Irresistible Faefolk
2x Lonely Poro
3x Nidalee, Cat Form
3x Punch First
3x Rengar, Trophy Hunter
1x Sabotage
3x Scuttle Crab
2x Zhonya's Hourglass
== Runes ==
7x Body Rune
5x Calm Rune
== Battlefield ==
1x Emperor's Dais
1x Monastery of Hirana
1x Star Spring
== Side Deck ==
1x Akshan, Mischievous
2x Disarming Rake
1x Irelia, Fervent
2x Lucian, Merciless
1x Not So Fast
1x Sabotage`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Zealot",
    player: "Clouds King",
    placement: "195th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Back Off
3x Call to Glory
2x Charm
3x Defy
3x Discipline
3x Fiora, Victorious
1x Heart of Dark Ice
1x Hidden Blade
2x Irelia, Fervent
3x Lonely Poro
3x Nami, Headstrong
2x Scuttle Crab
3x Stalwart Poro
3x Vi, Peacekeeper
2x Zenith Blade
2x Zhonya's Hourglass
== Runes ==
7x Calm Rune
5x Order Rune
== Battlefield ==
1x Monastery of Hirana
1x Sunken Temple
1x The Arena's Greatest
== Side Deck ==
2x Ashe, Focused
2x Disarming Rake
2x Not So Fast
2x Salvage`,
  },
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Worthy",
    player: "Designedly Pref",
    placement: "233rd",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Akshan, Mischievous
3x Challenge
3x Dazzling Aurora
3x Divining Shells
2x Doran's Blade
3x Elder Dragon
3x Fiora, Victorious
2x Grim Resolve
1x Harnessed Dragon
1x Punch First
3x Rift Herald
3x Riposte
3x Sacrifice
3x Sett, Brawler
3x Shepherd's Heirloom
== Runes ==
8x Body Rune
4x Order Rune
== Battlefield ==
1x Amateur Recital
1x Aspirant's Climb
1x Sunken Temple
== Side Deck ==
2x Ashe, Focused
2x Harnessed Dragon
1x Repulse
2x Sabotage
1x Salvage`,
  },
  {
    legend: "Ivern, Green Father",
    champion: "Ivern, Nurturer",
    player: "Mr Raze",
    placement: "240th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Azir, Sovereign
1x Back Off
1x Blitzcrank, Impassive
2x Crimson Pigeons
1x Daisy!
2x Daring Poro
3x Defy
1x Disarming Rake
2x Discipline
2x Emperor's Divide
1x Flurry of Feathers
2x Friendship
3x Frisky Hunter
3x Hidden Blade
3x Mutated Mouser
3x Stalwart Poro
3x Trusty Ramhound
2x Ultrasoft Poro
2x Vi, Peacekeeper
== Runes ==
6x Calm Rune
6x Order Rune
== Battlefield ==
1x Rockfall Path
1x Seat of Power
1x Vilemaw's Lair
== Side Deck ==
1x Charm
3x Cull the Weak
2x Disarming Rake
1x Ivern, Friend to all
1x Not So Fast`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    player: "absolute",
    placement: "245th",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Black Rose Dignitary
2x Consult the Past
3x Downstage Dramatics
3x Ekko, Recurrent
1x Fiora, Worthy
2x Forge of the Future
3x Progress Day
1x Rally the Troops
2x Retreat
3x Sacrifice
3x Shadow's Call
3x Soaring Scout
3x Stupefy
3x Sumpworks Map
2x Wages of Pain
2x Watchful Sentry
== Runes ==
6x Mind Rune
6x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x The Papertree
== Side Deck ==
3x Card Sharp
1x Forge of the Future
2x Rally the Troops
1x Wages of Pain
1x Watchful Sentry`,
  },
  {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Rugged",
    player: "Lusavor",
    placement: "300th",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Blood Money
3x Catalyst of Aeons
2x Confront
1x Corina Veraza
2x Cull the Weak
3x Dazzling Aurora
2x Disposal Order
3x Elder Dragon
3x Flurry of Blades
2x Forge of the Future
2x Harnessed Dragon
3x Mobilize
1x Rift Herald
2x Sabotage
2x Sacrifice
1x Salvage
2x The Ruination
2x Vanguard Armory
== Runes ==
6x Body Rune
6x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Divine Judgment
3x Rengar, Trophy Hunter
1x Sabotage
2x Salvage`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Remorseful",
    player: "Complex",
    placement: "301st",
    domains: "Calm/Chaos",
    tier: "D",
    deckCode: `== Main Deck ==
1x Boots of Swiftness
2x Charm
3x Defy
3x Discipline
3x En Garde
1x Flash
2x Irelia, Fervent
2x Rebuke
2x Ride the Wind
3x Scuttle Crab
2x Star-Crossed
3x Stellacorn Herder
1x Switcheroo
3x Tideturner
2x Vex, Apathetic
3x Vex, Cheerless
3x Zhonya's Hourglass
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Abandoned Hall
1x Rockfall Path
1x Targon's Peak
== Side Deck ==
2x Adaptatron
3x Gust
1x Not So Fast
1x Vex, Apathetic
1x Yasuo, Windrider`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    player: "FreakNastyxphd",
    placement: "325th",
    domains: "Chaos/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
2x Blighted Battleaxe
3x Edge of Night
3x Evelynn, Entrancing
1x Falling Star
1x Katarina, Reckless
2x Last Rites
3x Long Sword
3x Noxus Hopeful
3x Pyke, Dockside Butcher
2x Pyke, Returned
2x Rengar, Unseen
3x Seal of Rage
1x Switcheroo
2x Teemo, Scout
3x Tideturner
3x Traveling Merchant
2x Vex, Apathetic
== Runes ==
4x Chaos Rune
8x Fury Rune
== Battlefield ==
1x Amateur Recital
1x Forge of the Fluft
1x Star Spring
== Side Deck ==
1x Katarina, Reckless
2x Sneaky Deckhand
2x Star-Crossed
2x Super Mega Death Rocket!
1x Vex, Apathetic`,
  },
  {
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Peacekeeper",
    player: "ghost of fyrat",
    placement: "406th",
    domains: "Fury/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Carrion Dredger
3x Cull the Weak
3x Deathgrip
2x Falling Star
2x Fiora, Victorious
1x Gem Jammer
1x Grim Apothecary
3x Hextech Gauntlets
1x Hidden Blade
1x Honest Broker
3x Inferna
2x Jhin, Murderous Artist
3x Kai'Sa, Survivor
2x Long Sword
2x Noxus Hopeful
2x Pyke, Dockside Butcher
3x Rek'Sai, Breacher
1x Rengar, Unseen
1x Salvage
== Runes ==
7x Fury Rune
5x Order Rune
== Battlefield ==
1x Forge of the Fluft
1x Star Spring
1x The Arena's Greatest
== Side Deck ==
1x Cleave
2x Faithful Manufactor
1x Falling Star
2x Noxus Saboteur
2x Salvage`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "Thelostankh",
    placement: "n.c.",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Bubble Bot
3x Dunebreaker
3x Ferrous Forerunner
3x Forecaster
3x Gem Jammer
3x Kai'Sa, Survivor
2x Plundering Poro
3x Portal Rescue
3x Production Surge
2x Rumble, Hotheaded
3x Rumble, Scrapper
2x Singularity
3x Skyfall of Areion
3x Stupefy
== Runes ==
6x Fury Rune
6x Mind Rune
== Battlefield ==
1x Sunken Temple
1x The Papertree
1x Vilemaw's Lair
== Side Deck ==
3x Thermo Beam
2x Time Warp
3x Turn to Dust`,
  },
];

const tierLabels: Record<string, string> = {
  S: "Tier 1 — Top 8",
  A: "Tier 2 — Top 16",
  B: "Tier 3 — Top 32",
  C: "Tier 4 — Top 128",
  D: "Tier 5 — Reste du field",
};

async function main() {
  console.log("Creating Hartford Best of article + decks...");

  const blocks: Record<string, unknown>[] = [];
  blocks.push({
    type: "text",
    id: "intro",
    content: `## Best of Hartford — Regional Qualifier

Le **Regional Qualifier de Hartford** clôt l'ère Unleashed : c'est le **dernier RQ avec les prix Best Of** d'Origines et Proving Ground avant l'arrivée de Vendetta. **Factor** y décroche enfin la victoire avec Master Yi, Wuju Bladesman, après deux Top 8 consécutifs, en battant **bsweitz** (Diana) en finale.

Voici le meilleur deck de chaque Légende jouée à Hartford : pour chacune, la liste la mieux classée au tournoi. Les decks sont regroupés par tier selon le classement général obtenu.

---`,
  });

  let lastTier = "";
  for (let i = 0; i < BEST_OF.length; i++) {
    const d = BEST_OF[i];
    if (d.tier !== lastTier) {
      blocks.push({ type: "separator", id: `sep-${d.tier}` });
      blocks.push({ type: "text", id: `tier-${d.tier}`, content: `## ${tierLabels[d.tier] ?? d.tier}` });
      lastTier = d.tier;
    }
    const placementLabel = d.placement === "n.c." ? "Meilleur deck" : d.placement;
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      championName: d.champion,
      deckName: `${d.legend} — Best of Hartford`,
      legendName: d.legend,
      playerName: d.player,
      context: `${placementLabel} — RQ Hartford (${d.domains})`,
    });
  }

  const existingArticle = await prisma.article.findUnique({ where: { slug: "best-of-hartford-rq" } });
  if (existingArticle) {
    await prisma.deck.updateMany({ where: { sourceArticleId: existingArticle.id }, data: { sourceArticleId: null } });
    await prisma.article.delete({ where: { id: existingArticle.id } });
    console.log("  Removed existing best-of-hartford-rq article (re-seeding)");
  }

  const article = await prisma.article.create({
    data: {
      title: "Best of Hartford — Toutes les légendes",
      slug: "best-of-hartford-rq",
      coverImage: "/img/articles/hartford2.webp",
      excerpt:
        "Les meilleures decklists pour chaque légende au Regional Qualifier de Hartford, dernier RQ Unleashed. Factor champion avec Master Yi.",
      category: "tournoi",
      tags: ["hartford", "rq", "best-of", "meta", "unleashed"],
      blocks: blocks as never,
      published: true,
      featured: true,
      publishedAt: new Date("2026-06-24"),
      tournamentName: "Regional Qualifier Hartford",
      tournamentLocation: "Hartford, CT, USA",
      tournamentPlayerCount: 1953,
    },
  });
  console.log(`Article created: /articles/${article.slug}`);

  const totalNotFound: string[] = [];

  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: { type: "Legend", name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" } },
    });

    const slug = `best-of-hartford-${d.legend.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "")}`;
    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      await prisma.deckCard.deleteMany({ where: { deckId: existingDeck.id } });
      await prisma.deck.delete({ where: { id: existingDeck.id } });
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} · Best of Hartford`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au RQ Hartford : ${d.placement === "n.c." ? "classement général non publié" : d.placement} par ${d.player}. ${d.domains}.`,
        format: "constructed",
        setTag: "Unleashed",
        tags: ["hartford", "rq", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: "RQ Hartford 2026",
        tournamentTier: d.tier,
        placement: d.placement,
        playerName: d.player,
      },
    });

    const seen = new Set<string>();
    const legForCard = (await prisma.card.findFirst({ where: { type: "Legend", name: { equals: d.legend, mode: "insensitive" } } })) ?? legendCard;
    if (legForCard) {
      await prisma.deckCard.create({ data: { deckId: deck.id, cardId: legForCard.id, quantity: 1, section: "legend" } });
      seen.add(`${legForCard.id}:legend`);
    }
    const champDash = d.champion.replace(/, /g, " - ");
    const champCard = await prisma.card.findFirst({ where: { OR: [
      { name: { equals: d.champion, mode: "insensitive" } },
      { name: { equals: champDash, mode: "insensitive" } },
      { cleanName: { equals: d.champion, mode: "insensitive" } },
      { cleanName: { equals: champDash, mode: "insensitive" } },
    ] } });
    if (champCard && !seen.has(`${champCard.id}:legend`)) {
      await prisma.deckCard.create({ data: { deckId: deck.id, cardId: champCard.id, quantity: 1, section: "legend" } });
      seen.add(`${champCard.id}:legend`);
    } else if (!champCard) {
      totalNotFound.push(`${d.legend} [champion]: "${d.champion}"`);
    }

    const parsed = parseDeckCode(d.deckCode);
    let created = 0;
    for (const entry of parsed.entries) {
      const dashName = entry.name.replace(/, /g, " - ");
      const card = await prisma.card.findFirst({
        where: {
          OR: [
            { name: { equals: entry.name, mode: "insensitive" } },
            { name: { equals: dashName, mode: "insensitive" } },
            { cleanName: { equals: entry.name, mode: "insensitive" } },
            { cleanName: { equals: dashName, mode: "insensitive" } },
          ],
        },
      });
      if (card) {
        const key = `${card.id}:${entry.section}`;
        if (seen.has(key)) continue;
        seen.add(key);
        await prisma.deckCard.create({
          data: { deckId: deck.id, cardId: card.id, quantity: entry.quantity, section: entry.section },
        });
        created++;
      } else {
        totalNotFound.push(`${d.legend}: "${entry.name}"`);
      }
    }
    console.log(`  Deck: ${slug} (${created} cartes liées)`);
  }

  if (totalNotFound.length) {
    console.log(`\n⚠️ ${totalNotFound.length} cartes non trouvées :`);
    for (const n of [...new Set(totalNotFound)]) console.log(`    ${n}`);
  }
  console.log(`\nDone! Article + ${BEST_OF.length} decks Hartford créés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
