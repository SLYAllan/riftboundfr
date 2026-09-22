# Idées de fonctions sans API de tournoi

État de la recherche au 3 septembre 2026, relu le 22 septembre (section suivante).

## Relecture du 22 septembre 2026

Chaque état ci-dessous a été vérifié dans le code du jour, pas repris de mémoire.
Les chiffres viennent de la base locale après l'import hexgate du même jour.

### Où en sont les 21 idées

| État | Idées |
|---|---|
| Faites pour l'essentiel | 1 (`/decks` trie par ce qu'il reste à acheter, le panneau de couverture donne le prix des manquantes), 12 (la fiche carte montre listes, exemplaires moyens, Légendes, événements, impressions et prix daté) |
| Commencées | 2 (`/decks/compare`, deux listes), 4 (« Cartes clés » de la fiche Légende), 5 (`/outils/regles`), 9 (historique et retour à une version, sans lien « dérivé de »), 11 (abonnements Légende, deck, tournois français et règles, relus par la cloche ; pas d'accueil personnel), 14 (import Piltover, export CSV), 17 (champ `guide` sur les deux sortes de deck), 21 (images carrée, story et paysage) |
| Pas commencées | 3, 6 (hors noms chinois de l'overlay), 7, 8, 10, 13, 15, 16, 18, 19, 20 |

### Idées nouvelles

**A. Listes devenues injouables.** 2 069 des 5 996 listes Vendetta en base (35 %)
jouent Ekko, Recurrent ou Stacked Deck, interdites depuis le 18 septembre, dont 47
des 150 best-of. La page d'un deck marque la carte, mais `/decks`, les best-of et
les pages de tournoi n'en disent rien : un joueur peut monter une liste qu'il ne
pourra pas jouer. Proposition : une pastille « carte interdite » sur chaque liste
touchée, et un filtre « jouables aujourd'hui ». La liste reste telle qu'elle a été
jouée : on la signale, on ne la retouche pas. Brique : `isBanned`
(`src/lib/banned-cards.ts`). Coût faible.

**B. Méta par période et par région.** `/meta` filtre par set et par tournoi, sans
montrer l'évolution ni la région. Or le corpus Vendetta est chinois à 57 % (6 122
places sur 10 711), l'Europe n'y compte que Barcelone, et la Chine ne suit pas le
même calendrier : Stacked Deck s'y jouait encore le 19 septembre, au lendemain du
ban. Proposition : filtres « depuis le dernier ban », « quatre dernières
semaines », « Chine / reste du monde », et la part de chaque Légende semaine après
semaine. Les données existent : parts par tournoi dans `meta-parts.json`, date et
pays dans `tournament-flags.ts`. Sort du périmètre de ce document (statistiques de
tournoi), mais le site calcule déjà ces chiffres sur des classements réels. Coût
moyen.

**C. La valeur promise par `/collection`.** Son titre annonce « classeurs,
progression et valeur » ; la page n'affiche aucun prix. Afficher la valeur (idée
16, avec la règle de l'impression la moins chère de `src/lib/cardnexus.ts`), ou
retirer le mot du titre. Coût faible.

**D. Garder les prix du jour.** Le serveur relève les prix CardNexus au plus une
fois par jour, en mémoire seulement : un redémarrage repart du fichier, et aucun
relevé passé n'est gardé (`releverEnFond`, `src/lib/cardnexus.ts`). Les écrire dans
une table donnerait
en quelques semaines un vrai historique, la condition que pose l'idée 16 pour
tracer une courbe. Coût faible. À décider tôt : un jour sans relevé ne se rattrape
pas.

**E. Bot Discord.** Déjà relevé le 8 juin comme manque face aux concurrents : la
scène française vit sur Discord, et la connexion au site passe déjà par lui.
Recherche de carte, aperçu d'un code de deck, lien vers la tier list. Coût moyen,
un service de plus sur Coolify.

**F. Liste à imprimer.** Pour qui s'inscrit à un tournoi en boutique : une feuille
de style d'impression sur la page de deck, sans nouveau rendu d'image. Coût faible.

### Regroupées par besoin

1. **Après un ban** : A, B (période), 11 (prévenir l'auteur d'un deck
   communautaire devenu injouable), 5 (historique des règles).
2. **De ma collection à mes decks** : C avec 16, D, 7, 8, 13.
3. **Comprendre un archétype** : 4, 2, 3.
4. **Diffuser** : E, 21, 20, F.

### Ordre proposé

1. **A**, tout de suite : le ban est en vigueur, un tiers des listes du set est
   touché, et la brique existe.
2. **C** : la page promet une valeur qu'elle n'affiche pas.
3. **D** : quelques lignes, et chaque jour sans relevé est perdu.
4. **B** : après un ban, c'est la question d'un joueur français, qui ne joue pas
   le méta chinois.
5. **4** : la fiche Légende a déjà « Cartes clés » ; y séparer le noyau des cartes
   flex, avec le nombre de listes et le lien vers chacune.
6. **E**, pour aller chercher les joueurs là où ils sont.

À laisser de côté : 10, 13, 15, 18 et 19, faute de demande visible ; 3 réduit à un
calcul de probabilités si on le fait.

### Décisions d'Allan, le même jour

- **A et 4 sont faites** (commitées, pas encore poussées). Pastille « carte
  interdite » sur `/decks`, les pages de tournoi, les best-of et la fiche Légende,
  filtre « Sans carte interdite », encadré sur la page d'un deck. La fiche Légende
  sépare le noyau (au moins 90 % des listes) des cartes flex (30 à 90 %), avec un
  lien vers les listes qui jouent chaque carte flex.
- **Seulement les chiffres du set en cours** : une Kai'Sa d'Origins ne joue pas les
  cartes de sa version Vendetta. La fiche porte `setDesChiffres` ; sans lui, la page
  tait cartes, champions et terrains au lieu de montrer ceux d'un ancien set.
- **Pas de fonction autour du prix, sauf pour les cartes manquantes, via
  CardNexus** : ce qu'il reste à acheter pour monter un deck garde son prix et son
  panier affilié (idée 1, et le chiffrage des manquantes dans 2 et 8). C, D, 13 et
  16 sont retirées.
- B (méta par période et par région) ne lui plaît pas.

### Nouvelles pistes, après le refus de B

Vérifiées dans le code du 22 septembre. Aucune ne repose sur un prix.

Allan ne veut pas de main d'essai (idée 3 retirée). Celle qui existe déjà sous
chaque liste (« Tirer une main », `src/components/deck-summary.tsx`) tire 5 cartes,
alors que le glossaire, `/guides/debuter` et `/outils/regles` disent tous 4 : la
retirer ou la corriger reste à trancher.

1. **Ce qui distingue une liste.** Sur la page d'un deck : les cartes du noyau
   qu'elle joue, ses choix flex, et ses cartes rares (moins de 30 % des listes de
   la Légende). C'est ce qu'on vient chercher sur une liste gagnante. Lit les
   fiches du set en cours. Coût faible.
2. **Le deckbuilder compare au noyau.** La même lecture pendant la construction :
   « il manque 2 cartes du noyau », « 3 cartes jouées par moins de 30 % des
   listes ». Le site compare à des listes réelles, il ne propose aucune liste.
   Coût moyen.
3. **Les decks de la communauté et les bans.** La pastille et l'encadré du
   22 septembre ne couvrent que les decks de tournoi. Les étendre à `/d/[code]` et
   à l'onglet communautaire, et prévenir l'auteur par la cloche quand un ban
   touche son deck. Coût faible à moyen.
4. **Les errata dans les listes.** `getErrata` (`src/lib/errata-2026-07.ts`) ne
   sert qu'à la fiche carte. Une étiquette « errata » dans les listes, comme
   « Banni », dirait que le texte imprimé ne fait plus foi. Coût faible.
5. **Ta tier list.** Ranger les Légendes en S, A, B, C et D, puis partager le
   lien. Aucun outil de ce genre sur le site. Pas d'image au départ : le seul
   rendu de tier list est un script (`scripts/gen-tierlist-image.mts`), pas une
   route. Coût moyen.

## Périmètre

Ce document rassemble des fonctions qui reposent sur les données déjà fiables du
site : cartes, decklists sourcées, collection, deckbuilder, règles, prix, comptes,
contenu et overlay.

Sont exclus tant qu'aucune API officielle et stable n'existe : agenda de tournoi,
appariements, classements, suivi en direct, profils compétitifs, pronostics et
statistiques calculées depuis des résultats de tournoi.

Les priorités ci-dessous sont des choix de produit, pas un plan de mise en œuvre.

## Priorités proposées

| Rang | Fonction | Valeur | Coût probable | Briques déjà présentes |
|---:|---|---|---|---|
| 1 | Decks accessibles avec ma collection | Très forte | Faible | Couverture, filtre `owned`, prix, panier |
| 2 | Comparaison de deux à quatre decks | Très forte | Faible à moyen | Comparateur, codes, résolution des cartes |
| 3 | Laboratoire de mains et probabilités | Forte | Moyen | Deckbuilder, deck résolu, règles de mulligan |
| 4 | Noyau et cartes flex | Forte | Moyen | Decklists sourcées, fiches Légendes |
| 5 | Centre de règles daté et sourcé | Très forte | Moyen | `/outils/regles`, règles, errata, bans |
| 6 | Recherche multilingue et avancée | Forte | Moyen | Filtres communs, noms chinois, DB cartes |
| 7 | État exact de possession | Forte | Faible | Collection, impressions équivalentes |
| 8 | Cartes réservées dans les decks montés | Moyenne à forte | Moyen | Collection et decks du compte |
| 9 | Versions et decks dérivés | Moyenne à forte | Faible | `CommunityDeckVersion`, diff de deck |
| 10 | Collections éditoriales de decks | Moyenne à forte | Moyen | Decks publics, profils, commentaires |
| 11 | Favoris et accueil personnel | Moyenne à forte | Moyen | Likes, notifications, profil |
| 12 | Page carte enrichie | Forte | Faible à moyen | Cartes, decks, règles, collection, prix |
| 13 | Comparateur d'échange | Moyenne | Moyen | Classeurs, impressions, prix |
| 14 | Import et sauvegarde de collection | Forte | Faible à moyen | Import Piltover, export CSV |
| 15 | Presets et commandes d'overlay | Moyenne | Moyen | État overlay, compagnon, file d'envoi |

## 1. Decks accessibles avec ma collection

### Besoin

Le joueur veut savoir quels decks il peut monter, combien de cartes lui manquent
et combien coûterait le complément.

### Première version

- Trier les decks par nombre de cartes manquantes.
- Afficher le pourcentage possédé.
- Afficher le prix estimé des manquantes.
- Filtrer par seuil : jouable, 1 à 3 cartes manquantes, moins de 10 €, moins de 25 €.
- Ouvrir la liste exacte des cartes manquantes.
- Préparer le panier CardNexus des seules cartes manquantes.

### Existant à réutiliser

- `src/lib/deck-listing.ts` filtre déjà les decks possédés.
- `src/lib/collection.ts` rapproche les impressions d'une même carte.
- `/api/collection/coverage` calcule la couverture.
- `/api/cardnexus/panier` accepte déjà l'achat des manquantes.

### Limite

Le site classe de vraies listes. Il ne crée ni ne complète aucune decklist.

## 2. Comparaison de deux à quatre decks

### Besoin

Comparer plusieurs variantes sans ouvrir quatre onglets ni relever les cartes à
la main.

### Première version

- Coller deux à quatre codes, liens ou slugs.
- Montrer les cartes communes et propres à chaque liste.
- Comparer quantités, réserve, courbe, domaines et prix.
- Ajouter la couverture de la collection et les cartes manquantes.
- Partager la comparaison par une URL contenant les identifiants.

### Existant à réutiliser

Le site possède déjà `/decks/compare`, les codes de deck, `resolveDeckCards`, les
prix et le calcul de couverture. Aucun nouveau stockage n'est requis au départ.

### Inspiration

OP.GG propose une recherche groupée de plusieurs joueurs dans une seule vue :
[guide Multi-Search](https://help.op.gg/hc/en-us/articles/31088821370777-Multi-Search-guide).

## 3. Laboratoire de mains et probabilités

### Besoin

Tester la régularité d'une liste sans créer un simulateur de partie.

### Première version

- Tirer une main de départ.
- Choisir les cartes à remplacer.
- Appliquer le mulligan officiel.
- Mélanger et tirer les premières cartes.
- Calculer la chance de voir une carte avant un tour choisi.
- Calculer la chance d'obtenir au moins une carte parmi un groupe.
- Comparer deux ou trois exemplaires d'une même carte.

### Limite

Pas de plateau, de résolution automatique des effets ni de moteur de jeu. Riot
autorise les bases de cartes et les constructeurs, mais encadre fortement les
outils qui reproduisent le jeu :
[politique Riot pour les outils Riftbound](https://developer.riotgames.com/docs/riftbound).

### Inspirations

- Archidekt propose une main d'essai et un mulligan :
  [présentation du playtester](https://archidekt.com/news/3417345).
- Moxfield propose des mains et un espace de test :
  [liste de fonctions](https://github-wiki-see.page/m/moxfield/moxfield-public/wiki/Features).

## 4. Noyau et cartes flex

### Besoin

Montrer la forme d'un archétype sans publier une liste synthétique présentée comme
un vrai deck.

### Affichage proposé

- Cartes présentes dans la plupart des listes sourcées.
- Quantité médiane ou habituelle.
- Choix variables réellement observés.
- Cartes propres à une variante.
- Nombre de listes et période étudiée.
- Lien vers chaque liste source.

### Méthode

Une carte peut être fréquente partout sans être propre à une Légende. Une mesure
utile compare donc son taux avec la Légende à son taux dans les autres decks
compatibles. EDHREC applique une idée proche avec une mesure d'association :
[explication du calcul](https://edhrec.com/articles/from-synergy-to-lift-the-math-behind-edhrecs-new-era).

### Limite

Ne jamais transformer le noyau en deck de 40 cartes inventé. Afficher le nombre de
listes, la période et les biais du corpus.

## 5. Centre de règles daté et sourcé

### Besoin

Trouver vite une réponse en français et vérifier le texte officiel qui la fonde.

### Première version

- Recherche par mots courants.
- Réponse courte suivie du passage officiel.
- Numéro de règle, document, version et date.
- Filtres par thème et format.
- Historique des changements.
- Mention claire pour une ancienne règle.
- Lien partageable vers une règle précise.
- Vue mobile adaptée à une consultation pendant une partie.

### Existant à réutiliser

`/outils/regles` cherche déjà dans les règles et affiche mots-clés, errata et bans.
Il faut l'étendre, pas créer un second outil.

### Limite

Une réponse sans référence ne doit jamais apparaître comme une décision officielle.

## 6. Recherche multilingue et avancée

### Besoin

Retrouver une carte vue dans une autre langue ou combiner plusieurs critères précis.

### Recherche multilingue

- Nom français.
- Nom anglais.
- Nom chinois vérifié.
- Identifiant Riftbound.
- Numéro de collection.
- Partie du texte.
- Alias d'écriture connus.

La valeur interne reste le nom canonique. Aucune traduction ne doit être devinée.

### Filtres composables

Exemple : unité de coût inférieur ou égal à 3, domaine Calme ou Esprit, qui donne
de l'XP, non interdite, possédée au moins deux fois et vendue moins de 5 €.

Commencer par des filtres visuels et des pastilles. Un langage de recherche complet
peut attendre une demande mesurée.

### Existant à réutiliser

- `src/lib/card-keywords.ts`
- `src/components/keyword-filter.tsx`
- `src/lib/cards-zh.ts`
- API cartes et filtres actuels

## 7. État exact de possession

### États utiles

- Impression exacte possédée.
- Même carte dans une autre impression.
- Quantité insuffisante.
- Carte absente.
- Carte affectée à un autre deck monté.

Cette distinction sert à la fois au joueur et au collectionneur. Une copie jouable
ne signifie pas que l'impression recherchée pour finir un set est possédée.

## 8. Cartes réservées dans les decks montés

### Besoin

Une même copie physique ne peut pas rester dans deux decks en même temps.

### Première version

- Choisir deux à quatre decks à monter.
- Comparer le besoin total à la collection.
- Montrer les conflits et les cartes à déplacer.
- Calculer les achats requis pour conserver tous les decks montés.

### Simplification retenue

Ne pas créer tout de suite un système d'emplacements physiques, de boîtes et de
classeurs. Une comparaison ponctuelle couvre déjà le besoin principal.

## 9. Versions et decks dérivés

### Première version

- Lien « dérivé de » vers le deck d'origine.
- Crédit de l'auteur.
- Cartes ajoutées et retirées.
- Changement des quantités et de la réserve.
- Note de modification.
- Historique des versions.
- Retour vers une ancienne version après confirmation.

### Existant à réutiliser

`CommunityDeckVersion` et `src/lib/deck-diff.ts` couvrent déjà le stockage et la
comparaison de base.

## 10. Collections éditoriales de decks

### Exemples

- Decks pour débuter avec une Légende.
- Listes à petit prix.
- Decks avec un guide détaillé.
- Variantes qui utilisent une carte donnée.
- Choix récents de la rédaction.
- Decks communautaires à découvrir.

Chaque entrée pointe vers une vraie liste. La collection garde un auteur, une date,
un ordre et une courte raison de sélection.

### Inspiration

Le Steam Workshop regroupe des créations dans des collections suivies :
[Steam Workshop](https://steamcommunity.com/workshop).

## 11. Favoris et accueil personnel

### Sujets suivis

- Légende.
- Carte.
- Auteur.
- Deck communautaire.
- Article ou type de guide.

### Accueil personnel

- Brouillons et decks récemment ouverts.
- Nouvelles versions des decks suivis.
- Cartes manquantes.
- Progression de collection.
- Changements de règles.
- Articles liés aux Légendes suivies.
- Notifications sociales.

### Limite

Réutiliser `src/lib/notifications.ts` et la cloche actuelle. Grouper les nouvelles
pour éviter une alerte à chaque petite action.

### Inspiration

Riot Mobile permet de choisir les sujets suivis et de personnaliser son fil :
[fonctions de Riot Mobile](https://support-leagueoflegends.riotgames.com/hc/en-us/articles/4407680309395-Riot-Mobile-Features).

## 12. Page carte enrichie

### Ajouts possibles

- Decks sourcés qui jouent la carte.
- Quantité habituelle dans ces listes.
- Légendes associées.
- Impressions et langues disponibles.
- Règles et errata liés.
- État précis dans la collection.
- Prix et date du relevé.
- Ajout direct au deckbuilder.

### Limite

La présence dans une liste ne prouve ni la force ni la cause d'un résultat. Rester
sur des faits : nombre de listes, quantité et sources.

## 13. Comparateur d'échange

### Première version

Deux listes locales montrent cartes, impressions, quantités, total estimé et écart.

### Garde-fous

- Prendre en compte langue, impression et finition quand le prix existe.
- Afficher la date du relevé.
- Parler d'estimation, jamais de prix garanti.
- Ne pas ajouter de messagerie ni de marché.

ManaBox présente un outil d'échange et une gestion des listes :
[ManaBox](https://www.manabox.app/).

## 14. Import et sauvegarde de collection

### Première version

- Export CSV stable et documenté.
- Identifiant canonique, impression, quantité et classeur.
- Aperçu avant tout import.
- Liste claire des lignes inconnues.
- Aucune écriture partielle en cas d'erreur.
- Import des formats les plus utilisés, un par un.

### Existant à réutiliser

Le site importe déjà Piltover Archive et exporte les classeurs. Il faut étendre ce
passage plutôt que créer un second système d'import.

## 15. Objectifs de collection

### Objectifs possibles

- Une carte de chaque nom.
- Trois exemplaires jouables.
- Set complet en impressions normales.
- Liste personnelle.
- Deck précis.

Afficher la progression, les cartes restantes, leur prix estimé et un export des
manquantes.

La wishlist a été retirée du projet. Tout objectif qui recrée une liste de souhaits
demande donc une décision de produit.

## 16. Valeur de collection

### Première version prudente

- Valeur connue.
- Cartes sans prix.
- Date du relevé.
- Répartition par set et rareté.
- Cartes les plus chères.

Ne pas dessiner un historique sans données historiques fiables. Un prix d'annonce
n'est pas toujours un prix de vente.

## 17. Guides et notes de deck

### Guide public de l'auteur

- Plan de jeu.
- Mulligan.
- Cartes importantes.
- Choix variables.
- Utilisation de la réserve.
- Options selon le budget.
- Journal des changements.

### Notes privées

- Note sur le deck.
- Note sur une carte.
- Note sur une version.
- Note sur une main testée.

Ne jamais attribuer un guide à l'auteur d'une liste importée sans son accord.

## 18. Paquets de cartes réutilisables

L'utilisateur enregistre un groupe de cartes puis l'ajoute à un nouveau deck. Le
groupe peut représenter un moteur de pioche, une base de Légende ou un ensemble de
réponses.

Le site contrôle la légalité lors de l'ajout. Il ne recommande pas lui-même le
paquet et ne le présente pas comme obligatoire.

## 19. Recherches enregistrées et carte aléatoire utile

### Recherches enregistrées

Exemples : unités Calme à deux énergies, cartes Vendetta manquantes, cartes
possédées compatibles avec Jinx, équipements de moins de 3 €.

### Carte aléatoire

- Carte d'un domaine choisi.
- Carte possédée mais absente de tous les decks du compte.
- Carte correspondant à une recherche enregistrée.
- Carte peu consultée.

L'aléatoire doit servir la découverte, pas occuper une place sur l'accueil sans but.

## 20. Presets et commandes d'overlay

### Presets

- Joueurs et couleurs.
- Logos et décor.
- Chrono.
- Position des éléments.
- Paramètres de caméra.
- Partie, pause, analyse de deck ou attente.

### Commandes rapides dans le compagnon

- Annuler la dernière action.
- Échanger les côtés.
- Masquer ou révéler le score.
- Lancer ou arrêter le chrono.
- Afficher une carte ou un deck.
- Charger un preset.

### Existant à réutiliser

Les presets doivent passer par l'état, les patchs et la file d'envoi déjà présents.
Aucun nouveau moteur d'overlay ni rendu d'image ne doit être créé.

## 21. Kit pour les créateurs

Depuis un deck public :

- image carrée existante ;
- image story existante ;
- export paysage existant ;
- texte court copiable ;
- lien vers le deck ;
- crédit de l'auteur ;
- liste des cartes manquantes.

Réutiliser `/api/decklist-image` et `generateDeckImage`. Aucun quatrième rendu.

## Fonctions écartées

- Toute fonction qui dépend de données de tournoi sans API officielle stable.
- Constructeur de deck par IA.
- Decklist synthétique présentée comme une vraie liste.
- Simulateur complet de partie.
- Score unique de niveau ou de qualité.
- Classement ELO et repérage public d'un adversaire.
- Marché interne, paiement ou messagerie.
- Nouveau scanner photo avant d'avoir mesuré le besoin et les erreurs.
- Nouvel outil d'image de deck.
- Historique de prix inventé depuis des relevés ponctuels.

## Sources d'inspiration consultées

- [Politique Riot pour les outils Riftbound](https://developer.riotgames.com/docs/riftbound)
- [OP.GG](https://op.gg/desktop/en/games)
- [Riot Mobile](https://support-leagueoflegends.riotgames.com/hc/en-us/articles/4407680309395-Riot-Mobile-Features)
- [Archidekt](https://archidekt.com/landing)
- [Moxfield](https://moxfield.com/)
- [EDHREC](https://edhrec.com/)
- [ManaBox](https://www.manabox.app/)
- [YGOPRODeck](https://ygoprodeck.com/deckbuilder/)
- [Steam Workshop](https://steamcommunity.com/workshop)

Les pages des produits décrivent leurs propres fonctions. Elles servent ici de
sources d'inspiration, pas de preuve qu'une fonction aura le même effet sur
Riftbound France.
