import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

interface DeckData {
  legend: string;
  champion: string;
  main: string[];
  battlefield: string[];
  rune: string[];
  side: string[];
}

function parseEntries(lines: string[]): { qty: number; name: string }[] {
  return lines.map((l) => {
    const m = l.match(/^(\d+)\s+(.+)$/);
    if (!m) throw new Error(`Bad line: ${l}`);
    return { qty: parseInt(m[1]), name: m[2].trim() };
  });
}

const DECKS: Record<string, DeckData> = {
  "Miss Fortune, Bounty Hunter": {
    legend: "Miss Fortune, Bounty Hunter",
    champion: "Miss Fortune, Captain",
    main: [
      "1 Abandon","1 Bullet Time","3 Catalyst of Aeons","3 Confront","3 Dazzling Aurora",
      "3 Elder Dragon","3 Flurry of Blades","3 Gust","2 Heedless Resurrection",
      "2 Invert Timelines","2 Last Rites","3 Lunar Boon","1 Mindsplitter","3 Mobilize",
      "3 Scryer's Bloom","3 Stacked Deck",
    ],
    battlefield: ["1 Aspirant's Climb","1 Forgotten Monument","1 The Papertree"],
    rune: ["7 Body Rune","5 Chaos Rune"],
    side: ["2 Downwell","3 Sabotage","3 Unyielding Spirit"],
  },
  "Ornn, Fire Below the Mountain": {
    legend: "Ornn, Fire Below the Mountain",
    champion: "Ornn, Forge God",
    main: [
      "2 Janna, Savior","3 Charm","3 Lecturing Yordle","3 Desert's Call","3 Lonely Poro",
      "3 Brutalizer","3 Sterak's Gage","3 Sprite Fountain","2 Defy","2 Discipline",
      "2 Pit Crew","2 Stupefy","2 Sprite Mother","2 Poro Snax","2 Dropboarder",
      "1 Heart of Dark Ice","1 Shurelya's Requiem",
    ],
    battlefield: ["1 The Arena's Greatest","1 Ornn's Forge","1 Dusk Rose Lab"],
    rune: ["8 Calm Rune","4 Mind Rune"],
    side: ["3 Disarming Rake","2 Singularity","2 Turn to Dust","1 Defy"],
  },
  "Pyke, Bloodharbor Ripper": {
    legend: "Pyke, Bloodharbor Ripper",
    champion: "Pyke, Dockside Butcher",
    main: [
      "1 Abandon","2 Baron Nashor","3 Bewitching Spirit","1 Blood Rush","2 Cleave",
      "2 Darius, Trifarian","1 Death from Below","1 Ezreal, Prodigy","3 Falling Star",
      "2 Fizz, Trickster","2 Inferna","1 Kai'Sa, Survivor","1 Mindsplitter",
      "3 Noxus Hopeful","1 Ride the Wind","2 Sharkling","3 Stacked Deck",
      "2 Star-Crossed","1 Tideturner","3 Treasure Hunter","2 Windsinger",
    ],
    battlefield: ["1 Forbidding Waste","1 Ripper's Bay","1 The Candlelit Sanctum"],
    rune: ["6 Chaos Rune","6 Fury Rune"],
    side: ["2 Acceptable Losses","1 Star-Crossed","2 Switcheroo","2 Thermo Beam","1 Vex, Apathetic"],
  },
  "Rek'Sai, Void Burrower": {
    legend: "Reksai, Void Burrower",
    champion: "Rek'Sai, Breacher",
    main: [
      "3 Soaring Scout","3 Ferrous Forerunner","3 Honest Broker","3 Deathgrip",
      "3 Glasc Mixologist","3 Undertitan","3 Void Rush","3 Inferna","3 Sacrifice",
      "2 Noxus Hopeful","2 Cull the Weak","2 Hidden Blade","2 Seal of Unity",
      "1 Falling Star","1 Salvage","2 Karthus, Eternal",
    ],
    battlefield: ["1 The Candlelit Sanctum","1 Rockfall Path","1 Vilemaw's Lair"],
    rune: ["6 Fury Rune","6 Order Rune"],
    side: ["2 Brynhir Thundersong","2 Salvage","1 Falling Star","1 Cull the Weak","1 Facebreaker","1 Imperial Decree"],
  },
  "Renata Glasc, Chem-Baroness": {
    legend: "Renata Glasc, Chem-Baroness",
    champion: "Renata Glasc, Mastermind",
    main: [
      "3 Stupefy","3 Watchful Sentry","3 Hidden Blade","3 Plundering Poro","3 Card Sharp",
      "3 Vanguard Armory","3 Hostile Takeover","3 Sprite Fountain","2 Cull the Weak",
      "2 Wages of Pain","2 World Atlas","1 Progress Day","1 Thousand-Tailed Watcher",
      "1 Seal of Insight","1 Time Warp","1 Cloth Armor","1 B.F. Sword",
      "3 Jayce, Man of Progress",
    ],
    battlefield: ["1 Vilemaw's Lair","1 The Papertree","1 Treasure Hoard"],
    rune: ["7 Mind Rune","5 Order Rune"],
    side: ["2 Singularity","2 Salvage","2 Deathgrip","1 Cull the Weak","1 B.F. Sword"],
  },
  "Rumble, Mechanized Menace": {
    legend: "Rumble, Mechanized Menace",
    champion: "Rumble, Hotheaded",
    main: [
      "1 Bellows Breath","1 Blood Rush","3 Bubble Bot","2 Deadly Flourish","2 Eclipse",
      "3 Falling Star","3 Ferrous Forerunner","3 Forecaster","3 Gem Jammer",
      "3 Hwei, Brooding Painter","3 Plundering Poro","2 Retreat",
      "2 Rumble, Hotheaded","1 Singularity","3 Stupefy",
      "3 Thousand-Tailed Watcher","1 Time Warp",
    ],
    battlefield: ["1 Ravenbloom Conservatory","1 Star Spring","1 Trifarian War Camp"],
    rune: ["6 Fury Rune","6 Mind Rune"],
    side: ["1 Rumble, Scrapper","1 Singularity","2 Thermo Beam","1 Time Warp","1 Turn to Dust","2 Unchecked Power"],
  },
  "Vi, Piltover Enforcer": {
    legend: "Vi, Piltover Enforcer",
    champion: "Vi, Destructive",
    main: [
      "3 Long Sword","3 B.F. Sword","3 Hextech Gauntlets","2 Fiora, Victorious",
      "3 Jhin, Murderous Artist","3 Rengar, Unseen","2 Pyke, Dockside Butcher",
      "2 Kai'Sa, Survivor","3 Honest Broker","3 Unsung Hero","3 Deathgrip",
      "2 Rek'Sai, Breacher","2 Noxus Hopeful","2 Pouty Poro","2 Falling Star",
      "1 Tactical Retreat",
    ],
    battlefield: ["1 Forge of the Fluft","1 The Arena's Greatest","1 Rockfall Path"],
    rune: ["8 Fury Rune","4 Order Rune"],
    side: ["2 Ashe, Focused","2 Salvage","2 Cull the Weak","2 Brynhir Thundersong"],
  },
  "Volibear, Relentless Storm": {
    legend: "Volibear, Relentless Storm",
    champion: "Volibear, Furious",
    main: [
      "3 Sky Splitter","3 Kadregrin the Infernal","3 Mobilize","3 Catalyst of Aeons",
      "3 Sabotage","3 Dazzling Aurora","3 Ferrous Forerunner","3 Gentle Gemdragon",
      "3 Elder Dragon","3 Rengar, Trophy Hunter","2 Void Seeker","2 Falling Star",
      "2 Challenge","1 Get Excited!","1 Stormbringer","1 Punch First",
    ],
    battlefield: ["1 Aspirant's Climb","1 Sigil of the Storm","1 The Papertree"],
    rune: ["6 Fury Rune","6 Body Rune"],
    side: ["2 Flurry of Blades","2 Unyielding Spirit","2 Repulse","1 Stormbringer","1 Punch First"],
  },
  "Yasuo, Unforgiven": {
    legend: "Yasuo, Unforgiven",
    champion: "Yasuo, Windrider",
    main: [
      "2 Back Off","3 Defy","3 Discipline","2 En Garde","2 Fizz, Trickster","2 Flash",
      "1 Guardian Angel","3 Gust","1 Last Rites","2 Lonely Poro","1 Not So Fast",
      "2 Ride the Wind","2 Star-Crossed","3 Stellacorn Herder","3 Tideturner",
      "3 Traveling Merchant","2 Vex, Apathetic","2 Zhonya's Hourglass",
    ],
    battlefield: ["1 Star Spring","1 Targon's Peak","1 The Arena's Greatest"],
    rune: ["6 Calm Rune","6 Chaos Rune"],
    side: ["2 Adaptatron","1 Kog'Maw, Caustic","2 Sneaky Deckhand","1 Star-Crossed","1 The Syren","1 Vex, Apathetic"],
  },
  "Irelia, Blade Dancer": {
    legend: "Irelia, Blade Dancer",
    champion: "Irelia, Fervent",
    main: [
      "3 Defy","3 Discipline","3 Tideturner","3 Stellacorn Herder","3 Guardian Angel",
      "3 Boots of Swiftness","3 Defiant Dance","3 Scuttle Crab","2 Charm","2 En Garde",
      "2 Ride the Wind","2 Stacked Deck","2 Not So Fast","2 Star-Crossed",
      "1 Adaptatron","1 Gust","1 Fizz, Trickster",
    ],
    battlefield: ["1 Targon's Peak","1 Sunken Temple","1 Abandoned Hall"],
    rune: ["6 Calm Rune","6 Chaos Rune"],
    side: ["2 Gust","1 Adaptatron","1 Zhonya's Hourglass","1 Disarming Rake","1 Star-Crossed","1 Angler Beast","1 Vex, Apathetic"],
  },
  "Sivir, Battle Mistress": {
    legend: "Sivir, Battle Mistress",
    champion: "Sivir, Mercenary",
    main: [
      "3 Flurry of Blades","3 Gust","3 Sabotage","3 Scryer's Bloom","3 Stacked Deck",
      "1 Disposal Order","3 Mobilize","2 Pack of Wonders","3 Treasure Trove",
      "2 Last Rites","3 Lunar Boon","3 Catalyst of Aeons","1 Mindsplitter",
      "3 Dazzling Aurora","3 Elder Dragon",
    ],
    battlefield: ["1 Aspirant's Climb","1 Forgotten Monument","1 Sigil of the Storm"],
    rune: ["6 Body Rune","6 Chaos Rune"],
    side: ["3 Challenge","1 Akshan, Mischievous","2 Fading Memories","2 Mindsplitter"],
  },
  "Diana, Scorn of the Moon": {
    legend: "Diana, Scorn of the Moon",
    champion: "Diana, Lunari",
    main: [
      "3 Stupefy","3 Ravenbloom Student","3 Gust","3 Ride the Wind","3 Stacked Deck",
      "3 Tideturner","3 Frigid Jewel","2 Flash","2 Star-Crossed","2 Moonfall",
      "1 Smoke Screen","1 Fading Memories","1 Mindsplitter","1 Hard Bargain",
      "1 Last Rites","3 Hwei, Brooding Painter","2 Fizz, Trickster",
      "1 Vex, Cheerless","1 Vex, Apathetic",
    ],
    battlefield: ["1 Targon's Peak","1 Ravenbloom Conservatory","1 Abandoned Hall"],
    rune: ["6 Mind Rune","6 Chaos Rune"],
    side: ["1 Turn to Dust","1 Rebuke","1 Moonfall","1 Angler Beast","1 Singularity","1 Unchecked Power","1 Downwell","1 Baron Nashor"],
  },
  "Vex, Gloomist": {
    legend: "Vex, Gloomist",
    champion: "Vex, Apathetic",
    main: [
      "3 Discipline","3 Emperor's Divide","3 Mutated Mouser","2 Defy","2 Ember Monk",
      "2 Gust","2 Treasure Hunter","2 Boots of Swiftness","2 Edge of Night",
      "2 Back Off","2 Existential Dread","1 Switcheroo","1 Star-Crossed",
      "3 Teemo, Scout","3 Evelynn, Entrancing","2 Sona, Harmonious",
      "2 Kha'Zix, Mutating Horror","2 Pyke, Returned",
    ],
    battlefield: ["1 Bandle Tree","1 Startipped Peak","1 Star Spring"],
    rune: ["7 Chaos Rune","5 Calm Rune"],
    side: ["2 Disarming Rake","1 Defy","1 Gust","1 Rebuke","1 Switcheroo","1 Star-Crossed","1 Abandon"],
  },
  "Teemo, Swift Scout": {
    legend: "Teemo, Swift Scout",
    champion: "Teemo, Strategist",
    main: [
      "1 Evelynn, Entrancing","3 Nocturne, Horrifying","2 Sneaky Deckhand",
      "3 Tideturner","3 Windsinger","1 Abandon","2 Bone Skewer","3 Consult the Past",
      "2 Existential Dread","2 Guerilla Warfare","1 Ride the Wind","3 Sprite Call",
      "3 Switcheroo","1 Singularity","3 Sprite Fountain","2 Teemo, Strategist",
      "1 Baron Nashor","3 Teemo, Scout",
    ],
    battlefield: ["1 Grove of the God-Willow","1 Startipped Peak","1 The Arena's Greatest"],
    rune: ["7 Mind Rune","5 Chaos Rune"],
    side: ["1 Unchecked Power","2 Edge of Night","1 Thousand-Tailed Watcher","2 Rebuke","2 Turn to Dust"],
  },
  "LeBlanc, Deceiver": {
    legend: "LeBlanc, Deceiver",
    champion: "LeBlanc, Fragmented",
    main: [
      "3 Sacrifice","3 Soaring Scout","3 Watchful Sentry","2 Hidden Blade",
      "3 Baited Hook","3 Black Rose Dignitary","2 Galio, Indefatigable",
      "3 Karthus, Eternal","3 Mirror Image","3 Glasc Mixologist",
      "1 Vi, Peacekeeper","3 Ruined Rex","1 Thousand-Tailed Watcher",
      "3 Rift Herald","3 Harnessed Dragon",
    ],
    battlefield: ["1 Windswept Hillock","1 Star Spring","1 Aspirant's Climb"],
    rune: ["4 Mind Rune","8 Order Rune"],
    side: ["1 Turn to Dust","1 LeBlanc, Everywhere at Once","3 Ashe, Focused","2 Vi, Peacekeeper","1 Atakhan"],
  },
  "Sett, The Boss": {
    legend: "Sett, The Boss",
    champion: "Sett, Kingpin",
    main: [
      "3 First Mate","3 Pit Rookie","3 Sabotage","3 Call to Glory",
      "3 Fiora, Victorious","3 Showstopper","3 Punch First","3 Irresistible Faefolk",
      "2 Arena Bar","2 Challenge","2 Cithria of Cloudfield","2 Hidden Blade",
      "2 Fae Dragon","2 Lucian, Merciless","1 Kinkou Monk","1 Repulse",
      "1 Vi, Peacekeeper",
    ],
    battlefield: ["1 Grove of the God-Willow","1 Monastery of Hirana","1 Valley of Idols"],
    rune: ["7 Body Rune","5 Order Rune"],
    side: ["2 Akshan, Mischievous","2 Repulse","2 Ashe, Focused","1 Ruin Runner","1 Vi, Peacekeeper"],
  },
  "Draven, Glorious Executioner": {
    legend: "Draven, Glorious Executioner",
    champion: "Draven, Showboat",
    main: [
      "3 Tideturner","3 Overzealous Fan","2 Treasure Hunter","3 Noxus Hopeful",
      "3 Kai'Sa, Survivor","2 Darius, Trifarian","1 Brynhir Thundersong",
      "2 Ferrous Forerunner","3 Stacked Deck","2 Rebuke","2 Ride the Wind",
      "3 Spinning Axe","1 Hard Bargain","2 Vex, Apathetic","1 Falling Star",
      "2 Existential Dread","1 Baron Nashor","2 Rek'Sai, Breacher","1 Cleave",
    ],
    battlefield: ["1 Zaun Warrens","1 Targon's Peak","1 Treasure Hoard"],
    rune: ["6 Fury Rune","6 Chaos Rune"],
    side: ["1 Hard Bargain","1 Thermo Beam","1 Falling Star","1 Brynhir Thundersong","2 Star-Crossed","2 Flash"],
  },
  "Rengar, Pridestalker": {
    legend: "Rengar, Pridestalker",
    champion: "Rengar, Trophy Hunter",
    main: [
      "3 Sky Splitter","3 Kadregrin the Infernal","3 Challenge","3 Mobilize",
      "3 Catalyst of Aeons","3 Herald of Scales","3 Dazzling Aurora","3 Gentle Gemdragon",
      "3 Thrill of the Hunt","3 Elder Dragon","2 Blazing Scorcher","2 Sabotage",
      "2 Direwing","2 Show of Strength","1 Flurry of Blades",
    ],
    battlefield: ["1 Aspirant's Climb","1 Sigil of the Storm","1 Sunken Temple"],
    rune: ["7 Body Rune","5 Fury Rune"],
    side: ["3 Akshan, Mischievous","2 Unyielding Spirit","2 Repulse","1 Assembly Rig"],
  },
  "Master Yi, Wuju Bladesman": {
    legend: "Master Yi, Wuju Bladesman",
    champion: "Master Yi, Tempered",
    main: [
      "3 Charm","3 Defy","2 En Garde","2 Stalwart Poro","3 Discipline",
      "2 Zhonya's Hourglass","1 Whiteflame Protector","3 Pit Rookie",
      "1 Not So Fast","2 Punch First","3 Ruin Runner","2 Trinity Force",
      "1 Back Off","3 Scuttle Crab","1 Vilemaw","3 Rengar, Trophy Hunter",
      "1 Alpha Strike","3 Lonely Poro",
    ],
    battlefield: ["1 Vilemaw's Lair","1 Startipped Peak","1 The Arena's Greatest"],
    rune: ["6 Calm Rune","6 Body Rune"],
    side: ["2 Sabotage","1 Unyielding Spirit","1 Punch First","1 Back Off","1 Alpha Strike","2 Akshan, Mischievous"],
  },
  "Ezreal, Prodigal Explorer": {
    legend: "Ezreal, Prodigal Explorer",
    champion: "Ezreal, Prodigy",
    main: [
      "3 Stupefy","3 Gust","3 Stacked Deck","3 Wages of Pain","3 Treasure Hunter",
      "3 Arcane Shift","3 Bewitching Spirit","2 Retreat","2 Bellows Breath",
      "2 Star-Crossed","1 Singularity","1 Time Warp","1 Rebuke",
      "1 Acceptable Losses","1 Mindsplitter","1 Frigid Touch","1 Overzealous Fan",
      "1 Windsinger","3 Fizz, Trickster","1 Vex, Apathetic",
    ],
    battlefield: ["1 Void Gate","1 Treasure Hoard","1 Forbidding Waste"],
    rune: ["7 Chaos Rune","5 Mind Rune"],
    side: ["2 Turn to Dust","1 Thousand-Tailed Watcher","1 Mindsplitter","1 Vex, Cheerless","1 Downwell","1 Star-Crossed","1 Vex, Apathetic"],
  },
  "Poppy, Keeper of the Hammer": {
    legend: "Poppy, Keeper of the Hammer",
    champion: "Poppy, Paragon",
    main: [
      "3 Confront","3 Mobilize","3 Catalyst of Aeons","3 Dazzling Aurora","3 Elder Dragon",
      "3 Sacrifice","3 Rift Herald","2 Flurry of Blades","2 Primal Strength",
      "2 Sabotage","2 Cull the Weak","2 Forge of the Future","2 Harnessed Dragon",
      "2 Blood Money","2 Vanguard Armory","2 The Ruination",
    ],
    battlefield: ["1 Aspirant's Climb","1 Sigil of the Storm","1 Vilemaw's Lair"],
    rune: ["7 Body Rune","5 Order Rune"],
    side: ["2 Salvage","2 Divine Judgment","2 Keeper's Verdict","1 Sabotage","1 Blood Money"],
  },
  "Annie, Dark Child": {
    legend: "Annie, Dark Child",
    champion: "Annie, Stubborn",
    main: [
      "2 Cleave","3 Noxus Hopeful","3 Kai'Sa, Survivor","1 Gust","3 Stacked Deck",
      "3 Traveling Merchant","3 Flash","3 Ferrous Forerunner","2 Long Sword",
      "3 Rengar, Pouncing","2 Overzealous Fan","3 Inferna","2 Grim Apothecary",
      "2 Star-Crossed","2 Abandon","2 Vex, Apathetic",
    ],
    battlefield: ["1 Seat of Power","1 The Arena's Greatest","1 Zaun Warrens"],
    rune: ["7 Fury Rune","5 Chaos Rune"],
    side: ["1 Factory Recall","1 Abandon","1 Against the Odds","1 Falling Star","1 Switcheroo","1 Star-Crossed","1 Thermo Beam","1 Brynhir Thundersong"],
  },
  "Viktor, Herald of the Arcane": {
    legend: "Viktor, Herald of the Arcane",
    champion: "Viktor, Innovator",
    main: [
      "3 Bellows Breath","3 Blood Money","2 Card Sharp","3 Cull the Weak",
      "2 Drag Under","2 Facebreaker","2 Falling Comet","3 Hidden Blade",
      "2 Imperial Decree","2 Pickpocket","1 Salvage","3 Singularity","3 Stupefy",
      "2 Vengeance","3 Wages of Pain","3 Xin Zhao, Vigilant",
    ],
    battlefield: ["1 Treasure Hoard","1 Vilemaw's Lair","1 Void Gate"],
    rune: ["5 Mind Rune","7 Order Rune"],
    side: ["1 Facebreaker","2 Forge of the Future","1 Imperial Decree","2 Salvage","2 Shen, Kinkou"],
  },
  "Azir, Emperor of the Sands": {
    legend: "Azir, Emperor of the Sands",
    champion: "Azir, Sovereign",
    main: [
      "3 Shadow's Call","2 Vi, Peacekeeper","2 Sacrifice","1 Salvage","3 Defy",
      "3 Guards!","3 B.F. Sword","2 Soul Sword","3 Arise!","3 Doran's Shield",
      "2 Scuttle Crab","3 Eye of the Herald","2 Hidden Blade","3 Discipline",
      "1 Charm","3 Brutalizer",
    ],
    battlefield: ["1 Hall of Legends","1 Trifarian War Camp","1 Ornn's Forge"],
    rune: ["7 Calm Rune","5 Order Rune"],
    side: ["1 Charm","2 Cull the Weak","2 Salvage","2 Ashe, Focused","1 Back Off"],
  },
  "Ahri, Nine-Tailed Fox": {
    legend: "Ahri, Nine-Tailed Fox",
    champion: "Ahri, Inquisitive",
    main: [
      "3 Ravenbloom Student","2 Plundering Poro","3 Desert's Call","3 Sprite Fountain",
      "3 Jhin, Meticulous Killer","2 Sona, Harmonious","2 Thousand-Tailed Watcher",
      "2 Sprite Burst","3 Flurry of Feathers","2 Consult the Past","2 Charm","3 Defy",
      "2 Stupefy","2 Back Off","3 Discipline","1 Emperor's Divide","1 Eclipse",
    ],
    battlefield: ["1 The Grand Plaza","1 The Arena's Greatest","1 Dusk Rose Lab"],
    rune: ["5 Calm Rune","7 Mind Rune"],
    side: ["2 Unchecked Power","3 Disarming Rake","1 Emperor's Divide","1 Plundering Poro","1 Heart of Dark Ice"],
  },
  "Darius, Hand of Noxus": {
    legend: "Darius, Hand of Noxus",
    champion: "Darius, Trifarian",
    main: [
      "3 Vanguard Captain","3 Harnessed Dragon","3 Baited Hook","3 Seal of Unity",
      "3 Ferrous Forerunner","3 Honest Broker","3 B.F. Sword","3 Glasc Mixologist",
      "3 Unsung Hero","2 Shadow's Call","1 Brynhir Thundersong","1 Hidden Blade",
      "1 Spectral Matron","1 Gem Jammer","1 Trusty Ramhound","3 Xin Zhao, Vigilant",
      "2 Galio, Indefatigable",
    ],
    battlefield: ["1 The Arena's Greatest","1 Trifarian War Camp","1 Treasure Hoard"],
    rune: ["8 Order Rune","4 Fury Rune"],
    side: ["2 Brynhir Thundersong","2 Imperial Decree","2 Salvage","2 Ashe, Focused"],
  },
  "Garen, Might of Demacia": {
    legend: "Garen, Might of Demacia",
    champion: "Garen, Commander",
    main: [
      "3 Catalyst of Aeons","1 Concentrate","3 Confront","2 Cull the Weak",
      "3 Dazzling Aurora","2 Deadbloom Predator","3 Forge of the Future",
      "3 Harnessed Dragon","1 Hidden Blade","3 Mobilize","2 Rift Herald",
      "2 Sabotage","3 Sacrifice","2 Shadow's Call","3 Vanguard Armory","3 Elder Dragon",
    ],
    battlefield: ["1 Sigil of the Storm","1 Veiled Temple","1 Aspirant's Climb"],
    rune: ["6 Body Rune","6 Order Rune"],
    side: ["1 Blood Money","2 Divine Judgment","1 Sabotage","2 Salvage","2 Unyielding Spirit"],
  },
  "Ivern, Green Father": {
    legend: "Ivern, Green Father",
    champion: "Ivern, Nurturer",
    main: [
      "3 Defy","3 Stalwart Poro","3 Discipline","3 Daring Poro","3 Hidden Blade",
      "3 Trusty Ramhound","3 Frisky Hunter","3 Mutated Mouser","3 Friendship",
      "3 Loyal Poro","2 Daisy!","1 Charm","1 Back Off","1 Flurry of Feathers",
      "1 Vilemaw","3 Blitzcrank, Impassive",
    ],
    battlefield: ["1 Forbidding Waste","1 Frozen Fortress","1 Vaults of Helia"],
    rune: ["8 Calm Rune","4 Order Rune"],
    side: ["3 Salvage","2 Not So Fast","2 Back Off","1 Alpha Wildclaw"],
  },
  "Jax, Grandmaster at Arms": {
    legend: "Jax, Grandmaster at Arms",
    champion: "Jax, Unmatched",
    main: [
      "3 Defy","1 Trinity Force","1 Ruin Runner","2 Irelia, Fervent","3 First Mate",
      "3 Counter Strike","3 Scuttle Crab","2 Stellacorn Herder","3 Lucian, Merciless",
      "3 Guardian Angel","3 Brutalizer","3 Discipline","2 Challenge","1 Charm",
      "2 Punch First","1 Doran's Blade","2 Lonely Poro","1 Not So Fast",
    ],
    battlefield: ["1 Sunken Temple","1 Targon's Peak","1 Ornn's Forge"],
    rune: ["6 Calm Rune","6 Body Rune"],
    side: ["2 Sabotage","3 Akshan, Mischievous","1 Ruin Runner","1 Unyielding Spirit","1 Not So Fast"],
  },
  "Jhin, Virtuoso": {
    legend: "Jhin, Virtuoso",
    champion: "Jhin, Meticulous Killer",
    main: [
      "3 Piercing Light","3 Plundering Poro","3 Downstage Dramatics","3 Curtain Call",
      "2 Disintegrate","2 Watchful Sentry","2 Singularity","2 Thousand-Tailed Watcher",
      "2 Ferrous Forerunner","2 Frigid Touch","2 Rocket Barrage","2 Deadly Flourish",
      "1 Pouty Poro","1 Consult the Past","1 Time Warp","1 Production Surge",
      "1 Hextech Anomaly","1 Upstage Comedy","1 Sprite Burst",
      "2 Jhin, Meticulous Killer","2 Kai'Sa, Survivor",
    ],
    battlefield: ["1 Void Gate","1 Ravenbloom Conservatory","1 Rockfall Path"],
    rune: ["7 Mind Rune","5 Fury Rune"],
    side: ["2 Smite","1 Thermo Beam","1 Brynhir Thundersong","1 Unchecked Power","1 Frigid Touch","1 Square Up","1 Sprite Burst"],
  },
  "Jinx, Loose Cannon": {
    legend: "Jinx, Loose Cannon",
    champion: "Jinx, Demolitionist",
    main: [
      "3 Chemtech Enforcer","3 Flame Chompers","3 Noxus Hopeful","3 Seal of Rage",
      "3 Stacked Deck","3 Traveling Merchant","3 Overzealous Fan","3 Undying Legion",
      "3 Evershade Stalker","2 Cleave","2 Falling Star","2 Switcheroo",
      "1 Hextech Ray","1 Gust","1 Windsinger","2 Teemo, Scout",
      "1 Pyke, Dockside Butcher",
    ],
    battlefield: ["1 The Arena's Greatest","1 Zaun Warrens","1 Seat of Power"],
    rune: ["9 Fury Rune","3 Chaos Rune"],
    side: ["3 Acceptable Losses","1 Brynhir Thundersong","1 Falling Star","1 Gust","1 Switcheroo","1 Star-Crossed"],
  },
  "Kai'Sa, Daughter of the Void": {
    legend: "Kai'sa, Daughter of the Void",
    champion: "Kai'Sa, Survivor",
    main: [
      "3 Hextech Ray","3 Falling Star","3 Lecturing Yordle","3 Stupefy",
      "3 Thousand-Tailed Watcher","3 Ferrous Forerunner","3 Plundering Poro",
      "1 Smite","1 Time Warp","1 Singularity","1 Rocket Barrage",
      "1 Darius, Trifarian","1 Retreat","1 Smoke Screen","2 Void Seeker",
      "3 Watchful Sentry","1 Progress Day","3 Noxus Hopeful","2 Ravenbloom Student",
    ],
    battlefield: ["1 Ravenbloom Conservatory","1 Targon's Peak","1 Void Gate"],
    rune: ["7 Fury Rune","5 Mind Rune"],
    side: ["1 Thermo Beam","1 Turn to Dust","1 Retreat","1 Rocket Barrage","2 Smite","1 Dr. Mundo, Expert","1 Bellows Breath"],
  },
  "Kha'Zix, Voidreaver": {
    legend: "Khazix, Voidreaver",
    champion: "Kha'Zix, Mutating Horror",
    main: [
      "3 Flurry of Blades","3 Mobilize","3 Catalyst of Aeons","3 Sabotage",
      "3 Dazzling Aurora","3 Gust","3 Stacked Deck","3 Lunar Boon",
      "3 Scryer's Bloom","3 Elder Dragon","2 Mindsplitter","2 Last Rites",
      "2 Heedless Resurrection","1 Challenge","1 Invert Timelines","1 Baron Nashor",
    ],
    battlefield: ["1 Aspirant's Climb","1 Vilemaw's Lair","1 Forgotten Monument"],
    rune: ["7 Body Rune","5 Chaos Rune"],
    side: ["3 Fading Memories","2 Unyielding Spirit","2 Abandon","1 Baron Nashor"],
  },
  "Lee Sin, Blind Monk": {
    legend: "Lee Sin, Blind Monk",
    champion: "Lee Sin, Centered",
    main: [
      "3 Defy","3 Find Your Center","3 Flurry of Blades","3 Mobilize",
      "3 Catalyst of Aeons","3 Dazzling Aurora","3 Desert's Call","3 Elder Dragon",
      "2 Charm","2 Discipline","2 Zhonya's Hourglass","2 Sabotage","2 Not So Fast",
      "2 Back Off","2 Vilemaw","1 Meditation",
    ],
    battlefield: ["1 Aspirant's Climb","1 Frozen Fortress","1 Sigil of the Storm"],
    rune: ["6 Calm Rune","6 Body Rune"],
    side: ["2 Unyielding Spirit","2 Akshan, Mischievous","1 Zhonya's Hourglass","1 Sabotage","1 Not So Fast","1 Charm"],
  },
  "Leona, Radiant Dawn": {
    legend: "Leona, Radiant Dawn",
    champion: "Leona, Zealot",
    main: [
      "1 Charm","3 Defy","1 Cull the Weak","2 Discipline","1 Emperor's Divide",
      "3 Lonely Poro","2 Scuttle Crab","3 Stalwart Poro","2 Zhonya's Hourglass",
      "3 Back Off","2 Call to Glory","2 Heart of Dark Ice","3 Nami, Headstrong",
      "2 Zenith Blade","2 Fiora, Victorious","2 Stellacorn Herder","2 Irelia, Fervent",
      "3 Vi, Peacekeeper",
    ],
    battlefield: ["1 Monastery of Hirana","1 The Arena's Greatest","1 Sunken Temple"],
    rune: ["7 Calm Rune","5 Order Rune"],
    side: ["1 Charm","1 Not So Fast","2 Disarming Rake","3 Ashe, Focused","1 Cull the Weak"],
  },
  "Lillia, Bashful Bloom": {
    legend: "Lillia, Bashful Bloom",
    champion: "Lillia, Fae Fawn",
    main: [
      "3 Defy","3 Discipline","3 Mask of Foresight","3 Stupefy",
      "3 Ravenbloom Student","3 Thousand-Tailed Watcher","3 Unchecked Power",
      "3 Heart of Dark Ice","3 Plundering Poro","3 Sprite Burst","3 Sprite Fountain",
      "3 Smoke and Mirrors","2 Tasty Faefolk","1 Charm",
    ],
    battlefield: ["1 Seat of Power","1 Dusk Rose Lab","1 Forbidding Waste"],
    rune: ["6 Calm Rune","6 Mind Rune"],
    side: ["3 Disarming Rake","2 Falling Comet","2 Lilting Lullaby","1 Charm"],
  },
  "Lucian, Purifier": {
    legend: "Lucian, Purifier",
    champion: "Lucian, Merciless",
    main: [
      "3 First Mate","3 Skyfall of Areion","3 Doran's Blade","3 Ruin Runner",
      "3 Trinity Force","3 Relentless Pursuit","3 Kinkou Initiate",
      "3 Irresistible Faefolk","2 Challenge","2 Confront","2 Sabotage",
      "2 Gem Jammer","2 Punch First","2 Blighted Battleaxe","3 Kai'Sa, Survivor",
    ],
    battlefield: ["1 The Candlelit Sanctum","1 Forge of the Fluft","1 Sunken Temple"],
    rune: ["6 Fury Rune","6 Body Rune"],
    side: ["2 Brynhir Thundersong","2 Ferrous Forerunner","2 Akshan, Mischievous","2 Repulse"],
  },
  "Lux, Lady of Luminosity": {
    legend: "Lux, Lady of Luminosity",
    champion: "Lux, Crownguard",
    main: [
      "3 Honest Broker","3 Plundering Poro","2 Progress Day","2 Singularity",
      "3 Time Warp","2 Seal of Insight","3 Card Sharp","3 Ashe, Focused",
      "2 Portal Rescue","2 Falling Comet","3 The Ruination","3 Cull the Weak",
      "2 Wages of Pain","2 Blood Money","2 Rocket Barrage","2 Garbage Grabber",
    ],
    battlefield: ["1 Aspirant's Climb","1 Vilemaw's Lair","1 Sigil of the Storm"],
    rune: ["6 Mind Rune","6 Order Rune"],
    side: ["2 Salvage","3 Safety Inspector","1 Wages of Pain","1 Falling Comet","1 Progress Day"],
  },
  "Master Yi, Wuju Master": {
    legend: "Master Yi, Wuju Master",
    champion: "Master Yi, Tempered",
    main: [
      "3 Master Yi, Unstoppable","3 Voracious Gromp","2 Herald of Spring",
      "2 Scuttle Crab","3 Gemhand Hunter","3 Wuju Apprentice",
      "3 Zhonya's Hourglass","3 Discipline","3 Grim Resolve","2 Punch First",
      "3 Defy","3 Concentrate","2 Skyward Strike","2 Emperor's Divide","2 Back Off",
    ],
    battlefield: ["1 Gardens of Becoming","1 Amateur Recital","1 Reckoner's Arena"],
    rune: ["6 Calm Rune","6 Body Rune"],
    side: ["1 Alpha Strike","2 Disarming Rake","1 Skyward Strike","2 Sabotage","2 Unyielding Spirit"],
  },
};

async function run() {
  const allCards = await p.card.findMany({
    select: { id: true, name: true, cleanName: true, riftboundId: true, type: true, supertype: true, alternateArt: true, overnumbered: true, signature: true },
  });

  function findCard(name: string, allowVariants = false) {
    const nameLC = name.toLowerCase();
    const dashLC = name.replace(/, /g, " - ").toLowerCase();
    // Strict: no alt, no over, no sig
    const strict = allCards.find(
      (c) =>
        !c.alternateArt && !c.overnumbered && !c.signature &&
        (c.name.toLowerCase() === nameLC ||
          c.name.toLowerCase() === dashLC ||
          (c.cleanName && c.cleanName.toLowerCase() === nameLC) ||
          (c.cleanName && c.cleanName.toLowerCase() === dashLC))
    );
    if (strict) return strict;
    // Relaxed: allow non-alt, non-over (but sig ok for legends)
    const relaxed = allCards.find(
      (c) =>
        !c.alternateArt && !c.overnumbered &&
        (c.name.toLowerCase() === nameLC ||
          c.name.toLowerCase() === dashLC ||
          (c.cleanName && c.cleanName.toLowerCase() === nameLC) ||
          (c.cleanName && c.cleanName.toLowerCase() === dashLC))
    );
    if (relaxed) return relaxed;
    // Metal/Starter variants (for legends that only exist this way)
    if (allowVariants) {
      const baseName = dashLC;
      const stripped = baseName.replace(/['']/g, "");
      return allCards.find(
        (c) => c.type === "Legend" && (
          c.name.toLowerCase().startsWith(baseName) ||
          c.name.toLowerCase().replace(/['']/g, "").startsWith(stripped)
        )
      );
    }
    return undefined;
  }

  const decks = await p.deck.findMany({ select: { id: true, legendName: true } });
  let updated = 0;
  let errors = 0;

  for (const [legendKey, data] of Object.entries(DECKS)) {
    const deck = decks.find((d) => d.legendName === legendKey);
    if (!deck) {
      console.log(`DECK NOT FOUND: "${legendKey}"`);
      errors++;
      continue;
    }

    // Delete all existing DeckCards
    await p.deckCard.deleteMany({ where: { deckId: deck.id } });

    // Find legend card
    const legendCard = findCard(data.legend, true);
    if (legendCard) {
      await p.deckCard.create({ data: { deckId: deck.id, cardId: legendCard.id, quantity: 1, section: "legend" } });
    } else {
      console.log(`  LEGEND NOT FOUND: "${data.legend}" in ${legendKey}`);
      errors++;
    }

    // Find champion card
    const champCard = findCard(data.champion);
    if (champCard) {
      await p.deckCard.create({ data: { deckId: deck.id, cardId: champCard.id, quantity: 1, section: "legend" } });
    } else {
      console.log(`  CHAMPION NOT FOUND: "${data.champion}" in ${legendKey}`);
      errors++;
    }

    // Process sections
    for (const [section, lines] of [
      ["main", data.main],
      ["battlefield", data.battlefield],
      ["rune", data.rune],
      ["side", data.side],
    ] as const) {
      const entries = parseEntries(lines);
      // Merge duplicates
      const merged = new Map<string, number>();
      for (const e of entries) {
        merged.set(e.name, (merged.get(e.name) ?? 0) + e.qty);
      }
      for (const [name, qty] of merged) {
        const card = findCard(name);
        if (card) {
          // Check for duplicate (same card in legend section)
          const existing = await p.deckCard.findUnique({
            where: { deckId_cardId_section: { deckId: deck.id, cardId: card.id, section } },
          });
          if (!existing) {
            await p.deckCard.create({ data: { deckId: deck.id, cardId: card.id, quantity: qty, section } });
          }
        } else {
          console.log(`  NOT FOUND: "${name}" [${section}] in ${legendKey}`);
          errors++;
        }
      }
    }

    // Verify counts
    const newCards = await p.deckCard.findMany({ where: { deckId: deck.id } });
    const mainCount = newCards.filter((c) => c.section === "main").reduce((s, c) => s + c.quantity, 0);
    const runeCount = newCards.filter((c) => c.section === "rune").reduce((s, c) => s + c.quantity, 0);
    const bfCount = newCards.filter((c) => c.section === "battlefield").reduce((s, c) => s + c.quantity, 0);
    const legendCount = newCards.filter((c) => c.section === "legend").length;

    const issues: string[] = [];
    if (mainCount !== 40) issues.push(`main=${mainCount}/40`);
    if (runeCount !== 12) issues.push(`rune=${runeCount}/12`);
    if (bfCount !== 3) issues.push(`bf=${bfCount}/3`);
    if (legendCount < 2) issues.push(`legend=${legendCount}/2`);

    if (issues.length > 0) {
      console.log(`  ${legendKey}: ${issues.join(", ")}`);
    } else {
      console.log(`  ✓ ${legendKey}`);
    }
    updated++;
  }

  console.log(`\nUpdated ${updated} decks, ${errors} errors`);
}

run().finally(() => p.$disconnect());
