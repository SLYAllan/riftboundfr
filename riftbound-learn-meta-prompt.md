# Prompt Claude Code — Apprentissage avancé Riftbound (v2)

## Ce qui a changé par rapport à v1

La v1 du prompt se concentrait sur le **scraping et la documentation** : fetcher des guides, structurer en JSON, compiler un META-KNOWLEDGE. C'est fait (17 fiches, 7 meta reports, 8 CC, decklists Sydney).

La v2 ajoute **3 nouvelles capacités** :
1. **Deckbuilding intelligence** — comprendre POURQUOI un deck marche et savoir en créer de zéro
2. **Analyse de patterns de decklists** — extraire les règles de construction depuis les données existantes
3. **Analyse vidéo/audio** — transcrire et analyser du gameplay commenté

---

## PARTIE A — Deckbuilding Intelligence

### Objectif

Claude Code doit pouvoir :
- Créer un deck compétitif à partir de zéro pour une Legend donnée
- Adapter un deck existant à un méta donné (tech choices, sideboard)
- Expliquer pourquoi chaque carte est incluse et quelle est son rôle
- Proposer des builds pour un archétype donné (aggro, contrôle, midrange, combo, hold)
- Identifier les cartes interchangeables et les flex slots

### Étape 1 : Construire la base de données de patterns (DECKBUILDING-RULES.md)

Créer un fichier `DECKBUILDING-RULES.md` en analysant TOUTES les decklists dans `data/` et le META-KNOWLEDGE.md. Ce fichier encode les règles implicites de construction de decks Riftbound, déduites des listes gagnantes.

#### Structure du DECKBUILDING-RULES.md

```markdown
# DECKBUILDING-RULES.md — Règles de construction de decks Riftbound

## 1. Règles universelles (toutes les légendes)

### Structure standard d'un deck 40 cartes
- Champion copies : toujours 3x le Chosen Champion
- Signature spells : quasi-toujours 3x (exceptions à documenter)
- Courbe d'énergie : compter le nombre de cartes par coût
  - Coût 1-2 : X cartes en moyenne (range min-max)
  - Coût 3-4 : X cartes en moyenne
  - Coût 5-6 : X cartes en moyenne
  - Coût 7+ : X cartes en moyenne
- Ratio unités/sorts/gears : X/Y/Z en moyenne

### Rune Deck patterns
- Split standard : le plus courant est 6/6 (les 2 domains de la Legend)
- Quand dévier : 7/5 (exemples de légendes qui le font et pourquoi)
- Runes avancées vs basiques : quelles legends utilisent des runes non-basiques

### Battlefields patterns
- Les 3 battlefields les plus joués globalement (avec stats si dispo)
- Pattern par archétype (aggro → BF rapides, control → BF value)
- Battlefields tech (anti-meta) et quand les prendre

### Cards universelles (jouées dans >50% des decks de leur domain)
- Par domain, lister les staples

## 2. Règles par archétype

### Aggro
- Philosophie : gagner vite, scorer 8 points avant que l'adversaire stabilise
- Courbe idéale : lourde sur 1-3 cost, très peu de 5+
- Nombre d'unités : X+
- Nombre de sorts : X (principalement combat tricks, pas de draw)
- Keywords clés : Accelerate (entrer ready), Ganking (pression multi-BF)
- Win condition : tempo + conquête rapide, eviter le late game
- Exemples de légendes aggro : Jinx, Diana (aggro build), Lillia
- Pattern commun : [liste de cartes récurrentes dans les builds aggro]
- Erreurs courantes : trop de cartes chères, pas assez de tricks de combat

### Midrange
- Philosophie : unités efficaces, dominer le board mid-game, finir avec des bombs
- Courbe idéale : distribution uniforme 2-5, quelques finishers
- Nombre d'unités : X
- Nombre de sorts : X (mix tricks + removal)
- Keywords clés : Shield, Assault, Mighty interactions
- Win condition : board presence supérieure + scoring progressif
- Exemples : Irelia, Master Yi (Bladesman), Fiora, Sett, Rengar
- Pattern commun : [cartes récurrentes]

### Contrôle
- Philosophie : répondre aux menaces adverses, gagner en value long terme
- Courbe idéale : plus de 4+ que les autres archétypes
- Keywords clés : Reaction, Hidden, Stun
- Win condition : épuiser l'adversaire, scorer via Hold en late
- Exemples : Vex, Ezreal, Kai'Sa (control build)
- Pattern commun : disruption main (OGN-192), contresorts (OGN-045), board clears

### Combo
- Philosophie : assembler des pièces pour une win condition explosive
- Exemples : LeBlanc (Deathknell engine UNL-172 + OGN-236), Aurora builds (OGN-160)
- Cartes draw essentielles : [liste]
- Setup : combien de tours pour assembler le combo

### Hold / Value
- Philosophie : scorer des points via Hold (maintenir le contrôle des BF entre les tours)
- Keywords clés : Ambush (défense surprise), Shield, Tank
- Exemples : Master Yi (Bladesman), certains Azir builds
- Cartes clés : unités à fort Might qui restent en place

## 3. Règles par paire de Domains

### Calm/Body (ex: Master Yi, Fiora)
- Staples partagés : [cartes présentes dans >70% des decks Calm/Body]
- Rune split recommandé : X/Y
- Sorts interactifs typiques : [liste]

### Calm/Order (ex: Irelia, Azir)
- Staples partagés : ...

### Chaos/Mind (ex: Diana, Ezreal, Teemo)
- Staples partagés : ...

### Chaos/Fury (ex: Draven, Annie)
- Staples partagés : ...

### Body/Fury (ex: Rengar, Kha'Zix)
- Staples partagés : ...

### Mind/Order (ex: LeBlanc)
- Staples partagés : ...

[...compléter toutes les paires de domains actives...]

## 4. Cartes flex et tech choices

### Cartes flex (interchangeables selon le méta)
- Slot "removal 4-cost" : [carte A] vs [carte B] — prendre A si méta aggro, B si méta control
- Slot "finisher" : OGN-160 vs OGN-242 — Aurora si on veut board presence, Gear si on veut burst
- ...

### Tech cards (anti-méta)
- vs Aggro : [cartes qui punissent l'aggro, stun, heal, tank]
- vs Control : [cartes qui passent sous les réactions, pression constante]
- vs OGN-160 (Aurora) : [gear removal, OGN-056]
- vs Deathknell (LeBlanc) : [banish au lieu de kill, silence effects]
- vs Hold (Master Yi) : [aggression rapide, forcer les combats]

## 5. Sideboard rules

### Principes de sideboard
- Combien de cartes en side : typiquement X (selon le format)
- Quand sideboard : entre les games en BO3
- Ce qu'on side IN vs aggro / vs control / vs combo
- Cartes de side universelles (jouées dans beaucoup de sides)

### Battlefields en sideboard
- 3 BF dont 1 choisi : le choix dépend de si on joue 1er ou 2ème
- Quel BF en Game 1 (blind) vs Game 2-3 (adaptatif)
```

#### Comment générer ce fichier

1. Lire TOUTES les decklists dans `data/decklists/` (organisées par Legend) + les listes dans META-KNOWLEDGE.md
2. Pour chaque légende avec 5+ decklists (idéalement 15+), comparer les listes et extraire :
   - Le **core** (cartes présentes dans 90-100% des listes) — ce sont les auto-includes
   - Le **standard** (cartes présentes dans 60-89%) — quasi-staples, rarement coupées
   - Le **flex** (cartes présentes dans 30-59%) — choix méta-dépendant
   - Les **tech** (cartes présentes dans <30%, souvent 1-of) — anti-méta spécifique
   - Les **spicy** (cartes présentes dans 1-2 listes seulement) — innovations de joueurs individuels
3. Croiser les données par paire de Domains pour trouver les staples partagés
4. Compter les courbes de mana moyennes par archétype (sur l'ensemble des listes collectées)
5. Analyser les sideboards pour trouver les patterns de swap
6. Comparer les builds gagnants (top 4) vs les builds éliminés (top 32+) pour identifier ce qui fait la différence
7. Identifier les évolutions : une carte qui passe de 20% à 80% d'inclusion en 2 semaines = trend à noter
8. **Mettre à jour les stats** : pour chaque carte dans chaque Legend, noter "présente dans X/Y listes (Z%)"

### Étape 2 : Créer un deck à la demande

Quand on te demande de créer un deck, suis cette procédure :

```
ENTRÉE : Legend + Archétype souhaité (optionnel) + Contraintes (budget, méta ciblé, etc.)

1. IDENTIFIER les domains de la Legend → déterminer les cartes autorisées
2. CHOISIR l'archétype si non spécifié → analyser la Legend ability pour déterminer le meilleur fit
3. SÉLECTIONNER le Champion Unit → choisir entre les 2 options (1 par Domain)
4. AJOUTER les 3 Signatures → quasi-automatique
5. CONSTRUIRE le core → piocher dans les staples du domain pair + les cartes clés de la Legend (depuis la fiche)
6. AJUSTER la courbe de mana → vérifier qu'elle correspond à l'archétype visé
7. REMPLIR les flex slots → choisir en fonction du méta ciblé (tech cards)
8. CONSTRUIRE le Rune Deck → 12 runes, split selon le deck
9. CHOISIR 3 Battlefields → 1 aggressif, 1 défensif, 1 polyvalent (ou selon l'archétype)
10. CONSTRUIRE le Sideboard → cartes pour s'adapter aux matchups difficiles

SORTIE : Decklist complète + guide (gameplan early/mid/late, mulligan, matchups, tips)
```

### Étape 3 : Validation d'un deck

Quand on te soumet un deck à évaluer, vérifie :

```
CHECKLIST DE VALIDATION :
[ ] 40 cartes exactement dans le Main Deck
[ ] 12 runes dans le Rune Deck
[ ] 3 battlefields
[ ] Max 3 copies de chaque carte nommée
[ ] Max 3 signatures (même Champion tag que la Legend)
[ ] Toutes les cartes respectent la Domain Identity (2 domains de la Legend)
[ ] Le Chosen Champion est une Champion Unit avec le bon tag
[ ] La courbe de mana est cohérente avec l'archétype
[ ] Le deck a un plan de jeu clair (pas un pile de bonnes cartes sans synergie)
[ ] Le deck a des interactions de combat (pas que des unités vanilla)
[ ] Le deck a une win condition identifiable
```

---

## PARTIE B — Analyse de patterns de decklists (enrichissement continu)

### Sources de decklists à scraper régulièrement

Les decklists sont la matière première. Plus Claude Code en voit, meilleur il devient pour en créer.

**Sources prioritaires (scrappables) :**

1. **riftrank.com** — Tournois complets avec decklists
   - `/tournaments` — liste tous les tournois
   - `/tournaments/results/{id}` — résultats détaillés
   - Inclut les City Challenges chinoises (Xi'an, Beijing, Shanghai, etc.)
   - Tester : `curl -s "https://www.riftrank.com/tournaments"`

2. **riftmana.com** — Decklists filtrables
   - `/tournaments/` — filtre par event type, Legend, placement
   - Inclut Jhin, Pyke et les nouvelles Legends Unleashed

3. **mobalytics.gg** — Decklists + tier list
   - `/riftbound/decks` — toutes les decklists
   - `/riftbound/tournaments/{slug}` — résultats par tournoi

4. **riftboundstats.com** — 12 000+ decklists
   - `/decks` — filtrables par legend/format/placement

5. **piltoverarchive.com** — Decklists communautaires
   - `/decks` — parcourir les builds

**Source bloquée (403, utiliser web search comme fallback) :**
- riftdecks.com — 139 000+ decks, la plus grosse base mais inaccessible directement

### Workflow d'enrichissement continu

**IMPORTANT : ne pas se limiter au top 8.** Plus on a de decklists, meilleurs seront les patterns extraits. L'objectif est de collecter le MAXIMUM de decklists disponibles par tournoi — top 8, top 16, top 32, top 64, voire toutes les listes soumises quand elles sont publiques.

```
1. Fetch les derniers résultats de tournoi (riftrank.com, riftmana.com, mobalytics.gg)
2. Pour chaque tournoi récent non encore analysé :
   a. Extraire TOUTES les decklists disponibles, pas juste le top 8 :
      - Top 8 en priorité (les listes gagnantes)
      - Top 16 / Top 32 (les listes compétitives)
      - Top 64 et au-delà si dispo (le volume aide à détecter les patterns)
      - Les listes "Best Of" par Legend (certains sites comme mobalytics les mettent en avant)
   b. Sauvegarder chaque decklist dans data/decklists/{legend-slug}/{tournament-slug}-{placement}-{player}.json
   c. Sauvegarder le résumé du tournoi dans data/tournaments/{slug}.json
   d. Pour chaque decklist, enrichir la fiche Legend correspondante
3. Relancer l'analyse de patterns (DECKBUILDING-RULES.md) avec les nouvelles données
4. Recompiler META-KNOWLEDGE.md
```

**Pourquoi collecter au-delà du top 8 :**
- Un deck top 32 qui joue une tech card inhabituelle peut révéler un pattern émergent
- Plus d'échantillons par Legend = meilleure identification du core vs flex
- Les listes qui ont perdu en top 16 apprennent autant que les gagnantes (qu'est-ce qui leur manquait ?)
- Les "Best Of" par Legend dans les gros tournois (Sydney avait 34 légendes) montrent le meilleur build possible même pour des Legends Tier 3-4
- Les City Challenges chinoises publient souvent TOUS les decks des 128 joueurs — c'est une mine d'or

**Volume cible par Legend :**
- Tier 1-2 : viser 20+ decklists différentes minimum
- Tier 3 : viser 10+ decklists
- Tier 4-5 : prendre tout ce qui est dispo (même 3-5 listes aident)

**Dédoublonnage :** si 2 listes sont identiques à 1-2 cartes près (même joueur, même semaine), ne garder que la plus récente mais noter le nombre de duplicatas — ça confirme que le "core" est verrouillé.

### Organisation des fichiers decklists

```
data/
├── decklists/                     # TOUTES les decklists, organisées par Legend
│   ├── irelia-blade-dancer/
│   │   ├── sydney-rq-1st-rico1997.json
│   │   ├── sydney-rq-5th-ghosterdriver.json
│   │   ├── suzhou-rq-finalist.json
│   │   ├── changsha-cc-2nd.json
│   │   ├── beijing-cc-8th.json
│   │   ├── online-weekly-3rd-player.json
│   │   └── ...                    # Viser 20+ fichiers par Legend T1
│   ├── master-yi-wuju-bladesman/
│   │   ├── suzhou-rq-1st.json
│   │   ├── changsha-cc-1st.json
│   │   └── ...
│   ├── diana-scorn-of-the-moon/
│   │   └── ...
│   └── ...
├── decklists-index.json           # Index de toutes les decklists avec métadonnées
└── ...
```

**decklists-index.json** — fichier index pour requêter rapidement :
```json
{
  "totalDecklists": 247,
  "byLegend": {
    "Irelia, Blade Dancer": { "count": 28, "bestPlacement": 1, "tournaments": 12 },
    "Master Yi, Wuju Bladesman": { "count": 22, "bestPlacement": 1, "tournaments": 10 },
    "Diana, Scorn of the Moon": { "count": 18, "bestPlacement": 3, "tournaments": 8 }
  },
  "byTournament": {
    "Sydney Regional Qualifier": { "count": 40, "date": "2026-05-16", "totalPlayers": 1405 },
    "Changsha CC": { "count": 8, "date": "2026-04-19", "totalPlayers": 64 }
  },
  "lastUpdated": "2026-05-24"
}
```

### Scraping en masse — stratégie par source

**riftrank.com** (meilleure source pour le volume)
- La page `/tournaments/results/{id}` contient souvent les standings complets avec 50-100+ decklists
- Paginer les résultats : top 8, puis top 16-32, puis top 64+
- Les City Challenges chinoises publient quasi tous les decks

**mobalytics.gg** (bonne pour les "Best Of" par Legend)
- La page `/riftbound/tournaments/{slug}` liste les "Best Of" : le meilleur résultat de chaque Legend
- Parfait pour couvrir les Legends Tier 3-5 qui n'apparaissent pas en top 8

**riftmana.com** (bonne pour filtrer)
- Filtrer par Legend + All Placements pour avoir le max de listes
- Filtrer par "Top 4" ou "Top 2" pour ne garder que les meilleures si on veut du quality over quantity

**riftboundstats.com** (12 000+ decklists)
- Le volume le plus important si accessible
- Filtrer par legend + set actuel pour les données pertinentes

### Format de stockage des decklists (pour analyse de patterns)

Chaque decklist doit être stockée de manière structurée pour permettre l'analyse croisée :

```json
{
  "id": "sydney-rq-1st-irelia",
  "legend": "Irelia, Blade Dancer",
  "champion": "Irelia, Fervent",
  "player": "EDG Rico1997",
  "tournament": "Sydney Regional Qualifier",
  "date": "2026-05-16",
  "placement": 1,
  "record": "14-1-1",
  "set": "Unleashed",
  "archetype": "Tempo",
  "domains": ["Calm", "Order"],
  "mainDeck": [
    { "name": "Defiant Dance", "quantity": 3, "type": "Spell", "cost": 2, "domain": "Calm", "role": "signature" },
    { "name": "Lonely Poro", "quantity": 3, "type": "Unit", "cost": 1, "domain": "Calm", "role": "early_unit" }
  ],
  "runes": { "Calm": 6, "Order": 6 },
  "battlefields": ["Abandoned Hall", "Aspirant's Climb", "Sunken Temple"],
  "sideboard": [],
  "notes": "Build standard post-Sydney"
}
```

Le champ `role` est CRUCIAL pour l'analyse de patterns. Catégories possibles :
- `signature` — sort signature du champion
- `champion` — copies du champion unit
- `early_unit` — unité 1-3 cost pour le board early
- `mid_threat` — unité 4-6 cost, menace principale
- `finisher` — carte 7+ ou win condition
- `combat_trick` — sort interactif pour le combat/showdown
- `removal` — sort qui tue/stun/bounce une unité adverse
- `draw` — carte qui pioche
- `ramp` — carte qui accélère les ressources
- `tech` — carte anti-méta spécifique
- `flex` — slot interchangeable
- `engine` — pièce de combo ou synergie récurrente
- `protection` — sort défensif (contresort, shield, heal)
- `equipment` — gear permanent

---

## PARTIE C — Analyse vidéo/audio de gameplay

### Objectif

Permettre à Claude Code d'apprendre le gameplay Riftbound en analysant des vidéos/audios de parties commentées, deck techs, et analyses de tournois.

### Solution : Pipeline yt-dlp + Whisper + Claude Code

Le pipeline fonctionne en 3 étapes :

```
Vidéo YouTube → yt-dlp (extract audio) → Whisper (transcription) → Claude Code (analyse)
```

### Étape 1 : Setup

```bash
# Installer les outils
pip install yt-dlp openai-whisper --break-system-packages
# OU pour Whisper plus rapide (si GPU dispo) :
pip install faster-whisper --break-system-packages

# Vérifier ffmpeg (nécessaire pour yt-dlp)
ffmpeg -version || sudo apt install -y ffmpeg
```

### Étape 2 : Extraction du transcript (2 méthodes)

#### Méthode A — Sous-titres auto YouTube (rapide, gratuit, pas toujours dispo)

```bash
# Extraire les sous-titres auto d'une vidéo YouTube
yt-dlp --write-auto-sub --sub-lang en,fr --skip-download \
  --convert-subs srt -o "data/videos/%(id)s" "URL_VIDEO"

# Convertir le .srt en texte propre
cat data/videos/VIDEO_ID.en.srt | \
  grep -v '^[0-9]' | \
  grep -v '^\s*$' | \
  grep -v '\-\->' | \
  sed 's/<[^>]*>//g' | \
  awk '!seen[$0]++' \
  > data/videos/VIDEO_ID-transcript.txt
```

#### Méthode B — Whisper local (plus lent, plus fiable, fonctionne sur tout)

```bash
# 1. Télécharger l'audio seul (léger)
yt-dlp -x --audio-format mp3 --audio-quality 5 \
  -o "data/videos/%(id)s.%(ext)s" "URL_VIDEO"

# 2. Transcrire avec Whisper (modèle "base" = rapide, "medium" = meilleur)
whisper "data/videos/VIDEO_ID.mp3" \
  --language fr \
  --model base \
  --output_format txt \
  --output_dir data/videos/
```

Pour les vidéos EN commentées en anglais :
```bash
whisper "data/videos/VIDEO_ID.mp3" --language en --model base --output_format txt --output_dir data/videos/
```

#### Méthode C — Whisper via l'API OpenAI (le plus rapide, payant ~$0.006/min)

```bash
# Si on a une clé OpenAI
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@data/videos/VIDEO_ID.mp3" \
  -F model="whisper-1" \
  -F language="en" \
  > data/videos/VIDEO_ID-transcript.txt
```

### Étape 3 : Extraction de frames clés (optionnel, pour le board state)

```bash
# Extraire 1 frame toutes les 60 secondes (pour voir le board state)
mkdir -p data/videos/VIDEO_ID-frames
ffmpeg -i "data/videos/VIDEO_ID.mp4" \
  -vf "fps=1/60" \
  -q:v 5 \
  "data/videos/VIDEO_ID-frames/frame_%04d.jpg"

# Extraire juste les frames importantes (début de chaque tour par exemple)
# → Claude Code peut analyser les images avec view
```

### Étape 4 : Claude Code analyse le transcript

Une fois le transcript disponible dans `data/videos/VIDEO_ID-transcript.txt`, Claude Code le lit avec `view` ou `cat` et en extrait une fiche structurée.

#### Prompt d'analyse vidéo gameplay

```
Analyse ce transcript de gameplay Riftbound et extrais :

1. DECK JOUÉ : Legend, Champion, archétype identifié
2. MATCHUP : vs quelle Legend/archétype
3. GAMEPLAN OBSERVÉ :
   - Mulligan : quelles cartes gardées/renvoyées et pourquoi
   - Tour par tour (si détaillé) : actions clés à chaque tour
   - Moments décisifs : quel play a décidé de la partie
4. CARTES CLÉS : quelles cartes ont eu le plus d'impact et pourquoi
5. ERREURS : est-ce que le joueur/commentateur mentionne des erreurs ou des plays alternatifs
6. MATCHUP INSIGHT : qu'est-ce qu'on apprend sur ce matchup spécifique
7. LEÇONS : conseils généralisables pour ce deck/archétype
```

#### Prompt d'analyse vidéo deck tech

```
Analyse ce deck tech Riftbound et extrais :

1. DECK : Legend, Champion, decklist complète si mentionnée
2. CHOIX DE CARTES : pourquoi chaque carte est incluse (si expliqué)
3. FLEX SLOTS : quelles cartes sont interchangeables et les alternatives
4. MATCHUPS : quels matchups sont discutés, qu'est-ce qui est favorable/défavorable
5. MÉTA POSITIONING : comment ce deck se positionne dans le méta actuel
6. TIPS : conseils de pilotage mentionnés
```

### Étape 5 : Stocker les analyses vidéo

```json
// data/videos/{video-id}-analysis.json
{
  "videoId": "YouTube_ID",
  "title": "Titre de la vidéo",
  "channel": "Nom de la chaîne",
  "language": "en",
  "type": "gameplay | deck_tech | tournament_recap | meta_analysis",
  "date": "2026-05-20",
  "legend": "Irelia, Blade Dancer",
  "opponent": "Diana, Scorn of the Moon",
  "result": "win",
  "keyInsights": [
    "Garder Defiant Dance dans le mulligan vs Diana est crucial",
    "Ne jamais Conquer le BF de droite avant d'avoir 3 unités"
  ],
  "cardsHighlighted": ["SFD-057", "UNL-150"],
  "matchupNotes": "Irelia est favorisée si elle score 2 points aux tours 3-4",
  "errors": ["Le joueur aurait dû Hidden son spell au lieu de le jouer direct"],
  "transcriptPath": "data/videos/VIDEO_ID-transcript.txt"
}
```

### Chaînes YouTube recommandées pour le scraping de transcripts

```
# Deck techs et analyses méta EN
- Runeterra School / Riftbound School
- SkillCapped Riftbound
- MegaM0gwai (si il couvre Riftbound)
- Total TCG (cardsrealm, couvert dans les sources web)

# Gameplay commenté
- Tournois officiels Riot (Twitch VODs → YouTube)
- Feature matches des Regional Qualifiers

# Contenu FR (pour ton site)
- Solary Riftbound (si existant)
- Contenu FR communautaire
```

### Script complet pour automatiser

```bash
#!/bin/bash
# analyze-video.sh — Pipeline complet pour une vidéo YouTube
# Usage : ./analyze-video.sh "https://youtube.com/watch?v=XXXXX" "gameplay" "irelia"

URL=$1
TYPE=${2:-gameplay}  # gameplay, deck_tech, meta_analysis
LEGEND=${3:-unknown}

# Extraire l'ID de la vidéo
VIDEO_ID=$(echo "$URL" | grep -oP '(?<=v=)[^&]+' || echo "$URL" | grep -oP '(?<=youtu\.be/)[^?]+')

echo "📥 Downloading audio for $VIDEO_ID..."
mkdir -p data/videos

# Essayer les sous-titres auto d'abord
yt-dlp --write-auto-sub --sub-lang en,fr --skip-download \
  --convert-subs srt -o "data/videos/$VIDEO_ID" "$URL" 2>/dev/null

if [ -f "data/videos/$VIDEO_ID.en.srt" ] || [ -f "data/videos/$VIDEO_ID.fr.srt" ]; then
  echo "✅ Subtitles found, extracting text..."
  LANG_FILE=$(ls data/videos/$VIDEO_ID.*.srt 2>/dev/null | head -1)
  cat "$LANG_FILE" | \
    grep -v '^[0-9]' | grep -v '^\s*$' | grep -v '\-\->' | \
    sed 's/<[^>]*>//g' | awk '!seen[$0]++' \
    > "data/videos/$VIDEO_ID-transcript.txt"
else
  echo "⚠️ No subtitles, downloading audio for Whisper..."
  yt-dlp -x --audio-format mp3 --audio-quality 5 \
    -o "data/videos/$VIDEO_ID.%(ext)s" "$URL"
  
  echo "🧠 Transcribing with Whisper..."
  whisper "data/videos/$VIDEO_ID.mp3" \
    --language en --model base --output_format txt \
    --output_dir data/videos/
fi

echo "📝 Transcript ready at data/videos/$VIDEO_ID-transcript.txt"
echo "👉 Now ask Claude Code to read and analyze it:"
echo "   view data/videos/$VIDEO_ID-transcript.txt"
```

---

## PARTIE D — Commandes à donner à Claude Code

Copie-colle ces prompts directement dans Claude Code selon ce que tu veux faire.

---

### 🔄 Réanalyser tous les decks et reconstruire les patterns

> Lis le prompt `riftbound-learn-meta-prompt-v2.md`. Ensuite :
> 1. Lis toutes les decklists dans `data/decklists/` et celles du `META-KNOWLEDGE.md`
> 2. Pour chaque Legend, compare toutes les listes disponibles et identifie le core (90%+), le standard (60-89%), le flex (30-59%), les tech (<30%), et les spicy (1-2 listes)
> 3. Calcule les courbes de mana moyennes par archétype (aggro, midrange, contrôle, combo, hold)
> 4. Identifie les staples par paire de Domains
> 5. Compare les builds gagnants (top 4) vs les éliminés (top 32+) — qu'est-ce qui différencie ?
> 6. Génère le fichier `DECKBUILDING-RULES.md` complet avec toutes ces règles
> 7. Mets à jour `decklists-index.json` avec les stats globales

---

### 📥 Scraper de nouvelles decklists (maximum de volume)

> Lis le prompt `riftbound-learn-meta-prompt-v2.md`. Scrape le maximum de decklists depuis les sources suivantes. Ne te limite PAS au top 8 — prends tout ce qui est dispo (top 16, 32, 64, toutes les listes publiées) :
> 
> Sources à scraper :
> - riftrank.com/tournaments — tous les tournois récents, paginer les résultats
> - riftmana.com/tournaments — filtrer par Legend, prendre tous les placements
> - mobalytics.gg/riftbound/decks — "Best Of" par Legend + decklists de tournois
> - riftboundstats.com/decks — filtrer par set Unleashed
>
> Pour chaque decklist, sauvegarde un JSON dans `data/decklists/{legend-slug}/` avec le format défini dans le prompt. Mets à jour `decklists-index.json` à la fin.
> Objectif : 20+ listes par Legend Tier 1-2, 10+ par Tier 3, tout ce qui est dispo pour le reste.

---

### 📥 Scraper un tournoi spécifique

> Scrape TOUTES les decklists disponibles du tournoi [NOM DU TOURNOI] sur [SOURCE]. Pas juste le top 8 — prends le top 32 minimum, top 64+ si dispo. Sauvegarde chaque decklist dans `data/decklists/{legend-slug}/` et le résumé dans `data/tournaments/`. Mets à jour `decklists-index.json`.

---

### 🧠 Créer un deck à partir de zéro

> Lis `DECKBUILDING-RULES.md` et la fiche Legend de [NOM DE LA LEGEND] dans `data/fiches/`. Consulte aussi toutes les decklists disponibles pour cette Legend dans `data/decklists/`. 
> 
> Crée un deck [ARCHÉTYPE : aggro/midrange/contrôle/combo/hold] pour [NOM DE LA LEGEND] optimisé pour le méta actuel (post-Sydney Unleashed). 
> 
> Produis :
> - La decklist complète (40 main + 12 runes + 3 battlefields + sideboard)
> - Pour chaque carte, explique son rôle (core/flex/tech)
> - Le gameplan (early/mid/late + win condition)
> - Le guide mulligan (garder/renvoyer selon matchup)
> - Les matchups clés (favorable/défavorable/even)
> - Les tips pour un débutant
> - Les flex slots et quoi mettre à la place selon le méta

---

### 🔍 Évaluer / améliorer un deck soumis

> Lis `DECKBUILDING-RULES.md`. Voici un deck que je veux évaluer :
> 
> [COLLER LE DECK CODE]
> 
> Analyse-le : est-il légal ? La courbe de mana est-elle cohérente avec son archétype ? Quelles cartes sont core, flex, ou discutables ? Compare-le aux listes gagnantes de la même Legend. Propose des améliorations concrètes (quoi couper, quoi ajouter, pourquoi).

---

### 📊 Mettre à jour la tier list

> Lis les derniers résultats de tournois dans `data/tournaments/` et les decklists dans `data/decklists/`. Compare avec la tier list actuelle dans `META-KNOWLEDGE.md`. 
> 
> Pour chaque Legend, détermine la tendance (up/down/stable/new). Vérifie si des cartes sont apparues ou disparues des listes. Mets à jour la section tier list du META-KNOWLEDGE.md.

---

### 🎬 Analyser une vidéo YouTube

> Installe yt-dlp et whisper si pas encore fait :
> ```
> pip install yt-dlp openai-whisper --break-system-packages
> sudo apt install -y ffmpeg
> ```
> 
> Puis lance le pipeline sur cette vidéo : [URL]
> Type : [gameplay / deck_tech / meta_analysis / tournament_recap]
> Legend : [NOM si connu]
>
> 1. Extraire les sous-titres auto ou transcrire avec Whisper
> 2. Lire le transcript et créer une fiche d'analyse dans `data/videos/`
> 3. Si deck tech : extraire la decklist et l'ajouter dans `data/decklists/`
> 4. Si gameplay : extraire les insights matchup et enrichir la fiche Legend

---

### 📝 Enrichir les connaissances méta (workflow complet)

> Lis le prompt `riftbound-learn-meta-prompt-v2.md` et exécute le workflow complet :
> 1. Scrape les derniers tournois depuis riftrank.com, riftmana.com, mobalytics.gg — prends TOUTES les decklists dispo, pas juste le top 8
> 2. Sauvegarde chaque decklist dans `data/decklists/{legend-slug}/`
> 3. Enrichis les fiches Legend avec les nouvelles données
> 4. Relance l'analyse de patterns et mets à jour `DECKBUILDING-RULES.md`
> 5. Recompile `META-KNOWLEDGE.md`
> 6. Mets à jour `decklists-index.json`

---

### 🆕 Ajouter un nouveau meta report

> Un nouveau meta report est sorti : [URL]. Fetch-le, analyse-le, sauvegarde-le dans `data/meta-reports/`. Mets à jour la tier list et les observations méta dans `META-KNOWLEDGE.md`.

---

### 🆕 Ajouter un nouveau guide de Legend

> Un nouveau guide est sorti pour [LEGEND] : [URL]. Fetch-le, crée la fiche dans `data/fiches/{slug}.json`, et ajoute la Legend dans le META-KNOWLEDGE.md.

---

## Variables d'environnement nécessaires

```bash
# Optionnel — seulement si on utilise Whisper via l'API OpenAI
OPENAI_API_KEY=sk-...

# Rien d'autre n'est nécessaire — tout le reste est fait par Claude Code directement
```

## Dépendances à installer (une seule fois)

```bash
# Pour l'analyse vidéo/audio
pip install yt-dlp --break-system-packages
pip install openai-whisper --break-system-packages  # OU faster-whisper
sudo apt install -y ffmpeg

# Vérification
yt-dlp --version
whisper --help
ffmpeg -version
```
