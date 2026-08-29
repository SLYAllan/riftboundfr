# Module interne Bulking : plan de mise en œuvre

> **Renommé, et fait en local.** Le module s'appelle « bulking » : routes `/admin/bulking` et
> `/api/admin/bulking`, fichiers `src/lib/bulking-*.ts`, modèles Prisma préfixés `Bulk`. Le nom
> UwUTCG n'existe plus dans le dépôt ; ce plan a été relu en conséquence. Les phases 1 à 5 tournent
> en local, tests et build verts. Seule la tâche 13, la mise en production, reste à faire.

> **Pour les agents chargés de l'exécution :** SOUS-SKILL REQUIS : utiliser `superpowers:subagent-driven-development` (conseillé) ou `superpowers:executing-plans` pour suivre ce plan tâche par tâche. Les cases `- [x]` servent au suivi.

**But :** ajouter au panneau d'administration de Riftbound France un module Bulking pour gérer le stock, son registre de mouvements, les entrées en lot, les recettes de produits et leur lien avec les decks existants.

**Architecture :** le catalogue `Card` reste la source unique des cartes et des impressions. Les tables Bulking vivent dans la même base PostgreSQL, portent leurs propres données commerciales et pointent vers `Card.id`. Les écritures passent par des routes sous `/api/admin/bulking`, identifient l'auteur par son compte Discord quand il existe ou par le libellé explicite `password-admin`, puis modifient le registre et les soldes dans une même transaction.

**Socle technique :** Next.js 16.3 App Router, React 19.2, TypeScript strict, Prisma 6.19, PostgreSQL 16, Tailwind CSS 4, Base UI, Vitest 4.1 en environnement Node.

**Spécification :** le présent document, surtout les sections « Décisions prises », « Modèle de données », « Contrats » et « Critères de fin ».

## Contraintes générales

- Le module reste dans l'application Riftbound France. Aucun second service ni second dépôt.
- `Card.id` reste la clé canonique. Ne jamais copier le catalogue dans une table Bulking.
- Une `Card` décrit déjà une impression. La langue physique appartient au stock Bulking.
- Aucun champ commercial ne sort dans `/api/v1/*` ni dans une page publique.
- Toute page Bulking appelle `verifyAdmin()` ; toute méthode d'API contrôle `isAdmin()`.
- Toute écriture appelle `getBulkAdminActor()` et enregistre son `adminLabel`. `adminUserId` reste nullable.
- Une session Discord admin produit son `User.id` et un libellé lisible. Le cookie signé produit le libellé `password-admin`.
- Toute modification du stock produit un mouvement. Aucune route ne modifie seule une quantité.
- Un mouvement ne se modifie pas et ne se supprime pas. Une correction crée un mouvement inverse.
- `availableQuantity` vaut `physicalQuantity - reservedQuantity` et ne se stocke pas.
- Toute écriture de plusieurs lignes se fait dans une transaction Prisma.
- Les coûts utilisent `Decimal`, jamais `Float`. Un lot `UNIFORM` répartit son prix total entre toutes les cartes comptabilisées.
- Les quantités sont des entiers. Le stock physique et le stock réservé restent positifs, et le réservé ne dépasse jamais le physique.
- Les erreurs API suivent `{ error: "message en français" }` avec le bon code HTTP.
- Un `fetch` client contrôle `r.ok`, puis la forme de la réponse, puis affiche un échec et une action « Réessayer ».
- Aucun nouveau paquet. Prisma, React, Base UI et les fonctions du dépôt couvrent le besoin.
- Aucun calcul automatique de demande, de prix d'achat ou de quantité cible dans cette version.
- Pas d'intégration marketplace, de commande client ni de paiement.
- Pas de changement du site public.
- Avant toute retouche Next.js, lire le guide voulu dans `node_modules/next/dist/docs/`.
- Avant chaque commit, relire le diff. Avant le dernier commit, lancer `npm run lint`, `npm test` et `npm run verify` en contrôlant leurs vrais codes de sortie.

---

## 1. État du dépôt

### 1.1 Authentification de l'administration

`src/lib/auth.ts` accepte aujourd'hui deux accès :

1. un cookie `riftbound_admin` signé, obtenu avec le mot de passe d'administration ;
2. une session Discord dont l'utilisateur en base porte `role === "admin"`.

Le premier mode prouve un droit mais ne donne pas de `User.id`. Il reste valable pour les écritures Bulking : le registre conserve alors `adminUserId = null` et `adminLabel = "password-admin"`. Une session Discord admin conserve son `User.id` et un libellé tiré de `username`, `discordName` ou de l'identifiant si les deux noms manquent.

Le layout `/admin` ne protège pas à lui seul ses enfants. Chaque page actuelle appelle `verifyAdmin()`. Les nouvelles pages doivent suivre le même principe avec une fonction plus stricte.

### 1.2 Catalogue et impressions

`Card` contient `id`, `riftboundId`, le set, le numéro de collection et les drapeaux d'impression. `Card.id` est donc la clé commerciale d'une impression donnée.

`CardSet` existe dans la table `sets`, mais `Card.set` reste une chaîne sans relation Prisma. La première version des entrées stocke le code de set saisi dans `knownSet`, sans créer une fausse relation. La route valide ce code contre `CardSet.setId` quand il est fourni.

La langue de l'interface, les noms chinois et la langue physique d'une carte sont trois notions distinctes. Les tables Bulking référencent leur propre table `BulkLanguage`.

### 1.3 Decks et méta

`DeckCard` relie déjà `Deck.id` à `Card.id`, avec `quantity` et `section`. Les decks officiels peuvent donc produire une recette sans reparsage.

Les decks communautaires portent un `deckCode`. Leur prise en charge devra passer par `deckCoverageItems` et `resolveDeckCards`, qui signalent les cartes introuvables. Elle ne fait pas partie du premier lot.

Les données méta actuelles portent surtout sur les Légendes et les tournois. Elles ne donnent pas encore une demande fiable par carte. Le modèle conserve les clés nécessaires, mais ne stocke aucun score vide ou provisoire.

### 1.4 Motifs d'interface à garder

- Navigation : `src/app/admin/layout.tsx`.
- Tables : surface bordée, défilement horizontal, ligne survolée, état vide dans `src/app/admin/articles/page.tsx`.
- Onglets avec compteurs : `src/app/admin/decks/page.tsx`.
- Recherche placée dans l'URL : `src/app/admin/decks/deck-filters.tsx`.
- Formulaires en cartes, champs natifs et messages d'état : `src/app/admin/decks/import/page.tsx`.
- Petites actions côté client suivies de `router.refresh()` : `src/app/admin/decks/community-actions.tsx`, en corrigeant son absence de contrôle de réponse.

---

## 2. Décisions prises

### 2.1 Adresse et navigation

Le module utilise `/admin/bulking`, car `/admin/bulk` ne couvre pas les recettes ni les futurs usages commerciaux.

```text
/admin/bulking
├── /inventory
├── /movements
├── /intakes
│   ├── /new
│   └── /[id]
├── /recipes
│   ├── /new
│   └── /[id]
└── /decks/[id]
```

### 2.2 Identité des auteurs

Les deux formes d'accès admin actuelles peuvent lire et écrire. `getBulkAdminActor()` rend toujours un libellé et rend un `userId` seulement pour une session Discord admin :

```ts
export type BulkAdminActor = {
  userId: string | null;
  label: string;
};
```

Ordre du libellé Discord : `discordName`, puis `username`, puis `User.id`. Le cookie signé rend `{ userId: null, label: "password-admin" }`. La fonction rend `null` si aucun des deux modes n'est valide.

### 2.3 Langues

Les langues sont configurables et vivent dans `BulkLanguage` avec un `code` unique, un libellé, un état actif et un ordre d'affichage. Le stock, les entrées, les recettes et les futurs prix de marché pointent vers `BulkLanguage.id`. Aucun enum EN/FR ne fige le schéma.

### 2.4 Coût d'une entrée

Chaque entrée choisit une méthode d'allocation :

```prisma
enum BulkCostAllocationMethod {
  UNIFORM
  MANUAL
}
```

`UNIFORM` est la valeur par défaut. Lors de la comptabilisation :

```text
coût unitaire alloué = totalPrice / somme des quantités comptabilisées
```

La division garde quatre décimales dans le stock et le registre. Le total du lot reste la source comptable ; l'arrondi de chaque ligne ne doit pas servir à recalculer ou refuser le total.

`MANUAL` accepte un `acquisitionUnitCost` par ligne. Pour cette méthode seulement, la somme `quantity × acquisitionUnitCost` doit égaler `totalPrice` au centime avant comptabilisation.

V1 ne calcule rien depuis une valeur de marché.

### 2.5 Variantes physiques

Une ligne de stock distingue :

- `cardId` : impression canonique Riftbound France ;
- `language` ;
- `condition`, avec `NM` comme seule valeur V1 ;
- `finish`, avec `NORMAL` et `FOIL` ;
- `storageLocationId`.

Les enums gardent la porte ouverte à de nouvelles valeurs sans créer de logique de grade :

```prisma
enum BulkCardCondition {
  NM
}

enum BulkCardFinish {
  NORMAL
  FOIL
}
```

### 2.6 Emplacements et transferts

Un emplacement vit dans `BulkStorageLocation`. Son `code` unique porte l'ordre physique voulu, par exemple `ORI-EN-C-01`. Les listes trient d'abord par `code`. Une ligne de stock référence un emplacement par son identifiant.

Un transfert crée deux mouvements dans une transaction : sortie de l'ancien emplacement, entrée dans le nouveau. La somme physique globale ne change pas.

### 2.7 Réservations

Les réservations existent dans le modèle et le registre, mais aucune commande n'est créée dans cette version. Les routes internes savent appliquer un `reservedDelta`; l'interface de phase 1 ne propose qu'une correction manuelle motivée.

### 2.8 Sections d'une recette et d'un deck

Chaque ligne de recette accepte une section : `LEGEND`, `CHAMPION`, `MAIN_DECK`, `BATTLEFIELD`, `SIDEBOARD` ou `GENERIC`. La section n'entre jamais dans le calcul de stock.

Une recette créée depuis un deck inclut `main`, `rune` et `battlefield`. Le sideboard reste exclu par défaut, avec une case explicite « Inclure le sideboard » sur l'écran de création.

---

## 3. Modèle de données

### 3.1 Schéma Prisma cible

Ajouter les relations inverses à `Card`, `Deck` et `User`, puis les modèles suivants. Les noms sont fixés pour que les tâches suivantes partagent le même contrat.

```prisma
enum BulkMovementType {
  INTAKE
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
  RESERVATION
  RELEASE
  PRODUCT_BUILD
  PRODUCT_DISASSEMBLY
}

enum BulkCardCondition {
  NM
}

enum BulkCardFinish {
  NORMAL
  FOIL
}

enum BulkCostAllocationMethod {
  UNIFORM
  MANUAL
}

enum BulkIntakeStatus {
  DRAFT
  POSTED
}

model BulkStorageLocation {
  id        String   @id @default(cuid())
  code      String   @unique
  label     String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inventoryItems BulkInventory[]
  intakeLines    BulkIntakeLine[]

  @@index([code])
}

model BulkLanguage {
  id        String   @id @default(cuid())
  code      String   @unique
  label     String
  active    Boolean  @default(true)
  position  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  inventoryItems BulkInventory[]
  intakes        BulkIntake[]
  recipeLines    BulkProductRecipeLine[]

  @@index([active, position])
}

model BulkInventory {
  id                     String   @id @default(cuid())
  cardId                 String
  languageId             String
  condition              BulkCardCondition @default(NM)
  finish                 BulkCardFinish    @default(NORMAL)
  storageLocationId      String
  physicalQuantity       Int      @default(0)
  reservedQuantity       Int      @default(0)
  averageAcquisitionCost Decimal  @default(0) @db.Decimal(18, 8)
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt

  card            Card                  @relation(fields: [cardId], references: [id], onDelete: Restrict)
  language        BulkLanguage            @relation(fields: [languageId], references: [id], onDelete: Restrict)
  storageLocation BulkStorageLocation     @relation(fields: [storageLocationId], references: [id], onDelete: Restrict)
  movements       BulkInventoryMovement[]

  @@unique([cardId, languageId, condition, finish, storageLocationId])
  @@index([cardId])
  @@index([languageId, condition, finish])
  @@index([storageLocationId])
}

model BulkInventoryMovement {
  id                  String         @id @default(cuid())
  inventoryId         String
  physicalDelta       Int            @default(0)
  reservedDelta       Int            @default(0)
  type                BulkMovementType
  source              String
  intakeId            String?
  recipeId            String?
  relatedReference    String?
  acquisitionUnitCost Decimal?       @db.Decimal(18, 8)
  reversalOfId        String?
  adminUserId         String?
  adminLabel          String
  createdAt           DateTime       @default(now())

  inventory BulkInventory              @relation(fields: [inventoryId], references: [id], onDelete: Restrict)
  intake    BulkIntake?                 @relation(fields: [intakeId], references: [id], onDelete: Restrict)
  recipe    BulkProductRecipe?          @relation(fields: [recipeId], references: [id], onDelete: Restrict)
  admin     User?                     @relation(fields: [adminUserId], references: [id], onDelete: Restrict)
  reversalOf BulkInventoryMovement?     @relation("BulkMovementReversal", fields: [reversalOfId], references: [id], onDelete: Restrict)
  reversals  BulkInventoryMovement[]    @relation("BulkMovementReversal")

  @@index([inventoryId, createdAt])
  @@index([intakeId])
  @@index([recipeId])
  @@index([adminUserId, createdAt])
  @@index([reversalOfId])
}

model BulkIntake {
  id                String         @id @default(cuid())
  sellerSource      String
  acquisitionDate   DateTime
  totalPrice        Decimal        @db.Decimal(12, 2)
  languageId        String
  defaultCondition  BulkCardCondition       @default(NM)
  defaultFinish     BulkCardFinish          @default(NORMAL)
  costAllocationMethod BulkCostAllocationMethod @default(UNIFORM)
  knownSet          String?
  declaredCardCount Int
  notes             String?
  status            BulkIntakeStatus @default(DRAFT)
  postedAt          DateTime?
  createdById       String?
  createdByLabel    String
  postedById        String?
  postedByLabel     String?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  createdBy User?                 @relation("BulkIntakeCreatedBy", fields: [createdById], references: [id], onDelete: Restrict)
  language  BulkLanguage            @relation(fields: [languageId], references: [id], onDelete: Restrict)
  postedBy  User?                 @relation("BulkIntakePostedBy", fields: [postedById], references: [id], onDelete: Restrict)
  lines     BulkIntakeLine[]
  movements BulkInventoryMovement[]

  @@index([status, acquisitionDate])
  @@index([sellerSource])
}

model BulkIntakeLine {
  id                  String     @id @default(cuid())
  intakeId            String
  cardId              String
  quantity            Int
  condition           BulkCardCondition
  finish              BulkCardFinish
  acquisitionUnitCost Decimal?   @db.Decimal(18, 8)
  storageLocationId   String
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt

  intake BulkIntake @relation(fields: [intakeId], references: [id], onDelete: Cascade)
  card            Card              @relation(fields: [cardId], references: [id], onDelete: Restrict)
  storageLocation BulkStorageLocation @relation(fields: [storageLocationId], references: [id], onDelete: Restrict)

  @@unique([intakeId, cardId, condition, finish, storageLocationId])
  @@index([cardId])
}

model BulkProductRecipe {
  id           String   @id @default(cuid())
  name         String   @unique
  description  String?
  sourceDeckId String?
  createdById  String?
  createdByLabel String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  sourceDeck Deck?                 @relation(fields: [sourceDeckId], references: [id], onDelete: SetNull)
  createdBy  User?                 @relation(fields: [createdById], references: [id], onDelete: Restrict)
  lines      BulkProductRecipeLine[]
  movements  BulkInventoryMovement[]

  @@index([sourceDeckId])
}

model BulkProductRecipeLine {
  id         String     @id @default(cuid())
  recipeId   String
  cardId     String
  languageId String
  section    BulkRecipeSection @default(GENERIC)
  quantity   Int

  recipe   BulkProductRecipe @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  card     Card            @relation(fields: [cardId], references: [id], onDelete: Restrict)
  language BulkLanguage      @relation(fields: [languageId], references: [id], onDelete: Restrict)

  @@unique([recipeId, cardId, languageId, section])
  @@index([cardId, languageId])
}

enum BulkRecipeSection {
  LEGEND
  CHAMPION
  MAIN_DECK
  BATTLEFIELD
  SIDEBOARD
  GENERIC
}
```

Relations inverses à ajouter :

```prisma
// Card
bulkInventoryItems BulkInventory[]
bulkIntakeLines    BulkIntakeLine[]
bulkRecipeLines    BulkProductRecipeLine[]

// Deck
bulkRecipes BulkProductRecipe[]

// User
bulkMovements       BulkInventoryMovement[]
bulkCreatedIntakes  BulkIntake[]             @relation("BulkIntakeCreatedBy")
bulkPostedIntakes   BulkIntake[]             @relation("BulkIntakePostedBy")
bulkCreatedRecipes  BulkProductRecipe[]
```

Le schéma cible compte huit modèles Bulking et sept enums. Il est posé dès la phase 1 pour éviter plusieurs changements de base, même si les recettes restent sans interface avant la phase 4.

### 3.2 Invariants hors schéma

Prisma ne pose pas les contraintes `CHECK` portables avec `db push`. Les fonctions d'écriture doivent donc garantir :

```text
physicalQuantity >= 0
reservedQuantity >= 0
reservedQuantity <= physicalQuantity
quantity > 0
physicalDelta != 0 OR reservedDelta != 0
acquisitionUnitCost >= 0
declaredCardCount > 0
```

Les fonctions doivent utiliser une transaction `Serializable`. Si PostgreSQL refuse une transaction pour conflit, l'API renvoie `409` et demande de recommencer. Ne pas cacher ce conflit par une seconde écriture automatique sans borne.

### 3.3 Coût moyen

Une entrée physique positive recalcule le coût moyen :

```text
nouveau coût moyen =
  (ancienne quantité × ancien coût + quantité entrée × coût unitaire)
  / nouvelle quantité
```

Une sortie conserve le coût moyen. Quand le stock physique tombe à zéro, le coût moyen revient à zéro.

Une correction positive exige un coût unitaire. Une réservation ne change jamais le coût moyen.

---

## 4. Contrats TypeScript partagés

Créer `src/lib/bulking-types.ts` avec les types qui traversent plusieurs écrans ou routes :

```ts
export type BulkCardConditionCode = "NM";
export type BulkCardFinishCode = "NORMAL" | "FOIL";

export type BulkInventoryKey = {
  cardId: string;
  languageId: string;
  condition: BulkCardConditionCode;
  finish: BulkCardFinishCode;
  storageLocationId: string;
};

export type BulkStockBalance = BulkInventoryKey & {
  physicalQuantity: number;
  reservedQuantity: number;
  averageAcquisitionCost: string;
};

export type BulkRecipeRequirement = {
  cardId: string;
  languageId: string;
  section?: "LEGEND" | "CHAMPION" | "MAIN_DECK" | "BATTLEFIELD" | "SIDEBOARD" | "GENERIC";
  quantity: number;
};

export type BulkRecipeAvailability = BulkRecipeRequirement & {
  availableQuantity: number;
  missingQuantity: number;
  buildableQuantity: number;
  averageAcquisitionCost: string;
  limiting: boolean;
};

export type BulkRecipeAnalysis = {
  buildableQuantity: number;
  inventoryCostPerProduct: string;
  lines: BulkRecipeAvailability[];
};
```

Les montants traversent JSON sous forme de chaînes. Le navigateur ne doit jamais recevoir un objet Prisma `Decimal` brut ni convertir les coûts de stockage en nombres flottants avant affichage.

---

## 5. Carte des fichiers

### Fichiers à modifier

- `prisma/schema.prisma` : modèles, enums et relations Bulking.
- `src/lib/auth.ts` : lecture stricte de l'admin Bulking.
- `src/app/admin/layout.tsx` : lien de navigation Bulking.
- `src/app/admin/decks/page.tsx` : actions Bulking sur les decks officiels.
- `docs/README.md` : lien vers ce plan tant que le chantier reste ouvert.
- `HANDOFF.md` : état du chantier lors d'un arrêt entre deux tâches.

### Fichiers à créer

- `src/lib/bulking-types.ts` : contrats partagés.
- `src/lib/bulking-validation.ts` : validation des entrées API.
- `src/lib/bulking-stock.ts` : calculs purs et écritures de stock.
- `src/lib/bulking-stock.test.ts` : coût moyen, quantités et mouvements.
- `src/lib/bulking-recipes.ts` : calcul pur de constructibilité.
- `src/lib/bulking-recipes.test.ts` : recettes, manques et limites.
- `src/app/admin/bulking/layout.tsx` : onglets internes du module.
- `src/app/admin/bulking/page.tsx` : tableau de bord.
- `src/app/admin/bulking/locations/page.tsx` : gestion simple des emplacements.
- `src/app/admin/bulking/inventory/page.tsx` : liste du stock.
- `src/app/admin/bulking/inventory/inventory-filters.tsx` : filtres URL.
- `src/app/admin/bulking/inventory/inventory-actions.tsx` : correction et transfert.
- `src/app/admin/bulking/movements/page.tsx` : registre en lecture seule.
- `src/app/admin/bulking/intakes/page.tsx` : liste des entrées.
- `src/app/admin/bulking/intakes/new/page.tsx` : coquille serveur.
- `src/app/admin/bulking/intakes/new/intake-editor.tsx` : saisie rapide.
- `src/app/admin/bulking/intakes/[id]/page.tsx` : détail et comptabilisation.
- `src/app/admin/bulking/recipes/page.tsx` : liste des recettes.
- `src/app/admin/bulking/recipes/new/page.tsx` : création manuelle ou depuis un deck.
- `src/app/admin/bulking/recipes/[id]/page.tsx` : détail et analyse.
- `src/app/admin/bulking/decks/[id]/page.tsx` : analyse d'un deck avant recette.
- `src/app/api/admin/bulking/cards/route.ts` : recherche de cartes avec `Card.id`.
- `src/app/api/admin/bulking/locations/route.ts` : liste et création des emplacements.
- `src/app/api/admin/bulking/locations/[id]/route.ts` : modification d'un emplacement.
- `src/app/api/admin/bulking/inventory/adjust/route.ts` : correction enregistrée.
- `src/app/api/admin/bulking/inventory/transfer/route.ts` : transfert atomique.
- `src/app/api/admin/bulking/intakes/route.ts` : création et liste.
- `src/app/api/admin/bulking/intakes/[id]/route.ts` : édition d'un brouillon.
- `src/app/api/admin/bulking/intakes/[id]/post/route.ts` : comptabilisation.
- `src/app/api/admin/bulking/recipes/route.ts` : création et liste.
- `src/app/api/admin/bulking/recipes/[id]/route.ts` : lecture et édition.
- `src/app/api/admin/bulking/recipes/[id]/analysis/route.ts` : analyse du stock.
- `src/app/api/admin/bulking/decks/[id]/analysis/route.ts` : analyse d'un deck.
- `src/app/api/admin/bulking/decks/[id]/recipe/route.ts` : recette depuis un deck.
- `src/lib/bulking-auth.test.ts` : auteur Discord ou `password-admin`.

Ne pas créer un système générique de dépôt, de commande ou de catalogue commercial. Ces besoins ne sont pas demandés.

---

## 6. Tâches de mise en œuvre

### Ordre des phases

1. **Phase 1, fondations :** tâches 1 à 5, puis la partie emplacements de la tâche 6. Elle livre le schéma cible, l'acteur, les calculs de stock et d'allocation, le registre, le service transactionnel et les emplacements.
2. **Phase 2, entrée en lot :** partie recherche de cartes de la tâche 6, puis tâches 8 et 9. Elle doit suffire pour saisir et comptabiliser un vrai lot physique de 500 cartes.
3. **Phase 3, consultation :** tâche 7. Elle ajoute les filtres, soldes et mouvements. Ne pas l'exécuter dans le présent chantier.
4. **Phase 4, recettes :** tâche 10 et calculs de recette prévus dans la tâche 3. Ne pas l'exécuter dans le présent chantier.
5. **Phase 5, decks officiels :** tâche 11. Ne pas l'exécuter dans le présent chantier.

La tâche 12 de préparation méta est retirée de V1. Les tâches 13 et 14 se limitent, dans ce chantier, aux fonctions et écrans des phases 1 et 2.

### Tâche 1 : poser le schéma Bulking

**Fichiers :**

- Modifier : `prisma/schema.prisma`
- Produire : client Prisma régénéré dans l'emplacement déjà géré par Prisma

**Produit :** les sept modèles et les huit enums définis à la section 3.

- [x] **Étape 1 : ajouter les enums, modèles et relations inverses**

Copier le schéma de la section 3 sans renommer les champs. Ne toucher à aucun modèle public hors relations inverses.

- [x] **Étape 2 : formater le schéma**

Commande :

```powershell
npx prisma format
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu : `EXIT=0`.

- [x] **Étape 3 : valider le schéma sans toucher à la base**

Commande :

```powershell
npx prisma validate
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu : `EXIT=0`.

- [x] **Étape 4 : régénérer le client**

Commande :

```powershell
npx prisma generate
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu : `EXIT=0`.

- [x] **Étape 5 : appliquer d'abord à la base locale**

Vérifier que `DATABASE_URL` vise PostgreSQL local sur le port 5433. Si cette vérification n'est pas possible sans lire un secret, demander à Allan. Ne jamais lancer `db push` contre une adresse non vérifiée.

```powershell
npx prisma db push
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu : `EXIT=0`, sans perte de données annoncée.

- [x] **Étape 6 : ne pas modifier encore `TABLES_ATTENDUES`**

Les nouvelles tables ne doivent entrer dans `migrate-schema.mjs` qu'après leur création en production. Sinon le conteneur refuse de démarrer avant l'application du schéma.

- [x] **Étape 7 : committer**

```powershell
git add prisma/schema.prisma
git commit -m "bulking: ajoute les tables de stock et de recettes"
```

### Tâche 2 : identifier l'auteur sans bloquer le cookie admin

**Fichiers :**

- Modifier : `src/lib/auth.ts`
- Créer : `src/app/api/admin/bulking/auth.test.ts`

**Produit :**

```ts
export async function getBulkAdminActor(): Promise<{
  adminUserId: string | null;
  adminLabel: string;
} | null>;
```

- [x] **Étape 1 : sortir une règle pure testable**

Ajouter une fonction qui accepte un utilisateur ou `null` et ne rend l'utilisateur que si son rôle vaut `admin` :

```ts
export function libelleAdminDiscord(user: { id: string; username: string; discordName: string | null }): string {
  return user.discordName ?? user.username ?? user.id;
}
```

- [x] **Étape 2 : écrire le test avant les fonctions serveur**

Tester un nom Discord, le repli sur `username`, puis le repli sur `id`.

- [x] **Étape 3 : constater l'échec**

```powershell
npx vitest run src/app/api/admin/bulking/auth.test.ts
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu avant ajout : échec d'import ou fonction absente.

- [x] **Étape 4 : ajouter les fonctions serveur**

```ts
export async function getBulkAdminActor() {
  if (!(await isAdmin())) return null;
  const user = await getUserFromSession();
  if (user?.role === "admin") {
    return { adminUserId: user.id, adminLabel: libelleAdminDiscord(user) };
  }
  return { adminUserId: null, adminLabel: "password-admin" };
}
```

Ne pas modifier `isAdmin()` ni bloquer le cookie signé. Si les deux sessions existent, garder l'identité Discord.

- [x] **Étape 5 : vérifier le test**

Même commande. Résultat attendu : test vert et `EXIT=0`.

- [x] **Étape 6 : committer**

```powershell
git add src/lib/auth.ts src/app/api/admin/bulking/auth.test.ts
git commit -m "bulking: inscrit l'auteur de chaque mouvement"
```

### Tâche 3 : écrire les calculs purs de stock et d'allocation

**Fichiers :**

- Créer : `src/lib/bulking-types.ts`
- Créer : `src/lib/bulking-stock.ts`
- Créer : `src/lib/bulking-stock.test.ts`

**Produit :**

```ts
export function calculerDisponible(physical: number, reserved: number): number;
export function calculerCoutMoyenPondere(input: {
  currentQuantity: number;
  currentAverageCost: string;
  addedQuantity: number;
  addedUnitCost: string;
}): string;
export function calculerCoutUniforme(totalPrice: string, accountedCards: number): string;
```

- [x] **Étape 1 : écrire les tests de stock**

Cas requis : disponible normal, réservé supérieur au physique refusé, moyenne de 10 cartes à 0,10 € plus 5 cartes à 0,40 € égale à 0,20 €, sortie sans changement du coût moyen, stock ramené à zéro avec coût zéro, allocation uniforme de 40 € sur 4 000 cartes égale à 0,0100 €.

- [x] **Étape 2 : lancer les tests et constater l'échec**

```powershell
npx vitest run src/lib/bulking-stock.test.ts
Write-Output "EXIT=$LASTEXITCODE"
```

- [x] **Étape 3 : écrire le minimum de logique**

Utiliser `Prisma.Decimal` pour les coûts. Ne pas ajouter une bibliothèque de monnaie.

- [x] **Étape 4 : lancer les tests**

Résultat attendu : tous verts, `EXIT=0`.

- [x] **Étape 5 : committer**

```powershell
git add src/lib/bulking-types.ts src/lib/bulking-stock.ts src/lib/bulking-stock.test.ts
git commit -m "bulking: calcule les soldes et les coûts d'entrée"
```

### Tâche 4 : valider toutes les entrées API

**Fichiers :**

- Créer : `src/lib/bulking-validation.ts`
- Créer : `src/lib/bulking-validation.test.ts`

**Produit :** validateurs à liste blanche pour recherche, correction, transfert, entrée et recette.

- [x] **Étape 1 : fixer les bornes**

```text
recherche : 2 à 100 caractères
source/vendeur : 1 à 120 caractères
emplacement : 1 à 80 caractères
notes : 0 à 5 000 caractères
nom de recette : 1 à 160 caractères
quantité par ligne : 1 à 100 000
delta : -100 000 à 100 000, hors zéro
lignes par lot ou recette : 1 à 5 000
prix total : 0 à 10 000 000, deux décimales
coût unitaire manuel : 0 à 100 000, quatre décimales ; nullable en mode UNIFORM
date d'acquisition : date ISO valide, pas plus de 24 heures dans le futur
```

- [x] **Étape 2 : écrire les tests de refus**

Tester un objet inconnu, un champ en trop, une langue hors enum, une condition autre que `NM`, une finition inconnue, une quantité décimale, une quantité nulle, un coût négatif, un lot vide, 5 001 lignes et un coût absent en mode `MANUAL`. Un coût absent en mode `UNIFORM` doit passer.

- [x] **Étape 3 : écrire les tests d'acceptation**

Tester une correction, un transfert, un lot complet et une recette complète.

- [x] **Étape 4 : constater l'échec**

```powershell
npx vitest run src/lib/bulking-validation.test.ts
Write-Output "EXIT=$LASTEXITCODE"
```

- [x] **Étape 5 : écrire les validateurs sans dépendance**

Suivre `src/lib/admin-validation.ts` : contrôle de forme, liste des clés autorisées, bornes, message français court. Ne pas ajouter Zod.

- [x] **Étape 6 : vérifier puis committer**

```powershell
npx vitest run src/lib/bulking-validation.test.ts
Write-Output "EXIT=$LASTEXITCODE"
git add src/lib/bulking-validation.ts src/lib/bulking-validation.test.ts
git commit -m "bulking: valide les écritures commerciales"
```

### Tâche 5 : créer le seul passage d'écriture du stock

**Fichiers :**

- Modifier : `src/lib/bulking-stock.ts`
- Modifier : `src/lib/bulking-stock.test.ts`

**Produit :**

```ts
export async function appliquerMouvement(
  tx: Prisma.TransactionClient,
  input: {
    key: BulkInventoryKey;
    physicalDelta: number;
    reservedDelta: number;
    type: BulkMovementType;
    source: string;
    acquisitionUnitCost?: string;
    intakeId?: string;
    recipeId?: string;
    relatedReference?: string;
    reversalOfId?: string;
    adminUserId: string | null;
    adminLabel: string;
  },
): Promise<BulkInventoryMovement>;
```

- [x] **Étape 1 : tester avec un faux client réduit**

Le test doit prouver : création de la ligne absente, refus du stock négatif, refus d'un réservé supérieur au physique, coût moyen après entrée, mouvement créé une seule fois, aucun mouvement si la mise à jour échoue.

- [x] **Étape 2 : écrire `appliquerMouvement`**

La fonction :

1. lit ou crée la ligne de stock par `cardId + language + condition + finish + storageLocationId` dans la transaction reçue ;
2. calcule les nouveaux soldes ;
3. refuse un invariant cassé ;
4. met à jour la ligne ;
5. crée le mouvement ;
6. rend le mouvement.

Aucune route ne doit appeler directement `prisma.bulkInventory.update`.

- [x] **Étape 3 : ajouter une recherche des appels interdits**

Après la tâche, cette commande ne doit trouver que `bulking-stock.ts` :

```powershell
rg -n "bulkInventory\.(update|upsert|create)" src
```

- [x] **Étape 4 : vérifier et committer**

```powershell
npx vitest run src/lib/bulking-stock.test.ts
Write-Output "EXIT=$LASTEXITCODE"
git add src/lib/bulking-stock.ts src/lib/bulking-stock.test.ts
git commit -m "bulking: inscrit chaque changement dans le registre"
```

### Tâche 6 : gérer les emplacements et rechercher les cartes

**Fichiers :**

- Créer : `src/app/api/admin/bulking/cards/route.ts`
- Créer : `src/app/api/admin/bulking/locations/route.ts`
- Créer : `src/app/api/admin/bulking/locations/[id]/route.ts`
- Créer : `src/app/admin/bulking/locations/page.tsx`

**Produit :** emplacements triables utilisables par les entrées et recherche canonique au clavier.

- [x] **Étape 1 : route de recherche**

`GET /api/admin/bulking/cards?q=&set=&limit=20` vérifie `isAdmin()`, recherche `name`, `cleanName` et `riftboundId`, puis rend au plus 50 lignes :

```ts
type BulkCardSearchResult = {
  id: string;
  riftboundId: string;
  name: string;
  set: string;
  collectorNumber: number | null;
  rarity: string;
  alternateArt: boolean;
  overnumbered: boolean;
  signature: boolean;
};
```

Ne pas réutiliser le DTO public qui omet `Card.id`.

- [x] **Étape 2 : routes d'emplacements**

`GET /locations` rend les emplacements triés par `code`. `POST /locations` crée un code unique. `PATCH /locations/[id]` modifie code, libellé et notes. V1 ne propose pas de suppression.

- [x] **Étape 3 : page d'emplacements**

La page liste code, libellé et notes, puis permet la création et la modification. Elle suit les composants de l'admin actuel et contrôle `r.ok` puis la forme de réponse.

- [x] **Étape 4 : tester les frontières**

Ajouter des tests unitaires des fonctions exportées par les routes ou sortir le traitement des requêtes en fonctions pures si l'import Next empêche Vitest Node de les charger. Vérifier au moins 401, 400, 404, 409 et 200.

- [x] **Étape 5 : committer**

```powershell
git add src/app/api/admin/bulking/cards src/app/api/admin/bulking/locations src/app/admin/bulking/locations
git commit -m "bulking: gère les emplacements et cherche les cartes"
```

### Tâche 7 : construire l'interface d'inventaire et le registre après la phase 2

**Fichiers :**

- Modifier : `src/app/admin/layout.tsx`
- Créer : `src/app/admin/bulking/layout.tsx`
- Créer : `src/app/admin/bulking/page.tsx`
- Créer : `src/app/admin/bulking/inventory/page.tsx`
- Créer : `src/app/admin/bulking/inventory/inventory-filters.tsx`
- Créer : `src/app/admin/bulking/inventory/inventory-actions.tsx`
- Créer : `src/app/admin/bulking/movements/page.tsx`

**Produit :** module navigable, stock filtrable et registre lisible.

- [x] **Étape 1 : ajouter un seul lien de navigation**

Ajouter `{ href: "/admin/bulking", label: "Bulking" }` dans `navItems`. Ne pas ajouter chaque sous-page à la barre globale.

- [x] **Étape 2 : protéger chaque page**

Le layout Bulking appelle `verifyAdmin()`. Les écritures utilisent `getBulkAdminActor()` et acceptent les deux modes d'accès.

- [x] **Étape 3 : tableau de bord**

Afficher quatre chiffres issus de requêtes Prisma directes : lignes de stock, cartes physiques, cartes réservées et lots en brouillon. Ne pas utiliser `safeQuery`.

- [x] **Étape 4 : liste du stock**

Colonnes : carte, impression, langue, emplacement, physique, réservé, disponible, coût moyen, valeur du stock, dernière modification.

Filtres URL : recherche, set, langue, emplacement, « seulement manquants/réservés ». Pagination serveur de 100 lignes.

- [x] **Étape 5 : actions**

Une boîte de dialogue permet une correction ou un transfert. Après envoi : contrôle `r.ok`, contrôle de la forme, message d'erreur visible, `router.refresh()` si succès.

- [x] **Étape 6 : registre**

Colonnes : date, carte, langue, emplacement, delta physique, delta réservé, type, source, lot/recette, coût, auteur. Aucun bouton modifier ou supprimer.

Filtres URL : dates, carte, type, auteur, lot, recette. Pagination serveur de 100 lignes.

- [x] **Étape 7 : vérifier clavier et mobile**

Tous les contrôles ont un libellé, un état de focus visible et une cible d'au moins 44 px. Les tables défilent sans élargir la page à 320 px. Le zoom à 200 % conserve l'ordre de lecture.

- [x] **Étape 8 : committer**

```powershell
git add src/app/admin/layout.tsx src/app/admin/bulking
git commit -m "bulking: affiche le stock et son registre"
```

### Tâche 8 : créer et modifier les entrées en brouillon

**Fichiers :**

- Créer : `src/app/api/admin/bulking/intakes/route.ts`
- Créer : `src/app/api/admin/bulking/intakes/[id]/route.ts`
- Créer : `src/app/admin/bulking/intakes/page.tsx`
- Créer : `src/app/admin/bulking/intakes/new/page.tsx`
- Créer : `src/app/admin/bulking/intakes/new/intake-editor.tsx`
- Créer : `src/app/admin/bulking/intakes/[id]/page.tsx`

**Produit :** un lot peut être saisi, sauvé et repris sans toucher au stock.

- [x] **Étape 1 : API des brouillons**

`POST /intakes` crée un lot et ses lignes. `PATCH /intakes/[id]` remplace les métadonnées et les lignes seulement si `status === DRAFT`. Les deux opérations enregistrent l'acteur rendu par `getBulkAdminActor()`.

- [x] **Étape 2 : empêcher toute retouche comptable**

Une tentative de modifier un lot `POSTED` rend `409` avec « Cette entrée a déjà été comptabilisée ».

- [x] **Étape 3 : liste des lots**

Afficher date, source, langue, set, cartes déclarées, cartes saisies, prix total, statut et auteur. Filtres : statut, langue, date et source.

- [x] **Étape 4 : saisie rapide**

Le formulaire garde en haut : source, date, prix total, méthode d'allocation, langue, set connu, condition `NM`, finition par défaut, nombre déclaré, emplacement par défaut et notes.

La grille de lignes garde : champ carte, quantité, finition et emplacement. Le coût unitaire n'apparaît qu'en mode `MANUAL`. La langue et la condition viennent du lot, avec surcharge de finition par ligne.

Comportement clavier :

1. autofocus sur la recherche carte ;
2. Entrée choisit le résultat exact ou le premier résultat visible ;
3. Tab passe à la quantité puis au coût ;
4. Entrée ajoute la ligne ; si la même clé `cardId + condition + finish + storageLocationId` existe déjà, sa quantité augmente au lieu de créer une ligne ;
5. le focus revient à la recherche ;
6. `Ctrl+S` enregistre le brouillon sans recharger la page.

La quantité vaut 1 au choix d'une carte. Ajouter des boutons `+1` et `+3`, mais garder les champs natifs accessibles. Le client fusionne les doublons pour la vitesse ; l'API les agrège encore avant l'écriture pour garantir l'intégrité.

- [x] **Étape 5 : contrôles visibles**

Afficher en permanence : nombre déclaré, quantité saisie et écart. En mode `UNIFORM`, afficher le prix total et le coût unitaire estimé. En mode `MANUAL`, afficher la somme des lignes et l'écart de prix. Le bouton « Comptabiliser » reste absent de la page de création.

- [x] **Étape 6 : résister à un échec réseau**

Ne jamais vider les lignes avant une réponse positive. En cas d'échec, garder le formulaire, afficher l'erreur et proposer « Réessayer ».

- [x] **Étape 7 : committer**

```powershell
git add src/app/api/admin/bulking/intakes src/app/admin/bulking/intakes
git commit -m "bulking: saisit les entrées sans toucher au stock"
```

### Tâche 9 : comptabiliser une entrée dans une transaction

**Fichiers :**

- Créer : `src/app/api/admin/bulking/intakes/[id]/post/route.ts`
- Modifier : `src/app/admin/bulking/intakes/[id]/page.tsx`
- Modifier : `src/lib/bulking-stock.test.ts`

**Produit :** une action atomique transforme le brouillon en mouvements et soldes.

- [x] **Étape 1 : écrire les tests de service**

Tester : lot inexistant, lot déjà comptabilisé, total de cartes différent, coût manuel absent, total manuel différent, allocation uniforme de 40 € sur 4 000 cartes, carte supprimée ou inconnue, succès avec deux lignes, échec de la seconde ligne sans mouvement ni solde partiel.

- [x] **Étape 2 : écrire la route**

Dans une transaction `Serializable` :

1. relire le lot et toutes ses lignes ;
2. vérifier `DRAFT` ;
3. vérifier que la somme des quantités égale `declaredCardCount` ;
4. si la méthode vaut `UNIFORM`, calculer une fois `totalPrice / somme(quantity)` avec `Decimal` et affecter ce coût à chaque mouvement ;
5. si la méthode vaut `MANUAL`, exiger chaque coût de ligne et vérifier le total au centime ;
6. appeler `appliquerMouvement` pour chaque ligne avec `type: INTAKE`, sa variante physique et son emplacement ;
7. passer le lot à `POSTED`, remplir `postedAt`, `postedById` et `postedByLabel` ;
8. rendre le lot comptabilisé.

- [x] **Étape 3 : ajouter la confirmation**

La page récapitule le lot et demande une confirmation claire : « Comptabiliser N cartes pour X € ». Après succès, les champs deviennent en lecture seule.

- [x] **Étape 4 : vérifier l'idempotence**

Deux clics ou deux requêtes ne doivent pas doubler le stock. La seconde transaction voit `POSTED` et rend `409`.

- [x] **Étape 5 : committer**

```powershell
git add src/app/api/admin/bulking/intakes/[id]/post src/app/admin/bulking/intakes/[id]/page.tsx src/lib/bulking-stock.test.ts
git commit -m "bulking: comptabilise chaque entrée une seule fois"
```

### Tâche 10 : créer les recettes et calculer leur disponibilité

**Fichiers :**

- Créer : `src/app/api/admin/bulking/recipes/route.ts`
- Créer : `src/app/api/admin/bulking/recipes/[id]/route.ts`
- Créer : `src/app/api/admin/bulking/recipes/[id]/analysis/route.ts`
- Créer : `src/app/admin/bulking/recipes/page.tsx`
- Créer : `src/app/admin/bulking/recipes/new/page.tsx`
- Créer : `src/app/admin/bulking/recipes/[id]/page.tsx`

**Produit :** recettes manuelles et analyse instantanée du stock.

- [x] **Étape 1 : API de recette**

Créer ou remplacer une recette et ses lignes dans une transaction. Vérifier tous les `Card.id` avant l'écriture. Refuser les doublons `cardId + language` dans le corps.

- [x] **Étape 2 : API d'analyse**

Lire les lignes de recette, agréger le stock disponible de tous les emplacements par `cardId + language`, puis appeler `analyserRecette`.

Rendre les détails de cartes nécessaires à l'écran, mais aucun objet Prisma brut.

- [x] **Étape 3 : écran de création**

Réutiliser la recherche de cartes et la navigation clavier de l'entrée en lot. Champs : nom, description, langue par défaut, lignes et quantités.

- [x] **Étape 4 : écran de détail**

Afficher : quantité réalisable, coût de stock par produit, cartes manquantes, quantités manquantes, cartes limitantes et détail de chaque ligne.

Le coût est un coût de stock interne, jamais un prix de vente.

- [x] **Étape 5 : tests**

Vérifier une recette vide refusée, une carte inconnue, deux langues distinctes, plusieurs emplacements agrégés et aucune quantité disponible.

- [x] **Étape 6 : committer**

```powershell
git add src/app/api/admin/bulking/recipes src/app/admin/bulking/recipes
git commit -m "bulking: groupe les cartes en recettes chiffrées"
```

### Tâche 11 : relier les decks officiels aux recettes

**Fichiers :**

- Modifier : `src/app/admin/decks/page.tsx`
- Créer : `src/app/api/admin/bulking/decks/[id]/analysis/route.ts`
- Créer : `src/app/api/admin/bulking/decks/[id]/recipe/route.ts`
- Créer : `src/app/admin/bulking/decks/[id]/page.tsx`
- Créer : `src/lib/bulking-decks.ts`
- Créer : `src/lib/bulking-decks.test.ts`

**Produit :** analyse et création de recette depuis un `Deck` existant.

- [x] **Étape 1 : sortir la conversion pure**

```ts
export function exigencesDepuisDeck(
  cards: Array<{ cardId: string; quantity: number; section: string }>,
  languageId: string,
  includeSideboard: boolean,
): BulkRecipeRequirement[];
```

Inclure `main`, `rune` et `battlefield`. Inclure `side` seulement si `includeSideboard` vaut `true`. Refuser les quantités nulles ou négatives.

- [x] **Étape 2 : tester les sections**

Écrire un test pour chaque section, les doublons agrégés et le sideboard activé ou non.

- [x] **Étape 3 : route d'analyse**

Lire le `Deck` et ses `DeckCard`, convertir les exigences, charger le stock et appeler `analyserRecette`. Un deck absent rend `404`.

- [x] **Étape 4 : route de création**

Créer la recette et ses lignes dans une transaction, avec `sourceDeckId`. Un nom déjà pris rend `409` avec un message utile.

- [x] **Étape 5 : page d'analyse**

Afficher le deck, le choix de langue, la case sideboard, les manques, la quantité réalisable et le coût. Le bouton « Créer la recette » reprend exactement l'analyse affichée.

- [x] **Étape 6 : actions dans l'admin decks**

Ajouter un lien « Stock Bulking » dans les tables des decks éditoriaux et de tournoi. Ne rien ajouter aux pages publiques ni aux decks communautaires dans cette phase.

- [x] **Étape 7 : committer**

```powershell
git add src/app/admin/decks/page.tsx src/app/admin/bulking/decks src/app/api/admin/bulking/decks src/lib/bulking-decks.ts src/lib/bulking-decks.test.ts
git commit -m "bulking: crée une recette depuis un deck officiel"
```

### Tâche 12 : vérifier le parcours réel

**Fichiers :** aucun fichier de production attendu, sauf correction d'un défaut trouvé.

- [x] **Étape 1 : tests ciblés**

```powershell
npx vitest run src/lib/bulking-validation.test.ts src/lib/bulking-stock.test.ts src/lib/bulking-auth.test.ts
Write-Output "EXIT=$LASTEXITCODE"
```

Résultat attendu : `EXIT=0`.

- [x] **Étape 2 : recherche des écritures hors registre**

```powershell
rg -n "bulkInventory\.(update|upsert|create|delete)" src
rg -n "bulkInventoryMovement\.(update|delete|upsert)" src
```

Résultat attendu : seules les créations et modifications prévues dans `src/lib/bulking-stock.ts` apparaissent ; aucun mouvement n'est modifié ou supprimé.

- [x] **Étape 3 : vérifier l'authentification**

Sans session : toutes les routes rendent `401`.

Avec le seul cookie mot de passe : les écritures passent et portent `adminUserId = null`, `adminLabel = "password-admin"`.

Avec une session Discord admin : les écritures passent.

- [x] **Étape 4 : vérifier un lot de bout en bout**

Créer un lot de test avec deux cartes réelles, le reprendre, le comptabiliser, vérifier les deux mouvements, les soldes, le coût moyen et l'impossibilité de le comptabiliser une seconde fois.

Ne pas inventer de carte : choisir les identifiants depuis la base locale.

- [x] **Étape 5 : vérifier une recette et un deck**

Créer une recette manuelle, vérifier les manques, ajouter du stock, vérifier le nouveau nombre réalisable, puis créer une recette depuis un deck officiel réel.

- [x] **Étape 6 : vérifier l'interface**

Tailles : 320, 390, 768 et 1440 px. Zoom : 200 %. Parcours clavier sans souris pour saisir dix lignes. Vérifier focus, erreurs, défilement des tables et conservation du formulaire après panne simulée.

- [x] **Étape 7 : lancer toute la suite**

```powershell
npm test
Write-Output "TEST_EXIT=$LASTEXITCODE"
npm run lint
Write-Output "LINT_EXIT=$LASTEXITCODE"
npm run verify
Write-Output "VERIFY_EXIT=$LASTEXITCODE"
```

Résultat attendu : trois codes à zéro. Les avertissements lint déjà connus ne sont pas des erreurs nouvelles.

- [x] **Étape 8 : committer les seules corrections issues de la vérification**

```powershell
git add <fichiers réellement corrigés>
git commit -m "fix(bulking): corrige les défauts trouvés pendant la vérification"
```

Ne pas créer ce commit si aucune correction n'a été nécessaire.

### Tâche 13 : déployer le schéma sans arrêter le site

**Fichiers :**

- Modifier après création des tables en production seulement : `migrate-schema.mjs`
- Modifier : `HANDOFF.md`

- [ ] **Étape 1 : sauvegarde et cible**

Suivre `docs/DEPLOIEMENT.md` et la mise en garde de `HANDOFF.md`. Confirmer la cible avant toute commande Prisma. Ne jamais déduire la base visée depuis un nom de variable masqué.

- [ ] **Étape 2 : appliquer le schéma en production dans la fenêtre convenue**

Exécuter `prisma db push` selon la procédure du dépôt. Contrôler son vrai code de sortie et le message de Prisma. Arrêter si Prisma annonce une perte de données.

- [ ] **Étape 3 : déployer le code**

Une fois les tables présentes, déployer le code qui les lit. Le site public ne doit dépendre d'aucune table Bulking.

- [ ] **Étape 4 : ajouter les tables au contrôle de démarrage**

Ajouter les six tables Bulking à `TABLES_ATTENDUES` seulement après avoir prouvé leur présence en production. Déployer ce contrôle dans un second passage.

- [ ] **Étape 5 : essai court en production**

Vérifier la connexion admin, la recherche de cartes et la création d'un brouillon. Ne pas comptabiliser un lot réel sans validation d'Allan.

- [ ] **Étape 6 : consigner l'état**

Écrire dans `HANDOFF.md` : schéma appliqué ou non, version déployée, essais faits, commandes et codes de sortie.

---

## 7. Contrats API

### Recherche de cartes

```http
GET /api/admin/bulking/cards?q=poppy&set=OGN&limit=20
```

Réponse `200` : tableau de `BulkCardSearchResult`.

### Correction de stock

```json
{
  "cardId": "card-id",
  "language": "EN",
  "condition": "NM",
  "finish": "NORMAL",
  "storageLocationId": "location-id",
  "physicalDelta": 3,
  "reservedDelta": 0,
  "acquisitionUnitCost": "0.1200",
  "source": "Correction après comptage"
}
```

### Transfert

```json
{
  "cardId": "card-id",
  "language": "EN",
  "fromLocation": "A-03-02",
  "toLocation": "B-01-04",
  "quantity": 20,
  "source": "Rangement du bac A"
}
```

### Création d'une entrée

```json
{
  "sellerSource": "Vendeur local",
  "acquisitionDate": "2026-08-29",
  "totalPrice": "12.00",
  "costAllocationMethod": "UNIFORM",
  "language": "EN",
  "defaultCondition": "NM",
  "defaultFinish": "NORMAL",
  "knownSet": "OGN",
  "declaredCardCount": 120,
  "notes": null,
  "lines": [
    {
      "cardId": "card-id",
      "quantity": 3,
      "condition": "NM",
      "finish": "NORMAL",
      "acquisitionUnitCost": null,
      "storageLocationId": "location-id"
    }
  ]
}
```

### Comptabilisation

```http
POST /api/admin/bulking/intakes/{id}/post
```

Corps vide. La route relit toujours le brouillon en base.

### Création d'une recette

```json
{
  "name": "Origins EN C/U Playset x3",
  "description": null,
  "sourceDeckId": null,
  "lines": [
    {
      "cardId": "card-id",
      "language": "EN",
      "quantity": 3
    }
  ]
}
```

### Codes de réponse communs

- `200` : lecture ou modification réussie.
- `201` : création réussie.
- `400` : JSON ou données invalides.
- `401` : droit admin absent.
- `404` : carte, lot, recette ou deck absent.
- `409` : conflit de stock, nom déjà pris, lot déjà comptabilisé ou transaction concurrente.
- `500` : panne non prévue, sans trace d'exécution dans la réponse.

---

## 8. Index et volume

Le premier usage vise des milliers de cartes, pas des millions. Les index du schéma couvrent les recherches prévues. Ne pas ajouter Elasticsearch, Redis ni table de recherche.

Règles de volume :

- 100 lignes par page d'inventaire ou de registre ;
- 50 résultats de recherche de cartes au plus ;
- 5 000 lignes par entrée ou recette au plus ;
- une seule requête pour sauver un brouillon ;
- une seule transaction pour comptabiliser un lot ;
- aucune requête HTTP par carte.

Mesurer avant d'ajouter un cache ou un nouvel index. Un écran qui dépasse une seconde sur la base locale avec 100 000 mouvements justifie alors un relevé `EXPLAIN ANALYZE`.

---

## 9. Sécurité et intégrité

### Menaces à couvrir

- Une route oubliée sans contrôle admin.
- Une écriture au nom d'un auteur inconnu.
- Une requête répétée qui double un lot.
- Deux écritures concurrentes qui rendent le stock négatif.
- Une suppression de carte qui efface le registre.
- Une valeur de coût convertie en flottant.
- Un objet JSON avec des champs Prisma injectés.
- Une panne de base affichée comme un stock vide.

### Réponses prévues

- Toutes les routes restent sous `/api/admin/bulking`.
- Les écritures appellent `getBulkAdminActor()` en première opération.
- Les validateurs refusent les champs inconnus.
- Le registre et le solde partagent une transaction `Serializable`.
- Les relations commerciales vers `Card` et `User` utilisent `Restrict`.
- Les brouillons passent une seule fois de `DRAFT` à `POSTED`.
- Les coûts JSON restent des chaînes et Prisma les convertit en `Decimal`.
- Les pages commerciales n'utilisent pas `safeQuery`.

---

## 10. Ce qui reste hors périmètre

### 10.1 Prix, ventes et tableau de bord futurs

Les phases 1 et 2 ne créent ni route ni écran de prix ou de vente. Le schéma actuel garde toutefois les clés nécessaires : `Card.id`, `BulkLanguage.id`, variante physique, mouvements horodatés, coût d'entrée, lot source et auteur.

La future phase de prix ajoutera une table séparée, sans modifier le coût historique :

```text
BulkMarketPrice
  provider             chaîne, par exemple cardmarket ou manual
  cardId               FK Card
  languageId           FK BulkLanguage
  condition
  finish
  priceType            LOWEST | TREND | AVERAGE | CUSTOM_REFERENCE
  amount               Decimal
  fetchedAt
```

Le code lira ces lignes derrière une interface `MarketPriceProvider`. Aucun appel Cardmarket ni scraping ne commence avant un relevé écrit des accès officiels ou autorisés. Un import manuel peut fournir le premier fournisseur.

Le prix cible de revente vivra dans une table commerciale distincte. Le prix réel vivra plus tard dans `BulkSale` et `BulkSaleLine`. Aucun de ces prix ne remplace `BulkInventory.averageAcquisitionCost` ni `BulkInventoryMovement.acquisitionUnitCost`.

Pour répondre à « combien reste-t-il du lot acheté 40 € ? », une future `BulkInventoryLot` figera la quantité et le coût issus d'une `BulkIntakeLine`. Une `BulkSaleAllocation` reliera ensuite une ligne vendue à un ou plusieurs lots. Ce lien permettra le coût des biens vendus et la marge brute par lot, set, langue et rareté sans détourner `BulkInventory.averageAcquisitionCost`, qui reste un coût moyen opérationnel.

### 10.2 Principe commun aux imports futurs

Un import de marché ou de scanner ne parle jamais directement au stock. Il conserve sa source, produit un aperçu, attend une décision humaine, puis passe par le service existant de lignes d'entrée ou de mouvements.

### 10.3 Aide à l'achat future

La future table d'aide joindra stock, coût moyen, prix de référence et prix cible. Elle pourra calculer marge potentielle et ROI simples. Le score d'achat, la vitesse de vente, les frais estimés et la demande méta attendront des sources vérifiées.

### 10.4 Achats structurés

`BulkIntake.sellerSource` reste le champ utilisé par les phases 1 et 2. Il suffit au parcours manuel déjà livré et ne doit pas être remplacé avant le chantier des achats.

La future phase d'achats ajoutera une entité séparée :

```text
BulkPurchase
  id
  sourceType          CARDMARKET | VINTED | EBAY | LOCAL | SUPPLIER | OTHER
  sellerLabel         chaîne optionnelle
  externalReference   chaîne optionnelle
  acquisitionDate
  totalPrice
  notes
  createdAt
  updatedAt

BulkIntake.purchaseId   FK optionnelle vers BulkPurchase
```

Une contrainte unique partielle ou un contrôle métier empêchera deux achats du même fournisseur de reprendre la même référence externe quand celle-ci existe. Les entrées historiques garderont `sellerSource` sans migration forcée. Une entrée pourra recevoir `purchaseId` plus tard. Le prix de l'achat ne remplacera pas `BulkIntake.totalPrice` tant que les règles de réception partielle et de ventilation entre plusieurs entrées ne sont pas définies.

La chaîne visée reste : achat, entrées reçues, sessions de scan, lignes validées, mouvements de stock, produits, ventes et allocations de vente. Aucun de ces liens ne change le rôle de `BulkInventoryMovement` comme registre du stock.

### 10.5 Sessions de scan

Une session représente une séance physique, pas du stock. Une entrée peut avoir plusieurs sessions, y compris une session de correction ou de nouvelle numérisation.

```text
BulkScanSession
  id
  intakeId            FK BulkIntake
  status              DRAFT | PROCESSING | REVIEW | COMPLETED | CANCELLED
  label               chaîne optionnelle
  importSource        chaîne ou enum à fixer après étude des exports Epson
  startedAt           date optionnelle
  completedAt         date optionnelle
  notes
  createdAt
  updatedAt

BulkScanAsset
  id
  scanSessionId       FK BulkScanSession
  fileName
  mimeType
  storageKey
  imageHash           empreinte exacte ou perceptuelle
  position            entier optionnel
  capturedAt          date optionnelle
  createdAt

BulkScanDetection
  id
  scanAssetId         FK BulkScanAsset
  proposedCardId      FK Card optionnelle
  proposedLanguageId FK BulkLanguage optionnelle
  proposedFinish      BulkCardFinish optionnelle
  confidence          Decimal optionnelle
  reviewStatus        RECOGNIZED | UNCERTAIN | CONFIRMED | REJECTED
  manuallyEdited      booléen
  appliedAt           date optionnelle
  createdAt
  updatedAt

BulkScanDuplicateFlag
  id
  firstAssetId
  secondAssetId
  reason
  confidence          Decimal optionnelle
  decision            PENDING | DISTINCT_CARDS | SAME_PHYSICAL_CARD
  reviewedAt          date optionnelle
```

Les nombres affichés sur `BulkScanSession` (`numberOfFiles`, `numberDetected`, `numberValidated`, `numberUncertain`, `numberPossibleDuplicates`) se calculeront depuis les fichiers, détections et drapeaux. Ils ne seront persistés que si une mesure montre que ces agrégats ralentissent la revue.

Une session `COMPLETED` devient immuable, mais sa clôture ne crée aucun mouvement. Seule la comptabilisation explicite de `BulkIntake` modifie le stock. Une détection confirmée crée ou incrémente une ligne du brouillon par le même service que la saisie manuelle. Elle ne garde pas de FK vers `BulkIntakeLine` : le PATCH actuel remplace les lignes du brouillon et leurs identifiants ne sont pas stables. Une entrée `POSTED` refuse toute nouvelle validation de détection.

Avant cette phase, il faudra comparer les voies sûres pour l'Epson : import de fichiers, images par lot, PDF, ou pont local séparé. Le navigateur Next.js ne doit pas supposer qu'il pilote le matériel.

### 10.6 Import Cardmarket et rapprochement

Avant tout code, relever les formats d'export et les accès officiels ou autorisés de Cardmarket. Aucun scraping fragile ne sert de solution de repli.

Le marché ne doit pas entrer dans `Card`. Les identifiants externes vivent dans une table de correspondance séparée :

```text
BulkExternalCardMapping
  id
  provider             CARDMARKET
  externalProductId
  cardId               FK Card
  languageId           FK BulkLanguage optionnelle
  condition            BulkCardCondition optionnelle
  finish               BulkCardFinish optionnelle
  mappingStatus        CONFIRMED | NEEDS_REVIEW
  createdAt
  updatedAt

BulkInventoryImport
  id
  provider             CARDMARKET
  externalReference    chaîne optionnelle
  importedAt
  importedById         FK User optionnelle
  importedByLabel
  status               DRAFT | REVIEWED | APPLIED | CANCELLED
  sourceFileName
  notes

BulkInventoryImportLine
  id
  importId             FK BulkInventoryImport
  externalProductId
  rawLabel
  cardId               FK Card optionnelle
  languageId           FK BulkLanguage optionnelle
  condition            BulkCardCondition optionnelle
  finish               BulkCardFinish optionnelle
  externalQuantity
  internalQuantity     instantané pris lors de l'analyse
  mappingStatus        MATCHED | UNMATCHED | AMBIGUOUS
  comparisonStatus     EQUAL | EXTERNAL_HIGHER | EXTERNAL_LOWER | NOT_COMPARABLE
  acceptedDelta        entier optionnel
  movementId           FK BulkInventoryMovement optionnelle
```

L'import conserve le fichier brut ou son empreinte et toutes ses lignes analysées. L'aperçu filtre les correspondances sûres, absentes, ambiguës, égales, supérieures et inférieures. Une différence ne change rien tant qu'un admin ne l'accepte pas.

Une réconciliation acceptée appelle le service commun de mouvement dans une transaction. Elle crée un mouvement `ADJUSTMENT` avec `source = CARDMARKET_RECONCILIATION` et une référence vers la ligne d'import. Elle ne remplace jamais directement `physicalQuantity`. Une ligne ambiguë ou sans correspondance ne peut pas être appliquée.

### 10.7 Production de decks et recettes

La phase 4 ajoutera à `BulkProductRecipe` un booléen `eligibleForCompleteDeckSale` à `false`. Il exprime l'usage commercial prévu, pas la disponibilité. Un core C/U ou une pièce intermédiaire reste faux ; une recette de deck complet peut être vraie.

L'analyse de recette restera pure et calculée depuis le stock courant. Elle sera étendue sans état persistant :

```ts
type BulkRecipeMissingLine = {
  cardId: string;
  languageId: string;
  section: BulkRecipeSection;
  rarity: string | null;
  requiredQuantity: number;
  availableQuantity: number;
  missingQuantity: number;
  estimatedCompletionCost: string | null;
};

type BulkRecipeProductionAnalysis = {
  buildableQuantity: number;
  missingLines: BulkRecipeMissingLine[];
  missingByRarity: Record<string, number>;
  limitingCardIds: string[];
  buildableIfBottlenecksFilled: number | null;
  status: "READY" | "NEARLY_READY" | "MISSING_HIGH_VALUE_CARDS" | "MISSING_BULK" | "NOT_BUILDABLE";
};
```

`rarity` vient toujours de `Card`. Le coût estimé reste `null` avant la phase de prix. Les règles de `NEARLY_READY`, `MISSING_HIGH_VALUE_CARDS` et `MISSING_BULK` attendront des prix et des seuils validés ; la première version de Phase 4 peut donc ne rendre que `READY` ou `NOT_BUILDABLE`.

Le calcul doit aussi rendre les manques par rareté et la quantité réalisable si le goulot choisi était comblé. Cela permettra plus tard de montrer séparément le core C/U, les Rares et les Epics, puis de calculer combien de decks un achat précis débloquerait. Aucun conseil d'achat, ROI ou marge ne sera inventé dans les phases 4 et 5.

### 10.8 Ordre des chantiers futurs

Après la validation physique de Phase 2, l'ordre reste :

1. Phase 3, consultation du stock.
2. Phase 4, recettes et premier calcul de disponibilité.
3. Phase 5, decks officiels et conservation des sections.
4. Analyse des manques par rareté et du nombre de decks déblocables.
5. Import Cardmarket, correspondances et rapprochement revu par un humain.
6. Achats structurés.
7. Sessions de scan et import de fichiers.
8. Reconnaissance des cartes et détection des doubles scans.
9. Analyse de production débloquée.
10. Prix, marge et aide à l'achat.

Ces chantiers partagent `Card.id`, `BulkLanguage.id`, les variantes physiques, `BulkIntake` et `BulkInventoryMovement`. Ils ne créent ni second catalogue ni voie parallèle d'écriture du stock.

### 10.9 Compatibilité avec le schéma déjà posé

Aucun blocage n'oblige à reprendre Phase 1 ou Phase 2 :

- `BulkIntake` peut recevoir plus tard `purchaseId` et la relation `scanSessions` sans changer ses lignes ni sa comptabilisation.
- `sellerSource` peut rester pour les anciennes entrées et servir de libellé lisible après l'ajout de `BulkPurchase`.
- `BulkInventoryMovement.type = ADJUSTMENT`, `source` et `relatedReference` suffisent au premier rapprochement Cardmarket. Une FK vers une ligne d'import pourra être ajoutée quand ce chantier commencera.
- `BulkProductRecipe` peut recevoir le booléen d'éligibilité par ajout avec valeur par défaut.
- `BulkRecipeSection` et la relation à `Card` couvrent déjà l'analyse par partie du deck et par rareté.

Deux points devront être tranchés au début de leur phase, pas maintenant :

- Une recette ne porte aujourd'hui ni `condition` ni `finish`. Si un produit exige une finition physique précise, Phase 4 devra ajouter ces dimensions aux lignes et à leur contrainte unique.
- `BulkMovementType` n'a pas de valeur propre au rapprochement. `ADJUSTMENT` avec une source précise suffit tant qu'aucun rapport métier ne demande un type distinct.

### 10.10 Hors périmètre actuel

- Synchronisation automatique de marketplace ou de commandes.
- Prix de vente et marges.
- Buylist publique.
- Score d'achat automatique.
- Stock cible et alerte de surstock.
- Produits assemblés avec numéro de série.
- Réservation par commande client.
- Gestion des vendeurs comme entités séparées.
- Grades complexes au-delà de la condition `NM`.
- Finitions au-delà de `NORMAL` et `FOIL`.
- Import Cardmarket et scanner hors de leurs phases prévues aux sections 10.5 et 10.6.
- Decks communautaires et codes partagés.
- Toute modification de `/api/v1/*` ou du site public.

Ajouter l'un de ces éléments seulement quand son flux réel et sa source de vérité sont connus.

---

## 11. Critères de fin par phase

### Phase 1 : fondations

- Les tables existent en local.
- Un admin anonyme ne peut pas écrire.
- Les calculs de stock et de recette ont des tests verts.
- Aucun stock ne change sans mouvement.
- Les emplacements ont un code unique et se trient dans l'ordre physique.

### Phase 2 : entrées en lot

- L'admin saisit rapidement un lot au clavier.
- Il peut sauver et reprendre le brouillon.
- Le nombre de cartes et le prix se contrôlent avant comptabilisation.
- Une comptabilisation crée tous les mouvements ou aucun.
- Une seconde comptabilisation ne change rien.
- Un lot `UNIFORM` répartit son prix sans coût saisi par ligne.
- Le parcours de 500 cartes demande la souris seulement pour les choix qui n'ont pas de raccourci.

### Phase 3 : consultation du stock

- L'admin recherche et filtre par langue, set, rareté et emplacement.
- Le registre montre l'auteur et les deux deltas.

Le passage d'acceptation Phase 2 a ajouté avant cette phase une vue de contrôle limitée à 250 lignes de stock et 100 mouvements. Elle sert à prouver la comptabilisation d'un lot réel. Elle ne remplace pas les recherches, filtres, pages et historiques prévus ici.

### Phase 4 : recettes

- Une recette manuelle pointe seulement vers `Card.id`.
- Le calcul rend quantité réalisable, coût, manques et limites.
- Les emplacements s'agrègent, les langues restent séparées.

### Phase 5 : decks officiels

- Un deck officiel peut être analysé sans copier ses cartes.
- Une recette issue du deck garde `sourceDeckId`.
- Le sideboard suit le choix affiché.
- Aucun élément Bulking n'apparaît sur une page publique.

### Phases suivantes

- L'analyse de production ajoute les manques par rareté et les quantités déblocables sans persister de statut.
- Un import Cardmarket garde son aperçu, sépare correspondance et écart de quantité, et ne peut être appliqué deux fois.
- Un achat structuré peut regrouper plusieurs entrées sans effacer leur source historique.
- Une session de scan terminée ne modifie jamais le stock et ne dépend pas des identifiants instables des lignes de brouillon.
- Toute correction issue d'un import crée un mouvement signé par l'admin.

## 12. Portes d'arrêt

Arrêter l'exécution et demander à Allan si l'un de ces cas arrive :

1. Une variante réelle ne rentre ni dans `condition` ni dans `finish` sans perdre une donnée utile.
2. La base ciblée par `prisma db push` ne peut pas être prouvée locale ou explicitement choisie.
3. Prisma annonce une perte de données.
4. La comptabilisation d'un lot exige déjà une commande ou un produit assemblé absent du périmètre.

Dans les autres cas, suivre la décision la plus simple décrite ici et poursuivre.

---

## 13. Relecture du plan

### Couverture de la demande

- Inventaire : tâches 1, 3, 5, 6 et 7.
- Registre des mouvements : tâches 1, 5, 6, 7 et 9.
- Entrées en lot : tâches 8 et 9.
- Recettes : tâches 3 et 10.
- Decklists : tâche 11.
- Préparation méta : tâche 12.
- Saisie rapide : tâche 8.
- Séparation commerciale : schéma, routes et risques des sections 3 et 9.
- Déploiement : tâche 14.
- Marketplace exclue : section 10.
- Achats et traçabilité par lot : sections 10.1 et 10.4.
- Sessions de scan : sections 10.2 et 10.5.
- Import et rapprochement Cardmarket : section 10.6.
- Production et complétion des decks : section 10.7.

### Cohérence des types

- Toutes les relations de carte utilisent `Card.id`.
- Toutes les données commerciales référencent `BulkLanguage.id` ; les codes restent configurables.
- Tous les coûts JSON utilisent des chaînes ; Prisma seul crée des `Decimal`.
- Toutes les analyses utilisent `BulkRecipeRequirement`, `BulkStockBalance` et `BulkRecipeAnalysis`.
- Toutes les écritures de stock passent par `appliquerMouvement`.

### Ordre obligatoire

Les tâches 1 à 5 fondent les suivantes. Les tâches 6 à 9 livrent l'inventaire et les entrées. La tâche 10 peut commencer après la tâche 6. La tâche 11 dépend de la tâche 10. La tâche 12 reste indépendante de l'interface, mais vient après la validation du cœur commercial. Les tâches 13 et 14 terminent le chantier initial. Les chantiers suivants respectent ensuite l'ordre de la section 10.8.
