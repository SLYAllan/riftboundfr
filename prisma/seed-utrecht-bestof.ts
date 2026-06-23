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

// ── Best of Utrecht RQ (39 légendes) ───────────────────────────────
// Source : article officiel "Utrecht's Top Decks" (riftbound.leagueoflegends.com).
// Meilleur deck de chaque légende ; tier = bucket par classement final au tournoi.
const BEST_OF: BestOfEntry[] = [
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "Squirtle",
    placement: "1st",
    domains: "Calm/Order",
    tier: "S",
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
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "Rednaxell",
    placement: "2nd",
    domains: "Mind/Order",
    tier: "S",
    deckCode: `== Main Deck ==
2x Bellows Breath
2x Card Sharp
3x Carrion Dredger
1x Chakram Dancer
3x Cull the Weak
1x Eclipse
1x Facebreaker
3x Hidden Blade
3x Honest Broker
3x Imperial Decree
1x Salvage
2x Shadow's Call
2x Sprite Fountain
3x Stupefy
2x Thousand-Tailed Watcher
2x Vi, Peacekeeper
2x Wages of Pain
3x Xin Zhao, Vigilant
== Runes ==
5x Mind Rune
7x Order Rune
== Battlefield ==
1x Forbidding Waste
1x Rockfall Path
1x The Arena's Greatest
== Side Deck ==
1x Ashe, Focused
1x Eclipse
2x Pickpocket
1x Safety Inspector
1x Salvage
1x Singularity
1x Sprite Fountain`,
  },
  {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    player: "CTCG Collin K",
    placement: "3rd",
    domains: "Body/Order",
    tier: "S",
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
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "Dhawally",
    placement: "4th",
    domains: "Chaos/Mind",
    tier: "S",
    deckCode: `== Main Deck ==
2x Acceptable Losses
1x Eclipse
2x Fizz, Trickster
1x Flash
2x Gust
2x Hard Bargain
3x Hwei, Brooding Painter
1x Kha'Zix, Mutating Horror
3x Moonfall
3x Ravenbloom Student
2x Ride the Wind
1x Smoke Screen
1x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x Tideturner
2x Traveling Merchant
2x Vex, Apathetic
== Runes ==
7x Chaos Rune
5x Mind Rune
== Battlefield ==
1x Abandoned Hall
1x Rockfall Path
1x Targon's Peak
== Side Deck ==
2x Invert Timelines
1x Singularity
1x Star-Crossed
3x Turn to Dust
1x Vex, Cheerless`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "MICE Ramekiano",
    placement: "5th",
    domains: "Fury/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Blood Rush
3x Carrion Dredger
3x Cull the Weak
2x Daring Poro
3x Faithful Manufactor
3x Hidden Blade
3x Honest Broker
3x Inferna
3x Noxus Hopeful
3x Pyke, Dockside Butcher
2x Rengar, Pouncing
3x Undertitan
2x Vi, Peacekeeper
3x Void Rush
== Runes ==
7x Fury Rune
5x Order Rune
== Battlefield ==
1x The Arena's Greatest
1x The Candlelit Sanctum
1x Trifarian War Camp
== Side Deck ==
2x Falling Star
2x Ferrous Forerunner
1x Long Sword
2x Salvage
1x Vi, Destructive`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "MICE DiamondHat",
    placement: "6th",
    domains: "Fury/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Baited Hook
3x Carrion Dredger
1x Falling Star
1x Grand Strategem
3x Hidden Blade
3x Honest Broker
2x Inferna
3x Noxus Hopeful
3x Rally the Troops
3x Safety Inspector
2x Seal of Unity
1x Shadow's Call
3x Spectral Matron
3x Vanguard Captain
2x Vi, Peacekeeper
3x Xin Zhao, Vigilant
== Runes ==
4x Fury Rune
8x Order Rune
== Battlefield ==
1x Emperor's Dais
1x The Arena's Greatest
1x Trifarian War Camp
== Side Deck ==
2x Ashe, Focused
1x Cull the Weak
1x Falling Star
1x Imperial Decree
2x Salvage
1x Vi, Peacekeeper`,
  },
  {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Tempered",
    player: "Bakura",
    placement: "7th",
    domains: "Body/Calm",
    tier: "A",
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
2x Disarming Rake
1x Ruin Runner
2x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismaticismism",
    placement: "8th",
    domains: "Chaos/Fury",
    tier: "A",
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
    legend: "LeBlanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "GGNext00",
    placement: "11th",
    domains: "Mind/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Baited Hook
3x Black Rose Dignitary
3x Glasc Mixologist
3x Harnessed Dragon
3x Hidden Blade
3x Karthus, Eternal
2x Mirror Image
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
1x Deathgrip
1x LeBlanc, Everywhere at Once
2x Safety Inspector
1x Thousand-Tailed Watcher
1x Turn to Dust`,
  },
  {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    player: "CTCG Villionaire",
    placement: "14th",
    domains: "Body/Fury",
    tier: "A",
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
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "loriwwa",
    placement: "17th",
    domains: "Body/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
3x Catalyst of Aeons
2x Challenge
3x Dazzling Aurora
3x Elder Dragon
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
1x Challenge
2x Factory Recall
2x Mindsplitter
1x Pack of Wonders`,
  },
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "Comeback King",
    placement: "21st",
    domains: "Calm/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
1x Adaptatron
2x Boots of Swiftness
1x Charm
3x Defiant Dance
3x Defy
3x Discipline
2x En Garde
1x Fizz, Trickster
2x Guardian Angel
1x Gust
1x Not So Fast
1x Rebuke
2x Rhasa the Sunderer
1x Ride the Wind
2x Scuttle Crab
3x Stacked Deck
1x Star-Crossed
3x Stellacorn Herder
2x Tideturner
3x Traveling Merchant
1x Vex, Apathetic
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Abandoned Hall
1x Targon's Peak
1x Zaun Warrens
== Side Deck ==
1x Adaptatron
2x Gust
1x Not So Fast
1x Star-Crossed
1x Switcheroo
1x Vex, Apathetic
1x Zhonya's Hourglass`,
  },
  {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Trophy Hunter",
    player: "urlichmtg",
    placement: "24th",
    domains: "Body/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
2x Challenge
1x Darius, Trifarian
2x Determined Sentry
3x Grim Apothecary
3x Inferna
3x Irresistible Faefolk
3x Kai'Sa, Survivor
3x Kinkou Initiate
3x Nidalee, Cat Form
3x Pit Rookie
3x Punch First
3x Pyke, Dockside Butcher
2x Rengar, Trophy Hunter
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
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Crownguard",
    player: "Sanan",
    placement: "28th",
    domains: "Mind/Order",
    tier: "B",
    deckCode: `== Main Deck ==
2x Card Sharp
2x Cull the Weak
3x Ekko, Recurrent
2x Forge of the Future
1x Lecturing Yordle
3x Progress Day
1x Promising Future
3x Rally the Troops
2x Retreat
3x Sacrifice
3x Shadow's Call
1x Singularity
3x Soaring Scout
3x Sprite Burst
3x Stupefy
2x Sumpworks Map
2x The Ruination
== Runes ==
6x Mind Rune
6x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x The Papertree
1x Treasure Hoard
== Side Deck ==
3x Ashe, Focused
1x Fiora, Worthy
1x Renata Glasc, Mastermind
3x Salvage`,
  },
  {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Meticulous Killer",
    player: "Jibbs",
    placement: "48th",
    domains: "Fury/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Consult the Past
3x Curtain Call
3x Deadly Flourish
1x Downstage Dramatics
1x Falling Star
2x Frigid Touch
3x Noxus Hopeful
1x Orb of Regret
3x Plundering Poro
1x Progress Day
2x Riptide Rex
2x Rocket Barrage
2x Singularity
2x Sprite Burst
2x Stupefy
2x Thousand-Tailed Watcher
1x Time Warp
2x Unchecked Power
3x Watchful Sentry
== Runes ==
5x Fury Rune
7x Mind Rune
== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Void Gate
== Side Deck ==
1x Diana, Lunari
1x Falling Star
2x Ferrous Forerunner
1x Minotaur Reckoner
1x Sprite Burst
2x Thermo Beam`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "Dynamic",
    placement: "51st",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
1x Cleave
3x Darius, Trifarian
2x Falling Star
2x Ferrous Forerunner
2x Gust
2x Jhin, Murderous Artist
2x Kai'Sa, Survivor
3x Noxus Hopeful
3x Overzealous Fan
2x Rebuke
2x Ride the Wind
3x Spinning Axe
3x Stacked Deck
2x Switcheroo
3x Tideturner
2x Treasure Hunter
2x Vex, Apathetic
== Runes ==
6x Chaos Rune
6x Fury Rune
== Battlefield ==
1x Forbidding Waste
1x Targon's Peak
1x Treasure Hoard
== Side Deck ==
1x Against the Odds
1x Brynhir Thundersong
1x Cleave
1x Gust
1x Kai'Sa, Survivor
2x Star-Crossed
1x Thermo Beam`,
  },
  {
    legend: "Kha'Zix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    player: "JUN",
    placement: "53rd",
    domains: "Body/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
3x Fizz, Trickster
2x Grim Resolve
1x Gust
1x Hard Bargain
3x Irresistible Faefolk
3x Lucian, Merciless
3x Mister Root
2x Punch First
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
2x Gust
1x Hard Bargain
2x Kha'Zix, Mutating Horror
1x Rebuke
1x Sabotage`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "Bermuda",
    placement: "67th",
    domains: "Chaos/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
1x Arcane Shift
2x Bellows Breath
3x Bewitching Spirit
3x Deadly Flourish
1x Eclipse
3x Fizz, Trickster
2x Gust
1x Kha'Zix, Mutating Horror
1x Morbid Return
3x Pack of Wonders
1x Singularity
3x Stacked Deck
2x Star-Crossed
3x Stupefy
1x The List
2x Thousand-Tailed Watcher
2x Treasure Trove
1x Turn to Dust
1x Vex, Apathetic
3x Wages of Pain
== Runes ==
6x Chaos Rune
6x Mind Rune
== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Sigil of the Storm
== Side Deck ==
1x Gust
1x Kha'Zix, Mutating Horror
3x Sneaky Deckhand
2x Turn to Dust
1x Whirlwind`,
  },
  {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "Vendilion",
    placement: "76th",
    domains: "Body/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
3x Bullet Time
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
1x Flurry of Blades
3x Gust
2x Last Rites
3x Lunar Boon
3x Mindsplitter
3x Mobilize
2x Repulse
3x Sabotage
3x Scryer's Bloom
3x Stacked Deck
1x The Harrowing
== Runes ==
6x Body Rune
6x Chaos Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Abandon
1x Challenge
1x Factory Recall
1x Fading Memories
1x Repulse
2x Unyielding Spirit`,
  },
  {
    legend: "Vex, Gloomist",
    champion: "Vex, Cheerless",
    player: "Fabsio",
    placement: "85th",
    domains: "Calm/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
1x Back Off
3x Defy
3x Discipline
1x Flash
3x Gust
2x Hard Bargain
3x Rebuke
3x Scuttle Crab
3x Sona, Harmonious
3x Stacked Deck
3x Star-Crossed
3x Switcheroo
3x Tideturner
2x Traveling Merchant
3x Vex, Apathetic
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Ravenbloom Conservatory
1x Startipped Peak
1x Targon's Peak
== Side Deck ==
3x Disarming Rake
1x Hard Bargain
2x Not So Fast
2x Vex, Cheerless`,
  },
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Worthy",
    player: "Fr0zen",
    placement: "94th",
    domains: "Body/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Akshan, Mischievous
3x Challenge
3x Dazzling Aurora
3x Divining Shells
1x Doran's Blade
3x Elder Dragon
2x Harnessed Dragon
1x Hidden Blade
3x Mobilize
2x Rengar, Trophy Hunter
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
1x Trapping Ground
== Side Deck ==
2x Divine Judgment
1x Fiora, Victorious
1x Repulse
2x Sabotage
2x Salvage`,
  },
  {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Dockside Butcher",
    player: "Wolverex",
    placement: "102nd",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
2x Baron Nashor
1x Beast Below
3x Bewitching Spirit
1x Darius, Trifarian
1x Death from Below
1x Downwell
1x Ezreal, Prodigy
3x Falling Star
2x Fizz, Trickster
1x Gust
1x Last Rites
1x Mindsplitter
2x Noxus Hopeful
1x Piercing Light
1x Sharkling
1x Stacked Deck
2x Star-Crossed
1x Switcheroo
2x The List
2x Tideturner
3x Traveling Merchant
3x Treasure Hunter
2x Vex, Apathetic
1x Void Seeker
== Runes ==
6x Chaos Rune
6x Fury Rune
== Battlefield ==
1x Forbidding Waste
1x Ripper's Bay
1x Void Gate
== Side Deck ==
1x Blighted Battleaxe
1x Brynhir Thundersong
1x Gust
1x Soulgorger
1x Star-Crossed
1x Switcheroo
1x Thermo Beam
1x Windsinger`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Remorseful",
    player: "Bezz",
    placement: "112th",
    domains: "Calm/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
1x Adaptatron
1x Back Off
2x Baron Nashor
3x Defy
3x Discipline
2x En Garde
3x Find Your Center
2x Fizz, Trickster
1x Kha'Zix, Mutating Horror
2x Lonely Poro
2x Ride the Wind
1x Scuttle Crab
3x Stacked Deck
2x Star-Crossed
2x Stellacorn Herder
1x Sterak's Gage
1x Tideturner
3x Treasure Hunter
1x Vex, Apathetic
3x Zhonya's Hourglass
== Runes ==
6x Calm Rune
6x Chaos Rune
== Battlefield ==
1x Aspirant's Climb
1x Rockfall Path
1x Targon's Peak
== Side Deck ==
1x Aspirant's Climb
1x Rockfall Path
1x Targon's Peak`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Blacksmith",
    player: "Skepas",
    placement: "153rd",
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
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Scout",
    player: "CATL Kedjius",
    placement: "160th",
    domains: "Chaos/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
2x Edge of Night
2x Ember Monk
2x Evelynn, Entrancing
1x Gust
3x Kha'Zix, Mutating Horror
2x Pyke, Returned
3x Ravenbloom Student
2x Smoke Screen
3x Sprite Fountain
3x Stacked Deck
2x Star-Crossed
3x Stupefy
3x Switcheroo
2x Thousand-Tailed Watcher
3x Tideturner
3x Vex, Apathetic
== Runes ==
6x Chaos Rune
6x Mind Rune
== Battlefield ==
1x Grove of the God-Willow
1x Seat of Power
1x The Arena's Greatest
== Side Deck ==
2x Acceptable Losses
2x Rebuke
2x Singularity
1x Star-Crossed
1x Turn to Dust`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    player: "Ghosterdriver",
    placement: "167th",
    domains: "Chaos/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
2x Blighted Battleaxe
3x Edge of Night
2x Evelynn, Entrancing
1x Falling Star
1x Gust
1x Inferna
2x Last Rites
1x Legion Rearguard
3x Long Sword
3x Noxus Hopeful
3x Pyke, Returned
1x Rek'Sai, Breacher
1x Rengar, Pouncing
2x Rengar, Unseen
3x Seal of Rage
1x Switcheroo
3x Tideturner
3x Traveling Merchant
3x Vex, Apathetic
== Runes ==
4x Chaos Rune
8x Fury Rune
== Battlefield ==
1x Amateur Recital
1x Forge of the Fluft
1x Star Spring
== Side Deck ==
1x Brynhir Thundersong
1x Falling Star
1x Gust
1x Hard Bargain
1x Sneaky Deckhand
1x Star-Crossed
2x Super Mega Death Rocket!`,
  },
  {
    legend: "Ivern, Green Father",
    champion: "Ivern, Nurturer",
    player: "Marshall",
    placement: "171st",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Azir, Sovereign
1x Back Off
1x Blitzcrank, Impassive
1x Call to Glory
1x Daisy!
3x Daring Poro
3x Defy
1x Disarming Rake
2x Discipline
1x Emperor's Divide
1x Flurry of Feathers
3x Friendship
3x Frisky Hunter
3x Hidden Blade
1x Ivern, Nurturer
3x Mutated Mouser
3x Stalwart Poro
3x Trusty Ramhound
1x Ultrasoft Poro
1x Vi, Peacekeeper
1x Vilemaw
== Runes ==
7x Calm Rune
5x Order Rune
== Battlefield ==
1x Forbidding Waste
1x Rockfall Path
1x Vilemaw's Lair
== Side Deck ==
1x Charm
3x Cull the Weak
2x Disarming Rake
1x Emperor's Divide
1x Ivern, Friend to all`,
  },
  {
    legend: "Kai'Sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "CarlMerin",
    placement: "193rd",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Battering Ram
3x Falling Star
3x Jhin, Meticulous Killer
3x Lecturing Yordle
3x Noxus Hopeful
3x Progress Day
3x Seal of Insight
2x Singularity
3x Smite
3x Stupefy
2x Thousand-Tailed Watcher
3x Time Warp
2x Turn to Dust
3x Watchful Sentry
== Runes ==
5x Fury Rune
7x Mind Rune
== Battlefield ==
1x Rockfall Path
1x The Arena's Greatest
1x Void Gate
== Side Deck ==
2x Eclipse
3x Smoke Screen
1x Thermo Beam
1x Turn to Dust
1x Unchecked Power`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "SEBIQQQQQQQQQQQQ",
    placement: "197th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
3x Catalyst of Aeons
2x Charm
3x Dazzling Aurora
2x Deadbloom Predator
3x Defy
3x Desert's Call
1x Discipline
3x Disposal Order
3x Elder Dragon
3x Find Your Center
3x Flurry of Blades
1x Meditation
2x Mobilize
2x Not So Fast
3x Sabotage
2x Zhonya's Hourglass
== Runes ==
7x Body Rune
5x Calm Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm
== Side Deck ==
2x Akshan, Mischievous
2x Challenge
1x Charm
1x Not So Fast
1x Unyielding Spirit
1x Volibear, Imposing`,
  },
  {
    legend: "Master Yi, Wuju Master",
    champion: "Master Yi, Tempered",
    player: "Narutak",
    placement: "199th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
2x Akshan, Mischievous
2x Back Off
3x Concentrate
3x Defy
3x Discipline
2x Emperor's Divide
3x Gemhand Hunter
2x Hunter's Machete
3x Master Yi, Unstoppable
3x Punch First
2x Scuttle Crab
2x Skyward Strike
3x Voracious Gromp
3x Wuju Apprentice
3x Zhonya's Hourglass
== Runes ==
7x Body Rune
5x Calm Rune
== Battlefield ==
1x Gardens of Becoming
1x Reckoner's Arena
1x Targon's Peak
== Side Deck ==
2x Disarming Rake
1x Emperor's Divide
2x Not So Fast
2x Sabotage
1x Skyward Strike`,
  },
  {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    player: "Hirob",
    placement: "202nd",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Blood Money
3x Catalyst of Aeons
2x Challenge
3x Confront
3x Dazzling Aurora
1x Divine Judgment
2x Divining Shells
3x Elder Dragon
3x Flurry of Blades
2x Forge of the Future
1x Grand Strategem
2x Harnessed Dragon
2x Hidden Blade
3x Mobilize
1x Rift Herald
3x Sabotage
1x Shadow's Call
2x Vanguard Armory
== Runes ==
7x Body Rune
5x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x The Papertree
== Side Deck ==
1x Akshan, Mischievous
2x Disposal Order
2x Repulse
3x Salvage`,
  },
  {
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Peacekeeper",
    player: "Utter Trash",
    placement: "243rd",
    domains: "Fury/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Cleave
2x Deathgrip
3x Faithful Manufactor
1x Falling Star
2x Ferrous Forerunner
3x Gem Jammer
3x Hextech Gauntlets
3x Hidden Blade
3x Honest Broker
3x Kai'Sa, Survivor
2x Long Sword
3x Noxus Hopeful
3x Pouty Poro
2x Rek'Sai, Breacher
2x Rengar, Pouncing
1x Salvage
1x Vault Breaker
== Runes ==
7x Fury Rune
5x Order Rune
== Battlefield ==
1x Forge of the Fluft
1x Star Spring
1x The Arena's Greatest
== Side Deck ==
2x Against the Odds
3x Ashe, Focused
1x Falling Star
2x Salvage`,
  },
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "Chim\u00e4rin",
    placement: "248th",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
1x Akshan, Mischievous
2x Cleave
3x Doran's Blade
3x First Mate
2x Grim Resolve
3x Kai'Sa, Survivor
2x Kinkou Initiate
2x Punch First
2x Red Brambleback
3x Relentless Pursuit
2x Rengar, Trophy Hunter
2x Repulse
3x Ruin Runner
2x Sabotage
3x Skyfall of Areion
3x Trinity Force
1x Unyielding Spirit
== Runes ==
7x Body Rune
5x Fury Rune
== Battlefield ==
1x Sunken Temple
1x The Candlelit Sanctum
1x Zaun Warrens
== Side Deck ==
2x Akshan, Mischievous
2x Falling Star
1x Repulse
1x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "Jestekote",
    placement: "258th",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
2x Back Off
3x Catalyst of Aeons
2x Charm
1x Confront
3x Dazzling Aurora
3x Defy
3x Desert's Call
2x Discipline
3x Elder Dragon
3x Find Your Center
3x Flurry of Blades
3x Mobilize
2x Not So Fast
2x Sabotage
2x Vilemaw
2x Zhonya's Hourglass
== Runes ==
6x Body Rune
6x Calm Rune
== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Trapping Ground
== Side Deck ==
2x Akshan, Mischievous
1x Dragon's Rage
1x Not So Fast
1x Sabotage
2x Unyielding Spirit
1x Zhonya's Hourglass`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Zealot",
    player: "Yaino",
    placement: "326th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Back Off
2x Call to Glory
1x Charm
1x Cull the Weak
3x Defy
2x Discipline
1x Emperor's Divide
2x Fiora, Victorious
2x Heart of Dark Ice
2x Irelia, Fervent
3x Lonely Poro
3x Nami, Headstrong
2x Scuttle Crab
3x Stalwart Poro
2x Stellacorn Herder
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
1x Charm
1x Cull the Weak
2x Disarming Rake
2x Not So Fast`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Alluring",
    player: "Malakx",
    placement: "355th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
1x Alpha Wildclaw
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
1x Wind Wall`,
  },
  {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Rugged",
    player: "Noobvengador",
    placement: "481st",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Blood Money
3x Catalyst of Aeons
3x Confront
3x Dazzling Aurora
3x Disposal Order
3x Elder Dragon
3x Flurry of Blades
3x Forge of the Future
2x Harnessed Dragon
3x Mobilize
3x Rally the Troops
2x Repulse
1x Tactical Retreat
1x Unyielding Spirit
3x Vanguard Armory
== Runes ==
7x Body Rune
5x Order Rune
== Battlefield ==
1x Aspirant's Climb
1x The Grand Plaza
1x The Papertree
== Side Deck ==
1x Repulse
3x Sabotage
3x Salvage
1x Unyielding Spirit`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "tkbtkbtkbtkb",
    placement: "529th",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
1x Blood Rush
3x Bubble Bot
2x Deadly Flourish
2x Eclipse
2x Falling Star
3x Ferrous Forerunner
3x Forecaster
3x Gem Jammer
1x Hwei, Brooding Painter
2x Kai'Sa, Survivor
3x Plundering Poro
3x Retreat
1x Rocket Barrage
2x Rumble, Hotheaded
1x Singularity
3x Thousand-Tailed Watcher
2x Time Warp
2x Wages of Pain
== Runes ==
6x Fury Rune
6x Mind Rune
== Battlefield ==
1x Ravenbloom Conservatory
1x Star Spring
1x Void Gate
== Side Deck ==
2x Brynhir Thundersong
1x Hwei, Brooding Painter
1x Singularity
1x Thermo Beam
2x Turn to Dust
1x Unchecked Power`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    player: "Evox 13",
    placement: "537th",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
1x Bellows Breath
3x Card Sharp
3x Cull the Weak
2x Deathgrip
2x Hidden Blade
3x Honest Broker
3x Hostile Takeover
3x Plundering Poro
2x Singularity
3x Sprite Fountain
3x Stupefy
1x Thousand-Tailed Watcher
2x Time Warp
1x Unchecked Power
3x Vanguard Armory
3x Wages of Pain
1x Watchful Sentry
== Runes ==
7x Mind Rune
5x Order Rune
== Battlefield ==
1x Forbidding Waste
1x Treasure Hoard
1x Trifarian War Camp
== Side Deck ==
1x Bellows Breath
3x Salvage
1x Singularity
1x Thousand-Tailed Watcher
2x Unchecked Power`,
  },
];

const tierLabels: Record<string, string> = {
  S: "Tier 1 — Podium",
  A: "Tier 2 — Top 8 / Top 16",
  B: "Tier 3 — Top 32",
  C: "Tier 4 — Top 128",
  D: "Tier 5 — Reste du field",
};

async function main() {
  console.log("Creating Utrecht Best of article + decks...");

  const blocks: Record<string, unknown>[] = [];
  blocks.push({
    type: "text",
    id: "intro",
    content: `## Best of Utrecht — Regional Qualifier

Le **Regional Qualifier d'Utrecht** a réuni **plus de 1900 joueurs** sur le Top 8 le plus diversifié de l'histoire de Riftbound : huit Légendes différentes. **Squirtle** s'impose avec Azir et devient le deuxième double champion de RQ, après son titre à Lille.

Voici le meilleur deck de chaque Légende jouée à Utrecht : pour chacune, la liste la mieux classée au tournoi. Les decks sont regroupés par tier selon le classement obtenu.

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
    blocks.push({
      type: "decklist",
      id: `deck-${i}`,
      deckCode: d.deckCode,
      championName: d.champion,
      deckName: `${d.legend} — Best of Utrecht`,
      legendName: d.legend,
      playerName: d.player,
      context: `${d.placement} — RQ Utrecht (${d.domains})`,
    });
  }

  const existingArticle = await prisma.article.findUnique({ where: { slug: "best-of-utrecht-rq" } });
  if (existingArticle) {
    await prisma.deck.updateMany({ where: { sourceArticleId: existingArticle.id }, data: { sourceArticleId: null } });
    await prisma.article.delete({ where: { id: existingArticle.id } });
    console.log("  Removed existing best-of-utrecht-rq article (re-seeding)");
  }

  const article = await prisma.article.create({
    data: {
      title: "Best of Utrecht — Toutes les légendes",
      slug: "best-of-utrecht-rq",
      coverImage: "/img/articles/utrcht1.webp",
      excerpt:
        "Les meilleures decklists pour chaque légende au Regional Qualifier d'Utrecht (1900+ joueurs). Squirtle champion avec Azir.",
      category: "tournoi",
      tags: ["utrecht", "rq", "best-of", "meta", "unleashed"],
      blocks: blocks as never,
      published: true,
      featured: true,
      publishedAt: new Date("2026-06-16"),
      tournamentName: "Regional Qualifier Utrecht",
      tournamentLocation: "Utrecht, Pays-Bas",
      tournamentPlayerCount: 1953,
    },
  });
  console.log(`Article created: /articles/${article.slug}`);

  const totalNotFound: string[] = [];

  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: { type: "Legend", name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" } },
    });

    const slug = `best-of-utrecht-${d.legend.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+\$/g, "")}`;
    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      await prisma.deckCard.deleteMany({ where: { deckId: existingDeck.id } });
      await prisma.deck.delete({ where: { id: existingDeck.id } });
    }

    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — Best of Utrecht`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au RQ Utrecht : ${d.placement} par ${d.player}. ${d.domains}.`,
        format: "constructed",
        setTag: "Unleashed",
        tags: ["utrecht", "rq", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: "RQ Utrecht 2026",
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
  console.log(`\nDone! Article + ${BEST_OF.length} decks Utrecht créés.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
