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
  // ═══════ TIER 1 ═══════
  {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    player: "EDG Rico1997",
    placement: "1st",
    domains: "Calm/Chaos",
    tier: "S",
    deckCode: `== Main Deck ==
3x Defiant Dance
3x Defy
3x Discipline
3x Guardian Angel
3x Scuttle Crab
3x Tideturner
3x Boots of Swiftness
3x Stellacorn Herder
2x Charm
2x En Garde
2x Stacked Deck
2x Not So Fast
2x Ride the Wind
2x Star-Crossed
1x Gust
1x Fizz, Trickster
1x Adaptatron

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Sunken Temple
1x Targon's Peak`,
  },
  {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    player: "TSS SouledOut",
    placement: "2nd",
    domains: "Body/Chaos",
    tier: "S",
    deckCode: `== Main Deck ==
3x Flurry of Blades
3x Gust
3x Sabotage
3x Scryer's Bloom
3x Stacked Deck
3x Mobilize
3x Treasure Trove
3x Lunar Boon
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
2x Pack of Wonders
2x Last Rites
1x Disposal Order
1x Mindsplitter

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm`,
  },
  {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    player: "nice boy",
    placement: "3rd",
    domains: "Chaos/Mind",
    tier: "S",
    deckCode: `== Main Deck ==
3x Gust
3x Stacked Deck
3x Stupefy
3x Frigid Jewel
3x Ravenbloom Student
3x Ride the Wind
3x Tideturner
3x Hwei, Brooding Painter
2x Flash
2x Moonfall
2x Star-Crossed
2x Fizz, Trickster
1x Hard Bargain
1x Smoke Screen
1x Last Rites
1x Fading Memories
1x Vex, Apathetic
1x Vex, Cheerless
1x Mindsplitter

== Runes ==
6x Chaos Rune
6x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Ravenbloom Conservatory
1x Targon's Peak

== Side Deck ==
3x Turn to Dust
2x Eclipse
1x Falling Comet
1x Singularity
1x Baron Nashor`,
  },
  {
    legend: "Vex, Gloomist",
    champion: "Vex, Apathetic",
    player: "EEP Bonk Repeat",
    placement: "4th",
    domains: "Calm/Chaos",
    tier: "S",
    deckCode: `== Main Deck ==
3x Discipline
3x Emperor's Divide
3x Evelynn, Entrancing
3x Mutated Mouser
3x Teemo, Scout
2x Defy
2x Existential Dread
2x Gust
2x Treasure Hunter
2x Back Off
2x Boots of Swiftness
2x Edge of Night
2x Pyke, Returned
2x Ember Monk
2x Kha'Zix, Mutating Horror
2x Sona, Harmonious
1x Switcheroo
1x Star-Crossed

== Runes ==
7x Chaos Rune
5x Calm Rune

== Battlefield ==
1x Bandle Tree
1x Star Spring
1x Startipped Peak

== Side Deck ==
2x Gust
2x Ahri, Alluring
1x Abandon
1x Not So Fast
1x Hard Bargain
1x Star-Crossed`,
  },
  {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Honed",
    player: "Moo",
    placement: "5th",
    domains: "Body/Calm",
    tier: "S",
    deckCode: `== Main Deck ==
3x Charm
3x Defy
3x Discipline
3x Zhonya's Hourglass
3x Find Your Center
3x Stalwart Poro
3x Clockwork Keeper
3x Tasty Faefolk
3x Deadbloom Predator
2x En Garde
2x Pit Rookie
2x Catalyst of Aeons
2x Whiteflame Protector
1x Sabotage
1x Qiyana, Victorious
1x First Mate

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Aspirant's Climb
1x Grove of the God-Willow
1x Vilemaw's Lair

== Side Deck ==
3x Dazzling Aurora
2x Mobilize
1x Rune Prison
1x Unyielding Spirit
1x Volibear, Imposing`,
  },
  {
    legend: "LeBlanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    player: "CTCG DZiden",
    placement: "7th",
    domains: "Mind/Order",
    tier: "S",
    deckCode: `== Main Deck ==
3x Sacrifice
3x Soaring Scout
3x Watchful Sentry
3x Baited Hook
3x Black Rose Dignitary
3x Karthus, Eternal
3x Mirror Image
3x Glasc Mixologist
3x Ruined Rex
3x Harnessed Dragon
3x Rift Herald
2x Hidden Blade
2x Galio, Indefatigable
1x Vi, Peacekeeper
1x Thousand-Tailed Watcher

== Runes ==
8x Order Rune
4x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Star Spring
1x Windswept Hillock

== Side Deck ==
3x Ashe, Focused
2x Vi, Peacekeeper
1x Atakhan
1x LeBlanc, Everywhere at Once
1x Turn to Dust`,
  },
  // ═══════ TIER 2 ═══════
  {
    legend: "Fiora, Grand Duelist",
    champion: "Fiora, Worthy",
    player: "DleepsDream",
    placement: "49th",
    domains: "Body/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Pit Rookie
3x Unsung Hero
3x B.F. Sword
3x Baited Hook
3x Spectral Matron
2x First Mate
2x Sett, Brawler
2x Harnessed Dragon
2x Shepherd's Heirloom
2x Punch First
2x Riposte
2x Grim Resolve
2x Salvage
2x Challenge
1x Fiora, Worthy
1x Akshan, Mischievous
1x Sacrifice
1x Kinkou Initiate
1x Ashe, Focused

== Runes ==
6x Body Rune
6x Order Rune

== Battlefield ==
1x Ornn's Forge
1x Sunken Temple
1x Trifarian War Camp

== Side Deck ==
2x Unyielding Spirit
2x Repulse
1x Sabotage
1x Fiora, Victorious
1x Hidden Blade
1x Call to Glory`,
  },
  {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    player: "Bottle Outfire",
    placement: "25th",
    domains: "Body/Chaos",
    tier: "A",
    deckCode: `== Main Deck ==
3x Flurry of Blades
3x Stacked Deck
3x Mobilize
3x Scryer's Bloom
3x Lunar Boon
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
2x Gust
2x Sabotage
2x Last Rites
2x Invert Timelines
1x Mindsplitter
1x Baron Nashor
1x Abandon
1x Fading Memories

== Runes ==
6x Body Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Forgotten Monument
1x Sigil of the Storm

== Side Deck ==
3x Abandon
3x Fading Memories
2x Unyielding Spirit`,
  },
  {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    player: "CTCG Collin K",
    placement: "8th",
    domains: "Body/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Punch First
3x Sabotage
3x Showstopper
3x Cithria of Cloudfield
3x Pit Rookie
3x Arena Bar
3x Call to Glory
3x First Mate
3x Lucian, Merciless
3x Fiora, Victorious
2x Challenge
2x Hidden Blade
1x Sea Monkey
1x Akshan, Mischievous
1x Kinkou Monk
2x Fae Dragon

== Runes ==
7x Body Rune
5x Order Rune

== Battlefield ==
1x Grove of the God-Willow
1x Monastery of Hirana
1x Sunken Temple

== Side Deck ==
2x Akshan, Mischievous
2x Facebreaker
2x Unyielding Spirit
1x Hidden Blade
1x Sett, Brawler`,
  },
  {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    player: "Blaze Garden",
    placement: "69th",
    domains: "Chaos/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Spinning Axe
3x Overzealous Fan
3x Tideturner
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Darius, Trifarian
3x Ferrous Forerunner
2x Cleave
2x Falling Star
2x Flash
2x Rebuke
2x Ride the Wind
1x Hard Bargain
1x Brynhir Thundersong
1x Draven, Audacious

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Aspirant's Climb
1x Targon's Peak
1x Zaun Warrens

== Side Deck ==
1x Against the Odds
1x Factory Recall
1x Gust
1x Hard Bargain
1x Last Rites
1x Switcheroo
1x Thermo Beam
1x Brynhir Thundersong`,
  },
  {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Trophy Hunter",
    player: "Plashlack",
    placement: "11th",
    domains: "Body/Fury",
    tier: "A",
    deckCode: `== Main Deck ==
3x Cleave
3x Pit Rookie
3x First Mate
3x Rengar, Trophy Hunter
3x Inferna
3x Irresistible Faefolk
3x Thrill of the Hunt
2x Confront
2x Here to Help
2x Nidalee, Cat Form
2x Noxus Hopeful
2x Pyke, Dockside Butcher
2x Rengar, Pouncing
2x Brynhir Thundersong
1x Against the Odds
1x Right of Conquest
1x Lucian, Merciless
1x Tryndamere, Barbarian

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Emperor's Dais
1x Star Spring
1x Sunken Temple

== Side Deck ==
2x Sabotage
2x Unyielding Spirit
1x Against the Odds
1x Confront
1x Here to Help
1x Brynhir Thundersong`,
  },
  {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    player: "yelling scutter",
    placement: "25th",
    domains: "Calm/Order",
    tier: "A",
    deckCode: `== Main Deck ==
3x Defy
3x Doran's Shield
3x Eye of the Herald
3x Soul Sword
3x Brutalizer
3x Discipline
3x B.F. Sword
3x Arise!
2x Sacrifice
2x Cull the Weak
2x Deathgrip
2x Hidden Blade
2x Shadow's Call
2x Back Off
2x Guards!
1x Ashe, Focused

== Runes ==
6x Calm Rune
6x Order Rune

== Battlefield ==
1x Hall of Legends
1x Ornn's Forge
1x Trifarian War Camp

== Side Deck ==
2x Flurry of Feathers
2x Salvage
1x Ashe, Focused
1x Back Off
1x Charm
1x Cull the Weak`,
  },
  // ═══════ TIER 3 ═══════
  {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    player: "Raweontool",
    placement: "21st",
    domains: "Body/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
3x Mobilize
3x Scryer's Bloom
3x Lunar Boon
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
3x Dragonsoul Sage
2x Challenge
2x Kadregrin the Infernal
2x Herald of Scales
2x Inferna
2x Repulse
2x Sabotage
2x Poppy, Paragon
1x Against the Odds
1x Here to Help
1x Baron Nashor
1x Mindsplitter

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Aspirant's Climb
1x Emperor's Dais
1x Zaun Warrens

== Side Deck ==
2x Keeper's Verdict
2x Against the Odds
1x Sabotage
1x Repulse
1x Firestorm
1x Unyielding Spirit`,
  },
  {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    player: "Prismaticismism",
    placement: "46th",
    domains: "Chaos/Fury",
    tier: "B",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Flash
3x Overzealous Fan
3x Traveling Merchant
3x Tideturner
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Ferrous Forerunner
2x Cleave
2x Hard Bargain
2x Rebuke
2x Ride the Wind
2x Rek'Sai, Breacher
2x Rengar, Pouncing
1x Long Sword
1x Gust
1x Switcheroo

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Seat of Power
1x The Arena's Greatest
1x Zaun Warrens

== Side Deck ==
1x Against the Odds
1x Factory Recall
1x Gust
1x Hard Bargain
1x Mindsplitter
1x Rebuke
1x Switcheroo
1x Thermo Beam`,
  },
  {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Leader",
    player: "Grumman73696",
    placement: "24th",
    domains: "Mind/Order",
    tier: "B",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Stupefy
3x Cull the Weak
3x Hidden Blade
3x Honest Broker
3x Pickpocket
3x Wages of Pain
3x Xin Zhao, Vigilant
3x Thousand-Tailed Watcher
2x Singularity
2x Imperial Decree
1x Plundering Poro
1x Salvage
1x Faithful Manufactor
1x Vengeance
1x Glasc Mixologist
1x Riptide Rex
1x Time Warp

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x Ravenbloom Conservatory
1x Treasure Hoard
1x Void Gate

== Side Deck ==
2x Glasc Mixologist
2x Salvage
1x Card Sharp
1x Faithful Manufactor
1x Imperial Decree
1x Riptide Rex`,
  },
  {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    player: "NaMeH5",
    placement: "8th",
    domains: "Mind/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Gust
3x Stacked Deck
3x Stupefy
3x Plundering Poro
3x Ravenbloom Student
3x Card Sharp
3x Wages of Pain
2x Rebuke
2x Smoke Screen
2x Arcane Shift
2x Fizz, Trickster
2x Mindsplitter
2x Thousand-Tailed Watcher
1x Hard Bargain
1x Factory Recall
1x Singularity

== Runes ==
6x Mind Rune
6x Chaos Rune

== Battlefield ==
1x Aspirant's Climb
1x Sigil of the Storm
1x Void Gate

== Side Deck ==
2x Acceptable Losses
2x Vex, Cheerless
1x Arcane Shift
1x Dr. Mundo, Expert
1x Hard Bargain
1x Mindsplitter`,
  },
  {
    legend: "Kha'Zix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    player: "PPGMG",
    placement: "26th",
    domains: "Body/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Mobilize
3x Scryer's Bloom
3x Lunar Boon
3x Catalyst of Aeons
3x Dazzling Aurora
3x Elder Dragon
2x Gust
2x Sabotage
2x Void Assault
2x Last Rites
2x Flurry of Blades
2x Ride the Wind
1x Baron Nashor
1x Mindsplitter
1x Void Rush
1x On the Hunt
1x Boots of Swiftness

== Runes ==
6x Body Rune
6x Mind Rune

== Battlefield ==
1x Altar of Blood
1x The Papertree
1x Vaults of Helia

== Side Deck ==
3x Mindsplitter
2x Abandon
2x Fading Memories
1x Sabotage`,
  },
  {
    legend: "Kai'Sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    player: "Sun70Flexed",
    placement: "8th",
    domains: "Fury/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Cleave
3x Hextech Ray
3x Stupefy
3x Falling Star
3x Ravenbloom Student
3x Watchful Sentry
3x Noxus Hopeful
3x Darius, Trifarian
3x Thousand-Tailed Watcher
2x Retreat
2x Pouty Poro
2x Lecturing Yordle
2x Time Warp
1x Smoke Screen
1x Icathian Rain
1x Void Seeker

== Runes ==
7x Fury Rune
5x Mind Rune

== Battlefield ==
1x The Arena's Greatest
1x The Candlelit Sanctum
1x Void Gate

== Side Deck ==
2x Thermo Beam
2x Progress Day
1x Icathian Rain
1x Lecturing Yordle
1x Singularity
1x Void Seeker`,
  },
  {
    legend: "Lillia, Bashful Bloom",
    champion: "Lillia, Fae Fawn",
    player: "flemuex",
    placement: "34th",
    domains: "Calm/Mind",
    tier: "B",
    deckCode: `== Main Deck ==
3x Charm
3x Stupefy
3x Plundering Poro
3x Ravenbloom Student
3x Sprite Fountain
3x Sprite Call
3x Sprite Burst
2x Lillia, Fae Fawn
2x Thousand-Tailed Watcher
2x Defy
2x Sprite Mother
2x Sprite Queen
2x Heart of Dark Ice
1x Unchecked Power
1x Mask of Foresight
1x Lilting Lullaby
1x Singularity

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Dusk Rose Lab
1x Rockfall Path
1x The Arena's Greatest

== Side Deck ==
3x Turn to Dust
2x Falling Comet
1x Charm
1x Lilting Lullaby
1x Singularity`,
  },
  {
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Strategist",
    player: "AshenOCE",
    placement: "6th",
    domains: "Mind/Chaos",
    tier: "B",
    deckCode: `== Main Deck ==
3x Sprite Fountain
3x Switcheroo
3x Teemo, Scout
3x Tideturner
3x Windsinger
3x Sprite Call
3x Consult the Past
3x Nocturne, Horrifying
2x Existential Dread
2x Bone Skewer
2x Guerilla Warfare
2x Teemo, Strategist
2x Sneaky Deckhand
1x Abandon
1x Evelynn, Entrancing
1x Ride the Wind
1x Singularity
1x Baron Nashor

== Runes ==
7x Mind Rune
5x Chaos Rune

== Battlefield ==
1x Grove of the God-Willow
1x Startipped Peak
1x The Arena's Greatest

== Side Deck ==
3x Turn to Dust
2x Sprite Burst
1x Fading Memories
1x Abandon
1x Singularity`,
  },
  // ═══════ TIER 4 ═══════
  {
    legend: "Master Yi, Wuju Master",
    champion: "Master Yi, Tempered",
    player: "YoungNorthMan",
    placement: "67th",
    domains: "Body/Calm",
    tier: "C",
    deckCode: `== Main Deck ==
3x Defy
3x Discipline
3x Gemhand Hunter
3x Wuju Apprentice
3x Zhonya's Hourglass
3x Herald of Spring
3x Concentrate
2x Combat Experience
2x Grim Resolve
2x Scuttle Crab
2x Back Off
2x Alpha Strike
2x Whiteflame Protector
2x Master Yi, Unstoppable
2x Voracious Gromp
1x Charm
1x Skyward Strike
1x Rengar, Trophy Hunter

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Gardens of Becoming
1x Reckoner's Arena
1x Trifarian War Camp

== Side Deck ==
3x Disarming Rake
2x Unyielding Spirit
1x Sabotage
1x Stare Down
1x Arachnoid Horror`,
  },
  {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    player: "Kukijin",
    placement: "49th",
    domains: "Body/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
3x Cleave
3x Pit Rookie
3x First Mate
3x Cithria of Cloudfield
3x Punch First
3x Challenge
3x Inferna
3x Irresistible Faefolk
2x Confront
2x Hidden Blade
2x Repulse
2x Noxus Hopeful
1x Cithria of Cloudfield
1x Against the Odds
1x Sett, Brawler
1x Brynhir Thundersong
1x Ferrous Forerunner

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Sunken Temple
1x Trifarian War Camp
1x Zaun Warrens

== Side Deck ==
2x Sabotage
2x Unyielding Spirit
1x Challenge
1x Brynhir Thundersong
1x Ferrous Forerunner
1x Repulse`,
  },
  {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Forge God",
    player: "Galamaul",
    placement: "27th",
    domains: "Calm/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Defy
3x Charm
3x Lecturing Yordle
3x Sprite Fountain
3x Sprite Call
3x Sprite Burst
3x Svellsongur
3x Consult the Past
2x Lonely Poro
2x Poro Snax
2x Pit Crew
2x Singularity
2x Sprite Queen
2x Thousand-Tailed Watcher
1x Jhin, Meticulous Killer
1x Progress Day
1x Time Warp

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Dusk Rose Lab
1x Ornn's Forge
1x Vaults of Helia

== Side Deck ==
2x Turn to Dust
2x Not So Fast
2x Falling Comet
1x Wind Wall
1x Singularity`,
  },
  {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Returned",
    player: "jimmmp",
    placement: "95th",
    domains: "Chaos/Fury",
    tier: "C",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Bone Skewer
3x Spinning Axe
3x Tideturner
3x Traveling Merchant
3x Nocturne, Horrifying
3x Battering Ram
2x Gust
2x Rebuke
2x Ride the Wind
2x Sneaky Deckhand
2x Rhasa the Sunderer
2x Noxus Hopeful
1x Hard Bargain
1x Fading Memories
1x Mindsplitter

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Abandoned Hall
1x The Arena's Greatest
1x Zaun Warrens

== Side Deck ==
2x Falling Star
2x Brynhir Thundersong
1x Rebuke
1x Switcheroo
1x Thermo Beam
1x Gust`,
  },
  {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    player: "Reitsonina",
    placement: "96th",
    domains: "Fury/Order",
    tier: "C",
    deckCode: `== Main Deck ==
3x Cleave
3x Sacrifice
3x Cull the Weak
3x Pit Rookie
3x First Mate
3x Noxus Hopeful
3x Darius, Trifarian
2x Hidden Blade
2x Brynhir Thundersong
2x Inferna
2x Battering Ram
2x Ferrous Forerunner
2x Repulse
2x Confront
1x Against the Odds
1x Challenge
1x Sabotage
1x Tryndamere, Barbarian

== Runes ==
6x Fury Rune
6x Order Rune

== Battlefield ==
1x Emperor's Dais
1x Sunken Temple
1x Trifarian War Camp

== Side Deck ==
2x Sabotage
2x Unyielding Spirit
1x Brynhir Thundersong
1x Cull the Weak
1x Challenge
1x Repulse`,
  },
  {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    player: "Black Pepper",
    placement: "88th",
    domains: "Body/Calm",
    tier: "C",
    deckCode: `== Main Deck ==
3x Defy
3x Discipline
3x Counter Strike
3x Lonely Poro
3x Warmog's Armor
3x Brutalizer
3x Guardian Angel
3x Rengar, Trophy Hunter
2x Challenge
2x Not So Fast
2x Scuttle Crab
2x Desert's Call
2x Nidalee, Cat Form
2x Lucian, Merciless
2x Irelia, Fervent

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Monastery of Hirana
1x Ornn's Forge
1x Sunken Temple

== Side Deck ==
3x Ruin Runner
3x Unyielding Spirit
2x Akshan, Mischievous`,
  },
  {
    legend: "Rek'Sai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    player: "Trickerstol",
    placement: "96th",
    domains: "Fury/Chaos",
    tier: "C",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Spinning Axe
3x Tideturner
3x Kai'Sa, Survivor
3x Noxus Hopeful
3x Darius, Trifarian
3x Ferrous Forerunner
2x Cleave
2x Rebuke
2x Ride the Wind
2x Flash
2x Falling Star
2x Rek'Sai, Breacher
1x Hard Bargain
1x Brynhir Thundersong
1x Gust
1x Switcheroo
1x Beast Below

== Runes ==
6x Fury Rune
6x Chaos Rune

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
  {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Meticulous Killer",
    player: "Race",
    placement: "66th",
    domains: "Fury/Mind",
    tier: "C",
    deckCode: `== Main Deck ==
3x Curtain Call
3x Deadly Flourish
3x Stupefy
3x Ravenbloom Student
2x Watchful Sentry
2x Jhin, Meticulous Killer
2x Brynhir Thundersong
2x Thousand-Tailed Watcher
2x Seal of Insight
2x Consult the Past
2x Rocket Barrage
2x Square Up
2x Sprite Burst
2x Progress Day
2x Singularity
2x Time Warp
1x Unchecked Power
1x Plundering Poro
1x Ekko, Recurrent

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Forgotten Library
1x Frozen Fortress
1x Startipped Peak

== Side Deck ==
2x Bellows Breath
2x Card Sharp
2x Falling Comet
1x Turn to Dust
1x Unchecked Power`,
  },
  {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Chem-Baroness",
    player: "Autin",
    placement: "98th",
    domains: "Mind/Calm",
    tier: "C",
    deckCode: `== Main Deck ==
3x Stupefy
3x Bellows Breath
3x Plundering Poro
3x Ravenbloom Student
3x Sprite Fountain
3x Consult the Past
3x Thousand-Tailed Watcher
2x Smoke Screen
2x Sprite Call
2x Lecturing Yordle
2x Singularity
2x Progress Day
2x Time Warp
2x Heart of Dark Ice
1x Charm
1x Defy
1x Unchecked Power
1x Sprite Burst

== Runes ==
6x Mind Rune
6x Calm Rune

== Battlefield ==
1x Dusk Rose Lab
1x Rockfall Path
1x Vaults of Helia

== Side Deck ==
3x Turn to Dust
2x Falling Comet
1x Singularity
1x Charm
1x Unchecked Power`,
  },
  // ═══════ TIER 5 ═══════
  {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    player: "CTCG Villionaire",
    placement: "75th",
    domains: "Body/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
3x Repulse
3x Dragonsoul Sage
3x Mobilize
3x Show of Strength
3x Blazing Scorcher
3x Minotaur Reckoner
3x Poppy, Paragon
3x Direwing
3x Gentle Gemdragon
3x Kadregrin the Infernal
2x Herald of Scales
2x Sky Splitter
2x Elder Dragon
1x Challenge
1x Here to Help
1x Brynhir Thundersong

== Runes ==
6x Body Rune
6x Fury Rune

== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Trapping Grounds

== Side Deck ==
2x Ferrous Forerunner
2x Rengar, Trophy Hunter
2x Sabotage
2x Unyielding Spirit`,
  },
  {
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Peacekeeper",
    player: "artiesion",
    placement: "79th",
    domains: "Fury/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Cleave
3x Pit Rookie
3x First Mate
3x Punch First
3x Noxus Hopeful
3x Inferna
3x Irresistible Faefolk
2x Repulse
2x Hidden Blade
2x Pyke, Dockside Butcher
2x Long Sword
2x Challenge
2x Falling Star
2x Brynhir Thundersong
1x Sabotage
1x Sett, Brawler
1x Darius, Trifarian

== Runes ==
6x Fury Rune
6x Order Rune

== Battlefield ==
1x Sunken Temple
1x Trifarian War Camp
1x Zaun Warrens

== Side Deck ==
2x Unyielding Spirit
2x Sabotage
1x Brynhir Thundersong
1x Cull the Weak
1x Challenge
1x Repulse`,
  },
  {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Unhinged",
    player: "Playerf17",
    placement: "97th",
    domains: "Chaos/Fury",
    tier: "D",
    deckCode: `== Main Deck ==
3x Stacked Deck
3x Tideturner
3x Traveling Merchant
3x Noxus Hopeful
3x Darius, Trifarian
3x Ferrous Forerunner
3x Overzealous Fan
2x Cleave
2x Flash
2x Rebuke
2x Ride the Wind
2x Kai'Sa, Survivor
2x Sneaky Deckhand
2x Spinning Axe
1x Gust
1x Hard Bargain
1x Switcheroo
1x Brynhir Thundersong

== Runes ==
6x Chaos Rune
6x Fury Rune

== Battlefield ==
1x Seat of Power
1x Targon's Peak
1x Zaun Warrens

== Side Deck ==
2x Falling Star
1x Against the Odds
1x Gust
1x Rebuke
1x Thermo Beam
1x Switcheroo
1x Brynhir Thundersong`,
  },
  {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Alluring",
    player: "Kuwait Troubles",
    placement: "137th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Charm
3x Defy
3x Stupefy
3x Plundering Poro
3x Ravenbloom Student
3x Sprite Fountain
3x Sprite Call
3x Sprite Burst
2x Ahri, Alluring
2x Back Off
2x Singularity
2x Thousand-Tailed Watcher
2x Heart of Dark Ice
2x Sprite Queen
1x Unchecked Power
1x Not So Fast
1x Tasty Faefolk

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Dusk Rose Lab
1x Ravenbloom Conservatory
1x The Arena's Greatest

== Side Deck ==
3x Turn to Dust
2x Plundering Poro
1x Ahri, Alluring
1x Charm
1x Heart of Dark Ice`,
  },
  {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Solari",
    player: "Go Mo IV",
    placement: "66th",
    domains: "Calm/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Defy
3x Discipline
3x Charm
3x Stalwart Poro
3x Clockwork Keeper
3x Find Your Center
3x Catalyst of Aeons
3x Dazzling Aurora
2x Sacrifice
2x Cull the Weak
2x Hidden Blade
2x Tasty Faefolk
2x Whiteflame Protector
2x Deadbloom Predator
1x Ashe, Focused
1x Volibear, Imposing
1x Unyielding Spirit

== Runes ==
6x Calm Rune
6x Order Rune

== Battlefield ==
1x Aspirant's Climb
1x Grove of the God-Willow
1x Vilemaw's Lair

== Side Deck ==
2x Salvage
2x Turn to Dust
1x Ashe, Focused
1x Cull the Weak
1x Sabotage
1x Charm`,
  },
  {
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Radiant",
    player: "Ffilowalty",
    placement: "160th",
    domains: "Mind/Order",
    tier: "D",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Stupefy
3x Card Sharp
3x Plundering Poro
3x Ravenbloom Student
3x Honest Broker
3x Pickpocket
3x Wages of Pain
2x Singularity
2x Thousand-Tailed Watcher
2x Progress Day
2x Falling Comet
2x Rocket Barrage
2x Imperial Decree
1x Glasc Mixologist
1x Time Warp
1x Garbage Grabber

== Runes ==
6x Mind Rune
6x Order Rune

== Battlefield ==
1x Ravenbloom Conservatory
1x Void Gate
1x Windswept Hillock

== Side Deck ==
2x Salvage
2x Turn to Dust
1x Glasc Mixologist
1x Salvage
1x Progress Day
1x Imperial Decree`,
  },
  {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    player: "Sniper Reference",
    placement: "63rd",
    domains: "Body/Calm",
    tier: "D",
    deckCode: `== Main Deck ==
3x Defy
3x Discipline
3x Gemhand Hunter
3x Wuju Apprentice
3x Zhonya's Hourglass
3x Elder Dragon
3x Back Off
2x Lee Sin, Centered
2x Charm
2x Scuttle Crab
2x Find Your Center
2x Herald of Spring
2x Whiteflame Protector
2x Voracious Gromp
1x Alpha Strike
1x Rengar, Trophy Hunter
1x Kadregrin the Infernal
1x Meditation

== Runes ==
6x Body Rune
6x Calm Rune

== Battlefield ==
1x Aspirant's Climb
1x Gardens of Becoming
1x Reckoner's Arena

== Side Deck ==
2x Disarming Rake
2x Unyielding Spirit
1x Charm
1x Not So Fast
1x Voracious Gromp
1x Sabotage`,
  },
  {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Wanderer",
    player: "Sussy",
    placement: "103rd",
    domains: "Calm/Chaos",
    tier: "D",
    deckCode: `== Main Deck ==
3x Charm
3x Defy
3x Discipline
3x Lonely Poro
3x Tideturner
3x Stellacorn Herder
2x En Garde
2x Not So Fast
2x Stacked Deck
2x Ride the Wind
2x Star-Crossed
2x Boots of Swiftness
2x Last Rites
2x Sneaky Deckhand
1x Gust
1x Flash
1x Zhonya's Hourglass
1x The Syren
1x Hard Bargain
1x Switcheroo

== Runes ==
6x Calm Rune
6x Chaos Rune

== Battlefield ==
1x Abandoned Hall
1x Sunken Temple
1x Targon's Peak

== Side Deck ==
2x Turn to Dust
2x Star-Crossed
1x The Syren
1x Abandon
1x Fading Memories
1x Vex, Apathetic`,
  },
  {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    player: "Crowned",
    placement: "29th",
    domains: "Fury/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Bellows Breath
3x Stupefy
3x Stacked Deck
3x Tideturner
3x Ravenbloom Student
3x Hwei, Brooding Painter
2x Gust
2x Flash
2x Moonfall
2x Ride the Wind
2x Rebuke
2x Rocket Barrage
2x Mindsplitter
1x Hard Bargain
1x Smoke Screen
1x Fading Memories
1x Eclipse
1x Vex, Apathetic
1x Thousand-Tailed Watcher

== Runes ==
6x Fury Rune
6x Mind Rune

== Battlefield ==
1x Abandoned Hall
1x Ravenbloom Conservatory
1x The Arena's Greatest

== Side Deck ==
3x Turn to Dust
2x Deadly Flourish
1x Hard Bargain
1x Vex, Apathetic
1x Vex, Cheerless`,
  },
  {
    legend: "Ivern, Green Father",
    champion: "Ivern, Nurturer",
    player: "NexInRegion",
    placement: "37th",
    domains: "Calm/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Charm
3x Defy
3x Stupefy
3x Sprite Fountain
3x Sprite Call
3x Sprite Burst
3x Stalwart Poro
3x Ravenbloom Student
2x Sprite Mother
2x Sprite Queen
2x Lonely Poro
2x Back Off
2x Heart of Dark Ice
2x Tasty Faefolk
1x Singularity
1x Thousand-Tailed Watcher
1x Unchecked Power

== Runes ==
6x Calm Rune
6x Mind Rune

== Battlefield ==
1x Dusk Rose Lab
1x Rockfall Path
1x The Arena's Greatest

== Side Deck ==
3x Turn to Dust
2x Not So Fast
1x Back Off
1x Falling Comet
1x Ivern, Nurturer`,
  },
  {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Decisive",
    player: "Rinality",
    placement: "245th",
    domains: "Body/Mind",
    tier: "D",
    deckCode: `== Main Deck ==
3x Punch First
3x Challenge
3x Pit Rookie
3x First Mate
3x Elder Dragon
3x Dragonsoul Sage
3x Dazzling Aurora
3x Catalyst of Aeons
2x Mobilize
2x Kadregrin the Infernal
2x Repulse
2x Herald of Scales
2x Here to Help
1x Sabotage
1x Scryer's Bloom
1x Against the Odds
1x Inferna
1x Brynhir Thundersong

== Runes ==
6x Body Rune
6x Mind Rune

== Battlefield ==
1x Aspirant's Climb
1x Frozen Fortress
1x Zaun Warrens

== Side Deck ==
2x Unyielding Spirit
2x Against the Odds
1x Sabotage
1x Repulse
1x Firestorm
1x Inferna`,
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
        title: `${d.legend} — Best of Sydney`,
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

    // Parse deck code and create DeckCard entries
    const parsed = parseDeckCode(d.deckCode);
    let created = 0;

    const seen = new Set<string>();
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
