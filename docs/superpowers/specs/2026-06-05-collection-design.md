# Système de Collection — Design

Date : 2026-06-05
Statut : approuvé (design), prêt pour plan d'implémentation
Projet : Riftbound France (riftboundfrance.fr)

## Objectif

Permettre à un utilisateur connecté (compte Discord existant) de suivre les cartes
Riftbound qu'il possède, puis d'afficher partout sur le site **combien de cartes il
lui manque** pour réaliser un deck — sur les pages decklists et dans le deckbuilder.
Importer la collection depuis Piltover Archive (CSV). Inspiré du collection tracker
de Piltover Archive.

## Périmètre

Trois livraisons forment ce projet :

- **A** — Suivi de collection (possession par impression + quantité)
- **B** — Affichage « cartes manquantes » sur decklists + deckbuilder
- **C** — Import depuis Piltover Archive (CSV)

Hors périmètre (YAGNI) : profils de collection publics, valeur marché, binders,
échanges/wishlist partagée. La collection est **privée à son propriétaire**.

## Décisions de design (validées avec Allan)

1. **Granularité** : possession suivie **par impression exacte + quantité**
   (Standard, Alt-Art, Overnumbered, Signature/Showcase comptés séparément), façon
   Piltover. Complétion par set possible.
2. **Identité jouable** : pour le calcul « manquantes », deux impressions partageant
   le même `Card.cleanName` sont la **même carte jouable** (posséder l'alt-art compte
   pour construire le deck).
3. **Saisie** : les deux moyens — steppers +/− sur `/cartes` **et** page dédiée
   `/collection` façon Piltover (grille par set, complétion, stats).
4. **Périmètre du calcul manquantes** : **tout le deck** — main + champion + légende
   + battlefields + runes.
5. **Import** : Piltover exporte un **CSV** ; on écrit un parseur dédié avec rapport
   de correspondances (importées / non reconnues).

## Architecture

Approche retenue (A) : collection en base, **calcul de couverture côté serveur** sur
les pages decks (rendu serveur), et **contexte client partagé `useCollection`** pour
les surfaces interactives (cartes, page collection, deckbuilder). Une seule source de
vérité (DB), pas de duplication de logique.

### 1. Modèle de données (Prisma)

```prisma
model CollectionItem {
  id        String   @id @default(cuid())
  userId    String
  cardId    String   // une impression précise (variante incluse)
  quantity  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  card Card @relation(fields: [cardId], references: [id])

  @@unique([userId, cardId])
  @@index([userId])
  @@index([cardId])
}
```

Relations inverses à ajouter : `User.collection CollectionItem[]`,
`Card.collectionItems CollectionItem[]`.

Complétion d'un set = `(impressions distinctes possédées dans le set) / set.cardCount`.

### 2. Calcul « cartes manquantes » — le cœur

Helper serveur pur, testé en isolation :

```ts
// src/lib/collection.ts
type Owned = Map<string /* cleanName normalisé */, number /* qty totale */>;

function buildOwnedByName(items: {card: {cleanName, name}, quantity}[]): Owned
// somme les quantités de toutes les impressions par cleanName

interface CoverageEntry { cardId; name; section; required; owned; missing }
interface DeckCoverage {
  entries: CoverageEntry[];
  totals: { required; owned; missing; completionPct };
}

function computeDeckCoverage(owned: Owned, deckCards: DeckCardLike[]): DeckCoverage
// pour chaque carte du deck : missing = max(0, required - owned[cleanName])
```

- `owned` est calculé une fois par requête à partir de `CollectionItem` de l'user.
- `required` = quantité dans le deck (toutes sections : main, champion, legend,
  battlefield, rune, side selon affichage).
- Fonctions **pures** → testables sans DB (TDD).

### 3. API (toutes derrière la session Discord existante `getUserFromSession`)

| Route | Méthode | Rôle |
|-------|---------|------|
| `/api/collection` | GET | renvoie `[{cardId, quantity}]` de l'user (hydrate le client) |
| `/api/collection` | POST | fixe la quantité d'une impression `{cardId, quantity}` (upsert ; `0` supprime) |
| `/api/collection/bulk` | POST | édition en masse `{items:[{cardId, quantity}]}` (set complet) |
| `/api/collection/import` | POST | reçoit le CSV Piltover, parse, mappe, upsert, renvoie un rapport |

Non connecté → 401. Validation : `cardId` doit exister, `quantity >= 0`.

### 4. Import Piltover (C)

**Format CSV** (confirmé sur l'export réel `piltover-collection-sly-2026-06-05.csv`) :

Colonnes : `Variant Number, Card Name, Set, Set Prefix, Rarity, Variant Type,
Variant Label, Foil, Quantity, Language, Condition, Grading Company, Grading Value,
Grading Label, Notes`

- ⚠️ Champs entre guillemets contenant des virgules (`"Darius, Trifarian"`) →
  **parsing CSV conforme RFC** (gérer les quotes), pas de `split(',')`.
- **Mapping** :
  1. clé primaire = `Variant Number` (ex. `OGN-025`) → `Set Prefix` + n° collecteur
     → match `Card` par `set` (préfixe) + `collectorNumber`.
  2. désambiguïsation de variante via `Variant Type` / `Foil`
     (`Standard`, `Alt Art`, `Overnumbered`, `Showcase`, `Pre-Rift Promo`) contre les
     flags `alternateArt` / `overnumbered` / `signature` de `Card`.
  3. `Quantity` → quantité possédée.
- **Rapport** retourné : `{ imported, updated, unmatched: [{variantNumber, name, raison}] }`.
  Les lignes non résolues sont listées pour vérification manuelle (jamais d'échec
  silencieux — cf. conventions scraping du projet).
- Stratégie d'import : **remplace** la quantité (pas d'addition) pour rester
  idempotent si on réimporte.

### 5. UI

Hook client partagé **`useCollection()`** (contexte React) : charge `/api/collection`
une fois, expose `quantities: Map<cardId, qty>` + `setQuantity(cardId, qty)` avec mise
à jour optimiste et POST en arrière-plan. Réutilisé partout.

- **`/cartes` + modale carte** : quand connecté, stepper quantité par impression +
  badge « possédé ». Réutilise filtres/grille existants.
- **`/collection`** (nouvelle page) : grille par set, barres de complétion, stats
  globales (total possédé, % par set), bouton **Import Piltover** (upload CSV →
  `/api/collection/import` → affiche le rapport).
- **Pages decks** (`/decks/[slug]`, `/d/[code]`) : panneau « Ma collection » →
  « Il te manque N cartes », surlignage des cartes manquantes. Rendu serveur si
  connecté ; sinon invite à se connecter.
- **Deckbuilder** : indicateur live « manquantes » pendant la construction (même
  composant de couverture, alimenté par `useCollection` côté client).

### 6. Confidentialité / sécurité

- Collection strictement privée : toutes les routes filtrent par `userId` de session.
- Aucune exposition publique. Pas de fuite de collection d'autrui.

## Plan de tests (TDD)

- `computeDeckCoverage` : deck complet possédé → 0 manquantes ; possession partielle ;
  alt-art compte pour la carte standard ; quantité insuffisante (2/3) ; carte absente.
- `buildOwnedByName` : agrégation multi-impressions par cleanName.
- Parseur CSV Piltover : ligne simple ; nom avec virgule entre guillemets ; variante
  non-standard ; ligne non mappable → rapport unmatched. Fixture = extrait réel du CSV.
- Routes API : 401 non connecté ; upsert quantité ; suppression à 0.

## Dépendances / inconnues résiduelles

- Confirmer à l'implémentation la valeur exacte de `Card.set` (préfixe `OGN` vs `setId`)
  et la correspondance flags variantes ↔ libellés Piltover, sur des lignes réelles.
- Migration Prisma à appliquer en dev puis prod (cf. leçons déploiement Coolify :
  copie dev→prod, ne pas fragmenter).

## Livrables connexes (hors ce spec, tâches de contenu en parallèle)

- **D** — Article best-of Vancouver + decks dans `/decks` (données déjà extraites).
- **E** — Rules list FR (PDF) pour ajuster la terminologie EN→FR si besoin.
