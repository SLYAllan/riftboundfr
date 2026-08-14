# Audit fonctionnel et UI/UX du site - 14 août 2026

## Résumé exécutif

Audit repris avec le modèle actif **gpt-5.6-sol** et **Playwright MCP** contre
`http://localhost:3000`, avec PostgreSQL local sur `127.0.0.1:5433`.

Le rapport précédent contenait des états contradictoires, notamment sur le
chargement de `/decks`. Ce document ne conserve que les résultats observés dans
la reprise Playwright et relus dans le code actuel.

Résultat :

- 26 routes publiques ouvertes en desktop ;
- 24 routes publiques ouvertes à 320 px et 768 px ;
- 11 routes connectées ou administratives ouvertes en desktop et mobile ;
- 5 routes dynamiques réelles et une 404 testées à 320, 768 et 1440 px ;
- 5 routes anglaises testées en HTTP 200 avec `lang="en"` ;
- 6 endpoints de lecture testés en HTTP 200 JSON et 2 absences en HTTP 404 JSON ;
- 7 captures de contrôle conservées dans `docs/audit-2026-08-14/` ;
- aucune erreur JavaScript applicative sur les parcours retenus ;
- aucun débordement horizontal confirmé après correction ;
- 5 défauts sûrs corrigés et revalidés ;
- aucun défaut d'accessibilité connu ne reste ouvert dans l'éditeur d'article.

Aucun commit, push, déploiement, migration, seed global ou écriture de production
n'a été effectué.

## Méthode

Playwright a servi pour les statuts HTTP, viewports contrôlés, snapshots
d'accessibilité, clavier, interactions, console, inspection DOM et captures.

La branche connectée a été ouverte par `/api/auth/dev-login`, prévu uniquement en
développement. Le compte local `dev-local-test` a été promu au rôle `admin` dans
la base locale, sans utiliser ni révéler de mot de passe.

Les erreurs de télémétrie Google Tag Manager bloquées en local ont été séparées
des erreurs applicatives. Le 404 attendu produit naturellement une erreur réseau
404 dans la console ; ce n'est pas un défaut JavaScript.

## Périmètre exécuté

### Routes publiques statiques

`/`, `/a-propos`, `/offline`, `/articles`, `/cartes`, `/collection`,
`/community-decks`, `/deckbuilder`, `/decks`, `/decks/compare`, `/guides`,
`/guides/ban-list`, `/guides/debuter`, `/guides/deckbuilding`,
`/guides/domaines`, `/guides/glossaire`, `/guides/jouer-en-ligne`,
`/guides/meta`, `/legendes`, `/meta`, `/outils/compteur`, `/outils/regles`,
`/tier-list` et `/tournois`.

### Routes dynamiques réelles

- `/articles/proving-grounds-quel-deck-monter` ;
- `/cartes/jdg-111-298` ;
- `/decks/best-of-utrecht-volibear-relentless-storm` ;
- `/legendes/diana-scorn-of-the-moon` ;
- `/tournois/riftbound-showdown-ottawa-2026-08-08` ;
- une route inexistante, correctement rendue en HTTP 404.

Ces six cas ont été exécutés à 320, 768 et 1440 px. Ils ont un H1 unique, un
`main`, un pied de page, aucun débordement et aucune image sans attribut `alt`.

### Routes connectées et administratives

`/collection`, `/profil`, `/profil/overlay`, `/admin`, `/admin/decks`,
`/admin/decks/import`, `/admin/events`, `/admin/articles`,
`/admin/articles/new`, `/admin/tier-list`, `/admin/login`, puis une vraie route
`/admin/articles/[id]` découverte depuis la liste.

### Anglais

`/en`, `/en/decks`, `/en/tier-list`, `/en/guides` et
`/en/cartes/jdg-111-298` répondent 200, déclarent `lang="en"` et ne débordent pas.

### API

HTTP 200 JSON :

- `/api/v1/cards` ;
- `/api/v1/cards/jdg-111-298` ;
- `/api/v1/decks` ;
- `/api/v1/decks/best-of-utrecht-volibear-relentless-storm` ;
- `/api/v1/tier-list` ;
- `/api/decks?offset=0`.

HTTP 404 JSON attendu :

- `/api/v1/cards/introuvable` ;
- `/api/v1/decks/introuvable`.

## Parcours fonctionnels vérifiés

### Decks

- 51 decks uniques au rendu initial ;
- après arrivée en bas de page : 102 decks, 102 URL uniques ;
- bouton `Charger plus de decks` conservé comme secours accessible ;
- chargement manuel jusqu'à la fin : 448 decks et 448 URL uniques ;
- bouton absent à la fin et message `Tous les decks sont affichés.` ;
- aucune boucle et aucun doublon ;
- recherche `Volibear` vers `?q=Volibear`, 20 résultats ;
- états de chargement, erreur et fin annoncés par la zone `aria-live`.

Le comportement final est donc un chargement progressif automatique par lots de
51, avec arrêt définitif, et non une boucle répétant les decks.

### Cartes et règles

- recherche Cartes `Ahri` vers `?q=Ahri`, 10 résultats ;
- recherche Règles `mulligan` vers `?q=mulligan`, 2 résultats ;
- filtres Cartes exposés avec des noms accessibles.

### Navigation et tier lists

- menu Outils ouvert au clavier avec Entrée et fermé avec Échap ;
- `aria-expanded` passe correctement de `true` à `false` ;
- menu mobile ouvert et refermé sans débordement ;
- Origins, Spiritforged, Unleashed, Vendetta et Globale sont présents et
  activables au clavier.

### Collection et administration

- collection connectée ouverte, contrôles présents, aucun débordement ;
- profil et configuration de l'overlay ouverts ;
- recherche admin Decks `Volibear` conservée dans
  `?tab=globale&q=Volibear` ;
- formulaire de nouvel article bloqué par validation native lorsqu'un champ
  obligatoire manque ;
- aucun formulaire destructif n'a été soumis.

## Corrections appliquées et revalidées

### 1. Débordement du filtre de tournoi dans `/admin/decks`

Fichier : `src/app/admin/decks/deck-filters.tsx`.

À 320 px, le sélecteur `Tous les tournois` mesurait 344 px et provoquait 40 px de
débordement horizontal. Les deux sélecteurs utilisent maintenant
`min-w-0 max-w-full`.

Preuve après correction : débordement de page **0 px** à 320 px.

### 2. Sémantique incorrecte du menu Outils

Fichier : `src/components/navbar.tsx`.

Le menu de navigation déclarait `aria-haspopup="menu"` et `role="menu"` sans
éléments `menuitem` ni navigation de menu d'application. Il utilise désormais le
motif de divulgation adapté à une navigation simple.

Preuve : ouverture Entrée, fermeture Échap, six liens visibles, aucun faux
`role="menu"` et `aria-expanded` correct.

### 3. Rétablissement du chargement automatique demandé

Fichier : `src/app/decks/decks-progressifs.tsx`.

Une modification intermédiaire avait retiré `IntersectionObserver` malgré la
décision finale de conserver le chargement automatique progressif. Le sentinel a
été rétabli avec une marge de 300 px ; le bouton manuel reste présent.

Preuve après rétablissement : **51 → 102 au scroll**, 102 URL uniques, puis 448
URL uniques à la fin en utilisant le bouton de secours.

### 4. Focus et actions tactiles du tiroir mobile du deckbuilder

Fichiers : `src/hooks/use-dialog-a11y.ts` et
`src/app/deckbuilder/components/deck-panel.tsx`.

Une modification du deck relançait le piège de focus et renvoyait le clavier sur
`Fermer`. Les actions des vignettes étaient en plus désactivées hors survol, donc
interceptées par l'image sur écran tactile. Le hook conserve maintenant le dernier
callback sans remonter l'effet, et les actions restent visibles et cliquables.

Preuve Playwright mobile : le focus reste sur l'action activée, Échap ferme encore
la modale, un clic sur `Retirer une copie` fait passer le total de 7 à 6, sans
débordement horizontal. Capture :
`docs/audit-2026-08-14/audit-deckbuilder-mobile-sheet.png`.

### 5. Noms accessibles dans l'éditeur d'article

Fichiers : `src/components/admin/block-editor.tsx` et
`src/components/admin/block-editor.a11y.test.ts`.

Les 16 champs et 45 boutons relevés sans nom accessible ont maintenant un
libellé relié par `htmlFor` et `id`, ou un `aria-label` pour les actions par
icône. Un test statique couvre les associations et les noms des boutons.

Preuve après correction : TypeScript, ESLint et les 140 tests passent. Le défaut
reste local tant que ces changements ne sont pas déployés.

## Constat fermé après l'audit

### Éditeur d'article sans noms accessibles

Fichiers : `src/app/admin/articles/[id]/page.tsx` et
`src/components/admin/block-editor.tsx`.

Sur un article réel, Playwright mesure :

- 45 boutons icône sans texte ou nom accessible ;
- 16 champs `input type="text"` dont le label visuel n'est ni englobant ni relié
  avec `for`/`id` ;
- total : **61 contrôles sans nom accessible**.

Exemples dans `block-editor.tsx` : champs autour des lignes 134 à 150 et actions
de bloc autour des lignes 378 à 380.

La passe de correction a relié chaque libellé à son champ et ajouté un
`aria-label` aux actions par icône. Le test
`src/components/admin/block-editor.a11y.test.ts` garde ces associations.

## Contrôles visuels

Captures conservées :

- `docs/audit-2026-08-14/audit-home-desktop.png` ;
- `docs/audit-2026-08-14/audit-home-mobile.png` ;
- `docs/audit-2026-08-14/audit-decks-tablet.png` ;
- `docs/audit-2026-08-14/audit-card-mobile.png` ;
- `docs/audit-2026-08-14/audit-overlay-desktop.png` ;
- `docs/audit-2026-08-14/audit-admin-decks-mobile.png` ;
- `docs/audit-2026-08-14/audit-deckbuilder-mobile-sheet.png`.

Les noms longs ellipsés dans les listes compactes sont intentionnels. Les cartes
sans illustration situées hors du viewport dans une capture pleine page sont un
effet du lazy-loading de la capture, pas des images cassées visibles à l'écran.

## Limites

- Aucun `CommunityDeck` public n'était disponible localement pour exécuter une
  vraie route `/d/[code]`.
- Aucun classeur partagé réel n'était disponible pour
  `/collection/partage/[shareSlug]`.
- OAuth Discord réel non exécuté ; session de développement utilisée.
- Aucun enregistrement admin, like, vote, commentaire ou sauvegarde d'overlay.
- `/offline` a été rendu sans simuler une vraie coupure réseau du service worker.
- Pas de NVDA, VoiceOver, appareil physique, axe-core ou Lighthouse.
- L'absence de `loading.tsx` est une possibilité d'amélioration, pas un bug classé
  sans mesure démontrant une navigation réellement lente.

## Validations finales

Exécutées après le dernier changement :

- `npm run lint` : sortie 0, 0 erreur et 97 avertissements ;
- `npx tsc --noEmit` : sortie 0 ;
- `npm test -- --pool=threads` : 22 fichiers et 140 tests verts ;
- `npm run build` : sortie 0 et 52 pages générées ;
- `git diff --check` : sortie 0.

## Priorités suivantes

1. Automatiser les parcours Playwright critiques en tests versionnés si cette
   recette doit devenir une porte de CI.
2. Refaire les routes de partage dès qu'une donnée locale réelle est disponible.
3. Effectuer séparément une passe lecteur d'écran et Lighthouse.
