# Prompt Claude Code — Upgrade Deckbuilder Riftbound France

## Contexte

Tu travailles sur **Riftbound France** (riftboundfrance.fr), un site Next.js 16 / React 19 / Tailwind CSS 4 / Prisma 6 / PostgreSQL. Le deckbuilder existe déjà dans `src/app/deckbuilder/page.tsx` avec un layout 2 colonnes (card browser gauche, deck panel droite), un système de tabs (Légende → Main/Side → Runes → Battlefields), et un import/export par deck code.

Le problème : **le deckbuilder actuel est fonctionnel mais basique comparé aux concurrents**. Il faut le faire passer au niveau supérieur en s'inspirant des meilleurs features des sites concurrents, tout en gardant l'ADN "accessible aux débutants" du site.

---

## Analyse concurrentielle — Ce que font les meilleurs

### Piltover Archive (piltoverarchive.com/deckbuilder)
**Points forts à copier :**
- **Workflow guidé visuel** : les sections du deck (Legend 0/1, Champion 0/1, Battlefields 0/3, Runes 0/12, Main Deck 0/40) sont affichées comme des slots visuels avec compteurs. L'utilisateur VOIT sa progression.
- **Choix de ruleset** : Compétitif (règles strictes) vs Casual (aucune restriction). À implémenter chez nous.
- **Visibilité du deck** : Draft (pas de requis, privé) / Private (requis respectés, partageable par lien) / Public (visible dans la library).
- **Calcul auto des runes** basé sur les coûts de pouvoir du deck.
- **Deck codes format LoR** adapté pour Riftbound.
- **Proxy printing** directement depuis la page deck — génère un PDF imprimable des cartes du deck.
- **Vue Compact vs Full** : Compact montre la variante de base, Full montre toutes les variantes (alt art, foil, etc.)

### RiftMana (riftmana.com/deck-builder/)
**Points forts à copier :**
- **Filtres avancés par slash-command** : `/id`, `/keyword`, `/power`, `/might`, `/tags`, `/ability`, `/flavor`, `/artist`. Recherche unifiée ultra-puissante dans un seul champ.
- **Import multi-format** : Deck Code, Card Names (texte brut `3 Jinx, Loose Cannon`), TTS (Tabletop Simulator `OGN-249-1`)
- **Export multi-format** : Deck Code, Pixelborn, Card Names, TTS, **Image** (export PNG), **Registration** (fiche d'inscription tournoi avec champs nom/prénom/Riot ID/event)
- **Tags de deck** : Aggro, Combo, Midrange, Budget, Control, Multiplayer, Off-Meta, Competitive
- **Sideboard** : section dédiée avec 0-8 cartes
- **Statistiques du deck** : Energy Curve + Card Type Distribution + Power Distribution — 3 graphiques distincts

### Riftbound.gg (riftbound.gg/builder/)
**Points forts à copier :**
- **Intégration tier list** : le builder suggère si la légende choisie est S/A/B/C/D tier dans la méta actuelle
- **Lien direct vers les guides** : chaque légende dans le builder a un lien vers son guide de deckbuilding
- **Validation format** : alerte visuelle si le deck n'est pas légal (nombre de cartes, runes, battlefields)

### Magical Meta (magicalmeta.ink/riftbound/deckbuilder)
**Points forts à copier :**
- **Recherche unifiée ultra-puissante** : un seul champ de recherche qui accepte texte libre ET field filters (`type:unit`, `domain:fury`, `set:origins`, `tag:ionia`, `energy:3`, `cost:2`, `power:1`, `number:141`). C'est le gold standard.
- **Workspace** : switch entre plusieurs decks sauvegardés localement
- **Rule enforcement toggle** : on/off pour la validation des règles
- **Banlist reference** : accès direct à la banlist avec les cartes bannies

### Rift TCG Scanner (app mobile)
**Points forts (à adapter pour le web) :**
- **Sample hand testing** : tire une main de départ aléatoire depuis le deck pour tester la consistance
- **Deck cost** : coût total + "argent nécessaire pour compléter" (on ne fait PAS les prix, mais le concept de sample hand est top)
- **Color distribution** et **Rarity distribution** en plus de la mana curve

---

## Plan d'implémentation — Par priorité

### PRIORITÉ 1 — UX Flow (le plus impactant)

#### 1.1 Progression visuelle du deck
Remplacer les tabs actuels par une **barre de progression visuelle** en haut du deck panel :

```
[✓ Légende 1/1] → [⬤ Champion 1/1] → [◯ Deck 32/40] → [◯ Runes 8/12] → [◯ Battlefields 2/3] → [◯ Side 0/8]
```

- Chaque étape est cliquable et filtre automatiquement le card browser
- L'étape active est en surbrillance (arcane blue `#0ea5e9`)
- Les étapes complètes ont un check vert
- Les étapes incomplètes sont grises avec le compteur
- Le Champion est auto-rempli quand la Légende est choisie (comportement actuel à garder)
- **Nouveau** : quand TOUTES les étapes sont vertes, afficher un badge "Deck valide ✓" avec animation subtile

#### 1.2 Validation en temps réel
Panneau de validation collapsible en bas du deck panel :

```
⚠ Deck incomplet :
  • Main Deck : 32/40 cartes (minimum 40)
  • Runes : 8/12 (besoin 12)
  • Battlefields : 2/3 (besoin 3)
  ✓ Légende sélectionnée
  ✓ Champion assigné
  ✓ Aucune carte bannie
```

- Chaque ligne est un lien qui scroll/filtre vers la section concernée
- Les cartes bannies sont signalées en rouge avec le nom de la carte
- Ajouter un toggle **Compétitif / Casual** (casual = pas de validation, libre)

#### 1.3 Sample Hand (test de main de départ)
Bouton "🎴 Tester une main" dans le deck panel :

- Tire aléatoirement 7 cartes du main deck (selon les quantités)
- Affiche les 7 cartes en ligne avec leurs images
- Bouton "Mulligan" pour retirer et en piocher 7 nouvelles
- Bouton "Nouvelle main" pour recommencer
- Se ferme avec un clic en dehors ou Escape
- **Important** : c'est un outil pédagogique pour les débutants — ajouter un tooltip "Testez si votre deck démarre bien en simulant votre première main"

### PRIORITÉ 2 — Recherche & Filtres

#### 2.1 Barre de recherche unifiée (inspirée Magical Meta + RiftMana)
Remplacer le système de filtres actuel (dropdowns multiples) par **un champ de recherche unique** qui fait TOUT :

```
🔍 Rechercher... (ex: "unit fury energy:3" ou "jinx" ou "/keyword Accélération")
```

**Syntaxe supportée :**
- Texte libre : cherche dans `name` + `text.plain` (le texte de la carte)
- `type:unit` / `type:spell` / `type:gear` — filtre par type
- `domain:fury` / `domain:chaos` — filtre par domaine
- `set:origins` / `set:spiritforged` / `set:unleashed` — filtre par extension
- `energy:3` ou `energy:3+` ou `energy:0-2` — filtre par coût d'énergie (range)
- `power:5` ou `power:5+` — filtre par pouvoir
- `might:3` — filtre par puissance
- `rarity:epic` / `rarity:rare` / `rarity:uncommon` / `rarity:common` — filtre par rareté
- `tag:ionia` / `tag:noxus` — filtre par tag de région

**Implémentation :**
- Parser les tokens dans le champ de recherche
- Les tokens reconnus deviennent des chips colorés dans le champ (comme Gmail)
- Le texte libre restant est une recherche fuzzy sur name + plain text
- Les dropdowns actuels (Set, Rareté, etc.) restent en dessous comme raccourcis visuels, mais ils remplissent le champ de recherche plutôt que de filtrer séparément
- **Autocomplétion** : quand l'utilisateur tape `type:`, proposer la liste des types. Idem pour `domain:`, `set:`, etc.

#### 2.2 Garder les boutons de filtre rapide
En dessous de la barre de recherche, garder des boutons toggle visuels :
- **Par type** : icônes Unit / Spell / Gear (avec les icônes de `/public/icons/`)
- **Par domaine** : icônes des 6 domaines avec couleurs
- **Par énergie** : boutons 0-8+ (comme RiftMana fait actuellement)
- Ces boutons ajoutent/retirent des tokens dans la barre de recherche unifiée

### PRIORITÉ 3 — Statistiques du deck

#### 3.1 Refonte des stats (inspiré RiftMana)
Le panneau de stats dans le deck panel doit afficher **3 visualisations** :

**a) Courbe d'énergie (Energy Curve)**
- Histogramme horizontal ou vertical, barres colorées par domaine
- Axe X = coût d'énergie (0 à 8+), Axe Y = nombre de cartes
- Tooltips au hover avec le détail des cartes à ce coût

**b) Distribution par type (Card Type Distribution)**
- Camembert ou barres horizontales
- Units / Spells / Gear / Signature avec icônes
- Pourcentage + nombre absolu

**c) Distribution par domaine (Domain Distribution)**
- Barres horizontales avec les couleurs de chaque domaine
- Permet de vérifier l'équilibre des runes nécessaires

**d) Distribution de puissance (Power Distribution)**
- Histogramme des valeurs de might des units
- Utile pour évaluer la courbe de combat

#### 3.2 Calcul auto des runes (inspiré Piltover Archive)
Quand l'utilisateur a ajouté des cartes au main deck :
- Calculer la répartition optimale des runes basée sur les domaines des cartes
- Afficher une **suggestion** : "Runes suggérées : 7 Fury + 5 Chaos"
- Bouton "Appliquer" pour auto-remplir les runes
- L'utilisateur peut toujours modifier manuellement

### PRIORITÉ 4 — Import/Export amélioré

#### 4.1 Import multi-format (inspiré RiftMana)
Modal d'import avec tabs :
- **Deck Code** : le format actuel (base64/encodé)
- **Noms de cartes** : texte brut, une ligne par carte avec quantité
  ```
  3 Jinx - Loose Cannon
  2 Fading Memories
  1 Acceptable Losses
  ```
- **TTS** : format Tabletop Simulator (`OGN-249-1 OGN-046-1`)
- Détection auto du format si possible

#### 4.2 Export multi-format
Modal d'export avec tabs + boutons de copie rapide :
- **Deck Code** : copier le code encodé
- **Noms de cartes** : copier la liste texte
- **TTS** : copier le format TTS pour Tabletop Simulator / Pixelborn
- **Image PNG** : exporter le deck en image (feature existante, la garder)
- **Fiche d'inscription tournoi** (Registration Sheet) :
  - Formulaire rapide : Nom, Prénom, Riot ID, Nom de l'événement, Date, Lieu
  - Génère un PDF ou une image formatée pour impression avec la decklist complète
  - Utiliser les formats officiels Riftbound pour la présentation

### PRIORITÉ 5 — Fonctionnalités sociales

#### 5.1 Tags d'archétype
Quand l'utilisateur sauvegarde/partage un deck, proposer des tags :
- **Archétype** : Aggro, Midrange, Control, Combo, Tempo
- **Budget** : Budget, Standard, Premium
- **Usage** : Compétitif, Casual, Multiplayer, Off-Meta, Fun
- Ces tags sont affichés sur la page `/community-decks` et sont filtrables

#### 5.2 Indicateur méta
Quand une légende est sélectionnée, afficher discrètement :
- Son tier actuel (S/A/B/C/D) depuis la tier list en base
- Le nombre de decks de cette légende dans les tournois récents
- Un lien vers le guide de la légende s'il existe
- **Attention** : ceci est éditorial (basé sur nos tier lists), PAS des données métagame automatisées (respect des règles Riot)

---

## Contraintes techniques à respecter

### Stack existante
- Next.js 16.2.6 / React 19 / TypeScript 5
- Tailwind CSS 4 avec `@theme inline` (PAS `tailwind.config.ts`)
- shadcn/ui 4.8 (New York style)
- Prisma 6 / PostgreSQL

### Design system
- Canvas : `#06060b` (fond principal)
- Surface : `#0c0c14` → `#12121e` → `#1a1a2e`
- Arcane Blue : `#0ea5e9` (accent principal)
- Runic Gold : `#f59e0b` (accent secondaire)
- Mystic Violet : `#8b5cf6` (accent tertiaire)
- Ink : `#f1f5f9` → `#94a3b8` → `#64748b`
- Polices : Rubik (display) + Plus Jakarta Sans (body)
- Boutons flat, PAS de box-shadow/glow

### Modèles Prisma existants (ne pas modifier le schema)
```prisma
model Card {
  id               String   @id
  name             String
  riftboundId      String?
  collectorNumber  Int?
  type             String   // Legend, Unit, Spell, Gear, Battlefield, Rune
  supertype        String?  // Champion, Signature, Basic, Token, null
  rarity           String?
  domains          String[] // fury, chaos, order, harmony, unity, growth
  energy           Int?
  might            Int?
  power            Int?
  description      String?
  flavorText       String?
  artUrl           String?
  artist           String?
  setId            String?
  tags             String[]
  // ... relations
}

model Deck {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  legendId    String
  legendName  String
  description String?
  guide       String?
  format      String   @default("constructed")
  tags        String[]
  // ... etc
  cards       DeckCard[]
}

model DeckCard {
  id       String @id @default(cuid())
  deckId   String
  cardId   String
  quantity Int    @default(1)
  section  String @default("main") // main, rune, side, battlefield, legend
  // ... relations
}
```

### API Riftcodex (pour sync cartes)
- Base URL : `https://api.riftcodex.com`
- PAS de préfixe `/api/`
- Endpoint search `/cards/search` retourne 422 — ne PAS l'utiliser
- Recherche = en base locale uniquement

### Règles Riftbound à valider
- **Main Deck** : minimum 40 cartes (pas de maximum)
- **Rune Deck** : exactement 12 runes
- **Battlefields** : exactement 3
- **Legend** : exactement 1
- **Champion** (élu) : exactement 1, doit matcher la légende
- **Sideboard** : exactement 0 ou 8 cartes
- **Copies** : maximum 3 copies d'une même carte (le champion compte dans cette limite)
- **Domaines** : les cartes du main deck doivent correspondre aux domaines de la légende
- **Cartes bannies** : voir `src/lib/banned-cards.ts`
- Les runes n'ont PAS de restriction de domaine
- **Cartes hors-set promo (OPP)** : les exclure du browser par défaut (doublons starters)

### Terminologie française
Utiliser les termes FR officiels partout dans l'UI :
- Energy → Énergie
- Might → Puissance
- Power → Pouvoir
- Exhaust → Épuiser
- Ready → Préparer
- Recycle → Recycler
- Battlefield → Champ de bataille
- Main Deck → Deck principal
- Rune Deck → Deck de runes
- Legend → Légende
- Champion → Champion (élu)
- Sideboard → Réserve

### Bugs connus à ne PAS réintroduire
- Champions (supertype "Champion") ne doivent JAMAIS apparaître dans le card browser — ils sont auto-sélectionnés avec la légende
- Signatures (supertype "Signature") doivent être filtrées par légende sélectionnée (via tags)
- Dédup cross-set par nom (OGN prioritaire sur SFD/UNL pour les reprints)
- Import deck code : fallback virgule→tiret pour les noms ("Vi, Peacekeeper" → "Vi - Peacekeeper")
- Apostrophes dans les noms de champions (Kai'Sa, Kha'Zix, Rek'Sai) : les deux formes doivent être gérées
- Runes : max 12 au total (pas 3 par carte)
- Cartes sans domaine (neutres) : toujours visibles quel que soit le filtre domaine
- Nettoyage des signatures de l'ancienne légende quand on change de légende
- Legend cards ont attributes null — ne pas les filtrer par energy/might/power

---

## Structure de fichiers attendue

```
src/app/deckbuilder/
├── page.tsx                    # Page principale (Server Component wrapper)
├── deckbuilder.tsx             # Client Component principal
├── components/
│   ├── card-browser.tsx        # Grille de cartes avec recherche unifiée
│   ├── search-bar.tsx          # Barre de recherche avec parser de tokens
│   ├── deck-panel.tsx          # Panel droit avec le deck en construction
│   ├── deck-progress.tsx       # Barre de progression visuelle
│   ├── deck-stats.tsx          # Graphiques (energy curve, type distrib, etc.)
│   ├── deck-validation.tsx     # Panneau de validation temps réel
│   ├── sample-hand.tsx         # Modal de test de main de départ
│   ├── import-modal.tsx        # Modal d'import multi-format
│   ├── export-modal.tsx        # Modal d'export multi-format
│   ├── rune-suggestion.tsx     # Suggestion auto des runes
│   ├── meta-indicator.tsx      # Indicateur tier + stats éditoriales de la légende
│   └── registration-sheet.tsx  # Générateur de fiche d'inscription tournoi
└── lib/
    ├── search-parser.ts        # Parser de la syntaxe de recherche unifiée
    ├── deck-rules.ts           # Validation des règles Riftbound
    ├── sample-hand.ts          # Logique de tirage aléatoire
    ├── rune-calculator.ts      # Calcul de la répartition optimale des runes
    └── export-formats.ts       # Encodeurs/décodeurs pour chaque format d'export
```

---

## Ordre d'exécution recommandé

1. **Lire le code actuel** de `src/app/deckbuilder/` pour comprendre l'existant
2. **Implémenter la Priorité 1** (UX Flow) : progression visuelle, validation, sample hand
3. **Implémenter la Priorité 2** (Recherche) : barre unifiée + filtres rapides
4. **Implémenter la Priorité 3** (Stats) : 4 graphiques + rune suggestion
5. **Implémenter la Priorité 4** (Import/Export) : multi-format + registration sheet
6. **Implémenter la Priorité 5** (Social) : tags + indicateur méta
7. **Tester** : vérifier que tous les bugs listés ne sont pas réintroduits
8. **Écrire un rapport** RAPPORT-DECKBUILDER.md avec les changements

## Rappels critiques

- **NE PAS afficher de prix** (Scrydex pricing retiré volontairement du projet)
- **NE PAS afficher de données métagame automatisées** (winrates, playrates, matchups) — respect des règles Riot
- **Les tier lists sont éditoriales** : on peut afficher le tier d'une légende mais c'est notre opinion éditoriale, pas des stats automatisées
- **Écrire le rapport AVANT de manquer de contexte** — Allan a déjà perdu du travail à cause de ça
- **C'est Allan qui choisit** ce qui est affiché — ne pas ajouter des features non demandées sans demander
- **Exécution directe, max effort** — Allan préfère qu'on fasse le taff plutôt que de poser des questions
- **Le domaine est riftboundfrance.fr** (pas riftboundfr.fr)
