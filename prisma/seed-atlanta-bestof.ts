import { PrismaClient } from "@prisma/client";
import { parseDeckCode } from "../src/lib/deck-code";

const prisma = new PrismaClient();

interface BestOfEntry {
  legend: string;
  champion: string;
  player: string;
  placement: string;
  record: string;
  domains: string;
  tier: string;
  deckCode: string;
}

const BEST_OF: BestOfEntry[] = [
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismаticismism",
    placement: "1st",
    record: "14-1-1",
    domains: "Fury/Chaos",
    tier: "S",
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
    tier: "S",
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
    placement: "3rd",
    record: "12-2-1",
    domains: "Calm/Chaos",
    tier: "S",
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
    placement: "4th",
    record: "12-2-1",
    domains: "Chaos/Mind",
    tier: "S",
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
    placement: "5th",
    record: "11-2-1",
    domains: "Fury/Mind",
    tier: "A",
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
    placement: "7th",
    record: "11-2-1",
    domains: "Body/Order",
    tier: "A",
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
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Honed",
    player: "ominousmilk",
    placement: "9th",
    record: "11-2",
    domains: "Body/Calm",
    tier: "A",
    deckCode: `== Main Deck ==
3x Charm
3x Clockwork Keeper
1x Confront
2x Defy
3x Discipline
3x En Garde
3x First Mate
3x Guardian Angel
2x Irelia, Fervent
3x Lonely Poro
1x Not So Fast
3x Punch First
3x Ruin Runner
1x Sea Monkey
2x Stellacorn Herder
1x Thwonk!
2x Trinity Force

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Forge of the Fluft
1x Grove of the God-Willow
1x Vilemaw's Lair

== Side Deck ==
2x Akshan, Mischievous
1x Defy
1x Disarming Rake
1x Sabotage
1x Thwonk!
1x Unyielding Spirit
1x Wind Wall`,
  },
  {
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Scout",
    player: "Nashun",
    placement: "19th",
    record: "10-2-1",
    domains: "Chaos/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
2x Beast Below
3x Black Market Broker
3x Ember Monk
2x Lecturing Yordle
3x Nocturne, Horrifying
3x Teemo, Strategist
2x Thousand-Tailed Watcher
2x Tideturner
3x Consult the Past
1x Guerilla Warfare
1x Hard Bargain
1x Rebuke
1x Ride the Wind
3x Sprite Call
3x Stacked Deck
3x Switcheroo
1x Time Warp
2x Edge of Night

== Runes ==
7x Chaos Rune
5x Mind Rune

== Battlefield ==
1x Bandle Tree
1x The Candlelit Sanctum
1x Vilemaw's Lair

== Side Deck ==
2x Acceptable Losses
1x Hard Bargain
1x Rebuke
1x Dr. Mundo, Expert
2x Windsinger
1x Edge of Night`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    player: "Jason h.",
    placement: "21st",
    record: "10-2-1",
    domains: "Chaos/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
3x Noxus Hopeful
3x Rek'Sai, Breacher
2x Ferrous Forerunner
3x Traveling Merchant
3x Kai'Sa, Survivor
3x Tideturner
3x Overzealous Fan
3x Vi, Destructive
3x Stacked Deck
3x Rebuke
3x Ride the Wind
3x Cleave
1x Flash
1x Falling Star
1x Hard Bargain
1x Boots of Swiftness

== Runes ==
5x Fury Rune
7x Chaos Rune

== Battlefield ==
1x The Arena's Greatest
1x Zaun Warrens
1x Minefield

== Side Deck ==
2x Factory Recall
1x Thermo Beam
1x Hard Bargain
1x Ferrous Forerunner
2x Gust
1x Switcheroo`,
  },
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "Rocklho",
    placement: "27th",
    record: "10-2-1",
    domains: "Calm/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Arise!
1x Charm
3x Deathgrip
2x Defy
3x Desert's Call
3x Discipline
2x En Garde
1x Facebreaker
3x Guards!
3x Hidden Blade
1x Salvage
3x B.F. Sword
3x Brutalizer
3x Doran's Shield
3x Eye of the Herald
2x Guardian Angel

== Runes ==
6x Calm Rune
6x Order Rune

== Battlefield ==
1x Hall of Legends
1x Seat of Power
1x Trifarian War Camp

== Side Deck ==
1x Charm
1x Cull the Weak
1x Defy
1x Facebreaker
1x Salvage
2x Wind Wall
1x Janna, Savior`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "Grant W.",
    placement: "28th",
    record: "10-2-1",
    domains: "Fury/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Baited Hook
3x Draven, Audacious
1x Ferrous Forerunner
1x Glasc Mixologist
3x Honest Broker
3x Noxus Hopeful
3x Seal of Unity
3x Spectral Matron
3x Trifarian Gloryseeker
2x Trusty Ramhound
3x Vanguard Captain
3x Xin Zhao, Vigilant
1x Deathgrip
1x Grand Strategem
3x Hidden Blade
3x Rally the Troops

== Runes ==
4x Fury Rune
8x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x Seat of Power
1x Trifarian War Camp`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Inquisitive",
    player: "Teh Bestest One",
    placement: "31st",
    record: "10-2-1",
    domains: "Calm/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Defy
3x Discipline
3x Ravenbloom Student
3x Thousand-Tailed Watcher
3x Feral Strength
3x Lonely Poro
2x Charm
2x Find Your Center
2x Meditation
2x Tasty Faefolk
2x Lecturing Yordle
2x Time Warp
2x Desert's Call
2x Thwonk!
1x Zhonya's Hourglass
1x Singularity
2x Irelia, Fervent
1x Blitzcrank, Impassive

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Grove of the God-Willow
1x Marai Spire

== Side Deck ==
2x Disarming Rake
2x Not So Fast
2x Bellows Breath
1x Ahri, Alluring
1x Thwonk!`,
  },
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "Dęamon",
    placement: "33rd",
    record: "10-2-1",
    domains: "Body/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
3x Challenge
3x Confront
3x Doran's Blade
3x First Mate
2x Gem Jammer
3x Kai'Sa, Survivor
3x Legion Rearguard
2x Lucian, Merciless
2x Pouty Poro
3x Punch First
3x Relentless Pursuit
3x Ruin Runner
3x Skyfall of Areion
3x Trinity Force

== Runes ==
8x Body Rune
4x Fury Rune

== Battlefield ==
1x Forge of the Fluft
1x The Candlelit Sanctum
1x Windswept Hillock

== Side Deck ==
3x Akshan, Mischievous
1x Angle Shot
3x Sabotage
1x Unyielding Spirit`,
  },
  {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    player: "Antyn V.",
    placement: "41st",
    record: "10-3",
    domains: "Body/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
2x Void Seeker
2x Falling Star
3x Kadregrin the Infernal
3x Confront
3x Catalyst of Aeons
3x Dazzling Aurora
3x Deadbloom Predator
2x Stormbringer
3x Ferrous Forerunner
1x Punch First
3x Sabotage
3x Challenge
3x Mobilize
1x Get Excited!
3x Sky Splitter
1x Volibear, Imposing

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Vilemaw's Lair

== Side Deck ==
2x Punch First
2x Akshan, Mischievous
2x Piercing Light
2x Unyielding Spirit`,
  },
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Victorious",
    player: "Haris V.",
    placement: "44th",
    record: "10-3",
    domains: "Body/Order",
    tier: "B",
    deckCode: `== Main Deck ==
3x First Mate
3x Pit Rookie
3x B.F. Sword
3x Unsung Hero
2x Spectral Matron
2x Doran's Blade
3x Karma, Channeler
3x Sett, Brawler
3x Challenge
3x Punch First
3x Riposte
2x Sabotage
2x Call to Glory
2x Hidden Blade
2x Deathgrip

== Runes ==
6x Body Rune
6x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x Trifarian War Camp
1x Sunken Temple`,
  },
  {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "Robert S.",
    placement: "45th",
    record: "10-3",
    domains: "Mind/Order",
    tier: "B",
    deckCode: `== Main Deck ==
3x Faithful Manufactor
3x Honest Broker
3x Lecturing Yordle
3x Plundering Poro
3x Thousand-Tailed Watcher
3x Xin Zhao, Vigilant
3x Bellows Breath
3x Cull the Weak
3x Hidden Blade
3x Imperial Decree
3x Singularity
3x Stupefy
3x Wages of Pain

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x The Arena's Greatest
1x Treasure Hoard
1x Void Gate`,
  },
  {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "Ali A.",
    placement: "61st",
    record: "10-3",
    domains: "Chaos/Body",
    tier: "B",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Sabotage
3x Punch First
3x Mobilize
2x Pack of Wonders
3x Treasure Trove
3x Challenge
2x Ride the Wind
1x Rebuke
1x Boots of Swiftness
2x Last Rites
3x Catalyst of Aeons
1x Primal Strength
3x Mindsplitter
3x Deadbloom Predator
3x Dazzling Aurora

== Runes ==
6x Chaos Rune
6x Body Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Vilemaw's Lair

== Side Deck ==
1x Pack of Wonders
1x Rebuke
2x Akshan, Mischievous
1x Fading Memories
2x Anivia, Primal
1x Soulgorger`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "Troy",
    placement: "72nd",
    record: "10-3",
    domains: "Calm/Body",
    tier: "B",
    deckCode: `== Main Deck ==
3x Charm
3x Defy
3x Stalwart Poro
3x Discipline
3x Zhonya's Hourglass
3x Challenge
3x First Mate
3x Lonely Poro
3x Punch First
2x Not So Fast
2x Doran's Blade
1x Clockwork Keeper
1x Desert's Call
3x Lucian, Merciless
2x Irelia, Fervent
1x Irelia, Fervent

== Runes ==
6x Calm Rune
6x Body Rune

== Battlefield ==
1x Monastery of Hirana
1x Zaun Warrens
1x Sunken Temple

== Side Deck ==
2x Unyielding Spirit
2x Sabotage
2x Disarming Rake
1x Thwonk!
1x Akshan, Mischievous`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "Chris R.",
    placement: "90th",
    record: "9-4",
    domains: "Order/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
3x Void Hatchling
3x Daring Poro
2x Trifarian Gloryseeker
3x Void Drone
3x Faithful Manufactor
3x Vanguard Captain
3x Noxus Hopeful
3x Battering Ram
3x Undertitan
3x Seal of Unity
3x Void Rush
3x Hidden Blade
2x Rally the Troops
1x Cull the Weak
1x Salvage

== Runes ==
11x Order Rune
1x Fury Rune

== Battlefield ==
1x The Candlelit Sanctum
1x The Arena's Greatest
1x Trifarian War Camp

== Side Deck ==
2x Salvage
2x Xin Zhao, Vigilant
2x Imperial Decree
2x Cull the Weak`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "Andre A.",
    placement: "93rd",
    record: "9-4",
    domains: "Fury/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
2x Breakneck Mech
3x Bubble Bot
2x Cloth Armor
3x Darius, Trifarian
2x Falling Star
3x Ferrous Forerunner
3x Forecaster
3x Gem Jammer
3x Kai'Sa, Survivor
2x Long Sword
2x Mega-Mech
2x Plundering Poro
1x Rumble, Hotheaded
2x Smoke Screen
3x Stupefy
3x Thousand-Tailed Watcher

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Seat of Power
1x Vilemaw's Lair
1x Zaun Warrens

== Side Deck ==
2x Angle Shot
2x Bellows Breath
2x Brynhir Thundersong
2x Thermo Beam`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "Jimbo in limbo",
    placement: "102nd",
    record: "9-4",
    domains: "Calm/Body",
    tier: "C",
    deckCode: `== Main Deck ==
3x Defy
1x Punch First
3x Challenge
3x Counter Strike
3x Discipline
2x Not So Fast
3x Brutalizer
3x Guardian Angel
2x Boneshiver
1x Doran's Blade
3x First Mate
2x Lucian, Merciless
3x Stellacorn Herder
3x Lonely Poro
2x Irelia, Fervent
1x Akshan, Mischievous
1x Ruin Runner

== Runes ==
6x Calm Rune
6x Body Rune

== Battlefield ==
1x Sunken Temple
1x Targon's Peak
1x Aspirant's Climb

== Side Deck ==
1x Punch First
2x Akshan, Mischievous
1x Wind Wall
1x Ruin Runner
1x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Forge God",
    player: "Angelo L.",
    placement: "124th",
    record: "9-4",
    domains: "Calm/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Clockwork Keeper
3x Lonely Poro
3x Pit Crew
3x Thousand-Tailed Watcher
2x Bellows Breath
2x Defy
2x Wind Wall
1x Charm
1x Svellsongur
3x Seal of Focus
3x Cloth Armor
3x Poro Snax
3x Guardian Angel
3x Sterak's Gage
3x World Atlas
1x Shurelya's Requiem

== Runes ==
7x Calm Rune
5x Mind Rune

== Battlefield ==
1x Treasure Hoard
1x Ornn's Forge
1x Sunken Temple

== Side Deck ==
2x Disarming Rake
2x Not So Fast
1x Wind Wall
1x Bellows Breath
1x Defy
1x Svellsongur`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Windrider",
    player: "Kyle S.",
    placement: "130th",
    record: "9-4",
    domains: "Calm/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
2x Charm
3x Defy
3x Discipline
3x En Garde
2x Hard Bargain
2x Ride the Wind
1x Stacked Deck
2x Switcheroo
2x Heart of Dark Ice
3x Mask of Foresight
2x Zhonya's Hourglass
2x Irelia, Fervent
3x Lonely Poro
3x Stellacorn Herder
1x Teemo, Scout
3x Tideturner
2x Traveling Merchant

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Seat of Power
1x Sunken Temple
1x Targon's Peak

== Side Deck ==
2x Adaptatron
1x Irelia, Fervent
1x Yasuo, Remorseful
1x Charm
2x Rebuke
1x Zhonya's Hourglass`,
  },
  {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "Jeff G.",
    placement: "153rd",
    record: "8-4-1",
    domains: "Body/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
2x Bullet Time
3x Catalyst of Aeons
2x Challenge
1x Confront
3x Gust
2x Hard Bargain
2x Invert Timelines
3x Mobilize
2x Punch First
1x Ride the Wind
3x Sabotage
3x Stacked Deck
3x Dazzling Aurora
2x Last Rites
2x Deadbloom Predator
3x Mindsplitter
2x Volibear, Imposing

== Runes ==
7x Body Rune
5x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Vilemaw's Lair

== Side Deck ==
1x Akshan, Mischievous
1x Miss Fortune, Buccaneer
1x Factory Recall
2x Fading Memories
3x Unyielding Spirit`,
  },
  {
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Crownguard",
    player: "Guillermo A.",
    placement: "156th",
    record: "6-2-1",
    domains: "Mind/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Cull the Weak
3x Drag Under
3x Falling Comet
3x Imperial Decree
3x Salvage
3x Singularity
2x Stupefy
1x Time Warp
3x Wages of Pain
3x Card Sharp
2x Jayce, Man of Progress
3x Plundering Poro
1x Garbage Grabber
3x Vanguard Armory

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Vilemaw's Lair

== Side Deck ==
2x Blood Money
1x Hidden Blade
2x King's Edict
1x Progress Day
2x Thousand-Tailed Watcher`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Determined",
    player: "Shuhan c.",
    placement: "319th",
    record: "5-2-1",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x B.F. Sword
2x Clockwork Keeper
2x Defy
3x Discipline
2x Emperor's Divide
3x Fiora, Victorious
3x Guardian Angel
2x Hidden Blade
3x Honest Broker
2x Janna, Savior
2x Leona, Determined
2x Not So Fast
2x Noxian Drummer
2x Salvage
3x Sona, Harmonious
2x Thwonk!
2x Zenith Blade

== Runes ==
6x Calm Rune
6x Order Rune

== Battlefield ==
1x Monastery of Hirana
1x Sunken Temple
1x Trifarian War Camp

== Side Deck ==
1x Blitzcrank, Impassive
1x Leona, Zealot
1x Salvage
2x Solari Shieldbearer
1x Wind Wall
2x Zhonya's Hourglass`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    player: "Anthony B.",
    placement: "356th",
    record: "5-3",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Bellows Breath
3x Cull the Weak
3x Hidden Blade
3x Hostile Takeover
1x Imperial Decree
3x Singularity
3x Stupefy
1x Time Warp
3x Card Sharp
3x Honest Broker
3x Jayce, Man of Progress
3x Plundering Poro
3x Thousand-Tailed Watcher
2x Watchful Sentry
3x Vanguard Armory

== Runes ==
7x Mind Rune
5x Order Rune

== Battlefield ==
1x Treasure Hoard
1x Trifarian War Camp
1x Veiled Temple

== Side Deck ==
1x Bellows Breath
1x Imperial Decree
3x Salvage
3x Pickpocket`,
  },
  {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Rugged",
    player: "Jason R.",
    placement: "496th",
    record: "5-3",
    domains: "Body/Order",
    tier: "D",
    deckCode: `== Main Deck ==
2x Blood Money
3x Catalyst of Aeons
2x Challenge
3x Confront
2x Cull the Weak
2x Hidden Blade
2x Imperial Decree
3x Mobilize
3x Rally the Troops
2x Vengeance
3x Dazzling Aurora
3x Forge of the Future
2x Vanguard Armory
3x Deadbloom Predator
3x Harnessed Dragon
1x Volibear, Imposing

== Runes ==
6x Body Rune
6x Order Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x The Papertree

== Side Deck ==
3x Sabotage
3x Salvage
2x Unyielding Spirit`,
  },
];

async function main() {
  console.log("Seeding Best of Atlanta...");

  const tierLabels: Record<string, string> = {
    S: "Tier S — Dominants",
    A: "Tier A — Compétitifs",
    B: "Tier B — Viables",
    C: "Tier C — Jouables",
    D: "Tier D — Outsiders",
  };

  const blocks: any[] = [
    {
      type: "text",
      id: "intro",
      content: `Le **Atlanta Regional Qualifier** a rassemblé environ **1500 joueurs** le 29 avril 2026 — le dernier Regional de la saison Spiritforged. Annie remporte le tournoi (14-1-1) pour sa 2e victoire en Regional après Nanjing. Draven finaliste (13-1-2) confirme sa domination post-ban — légende la plus jouée en Day 1, Day 2 et Top 8.

Le duo **Chaos/Fury** domine l'ère Spiritforged : Draven (3 titres) + Annie (2 titres) = 5 victoires sur 9 Regionals. Ce format est considéré comme déséquilibré par la communauté.

Voici les **28 meilleures decklists** — une par légende, au meilleur classement.`,
    },
  ];

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
      deckName: `${d.legend} — Best of Atlanta`,
      legendName: d.legend,
      playerName: d.player,
      context: `${d.placement} (${d.record}) — RQ Atlanta 2026 (${d.domains})`,
    });
  }

  const article = await prisma.article.create({
    data: {
      title: "Best of Atlanta — Toutes les légendes",
      slug: "best-of-atlanta-rq-2026",
      coverImage: "/img/articles/atlanta.webp",
      excerpt:
        "Les meilleures decklists pour chaque légende au Regional Qualifier d'Atlanta 2026 (~1500 joueurs). Dernier Regional Spiritforged.",
      category: "tournoi",
      tags: ["atlanta", "rq", "best-of", "meta", "spiritforged", "2026"],
      blocks: blocks as any,
      published: true,
      featured: true,
      publishedAt: new Date("2026-05-25"),
      tournamentName: "Regional Qualifier Atlanta 2026",
      tournamentDate: new Date("2026-04-29"),
      tournamentLocation: "Atlanta, USA",
      tournamentPlayerCount: 1500,
    },
  });

  console.log(`Article created: /articles/${article.slug}`);

  for (const d of BEST_OF) {
    const legendCard = await prisma.card.findFirst({
      where: {
        type: "Legend",
        name: { contains: d.legend.split(",")[0].trim(), mode: "insensitive" },
      },
    });

    const slug = `best-of-atlanta-${d.legend
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/g, "")}`;

    const existingDeck = await prisma.deck.findUnique({ where: { slug } });
    if (existingDeck) {
      console.log(`  Deck already exists: ${slug}, skipping`);
      continue;
    }

    // Use $executeRaw to set setTag since Prisma client doesn't know about it
    const deck = await prisma.deck.create({
      data: {
        title: `${d.legend} — Best of Atlanta`,
        slug,
        legendId: legendCard?.riftboundId ?? d.legend,
        legendName: d.legend,
        description: `Meilleur classement ${d.legend} au RQ Atlanta 2026 : ${d.placement} (${d.record}) par ${d.player}. ${d.domains}.`,
        format: "constructed",
        tags: ["atlanta", "rq", "best-of", d.tier.toLowerCase()],
        featured: true,
        published: true,
        sourceArticleId: article.id,
        tournamentContext: "RQ Atlanta 2026",
        tournamentTier: d.tier,
        placement: d.placement,
        playerName: d.player,
        record: d.record,
      },
    });

    // Set setTag to Spiritforged via raw query
    await prisma.$executeRaw`UPDATE "Deck" SET "setTag" = 'Spiritforged' WHERE id = ${deck.id}`;

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

  console.log("\nDone! Article + 28 decks created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
