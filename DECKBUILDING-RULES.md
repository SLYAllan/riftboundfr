# DECKBUILDING-RULES.md — Regles de construction de decks Riftbound

> Mis a jour le 31 mai 2026 (v3). Base : **18 652 decks sur 88 tournois**. Ajouts v3 : 25 S3 City Challenges (Unleashed) + Hangzhou RO + 21 anciennes CC Origins (+6298 decks). Repartition classes : Origins 6799 / Spiritforged 7294 / Unleashed 4501. Recalcule via scripts/analyze-meta.ts.
>
> **Meta par set** : **Origins** = duo Kai'Sa (27,6%) + Master Yi Bladesman (23%) = 50% du field. **Spiritforged** = Draven domine (21%, 88 top 8, 15 wins). **Unleashed** = ouvert (Irelia/Master Yi Master/LeBlanc/Diana en tete, ~13 viables).
>
> ### Confirmations Unleashed v3 (cores sur ~4500 decks)
> - **Irelia, Blade Dancer** (10U/22,6S/6,6G) — CORE : Discipline (100%), Defy/Defiant Dance (99%), En Garde (94%), Charm/Not So Fast (92%), Boots of Swiftness + Guardian Angel (90-91%, Gear). Tempo Calm, 22+ sorts.
> - **Diana, Scorn of the Moon** (15,5U/22,2S/1,5G) — CORE : Ride the Wind/Moonfall (99%), Stacked Deck/Stupefy (98%), Ravenbloom Student/Hwei/Gust (96%), Star-Crossed (93%). Aggro-tempo Chaos/Mind.
> - **LeBlanc, Deceiver** (23,6U/13,5S/1,9G) — CORE : Mirror Image (98%), Soaring Scout (97%), Glasc Mixologist (94%), Watchful Sentry/Karthus (92-93%). Deathknell midrange (23+ unites).
> - **Master Yi, Wuju Master** (17,1U/18S/3,9G) — CORE : Defy (100%), Discipline (97%), Zhonya's Hourglass (90%, Gear). Hold Body/Calm.
>
> ### Confirmations 31 mai (cores verrouillees sur +4327 decks Spiritforged CN)
> - **Draven, Glorious Executioner** (1573 decks, 19,9U/14,3S/4,8G) — CORE : Rebuke (99%), Fight or Flight (94%), Overzealous Fan (92%). Aggro Chaos/Fury le plus stable du set.
> - **Kai'Sa, Daughter of the Void** (1992 decks toutes versions, 18,8U/20S/0,3G) — CORE : Falling Star (100%), Stupefy (99%), Thousand-Tailed Watcher (99%), Hextech Ray (98%), Watchful Sentry (93%). Tempo-combo Fury/Mind, quasi zero gear.
> - **Irelia, Blade Dancer** (1017+ decks, 9,7U/22,7S/6,7G) — CORE : Discipline (100%), Defiant Dance (99%), Defy (98%), Ride the Wind (97%), Guardian Angel (96%, Gear), En Garde + Not So Fast + Stellacorn Herder (95%), Charm (91%). Tempo a 22+ sorts, tres peu d'unites.
> - **Pattern confirme** : les decks gagnants Spiritforged tournent autour de ~10-20 unites + 14-23 sorts ; les cores se verrouillent (90%+) sur 3-9 cartes selon la legende.

---

## 1. Regles universelles (toutes les legendes)

### Structure standard d'un deck

- **1 Legend** : leader permanent, definit les 2 domains autorises
- **1 Champion Unit** : declaree avant la partie (correspond a la Legend)
- **40 cartes Main Deck** : unites, sorts, gears
- **12 Runes** : matchent les Domain Identity de la Legend
- **3 Battlefields** : choisis strategiquement
- **8 cartes Side Deck** : echanges en Bo3

### Ratio unites/sorts/gears (moyenne sur 7987 decks)

| Archetype | Unites | Sorts | Gears | Total |
|-----------|--------|-------|-------|-------|
| **Aggro** (Draven, Annie, Rumble, Darius) | 19-24 | 11-16 | 2-7 | ~39 |
| **Aggro-tempo** (Diana, Rengar) | 15-25 | 13-22 | 1-2 | ~39 |
| **Tempo** (Irelia, Vex) | 10-16 | 17-22 | 5-7 | ~39 |
| **Midrange** (Yi, Sett, Fiora, Leona) | 16-18 | 15-18 | 4-6 | ~39 |
| **Control** (Viktor, Lux, Ezreal, Lillia) | 9-13 | 22-25 | 2-5 | ~39 |
| **Ramp/Aurora** (Sivir, MF, Azir) | 2-7 | 22-25 | 11-15 | ~39 |
| **Deathknell** (LeBlanc) | 23-24 | 14-15 | 1-2 | ~39 |

### Top 30 cartes les plus jouees (toutes legendes, 7987 decks)

| Carte | Decks | % | Type | Domain |
|-------|-------|---|------|--------|
| Thousand-Tailed Watcher | 1278 | 39% | Unit | Mind |
| Stupefy | 1171 | 36% | Spell | Mind |
| Defy | 1134 | 35% | Spell | Calm |
| Discipline | 1112 | 34% | Spell | Calm |
| Ravenbloom Student | 999 | 30% | Unit | Mind |
| Charm | 990 | 30% | Spell | Calm |
| Falling Star | 926 | 28% | Spell | Fury |
| Zhonya's Hourglass | 915 | 28% | Gear | Calm |
| Retreat | 888 | 27% | Spell | Mind |
| Cleave | 875 | 27% | Spell | Fury |
| Darius, Trifarian | 875 | 27% | Unit | Fury |
| Noxus Hopeful | 874 | 27% | Unit | Fury |
| Lecturing Yordle | 854 | 26% | Unit | Mind |
| Watchful Sentry | 834 | 25% | Unit | Mind |
| Time Warp | 831 | 25% | Spell | Mind |
| Pouty Poro | 812 | 25% | Unit | Fury |
| Stacked Deck | 785 | 24% | Spell | Chaos |
| Catalyst of Aeons | 738 | 22% | Spell | Body |
| Hextech Ray | 727 | 22% | Spell | Fury |
| Deadbloom Predator | 719 | 22% | Unit | Body |
| En Garde | 707 | 22% | Spell | Calm |
| Find Your Center | 702 | 21% | Spell | Calm |
| Void Seeker | 685 | 21% | Spell | Fury |
| Ride the Wind | 648 | 20% | Spell | Chaos |
| Hidden Blade | 643 | 20% | Spell | Order |
| Whiteflame Protector | 604 | 18% | Unit | Calm |
| Sabotage | 592 | 18% | Spell | Body |
| First Mate | 587 | 18% | Unit | Body |
| Tasty Faefolk | 559 | 17% | Unit | Calm |
| Gust | 548 | 17% | Spell | Chaos |

> Note : Les données sont pondérées Origins (Shanghai NO 29% + Beijing/Guangzhou/Chongqing 22%) et Spiritforged chinois (Shenzhen 30%). Fury/Mind domine grâce à Kai'Sa. Pour le méta actuel (Unleashed), voir les sections Xi'an/Sydney.

### Top 15 Battlefields (7987 decks)

| Battlefield | Decks | % | Profil |
|-------------|-------|---|--------|
| The Dreaming Tree | 958 | 29% | Calm/Mind value — universel Origins |
| Obelisk of Power | 830 | 25% | Aggro/midrange universel |
| Aspirant's Climb | 749 | 23% | Ramp/Aurora — quasi-exclusif Body |
| Zaun Warrens | 676 | 21% | Aggro Fury/Chaos |
| Sigil of the Storm | 608 | 19% | Body ramp |
| The Arena's Greatest | 596 | 18% | Aggro/Fury |
| Grove of the God-Willow | 542 | 16% | Calm value |
| Void Gate | 505 | 15% | Fury/Mind — Kai'Sa |
| Trifarian War Camp | 427 | 13% | Order/Azir/Fury |
| Reaver's Row | 386 | 12% | Fury/Mind — Kai'Sa |
| Vilemaw's Lair | 343 | 10% | Value — Calm/Body |
| Targon's Peak | 287 | 9% | Calm/Chaos tempo |
| Startipped Peak | 275 | 8% | Calm/Chaos hold |
| Monastery of Hirana | 273 | 8% | Hold Body/Order |
| Sunken Temple | 259 | 8% | Hold/midrange |

---

## 2. Regles par Legend (core/standard/flex/tech)

Classification : **core** (90%+), **standard** (60-89%), **flex** (30-59%), **tech** (10-29%)

### Kai'Sa, Daughter of the Void (~1379 decks) — Fury/Mind — Tempo-combo

> Légende #1 en volume (Shanghai NO 599 + Beijing 153 + Chongqing 168 + Guangzhou 98 + Shenzhen 218 + Fuzhou 39 + Suzhou 15 + divers). Dominante Origins, adaptée Spiritforged.

Champions : Kai'Sa, Survivor (100%)

**Core (7 cartes)** : Thousand-Tailed Watcher 3x (100%), Stupefy 3x (98%), Falling Star 3x (97%), Hextech Ray 3x (96%), Ravenbloom Student 3x (94%), Retreat 2x (92%), Time Warp 2x (92%)

**Standard** : Lecturing Yordle 2x (87%), Noxus Hopeful 2-3x (81%), Pouty Poro 2x (75%), Watchful Sentry 3x (72%), Cleave 3x (65%), Darius Trifarian 3x (62%)

**Flex** : Plundering Poro 3x (60%), Smoke Screen 2x (55%), Singularity 2x (52%), Void Seeker 2x (50%), Find Your Center 2x (48%), Deadbloom Predator 2x (45%)

**Battlefields** : The Dreaming Tree (70%), Obelisk of Power (55%), Void Gate (50%)

**Top placements** : Won Shanghai NO, Won Chongqing/Guangzhou, 30% Houston field, 5th Atlanta

---

### Master Yi, Wuju Bladesman (~1113 decks) — Body/Calm — Hold

> Légende #2 en volume (Shanghai NO 473 + Beijing 137 + Guangzhou 137 + Chongqing 114 + Shenzhen 59 + Fuzhou 16 + Suzhou 66 + divers). Domine Origins chinois, chute en Spiritforged (2% Shenzhen), retour en Unleashed (Won Suzhou). +2 Might en Hold quasi-imbattable.

Champions : Master Yi Tempered (66%), Master Yi Honed (34%)

**Core (4 cartes)** : Charm 3x (99%), Defy 3x (99%), Discipline 3x (99%), En Garde 2x (90%)

**Standard** : Zhonya's Hourglass 3x (87%), First Mate 3x (84%), Punch First 2x (84%), Lonely Poro 3x (82%), Tasty Faefolk 3x (72%), Guardian Angel 2x (65%), Vilemaw 2x (63%), Challenge 2x (61%)

**Flex** : Scuttle Crab 3x (60%), Rengar Trophy Hunter 3x (60%), Sabotage 1x (35%), Akshan Mischievous 1x (32%), Ruin Runner 2x (30%)

**Battlefields** : Star Spring (59%), Vilemaw's Lair (57%), Startipped Peak (35%)

**Top placements** : **Won Suzhou (燐川)**, 2nd Houston, 2nd Lille, 2nd Shanghai NO, 35 top 8 CC

---

### Irelia, Blade Dancer (~493 decks) — Calm/Chaos — Tempo

Champion : Irelia, Fervent (100%)

**Core (10 cartes)** : Defiant Dance 3x (99%), Discipline 3x (100%), Defy 3x (100%), Charm 2x (98%), En Garde 2x (98%), Boots of Swiftness 2x (98%), Ride the Wind 2x (93%), Not So Fast 2x (96%), Stellacorn Herder 3x (96%), Guardian Angel 2x (93%)

**Standard** : Tideturner 2-3x (75%), Stacked Deck 2x (66%)

**Flex** : Lonely Poro 2x (55%), Zhonya's Hourglass 2x (57%), Adaptatron 1x (53%), Scuttle Crab 3x (52%), Star-Crossed 2x (48%), Flash 1x (45%), Rebuke 1x (39%), Gust 1x (37%), Fizz Trickster 1x (32%), Irelia Fervent (extra) 1x (30%)

**Battlefields** : Sunken Temple (87%), Targon's Peak (72%), Abandoned Hall (52%)

**Top placements** : Won Sydney, Won Shenzhen, Finalist Suzhou, 3rd Atlanta (x2), 3rd Bologna, 3rd Xi'an

---

---

### Diana, Scorn of the Moon (~83 decks) — Chaos/Mind — Aggro-tempo

Champion : Diana, Lunari (100%)

**Core (9 cartes)** : Stacked Deck 3x, Stupefy 3x, Moonfall 3x, Ride the Wind 2x, Star-Crossed 2x, Gust 2x, Hwei Brooding Painter 3x, Tideturner 3x, Ravenbloom Student 3x

**Standard** : Fizz Trickster 2x, Vex Apathetic 2x, Flash 2x, Hard Bargain 1x, Thousand-Tailed Watcher 2x

**Flex** : Vex Cheerless 2x, Eclipse 2x, Acceptable Losses 2x, Abandon 1x, Plundering Poro 2x, The Syren 1x, Last Rites 1x

**Battlefields** : Abandoned Hall (81%), Ravenbloom Conservatory (58%), Targon's Peak (50%)

**Top placements** : 2nd Xi'an, Top 4 Sydney

---

### Fiora, Grand Duelist (~210 decks) — Body/Order — Buff midrange

Champions : Fiora Victorious (61%), Fiora Worthy (39%)

**Core (2 cartes)** : Punch First 2x (90%), Riposte 3x (100%)

**Standard** : Challenge 2x (85%), Hidden Blade 2x (83%), Pit Rookie 3x (78%), Unsung Hero 3x (78%), First Mate 2x (76%), Akshan Mischievous 1x (78%), B.F. Sword 3x (78%), Call to Glory 2x (66%), Sett Brawler 2x (66%)

**Flex** : Harnessed Dragon 2x (54%), Sabotage 2x (51%), Sea Monkey 2x (46%), Doran's Blade 2x (46%), Elder Dragon 2x (44%), Spectral Matron 2x (41%), Rift Herald 2x (39%), Deathgrip 2x (37%), Kinkou Monk 2x (34%), Fiora Victorious (extra) 2x (32%)

**Battlefields** : Monastery of Hirana (63%), Sunken Temple (63%), Valley of Idols (44%)

**Top placements** : **2nd Fuzhou**, 11th Lille, 2 CC wins (Beijing, Tianjin)

---

### LeBlanc, Deceiver (~69 decks) — Mind/Order — Deathknell engine

Champions : LeBlanc Fragmented (81%), LeBlanc Everywhere at Once (19%)

**Core (7 cartes)** : Soaring Scout 3x, Watchful Sentry 3x, Vi Peacekeeper 2x, Thousand-Tailed Watcher 2x, Sacrifice 2x, Hidden Blade 3x, Mirror Image 3x

**Standard** : Glasc Mixologist 3x, Karthus Eternal 3x, Cull the Weak 3x, Ruined Rex 2x, Deathgrip 2x, Honest Broker 2x

**Flex** : Black Rose Dignitary 2x, Rift Herald 2x, LeBlanc Fragmented (extra) 2x, Salvage 2x

**Battlefields** : Windswept Hillock (97%), Dusk Rose Lab (91%), Forbidding Waste (66%)

**Top placements** : 6th Xi'an, Top 8 Sydney

---

### Sivir, Battle Mistress (~136 decks) — Body/Chaos — Aurora ramp

Champion : Sivir, Mercenary (100%)

**Core (3 cartes)** : Stacked Deck 3x (97%), Sabotage 3x (97%), Dazzling Aurora 3x (90%)

**Standard** : Catalyst of Aeons 3x (87%), Last Rites 2x (87%), Mobilize 3x (87%), Gust 3x (85%), Scryer's Bloom 3x (79%), Elder Dragon 3x (77%), Lunar Boon 3x (77%), Flurry of Blades 3x (74%), Treasure Trove 3x (72%), Mindsplitter 2x (67%), Challenge 2x (64%)

**Battlefields** : Aspirant's Climb (100%), Sigil of the Storm (100%), Forgotten Monument (48%)

**Top placements** : 2nd Sydney, 9th Vegas, Top 4 Suzhou

---

### Sett, The Boss (~119 decks) — Body/Order — Buff midrange

Champions : Sett Brawler (89%), Sett Kingpin (11%)

**Core (5 cartes)** : Showstopper 3x (97%), Challenge 3x (92%), Punch First 2x (92%), Sabotage 2x (92%), Hidden Blade 2x (92%)

**Standard** : Pit Rookie 3x (78%), First Mate 3x (78%), Akshan Mischievous 1x (76%), Fiora Victorious 3x (73%), Sea Monkey 2x (68%)

**Flex** : Sacrifice 2x (57%), Shepherd's Heirloom 3x (54%), Call to Glory 2x (51%), Vi Peacekeeper 2x (49%), Unsung Hero 3x (46%), Rift Herald 2x (43%), Harnessed Dragon 2x (43%), Sett Brawler (extra) 2x (38%), B.F. Sword 3x (38%), Elder Dragon 2x (35%)

**Battlefields** : Monastery of Hirana (81%), Sunken Temple (73%), Valley of Idols (50%)

**Top placements** : 7th Atlanta, CC win Nanjing

---

### Ahri, Nine-Tailed Fox (~138 decks) — Calm/Mind — Tempo/value

Champions : Ahri Inquisitive (73%), Ahri Alluring (27%)

**Core (2 cartes)** : Defy 3x (97%), Thousand-Tailed Watcher 2x (92%)

**Standard** : Discipline 3x (86%), Charm 2x (78%), Ravenbloom Student 3x (68%), Zhonya's Hourglass 2x (65%)

**Flex** : Stupefy 3x (57%), Not So Fast 2x (54%), Back Off 2x (51%), Emperor's Divide 2x (49%), Vilemaw 2x (46%), Scuttle Crab 3x (43%), Irelia Fervent 2x (41%), Blitzcrank Impassive 2x (38%), Blue Sentinel 3x (35%), Sona Harmonious 2x (32%)

**Battlefields** : Grove of the God-Willow (52%), Ravenbloom Conservatory (24%), Trifarian War Camp (24%)

**Top placements** : 31st Atlanta

---

### Vex, Gloomist (~48 decks) — Calm/Chaos — Hold-control

Champion : Vex, Apathetic (100%)

**Core (3 cartes)** : Evelynn Entrancing 2x, Defy 3x, Discipline 3x

**Standard** : Mutated Mouser 3x, Sona Harmonious 2x, Tideturner 2x, Boots of Swiftness 2x, Edge of Night 2x, Charm 2x, Switcheroo 2x, Back Off 2x, Star-Crossed 2x

**Flex** : Overzealous Fan 2x, Sneaky Deckhand 3x, Zhonya's Hourglass 2x, Last Rites 1x, Stacked Deck 2x, Existential Dread 2x, Not So Fast 2x, Gust 1x, Emperor's Divide 1x, Blitzcrank Impassive 1x, Teemo Scout 1x

**Battlefields** : Startipped Peak (64%), Fortified Position (44%), Amateur Recital (28%)

---

### Azir, Emperor of the Sands (~68 decks) — Calm/Order — Equipment tokens

Champion : Azir, Sovereign (100%)

**Core (8 cartes)** : Arise! 3x (97%), Doran's Shield 3x (94%), Eye of the Herald 3x (94%), Brutalizer 3x (94%), B.F. Sword 3x (92%), Defy 3x (92%), Discipline 3x (92%), Hidden Blade 3x (92%)

**Standard** : Soul Sword 2x (83%), Charm 2x (81%), Guards! 2x (78%), Cull the Weak 2x (75%), Shadow's Call 2x (69%), Desert's Call 2x (64%)

**Flex** : Salvage 1x (56%), Deathgrip 2x (53%), Vi Peacekeeper 2x (50%), Shepherd's Heirloom 3x (39%), Call to Glory 2x (36%)

**Battlefields** : Trifarian War Camp (83%), Hall of Legends (78%), Ornn's Forge (65%)

**Top placements** : **Won Xi'an** + **Won Lille 14-0-2**. 2 Regional wins

---

### Draven, Glorious Executioner (~660 decks) — Chaos/Fury — Midrange

Champions : Draven Vanquisher (51%), Draven Showboat (48%)

**Core (4 cartes)** : Noxus Hopeful 3x (94%), Spinning Axe 3x (96%), Stacked Deck 3x (100%), Rebuke 2x (98%)

**Standard** : Tideturner 2-3x (83%), Overzealous Fan 3x (83%), Kai'Sa Survivor 3x (79%), Hard Bargain 1x (81%), Ride the Wind 2x (80%), Ferrous Forerunner 2x (75%), Falling Star 2x (75%), Darius Trifarian 3x (73%), Brynhir Thundersong 2x (70%), Treasure Hunter 3x (60%)

**Flex** : Fight or Flight 3x (51%), Switcheroo 1x (43%), Cleave 2x (36%)

**Battlefields** : Targon's Peak (66%), Zaun Warrens (55%), Obelisk of Power (50%)

**Top placements** : **Won Fuzhou (35.8% field)**, 1st Vegas, 2nd Atlanta (x2), 3rd Vegas

---

### Leona, Radiant Dawn (~72 decks) — Calm/Order — Midrange defensif

Champions : Leona Determined (65%), Leona Zealot (35%)

**Core (4 cartes)** : Vi Peacekeeper 3x, Defy 3x, Discipline 3x, Back Off 3x

**Standard** : Scuttle Crab 3x, Vex Mocking 2x, Fiora Victorious 3x, Call to Glory 3x, Hidden Blade 2x, Zenith Blade 2x, Emperor's Divide 2x, Zhonya's Hourglass 2x

**Battlefields** : Sunken Temple (90%), Monastery of Hirana (65%)

---

### Miss Fortune, Bounty Hunter (~167 decks) — Body/Chaos — Aurora ramp

Champion : Miss Fortune, Captain (100%)

**Core (6 cartes)** : Stacked Deck 3x, Catalyst of Aeons 3x, Mobilize 3x, Sabotage 2x, Dazzling Aurora 3x, Last Rites 2x

**Standard** : Elder Dragon 3x, Scryer's Bloom 3x, Flurry of Blades 3x, Gust 3x, Invert Timelines 1x, Lunar Boon 3x, Mindsplitter 2x, Hard Bargain 1x, Challenge 2x, Baron Nashor 2x

**Battlefields** : Aspirant's Climb (95%), Sigil of the Storm (95%), Vilemaw's Lair (50%)

---

### Lillia, Bashful Bloom (17 decks) — Calm/Mind — Control-tempo

Champion : Lillia, Fae Fawn (100%)

**Core (7 cartes)** : Sprite Fountain 3x, Smoke and Mirrors 3x, Sprite Burst 3x, Defy 3x, Discipline 3x, Charm 2x, Thousand-Tailed Watcher 3x

**Standard** : Plundering Poro 3x, Ravenbloom Student 3x, En Garde 2x, Stupefy 3x, Lilting Lullaby 1x, Unchecked Power 2x, Heart of Dark Ice 2x

**Battlefields** : Dusk Rose Lab (82%), Forbidding Waste (59%), Seat of Power (53%)

---

---

### Viktor, Herald of the Arcane (~580 decks) — Mind/Order — Control

Champions : Viktor Herald (diverses)

**Core (4 cartes)** : Hidden Blade 3x (95%), Cull the Weak 3x (92%), Bellows Breath 2x (92%), Thousand-Tailed Watcher 2x (90%)

**Standard** : Watchful Sentry 3x (76%), Imperial Decree 2x (73%), Honest Broker 2x (68%), Soaring Scout 3x (65%)

**Battlefields** : Obelisk of Power (54%), The Dreaming Tree (41%), Dusk Rose Lab (38%)

**Top placements** : 4th Bologna

---

### Ezreal, Prodigal Explorer (~158 decks) — Chaos/Mind — Control-burn

Champions : Ezreal Prodigy (88%), Ezreal Seeker (12%)

**Core (6 cartes)** : Stacked Deck 3x (100%), Stupefy 3x (97%), Thousand-Tailed Watcher 3x (97%), Gust 2x (94%), Wages of Pain 3x (91%), Fizz Trickster 2x (91%)

**Standard** : Bellows Breath 2x (82%), Ravenbloom Student 3x (73%), Star-Crossed 2x (70%)

**Battlefields** : Abandoned Hall (67%), Targon's Peak (52%), Ravenbloom Conservatory (39%)

**Top placements** : 1st Bologna (Alanzq), 4th Atlanta

---

### Annie, Dark Child (~92 decks) — Chaos/Fury — Aggro

Champions : Annie Furious (65%), Annie Pyromania (35%)

**Core (3 cartes)** : Stacked Deck 3x (100%), Noxus Hopeful 3x (94%), Tideturner 3x (94%)

**Standard** : Rebuke 2x (87%), Ride the Wind 2x (84%), Ferrous Forerunner 2x (81%), Hard Bargain 1x (77%), Kai'Sa Survivor 3x (74%), Overzealous Fan 3x (68%), Darius Trifarian 3x (65%)

**Battlefields** : Zaun Warrens (65%), Targon's Peak (58%), Obelisk of Power (52%)

**Top placements** : 1st Atlanta, 1st Houston, 4th Lille

---

### Miss Fortune, Bounty Hunter (~167 decks, section détaillée) — Body/Chaos — Aurora ramp

Champion : Miss Fortune, Captain (100%)

**Core (5 cartes)** : Stacked Deck 3x (100%), Catalyst of Aeons 3x (97%), Mobilize 3x (94%), Dazzling Aurora 3x (94%), Sabotage 2x (90%)

**Standard** : Last Rites 2x (87%), Gust 3x (84%), Elder Dragon 3x (81%), Scryer's Bloom 3x (77%), Lunar Boon 3x (74%), Flurry of Blades 3x (71%), Challenge 2x (65%), Hard Bargain 1x (58%)

**Battlefields** : Aspirant's Climb (95%), Sigil of the Storm (95%), Vilemaw's Lair (50%)

**Top placements** : 2nd Bologna (Sebiq)

---

### Autres legendes (resume)

| Legend | Decks | Domains | Core cards | Type |
|--------|-------|---------|------------|------|
| Teemo | ~148 | Chaos/Mind | Stacked Deck + diverse flex | Tempo-disrupt |
| Jinx | ~105 | Chaos/Fury | Stacked Deck + 8 standard aggro | Aggro |
| Volibear | ~106 | Body/Fury | Kadregrin, Elder Dragon, Challenge + ramp | Ramp-midrange |
| Lee Sin | ~101 | Body/Calm | Defy, Challenge, Discipline + combat tricks | Tempo |
| Darius | ~78 | Body/Fury | Hidden Blade + aggro units | Aggro |
| Leona | ~83 | Calm/Order | Vi Peacekeeper, Defy, Discipline, Back Off | Midrange defensif |
| Yasuo | ~82 | Calm/Chaos | Stellacorn Herder, Defy, En Garde, Discipline | Tempo |
| Lucian | ~80 | Fury/Order | 5 core + 8 standard equip aggro | Aggro-equip |
| Jax | ~75 | Body/Calm | Counter Strike, Defy, Challenge, Discipline + 6 core | Equipment-value |
| Rumble | ~75 | Chaos/Fury | 5 core + 9 standard aggro units | Aggro |
| Lux | ~72 | Mind/Order | Spell-heavy control, 0 core, 12 standard | Control |
| Rek'Sai | ~73 | Body/Fury | Aggro tunneler | Aggro |
| Ornn | ~63 | Calm/Mind | Defy + 7 standard gear-heavy | Gear-value |
| Renata Glasc | ~38 | Mind/Order | 4 core control | Control |
| Garen | ~23 | Body/Order | 3 core aurora ramp | Ramp |
| Lillia | ~49 | Calm/Mind | Sprite Fountain, Defy, Discipline + 7 core | Control-tempo |
| Rengar | ~33 | Body/Fury | Thrill of the Hunt + aggro units. CC win Guangzhou | Aggro |
| Master Yi Wuju Master | ~21 | Body/Calm | Gemhand Hunter, Wuju Apprentice. 0 top 8 | Aggro-synergy |
| Vi | ~20 | Fury/Order | Hextech Gauntlets, Hidden Blade + aggro | Aggro-equip |
| Pyke | ~20 | Chaos/Fury | Treasure Hunter, Star-Crossed, Falling Star | Aggro-value |
| Kha'Zix | ~24 | Body/Chaos | Punch First, Grim Resolve, Void Assault. T2 riftbound.gg | Aggro-combo |
| Poppy | ~11 | Body/Order | **3rd Suzhou**. Yordle aggro. Outlier | Aggro |
| Jhin | ~16 | Mind/Order | Combo précision. 9 decks Suzhou | Combo |
| Ivern | ~7 | Calm/Order | Support ramp | Support |

---

## 3. Regles par paire de Domains

### Fury/Mind (~1418 decks) — Kai'Sa, Rumble, Jhin

**Staples (50%+)** : Thousand-Tailed Watcher 3x (100%), Stupefy 3x (98%), Falling Star 3x (97%), Hextech Ray 3x (96%), Ravenbloom Student 3x (94%), Retreat 2x (92%), Time Warp 2x (92%), Lecturing Yordle 2x (87%), Noxus Hopeful 3x (81%), Pouty Poro 2x (75%)

**Identite** : Domain pair #1 du format global (~21%). Completement domine par Kai'Sa (~1340/1418). Tempo-combo avec beaucoup de draw et menaces.

---

### Body/Calm (~1231 decks) — Master Yi, Jax, Lee Sin

**Staples (50%+)** : Defy 3x (100%), Discipline 3x (96%), Charm 3x (90%), Zhonya's Hourglass 3x (82%), Punch First 2x (82%), En Garde 2x (80%), First Mate 3x (78%), Tasty Faefolk 3x (72%), Lonely Poro 3x (70%), Challenge 2x (65%)

**Identite** : Domain pair #2 (~18%). Domine par Master Yi (~1031/1231). Hold et board presence. Unites a fort Might avec Defy + Zhonya's pour protection.

---

### Calm/Chaos (~514 decks) — Irelia, Vex, Yasuo

**Staples (50%+)** : Defy 3x (100%), Discipline 3x (99%), Charm 2x (91%), Boots of Swiftness 2x (89%), En Garde 2x (83%), Not So Fast 2x (79%), Tideturner 3x (78%), Stellacorn Herder 3x (77%), Ride the Wind 2x (77%), Star-Crossed 2x (77%)

**Identite** : Le duo le plus reactif du format. 15-20+ sorts interactifs. Domine les top cuts.

---

---

### Body/Order (~307 decks) — Fiora, Sett, Poppy, Garen

**Staples (50%+)** : Challenge 2x (78%), Punch First 2x (74%), Sabotage 2x (69%), First Mate 3x (68%), Hidden Blade 2x (68%), Sacrifice 2x (67%), Pit Rookie 3x (65%), Call to Glory 2x (57%), Akshan Mischievous 1x (53%)

**Identite** : Midrange buff. Unites efficaces + combat tricks + removal Order. Split entre Fiora/Sett (midrange) et Poppy/Garen (Aurora ramp).

---

### Mind/Order (~505 decks) — LeBlanc, Viktor, Lux, Renata Glasc

**Staples (50%+)** : Cull the Weak 3x (85%), Hidden Blade 3x (78%), Thousand-Tailed Watcher 2x (76%), Watchful Sentry 3x (57%), Soaring Scout 3x (54%), Honest Broker 2x (53%), Sacrifice 2x (51%), Salvage 1x (51%), Vi Peacekeeper 2x (50%), Bellows Breath 2x (50%)

**Identite** : Controle et Deathknell. LeBlanc a son engine unique. Viktor/Lux/Renata sont du pur control avec removal.

---

### Chaos/Mind (~323 decks) — Diana, Ezreal, Teemo

**Staples (50%+)** : Stacked Deck 3x (98%), Star-Crossed 2x (94%), Gust 2x (92%), Stupefy 3x (88%), Fizz Trickster 2x (82%), Tideturner 3x (72%), Vex Apathetic 2x (72%), Ride the Wind 2x (71%), Thousand-Tailed Watcher 2x (69%), Ravenbloom Student 3x (62%)

**Identite** : Aggro-tempo (Diana) ou controle (Ezreal). Meilleur package reactif du jeu. Hwei en finisher.

---

### Body/Chaos (~277 decks) — Sivir, Miss Fortune, Kha'Zix

**Staples (50%+)** : Stacked Deck 3x (98%), Sabotage 3x (97%), Last Rites 2x (85%), Dazzling Aurora 3x (83%), Mobilize 3x (83%), Catalyst of Aeons 3x (83%), Gust 3x (80%), Elder Dragon 3x (77%), Scryer's Bloom 3x (77%), Lunar Boon 3x (75%)

**Identite** : Le trio Aurora. Core de 20+ cartes identique (ramp package). Kha'Zix est l'exception avec un build aggro.

---

### Calm/Mind (~206 decks) — Ahri, Lillia, Ornn

**Staples (50%+)** : Defy 3x (100%), Thousand-Tailed Watcher 2x (91%), Charm 2x (79%), Discipline 3x (74%), Stupefy 3x (56%), Sprite Fountain 3x (56%), Sprite Burst 3x (54%), Ravenbloom Student 3x (54%)

**Identite** : Value/controle. Sprite Fountain en draw engine. Lillia la plus raffinee.

---

### Calm/Order (~183 decks) — Azir, Leona, Ivern

**Staples (50%+)** : Defy 3x (96%), Discipline 3x (94%), Hidden Blade 3x (86%), Charm 2x (74%), Vi Peacekeeper 2x (70%), Back Off 2x (58%), B.F. Sword 3x (56%), Salvage 1x (50%)

**Identite** : Board + tokens. Azir genere des tokens via gears et Arise!. Leona est midrange defensif.

---

### Chaos/Fury (~660 decks) — Draven, Jinx, Annie, Pyke

**Staples (50%+)** : Stacked Deck 3x (96%), Tideturner 3x (91%), Noxus Hopeful 3x (87%), Ride the Wind 2x (80%), Ferrous Forerunner 3x (74%), Kai'Sa Survivor 3x (72%), Falling Star 2x (65%), Rebuke 2x (63%), Overzealous Fan 3x (59%), Darius Trifarian 3x (59%)

**Identite** : Aggro et midrange agressif. Package Fury (Noxus Hopeful + Ferrous Forerunner + Kai'Sa Survivor) tres solide.

---

### Body/Fury (~172 decks) — Rengar, Volibear, Lucian

**Staples (50%+)** : Challenge 3x (84%), Sabotage 2x (71%), Punch First 2x (68%), Confront 3x (50%)

**Identite** : Rengar/Volibear jouent Aurora en variante. Lucian est aggro equip. Tres divers.

---

---

### Fury/Order (~143 decks) — Darius, Rek'Sai, Vi, Lucian

**Staples (50%+)** : Hidden Blade 2x (93%), Noxus Hopeful 3x (73%), Falling Star 2x (67%), Ferrous Forerunner 2x (63%), Deathgrip 2x (60%), Honest Broker 3x (57%), Carrion Dredger 3x (53%), Cull the Weak 2x (53%)

**Identite** : Aggro/midrange equip. Deathgrip + Honest Broker core.

---

## 4. Regles par archetype

### Aggro (Diana, Draven, Annie, Jinx, Lucian, Rengar)

- **Unites** : 15-25, beaucoup de low-cost
- **Sorts** : 10-22 (tricks, pas de draw lent)
- **Win con** : scorer 8 points via Conquer avant que l'adversaire stabilise
- **Cartes cles** : Stacked Deck (draw), Noxus Hopeful (early threat), Ferrous Forerunner (mid threat), Kai'Sa Survivor (finisher), Tideturner (evasion)
- **Erreurs** : trop de 5+ cost, pas assez de tricks reactifs

### Midrange (Master Yi, Sett, Fiora, Vex, Ahri, Leona)

- **Unites** : 14-18, efficaces en combat
- **Sorts** : 16-20 (mix tricks + removal)
- **Win con** : board superieure + scoring Conquer/Hold
- **Cartes cles** : Defy/Discipline (Calm protection), Challenge/Punch First (Body combat), Hidden Blade/Sacrifice (Order removal)
- **Erreurs** : pas de plan clair, ni aggro ni controle

### Controle (Ezreal, Viktor, Lux, Lillia)

- **Unites** : 8-14 (value engines)
- **Sorts** : 20-25 (removal + draw + disruption)
- **Win con** : epuiser l'adversaire, scorer en late
- **Cartes cles** : Stupefy 3x, Wages of Pain, Bellows Breath, Sprite Fountain (draw), Singularity (finisher), Thousand-Tailed Watcher (value)

### Aurora Ramp (Sivir, MF, Volibear, Poppy, Garen)

- **Core package (18 cartes)** : Catalyst of Aeons 3x, Dazzling Aurora 3x, Elder Dragon 3x, Mobilize 3x, Flurry of Blades/Sabotage 3x, Scryer's Bloom/Lunar Boon 3x
- **Win con** : ramp vers Aurora tour 5-7, dominer avec Elder Dragon
- **BFs quasi-universels** : Aspirant's Climb + Sigil of the Storm

### Deathknell (LeBlanc)

- **Core engine** : Sacrifice + Karthus Eternal + Mirror Image + Glasc Mixologist + Ruined Rex + Soaring Scout/Watchful Sentry
- **24 unites en moyenne** — le build avec le plus d'unites du format
- **Win con** : chain Deathknell triggers pour draw + value explosive
- **BFs** : Windswept Hillock (97%) + Dusk Rose Lab (91%) + Forbidding Waste (66%)

### Hold (Master Yi Bladesman, Vex)

- **Core** : Defy + Discipline + Zhonya's + Guardian Angel + Lonely Poro
- **Win con** : Conquer un BF, puis Hold tour apres tour (+1 pt/tour)
- **BFs** : Star Spring, Vilemaw's Lair, Startipped Peak
- **Master Yi** = +2 Might en Hold, quasi-imbattable en defense

---

## 5. Tech cards et anti-meta

### vs Aggro
- Stupefy, Defy, Lonely Poro, Star-Crossed, Ashe Focused

### vs Control
- Stacked Deck (draw), Sabotage (disruption), threats aggro (Noxus Hopeful, Ferrous Forerunner)

### vs Aurora (Dazzling Aurora)
- Turn to Dust, Unchecked Power, scorer avant tour 5-7, Singularity

### vs Deathknell (LeBlanc)
- Banish au lieu de kill, Sabotage (retirer Karthus/Mirror Image), aggression rapide

### vs Hold (Master Yi)
- Ganking multi-BF, unites a fort Might, aggression rapide

---

## 6. Sideboard rules

- **8 cartes** en side deck
- Cartes universelles de side : Salvage, Ashe Focused, Brynhir Thundersong, Turn to Dust, Sabotage, Star-Crossed, Repulse
- 3 Battlefields fixes (pas de swap), choix strategique en game 2-3

---

## 7. Analyse comparative : gagnants vs elimines

### Tournois majeurs (7987 decks total, 20 tournois)

**Observations cles (7987 decks)** :
- **Chaos** est le domain #1 : present dans 5/12 paires (Chaos/Fury ~660+, Calm/Chaos ~514+, Chaos/Mind ~323+, Body/Chaos ~277+)
- **Fury/Mind** = pair #1 global (~1418 decks, ~18%) grace a Kai'Sa en Origins
- **Kai'Sa** = legende #1 en volume (~1379 decks), dominante Origins (30-38%) mais en declin depuis Spiritforged
- **Master Yi Bladesman** = #2 en volume (~1113 decks), chute Spiritforged (2%), retour Unleashed (Won Suzhou)
- **Draven** = #3 en volume (~660 decks), roi Spiritforged. Won Fuzhou (35.8% field record) + Won Vegas
- **Viktor** = #4 en volume (~627 decks), 11-20% en Origins chinois mais jamais de top 4
- **Irelia** = T1 cross-set (~493 decks), Won Shenzhen + Sydney, Finalist Suzhou. Core verrouille (10 cartes a 90%+)
- **Sivir** = core rigide (Aurora ramp), le meta s'adapte en Unleashed. Top 4 Suzhou
- **LeBlanc** = build le plus unique (24 unites, Deathknell engine). T1 Unleashed
- **Diana** = monte rapidement (~83 decks). T1 Unleashed (riftbound.gg). 2nd Xi'an
- **Fiora** = le plus de flex slots (10+ cartes flex), 2nd Fuzhou. Monte en Spiritforged + Unleashed

### Ce qui differencie les gagnants

| Facteur | Top performers | Elimines |
|---------|---------------|----------|
| Sorts reactifs | 15+ par deck | 8-12 |
| Core verrouille | Suivent le core sans deviation | Trop de tech, pas assez de core |
| Battlefields | BFs optimaux pour l'archetype | BFs generiques |

---

## 8. Procedure de creation de deck

```
ENTREE : Legend + Archetype + Contraintes

1. IDENTIFIER les domains → cartes autorisees
2. CHOISIR l'archetype (analyser l'ability de la Legend)
3. SELECTIONNER le Champion Unit
4. CONSTRUIRE le core (section 2 — cartes 90%+)
5. AJOUTER les standard (section 2 — cartes 60-89%)
6. REMPLIR les flex slots selon le meta (section 5)
7. VERIFIER la courbe : aggro=bas, midrange=equilibre, control=haut
8. CONSTRUIRE les 12 Runes (split selon section 3)
9. CHOISIR 3 Battlefields (section 2 par Legend)
10. CONSTRUIRE le Side Deck (8 cartes, section 6)
11. VALIDER (40 main + 12 runes + 3 BF + 8 side, max 3 copies)

SORTIE : Decklist complete + guide
```

---

## 9. Tendances du format (Mai 2026 — Full dataset 7987 decks)

### Evolution par set

| Legend | Origins | Spiritforged (incl. Fuzhou) | Unleashed (incl. Suzhou) | Tendance |
|--------|---------|---------------------------|--------------------------|----------|
| Kai'Sa | **30-38% field** (~1340 decks), Won tout | 10% Shenzhen, 7.6% Fuzhou (baisse) | 15 decks Suzhou | Reine Origins, déclin continu |
| Master Yi (Bladesman) | 2nd Houston, 2nd Shanghai NO (~1031) | 2% Shenzhen, 3.1% Fuzhou | **Won Suzhou**, 13th Xi'an | Domine Origins, retour Unleashed |
| Draven | — | **Won Fuzhou (35.8%)**, Won Vegas, 5/8 Shenzhen | 13 decks Suzhou | Roi Spiritforged |
| Irelia | — | Won Shenzhen, 12.1% Fuzhou, 3rd Atlanta | **Won Sydney**, **Finalist Suzhou**, 3-4-7-8 Xi'an | Cross-set T1 |
| Annie | Won Houston | 5th Fuzhou, **Won Atlanta**, 4th Lille | 11 decks Suzhou | 3 Regional wins |
| Viktor | 11-20% Origins (~580 decks) | 6% Shenzhen, 5.5% Fuzhou | 19 decks Suzhou | Volume élevé, jamais top 4 |
| Azir | — | **Won Lille 14-0-2** | **Won Xi'an** | 2 Regional wins |
| Ezreal | — | **Won Bologna**, 4th Atlanta | **2x top 8 Suzhou** | Learning curve, monte |
| Diana | — | — | 2nd Xi'an, Top 4 Sydney, 47 decks Suzhou | T1 Unleashed |
| LeBlanc | — | — | Top 8 Xi'an/Sydney, 37 decks Suzhou | T1 Unleashed |
| Fiora | — | **2nd Fuzhou**, 4.7% | 26 decks Suzhou, 2 CC wins | Monte cross-set |

### Cartes montantes (cross-set)
- **Thousand-Tailed Watcher** : staple universel Mind, present dans la majorite des decks Fury/Mind et Chaos/Mind
- **Stupefy** : removal Mind #1, indispensable Origins et Unleashed
- **Noxus Hopeful** : best 1-drop aggro, forte en Origins ET Spiritforged (Draven core)
- **Falling Star** : removal Fury universel, cross-set
- **Stacked Deck** : monte avec l'ajout de Shenzhen data (Chaos/Fury = 22% Shenzhen)

### Cartes en declin
- **Aurora package** : Sivir passe de 2nd Sydney a hors top 8 Xi'an — le meta s'adapte
- **Body/Fury standalone** : toujours le domain pair le plus faible (~172 decks, ~2.5%, aucun top 4 Regional)
- **Master Yi core package** : dominant Origins mais quasiment disparu en Spiritforged (2% Shenzhen)

---

## MAJ — Regional Qualifier Vancouver (31 mai 2026, Unleashed)

Source : VOD officielle Top 8 (`data/videos/vancouver-day1-analysis.md`). Champion : AlanZQ sur Diana. Finaliste : Sam D Sherman sur Rengar Fury.

### Nouveau profil — Rengar, Pridestalker (Body/Fury) — Agro-contrôle
- **Le premier build Fury à atteindre une finale de Regional en Unleashed.** Casse l'idée que Body/Fury est le domain pair le plus faible.
- **Cœur (3x sauf mention)** : Determined Sentry, Inferna, Irresistible Faefolk, Pit Rookie, Grim Apothecary, Kinkou Initiate, Nidalee, Pyke, Kai'Sa Survivor, Thrill of the Hunt (signature). Darius 2x.
- **Sorts** : Punch First 3x, Sabotage 2x, Challenge 2x.
- **Champion** : Rengar Trophy Hunter (jouable depuis la champion zone, applique le buff Pride Stalker à lui-même → se protège d'un Singularity).
- **Battlefields** : Emperor's Dais (rejoue les unités → trigger Rengar), The Arena's Greatest, Star Spring (pseudo-ganking). Runes 8 Body / 4 Fury.
- **Carte clé / philosophie** : Irresistible Faefolk transforme l'agro pur en agro-contrôle (charm une unité adverse sur son battlefield → trade forcé → push). Pride Stalker buff non-limité par tour : empiler les unités = might en surplus. Kai'Sa Survivor = moteur de valeur (NE PAS couper). Thrill of the Hunt sert surtout à conquérir tôt puis blink ailleurs pour des points.
- **Faiblesse** : Nidalee tend à rester coincée en main contre le contrôle ; le deck peut gas-out si l'agression est ralentie (double Vex).

### Diana, Scorn of the Moon — build gagnant Vancouver (raffinement)
- Évolutions vs Sydney : Gust passe de side à 3x main (tempo). Vex Apathetic 2x + Vex Cheerless en main (anti-Fury). Acceptable Losses + Turn to Dust = gear hate main-deck (à SIDE-OUT contre un deck sans gear comme Rengar — sinon cartes mortes).
- Moteur : Ravenbloom Conservatory (consistance), boucle Fizz + Star-Crossed pour retuer le Hwei adverse, Stacked Deck gardé longtemps pour la réponse exacte, Moonfall removal.
- Variante Diwali : + Frigid Jewel (gear, +2 might à la 2e pioche) + Consult the Past (draw caché, anti-gas-out). Runes ~6 Mind / 6 Chaos.

### Tech & règles méta (post-Vancouver)
- **vs Fury/Rengar** : Vex Apathetic est LA réponse (stun + blocage ambush/accelerate) ; doubler avec Vex Cheerless = verrou quasi-total. Tuer/empêcher Kai'Sa Survivor prioritaire. Hard Bargain en réponse au Thrill of the Hunt neutralise le finisher.
- **Punch First** : LE débloqueur Fury contre les unités défensives et Vex (envoyer plus de might). À toujours respecter quand l'adversaire Body laisse 1 rune.
- **vs Aurora** : grouper ses unités sur un même battlefield neutralise l'Elder Dragon (un seul clear) ; Turn to Dust en multiple est la tech reine. Aurora reste binaire : si le plan A ne se pose pas, pas d'outils interactifs.
- **Playoffs = decklists ouvertes** : sideboard à information quasi-parfaite ; sortir ses cartes mortes (gear hate vs deck gearless) est impératif. Brenn/Thundersong (lock après réaction) punit les joueurs qui laissent 4+ runes ouverts (ex : Diana).
- **Confirmation déclin Aurora** : 1 seul Aurora en Top 8 Vancouver (Sivir), sorti en quart — le gear hate généralisé referme la fenêtre, et touche aussi les Irelia/Aurelia gear.
