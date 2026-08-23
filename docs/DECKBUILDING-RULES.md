# DECKBUILDING-RULES.md — Regles de construction de decks Riftbound

> Mis à jour le 21 août 2026 (v9). **Cores Vendetta recalculés sur 1673 decklists réelles** (15 tournois), pour les 17 Légendes vues au moins trente fois — Master Yi, Kai'Sa, Kennen, Irelia, Nasus, Diana, Rek'Sai, Akali, Jayce, Fiora, Draven, Viktor, Azir, Mel, Lillia, Ezreal et LeBlanc. Le calcul se refait par `npx tsx scripts/cores-vendetta.mts Vendetta 30` : il ne lit que les listes validées contre leur scrape brut. Aucune carte n'est déduite ni ajoutée.

> Mis a jour le 25 juin 2026 (v7). **Tech & cores issus de 84 VOD compétitives** (reformulés FR, matière privée — copyright). Les VOD **confirment** la table canonique de domaines ci-dessous. Ajout d'une section « Confirmations & tech VOD (v7) » : cartes signature/flex par Légende, anti-méta (surtout anti-Aurora), et règles de deckbuilding nouvelles (Bo1 sideboard avant game, nerf des buffs, gear hate en unité). Source fusionnée : `data/video-insights/unleashed-vod-synthesis-2026-06.md`. **Aucune decklist n'est fabriquée depuis les VOD** (toute liste vient du scrape réel).
>
> **MAJ 26 juin (2ᵉ passe, ~184 casts inter-sets) :** **Ban list officielle = 7 cartes** (constructed) — Called Shot, Draven Vanquisher, Fight or Flight, Scrapheap, The Dreaming Tree, Obelisk of Power, **Reaver's Row** ; **à ne jamais inclure dans une liste** (source canonique `src/lib/banned-cards.ts`). Détail des cores/tech/matchups Spiritforged + Origins (Draven domine, Aurelia/Lucian OTK `Ruin Runner`+`Skyfall`+`Trinity Force`, Ezreal Pit Crew, Fiora Baited Hook, Viktor token) et premières impressions Unleashed (Lillia, Pyke) dans `data/video-insights/cross-set-casts-2026-06.md` + les 22 fiches (`data/fiches/*.json`, champ `vodInsights`).
>
> ### Confirmations & tech VOD (v7, juin 2026)
> Cartes citées par les casters comme cœur/flex/tech. À recouper avec le scrape brut avant tout seed (noms en transcription audio parfois approximatifs).
>
> **Anti-méta transverse :** **Vex Apathetic/Cheerless** (stun/taxe, ne ciblent pas → ignorent deflect), **Defy** (~40 % des decks, counter ~70 % des sorts), **Star-Crossed + Fizz** (bounce action-speed, anti-Elder/Aurora/LeBlanc), **Moonfall** (-2 à tout). **Anti-Aurora** : préférer le gear hate **en unité** (Adaptatron, Disarming Rake, Akshan, Action — non recyclable par Sabotage), + Sabotage (2 main / 1 side), Thermo Beam, Mindsplitter ×2 side, Heedless Resurrection (miroir).
>
> | Légende | Domaines | Cœur / tech VOD | Anti / faiblesse |
> |---|---|---|---|
> | Master Yi, Wuju Bladesman | Corps/Calme | Ruin Runner ×3, Rengar Trophy Hunter, First Mate + Star Spring, Punch First/On Guard/Discipline/Challenge, Fiora, Peerless, gear hate main, Zhonya's | Irelia, Diana ; Ruin Runner meurt à Flurry of Blades |
> | Irelia, Blade Dancer | Calme/Chaos | Defiant Dance, Stellacorn Herder, GA, double counterspell, Abandoned Hall (double-dip Fervent), Adaptatron (anti-Aurora) | Aurora high-roll, lourdeur mentale |
> | Diana, Scorn of the Moon | Esprit/Chaos | Hwei, Moonfall, Star-Crossed+Fizz, Vex Apathetic, Tideturner (8e pt), Acceptable Losses, Eclipse, Baron Nashor side | removal (rare), sorts de dégâts (Pyke/Ezreal/Jhin) |
> | Ezreal, Prodigal Explorer | Esprit/Chaos | Fizz loop, Watcher (rejoué via Arcane Shift), Star-Crossed, Bewitching Spirit, Bellows Breath, Mindsplitter, Singularity | Master Yi (Ruin Runner), Irelia, aggro ; Called Shot bannie |
> | LeBlanc, Deceiver | Esprit/Ordre | Karthus (double Death Knell), Glasc Mixologist, Baited Hook, Mirror Image, Ruined Rex + Sacrifice, 3 Seals (pas 2) | decks de hold, Vex (stun reflections) |
> | Annie, Dark Child | Fureur/Chaos | OG Rengar, Sneaky Deckhand (aggro sous Aurora), Ferrous Forerunner, Falling Star, Cleave, Charm | — |
> | Azir, Emperor of the Sands | Calme/Ordre | Soul Sword, cascade équipements (Eye of the Herald/BF Sword) via Hall of Legends, triple Arise, Deathgrip, double Defy | Pickpocket (side adverse) |
> | Sivir/Miss Fortune (Aurora) | Corps/Chaos | Dazzling Aurora T3, Elder Dragon + Flurry of Blades/Mindsplitter, Baron Nashor, Bullet Time, Last Rites ; Sivir gagne le miroir (gold) | gear hate en unité, Star-Crossed, Légendes Ordre, de-ramp |
> | Viktor, Herald of the Arcane | Esprit/Ordre | Bellows Breath (-1 à tout), Cull the Weak, Imperial Decree, Wages of Pain, recruits, Sprite Fountain | Moonfall (-2), Pickpocket |
> | Vex, Gloomist | Calme/Chaos | Vex Apathetic, Sona (ready 4 runes EOT), Existential Dread, Mutated Mouser ; **PAS Grove of the God Willow** (déjà dans la Légende), éviter Scuttle Crab | Aurora, boardwipes, Ezreal |
> | Kha'Zix, Voidreaver | Corps/Chaos | Irresistible Faefolk + ambush Mutating Horror, Void Assault, Fizz, Monastery of Hirana, 8-9 two-drops | decks de hold (Vex/Ivern), LeBlanc, Ezreal ; signature pas une « action » |
> | Pyke, Bloodharbor Ripper | Fureur/Chaos | Ripper's Bay (rampe → Baron Nashor), Bewitching Spirit, Star-Crossed, Death from Below, Falling Star | Vex Apathetic (« tue le rouge »), aggro |
> | Fiora, Grand Duelist | Corps/Ordre | Shepherd's Heirloom (équip via XP), Kinkou Initiate, Set Brawler, Elder Dragon main | go-wide Rek'Sai |
> | Sett, The Boss | Corps/Ordre | Akshan + Arena Bar (moteur de valeur), Irresistible Faefolk, Call to Glory ; nerf : buff déjà présent requis | Aurora (trop lent), violet |
> | Rek'Sai, Void Burrower | Fureur/Ordre | Void Rush, Undertitan (anthem +2), unités hors-main, Seals, Candlelit Sanctum | coûts power (rune choke), Diana late ; counter Riposte |
> | Rengar, Pridestalker | Fureur/Corps | Ambush, Trophy Hunter (champion zone), Thrill of the Hunt, Irresistible Faefolk, Fresh Beans (draw), Determined Sentry | Vex Apathetic, Draven mid-range |
> | Lillia, Bashful Bloom | Esprit/Calme | Lillia Faeforn, Sprite Fountain, tokens Sprite, Sprite Burst, Lilting Lullaby, Defy ×3 | Vex Apathetic, aggro-hold (Draven) |
> | Jhin, Virtuoso | Fureur/Esprit | Curtain Call, Deadly Flourish, Singularity ×3, Time Warp, Rocket Barrage (anti-gear), Jhin Meticulous Killer ×3 | vert/Deflect, Vex, Master Yi XP |
> | Kai'Sa, Daughter of the Void | Fureur/Esprit | Time Warp ×3, Thermo Beam, Singularity + Stupefy (prive Aurora de cibles), Baron Nashor (côté Aurora adverse) | Irelia |
> | Master Yi, Wuju Master | Corps/Calme | Master Yi Tempered (Hunt 2), paliers niv. 6/11, Voracious Gromp, Elder Dragon, White Flame Protector, Concentrate, Alpha Strike | aucun avantage early (méta tempo) |
> | Ivern, Greenfather | Calme/Ordre | Brush (symétrique), Ivern Nurture, Trusty Ramhound, Daisy, Friendship, Alpha Wild Claw, Emperor's Divide | Draven (anti-hold), bleu non-ciblé |
> | Vi, Piltover Enforcer | Fureur/Ordre | Vi Destructive (Ganking), gears (Hextech Gauntlets/BF Sword), Deathgrip, Sacrifice, Hidden Blade, Rek'Sai/Darius closers | gear removal (Salvage/Action/Thermo Beam) |
>
> **Règles de deckbuilding nouvelles (VOD) :** (1) **Bo1 = sideboard avant la partie** → prévoir une config anti-Aurora prête ; piège pour Sivir/MF mid-range (pas de gear). (2) **Nerf des buffs** : il faut déjà un buff présent pour le dépenser (touche Sett/Vi). (3) Le **gear hate en unité** (Akshan/Action) bat l'Aurora mieux que les contre-sorts (Sabotage les recycle). (4) Decks de **hold** (Vex/Ivern/Ahri) : afficher le total de might (compteur) — leur pire ennemi est l'horloge (overtime à +2 = tie).
> Mis a jour le 25 juin 2026 (v6). Intégration des sources éditoriales **riftbound.gg** (recaps Utrecht/Hartford + tier lists « Tianjin » et « One More Regional Until Vendetta »). Ajout : **table canonique des paires de domaines par Légende** (40 Légendes Unleashed) confirmée par riftbound.gg, + ordre de tier list à jour (voir bloc « Paires de domaines (référence riftbound.gg) » ci-dessous). Corrections notables vs versions précédentes : **Rek'Sai = Fureur/Ordre** (et non Corps/Fureur), **Darius = Fureur/Ordre**, **Jhin = Fureur/Esprit** (et non Esprit/Ordre), **Rengar = Fureur/Corps**. Détail complet du méta dans META-KNOWLEDGE.md (v6).
>
> ### Paires de domaines (référence riftbound.gg, juin 2026)
> Source d'autorité pour les 2 domaines de chaque Légende (à utiliser pour les runes et l'identité de domaine). Tier = dernière tier list éditoriale (post-Changsha/Utrecht).
>
> | Tier | Légende | Domaines |
> |------|---------|----------|
> | 1 | Diana, Scorn of the Moon | Esprit/Chaos |
> | 1 | Irelia, Blade Dancer | Calme/Chaos |
> | 1 | Master Yi, Wuju Bladesman | Corps/Calme |
> | 1 | Azir, Emperor of the Sands | Calme/Ordre |
> | 2 | LeBlanc, Deceiver | Esprit/Ordre |
> | 2 | Annie, Dark Child | Fureur/Chaos |
> | 2 | Sivir, Battle Mistress | Corps/Chaos |
> | 2 | Ezreal, Prodigal Explorer | Esprit/Chaos |
> | 2 | Rek'Sai, Void Burrower | Fureur/Ordre |
> | 2 | Vex, Gloomist | Calme/Chaos |
> | 2 | Fiora, Grand Duelist | Corps/Ordre |
> | 2 | Viktor, Herald of the Arcane | Esprit/Ordre |
> | 2 | Rengar, Pridestalker | Fureur/Corps |
> | 2 | Kha'Zix, Voidreaver | Corps/Chaos |
> | 2 | Miss Fortune, Bounty Hunter | Corps/Chaos |
> | 3 | Draven, Glorious Executioner | Fureur/Chaos |
> | 3 | Sett, The Boss | Corps/Ordre |
> | 3 | Darius, Hand of Noxus | Fureur/Ordre |
> | 3 | Lillia, Bashful Bloom | Esprit/Calme |
> | 3 | Pyke, Bloodharbor Ripper | Fureur/Chaos |
> | 3 | Kai'Sa, Daughter of the Void | Fureur/Esprit |
> | 3 | Lux, Lady of Luminosity | Esprit/Ordre |
> | 3 | Teemo, Swift Scout | Esprit/Chaos |
> | 4 | Master Yi, Wuju Master | Corps/Calme |
> | 4 | Poppy, Keeper of the Hammer | Corps/Ordre |
> | 4 | Volibear, Relentless Storm | Fureur/Corps |
> | 4 | Ahri, Nine-Tailed Fox | Esprit/Calme |
> | 4 | Vi, Piltover Enforcer | Fureur/Ordre |
> | 4 | Jax, Grandmaster At Arms | Corps/Calme |
> | 4 | Lucian, Purifier | Fureur/Corps |
> | 4 | Ornn, Fire Below the Mountain | Esprit/Calme |
> | 5 | Jhin, Virtuoso | Fureur/Esprit |
> | 5 | Yasuo, Unforgiven | Calme/Chaos |
> | 5 | Lee Sin, Blind Monk | Fureur/Corps |
> | 5 | Jinx, Loose Cannon | Fureur/Chaos |
> | 5 | Leona, Radiant Dawn | Calme/Ordre |
> | 5 | Ivern, Green Father | Calme/Ordre |
> | 5 | Renata Glasc, Chem-Baroness | Esprit/Ordre |
> | 5 | Rumble, Mechanized Menace | Fureur/Esprit |
> | 5 | Garen, Might of Demacia | Corps/Ordre |
>
> Mis a jour le 15 juin 2026 (v5). Ajouts : **S3 Changsha Regional Open** (640 j., 638 decklists, intégralité du field), **RQ Vancouver** (final standings, 118 listes) et **RQ Utrecht** (top 16). Unleashed → **6 906 decks classés**. Tier lists recalculées.
> - **Deux légendes Master Yi** (à lire sur chaque deck, jamais déduites du set) : **Wuju Bladesman** — champion *Honed*, Body/Calm hold, la dominante (~10,8% Unleashed) — et **Wuju Master** — champion *Tempered*, Body/Calm, archétype de niche (~0,4%, présent à Changsha avec 18 listes). NB : le bloc « Master Yi, Wuju Master » plus bas (core Defy/Discipline/Zhonya's) décrit en réalité le **Bladesman** (étiquetage hérité v3).
> - Vainqueurs : Changsha = **Irelia** (tempo gear) ; Utrecht = **Azir** (Squirtle, tokens equip) ; Vancouver = **Diana** (AlanZQ). Méta Unleashed le plus ouvert à ce jour (Utrecht : 8 légendes / 8 en Top 8).
>
> Mis a jour le 8 juin 2026 (v4). Base : **≈19 330 decks sur 89 tournois**. Ajout v4 : **S3 Tianjin Regional Open** (Unleashed, 640 joueurs, 638 decklists) → Unleashed **5105 classes**. Tier lists Unleashed/Globale recalculees. Tianjin confirme les cores existants (**Master Yi Wuju Bladesman vainqueur** — #1 du field, PAS « Wuju Master » ; Diana 2e) ; surprises : **Rek'sai 3e** (Fury/Order aggro tunneler, remonte tier C) et **Pyke 4e** (Chaos/Fury assassin, tier B). ⚠️ Correction v4 : ~395 decks « Wuju Master » reclassés en Wuju Bladesman (artefact de fallback set, infirmé par les images de légende).
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
- **10 cartes Side Deck** (8 avant Vendetta) : echanges en Bo3

Pour les données Vendetta, une liste exploitable doit contenir **39 cartes dans le
deck principal, 1 champion, 12 runes, 3 champs de bataille et exactement 10 cartes
en réserve**. Toute autre composition est incomplète et doit être exclue en entier
des imports, même si Riftdecks la publie ainsi. On conserve le Markdown brut comme
preuve, sans compléter ni deviner les cartes manquantes.

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

> **Lire ce tableau avec la ban list en tête.** Il compte tous les decks depuis Origins,
> y compris ceux joués avant les bans. Cinq de ces battlefields sont aujourd'hui
> interdits en Standard : The Dreaming Tree, Obelisk of Power et Reaver's Row depuis le
> 31 mars 2026, **Aspirant's Climb et The Arena's Greatest depuis le 24 juillet 2026**.
> Les deux derniers pesaient 23 % et 18 % du format : les decks Body/ramp et Aggro/Fury
> doivent leur trouver un remplaçant. Source unique : `src/lib/banned-cards.ts`.

| Battlefield | Decks | % | Profil |
|-------------|-------|---|--------|
| ~~The Dreaming Tree~~ (banni) | 958 | 29% | Calm/Mind value — universel Origins |
| ~~Obelisk of Power~~ (banni) | 830 | 25% | Aggro/midrange universel |
| ~~Aspirant's Climb~~ (banni 24 juil. 2026) | 749 | 23% | Ramp/Aurora — quasi-exclusif Body |
| Zaun Warrens | 676 | 21% | Aggro Fury/Chaos |
| Sigil of the Storm | 608 | 19% | Body ramp |
| ~~The Arena's Greatest~~ (banni 24 juil. 2026) | 596 | 18% | Aggro/Fury |
| Grove of the God-Willow | 542 | 16% | Calm value |
| Void Gate | 505 | 15% | Fury/Mind — Kai'Sa |
| Trifarian War Camp | 427 | 13% | Order/Azir/Fury |
| ~~Reaver's Row~~ (banni) | 386 | 12% | Fury/Mind — Kai'Sa |
| Vilemaw's Lair | 343 | 10% | Value — Calm/Body |
| Targon's Peak | 287 | 9% | Calm/Chaos tempo |
| Startipped Peak | 275 | 8% | Calm/Chaos hold |
| Monastery of Hirana | 273 | 8% | Hold Body/Order |
| Sunken Temple | 259 | 8% | Hold/midrange |

---

## 2. Regles par Legend (core/standard/flex/tech)

Classification : **core** (90%+), **standard** (60-89%), **flex** (30-59%), **tech** (10-29%)

### Cores observés — corpus Vendetta à jour (21 août 2026, 1673 decklists)

> Taux d'inclusion et copies médianes calculés sur les decklists Vendetta réelles seedées (`data/decklists`), pas sur les VOD. « Core » = présent dans 90 % et plus des listes de la Légende, « standard » = 60 à 89 %. Le calcul est refait par `npx tsx scripts/cores-vendetta.mts Vendetta 30` : il ne lit que les listes validées contre leur scrape brut, n'invente aucune carte et ne complète aucune liste partielle. Seules les Légendes vues au moins trente fois sont listées — sous ce seuil, un core n'est qu'une coïncidence.

- **Master Yi, Wuju Bladesman** (192 listes) — core : Charm 3x (100 %), Defy 3x (100 %), Punch First 3x (100 %), Discipline 3x (100 %), Lonely Poro 3x (99 %), Scuttle Crab 3x (99 %), Zhonya's Hourglass 2x (99 %), First Mate 3x (99 %), Rengar, Trophy Hunter 3x (99 %), En Garde 2x (95 %). Standard : Rampage 2x (88 %), Sabotage 2x (81 %), Ruin Runner 2x (79 %), Pit Rookie 2x (76 %).
- **Kai'Sa, Daughter of the Void** (189 listes) — core : Thousand-Tailed Watcher 3x (100 %), Stupefy 3x (100 %), Falling Star 3x (100 %), Brynhir Thundersong 3x (99 %), Hextech Ray 3x (98 %), Temporal Breach 3x (97 %), Watchful Sentry 3x (95 %), Time Warp 2x (95 %), Noxus Hopeful 2x (92 %), Progress Day 2x (92 %). Standard : Lecturing Yordle 3x (86 %), Bellows Breath 2x (81 %), Plundering Poro 2x (80 %), Retreat 1x (77 %), Singularity 1x (75 %), Ravenbloom Student 2x (69 %).
- **Kennen, Heart of the Tempest** (163 listes) — core : Lightning Rush 3x (100 %), Stacked Deck 3x (98 %), Fizz, Trickster 2x (91 %), Star-Crossed 2x (90 %). Standard : Ride the Wind 2x (89 %), Rhasa the Sunderer 3x (87 %), Seal of Discord 3x (85 %), Traveling Merchant 3x (83 %), Last Rites 2x (81 %), Nocturne, Horrifying 3x (75 %), Treasure Hunter 3x (66 %).
- **Irelia, Blade Dancer** (134 listes) — core : Boots of Swiftness 3x (100 %), Defiant Dance 3x (100 %), Defy 3x (100 %), Discipline 3x (100 %), Scuttle Crab 3x (99 %), Stellacorn Herder 3x (99 %), Tideturner 3x (96 %), Ride the Wind 2x (95 %), En Garde 2x (94 %), Star-Crossed 2x (94 %), Charm 2x (91 %), Guardian Angel 2x (90 %). Standard : Zhonya's Hourglass 1x (86 %), Stacked Deck 2x (81 %), Akali, Silent 1x (74 %), Fizz, Trickster 1x (67 %).
- **Nasus, Curator of the Sands** (86 listes) — core : Thousand-Tailed Watcher 3x (100 %), Defy 3x (100 %), Discipline 3x (97 %), Find Your Center 3x (97 %), Scuttle Crab 3x (97 %), Stupefy 3x (91 %). Standard : Ravenbloom Student 3x (78 %), Charm 2x (67 %), Tasty Faefolk 2x (66 %), Bellows Breath 2x (66 %), Steel Paws 2x (66 %), Retreat 2x (66 %), Astral Heron 3x (62 %), Temporal Breach 2x (62 %).
- **Diana, Scorn of the Moon** (84 listes) — core : Ravenbloom Student 3x (100 %), Fizz, Trickster 2x (100 %), Hwei, Brooding Painter 3x (100 %), Stacked Deck 3x (100 %), Stupefy 3x (100 %), Ride the Wind 3x (100 %), Moonfall 3x (100 %), Star-Crossed 2x (100 %), Tideturner 3x (99 %), Gust 2x (96 %), Patched Porobot 3x (92 %). Standard : Swain, Visionary 2x (70 %), Temporal Breach 3x (70 %), Flash 1x (69 %).
- **Rek'sai, Void Burrower** (77 listes) — core : Void Rush 3x (99 %), Carrion Dredger 3x (96 %), Noxus Hopeful 3x (96 %), Cull the Weak 3x (96 %), Inferna 2x (95 %), Undertitan 3x (95 %), Falling Star 3x (95 %), Cleave 3x (94 %), Faithful Manufactor 3x (91 %), Blood Rush 3x (91 %). Standard : Honest Broker 3x (88 %), Shadow Fiend 2x (68 %), Vi, Peacekeeper 1x (65 %).
- **Akali, Rogue Assassin** (74 listes) — core : Defy 3x (100 %), Shuriken Flip 3x (100 %), Discipline 3x (99 %), Stellacorn Herder 3x (91 %). Standard : Scuttle Crab 3x (89 %), Zhonya's Hourglass 2x (76 %), Falling Star 2x (76 %), Charm 2x (73 %), En Garde 2x (69 %), Lonely Poro 3x (66 %), Jhin, Murderous Artist 3x (62 %), Perfect Execution 2x (61 %).
- **Jayce, Defender of Tomorrow** (72 listes) — core : Bellows Breath 3x (92 %), Elder Dragon 3x (90 %). Standard : Garbage Grabber 2x (89 %), Dazzling Aurora 3x (89 %), Flurry of Blades 2x (89 %), Platewyrm Egg 3x (86 %), Dredge Up 3x (86 %), Mobilize 3x (83 %), Clairvoyance 3x (81 %), Sabotage 2x (75 %), Temporal Breach 2x (75 %), Catalyst of Aeons 3x (72 %), Gutter Palace 2x (71 %), Sprite Burst 2x (63 %).
- **Fiora, Grand Duelist** (54 listes) — core : Riposte 3x (100 %), Punch First 3x (98 %). Standard : First Mate 3x (83 %), Rampage 3x (83 %), Hidden Blade 2x (78 %), Pit Rookie 3x (76 %), Sacrifice 2x (63 %).
- **Draven, Glorious Executioner** (52 listes) — core : Spinning Axe 3x (100 %), Tideturner 2x (98 %), Stacked Deck 3x (98 %), Switcheroo 2x (96 %), Kai'Sa, Survivor 2x (94 %). Standard : Vex, Apathetic 3x (88 %), Falling Star 2x (88 %), Rebuke 2x (88 %), Cleave 1x (88 %), Ride the Wind 2x (88 %), Ferrous Forerunner 2x (87 %), Overzealous Fan 2x (83 %), Perfect Execution 1x (81 %), Gust Monk 2x (75 %), Evelynn, Entrancing 3x (71 %), Brynhir Thundersong 1x (63 %), Kha'Zix, Mutating Horror 1x (63 %).
- **Viktor, Herald of the Arcane** (46 listes) — core : Cull the Weak 3x (100 %), Hidden Blade 3x (100 %), Imperial Decree 3x (100 %), Bellows Breath 3x (98 %), Shadow's Call 2x (96 %), Wages of Pain 3x (96 %), Stupefy 3x (91 %). Standard : Sprite Fountain 3x (85 %), Carrion Dredger 3x (70 %), Thousand-Tailed Watcher 2x (67 %), Singularity 2x (65 %), Blood Money 2x (61 %), Lacerate 2x (61 %).
- **Azir, Emperor of the Sands** (37 listes) — core : Doran's Shield 3x (100 %), Eye of the Herald 3x (100 %), B.F. Sword 3x (100 %), Arise! 3x (100 %), Brutalizer 3x (97 %), Defy 3x (97 %), Vi, Peacekeeper 1x (95 %), Discipline 3x (95 %), Hidden Blade 3x (95 %), Soul Sword 3x (92 %), Guards! 2x (92 %). Standard : Deathgrip 1x (68 %), Back Off 2x (62 %).
- **Mel, Soul's Reflection** (37 listes) — core : Rebuttal 3x (100 %), Stupefy 3x (100 %). Standard : Fizz, Trickster 2x (89 %), Stacked Deck 3x (89 %), Ride the Wind 2x (89 %), Star-Crossed 2x (89 %), Ravenbloom Student 3x (73 %), Thousand-Tailed Watcher 2x (62 %).
- **Lillia, Bashful Bloom** (35 listes) — core : Sprite Fountain 3x (100 %), Defy 3x (100 %), Discipline 3x (100 %), Sprite Burst 3x (100 %), Stupefy 3x (97 %), Smoke and Mirrors 3x (94 %), Ravenbloom Student 3x (91 %), Charm 2x (91 %). Standard : Lilting Lullaby 1x (89 %), Thousand-Tailed Watcher 2x (77 %), Mask of Foresight 2x (71 %), Plundering Poro 3x (66 %), Unchecked Power 1x (66 %), Heart of Dark Ice 2x (66 %).
- **Ezreal, Prodigal Explorer** (34 listes) — core : Fizz, Trickster 2x (100 %), Thousand-Tailed Watcher 2x (100 %), Bellows Breath 3x (100 %), Stupefy 3x (100 %), Wages of Pain 2x (100 %), Stacked Deck 3x (97 %), Star-Crossed 2x (97 %), Gust 2x (91 %). Standard : Bewitching Spirit 3x (85 %), The List 2x (82 %), Pack of Wonders 3x (82 %), Treasure Trove 3x (82 %), Deadly Flourish 2x (79 %), Vex, Apathetic 2x (76 %).
- **LeBlanc, Deceiver** (34 listes) — core : Sacrifice 3x (100 %), Mirror Image 2x (94 %), Thousand-Tailed Watcher 2x (91 %). Standard : Soaring Scout 3x (88 %), Hidden Blade 2x (85 %), Watchful Sentry 3x (82 %), Glasc Mixologist 3x (82 %), Ruined Rex 3x (82 %), Karthus, Eternal 3x (79 %), Baited Hook 3x (74 %), Vi, Peacekeeper 2x (71 %), Harnessed Dragon 3x (71 %), Rift Herald 2x (62 %).

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

**Config gagnante Unleashed (Hartford, Factor 14-1-1)** : le **Ruin Runner** monte de flex à pièce maîtresse (2x main + 1 side) — 6 énergie / 5 might **non ciblable par sorts/capacités**, c'est LE plan anti-Chaos/Diana. Accompagné de **Sabotage 3x**, **Punch First 3x**, **Fiora, Peerless 2x**, **Rengar Trophy Hunter 3x**, Scuttle Crab 3x, First Mate 2x, + 1x Challenge / 1x Primal Strength. Battlefields : **Emperor's Dais + Seat of Power + The Arena's Greatest**. Closer signature : poser **double The Arena's Greatest** pour transformer la partie en course à 6 points. Side : Alpha Strike 2x (2e sort signature), Disarming Rake 3x, 2e Challenge/Ruin Runner contre Vex/Hwei.

**Mesuré au S3 National Open, 19 juillet 2026 (307 listes, jeu complet)** : le core tient en **3 cartes**, Defy 3x (98 %), Charm 3x (96 %), Discipline 3x (95 %). Juste derrière, un bloc très stable : Zhonya's Hourglass 3x (88 %), Punch First 3x (86 %), Lonely Poro 3x (82 %), Rengar Trophy Hunter 3x (74 %), En Garde 2x (73 %), Scuttle Crab et First Mate 3x (71 %), Ruin Runner 2x (70 %). Battlefields : Star Spring 54 %, Emperor's Dais 34 %, Vilemaw's Lair 27 %, Seat of Power 23 %. ⚠️ **The Arena's Greatest (20 %) est banni depuis le 24 juillet 2026**, ces listes sont à refaire sur ce point. Side : **Sabotage 61 % · Akshan, Mischievous 54 % · Disarming Rake 41 %**, un plan anti-équipement systématique. Champions : **82 % Tempered contre 18 % Honed** ; **le champion ne dit pas quelle légende Master Yi c'est**.

**Top placements** : **Won Suzhou (燐川)**, **Won Tianjin (陈千语)**, **Won Hartford (Factor 14-1-1)**, 2nd Houston, 2nd Lille, 2nd Shanghai NO, 7e + 8e National Open, 35 top 8 CC

---

### Irelia, Blade Dancer (~493 decks) — Calm/Chaos — Tempo

Champion : Irelia, Fervent (100%)

**Core (10 cartes)** : Defiant Dance 3x (99%), Discipline 3x (100%), Defy 3x (100%), Charm 2x (98%), En Garde 2x (98%), Boots of Swiftness 2x (98%), Ride the Wind 2x (93%), Not So Fast 2x (96%), Stellacorn Herder 3x (96%), Guardian Angel 2x (93%)

**Standard** : Tideturner 2-3x (75%), Stacked Deck 2x (66%)

**Flex** : Lonely Poro 2x (55%), Zhonya's Hourglass 2x (57%), Adaptatron 1x (53%), Scuttle Crab 3x (52%), Star-Crossed 2x (48%), Flash 1x (45%), Rebuke 1x (39%), Gust 1x (37%), Fizz Trickster 1x (32%), Irelia, Fervent (extra) 1x (30%)

**Battlefields** : Sunken Temple (87%), Targon's Peak (72%), Abandoned Hall (52%)

**Mesuré au S3 National Open, 19 juillet 2026 (202 listes, dont le vainqueur et le finaliste)** : core de **6 cartes** au-dessus de 90 %, Discipline 3x (100 %), Defiant Dance 3x (99 %), Defy 3x (99 %), Boots of Swiftness 2x (98 %), Charm 2x (92 %), En Garde 2x (91 %). Puis Ride the Wind 2x (87 %), Not So Fast 1x (84 %), Guardian Angel 3x (83 %), Stellacorn Herder 3x (82 %), Scuttle Crab 3x (80 %). Champion : **Fervent à 99 %**, Graceful a disparu. Battlefields : Sunken Temple 89 %, Abandoned Hall 85 %, Targon's Peak 56 %. ⚠️ **Aspirant's Climb (19 %) est banni depuis le 24 juillet 2026.** Side : **Adaptatron 61 %**, la réponse à l'Aurora, puis Star-Crossed et Gust (57 %).

**Top placements** : **Won S3 National Open** (finale 100 % Irelia), Won Sydney, Won Shenzhen, Finalist Suzhou, 3rd Atlanta (x2), 3rd Bologna, 3rd Xi'an

---

---

### Diana, Scorn of the Moon (~83 decks) — Chaos/Mind — Aggro-tempo

Champion : Diana, Lunari (100%)

**Core (9 cartes)** : Stacked Deck 3x, Stupefy 3x, Moonfall 3x, Ride the Wind 2x, Star-Crossed 2x, Gust 2x, Hwei Brooding Painter 3x, Tideturner 3x, Ravenbloom Student 3x

**Standard** : Fizz Trickster 2x, Vex Apathetic 2x, Flash 2x, Hard Bargain 1x, Thousand-Tailed Watcher 2x

**Flex** : Vex Cheerless 2x, Eclipse 2x, Acceptable Losses 2x, Abandon 1x, Plundering Poro 2x, The Syren 1x, Last Rites 1x

**Battlefields** : Abandoned Hall (81%), Ravenbloom Conservatory (58%), Targon's Peak (50%)

**Tech Unleashed (Hartford) — Diana = la légende la mieux convertie (3 Top 8)** : **Moonfall** reste la meilleure réponse aux gros corps non-ciblables (Ruin Runner), mais souvent jouée à 2x main + 1 side seulement, donc à piocher. **Kha'Zix, Mutating Horror** = le haut de courbe (gros might). Tech de terrain montante : **The Arena's Greatest** pour accélérer dans le miroir quand on joue premier (vu chez bsweitz). Certaines listes coupent **Baron Nashor** (vulnérable au Punch First/Sabotage du Master Yi). Faiblesse structurelle vs Master Yi : aucun sort ne touche le Ruin Runner, et le Rebuke (cannot be defied) est l'unique sort non-défiable du deck.

**Mesuré au S3 National Open, 19 juillet 2026 (166 listes)** : core de **5 cartes** au-dessus de 90 %, Stupefy 3x (94 %), Ride the Wind 3x (92 %), Stacked Deck 3x (91 %), Moonfall 3x (91 %), Ravenbloom Student 3x (90 %). **Moonfall reste la réponse obligatoire aux gros corps non ciblables**, comme à Hartford. Ensuite Hwei 3x (86 %), Gust 2x (86 %), Star-Crossed 2x (82 %), Fizz 2x (75 %), Tideturner 3x (73 %). Champion : Lunari 95 %, No Longer Human 5 %. Battlefields : Abandoned Hall 90 %, Targon's Peak 57 %, Ravenbloom Conservatory 50 %. Side : **Turn to Dust 77 %**, de très loin la première carte de réserve.

**Top placements** : **3e + 4e National Open**, **2nd Hartford (bsweitz)**, 4e + 5e Hartford, Won Vancouver (AlanZQ), 2nd Tianjin, 2nd Xi'an, Top 4 Sydney, Top 4 Utrecht

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

**Mesuré au S3 National Open, 19 juillet 2026 (89 listes)** : core resserré sur **Soaring Scout 3x (96 %)** et **Watchful Sentry 3x (92 %)**. Derrière, un bloc stable : Karthus Eternal, Glasc Mixologist et Mirror Image 3x (90 %), Ruined Rex 3x (87 %), Sacrifice 3x et Hidden Blade 2x (81 %), Thousand-Tailed Watcher 2x (79 %). Vi, Peacekeeper 2x tient en flex (47 %). Battlefields : **Windswept Hillock 89 %, Dusk Rose Lab 76 %**. Side : **Salvage 72 %**. ⚠️ Malgré 89 listes au tournoi, **aucun Top 8** et deux places seulement dans le Top 16 : le moteur tourne, mais il ne gagne plus.

**Top placements** : 11e + 13e National Open, 6th Xi'an, Top 8 Sydney

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

**Flex** : Stupefy 3x (57%), Not So Fast 2x (54%), Back Off 2x (51%), Emperor's Divide 2x (49%), Vilemaw 2x (46%), Scuttle Crab 3x (43%), Irelia, Fervent 2x (41%), Blitzcrank Impassive 2x (38%), Blue Sentinel 3x (35%), Sona Harmonious 2x (32%)

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

- **10 cartes** en side deck (8 avant Vendetta)
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
10. CONSTRUIRE le Side Deck (10 cartes, section 6)
11. VALIDER (40 main + 12 runes + 3 BF + 10 side, max 3 copies)

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
- **Confirmation déclin Aurora** : 1 seul Aurora en Top 8 Vancouver (Sivir), sorti en quart — le gear hate généralisé referme la fenêtre, et touche aussi les Irelia/Irelia gear.

---

## Pass 3 (26 juin) — cores/tech des légendes secondaires Set 2 (casts)

> Net-new distillé de `data/video-insights/pass3-2026-06.md` (118 casts). Casts = factuel, `[avis]` = caster.
> Noms EN **à recouper** au scrape brut (Whisper). ⚠️ Whisper transcrit **Ahri** en « A-r-i » dans les sources brutes — corrigé ici.
> Matchups consolidés à part dans `data/video-insights/matchups-reference.md`.

**Set** (Fury go-tall, légende « sauvetage ») : Arena Bar ×3 / Warmog's Armor (moteur de buff), **Sett Brawler** + Showstopper/First Mate (accelerate → might quasi infini), Sett Kingpin (anti go-wide), triple Seal (rend l'ability gratuite), Challenge (removal), Call to Glory, Divine Judgment (anti-Lux/ramp), Vilemaw's Lair (lead anti-Annie). **Faiblesse structurelle : très peu de card draw → besoin du Dreaming Tree** ; faible au go-wide (removal mono-cible Order).

**Victor** (Order prison/token) : **Trifarian War Camp** pivot, combo **Jace + Vanguard Armory** (3 recruits/tour, snowball type Aurora) + Veiled Temple (re-ready), finishers Imperial Decree / Grand Stratagem / Singularity / Drag Under / Watcher. **Perd au Ruin Runner et au Ferrous Forerunner.**

**Lux** (Order unitless control) : **Lux Crownguard** (+2 runes), removal lourd (Singularity, Call the Weak, Imperial Decree, **Grand Stratagem** letal), Recruit the Vanguard (recruits), ~9 counters. **Faiblesse majeure : ne peut PAS conquérir → 0-2 vs Aurelia.**

**Rumble** (mech tribal) : Rumble Scrapper (+1 unités, stackable), Production Surge, **Danger Zone** (signature), Bubble Bot, Marching Orders (removal gratuit). Fort early/mid mais **peu d'accelerate le tour où tu joues → lent, mauvais de derrière**.

**Renata** (1er support, gold) : gold sacrifié = +1 énergie à ≤3 pts (tours explosifs : double Time Warp + Echo), **Pawn** (Deflect 2, grossit avec gold), Hostile Takeover. **Faible aux board-wipes gold (Thermal Beam efface les gold tokens/le Pawn).**

**Azir** (gear/sand soldiers) : Eye of the Herald, **Brutalizer** (transfert d'équip → 5 might), **Arise** (signature), Azir Sovereign (overkill conquer). Triple Defy. **Jax** (gear) : Apprentice Smith (pioche), **Strike Down** + **Counter Strike** (pseudo-stun), Brutalizer récurrent ; variante Jax Dazzling Aurora.

**Ornn** (Blue Horn, gear midrange) : **Blue Horn** + 1-2 **Svellsongur** (recopie +1 → might 16-21+), Treasure Hoard (gold = gear), Tianna Crownguard (déni de score), Requiem (ready + gank). « protège/tue le Blue Horn ».

**Yasuo** (move-to-score) : Ride the Wind + Back Alley Bar (+might au move) + Zhonya's, **Last Hand** (double might), **Inverted Timeline** (anti-Kai'Sa), Mask of Foresight. **Bat MF Aurora et Fiora 2-0** ; perd vs Viktor.

**Ahri** (la légende renard à neuf queues, blue défensif/control) : passive **-1/-2 might à toute unité ennemie entrante**, Alluring Ahri (skip tour adverse), Wielder of Water (anti-Annie), Foxfire (side anti-aggro AoE), Falling Comet, Time Warp, Defy ×3. **Gagne une finale vs Kai'Sa 2-0.**

**Sivir** (mono purple chaos) : même package qu'Annie (**Called Shot ×3**, Ezreal/Fizz, Sabotage) ; variante midrange discard (**Raza**, Last Rites). **Jinx** (miracle red) : **Sun Disc** (accelerate ready/legion), Immortal Phoenix, win-con **Vi + Ride the Wind**.

**Lee Sin** (Body/Calm midrange) : Sunlit Guardian (shield/tank), Clockwork Keeper (pseudo-accelerate), Dragon Rage (double-challenge), Block. **Leona** (Order stun) : Forgotten Monument, avalanche de stuns (Rune Prison, Zenith Blade), **Tianna Crownguard** MVP, Harnessed Dragon. **Rek'Sai** (Seal of Rage rouge/jaune, removal) : **Void Rush** (signature top-tier), Immortal Phoenix (rejoue en tuant SA propre unité), Undertitan (anthem), Candlelit Sanctum. **Bat Aurelia 3-0** ; perd vs Draven (full-hold puni).

**Master Yi set 2** : **Trinity Force = deck RAPIDE** (point bonus au hold → 2 pts/tour), **Ruin Runner + Valmont's Lair = némésis de Draven** ; 4/8 d'un Top 8 = Master Yi. **Kai'Sa control/hold** (Omega Zero, 1er champion national) : tient les battlefields vs Aurora, **Angle Shot** (retire les GA, MVP anti-Aurelia), Orb of Regret, Ravenborn Tome.

### Règles de deckbuilding net-new (pass3)
- **[avis] Set 2 tourne autour du GEAR et du GOLD** (gold = gear, paie les coûts) → le **gear-hate main-deck** (Akshan, Factory Recall, Pickpocket/Salvage, Thermo Beam) est un meta-call valable (beaucoup de légendes en dépendent : Azir, Ornn, générateurs de gold).
- **[avis] Couleur Order = seule avec du kill sec** (Call the Weak / Hidden Blade), **ignore le might** → définit la méta et punit les decks peu unit-dépendants (Fiora go-tall, Lux).
- **[avis] Punch First** (+5 might, 1 power, **non-Defyable**) = carte la plus game-defining du set malgré son statut commun ; seules réponses : Windwall/Rebuke/Switcheroo (toutes Chaos).
- **[avis] Treasure Hunter** (gold engine) = meilleur drop hors légende/champion ; **Stellacorn Herder** = peut-être meilleure carte verte ; **Sneaky Deckhand** (point gratuit en jouant 2e).
- **[avis] Decks « tall » (Teemo, Yi) en difficulté vs go-wide** (Darius token-hook + War Camp). Decks « pet » hors-méta (Set, Rumble, Victor prison) partagent la faiblesse **manque de card draw**.
- **Gear : bien plus efficace en attaque qu'en défense** (ré-équiper BF Sword après combat = Punch First gratuit répété).


---

## Pass 4 (27 juin) — cores des Légendes Set 3 Unleashed (guides RiftLab)

> Distillé des guides dédiés `data/video-insights/pass4-legend-guides-2026-06.md` (13 guides).
> Perspective **guide/auteur** → souvent `[avis]` (reco de build, pas un résultat de tournoi).
> Noms alignés sur la DB cartes (`npm run fix:names` passé). Matchups → `matchups-reference.md`.
> ⚠️ **Aurora = archétype** (gear Dazzling Aurora), pas une Légende.

**Vex** (Chaos control, tenir 1 battlefield) : légende **draw 1 on hold** ; chosen champion **Vex Apathetic** `[avis]` (stun + bloque le move des unités adverses + Deflect → hold quasi incontestable). Core : Mutated Mouser (T1), **Sona** (ready 4 runes), Tianna Crownguard + Ahri (tempo de points), unités 2-énergie cachées (Evelynn, Teemo, Overzealous Fan). Battlefields : **Grove of the God Willow** (draw 1 ≈ draw 2), Bandle Tree, Ravenbloom Conservatory. Counters Defy/Not So Fast/Hard Bargain/Abandon, stun répétable Existential Dread. **Faible aux board-wipes** (Unchecked Power, Ruination, Downwell).

**Kha'Zix** (Body+Chaos, mouvement/isolation) : légende **Void Reaver** (win combat → XP ; XP pour buff/déplacer ses unités à la base). Principe : unités à la base, attaquer puis revenir via combat tricks. Chosen champion **Kha'Zix Mutating Horror** `[avis]`. Combo signature T2 = **Irresistible Faefolk** (drag ennemi) + ambush = kill + 3 XP. Core : Mr. Root, Nidalee, Qiyana[?], Fizz (rejoue Void Assault), Yone Bladesman (late, bloque le retreat). **Void Assault** signature. Battlefield favori **Star Spring**.

**Rengar** (Fury+Body, ambush/pounce) : légende **+1 might quand tu joues une unité**. Chosen champion **Rengar Trophy Hunter** `[avis]` (ambush en réaction même sans unité au battlefield). Core : Irresistible Faefolk, Nidalee, Kai'Sa Survivor, Grim Apothecary, **Brynhir Thundersong**. Cheese late `[avis]` : **Thrill of the Hunt** (signature) + Brynhir = l'adversaire ne joue pas 2 tours d'affilée. Tech : **Repulse** (counterspell anti-rebuke), **Challenge** (obligatoire vs Vex). Gear Fresh Beans (draw). Battlefields Star Spring / Treasure Horde.

**XP Master Yi** (Wuju Master, Calm+Body, level/XP) : ⚠️ PAS le Wuju Bladesman ([[feedback_master_yi_disambiguation]]). Paliers **niv 6 = +1 might à tout (permanent)**, **niv 11 = tout entre ready**. Chosen champion **Master Yi Tempered** `[avis]` (Hunt 2 = 2 XP/conquer-hold). Core : **Voracious Gromp** (Hunt 3), Elder Dragon, White Flame Protector (+8, combo Not So Fast), Arachnid Horror ; **Alpha Strike** (signature removal+XP), **Concentrate** (solve le draw), Discipline. Battlefield clé **Reckoner's Arena** (Hunt sur conquer ET hold = double). Endgame possible Master Yi Unstoppable (untargetable niv 16).

**Pyke** (Fury+Chaos, aggro-control sorts/disruption de main) : légende **Blood Harbor Ripper** (rend une unité à la main + Gold Gear). Chosen champion **Pyke Dockside Butcher** `[avis]` (Hidden + Ganking, accélérable). Core : Bewitching Spirit + Mindsplitter (discard), Fizz Trickster, **Baron Nashor** (finisher), **Death from Below** (signature kill). Tech Falling Star, Star-Crossed, Gust, Rebuke. Battlefield signature **Ripper's Bay** (ramp via la légende).

**Ivern** (Calm+Order, "brush"/animaux, hold) : légende remplace un battlefield par un **token Brush** (+1 might aux cats/dogs/poros/birds). Chosen champions Ivern Friend to All (score si 4 tags) ou Ivern Nurture (scry+buff, plus consistant). Core : Stalwart Poro, Mutated Mouser, Stalking Wolf, **Daisy** (unité signature, -1 énergie/tag), **Friendship** (+1/tag, must). Battlefields "when I conquer" (Treasure Hoard, Zaun Warrens) qu'on transforme en Brush. **Faible aux effets de board sans cible** (blue : The Watcher, Unchecked Power).

**Lillia** (Calm+Mind, tempo sprites) : légende **Thousand-Tailed Watcher** (joue des tokens Sprite ready, -1 énergie/unité temporaire). Deck **tempo pur** (objectif 6 pts vite). Chosen champion **Lillia, Fae Fawn** `[avis]`. Core : **Sprite Fountain** (≈2 pts T1), Scuttle Crab, Ravenbloom Student ; finishers **Thousand-Tailed Watcher** + **Sprite Burst** (non-Defyable). Gears Mask of Foresight, Heart of Dark Ice. Combo Lillia + **Smoke and Mirrors**. **Lilting Lullaby** signature (stop les sorts adverses). Battlefields Dusk Rose Lab / Targon's Peak. **Pire matchup : Vex Apathetic** (annule le gameplan).

**LeBlanc** (Mind+Order, "reflections" temporaires + death-knell) : légende sur conquer/hold → **token Reflection temporaire** (favorise les unités death-knell). Chosen champions **LeBlanc, Everywhere At Once** (Backline, se duplique) ou LeBlanc Fragmented (death-knell draw). Core : **Karthus Eternal** (double les death-knells), **Glasc Mixologist** (rejoue ≤3 might), Soren Scout[?], Watchful Sentry, Baited Hook ; **Mirror Image** signature. **Très bon spread** `[avis]`, écrase le spell-damage rouge (l'attrition leur donne la value). Galère vs Vex Apathetic (stun les Reflections).

**Diana** (Mind+Chaos, mid-range/skirmish "showdown") : légende **Scorn of the Moon** (+1 énergie en showdown). Chosen champion **Diana Lunari** `[avis]` (scry + draw sorts à 1 énergie). Core : Ravenbloom Student, **Hwei**[?] (draw+discard, monte à 8+ might), Tide Turner, Fizz Trickster ; **Moonfall** signature (charm + -2 might AoE), Eclipse, Star-Crossed, Ride the Wind (combo Hwei jusqu'à 14). Battlefields Ravenbloom Conservatory / Abandoned Hall / Targon's Peak. **Dur vs sorts de dégâts** (Pyke/Ezreal/Jhin), seule protection Hard Bargain.

**Vi** (Fury+Order, aggro "excess damage"/équipement) : légende **ready une unité quand 3+ dégâts en excès** → snowball gank. Chosen champion **Vi Destructive** `[avis]` (recycle le trash → boost + ganking ; finit à 6 pts) ou Vi Hot-Headed (double son might en boucle, Deflect). Core : corps jetables (Unsung Hero, Pouty Poro) qui portent les gears, **Hextech Gauntlets** (signature, souvent ~1 énergie), BF Sword, Kai'Sa Survivor (draw), Death Grip + Hidden Blade + Sacrifice. **Plus grosse faiblesse = gear removal** (Salvage, Thermal Beam). Bon vs Aurora.

**Jhin** (Fury+Mind, ramp "4 sorts"/removal) : légende **Virtuoso** (banish les sorts 4+ énergie ; 4 banish → channel 4 runes NON exhaustées + draw). Chosen champions **Jhin Murderous Artist** (on move +1 énergie/power) + **Jhin Meticulous Killer** (×3, 4 might pour 1 power si sort 4+ joué). Core : removal qui touche la base (Deadly Flourish, Rocket Barrage = anti-gear), **Singularity** (×3), **Curtain Call** signature (toolbox), Frigid Touch, Thousand-Tailed Watcher, Sprite Burst. Battlefields Void Gate / Forgotten Library / Vilemaw's Lair. **Galère vs green/deflect** (Vex, XP Master Yi : Defy/Not So Fast cassants).

### Archétype Aurora (gear Dazzling Aurora) — net-new pass4
- **Pas une légende** : gear 9 énergie 2 power, en fin de tour révèle jusqu'à une unité et **la joue gratuitement** → deck d'unités très haut might (Elder Dragon, Baron Nashor, Mindsplitter). High-roll (monstrueux on-curve, brick sinon).
- **Légende porteuse** `[avis]` : **Miss Fortune** = reco (ganking → Baron untargetable ; signature Bullet Time) ; **Sivir** = meilleure éco de runes, **supérieure en miroir** ; **Master Yi** = le plus consistant (Zhonya's, Desert's Call).
- Core support : **Stacked Deck**, Lunar Boon, **Elder Dragon** (assigne les dégâts létaux individuellement = tout le board à 1 HP, combo Flurry of Blades ×3), Last Rites, Headless Resurrection, Challenge, Invert Timelines (vs Vex). Mindsplitter AVANT l'Aurora (retire la gear-hate).
- **Faiblesses** : super-aggro (Lillia, LeBlanc) si ramp manqué ; **order domain** (Hidden Blade, Cull the Weak qui touche le Baron sans le cibler) ; **Salvage** (gear-hate + draw). Bon vs hold decks (set up lent).

### Règles de deckbuilding net-new (pass4)
- **[avis] Vex Apathetic = le chosen champion qui définit la méta Unleashed** : stun + blocage de mouvement = **contre structurel** des decks de tokens/tempo (Lillia, Ornn sprites) et des Reflections (LeBlanc). Quasi toutes les fiches le citent comme « pire matchup » → un plan anti-Vex (Challenge, removal Order, pression early) est obligatoire.
- **[avis] Punch First reste la référence** ; côté Unleashed, **Defy / Not So Fast** sont les cartes qui « cassent » les decks de gros sorts (Jhin) et de combos.
- **[avis] Le gear-hate est encore plus central en Set 3** : Salvage / Thermal Beam / Rocket Barrage punissent à la fois l'archétype Aurora et Vi (sur-équipement) — meta-call confirmé depuis pass3.
- **[avis] Hiérarchie des chosen champions** : presque chaque légende Unleashed a un chosen champion « par défaut » nettement supérieur (Vex Apathetic, Kha'Zix Mutating Horror, Rengar Trophy Hunter, Master Yi Tempered, Pyke Dockside Butcher, Lillia Fae Fawn, Diana Lunari, Vi Destructive) — point de départ de tout build.
- **[avis] Star Spring** = battlefield pivot du Set 3 pour les decks de mouvement/ambush (Kha'Zix, Rengar, LeBlanc) : renvoie une unité à la base gratuitement après un play.

---

## Pass 10-14 — cores Set 1/2 + tech net-new Unleashed (27/06)

> **Cores complets des Légendes Set 1/2 + Spiritforged** (Kai'Sa, Victor, Darius, Sett, Annie, Ornn, MF, Teemo,
> Yasuo, Draven, Sivir, Azir, Ezreal, Irelia + counter Master Yi) → `data/video-insights/pass10-...md`.
> Ci-dessous le **net-new de deckbuilding** observé en tournoi (Suzhou, Win-A-Box, Contenders), à coupler aux cores.

### Tech & archétypes net-new (Unleashed, casts)
- ⭐ **Volibear « Dragon Storm »** (combo) : **Gem Dragon**[?] (chaque dragon → untap des runes) + **Herald of Scales** (dragons −2 énergie) + **K-Dragon**[?] (draw 4-9). 3+3 → ~26 énergie flottante = draw quasi tout le deck. Soutien : Sabotage (strip la main), Confront (enter ready), Dune Drake, Blazing Scorcher.
- **Azir (yellow)** : un **2e gear 1-drop (Soul Sword)** rend le **gear T1 consistant** = deck "complètement différent" avec. **Hall of Legends** (conquer → ready Azir → un sand soldier de plus). Mécanique : 1 équipement joué coche le bloc ; si Azir untap, pas besoin d'un autre gear. **Weakness = gear-hate (Thermo Beam) + Vex Apathetic (stun les sand soldiers d'Arise).**
- **Ezreal control** = la version la + oppressante : **3 Bewitching Spirit + Pack of Wonders + Treasure Trove** = vide la main adverse ; Deadly Flourish (removal back-line + gold), Star-Crossed, Fizz, Watcher+Bellows. **Bat Vex** (Rebuke/Star-Crossed renvoient la Vex à la main = reset le hold).
- **Sett** compétitif (gagne Contenders London) : **3 Seals** (ability gratuite), Set Brawler 12-16 might, Showstopper, **Sabotage** anti-Aurora, **Divine Judgment** (reset, non-Defyable).
- **Master Yi (proving grounds/mid-range)** : build **double Zhonya's** + **Trophy Hunter** (surprise defender 8-might) + **Vilemaw/Valmar ambush** (finisher type White Flame). Devient un hold deck (>2-drops). XP Master Yi (Unleashed) = autre légende (cf. pass4).
- **Lillia / Rek'Sai / Darius** = aggro : Lillia = **consistance** (double conquer via sprites + Smoke and Mirrors + Heart of Dark Ice) ; Darius = Phoenix go-wide (Immortal Phoenix + Shadows Call + Undying Legion + Ferrous Forerunner) ; Rek'Sai = feast-or-famine (Immortal Phoenix sacrifice-loop + Void Rush).

### Règles de deckbuilding net-new (pass11-14)
- **[avis] Unchecked Power / Downwell = réponse obligatoire aux hold decks** (Vex/Yi/MF) : clear un battlefield 12+ might → reset. Un Diana/control SANS Unchecked Power perd vs Vex.
- **[avis] Akshan = la réponse-UNITÉ à Aurora** (vole/tue le gear → l'Aurora ; dur à empêcher car l'anti-gear est surtout des sorts recyclables) — MAIS **Possession** (Aurora) re-vole l'Akshan. **Adaptatron main-deck** (Irelia) = anti-gear action-speed. **Divine Judgment** = reset/mirror-breaker (Garen/Sett). **Sabotage** arrache l'Aurora.
- **[avis] Vex Apathetic = contre transversal** : stun tokens/sprites/Reflections **ET** sand soldiers d'Arise (Azir). Plan anti-Vex obligatoire (Challenge, removal Order, pression early, ou Unchecked Power).
- **[avis] Challenge = anti-LeBlanc** : tue le Karthus T2 → déni du moteur death-knell avant le snowball.
- **[avis] Faefolk + Forbidding Waste** = combo "drag-isolate" : rend une unité (ex. Irelia) défenseur seul à −2 → ambush kill.
- **[avis] Aurora se construit autour du high-roll** : meilleur deck game 1, plus faible games 2-3 (un bon joueur Aurora joue bien SANS l'avoir tirée : Forge of the Future early, Elder hardcast, Rift Herald). Le yellow/orange (Sivir/Garen/Poppy) gagne le **miroir Aurora** (Divine Judgment + gear-hate + recycle Order).
