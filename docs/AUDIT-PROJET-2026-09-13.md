# Audit du projet du 13 septembre 2026

Le build et les 367 tests passent, mais ils ne suffisent pas à donner le feu vert. Les priorités sont les dépendances Next.js, le contrôle d’origine des API traduites, le cache hors ligne et la fiabilité du validateur de decklists. Plusieurs défauts métier restent aussi hors des tests.

Audit mené sans délégation, sur `main` au commit `60f23337`, avec les changements locaux déjà présents. Aucun correctif applicatif, seed, achat, déploiement ou changement de compte n’a été effectué. Les constats ci-dessous portent sur cet arbre de travail, pas sur une copie supposée identique en production.

## Périmètre et preuves

Lecture des points d’entrée, sessions, middleware, routes d’administration et communautaires, collection, panier, notifications, overlay, modèle Prisma, scripts de données, Docker, CI, cache hors ligne, métadonnées et traductions. Contrôles HTTP sur le build local, lecture des résultats GitHub Actions et des avis de sécurité, sondes publiques limitées en production.

| Contrôle | Résultat |
|---|---|
| `npm run verify` | Sortie 0 : TypeScript et build de production passent |
| `npx vitest run --pool=threads` | Sortie 0 : 66 fichiers, 367 tests |
| `npm run lint` | Sortie 0 : 0 erreur, 98 avertissements |
| `python -m unittest scripts.validate_decklists_rules_test` | 4 tests passent |
| `npm run validate:decks` | Sortie 0 : 24 841 listes vérifiées, aucun écart, aucune réserve Vendetta incomplète ; 1 159 listes historiques sans source brute |
| `python .codex/hooks/garde-fous.py --test` | 16 cas sur 16 passent |
| `npm audit --json` | Sortie 1 : 57 dépendances signalées, dont 1 critique, 37 élevées, 8 modérées, 11 faibles |
| Audit anglais existant sur cinq routes | Sortie 1 : français restant sur l’accueil et la liste des articles |
| `scripts/couverture-tournois.mts` | Sortie 0 ; plusieurs tournois ont une faible couverture de listes |
| Dernière CI consultée, `34648905228` | `verify` réussit ; `donnees` échoue sur 70 listes Changsha |
| Production : `/`, `/en`, `/robots.txt`, `/sitemap.xml`, `/api/health?base=1` | HTTP 200 au passage de l’audit |

Les premiers essais de build et de tests ont rencontré `spawn EPERM` dans l’environnement restreint. Leur relance autorisée a réussi. Ce blocage local ne constitue pas un défaut du dépôt. Le résultat de `npm audit` compte les paquets affectés, y compris les effets transitifs ; il ne signifie pas 57 failles distinctes exploitables sur le site.

## À traiter en priorité

### 1. P1 : Next.js 16.3.0 figure dans deux avis critiques

**Preuve :** version installée `16.3.0`, audit npm du jour, `package-lock.json`. Les avis donnent `16.3.3` comme version corrigée de la branche 16.

- [Avis Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36) : exécution de code à distance sur les serveurs Windows concernés. Cela concerne le serveur local s’il est accessible ; le Docker de production utilise Linux, donc ce scénario ne s’y transpose pas.
- [Avis AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) : traitement AVIF par la chaîne d’optimisation d’images. Les hôtes distants autorisés limitent les entrées, mais ne prouvent pas que ce chemin est inaccessible.

**Action :** mettre à jour Next.js et les dépendances concernées, vérifier le fichier verrouillé, refaire build, tests et exports d’images. Aucun test d’exploitation n’a été lancé. La version réellement déployée n’a pas été déduite de la version locale.

### 2. P1 : les préfixes de langue évitent le contrôle d’origine

**Fichier :** `src/middleware.ts`, contrôle CSRF avant calcul de `cheminNu`.

Le filtre teste `/api/` sur le chemin brut. `/en/api/…` et `/zh/api/…` échappent au test, puis sont réécrits vers la même API.

**Reproduction locale, sans cookie ni mutation de données :** un POST de déconnexion avec `Origin: https://example.invalid` donne :

| Chemin | Réponse |
|---|---:|
| `/api/auth/logout` | 403 |
| `/en/api/auth/logout` | 200 |
| `/zh/api/auth/logout` | 200 |

**Impact :** la protection d’origine n’est pas uniforme. `SameSite=Lax` reste une autre défense ; ce constat ne prouve pas à lui seul un vol de session ni une écriture authentifiée depuis tout site tiers.

**Action :** normaliser le chemin avant le contrôle, ou interdire les API sous préfixe de langue. Ajouter le cas aux tests du middleware. Comparer aussi l’origine complète attendue, pas seulement l’hôte.

### 3. P1 : le service worker conserve les pages de compte après déconnexion

**Fichiers :** `public/sw.js:89`, `public/sw.js:103`, `src/app/api/auth/logout/route.ts`, `src/app/profil/deck-actions.tsx`.

Le service worker met les réponses HTML réussies en cache sans exclure `/profil`, `/collection`, `/admin`, `/compagnon` ou le tableau de bord overlay. Les autres réponses hors API passent aussi par un cache réseau d’abord, ce qui inclut des réponses de navigation React. La déconnexion retire le cookie puis redirige ; elle ne purge pas ces caches. Le nettoyage dans `sw-register.tsx` ne tourne qu’en développement.

**Impact :** des données et du HTML de session peuvent rester lisibles hors ligne dans le même profil de navigateur après déconnexion. Le tableau de bord transmet aussi le jeton overlay et la clé compagnon au client. Ce chemin a été établi dans le code ; l’essai connecté dans un vrai navigateur n’a pas pu être exécuté.

**Action :** réserver le cache persistant aux ressources publiques explicitement choisies et supprimer les anciennes entrées privées lors de la mise à jour du service worker. Un en-tête `no-store` seul ne remplace pas le contrôle dans le code qui appelle `cache.put`.

### 4. P1 : la « source de vérité » Changsha dépend de l’ordre des fichiers

**Fichier :** `scripts/validate-decklists.py:71` et boucle `glob` à la ligne 94.

`consider` conserve la première source d’une URL quand deux listes ont le même nombre de cartes. Les fichiers ne portent aucune règle explicite de priorité. Deux scrapes suivis se contredisent pour la même URL `deck-yu-ji-185350` :

- `changsha-decks-page2-3.json` : 39 cartes, dont `Icevale Archer` ;
- `changsha-fix-page2-3.json` : 39 autres cartes, dont `Soaring Scout`.

Le deck `changsha-ro-65-mercy.json` correspond au premier. Un essai utilisant les fonctions originales `units` et `consider`, extraites du fichier, retient `Icevale Archer` dans l’ordre premier/deuxième, puis `Soaring Scout` dans l’ordre inverse.

**Impact :** un même deck peut passer ou échouer selon l’ordre de lecture. La dernière CI relève 70 écarts Changsha ; le contrôle local terminé pendant cet audit n’en relève aucun. La dépendance à l’ordre est prouvée ; l’ordre exact de tous les fichiers du runner Linux n’a pas été reconstitué.

**Action :** trancher chaque source contradictoire à partir de la preuve réelle et tracer cette décision. Un simple tri des fichiers rendrait le résultat stable sans le rendre vrai. Ne pas choisir le fichier qui rend la CI verte et ne pas refaire le relevé des listes invérifiables pour masquer l’écart.

### 5. P1 : le validateur ne compare pas toute la decklist à sa source

**Fichiers :** `scripts/validate-decklists.py:51`, `:131`, `:140`, `scripts/validate_decklists_rules.py`.

La comparaison porte sur les unités, équipements et sorts du deck principal. Les différences concernant le champion peuvent être acceptées. Les runes, champs de bataille et cartes de réserve ne font pas l’objet de la même comparaison de noms et quantités avec la source. Pour Vendetta, le second contrôle vérifie surtout les effectifs attendus et la présence du champion.

**Impact :** changer une carte de réserve en gardant dix exemplaires, ou remplacer des runes en gardant douze, peut rester invisible à ce garde-fou. Les quatre tests Python valident les règles d’effectif, pas la fidélité entière au scrape.

**Action :** comparer les sections présentes dans chaque source, avec une règle claire pour la place du champion. Marquer une section non vérifiable comme telle. Un succès actuel ne doit pas être présenté comme une preuve de fidélité de toutes les cartes.

### 6. P1 : acheter un deck modifié peut ouvrir l’ancien panier

**Fichier :** `src/app/api/cardnexus/panier/route.ts:142`, `:174`.

Pour un achat entier, la clé de cache est le slug ou le code de partage, sans contenu ni version. Le serveur relit bien le deck, calcule ses cartes, puis peut renvoyer la liste CardNexus déjà connue sous cette clé. Un PATCH du deck communautaire ne vide pas ce cache.

**Scénario :** achat de la version 1, modification de cartes sous le même lien, nouvel achat dans le même processus : retour à la liste de la version 1.

**Action :** inclure le contenu des lignes d’achat dans la clé, y compris finition et langue si elles distinguent les articles. Aucun panier externe n’a été créé pour cet audit.

## Défauts métier et fiabilité

### 7. P2 : supprimer un compte laisse ses points dans les compteurs

**Fichier :** `src/app/api/auth/profile/route.ts:59`, changement local préexistant.

La transaction retire `DeckLike`, `CommunityDeckLike` et `CommentVote`, mais ne décrémente pas `Deck.likes`, `CommunityDeck.likes`, `Comment.upvotes` et `Comment.downvotes`. Les routes de like et de vote entretiennent ces compteurs séparément.

**Impact :** les lignes disparaissent mais les totaux affichés restent gonflés. La suppression de commentaires en cascade peut aussi laisser des `CommentVote` d’autres comptes : cette table n’a pas de clé étrangère vers `Comment`.

**Action :** traiter les compteurs et les votes rattachés aux commentaires supprimés dans la même opération. Prévoir un contrôle de cohérence des données déjà présentes, sans écraser les compteurs historiques seedés à l’aveugle.

### 8. P2 : retirer un like officiel n’est pas atomique

**Fichier :** `src/app/api/decks/[slug]/like/route.ts`, fonction `DELETE`.

Le POST regroupe création et incrément dans une transaction. Le DELETE retire la ligne puis décrémente le deck dans une seconde opération indépendante. Une panne entre les deux laisse un total faux ; une nouvelle tentative ne le répare pas puisque la ligne n’existe plus.

**Action :** regrouper suppression et décrément dans une transaction, comme le POST.

### 9. P2 : la connexion Discord écrase le pseudo choisi sur le site

**Fichiers :** `src/app/api/auth/discord/callback/route.ts:78`, `src/app/api/auth/profile/route.ts`.

Le profil permet de modifier `username`. Chaque callback Discord réécrit ce champ avec `displayName`. Une reconnexion annule donc le choix du membre.

**Action :** conserver le pseudo du site à la reconnexion, ou distinguer explicitement ce champ du nom Discord. Vérifier le parcours modifier puis se reconnecter.

### 10. P2 : le total de notifications non lues sous-compte les événements

**Fichier :** `src/lib/notifications.ts:80`, `:172`.

Chaque source ne rend que dix lignes, puis `nonLues` compte ces résultats. Trente likes ne peuvent ainsi contribuer que dix notifications au compteur. Une réponse sur son propre deck peut aussi figurer à la fois comme réponse et comme commentaire.

**Action :** afficher un compte plafonné assumé, ou faire un vrai décompte séparé ; dédupliquer un même commentaire. Le commentaire de code affirmant compter « tout » ne décrit pas le calcul réel.

### 11. P2 : les abonnements deviennent obligatoires pour la cloche avant garantie du schéma

**Fichiers :** `src/lib/notifications.ts:187`, `src/app/api/notifications/route.ts`, `migrate-schema.mjs`, `HANDOFF.md`.

La cloche appelle toujours `prisma.abonnement.findMany`, même pour un membre qui ne suit rien. La vérification de démarrage n’exige pas `Abonnement`. Le passage de relais indique une création locale et une étape de schéma à faire avant déploiement.

**Impact conditionnel :** déployer ces changements sans la table casse aussi les notifications ordinaires des comptes connectés. L’état actuel de cette table en production n’a pas été interrogé.

**Action :** intégrer l’étape de schéma à la procédure de livraison et la vérifier avant déploiement ; ne pas compter sur le seul contrôle des noms de tables au démarrage.

### 12. P2 : l’envoi de médias lit le corps entier avant la borne réelle

**Fichier :** `src/app/api/overlay/media/route.ts:30`.

Le contrôle de `Content-Length` précède `req.arrayBuffer()`, mais un corps sans longueur annoncée est chargé en entier avant le second contrôle. Cette route authentifiée n’utilise pas le limiteur commun.

**Impact :** consommation mémoire avant refus du fichier. Une éventuelle limite du proxy pourrait réduire l’exposition, mais sa configuration n’a pas été inspectée.

**Action :** borner la lecture pendant le flux, comme le fait déjà `/api/image-proxy`, puis garder le contrôle du type réel.

### 13. P2 : les filtres de collection ne parcourent que 300 candidats

**Fichier :** `src/lib/deck-listing.ts:96`, `:142`, `:153`.

Le filtre des decks possédés et le tri par accessibilité s’arrêtent à 300 candidats. Le total et la pagination portent ensuite sur ce sous-ensemble. La limite apparaît dans un commentaire de code, pas dans le libellé du résultat examiné.

**Impact :** un deck jouable ou peu coûteux hors de ces candidats ne paraît jamais. Il n’est pas nécessaire de posséder plus de 300 decks pour rencontrer ce cas : posséder un seul deck ancien suffit.

**Action :** rendre la limite visible et choisir une recherche paginée qui puisse poursuivre au-delà. Le commentaire actuel décrit mal la condition qui justifierait d’améliorer le calcul.

## Qualité, performances et contenu

### 14. P2 : la CI tolère encore toutes les erreurs de lint

**Fichier :** `.github/workflows/ci.yml:24`.

`continue-on-error: true` reste actif. Son commentaire invoque quinze anciennes erreurs, alors que le lint du jour rend zéro erreur. `AGENTS.md` affirme que le lint fait partie de la porte CI.

**Action :** retirer cette tolérance et corriger la documentation périmée. Les 98 avertissements actuels n’exigent pas de bloquer cette correction.

### 15. P2 : certaines lectures publiques travaillent sur tout le corpus

**Fichiers :** `src/lib/deck-listing.ts:132`, `src/app/tournois/page.tsx:56`, `src/app/api/comments/route.ts`.

Le tri par placement relit et trie tous les candidats pour servir chaque lot. La page tournois charge tous les decks classés avant de les regrouper. Les commentaires chargent tous les fils et toutes leurs réponses, sans pagination.

**Mesure locale, un passage, sans simulation mobile ni test de charge :** `/decks` environ 665 ms ; `/tournois` environ 516 ms et 1,33 million de caractères HTML ; `/deckbuilder` environ 970 000 caractères. Ce ne sont ni des octets transférés après compression ni des mesures de Core Web Vitals.

**Action :** commencer par la pagination des commentaires et la réduction des lectures répétées de classements. Mesurer ensuite la charge réelle avant de changer l’architecture. Le rendu dynamique global est un choix connu du projet, pas un défaut nouvellement découvert.

### 16. P2 : la version anglaise garde du contenu français

**Preuve :** script existant `scripts/audit-version-anglaise.mjs`, sur le build local.

Sur `/en`, il reste notamment « joueurs en Vendetta » et le texte de la liste des bans. Sur `/en/articles`, les cartes Singapour et Barcelone gardent des titres et chapôs français. Le relevé détecte deux segments français sur l’accueil et quatre sur les articles ; ce sont des segments heuristiques, pas un compte exact de traductions manquantes.

**Action :** compléter les dictionnaires depuis les chaînes réelles, puis rejouer le même audit. Le panneau de couverture de collection porte également des libellés français directs, dont « Acheter ce qui me manque » : couvrir les parcours connectés ensuite.

### 17. P2 : le relevé de prix local a plus de trois semaines

**Fichiers :** `data/prices/card-prices.json:3`, `src/lib/cardnexus.ts:119`.

Le relevé date du 21 août, soit 23 jours au jour de l’audit. Le seuil de péremption est de quatorze jours. Le code émet un avertissement serveur et certains panneaux montrent la date ; cela n’actualise pas les montants qui alimentent le tri par accessibilité.

**Action :** relancer la routine autorisée lors d’une mise à jour de contenu et rendre les estimations anciennes reconnaissables aux endroits où elles décident d’un classement. Aucun prix ni achat n’a été modifié pendant l’audit.

## Ce qui tient et doit rester

- Les API d’administration examinées vérifient les droits côté serveur ; la connexion de développement rend 404 en production.
- Les cookies de session sont signés, HTTP-only et sécurisés en production. L’absence de secret n’utilise pas de mot de passe de repli.
- Le proxy d’images borne le flux, refuse les redirections et limite l’hôte et les formats. Réutiliser ce modèle pour les médias overlay.
- La publication communautaire passe par `verifierCodeDeck` et la résolution commune des cartes. Les mutations de version et d’état overlay utilisent des verrous de ligne.
- Un deck communautaire non listé reste lisible par son lien : c’est un choix explicite, pas une fuite découverte par cet audit.
- Le conteneur de production tourne sous un utilisateur non privilégié. La sonde distingue service HTTP et santé de la base ; le mode strict répondait correctement au passage de l’audit.
- Le corpus de statistiques distingue classements et listes publiées. Les faibles couvertures signalées par l’outil ne permettent pas, à elles seules, de conclure que les statistiques sont fausses.
- Le sitemap filtre les variantes et une partie des decks sans valeur éditoriale. Les routes publiques contrôlées répondent avec leurs titres.

## Limites qui restent ouvertes

Le navigateur CUA ne propose aucune surface dans cette session, et Playwright n’est pas une dépendance locale disponible. Le script responsive existant n’a donc pas été exécuté. Aucune validation actuelle des contrastes, du clavier, des débordements mobiles ou du rendu des menus n’est revendiquée. Les anciens rapports visuels ne constituent pas une validation de cet état du code.

Le port OBS 4455 n’était pas joignable. L’overlay a été examiné côté code, sans capture OBS ni modification de l’état du streamer. Le parcours OAuth réel, les écritures entre deux sessions, les exports d’image et l’achat externe n’ont pas été joués de bout en bout.

La sonde du port public de base mentionné dans `HANDOFF.md` n’a pas établi de connexion depuis cette session. Cela ne prouve ni sa fermeture générale ni la conformité du pare-feu. Pas de lecture des secrets, de requête métier en production, de contrôle des sauvegardes Coolify ni d’essai de restauration. La documentation décrit une sauvegarde possible ; elle ne prouve pas qu’une sauvegarde récente se restaure.

Pas d’audit juridique, de campagne de charge, de scan intrusif ni de mesure Search Console ou d’indexation réelle. La vérification SEO porte ici sur les routes, le HTML, les métadonnées et les traductions examinés. Un HTTP 200 ne prouve pas un rendu correct.

## Ordre de correction proposé

1. Dépendances Next.js, origine des API et cache de pages privées.
2. Arbitrage des sources Changsha et comparaison de toutes les sections des decklists.
3. Contenu de la clé du panier ; compteurs et suppressions atomiques.
4. Schéma des abonnements, lecture bornée des médias et pseudo Discord.
5. Lint bloquant, compteurs de notifications, limite de 300 decks, traductions et actualité des prix.
6. Rejouer les parcours connectés, le responsive et les captures OBS quand les surfaces sont disponibles ; vérifier une restauration de sauvegarde dans un environnement isolé.

La suite doit corriger les causes une par une, avec un test qui reproduit chaque défaut. Refaire une grande refonte n’est pas nécessaire pour traiter ces constats.
