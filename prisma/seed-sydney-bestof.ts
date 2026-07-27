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

// ── 40 Best of Sydney RQ 2026 ──────────────────────────────────────
const BEST_OF: BestOfEntry[] = [
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "EDG Rico1997",
    placement: "1st",
    domains: "Calm/Chaos",
    tier: "S",
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
    domains: "Body/Chaos",
    tier: "S",
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
    domains: "Chaos/Mind",
    tier: "S",
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
    domains: "Calm/Chaos",
    tier: "S",
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
    legend: "Leblanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "CTCG DZiden",
    placement: "7th",
    domains: "Mind/Order",
    tier: "S",
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
    legend: "Sett, The Boss",
    champion: "Sett, Brawler",
    player: "CTCG Collin K",
    placement: "9th",
    domains: "Body/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Pit Rookie
3x Sea Monkey
3x First Mate
2x Kinkou Initiate
3x Fiora, Victorious
2x Kinkou Monk
2x Sett, Brawler
2x Warmog's Armor
1x Shepherd's Heirloom
2x B.F. Sword
2x Punch First
1x Repulse
3x Sacrifice
3x Showstopper
3x Challenge
2x Hidden Blade
2x Call to Glory

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x Sunken Temple
1x The Candlelit Sanctum

== Side Deck ==
1x Repulse
2x Unyielding Spirit
3x Salvage
1x Stare Down
1x Akshan, Mischievous`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Audacious",
    player: "Micаh Cаtelаn",
    placement: "10th",
    domains: "Chaos/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
3x Inferna
2x Mischievous Marai
3x Traveling Merchant
1x Vi, Destructive
3x Ezreal, Prodigy
2x Fizz, Trickster
3x Noxus Hopeful
3x Arena Kingpin
3x Battering Ram
3x Rhasa the Sunderer
3x Seal of Discord
1x Spinning Axe
3x Stacked Deck
1x Bushwhack
1x Hard Bargain
2x Piercing Light
2x Rebuke

== Runes ==
7x Chaos Rune
5x Fury Rune

== Battlefield ==
1x Targon's Peak
1x Trifarian War Camp
1x Zaun Warrens

== Side Deck ==
1x Against the Odds
1x Switcheroo
1x Last Rites
2x Brynhir Thundersong
3x Ferrous Forerunner`,
  },
  {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Honed",
    player: "Minjuu",
    placement: "12th",
    domains: "Body/Calm",
    tier: "A",
    deckCode: `== Main Deck ==
1x Clockwork Keeper
3x Lonely Poro
2x Sea Monkey
1x Disarming Rake
2x First Mate
1x Akshan, Mischievous
2x Navori Scout
1x Rengar, Trophy Hunter
3x Ruin Runner
2x Trinity Force
3x Charm
3x Defy
2x En Garde
2x Punch First
1x Sabotage
2x Confront
3x Discipline
1x Meditation
1x Not So Fast
2x Thwonk!
1x Find Your Center

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Forge of the Fluft
1x Targon's Peak
1x Vilemaw's Lair

== Side Deck ==
1x Double Trouble
1x Emperor's Divide
2x Guardian Angel
1x Heart of Dark Ice
1x Janna, Savior
1x Irelia, Fervent
1x Rengar, Trophy Hunter`,
  },
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Victorious",
    player: "OrаngeOctober",
    placement: "17th",
    domains: "Body/Order",
    tier: "A",
    deckCode: `== Main Deck ==
2x Honest Broker
3x Pit Rookie
3x Unsung Hero
3x First Mate
2x Nilah, Joyful Ascetic
3x Sett, Brawler
3x Rift Herald
2x Elder Dragon
3x B.F. Sword
3x Punch First
3x Sacrifice
3x Challenge
3x Hidden Blade
3x Riposte

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x Sunken Temple
1x Treasure Hoard

== Side Deck ==
3x Sabotage
2x Unyielding Spirit
3x Salvage`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "аpexlyy",
    placement: "18th",
    domains: "Chaos/Mind",
    tier: "A",
    deckCode: `== Main Deck ==
2x Bewitching Spirit
1x Ezreal, Prodigy
2x Fizz, Trickster
2x Vex, Cheerless
2x Thousand-Tailed Watcher
3x Seal of Discord
1x The List
2x Pack of Wonders
3x Treasure Trove
1x Last Rites
2x Bellows Breath
2x Gust
3x Stacked Deck
3x Stupefy
1x Rebuke
2x Smoke Screen
1x Arcane Shift
1x Crescent Strike
2x Star-Crossed
2x Wages of Pain
1x Singularity

== Runes ==
7x Chaos Rune
5x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Sigil of the Storm

== Side Deck ==
1x Rebuke
2x Turn to Dust
2x Pickpocket
2x Vex, Apathetic
1x Mindsplitter`,
  },
  {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    player: "Rowаnno1",
    placement: "21st",
    domains: "Body/Order",
    tier: "A",
    deckCode: `== Main Deck ==
2x Herald of Scales
2x Gentle Gemdragon
2x Harnessed Dragon
3x Rift Herald
3x Elder Dragon
3x Forge of the Future
2x Vanguard Armory
3x Dazzling Aurora
2x Sacrifice
3x Blood Money
2x Challenge
2x Cull the Weak
2x Hidden Blade
2x Keeper's Verdict
3x Mobilize
3x Catalyst of Aeons

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Vilemaw's Lair

== Side Deck ==
2x Repulse
2x Sabotage
2x Unyielding Spirit
2x Salvage`,
  },
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismаticismism",
    placement: "23rd",
    domains: "Chaos/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
3x Evelynn, Entrancing
1x Teemo, Scout
2x Tideturner
3x Traveling Merchant
3x Grim Apothecary
3x Rengar, Pouncing
3x Sneaky Deckhand
3x Kai'Sa, Survivor
2x Vex, Apathetic
3x Ferrous Forerunner
2x Mindsplitter
2x Gust
3x Stacked Deck
1x Abandon
2x Against the Odds
1x Flash
1x Switcheroo
1x Star-Crossed

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Grove of the God-Willow
1x Startipped Peak
1x Windswept Hillock

== Side Deck ==
1x Gust
1x Abandon
1x Flash
1x Switcheroo
2x Star-Crossed
1x Vex, Apathetic
1x Mindsplitter`,
  },
  {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "Grommy1999",
    placement: "24th",
    domains: "Mind/Order",
    tier: "A",
    deckCode: `== Main Deck ==
1x Honest Broker
3x Plundering Poro
2x Card Sharp
2x Faithful Manufactor
1x Shen, Kinkou
1x Xin Zhao, Vigilant
1x Riptide Rex
3x Thousand-Tailed Watcher
3x Bellows Breath
3x Stupefy
3x Cull the Weak
3x Hidden Blade
1x Rally the Troops
1x Salvage
1x Consult the Past
1x Vengeance
2x Falling Comet
3x Imperial Decree
2x Grand Strategem
2x Singularity

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x The Arena's Greatest
1x Trifarian War Camp
1x Vilemaw's Lair

== Side Deck ==
2x Back to Back
3x Jayce, Man of Progress
3x Vanguard Armory`,
  },
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "yellow cаstor",
    placement: "25th",
    domains: "Calm/Order",
    tier: "A",
    deckCode: `== Main Deck ==
2x Lonely Poro
1x Fiora, Worthy
3x Seal of Unity
2x Doran's Shield
3x Eye of the Herald
2x Brutalizer
2x Sacred Shears
3x B.F. Sword
3x Defy
3x Cull the Weak
2x Deathgrip
3x Discipline
2x Hidden Blade
1x Not So Fast
1x Salvage
2x Guards!
1x Vengeance
3x Arise!

== Runes ==
5x Calm Rune
7x Order Rune

== Battlefield ==
1x Ornn's Forge
1x Trifarian War Camp
1x Vilemaw's Lair

== Side Deck ==
1x Forge of the Future
1x Not So Fast
2x Salvage
2x Soraka, Wanderer
2x Tasty Faefolk`,
  },
  {
    legend: "Kha'Zix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    player: "PPOONG",
    placement: "28th",
    domains: "Body/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
2x Evelynn, Entrancing
3x Gemhand Hunter
3x Irresistible Faefolk
2x Fizz, Trickster
3x Insightful Investigator
2x Kha'Zix, Mutating Horror
2x Imposing Challenger
2x Draven, Audacious
3x Sabotage
3x Stacked Deck
2x Bone Skewer
3x Isolate
2x Rebuke
2x Ride the Wind
2x Switcheroo
3x Void Assault

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Forbidding Waste
1x Monastery of Hirana
1x Vaults of Helia

== Side Deck ==
3x Gust
3x Unyielding Spirit
2x Vex, Apathetic`,
  },
  {
    legend: "Lillia, Bashful Bloom",
    champion: "Lillia, Fae Fawn",
    player: "Duncаn",
    placement: "33rd",
    domains: "Calm/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Ravenbloom Student
3x Scuttle Crab
3x Stellacorn Herder
3x Hwei, Brooding Painter
2x Thousand-Tailed Watcher
2x Forgotten Signpost
2x Honeyfruit
3x Defy
3x Stupefy
3x Discipline
3x Emperor's Divide
2x Lilting Lullaby
1x Not So Fast
2x Falling Comet
2x Singularity
2x Time Warp

== Runes ==
5x Calm Rune
7x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Dusk Rose Lab
1x Star Spring

== Side Deck ==
2x Charm
2x Disarming Rake
2x Rocket Barrage
2x Unchecked Power`,
  },
  {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "Bаttle Cаttle",
    placement: "35th",
    domains: "Body/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
3x Mindsplitter
1x Baron Nashor
3x Elder Dragon
3x Scryer's Bloom
2x Last Rites
3x Dazzling Aurora
3x Flurry of Blades
2x Gust
2x Sabotage
3x Stacked Deck
3x Challenge
3x Mobilize
2x Invert Timelines
3x Lunar Boon
3x Catalyst of Aeons

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm

== Side Deck ==
2x Unyielding Spirit
3x Abandon
3x Fading Memories`,
  },
  {
    legend: "Master Yi, Wuju Master",
    champion: "Master Yi, Tempered",
    player: "YoungNewNew",
    placement: "41st",
    domains: "Body/Calm",
    tier: "B",
    deckCode: `== Main Deck ==
3x Gemhand Hunter
2x Scuttle Crab
3x Wuju Apprentice
3x Herald of Spring
2x Master Yi, Tempered
2x Master Yi, Unstoppable
3x Zhonya's Hourglass
2x Trinity Force
3x Defy
3x Punch First
3x Discipline
3x Grim Resolve
2x Skyward Strike
3x Back Off
2x Concentrate

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Gardens of Becoming
1x Reckoner's Arena
1x Rockfall Path

== Side Deck ==
2x Sabotage
2x Unyielding Spirit
2x Not So Fast
2x Akshan, Mischievous`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Forge God",
    player: "SаintAuz",
    placement: "57th",
    domains: "Calm/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Lonely Poro
2x Trevor Snoozebottom
2x Blue Sentinel
2x Vilemaw
2x Seal of Focus
2x Seal of Insight
2x Poro Snax
3x Sprite Fountain
2x Hextech Anomaly
1x Sterak's Gage
1x Svellsongur
2x World Atlas
1x Shurelya's Requiem
2x Charm
2x Defy
3x Stupefy
3x Discipline
2x Not So Fast
2x Back Off

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Ornn's Forge
1x Power Nexus
1x Windswept Hillock

== Side Deck ==
1x Defy
1x Not So Fast
2x Disarming Rake
1x Sterak's Gage
1x Wind Wall
1x Blue Sentinel
1x Mystic Reversal`,
  },
  {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Unseen",
    player: "Fuzzyzolа",
    placement: "65th",
    domains: "Body/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
3x Inferna
3x Irresistible Faefolk
2x Pit Rookie
3x Grim Apothecary
3x Nidalee, Cat Form
3x Kai'Sa, Survivor
3x Noxus Hopeful
1x Rengar, Unseen
3x Rengar, Trophy Hunter
1x Brynhir Thundersong
2x Ferrous Forerunner
2x Seal of Strength
2x Fresh Beans
1x Punch First
2x Repulse
2x Challenge
3x Thrill of the Hunt

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Abandoned Hall
1x Emperor's Dais
1x Star Spring

== Side Deck ==
1x Punch First
3x Unyielding Spirit
2x Akshan, Mischievous
1x Thermo Beam
1x Brynhir Thundersong`,
  },
  {
    legend: "Kai'sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "SаvTheGod",
    placement: "69th",
    domains: "Fury/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
2x Plundering Poro
3x Ravenbloom Student
3x Watchful Sentry
2x Lecturing Yordle
3x Noxus Hopeful
3x Thousand-Tailed Watcher
2x Bellows Breath
3x Hextech Ray
2x Retreat
3x Stupefy
3x Falling Star
2x Smite
2x Smoke Screen
1x Void Seeker
2x Progress Day
1x Singularity
2x Time Warp

== Runes ==
7x Fury Rune
5x Mind Rune

== Battlefield ==
1x Vilemaw's Lair
1x Void Gate
1x Zaun Warrens

== Side Deck ==
2x Turn to Dust
2x Thermo Beam
2x Brynhir Thundersong
2x Ferrous Forerunner`,
  },
  {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Dockside Butcher",
    player: "XDPOW",
    placement: "74th",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
2x Evelynn, Entrancing
3x Overzealous Fan
3x Treasure Hunter
3x Bewitching Spirit
2x Kai'Sa, Survivor
3x Noxus Hopeful
1x Brynhir Thundersong
2x Ferrous Forerunner
3x Mindsplitter
1x Baron Nashor
2x Gust
3x Stacked Deck
1x Abandon
2x Bone Skewer
1x Hard Bargain
2x Switcheroo
3x Star-Crossed
2x Death from Below

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Amateur Recital
1x Forbidding Waste
1x Ripper's Bay

== Side Deck ==
2x Detonate
1x Existential Dread
1x Falling Star
1x Rebuke
1x Death from Below
1x Thermo Beam
1x Downwell`,
  },
  {
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Peacekeeper",
    player: "sirieous",
    placement: "79th",
    domains: "Fury/Order",
    tier: "C",
    deckCode: `== Main Deck ==
2x Gem Jammer
2x Inferna
2x Pouty Poro
2x Unsung Hero
3x Kai'Sa, Survivor
3x Noxus Hopeful
2x Rengar, Unseen
2x Darius, Trifarian
2x Brynhir Thundersong
2x Ferrous Forerunner
3x Hextech Gauntlets
2x B.F. Sword
2x Cleave
1x Sacrifice
1x Against the Odds
1x Deathgrip
2x Falling Star
2x Hidden Blade
2x Tactical Retreat
1x Upstage Comedy

== Runes ==
7x Fury Rune
5x Order Rune

== Battlefield ==
1x Rockfall Path
1x Sunken Temple
1x Zaun Warrens

== Side Deck ==
2x Salvage
2x Sharkling
1x Vi, Hotheaded
3x Ashe, Focused`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    player: "Htpiper151",
    placement: "86th",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
2x Inferna
3x Legion Rearguard
3x Traveling Merchant
2x Pyke, Dockside Butcher
3x Undying Legion
3x Nocturne, Horrifying
3x Noxus Hopeful
1x Dunebreaker
3x Seal of Rage
3x Scryer's Bloom
2x Long Sword
2x Blighted Battleaxe
3x Cleave
2x Gust
3x Stacked Deck
1x Super Mega Death Rocket!

== Runes ==
4x Chaos Rune
8x Fury Rune

== Battlefield ==
1x The Arena's Greatest
1x The Candlelit Sanctum
1x Zaun Warrens

== Side Deck ==
3x Factory Recall
1x Gust
1x Falling Star
3x Sneaky Deckhand`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "Kevin Pleаse",
    placement: "96th",
    domains: "Body/Calm",
    tier: "C",
    deckCode: `== Main Deck ==
3x Lonely Poro
2x Scuttle Crab
2x First Mate
2x Kinkou Initiate
3x Lucian, Merciless
2x Nidalee, Cat Form
2x Irelia, Fervent
1x Rengar, Trophy Hunter
3x Warmog's Armor
3x Brutalizer
2x Guardian Angel
2x Defy
2x Challenge
3x Counter Strike
1x Desert's Call
3x Discipline
2x Not So Fast
1x Back Off

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Monastery of Hirana
1x Ornn's Forge
1x Sunken Temple

== Side Deck ==
2x Sabotage
1x Unyielding Spirit
2x Akshan, Mischievous
3x Ruin Runner`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Inquisitive",
    player: "Kаwаii Tsukiko",
    placement: "127th",
    domains: "Calm/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Ravenbloom Student
1x Allay, Eager Admirer
2x Eager Apprentice
2x Blue Sentinel
3x Sona, Harmonious
2x Blitzcrank, Impassive
3x Thousand-Tailed Watcher
2x Vilemaw
2x Zhonya's Hourglass
2x Defy
2x Desert's Call
3x Discipline
2x Emperor's Divide
2x Feral Strength
3x Meditation
1x Not So Fast
2x Thwonk!
2x Back Off

== Runes ==
7x Calm Rune
5x Mind Rune

== Battlefield ==
1x Amateur Recital
1x Grove of the God-Willow
1x Startipped Peak

== Side Deck ==
1x Defy
1x Not So Fast
1x Allay, Eager Admirer
3x Disarming Rake
1x Ahri, Alluring
1x Singularity`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Determined",
    player: "Elle XV",
    placement: "140th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Mutated Mouser
2x Scuttle Crab
2x Soaring Scout
2x Allay, Eager Admirer
2x Nami, Headstrong
2x Sona, Harmonious
2x Blitzcrank, Impassive
1x Irelia, Fervent
3x Vi, Peacekeeper
1x Tianna Crownguard
1x Vilemaw
1x Whiteflame Protector
1x Guardian Angel
1x Zhonya's Hourglass
2x Charm
2x Defy
2x Discipline
1x Feral Strength
1x Not So Fast
2x Thwonk!
2x Back Off
1x Wind Wall
2x Zenith Blade
1x Divine Judgment

== Runes ==
6x Calm Rune
6x Order Rune

== Battlefield ==
1x Forbidding Waste
1x Grove of the God-Willow
1x Rockfall Path`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "Dimmers",
    placement: "158th",
    domains: "Fury/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Daring Poro
2x Honest Broker
3x Inferna
1x Soaring Scout
2x Galio, Indefatigable
2x Shen, Kinkou
3x Kai'Sa, Survivor
3x Noxus Hopeful
1x Vi, Hotheaded
3x Ferrous Forerunner
2x Atakhan
2x Blood Rush
2x Cull the Weak
3x Deathgrip
1x Hidden Blade
2x Salvage
2x Shadow's Call
1x Tactical Retreat
2x Right of Conquest

== Runes ==
6x Fury Rune
6x Order Rune

== Battlefield ==
1x Hallowed Tomb
1x Seat of Power
1x Sunken Temple

== Side Deck ==
1x Blood Rush
1x Cull the Weak
2x Hidden Blade
1x Salvage
1x Soaring Scout
1x Vi, Hotheaded
1x Thermo Beam`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "Croque Monsieur",
    placement: "162nd",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
3x Lonely Poro
1x Disarming Rake
1x First Mate
3x Master Yi, Tempered
3x Irelia, Fervent
2x Guardian Angel
2x Honeyfruit
1x Sterak's Gage
3x Defy
3x En Garde
3x Punch First
3x Challenge
3x Desert's Call
3x Discipline
3x Grim Resolve
1x Not So Fast
1x Back Off

== Runes ==
7x Body Rune
5x Calm Rune

== Battlefield ==
1x Abandoned Hall
1x Monastery of Hirana
1x Sunken Temple

== Side Deck ==
2x Repulse
1x Sabotage
2x Unyielding Spirit
1x Not So Fast
1x Akshan, Mischievous
1x Dragon's Rage`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Windrider",
    player: "Sussy",
    placement: "163rd",
    domains: "Calm/Chaos",
    tier: "D",
    deckCode: `== Main Deck ==
2x Scuttle Crab
3x Tideturner
3x Treasure Hunter
2x Sona, Harmonious
3x Stellacorn Herder
2x Vex, Apathetic
2x Draven, Audacious
1x Yasuo, Remorseful
2x Sterak's Gage
3x Defy
2x Existential Dread
2x Gust
1x Abandon
2x Discipline
2x Flash
3x Ride the Wind
2x Back Off
2x Last Breath

== Runes ==
7x Calm Rune
5x Chaos Rune

== Battlefield ==
1x Back-Alley Bar
1x Treasure Hoard
1x Zaun Warrens

== Side Deck ==
2x Not So Fast
2x Star-Crossed
2x Adaptatron
1x Downwell
1x Vilemaw`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "Trаsterisk",
    placement: "198th",
    domains: "Fury/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Honest Broker
3x Void Hatchling
3x Vanguard Captain
2x Albus Ferros
3x Spectral Matron
3x Karma, Channeler
3x Undertitan
3x Altar of Memories
3x Baited Hook
2x Cull the Weak
3x Hidden Blade
3x Rally the Troops
3x Void Rush
2x Call to Glory

== Runes ==
6x Fury Rune
6x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x The Candlelit Sanctum
1x Trifarian War Camp`,
  },
  {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Meticulous Killer",
    player: "Mord",
    placement: "220th",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Plundering Poro
2x Ravenbloom Student
3x Watchful Sentry
2x Jhin, Meticulous Killer
1x Revna the Lorekeeper
2x Hextech Anomaly
3x Downstage Dramatics
1x Frigid Touch
2x Consult the Past
3x Curtain Call
3x Deadly Flourish
3x Disintegrate
2x Square Up
3x Sprite Burst
2x Progress Day
2x Singularity
1x Unchecked Power
1x Time Warp

== Runes ==
4x Fury Rune
8x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Void Gate

== Side Deck ==
1x Frigid Touch
1x Piercing Light
3x Smite
3x Rocket Barrage`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    player: "Dois",
    placement: "229th",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Plundering Poro
3x Jayce, Man of Progress
2x Sprite Queen
2x Thousand-Tailed Watcher
3x Forge of the Future
3x Sprite Fountain
2x Shard of Undoing
3x Vanguard Armory
2x Bellows Breath
3x Cull the Weak
3x Hidden Blade
2x Wages of Pain
2x Imperial Decree
3x Sprite Burst
2x Singularity
1x Time Warp

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x Black Flame Altar
1x Dusk Rose Lab
1x Rockfall Path

== Side Deck ==
3x Salvage
1x LeBlanc, Everywhere at Once
2x Drag Under
1x Unchecked Power
1x The Ruination`,
  },
  {
    legend: "Ivern, Green Father",
    champion: "Ivern, Friend to All",
    player: "Stunningprаm",
    placement: "270th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Carrion Dredger
2x Stalwart Poro
2x Trusty Ramhound
2x Allay, Eager Admirer
2x Frisky Hunter
2x Stalking Wolf
3x Ultrasoft Poro
2x Alpha Wildclaw
1x Vilemaw
1x Daisy!
2x Defy
3x Friendship
2x Discipline
2x Hidden Blade
3x Not So Fast
3x Shadow's Call
2x Tactical Retreat
2x Back Off

== Runes ==
7x Calm Rune
5x Order Rune

== Battlefield ==
1x Rockfall Path
1x Vaults of Helia
1x Vilemaw's Lair

== Side Deck ==
2x Cull the Weak
2x Salvage
2x Ivern, Friend to All`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "Jаzzаlаw",
    placement: "372nd",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Forecaster
2x Gem Jammer
2x Plundering Poro
3x Bubble Bot
2x Rumble, Hotheaded
2x Darius, Trifarian
2x Rumble, Scrapper
2x Brynhir Thundersong
3x Ferrous Forerunner
2x Thousand-Tailed Watcher
1x Breakneck Mech
1x Cloth Armor
1x Long Sword
1x Cleave
1x Danger Zone
1x Retreat
3x Stupefy
2x Falling Star
1x Smoke Screen
2x Consult the Past
2x Production Surge

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Minefield
1x Treasure Hoard
1x Trifarian War Camp

== Side Deck ==
1x Danger Zone
1x Smite
1x Smoke Screen
3x Turn to Dust
2x Singularity`,
  },
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "PаRoAh",
    placement: "411th",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
2x Gem Jammer
1x Veteran Poro
3x First Mate
2x Kinkou Initiate
2x Lucian, Merciless
3x Kai'Sa, Survivor
1x Red Brambleback
1x Darius, Trifarian
1x Brynhir Thundersong
2x Ferrous Forerunner
2x Doran's Blade
2x Boneshiver
2x Skyfall of Areion
3x Trinity Force
2x Punch First
2x Repulse
3x Challenge
1x Confront
1x Grim Resolve
3x Relentless Pursuit

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Forge of the Fluft
1x Ornn's Forge
1x Sunken Temple`,
  },
];

// ── Seeding function ────────────────────────────────────────────────
async function main() {
  console.log("Creating Sydney Best of article + decks...");

  // Build article blocks
  const blocks: Record<string, unknown>[] = [];

  blocks.push({
    type: "text",
    id: "intro",
    content: `## Best of Sydney — Regional Qualifier 2026

Le **Regional Qualifier de Sydney** s'est tenu le **16 mai 2026** avec **1405 joueurs**. Voici le meilleur deck pour chacune des **40 legendes** jouees lors du tournoi.

Pour chaque legende, nous avons selectionne la liste qui a obtenu le meilleur classement. Les decks sont classes par tier selon notre analyse meta post-Sydney.

---`,
  });

  const tierLabels: Record<string, string> = {
    S: "Tier 1 — Gagnants de tournoi",
    A: "Tier 2 — Solides, top cut reguliers",
    B: "Tier 3 — Competitifs avec pilote expert",
    C: "Tier 4 — Top cut rare",
    D: "Tier 5 — En dessous du meta",
  };

  let lastTier = "";

  for (let i = 0; i < BEST_OF.length; i++) {
    const d = BEST_OF[i];

    if (d.tier !== lastTier) {
      blocks.push({
        type: "separator",
        id: `sep-${d.tier}`,
      });
      blocks.push({
        type: "text",
        id: `tier-${d.tier}`,
        content: `## ${tierLabels[d.tier] ?? d.tier}`,
      });
      lastTier = d.tier;
    }

    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      championName: d.champion,
      deckName: `${d.legend} — Best of Sydney`,
      legendName: d.legend,
      playerName: d.player,
      context: `${d.placement} — RQ Sydney 2026 (${d.domains})`,
    });
  }

  // Create article
  const article = await prisma.article.create({
    data: {
      title: "Best of Sydney — Toutes les legendes",
      slug: "best-of-sydney-rq-2026",
      coverImage: "/img/articles/sydney-2.webp",
      excerpt:
        "Les meilleures decklists pour chaque legende au Regional Qualifier de Sydney 2026 (1405 joueurs).",
      category: "tournoi",
      tags: ["sydney", "rq", "best-of", "meta", "unleashed", "2026"],
      blocks: blocks as any,
      published: true,
      featured: true,
      publishedAt: new Date("2026-05-23"),
      tournamentName: "Regional Qualifier Sydney 2026",
      tournamentDate: new Date("2026-05-16"),
      tournamentLocation: "Sydney, Australie",
      tournamentPlayerCount: 1405,
    },
  });

  console.log(`Article created: /articles/${article.slug}`);

  // Create individual Deck entries (featured = best of)
  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: {
        type: "Legend",
        name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" },
      },
    });

    const slug = `best-of-sydney-${d.legend
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/g, "")}`;

    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      console.log(`  Deck already exists: ${slug}, skipping`);
      continue;
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} · Best of Sydney`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au RQ Sydney 2026 : ${d.placement} par ${d.player}. ${d.domains}.`,
        format: "constructed",
        tags: ["sydney", "rq", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: "RQ Sydney 2026",
        tournamentTier: d.tier,
        placement: d.placement,
        playerName: d.player,
      },
    });

    // Légende + champion (le deckCode n'a pas de section legend/champion)
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
    }

    // Parse deck code and create DeckCard entries
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
          data: {
            deckId: deck.id,
            cardId: card.id,
            quantity: entry.quantity,
            section: entry.section,
          },
        });
        created++;
      } else {
        console.log(`    Card not found: "${entry.name}"`);
      }
    }

    console.log(`  Deck created: ${slug} (${created} cards linked)`);
  }

  console.log("\nDone! Article + 40 decks created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
