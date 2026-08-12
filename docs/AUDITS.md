# Audits et rapports — Riftbound France

Archive de tous les audits et rapports du projet, du plus récent au plus ancien.
Chaque section garde le texte d'origine : c'est un état des lieux daté, pas la
vérité d'aujourd'hui. Pour l'état courant du projet, lire `HANDOFF.md`.

## Sommaire

- 11 août 2026 — Audit et correctifs (collection, decklists, wishlist)
- 9 août 2026 — Analyse GEO (visibilité dans les moteurs IA)
- 2 août 2026 — Rapport Google APIs (Search Console, GA4, PageSpeed)
- 29 juillet 2026 — Audit d'interface (skills better-*)
- 27 juillet 2026 — Visuels et audits
- 22 juillet 2026 — National Open + Vendetta + SEO
- 26 juin 2026 — Audit de régression
- 26 juin 2026 — Audit global (workflow multi-agents)
- 17 juin 2026 — Fiabilisation des decklists
- 15 juin 2026 — Sécurité + SEO page par page
- 31 mai 2026 — Audit site complet (pré-déploiement)
- 28 mai 2026 — Deckbuilder V2
- 27 mai 2026 — Rapport de build
- 25 mai 2026 — Rapport d'audit initial
- 24 mai 2026 — Audit de sécurité


---

# 11 août 2026 — Audit et correctifs (collection, decklists, wishlist)

> Source d'origine : `docs/AUDIT-2026-08-11.md`

## Audit et corrections du 11 août 2026

13 commits. `tsc`, `next build` et 84 tests verts.
Tout est poussé sur `main` (`b38c78a0` → `571113b8`).

### Méthode

Balayage des 35 pages au navigateur, à 375 px et 1440 px, session connectée.
Chaque constat est **mesuré dans la page** (contraste calculé sur le rendu,
débordement, noms accessibles, tailles de cible, hiérarchie des titres, erreurs
console), jamais déduit d'une lecture de code. Chaque constat est vérifié avant
correction : plusieurs se sont révélés faux, ils sont listés plus bas.

### 1. Le bug qui perdait des cartes

**Symptôme** : sur `/d/jshit35q`, la réserve affichait « Réserve (9) » au lieu de 10.

**Cause** : le code du deck porte `1 Vilemaw (Alternate Art)`. Le parseur ne
reconnaissait `(...)` comme code d'extension que s'il en avait la forme
(`OGN-022`). « Alternate Art » n'y ressemblant pas, il était recollé au nom : la
recherche portait sur une carte nommée `Vilemaw (Alternate Art)`, qui n'existe
pas, et `if (!card) continue` la supprimait sans un mot. La même ligne figurait
dans le MainDeck : une carte y était perdue aussi, sans que personne le voie.

**Le vrai problème** : ce bloc de résolution était **copié dans 4 fichiers**
(`/d/[code]`, `/decks/compare`, deux fois `/api/decklist-image`), chacun avec
trois défauts :

- l'heuristique « contient un espace donc c'est un nom » prenait `Defy` ou
  `Vilemaw` pour un identifiant, et ne les trouvait jamais ;
- le filtre `alternateArt: false` rendait introuvable une carte n'existant qu'en
  alt-art ;
- le `continue` muet rendait chaque perte invisible.

Corriger une copie en laissait trois cassées.

**Correctif** : `src/lib/deck-cards.ts` devient le point de passage unique.
`resolveDeckCards(identifiers)` renvoie `{ map, missing }`, et la page **affiche**
les cartes non reconnues au lieu de les jeter.

**Cas testés** : 9 sur 11 cassaient au départ, 17 sur 17 passent. Couverts :
apostrophe typographique ou absente, virgule (`cleanName` stocke « Kai'Sa,
Survivor » sous « KaiSa Survivor »), espaces multiples, casse, en-têtes français
et accentués, en-têtes comptés (`Sideboard (10):`), lignes sans quantité, `3x`
collé, les cinq suffixes cosmétiques, identifiants. La parenthèse d'un vrai nom
(« Master Yi (Wuju Master) ») est préservée — testée exprès, deux Master Yi
existent.

31 tests ajoutés (`deck-code.test.ts`, `deck-cards.test.ts`).

### 2. Page collection refaite, wishlist retirée

La page tenait du tableau de bord générique : bandeau à dégradé violet, quatre
tuiles de compteurs, quatre grilles de barres.

Chaque classeur s'affiche maintenant comme une **page de classeur** : neuf
pochettes contenant ses cartes les plus rares, perforations de reliure. L'en-tête
porte une barre par set dont la **largeur suit la taille du set**, ce qui remplace
à la fois le camembert et l'ancienne section « progression par set ».

Le renommage se fait sur place, la suppression passe par un dialogue Base UI
(focus piégé, Échap annule) au lieu de `window.confirm`, et les trois `prompt`
natifs disparaissent.

La wishlist est retirée du schéma, de l'API, du classeur et de la base de prod.

Deux défauts trouvés à l'écran pendant la refonte et corrigés : les noms de sets
tronqués en « Riftboun… » (les trois lots de promos sont regroupés en une barre
« Promos », total inchangé) et les classeurs qui faisaient 500 px de haut, passés
en format horizontal.

### 3. Lisibilité et clavier, tout le site

| Correction | Portée |
|---|---|
| Curseur main sur les boutons — Tailwind v4 l'a retiré, seuls 19 endroits le remettaient à la main | tout le site |
| Champs sous 16 px : iPhone zoomait au moindre clic dans une recherche | tout le site |
| Séparateur du pied de page en `text-hairline` (couleur de **bordure**, 10 % d'opacité) : 1,19:1, invisible | tout le site |
| Blanc sur arcane à 2,77:1, dont le lien « Aller au contenu » lui-même | 3 endroits |
| 9 champs sans nom accessible | 5 pages |
| `min-h-screen` → `min-h-dvh` | 5 fichiers |
| Cases à cocher de 13 px, bouton favoris de 23 px (minimum 24) | 2 endroits |

**Bug réel sur `/outils/regles`** : des chapitres de règles partagent le même
titre, donc le même `id` HTML. Le sommaire renvoyait toujours au premier
« Équiper », « Amplification », « Champs de bataille » ou « Présence sur les
permanents ». Corrigé dans `loadRuleChapters`, pas dans la page. **74 erreurs
console tombées à 0.**

### 4. Passe visuelle

**Accueil** — la carte des Légendes flottait dans 400 px de vide, sa hauteur étant
imposée par la tier list voisine. Passée en 2 colonnes : la grille remplit la
hauteur et les six noms tiennent, alors que quatre sur six étaient tronqués. h1
remonté (il était à peine plus gros que les h2). Onglet `ALL` → `TOUS`.

**Decks** — le tournoi et le joueur étaient posés à même l'illustration avec une
ombre d'1 px, illisibles sur les arts clairs (Sett, Azir). Halo renforcé **sans
toucher aux dégradés des bannières**, que tes deux commits précédents avaient
allégés exprès. Le nom de tournoi quitte l'or, qui disparaissait sur les armures
dorées ; la pastille « Best of » le porte déjà.

**Tournois** — le nom du vainqueur était placé exactement là où le voile est le
plus faible (`to-canvas/10`) : « 梦之星-咕嘎乐色 » se perdait dans les cheveux
d'Irelia. Deuxième usage du halo, donc sorti en classe `.texte-sur-art` plutôt
que répété.

**Meta** — le titre disait « Meta Snapshot » quand l'accueil dit « Aperçu du
méta ». Les cartes se décalaient selon que le nom tenait sur une ou deux lignes.

**Légendes** — l'archétype passait à droite du nom quand celui-ci était court
(LeBlanc, Ahri) et dessous sinon (Diana) : plus rien ne s'alignait.

**Articles** — un titre sur une ligne faisait remonter la description et les
pastilles. Vérifié : les trois descriptions d'une rangée démarrent au même pixel.

**Deck** — le bandeau de la decklist répétait mot pour mot le titre, la Légende,
le joueur et le tournoi déjà donnés par le h1 juste au-dessus.

### 5. Ajouts

**Tier list cliquable** — chaque vignette mène à `/decks?legend=<Légende>`.
L'infobulle qui donne le nom repose sur le survol, qui n'existe pas au doigt : sur
mobile les 40 vignettes étaient muettes et aucune n'était cliquable.

**Incrustations** — `:furie:` pose le logo du domaine, `:irelia:` la vignette de
la Légende, dans les commentaires et les guides de deck, avec un menu à recherche.
Le vocabulaire est construit sur les icônes déjà présentes, **aucun fichier
ajouté** : 6 domaines depuis `DOMAIN_ICONS`, 48 Légendes depuis `ICON_MAP`.

Le motif n'accepte que lettres et chiffres entre les deux-points, sinon
`rendez-vous à 12:30` ou une URL deviendraient des images. L'insertion se fait au
curseur. Le nom reste dans le `alt` pour le copier-coller et les lecteurs
d'écran. 12 tests.

### Constats écartés après vérification

Cinq alertes que j'ai refusé de « corriger » après mesure :

- **Badges à 1:1** sur `/decks`, `/deckbuilder`, `/guides/meta` : Tailwind v4
  compile `bg-gold/80` en `lab()`, que mon analyseur ne savait pas lire. Les fonds
  s'appliquent, les badges sont lisibles.
- **9 liens « sans nom »** sur `/legendes/[slug]` : ils tirent leur nom du `alt`
  de l'image qu'ils enveloppent.
- **Lien « Aller au contenu » à 1×1 px** : comportement correct d'un `sr-only`
  jusqu'au focus.
- **Note de tier list « en bleu »** : elle est en encre normale. Erreur de lecture
  de ma part sur la capture.
- **Noms de set de `/cartes` « en bleu de lien »** et cartes désalignées : les
  noms sont en gris, et les 6 cartes d'une rangée font exactement 358 px.

### Reste à faire

#### Supprimer la table wishlist en prod — FAIT le 11 août

`npx prisma db push` a échoué chez toi parce que le conteneur a téléchargé Prisma
**7.9.1** (npx n'a pas trouvé le binaire local) alors que le projet est en
**6.19.3** ; Prisma 7 a supprimé `url` dans le bloc `datasource`. Le schéma n'est
pas en cause.

N'utilise pas `db push` sur la prod de toute façon : il synchronise **tout** le
schéma et peut toucher autre chose sans prévenir. Depuis le conteneur de la base
(pas celui de l'app) :

```sh
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "WishlistItem";'
```

Le `DROP TABLE` a été passé. À retenir : le SQL se lance depuis le conteneur de
la **base**, pas celui de l'app.

#### Corrigé après la première rédaction

**Cinq cartes étaient invisibles.** Les curseurs Énergie, Pouvoir et Puissance
avaient leurs plafonds écrits en dur (12, 4, 10) dans la collection **et** dans le
deckbuilder. La base monte à 12 de Puissance : Baron Nashor (3 impressions) et
Master Yi, Unstoppable (2) ne pouvaient apparaître nulle part, quels que soient
les réglages. Les plafonds se calculent désormais sur les cartes. Vérifié :
recherche vide = 1275 cartes, soit toute la base.

À noter : « Forgotten Signpost », qui a lancé la recherche, était en réalité bien
présent (énergie 2, sans pouvoir ni might). L'intuition « il en manque d'autres »
était juste, la carte citée non.

**Illustration des variantes.** `Vilemaw (Alternate Art)` est le vrai nom d'une
carte (`unl-060a-219`) : 100 cartes portent ce suffixe, 135 en portent d'autres.
Le premier correctif l'effaçait avant la recherche et affichait l'illustration de
base. Le parseur garde maintenant le nom entier, et le résolveur ne retombe sur
l'impression de base que si la variante n'existe pas.

**Écriture du deckbuilder** : vérifiée, rien à corriger. `getTextCode()` écrit le
vrai nom de la carte choisie. C'était bien la lecture qui était fautive.

**Vocabulaire de classement** : `/legendes` passe de « Tier 1 à 4 » à S/A/B/C,
avec les couleurs des tokens `--color-tier-*`. Le mot « tier » ne sert plus qu'au
niveau des tournois.

#### Décisions qui t'appartiennent

Tranchées le 11 août : le franglais des fiches reste tel quel, la pagination
n'est pas voulue, le vocabulaire passe en S/A/B/C/D partout. Rien d'ouvert de ce
côté.

#### Pages non revues à l'œil

15 sur 35 : les 7 guides, la fiche carte, `/tournois/[slug]`,
`/articles/[slug]`, `/decks/compare`, `/community-decks`,
`/profil`, `/profil/overlay`, `/a-propos`, `/outils/compteur`, `/outils/regles`,
`/offline`. Elles ont toutes passé le balayage automatique, mais aucune n'a été
jugée à l'œil.


---

# 9 août 2026 — Analyse GEO (visibilité dans les moteurs IA)

> Source d'origine : `GEO-ANALYSIS.md`

## Analyse GEO — riftboundfrance.fr

**Date : 9 août 2026** · Production · Sources : robots.txt et llms.txt en ligne, HTML rendu
de 5 pages, deux requêtes réelles passées à ChatGPT avec recherche web (France, français),
via DataForSEO. Coût : 0,02 $.

> Le cadre est celui de Google : optimiser pour les réponses génératives, c'est du SEO
> appliqué à une nouvelle surface, pas une discipline séparée. Rien ici ne repose sur des
> recettes propres aux IA.

### Score de disponibilité GEO : 73/100

| Critère | Poids | Note | Ce qui la justifie |
|---|---|---|---|
| Accessibilité technique | 20 % | **19/20** | Rendu serveur complet, tous les robots d'IA autorisés |
| Citabilité | 25 % | **20/25** | Citations réelles constatées, mais dates et tableaux absents |
| Lisibilité structurelle | 20 % | **13/20** | `/tier-list` sans aucun sous-titre, zéro tableau sur le site |
| Autorité et marque | 20 % | **13/20** | Schéma Article et Person corrects, identité d'auteur incohérente |
| Contenu multi-format | 15 % | **8/15** | Images oui, aucune vidéo, aucun tableau, aucun graphique |

### Le fait principal : le site est déjà cité

Requête posée à ChatGPT en français, depuis la France, recherche web active :
*« Quels sont les meilleurs decks Riftbound actuellement ? Donne des sources
françaises. »*

**riftboundfrance.fr apparaît dans 5 des 10 sources**, et ChatGPT écrit noir sur blanc :

> « La meilleure ressource française que j'ai trouvée est clairement **Riftbound France
> – Méta & Tier List** : elle agrège plus de 21 000 decklists et 88 tournois et fournit
> une vraie analyse statistique plutôt qu'une simple tier list subjective. »

Pages citées : `/guides/meta` (deux fois, c'est l'ancre), `/tournois/s3-national-open-2026-07-19`,
`/decks`, et `/decks?tournament=RQ+Utrecht+2026`. Les seuls autres domaines cités sont
le site officiel de Riot et CardsRealm.

**Ce qui déclenche la citation est identifiable** : ChatGPT reprend des chiffres précis
qu'il ne trouve nulle part ailleurs. « 8 % du field et 6 victoires » pour Irelia,
« 19 Top 8 » pour LeBlanc, « 21 000 decklists et 88 tournois ». Ce n'est pas la prose qui
est citée, c'est la donnée agrégée. C'est la même conclusion que l'analyse de mots-clés
de ce matin : votre actif, ce sont les 22 500 listes, et personne d'autre en français ne
les a.

### Le trou : « où jouer »

Deuxième requête : *« Où puis-je jouer à Riftbound en France ? Boutiques et tournois près
de chez moi. »*

**Zéro citation du site.** ChatGPT se rabat sur le site officiel de Riot et sur des fiches
de boutiques locales. Il mentionne pourtant le Rift Tour et ses 16 boutiques partenaires,
sujet sur lequel le site a déjà un article.

L'article existe donc, mais il ne répond pas à la forme de la question. C'est une
actualité, pas un annuaire. Une IA qui cherche « près de chez moi » a besoin de lieux,
de villes et de dates, pas d'un récit.

Cela recoupe exactement le gisement mesuré ce matin : environ 1 200 recherches par mois
sur « riftbound locator » et « riftbound events », une page de résultats Google qui ne
compte que 90 résultats, et rien en français. Le trou est le même des deux côtés.

### Accès des robots d'IA

| Robot | État |
|---|---|
| GPTBot, ChatGPT-User | Autorisés explicitement |
| ClaudeBot | Autorisé explicitement |
| PerplexityBot | Autorisé explicitement |
| Applebot-Extended | Autorisé explicitement |
| OAI-SearchBot, CCBot, autres | Autorisés par la règle générale |

Seuls `/admin` et `/api/` sont fermés. Rien à corriger.

### llms.txt

Présent, 65 lignes, à jour. **À ne pas surestimer** : les relevés de journaux serveur et
l'étude SE Ranking sur 300 000 domaines ne montrent aucun effet sur les citations, et
Google comme Bing disent ne pas le lire. On le garde parce qu'il ne coûte rien, on n'en
attend rien.

### Rendu serveur

Vérifié sur cinq pages : le contenu est dans le HTML, entre 85 et 163 Ko. Les robots
d'IA n'exécutent pas JavaScript, ce point est donc décisif, et il est acquis.

### Données structurées

Partout : `Organization`, `WebSite`, `SearchAction`, `BreadcrumbList`, `ImageObject`.
Sur les articles, en plus : `Article`, `WebPage`, `Person`, `datePublished`,
`dateModified`.

**Un défaut d'identité.** L'auteur déclaré est :

```json
{"@type":"Person","name":"Allan","url":"https://twitter.com/solary_allan"}
```

L'URL renvoie vers un compte qui n'est pas celui de la marque, @FRRiftbound. Pour une IA
qui tente de relier une personne à une organisation, les deux entités ne se rejoignent
pas. À faire pointer vers une page d'auteur du site, elle-même reliée aux comptes par
`sameAs`.

### Les cinq changements à plus fort effet

1. **Créer la page « où jouer à Riftbound en France ».** C'est le seul trou où la demande
   est mesurée des deux côtés, en recherche classique et en réponse d'IA, avec zéro
   concurrent français. *Comment savoir si ça échoue :* si dans six semaines la même
   question posée à ChatGPT ne cite toujours pas le site, c'est que la page manque de
   lieux et de dates concrets, pas de texte.

2. **Mettre des tableaux là où il y a des données.** Le site n'en compte **aucun** sur
   les pages vérifiées. ChatGPT a dû fabriquer lui-même le tableau de classement à partir
   de votre prose. Un tableau déjà formé est repris tel quel. *Dépend de rien, à faire en
   premier.*

3. **Afficher une date de mise à jour sur les guides.** `/guides/meta` et
   `/guides/debuter` n'en portent aucune, alors que `/guides/meta` est la page la plus
   citée du site. Une IA qui hésite entre deux sources garde la datée.

4. **Donner des sous-titres à `/tier-list`.** Un `h1`, zéro `h2`, zéro `h3`. La page est
   un bloc, donc impossible à découper en passage citable, et c'est probablement pourquoi
   ChatGPT cite `/guides/meta` à sa place sur une question de tier list.

5. **Réparer l'identité de l'auteur**, puis relier le site, @FRRiftbound et la page
   À propos par `sameAs`.

### Deux détails à surveiller

- ChatGPT cite « 21 000 decklists et 88 tournois ». La réalité est d'environ 22 500 listes
  et plus de 95 tournois. Les chiffres affichés sur `/guides/meta` sont donc figés dans
  le texte, et les IA propagent la version périmée. Les rendre depuis la base.
- ChatGPT annonce la sortie française de Vendetta au 23 octobre. À vérifier de votre côté :
  si c'est exact, il y a un article à écrire, et personne en français ne l'a fait.

### Ce que je n'ai pas mesuré

La présence de la marque sur Reddit, YouTube et Wikipédia, qui pèse davantage que les
liens entrants sur les citations d'IA. Le vérifier demanderait des appels supplémentaires.
À faire dans un second temps, avec le budget DataForSEO restant, environ 0,88 $.


---

# 2 août 2026 — Rapport Google APIs (Search Console, GA4, PageSpeed)

> Source d'origine : `GOOGLE-API-REPORT-riftboundfrance.fr.md`

## Rapport Google APIs — riftboundfrance.fr

**Date : 2 août 2026** · Sources : Search Console (5 au 30 juillet, décalage 2-3 j), GA4 (5 juillet au 1er août), PageSpeed Insights v5 + données terrain Chrome, inspection d'URL sur 28 pages.

> Ce rapport remplace celui du 21 juillet.

### Correction de chiffre sur le rapport précédent

Le rapport du 21 juillet annonçait **63 clics** sur 23 juin - 18 juillet. C'est faux, et par ma faute : la requête croisait requête × page, une vue qui écarte toutes les recherches que Google anonymise. Sur la même période, le vrai total est **338 clics et 4 330 impressions**.

Le site allait donc cinq fois mieux que ce que je vous ai écrit. Ce rapport-ci compte les totaux par jour, la seule base juste. Les tableaux par requête restent sur la vue partielle : c'est la seule que Google publie à ce niveau de détail.

### Résumé

| Indicateur | 23 juin - 18 juil | 5 - 30 juillet | Évolution |
|---|---|---|---|
| Clics Search Console | 338 | **997** | ×2,9 |
| Impressions | 4 330 | **11 735** | ×2,7 |
| Taux de clic | 7,8 % | **8,5 %** | +0,7 pt |
| Sessions organiques GA4 | 132 | **325** | ×2,5 |
| Sessions par jour | 4,9 | **12,0** | ×2,4 |
| Lighthouse mobile / desktop | 87 / 100 | 84 / 95 | −3 / −5 |
| Accessibilité mobile | 91 | **100** | +9 |

Sur 28 jours glissants, le trafic a presque triplé. Fin juillet tourne à 80-95 clics par jour contre 25-45 début juillet. Rien dans les données ne signale un plafond.

### Nouveau : les données terrain Chrome sont enfin là

Le site avait trop peu de visiteurs Chrome pour que Google publie ses mesures réelles. Ce n'est plus le cas. Voici ce que vivent les vrais visiteurs, sur la page d'accueil :

| Mesure | Valeur réelle (p75) | Seuil | Verdict |
|---|---|---|---|
| Affichage du plus grand élément (LCP) | **1,00 s** | 2,5 s | vert |
| Réponse à l'interaction (INP) | **107 ms** | 200 ms | vert |
| Décalage visuel (CLS) | **0** | 0,1 | vert |
| Premier affichage (FCP) | 0,92 s | 1,8 s | vert |
| Temps de réponse serveur | 0,44 s | 0,8 s | vert |

**Les trois signaux Web essentiels sont au vert.** Le LCP mobile de 4,1 s que remonte Lighthouse est un chiffre de laboratoire, mesuré sur un réseau lent simulé. Chez les vrais visiteurs, il est à 1 seconde. Il n'y a plus rien à corriger côté performance : le sujet est clos.

Les scores Lighthouse baissent légèrement (mobile 87 → 84, desktop 100 → 95) mais c'est du bruit de mesure sur une seule exécution, contredit par le terrain. L'accessibilité passe elle de 91 à **100 sur mobile et desktop** : l'audit d'interface de fin juillet a porté.

### Search Console, 5 au 30 juillet

997 clics, 11 735 impressions, 8,5 % de taux de clic, position moyenne 6,0.

#### Où va le trafic

| Section | Pages qui ressortent | Impressions | Clics | Taux de clic | Clics par page |
|---|---|---|---|---|---|
| Accueil | 1 | 3 641 | **315** | 8,7 % | **315** |
| Guides | 5 | 1 930 | 190 | 9,8 % | **38** |
| Cartes | 310 | 3 127 | 307 | 9,8 % | 0,99 |
| Tier list | 1 | 255 | 19 | 7,5 % | 19 |
| Légendes | 29 | 365 | 35 | 9,6 % | 1,21 |
| Articles | 15 | 402 | 21 | 5,2 % | 1,40 |
| Decks | 873 | 2 466 | 105 | 4,3 % | **0,12** |
| Tournois | 25 | 163 | 4 | 2,5 % | 0,16 |

Cinq guides rapportent 190 clics. 873 pages de decks en rapportent 105. Un guide vaut trois cents pages de deck.

#### La cannibalisation n'a pas bougé, et j'avais mal visé le remède

| Requête | Impressions | Position | Page servie | Le hub dédié est à |
|---|---|---|---|---|
| riftbound deck | 297 | 8,6 | **accueil** | `/decks` : position 13,5 |
| deck riftbound | 267 | 9,2 | **accueil** | `/decks` : position 13,5 |
| tier list riftbound | 234 | 3,6 | **accueil** | `/tier-list` : position 8,0 |
| riftbound tier list | 172 | 3,9 | **accueil** | `/tier-list` : position 8,0 |

Les titres et les H1 de `/decks` et `/tier-list` sont pourtant bons, je les ai relus : « Decks Riftbound - Decklists compétitives », « Tier List Riftbound FR - Meilleures Légendes ». Le conseil du 21 juillet, corriger les titres, était donc à côté.

La vraie cause est dans la page d'accueil : elle affiche la tier list en entier et un bloc « Decks à la une ». Google y trouve la réponse complète, la sert, et n'a aucune raison d'aller chercher le hub. Ce n'est pas une erreur de balise, c'est du contenu en double.

Deux sorties possibles, et il faut choisir :

- **Assumer l'accueil comme destination.** Elle est en position 3,6 sur « tier list riftbound » quand `/tier-list` est à 8,0. Elle gagne. On garde, et on travaille son taux de clic.
- **Vider l'accueil de la tier list**, la remplacer par un aperçu de trois lignes et un lien. Le hub récupère alors le classement, mais on perd le confort d'affichage voulu au départ, et il y a plusieurs semaines de flottement le temps que Google réévalue.

Sur les chiffres, la première option est la plus sûre : la position 3,6 rapporte déjà 18 clics, quand la position 8,0 du hub n'en rapporte que 19 sur cinq fois moins d'impressions. Mon avis : garder l'accueil, arrêter d'essayer de la contrer.

Le cas de `/decks` est différent. Là, l'accueil est à 8,6-9,2 et ne convertit pas (6 clics pour 297 impressions). Personne ne gagne. Le bloc « Decks à la une » de l'accueil montre quelques listes au hasard, sans intérêt pour qui cherche « riftbound deck » ; le hub, lui, a la recherche, les filtres et les 22 000 listes. Ici, il faut couper le doublon.

#### Ce qui plafonne faute de page

Requêtes qui rapportent des impressions et zéro clic :

| Requête | Impressions | Position |
|---|---|---|
| decklist riftbound | 46 | 8,5 |
| riftbound decklist | 42 | 6,1 |
| star crossed riftbound | 34 | 7,9 |
| riftbound premier pas | 29 | 12,5 |
| swain riftbound | 26 | 6,4 |
| tier list legend riftbound | 21 | 9,7 |
| deck leblanc | 16 | 6,7 |
| ocean drake riftbound | 15 | 5,2 |
| deck irelia | 12 | 6,7 |

Le motif est net : **nom de champion + deck**. Swain, LeBlanc, Irelia, chacun à quelques dizaines d'impressions, aucun clic. Ces gens cherchent une page « decks Swain », et le site n'en a pas : `/decks?legend=Swain...` n'est pas indexable, et `/legendes/swain-...` parle de la Légende, pas de ses decks. C'est le seul gisement de contenu identifiable dans les données, et il est mécanique : une page par Légende, une trentaine de pages.

### GA4, trafic organique, 5 juillet au 1er août

325 sessions, 239 visiteurs, 2 187 pages vues, 12 sessions par jour.

| Page d'entrée | Sessions | Engagement |
|---|---|---|
| `/` | 73 | 69,9 % |
| `/cartes` | 73 | 63,0 % |
| `/guides/debuter` | 24 | 50,0 % |
| `/guides/glossaire` | 19 | 21,1 % |
| `/decks` | 18 | 55,6 % |
| `/tier-list` | 10 | 40,0 % |
| `/guides/deckbuilding` | 9 | 22,2 % |

`/cartes` rattrape l'accueil. Le glossaire et le guide de deckbuilding retiennent mal (21 % et 22 % d'engagement) : les gens arrivent, lisent une définition, repartent. C'est normal pour un glossaire, moins pour un guide de deckbuilding qui devrait mener vers des decks.

**Même réserve que le mois dernier** : plusieurs pages comptent plus de sessions que de visiteurs distincts, avec 100 % de rebond. `/decks/best-of-atlanta-annie-dark-child` fait 8 sessions pour 1 visiteur. C'est du robot ou du rechargement. Le trafic humain est un peu sous les 325.

### Indexation : 6 % du sitemap est connu de Google

Le sitemap déclare **23 692 URL**, dont 22 457 pages de decks et 1 067 pages de cartes. Sur 28 jours, **1 417 pages** obtiennent au moins une impression, soit 6 %.

J'ai inspecté 28 URL auprès de Google. Les dix pages structurantes (accueil, `/cartes`, `/decks`, `/tier-list`, `/tournois`, les guides, un article, une Légende, un best-of) sont **toutes indexées, toutes en canonique correcte, aucune erreur d'exploration**. De ce côté, rien à signaler.

Sur un échantillon tiré au sort dans le reste :

| Type | Indexées | Inconnues de Google |
|---|---|---|
| Pages de decks | 3 | 9 |
| Pages de cartes | 3 | 3 |

Google connaît environ un quart des pages de decks. Ce n'est pas un bug, c'est un arbitrage de sa part : 22 000 listes qui se ressemblent, pour un site jeune, il en prend un échantillon et ignore le reste. Les pages de cartes s'en sortent mieux, mais la moitié seulement.

**Ce que ça coûte :** l'exploration passe sur des milliers de pages qui rapportent 0,12 clic chacune, pendant que les pages de cartes, à 1 clic chacune, sont indexées à moitié. C'est du budget d'exploration déplacé au mauvais endroit.

Je ne recommande pas de supprimer les pages de decks : elles servent aux joueurs, elles sont liées depuis les pages de tournoi, et elles ne pénalisent pas le site. Mais **elles n'ont rien à faire dans le sitemap à 22 000 exemplaires**. Un sitemap qui ne déclare que les pages qui comptent (cartes, Légendes, guides, articles, tournois, best-of, soit ~1 300 URL) dirige l'exploration là où elle rapporte.

#### Résidu www

73 URL en `www.` apparaissent encore dans les résultats (246 impressions, 15 clics). La redirection est pourtant bonne : `https://www.riftboundfrance.fr/cartes` renvoie un **308** vers l'apex. Ce sont de vieilles entrées qui n'ont pas encore été remplacées. Rien à faire, ça s'efface tout seul.

### Où en sont les actions du 21 juillet

| Action | État |
|---|---|
| Capter « riftbound deck » sur `/decks` | **Non faite.** Titre et H1 corrects, mais l'accueil garde la position. Voir le diagnostic revu ci-dessus. |
| Pages de decks par Légende | **Non faite.** Aucune route `/decks/legende/...`. Le besoin est confirmé par les données. |
| Recherche texte sur `/decks` | **Faite.** Champ « Chercher un deck, une Légende, un joueur ou une carte » en place. |
| Désambiguïser `/tier-list` | **Faite côté balises, sans effet.** Le problème était ailleurs. |
| Continuer les best-of de tournoi | **Faite.** Le best-of de Hartford fait 7 clics pour 73 impressions ; le National Open S3 est publié. |
| Activer l'API Chrome UX Report | **Sans objet.** PageSpeed livre les données terrain sans elle. |

### Actions priorisées

1. **Haute — Une page de decks par Légende**, en URL propre (`/decks/legende/swain-...`), avec les meilleures listes de la Légende, son taux de présence et un lien vers sa fiche. Une trentaine de pages. C'est la seule demande visible dans les données qui n'a aucune page pour y répondre : Swain, LeBlanc, Irelia et compagnie cumulent une centaine d'impressions à zéro clic, en position 6-7. *Comment savoir si ça échoue :* si dans six semaines ces requêtes n'ont toujours aucun clic, c'est que les pages sont trop minces et il faudra y mettre du texte, pas seulement des listes. *À surveiller :* les clics de la section Légendes dans Search Console, aujourd'hui à 35.

2. **Haute — Retirer « Decks à la une » de l'accueil**, remplacé par un lien vers `/decks`. L'accueil est à 8,6 sur « riftbound deck » et ne convertit pas ; le hub, mieux armé, est bloqué à 13,5 derrière elle. Contrairement à la tier list, il n'y a rien à perdre : le bloc affiche des listes au hasard. *Comment savoir si ça échoue :* si `/decks` ne remonte pas au-dessus de la position 10 en six semaines, le doublon n'était pas la cause et il faudra chercher du côté des liens entrants. *Dépend de rien, à faire en premier.*

3. **Haute — Laisser la tier list sur l'accueil.** C'est un renoncement à l'action 4 du 21 juillet, pas un oubli. L'accueil est en position 3,6 sur ces requêtes, le hub en 8,0 : la déloger coûterait des places. À la place, soigner ce qui s'affiche dans Google pour l'accueil, puisque c'est elle qui reçoit la demande.

4. **Moyenne — Sortir les 22 457 pages de decks du sitemap**, ne garder que les cartes, Légendes, guides, articles, tournois et best-of. L'exploration se concentre sur ce qui rapporte. Les pages de decks restent en ligne et liées depuis les tournois. *Comment savoir si ça échoue :* si les impressions de la section Decks s'effondrent au-delà de la baisse attendue, remettre les best-of et les listes de Top 8 dans le sitemap. *À surveiller :* le taux d'indexation des pages de cartes, aujourd'hui à la moitié.

5. **Moyenne — Rattacher le guide de deckbuilding aux decks.** 22 % d'engagement, 9 sessions : les gens le lisent et repartent. Des liens en fin de guide vers des decks qui illustrent chaque principe le raccrocheraient au reste du site.

6. **Basse — Continuer les best-of de tournoi.** Le format tient : 9,8 % de taux de clic sur la section Articles et Guides, contre 4,3 % sur les decks bruts.

Rien à faire côté performance ni côté indexation des pages principales. Ces deux chantiers sont finis.

### Notes de fraîcheur et limites

- Search Console : décalage de 2 à 3 jours, d'où une fenêtre qui s'arrête au 30 juillet.
- Les tableaux par requête reposent sur la vue requête × page, qui écarte les recherches anonymisées : 226 clics visibles sur 997 réels. Les positions et le classement relatif restent justes, les volumes sont des minimums.
- Données terrain Chrome : moyenne glissante sur 28 jours, tous appareils confondus.
- Lighthouse : une seule mesure de laboratoire sur réseau simulé. En cas de contradiction avec le terrain, le terrain a raison.
- L'API Chrome UX Report seule renvoie toujours 403 (non activée sur le projet Google Cloud). Sans conséquence : PageSpeed sert les mêmes données.
- Taux d'indexation : estimé sur 18 URL tirées au sort. Ordre de grandeur, pas mesure exacte.
- GA4 : à lire avec la réserve sur les sessions sans visiteur distinct.


---

# 29 juillet 2026 — Audit d'interface (skills better-*)

> Source d'origine : `AUDIT-INTERFACE-29JUIL-2026.md`

## Audit d'interface, 29 juillet 2026

Revue complète du site avec les skills `better-*` et `make-interfaces-feel-better`,
puis correction. **82 fichiers modifiés, +672 / -576.** Rien n'est poussé : tout est
en local sur `main`.

**Tous les points de la liste « reste à faire » ont été traités**, sauf trois écartés
avec raison (voir la dernière section).

### Méthode

Deux balayages automatisés avec Playwright, plus un balayage des pages authentifiées.

**Balayage 1** — 29 routes à 390px et 1280px, soit 58 pages. Contraste WCAG 2 AA (avec
mélange alpha des fonds semi-transparents), débordement horizontal, zones tactiles
(WCAG 2.5.8 avec l'exception d'espacement et l'exception « lien en ligne »), plan des
titres, images sans `alt`, contrôles sans nom accessible, champs sans étiquette.

**Balayage 2 (profond)** — 26 routes à 768px, 1024px et 640px (soit 1280px à 200% de
zoom), 78 pages. Erreurs console et JS, requêtes en échec, liens internes morts,
`id` en double, références `aria` cassées, images sans dimensions, `tabindex` positif,
landmarks, métadonnées, liens vides, troncature sans valeur complète, longueur de ligne.

**Balayage 3 (authentifié)** — 11 routes à 390px et 1280px, soit 22 pages : `/profil`,
`/collection`, un classeur partagé, le deckbuilder et **les 7 pages `/admin`**, avec un
faux utilisateur local (`scripts/seed-test-user.mts`, refuse de tourner si
`DATABASE_URL` ne pointe pas sur localhost ; `--admin` pour le rôle administrateur,
`--clean` pour tout supprimer).

Scripts dans le dossier de travail temporaire : `sweep.mjs`, `deep.mjs`, `sweep-auth.mjs`.

| Passe | Pages avec constat |
| --- | --- |
| Avant correction | 27 / 58 |
| Après le premier lot | 14 / 58 |
| Après le deuxième lot | 6 / 58 |
| Ajout du contrôle « champ sans étiquette » | 20 / 58 |
| **État final, site public** | **2 / 58** |
| **État final, pages authentifiées et admin** | **0 / 22** |

Les 2 restantes sont `/profil` aux deux largeurs, qui redirige vers la page OAuth de
Discord. Le 1,12:1 et le `h1` manquant sont chez Discord, pas chez nous. Avec le faux
utilisateur, `/profil` et `/collection` ressortent **OK**.

### Vérifications

| Contrôle | Résultat |
| --- | --- |
| `npx tsc --noEmit` | EXIT=0 |
| `npm run build` | « Compiled successfully in 9.7s », EXIT=0 |
| `npx vitest run` | **22/22**. L'échec restant était dans `collection.test.ts`, pas `piltover-import` : le test attendait des clés à tiret (`"falling-star"`) que `nameKey` n'a jamais produites, il génère des espaces (`"falling star"`). Les deux côtés du calcul de couverture utilisent la même fonction, donc c'est le test qui était faux. Corrigé et commenté |
| Contraste, 58 pages | 0 échec hors page Discord |
| Débordement horizontal, 58 pages | 0 |
| Zones tactiles, 444 cibles à 390px | 0 échec |
| Noms accessibles et étiquettes de champ | 0 contrôle anonyme |
| Anneau de focus clavier | `outline: 2px solid rgb(14,165,233)`, décalage 2px |
| Liens internes | **400 testés, 0 mort** |
| `id` en double, `tabindex` positif, `<main>` unique, liens vides | 0 sur les 78 pages |
| Décalage de mise en page (images) | 0 risque réel sur 936 images de `/tournois` |
| Pages authentifiées et admin | **22/22 OK** |

Non vérifié : lecteur d'écran réel sur les modales, rendu macOS du lissage de police.

---

### 1. Couleurs

#### Tokens (`src/app/globals.css`)

Méthode : luminosité relevée dans l'espace OKLCH, **teinte et saturation inchangées**,
jusqu'à atteindre 4,5:1 sur `surface-raised` (#2c2c34), le fond le plus clair où ces
couleurs servent de texte.

| Token | Avant | Après | Contraste |
| --- | --- | --- | --- |
| `--color-ink-muted` | `#64748b` | `#8596ae` | 2,91 → 4,6 |
| `--color-tier-a` | `#ef4444` | `#ff5c58` | 3,68 → 4,56 |
| `--color-tier-b` | `#8b5cf6` | `#a77bff` | 3,27 → 4,56 |
| `--color-tier-d` | `#6b7280` | `#949aa6` | 2,83 → 4,84 |
| `--color-rarity-epic` | `#8b5cf6` | `#a77bff` | 3,27 → 4,52 |
| `--color-rarity-legend` | `#ef4444` | `#ff5c58` | 3,68 → 4,51 |
| `--color-domain-fury` | `#ef4444` | `#ff5c58` | 3,68 → 4,56 |
| `--color-domain-mind` | `#3b82f6` | `#4b93ff` | 3,76 → 4,56 |
| `--color-domain-chaos` | `#8b5cf6` | `#a77bff` | 3,27 → 4,56 |
| `--color-domain-sorcery` | `#ec4899` | `#fa55a5` | 3,92 → 4,55 |

Calme, Corps, Ordre, tier S, tier C et les autres raretés passaient déjà : inchangés.

`src/lib/domains.ts` : `DOMAIN_COLORS` aligné sur ces valeurs (commentaire ajoutant la
contrainte de synchronisation avec les tokens CSS).

#### Libellés sur remplissage de marque

Choix retenu (arbitré avec toi) : **garder la palette vive, passer le libellé en encre
sombre**. L'autre option, assombrir les fonds, faisait virer l'or au brun.

| Fond | Blanc avant | Encre après |
| --- | --- | --- |
| `bg-arcane` #0ea5e9 | 2,77 | 6,14 |
| `bg-gold` #f59e0b | 2,15 | 7,92 |
| `bg-emerald-500/600` | 2,54 | 6,71 |
| `bg-red-500`, `bg-blue-500`, `bg-amber-600` | 2,4 à 3,8 | 4,5+ |

- `text-white` → `text-canvas` sur **90 lignes** portant un de ces remplissages.
- `bg-violet` → `bg-violet-dark` sur **20 lignes** (blanc conservé, 5,70) : le violet
  #8b5cf6 échoue dans les deux sens, seul cas.
- `hover:bg-arcane-dark` → `hover:bg-arcane-light` sur 6 boutons : au survol, l'encre
  sombre tombait à 4,20 sur l'arcane foncé.

#### Cas trouvés seulement par le balayage complet

| Page | Problème | Correction |
| --- | --- | --- |
| `/deckbuilder` | 118 onglets `bg-arcane/90` + blanc, 3,26:1 | `text-canvas`, `card-browser.tsx:125` |
| `/guides/meta` | Pastilles de tier S/A/B/C en blanc, 2,15 à 3,65 | `text-canvas`, `page.tsx:134` |
| `/tournois` | Mêmes pastilles, 2,15 et 2,77 | `text-canvas`, `tournament-list.tsx:177` |
| `/meta` | « Tier A/B/C/D » sur fond de la même teinte, 3,78 à 4,12 | Fond neutre, `meta-filters.tsx:19` |
| `/guides/deckbuilding` | Ronds numérotés blancs sur vert/bleu/orange/rouge, 2,28 à 3,76 | `text-canvas`, `page.tsx:106` |
| `/guides/jouer-en-ligne` | Étapes numérotées blanches, 2,77 et 4,23 | `text-canvas` + accent violet éclairci en `#a78bfa` |
| `/guides/domaines`, `/guides/debuter` | **Palette de domaines dupliquée en dur**, restée sur les anciennes valeurs | Les deux fichiers importent maintenant `DOMAIN_COLORS` |

#### Pastilles de domaine

Le fond teinté sous un texte de la même teinte enfreint ta règle et coûtait du
contraste (4,32:1 mesuré). Remplacé par `bg-surface-raised` + texte coloré dans :
`decklist-interactive.tsx` (2), `deckbuilder/components/deck-panel.tsx`,
`decks/compare/deck-compare.tsx`, `deckbuilder/components/card-detail-modal.tsx`
(bord teinté retiré aussi), `legendes/[slug]/page.tsx`.

`DOMAIN_BG` dans `lib/domains.ts` : **supprimé**. Code mort qui portait ce motif.

#### Encre désactivée sur du contenu réel

`text-ink-disabled` (2,06:1) servait à de vrais textes. Passé à `text-ink-muted` dans
`footer.tsx`, `a-propos/page.tsx`, `glossaire-client.tsx`, `deck-panel.tsx`,
`profile-actions.tsx`. Le token reste pour la seule pastille vraiment inactive.

Petit texte violet : `text-violet` → `text-violet-light` sur 32 occurrences (3,69 → 5,78).

---

### 2. Accessibilité

#### Anneau de focus clavier

`focus:outline-none` sur **40 contrôles écrits à la main** (20 fichiers) écrasait
l'anneau global défini dans `globals.css`. Classe retirée partout. Les composants
shadcn ont leur propre anneau `focus-visible`, ils n'ont pas été touchés.

#### Modales

Trois modales n'avaient ni `role="dialog"`, ni Escape, ni piège de focus, alors que le
hook `useDialogA11y` existait déjà dans le projet :

- `decklist-interactive.tsx` : `MobileCardModal` et `ExportPanel`
- `deckbuilder.tsx` : liste des decks sauvegardés, extraite dans un composant
  `SavedDecksModalShell` pour que le hook se monte avec la modale et pas avec la page

#### Noms accessibles

`aria-label` (et `aria-pressed` quand c'est un état) ajoutés sur :

| Fichier | Contrôle |
| --- | --- |
| `decklist-interactive.tsx` | Croix de fermeture, bascules grille/liste/statistiques (deux jeux, compact et normal) |
| `deckbuilder.tsx` | Fermer la modale, supprimer un deck sauvegardé, vider le deck |
| `card-browser.tsx` | Voir le détail de la carte |
| `point-tracker.tsx` | Ajouter / retirer un point de départ |
| `pagination.tsx` | Page précédente, page suivante, `aria-label` sur le `<nav>` |

#### Zones tactiles

- `footer.tsx` : liens de 16px de haut, cercles de 24px qui se chevauchaient.
  `py-1` sur chaque lien, mesuré à 24px.
- `glossaire-client.tsx:181` : renvoi « Voir aussi » de 20px, passé à `py-1`.

#### Mouvement réduit

`globals.css` : bloc `@media (prefers-reduced-motion: reduce)` hors `@layer` et en
`!important`, pour passer devant les utilitaires Tailwind. Le site n'en avait aucun.

#### Plan des titres

Cinq pages sautaient un niveau. Les `h4` venaient de composants partagés embarqués
sous des contextes différents.

- Micro-libellés de panneau (« Courbe d'énergie », « Répartition par type »,
  « Statistiques ») → `<p>` : ils étiquettent un widget, pas une section.
  Fichiers : `deck-stats-panel.tsx` (3), `deck-panel.tsx`, `deck-stats.tsx`.
- Aperçu de carte au survol → `<p>` : ce n'est pas une section du document.
- Titres de section de decklist (« Deck Principal », « Runes »…) → `h2`.
- Titre du bloc decklist → `h2` (suivait directement le `h1` de la page deck).
- `deck-panel.tsx:250` « Deck » → `h2`. `deckbuilder.tsx` titre de modale → `h2`.
- `guides/debuter:178` et `guides/deckbuilding:155,253` → `h3`.

---

### 3. Structure

| Page | Problème | Correction |
| --- | --- | --- |
| `/decks/[slug]` | Page large de 412px sur un écran de 320 | `min-w-0` sur la cellule de grille : sans lui, `truncate` ne s'applique pas |
| `/tier-list` | Barre de 4 onglets à 412px | `flex-wrap` + `max-w-full` + `px-4` |

---

### 4. Polish

#### Coupure des lignes

`globals.css` : `h1-h4 { text-wrap: balance }`, `p, li, figcaption, blockquote
{ text-wrap: pretty }`. Aucun usage sur tout le site avant.

#### Transitions

`transition-all` : **50 occurrences, 22 fichiers, ramenées à 0**. 33 lignes qui
n'animaient que des couleurs → `transition-colors`. 17 qui touchent aussi ombre,
opacité ou transform → `transition` nu (la liste Tailwind par défaut, pas `all`).

#### Contours d'images

`card-image.tsx` : `outline outline-1 -outline-offset-1 outline-white/10` sur les deux
branches de rendu. Blanc pur à 10%, jamais un neutre teinté qui salirait le bord.

#### Arrondis

`--radius-game-card` : `8px` → `0px`, à ta demande. Un seul point, les 10 usages de
`rounded-game-card` suivent. Les panneaux d'interface (`--radius-card: 12px`) n'ont
pas bougé.

#### Chiffres et pluriels

- `binder-explorer.tsx:279` : `tabular-nums` sur le compteur de quantité, seul
  compteur vraiment dynamique qui en manquait.
- `deck-coverage-panel.tsx:87` : `carte(s)` → pluriel conditionnel.

---

### 5. Textes

| Fichier | Avant | Après |
| --- | --- | --- |
| `decks/page.tsx:596` | « Recent » | « Récents » |
| `ui/dialog.tsx:75`, `ui/sheet.tsx:75` | « Close » | « Fermer » |
| `deck-legend-filter.tsx:43` | « Toutes les legendes » | « Toutes les Légendes » |
| `glossaire-client.tsx:53` | Catégorie « Timing » sur violet chaos | `bg-violet-dark`, le violet échouait dans les deux sens |

---

### Envisagé puis écarté

| Candidat | Raison |
| --- | --- |
| Retour tactile `scale(0.96)` au clic | **Essayé puis retiré.** `@layer base` perd contre les utilitaires : le `transition-property: scale` était écrasé par `transition-colors`, le scale sautait sans animation. Le sortir de la couche tuait les transitions de couleur de tous les boutons ; lister toutes les propriétés revenait à réécrire `transition-all`. À faire proprement en ajoutant `active:scale-[0.96] transition-transform` aux CTA principaux |
| 209 `style={{ fontFamily: "var(--font-rubik)" }}` en ligne | La classe `font-display` existe et fonctionne (vérifié). Gros diff mécanique, zéro changement visible |
| Trait des icônes lucide à 1,5 à côté du texte régulier | La majorité des icônes bordent du semibold ou du bold, où 2 est correct. Une seule épaisseur par surface est déjà respectée |
| Rayons imbriqués concentriques | Mesurés au DOM : le seul écart est une pastille `rounded-full` contenant un drapeau. Une pastille n'entre pas dans ce calcul |
| Remplacer les bordures par des ombres | `--color-hairline` sert aussi de séparateur de liste et de bord de tableau, que le skill exclut. Séparer les deux rôles demanderait un second token pour un gain nul en thème sombre |
| `will-change` sur les cartes qui zooment | 0 usage, aucun saccadement observé. À n'ajouter qu'après constat |
| Réduire les `hover:scale-105/110` | Vignettes d'images, pas des interactions haute fréquence. Le bloc mouvement réduit les neutralise déjà |
| Remplacer `window.alert` du partage de classeur par un toast | Construire un système de notifications dépasse un audit d'interface |
| Réduire la mesure des articles à 65 caractères | Ta consigne « élargir les guides » prime |

---

### 6. Trouvé par le balayage profond et par le faux utilisateur

Ces points n'étaient visibles ni à l'œil, ni par le premier balayage.

| Gravité | Emplacement | Problème | Correction |
| --- | --- | --- | --- |
| HIGH | `app/meta/page.tsx:13` | `unstable_cache` mettait en cache les **21 000 lignes de decks brutes, 3,9 Mo**. Au-delà de 2 Mo, Next refuse d'écrire et lève un `unhandledRejection` : le cache ne servait **jamais** et la page rejouait toute la requête à chaque visite | Agrégation faite **dans** la fonction cachée, le payload tombe à quelques kilo-octets. `createdAt` n'est plus chargé sur 21 000 lignes ; la date affichée vient de la tier list courante |
| HIGH | `app/decks/page.tsx:663` | `style={{ backgroundColor: 'var(--color-tier-...)' }}` : avec `@theme inline`, Tailwind **n'émet pas** ces variables. Le fond du badge était transparent depuis toujours, le texte blanc le masquait | Table de classes littérales `TIER_BG`. Mesuré : `--color-tier-s` renvoyait bien une chaîne vide |
| MEDIUM | `components/navbar.tsx:120` | `aria-controls="mobile-menu"` pointait dans le vide **sur toutes les pages** : le panneau n'existe dans le DOM que lorsqu'il est ouvert | Attribut retiré, `aria-expanded` suffit |
| MEDIUM | `app/api/collection/route.ts:8` | Le provider interroge cette route sur **chaque page** ; un visiteur non connecté recevait un 401, journalisé en erreur par le navigateur partout | 200 avec un marqueur `anonymous` pour la lecture globale. Le 401 reste pour un classeur précis et pour toute écriture |
| MEDIUM | 9 pages | Champs de formulaire sans étiquette accessible : recherche de cartes, du glossaire, des tournois, du best-of, filtre de Légende, filtres du méta, tri du deckbuilder, nom du deck, classeur, réponse aux commentaires, noms de joueurs du compteur | `aria-label`, ou `htmlFor`/`id` là où une étiquette visible existait déjà (`/decks/compare`) |
| LOW | `navbar.tsx:57`, `footer.tsx:32` | `width`/`height` du logo donnaient un ratio 3:1 et 2,86:1 pour un fichier en 2:1 → avertissement Next sur chaque page | Ratio réel 224×112 |

### 7. Cohérence des deux tier lists

Signalé par Allan. L'accueil et `/tier-list` avaient **chacun leur table de couleurs**,
avec des opacités différentes (`/80` sur `/tier-list`) et des lettres blanches d'un
côté, sombres de l'autre après la correction de contraste.

- Nouveau fichier `src/lib/tier-colors.ts` : `TIER_BANNER` et `TIER_ORDER`, source
  unique consommée par les deux composants.
- Vérifié après coup : couleurs identiques, et même contenu des deux côtés
  (S=3, A=6, B=8, C=13, D=10, onglet UNL actif).
- À noter, différence volontaire conservée : l'accueil abrège les onglets
  (OGN / SFD / UNL / ALL), `/tier-list` les écrit en entier. La carte de l'accueil
  est trop étroite pour les noms complets.

#### Zone qui défile sur la carte d'accueil

Signalé par Allan, à ne pas reproduire. La carte avait `h-[420px] overflow-y-auto`
pour 594px de contenu, donc une barre de défilement interne. La hauteur fixe existait
pour éviter que la carte grandisse au changement d'onglet et pousse toute la ligne
de la grille.

Les deux contraintes sont maintenant tenues sans compromis : les quatre onglets sont
empilés dans **la même cellule de grille**, seul l'actif est visible (`invisible` sur
les autres, ce qui les sort aussi de l'ordre de tabulation et de l'arbre
d'accessibilité). Les onglets inactifs restent dans le flux et fixent la hauteur sur
le plus grand. Leurs vignettes sont des blocs vides de même taille, donc **aucune
image supplémentaire n'est téléchargée**.

Mesuré après correction : **0 élément qui défile** sur la page, et **729px de hauteur
de carte sur les quatre onglets**, sans saut au clic.

### 8. Pages admin (balayées grâce au faux utilisateur)

Jamais mesurées avant, elles portaient de vrais défauts.

| Gravité | Emplacement | Problème | Correction |
| --- | --- | --- | --- |
| HIGH | `admin/tier-list/tier-list-editor.tsx:38` | **Quatrième** table de couleurs de tier : S en ambre, A en rouge, B en violet, C en bleu ciel. L'éditeur ne montrait donc pas les couleurs du site. Contraste jusqu'à **2,13:1** | Utilise `TIER_BANNER` partagé |
| HIGH | `admin/layout.tsx:20` | Barre latérale figée à 240px + `p-8` : la page faisait **722px de large sur un écran de 390px** | Colonne sur mobile, deux colonnes à partir de `md`, `min-w-0` sur le contenu |
| MEDIUM | `admin/decks/page.tsx:354,358` | Ligne d'en-tête et onglets sans retour à la ligne, débordement de 20px | `flex-wrap` sur les deux |
| MEDIUM | `admin/tier-list`, `admin/decks/import`, `admin/decks`, `block-editor.tsx` | 15 champs de formulaire sans étiquette accessible, alors qu'une étiquette visible existait juste au-dessus | `aria-label` dérivé du texte de l'étiquette |
| MEDIUM | `admin/tier-list/tier-list-editor.tsx:373` | Boutons de déplacement de tier : 20×16px, sous le minimum, et lettre blanche à 10px sur fond de tier (2,13:1) | 24×24px, et lettre colorée sur fond neutre via un nouveau `TIER_TEXT_CLASS` |
| LOW | `admin/decks/import/page.tsx:90` | Flèche de retour sans nom accessible | `aria-label="Retour aux decks"` |
| LOW | `admin/tier-list/tier-list-editor.tsx:400` | `h1` puis `h3` | `h2` |

**Résultat : 22/22 pages authentifiées et admin OK.**

Note : les couleurs de tier existaient en **quatre** exemplaires (accueil, `/tier-list`,
éditeur admin, tokens `--color-tier-*`). Il en reste deux, chacune avec un rôle
distinct et documenté dans `src/lib/tier-colors.ts` : `TIER_BANNER` pour les bandeaux,
`TIER_TEXT_CLASS` / `--color-tier-*` pour la lettre en texte sur fond neutre.

### Reste à faire

Tout est traité, sauf trois points écartés avec raison :

1. **Retour tactile `scale(0.96)` au clic** : une règle CSS globale ne peut pas être
   fluide sans écraser les transitions de couleur des boutons (essayé, retiré, voir la
   section « Envisagé puis écarté »). À ajouter au cas par cas sur les CTA principaux
   avec `active:scale-[0.96] transition-transform`.
2. **Longueur de ligne** mesurée entre 96 et 139 caractères sur les guides et les
   articles, contre 60-75 recommandés. **Laissé tel quel** : ta consigne « élargir
   les guides, éviter `max-w-3xl` » prime sur la règle typographique.
3. **Troncature sans valeur complète** : jusqu'à 337 éléments tronqués sans `title`
   sur `/decks` à 640px. Ajouter un `title` partout serait lourd ; la plupart sont des
   noms de deck dont la page cible porte le nom complet. **À trancher par toi.**

Et un point hors de ma portée : **lecteur d'écran réel** sur les trois modales
corrigées.

**Trait des icônes lucide** : finalement laissé à 2. Mesuré, la grande majorité des
icônes borde du texte semibold ou bold, où 2 est la bonne épaisseur ; une seule
épaisseur par surface est déjà respectée. Passer à 1,5 aurait dégradé plus de cas
qu'il n'en aurait corrigé.

**209 `style={{ fontFamily: var(--font-rubik) }}` en ligne** : laissés. La classe
`font-display` existe et fonctionne (vérifié), mais le remplacement est un gros diff
mécanique pour zéro changement visible, et chaque occurrence demande de fusionner un
`style` dans un `className` existant, ce qui n'est pas automatisable sans risque.

**Faux utilisateur** : supprimé après le balayage
(`npx tsx scripts/seed-test-user.mts --clean`). Le script reste dans le dépôt pour
refaire un balayage authentifié plus tard.

### Faux positifs écartés après vérification

- **Images sans `width`/`height`** : 94 signalées sur `/tournois`. Mesure réelle sur
  les 936 images de la page : **0 risque de décalage**, les classes `h-4 w-4` etc.
  réservent déjà la place. Aucun fichier touché.
- **`/profil` à 1,12:1 et sans `h1`** : c'est la page OAuth de Discord après
  redirection, pas une page du site.
- **`transition-property: all` sur 4 293 éléments** : c'est la valeur initiale CSS de
  la propriété, pas une classe `transition-all`.


---

# 27 juillet 2026 — Visuels et audits

> Source d'origine : `docs/RAPPORT-2026-07-27-visuels-et-audits.md`

## Rapport du 27 juillet 2026 — visuels réseaux, audits de données

### Ce qui est en ligne

Quatre commits poussés sur `main`, de `310b14cf` à `5da09455`.

#### Visuels de tier list (1600x1600)

`scripts/gen-tierlist-image.mts`, deux sets rendus : Armes spirituelles et
Déchaînement. Ce qui a changé par rapport à la version précédente :

- maquette dessinée en 1000 px, rendue en 1600 par `html { zoom }` : tout est
  rasterisé à la taille finale, rien n'est agrandi après coup ;
- les tiers de plus de huit Légendes passent sur deux rangées de taille égale, ce qui
  fait des icônes de 85 px au lieu de 57, toutes identiques, sans orphelin en bout de
  ligne ;
- alignement à gauche partout : l'ordre à l'intérieur d'un tier veut dire quelque
  chose ;
- couleurs chaud vers froid (S rouge, A orange, B jaune, C vert, D bleu) : le
  classement se lit sans relire les lettres ;
- verre et ombres conservés, halos colorés retirés — ils faisaient image générée ;
- noms de set en français, numéro de saison en sur-titre ;
- ligne de crédibilité en bas : « 33 tournois · 9 555 résultats · du 22/03 au 19/07 »,
  lue dans `data/tier-source-counts.json` qu'écrit `scripts/tier-unleashed.py` ;
- un fichier `-alt.txt` par visuel, à coller dans l'alt du tweet : le contenu d'une
  image n'est pas indexable.

On parle de **résultats** et non de decklists : les tiers sont calculés sur les
classements complets (rang + Légende), et tous les joueurs classés ne publient pas
leur liste — Hartford n'en a que 142 sur 1 659.

#### Images de deck (2000x2000)

L'export du site, `GET /api/decklist-image?slug=`, passe de 1000 à 2000 px. La mise
en page ne bouge pas, toutes ses dimensions sont doublées. À 1000 px le texte des
cartes devenait illisible après la recompression de X.

Neuf decks sortis avec cet export, dans `content/tweets/images/decks/` : trois par
set, Légendes toutes différentes, tous vainqueurs de tournoi, choisis par tier puis
par taille du tournoi.

| Set | Decks |
| --- | --- |
| Origines | Kai'Sa (Shanghai National Open) · Master Yi (Hangzhou RO) · Annie (Houston RQ) |
| Armes spirituelles | Draven (Las Vegas RQ) · Irelia (Shenzhen National Open S2) · Kai'Sa (Dalian RO) |
| Déchaînement | Irelia (National Open S3) · Master Yi (Hartford RQ) · Diana (Vancouver RQ) |

### Audits

#### Les tier lists tiennent

`scripts/audit-tier-lists.mts` compare les tiers publiés aux decks : part de méta,
conversion en top 8, Légendes jouées sans classement.

Le classement Déchaînement est rigoureusement aligné sur `scripts/tier-unleashed.py` :
le S regroupe les trois meilleures conversions à gros volume (Irelia 4,7 %, Diana
4,4 %, Yi 4,3 %), le A les six suivantes, le B tourne autour de la moyenne de 2,76 %,
le C passe dessous avec au moins un top 8, le D n'en a aucun. Origines et la Globale
sont cohérents aussi.

Seul point discutable : sur Armes spirituelles, quatre Légendes classées C convertissent
au-dessus de la médiane du set (Miss Fortune 3,4 %, Jax 3,0 %, Sett 2,8 %, Lux 2,4 %
contre 1,5 %). Sur deux à quatre top 8 chacune, c'est du bruit ; à surveiller au
prochain lot de tournois. Sur Origines, Darius est premier en conversion (5,1 %,
9 top 8 sur 177 decks) et classé B : le seul vrai candidat à une montée.

Contrôles annexes : aucun doublon, aucun tier hors S/A/B/C/D, aucune Légende jouée
sans classement, quatre tier lists à jour au 21 juillet, soit après le National Open.
Le générateur d'images refuse désormais de tourner si une Légende n'a pas d'icône —
il retombait sans rien dire sur celle d'Irelia.

#### Six tournois rangés sous le mauvais set

`src/lib/tournament-flags.ts` contredisait le `setTag` des decks. Le filtre par set du
site les classait donc au mauvais endroit.

| Tournoi | date | disait | corrigé en |
| --- | --- | --- | --- |
| RQ Bologna | 21/02 | Unleashed | Spiritforged |
| RQ Las Vegas | 01/03 | Unleashed | Spiritforged |
| Shenzhen National Open S2 | 22/03 | Unleashed | Spiritforged |
| RQ Lille | 18/04 | Unleashed | Spiritforged |
| RQ Atlanta | 29/04 | Unleashed | Spiritforged |
| Xi'an Regional Open S3 | 24/05 | Spiritforged | Unleashed |

Méthode : quatorze Légendes n'existent que dans Déchaînement. Sydney en compte douze
sur trente-six decks, Lille zéro sur soixante-sept, Atlanta zéro sur cent
vingt-quatre, Shenzhen zéro sur deux mille quarante et un.

Au passage, le chevauchement des périodes entre sets est réel et ne vient pas de la
Chine : Sydney passe sur S3 dès le 22 mars, la Chine le 18 avril, et l'Europe et les
États-Unis finissent S2 jusqu'au 29 avril.

#### Tirets cadratins

Vingt-deux mille titres de deck étaient du type « Légende — Tournoi ». Le tiret
cadratin n'a rien à faire dans le contenu rendu. Corrigé **en local et en prod**
(22 433 et 22 416 titres, plus un commentaire de tier list de chaque côté), et les
onze scripts de seed qui le produisaient utilisent maintenant un point médian.

Six titres gardent un tiret des deux côtés : ce sont des pseudos de joueurs
(`DWT—神切—阿龙`), on n'y touche pas.

#### Master Yi : c'est le local qui avait dérivé

La base locale disait 69 Wuju Master, la prod 83. Le premier réflexe était de croire
la prod en retard. C'est l'inverse.

Le scrape brut `data/raw-scrapes/s3-xian-regional-open/` donne 11 Wuju Master et 54
Bladesman, et les JSON de `data/decklists/` concordent à 100 % avec lui. Seule la base
locale avait divergé : le commit `273442c9` avait basculé en Bladesman quatorze decks
qui jouaient réellement Wuju Master. Ils sont remis d'aplomb en local (11 à Xi'an,
2 aux Shenzhen City Challenges, 1 best-of), retour à 83 comme la prod.

**Rien n'a été écrit en prod sur ce point.** La seule écriture prod de la journée
reste la correction des tirets.

### Ce qui reste ouvert

- Confirmer que « Armes spirituelles » et « Déchaînement » sont bien les traductions
  officielles Riot : elles n'ont pas été vérifiées.
- Les crops des icônes de Légende ne sont pas homogènes (gros plans contre plans
  larges). C'est un travail sur les fichiers de `public/img/legend_icon/`.
- Écart de volume entre les bases : 22 456 decks en prod, 22 511 en local.
- Les neuf images de deck pèsent environ 4,5 Mo pièce, soit 40 Mo entrés dans le
  dépôt. À sortir du versionnement si la pratique se répète.

### Deux leçons de méthode

**L'outil existait déjà, deux fois.** Un générateur de visuel de deck a été écrit
puis jeté alors que `/api/decklist-image` faisait le travail ; un script de correction
Master Yi a été écrit alors que `scripts/fix-master-yi-from-sources.mts` existait. La
règle est inscrite en tête d'`AGENTS.md` : chercher l'outil avant d'en écrire un, ne
jamais deviner un format ou un chemin.

**Quand deux bases divergent, aucune n'est présumée juste.** On tranche par
`data/raw-scrapes/`, jamais par le raisonnement.


---

# 22 juillet 2026 — National Open + Vendetta + SEO

> Source d'origine : `docs/RAPPORT-2026-07-22-national-vendetta-seo.md`

## Rapport, 22 juillet 2026

National Open S3, règles Vendetta, pages Légendes, référencement, mise en prod.

### 1. National Open S3, de bout en bout

Le plus gros tournoi Unleashed jamais joué : 2 048 joueurs, le 19 juillet 2026.

- **Scrape** terminé à 2 032 pages sur 2 032 (drip + Firecrawl, deux comptes).
- **Conversion** : 1 957 decklists écrites. 75 pages refusées : 73 sans une seule
  carte, 2 où la ligne de légende affiche « Volibear, Furious » (un champion, pas
  une légende lisible). Rien n'est reconstitué.
- **Tier** inchangé : 9 555 decks classés, seuil de conversion 2,76 %. Le scrape
  complet confirme l'index, donc pas de re-seed du tier.
- **Cores de deckbuilding refaits** : ils avaient été calculés sur un scrape partiel
  et disaient faux. Corrigés sur le jeu complet (Irelia : Draven Audacious n'existe
  pas, c'était un artefact ; LeBlanc : Vi Peacekeeper reste au core ; ordre des
  champs de bataille inversé ; Master Yi : 82 % Tempered / 18 % Honed sur 307 listes).
- **Article** best-of du National créé, la meilleure liste de chacune des 40 Légendes,
  avec la couverture `S3-national.webp`.
- **Best-of** : 40 decks, vérifiés ligne à ligne contre la source, 0 écart.

### 2. Règles et ban list Vendetta (24 juillet 2026)

Source : annonces officielles + PDF FR du Rules Hub, rangés en texte cherchable dans
`data/meta-reports/regles-*-2026-07-16.txt` (le PDF de mars est marqué périmé).

- **Ban list Standard** : Stealthy Pursuer, plus deux champs de bataille lourds,
  Aspirant's Climb (23 % des decks) et The Arena's Greatest (18 %).
- **Aucune légende bannie** dans les formats du site. L'annonce en bannit une en 2v2
  construit, format non couvert : ne jamais la faire remonter côté site.
- **Nouvelle page `/guides/ban-list`** (index guides, sitemap, llms.txt).
- **Glossaire** : amplification, amplifié, désamplifier, Flux, brûler, passer, plus
  défausser et bannir. Tous les « Voir aussi » pointent vers un terme existant.
- META-KNOWLEDGE et DECKBUILDING portent les deux annonces ; les 5 champs de bataille
  bannis sont barrés dans le tableau.

### 3. Référencement

- **Cannibalisation résolue** : l'accueil affichait la tier list entière et captait
  les requêtes à la place de `/tier-list`. Renommé « Aperçu du méta », lien vers la
  page dédiée. La carte a une hauteur fixe (555 px), elle ne saute plus au changement
  d'onglet.
- **`/decks`** : texte d'entrée + recherche par deck, Légende, joueur ou carte.
- **14 Légendes** qui pesaient dans le méta avaient des decklists mais aucune page,
  dont Kai'Sa (3 013 listes). Fiches générées depuis les données mesurées, sans prose
  inventée. Puis guides « Comment jouer » écrits pour les 14 (Lee Sin, Kai'Sa, etc.) :
  129 cartes citées, toutes résolues en base.
- **Validateur anti-fabrication** : lisait 3 dossiers de scrape en dur, il les lit
  tous. 20 955 listes vérifiées contre leur source, 0 fabrication.

### 4. Audit du site (22 juillet)

- 1 109 liens internes testés, 0 cassé.
- Un H1, un titre, une description, un canonical par page. JSON-LD présent partout.
- Deckbuilder : refuse les 3 bans de juillet, laisse passer Master Yi.
- **`/decks` corrigé** : ne montre plus les 1 957 listes brutes du National. Il garde
  le meilleur deck de chaque Légende par tournoi, les decks avec guide et ceux de la
  communauté. Les listes complètes restent sur `/tournois/[slug]`. Catégorie
  « Tournois » retirée, filtre par tournoi = best-of.
- **Chiffre périmé** : description de `/tier-list` passée de 7 903 à 9 555 decks.
- **Mot « field »** retiré du texte du site (anglicisme).

### 5. Mise en prod

Seed prod via le tunnel public `178.104.237.33:15432` (le tunnel local `5435` reste
fermé). Résultat vérifié : 1 957 decks du National, 40 best-of, article présent.

Un défaut de données prod trouvé et corrigé : la carte « Mischevious Marai » (faute de
frappe, `i` manquant) décrochait 31 decks. Renommée `Mischievous Marai`, re-seed
lancé, la carte est maintenant liée à 33 decks.

**Reste à la charge d'Allan** :
- Le déploiement Coolify ne s'est pas relancé (`/guides/ban-list` en 404 en ligne). Le
  code est sur `main`, il part au prochain déploiement. Vérifier la case Auto Deploy.
- Base cartes prod à resynchroniser : la faute « Mischevious » suggère un décalage plus
  large entre la base cartes locale et prod.

### Commits poussés sur main

- `9301c677` National complet, règles Vendetta, pages Légendes, recherche decks
- `3dde6f13` tier list accueil figée, terrains au survol, textes de 14 Légendes
- `e19b6a87` /decks best-of seulement, tier list 9555


---

# 26 juin 2026 — Audit de régression

> Source d'origine : `docs/REGRESSION-AUDIT-2026-06-26.md`

## Audit de non-régression — fixes locaux avant push prod

**Date :** 2026-06-26
**Périmètre :** 9 zones de revue (sécurité, rate-limit, sessions, deckbuilder, caching, articles/JSON-LD, a11y modales, compteurs/parsing) + 2 vérifications adversariales.
**Méthode :** revue par zone + relecture adversariale du code réel (commits `ad9f7ec4 → a7f3fd4c`, `3624e7cd`, `310bce77`), validation `tsc --noEmit`.

---

### 1. VERDICT GLOBAL

## ✅ GO

Aucune régression réelle confirmée. Les deux points de friction identifiés (réinvalidation de session admin, quantité champion non encodée en base64) ont été vérifiés adversairement et qualifiés **Non-Problème** : comportement soit intentionnel et documenté, soit préexistant et non introduit par les fixes.

**Condition unique avant push :** vérifier que `SESSION_SECRET` est bien défini en prod (cf. `DEPLOIEMENT.md:77`). Si oui, zéro impact utilisateur. Si non, au pire une reconnexion admin unique — coût assumé du durcissement sécurité.

| Sévérité | Nombre |
|----------|--------|
| Bloquant | 0 |
| Majeur | 0 |
| Mineur (confirmé réel) | 0 |
| Non-Problème (vérifié, écarté) | 2 |

---

### 2. RÉGRESSIONS CONFIRMÉES RÉELLES

**Aucune.**

Les deux candidats remontés par les revues ont été soumis à vérification adversariale sur le code réel et **écartés** :

#### Non-Problème A — Réinvalidation de session admin (retrait fallback `|| ADMIN_PASSWORD`)
- **Fichier :** `src/lib/auth.ts` (`getSessionSecret`), `src/lib/session.ts`, `src/app/api/auth/route.ts`
- **Allégation :** le retrait du fallback HMAC change la clé de signature → sessions admin existantes invalidées.
- **Verdict adversarial : FAUX en tant que régression.** La clé HMAC ne diffère avant/après **que** si `SESSION_SECRET` était absent en prod au moment du login — état non conforme à la checklist (`DEPLOIEMENT.md:77` impose `SESSION_SECRET`, audit M1 a déjà rétrogradé High→Low pour ce motif). Avec `SESSION_SECRET` présent (état attendu), clé identique → **aucune session touchée**. Dans le pire cas (oubli opérateur), impact = **une seule reconnexion** pour l'unique admin ; `checkPassword()` lit toujours `ADMIN_PASSWORD` inchangé et `createSessionValue()` re-signe immédiatement. C'est l'**intention délibérée et documentée** du correctif (fail-fast sans secret).
- **Action :** aucun correctif. Pré-push : confirmer `SESSION_SECRET` défini en prod.

#### Non-Problème B — Quantité champion jetée par le codec base64
- **Fichiers :** `src/lib/deck-codec.ts` (`encodeDeckBase64:105`, `decodeLegacyBase64:51`), call-sites `src/app/decks/[slug]/page.tsx:127`, `src/app/d/[code]/page.tsx:209`
- **Allégation :** le fix passe la vraie `quantity` du champion mais elle est silencieusement ignorée par le codec base64.
- **Verdict adversarial : FAUX en tant que régression.** Le codec base64 écrit `C:${cardId}` (sans qty) et force `{quantity:1}` au décodage **depuis l'Initial commit** (`b3e0e70e`) — le fix `a7f3fd4c` ne touche **pas** `deck-codec.ts` (diff vide), il ne modifie que les call-sites. Un champion 2-3 copies partagé via lien base64 revenait déjà à 1 **avant** le fix. Le cas commun (1 champion) reste exact partout — jamais 0 ni 2 — sur tous les chemins testés (base64, deck-code texte, localStorage, TTS, codes /decks et /d). Le champion est en section `legend`, pas `main`, donc round-trip 1-copie = 1.
- **Action :** aucun correctif requis. **Amélioration future optionnelle :** encoder la quantité du champion dans le codec base64 (`C:${cardId}.${qty}`) pour fermer le trou multi-copies des liens de partage.

---

### 3. ZONES VALIDÉES OK (traçabilité)

| # | Zone | Verdict | Note |
|---|------|---------|------|
| 1 | CSRF middleware (`src/middleware.ts`) — refus écritures `/api` cross-origin | OK | OAuth Discord en GET (hors filtre) ; tous les fetch d'écriture same-origin (URLs relatives) ; SW ignore non-GET ; Origin absent toléré. Aucune action/formulaire cassé. |
| 2 | `src/lib/rate-limit.ts` + 9 endpoints + CSRF | OK | Buckets par endpoint isolés ; seuils > usage humain ; extraction IP améliorée (`x-real-ip` puis `x-forwarded-for`) ; aucune signature de route cassée ; `{liked,likes}` bien consommé par `like-button.tsx:37`. |
| 3 | `src/lib/session.ts` + `src/lib/auth.ts` — expiration 30j + retrait fallback | OK | Format payload inchangé depuis l'origine → `Number.isFinite` true, pas de déconnexion massive ; login admin intact. (Voir Non-Problème A.) |
| 4 | Deckbuilder champion quantity encode/import | OK | Cas commun 1 champion exact sur tous les chemins. (Voir Non-Problème B.) |
| 5 | `meta/page.tsx`, `tier-list/page.tsx`, `cartes/page.tsx` — wrap `unstable_cache` + refactor | OK | Queries strictement identiques ; `select` léger couvre exactement les champs consommés ; `createdAt`/`updatedAt` Date→string géré par `formatDate` ; fallback gracieux conservé ; `tsc` propre. Seul changement volontaire : staleness ≤5 min (meta/tier) / 1h (sets). |
| 6 | Articles (covers `next/image`), block-renderer lazy, layout, JSON-LD, CardGrid Pick | OK | Parents `<Image fill>` ont `relative` ; covers 100% locales ; JSON-LD échappe `<` (pas de breakout `</script>`) ; `CardGrid` Pick = 7 champs du `select` ; `metadataBase`/skip-link/RSS OK ; `tsc` propre. |
| 7 | `src/hooks/use-dialog-a11y.ts` + modales + navbar + user-menu (a11y lot 5) | OK | Escape ferme toujours ; piège n'intercepte que Tab ; retour focus protégé par optional chaining ; tous les modales ont un focusable ; changements navbar additifs. Réserve qualité non bloquante : `onClose` inline non mémoïsé (à surveiller). |
| 8 | Compteurs likes/vues + parsing decklist + collection/bulk (lot 6/7) | OK | Like recompté transactionnel idempotent (corrige drift optimiste) ; vues réelles toujours comptées par `/d/[code]/page.tsx:65-68` ; regex setCode préserve titres multi-mots (`Master Yi (Wuju Master)`) ; bulk filtre sur `Card.id` (FK confirmée), borne 5000 > catalogue ~1048. Réserve mineure non bloquante : `existing` lu hors transaction (préexistant). |

---

### 4. RÉSERVES NON BLOQUANTES (suivi post-push, hors périmètre régression)

- **a11y (zone 7) :** `onClose` inline non mémoïsé re-déclenche l'effet focus à chaque re-render parent. Sans impact tant que le parent ne re-render pas pendant l'interaction. → mémoïser `onClose` (`useCallback`) si symptômes.
- **like communautaire (zone 8) :** `existing` lu hors transaction → sur double-clic concurrent extrême, possible violation d'unicité au `create`. Comportement préexistant équivalent, non introduit ici.
- **deck-codec (Non-Problème B) :** champions multi-copies non encodés en base64 → amélioration future.

---

### RÉSUMÉ

**VERDICT GLOBAL : GO.** L'audit de non-régression sur les 9 zones de fixes locaux ne révèle **aucune régression réelle** : Bloquant 0, Majeur 0, Mineur 0. Les 2 seuls candidats (réinvalidation session admin via retrait du fallback `|| ADMIN_PASSWORD`, et quantité champion jetée par le codec base64) ont été vérifiés adversairement sur le code réel et écartés comme **Non-Problème** — le premier est l'intention sécurité documentée (au pire une reconnexion admin unique, et seulement si `SESSION_SECRET` était absent), le second est un comportement préexistant depuis l'Initial commit que le fix ne touche pas (`deck-codec.ts` diff vide). **Condition unique avant push :** confirmer que `SESSION_SECRET` est défini en prod (`DEPLOIEMENT.md:77`) ; si oui, impact utilisateur nul. Les huit autres zones (CSRF, rate-limit, sessions/expiration, caching `unstable_cache`, articles/JSON-LD, a11y modales, compteurs/parsing/bulk) passent `tsc --noEmit` et préservent toutes les fonctionnalités. **Aucun correctif requis avant push.** Suivi post-push optionnel : mémoïser `onClose` (a11y), encoder la qté champion en base64 (multi-copies). Document complet : `docs/REGRESSION-AUDIT-2026-06-26.md`.


---

# 26 juin 2026 — Audit global (workflow multi-agents)

> Source d'origine : `docs/AUDIT-GLOBAL-2026-06-26.md`

## Audit global — Riftbound France

Date : 2026-06-26
Périmètre : sécurité, bugs/logique, SEO & GEO, performance, accessibilité, intégrité des données, build & dépendances, code mort, cohérence contenu FR.
Méthode : audit par dimension + vérification adversariale (réfutation) des findings majeurs.

---

### 1. Score de santé global

#### Score : **62 / 100**

Le projet a un socle fonctionnel solide (SEO/GEO bien structuré, intégrité des decklists confirmée, build et typecheck verts). Il est pénalisé par une faille d'infrastructure critique (DB de prod exposée), une accessibilité faible et systémique, et plusieurs problèmes de cache/perf sur les pages les plus crawlées.

#### Synthèse par dimension

| Dimension | Note | Synthèse en une phrase |
|---|---|---|
| Sécurité | 45/100 | Autorisation et contrôles de propriété solides, mais DB Postgres de prod exposée publiquement, sessions HMAC sans expiration ni révocation, CSP permissive. |
| Bugs & logique | 65/100 | Un bug réel de perte de données dans l'export/partage du deckbuilder (copies multiples du champion écrasées à 1) + plusieurs compteurs (likes/vues) non transactionnels. |
| SEO & GEO | 82/100 | Socle excellent (metadata, canonicals, JSON-LD, sitemap, llms.txt) ; manquent le schema d'entité sur cartes/decks/tournois, la découvrabilité du flux RSS et un metadataBase fiable. |
| Performance | 60/100 | Index Prisma complets mais ~15 pages publiques en force-dynamic sans cache et /meta charge tous les decks à chaque requête ; quelques `<img>` bruts (CLS). |
| Accessibilité | 38/100 | Faible et systémique : pas de skip-link ni focus-visible global, boutons icône-seul muets, menus/modales sans ARIA ni piège de focus, champs sans label. |
| Intégrité données decklists | 95/100 | Aucune decklist fabriquée (validateur 0 MISMATCH) ; recoupement par URL source confirme 100% des decks "non vérifiables" ; seuls des micro-écarts de prose subsistent. |
| Build & dépendances | 70/100 | tsc et build Next 16.2.6 OK ; 53 erreurs lint dont un hook conditionnel réel, 6 vulnérabilités npm transitives, retards de versions. |
| Code mort & nettoyage | 65/100 | ~145 Mo de médias Hartford non ignorés (risque commit), fichiers suivis par erreur (.pyc, settings.local.json, logs), 4 composants morts. |
| Cohérence contenu FR | 70/100 | Pages écrites à la main conformes, mais les scripts de seed injectent des tirets cadratins (—) dans du contenu rendu, dont un article Hartford EN LIGNE. |

---

### 2. Findings par priorité

> Priorité aux findings **confirmés réels** par la vérification adversariale. La sévérité indiquée est la sévérité **ajustée** après réfutation.

#### CRITICAL

##### C1. Base de données Postgres de production exposée sur IP publique
- **Fichier / infra** : tunnel `pg-tunnel` (socat) — hors repo, documenté dans `project_prod_db_exposure.md` et `data/audit-15juin-security-seo.md`. Exposition sur `178.104.237.33:15432`.
- **Problème** : socat binde Postgres sur `0.0.0.0:15432`, accessible depuis Internet. Toute la base (identités Discord/Riot OAuth = PII, collections, commentaires, decks) est joignable directement ; seule la connaissance des identifiants DB protège les données (bruteforce / 0-day Postgres / leak de `DATABASE_URL`, mot de passe transitant en clair via socat). Vérification : exposition corroborée par plusieurs artefacts convergents, aucune règle de pare-feu / bind localhost trouvée dans le repo.
- **Recommandation** : `docker stop pg-tunnel` + repasser en tunnel SSH ponctuel pour les seeds, OU restreindre `15432` au pare-feu Hetzner Cloud à la seule IP d'Allan, et le couper hors fenêtre de seed. Ne jamais laisser le port exposé en permanence.
- **Indicateur de réussite** : `nc -vz 178.104.237.33 15432` depuis l'extérieur n'établit plus de connexion ; règle UFW / Hetzner Cloud Firewall en place.

---

#### HIGH

##### H1. Sessions HMAC sans expiration ni révocation côté serveur
- **Fichier** : `src/lib/session.ts:18-42` ; `src/lib/auth.ts:20-32,57-60`
- **Problème** : `verify()` / `verifySignature()` recalculent le HMAC mais ne vérifient JAMAIS le timestamp encodé. Un cookie volé reste valide indéfiniment (le `maxAge` n'agit que côté navigateur). Aucun store de sessions → révocation impossible (logout = suppression du cookie client uniquement). Un token admin exfiltré = accès admin permanent jusqu'à rotation de `SESSION_SECRET`.
- **Recommandation** : vérifier l'âge du payload côté serveur (rejeter si timestamp > N jours) et/ou stocker les sessions en DB (table `Session` avec révocation). Au minimum, intégrer une époque rotative dans le secret.
- **Indicateur de réussite** : un token ancien dépassant la fenêtre est rejeté ; un mécanisme de révocation existe.

##### H2. Deckbuilder : export/partage et sauvegarde corrompent les copies multiples du champion
- **Fichier** : `src/app/deckbuilder/deckbuilder.tsx:389-393, 406-410` (export) ; `316-334`/`358-373` (sauvegarde locale)
- **Problème** : `getShareUrl()` et `getTextCode()` encodent le champion en dur à `quantity:1` et retirent TOUTES ses copies du main. Un deck jouant 2-3 copies du champion (autorisé, `maxQuantity('main')=3`) est exporté/partagé avec une seule copie ; au réimport (`loadFromCodeData`) le champion n'est rajouté qu'à +1 → round-trip 3x → 1x = perte silencieuse. `getTTSCode()` (L418-427) n'a PAS le bug (preuve de l'incohérence). La sauvegarde locale duplique au contraire le champion (poussé en section legend ET conservé dans main).
- **Recommandation** : encoder le champion avec sa quantité réelle (`championInMain.quantity`), aligner `getShareUrl`/`getTextCode`/`saveDeck` sur la logique de `getTTSCode`, vérifier le décompte au réimport.
- **Indicateur de réussite** : construire un deck avec 3 copies du champion, Partager, recharger l'URL → 3 copies affichées (pas 1) ; cohérent avec l'export TTS.

##### H3. Menus déroulants et modales sans ARIA, sans piège de focus, sans fermeture clavier
- **Fichier** : `src/components/navbar.tsx:55-84` ; `src/components/user-menu.tsx:63-117` ; `export-modal.tsx:110-111` ; `import-modal.tsx:107-108` ; `card-detail-modal.tsx:14-15`
- **Problème** : dropdowns sans `aria-expanded`/`aria-haspopup`/`role=menu`, fermeture sur `mousedown` extérieur uniquement (pas d'Escape, pas de déplacement de focus). Modales = `<div className="fixed inset-0">` sans `role="dialog"` ni `aria-modal`, sans piège de focus ni retour de focus au déclencheur. `card-detail-modal` n'a aucun handler clavier. Violations WCAG 4.1.2 / 2.4.3 / 1.4.13.
- **Recommandation** : ajouter `aria-expanded`, `aria-haspopup="menu"`, fermeture Escape sur les dropdowns ; `role="dialog" aria-modal="true" aria-labelledby` + piège de focus + retour de focus + Escape généralisé sur les modales. Envisager la primitive `ui/dialog` (Base UI) déjà présente.
- **Indicateur de réussite** : ouvrir un menu/modale au clavier → `aria-expanded` à true, Escape ferme, focus piégé puis rendu au déclencheur.

##### H4. Hook React appelé conditionnellement (rules-of-hooks) dans `deck-summary.tsx`
- **Fichier** : `src/components/deck-summary.tsx:95,101`
- **Problème** : dans `StackedCurve`, l'early return `if (!hasData) return null;` (L95) précède `const [hovered, setHovered] = useState(null);` (L101). `hasData` varie entre rendus → nombre de hooks variable → crash runtime possible « Rendered more hooks than during the previous render ». Bug de correction, pas une préférence de lint.
- **Recommandation** : remonter le `useState` au-dessus de tout return anticipé, garder l'early return après.
- **Indicateur de réussite** : `npx eslint src/components/deck-summary.tsx` ne remonte plus `react-hooks/rules-of-hooks` ; le `useState` est lexicalement avant tout return.

##### H5. Em-dashes dans le contenu d'articles seedés rendus en prod (Hartford en ligne)
- **Fichier** : `scripts/seed-hartford-article.mts:140` (et `:35` deckName) ; `prisma/seed-bestof-articles.ts` + `seed-*-bestof.ts` ; scripts Top 8
- **Problème** : les scripts de seed injectent systématiquement des tirets cadratins (—) dans des champs rendus : titres, intros, excerpts (= meta description SEO), en-têtes, `deckName`, labels de tier (« Tier 1 — Top 8 »). Le rendu ne transforme pas le caractère → violation directe de la règle éditoriale « pas de tiret cadratin ». Au moins l'article récap Hartford est EN LIGNE avec un — dans sa prose.
- **Recommandation** : remplacer les — de contenu par « , », « : » ou « · » selon le contexte ; re-seeder les articles/best-of concernés en prod. Laisser les — décoratifs des commentaires de code.
- **Indicateur de réussite** : `grep -n '—'` sur les scripts de seed ne renvoie plus de ligne dans `content`/`excerpt`/`title`/`deckName`/`context`/tier label ; aucune page prod n'affiche de —.

---

#### MEDIUM

##### M1. Le secret de signature des sessions peut retomber sur `ADMIN_PASSWORD`
- **Fichier** : `src/lib/auth.ts:8-12`
- **Problème** : `getSessionSecret()` retourne `SESSION_SECRET || ADMIN_PASSWORD` et ne lève que si les deux manquent. Si `SESSION_SECRET` est oublié en prod, un mot de passe humain (faible entropie) sert de clé HMAC. Le fichier frère `session.ts:8` plante correctement sans secret — le bon pattern existe déjà. (Sévérité ajustée de High à Low/Medium : HMAC SHA-256 résistant à la préimage, et la checklist prod impose `SESSION_SECRET` via `openssl rand -hex 32` ; ne se matérialise que sur oubli opérateur.)
- **Recommandation** : aligner `auth.ts` sur `session.ts` — supprimer le fallback `|| process.env.ADMIN_PASSWORD`, fail-fast au boot si `SESSION_SECRET` absent.
- **Indicateur de réussite** : `auth.ts` ne référence plus `ADMIN_PASSWORD` comme secret ; le boot échoue sans `SESSION_SECRET`.

##### M2. CSP autorise `unsafe-inline` et `unsafe-eval` sur `script-src`
- **Fichier** : `src/middleware.ts:22`
- **Problème** : la CSP ne fournit aucune protection XSS ; tout point d'injection HTML (commentaires, titres de decks, markdown rendu) deviendrait exploitable.
- **Recommandation** : passer à une CSP à nonce/hash (nonce par requête dans le middleware, retirer `unsafe-inline`/`unsafe-eval`). Isoler GTM via nonce si nécessaire.
- **Indicateur de réussite** : l'en-tête CSP prod n'a plus `unsafe-eval` et remplace `unsafe-inline` par `nonce-...` sur `script-src`.

##### M3. Rate-limiting en mémoire process-local, contournable et perdu au redémarrage
- **Fichier** : `src/app/api/auth/route.ts:4-13` ; `src/app/api/community-decks/route.ts:20-29`
- **Problème** : Map en mémoire indexée sur `x-forwarded-for` (spoofable si le proxy ne réécrit pas), état perdu à chaque redéploiement Coolify, et la plupart des endpoints mutatifs (comments, votes, likes, collection/bulk, wishlist) n'ont AUCUN rate-limit.
- **Recommandation** : centraliser (Redis ou table DB) avec une clé IP fiable ; étendre au login admin et aux écritures sensibles ; vérifier que Traefik écrase `x-forwarded-for`.
- **Indicateur de réussite** : le rate-limit survit à un restart, n'est pas contournable en variant l'en-tête, et le login admin reste limité.

##### M4. `image-proxy` suit les redirections : SSRF possible
- **Fichier** : `src/app/api/image-proxy/route.ts:18-29`
- **Problème** : seul le hostname initial (`cmsassets.rgpub.io`) est validé, mais `fetch()` suit les redirections. Un 3xx vers une cible interne (`169.254.169.254`, `127.0.0.1`, services Coolify) serait suivi et renvoyé.
- **Recommandation** : `redirect: "manual"`, refuser/re-valider tout 3xx contre l'allowlist, vérifier le content-type `image/*` et borner la taille.
- **Indicateur de réussite** : une URL autorisée renvoyant un 302 vers `127.0.0.1` n'est plus suivie (403/502) ; `redirect:'manual'` présent.

##### M5. `/meta` charge tous les decks publiés à chaque requête, sans pagination ni cache
- **Fichier** : `src/app/meta/page.tsx:2,30-117`
- **Problème** : `force-dynamic` + `prisma.deck.findMany({ where:{published:true}, select:{...} })` sans `take`, agrégations en JS à chaque hit. Sur le petit Hetzner, chaque crawl recharge et re-réduit l'ensemble. (Medium : SELECT restreint à 4 colonnes scalaires, mais coût récurrent évitable.)
- **Recommandation** : remplacer par des agrégations SQL (`prisma.deck.groupBy({ by:['legendName'], _count:true, where:{published:true} })`) + requête distincte tournois/formats, le tout enveloppé dans `unstable_cache({ revalidate:300, tags:['meta'] })` comme la home.
- **Indicateur de réussite** : `/meta` n'exécute plus de findMany retournant >1000 lignes ; réponse servie depuis un cache.

##### M6. ~15 pages publiques en `force-dynamic` sans cache (zéro ISR/CDN)
- **Fichier** : `src/app/cartes/page.tsx:1` ; `tier-list/page.tsx:2` ; `articles/page.tsx:1` ; `decks/page.tsx:1` ; `tournois`, `deckbuilder`, `guides/glossaire`
- **Problème** : cause racine documentée dans le code (« `revalidate` froze it empty at Docker build » : DB non joignable au build). Le contournement `force-dynamic` supprime tout cache → round-trip Prisma + SSR à chaque requête. La home prouve que `unstable_cache` résout proprement le problème. (Medium : périmètre réel plus étroit que « ~15 pages » ; `/cartes`, `/decks`, `/articles` lisent `searchParams` donc le fix est paramétré ; gains nets et incontestables sur `/tier-list`, `/meta`, `/guides/glossaire` qui ne prennent aucun param.)
- **Recommandation** : envelopper les requêtes DB dans `unstable_cache(fn, key, { revalidate, tags })`, invalider via `revalidateTag` aux seeds/publications. Prioriser `/tier-list`, `/meta`, `/guides/glossaire`.
- **Indicateur de réussite** : ces pages ne sont plus `force-dynamic` OU enveloppent leurs requêtes DB dans `unstable_cache` ; un 2e hit rapproché ne déclenche pas de nouvelle requête Prisma.

##### M7. `/cartes` (page SEO très crawlée) non cachée, requêtes `select:*`
- **Fichier** : `src/app/cartes/page.tsx:63-72`
- **Problème** : `findMany` sans `select` (transfère `textPlain`/`textHtml` volumineux), `count`, `cardSet.findMany` à chaque combinaison de filtres, sans cache.
- **Recommandation** : `select` limité aux champs affichés (`id, riftboundId, name, imageUrl, rarity, setName, type`) ; `cardSet.findMany` en `unstable_cache` long ; requête catalogue en `unstable_cache` court paramétré par les filtres.
- **Indicateur de réussite** : `/cartes` utilise un `select` explicite et sert `cardSet` depuis un cache.

##### M8. Images clés en `<img>` brut au lieu de `next/image` (CLS)
- **Fichier** : `src/app/articles/page.tsx:107` ; `src/app/articles/[slug]/page.tsx:460` ; `src/components/article-block-renderer.tsx:86,124`
- **Problème** : covers d'articles et images de blocs en `<img>` sans width/height ni srcset → Cumulative Layout Shift, pas de lazy automatique.
- **Recommandation** : passer à `next/image` avec width/height (ou `fill` + ratio container) ; là où le CDN impose `unoptimized`, fixer width/height pour bloquer le CLS.
- **Indicateur de réussite** : CLS ~0 sur `/articles` et `/articles/[slug]` dans Lighthouse.

##### M9. Boutons icône-seul sans nom accessible (lucide `aria-hidden`)
- **Fichier** : `src/components/point-tracker.tsx:146-160,369-374,389-394` ; `navbar.tsx:105-110` ; `decklist-interactive.tsx:396-404` ; `export-modal.tsx:116` ; `search-bar.tsx:93,109`
- **Problème** : lucide met `aria-hidden="true"` sur les icônes sans enfants ; les boutons icône-seul sans texte ni `aria-label` sont muets pour un lecteur d'écran (échec WCAG 4.1.2). Impact le plus fort : le toggle de navigation mobile.
- **Recommandation** : ajouter un `aria-label` explicite par bouton (« Ouvrir le menu », « Augmenter le score », « Fermer », « Vue grille ») ; `aria-pressed` sur les toggles d'affichage.
- **Indicateur de réussite** : chaque `<button>` icône-seul a un `aria-label` ; chaque bouton est annoncé avec un nom non vide (NVDA/VoiceOver).

##### M10. Aucun style de focus visible global
- **Fichier** : `src/app/globals.css` (aucune règle `:focus-visible`) ; nus : `src/components/collection/binder-explorer.tsx`, `src/app/deckbuilder/components/search-bar.tsx`
- **Problème** : pas de baseline `:focus-visible` global ; 64 occurrences de `focus:outline-none` dans 22 fichiers. La plupart des champs faits main remplacent l'outline par `focus:border-arcane` (acceptable, contraste limite), mais certains éléments restent totalement nus (focus clavier invisible).
- **Recommandation** : règle globale `@layer base { *:focus-visible { outline: 2px solid var(--color-arcane); outline-offset: 2px; } }` ; remplacer `focus:outline-none` par `focus-visible:outline-none + focus-visible:ring-2`.
- **Indicateur de réussite** : navigation clavier (Tab) → indicateur de focus visible sur chaque élément interactif.

##### M11. Pas de skip-link « Aller au contenu »
- **Fichier** : `src/app/layout.tsx:110-119` (`<main>` sans `id`)
- **Problème** : aucun lien d'évitement avant `<main>` → utilisateurs clavier/lecteur d'écran tabulent toute la navbar sur chaque page (WCAG 2.4.1 non respecté).
- **Recommandation** : premier enfant du `<body>` : `<a href="#contenu" class="sr-only focus:not-sr-only ...">Aller au contenu</a>` + `id="contenu"` sur `<main>`. Définir l'utilitaire `.sr-only` (Tailwind v4 ne la génère pas toujours).
- **Indicateur de réussite** : charger une page, Tab une fois → premier élément focusable = skip-link visible et fonctionnel.

##### M12. `metadataBase` retombe sur `localhost:3000` si `NEXT_PUBLIC_SITE_URL` absent au build
- **Fichier** : `src/app/layout.tsx:30`
- **Problème** : `NEXT_PUBLIC_*` figées au BUILD. Si Coolify ne passe pas `NEXT_PUBLIC_SITE_URL` en build-arg avant `next build`, toutes les `og:image` et canonical relatives pointent vers `localhost:3000`.
- **Recommandation** : passer `NEXT_PUBLIC_SITE_URL=https://riftboundfrance.fr` en build-arg/env AVANT `next build` ; à défaut, hardcoder le fallback sur l'apex prod.
- **Indicateur de réussite** : le HTML source de `/` en prod contient `og:image` et canonical en `https://riftboundfrance.fr` (jamais localhost).

##### M13. Flux RSS existant mais non découvrable
- **Fichier** : `src/app/layout.tsx:104` (RSS généré par `src/app/rss.xml/route.ts`)
- **Problème** : aucun `<link rel="alternate" type="application/rss+xml">` dans le `<head>`, ni lien footer, ni entrée sitemap → indécouvrable par crawlers/agrégateurs.
- **Recommandation** : `alternates: { types: { 'application/rss+xml': '/rss.xml' } }` dans le metadata du layout ; optionnellement lien footer.
- **Indicateur de réussite** : le `<head>` contient `<link rel="alternate" type="application/rss+xml" href=".../rss.xml">`.

##### M14. Pages détail cartes/decks/tournois sans JSON-LD d'entité
- **Fichier** : `src/app/cartes/[id]/page.tsx:41` ; `decks/[slug]` ; `tournois/[slug]`
- **Problème** : seul `BreadcrumbList` est émis ; les milliers de pages cartes/decks restent des entités opaques pour Google rich results et la citabilité GEO.
- **Recommandation** : JSON-LD léger par template : carte → `Product`/`Thing` ; tournoi → `Event` ; deck → `CreativeWork`. Réutiliser le pattern des articles.
- **Indicateur de réussite** : chaque template contient un bloc `application/ld+json` autre que `BreadcrumbList`, valide au Rich Results Test.

##### M15. `setState` synchrone dans `useEffect` (cascades de rendu)
- **Fichier** : `src/components/point-tracker.tsx:46` ; `analytics.tsx:22,44` ; `card-ref.tsx:83` ; `deck-like-button.tsx:40` ; `deckbuilder/components/meta-indicator.tsx:30`
- **Problème** : `react-hooks/set-state-in-effect` (erreur sous React 19) → re-rendus en cascade (perte de perf, flicker/double-fetch).
- **Recommandation** : pour l'état dérivé (`point-tracker`), calculer pendant le rendu ou via `useMemo` ; analytics/card-ref (montage) tolérables, à confirmer cas par cas.
- **Indicateur de réussite** : `npx eslint <fichier>` ne remonte plus `react-hooks/set-state-in-effect`.

##### M16. 6 vulnérabilités npm via dépendances transitives de Next
- **Fichier** : `package.json:20`
- **Problème** : `js-yaml` (DoS), `postcss <8.5.10` (XSS) + 1 high, toutes transitives via `next 16.2.6`. `npm audit fix --force` voudrait downgrade `next@9` (cassant) — à NE PAS appliquer.
- **Recommandation** : mettre à jour `next 16.2.6 → 16.2.9` et `eslint-config-next 16.2.9`, relancer `npm audit`.
- **Indicateur de réussite** : après `npm i next@16.2.9 eslint-config-next@16.2.9`, `npm audit --omit=dev` ne liste plus postcss/next high+moderate.

##### M17. Médias VOD Hartford non ignorés (~145 Mo) risquent d'être commités
- **Fichier** : `.gitignore`
- **Problème** : `data/videos/hartford-day1.{mp3,json,srt,tsv,txt,vtt}` (~63 Mo + frames) en untracked, NON ignorés (`utrecht-day1.*` et `vancouver-day1.*` le sont, mais pas `hartford-day1.*`). Un `git add .` les commiterait.
- **Recommandation** : généraliser le `.gitignore` : `data/videos/*.mp3`, `data/videos/*.wav`, `data/videos/*-frames/`, `data/videos/*-day1.{srt,tsv,vtt,txt,json}`.
- **Indicateur de réussite** : `git check-ignore data/videos/hartford-day1.mp3` retourne le fichier ; `git status` ne les liste plus.

##### M18. `.claude/settings.local.json` suivi par git malgré la règle `.gitignore`
- **Fichier** : `.claude/settings.local.json`
- **Problème** : la règle existe mais le fichier est dans HEAD (commité avant la règle) → règle inopérante, pollue chaque diff.
- **Recommandation** : `git rm --cached .claude/settings.local.json` puis commit.
- **Indicateur de réussite** : `git ls-files .claude/settings.local.json` ne retourne plus rien.

---

#### LOW

##### L1. Like communautaire : décrément non gardé → compteur peut devenir négatif
- **Fichier** : `src/app/api/community-decks/[code]/like/route.ts:27-33`
- **Recommandation** : garder le décrément (≥0), recalculer `likes = count(CommunityDeckLike)` dans la même transaction.
- **Indicateur** : forcer `likes=0` avec une ligne existante, POST /like → reste ≥0.

##### L2. `LikeButton` : mise à jour optimiste qui dérive de la valeur serveur
- **Fichier** : `src/app/d/[code]/like-button.tsx:35-38`
- **Recommandation** : faire renvoyer `likes` par la route POST et appliquer `setLikes(data.likes)`.
- **Indicateur** : liker dans 2 onglets → le compteur ne diverge plus du vrai total.

##### L3. Incrément de vues sur un GET utilisé aussi par l'import
- **Fichier** : `src/app/api/community-decks/[code]/route.ts:22-25` ; `src/app/d/[code]/page.tsx:65-68`
- **Recommandation** : séparer la lecture (GET sans effet de bord) de l'incrément (POST dédié), ne pas incrémenter à l'import.
- **Indicateur** : importer un deck par lien sans ouvrir sa page → `views` n'augmente plus.

##### L4. Parsing decklist : suffixe entre parenthèses traité comme `setCode`
- **Fichier** : `src/lib/deck-code.ts:47-52`
- **Recommandation** : ne traiter la parenthèse comme `setCode` que si son contenu ressemble à un code d'extension ; sinon tenter le lookup avec et sans parenthèse.
- **Indicateur** : coller `3 Master Yi (Wuju Master)` à l'import → carte résolue.

##### L5. Import collection en masse : aucune validation d'existence des `cardId`
- **Fichier** : `src/app/api/collection/bulk/route.ts:31-41`
- **Recommandation** : pré-filtrer contre `prisma.card.findMany({ where: { id: { in: ids } } })` avant la transaction.
- **Indicateur** : POST bulk avec un `cardId` inexistant → item ignoré proprement, pas de 500/FK.

##### L6. Endpoints d'écriture en masse sans borne (DoS applicatif)
- **Fichier** : `src/app/api/collection/bulk/route.ts:17-41` ; `src/app/api/collection/import/route.ts:47-79`
- **Recommandation** : borner le nombre d'items (≤ taille du catalogue ~1048) et la taille du CSV ; rejeter avec 413/400.

##### L7. Likes/garde de décrément basés sur lecture obsolète (decks tournoi & default binder)
- **Fichier** : `src/app/api/decks/[slug]/like/route.ts:67-71` ; `src/lib/collection-server.ts:68-77`
- **Recommandation** : transaction `delete + update` et/ou recompte ; contrainte unique `(userId, position=0)` + upsert pour le binder.

##### L8. CSRF : sessions SameSite=Lax sans token anti-CSRF ; effets de bord sur GET
- **Fichier** : `src/lib/session.ts:5` ; endpoints POST/PATCH/DELETE ; GET `community-decks/[code]`, `dev-login`
- **Recommandation** : vérifier l'`Origin` sur les routes mutatives ; éviter tout effet de bord d'écriture sur des handlers GET.

##### L9. `AdminLayout` rend les children quand non-admin (défense en profondeur incohérente)
- **Fichier** : `src/app/admin/layout.tsx:13-17`
- **Recommandation** : centraliser le contrôle dans le layout (rediriger vers `/admin/login` sauf sur la page login).

##### L10. Aperçu carte au survol inaccessible au clavier/tactile
- **Fichier** : `src/components/card-ref.tsx:90-110`
- **Recommandation** : rendre l'ancre focusable (`tabindex=0`/`button`), déclencher sur `onFocus`/`onBlur`, fermer sur Escape ; a minima `aria-label` avec le nom de la carte.

##### L11. Champs de formulaire/selects sans `<label>` ; toggles sans `aria-pressed`
- **Fichier** : `src/components/card-filters.tsx:54-72,77-97` ; `search-bar.tsx:32` ; `point-tracker.tsx:180-187`
- **Recommandation** : `<label htmlFor>` ou `aria-label` par champ ; `role="search"` sur la barre ; `aria-pressed` sur domaines/favori/vues.

##### L12. `optimizePackageImports` absent pour `lucide-react`
- **Fichier** : `next.config.ts:3-38`
- **Recommandation** : `experimental: { optimizePackageImports: ['lucide-react'] }` (vérifier la doc Next 16 locale).

##### L13. `CollectionProvider` fetch `/api/collection` au montage sur chaque page (même anonyme)
- **Fichier** : `src/components/collection/collection-provider.tsx:24-35`
- **Recommandation** : court-circuiter l'appel quand l'utilisateur n'est pas authentifié, ou lazy-load le provider sur les routes consommatrices.

##### L14. `Math.random()` dans la fonction cachée de la home
- **Fichier** : `src/app/page.tsx:27-76`
- **Recommandation** : borner la requête (`take`) plutôt que charger tous les decks éligibles pour n'en afficher que 6 ; déplacer l'aléatoire hors cache si rotation voulue.

##### L15. Lint : 30 `no-explicit-any` + 10 `no-require-imports` dans scripts/prisma/data
- **Fichier** : `eslint.config.mjs:9`
- **Recommandation** : ajouter `scripts/**`, `prisma/seed*.ts`, `data/**`, `audit-task1.js` à `globalIgnores` pour que `npm run lint` reflète la dette réelle de l'app.

##### L16. Pas de champ `engines` ; Prisma 6.19 vs 7.x
- **Fichier** : `package.json:3,15`
- **Recommandation** : `"engines": { "node": ">=20" }` ; patchs sûrs via `npm update` ; planifier la migration Prisma 6→7 séparément.

##### L17. Validateur decklists : ~1185-1950 decks classés « unverifiable » alors qu'ils sont vérifiables par URL source
- **Fichier** : `scripts/validate-decklists.py:105-110`
- **Problème** : appariement seulement par id de fichier (+ 3 tournois JSON). Suzhou/Fuzhou/Atlanta/Changsha/Vancouver/Utrecht tombent en « unverifiable » alors que leur scrape brut existe ; recoupement manuel par URL = 0 mismatch. Angle mort : une future fabrication dans ces buckets passerait en exit 0.
- **Recommandation** : matcher aussi par `source`/`sourceUrl` contre l'URL riftdecks des `.md` ; faire échouer si le taux d'unverifiable dépasse un seuil.
- **Indicateur** : après patch, « unverifiable » chute à ~0 pour ces tournois, MISMATCH toujours 0.

##### L18. Micro-écarts de prose dans les docs d'insight (pas dans les decklists)
- **Fichier** : `data/video-insights/cross-set-casts-2026-06.md:18`
- **Problème** : « Scrap Heap » vs « Scrapheap » (carte réelle) ; 10 « suspects » du validateur de noms sont des archétypes, pas des cartes. Aucun impact sur les decks publiés.
- **Recommandation** : corriger « Scrap Heap » → « Scrapheap » ; optionnellement ajouter les archétypes à la liste STOP.

##### L19. Pas de redirection http/www / hreflang (à confirmer côté Coolify)
- **Fichier** : `next.config.ts:1` ; `src/app/layout.tsx:103`
- **Recommandation** : vérifier que Traefik force `301` http/www → apex https ; hreflang non requis tant que mono-langue (documenter pour une future 2e langue).

##### L20. `llms.txt` contient des chiffres périmés (18 000 decklists / 88 tournois)
- **Fichier** : `public/llms.txt:9`
- **Recommandation** : mettre à jour avec les volumes réels (~21 657 decks) ; idéalement générer la ligne depuis un count DB en CI.

---

### 3. PLAN DE NETTOYAGE

#### À ajouter au `.gitignore` (et généraliser)
```
## Médias VOD
data/videos/*.mp3
data/videos/*.wav
data/videos/*-frames/
data/videos/*-day1.{srt,tsv,vtt,txt,json}

## Python
__pycache__/
*.pyc

## Logs de scrape (élargir _*.log → *.log)
data/raw-scrapes/**/*.log
```

#### À retirer du suivi git (`git rm --cached`)
- `.claude/settings.local.json` (règle .gitignore déjà présente mais inopérante)
- `scripts/__pycache__/parse_riftbound_cached.cpython-312.pyc` (`git rm --cached -r scripts/__pycache__`)
- `data/raw-scrapes/bulk_fetch.log`
- `data/raw-scrapes/scrape-progress.log`
- `data/audit-screens/` (~80 Mo, 22 PNG, non référencés par `src/`) — `git rm --cached -r` (décision produit : sinon documenter comme régénérables)

#### Fichiers à supprimer (composants morts — confirmer qu'aucune page n'est en cours de dev)
- `src/components/collection/collection-explorer.tsx`
- `src/components/deck-viewer.tsx`
- `src/components/hero-carousel.tsx`
- `src/components/tier-badge.tsx`

#### Scripts redondants / one-off à archiver ou supprimer
- Parseurs dupliqués : `scripts/parse-all-decklists.js`, `scripts/parse-decklist-md.js` (garder le canonique `scripts/parse-riftdecks.ts`)
- Correctifs prisma ponctuels déjà appliqués : `prisma/fix-decks.ts`, `prisma/fix-champions-main.ts`, `prisma/generate-atlanta.ts`, `prisma/link-corrected.ts`, `prisma/missing-cards-report.txt`, `check-missing-cards`, `deep-check`, `list-incomplete` (conserver les `seed-*.ts` réutilisés)

> Vérifier après nettoyage : `git ls-files | grep -E '\.pyc$|\.log$'` vide, `git check-ignore` confirme les médias ignorés, `tsc`/build verts après suppression des composants morts.

---

### 4. Plan d'action priorisé

#### Étape 0 — Urgence sécurité (immédiat, indépendant)
1. **C1 — Fermer le port DB prod** : `docker stop pg-tunnel` + règle pare-feu Hetzner (allowlist IP Allan). C'est la seule faille Critical ; aucune dépendance, à faire en premier.

#### Étape 1 — Quick wins à fort impact (faibles dépendances)
2. **H5 + cohérence FR** : corriger les em-dashes dans `seed-hartford-article.mts` (article EN LIGNE) puis les `seed-*-bestof.ts`, **re-seeder via le tunnel** (ordonner après C1 si le seed passe par le port à sécuriser — utiliser le tunnel SSH ponctuel).
3. **H4** : corriger le hook conditionnel `deck-summary.tsx` (bug crash potentiel, fix trivial).
4. **M17 + M18** : `git rm --cached` (settings.local.json) + élargir le `.gitignore` (médias Hartford, pyc, logs) avant tout `git add .`.

#### Étape 2 — Données & logique
5. **H2** : corriger la corruption champion dans le deckbuilder (export/partage/sauvegarde), aligner sur `getTTSCode`.
6. **L1-L7** : fiabiliser les compteurs likes/vues (transactions, recompte) et validations FK/borne.

#### Étape 3 — Durcissement sécurité (dépend partiellement de l'infra)
7. **M1** (supprimer fallback `ADMIN_PASSWORD`), **H1** (expiration/révocation sessions), **M2** (CSP nonce), **M3** (rate-limit centralisé), **M4** (SSRF image-proxy). H1 dépend d'un choix d'architecture (table Session) → planifier.

#### Étape 4 — Performance (dépend d'un pattern commun)
8. **M5 + M6 + M7** : généraliser le pattern `unstable_cache` de la home. Commencer par `/tier-list`, `/meta`, `/guides/glossaire` (sans `searchParams`, fix trivial), puis les pages paramétrées par filtres. **M8** (next/image covers).

#### Étape 5 — Accessibilité (chantier transversal)
9. **M10 + M11** (focus global + skip-link, fondations), puis **H3** (ARIA menus/modales), **M9** (aria-label boutons), **L10/L11** (labels, hover clavier). Ordre : fondations CSS/layout d'abord, composants ensuite.

#### Étape 6 — SEO/GEO & dépendances (non bloquant)
10. **M12** (metadataBase build-arg — vérifier Coolify), **M13** (RSS découvrable), **M14** (JSON-LD entités), **L20** (llms.txt), **M16/L16** (bump Next 16.2.9, engines), **L15** (lint ignores), puis le **plan de nettoyage** code mort.

#### Dépendances clés
- Le re-seed (H5) doit utiliser le tunnel SSH ponctuel une fois C1 appliqué (ne pas rouvrir le port public).
- M5/M6/M7 partagent le même remède (`unstable_cache`) → factoriser un helper.
- Les fondations a11y (M10/M11) précèdent les correctifs composant (H3/M9).


---

# 17 juin 2026 — Fiabilisation des decklists

> Source d'origine : `docs/rapport-fiabilisation-decklists-2026-06-17.md`

## Rapport — Fiabilisation des decklists (session 16-17 juin 2026)

### Contexte
Suite à la découverte de decklists Changsha fabriquées, audit et fiabilisation complète
des decklists sur tout le site (pages deck, articles, deckbuilder, filtres), prod incluse.
Règle directrice : **ne jamais publier de données fausses ou incertaines — skip/supprime plutôt.**

### Corrections données (appliquées local + prod)

| Problème | Fix | Volume |
|---|---|---|
| Decklists Changsha fabriquées | Supprimées | 70 + 7 |
| Decks sans runes | Backfill (runes objet `{Domaine:n}` → « X Rune ») | 1883 decks |
| Decks sans carte Légende | Backfill par nom de carte | 110 decks |
| Filtres légendes non harmonisés | `legendName` → nom exact de carte | 244 decks |
| Titres incohérents | Régénérés `Légende — Tournoi` | ~2900 |
| Decks à source corrompue | Supprimés (légende=champion, champion=spell/gear) | 3 (Suzhou) |

### Corrections code (sur `main`, déployées)

- **Deckbuilder import** : champion fusionné (+1) dans le main → 40/40, pas de doublon de clé
  React, runes incluses. Fusion aussi des éditions multiples d'une même carte.
- **Légendes OPP / alt-art** aliasées vers la carte canonique du même nom
  (Master Yi `opp-019-024` → `ogs-019-024`, ~1025 decks).
- **Articles** : champion affiché 1× (suppression de l'auto-dérivation qui doublait) ;
  reconnaissance de la section `champion` produite par le parser de code deck.
- **Cohérence** : helper unique `isChampionCard` → le champion s'affiche toujours sous
  « Champion » partout (pages deck, articles, `/d/[code]`, image OG, deckbuilder).
- **Hover** des cartes best-of non rogné (overflow conditionnel sur l'accordéon).
- **Seed** `seed-scraped-decks.ts` corrigé (runes objet) pour ne plus reproduire le bug.

### Vérifications finales (prod)

- **20 336 decks** : 0 doublon, 0 champion manquant, 0 légende non résolue, 0 deck sans
  carte légende.
- **Filtre /decks** : 0 variante de légende en double.
- **Article best-of-tianjin** : champion en section `champion` seule (aucune section
  `legend` parasite).
- **Page deck** : runes (Fury/Order Rune) + champion (label « Champion ») + légende.

### Garde-fous

- Règle « ne jamais inventer » dans `AGENTS.md` + validateur `scripts/validate-decklists.py`.
- 2 decks Shanghai City Challenge sans runes laissés tels quels (pas de source → pas de
  fabrication).

### Points non évidents (pièges à retenir)

- **Un champion peut être à la fois en main ET en section champion/légende** : ce n'est pas
  un doublon, ne jamais dédupliquer entre ces sections.
- Le champion est une **carte réelle du main deck** ; à l'import deckbuilder on l'ajoute en
  fusionnant la quantité (+1).
- Runes parfois stockées en **objet par domaine** `{"Calm":7}` → la carte s'appelle
  « Calm **Rune** » (suffixer au lookup).
- Noms canoniques de cartes avec quirks : `Rek'sai` (s minuscule), `Jax, Grandmaster At Arms`
  (At majuscule).

### Git

10 commits sur `main` (poussés), dont les 4 du 17/06 : `be32b24b`, `803f56df`, `6a577e79`,
`f8a28930`. L'overlay de stream reste isolé sur `feat/stream-overlay` (modèle `OverlayState`,
2 routes de dropdowns, lien profil).


---

# 15 juin 2026 — Sécurité + SEO page par page

> Source d'origine : `data/audit-15juin-security-seo.md`

## Audit Sécurité + SEO — Riftbound France (15 juin 2026)

Audit page par page (par type/template) sur le serveur dev local incluant les nouvelles pages tournois (Changsha, Utrecht, Vancouver). Pages publiques : ~38 routes + ~40 routes API + back-office `/admin`.

### Score global

| Domaine | Score | Synthèse |
|---|---|---|
| **Sécurité** | **85 / 100** | Headers + auth solides. Point critique = exposition DB prod (infra). |
| **SEO** | **92 / 100** | Base excellente (schema, canonicals, OG, sitemap). 1 correctif appliqué. |

---

### 1. Sécurité

#### ✅ Points forts
- **Headers** (`src/middleware.ts`) : HSTS (2 ans, preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/micro/geo off), CSP avec `frame-ancestors 'none'`.
- **Auth back-office** : toutes les routes `/api/admin/*` gated par `isAdmin()` → 401 ; `/admin/*` protégé via `isAdmin()` dans le layout.
- **`/api/auth/dev-login`** : renvoie **404 en production** (garde `NODE_ENV`).
- **`/api/image-proxy`** : anti-SSRF par allowlist d'hôte (`cmsassets.rgpub.io` uniquement).
- `poweredByHeader: false`, `output: standalone`, `images.remotePatterns` restreint (2 hôtes), `sw.js` avec CSP stricte propre.
- Rate limiting présent sur `/api/auth` et `/api/community-decks`.

#### ⚠️ À améliorer
- **CSP `script-src` avec `'unsafe-inline'` + `'unsafe-eval'`** : affaiblit la protection XSS. Idéal = nonces/hash (chantier plus lourd). → **Corrigé partiellement** : ajout de `base-uri 'self'`, `object-src 'none'`, `form-action 'self'`.
- **Rate limiting partiel** : étendre aux autres endpoints d'écriture (collection, comments, wishlist, likes) pour limiter l'abus.

#### 🔴 Critique (infra, hors code)
- **Exposition DB prod** : la base Postgres prod serait accessible publiquement (`178.104.237.33:15432` via tunnel socat). À **vérifier et fermer** (firewall / bind localhost / VPN). Voir mémoire `project_prod_db_exposure`.

---

### 2. SEO

#### ✅ Points forts (sur tous les types de page)
- **1 seul `<h1>`** par page, `robots: index, follow`, **canonical**, **OG image**, meta description (100-150 car. en général).
- **Schema JSON-LD riche** : `WebSite` + `Organization` + `SearchAction` global ; `BreadcrumbList` sur les pages détail (tournois, articles) ; `Article` + `Person` (auteur Allan) sur les articles ; `AboutPage` + `Person` + `Organization` sur `/a-propos` (E-E-A-T solide).
- **Technique** : `robots.txt` propre (autorise GPTBot / ClaudeBot / PerplexityBot / Applebot — GEO-friendly ; bloque `/admin` `/api`), **`llms.txt`** présent, **`sitemap.xml` = 23 972 URLs** incluant déjà les 3 nouvelles pages tournois.
- Nouvelles pages tournois : title 64-70 car., desc ~105 car., BreadcrumbList ✓.

#### ⚠️ Corrigé dans cet audit
- **`/guides` : canonical manquant** (seule page concernée) + title/desc trop courts → **corrigé** (canonical ajouté, title + description enrichis).

#### 💡 Opportunités (non bloquantes)
- **Schema `Event`/`SportsEvent`** sur les pages tournois (actuellement seulement BreadcrumbList) : enrichirait les résultats riches pour les compétitions.
- Quelques titles courts (`/a-propos` ~27 car.) — acceptable mais perfectible.
- Sitemap très volumineux (23 972 URLs) : surveiller le budget de crawl (decks/cartes individuels). Déjà adressé en partie (cf. commits sitemap récents).

---

### 3. Plan d'action priorisé

| Priorité | Action | Statut |
|---|---|---|
| 🔴 Critique | Fermer l'accès public à la DB prod (infra) | À faire (infra) |
| 🟠 Haute | Étendre le rate limiting aux endpoints d'écriture | À faire |
| 🟠 Haute | CSP : viser nonces pour retirer `unsafe-inline`/`unsafe-eval` | Backlog |
| 🟢 Moyenne | `/guides` canonical + title/desc | ✅ Fait |
| 🟢 Moyenne | CSP `base-uri`/`object-src`/`form-action` | ✅ Fait |
| 🔵 Basse | Schema `Event` sur pages tournois | Backlog |

**Corrigé dans cette session** : canonical `/guides`, durcissement CSP (base-uri, object-src, form-action).


---

# 31 mai 2026 — Audit site complet (pré-déploiement)

> Source d'origine : `AUDIT-SITE-31MAI-2026.md`

## Audit site complet — 31 mai 2026 (pré-déploiement)

Audit du **dev local** (`localhost:3000` + repo) en vue du passage en production. Lancé via le plugin SEO (6 agents : technique, contenu/E-E-A-T, schema, GEO/IA, performance, sitemap) puis complété et vérifié manuellement sur les points bloquants pour le déploiement.

> Note méthode : les sous-agents SEO ont tourné mais sont revenus en cours de tâche (pas de reprise possible dans cet environnement). Les findings critiques ci-dessous ont donc tous été **re-vérifiés manuellement** (curl + lecture repo). Les pistes non bloquantes signalées par les agents sont listées en section « Recommandations ».

### ✅ Corrigé pendant cet audit (vérifié sur dev)

| # | Domaine | Problème | Correctif | Vérif |
|---|---------|----------|-----------|-------|
| 1 | Robots | `public/robots.txt` (statique) **masquait** `src/app/robots.ts` (dynamique, plus riche) → les règles explicites pour les crawlers IA (GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended) étaient du code mort | Suppression de `public/robots.txt`. `robots.ts` est désormais actif (règles IA + sitemap basé sur `NEXT_PUBLIC_SITE_URL`). Disallow aligné sur `/admin` (sans slash) pour le wildcard | `curl /robots.txt` → règles IA présentes ✓ |
| 2 | Sitemap | La nouvelle page `/guides/meta` était **absente** du sitemap | Ajoutée dans `staticPages` (priorité 0.7, weekly) | `curl /sitemap.xml \| grep guides/meta` → 1 ✓ |
| 3 | GEO / llms.txt | `/guides/meta` absente de `llms.txt` | Ajoutée dans la section « Guides disponibles » | Lecture fichier ✓ |
| 4 | OG / images prod | La route `api/decklist-image` fetchait son fond via `req.nextUrl.origin` = host interne du container Coolify → `fetch failed` en boucle dans les logs prod | Lecture du PNG sur disque + inline en data URI (`readFile` + base64) | typecheck ✓ (effet réel après redeploy) |

### 🟢 Points sains (vérifiés, RAS)

- **En-têtes de sécurité** (`src/middleware.ts`) : CSP complète, HSTS (preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. Solide.
- **`force-dynamic`** correctement posé sur les pages no-param qui interrogent la DB (`sitemap.ts`, `/tournois`) → évite le bug « page gelée vide au build Docker ».
- **`lang=fr`**, viewport mobile, `poweredByHeader: false`.
- **Sitemap** : génération dynamique avec fallback `staticPages` si DB indisponible (build Docker safe). ~9k URLs (cartes, decks, tournois, articles + statiques).
- **JSON-LD** présent : `layout.tsx` (Organization/WebSite) + `articles/[slug]` (Article).
- **Typecheck** : `tsc --noEmit` passe.
- **Nouvelle page `/guides/meta`** : HTTP 200, server component statique (pas de DB), sera prérendue.

### 🟡 Recommandations (non bloquantes pour ce déploiement)

#### Données structurées (impact SEO/IA élevé, effort moyen)
- **BreadcrumbList** : absent partout. À ajouter globalement (fil d'Ariane) → rich results + meilleure compréhension IA.
- **FAQPage** sur les guides : les guides utilisent déjà des titres en questions (« Comment… ? », « C'est quoi… ? »). Les transformer en `FAQPage` JSON-LD = fort potentiel d'AI Overviews / rich snippets. Cible prioritaire : `/guides/debuter`, `/guides/deckbuilding`, `/guides/meta`, `/guides/domaines`.
- **Product / VideoGame / ItemList** : envisager sur `/cartes/[slug]` et les listes (`/tier-list`, `/decks`).

#### Contenu / E-E-A-T
- Vérifier la présence d'un **auteur / entité éditrice** visible (page À propos, signature) pour renforcer E-E-A-T.
- Surveiller le **thin content** sur les pages de liste générées (cartes/decks) : s'assurer d'un minimum de texte unique indexable.

#### Performance (analyse niveau code)
- Vérifier `priority` sur l'image LCP de la home et des articles (next/image), formats webp, dimensions explicites pour éviter le CLS.
- Auditer les composants `"use client"` qui pourraient rester server.
- `/tournois` rend beaucoup de chips de decks : surveiller le poids du payload (mais `force-dynamic` + DB OK).

#### Lint
- Bruit ESLint pré-existant concentré dans les **scripts racine** (`parse-*.js`, `*-coverage.ts` : `no-explicit-any`, `no-require-imports`, unused vars) — hors build app, non bloquant.
- Route OG `decklist-image` : warnings `no-img-element` / `alt-text` **attendus** (satori impose `<img>`, pas `next/image`). À ignorer.

### État de déploiement

- **Bloquants** : aucun. Les 4 corrections sont faites et vérifiées.
- **Build prod** : autoritatif dans Docker/Coolify (déploiement manuel). Typecheck local OK ; build local non lancé pour ne pas écraser le `.next` du serveur dev en cours.
- **Rappel infra** : Coolify = déploiement **manuel** (pas d'auto-deploy). Un `git push` ne met rien en ligne tant qu'Allan ne clique pas Deploy. Le fix image OG ne prend effet qu'après redeploy.


---

# 28 mai 2026 — Deckbuilder V2

> Source d'origine : `RAPPORT-DECKBUILDER-V2.md`

## Rapport Deckbuilder V2 — Riftbound France

**Date** : 28 mai 2026  
**Route** : `/deckbuilder`  
**Swap effectué** : 28 mai 2026 — v2 remplace l'ancien deckbuilder  
**Statut** : Build production OK, 0 erreurs

---

### Structure finale

```
src/app/deckbuilder/
├── page.tsx                    Server Component, fetch cards Prisma
├── layout.tsx                  Layout (cache backup)
├── deckbuilder.tsx             Client Component principal
├── components/
│   ├── card-browser.tsx        Grille + recherche unifiée
│   ├── search-bar.tsx          Barre tokens + autocomplétion
│   ├── deck-panel.tsx          Panel deck + stats + validation intégrés
│   ├── deck-progress.tsx       Barre 6 étapes cliquable
│   ├── deck-stats.tsx          3 graphiques (énergie, type, domaine)
│   ├── deck-validation.tsx     Panneau collapsible erreurs cliquables
│   ├── import-modal.tsx        3 formats (Deck Code, Card Names, TTS)
│   ├── export-modal.tsx        4 onglets (Lien, Code, TTS, Image)
│   ├── rune-suggestion.tsx     Calcul auto + bouton Appliquer
│   └── meta-indicator.tsx      Tier + decks tournoi (fetch API)
└── lib/
    ├── search-parser.ts        Parser tokens type:unit domain:fury energy:3+
    ├── deck-rules.ts           Validation complète (40 main, 12 runes, 3 BF, etc.)
    ├── sample-hand.ts          Fisher-Yates shuffle, tirage 7 cartes
    ├── rune-calculator.ts      Répartition proportionnelle aux domaines
    ├── export-formats.ts       Card Names, TTS, parseurs import
    └── export-image.ts         Export PNG visuel (canvas, images cartes, fond custom)
```

---

### Fonctionnalités

#### UX Flow
- Barre de progression 6 étapes avec compteurs et couleurs
- Validation temps réel, erreurs cliquables
- Sample Hand (7 cartes, mulligan)

#### Recherche unifiée
- Barre unique avec parser de tokens (`type:`, `domain:`, `set:`, `energy:`, etc.)
- Chips colorés, autocomplétion, texte libre

#### Stats du deck
- Courbe d'énergie colorée par domaine
- Distribution par type et par domaine
- Suggestion de runes (minimum 4 par domaine)

#### Import/Export
- Import 3 formats : Deck Code (base64), Card Names, TTS
- Export 4 onglets : Lien de partage, Deck Code, TTS, Image PNG
- Export image visuel : fond custom, images cartes via proxy API, icônes domaine FR, label "RÉSERVE"
- Publication communauté : connexion Discord requise, deck valide obligatoire

#### Règles du deck
- Champions dans le main deck comme unités normales, détection auto via légende
- 3 copies max partagées entre main et réserve
- Réserve capée à 8 cartes
- Runes : 12 total, suggestion minimum 4 par domaine
- Gestion apostrophes (Kai'Sa, Kha'Zix, Rek'Sai)
- Cartes neutres toujours visibles
- Cartes OPP exclues
- Nettoyage signatures à chaque changement de légende

#### Publication communauté
- Connexion Discord obligatoire (utilise le nom et l'avatar du compte)
- Deck doit être valide (légende + 40 main + 12 runes + 1-3 battlefields)
- Validation côté serveur (API renvoie 401 si pas connecté, 400 si deck invalide)

---

### API associées

- `POST /api/community-decks` — Publication (auth requise, validation deck)
- `GET /api/community-decks` — Liste publique, pagination, filtre légende
- `GET /api/image-proxy?url=` — Proxy images CDN pour export canvas (CORS)
- `GET /api/legends/meta?name=X` — MetaIndicator (non implémenté, gère le 404)

---

### Historique du swap

| Date | Action |
|---|---|
| 28 mai 2026 | Création `deckbuilder-v2` |
| 28 mai 2026 | Swap : `deckbuilder` → `deckbuilder-old` → supprimé, `deckbuilder-v2` → `deckbuilder` |
| 28 mai 2026 | Suppression `deckbuilder-old` et `deckbuilder-backup` après build OK |


---

# 27 mai 2026 — Rapport de build

> Source d'origine : `RAPPORT-BUILD.md`

## Rapport de build — Riftbound France

**Date** : 27 mai 2026  
**Domaine** : riftboundfrance.fr  
**Nom du site** : Riftbound France

---

### Resultat

Le projet compile avec **0 erreur TypeScript** et le **build Next.js 16 passe** (30 routes generees). La base de donnees contient 178 decks (best-of de 9 tournois), 15 articles (top 8 + best-of), 4 tier lists (Origins/Spiritforged/Unleashed/Global), et toutes les cartes.

---

### Stack technique

| Composant | Version |
|-----------|---------|
| Next.js | 16.2.6 (App Router, Turbopack) |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | 4 (config CSS, @theme inline) |
| shadcn/ui | 4.8 (New York style) |
| Prisma | 6 (PostgreSQL) |
| Polices | Rubik (display) + Plus Jakarta Sans (body) |

---

### Contenu de la base de donnees

| Entite | Quantite |
|--------|----------|
| Cartes | ~1500 (3 sets + promos) |
| Decks | 178 (tous best-of, featured) |
| Articles | 15 (5 top 8 + 7 best-of RQ + 3 best-of Chine) |
| Tier Lists | 4 (Origins, Spiritforged, Unleashed, Global) |
| Tournois couverts | 9 (Houston, Bologna, Las Vegas, Lille, Atlanta, Sydney, Shanghai CC, Shanghai NO, Xi'an) |

---

### Pages publiques

#### Principales
- `/` — accueil (decks aleatoires, guides, tier list compacte avec onglets OGN/SFD/UNL/ALL)
- `/cartes` — base de cartes avec recherche, filtres, pagination (48/page)
- `/cartes/[id]` — detail carte (image, stats, texte, artiste)
- `/tier-list` — tier lists visuelles avec grille coloree S/A/B/C/D et portraits de legendes
- `/decks` — tous les decks avec filtres (legende, set, tournoi, region, categorie best-of/tournois/guide/communautaire)
- `/decks/[slug]` — detail deck avec visualiseur par sections
- `/articles` — liste articles avec filtres par categorie
- `/articles/[slug]` — article avec blocs (texte, decklists interactives, images, separateurs)
- `/tournois` — calendrier tournois
- `/deckbuilder` — constructeur de deck interactif avec partage communautaire

#### Guides
- `/guides` — hub des guides
- `/guides/debuter` — guide debutant avec icones de domaines
- `/guides/deckbuilding` — guide construction de deck
- `/guides/domaines` — presentation des 6 domaines avec icones
- `/guides/glossaire` — glossaire des termes Riftbound
- `/guides/jouer-en-ligne` — jouer sur TCG Arena et RiftAtlas

#### SEO
- `/sitemap.xml` — sitemap dynamique (cartes, decks, articles, guides, tournois)
- `/robots.txt` — bloque /admin/ et /api/
- JSON-LD schema.org (WebSite + Organization + SearchAction) dans le layout racine

---

### Design system

- **Canvas** : #06060b (fond principal)
- **Surface** : #0c0c14 → #12121e → #1a1a2e (cartes, overlays)
- **Arcane Blue** : #0ea5e9 (accent principal)
- **Runic Gold** : #f59e0b (accent secondaire)
- **Mystic Violet** : #8b5cf6 (accent tertiaire)
- **Ink** : #f1f5f9 → #94a3b8 → #64748b (texte)

#### Tier list visuelle
- S = rouge, A = orange, B = jaune, C = teal, D = gris
- Portraits de legendes (bannieres /bannieres/*.webp) au lieu d'images de cartes completes
- Tooltip au hover avec nom de legende et commentaire
- Onglets par set (Origins/Spiritforged/Unleashed/Global) + indicateur "current"

---

### Corrections et ameliorations (session 27 mai 2026)

#### Tier lists
1. **Seed 4 tier lists** : Origins, Spiritforged, Unleashed, Global avec correspondance de noms complexe (virgule/tiret, variantes, Master Yi Wuju Master vs Bladesman)
2. **Redesign visuel** : grille coloree S/A/B/C/D avec portraits de legendes, tooltips, onglets par set
3. **Images portraits** : correction des images qui affichaient la carte complete au lieu du portrait — utilisation de `getBannerUrl()` pour les bannieres `/bannieres/*.webp`

#### Articles et decks
4. **Cover images** : assignation d'images de couverture a tous les articles (images dans `/img/articles/` + fallback `/bannieres/tournois.webp`)
5. **Best-of dans /decks** : creation de 110 Deck records depuis les blocs decklists des 7 articles best-of manquants (Houston, Bologna, Las Vegas, Lille, Shanghai CC, Shanghai NO, Xi'an) — total 178 decks
6. **Resolution legendes** : correction dans articles et decks pour gerer le format comma ("Kai'sa, Daughter") vs tiret ("Kai'Sa - Daughter") et les legendes variantes-seulement (Annie, Lux)

#### Accueil
7. **Suppression "Base de cartes"** du bloc guides sur la homepage

#### Cartes
8. **Battlefield centering** : les cartes Battlefield (format paysage) sont maintenant centrees dans la grille sans etre croppees — conteneur portrait avec image centree verticalement

#### Guides
9. **Icones de domaines** : remplacement des cercles colores par les vrais icones `/icons/{Domain}.webp` dans les guides debuter et domaines
10. **Accents francais** : correction des accents manquants dans deckbuilding, domaines (energie, deployer, degats, unites, etc.)

#### SEO
11. **Sitemap** : ajout des pages manquantes (domaines, jouer-en-ligne, tournois)
12. **JSON-LD** : schema WebSite + Organization + SearchAction dans le layout racine

#### TypeScript
13. **3 erreurs pre-existantes corrigees** :
    - `seed-remaining-top8.ts` : type `string` → union litterale pour section
    - `admin/decks/import/route.ts` : "champion" → "legend" dans DeckSection
    - `deckbuilder.tsx` : assertions de type pour indexation DeckState

---

### Demarrage rapide

```bash
## 1. Installer les dependances
npm install

## 2. Configurer l'environnement
cp .env.example .env

## 3. Demarrer PostgreSQL + appliquer le schema
docker compose up db -d
npx prisma db push

## 4. Synchroniser les cartes
npm run sync-cards

## 5. Seeder les donnees
npx tsx scripts/seed-tier-lists.ts
npx tsx prisma/seed-bestof-articles.ts
npx tsx prisma/seed-atlanta-bestof.ts
npx tsx prisma/seed-sydney-bestof.ts
npx tsx scripts/seed-bestof-decks.ts
npx tsx prisma/seed-remaining-top8.ts

## 6. Demarrer le serveur de developpement
npm run dev
```


---

# 25 mai 2026 — Rapport d'audit initial

> Source d'origine : `RAPPORT-AUDIT.md`

## Rapport d'audit — Riftbound France

**Date :** 25 mai 2026
**Stack :** Next.js 16.2.6 / React 19 / Prisma 6 / PostgreSQL / Tailwind CSS 4

---

### Architecture

| Categorie | Nombre |
|-----------|--------|
| Pages publiques | 17 routes |
| Pages admin | 8 routes |
| API endpoints | 13 |
| Composants | 39 |
| Lib/utils | 10 |
| Modeles Prisma | 8 |
| Assets statiques | 47 fichiers |

### Pages principales

- **/** — Homepage avec hero carousel
- **/cartes** — Base de donnees (~2000+ cartes)
- **/decks** — 68 decks publies (40 Unleashed + 28 Spiritforged)
- **/deckbuilder** — Constructeur de deck interactif
- **/articles** — 4 articles publies (best-of, top 8 Atlanta & Sydney)
- **/guides** — Debutant, deckbuilding, domaines, glossaire
- **/tier-list** — Tier list par legende
- **/community-decks** — Decks partages par la communaute
- **/tournois** — Calendrier des evenements

### Donnees en base

- **Cartes :** Import Riftcodex (sets Unleashed, Spiritforged, Origins)
- **Decks :** 68 publies — 40 Unleashed (Sydney best-of, city challenges), 28 Spiritforged (Atlanta best-of)
- **Articles :** 4 publies — best-of-sydney, best-of-atlanta, top-8-atlanta, top-8-sydney
- **Decklists JSON :** 134 fichiers (45 Sydney + 89 Atlanta)
- **Tournaments :** atlanta-regional.json, sydney-regional (index)

### Fonctionnalites

| Feature | Statut |
|---------|--------|
| Base de cartes avec filtres | OK |
| Pages de deck avec guide | OK |
| Deckbuilder interactif | OK |
| Import/export deck code | OK |
| Export PNG des decklists | CORRIGE (CORS fix) |
| Partage de deck communautaire | OK |
| Articles avec blocs (texte, decklist, image, sponsor) | OK |
| Tier list editable (admin) | OK |
| Calendrier des evenements | OK |
| Systeme admin (auth JWT) | OK |
| Sync cartes Riftcodex | OK |
| SEO (robots.txt, sitemap, metadata) | OK |

### Changements de cette session

#### Nouveautes
1. **Analytics Google (GA4)** — Script + banniere cookies RGPD (`src/components/analytics.tsx`)
2. **Glossaire enrichi** — Chaque mot-cle affiche une carte exemple au hover (`glossaire-client.tsx`)
3. **Drapeaux de tournois** — Emoji flags pour Regional Qualifiers (US, AU, etc.) (`tournament-flags.ts`)
4. **Filtres par tournoi/pays/continent** — Page /decks filtre par tournoi, region Occident/Asie
5. **Legendes dans les articles** — Tags de legendes affichees sur les cartes articles

#### Corrections
6. **Export PNG repare** — Pre-conversion des images en data URLs, suppression srcset, pixelRatio 2x
7. **Tooltips cartes enrichis** — Domaines (runes colores), cout energy/power, might, rarete coloree
8. **Vue liste enrichie** — Colonnes Might et Domaines ajoutees

#### Optimisations
9. **Images WebP** — Bannieres et logos convertis en `<Image>` Next.js (auto WebP, lazy loading)
10. **Footer nettoye** — Tournois retire, liens communaute ajoutes (deckbuilder, decks communautaires)

### Points techniques a noter

- **Prisma client DLL lock** — Le dev server bloque `prisma generate`. Workaround : `$queryRaw`/`$executeRaw` pour le champ `setTag`. Corriger en stoppant le dev server puis `npx prisma generate`.
- **41 cartes champion/variant** non en DB — Cartes comme "Kai'Sa, Survivor", "Irelia, Fervent" qui sont dans les decklists mais pas dans la table Card. N'affecte pas le fonctionnement.
- **tournament_page.html** — Fichier de 6.3 MB dans public. A nettoyer si non utilise.

### Erreurs TypeScript

2 erreurs pre-existantes dans `deckbuilder.tsx` (types DeckEntry) et 1 dans `admin/decks/import` (section "champion"). Aucune nouvelle erreur introduite.

### Taches en attente (screenshots requis)

- **Ombre des images de decklist** — Allan envoie une capture pour voir le probleme
- **Problemes de hover des cartes** — Allan envoie une capture pour diagnostiquer
- **Accents dans les articles** — Besoin de voir le rendu exact sur le site

### Prochaines etapes suggerees

1. Regenerer le client Prisma (stop dev → `npx prisma generate` → restart)
2. Ajouter `NEXT_PUBLIC_GA_ID=G-...` dans le `.env` pour activer les analytics
3. Ajouter de nouveaux tournois dans `tournament-flags.ts` quand ils arrivent
4. Convertir les bannieres PNG en WebP physiquement pour le build statique
5. Nettoyer tournament_page.html si non necessaire
6. Ajouter des cover images aux articles pour la page /articles


---

# 24 mai 2026 — Audit de sécurité

> Source d'origine : `docs/SECURITY-AUDIT.md`

## Audit de sécurité — Riftbound France

**Date** : 2026-05-24
**Auditeur** : Claude Opus 4.6

---

### Résumé

17 vulnérabilités identifiées. **10 corrigées**, 7 restantes (faible priorité ou nécessitent configuration serveur).

### Vulnérabilités corrigées

#### ~~CRITIQUE — Endpoint sync-cards sans authentification~~
- **Fichier** : `src/app/api/sync-cards/route.ts`
- **Fix** : Ajout vérification `isAdmin()` avant toute opération.

#### ~~CRITIQUE — Comparaison de mot de passe en string simple~~
- **Fichier** : `src/lib/auth.ts`
- **Fix** : Utilisation de `crypto.timingSafeEqual()` pour éviter les timing attacks.

#### ~~CRITIQUE — Session cookie forgeable (valeur statique)~~
- **Fichier** : `src/lib/auth.ts`, `src/app/api/auth/route.ts`
- **Fix** : Session signée avec HMAC-SHA256 + nonce aléatoire + timestamp. Vérification de signature côté serveur.

#### ~~HIGH — XSS via markdown (HTML brut injecté)~~
- **Fichier** : `src/components/markdown-renderer.tsx`
- **Fix** : `skipHtml` activé + whitelist `allowedElements` stricte.

#### ~~HIGH — Community decks sans validation d'input~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Limites de longueur (titre 200, deckCode 10K, nom 60, desc 500). Validation de types.

#### ~~HIGH — Pas de rate limiting~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Rate limit en mémoire (5 req/min par IP sur POST).

#### ~~HIGH — Génération de share codes avec Math.random()~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : Utilisation de `crypto.randomBytes()`.

#### ~~HIGH — Pagination non bornée~~
- **Fichier** : `src/app/api/community-decks/route.ts`
- **Fix** : `page` clampé entre 1 et 100.

### Vulnérabilités restantes (à traiter en production)

#### MEDIUM — Mot de passe admin en clair dans .env
- **Risque** : Si le .env est exposé, l'admin est compromis.
- **Recommandation** : Utiliser bcrypt pour hasher le password et stocker le hash. Ou passer à un provider OAuth (NextAuth).
- **Note** : `.env` est bien dans `.gitignore`.

#### MEDIUM — Pas de CSRF token sur les mutations admin
- **Risque** : Un site malveillant pourrait déclencher des actions admin si l'utilisateur est connecté.
- **Recommandation** : Ajouter un middleware CSRF ou des tokens par formulaire. `sameSite: "lax"` sur le cookie offre une protection partielle.

#### MEDIUM — Pas de validation d'input sur les routes admin
- **Fichiers** : `src/app/api/admin/articles/route.ts`, `events/route.ts`, `decks/route.ts`, `tier-list/route.ts`
- **Risque** : Données malformées ou excessivement longues.
- **Recommandation** : Ajouter Zod ou un schéma de validation sur chaque route admin.

#### MEDIUM — Pas d'audit logging
- **Risque** : Impossible de tracer qui a fait quoi.
- **Recommandation** : Logger les actions admin (création/modification/suppression) avec timestamp et IP.

#### LOW — Credentials par défaut (`postgres`)
- **Risque** : Seulement en développement local.
- **Recommandation** : Changer le mot de passe admin ET DB avant tout déploiement.

#### LOW — Variable SESSION_SECRET manquante
- **Risque** : Fallback sur ADMIN_PASSWORD pour signer les sessions.
- **Recommandation** : Ajouter `SESSION_SECRET` dans `.env` avec une valeur aléatoire de 64+ caractères.

#### LOW — Rate limiting en mémoire uniquement
- **Risque** : Se reset au redémarrage, ne marche pas en multi-instance.
- **Recommandation** : Utiliser Redis ou un service de rate limiting (Vercel Edge) en production.

---

### Checklist avant déploiement

- [ ] Changer `ADMIN_PASSWORD` (mot de passe fort)
- [ ] Ajouter `SESSION_SECRET` dans `.env` (64+ chars aléatoires)
- [ ] Changer le mot de passe PostgreSQL
- [ ] Vérifier que `.env` n'est pas versionné
- [ ] Considérer bcrypt pour le password ou OAuth
- [ ] Configurer rate limiting niveau infra (Vercel/Cloudflare)
- [ ] Activer les headers de sécurité (CSP, HSTS, X-Frame-Options)

