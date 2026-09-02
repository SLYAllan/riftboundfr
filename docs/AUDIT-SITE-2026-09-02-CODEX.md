# Audit du site par sous-agents Codex

**Date :** 2 septembre 2026  
**Portée :** architecture, parcours fonctionnels, sécurité, API, interface,
accessibilité, SEO, performances, internationalisation, tests, scripts et
fiabilité des données.  
**Méthode :** deux vagues de sous-agents Codex, en lecture seule. Aucun fichier
du site ni aucune base n'a été modifié pendant l'audit.

## Résumé

L'audit relève 3 défauts critiques, 10 élevés, 17 moyens et 6 faibles ou à
confirmer.

Les trois premiers chantiers à traiter sont :

1. rendre le validateur de decklists rouge sur toute donnée invérifiable ;
2. empêcher le tableau de bord de l'overlay d'écraser un score saisi depuis le
   compagnon ;
3. arrêter le conteneur quand la base est vide ou incomplète.

## Critiques

### 1. Le validateur anti-fabrication passe sur des decklists invérifiables

`scripts/validate-decklists.py:77-85` ignore les erreurs JSON et JSONL des
sources. Les lignes 102-104 ignorent les erreurs de lecture des fichiers
Markdown. Les lignes 124-126 sautent les fichiers de deck illisibles. Enfin, les
listes sans vérité terrain sont comptées comme `unverifiable`, mais la ligne 164
sort avec le code 0 tant qu'il n'existe ni différence ni réserve incomplète.

**Impact :** une source brute cassée, absente ou un deck illisible peut laisser
`npm run validate:decks` vert. Cela contredit la règle absolue d'intégrité des
decklists.

**Correction minimale :** rendre toute erreur de lecture visible et bloquante.
Faire sortir le validateur avec le code 1 si `unverifiable > 0`, sauf exception
précise et suivie dans le dépôt.

### 2. Le tableau de bord peut écraser un score saisi dans le compagnon

Le tableau de bord calcule puis met l'état entier en file dans
`src/app/profil/overlay/overlay-dashboard.tsx:225-233`. Il envoie cet état entier
aux lignes 172-179. La route `src/app/api/overlay/state/route.ts:28-31` le passe
à `saveState`. Le compagnon, lui, envoie des patchs par
`src/app/api/overlay/[token]/compagnon/route.ts:37`.

**Impact :** si le compagnon change le score pendant que le tableau de bord
modifie un réglage depuis une ancienne copie de l'état, le score ou la manche
peut revenir en arrière.

**Correction minimale :** mettre les patchs du tableau de bord dans la file
commune et ajouter un test d'écritures concurrentes.

### 3. Le serveur démarre même si la base est vide ou incomplète

`migrate.mjs:6-24` détecte une base vide ou des tables essentielles absentes et
sort avec le code 1. `entrypoint.sh:9` transforme cet échec en simple message,
puis la ligne 11 lance `server.js`.

**Impact :** le déploiement peut sembler prêt alors que de nombreuses pages et
routes répondent 500.

**Correction minimale :** retirer le `|| echo` afin de respecter le contrat
actuel. Si le projet choisit un démarrage dégradé, garder au moins la sonde de
disponibilité rouge tant que le schéma manque.

## Élevés

### 4. Le polling de l'overlay peut restaurer un ancien état

`src/hooks/use-overlay-poll.ts:11-22` lance un GET toutes les 1,5 seconde sans
attendre ni annuler la requête précédente. Une ancienne réponse lente peut arriver
après la nouvelle et restaurer un score, une manche ou une carte périmée.

**Correction minimale :** garder un seul appel en vol ou annuler le précédent
avec `AbortController`.

### 5. La rotation du jeton overlay peut perdre une écriture concurrente

`src/lib/overlay-server.ts:51-58` lit puis réécrit l'état entier sans transaction
ni verrou commun avec les sauvegardes.

**Correction minimale :** effectuer la rotation et le recalage des médias sous
le verrou déjà employé par les sauvegardes.

### 6. L'API accepte la publication d'un deck communautaire invalide

Le navigateur envoie des compteurs déclaratifs depuis
`src/app/deckbuilder/deckbuilder.tsx:578-595`. Le POST de
`src/app/api/community-decks/route.ts:32-54` ne décode pas `deckCode` et peut
ignorer les contrôles si les compteurs manquent ou ne sont pas numériques.

**Impact :** l'API peut publier un deck que `/d`, l'image ou le panier ne savent
pas relire.

**Correction minimale :** décoder le code, résoudre les cartes et recalculer
toutes les règles côté serveur.

### 7. La modification d'un deck accepte toute chaîne non vide

Le PATCH de `src/app/api/community-decks/[code]/route.ts:71-105` accepte puis
versionne toute chaîne non vide. Les consommateurs de `/d`, de l'image et du
panier peuvent ensuite échouer.

**Correction minimale :** partager le même validateur serveur avec la création.

### 8. Trois règles différentes décident si un deck est valide

La règle complète vit dans
`src/app/deckbuilder/lib/deck-rules.ts:31-117`. La publication, la route serveur
et la modale d'export emploient des contrôles plus faibles ou différents.

**Correction minimale :** appeler une seule fonction `validateDeck`, puis refaire
la même validation côté serveur.

### 9. Les decklists d'articles peuvent masquer les cartes inconnues

`src/app/articles/[slug]/page.tsx:69-122` refait la résolution à la main et
ignore les cartes absentes avec un test silencieux.

**Impact :** un article peut afficher une liste amputée sans alerte.

**Correction minimale :** employer `resolveDeckCards` et rendre `missing`
visible.

### 10. Un relevé CardNexus amputé peut remplacer le bon fichier

`scripts/sync-prices.mts:95-119` collecte les cartes introuvables ou sans prix,
mais ne fixe aucun seuil. Les lignes 122-136 écrivent toujours le nouveau
fichier.

**Correction minimale :** reprendre le garde-fou de baisse de la relève chinoise,
avant l'écriture, avec un `--force` explicite.

### 11. Toutes les pages semblent forcées en rendu dynamique

Le layout appelle `langueCourante()` et `cheminCourant()` dans
`src/app/layout.tsx:139-140`. Ces fonctions lisent `headers()` dans
`src/lib/i18n-server.ts:13-20`. D'après la documentation Next 16 présente dans
`node_modules`, `headers()` force le rendu dynamique.

**Impact :** les `revalidate` des pages ne donnent pas le cache HTML attendu et
les requêtes Prisma repartent à chaque visite.

**Correction minimale :** sortir la lecture de langue du layout dynamique ou
isoler les parties qui doivent lire les en-têtes.

### 12. Les pages détail anglaises annoncent un canonical français

Six `generateMetadata` dynamiques ne passent pas par `metaTraduite`, notamment :

- `src/app/decks/[slug]/page.tsx:26` ;
- `src/app/cartes/[id]/page.tsx:24` ;
- `src/app/tournois/[slug]/page.tsx:45` ;
- `src/app/articles/[slug]/page.tsx:25` ;
- `src/app/legendes/[slug]/page.tsx:260` ;
- `src/app/d/[code]/page.tsx:31`.

Le sitemap publie pourtant les versions `/en` avec leurs alternates.

**Correction minimale :** appliquer le préfixe de langue aux canonicals de
toutes les pages détail.

### 13. Le JSON-LD anglais décrit l'URL et la langue françaises

Les schémas propres aux decks, cartes et articles figent l'URL française et
`inLanguage: "fr"`, par exemple dans
`src/app/articles/[slug]/page.tsx:381-398`. Le fil d'Ariane fait de même dans
`src/components/breadcrumbs.tsx:32`.

**Correction minimale :** construire l'URL et `inLanguage` depuis la langue
active.

## Moyens

### 14. XSS stockée possible dans le JSON-LD des articles

`src/app/articles/[slug]/page.tsx:401` remplace `<` par `"\u003c"`, qui vaut
encore `<` à l'exécution, avant l'insertion par `dangerouslySetInnerHTML`.
L'exploitation exige un article malveillant en base, donc un compte admin ou une
chaîne d'import compromis.

**Correction minimale :** employer `"\\u003c"`, comme les autres JSON-LD du
dépôt.

### 15. La clé compagnon permet de modifier tout l'overlay

`src/app/api/overlay/[token]/compagnon/route.ts:35-37` emploie le validateur
général. `src/lib/overlay-validation.ts:79-179` autorise aussi l'événement, les
cartes, les caméras, le logo et les décors.

**Correction minimale :** créer une liste blanche propre au compagnon, limitée
aux champs que son interface envoie.

### 16. Des repères `<main>` sont imbriqués

Le layout racine rend déjà `<main id="contenu">` dans
`src/app/layout.tsx:186`. `/collection` et le compagnon ajoutent leurs propres
`<main>`, notamment dans `src/app/collection/page.tsx:37` et
`src/app/compagnon/[token]/[cle]/compagnon.tsx:148`.

**Correction minimale :** remplacer les `<main>` internes par des `<section>` ou
des `<div>`.

### 17. Plusieurs cibles tactiles restent sous 44 x 44 px

Les votes et réponses de `src/components/comments.tsx:261-320`, les actions de
`src/components/decklist-interactive.tsx:228-269` et plusieurs boutons du
deckbuilder restent trop petits.

**Correction minimale :** poser `min-h-11 min-w-11` sur les boutons icône et
`min-h-11` sur les boutons texte.

### 18. Des boutons du deckbuilder n'ont pas de nom accessible

Les boutons qui retirent un filtre ou effacent la recherche dans
`src/app/deckbuilder/components/search-bar.tsx:85-117` sont annoncés comme de
simples boutons.

**Correction minimale :** ajouter des `aria-label` précis.

### 19. Le bouton principal d'une carte n'annonce pas son action

Le bouton de `src/app/deckbuilder/components/card-browser.tsx:91-117` tire son
nom de l'image, mais ne dit pas qu'il ajoute la carte au deck.

**Correction minimale :** ajouter un nom accessible qui décrit l'action.

### 20. L'état « quantité maximale atteinte » n'est pas annoncé

La carte est assombrie dans
`src/app/deckbuilder/components/card-browser.tsx:101-109`, mais le bouton
principal reste actif.

**Correction minimale :** poser `disabled={atMax}` et annoncer l'état.

### 21. Le rouge d'erreur ne passe pas toujours le contraste AA

`--color-error: #ef4444` descend à 3,68:1 sur certaines surfaces définies dans
`src/app/globals.css:76-85`. `--color-error-light` tient 4,9:1 sur la surface
surélevée.

**Correction minimale :** employer `text-error-light` pour les petits textes.

### 22. Les limites de plusieurs champs sont presque invisibles

`--color-hairline` et `--color-hairline-strong` vivent dans
`src/app/globals.css:72-74`. Plusieurs champs reposent sur la variante la plus
faible sans changement net de fond.

**Correction minimale :** employer une bordure d'au moins 3:1 sur les champs
interactifs, sans relever toutes les séparations décoratives.

### 23. La pagination des cartes canonise toutes les pages vers `/cartes`

`src/app/cartes/page.tsx:47-106` rend 24 cartes différentes par page, mais la
ligne 26 garde `/cartes` comme canonical pour toutes les pages.

**Correction minimale :** donner un canonical propre à chaque page ou poser une
stratégie explicite d'indexation de la première seulement.

### 24. Les métadonnées doublent certaines requêtes Prisma

Les decks et cartes sont chargés dans `generateMetadata`, puis une seconde fois
dans la page, par exemple dans `src/app/decks/[slug]/page.tsx:28` et 49.

**Correction minimale :** mémoriser le chargeur commun avec le mécanisme natif
de React ou Next.

### 25. Le PATCH des decks communautaires n'a pas de limite de débit

Chaque appel de `src/app/api/community-decks/[code]/route.ts:31-112` crée une
version, alors que seul le POST est limité.

**Correction minimale :** reprendre le limiteur du POST.

### 26. La suppression d'un média overlay n'est pas atomique

`src/app/profil/overlay/overlay-dashboard.tsx:307-312` change l'état puis lance
un DELETE séparé dont l'erreur est ignorée.

**Correction minimale :** regrouper les deux actions dans une opération serveur.

### 27. L'erreur de chargement des champions est partagée entre les joueurs

`src/hooks/use-listes-overlay.ts:32-54` partage une clé d'erreur `champions`.
La réussite d'un joueur peut effacer l'échec de l'autre.

**Correction minimale :** garder un état d'erreur par joueur.

### 28. Les commentaires peuvent relier un parent à une autre cible

`src/app/api/comments/route.ts:39-53` n'exige pas une cible unique et ne vérifie
pas que le parent appartient au même article ou deck.

**Correction minimale :** exiger exactement une cible, vérifier son existence et
contrôler la cible du parent.

### 29. La fiche carte coupe les decks avant de les classer

`src/app/cartes/[id]/page.tsx:70-81` prend 30 decks sans `orderBy`, puis les
lignes 89-99 cherchent les cinq meilleurs.

**Impact :** un deck vedette ou bien classé peut être exclu avant le tri.

**Correction minimale :** trier avant la coupe.

### 30. Le validateur de decklists ne fait pas partie de la CI

`.github/workflows/ci.yml:21-26` lance lint, TypeScript, Vitest et le build, mais
jamais `npm run validate:decks` ni le test Python.

**Correction minimale :** ajouter un job séparé avec une limite longue.

### 31. Les replis DB ne laissent aucune trace

`src/lib/prisma.ts:11-16` rend le fallback sans journal ni compteur.

**Impact :** une panne DB ressemble à une page vide ou à une absence de données.

**Correction minimale :** journaliser un contexte utile sans exposer la trace au
visiteur.

### 32. L'image n'a pas de sonde applicative

`Dockerfile:19-40` ne définit aucun `HEALTHCHECK`. Seul PostgreSQL local a une
sonde dans `docker-compose.yml:17-22`.

**Correction minimale :** ajouter une sonde qui vérifie au moins la connexion et
les tables, puis la brancher dans Coolify ou dans l'image.

### 33. Les prix peuvent rester périmés sans alerte

Au jour de l'audit, `data/prices/card-prices.json:3` datait du 21 août 2026,
soit 12 jours. `src/lib/cardnexus.ts:116-123` charge le fichier sans limite
d'âge.

**Correction minimale :** surveiller la tâche planifiée ou signaler un relevé
trop ancien.

### 34. Les limites de débit dépendent de la configuration Traefik

`src/lib/rate-limit.ts:16-20` croit directement `x-real-ip`, puis le premier
élément de `x-forwarded-for`.

**Risque à confirmer :** si Traefik ne remplace pas ces en-têtes, un attaquant
peut contourner les limites et faire grossir les tables en mémoire.

**Correction minimale :** confirmer que le proxy remplace les en-têtes et
n'accepter que celui qu'il pose.

### 35. Le proxy d'images n'impose ni délai ni taille maximale

`src/app/api/image-proxy/route.ts:24-41` charge toute la réponse en mémoire et
accepte tout type `image/*`. L'allowlist stricte et le refus des redirections
bloquent bien le SSRF classique.

**Correction minimale :** poser un délai, un plafond lu pendant le flux et
n'autoriser que les formats raster utiles.

## Faibles

1. `src/lib/overlay-server.ts:5-10` fait `find` puis `create` pour l'overlay
   initial. Deux premières requêtes peuvent provoquer une erreur d'unicité.
   Employer `upsert`.
2. `VEN` manque dans l'ordre des sets des classeurs privé et partagé,
   notamment dans `src/app/collection/[binderId]/page.tsx:18`.
3. `src/app/offline/page.tsx` hérite de `index, follow`. Ajouter `noindex`.
4. Certaines balises `<img>` n'ont pas de dimensions intrinsèques, par exemple
   dans `src/components/article-block-renderer.tsx:90`. Le décalage visuel reste
   à mesurer.
5. Le test Python du validateur n'est pas lancé par `npm test`. La commande qui
   passe depuis la racine est
   `python -m unittest scripts.validate_decklists_rules_test`.
6. Le défaut de cohérence des commentaires demande un compte connecté, ce qui
   limite son exploitation sans le rendre souhaitable.

## Points vérifiés sans faille établie

- Contrôle d'origine sur les écritures API et cookies `SameSite=Lax`.
- Sessions HMAC avec secret obligatoire, durée contrôlée et cookies sûrs.
- État OAuth Discord et rejet des redirections externes.
- Contrôles de propriété sur les collections, classeurs et decks
  communautaires.
- Uploads overlay bornés, signature réelle vérifiée et SVG refusé.
- Hôte HTTPS exact et redirections refusées sur le proxy d'images.
- Comparaison de la clé compagnon avec `timingSafeEqual`.
- `resolveDeckCards` centralise les principaux parcours de decks et remonte les
  cartes absentes.
- Files d'écriture et contrôles de propriété corrects sur la collection.
- Sitemap, `robots.txt`, `noindex` de `/zh`, des overlays et des compagnons.
- Lien d'évitement, focus visible, réduction des animations, menu mobile et
  modales partagées.
- Les routines `maj:stats`, `maj:overlay` et `maj:cartes-zh` arrêtent leur chaîne
  sur erreur.
- Les polices latines passent par `next/font` et Analytics ne charge qu'après
  consentement et interaction.

## Contrôles exécutés

- 32 tests Vitest ciblés : verts.
- 4 tests Python du validateur : verts avec la forme module.
- Le site public a répondu en lecture sur l'accueil, `/decks`, `/cartes` et
  `/deckbuilder` pendant les contrôles des sous-agents.

## Limites

L'audit n'a pas lancé :

- le build long ;
- `npm run validate:decks` en entier ;
- une base locale ou la base de production ;
- une session Discord ;
- OBS ;
- un test de charge ;
- Search Console, CrUX ou PageSpeed ;
- la configuration active de Traefik et Coolify.

Les constats sur les en-têtes transmis par Traefik, la sonde Coolify, les Core
Web Vitals et l'état réel d'indexation restent donc à confirmer dans leur
environnement.

## Ordre de reprise conseillé

1. Validateur de decklists et démarrage sur base incomplète.
2. Concurrence de l'overlay et portée de la clé compagnon.
3. Validation serveur des decks communautaires.
4. XSS du JSON-LD.
5. Canonicals et JSON-LD anglais.
6. Accessibilité du deckbuilder et des commentaires.
7. Garde-fou des prix et branchement du validateur dans la CI.
8. Cache des pages, requêtes Prisma et sonde de disponibilité.

