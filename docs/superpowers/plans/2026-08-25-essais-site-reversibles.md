# Essais réversibles du site - plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Essayer puis évaluer les améliorations du site sans mêler leurs effets.

**Architecture:** Chaque lot réutilise les routes et composants actuels. Un commit local isole chaque résultat ; les contrôles portent d'abord sur le comportement visible, puis sur les portes du dépôt.

**Tech Stack:** Next.js 16.3, React 19, TypeScript 5, Tailwind CSS 4, Vitest 4.1, Playwright déjà employé par `scripts/audit-responsive.mjs`.

**Spec:** `docs/superpowers/specs/2026-08-25-essais-site-reversibles-design.md`

## Contraintes globales

- Lire le guide Next.js local concerné avant tout code.
- Réutiliser les composants, routes et scripts existants.
- Ne créer ni decklist, ni donnée, ni prix.
- Ne toucher à aucune base ni à aucun déploiement.
- Un lot égale un commit local et une commande d'annulation.

---

### Tâche 1 : Contrôle visuel responsive

**Fichiers :**
- Modifier si nécessaire : `scripts/audit-responsive.mjs`
- Test : `scripts/audit-responsive-lib.test.ts`

- [ ] Ajouter 320 x 568 aux écrans contrôlés si cette taille manque.
- [ ] Écrire d'abord le test qui attend cet écran dans la configuration exportée.
- [ ] Lancer le test et confirmer qu'il échoue pour l'absence de 320 px.
- [ ] Ajouter la taille sans changer les règles de détection.
- [ ] Lancer l'audit sur `/`, `/cartes`, `/decks`, un deck réel et `/deckbuilder`.
- [ ] Contrôler le menu ouvert et le zoom à 200 %.
- [ ] Corriger uniquement les régressions causées par le dernier lot responsive.
- [ ] Lancer les tests ciblés, `npm test` et `npm run verify`.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 2 : Essai d'accueil

**Fichiers :**
- Modifier : `src/app/page.tsx`
- Réutiliser : les composants de boutons et de liens déjà importés par l'accueil
- Test : contrôle structurel existant le plus proche dans `src/app/*.test.ts`

- [ ] Lire entièrement l'accueil et relever ses actions actuelles.
- [ ] Écrire un contrôle qui exige les liens `/decks`, `/cartes` et `/guides/debuter` dans le premier bloc utile.
- [ ] Vérifier que le contrôle échoue avant le changement.
- [ ] Réordonner les liens existants sans nouveau composant ni nouvelle requête.
- [ ] Vérifier le français, l'anglais, 320 px et le clavier.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 3 : Liens entre les parcours

**Fichiers :**
- Modifier après lecture : `src/app/cartes/[id]/page.tsx`
- Modifier après lecture : `src/components/decklist-interactive.tsx`
- Réutiliser : `src/lib/cardnexus.ts`, `/deckbuilder`, `/collection` et les paramètres déjà compris par `/decks`

- [ ] Relever les liens et paramètres que chaque route accepte réellement.
- [ ] Écrire un test structurel pour chaque destination retenue.
- [ ] Vérifier les échecs avant modification.
- [ ] Ajouter au plus une action contextuelle par page.
- [ ] Ne pas écrire de lien CardNexus à la main.
- [ ] Vérifier les pages connectées et anonymes.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 4 : Premier usage du deckbuilder

**Fichiers :**
- Modifier après lecture : `src/app/deckbuilder/deckbuilder.tsx`
- Modifier si le bloc vide y vit : `src/app/deckbuilder/components/deck-panel.tsx`

- [ ] Tracer les états sans Légende, deck vide et deck invalide.
- [ ] Écrire un test structurel qui exige une prochaine action lisible dans chaque état vide retenu.
- [ ] Vérifier l'échec avant modification.
- [ ] Réécrire les seuls états vides ; ne pas ajouter de tutoriel, modale ou stockage.
- [ ] Vérifier clavier, tactile, français et anglais.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 5 : Fraîcheur des données

**Fichiers :**
- Lire : `data/prices/card-prices.json`
- Lire : `src/app/tier-list/page.tsx`
- Lire : `src/app/tournois/[slug]/page.tsx`
- Modifier seulement les pages dont la date existe déjà dans leurs données

- [ ] Lister les dates réellement disponibles et leur source.
- [ ] Écarter toute date calculée ou devinée.
- [ ] Écrire un test de format pour chaque date affichée.
- [ ] Ajouter une mention courte au plus près de la donnée.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 6 : Contrôle de la version anglaise

**Fichiers :**
- Modifier : le script d'audit anglais existant trouvé par `rg "i18n|anglais|/en" scripts src -g "*.test.ts"`
- Test : à côté du script retenu

- [ ] Inventorier les contrôles anglais déjà présents.
- [ ] Écrire un cas qui échoue sur une phrase française rendue sous `/en`.
- [ ] Ajouter le contrôle minimal sans dupliquer les dictionnaires.
- [ ] Corriger les chaînes confirmées par le contrôle.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 7 : Images mesurées

**Fichiers :**
- Lire : les composants signalés par ESLint et les scripts d'audit d'images existants
- Modifier : seulement les images au-dessus du seuil mesuré retenu

- [ ] Rechercher l'outil d'audit d'images déjà présent.
- [ ] Mesurer poids, dimensions et présence dans le premier écran.
- [ ] Classer les trois images les plus coûteuses.
- [ ] Corriger la première avec le composant ou format déjà utilisé par le site.
- [ ] Comparer le rendu et le poids avant/après.
- [ ] Lancer les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.

### Tâche 8 : Dettes techniques séparées

**Fichiers :**
- Lire : `eslint.config.mjs`, `.firecrawl/`, `src/middleware.ts` et les limites de débit trouvées par `rg`
- Créer : un rapport court dans `docs/` si le constat n'existe pas déjà

- [ ] Confirmer pourquoi `.firecrawl` entre dans le lint et choisir exclusion ou correction.
- [ ] Cartographier les routes d'écriture sans limite de débit, sans les modifier.
- [ ] Cartographier les besoins réels en `unsafe-inline` et `unsafe-eval`, sans les retirer.
- [ ] Produire trois décisions séparées avec risque et contrôle requis.
- [ ] Ne committer que le correctif lint sûr ; garder sécurité et réseau en plans distincts.
- [ ] Lancer `npm run lint`, les tests et la porte du dépôt.
- [ ] Créer un commit local et noter `git revert <hash>`.
