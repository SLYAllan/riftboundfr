# META-KNOWLEDGE.md — Riftbound Game Intelligence
> Mis à jour le 17 août 2026 (v8). **Corpus Vendetta porté à 1671 decklists sur 15 tournois** (ajout des City Challenge de Shanghai, Shenyang, Qingdao et Tianjin du 16 août). Le field, les conversions, les résultats par tournoi et la tier list Vendetta en base sont recalculés sur ce corpus. Cores par Légende refaits sur les listes réelles dans DECKBUILDING-RULES.md (17 Légendes vues au moins trente fois, contre 8 auparavant).
> Mis à jour le 25 juin 2026 (v7). **Analyse de 84 VOD compétitives** (RunesAndRift + RiftlabTCG : casts de rounds/finales, guides « How to Play », tier lists, deck profiles, mises à jour de règles), **reformulée en français** (matière privée, aucune citation — copyright). Apports : tier consensuel des casters, ~40 matchups détaillés, cores/tech des 22 Légendes, surveillance ban (avis casters) et mises à jour de règles/format. **Source de vérité fusionnée : `data/video-insights/unleashed-vod-synthesis-2026-06.md`.** Distillé dans la section « Juin 2026 (v7) — Analyse VOD » ci-dessous. Avis de tier éditoriaux (pas data-backed) ; aucune decklist créée à partir des VOD.
> Mis à jour le 25 juin 2026 (v6). **Intégration des 4 sources éditoriales riftbound.gg** (par Den) : recaps **Utrecht** (Azir/Squirtle) et **Hartford** (Master Yi/Factor, dernier RQ Unleashed), + deux tier lists hebdo (**« Tianjin Shakes the Power Rankings »** post-Tianjin, **« One More Regional Until Vendetta »** post-Changsha/Utrecht). Ajouts : **dernière tier list éditoriale riftbound.gg (Tier 1-5 avec paires de domaines)** et **dataset des win rates globaux du set Unleashed** (recap Hartford, ~40 légendes). Voir la section « Juin 2026 — Tier lists riftbound.gg (Tianjin → Vendetta) ». Corrections de paires de domaines reportées dans DECKBUILDING-RULES.md (v6).
> Mis à jour le 8 juin 2026 (v4). **≈19 330 decks sur 89 tournois** en base. Ajout v4 : **S3 Tianjin Regional Open (Unleashed, 640 joueurs, 638 decklists)** → **Unleashed 5 105 classés** (39 lég). Best of Tianjin (39 légendes, article + decks) + tier lists Unleashed/Globale recalculés. **Vainqueur : Master Yi, Wuju Bladesman** (陈千语), Diana 2e, Rek'sai 3e (surprise), Pyke 4e. ⚠️ Correction v4 : « Master Yi, Wuju Master » était une mauvaise classification (fallback set==Unleashed) — preuve par image que les champions Master Yi appartiennent à Wuju Bladesman ; ~395 decks reclassés, « Wuju Master » retiré des tier lists.
> Mis à jour le 31 mai 2026 (v3). **18 652 decks sur 88 tournois** en base. Ajouts v3 : **25 S3 City Challenges (Unleashed)** + Hangzhou RO (Origins) + 21 anciennes City Challenges (Origins) = +6 298 decks. Répartition par set : **Origins 6 799 classés** (16 légendes), **Spiritforged 7 294** (29 lég), **Unleashed (v3) 4 501** (41 lég). DECKBUILDING-RULES.md + tier list DB (Origins/Spiritforged/Unleashed/Globale) recalculés sur ces données. Légendes en DB normalisées en virgule canonique (40 distinctes, Master Yi = 2 légendes légitimes).

## Vendetta (S4) — corpus compétitif vérifié au 17 août 2026

> Analyse produite par `scripts/analyze-vendetta-meta.ts` sur **1671 decklists publiées, complètes et seedées**, réparties sur **15 contextes DB** (ajout des City Challenge de Shanghai, Shenyang, Qingdao et Tianjin du 16 août : 123, 122, 103 et 93 decklists complètes). Les sources partielles restantes sont conservées dans les rapports `*-rejected.json` et ne sont pas incluses. Cette section décrit les résultats observés ; elle ne constitue pas encore une tier list éditoriale.

### Méthode et limites

Le corpus comprend uniquement les decks `published` avec `setTag = Vendetta` et un `tournamentContext` non nul. Les placements sont lus depuis le champ DB `placement` ; le Top 8 correspond à un placement numérique inférieur ou égal à 8, et une victoire à la première place. Les decks ont été retenus par le pipeline d'intégrité Vendetta : 39 cartes principales, 1 champion, 12 runes, 3 champs de bataille et exactement 10 cartes de réserve.

Les statistiques ne mesurent ni les résultats de rondes, ni les matchups, ni les cartes jouées. Elles ne permettent donc pas encore de déduire des cores ou des règles de construction. Les petits échantillons sont très instables : une seule place en Top 8 peut donner un taux élevé à une légende jouée quatre ou cinq fois. Les tournois n'ont pas tous le même nombre de decklists publiées, et Ottawa ne compte que 38 listes complètes sur 525 pages publiées. Aucune tier list ne doit être attribuée automatiquement depuis ces chiffres.

### Field complet

| Légende | Decks | Field | Top 8 | Conversion | Victoires | Tournois |
|---|---:|---:|---:|---:|---:|---:|
| Master Yi, Wuju Bladesman | 192 | 11,49 % | 21 | 10,94 % | 3 | 15 |
| Kai'Sa, Daughter of the Void | 189 | 11,31 % | 14 | 7,41 % | 2 | 14 |
| Kennen, Heart of the Tempest | 162 | 9,69 % | 20 | 12,35 % | 1 | 15 |
| Irelia, Blade Dancer | 134 | 8,02 % | 9 | 6,72 % | 0 | 15 |
| Nasus, Curator of the Sands | 86 | 5,15 % | 4 | 4,65 % | 2 | 15 |
| Diana, Scorn of the Moon | 84 | 5,03 % | 6 | 7,14 % | 3 | 14 |
| Rek'sai, Void Burrower | 77 | 4,61 % | 8 | 10,39 % | 0 | 15 |
| Akali, Rogue Assassin | 74 | 4,43 % | 0 | 0,00 % | 0 | 15 |
| Jayce, Defender of Tomorrow | 72 | 4,31 % | 3 | 4,17 % | 0 | 15 |
| Fiora, Grand Duelist | 54 | 3,23 % | 5 | 9,26 % | 1 | 15 |
| Draven, Glorious Executioner | 51 | 3,05 % | 5 | 9,80 % | 1 | 15 |
| Viktor, Herald of the Arcane | 46 | 2,75 % | 2 | 4,35 % | 0 | 12 |
| Azir, Emperor of the Sands | 37 | 2,21 % | 4 | 10,81 % | 1 | 15 |
| Mel, Soul's Reflection | 37 | 2,21 % | 0 | 0,00 % | 0 | 14 |
| Lillia, Bashful Bloom | 35 | 2,09 % | 3 | 8,57 % | 0 | 13 |
| Ezreal, Prodigal Explorer | 34 | 2,03 % | 3 | 8,82 % | 0 | 14 |
| LeBlanc, Deceiver | 34 | 2,03 % | 2 | 5,88 % | 0 | 14 |
| Ornn, Fire Below the Mountain | 27 | 1,62 % | 3 | 11,11 % | 0 | 13 |
| Pyke, Bloodharbor Ripper | 24 | 1,44 % | 0 | 0,00 % | 0 | 13 |
| Rengar, Pridestalker | 22 | 1,32 % | 1 | 4,55 % | 1 | 13 |
| Vex, Gloomist | 22 | 1,32 % | 1 | 4,55 % | 0 | 9 |
| Zed, Master of Shadows | 19 | 1,14 % | 0 | 0,00 % | 0 | 11 |
| Kha'Zix, Voidreaver | 17 | 1,02 % | 1 | 5,88 % | 0 | 13 |
| Ambessa, Matriarch of War | 13 | 0,78 % | 1 | 7,69 % | 0 | 9 |
| Lux, Lady of Luminosity | 10 | 0,60 % | 1 | 10,00 % | 0 | 8 |
| Jax, Grandmaster At Arms | 10 | 0,60 % | 0 | 0,00 % | 0 | 7 |
| Sivir, Battle Mistress | 9 | 0,54 % | 1 | 11,11 % | 0 | 8 |
| Leona, Radiant Dawn | 9 | 0,54 % | 0 | 0,00 % | 0 | 6 |
| Rumble, Mechanized Menace | 9 | 0,54 % | 0 | 0,00 % | 0 | 8 |
| Shen, Eye of Twilight | 8 | 0,48 % | 0 | 0,00 % | 0 | 7 |
| Sett, The Boss | 8 | 0,48 % | 0 | 0,00 % | 0 | 5 |
| Master Yi, Wuju Master | 7 | 0,42 % | 0 | 0,00 % | 0 | 5 |
| Volibear, Relentless Storm | 6 | 0,36 % | 1 | 16,67 % | 0 | 4 |
| Annie, Dark Child | 6 | 0,36 % | 0 | 0,00 % | 0 | 5 |
| Renekton, Butcher of the Sands | 6 | 0,36 % | 0 | 0,00 % | 0 | 5 |
| Jhin, Virtuoso | 6 | 0,36 % | 0 | 0,00 % | 0 | 4 |
| Ivern, Green Father | 5 | 0,30 % | 0 | 0,00 % | 0 | 5 |
| Lucian, Purifier | 5 | 0,30 % | 0 | 0,00 % | 0 | 5 |
| Vi, Piltover Enforcer | 5 | 0,30 % | 0 | 0,00 % | 0 | 4 |
| Teemo, Swift Scout | 4 | 0,24 % | 0 | 0,00 % | 0 | 4 |
| Yasuo, Unforgiven | 4 | 0,24 % | 0 | 0,00 % | 0 | 3 |
| Renata Glasc, Chem-Baroness | 3 | 0,18 % | 0 | 0,00 % | 0 | 3 |
| Darius, Hand of Noxus | 2 | 0,12 % | 0 | 0,00 % | 0 | 2 |
| Jinx, Loose Cannon | 2 | 0,12 % | 0 | 0,00 % | 0 | 2 |
| Ahri, Nine-Tailed Fox | 2 | 0,12 % | 0 | 0,00 % | 0 | 2 |
| Miss Fortune, Bounty Hunter | 2 | 0,12 % | 0 | 0,00 % | 0 | 2 |
| Poppy, Keeper of the Hammer | 1 | 0,06 % | 0 | 0,00 % | 0 | 1 |

Total : **1671 decks, 119 places en Top 8 et 15 victoires réparties entre 9 légendes**. Les taux de field sont arrondis à deux décimales.

### Top 8, conversion et victoires

Le Top 8 est mené en volume par **Master Yi, Wuju Bladesman** (21 Top 8), devant Kennen (20), Kai'Sa (14), Irelia (9) et Rek'sai (8). Parmi les légendes vues au moins vingt fois, les meilleures conversions sont Kennen (12,35 %), Ornn (11,11 %), Master Yi Bladesman (10,94 %), Azir (10,81 %) et Rek'sai (10,39 %).

Trois écarts tiennent depuis le relevé du 14 août et se sont creusés avec 441 decks de plus :

- **Kai'Sa reste le deuxième deck le plus joué (189) mais convertit à 7,41 %**, sous Master Yi et Kennen à volume comparable. Elle garde deux victoires.
- **Akali est jouée 74 fois et n'a toujours aucun Top 8**, sur 15 tournois. C'est le plus gros volume sans résultat du set. Mel (37) et Pyke (24) sont dans le même cas.
- **Jayce (72 decks, 3 Top 8) et Nasus (86 decks, 4 Top 8)** convertissent sous 5 %, mais Nasus signe deux victoires — dont Tianjin le 16 août.

Ces taux ne constituent pas un classement de puissance : ils ne contrôlent ni le nombre de rondes, ni le niveau des adversaires, ni les matchups.

### Résultats par tournoi

| Contexte DB | Decks | Top 8 | Vainqueur |
|---|---:|---:|---|
| S4 Shanghai City Challenge (2026-08-08) | 124 | 8 | Draven, Glorious Executioner |
| S4 Nanjing City Challenge (2026-08-15) | 124 | 8 | Fiora, Grand Duelist |
| S4 Beijing City Challenge (2026-08-15) | 124 | 8 | Master Yi, Wuju Bladesman |
| S4 Beijing City Challenge (2026-08-08) | 123 | 8 | Diana, Scorn of the Moon |
| S4 Shanghai City Challenge (2026-08-16) | 123 | 8 | Azir, Emperor of the Sands |
| S4 Fuzhou City Challenge (2026-08-09) | 122 | 8 | Kai'Sa, Daughter of the Void |
| S4 Shenyang City Challenge (2026-08-16) | 122 | 8 | Master Yi, Wuju Bladesman |
| S4 Guangzhou City Challenge (2026-08-09) | 121 | 8 | Nasus, Curator of the Sands |
| S4 Chengdu City Challenge (2026-08-08) | 119 | 8 | Kennen, Heart of the Tempest |
| S4 Hangzhou City Challenge (2026-08-09) | 118 | 8 | Diana, Scorn of the Moon |
| S4 Shenzhen City Challenge (2026-08-08) | 118 | 8 | Kai'Sa, Daughter of the Void |
| S4 Qingdao City Challenge (2026-08-16) | 103 | 7 | Diana, Scorn of the Moon |
| S4 Wuhan City Challenge (2026-08-08) | 99 | 8 | Master Yi, Wuju Bladesman |
| S4 Tianjin City Challenge (2026-08-16) | 93 | 8 | Nasus, Curator of the Sands |
| Riftbound Showdown Ottawa (2026-08-08) | 38 | 8 | Rengar, Pridestalker |

Les quinze contextes totalisent 1671 decks et 119 places de Top 8. Qingdao n'en compte que 7 : la liste de la huitième place est publiée incomplète chez riftdecks et a été écartée, on ne la reconstitue pas. Ottawa reste à part avec 38 listes complètes sur 525 pages publiées.

Les fiches Vendetta de Shen et Renekton ne sont toujours pas dans `data/fiches/`. Celles de Kennen, Nasus, Ambessa, Jayce, Akali, Mel et Zed existent. Les statistiques de présence et de résultat ne suffisent pas à établir les domaines, les cores ou les matchups des deux fiches manquantes : il faut lire les listes.

## Juin 2026 (v7) — Analyse VOD compétitives (84 VOD, distillé)

> Détail complet et matchups dans `data/video-insights/unleashed-vod-synthesis-2026-06.md`. Opinions de casters (Jibs, Pentastag, Exo…), reformulées FR.

**Lecture méta (ère Hartford).** La **consistance** prime sur la puissance brute (plans linéaires en day 2). Le **violet (Chaos)** domine et pousse le removal pur hors du méta → **Diana prospère**. Le **jaune (Ordre) aggro** est bien placé (nouvelles pioches). Le **de-ramp** est l'action la plus punitive. Différences régionales : NA = Draven/Kai'Sa/Azir + Set 1 ; Europe = Vex/Lillia/Kha'Zix/Irelia + plus d'Aurora. Hartford gonfle Master Yi (dernier « Best of » Set 1).

**Tier consensuel (éditorial) :**
- **S / haut A** : Irelia (n°1, tech-dépendant), Master Yi Wuju Bladesman (le plus représenté day 2, vainqueur Hartford).
- **A** : Diana (vainqueur Vancouver, oppressive), Ezreal (meilleur contrôle), LeBlanc (déclin en rounds profonds), Annie (sous-estimée), Azir (skill, vainqueur Utrecht), Aurora MF/Sivir (« boogeyman » battable), Viktor (montée via Sprite Fountain, « plus fort à 6 points »).
- **A/B hold & outsiders** : Vex (meilleur hold), Kha'Zix (design-flawed, sous-performe), Pyke (top 8 Hartford).
- **B** : Fiora↑, Sett (Akshan+Arena Bar), Rek'Sai (Void Rush/Undertitan), Lucian↑, Ornn (Sprite Fountain), Darius, Kai'Sa↓, Yasuo, Jax, Volibear, Ivern.
- **C/bas** : Rengar (high-roll, crushé par Vex), Lillia (overhyped), Lux (loop malsain), Jhin, Leona/Renata/Jinx/Ahri/Poppy/Garen (bas).

**Cartes qui définissent le format :** Vex Apathetic/Cheerless (stun/taxe, ne ciblent pas), Defy (~40 %, counter ~70 % des sorts), Star-Crossed + Fizz (pivot chaos, anti-Elder), Moonfall (meilleur signature), Ruin Runner (intuable, meurt à Flurry of Blades), Rengar Trophy Hunter, Baron Nashor (anti-Aurora), Hwei (Diana), Scuttle Crab, Tideturner loop, gear hate **en unité** anti-Aurora (Adaptatron/Akshan/Action), Soul Sword/Sprite Fountain (gears Set 3).

**Surveillance ban (avis casters, NON officiel) :** Vex Apathetic (floodgate sans coût power), Star-Crossed (bounce base), Echo (loop Lux malsain), Ferrous Forerunner (polarisant). Déjà bannie : Called Shot.

**Mises à jour règles/format (à connaître) :**
- **Bo1 : sideboard AVANT la partie** (tout le monde side-in Aurora).
- **Nerf des buffs** (Sett) : il faut déjà un buff présent pour le dépenser.
- **Emperor’s Dais** : on peut refuser de payer le 1 énergie → bounce en main sans le token (errata probable).
- **Elder Dragon** : seuil létal ennemi → 1, passif **rétroactif** (Flurry of Blades avant Aurora tue plus).
- **Star-Crossed** retourne les DEUX unités ; **Mirror Image** copie l'effet de carte seul.
- **Overtime Swiss** : victoire **par 2** → 6-7 = **tie** (les deux ratent le top cut) ; top cut untimed.
- **Max 4 champions** pour Master Yi (sinon 3). Triggers verrouillés une fois sur la chain.

**Ban list officielle — source canonique `src/lib/banned-cards.ts`.**

*31 mars 2026, 7 cartes :* Called Shot, Draven Vanquisher, Fight or Flight, Scrapheap, The Dreaming Tree,
Obelisk of Power, **Reaver's Row**. (Correction juin 2026 : Reaver's Row manquait, « Draven, Vanquisher »
mal orthographié.) Dazzling Aurora **non** bannie.

*24 juillet 2026, patch Vendetta ([annonce](https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/)) :*
- **Standard, carte :** Stealthy Pursuer (Traqueuse furtive).
- **Standard, battlefields :** The Arena's Greatest (Légende de l'arène) et Aspirant's Climb (Ascension des
  aspirants). Ils pesaient **18 % et 23 %** des decks du format : c'est le vrai coup dur pour Body/ramp et
  Aggro/Fury, voir `DECKBUILDING-RULES.md`.
- **Aucune légende bannie** dans les formats que suit le site. L'annonce en bannit une en 2v2 construit,
  format qu'on ne couvre pas : ne pas la faire remonter côté site.

Détail des casts inter-sets (matchups Spiritforged/Origins + tech) dans
`data/video-insights/cross-set-casts-2026-06.md`.

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

### Mots-clés Vendetta (règles du jeu FR du 16 juillet 2026, en vigueur le 24 juillet)

**Intégrité des decklists Vendetta :** une liste exploitable possède 39 cartes dans
le deck principal, 1 champion, 12 runes, 3 champs de bataille et exactement 10 cartes
en réserve. Toute autre composition exclut le deck des statistiques, des seeds et
des tier lists. Le corpus brut reste archivé pour audit ; aucune carte absente n'est
reconstituée.

- **AMPLIFICATION / AMPLIFIÉ / DÉSAMPLIFIER** (règles 827-828, 441-442) : compétence activée, surtout sur
  permanents et légendes. On paie le coût, la carte devient *amplifiée*. État binaire, pas de cumul : une
  carte déjà amplifiée ne peut pas l'être une 2ᵉ fois. Le texte marqué « Amplifié > ... » n'est actif que
  tant que l'état tient. Mécanique phare du set.
- **FLUX** (829) : mot-clé passif sur les sorts. « Flux [Coût] » = on peut lancer le sort **depuis la
  défausse** à ce coût alternatif, puis il est banni. Ne change ni le timing ni les autorisations, juste la
  zone de départ. Un sort peut porter plusieurs Flux à coûts différents, le contrôleur choisit.
- **BRÛLER** (440) : « Brûlez X » = X cartes du dessus du deck principal vers la défausse. Action limitée.
- **PASSER** (443) : remplace un événement par rien, sans déclencheur (phase de pioche, déplacement, point
  de conquête). C'est un effet de remplacement.

Rendus côté site dans `/guides/glossaire`. PDF des règles : voir `data/meta-reports/`.

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

### 2.2 Tier Unleashed — data-backed (21 juillet 2026, **9 555 decks classés**)

> Recalculé sur tout le dépôt via `scripts/tier-unleashed.py` : 25 S3 City Challenges + Xi'an RO + Tianjin RO + Changsha RO + Suzhou RQ + Sydney + Vancouver + Utrecht + **Hartford (classement complet, 1 659)** + **S3 National Open (classement complet, 2 030)**. 40 légendes.
> **Taux de Top 8 moyen du field = 2,76 %.** C'est la barre : au-dessus, la légende convertit mieux que la moyenne ; en dessous, elle est surjouée pour ce qu'elle rend.

| Tier | Legend | Field % (decks) | Top 8 | Wins | Conversion |
|------|--------|-----------------|-------|------|-----------|
| **S** | Master Yi, Wuju Bladesman | 11,9% (1133) | 49 | 6 | 4,3% |
| **S** | Irelia, Blade Dancer | 8,2% (780) | 37 | 7 | 4,7% |
| **S** | Diana, Scorn of the Moon | 7,3% (698) | 31 | 3 | 4,4% |
| **A** | Annie, Dark Child | 1,7% (161) | 8 | 3 | **5,0%** (meilleure du set) |
| **A** | Sett (2,1%/9·3W · 4,4%) · Fiora (4,0%/15·3W · 3,9%) · Draven (2,3%/8 · 3,7%) · Kai'Sa (3,3%/11 · 3,5%) · Sivir (2,7%/9·2W · 3,5%) | — | — | — | > 2,76% |
| **B** | LeBlanc (6,0%/18·2W · 3,1%) · Lillia (3,8%/11·1W · 3,0%) · Rek'Sai (1,4%/4 · 3,0%) · Darius (0,8%/2 · 2,7%) · Azir (3,8%/9·2W · 2,5%) · Rengar (2,5%/6·1W · 2,5%) · Pyke (2,2%/5 · 2,4%) · Ezreal (1,9%/4 · 2,2%) | — | — | — | ~2,5% |
| **C** | **Vex (4,2%/7·0W · 1,8%)** · Kha'Zix (2,4%/4 · 1,7%) · Garen · Jhin · **Viktor (3,3%/4 · 1,3%)** · Ornn · Poppy · Lucian · Jax · Master Yi Wuju Master · Lux · Teemo · Volibear | 0,7-4,2% | 1-7 | 0 | < 2% |
| **D** | **Miss Fortune (2,8%/1 · 0,4%)** · Ahri (2,0%/0) · Leona (1,5%/0) · Vi · Jinx · Ivern · Yasuo · Lee Sin · Rumble · Renata | ≤2,8% | 0-1 | 0 | ~0% |

**Ce qui a changé depuis le 8 juin** (le National Open ajoute 2 030 decks classés et Hartford 1 659, soit ensemble près de 40 % de la base) :
- **LeBlanc quitte le tier S.** Elle garde du volume (6,3 %, 497 decks) mais convertit à 3,6 %, à peine au-dessus de la moyenne, et n'a plus rien gagné depuis les City Challenges d'avril. Au National : 89 listes, 2 dans le Top 16 (11e et 13e), aucune dans le Top 8.
- **Annie est la meilleure conversion du set** : 6,5 % de Top 8 et 3 victoires pour seulement 124 decks. Top 8 à Utrecht, à Hartford, et 6e au National. Ce n'est plus une « sleeper », c'est un tier A.
- **Vex tombe en C.** 357 decks, 7 Top 8, **aucune victoire**, et **zéro Top 32 au National** sur 89 listes. Trois tournois de suite sans conversion : le piège volume est démontré, pas supposé.
- **Miss Fortune s'effondre en D** : 228 decks pour **1 seul Top 8**, soit 0,4 %. C'est la pire conversion du set, dix fois sous la moyenne. L'archétype Aurora qu'elle porte est lisible et préparé.
- **Rek'Sai monte en A** : 4 Top 8 pour 99 decks (4,0 %), après son podium à Tianjin et sa 5e place au National. Deux orthographes coexistaient dans le dépôt (`Rek'sai` / `Rek'Sai`) et cassaient le comptage ; c'est fusionné.
- **Master Yi Bladesman reste n°1 du field mais est surjoué** : 12,1 % des decks, conversion 5,1 %, soit moins bien qu'Irelia et Diana qui sont deux fois moins choisies. Toujours à ne pas confondre avec le **Wuju Master** (77 decks, 1 Top 8, tier C).
- **Ahri, Leona, Vi, Ivern, Jinx, Yasuo, Rumble** : plus de 500 decks cumulés, **zéro Top 8**. À déconseiller franchement.

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

### Juin 2026 — S3 Tianjin Regional Open (7 juin 2026)
- **640 joueurs**, **638 decklists** scrapées et analysées. **40 légendes** représentées — méta toujours aussi ouvert.
- **Top légendes par picks** : Master Yi Wuju Bladesman (79), Irelia (61), Diana (43), LeBlanc (30), Vex (28), Fiora (24), Kai'Sa (24), Azir (20), Viktor (19). (⚠️ tous les Master Yi = Wuju Bladesman ; le « Wuju Master » affiché initialement était un artefact de fallback, corrigé.)
- **Master Yi, Wuju Bladesman win** (陈千语, Corps/Calme) — le Bladesman d'Origins, légende la plus jouée du tournoi (12,4 %), signe la victoire. Hold Body/Calm.
- **Diana 2e** (GREY-邮差, Chaos/Esprit) — reste solidement T1, finaliste après son Top 4 de Vancouver et son Top 2 de Xi'an.
- **Rek'sai 3e** (FSW.半岛铁盒, Fureur/Ordre) — **grosse surprise** : seulement 40 decks (0,8%) sur tout l'Unleashed mais signe un podium. Aggro tunneler Fury/Order. Remonte en tier C.
- **Pyke 4e** (D.C环游KJ, Chaos/Fureur) — l'assassin confirme sa viabilité (tier B).
- **Irelia double Top 8** (5e + 6e) — la plus jouée et la plus régulière, comme à chaque Regional.
- **Diana 8e** également — deux Diana dans le Top 8.
- **Vex = piège volume confirmé** : 28 decks (4,1%), meilleur résultat 10e, aucun Top 8. Gros pick rate, conversion nulle.
- **Données complètes** : 638 decklists JSON dans `data/decklists/`, résumé dans `data/tournaments/s3-tianjin-ro-11863.json`. Article best-of : `/articles/best-of-tianjin-ro`.

### Juin 2026 — S3 Changsha Regional Open (14 juin 2026)
- **640 joueurs**, **638 decklists** scrapées (intégralité du field) et analysées. Méta le plus ouvert vu en Chine.
- **Top légendes par picks** : Master Yi Wuju Bladesman (74), Irelia (55), Diana (53), LeBlanc (35), Kai'Sa (21), Azir (19), Sivir (19), Pyke (19), **Master Yi Wuju Master (18)**, Kha'Zix (18), Ahri (18), Viktor (17).
- **Deux Master Yi joués** : Wuju Bladesman (74, champion Honed, Body/Calm hold) et Wuju Master (18, champion Tempered, Body/Calm) — la variante Wuju Master représente ~3% du field à Changsha.
- **Vainqueur : Irelia, Blade Dancer** (咕咕嘎嘎.阿门.Gambit, Calme/Chaos) — tempo gear. Diana 2e (Chaos/Esprit).
- **Données** : 638 JSON, `data/tournaments/s3-changsha-regional-open-12102.json`. Page : `/tournois/s3-changsha-regional-open-2026-06-14`. Best-of : `/articles/best-of-changsha-ro` (41 légendes).

### Mai 2026 — RQ Vancouver (final standings, 30 mai 2026)
- **1 833 joueurs**, **118 decklists publiées** au classement final (en plus des best-of). Set Unleashed.
- **Top 8** : 1er AlanZQ Diana (premier double champion RQ), 2e SamDSherman Rengar, 3e HousesAreBig Master Yi Bladesman, 4e Dhawally Diana, 5e Rocklho Azir, 6e Arito Irelia, 7e SwagYOLO Sivir (seul Aurora), 8e BaoBao Irelia. 6 légendes / 8 joueurs.
- Confirme Diana T1, le gear hate + tech Vex comme réponses anti-Aurora/anti-Fury. Page : `/tournois/rq-vancouver-2026`.

### Juin 2026 — RQ Utrecht (13-14 juin 2026, Europe)
- **1 953 joueurs**, top 16 récupéré. **Top 8 = 8 légendes différentes** (méta le plus ouvert à ce jour) : Azir, Viktor, Sett, Diana, Rek'Sai, Darius, Master Yi Bladesman, Annie.
- **Vainqueur : Squirtle (Azir, Emperor of the Sands)** — capitaine de Micelion, 2-1 en finale sur **Rednaxell (Viktor)**. **2e double champion RQ de l'histoire** (après AlanZQ), back-to-back Lille→Utrecht. Plus longue série d'invincibilité du jeu.
- Finale = miroir de tokens (Sand Soldiers vs recruits). **Pickpocket** (side) = tech clé anti-équipement Azir. Dwali/Diwali (Diana, vainqueur Houston, top 4 Vancouver) tombe en demie sur un Sprite Fountain top-deck. Micelion : 3 en Top 8.
- Article Top 8 : `data/articles-drafts/recap-utrecht-rq-top8.md`. Analyse VOD : `data/videos/utrecht-day1-analysis.json`. Page : `/tournois/rq-utrecht-2026`.

### Juin 2026 — RQ Hartford (20 juin 2026, Amérique du Nord)
- **1 953 joueurs**, **1 659 entrées au classement final** (rang, bilan, légende, joueur : tout récupéré le 21 juillet). ⚠️ riftdecks n'a publié que **116 decklists** sur ces 1 659 : les autres lignes affichent « N/A / Submit Deck ». Les 116 sont dans le dépôt (préfixe `hartford-`). 13 rondes de Suisse → Top 8 à élimination directe.
- ⚠️ **Correction du 21 juillet** : les 7 fiches du Top 8 issues du parsage markdown de juin contenaient au moins une erreur de champion (Factor jouait **Master Yi, Honed**, pas Tempered). Elles ont été remplacées par le scrape direct du tableau, qui lit la ligne `data-card-type` au lieu de deviner. Set Unleashed — **dernier RQ du format** avant le set Vendetta (paires de couleurs ennemies).
- **Vainqueur : Factor (Master Yi, Wuju Bladesman, Corps/Calme), 14-1-1** — 2-0 en finale sur **bsweitz (Diana, Scorn of the Moon, Chaos/Esprit, 13-2-1)**. Premier titre de Master Yi Bladesman sur le **circuit occidental** (Sydney/Vancouver/Utrecht/Hartford). Revanche personnelle : bsweitz avait éliminé Factor à Vancouver.
- **Finale** = la signature du week-end : **double The Arena's Greatest** posé par Factor (partie à 6 points), gagnée en jouant **second**. Moteur Master Yi = **Ruin Runner** (6 énergie / 5 might, non ciblable par sorts/capacités), protégé par Sabotage + Punch First — cauchemar des decks Chaos/Diana.
- **Top légendes par picks (1657 decks)** : Master Yi Wuju Bladesman (178 / 10,7%), Diana (134 / 8,1%), Irelia (93), LeBlanc (76), Azir (70), Viktor (64), Ahri (53), Sivir (50), Pyke (46), Rengar (45), Kai'Sa (44), Ezreal (42), Draven/MF/Jhin (40), Vex (39), Annie (38), Leona/Lillia (36), Rek'Sai (35), Kha'Zix (34).
- **Conversion top cut** : **Diana = la vraie menace** (3 Top 8 / 4 Top 16 / 9 Top 32 / 14 Top 64, best 2e). **Master Yi Bladesman** le plus joué et champion mais 1 seul Top 8 (best 1er) — convertit au titre, pas en volume. **Irelia = piège volume** : 2e plus jouée (93) mais 0 Top 8 (best 9e). **Lux (CTCG Relivia) 6e** = surprise du Top 8, 1er Top 8 majeur Unleashed de la légende.
- **Domaines** : Corps/Calme 250 (le + joué, Master Yi), **Chaos/Esprit 198 = meilleure conversion (4 Top 8)** (Diana + Ezreal), Esprit/Ordre 185 (Lux/Viktor/LeBlanc).
- **Top 8** : 1er Factor (Master Yi), 2e bsweitz (Diana), 3e Bradykin (Ezreal), 4e linsanity (Diana), 5e ASC Evansrhim (Diana, **liste non publiée**), 6e CTCG Relivia (Lux), 7e Prismaticismism (Annie, champion d'Atlanta, sorti en quart), 8e Mirru (Pyke).
- **Bracket** : QF — Factor>Evansrhim (Diana), Bradykin>Mirru (Pyke), linsanity>Relivia (Lux, 2-0), bsweitz>Prismaticismism (Annie). SF — Factor>Bradykin (Ezreal), bsweitz>linsanity (miroir Diana, 2-1). **Finale — Factor>bsweitz (2-0)**.
- **Données** : 7 Top 8 JSON (prefix `hartford-rq-`) dans `data/decklists/` (5e manquante = non fabriquée). Méta agrégée : `data/meta-reports/unleashed-post-hartford.json`. Article : `scripts/seed-hartford-article.mts` → `/articles/recap-hartford-rq-top8`. VOD : `data/videos/hartford-day1.srt`.

### Synthèse Unleashed mise à jour (23 juin 2026, ~8 560 decks classés — post-Hartford)
- Tier S : Master Yi Bladesman (le + joué, vainqueur Suzhou/Tianjin/Hartford), Irelia (T1 mais 0 Top 8 à Hartford), Diana (meilleure conversion, 3 Top 8 Hartford), LeBlanc.
- Tier A : Fiora, Draven, Lillia, Azir (vainqueur Utrecht), Kai'Sa, Sivir, Sett, Rengar (finaliste Vancouver), Annie (7e Hartford, meilleure conversion).
- Tier B : Ezreal (3e Hartford), Vex (piège volume), Viktor (finaliste Utrecht), Kha'Zix, Ornn, Pyke (8e Hartford).
- **Lux monte en tier C** : 6e à Hartford (Relivia), 1er Top 8 majeur Unleashed de la légende.
- Master Yi Wuju Master = tier D, archétype de niche (0,4%, 1 top 8).

### Juillet 2026 — S3 National Open (19 juillet 2026, Chine) — le plus gros field Unleashed

- **2 048 joueurs**, **2 032 decklists** publiées, set Unleashed. Classement complet récupéré (rang + légende pour les 2 032). Le plus gros tournoi Unleashed à ce jour, devant Vancouver et Hartford.
- **Vainqueur : Irelia, Blade Dancer** (梦之星-咕嘎乐色, Calme/Chaos). **Finale 100 % Irelia** : le 1er et le 2e jouent la même légende, les mêmes deux domaines.
- **Top 8** : 1er + 2e Irelia · 3e + 4e Diana · **5e Rek'Sai** · **6e Annie** · 7e + 8e Master Yi Bladesman. Cinq légendes pour huit joueurs.
- **Field** : Master Yi Bladesman 15,1 % (307) · Irelia 9,9 % (202) · Diana 8,2 % (166) · LeBlanc 4,4 % (89) · Vex 4,4 % (89) · Viktor 4,2 % (86) · Azir 3,5 % (72) · Kai'Sa 3,2 % (66).
- **Seules 10 légendes sur 41 placent un deck dans le Top 32.** Le méta reste large à la base et se referme complètement en haut de tableau.
- **Conversion en Top 32** (moyenne du field = 1,6 %) : Lux 6,1 % (2 sur 33) · Rek'Sai 4,4 % · Annie 4,2 % · **Diana 4,2 %** · Irelia 3,0 % · Master Yi 2,6 % · Viktor 2,3 % · LeBlanc 2,2 %.
- **Master Yi est surjoué** : premier du field de très loin (15,1 %) mais seulement 2 Top 8 et une conversion à peine au-dessus de la moyenne. Diana convertit une fois et demie mieux en étant deux fois moins jouée.
- **Vex ne convertit toujours rien** : 89 decks, **zéro Top 32**. Troisième tournoi de suite (Tianjin, Hartford, National) où le gros pick rate ne donne aucun résultat. Le piège volume est confirmé, ce n'est plus un accident d'échantillon.
- **Kai'Sa a disparu du haut de tableau** : 66 decks, zéro Top 32. La reine d'Origins ne tient plus en Unleashed.
- **Rek'Sai et Annie confirment** : deux légendes peu jouées (45 et 24 decks) qui signent chacune un Top 8, après le podium de Rek'Sai à Tianjin et le Top 8 d'Annie à Hartford et Utrecht. Ce ne sont plus des surprises isolées.
- **Lux place deux decks dans le Top 16** (12e et 14e) avec 33 listes seulement. Bon tournoi, mais **à ne pas surinterpréter** : sur l'ensemble de l'Unleashed elle reste à 1 Top 8 pour 87 decks. Elle ne monte pas de tier.
- **Données** : `data/tournaments/s3-national.json`, decklists préfixées `s3-national-` dans `data/decklists/`. Source : riftdecks, tournoi `s3-national-open-tournament-decks-13535`.

### Juin 2026 — Tier lists riftbound.gg (Tianjin → Vendetta)

> Deux tier lists hebdomadaires éditoriales de [riftbound.gg](https://riftbound.gg) (par Den), intégrées le 25 juin 2026. Méthode : « meilleure performance par légende en Regional » + « nombre de Top 8 dans les tournois 64+ joueurs ». Définitions : **Tier 1** = top cut attendu / vainqueur potentiel ; **Tier 2** = prétendant Top 16-32, à un ou deux matchs du Top 8 ; **Tier 3** = Top 64 avec un pilote expérimenté ; **Tier 4** = étincelles ponctuelles ; **Tier 5** = hors méta (« les cartes best-of valent surtout de l'argent »).

#### Tier list « Tianjin Shakes the Power Rankings » (post-Tianjin, 31 tournois 64+)
- **Trio indiscuté** : Diana (6W/23 Top8), Irelia (4W/20), **Origins Master Yi / Wuju Bladesman** (5W/47) — Master Yi serait #1 sur la seule scène chinoise mais peine à l'Ouest jusqu'à Vancouver.
- **Tier 2** (dense, ~12 candidats Top 8) : Azir, Sivir, Vex, LeBlanc, Fiora, Ezreal, Rengar, Miss Fortune, Annie, **Rek'Sai** (Top 4 Tianjin, propulsé), **Pyke** (Top 4 Tianjin), Kha'Zix, Draven.
- **Tier 3** : Viktor, Kai'Sa, Lux, Teemo, Poppy, Sett, Lillia. **Tier 4** : Darius, Lucian, Unleashed Yi (Wuju Master), Ahri, Ornn, Volibear, Vi, Jax. **Tier 5** : Yasuo, Lee Sin, Renata, Ivern, Leona, Jinx, Rumble, Jhin, Garen.
- Lecture : le **domaine Fureur monte** (Rek'Sai + Pyke), les decks rapides perturbent le midrange du top tier. Chaque Top 8 Unleashed a livré un « invité surprise ».

#### Tier list « One More Regional Until Vendetta » (post-Changsha/Utrecht, 38 tournois 64+) — **LA PLUS RÉCENTE**

> La référence éditoriale actuelle, juste avant Hartford et le passage au set Vendetta. Le changement majeur : **Azir rejoint le Tier 1** (3e légende à 2 titres de Regional, après son sans-faute à Utrecht). Paires de domaines (FR) confirmées par la source.

| Tier | Légende | Domaines | Bilan 64+ |
|------|---------|----------|-----------|
| **1** | Diana, Scorn of the Moon | Esprit/Chaos | 7 W / 31 Top 8 |
| **1** | Irelia, Blade Dancer | Calme/Chaos | 4 W / 27 Top 8 |
| **1** | Master Yi, Wuju Bladesman | Corps/Calme | 2 W / 56 Top 8 |
| **1** | Azir, Emperor of the Sands | Calme/Ordre | 1 W / 17 Top 8 |
| **2** | LeBlanc, Deceiver | Esprit/Ordre | 6 W / 18 Top 8 |
| **2** | Annie, Dark Child | Fureur/Chaos | 1 W / 3 Top 8 |
| **2** | Sivir, Battle Mistress | Corps/Chaos | 9 Top 8 |
| **2** | Ezreal, Prodigal Explorer | Esprit/Chaos | 2 W / 8 Top 8 |
| **2** | Rek'Sai, Void Burrower | Fureur/Ordre | 1 W / 3 Top 8 |
| **2** | Vex, Gloomist | Calme/Chaos | 17 Top 8 |
| **2** | Fiora, Grand Duelist | Corps/Ordre | 1 W / 13 Top 8 |
| **2** | Viktor, Herald of the Arcane | Esprit/Ordre | 1 W / 12 Top 8 |
| **2** | Rengar, Pridestalker | Fureur/Corps | 3 Top 8 |
| **2** | Kha'Zix, Voidreaver | Corps/Chaos | 2 Top 8 |
| **2** | Miss Fortune, Bounty Hunter | Corps/Chaos | 2 W / 4 Top 8 |
| **3** | Draven, Glorious Executioner | Fureur/Chaos | 1 W / 6 Top 8 |
| **3** | Sett, The Boss | Corps/Ordre | 1 W / 6 Top 8 |
| **3** | Darius, Hand of Noxus | Fureur/Ordre | 1 Top 8 |
| **3** | Lillia, Bashful Bloom | Esprit/Calme | 1 W / 2 Top 8 |
| **3** | Pyke, Bloodharbor Ripper | Fureur/Chaos | 1 Top 8 |
| **3** | Kai'Sa, Daughter of the Void | Fureur/Esprit | 6 Top 8 |
| **3** | Lux, Lady of Luminosity | Esprit/Ordre | 1 Top 8 |
| **3** | Teemo, Swift Scout | Esprit/Chaos | 1 Top 8 |
| **4** | Master Yi, Wuju Master | Corps/Calme | — |
| **4** | Poppy, Keeper of the Hammer | Corps/Ordre | 1 Top 8 |
| **4** | Volibear, Relentless Storm | Fureur/Corps | — |
| **4** | Ahri, Nine-Tailed Fox | Esprit/Calme | 1 Top 8 |
| **4** | Vi, Piltover Enforcer | Fureur/Ordre | 1 Top 8 |
| **4** | Jax, Grandmaster At Arms | Corps/Calme | — |
| **4** | Lucian, Purifier | Fureur/Corps | — |
| **4** | Ornn, Fire Below the Mountain | Esprit/Calme | — |
| **5** | Jhin, Virtuoso | Fureur/Esprit | 2 Top 8 |
| **5** | Yasuo, Unforgiven | Calme/Chaos | — |
| **5** | Lee Sin, Blind Monk | Fureur/Corps | — |
| **5** | Jinx, Loose Cannon | Fureur/Chaos | 1 Top 8 |
| **5** | Leona, Radiant Dawn | Calme/Ordre | 1 Top 8 |
| **5** | Ivern, Green Father | Calme/Ordre | — |
| **5** | Renata Glasc, Chem-Baroness | Esprit/Ordre | — |
| **5** | Rumble, Mechanized Menace | Fureur/Esprit | — |
| **5** | Garen, Might of Demacia | Corps/Ordre | — |

**Lecture riftbound.gg** : Diana reste #1 malgré un seul titre (Vancouver) — six Regionals consécutifs avec 2 demies + 4 finales, plus haut plafond si jouée optimalement. Sivir/Vex/LeBlanc, prétendants du début de set, ont raté les 3 derniers Top 8. À l'inverse, **Fureur en hausse** (Rek'Sai, Annie, Darius, Rengar tous en Top 8 à Vancouver ou Utrecht) : l'Ouest innove pendant que la Chine exploite les meilleures légendes établies.

### Juin 2026 — Win rates globaux du set Unleashed (recap Hartford riftbound.gg)

> Taux de victoire **global sur tout le set** (toutes parties classées riftdecks, échantillon entre parenthèses), publiés dans le recap Hartford. Indicateur de puissance brute complémentaire aux Top 8. Top du tableau : **Master Yi, Ezreal et LeBlanc à 56%**, Diana 55%.

| Légende | WR | Parties | Légende | WR | Parties |
|---------|----|---------|---------|----|---------|
| Master Yi (Bladesman) | 56% | 1167 | Vex | 53% | 269 |
| Ezreal | 56% | 272 | Sivir | 53% | 331 |
| LeBlanc | 56% | 503 | Rek'Sai | 52% | 238 |
| Diana | 55% | 846 | Rengar | 52% | 261 |
| Azir | 54% | 477 | Kai'Sa | 52% | 294 |
| Annie | 54% | 269 | Darius | 52% | 122 |
| Lux | 54% | 157 | Kha'Zix | 51% | 207 |
| Irelia | 53% | 592 | Draven | 51% | 273 |
| Viktor | 50% | 378 | Poppy | 50% | 106 |
| Lee Sin | 49% | 145 | Sett | 47% | 109 |
| Miss Fortune | 47% | 232 | Lucian | 47% | 175 |
| Volibear | 47% | 164 | Jinx | 46% | 206 |
| Yasuo | 46% | 177 | Jax | 46% | 144 |
| Lillia | 45% | 215 | Fiora | 44% | 152 |
| Vi | 44% | 103 | Pyke | 43% | 260 |
| Ahri | 42% | 307 | Teemo | 42% | 129 |
| Ivern | 42% | 85 | Rumble | 42% | 64 |
| Ornn | 40% | 147 | Jhin | 38% | 218 |
| Unleashed Yi (Wuju Master) | 38% | 136 | Garen | 35% | 113 |
| Leona | 34% | 200 | Renata Glasc | 34% | 115 |

**Insight WR vs Top 8** : Pyke (43%) et Lux (54%) illustrent l'écart entre régularité et pic — Pyke convertit en Top 8 sans WR élevé, Lux a un bon WR mais peu de Top 8 jusqu'à Hartford. Master Yi cumule le meilleur WR ET le plus gros volume (1167 parties), confirmant sa domination du field. Bas de tableau (Leona, Renata, Garen, Jhin ≤ 38%) cohérent avec le Tier 5 éditorial.

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
| 14 | S3 Tianjin RO | 7 juin 2026 | Unleashed | 640 | 638 | Master Yi Wuju Bladesman (陈千语) | Diana (GREY-邮差) |
| 15 | RQ Utrecht | 14 juin 2026 | Unleashed | 1953 | top 16 | Azir (Squirtle) | Viktor (Rednaxell) |
| 16 | RQ Hartford | 20 juin 2026 | Unleashed | 1953 | 1657 | Master Yi Bladesman (Factor 14-1-1) | Diana (bsweitz) |

**Bilan Regional wins** : Kai'Sa 5 (Guangzhou, Beijing D2, Chongqing, Shanghai NO, Shanghai CC), Draven 4 (Vegas, Fuzhou, Chengdu, +), Annie 3, **Master Yi Bladesman 3 (Suzhou, Tianjin, Hartford)**, Azir 3 (Lille, Xi'an, Utrecht), Irelia 2 (Sydney, Shenzhen), Ezreal 1 (Bologna), Diana 1 (Vancouver).

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
- **Aurora retombe** : 1 seul en Top 8, éliminé en quart. Le gear hate (retrait des Guardian Angel, Turn to Dust, Acceptable Losses) punit Aurora ET les builds Irelia/Irelia autour du gear.
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

---

## Juin 2026 (v8) — Passe 3 VOD (118 casts, Set 2 surtout)

> Distillé de `data/video-insights/pass3-2026-06.md` (net-new vs les 2 docs précédents). Casts = factuel,
> `[avis]` = caster. ⚠️ **« Ari » des transcripts Whisper = Ahri** (corrigé partout). Matchups pairwise
> consolidés dans `data/video-insights/matchups-reference.md`. Aucune decklist fabriquée.

### Chiffres de tournois (factuel)
- **RQ Fuzhou (511 j. J1, 64 J2)** : **Top 64 = 40 Draven / 64 (62,5 %)**, puis Aurelia, Kai'Sa, Fiora. **Grande finale : Draven (apot2) bat Fiora 2-0** = 1er champion Regional Open Saison 2. Beaucoup de **DRAW** (règle RO : victoire par 2 pts d'écart sinon égalité).
- **Finale régionale Shangdu** : Draven bat Fiora 2-0 (2e champion Draven consécutif).
- **Shanghai National Open** : Kai'Sa ~30 % du field ; Viktor = 3e deck le plus représenté ; **Omega Zero (Kai'Sa control) = 1er champion national**, bat Master Yi 2-0 (prize ~$30k).
- **R&R Invitational** : J Chan 1er champion (bat Rek'Sai 2-1, miroir Draven en finale). **Bologna (340 j.)** : miracle Draven 1ʳᵉ place, « nemesis méta », quasi tier 0.
- **« Hongshou »** : **4 des Top 8 = Master Yi** (2 ramp standard, 2 Dazzling Aurora).

### Tier / méta [avis casters]
- **Draven = tier 0** Set 2 (domine le field, ~62 % du Top 64 Fuzhou) mais les pros jouent autour → peu de titres en pro tour ; **triangle Draven < Ezreal < Irelia < Draven** ; **Fiora = la vraie réponse à Draven**.
- **MF Aurora (Dazzling Aurora) = le « gros méchant » oppressif** Set 2-3, « il faut une limite » ; **telltale : un Poro T1 = pas Aurora**. Les 2 derniers points contre elle sont les plus durs.
- **Order = seule couleur avec du kill sec** (Call the Weak / Hidden Blade, ignore le might) → définit la méta. **Set 2 tourne autour du gear + gold** → gear-hate main-deck = meta-call.
- Légendes secondaires Set 2 viables mais sous-représentées (gatées derrière leur mécanique) : Set, Victor (Jace+Vanguard Armory « carte la plus oppressante »), Ahri (gagne une finale vs Kai'Sa), Rek'Sai (bat Aurelia 3-0), Yasuo (bat MF Aurora), Jinx, Ornn, Renata (1er support, ouvre la porte au 2v2). Cores détaillés dans DECKBUILDING-RULES.md (pass3).

### Rulings net-new (à connaître pour la couverture)
- **Triggers « missable »** (head judge) : Ravenbloom Student, Arena's Greatest (+1 pt), Annie (ready 2 runes EOT), Obelisk of Power, Dazzling Aurora — ne disent pas « may » → **à ANNONCER** sinon rulés ratés (points perdus en cast).
- **Draven (FAQ)** : ne peut pas passer de 6 à 8 pts seul (un seul battlefield conquis/tour) ; ne pioche pas si stun en défense. **Draven Audacious** : pas de point si l'unité est sauvée (GA/Zhonya's) ; à sa mort EN combat l'adversaire marque 1 (combo Fight or Flight = 2 pts).
- **Une carte CONTRÉE n'est pas « jouée »** (ne compte pas pour Darius re-ready / Ravenbloom Student).
- **Hidden Blade** : cible une unité **ON battlefield** uniquement. **Switcheroo** (Spirit Forge) : coût additionnel, quasi « je gagne » en 1v1.
- **Set 2 (Arata)** : might peut descendre à 0/négatif (Origins avait un plancher). **Errata** : Falling Star + Akathian/Nakathian Rain durcis (moins de kills « cheese » pour Kai'Sa).
- **Précédent « 702 / face-down zone »** : un juge peut upgrade un warning en game loss si une info de zone face-cachée est modifiée irréparablement (déjà dans cross-set-casts).

---

## Consolidation Unleashed (Set 3) — distillée de pass5→pass14 (27/06)

> Sources : guides RiftLab, tier list, meta-breakdowns RQ, Suzhou Regional, Triple Win-A-Box, podcasts, Contenders London.
> Détail par doc dans `data/video-insights/pass4..14`. **`[avis]` = caster/panel**, début de set (snapshot, pas data figée).

### 🔑 Résolution de nom : **« Aurelia » = Irelia** (Blade Dancer)
Les casters/Whisper rendent **Irelia** en « Aurelia » par intermittence (le cast "Sivir vs Irelia" dit "Aurelia" en jouant les cartes d'Irelia : Fervent, Defiant Dance, Boots, Adaptatron, Deflect). → **Aurelia ≡ Irelia, ne pas dédoubler.**

### Tier list Unleashed (snapshot panel RiftLab, `[avis]`, début de set)
- **Haut (A / candidats S)** : **MF Aurora** (seul candidat S), **Master Yi** (Aurora & mid-range/XP), **LeBlanc**, **Annie**, **Ezreal** (toolbox), **Draven**, **Azir**, **Vex** (bottom-A, « overrated » mais fort), **Irelia** (consistante, gagne Sydney), **Diana** (gagne Vancouver).
- **B** : Sivir (Aurora), Victor, Lucian, Vi, Set, Kai'Sa, Ivern, Ornn (boost Sprite Fountain), Darius, Volibear, Rek'Sai, Fiora (boostée Set 3).
- **C** : Teemo, Yasuo, Rengar (high-roll), Lillia (« overhyped » mais consistante), Pyke, Kha'Zix, Poppy (Aurora jaune), Lux.
- **D/F** : Jhin, Jinx, Garen ; Lee Sin, Leona, Rumble, Renata, Karma (F).

### Champions de tournois Unleashed (factuel)
- **Sydney RQ** : **Rico (Irelia)** — 1re victoire d'Irelia en regional. · **Hartford RQ** : **Factor (Master Yi)**. · **Vancouver RQ** (~2000 j., le + gros) : **AlanZQ (Diana) = double champion** (après Bologna). · **Suzhou Regional (CN)** : **Master Yi** (bat Irelia en finale). · **Triple Win-A-Box (Unleashed)** : **Bradykin (Ezreal control)**. · **Lille RQ** : **Squirtle/Pedro (Azir)**, invaincu. · **Contenders London** (pré-Unleashed) : **Igor (Sett)**.
- **Méta Sydney = la plus diverse jamais vue en TCG** : LeBlanc n°1 à seulement **6-7 %** (puis chaque légende a son pocket). **Aucun deck n'a un matchup favorable across-the-board.** Méta CN nettement plus **Aurora** (3/8 top 8 Suzhou) qu'à l'Ouest.

### Archétypes Unleashed à connaître
- **Archétype Aurora** (gear **Dazzling Aurora**, PAS une légende) : porté par MF (reco, ganking→Baron untargetable), Sivir (meilleure éco de runes, supérieure en miroir), Master Yi (le + consistant). **Meilleur deck game 1, plus faible games 2-3** (prévisible → l'adversaire prépare gear-hate). Core : Elder Dragon (assigne les dégâts létaux individuellement = tout à 1 HP), Mind Splitter, Stacked Deck, Flurry of Blades.
- ⭐ **Volibear « Dragon Storm »** (combo émergent Win-A-Box) : **Gem Dragon**[?] (chaque dragon → untap des runes) + **Herald of Scales** (dragons −2 énergie) + **K-Dragon**[?] (draw 4-9) → **draw/mana quasi infinie** (tour « Miracle », ~26 énergie flottante). Bat LeBlanc. À surveiller.
- **Hold decks** : Vex (tenir 1 battlefield + draw), Ivern (Brush), Master Yi (+2 défense). **Réponse obligatoire = Unchecked Power / Downwell** (clear un battlefield 12+ might → reset). Ezreal bat Vex en renvoyant la Vex à la main (Rebuke/Star-Crossed reset le moteur).

### Ban-watch (`[avis]` casters/panels)
- **Vex Apathetic** = candidat n°1 : **« floodgate »** (0 power cost + Deflect + stun les unités jouées → contraint l'adversaire). ~26 % des decks à Hartford. Contre structurel de tokens/sprites/Reflections **et** des sand soldiers d'Arise (Azir).
  ⚠️ **Ne pas confondre la carte et la légende** : il s'agit de la **carte** *Vex, Apathetic*, jouée un peu partout. La **légende** *Vex, Gloomist* ne pèse que **2,4 % du field à Hartford** (40 decks sur 1 659, aucun Top 64) et 4,4 % au National. Mesure sur les 947 listes du National : la carte est en deck principal dans 11,2 % des listes et en réserve dans 5,9 %.
- **Lux loop via carte Echo** = combo infini non-intentionnel (« glitch ») → candidat ban unanime (existe aussi en Echo+Jhin).
- **Ferrous Forerunner** = polarisant (certains decks sans réponse) ; **Defy** ultra-omniprésent (40 % des decks, contre ~70-75 % des sorts).

### Rulings Unleashed consolidés (cf. pass7/11/12/13/14)
- **Defy sur Sacrifice / Death Grip / Heedless Resurrection ne sauve PAS l'unité** (le kill = un coût → l'unité meurt quand même, et proc les death-knells, ex. les 3 Immortal Phoenix de Rek'Sai).
- **Elder Dragon** : inflige des dégâts à **toutes** les unités du battlefield, mais l'effet « tout dégât est létal » ne touche que les unités **ennemies**. · **Baron Nashor** : +2 à toutes tes unités, **untargetable**, va au Baron Pit depuis n'importe où (mais ouvre une 3e zone à conquérir). · **Repulse** ne stoppe pas l'Elder (ne « select » pas une seule unité).
- **Fizz** recycle l'**Arcane Shift** (override le banish). · **Flash** sauve une unité d'Elder Dragon. · **The Watcher** ne cible pas (pas de coût de flag) → mais **Not So Fast** marche dessus. · **Bullet Time** : on paie le power à la résolution.
- **Contrôle de battlefield figé tant qu'il y a un truc sur la chain** → tue le combo Lillia/Rengar « conquérir au tour adverse » ; permet Glasc Mixologist / Zhonya's-sur-Lonely-Poro.
- **Emperor's Dais** (ruling) : refuser de payer l'énergie → pas de token mais bounce l'unité (réabus on-play). · **Symbol of the Solari** = carte cassée (plus d'égalités dans le jeu).
- **Erreur de présentation** (ex. 10 runes au lieu de 12, ou champion oublié) = **game loss** une fois la partie commencée. · La Chine garde la règle **« missed trigger » punitive** (channel/draw + pass = point perdu).

### Tech anti-archétype clés
- **Anti-Aurora** : **Akshan** (unité green/orange : vole/tue le gear → l'Aurora ; dur à empêcher car l'anti-gear est surtout des sorts recyclables via Sabotage) — MAIS **Possession** (Aurora) re-vole l'Akshan. **Adaptatron** main-deck (Irelia, action-speed). **Divine Judgment** (Garen/Sett : reset, non-Defyable). **Sabotage** (Sett/Sivir : arrache l'Aurora).
- **Anti-Irelia** : « Irelia trap » (Akshan retire sa protection + Charm dans Vilemaw) ; Kha'Zix **Faefolk + Forbidding Waste** (isole Irelia en défenseur seul -2 → ambush kill).
- **Anti-LeBlanc** : **Challenge** (tue Karthus T2, déni du moteur death-knell) ; bouncer pas tuer (Rebuke/Star-Crossed) ; discard.
