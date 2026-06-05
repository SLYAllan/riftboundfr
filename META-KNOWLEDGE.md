# META-KNOWLEDGE.md — Riftbound Game Intelligence
> Mis à jour le 31 mai 2026 (v3). **18 652 decks sur 88 tournois** en base. Ajouts v3 : **25 S3 City Challenges (Unleashed)** + Hangzhou RO (Origins) + 21 anciennes City Challenges (Origins) = +6 298 decks. Répartition par set : **Origins 6 799 classés** (16 légendes), **Spiritforged 7 294** (29 lég), **Unleashed 4 501** (41 lég). DECKBUILDING-RULES.md + tier list DB (Origins/Spiritforged/Unleashed/Globale) recalculés sur ces données. Légendes en DB normalisées en virgule canonique (40 distinctes, Master Yi = 2 légendes légitimes).

## 1. Règles clés (résumé pour rédaction)

### Setup
- 1 Legend (leader permanent)
- 1 Champion Unit (déclarée avant la partie)
- 40 cartes Main Deck
- 12 cartes Rune Deck (doivent matcher les Domain Identity de la Legend)
- 3 Battlefields (1 choisi aléatoirement en Bo1, choix en Bo3)

### Types de cartes
- **Units** : restent sur le board, ont du Might, se déplacent entre Base et Battlefields
- **Spells** : effets instantanés. Base spells = votre tour. ACTION/REACTION = aussi pendant le tour adverse
- **Gear** : joués dans la Base, restent en jeu, capacités passives ou activées
- **Runes** : max 12 dans le Rune Deck, génèrent Energy (exhaust) ou Power (recycle)

### Ressources
- **Energy** : exhaustant une Rune de n'importe quel domain
- **Power** : recyclant une Rune du domain requis (va sous le deck)
- Le Rune Pool se vide 2 fois par tour (fin Draw Phase + fin de tour)

### Les 6 Domains
| Domain | Couleur | Philosophie |
|--------|---------|-------------|
| Fury | Rouge | Agression, Conquer, Dégâts |
| Calm | Vert | Défense, Hold, Mouvement, Tricks |
| Mind | Bleu | Planification, Gear, Draw |
| Body | Orange | Ramp, Buffs, Avantage combat |
| Chaos | Violet | Discard, Mécaniques Hidden |
| Order | Jaune | Tokens, Kill effects, Sacrifice |

### Tour (ABCD)
- **A - Awaken** : Ready toutes les cartes
- **B - Beginning** : Résoudre les triggers début de tour (Hold inclus)
- **C - Channel** : Placer 2 Runes du Rune Deck dans la Base (3 au T1 si Draw player)
- **D - Draw** : Piocher 1 carte
- **Action Phase** : Jouer cartes, activer capacités, Conquer
- **Showdown Phase** : Combat si les deux joueurs ont des unités au même battlefield
- **End Turn** : Cleanup

### Conditions de victoire
- **Premier à 8 points**
- **Conquer** : gagner le combat à un battlefield = +1 point (max 1/BF/tour)
- **Hold** : commencer son tour en contrôlant un BF conquis = +1 point par BF
- **Règle du dernier point** : atteindre 8 via Conquer requiert de scorer depuis les DEUX battlefields ce tour-là

### Keywords importants
- **ACCELERATE** : entre ready au lieu d'exhaust
- **LEGION** : trigger quand c'est la première carte jouée ce tour
- **HIDDEN** : carte posée face cachée, révèle comme réaction
- **DEFLECT** : l'adversaire paie une rune rainbow supplémentaire pour cibler
- **DEATHKNELL** : trigger quand la carte/unité meurt
- **GANKING** : permet de bouger entre battlefields pour attaquer
- **AMBUSH** : unité cachée révélée en défense — excellent pour Hold
- **HUNT** : nouveau keyword Unleashed — gain d'XP en combat, déblocage de paliers

### Zones de jeu (Comprehensive Rules 2026-03-30)
- **Board** : Bases (une par joueur), Battlefield Zone (plusieurs BF), Facedown Zones (1 par BF, max 1 carte cachée), Legend Zone
- **Non-Board** : Chain (pile de résolution), Trash (défausse — unordered, public), Champion Zone, Main Deck Zone (secret), Rune Deck Zone (secret), Banishment (exile — cartes retirées du jeu)
- **Golden Rule** : le texte de carte supersède les règles
- **Silver Rule** : "Card" dans les effets = carte du Main Deck uniquement (pas Runes, Legends, Battlefields)
- **Can't beats Can** : les effets interdisant > les effets autorisant
- Source : `data/meta-reports/riftbound-rules-rgpub.pdf` (98 pages)

## 2. Tier List — Full Dataset (Mai 2026, 12 317 decklists)

> Basée sur 12 317 decklists couvrant Origins → Spiritforged → Unleashed (base 7987 + 25 tournois CN Spiritforged ajoutés le 31 mai).

### 2.0 Tier Spiritforged — CN data-backed (31 mai 2026, 7294 decks classés)

> Calculé sur l'ensemble des decks Spiritforged **avec placement** (3 Regional Opens CN + 22 City Challenges + RQ EU/US + National Opens). Métrique : part du field + nombre de top 8 + victoires + taux de conversion.

| Tier | Legend | Field % (decks) | Top 8 | Wins | Note |
|------|--------|-----------------|-------|------|------|
| **S** | Draven, Glorious Executioner | 21,1% (1539) | 88 | 15 | Roi incontesté — domine volume ET conversion |
| **A** | Irelia, Blade Dancer | 12,0% (876) | 45 | 3 | Tempo, 2e deck le plus joué |
| **A** | Kai'Sa, Daughter of the Void | 11,9% (865) | 29 | 4 | Reste T1 Fury/Mind |
| **A** | Viktor, Herald of the Arcane | 6,1% (445) | 21 | 2 | Meilleure conversion du top tier |
| **B** | Annie, Dark Child | 2,2% (164) | 8 | 2 | **Sleeper** — meilleur taux top 8/deck du set |
| **B** | Fiora, Grand Duelist | 5,2% (378) | 9 | 1 | Midrange Body/Order |
| **B** | Ezreal, Prodigal Explorer | 4,6% (333) | 9 | 1 | Won Bologna |
| **B** | Azir, Emperor of the Sands | 3,5% (258) | 4 | 1 | Won Lille 14-0-2 |
| **B** | Rek'Sai, Void Burrower | 2,4% (175) | 5 | 1 | Aggro tunneler |
| **B** | Master Yi, Wuju Bladesman | 3,3% (244) | ~7 | 0 | Hold Body/Calm (seul Yi légal à Spiritforged) |
| **C** | Sivir / Lucian / Ornn / Sett / Ahri / Jax / Lux / Miss Fortune | 1-2,5% | 1-4 | 0-1 | Compétitifs avec pilote, faible conversion |
| **D** | Yasuo, Rumble, Teemo, Jinx, Volibear, Leona, Renata, Darius, Lee Sin, Garen | <2% | 0-1 | 0 | Populaires localement mais ~0 top 8 |

**Insights clés Spiritforged CN :**
- **Draven écrase le set** : 1 deck sur 5, 88 top 8, 15 victoires. Aucun autre n'approche.
- **Annie = le sleeper** : 2,2% du field mais 8 top 8 + 2 wins → meilleure conversion. Counter du méta.
- **Lucian/Yasuo/Sivir = pièges** : très joués (2,5%/1,8%/2,5%) mais convertissent mal (0-2 top 8). Populaires ≠ bons.
- **Domaine Chaos/Fury (Draven) + Calm/Chaos (Irelia)** = colonne vertébrale du méta.

### 2.1 Tier Origins — data-backed (31 mai 2026, 6 799 decks classés)

> Shanghai National Open + Beijing/Guangzhou/Chongqing/Hangzhou Regional Open + City Challenges. 16 légendes (pool Origins complet).

| Tier | Legend | Field % (decks) | Top 8 | Wins |
|------|--------|-----------------|-------|------|
| **S** | Kai'Sa, Daughter of the Void | 27,6% (1876) | 83 | 10 |
| **S** | Master Yi, Wuju Bladesman | 23,0% (1561) | 61 | 6 |
| **A** | Viktor, Herald of the Arcane | 11,5% (781) | 24 | 2 |
| **A** | Sett, The Boss | 5,4% (366) | 10 | 4 |
| **A** | Annie, Dark Child | 3,4% (233) | 10 | 1 |
| **B** | Miss Fortune (5,6%) / Teemo (5,4%) / Ahri (4,5%) / Darius (2,6%) | — | 6-11 | 0-1 |
| **C** | Yasuo / Jinx / Lee Sin / Volibear | 1-2,4% | 1-3 | 0-1 |
| **D** | Leona / Lux / Garen | <1,6% | 0 | 0 |

**Insight Origins** : méta à 2 têtes ultra-dominant — **Kai'Sa + Master Yi Bladesman = 50% du field** et 144 top 8 sur ~136 places. Sett surperforme (4 wins pour 5,4%).

### 2.2 Tier Unleashed — data-backed (31 mai 2026, 4 501 decks classés)

> 25 S3 City Challenges + Xi'an RO + Suzhou RQ + Sydney. 41 légendes — le méta le plus diversifié.

| Tier | Legend | Field % (decks) | Top 8 | Wins |
|------|--------|-----------------|-------|------|
| **S** | Irelia, Blade Dancer | 8,0% (362) | 30 | 6 |
| **S** | Master Yi, Wuju Master | 7,4% (333) | 30 | 1 |
| **S** | LeBlanc, Deceiver | 7,5% (337) | 19 | 2 |
| **S** | Diana, Scorn of the Moon | 6,5% (292) | 20 | 2 |
| **A** | Fiora (5,9%/15) · Lillia (5,5%/11) · Sivir (2,9%/9·2W) · Sett (2,8%/8·3W) · Master Yi Bladesman (3,8%/11·3W) · Azir (4%/7) · Kai'Sa (3,6%/12) · Rengar (2,7%/5·1W) · Annie (1,5%/5·3W sleeper) | — | — | — |
| **B** | Vex (5%/8) · Draven (2,6%/8) · Kha'Zix · Viktor · Pyke · Ezreal · Ornn | 1,7-5% | 2-8 | 0 |
| **C** | Miss Fortune (3,3% mais 1 top8) · Ahri · Teemo · Jhin · Volibear · Vi · Poppy | 0,9-3,3% | 0-2 | 0 |
| **D** | Lucian · Jax · Leona · Ivern · Lux · Darius · Yasuo · Jinx · Garen · Lee Sin · Rumble · Rek'Sai · Renata | <1,3% | 0-1 | 0 |

**Insights Unleashed** : méta **très ouvert** (4 légendes S quasi à égalité, ~13 viables). **Irelia** reste reine (6 wins). **Master Yi Wuju Master** est le nouveau Yi méta (vs Bladesman à Origins). **Miss Fortune** = piège (3,3% du field, 1 seul top 8). Annie/Sett surperforment en conversion.

### Tier List historique cross-set (Origins→Unleashed)

> Détail base 7987 : Shenzhen NO (2041), Shanghai NO (1984), Suzhou RQ (637), Xi'an RO (636), Fuzhou RQ (511), Beijing/Guangzhou/Chongqing RO, Atlanta/Vegas/Bologna/Houston/Lille RQ, Sydney.

### Tier 1 — Dominants, résultats multiples
| Legend | Domains | Decks analysés | Archetype | Résultat clé |
|--------|---------|---------------|-----------|--------------|
| **Kai'Sa** | Fury/Mind | ~1379 | Tempo-combo | **Won Shanghai NO** (2048 joueurs). 30-38% field Origins. Reine du set 1 |
| **Master Yi (Bladesman)** | Body/Calm | ~1113 | Hold +2 Might | Won Suzhou, 2nd Houston+Lille+Shanghai NO, 35 top 8 CC |
| **Draven** | Chaos/Fury | ~660 | Midrange explosif | **Won Fuzhou (35.8% field)** + Won Vegas. 5 Regional wins. Roi Spiritforged |
| **Irelia** | Calm/Chaos | ~493 | Tempo réactif | Won Sydney+Shenzhen, Finalist Suzhou, 3rd Bologna+Atlanta+Xi'an. 10 core verrouillées |

### Tier 2 — Solides, top cut réguliers
| Legend | Domains | Decks analysés | Archetype | Résultat clé |
|--------|---------|---------------|-----------|--------------|
| **Viktor** | Mind/Order | ~627 | Control pur | 2nd Shanghai CC, **4th Bologna**. #3 Origins chinois (11-20% field). Jamais en top 4 |
| **Miss Fortune** | Body/Chaos | ~192 | Aurora + Ganking | **2nd Bologna** (Sebiq). 17 decks Suzhou |
| **Fiora** | Body/Order | ~210 | Buff midrange | **2nd Fuzhou**. 2 CC wins. Flex slots max. 26 decks Suzhou |
| **Ezreal** | Chaos/Mind | ~175 | Control-burn | **Won Bologna** (Alanzq). 2x top 8 Suzhou. 6% Shenzhen |
| **Ahri** | Calm/Mind | ~159 | Tempo/value | Monte en Chine. 16 decks Suzhou. Core flexible |
| **Teemo** | Chaos/Mind | ~148 | Tempo-disrupt | 6th Sydney. 15 decks Suzhou. Top 8 CC |
| **Sett** | Body/Order | ~143 | Buff resilience | CC win Nanjing, 7th Atlanta. 12 decks Suzhou/Fuzhou |
| **Sivir** | Body/Chaos | ~136 | Aurora ramp | 2nd Sydney, Top 4 Suzhou. Core rigide. Meta s'adapte post-Xi'an |
| **Jinx** | Chaos/Fury | ~105 | Aggro explosif | 21st Atlanta. 9 decks Suzhou |
| **Annie** | Chaos/Fury | ~103 | Aggro | **Won Atlanta** + **Won Houston**. 5th Fuzhou. 3 Regional wins total |
| **Volibear** | Body/Fury | ~106 | Ramp-midrange | 12 decks Suzhou. 1-2% global |
| **Lee Sin** | Body/Calm | ~101 | Tempo | 7 decks Suzhou. Stable sans résultat top |
| **Diana** | Chaos/Mind | ~83 | Aggro-tempo | **Finalist Xi'an**, Top 4 Sydney, 47 decks Suzhou. Tier 1 riftbound.gg |
| **Azir** | Calm/Order | ~68 | Equipment tokens | **Won Xi'an** + **Won Lille 14-0-2**. 2 Regional wins |
| **LeBlanc** | Mind/Order | ~69 | Deathknell engine | Top 8 Xi'an/Sydney, 37 decks Suzhou. Tier 1 riftbound.gg |
| **Vex** | Calm/Chaos | ~48 | Hold-control | Top 4 Sydney. 23 decks Suzhou |

### Tier 3 — Compétitifs avec pilote expert
| Legend | Domains | Decks analysés | Notes |
|--------|---------|---------------|-------|
| **Darius** | Body/Fury | ~78 | Aggro. 14th Xi'an. 2 decks Fuzhou |
| **Leona** | Calm/Order | ~83 | Midrange défensif. 9 decks Suzhou |
| **Yasuo** | Calm/Chaos | ~82 | Tempo. 18th Lille. 7 decks Suzhou |
| **Lucian** | Fury/Order | ~80 | Aggro-equip. 10 decks Fuzhou. 4 decks Suzhou |
| **Jax** | Body/Calm | ~75 | Equipment-value. **7th Vegas**. 7 decks Fuzhou |
| **Rumble** | Chaos/Fury | ~75 | Aggro-burn. 12 decks Suzhou. 4 decks Fuzhou |
| **Lux** | Mind/Order | ~72 | Control lourd. 8 decks Fuzhou. 6 decks Suzhou |
| **Rek'Sai** | Body/Fury | ~73 | Aggro tunneler. 11 decks Fuzhou. 7 decks Suzhou |
| **Ornn** | Calm/Mind | ~63 | Gear-value unique. 12 decks Fuzhou. 6 decks Suzhou |
| **Lillia** | Calm/Mind | ~49 | Control-tempo. CC win Shanghai. 32 decks Suzhou (5%) |
| **Rengar** | Body/Fury | ~33 | Aggro. CC win Guangzhou. 18 decks Suzhou. Dark horse |

### Tier 4 — Top cut rare, données limitées
| Legend | Domains | Decks | Notes |
|--------|---------|-------|-------|
| Renata Glasc | Mind/Order | ~38 | Control. 6 decks Fuzhou. 5 decks Suzhou |
| Garen | Body/Order | ~23 | Aurora ramp. 2 decks Fuzhou. Très rare |
| Master Yi Wuju Master | Body/Calm | ~21 | Aggro-synergy Unleashed. 10 decks Suzhou (1.6%). 0 top 8 |
| Vi | Fury/Order | ~20 | Aggro-equip. 9 decks Suzhou |
| Pyke | Chaos/Fury | ~20 | Aggro-value. 10 decks Suzhou |
| Kha'Zix | Body/Chaos | ~24 | Aggro-combo. 15 decks Suzhou. T2 riftbound.gg |
| Poppy | Body/Order | ~11 | **3rd Suzhou** — surprise. 4 decks seulement |
| Jhin | Mind/Order | ~16 | Combo précision. 9 decks Suzhou |
| Ivern | Calm/Order | ~7 | Support ramp. 7 decks Suzhou |

## 3. Cartes clés du format

| Carte | ID | Impact |
|-------|-----|--------|
| **Dazzling Aurora** | OGN-160 | Gear 9-cost build-around. Porte Sivir, MF, Poppy. **En déclin post-Xi'an** — le field maindeck du gear removal. |
| **UNL-118** | UNL-118 | Dragon invoqué par Aurora — retire les unités adverses. Galère vs tokens. |
| **Stellacorn Herder** | UNL-150 | 4-cost polyvalente. Irelia, Vex, Kha'Zix la jouent. |
| **UNL-172** | UNL-172 | Backbone LeBlanc — draw sur chaque Deathknell. |
| **OGN-236** | OGN-236 | Paire avec UNL-172 — bonus massif sur Deathknell. |
| **OGN-242** | OGN-242 | Win con brute force (Fiora, LeBlanc variante). Risqué car gear removal partout. |
| **Adaptatron** | OGN-056 | Tech anti-Aurora d'Irelia — maindecké post-Xi'an. |
| **Salvage** | OGN-224 | Gear removal maindecké — réponse à Aurora. |
| **Turn to Dust** | UNL-070 | Gear removal maindecké — réponse à Aurora. |
| **UNL-042** | UNL-042 | Stun universel — Master Yi, Irelia, Azir le jouent. |
| **SFD-057** | SFD-057 | Win con Irelia depuis Spiritforged. |
| **OGN-116** | OGN-116 | Closer Mind standard — -3 might. Diana, Lillia, Ezreal. |
| **OGN-192** | OGN-192 | Disruption main adverse. Sivir, MF, Ezreal, Draven. |
| **OGN-045** | OGN-045 | Contresort Calm. Irelia, Yi, Vex, tous les Calm decks. |

## 4. Fiches détaillées — 22 légendes

Fiches JSON complètes dans `data/fiches/` :
- **Tier 1 (riftbound.gg)** : irelia-blade-dancer, master-yi-wuju-bladesman, diana-scorn-of-the-moon, leblanc-deceiver
- **Tier 2 (riftbound.gg)** : vex-gloomist, sivir-battle-mistress, azir-emperor-of-the-sands, miss-fortune-bounty-hunter, ezreal-prodigal-explorer, fiora-grand-duelist, khazix-voidreaver
- **Tier 3 (riftbound.gg)** : teemo-swift-scout, draven-glorious-executioner, poppy, annie, sett-the-boss, viktor-herald-of-the-arcane, lillia-bashful-bloom, rengar-pridestalker, kaisa-daughter-of-the-void, ornn-fire-below-the-mountain, vi, lux
- **Tier 4 (riftbound.gg)** : pyke, reksai, darius, volibear-relentless-storm, lucian, master-yi-wuju-master
- **Tier 5 (riftbound.gg)** : ahri-nine-tailed-fox, garen, leona-radiant-dawn, yasuo, lee-sin, jinx, jax, rumble, renata-glasc, jhin, ivern

Chaque fiche contient : domains, ability, gameplan (early/mid/late), key cards avec IDs, forces/faiblesses, résultats compétitifs, difficulté, tips.

## 5. Historique complet du méta

### Août-Nov 2025 — Origins (Chine) — 5 tournois, 2017 decklists
- **Guangzhou Regional Open** (24 août 2025, 506 joueurs, **501 decklists** — données complètes) : Yi #1 (27%), Viktor #2 (20%), Kai'Sa #3 (19%). Viktor le plus fort ici qu'ailleurs. Body/Calm domine (30%). 15 légendes.
- **Beijing Regional Open Day 1** (30 août 2025, 512 joueurs, **7 decklists top 8**) : Yi 57%, Kai'Sa 43%. Seulement top 8 disponible.
- **Beijing Regional Open Day 2** (31 août 2025, 509 joueurs, **505 decklists**) : Kai'Sa gagne (30%), Yi (27%), Viktor (13%). Fury/Mind + Body/Calm = 59% du field. 16 légendes.
- **Chongqing Regional Open** (7 sept 2025, 507 joueurs, **499 decklists** — données complètes) : Kai'Sa #1 (33%) gagne via GeorgeG. Yi #2 (22%), Viktor #3 (11%). MF surprise à 8%. Top 8 : 5 Kai'Sa + 3 Yi.
- **Shanghai National Open** (2 nov 2025, **2048 joueurs**, **1984 decklists** — plus gros tournoi Origins) :
  - **Kai'Sa #1** : 599 decks (30%), 1st (OmegaZero). **4/8 top 8** = Kai'Sa.
  - **Master Yi #2** : 473 decks (24%), 2nd. **4/8 top 8** = Yi.
  - Les 2 legends = 54% du field. Top 8 entièrement Kai'Sa/Yi.
  - **Viktor** surprise #3 (182 decks, 9%) mais 0 dans le top 8.
  - 16 légendes représentées — méta très concentré comparé à l'Occident.
  - Fury/Mind domine (30%), Body/Calm 2ème (25%).
- **Shanghai City Challenge** (23 nov 2025, 128 joueurs, **128 decklists** — 100% du field) :
  - Kai'Sa 38%, Yi 20%. Viktor surprise top 2-3. Teemo top 4.

### Déc 2025 — Origins (Final)
- **Set** : Origins (1er set, 16 légendes)
- **Kai'Sa** domine globalement — meilleure légende du set. Won Chinese National + Orlando events.
- **Annie** découverte tardive par la communauté NA — build scoring agressif, pas le midrange chinois.
- **Annie won Houston Regional** (4 en top 8, 3 en top 4). Shawn Dhaliwal champion.
- **Miss Fortune** gagne Orlando 10K — son premier gros tournoi, trop tard dans le set.
- **Sett** avait gagné Atlanta (Nov 2025) mais décline face à Annie.
- **Master Yi** T2, **Teemo** T2, **Viktor/Darius/Yasuo** T3.
- **7 légendes T4** : Lee Sin, Volibear, Ahri, Jinx, Leona, Lux, Garen.

### Mars 2026 — S2 Shenzhen National Open (Spiritforged, Chine)
- **S2 Shenzhen National Open** (22 mars 2026, **2048 joueurs**, **2041 decklists** — plus gros tournoi Spiritforged) :
  - **Draven #1** : 384 decks (18%), **5/8 top 8**. Dominant mais pas gagnant.
  - **Irelia gagne** : #1 (阿门) et #2 (梦之星 一个小乐色) jouent Calm/Chaos. 239 decks (11%).
  - **Kai'Sa #3** : 218 decks (10%) — nette baisse vs Origins (était 30-38%).
  - **28 légendes** représentées — méta diversifié vs Origins (où Kai'Sa+Yi = 54%).
  - **Chaos omniprésent** : Chaos/Fury 22% + Calm/Chaos 13% = 35% du field en Chaos.
  - **Changement radical vs Origins** : Yi passe de #1-2 à #9 (59 decks, 2%). Draven (absent d'Origins) à 18%. Viktor stable (~6%).
  - **EDG.Rico1997** (3rd) — même joueur qui gagnera Sydney 2 mois plus tard.

### Jan 2026 — Fuzhou Regional Qualifier (Spiritforged, Chine — 511 decklists)
- **Fuzhou RQ** (15 jan 2026, ~800 joueurs, **511 decklists scrapées**) : Dataset complet.
- **Draven domine sans partage** : 183/511 decks (35.8%) — le taux de représentation le plus élevé jamais enregistré pour une légende dans un Regional.
- **4 Draven en top 8** : Aipotu (1st), 天堂制造 (3rd), 海盗帕奇斯 (6th), 布启 (7th).
- **Fiora surprise 2nd** : seulement 24 decks (4.7%) mais EDG.BTM.少侠SNnnnn en finale.
- **Irelia** 2 en top 8 (4th 赤月星宿, 8th Trails) avec 62 decks (12.1%).
- **Annie 5th** (Ai.EDG.张伯伦) — faible représentation mais excellente conversion.
- **28 légendes** représentées — diversifié malgré la domination Draven.
- **Kai'Sa décline** : 39 decks (7.6%) — loin des 30-38% d'Origins.

### Jan 2026 — Spiritforged Post Chengdu (Chine)
- **Draven S-Tier** : won Fuzhou ET Chengdu. 331 picks, 23.26% conversion. Deux builds : Midrange + Miracle.
- **Irelia #2** : 16.4% conversion, mais perd en Top 4/Top 8 — ne gagne jamais.
- **Fiora surprise** : 2 finales avec 2 builds différents (midrange equipment + OGN-242). Seulement 6% conversion.
- **Ezreal** dark horse : semi-finalist Chengdu, nouveau dans Spiritforged.
- **Kai'Sa** en déclin : 5 top 64 à Fuzhou → 1 seul à Chengdu.
- **Garen** : premier legend à 0 picks en Regional.

### Fév 2026 — Spiritforged Post Chinese Regionals / Global Release
- **4 tournois chinois** analysés. Cycle méta identifié : Draven midrange → Control s'adapte → Annie punit le control → cycle recommence.
- **Draven T1** (plus S-Tier) : 573 picks, 21.99% conversion, 2 Wins + 2 Top 4.
- **Kai'Sa revit** : won Dalian avec build control heavy. Roller coaster sur 4 events.
- **Annie won Nanjing** : 37.5% conversion (3/8 en Day 2).
- **Ezreal** consistant : top cut aux 4 regionals chinois, finals + semis.
- **Sett** discret mais fort : 20.69% conversion sur 29 picks.
- **6 légendes T1** : Draven, Irelia, Kai'Sa, Annie, Ezreal, Fiora.
- L'Occident reçoit Spiritforged dans cet environnement complexe.

### Mars 2026 — Spiritforged Post Vegas (Occident)
- **Vegas RQ** (1670 joueurs, **129 decklists scrapées**) : les 4 demi-finalistes sont Draven (5/8 top 8). Draven 18% du field (24/129), 62.4% WR global.
- Samdsherman (1st), TTA (2nd), Argan (3rd), Shizzle (4th) — tous Draven Chaos/Fury.
- **Chaos/Fury 23% du field**, Calm/Chaos 10%, Mind/Order 10%, Body/Fury 9%.
- **Bologna** (1719 joueurs, 120 decklists) : le control contenait Draven → Vegas a tout annulé.
- **Ezreal won Bologna** (Alanzq, 1st) — même joueur Top 8 Vegas aussi. Learning curve très raide. Draven 14% du field, 3/8 top8.
- **Miracle archetype** se répand à tout le domaine Chaos.
- **Master Yi** bon vs Miracle (score tôt pendant qu'ils sont lents). SFD-105 tech clé.
- **Fiora** : effondrement complet en Occident vs ses résultats chinois (7.2% conversion, 44.7% WR).
- **Miss Fortune** : finaliste Vegas avec 38.9% WR — outlier extrême.

### Avr 2026 — Post-Ban Spiritforged
- **7 bans** ciblent Draven et les builds Miracle : OGN-168, OGN-182, OGN-284, OGN-292, SFD-020, SFD-122 + battlefields.
- Miracle et Detonate builds morts. Seul Midrange Draven survit.
- **Prédictions** : Ezreal meilleur Chaos (ne partage pas les domains de Draven), Irelia forte en raw power, Body domain (Yi, Fiora, Jax, Sett, Lucian) en hausse.
- Control legends paradoxalement plus en difficulté (Irelia/Ezreal plus durs à épuiser que Draven).

### Avr 2026 — Lille Regional Qualifier (Post-Ban)
- **1949 joueurs** (le plus gros RQ Spiritforged), **63 decklists scrapées**. Premier Regional post-ban.
- **Azir win** (Squirtle, 14-0-2) — surprise totale. 5 légendes différentes en top 8.
- **Master Yi finalist** (Schorn). Draven 3rd (CTCG DZiden) et Annie 4th (Prismaticismism).
- **Irelia domine le top 8** (3/8). Diversité maximale comparé aux tournois Miracle-era.
- Draven toujours populaire mais plus dominant qu'à Vegas.

### Avr 2026 — Atlanta Regional Qualifier (Dernier Spiritforged)
- **1832 joueurs**, **56 decklists scrapées**. Dernier Regional de Spiritforged.
- **Annie win** (Prismaticismism, aussi top 4 Lille) — sa 3ème victoire Regionale (après Houston + Nanjing).
- Draven finalist (CTCG Koko Lopez). Irelia 3rd (HaruKaze). Ezreal 4th (CTG Alanzq — aussi 1st Bologna).
- **6 légendes différentes en top 8** : Annie, Draven, Irelia, Ezreal, Kai'Sa, Sett.
- **Bilan Spiritforged** : Chaos/Fury domine. Draven (3 wins) + Annie (3) = 6 sur 9 Regionals.
- Autres gagnants : Kai'Sa, Ezreal, Azir (1 chacun).

### Mai 2026 — Unleashed Pre-Regionals (City Challenges)
- **Nouveau set** : Unleashed (3ème set). 12 nouvelles légendes (Diana, LeBlanc, Vex, Rengar, Kha'Zix, etc.)
- Master Yi Bladesman : 4 Wins / 35 Top 8 (dominant). Master Yi Wuju Master (Unleashed) : 0 résultats CC
- Irelia : 6 Wins / 21 Top 8 (plus de wins)
- Diana : 3 Wins / 13 Top 8 + 4 CC wins (record)
- LeBlanc : 2 Wins / 14 Top 8
- Fiora : 1 Win / 11 Top 8 (start spectaculaire puis stabilisée)

### Avr 2026 — S3 City Challenges (8 tournois analysés, 960 joueurs)
- **8 CC** fetchés de riftrank.com (Beijing, Nanjing, Shenzhen, Shanghai, Guangzhou, Tianjin, Changsha, Atlanta).
- **Gagnants** : Fiora x2, Annie x2, Lillia, Rengar, Master Yi Bladesman, Sett — aucune légende ne domine seule.
- **LeBlanc/Vex** = les plus jouées (~10-13% meta share) mais sous-performent en top cut. Populaires et ciblées.
- **Master Yi Bladesman** = très populaire (11-12%) mais ne convertit pas à la hauteur de sa représentation. Wuju Master (Unleashed) rare et sans résultats.
- **Rengar** = dark horse récurrent, 2 top 3 avec ~2-3% meta share.
- **Sett** = sous-représenté mais surperformant (win Nanjing, top 8 multiples).
- **Annie** = basse représentation (~3-4%) mais 2 wins (Shenzhen + Atlanta). Meilleure conversion du format.
- **Teams dominent en Chine** : 梦之星 (7/8 top8 Changsha), ECG (4/8 Tianjin), LineKa (3/10 Guangzhou).
- **Format très diversifié** : top 8 souvent 7-8 légendes différentes.

### Mai 2026 — Suzhou Regional Qualifier (Unleashed, Chine — 637 decklists)
- **Suzhou RQ** (10 mai 2026, ~800 joueurs, **637 decklists scrapées**) : Dataset complet. **41 légendes** — le méta le plus diversifié jamais enregistré.
- **Master Yi Bladesman win** (燐川) — le vétéran d'Origins triomphe dans Unleashed. 66 decks (10.4%).
- **6 légendes différentes en top 8** : Yi Bladesman, 2x Irelia, Poppy (!), 2x Sivir, 2x Ezreal.
- **Poppy 3rd** (卓卡-坦尼斯) — seulement 4 decks dans le tournoi. Outlier statistique.
- **Ezreal 2x top 8** (andy1996 5th, TXG·高远 6th) — 7 decks seulement (28.6% conversion).
- **Diana absente du top 8** malgré 47 decks (7.4%) — contraste avec Xi'an où elle est finaliste.
- **LeBlanc absente du top 8** malgré 37 decks (5.8%).
- **Lillia surprise** : 32 decks (5.0%) — 5ème légende la plus jouée. Monte en Unleashed.
- **Master Yi Wuju Master** : seulement 10 decks (1.6%), 0 top 8. Sans rapport avec le Bladesman vainqueur.

### Mai 2026 — Unleashed Post Sydney/Suzhou
- **Sydney RQ** : 528+ matchs tracés pour les top légendes. 34 légendes représentées. Irelia win 14-1-1.
- **Suzhou RQ** : Master Yi, Wuju Bladesman win. Sivir Top 4, Irelia Finalist. (Wuju Master absent du top cut)
- **OGN-160** (Dazzling Aurora) est la carte du format. Débat de nerf.
- **Différences régionales** : Ezreal/Annie forts en Occident, Diana plus forte en Chine.
- **Best of Sydney RQ** : 40 decklists classées S/A/B/C/D sur riftboundfrance.fr/articles/best-of-sydney-rq-2026.

### Mai 2026 — S3 Xi'an Regional Open (24 mai 2026)
- **640 joueurs**, 636 decklists scrapées et analysées — le plus gros dataset du projet.
- **40 légendes** représentées. Top légendes par picks : Irelia (68), Master Yi Bladesman (54), Diana (36), LeBlanc (32), Sivir (29), Fiora (28), Vex (25), Sett (24), Ahri (22), Azir (20). Note : Wuju Master comptabilisé séparément (~5 decks).
- **12 paires de domains** actives. Calm/Chaos domine (102 decks, 16%), suivi de Calm/Body (84) et Order/Body (65).
- **Azir win** — surprise totale, 3.14% pick rate → 25% conversion. Build equipment tokens Calm/Order.
- **Diana finalist (2nd)** — confirme statut T1. 5.66% pick / 11.11% conversion.
- **Irelia top 4** multiple (3rd, 4th, 7th, 8th) — 10.69% pick / 16.18% conversion. Toujours la plus jouée et la plus constante.
- **LeBlanc 6th** — confirme en top 8 pour la 2ème Regional consécutive.
- **Sivir absente du top 8** — le meta s'est adapté à Aurora (Dazzling Aurora OGN-160). Drop de 2nd Sydney → Top 32 Xi'an.
- **Master Yi Bladesman 13th** — très populaire (54 decks) mais ne convertit pas au plus haut niveau. Wuju Master hors top 64.
- **Aurora punished** : le field a maindecké du gear removal (Salvage OGN-224, Turn to Dust UNL-070, Adaptatron OGN-056). Sivir et Poppy (les plus dépendantes d'Aurora) en chute libre.
- **Données complètes** : 636 decklists JSON dans `data/decklists/`, résumé dans `data/tournaments/s3-xian-regional-open.json`.

### Mai 2026 — Unleashed Pre-Vancouver (riftbound.gg Tier List, 28 mai 2026)

> Source : [riftbound.gg](https://riftbound.gg/riftbound-meta-tier-list-best-decks-for-unleashed-heading-to-vancouver/) par Den. Basée sur Suzhou RO, Sydney RQ, Xi'an RO + CCS Invitational #3 + 15 tournois 64-128 joueurs. JSON dans `data/meta-reports/unleashed-tier-list-vancouver-2026-05-28.json`.

#### Tier List Éditoriale (riftbound.gg)

| Tier | Légendes | Définition |
|------|----------|------------|
| **1** | **Irelia**, **Diana**, **Master Yi (Bladesman)**, **LeBlanc** | Top cut attendu, potentiel vainqueur en tournoi majeur |
| **2** | Vex, Sivir, Azir, Miss Fortune, Ezreal, Fiora, Kha'Zix | Top cut possible, pas favori pour gagner |
| **3** | Teemo, Draven, Poppy, Annie, Sett, Viktor, Lillia, Rengar, Kai'Sa, Ornn, Vi, Lux | Compétitif avec pilote expert |
| **4** | Pyke, Rek'Sai, Darius, Volibear, Lucian, Master Yi (Wuju Master) | Résultats sporadiques |
| **5** | Ahri, Garen, Leona, Yasuo, Lee Sin, Jinx, Jax, Rumble, Renata Glasc, Jhin, Ivern | Pas compétitif actuellement |

#### Résultats détaillés Tier 1

| Légende | Suzhou | Sydney | Xi'an | CC (64-128 joueurs) |
|---------|--------|--------|-------|---------------------|
| **Irelia** | Top 2 | **Win** | Top 4 | 1 Win / 7 Top 8 |
| **Diana** | Top 32 | Top 4 | **Top 2** | 3 Win / 10 Top 8 |
| **Master Yi (Bladesman)** | **Win** | Top 16 | Top 16 | 2 Win / 24 Top 8 |
| **LeBlanc** | Top 64 | Top 8 | Top 8 | 3 Win / 11 Top 8 |

#### Observations méta pré-Vancouver
- **Aurora (Dazzling Aurora OGN-160) en déclin** : performances les plus faibles à Xi'an. Le field s'est adapté avec du gear removal en main deck.
- **Gear removal maindecké** : Salvage (OGN-224), Turn to Dust (UNL-070), Adaptatron (OGN-056) — punissent lourdement les decks Aurora (Sivir, Poppy, Garen).
- **Sivir** : de 2nd Sydney → Top 32 Xi'an. Aurora ciblé.
- **Poppy** : de Top 4 Suzhou → Top 256 Xi'an. Aurora punished le plus sévèrement.
- **Irelia** cimentée #1 avec 4 top 8 à Xi'an.
- **Diana** monte vite — finaliste Xi'an, domine les CC.
- **LeBlanc** rejoint le Tier 1 — build traditionnel confirmé viable après la liste atypique de Sydney.
- **Master Yi Bladesman** : populaire mais échoue au top 8 dans 2/3 regionals malgré 24 top 8 CC. Wuju Master (Unleashed) sans résultat.
- **Azir** : gagnant surprise Xi'an — doit prouver que ce n'est pas un one-off.
- **Dilemme Vancouver** : construire anti-Aurora ou anti-Irelia/Diana/Yi/LeBlanc ?

## 6. Résultats de tournois

### Chronologie complète des Regional Qualifiers

| # | Tournoi | Date | Set | Joueurs | Decklists | Gagnant | Finalist |
|---|---------|------|-----|---------|-----------|---------|----------|
| — | Guangzhou RO | 24 août 2025 | Origins | 506 | 501 | Kai'Sa (LineKa·SadFox) | Master Yi |
| — | Beijing RO Day 1 | 30 août 2025 | Origins | 512 | 7 | — | Master Yi |
| — | Beijing RO Day 2 | 31 août 2025 | Origins | 509 | 505 | Kai'Sa (Ai.闪闪) | Master Yi |
| — | Chongqing RO | 7 sept 2025 | Origins | 507 | 499 | Kai'Sa (GeorgeG) | Master Yi |
| — | Shanghai NO | 2 nov 2025 | Origins | 2048 | 1984 | Kai'Sa (OmegaZero) | Master Yi |
| — | Shanghai CC | 23 nov 2025 | Origins | 128 | 128 | Kai'Sa (DNZ念) | Viktor |
| 1 | Houston RQ | 7 déc 2025 | Origins | 1347 | 66 | Annie (Dhawally) | Master Yi |
| — | S2 Shenzhen NO | 22 mars 2026 | Spiritforged | 2048 | 2041 | Irelia (阿门) | Irelia |
| 2 | Fuzhou RQ (Chine) | 15 jan 2026 | Spiritforged | ~800 | 511 | Draven (Aipotu) | Fiora |
| 3 | Chengdu RQ (Chine) | Jan 2026 | Spiritforged | ~800 | — | Draven | Fiora |
| 4 | Dalian RQ (Chine) | Fév 2026 | Spiritforged | ~800 | — | Kai'Sa | Azir |
| 5 | Nanjing RQ (Chine) | Fév 2026 | Spiritforged | ~800 | — | Annie | — |
| 6 | Bologna RQ | 21 fév 2026 | Spiritforged | 1719 | 120 | Ezreal (Alanzq) | Miss Fortune |
| 7 | Las Vegas RQ | 1 mars 2026 | Spiritforged | 1670 | 129 | Draven (Samdsherman) | Draven |
| 8 | Lille RQ | 18 avr 2026 | SF Post-Ban | 1949 | 63 | Azir (Squirtle 14-0-2) | Master Yi |
| 9 | Atlanta RQ | 25 avr 2026 | SF Post-Ban | 1832 | 56 | Annie (Prismaticismism) | Draven |
| 10 | Sydney RQ | 16 mai 2026 | Unleashed | 1405 | — | Irelia (EDG Rico1997 14-1-1) | Sivir |
| 11 | Suzhou RQ | 10 mai 2026 | Unleashed | ~800 | 637 | Master Yi Bladesman (燐川) | Irelia |
| 12 | S3 Xi'an RO | 24 mai 2026 | Unleashed | 640 | 636 | Azir (墨白) | Diana |
| 13 | Vancouver RQ | 31 mai 2026 | Unleashed | — | 6 (Top 8 castés) | Diana (AlanZQ) | Rengar (Sam D Sherman) |

**Bilan Regional wins** : Kai'Sa 5 (Guangzhou, Beijing D2, Chongqing, Shanghai NO, Shanghai CC), Draven 4 (Vegas, Fuzhou, Chengdu, +), Annie 3, Irelia 2 (Sydney, Shenzhen), Azir 2 (Lille, Xi'an), Ezreal 1 (Bologna), Master Yi Bladesman 1 (Suzhou), Diana 1 (Vancouver)

**1er double champion de RQ de l'histoire : AlanZQ** (Bologna sur Ezreal + Vancouver sur Diana). Note : Sam D Sherman (ex-Vegas/Draven) et Diwali (ex-Houston/Annie) étaient aussi en lice pour ce statut dans le même Top 8.

### Vancouver RQ Top 8 (31 mai 2026, Unleashed) — source : VOD officielle

6 Légendes pour 8 joueurs (l'un des Top 8 les plus diversifiés). Détail complet : `data/videos/vancouver-day1-analysis.md` + `vancouver-day1-games-analysis.md`.

| Place | Joueur | Légende | Notes |
|-------|--------|---------|-------|
| 1 | AlanZQ (CTG) | Diana, Scorn of the Moon | Champion. 1er double champion (Bologna+Vancouver) |
| 2 | Sam D Sherman | Rengar, Pridestalker (Fury agro) | Deck surprise, MVP = Irresistible Faefolk |
| T4 | Diwali (Dhawally) | Diana, Scorn of the Moon | Variante Frigid Jewel + Consult the Past ; ex-Houston |
| T4 | Houses Are Big (Secret Sauce) | Master Yi, Wuju Bladesman | Midrange ; Akshan main, Primal Strength, Zhonya's |
| T8 | Rocklho | Azir, Emperor of the Sands | — |
| T8 | Baobao | Irelia, Blade Dancer | — |
| T8 | Arito | Irelia, Blade Dancer | — |
| T8 | SwagYOLO420 | Sivir, Battle Mistress (Aurora) | Seul Aurora du Top 8 |

**Bracket** : QF — Sam>Rocklho (2-1), Diwali>SwagYOLO420 (2-0), Houses Are Big>Baobao, AlanZQ>Arito. SF — Sam>Houses Are Big (2-1), AlanZQ>Diwali (2-1, miroir Diana). **Finale — AlanZQ>Sam D Sherman (2-1)**.

**Best Ofs** : Draven → Pog Chungus (Toronto) ; Lillia → Gail Wins ; Poppy → NoVeggies ; Yi → Houses Are Big. Team Secret Sauce = 3 Best Ofs.

**Lecture méta** :
- **Aurora retombe** : 1 seul en Top 8, éliminé en quart. Le gear hate (retrait des Guardian Angel, Turn to Dust, Acceptable Losses) punit Aurora ET les builds Irelia/Aurelia autour du gear.
- **Fury ressuscité** par un pilote expert : Rengar agro-contrôle non-Aurora jusqu'en finale, porté par Irresistible Faefolk (charm + trades forcés) et Kai'Sa Survivor (moteur).
- **Vex (Apathetic + Cheerless) = tech anti-Fury du week-end** : stun + blocage ambush/accelerate ; double Vex = verrou. Punch First reste LE débloqueur côté Fury.
- **Diana top tier** : 2 en demi, gagne l'event. Stacked Deck gardé pour la réponse exacte, Moonfall removal, Ravenbloom Conservatory moteur de cartes, boucle Fizz + Star-Crossed pour retuer le Hwei adverse.

### Shanghai National Open (2 nov 2025, 2048 joueurs, Origins)

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | OmegaZero | Kai'sa, Daughter of the Void | Fury/Mind |
| 2 | 不吃糖的乙酸盐、 | Master Yi, Wuju Bladesman | Body/Calm |
| 3 | 呆头飞鸟 | Kai'sa, Daughter of the Void | Fury/Mind |
| 4 | ARBD-lay | Master Yi, Wuju Bladesman | Body/Calm |
| 5 | TAL | Master Yi, Wuju Bladesman | Body/Calm |
| 6 | Ai | Kai'sa, Daughter of the Void | Fury/Mind |
| 7 | 白龙万丈 | Kai'sa, Daughter of the Void | Fury/Mind |
| 8 | GREY阳 | Master Yi, Wuju Bladesman | Body/Calm |

**Meta Shanghai NO — Top légendes (1984 decks)** :
| Legend | Decks | % | Meilleur placement |
|--------|-------|---|-------------------|
| Kai'Sa | 599 | 30% | 1st |
| Master Yi | 473 | 24% | 2nd |
| Viktor | 182 | 9% | 29th |
| Miss Fortune | 120 | 6% | 27th |
| Sett | 118 | 6% | 19th |
| Teemo | 105 | 5% | 30th |
| Ahri | 80 | 4% | 119th |
| Annie | 62 | 3% | 53rd |
| Yasuo | 47 | 2% | 71st |
| Jinx | 40 | 2% | 176th |

**Domains Shanghai NO** : Fury/Mind 599 (30%), Body/Calm 504 (25%), Mind/Order 206 (10%), Body/Order 134 (7%), Body/Chaos 120 (6%), Chaos/Mind 105 (5%), Chaos/Fury 102 (5%), Calm/Mind 80 (4%)

**Note** : Plus gros dataset Origins du projet. Top 8 = 4 Kai'Sa + 4 Yi. Méta Origins ultra concentré vs l'Occident. Données dans `data/tournaments/shanghai-national-open.json` et 1984 JSON dans `data/decklists/`.

---

### Beijing Regional Open Day 2 (31 août 2025, 509 joueurs, Origins)

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | Ai.闪闪 | Kai'sa, Daughter of the Void | Fury/Mind |
| 2 | 高冷白 | Master Yi, Wuju Bladesman | Body/Calm |
| 3 | Aipotu | Kai'sa, Daughter of the Void | Fury/Mind |
| 4 | 淘金巢.存档点.Ai.沐秋 | Master Yi, Wuju Bladesman | Body/Calm |

**Meta Beijing D2 — Top légendes (505 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Kai'Sa | 153 | 30% |
| Master Yi | 137 | 27% |
| Viktor | 68 | 13% |
| Ahri | 24 | 4% |
| Miss Fortune | 23 | 4% |
| Sett | 20 | 3% |
| Teemo | 19 | 3% |
| Jinx | 16 | 3% |

**Domains** : Fury/Mind 30%, Body/Calm 29%, Mind/Order 13%. Top 8 = 4 Kai'Sa + 4 Yi.

---

### Chongqing Regional Open (7 sept 2025, 507 joueurs, Origins — données complètes)

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | GeorgeG | Kai'sa, Daughter of the Void | Fury/Mind |
| 2 | 易得趣^–^MYZ | Master Yi, Wuju Bladesman | Body/Calm |
| 3 | Aipotu | Kai'sa, Daughter of the Void | Fury/Mind |
| 4 | 应无求 | Master Yi, Wuju Bladesman | Body/Calm |

**Meta Chongqing — Top légendes (499 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Kai'Sa | 168 | 33% |
| Master Yi | 114 | 22% |
| Viktor | 57 | 11% |
| Miss Fortune | 40 | 8% |
| Teemo | 28 | 5% |
| Sett | 19 | 3% |

**Domains** : Fury/Mind 33%, Body/Calm 25%, Mind/Order 12%. Top 8 = 5 Kai'Sa + 3 Yi. MF surprise à 8%.

---

### Guangzhou Regional Open (24 août 2025, 506 joueurs, Origins — données complètes)

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | LineKa·SadFox | Kai'sa, Daughter of the Void | Fury/Mind |
| 2 | Ai.幻影 | Master Yi, Wuju Bladesman | Body/Calm |
| 3 | 蜂人 | Kai'sa, Daughter of the Void | Fury/Mind |
| 4 | Acc.Ai.昕奕 | Kai'sa, Daughter of the Void | Fury/Mind |

**Meta Guangzhou — Top légendes (501 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Master Yi | 137 | 27% |
| Viktor | 102 | 20% |
| Kai'Sa | 98 | 19% |
| Miss Fortune | 24 | 4% |
| Jinx | 23 | 4% |
| Teemo | 23 | 4% |

**Note** : Particularité — Yi #1 en field (27%) devant Viktor #2 (20%), mais Kai'Sa gagne (#1, #3, #4). Viktor beaucoup plus fort ici qu'ailleurs.

---

### S2 Shenzhen National Open (22 mars 2026, 2048 joueurs, Spiritforged)

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | 阿门 | Irelia, Blade Dancer | Calm/Chaos |
| 2 | 梦之星 一个小乐色 | Irelia, Blade Dancer | Calm/Chaos |
| 3 | EDG.Rico1997 | Draven, Glorious Executioner | Chaos/Fury |
| 4 | LineKa·小XO | Draven, Glorious Executioner | Chaos/Fury |
| 5 | 宝库卡牌-andy1996 | Draven, Glorious Executioner | Chaos/Fury |
| 6 | 神切.KDX.克烈同学 | Draven, Glorious Executioner | Chaos/Fury |
| 7 | 神切.tie.oymlfans | Draven, Glorious Executioner | Chaos/Fury |
| 8 | 零号站台-阿夜 | Sivir, Battle Mistress | Body/Chaos |

**Meta Shenzhen — Top légendes (2041 decks)** :
| Legend | Decks | % | Top 8 |
|--------|-------|---|-------|
| Draven | 384 | 18% | 5 |
| Irelia | 239 | 11% | 2 |
| Kai'Sa | 218 | 10% | 0 |
| Ezreal | 125 | 6% | 0 |
| Viktor | 124 | 6% | 0 |
| Fiora | 119 | 5% | 0 |
| Azir | 68 | 3% | 0 |
| Sivir | 62 | 3% | 1 |
| Master Yi | 59 | 2% | 0 |
| Miss Fortune | 49 | 2% | 0 |

**Domains Shenzhen** : Chaos/Fury 22%, Calm/Chaos 13%, Fury/Mind 12%, Mind/Order 8%, Chaos/Mind 7%, Body/Order 7%, Body/Calm 6%, Body/Chaos 5%

**Note** : Plus gros tournoi Spiritforged. Changement radical vs Origins — Yi de #1-2 (27%) à #9 (2%), Draven absent → 18%. Irelia gagne contre un champ dominé par Draven. 28 légendes représentées — bien plus diversifié que Origins. EDG.Rico1997 (3rd) gagnera Sydney 2 mois après. Données dans `data/tournaments/s2-shenzhen-national-open.json` et 2041 JSON dans `data/decklists/`.

---

### S3 Xi'an Regional Open (24 mai 2026, 640 joueurs)

| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 2 | 放逐之刃 | Diana, Scorn of the Moon | Diana, Lunari |
| 3 | EDG | Irelia, Blade Dancer | Irelia, Fervent |
| 4 | 紫禁·麻袋·Sdubby | Irelia, Blade Dancer | Irelia, Fervent |
| 6 | DWT-阿龙 | LeBlanc, Deceiver | LeBlanc, Fragmented |
| 7 | CCB | Irelia, Blade Dancer | Irelia, Fervent |
| 8 | 北京泽萱-Cui | Irelia, Blade Dancer | Irelia, Fervent |
| 9 | 火星 | Diana, Scorn of the Moon | Diana, Lunari |
| 11 | LineKa·黑天使 | LeBlanc, Deceiver | LeBlanc, Fragmented |
| 13 | CCB | Master Yi, Wuju Bladesman | Master Yi, Tempered |

**Meta Xi'an — Top 10 légendes (sur 636 decks)** :
| Legend | Picks | % meta | Meilleur placement |
|--------|-------|--------|-------------------|
| Irelia | 68 | 10.7% | 3rd |
| Master Yi Bladesman | 54 | 8.5% | 13th |
| Diana | 36 | 5.7% | 2nd |
| LeBlanc | 32 | 5.0% | 6th |
| Sivir | 29 | 4.6% | — |
| Fiora | 28 | 4.4% | 30th |
| Vex | 25 | 3.9% | — |
| Sett | 24 | 3.8% | — |
| Ahri | 22 | 3.5% | — |
| Azir | 20 | 3.1% | — |

**Domains Xi'an** : Calm/Chaos 102, Calm/Body 84, Order/Body 65, Chaos/Mind 62, Order/Mind 59, Chaos/Body 55, Calm/Mind 51, Calm/Order 45, Fury/Body 33, Fury/Chaos 31, Fury/Order 25, Fury/Mind 24

### Houston Regional Qualifier (7 déc 2025, 1347 joueurs, Origins)
- **Source** : riftdecks.com — 66 decklists scrapées et parsées.
- **Set** : Origins (1er set). Organisateur : UVS Games.
- **Gagnant** : Annie, Dark Child (Dhawally) — Chaos/Fury.
- **Annie domine le top 4** : 1st (Dhawally), 3rd (Zent), Top4 (Prymor). 4/8 en top 8.
- **Kai'Sa = 30% du field** (20/66 decks) mais aucune dans le top 4. Top 8 x2.
- **Master Yi Bladesman 2nd** (Challenger TCG) — Body/Calm. 9 decks (13%).
- **Miss Fortune** 6 decks (9%) — Body/Chaos, Top 16.

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | Dhawally | Annie, Dark Child | Chaos/Fury |
| 2 | Challenger TCG | Master Yi, Wuju Bladesman | Body/Calm |
| 3 | Zent | Annie, Dark Child | Chaos/Fury |
| Top4 | Prymor | Annie, Dark Child | Chaos/Fury |
| Top8 | Mateusz Jasiński | Kai'Sa, Daughter of the Void | Fury/Mind |
| Top8 | Clyde | Master Yi, Wuju Bladesman | Body/Calm |
| Top8 | GEORGEG | Kai'Sa, Daughter of the Void | Fury/Mind |
| Top8 | Diego "NoVeggies" | Annie, Dark Child | Chaos/Fury |

**Meta Houston — Légendes (66 decks)** :
| Legend | Decks | % | Meilleur placement |
|--------|-------|---|-------------------|
| Kai'Sa | 20 | 30% | Top 8 |
| Annie | 12 | 18% | 1st |
| Master Yi | 9 | 13% | 2nd |
| Miss Fortune | 6 | 9% | Top 16 |
| Viktor | 3 | 4% | Top 64 |
| Teemo | 3 | 4% | Top 64 |
| Sett | 3 | 4% | Top 128 |
| Ahri | 2 | 3% | Top 128 |

**Domains Houston** : Fury/Mind 20 (30%), Chaos/Fury 13 (19%), Body/Calm 10 (15%), Body/Chaos 6 (9%), Mind/Order 4 (6%), Body/Order 4 (6%)

**Note historique** : Houston est un tournoi Origins (déc 2025), antérieur au set Spiritforged. Les données Houston confirment la dominance de Kai'Sa en Origins et le potentiel d'Annie comme counter-pick du méta.

### Chronologie S3 City Challenges (Unleashed)

| # | Tournoi | Date | Joueurs | Gagnant | 2nd | 3rd | Meta dominant |
|---|---------|------|---------|---------|-----|-----|---------------|
| 1 | Beijing CC | 18 avr | 128 | Fiora (Worthy) | Master Yi | Jax | Fiora 12.5% |
| 2 | Nanjing CC | 18 avr | 128 | Sett (Brawler) | Rengar | Lillia | Master Yi 12.5%, LeBlanc 11.7% |
| 3 | Shenzhen CC | 18 avr | 128 | Annie (Stubborn) | Lillia | Vex | Master Yi 11.7%, LeBlanc 10.2% |
| 4 | Shanghai CC | 19 avr | 128 | Lillia (Fae Fawn) | Diana | Draven | Lillia 14.1% |
| 5 | Guangzhou CC | 19 avr | 128 | Rengar (Trophy Hunter) | Kai'Sa | Sivir | Vex 10.9%, LeBlanc 10.2% |
| 6 | Tianjin CC | 19 avr | 128 | Fiora (Victorious) | LeBlanc | Miss Fortune | LeBlanc 13.3%, Vex 10.9% |
| 7 | Changsha CC | 19 avr | 64 | Master Yi (Tempered) | Irelia | Rengar | Vex 12.5% (0 top8) |
| 8 | Atlanta CC | 25 avr | 1832 | Annie (Stubborn) | Draven | Irelia | Draven 43.75% top16 |

**Bilan CC wins** : Fiora 2, Annie 2, Lillia 1, Rengar 1, Master Yi Bladesman 1, Sett 1

**Tendances CC S3 :**
- **LeBlanc/Vex** = les plus joués mais sous-performent en top cut (populaires, ciblés)
- **Master Yi** (Bladesman + Wuju Master combinés) = très populaire (11-12%) mais rarement gagnant, meilleur en petit tournoi. La grande majorité sont des Bladesman.
- **Fiora** = 2 wins, forte conversion malgré meta share moyen
- **Rengar** = dark horse, 2 top 3 avec faible représentation (~2-3%)
- **Annie** = faible représentation mais conversion exceptionnelle (2 wins)
- **Sett** = 1 win + 1 top4, sous-représenté mais surperformant
- **Draven Showboat** domine Atlanta (Spiritforged) avec 43.75% du top 16

### Sydney Regional Qualifier (16 mai 2026)
- **Source** : riftrank.com/tournaments/results/cmpa0ntgq0001130geyhyylii
- **Joueurs** : 1405
- **Format** : Unleashed Constructed

| Place | Joueur | Légende | Champion | Record |
|-------|--------|---------|----------|--------|
| 1 | EDG Rico1997 | Irelia, Blade Dancer | Irelia, Fervent | 14-1-1 |
| 2 | TSS SouledOut | Sivir, Battle Mistress | Sivir, Mercenary | 14-2-0 |
| 3 | nice boy | Diana, Scorn of the Moon | Diana, Lunari | 12-2-1 |
| 4 | EEP Bonk Repeat | Vex, Gloomist | Vex, Apathetic | 12-2-1 |
| 5 | Ghosterdriver | Irelia, Blade Dancer | Irelia, Fervent | - |
| 6 | AshenOCE | Teemo, Swift Scout | Teemo, Strategist | 11-2-1 |
| 7 | CTCG DZiden | LeBlanc, Deceiver | LeBlanc, Fragmented | 12-3-0 |
| 8 | CTG Alanzq | Diana, Scorn of the Moon | Diana, Lunari | - |

Stats complètes des 34 légendes dans `data/tournaments/sydney-regional.json`.
Decklists détaillées en **section 10**.

### Bologna Regional Qualifier (21 fév 2026, 1719 joueurs, Spiritforged)
- **Source** : riftdecks.com — 120 decklists scrapées et parsées.
- **Set** : Spiritforged. Organisateur : UVS Games. Premier Regional occidental du set.
- **Gagnant** : Ezreal, Prodigal Explorer (Alanzq) — Chaos/Mind.
- **Draven domine le méta** : 17/120 decks (14%), 3/8 top 8, mais ne remporte pas le tournoi.
- **Chaos omniprésent** : Chaos/Fury 23% + Calm/Chaos 13% + Chaos/Mind 10% = 46% du field.
- **28 légendes** représentées sur 120 decklists — bonne diversité.
- **Top 4 varié** : Ezreal (1st), Miss Fortune (2nd), Irelia (3rd), Viktor (Top4).

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | Alanzq1 | Ezreal, Prodigal Explorer | Chaos/Mind |
| 2 | Sebiqqqqqqqqqqqq | Miss Fortune, Bounty Hunter | Body/Chaos |
| 3 | krowz | Irelia, Blade Dancer | Calm/Chaos |
| Top4 | Ghosterdriver | Viktor, Herald of the Arcane | Mind/Order |
| Top8 | Prismaticism | Draven, Glorious Executioner | Chaos/Fury |
| Top8 | Randyyy | Draven, Glorious Executioner | Chaos/Fury |
| Top8 | M4rcus99 | Draven, Glorious Executioner | Chaos/Fury |
| Top8 | TheManLandRft | Ezreal, Prodigal Explorer | Chaos/Mind |

**Meta Bologne — Top légendes (120 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Draven | 17 | 14% |
| Irelia | 13 | 10% |
| Kai'Sa | 8 | 6% |
| Ezreal | 7 | 5% |
| Jinx | 7 | 5% |
| Jax | 5 | 4% |
| Sivir | 5 | 4% |
| Ahri | 5 | 4% |
| Teemo | 5 | 4% |
| Master Yi | 5 | 4% |

### Lille Regional Qualifier (18 avr 2026)
| Place | Légende | Record | Conversion |
|-------|---------|--------|------------|
| 1 | Azir | 14-0-2 | 22% (49→11) |
| 2 | Master Yi | 13-2-1 | 22% (95→21) |
| 3-4 | Draven | 12-2-1 | 29% (220→63) |
| 3-4 | Annie | 12-2-1 | 26% (43→11) |
| 5-8 | Irelia | 11-2-1 | 28% (253→70) |

5 légendes différentes en top 8, 5 domains. Stats détaillées dans `data/tournaments/lille-regional.json`.

### Atlanta Regional Qualifier (29 avr 2026)
| Place | Légende | Record | Global WR |
|-------|---------|--------|-----------|
| 1 | Annie | 14-1-1 | 51% (333 matchs) |
| 2 | Draven | 13-1-2 | 58% (1256 matchs) |
| 3-4 | Irelia | 12-2-1 | 54% (1060 matchs) |
| 3-4 | Ezreal | 12-2-1 | 51% (344 matchs) |
| 5-8 | Kai'Sa | 11-2-1 | 50% (619 matchs) |
| 5-8 | Sett | 11-2-1 | 44% (176 matchs) |

Dernier Regional Spiritforged. Stats détaillées dans `data/tournaments/atlanta-regional.json`.

### Fuzhou Regional Qualifier (15 jan 2026, ~800 joueurs, Spiritforged — 511 decklists)
- **Source** : riftdecks.com — 511 decklists scrapées et parsées.
- **Set** : Spiritforged. Premier Regional de l'ère Spiritforged en Chine.
- **Gagnant** : Draven, Glorious Executioner (Aipotu) — Chaos/Fury.
- **Draven = 35.8% du field** (183/511) — taux de représentation record. 4/8 top 8.
- **28 légendes** représentées.

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | Aipotu | Draven, Glorious Executioner | Chaos/Fury |
| 2 | EDG.BTM.少侠SNnnnn | Fiora, Grand Duelist | Body/Order |
| 3 | 天堂制造 | Draven, Glorious Executioner | Chaos/Fury |
| 4 | 赤月星宿 | Irelia, Blade Dancer | Calm/Chaos |
| 5 | Ai.EDG.张伯伦 | Annie, Dark Child | Chaos/Fury |
| 6 | 海盗帕奇斯 | Draven, Glorious Executioner | Chaos/Fury |
| 7 | 布启 | Draven, Glorious Executioner | Chaos/Fury |
| 8 | Trails | Irelia, Blade Dancer | Calm/Chaos |

**Meta Fuzhou — Top légendes (511 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Draven | 183 | 35.8% |
| Irelia | 62 | 12.1% |
| Kai'Sa | 39 | 7.6% |
| Viktor | 28 | 5.5% |
| Fiora | 24 | 4.7% |
| Sivir | 17 | 3.3% |
| Master Yi (Bladesman) | 16 | 3.1% |
| Azir | 12 | 2.3% |
| Sett | 12 | 2.3% |
| Ornn | 12 | 2.3% |

**Note** : Draven à 35.8% est le taux de représentation le plus élevé du dataset pour une seule légende (hors Kai'Sa en petit tournoi Origins). Confirme le statut S-Tier de Draven en Spiritforged chinois. Données dans `data/tournaments/fuzhou-regional.json` et 511 JSON dans `data/decklists/`.

---

### Suzhou Regional Qualifier (10 mai 2026, ~800 joueurs, Unleashed — 637 decklists)
- **Source** : riftdecks.com — 637 decklists scrapées et parsées.
- **Set** : Unleashed. Premier gros Regional Unleashed en Chine.
- **Gagnant** : Master Yi, Wuju Bladesman (燐川) — Body/Calm.
- **41 légendes** représentées — le méta le plus diversifié jamais enregistré.
- **6 légendes différentes en top 8**.

| Place | Joueur | Légende | Domains |
|-------|--------|---------|---------|
| 1 | 燐川 | Master Yi, Wuju Bladesman | Body/Calm |
| 2 | LineKa·OAK | Irelia, Blade Dancer | Calm/Chaos |
| 3 | 卓卡-坦尼斯 | Poppy, Keeper of the Hammer | Body/Order |
| 4 | 藏宝 嗯哼 | Sivir, Battle Mistress | Body/Chaos |
| 5 | andy1996 | Ezreal, Prodigal Explorer | Chaos/Mind |
| 6 | TXG·高远 | Ezreal, Prodigal Explorer | Chaos/Mind |
| 7 | JIYAN- YADA | Irelia, Blade Dancer | Calm/Chaos |
| 8 | 夺冠就结婚 | Sivir, Battle Mistress | Body/Chaos |

**Meta Suzhou — Top légendes (637 decks)** :
| Legend | Decks | % |
|--------|-------|---|
| Master Yi (Bladesman) | 66 | 10.4% |
| Irelia | 62 | 9.7% |
| Diana | 47 | 7.4% |
| LeBlanc | 37 | 5.8% |
| Lillia | 32 | 5.0% |
| Fiora | 26 | 4.1% |
| Vex | 23 | 3.6% |
| Viktor | 19 | 3.0% |
| Sivir | 18 | 2.8% |
| Rengar | 18 | 2.8% |
| Miss Fortune | 17 | 2.7% |
| Master Yi (Wuju Master) | 10 | 1.6% |

**Note** : Diversité record (41 légendes). Poppy 3rd avec seulement 4 decks — plus gros outlier du dataset. Ezreal 2x top 8 avec 7 decks (28.6% conversion). Wuju Master ≠ Wuju Bladesman : le vainqueur est le Bladesman d'Origins, pas la variante Unleashed. Données dans `data/tournaments/suzhou-regional.json` et 637 JSON dans `data/decklists/`.

### S3 City Challenges — Résultats détaillés

#### Beijing CC (18 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | 宝库卡牌-SBBSH-LSR | Fiora | Fiora, Worthy |
| 2 | joyspace_无极学徒赵 | Master Yi (Wuju Master) | Master Yi, Tempered |
| 3 | 斑马潮玩 w | Jax | Jax, Unmatched |
| 4 | 紫禁联合.BOT.服务区王 | Fiora | Fiora, Victorious |
| 5 | Aesir | Ornn | Ornn, Forge God |
| 6 | 白银山.绝世废物 | Vex | Vex, Apathetic |
| 7 | 叮当杨 | LeBlanc | LeBlanc, Fragmented |
| 8 | joyspace_凉笙 | Irelia | Irelia, Fervent |

Meta : Fiora 12.5%, Master Yi 9.4%, LeBlanc 8.6%, MF 8.6%, Lillia 7.8%, Irelia 7.8%. 31 légendes. Jax dark horse (1 joueur, 3rd).

#### Nanjing CC (18 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | ZL-Hasashi | Sett | Sett, Brawler |
| 2 | 雷汐 | Rengar | Rengar, Trophy Hunter |
| 3 | TXG-子都 | Lillia | Lillia, Fae Fawn |
| 4 | TXG-万舞寒天 | Sett | Sett, Brawler |
| 5 | houmaker | Master Yi | Master Yi, Tempered |
| 6 | 赛高.Pass | Master Yi | Master Yi, Tempered |
| 7 | 西柚卡牌-凌小天 | Azir | Azir, Sovereign |
| 8 | ZL-明日的晴天 | Jhin | Jhin, Meticulous Killer |

Meta : Master Yi 12.5%, LeBlanc 11.7%, Lillia 10.9%, Fiora 8.6%, Azir 7.8%, Kai'Sa 7.8%. Sett 4.7% mais 1st+4th. Kai'Sa/Ornn trap (populaires, 0 top cut).

#### Shenzhen CC (18 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | 不吃糖-羽芒 | Annie | Annie, Stubborn |
| 2 | 黄昏 | Lillia | Lillia, Fae Fawn |
| 3 | 瞌睡回忆 | Vex | Vex, Apathetic |
| 4 | PKC.老猫 | Fiora | Fiora, Victorious |
| 5 | 清鱼 | Viktor | Viktor, Leader |
| 6 | 毛豆 | Kha'Zix | Kha'Zix, Mutating Horror |
| 7 | 天自 | Diana | Diana, Lunari |
| 8 | 3323 | Volibear | Volibear, Furious |

Meta : Master Yi 11.7%, LeBlanc 10.2%, Lillia 8.6%, Vex 7.0%. Top 8 = 8 légendes différentes. Annie 3.9% mais win. Volibear surprise 8th.

#### Shanghai CC (19 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | Yankim1 | Lillia | Lillia, Fae Fawn |
| 2 | Hso.白龙万丈 | Diana | Diana, Lunari |
| 3 | GOAT-哈罗 | Draven | Draven, Audacious |
| 4 | EDG.施里特 | Lillia | Lillia, Fae Fawn |
| 5 | 酷猫.玮 | Lillia | Lillia, Fae Fawn |
| 6 | 优极客-109-Yxx | Irelia | Irelia, Fervent |
| 7 | 淘金巢.真治 | LeBlanc | LeBlanc, Everywhere at Once |
| 8 | Vent | Lucian | Lucian, Merciless |

Meta : Lillia domine (14.1%, 1st+4th+5th). Vex 9.4% (underperform, best 12th). Diana overperform (3.9%, 2nd). Lucian unique pick top 8.

#### Guangzhou CC (19 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | 我爱吃昴星团 | Rengar | Rengar, Trophy Hunter |
| 2 | LineKa·SadFox | Kai'Sa | Kai'Sa, Survivor |
| 3 | 收容所218·一凡家老王 | Sivir | Sivir, Mercenary |
| 4 | 凉生 | Pyke | Pyke, Dockside Butcher |
| 5 | LineKa·OAK | Irelia | Irelia, Fervent |
| 6 | Keria | Sett | Sett, Brawler |
| 7 | FitH.白鼠 | Vex | Vex, Apathetic |
| 8 | NGNL·雨辰 | Kai'Sa | Kai'Sa, Survivor |

Meta : Vex 10.9%, LeBlanc 10.2%, MF 8.6%. Top 8 très diversifié (7 légendes). Team LineKa domine (3 en top 10).

#### Tianjin CC (19 avr, 128 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | 流浪巫妖 | Fiora | Fiora, Victorious |
| 2 | CT-法海 | LeBlanc | LeBlanc, Fragmented |
| 3 | 门口汽水 | Miss Fortune | Miss Fortune, Captain |
| 4 | 灵花祭.ECG.陈铭 | Vex | Vex, Apathetic |
| 5 | 灵花祭.ECG.Asuka | Sett | Sett, Brawler |
| 6 | 灵花祭.ECG.半生瓜 | Vex | Vex, Apathetic |
| 7 | 灵花祭.ECG.潇洒时光 | Irelia | Irelia, Fervent |
| 8 | 决带笑 | LeBlanc | LeBlanc, Fragmented |

Meta : LeBlanc 13.3%, Vex 10.9%, MF 8.6%, Fiora 7.0%. ECG team 4 joueurs en top 8. Fiora gagne malgré 7% meta share.

#### Changsha CC (19 avr, 64 joueurs)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | 梦之星-三三 | Master Yi (Bladesman) | Master Yi, Tempered |
| 2 | 梦之星-啊а阿星 | Irelia | Irelia, Fervent |
| 3 | 梦之星-传菜员 | Rengar | Rengar, Pouncing |
| 4 | 梦之星-小乐色 | Irelia | Irelia, Fervent |
| 5 | 梦之星-Monkey | LeBlanc | LeBlanc, Everywhere at Once |
| 6 | 梦之星-黄贝 | Annie | Annie, Stubborn |
| 7 | 梦之星-大凡 | LeBlanc | LeBlanc, Fragmented |
| 8 | 风筝 | LeBlanc | LeBlanc, Fragmented |

Meta : Vex 12.5% (0 top8!), LeBlanc 9.4%, Lillia/Viktor/Kha'Zix/Fiora 7.8%. Team 梦之星 = 7/8 du top 8. Vex populaire mais complètement ciblée.

#### Atlanta CC (25 avr, 1832 joueurs — Spiritforged)
| Place | Joueur | Légende | Champion |
|-------|--------|---------|----------|
| 1 | Prismaticismism | Annie | Annie, Stubborn |
| 2 | CTCG Koko Lopez | Draven | Draven, Showboat |
| 3 | HaruKaze | Irelia | Irelia, Fervent |
| 4 | CTG Alanzq | Ezreal | Ezreal, Prodigy |
| 5 | Frosty | Kai'Sa | Kai'Sa, Survivor |
| 6 | Boulevard | Draven | Draven, Showboat |
| 7 | CTCG Collin K | Sett | Sett, Kingpin |
| 8 | StarDust | Draven | Draven, Showboat |

Meta top 16 : Draven 43.75% (7/16), Master Yi 18.75%, Irelia 12.5%. Annie gagne malgré 1 seul en top 16. Format Spiritforged = Draven dominant.

## 6b. Decklists — City Challenges

### CC Guangzhou 1st — 我爱吃昴星团 — Rengar, Pridestalker / Rengar, Trophy Hunter
**Runes** : Body x6, Fury x6

| Qte | Carte | Type |
|-----|-------|------|
| 3 | Thrill of the Hunt | Spell |
| 3 | Inferna | Unit |
| 3 | Irresistible Faefolk | Unit |
| 3 | Grim Apothecary | Unit |
| 3 | Nidalee, Cat Form | Unit |
| 3 | Kai'Sa, Survivor | Unit |
| 3 | Noxus Hopeful | Unit |
| 2 | Seal of Strength | Spell |
| 2 | Repulse | Spell |
| 2 | Challenge | Spell |
| 2 | Fresh Beans | Spell |
| 2 | Pit Rookie | Unit |
| 2 | Rengar, Pouncing | Unit |
| 2 | Rengar, Trophy Hunter | Unit |
| 2 | Ferrous Forerunner | Unit |
| 1 | Punch First | Spell |
| 1 | Brynhir Thundersong | Unit |

**Side** : Akshan, Mischievous x3, Unyielding Spirit x3, Brynhir Thundersong x1, Punch First x1
**Battlefields** : Emperor's Dais, Star Spring, Treasure Hoard

---

### CC Changsha 1st — 梦之星-三三 — Master Yi, Wuju Bladesman / Master Yi, Tempered
**Runes** : Body x7, Calm x5

| Qte | Carte |
|-----|-------|
| 3 | Charm |
| 3 | Defy |
| 3 | En Garde |
| 3 | Discipline |
| 3 | Lonely Poro |
| 3 | Scuttle Crab |
| 3 | Zhonya's Hourglass |
| 3 | First Mate |
| 3 | Rengar, Trophy Hunter |
| 2 | Punch First |
| 2 | Doran's Blade |
| 2 | Ruin Runner |
| 1 | Alpha Strike |
| 1 | Back Off |
| 1 | Find Your Center |
| 1 | Nami, Headstrong |
| 1 | Trinity Force |
| 1 | Whiteflame Protector |

**Side** : Sabotage x2, Adaptatron x1, Akshan Mischievous x1, Back Off x1, Lucian Merciless x1, Nami Headstrong x1, Ruin Runner x1
**Battlefields** : Seat of Power, Star Spring, Zaun Warrens

---

### CC Changsha 2nd — Irelia, Blade Dancer / Irelia, Fervent
**Runes** : Calm x6, Chaos x6

| Qte | Carte |
|-----|-------|
| 3 | Defiant Dance |
| 3 | Defy |
| 3 | Discipline |
| 3 | Lonely Poro |
| 3 | Scuttle Crab |
| 2 | Charm |
| 2 | En Garde |
| 2 | Zhonya's Hourglass |
| 2 | Boots of Swiftness |
| 2 | Find Your Center |
| 2 | Star-Crossed |
| 2 | Tasty Faefolk |
| 2 | Vex, Apathetic |
| 1 | Gust |
| 1 | Stacked Deck |
| 1 | Hard Bargain |
| 1 | Not So Fast |
| 1 | Invert Timelines |
| 1 | Tricksy Tentacles |
| 1 | Irelia, Fervent |

**Side** : Baron Nashor x3, Invert Timelines x2, Factory Recall x2, Find Your Center x1
**Battlefields** : Abandoned Hall, Aspirant's Climb, Sunken Temple

---

### CC Changsha 3rd — Rengar, Pridestalker / Rengar, Pouncing
**Runes** : Fury x7, Body x5

| Qte | Carte |
|-----|-------|
| 3 | Inferna |
| 3 | Irresistible Faefolk |
| 3 | Pit Rookie |
| 3 | Thrill of the Hunt |
| 3 | First Mate |
| 3 | Pyke, Dockside Butcher |
| 3 | Noxus Hopeful |
| 3 | Rengar, Trophy Hunter |
| 2 | Cleave |
| 2 | Determined Sentry |
| 2 | Confront |
| 2 | Lucian, Merciless |
| 2 | Nidalee, Cat Form |
| 2 | Rengar, Pouncing |
| 2 | Right of Conquest |
| 1 | Rengar, Unseen |

**Side** : Unyielding Spirit x3, Lotus Trap x2, Sabotage x2, Right of Conquest x1
**Battlefields** : Seat of Power, Star Spring, Zaun Warrens

---

### CC Changsha 5th — LeBlanc, Deceiver / LeBlanc, Everywhere at Once
**Runes** : Mind x6, Order x6

| Qte | Carte |
|-----|-------|
| 3 | Sacrifice |
| 3 | Cull the Weak |
| 3 | Hidden Blade |
| 3 | Soaring Scout |
| 3 | Watchful Sentry |
| 3 | Karthus, Eternal |
| 3 | LeBlanc, Fragmented |
| 3 | Glasc Mixologist |
| 3 | Ruined Rex |
| 2 | Deathgrip |
| 2 | Honest Broker |
| 2 | Mirror Image |
| 2 | Vi, Peacekeeper |
| 2 | Thousand-Tailed Watcher |
| 1 | Salvage |
| 1 | Shadow's Call |

**Side** : Singularity x2, Blastcone Fae x1, Mirror Image x1, Salvage x1, Shadow's Call x1, The Ruination x1, Unchecked Power x1
**Battlefields** : Dusk Rose Lab, Forbidding Waste, Windswept Hillock

---

### CC Changsha 6th — Annie, Dark Child / Annie, Stubborn
**Runes** : Chaos x6, Fury x6

| Qte | Carte |
|-----|-------|
| 3 | Stacked Deck |
| 3 | Traveling Merchant |
| 3 | Grim Apothecary |
| 3 | Rengar, Pouncing |
| 3 | Sneaky Deckhand |
| 3 | Kai'Sa, Survivor |
| 3 | Ferrous Forerunner |
| 2 | Gust |
| 2 | Against the Odds |
| 2 | Evelynn, Entrancing |
| 2 | Teemo, Scout |
| 2 | Tideturner |
| 2 | Star-Crossed |
| 2 | Vex, Apathetic |
| 2 | Mindsplitter |
| 1 | Abandon |
| 1 | Flash |

**Side** : Switcheroo x2, Abandon x1, Flash x1, Gust x1, Mindsplitter x1, Star-Crossed x1, Vex Apathetic x1
**Battlefields** : Grove of the God-Willow, Startipped Peak, Windswept Hillock

## 7. Deckbuilding basics

### Structure standard
- 1 Legend → définit les 2 domains
- 1 Champion Unit → déclarée avant la partie
- 40 cartes Main Deck → unités, sorts, gears
- 12 Runes → typiquement 6+6 matching les domains
- 3 Battlefields → choisis stratégiquement

### Courbe de mana
- Tours 1-3 : cartes 1-3 energy pour stabiliser
- Tours 4-6 : menaces principales 4-6 energy
- 7+ : win conditions ou bombes (Aurora à 9)

### Conseils
- Plan de jeu clair (aggro/midrange/control/combo)
- Removal interactif obligatoire
- Sorts réaction cruciaux
- Tester le mulligan : main de 4 cartes doit faire quelque chose avant T3

## 8. Glossaire FR

| Terme EN | FR | Définition |
|----------|-----|------------|
| Legend | Légende | Leader permanent du joueur |
| Champion Unit | Unité Champion | Unité spéciale déclarée avant la partie |
| Battlefield | Champ de bataille | Zone contestée |
| Conquer | Conquête / Conquérir | Gagner le combat à un BF (+1 point) |
| Hold | Contrôle | Contrôler un BF conquis au début du tour (+1/BF) |
| Showdown | Combat | Étape de combat (règle 316.4). « Confrontation » = l'affrontement complet sur un BF |
| Rune | Rune | Carte du Rune Deck générant Energy ou Power |
| Energy | Énergie | Ressource via exhaust d'une rune |
| Power | Puissance (ressource) | Ressource via recycle d'une rune du bon domain |
| Might | Puissance | Stat offensive/défensive d'une unité (PAS « Force ») |
| Exhaust | Épuiser | Tourner une carte |
| Ready | Préparer | Rendre une carte de nouveau disponible |
| Recycle | Recycler | Rune sous le deck pour du Power |
| Domain | Domaine | Furie/Calme/Esprit/Corps/Chaos/Ordre |
| Deflect | Protection | L'adversaire paie extra pour cibler |
| Deathknell | Agonie | Trigger à la mort |
| Ganking | Gank | Mouvement entre BF pour attaquer (PAS « Embuscade ») |
| Ambush | Embuscade | Jouer sur un BF où vous avez déjà des unités, même en Réaction |
| Hunt | Chasse | Gain d'XP en combat (Unleashed) |
| Hidden | Caché / Cacher | Carte face cachée, révélable |
| Weaponmaster | Expert en armes | Attacher un équipement à coût réduit |
| Quick-Draw | Dégainer | Équipement auto-attaché en Réaction |
| Backline | Arrière-ligne | Reçoit les dégâts létaux en dernier |
| Level | Niveau | Capacité à seuil d'XP |
| Predict | Prédiction | Regarder N cartes du dessus, réordonner/recycler |
| Trash | Défausse | Cimetière/défausse (PAS « Poubelle ») |
| Side Deck | Réserve | Cartes d'échange en Bo3 |

> Source officielle : « Règles du jeu de Riftbound » (FR, MAJ 30/03/2026), cf. `data/riftbound-rules-fr-source.md`. Mots-clés officiels = règles 805-826. « Atout » n'existe pas (seuls Action 806 et Réaction 813).

## 9. Roadmap 2026

### Sets
| Set | Nom | Release Chine | Release Global | Pre-Rift |
|-----|-----|--------------|----------------|----------|
| 1 | Origins | 2025 | 2025 | — |
| 2 | Spiritforged | Jan 2026 | 13 fév 2026 | 6-12 fév |
| 3 | Unleashed | 10 avr 2026 | 8 mai 2026 | 1-7 mai |
| 4 | Vendetta | Mi-juil 2026 | 31 juil 2026 | 24-30 juil |
| 5 | Radiance | — | 23 oct 2026 | 16-22 oct |

### Regional Qualifiers 2026
| Date | Ville | Statut |
|------|-------|--------|
| 20-22 fév | Bologna, Italie | ✅ Terminé |
| 27 fév-1 mars | Las Vegas, USA | ✅ Terminé |
| 17-19 avr | Lille, France | ✅ Terminé |
| 24-26 avr | Atlanta, USA | ✅ Terminé |
| 15-17 mai | Sydney, Australie | ✅ Terminé |
| 29-31 mai | Vancouver, Canada | À venir |
| 12-14 juin | Utrecht, Pays-Bas | À venir |
| 19-21 juin | Hartford, USA | À venir |
| 21-23 août | Barcelona, Espagne | À venir |
| 4-6 sept | Singapore | À venir |
| 25-27 sept | Los Angeles, USA | Dernier RQ 2026 |

### Événements clés à venir
- **Vancouver RQ** (29-31 mai) — prochain Regional
- **Vendetta previews** : 22 juin
- **French release** : prévu mi-2026 (pas de date exacte)
- **State of the Game #2** : août 2026
- **Regional Championships NA & EMEA** : dates à annoncer

### Conventions
- PAX East (26-30 mars) ✅
- Dreamhack Birmingham (28-30 mars) ✅
- LVL Up Expo (24-26 avr) ✅
- MomoCon (21-24 mai) ✅
- Gen Con Indy (30 juil-2 août)
- Dreamhack Stockholm (27-29 nov)
- PAX Unplugged (4-6 déc)

## 10. Decklists — Sydney Regional Qualifier Top 8

> Source : riftrank.com (fetchées le 23 mai 2026)

### 1st — EDG Rico1997 — Irelia, Blade Dancer / Irelia, Fervent
**Domains** : Calm/Chaos | **Runes** : 6x Calm, 6x Chaos

| Qte | Carte | Rôle |
|-----|-------|------|
| 3 | Defiant Dance | Spell |
| 3 | Defy | Spell |
| 3 | Discipline | Spell |
| 3 | Guardian Angel | Gear |
| 3 | Scuttle Crab | Unit |
| 3 | Tideturner | Unit |
| 3 | Boots of Swiftness | Gear |
| 3 | Stellacorn Herder | Unit |
| 2 | Charm | Spell |
| 2 | En Garde | Spell |
| 2 | Stacked Deck | Gear |
| 2 | Not So Fast | Spell |
| 2 | Ride the Wind | Spell |
| 2 | Star-Crossed | Unit |
| 1 | Gust | Spell |
| 1 | Fizz, Trickster | Unit |
| 1 | Adaptatron | Unit |

**Battlefields** : Abandoned Hall, Sunken Temple, Targon's Peak

---

### 2nd — TSS SouledOut — Sivir, Battle Mistress / Sivir, Mercenary
**Domains** : Body/Chaos | **Runes** : 6x Body, 6x Chaos

| Qte | Carte |
|-----|-------|
| 3 | Flurry of Blades |
| 3 | Gust |
| 3 | Sabotage |
| 3 | Scryer's Bloom |
| 3 | Stacked Deck |
| 3 | Mobilize |
| 3 | Treasure Trove |
| 3 | Lunar Boon |
| 3 | Catalyst of Aeons |
| 3 | Dazzling Aurora |
| 3 | Elder Dragon |
| 2 | Pack of Wonders |
| 2 | Last Rites |
| 1 | Disposal Order |
| 1 | Mindsplitter |

**Battlefields** : Aspirant's Climb, Forgotten Monument, Sigil of the Storm

**Note** : Deck Aurora (Dazzling Aurora + Elder Dragon = package 9-cost). Body/Chaos avec ramp (Catalyst, Lunar Boon).

---

### 3rd — nice boy — Diana, Scorn of the Moon / Diana, Lunari
**Domains** : Chaos/Mind | **Runes** : 6x Chaos, 6x Mind

| Qte | Carte |
|-----|-------|
| 3 | Gust |
| 3 | Stacked Deck |
| 3 | Stupefy |
| 3 | Frigid Jewel |
| 3 | Ravenbloom Student |
| 3 | Ride the Wind |
| 3 | Tideturner |
| 3 | Hwei, Brooding Painter |
| 2 | Flash |
| 2 | Moonfall |
| 2 | Star-Crossed |
| 2 | Fizz, Trickster |
| 1 | Hard Bargain |
| 1 | Smoke Screen |
| 1 | Last Rites |
| 1 | Fading Memories |
| 1 | Vex, Apathetic |
| 1 | Vex, Cheerless |
| 1 | Mindsplitter |

**Battlefields** : Abandoned Hall, Ravenbloom Conservatory, Targon's Peak

**Note** : Aggro-tempo Diana. Hwei en win con, Vex en splash 1-of. Beaucoup de réaction (Stupefy, Flash, Ride the Wind).

---

### 4th — EEP Bonk Repeat — Vex, Gloomist / Vex, Apathetic
**Domains** : Calm/Chaos | **Runes** : 7x Chaos, 5x Calm

| Qte | Carte |
|-----|-------|
| 3 | Discipline |
| 3 | Emperor's Divide |
| 3 | Evelynn, Entrancing |
| 3 | Mutated Mouser |
| 3 | Teemo, Scout |
| 2 | Defy |
| 2 | Existential Dread |
| 2 | Gust |
| 2 | Treasure Hunter |
| 2 | Back Off |
| 2 | Boots of Swiftness |
| 2 | Edge of Night |
| 2 | Pyke, Returned |
| 2 | Ember Monk |
| 2 | Kha'Zix, Mutating Horror |
| 2 | Sona, Harmonious |
| 1 | Switcheroo |
| 1 | Star-Crossed |

**Battlefields** : Bandle Tree, Star Spring, Startipped Peak

**Note** : Hold-control Vex. Beaucoup de 2-of = deck très flexible. Teemo, Evelynn, Kha'Zix en value engine.

---

### 5th — Ghosterdriver — Irelia, Blade Dancer / Irelia, Fervent
**Domains** : Calm/Chaos | **Runes** : 6x Calm, 6x Chaos

| Qte | Carte |
|-----|-------|
| 3 | Defiant Dance |
| 3 | Defy |
| 3 | Discipline |
| 3 | Lonely Poro |
| 3 | Tideturner |
| 3 | Stellacorn Herder |
| 2 | Charm |
| 2 | En Garde |
| 2 | Ride the Wind |
| 2 | Boots of Swiftness |
| 2 | Vex, Apathetic |
| 1 | Gust |
| 1 | Flash |
| 1 | Guardian Angel |
| 1 | Hard Bargain |
| 1 | Zhonya's Hourglass |
| 1 | Back Off |
| 1 | Edge of Night |
| 1 | Sneaky Deckhand |
| 1 | Star-Crossed |
| 1 | Mindsplitter |

**Battlefields** : Abandoned Hall, Sunken Temple, Targon's Peak

**Note** : Variante Irelia avec Lonely Poro (3x), plus de 1-of tech que Rico. Vex splash 2-of.

---

### 6th — AshenOCE — Teemo, Swift Scout / Teemo, Strategist
**Domains** : Mind/Chaos | **Runes** : 7x Mind, 5x Chaos

| Qte | Carte |
|-----|-------|
| 3 | Sprite Fountain |
| 3 | Switcheroo |
| 3 | Teemo, Scout |
| 3 | Tideturner |
| 3 | Windsinger |
| 3 | Sprite Call |
| 3 | Consult the Past |
| 3 | Nocturne, Horrifying |
| 2 | Existential Dread |
| 2 | Bone Skewer |
| 2 | Guerilla Warfare |
| 2 | Teemo, Strategist |
| 2 | Sneaky Deckhand |
| 1 | Abandon |
| 1 | Evelynn, Entrancing |
| 1 | Ride the Wind |
| 1 | Singularity |
| 1 | Baron Nashor |

**Battlefields** : Grove of the God-Willow, Startipped Peak, The Arena's Greatest

**Note** : Build Sprite (Fountain + Call) + Nocturne finisher. Unique deck Teemo en top 8 malgré 44% WR global.

---

### 7th — CTCG DZiden — LeBlanc, Deceiver / LeBlanc, Fragmented
**Domains** : Mind/Order | **Runes** : 8x Order, 4x Mind

| Qte | Carte |
|-----|-------|
| 3 | Sacrifice |
| 3 | Soaring Scout |
| 3 | Watchful Sentry |
| 3 | Baited Hook |
| 3 | Black Rose Dignitary |
| 3 | Karthus, Eternal |
| 3 | Mirror Image |
| 3 | Glasc Mixologist |
| 3 | Ruined Rex |
| 3 | Harnessed Dragon |
| 3 | Rift Herald |
| 2 | Hidden Blade |
| 2 | Galio, Indefatigable |
| 1 | Vi, Peacekeeper |
| 1 | Thousand-Tailed Watcher |

**Side Deck** : 3x Ashe, Focused — 2x Vi, Peacekeeper — 1x Atakhan — 1x LeBlanc, Everywhere at Once — 1x Turn to Dust

**Battlefields** : Aspirant's Climb, Star Spring, Windswept Hillock

**Note** : Deathknell engine classique (Karthus, Mirror Image, Sacrifice). Seul deck du top 8 avec un sideboard complet.

---

### 8th — CTG Alanzq — Diana, Scorn of the Moon / Diana, Lunari
**Domains** : Chaos/Mind | **Runes** : 7x Chaos, 5x Mind

| Qte | Carte |
|-----|-------|
| 3 | Stacked Deck |
| 3 | Stupefy |
| 3 | Flash |
| 3 | Ravenbloom Student |
| 3 | Tideturner |
| 3 | Moonfall |
| 3 | Vex, Apathetic |
| 3 | Hwei, Brooding Painter |
| 2 | Abandon |
| 2 | Ride the Wind |
| 2 | Star-Crossed |
| 2 | Vex, Cheerless |
| 1 | Existential Dread |
| 1 | Plundering Poro |
| 1 | Eclipse |
| 1 | Thousand-Tailed Watcher |

**Side Deck** : 3x Sprite Fountain — 3x Turn to Dust — 1x Baron Nashor — 1x Star-Crossed

**Battlefields** : Abandoned Hall, Startipped Peak, Targon's Peak

**Note** : Version plus agressive que nice boy (3x Moonfall, 3x Vex Apathetic). Plus de Vex splash = sous-thème Chaos/Mind hybride.

---

### Analyse meta Sydney — Observations clés

**Cartes omniprésentes (5+ decks sur 8)** :
- Tideturner (7/8) — unit auto-include toutes couleurs
- Gust (5/8) — réaction universelle
- Stacked Deck (5/8) — draw engine Chaos
- Star-Crossed (6/8) — unit flex

**Archétypes représentés** :
- **Irelia tempo** (2 decks, 1st + 5th) — Calm/Chaos, beaucoup de réaction, Defiant Dance + Discipline core
- **Diana aggro-tempo** (2 decks, 3rd + 8th) — Chaos/Mind, Hwei finisher, Vex splash
- **Sivir Aurora ramp** (1 deck, 2nd) — Body/Chaos, Dazzling Aurora build-around
- **Vex hold-control** (1 deck, 4th) — Calm/Chaos, flexible 2-of spread
- **Teemo sprites** (1 deck, 6th) — Mind/Chaos, Nocturne finisher
- **LeBlanc Deathknell** (1 deck, 7th) — Mind/Order, Karthus engine

**Battlefields populaires** :
- Targon's Peak (5/8), Abandoned Hall (4/8), Startipped Peak (3/8), Sunken Temple (2/8)

**Tendances** :
- Chaos est dans 7/8 decks du top 8 — domain dominant
- Calm est dans 4/8, Mind dans 4/8
- Body seulement dans Sivir — mais c'est le 2nd place
- Order seulement dans LeBlanc
- Fury absent du top 8 — Draven/Rengar en chute post-Unleashed

---

## Sources
- **riftbound.gg** : 32 pages récupérées via curl (17 guides, 7 meta reports, 3 tournois, 1 analyse post-ban, sitemap)
- Raw data dans `data/raw/` (27 fichiers .txt)
- JSON structuré dans `data/fiches/` (17 légendes), `data/meta-reports/` (7), `data/tournaments/` (3)

### Meta reports JSON
| Fichier | Période | Date |
|---------|---------|------|
| `origins-final.json` | Origins final (avant Spiritforged) | Déc 2025 |
| `spiritforged-post-chengdu.json` | Post Fuzhou & Chengdu | Jan 2026 |
| `spiritforged-post-chinese-regionals.json` | Post 4 regionals chinois | Fév 2026 |
| `spiritforged-post-vegas.json` | Post Bologna & Vegas | Mars 2026 |
| `spiritforged-post-ban.json` | Post Ban List (analyse) | Avr 2026 |
| `unleashed-pre-regionals.json` | Unleashed City Challenges | Mai 2026 |
| `unleashed-post-sydney.json` | Post Sydney & Suzhou | Mai 2026 |
| `unleashed-tier-list-vancouver-2026-05-28.json` | Pre-Vancouver Tier List (Den/riftbound.gg) | 28 mai 2026 |

### Tournois JSON (data/tournaments/)
| Fichier | Tournoi | Date | Decklists |
|---------|---------|------|-----------|
| `guangzhou-regional-open.json` | Guangzhou RO (top 8) | Août 2025 | 8 |
| `guangzhou-regional-open-full.json` | Guangzhou RO (complet) | Août 2025 | 501 |
| `beijing-regional-open-day1.json` | Beijing RO Day 1 | Août 2025 | 7 |
| `beijing-regional-open-day2.json` | Beijing RO Day 2 | Août 2025 | 505 |
| `chongqing-regional-open.json` | Chongqing RO (top 8) | Sept 2025 | 8 |
| `chongqing-regional-open-full.json` | Chongqing RO (complet) | Sept 2025 | 499 |
| `shanghai-national-open.json` | Shanghai NO | Nov 2025 | 1984 |
| `shanghai-city-challenge.json` | Shanghai CC | Nov 2025 | 128 |
| `houston-rq.json` | Houston RQ | Déc 2025 | 66 |
| `s2-shenzhen-national-open.json` | S2 Shenzhen NO | Mars 2026 | 2041 |
| `bologna-rq.json` | Bologna RQ | Fév 2026 | 120 |
| `las-vegas-rq.json` | Las Vegas RQ | Mars 2026 | 129 |
| `lille-rq.json` + `lille-regional.json` | Lille RQ | Avr 2026 | 63 |
| `atlanta-rq.json` + `atlanta-regional.json` | Atlanta RQ | Avr 2026 | 145 |
| `fuzhou-regional.json` | Fuzhou RQ | Jan 2026 | 511 |
| `suzhou-regional.json` | Suzhou RQ | Mai 2026 | 637 |
| `sydney-regional.json` | Sydney RQ | Mai 2026 | — (stats only) |
| `s3-xian-regional-open.json` | S3 Xi'an RO | Mai 2026 | 636 |

### Articles et PDFs bruts (data/meta-reports/)
| Fichier | Contenu |
|---------|---------|
| `xian-regional-qualifier.md` | Article Xi'an RO (riftbound.gg, scrape Firecrawl) |
| `tier-list-unleashed-vancouver.md` | Tier list pre-Vancouver (riftbound.gg, scrape Firecrawl) |
| `OGN-TrialDeck-HowtoPlay_fr_FR.pdf` | Règles Trial Deck en français (UVS Games) |
| `riftbound-rules-rgpub.pdf` | Comprehensive Rules 98 pages (Riot, 2026-03-30) |

### Sources externes tentées
| Source | Résultat |
|--------|----------|
| **riftbound.gg** | ✅ Source principale. 32 pages extraites. |
| **mobalytics.gg/riftbound** | ⚠️ Accessible mais app JS — trending decks/tier list non extractables via curl |
| **riftboundstats.com** | ⚠️ App JS — "#1 Competitive Riftbound Database" mais contenu dynamique |
| **riftdecks.com** | ✅ Scraping via Firecrawl. 7987 decklists extraites au total (20 tournois) |
