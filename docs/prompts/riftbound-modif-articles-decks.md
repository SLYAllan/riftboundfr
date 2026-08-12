# Modification Claude Code — Système Articles/Decks/Tournois

## Contexte

On remplace le système actuel de pages tournois rigides par un format "articles enrichis" avec des modules interactifs intégrés. L'idée : des textes courts et percutants (pas un blog classique visuellement) avec des composants interactifs embarqués (decklists, liens sponsorisés, redirections). On garde aussi une vue "catalogue de decks" indépendante pour parcourir tous les decks sans passer par un article.

## 1. Nouveau système d'articles enrichis

### Concept
Les articles ne sont PAS un blog classique avec une longue colonne de texte. C'est un format "cards-based" : des blocs courts de texte entrecoupés de modules interactifs. Visuellement, ça doit ressembler plus à un feed éditorial gaming qu'à un blog WordPress.

### Modules intégrables dans un article

L'éditeur admin utilise un système de blocs (type Notion simplifié). Chaque article est une succession de blocs :

#### Bloc Texte
- Markdown classique, rendu propre
- Court (2-5 paragraphes max par bloc texte, on encourage la concision)
- Support des liens inline classiques

#### Bloc Decklist Interactif
- L'admin colle un **deck code** (format texte standard type "1x Kai'Sa // 3x Mystic Shot // 2x ...") dans l'éditeur
- Le système parse le deck code, résout les noms de cartes via la DB locale, et génère le composant interactif
- Affichage du deck :
  - **Vue grille** (défaut) : miniatures des cartes organisées par section (Légende, Main Deck par type, Runes, Battlefields), avec badge quantité (x2, x3)
  - **Vue liste** : tableau avec colonnes Nom | Type | Coût | Quantité | Set
  - Toggle entre les deux vues
  - **Hover sur une carte** : popup/tooltip avec l'image de la carte en grand + stats complètes (nom, type, coût, power, texte de règle)
  - Sur mobile : tap pour ouvrir la carte en modal
- Bouton **"📸 Exporter en PNG"** — génère une image partageable du deck (comme défini dans le prompt principal)
- Bouton **"📋 Copier le deck code"** — copie le deck code texte dans le presse-papier
- Bouton **"➕ Sauvegarder ce deck"** — ajoute la decklist dans la section `/decks` du site (côté admin, crée une entrée Deck liée à l'article source)
- Le bloc affiche aussi : nom du deck, légende, auteur/joueur, contexte (ex: "Top 4 — Regional Qualifier Sydney")

#### Bloc Lien Sponsorisé / Redirection
- Affichage : un **encart visuel** (pas un simple lien texte) — type "card" avec :
  - Image de fond ou icône
  - Titre court (ex: "Découvre notre sélection Origins")
  - Sous-titre/description (1 ligne)
  - Bouton CTA (texte personnalisable, ex: "Voir la boutique", "En savoir plus")
  - URL de destination (avec support UTM tracking)
- Styles prédéfinis : `standard` (surface-raised, bordure subtile), `highlight` (bordure or, fond légèrement doré), `minimal` (juste texte + flèche, inline)
- L'admin peut placer ce bloc n'importe où dans l'article
- Attribut `rel="sponsored nofollow"` automatique sur les liens si marqué comme sponsorisé
- Attribut `rel="noopener noreferrer" target="_blank"` sur tous les liens externes

#### Bloc Image
- Upload d'image classique avec alt text
- Optionnel : légende sous l'image

#### Bloc Séparateur
- Ligne de séparation visuelle entre les sections

### Structure de données Article (mise à jour Prisma)

```prisma
model Article {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  excerpt     String?  // Résumé court pour les cards de listing
  coverImage  String?
  category    String   // actualite, guide, tournoi, meta, patch-notes
  tags        String[]
  // Nouveau : contenu structuré en blocs JSON
  // Remplace le champ "content" Markdown simple
  blocks      Json     // Array de blocs (voir structure ci-dessous)
  // Métadonnées tournoi (optionnel, si category == "tournoi")
  tournamentName   String?
  tournamentDate   DateTime?
  tournamentLocation String?
  tournamentPlayerCount Int?
  // Publication
  published   Boolean  @default(false)
  featured    Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([category])
  @@index([publishedAt])
}
```

### Structure JSON des blocs

```typescript
type ArticleBlock =
  | {
      type: "text";
      id: string; // unique block ID
      content: string; // Markdown
    }
  | {
      type: "decklist";
      id: string;
      deckCode: string; // Le code brut collé par l'admin
      deckName: string;
      legendName: string;
      playerName?: string;
      context?: string; // "Top 4 — RQ Sydney", "Budget deck", etc.
      deckId?: string; // Lien vers un Deck sauvegardé si "Sauvegarder" a été utilisé
    }
  | {
      type: "sponsor_link";
      id: string;
      title: string;
      description?: string;
      imageUrl?: string;
      ctaText: string; // "Voir la boutique"
      url: string;
      style: "standard" | "highlight" | "minimal";
      isSponsored: boolean; // true = rel="sponsored nofollow"
    }
  | {
      type: "image";
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "separator";
      id: string;
    };
```

## 2. Admin — Éditeur d'articles à blocs

### Interface éditeur

L'éditeur admin doit permettre de :

- **Ajouter des blocs** : bouton "+" entre chaque bloc, menu déroulant pour choisir le type (Texte, Decklist, Lien sponsorisé, Image, Séparateur)
- **Réordonner les blocs** : drag & drop (ou flèches haut/bas sur mobile)
- **Supprimer un bloc** : icône poubelle avec confirmation
- **Éditer chaque bloc inline** :
  - Texte : textarea avec preview Markdown en temps réel (split pane ou toggle)
  - Decklist : champ "Deck code" (textarea), champs nom/légende/joueur/contexte, preview live du deck parsé
  - Lien sponsorisé : formulaire avec champs titre, description, image URL, CTA text, URL destination, style (dropdown), checkbox "sponsorisé"
  - Image : upload + champ alt text + légende optionnelle
- **Preview de l'article complet** : bouton "Prévisualiser" qui affiche l'article tel qu'il apparaîtra côté public
- **Sauvegarde auto** (debounce) ou bouton "Enregistrer brouillon"
- **Publier / Dépublier** : toggle

### Parsing du deck code

Le parsing du deck code doit supporter les formats courants :

```
// Format simple (quantité + nom)
1x Kai'Sa
3x Mystic Shot
2x Pale Cascade

// Format avec set
1x Kai'Sa (OGN-042)
3x Mystic Shot (OGN-105)

// Format sections
== Legend ==
1x Kai'Sa
== Main Deck ==
3x Mystic Shot
2x Pale Cascade
== Runes ==
2x Rune of Power
== Battlefield ==
1x Shadow Isles
```

Le parser :
1. Extrait quantité + nom (et optionnellement set/ID)
2. Cherche chaque carte dans la DB locale (match fuzzy si besoin)
3. Retourne un objet structuré avec les cartes résolues
4. Affiche les erreurs si des cartes ne sont pas trouvées ("Carte non trouvée : Mystyc Shot — vouliez-vous dire Mystic Shot ?")

## 3. Vue Catalogue de Decks (indépendante des articles)

La page `/decks` reste une vue catalogue indépendante où on peut parcourir TOUS les decks sans passer par un article.

### Sources des decks dans le catalogue
- Decks créés manuellement dans l'admin (comme avant)
- Decks issus d'articles (quand l'admin clique "Sauvegarder ce deck" sur un bloc decklist d'article, ça crée une entrée Deck avec un lien vers l'article source)

### Affichage `/decks`
- Grille de cards : chaque deck affiché avec portrait de la légende, nom du deck, tags, source (article/manuel)
- Filtres : par légende, par format, par tag (budget/compétitif/débutant/tournoi), par source
- Tri : par date, par popularité (si tracking des vues plus tard)
- Clic sur un deck → page `/decks/[slug]` avec la vue complète (grille/liste des cartes, hover, export PNG, guide si dispo)
- Si le deck vient d'un article, afficher un lien "📄 Voir l'article associé"

### Mise à jour du modèle Deck (Prisma)

Ajouter au modèle Deck existant :
```prisma
model Deck {
  // ... champs existants ...
  
  // Nouveau : lien vers l'article source si le deck vient d'un article
  sourceArticleId String?
  sourceArticle   Article? @relation(fields: [sourceArticleId], references: [id])
  
  // Nouveau : contexte tournoi direct (sans article)
  tournamentContext String? // "Top 4 — RQ Sydney", optionnel
  playerName        String? // Joueur qui a joué le deck
}
```

## 4. Composant Decklist Interactif (frontend)

Ce composant est réutilisé partout : dans les articles, dans la page deck, dans la tier list.

```typescript
interface DecklistInteractiveProps {
  cards: {
    cardId: string;
    name: string;
    nameFr?: string;
    artUrl: string;
    type: string;
    cost?: number;
    power?: number;
    energy?: number;
    rarity: string;
    description?: string;
    quantity: number;
    section: "legend" | "main" | "rune" | "battlefield" | "side";
  }[];
  deckName: string;
  legendName: string;
  playerName?: string;
  context?: string;
  showExportPng?: boolean; // défaut true
  showCopyCode?: boolean; // défaut true
  showSaveButton?: boolean; // défaut false (true seulement dans l'admin ou si feature activée)
  compact?: boolean; // mode compact pour intégration dans un article (pas de guide, pas de header énorme)
}
```

### Comportement hover/tap carte
- **Desktop** : hover → tooltip positionné intelligemment (évite les bords d'écran) avec :
  - Image de la carte en ~300px de large
  - Nom FR (nom EN en petit si différent)
  - Type + Rareté (badge coloré)
  - Coût / Power / Energy
  - Texte de règle complet
  - Transition : fade-in rapide (150ms)
- **Mobile** : tap → modal centré avec les mêmes infos + bouton "Fermer"
- **Performance** : preload des images au hover de la zone du deck (pas de chaque carte), lazy load sinon

## 5. Récapitulatif des changements

### Pages modifiées
- `/articles` (anciennement `/actualites`) — listing d'articles enrichis avec filtres par catégorie
- `/articles/[slug]` — rendu d'un article avec ses blocs (texte, decklists interactives, liens sponsorisés)
- `/decks` — catalogue de decks (inchangé dans le principe, mais alimenté aussi par les articles)
- `/decks/[slug]` — vue deck complète (inchangée)
- `/admin/articles` — éditeur à blocs (NOUVEAU)
- `/admin/decks` — CRUD decks manuels (inchangé)

### Pages supprimées
- `/tournois` et `/tournois/[slug]` — remplacés par des articles avec category "tournoi"
- `/admin/tournois` — remplacé par l'éditeur d'articles avec les champs tournoi optionnels

### Modèles Prisma modifiés
- `Article` — champ `blocks: Json` remplace `content: String`, ajout champs tournoi optionnels
- `Deck` — ajout `sourceArticleId`, `tournamentContext`, `playerName`
- `Tournament` et `TournamentResult` — **supprimés** (les données tournoi sont dans les articles)

### Nouveaux composants
- `<DecklistInteractive />` — composant deck réutilisable avec hover/tap, toggle grille/liste, export PNG, copier code
- `<SponsorCard />` — encart lien sponsorisé (3 styles : standard, highlight, minimal)
- `<ArticleBlockRenderer />` — renderer qui itère sur les blocs JSON et affiche le bon composant
- `<BlockEditor />` — éditeur admin avec ajout/suppression/réordonnement de blocs
- `<DeckCodeParser />` — composant admin qui parse un deck code texte et affiche le preview

## 6. Notes UX importantes

- Les articles NE doivent PAS ressembler à un blog classique. Pas de sidebar, pas de "publié le..." en gros, pas de commentaires. C'est un feed éditorial compact avec des modules interactifs.
- La date et l'auteur sont affichés discrètement (micro typography, en haut de l'article sous le titre)
- Le listing des articles (`/articles`) est une grille de cards (pas une liste verticale blog-like). Chaque card : image de couverture, titre, excerpt (2 lignes max), catégorie badge, date discrète
- Les articles catégorie "tournoi" ont un badge spécial et affichent les infos tournoi (nom, lieu, joueurs) dans le header de l'article
- Les blocs decklist doivent "respirer" dans l'article — margin vertical généreux, peut-être un fond légèrement différent ({colors.surface-raised}) pour les démarquer du texte
- Les blocs lien sponsorisé style "highlight" avec bordure or doivent être utilisés avec parcimonie pour ne pas saturer visuellement
