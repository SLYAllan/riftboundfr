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

// ── Best of Vancouver RQ (39 legendes) ──────────────────────────────
// Source : article officiel "Vancouver's Top Decks" (riftbound.leagueoflegends.com)
const BEST_OF: BestOfEntry[] = [
  {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "Alanzq",
    placement: "1st",
    domains: "Chaos/Mind",
    tier: "S",
    deckCode: `== Main Deck ==
2x Acceptable Losses
2x Fizz, Trickster
1x Flash
3x Gust
2x Hard Bargain
3x Hwei, Brooding Painter
2x Moonfall
3x Ravenbloom Student
3x Ride the Wind
1x Smoke Screen
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x Tideturner
2x Traveling Merchant
1x Turn to Dust
2x Vex, Apathetic
1x Vex, Cheerless

== Runes ==
6x Chaos Rune
6x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Ravenbloom Conservatory
1x Targon's Peak

== Side Deck ==
2x Baron Nashor
1x Moonfall
2x Singularity
1x Star-Crossed
1x Turn to Dust
1x Vex, Cheerless`,
  },
  {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Trophy Hunter",
    player: "samdsherman",
    placement: "2nd",
    domains: "Body/Fury",
    tier: "S",
    deckCode: `== Main Deck ==
2x Challenge
2x Darius, Trifarian
3x Determined Sentry
3x Grim Apothecary
3x Inferna
3x Irresistible Faefolk
3x Kai'Sa, Survivor
3x Kinkou Initiate
3x Nidalee, Cat Form
3x Pit Rookie
3x Punch First
3x Pyke, Dockside Butcher
2x Sabotage
3x Thrill of the Hunt

== Runes ==
8x Body Rune
4x Fury Rune

== Battlefield ==
1x Emperor's Dais
1x Star Spring
1x The Arena's Greatest

== Side Deck ==
3x Akshan, Mischievous
2x Brynhir Thundersong
1x Challenge
1x Sabotage
1x Unyielding Spirit`,
  },
  {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Tempered",
    player: "housesarebig",
    placement: "3rd",
    domains: "Body/Calm",
    tier: "S",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
1x Challenge
3x Charm
3x Defy
3x Discipline
2x En Garde
3x First Mate
1x Grim Resolve
3x Lonely Poro
3x Pit Rookie
1x Primal Strength
3x Punch First
3x Rengar, Trophy Hunter
2x Ruin Runner
1x Sabotage
3x Scuttle Crab
2x Zhonya's Hourglass

== Runes ==
7x Body Rune
5x Calm Rune

== Battlefield ==
1x Emperor's Dais
1x Seat of Power
1x Star Spring

== Side Deck ==
1x Alpha Strike
3x Disarming Rake
1x Disposal Order
2x Sabotage
1x Unyielding Spirit`,
  },
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "Rocklho",
    placement: "5th",
    domains: "Calm/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Arise!
3x B.F. Sword
3x Brutalizer
1x Charm
1x Cull the Weak
3x Defy
3x Discipline
3x Doran's Shield
1x En Garde
3x Eye of the Herald
2x Guards!
3x Hidden Blade
2x Sacrifice
2x Salvage
1x Shadow's Call
3x Soul Sword
2x Vi, Peacekeeper

== Runes ==
7x Calm Rune
5x Order Rune

== Battlefield ==
1x Hall of Legends
1x The Arena's Greatest
1x Trifarian War Camp

== Side Deck ==
2x Ashe, Focused
1x Cull the Weak
1x Deathgrip
1x Disarming Rake
2x Guardian Angel
1x Vi, Peacekeeper`,
  },
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "Arito",
    placement: "6th",
    domains: "Calm/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
1x Adaptatron
3x Boots of Swiftness
2x Charm
3x Defiant Dance
3x Defy
3x Discipline
1x Edge of Night
2x En Garde
1x Flash
2x Guardian Angel
1x Hard Bargain
1x Mindsplitter
1x Pyke, Returned
1x Rebuke
2x Ride the Wind
3x Scuttle Crab
2x Star-Crossed
3x Stellacorn Herder
3x Tideturner
1x Vex, Apathetic

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Sunken Temple
1x Targon's Peak

== Side Deck ==
2x Adaptatron
2x Gust
1x Heart of Dark Ice
1x Not So Fast
1x Vex, Apathetic
1x Vex, Cheerless`,
  },
  {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "Swagyolo420yea",
    placement: "7th",
    domains: "Body/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
1x Fading Memories
3x Flurry of Blades
3x Gust
2x Last Rites
3x Lunar Boon
1x Mindsplitter
3x Mobilize
1x Pack of Wonders
3x Sabotage
3x Scryer's Bloom
3x Stacked Deck
1x The Harrowing
3x Treasure Trove

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm

== Side Deck ==
2x Akshan, Mischievous
1x Annie, Stubborn
2x Challenge
1x Heedless Resurrection
1x Mindsplitter
1x Pack of Wonders`,
  },
  {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "Ddragon999",
    placement: "9th",
    domains: "Mind/Order",
    tier: "A",
    deckCode: `== Main Deck ==
2x B.F. Sword
2x Bellows Breath
3x Cull the Weak
3x Deadly Flourish
3x Hidden Blade
3x Honest Broker
3x Imperial Decree
3x Plundering Poro
3x Safety Inspector
2x Shadow's Call
2x Sprite Burst
3x Sprite Fountain
3x Stupefy
1x Thousand-Tailed Watcher
3x Xin Zhao, Vigilant

== Runes ==
5x Mind Rune
7x Order Rune

== Battlefield ==
1x Forbidding Waste
1x Rockfall Path
1x The Arena's Greatest

== Side Deck ==
1x B.F. Sword
1x Bellows Breath
2x Chakram Dancer
3x Salvage
1x Thousand-Tailed Watcher`,
  },
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismaticismism",
    placement: "10th",
    domains: "Chaos/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
1x Abandon
2x Cleave
3x Ferrous Forerunner
3x Flash
1x Grim Apothecary
1x Gust
1x Hard Bargain
3x Inferna
3x Kai'Sa, Survivor
1x Kha'Zix, Mutating Horror
2x Long Sword
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
1x Falling Star
1x Gust
1x Star-Crossed
1x Switcheroo
1x Thermo Beam`,
  },
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Worthy",
    player: "Ricemaster",
    placement: "12th",
    domains: "Body/Order",
    tier: "B",
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
1x Trifarian War Camp

== Side Deck ==
2x Ashe, Focused
2x Harnessed Dragon
1x Repulse
2x Sabotage
1x Salvage`,
  },
  {
    legend: "Kai'Sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "Sinzari",
    placement: "15th",
    domains: "Fury/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
1x Bellows Breath
1x Brynhir Thundersong
2x Eclipse
3x Falling Star
3x Ferrous Forerunner
3x Hextech Ray
2x Inferna
2x Lecturing Yordle
1x Long Sword
2x Noxus Hopeful
3x Ravenbloom Student
2x Singularity
1x Smite
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
1x Star Spring
1x The Arena's Greatest
1x Void Gate

== Side Deck ==
1x Brynhir Thundersong
1x Progress Day
1x Rengar, Pouncing
1x Smite
1x Thermo Beam
2x Turn to Dust
1x Unchecked Power`,
  },
  {
    legend: "LeBlanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "Riuzake",
    placement: "21st",
    domains: "Mind/Order",
    tier: "B",
    deckCode: `== Main Deck ==
1x Atakhan
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
1x Thousand-Tailed Watcher
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
3x Ashe, Focused
1x Atakhan
1x LeBlanc, Everywhere at Once
2x Thousand-Tailed Watcher
1x Turn to Dust`,
  },
  {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Dockside Butcher",
    player: "RoyY",
    placement: "23rd",
    domains: "Chaos/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
1x Baron Nashor
1x Beast Below
3x Bewitching Spirit
1x Cleave
1x Darius, Trifarian
1x Death from Below
1x Ezreal, Prodigy
3x Falling Star
2x Fizz, Trickster
1x Gust
1x Kai'Sa, Survivor
1x Mindsplitter
3x Noxus Hopeful
2x Pack of Wonders
3x Stacked Deck
2x Star-Crossed
2x Tideturner
3x Treasure Hunter
3x Treasure Trove
2x Vex, Apathetic
1x Void Seeker
1x Windsinger

== Runes ==
5x Chaos Rune
7x Fury Rune

== Battlefield ==
1x Forbidding Waste
1x Ripper's Bay
1x Void Gate

== Side Deck ==
1x Brynhir Thundersong
2x Downwell
1x Fading Memories
2x Gust
1x Star-Crossed
1x Switcheroo`,
  },
  {
    legend: "Kha'Zix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    player: "CTCG Zrob",
    placement: "26th",
    domains: "Body/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
2x Demacian Diplomat
3x Fizz, Trickster
3x Grim Resolve
1x Hard Bargain
3x Irresistible Faefolk
3x Lucian, Merciless
2x Punch First
1x Rebuke
3x Rengar, Trophy Hunter
2x Sabotage
3x Stacked Deck
3x Star-Crossed
3x Traveling Merchant
2x Vex, Apathetic
3x Void Assault

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Forbidding Waste
1x The Arena's Greatest
1x Zaun Warrens

== Side Deck ==
1x Akshan, Mischievous
3x Gust
2x Kha'Zix, Mutating Horror
1x Last Rites
1x Sabotage`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "slabshark2025",
    placement: "27th",
    domains: "Chaos/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
1x Annie, Stubborn
3x Bellows Breath
3x Bewitching Spirit
1x Eclipse
3x Fizz, Trickster
3x Gust
1x Last Rites
3x Pack of Wonders
1x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x The List
1x Thousand-Tailed Watcher
3x Treasure Trove
1x Turn to Dust
1x Vex, Apathetic
1x Whirlwind
2x Windsinger

== Runes ==
6x Chaos Rune
6x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Sigil of the Storm

== Side Deck ==
1x Aspiring Engineer
1x Downwell
1x Star-Crossed
1x Thousand-Tailed Watcher
1x Turn to Dust
1x Unchecked Power
2x Vex, Apathetic`,
  },
  {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    player: "TSS NoVeggies",
    placement: "35th",
    domains: "Body/Order",
    tier: "B",
    deckCode: `== Main Deck ==
3x Blood Money
3x Catalyst of Aeons
3x Confront
2x Cull the Weak
3x Dazzling Aurora
3x Elder Dragon
3x Flurry of Blades
2x Forge of the Future
3x Harnessed Dragon
3x Mobilize
1x Rift Herald
2x Sabotage
3x Sacrifice
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
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "matcharuzu",
    placement: "36th",
    domains: "Body/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
1x Abandon
1x Baron Nashor
1x Bullet Time
3x Catalyst of Aeons
1x Challenge
3x Dazzling Aurora
3x Elder Dragon
1x Fading Memories
2x Flurry of Blades
3x Gust
1x Invert Timelines
2x Last Rites
2x Lunar Boon
1x Mindsplitter
3x Mobilize
2x Ride the Wind
2x Sabotage
3x Scryer's Bloom
3x Stacked Deck
1x The Harrowing

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Rockfall Path
1x Sigil of the Storm

== Side Deck ==
1x Akshan, Mischievous
1x Challenge
1x Fading Memories
1x Flurry of Blades
1x Hard Bargain
1x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "POG CHUNGUS",
    placement: "44th",
    domains: "Chaos/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
2x Cleave
3x Darius, Trifarian
1x Evelynn, Entrancing
2x Falling Star
2x Ferrous Forerunner
2x Gust
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Overzealous Fan
3x Pouty Poro
1x Rebuke
2x Rek'Sai, Breacher
3x Spinning Axe
2x Stacked Deck
2x Star-Crossed
3x Tideturner
2x Vex, Apathetic

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Star Spring
1x The Arena's Greatest
1x Zaun Warrens

== Side Deck ==
1x Baron Nashor
2x Brynhir Thundersong
1x Gust
1x Hard Bargain
1x Star-Crossed
2x Thermo Beam`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "Zaboomafoo",
    placement: "51st",
    domains: "Fury/Order",
    tier: "C",
    deckCode: `== Main Deck ==
1x Blood Rush
1x Carrion Dredger
3x Cleave
3x Cull the Weak
3x Faithful Manufactor
2x Falling Star
2x Ferrous Forerunner
2x Hidden Blade
3x Honest Broker
2x Inferna
1x Long Sword
3x Noxus Hopeful
1x Salvage
3x Soaring Scout
3x Undertitan
1x Vi, Peacekeeper
2x Void Hatchling
3x Void Rush

== Runes ==
7x Fury Rune
5x Order Rune

== Battlefield ==
1x The Arena's Greatest
1x The Candlelit Sanctum
1x Trifarian War Camp

== Side Deck ==
1x Blood Rush
1x Falling Star
1x Ferrous Forerunner
1x Hidden Blade
1x Imperial Decree
1x Piercing Light
1x Salvage
1x Thermo Beam`,
  },
  {
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Crownguard",
    player: "tingfw",
    placement: "60th",
    domains: "Mind/Order",
    tier: "C",
    deckCode: `== Main Deck ==
2x Cull the Weak
2x Hidden Blade
3x Honest Broker
3x Jhin, Meticulous Killer
3x Plundering Poro
3x Progress Day
2x Seal of Insight
2x Singularity
2x Soaring Scout
3x Sprite Burst
2x Sprite Fountain
3x Stupefy
1x The Ruination
1x Thousand-Tailed Watcher
2x Time Warp
1x Unchecked Power
3x Wages of Pain
1x Zaun Punk

== Runes ==
7x Mind Rune
5x Order Rune

== Battlefield ==
1x Rockfall Path
1x Treasure Hoard
1x Vilemaw's Lair

== Side Deck ==
2x Ashe, Focused
1x Singularity
1x The Ruination
1x Turn to Dust
1x Unchecked Power
2x Zaun Punk`,
  },
  {
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Strategist",
    player: "lunasky",
    placement: "64th",
    domains: "Chaos/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Consult the Past
2x Eclipse
3x Evelynn, Entrancing
1x Fizz, Trickster
3x Nocturne, Horrifying
3x Ravenbloom Student
1x Singularity
3x Sprite Call
3x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x Switcheroo
2x Teemo, Strategist
3x Tideturner
1x Wages of Pain

== Runes ==
6x Chaos Rune
6x Mind Rune

== Battlefield ==
1x Bandle Tree
1x Startipped Peak
1x The Arena's Greatest

== Side Deck ==
2x Gust
2x Turn to Dust
2x Unchecked Power
2x Vex, Apathetic`,
  },
  {
    legend: "Vex, Gloomist",
    champion: "Vex, Apathetic",
    player: "Tex",
    placement: "68th",
    domains: "Calm/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
1x Abandon
1x Allay, Eager Admirer
3x Back Off
2x Boots of Swiftness
2x Charm
3x Defy
3x Discipline
2x Emperor's Divide
3x Evelynn, Entrancing
1x Existential Dread
2x Gust
2x Kha'Zix, Mutating Horror
3x Mutated Mouser
3x Overzealous Fan
1x Pyke, Returned
1x Rebuke
3x Sona, Harmonious
1x Star-Crossed
1x Switcheroo
1x Vex, Cheerless

== Runes ==
7x Calm Rune
5x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Star Spring
1x Startipped Peak

== Side Deck ==
1x Abandon
3x Disarming Rake
1x Kha'Zix, Mutating Horror
2x Star-Crossed
1x Vex, Cheerless`,
  },
  {
    legend: "Lillia, Bashful Bloom",
    champion: "Lillia, Fae Fawn",
    player: "TSS GhaelWinds",
    placement: "77th",
    domains: "Calm/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
1x Charm
3x Defy
1x Disarming Rake
3x Discipline
3x En Garde
2x Heart of Dark Ice
1x Janna, Savior
3x Mask of Foresight
3x Ravenbloom Student
2x Riptide Rex
2x Smoke and Mirrors
2x Smoke Screen
3x Sprite Burst
3x Sprite Fountain
2x Stalwart Poro
3x Stupefy
1x Thousand-Tailed Watcher
1x Unchecked Power

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
1x Riptide Rex
1x Smoke and Mirrors
1x Sprite Queen
1x Stalwart Poro`,
  },
  {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    player: "CTCG Collin K",
    placement: "79th",
    domains: "Body/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Arena Bar
3x Call to Glory
2x Challenge
2x Cithria of Cloudfield
1x Fae Dragon
3x Fiora, Victorious
3x First Mate
1x Hidden Blade
3x Irresistible Faefolk
1x Kinkou Monk
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
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Peacekeeper",
    player: "Violetexe",
    placement: "88th",
    domains: "Fury/Order",
    tier: "C",
    deckCode: `== Main Deck ==
1x Ashe, Focused
2x Cleave
3x Daring Poro
3x Deathgrip
3x Gem Jammer
3x Hextech Gauntlets
3x Hidden Blade
3x Honest Broker
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Pyke, Dockside Butcher
3x Rek'Sai, Breacher
2x Rengar, Pouncing
1x Salvage
1x Shen, Kinkou
2x Vault Breaker

== Runes ==
7x Fury Rune
5x Order Rune

== Battlefield ==
1x Star Spring
1x The Arena's Greatest
1x Windswept Hillock

== Side Deck ==
2x Ashe, Focused
2x Falling Star
2x Salvage
2x Smite`,
  },
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "Blaedsounds",
    placement: "120th",
    domains: "Body/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
1x Akshan, Mischievous
3x Blighted Battleaxe
1x Cleave
3x Doran's Blade
2x First Mate
3x Gem Jammer
1x Grim Resolve
1x Inferna
3x Irresistible Faefolk
3x Kai'Sa, Survivor
2x Kinkou Initiate
3x Long Sword
2x Noxus Hopeful
2x Poppy, Paragon
2x Punch First
3x Relentless Pursuit
1x Repulse
2x Sabotage
1x Trinity Force

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Forge of the Fluft
1x Sunken Temple
1x Zaun Warrens

== Side Deck ==
2x Akshan, Mischievous
2x Disposal Order
2x Ferrous Forerunner
1x Ruin Runner
1x Unyielding Spirit`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "Dinobravo",
    placement: "127th",
    domains: "Fury/Order",
    tier: "C",
    deckCode: `== Main Deck ==
2x Ashe, Focused
2x B.F. Sword
3x Cleave
1x Cull the Weak
1x Darius, Trifarian
2x Deathgrip
2x Falling Star
2x Ferrous Forerunner
3x Hidden Blade
3x Honest Broker
3x Inferna
1x Long Sword
1x Noxian Guillotine
3x Noxus Hopeful
2x Pyke, Dockside Butcher
2x Rally the Troops
2x Rek'Sai, Breacher
2x Undying Legion
2x Unsung Hero

== Runes ==
7x Fury Rune
5x Order Rune

== Battlefield ==
1x Seat of Power
1x Sunken Temple
1x The Arena's Greatest

== Side Deck ==
1x Ashe, Focused
2x Cull the Weak
1x Noxian Guillotine
2x Salvage
2x Vi, Peacekeeper`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Remorseful",
    player: "Kiiro",
    placement: "148th",
    domains: "Calm/Chaos",
    tier: "D",
    deckCode: `== Main Deck ==
1x Abandon
3x Charm
3x Defy
3x Discipline
2x En Garde
2x Fizz, Trickster
2x Gust
2x Heart of Dark Ice
3x Kha'Zix, Mutating Horror
3x Mask of Foresight
1x Ride the Wind
3x Scuttle Crab
2x Star-Crossed
2x Stellacorn Herder
3x Treasure Hunter
2x Vex, Apathetic
2x Zhonya's Hourglass

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Star Spring
1x Targon's Peak
1x Veiled Temple

== Side Deck ==
1x Abandon
2x Adaptatron
2x Flash
2x Irelia, Fervent
1x Isolate`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "TerryTheCactus",
    placement: "153rd",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
1x Back Off
2x Charm
3x Defy
3x Discipline
1x Doran's Blade
1x Emperor's Divide
2x En Garde
2x First Mate
3x Irelia, Fervent
3x Lonely Poro
2x Nidalee, Cat Form
2x Pit Rookie
3x Punch First
2x Rengar, Trophy Hunter
1x Sabotage
3x Scuttle Crab
3x Wizened Elder
2x Zhonya's Hourglass

== Runes ==
7x Body Rune
5x Calm Rune

== Battlefield ==
1x Abandoned Hall
1x Monastery of Hirana
1x Star Spring

== Side Deck ==
2x Disarming Rake
1x Not So Fast
2x Sabotage
1x Sett, Brawler
2x Unyielding Spirit`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    player: "YouKnowWho",
    placement: "162nd",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Ashe, Focused
1x Bellows Breath
3x Card Sharp
2x Consult the Past
2x Deathgrip
3x Ekko, Recurrent
3x Hidden Blade
3x Honest Broker
3x Hostile Takeover
1x Pickpocket
3x Plundering Poro
1x Portal Rescue
2x Sacrifice
1x Salvage
1x Sandshifter
2x The Zero Drive
2x Thousand-Tailed Watcher
1x Time Warp
2x Wages of Pain
1x Zaun Punk

== Runes ==
7x Mind Rune
5x Order Rune

== Battlefield ==
1x Emperor's Dais
1x Treasure Hoard
1x Vilemaw's Lair

== Side Deck ==
1x Bellows Breath
2x Cull the Weak
1x Imperial Decree
1x Pickpocket
1x Safety Inspector
1x Salvage
1x Sandshifter`,
  },
  {
    legend: "Ivern, Green Father",
    champion: "Ivern, Nurturer",
    player: "Boulevard",
    placement: "176th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
1x Azir, Sovereign
1x Back Off
1x Blitzcrank, Impassive
1x Call to Glory
1x Daisy!
3x Daring Poro
3x Defy
2x Discipline
1x Flurry of Feathers
3x Friendship
3x Frisky Hunter
3x Hidden Blade
1x Loyal Poro
3x Mutated Mouser
1x Soaring Scout
3x Stalwart Poro
3x Trusty Ramhound
2x Ultrasoft Poro
2x Undertitan
1x Vilemaw

== Runes ==
7x Calm Rune
5x Order Rune

== Battlefield ==
1x Forbidding Waste
1x Rockfall Path
1x Vaults of Helia

== Side Deck ==
3x Cull the Weak
2x Disarming Rake
1x Emperor's Divide
1x Flurry of Feathers
1x Ivern, Friend to All`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Alluring",
    player: "Suoo",
    placement: "181st",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
2x Back Off
1x Blitzcrank, Impassive
3x Blue Sentinel
1x Chakram Dancer
2x Charm
1x Cloth Armor
3x Defy
3x Desert's Call
3x Discipline
3x Emperor's Divide
1x Guardian of the Passage
3x Mutated Mouser
1x Not So Fast
2x Sona, Harmonious
2x Stalwart Poro
3x Sunlit Guardian
1x Thousand-Tailed Watcher
1x Time Warp
2x Vilemaw
1x Zhonya's Hourglass

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Grove of the God-Willow
1x Power Nexus
1x Trifarian War Camp

== Side Deck ==
2x Allay, Eager Admirer
1x Alpha Wildclaw
1x Back Off
3x Disarming Rake
1x Yuumi, Magical Cat`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Blacksmith",
    player: "Stephé",
    placement: "200th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
2x Brutalizer
3x Charm
3x Clockwork Keeper
3x Defy
3x Discipline
2x Dropboarder
3x Pit Crew
2x Plundering Poro
3x Poro Snax
2x Retreat
3x Seal of Focus
1x Shurelya's Requiem
3x Sprite Fountain
3x Sterak's Gage
3x Thousand-Tailed Watcher

== Runes ==
7x Calm Rune
5x Mind Rune

== Battlefield ==
1x Ornn's Forge
1x Rockfall Path
1x The Arena's Greatest

== Side Deck ==
2x Back Off
3x Disarming Rake
1x Forgefire Cape
2x Singularity`,
  },
  {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    player: "CTCG Villionaire",
    placement: "249th",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
3x Catalyst of Aeons
3x Challenge
3x Dazzling Aurora
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
2x Flurry of Blades
2x Repulse
2x Thermo Beam
2x Unyielding Spirit`,
  },
  {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Murderous Artist",
    player: "Alienbed",
    placement: "261st",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
2x Consult the Past
3x Curtain Call
3x Deadly Flourish
3x Downstage Dramatics
2x Falling Star
2x Frigid Touch
3x Jhin, Meticulous Killer
3x Noxus Hopeful
3x Plundering Poro
2x Pouty Poro
1x Progress Day
2x Singularity
2x Sprite Burst
2x Stupefy
2x Thousand-Tailed Watcher
2x Time Warp
2x Watchful Sentry

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Forgotten Library
1x Frozen Fortress
1x Void Gate

== Side Deck ==
1x Falling Star
2x Ferrous Forerunner
1x Rocket Barrage
1x Singularity
2x Thermo Beam
1x Unchecked Power`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Zealot",
    player: "Bargosy",
    placement: "267th",
    domains: "Calm/Body",
    tier: "D",
    deckCode: `== Main Deck ==
3x Back Off
1x Call to Glory
1x Charm
1x Cull the Weak
3x Defy
2x Discipline
2x Emperor's Divide
2x Fiora, Victorious
2x Heart of Dark Ice
2x Irelia, Fervent
3x Lonely Poro
3x Nami, Headstrong
3x Scuttle Crab
2x Stalwart Poro
2x Stellacorn Herder
3x Vi, Peacekeeper
2x Zenith Blade
2x Zhonya's Hourglass

== Runes ==
6x Calm Rune
6x Body Rune

== Battlefield ==
1x Amateur Recital
1x Monastery of Hirana
1x Sunken Temple

== Side Deck ==
2x Allay, Eager Admirer
2x Ashe, Focused
1x Call to Glory
1x Cull the Weak
2x Disarming Rake`,
  },
  {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Commander",
    player: "Swainy",
    placement: "290th",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Altar of Memories
3x Catalyst of Aeons
2x Corina Veraza
3x Dazzling Aurora
3x Elder Dragon
3x Flurry of Blades
3x Forge of the Future
2x Guards!
3x Mobilize
1x Rally the Troops
2x Recruit the Vanguard
3x Repulse
2x Sabotage
2x Shadow's Call
2x Tactical Retreat
2x Vanguard Armory
1x Vengeance

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x The Papertree

== Side Deck ==
2x Akshan, Mischievous
1x Anivia, Primal
2x Salvage
1x Sivir, Ambitious
2x Unyielding Spirit`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "Ennelle",
    placement: "356th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
1x Back Off
2x Boneshiver
3x Brutalizer
2x Challenge
1x Charm
3x Counter Strike
3x Defy
3x Discipline
1x Doran's Blade
3x First Mate
3x Guardian Angel
3x Lonely Poro
3x Lucian, Merciless
1x Punch First
3x Rengar, Trophy Hunter
2x Scuttle Crab

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Ornn's Forge
1x Sunken Temple
1x Zaun Warrens

== Side Deck ==
1x Disposal Order
2x Nidalee, Cat Form
3x Ruin Runner
2x Sabotage`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    player: "Spiritless",
    placement: "379th",
    domains: "Chaos/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
1x Blood Rush
2x Cleave
1x Falling Star
1x Flash
1x Gust
1x Hard Bargain
3x Inferna
2x Kha'Zix, Mutating Horror
3x Noxus Hopeful
2x Overzealous Fan
3x Pyke, Dockside Butcher
2x Ride the Wind
3x Sharkling
2x Stacked Deck
1x Star-Crossed
2x Switcheroo
1x Tideturner
3x Traveling Merchant
2x Vex, Apathetic
3x Vi, Destructive

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Minefield
1x The Arena's Greatest
1x Zaun Warrens

== Side Deck ==
2x Brynhir Thundersong
1x Downwell
1x Flash
1x Hard Bargain
1x Mindsplitter
1x Star-Crossed
1x Thermo Beam`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "Nack",
    placement: "384th",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
1x Bellows Breath
1x Blood Rush
3x Bubble Bot
2x Cleave
2x Deadly Flourish
2x Eclipse
3x Falling Star
3x Ferrous Forerunner
3x Forecaster
3x Gem Jammer
3x Hwei, Brooding Painter
3x Plundering Poro
2x Retreat
2x Rumble, Hotheaded
1x Singularity
3x Thousand-Tailed Watcher
2x Time Warp

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Ravenbloom Conservatory
1x Star Spring
1x Trifarian War Camp

== Side Deck ==
1x Against the Odds
1x Deadly Flourish
1x Singularity
2x Thermo Beam
1x Turn to Dust
2x Unchecked Power`,
  },
];

// ── Seeding ─────────────────────────────────────────────────────────
async function main() {
  console.log("Creating Vancouver Best of article + decks...");

  const blocks: Record<string, unknown>[] = [];
  blocks.push({
    type: "text",
    id: "intro",
    content: `## Best of Vancouver — Regional Qualifier

Le **Regional Qualifier de Vancouver**, premier RQ canadien, a réuni **plus de 1800 joueurs** au Jour 1. **CTG AlanZQ** s'impose avec Diana et devient le **premier double champion** de Regional Qualifier.

Voici le meilleur deck de chaque légende jouée à Vancouver : pour chaque légende, nous avons retenu la liste la mieux classée. Les decks sont regroupés par tier selon le classement obtenu.

---`,
  });

  const tierLabels: Record<string, string> = {
    S: "Tier 1 — Podium",
    A: "Tier 2 — Top 8 / Top 16",
    B: "Tier 3 — Top 32",
    C: "Tier 4 — Top 128",
    D: "Tier 5 — Reste du field",
  };

  let lastTier = "";
  for (let i = 0; i < BEST_OF.length; i++) {
    const d = BEST_OF[i];
    if (d.tier !== lastTier) {
      blocks.push({ type: "separator", id: `sep-${d.tier}` });
      blocks.push({ type: "text", id: `tier-${d.tier}`, content: `## ${tierLabels[d.tier] ?? d.tier}` });
      lastTier = d.tier;
    }
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      championName: d.champion,
      deckName: `${d.legend} — Best of Vancouver`,
      legendName: d.legend,
      playerName: d.player,
      context: `${d.placement} — RQ Vancouver (${d.domains})`,
    });
  }

  const existingArticle = await prisma.article.findUnique({ where: { slug: "best-of-vancouver-rq" } });
  if (existingArticle) {
    await prisma.deck.updateMany({ where: { sourceArticleId: existingArticle.id }, data: { sourceArticleId: null } });
    await prisma.article.delete({ where: { id: existingArticle.id } });
    console.log("  Removed existing best-of-vancouver-rq article (re-seeding)");
  }

  const article = await prisma.article.create({
    data: {
      title: "Best of Vancouver — Toutes les légendes",
      slug: "best-of-vancouver-rq",
      coverImage: "/img/articles/vancouver.webp",
      excerpt:
        "Les meilleures decklists pour chaque légende au Regional Qualifier de Vancouver (1800+ joueurs). AlanZQ champion avec Diana.",
      category: "tournoi",
      tags: ["vancouver", "rq", "best-of", "meta", "unleashed"],
      blocks: blocks as never,
      published: true,
      featured: true,
      publishedAt: new Date("2026-06-05"),
      tournamentName: "Regional Qualifier Vancouver",
      tournamentLocation: "Vancouver, Canada",
      tournamentPlayerCount: 1800,
    },
  });
  console.log(`Article created: /articles/${article.slug}`);

  let totalNotFound: string[] = [];

  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: { type: "Legend", name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" } },
    });

    const slug = `best-of-vancouver-${d.legend.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "")}`;
    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      await prisma.deckCard.deleteMany({ where: { deckId: existingDeck.id } });
      await prisma.deck.delete({ where: { id: existingDeck.id } });
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — Best of Vancouver`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au RQ Vancouver : ${d.placement} par ${d.player}. ${d.domains}.`,
        format: "constructed",
        setTag: "Unleashed",
        tags: ["vancouver", "rq", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: "RQ Vancouver 2026",
        tournamentTier: d.tier,
        placement: d.placement,
        playerName: d.player,
      },
    });

    const seen = new Set<string>();
    // Légende + champion (le deckCode n'a pas de section legend/champion)
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
  console.log(`\nDone! Article + ${BEST_OF.length} decks Vancouver créés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
