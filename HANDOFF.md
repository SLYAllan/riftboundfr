# HANDOFF — état des lieux

## Session du 28 août 2026 — overlay en chinois (poussé sur main)

Poussé sur `origin/main`. Tout est vert (`tsc` 0, 59 fichiers de test / 312 tests,
`lint` 0 erreur, `next build` 0). Rien ne touche à la base ni à la prod :
`data/cards-zh.json` est un fichier, pas un seed. **Le déploiement Coolify reste à
déclencher** pour que /zh existe en ligne.

### Ce qui existe maintenant

**`/zh` est une troisième langue du site, traduite pour le SEUL overlay** : sa page,
le tableau de bord `/profil/overlay`, le compagnon et la barre de navigation.
Dictionnaire `src/lib/i18n-zh.ts` (188 entrées), indexé par le texte français comme
l'anglais. Le reste du site sort en français sous `/zh`, d'où le `noindex` posé par
le middleware sur tout `/zh`.

Le choix de langue **n'est pas dans la barre du site** : il est dans les réglages du
tableau de bord, parce que c'est là qu'on copie les liens OBS et compagnon, qui
portent le préfixe de la page. Un streamer qui choisit le chinois donne à ses joueurs
un compagnon en chinois, sans autre réglage.

Police **Noto Sans TC**, chargée depuis Google Fonts uniquement sur `/zh`, placée
APRÈS Rubik, Jakarta et Arpona dans les piles : le latin garde les polices du site.

**Cartes chinoises** : images et noms, relevés par `npm run maj:cartes-zh` dans
`data/cards-zh.json` (**1 148 images, 1 127 noms**, tous sets). Résolution dans
`src/lib/cards-zh.ts`, branchée sur `/api/cards/preview?langue=zh`, le passage unique
des images de l'overlay, et sur `/api/cards/noms-zh` + `use-noms-zh` pour les noms.
Les listes déroulantes affichent le nom chinois mais gardent le nom d'origine en
VALEUR : c'est lui qui voyage dans l'état et retrouve la carte en base.

**La source est le figurier OFFICIEL de l'éditeur chinois**,
`lol-api.playloltcg.com/xcx/card/searchCardCraftWeb`. Son adresse n'est documentée
nulle part : elle est dans le `js/request/request.js` de playloltcg.com, et la page
du figurier est `card.html`, pas `cardgallery`. Elle rend les 1 261 cartes d'un coup,
avec le nom, le texte et l'adresse de l'image sur le CDN de l'éditeur.

Le premier jet passait par un miroir communautaire sur GitHub, dont le figurier
s'arrêtait à Spiritforged : Unleashed et Vendetta n'avaient donc aucun nom chinois, et
son README interdisait l'usage commercial. Le figurier officiel a réglé les deux d'un
coup : 543 noms de plus, et plus rien qui vienne d'un dépôt tiers.

### La routine de l'overlay

`npm run maj:overlay` (`-- --sec` pour un essai à blanc), à lancer après chaque
sortie de set, une fois `sync-cards` passé. Deux étapes : les cartes chinoises, puis
l'inventaire des Légendes sans bannière ni icône — la panne silencieuse de l'overlay,
qu'on ne voyait jusqu'ici qu'en direct. Au 28 août 2026 : 48 Légendes en base, 48 avec
bannière, 48 avec icône, rien à fournir.

### Les limites, à dire avant de promettre

1. **Les cartes chinoises sont en SIMPLIFIÉ**, pas en traditionnel (le code « SC » est
   imprimé en bas de chaque carte). Aucune source en traditionnel n'existe : Riftcodex
   n'a pas de locale, `tc.playloltcg.com` n'a pas de figurier, l'API Riot est limitée à
   l'anglais pendant la bêta. Allan a tranché : interface en traditionnel, images en
   simplifié.
2. **Les champs de bataille gardent leur image d'origine.** L'éditeur range ces cartes
   paysage dans un fichier portrait, tournées d'un quart de tour : leur texte chinois
   s'affichait à la verticale dans le cadre. Leur NOM, lui, est bien traduit.
3. **10 cartes sont refusées** par le contrôle énergie + puissance, et restent en
   anglais. C'est voulu : mieux vaut l'anglais qu'un nom pris à une autre carte.

### Deux pièges payés

- **La clé d'une carte chinoise est le `riftboundId`, jamais `set` + `collectorNumber`.**
  Dans Vendetta, les cartes des decks de départ (`ven-sp4-006`) portent aussi les numéros
  1 à 4 : « VEN numéro 1 » rendait Kai'Sa, Survivor au lieu de Baccai Sandspinner.
- **Un dataset communautaire peut être périmé sans le dire.** Le figurier recopié dans le
  miroir GitHub n'avait ni Unleashed ni Vendetta, alors que le figurier officiel, lui, les
  a. Deux heures de « ces noms n'existent pas » pour une copie vieille de quelques mois :
  chercher la source d'origine avant de conclure qu'une donnée n'existe pas.
- **Un numéro qui concorde ne prouve pas que c'est la même carte.** La routine n'accepte
  un nom que si l'énergie ET la puissance concordent aussi. Un nom a déjà été refusé par
  ce test au premier relevé.


## Session du 27 août 2026 (3) — poussé sur main ET en production

Trois commits sur `origin/main` : `573e4050` (tournois), `298845ec` (stats),
`e46bf078` (site), puis `026932f3` (article Best-Of).

**La production est à jour côté DONNÉES** : 25 008 decks publiés, Barcelone
(106 decks, 36 best-of) et Dongguan (98) seedés, les cinq tier lists refaites,
les deux articles publiés. **Le déploiement Coolify du CODE reste à déclencher**
pour que les changements de pages passent en ligne.

### La règle qui change tout

**On compte les joueurs CLASSÉS, plus les decklists publiées.** Une part de méta
calculée sur les listes suppose que ceux qui publient ressemblent aux autres.
C'est faux : Barcelone publie 106 listes pour 2 127 joueurs, Utrecht 55 pour
1 807. Ce sont ceux qui performent qui envoient leur liste.

Corpus : **35 597 joueurs classés sur 111 tournois**, dont 30 au classement
complet scrapé. Contrôlé contre le tableau officiel de Riot pour Barcelone :
9 places d'écart sur 2 131.

`scripts/corpus-tournois.ts` porte la définition unique. Avant lui, la tier list
donnait 802 joueurs à Ahri et sa fiche 283 : deux pages, deux chiffres.

**`npm run maj:stats` enchaîne les cinq étapes dans l'ordre.** Ne jamais relancer
ces scripts un par un, ils se lisent l'un l'autre.

### Ce que le corpus a corrigé

- **Miss Fortune** était en D sur « 0,4 %, la pire du set ». Elle est à 10,7 %
  sur 394 joueurs, soit la moyenne.
- **Vex** était en C pour « piège volume ». L'écart ne tient aucun test.
- **Akali** n'avait pas « zéro Top 8 » : 11 places en coupe sur 201 joueurs.
- **L'accueil** classait les Légendes toutes ères : il ouvrait sur le méta
  d'Origines, sans Kennen.

### Quatre pièges payés cette session

1. **riftdecks marque ses pages.** Dans le titre H1 d'un deck, des lettres
   latines sont remplacées par des cyrilliques identiques à l'oeil (U+0430).
   `sansHomoglyphes` les rend. **336 decks déjà en base en portent encore un**
   (Lille 78, Suzhou 61, Atlanta 56, Fuzhou 51…), à reparser et reseeder.
2. **`spawnSync` sous Windows.** Avec `shell: true` les guillemets sautent, sans
   shell rien ne se lance. Le premier seed prod a écrit « Barcelona » au lieu de
   « Barcelona Regional Qualifier », set « Regional », tag « Qualifier », tout
   décalé d'un argument, **sans le moindre message d'erreur**. Passer la variable
   d'environnement au shell directement. Et vérifier le résultat EN BASE, pas
   dans la sortie du script.
3. **Un tournoi à moitié scrapé** entrait en silence dans le corpus, et une page
   complète qui ne couvre qu'une fraction du champ aussi. Deux garde-fous dans
   `classements-tournois.mts`.
4. **`.next/dev/types/validator.ts`** garde la liste des routes du dernier build.
   Supprimer une page fait échouer le build tant qu'on ne l'a pas retiré.

### Limite des sources, vérifiée

**Riftdecks ne publie pas le classement complet de six tournois** : Bologna
(120 classés annoncés pour 1 719 joueurs), Las Vegas (130 pour 1 670), Houston
(66 pour 1 347), Fuzhou RQ, Beijing RO jour 1, Chengdu CC du 9 novembre. Environ
5 200 joueurs hors corpus. Vérifié en les scrapant : **la donnée n'existe pas**,
ce n'est pas un scrape à relancer. `couverture-tournois.mts` les marque
« indispo. ».

### Autres changements

- **`/guides/meta` supprimée**, redirigée en 301 vers `/tier-list`. Elle portait
  une seconde tier list écrite en dur et se disputait 16 requêtes avec
  `/tier-list` : 438 impressions pour 14 clics, dont 98 impressions et zéro clic
  sur « riftbound meta ». Vérifié dans Search Console avant de supprimer.
- **Fiche carte** : le prix CardNexus et le bouton d'achat sont affichés, et
  l'offre JSON-LD correspond. Search Console refusait le `Product` sans offre.
  Ajouter l'offre seule aurait été un balisage sans contrepartie visible, ce qui
  est pire. Les 48 cartes sans prix passent en `Thing`.
- **Fiche Légende** : la première decklist proposée vient du set le plus récent.
  Une 1re place de Déchaînement passait devant un best-of de Vendetta.
- **Deux articles Barcelone** : le récap du Top 8 et le Best-Of (36 listes).

### Reste à faire

- **Déclencher le déploiement Coolify** pour le code.
- Les 336 pseudos marqués, en local et en prod.
- Quatre tournois hexgate écartés par la règle des 128 joueurs (Jinan 78,
  Coupe du Tsar 93, Xi'an 67, 233 à 64). Leur brut est scrapé.

## Session du 27 août 2026 (2) — les quatre sets sur le même corpus

Suite de la précédente. Tout le site compte désormais les joueurs CLASSÉS, plus
les decklists publiées, sur les quatre sets et le cumul toutes ères.

### Le corpus

**35 597 joueurs classés sur 111 tournois**, dont 30 au classement complet
scrapé. Par set : Vendetta 5 260, Unleashed 13 979, Spiritforged 9 685,
Origines 6 673. Produit par `scripts/classements-tournois.mts`, calculé par
`scripts/tier-stats.mts [set|tous]`.

Les cinq tier lists en base sont réécrites dessus : Origines 16, Spiritforged 28,
Unleashed 40, Vendetta 48, Globale 49. Chacune vérifiée contre le corpus, aucune
Légende en trop ni manquante.

### La limite, et elle est nette

**Riftdecks ne publie pas le classement complet de six tournois** : Bologna
(120 listes annoncées pour 1 719 joueurs), Las Vegas (130 pour 1 670), Houston
(66 pour 1 347), Fuzhou RQ, Beijing Regional Open jour 1 et la City Challenge de
Chengdu du 9 novembre. Environ 5 200 joueurs restent invisibles.

**Vérifié en les scrapant : ce n'est pas un scrape à relancer, la donnée n'existe
pas.** `scripts/couverture-tournois.mts` les marque « indispo. » pour qu'on ne
les réclame plus, et sépare dans son total les joueurs récupérables de ceux qui
ne le sont pas.

### Deux garde-fous ajoutés au corpus

- **Un tournoi à moitié scrapé** est refusé : le script compare ses lignes au
  total que riftdecks annonce lui-même en pied de page. Lille à 74 % a été écarté
  en cours de scrape, puis accepté une fois complet.
- **Une page complète mais qui ne couvre qu'une fraction du vrai champ** est
  refusée aussi. Bologna annonce 120 classés pour 1 719 joueurs : sans ce second
  refus, un top 120 passait pour un tournoi entier, avec une coupe à 10 % de
  douze joueurs. C'est exactement le biais qu'on corrige, il ne fallait pas le
  réintroduire par la porte du corpus.

### Ce que le nouveau corpus a corrigé

- **Miss Fortune** : classée D en Unleashed sur « 0,4 %, la pire conversion du
  set ». Elle est à 10,7 % sur 394 joueurs, la moyenne exacte.
- **Vex** : classée C sur « le piège volume est démontré ». Il ne l'était pas,
  8,6 % sur 537 joueurs, écart non significatif.
- **Akali** : « zéro Top 8 » sur 74 listes publiées ; 11 places dans la coupe des
  10 % sur 201 joueurs classés.
- **Kai'Sa** n'est pas la deuxième Légende de Vendetta mais la quatrième, et elle
  est chinoise : 10,3 % du champ en Chine, 0,8 % à Barcelone.

### Pages et documents

- **`/meta`** compte les joueurs classés. Vérifié : le total Hartford y vaut
  1 647 et non 104. La clé du cache porte la taille de l'agrégat, sinon la page
  servait l'ancien jeu de données après chaque régénération.
- **`/legendes`** : rangs alignés sur les tier lists, date du relevé réelle (elle
  était **codée en dur au 17 août** dans `fiches-maj`), et une pastille nouvelle
  qui donne la présence en tournoi (« 568 joueurs en tournoi · 18,5 % en coupe »).
- **`docs/META-KNOWLEDGE.md` v12** : les quatre sets et le cumul toutes ères
  refaits. Les lectures éditoriales de mai 2026 sont gardées, marquées comme
  historiques.
- **`docs/DECKBUILDING-RULES.md` v11** : ratio, 30 cartes, 15 terrains, paires de
  domaines et 18 titres de section recalculés sur **24 962 listes** au lieu des
  7 987 annoncés depuis mai. Sections 7 et 9 marquées historiques.

### Outils

| Script | Ce qu'il fait |
|---|---|
| `scrape-classement.sh <slug> <url>` | les pages de classement seules, 26 appels au lieu de centaines |
| `classements-tournois.mts` | le corpus, avec ses deux garde-fous |
| `tier-stats.mts [set\|tous]` | Wilson + binomial, coupe proportionnelle, fusion des deux sources |
| `couverture-tournois.mts [set]` | l'état de la couverture par set |
| `stats-deckbuilding.mts [set]` | les sections chiffrées de DECKBUILDING-RULES |

`tier-stats-vendetta.mts` a été renommé `tier-stats.mts` : il ne pouvait plus
s'appeler « vendetta » en calculant les quatre sets.

### Contrôles

`npx tsc --noEmit` sortie 0 · `npx next build` sortie 0 · 56 fichiers et 300
tests verts · `npm run lint` 0 erreur, 97 avertissements connus.

### Reste à faire

- 336 pseudos marqués par les homoglyphes riftdecks, encore en base.
- Quatre tournois hexgate écartés par la règle des 128 joueurs.
- Rien n'est commité ni poussé.

## Session du 27 août 2026 — le méta Unleashed était faux, et on sait pourquoi

### Ce qui s'est passé

Suite directe de la veille : le corpus des tier lists compte désormais les joueurs
CLASSÉS, plus les decklists publiées. Allan a signalé que le méta Unleashed
paraissait faux. Il l'était, et la cause est mesurable.

Les Regional Qualifier occidentaux ne publient presque aucune liste :

| Tournoi | Listes | Classés | Couverture |
|---|---:|---:|---:|
| RQ Utrecht | 55 | 1 807 | 3 % |
| RQ Sydney | 36 | 1 234 | 3 % |
| RQ Hartford | 104 | 1 651 | 5 % |
| RQ Vancouver | 128 | 1 496 | 7 % |
| Suzhou Regional | 511 | 638 | 80 % |
| City Challenges chinoises | ~128 | 128 | > 90 % |

Le « méta Unleashed » n'était donc qu'un méta chinois. **6 826 joueurs
n'existaient pas dans l'ancien corpus.** Leur classement est maintenant relevé.

### Deux verdicts retournés

- **Miss Fortune** était en D : « 228 decks pour 1 seul Top 8, 0,4 %, la pire
  conversion du set, dix fois sous la moyenne ». Elle est à **10,7 % sur
  394 joueurs**, soit la moyenne exacte du format.
- **Vex** était en C : « le piège volume est démontré, pas supposé ». Il ne
  l'était pas. **8,6 % sur 537 joueurs**, écart à la moyenne non significatif.

Les deux décrivaient la publication, pas le jeu.

### Outils posés

- **`scripts/scrape-classement.sh <slug> <url>`** : scrape UNIQUEMENT les pages
  de classement. 26 appels pour Hartford là où le scrape des decks en coûte des
  centaines. La Légende figure dans la ligne **même sans decklist publiée**,
  vérifié avant de lancer.
- **`scripts/couverture-tournois.mts [set]`** : dit, par set, quels tournois sont
  sous-publiés et lesquels ont déjà leur classement relevé. C'est le tableau
  ci-dessus, en une commande.
- **`scripts/tier-stats.mts [set]`** (ex-`tier-stats-vendetta.mts`, renommé : il
  ne pouvait plus s'appeler « vendetta » en calculant Unleashed). Il **fusionne**
  les deux sources : classement complet là où il existe, listes publiées ailleurs
  mais seulement au-dessus de 90 % de couverture. Ne prendre que le classement
  serait aussi faux : les cinq tournois relevés d'Unleashed sont tous occidentaux.

### Trois pièges corrigés dans le corpus

- **Un tournoi à moitié scrapé entrait en silence.** `classements-tournois.mts`
  compare maintenant le nombre de lignes au total annoncé par riftdecks
  (« out of 1,659 total ») et refuse sous 90 %. Une part bâtie sur les premières
  pages n'est pas approximative, elle est à l'envers.
- **Deux nommages de fichiers de deck coexistent** sur le disque
  (`deck-1-0-153021.md` et `deck-153021.md`) selon le scrape qui a produit le
  dossier. Suzhou ressortait à 0 % de Légendes sans ça.
- **`/meta` servait un cache périmé.** La clé `unstable_cache` ne bougeait pas
  quand `meta-parts.json` changeait. Elle porte maintenant la taille de
  l'agrégat.

### Ce qui a été refait

- **Tier list Unleashed** : 40 Légendes, exactement celles du corpus, sur
  13 979 joueurs classés (34 tournois). Cinq écarts tiennent un test binomial
  au-dessus de la moyenne, quatorze en dessous.
- **`docs/META-KNOWLEDGE.md` v11** : section 2.2 réécrite, avec le tableau de
  couverture et les deux verdicts retournés.
- **Les fiches Légendes** : `competitiveResults` vient désormais du classement
  (Kennen : 568 joueurs classés, 18,5 %, au lieu de 264 listes et 12,9 %), et la
  date du relevé n'est plus **codée en dur au 17 août** dans `fiches-maj`.
  Toutes les fiches affichaient cette date-là quel que soit le jour du calcul.
- **`/meta`** : vérifié au navigateur, le total Hartford y vaut 1 647, le nombre
  de joueurs classés, et non 104, le nombre de listes.

### Pour demain : Spiritforged et Origines

Le diagnostic est fait, le remède est le même, les adresses sont déjà dans le
dépôt. `npx tsx scripts/couverture-tournois.mts` donne l'état à jour.

| Set | Joueurs invisibles | À relever |
|---|---:|---|
| Spiritforged | 6 967 | Atlanta 6 %, Bologna 7 %, Lille 7 %, Las Vegas 9 %, Fuzhou 64 % |
| Origines | 1 934 | Beijing RO J1 1 %, Houston 6 %, Chengdu CC 50 % |

Compter environ 90 pages pour Spiritforged et 30 pour Origines, soit une
vingtaine de minutes de scrape. Les URL « final standings » d'Atlanta, Bologna,
Lille, Las Vegas et Houston sont déjà dans `data/raw-scrapes/`.

**Vendetta est à zéro joueur invisible.**

### Reste à faire, inchangé

- 336 pseudos marqués par les homoglyphes riftdecks, encore en base.
- Quatre tournois hexgate écartés par la règle des 128 joueurs (Jinan 78,
  Coupe du Tsar 93, Xi'an 67, 233 à 64).
- Rien n'est commité ni poussé.

## Session du 26 août 2026 (3) — article Barcelone réécrit

L'article `recap-barcelone-rq-top8` a été réécrit pour retirer les formules et le
rythme typiques d'un texte produit par IA. La source reste
`scripts/seed-barcelone-article.mts`. Le skill commun
`.agents/skills/reecrire/SKILL.md` porte désormais les règles de ton naturel ; le
panneau `.claude/skills/reecrire/SKILL.md` y renvoie toujours.

Publication en production le 26 août via le tunnel PostgreSQL public
`178.104.237.33:15432`. `npm run validate:decks` : 23 522 listes vérifiées, aucun
écart, sortie 0. Seed : sortie 0. La page de production répond 200. Le port public
était encore ouvert après le seed : le fermer côté serveur.

## Session du 26 août 2026 (2) — le méta se compte sur les classements, plus sur les listes

### Le changement de fond

Tout se comptait jusqu'ici sur `data/decklists/`, donc sur les listes **publiées**.
Ce corpus est biaisé, et lourdement : Barcelone publie 106 listes pour 2 127
joueurs classés (5 %), Ottawa 40 pour 579 (7 %). Ce ne sont pas des joueurs tirés
au hasard, ce sont ceux qui ont assez bien fini pour envoyer leur liste.

Une liste incomplète reste écartée de la publication, et c'est la bonne règle.
Mais elle dit quand même **quelle Légende a joué et à quelle place**, et c'est
tout ce dont une part de champ et une conversion ont besoin.

`scripts/classements-tournois.mts` reconstruit donc le classement complet de
chaque tournoi : **5 260 joueurs classés sur 23 tournois Vendetta, 100 % avec une
Légende identifiée.** Il écrit `data/tournaments/classements.json` (corpus) et
`data/tournaments/meta-parts.json` (agrégat léger pour le site).

**Contrôlé contre le tableau officiel de Riot pour Barcelone : 9 places d'écart
sur 2 131, soit 0,42 %, aucune Légende en trop ni manquante.**

Deux pièges déjà payés, tous les deux dans le script :

- **hexgate se rattache par `card_no`, jamais par le nom.** Il appelle
  « Wuju Bladesman - Starter » la carte OGS-19, qui est Master Yi, Wuju Bladesman.
  Sur le nom, 134 joueurs partaient dans une Légende fantôme et Master Yi perdait
  autant.
- **La taille d'un tournoi, c'est le nombre de lignes relevées, pas le rang le
  plus élevé.** riftdecks laisse des trous dans sa numérotation : 2 216 comme
  dernier rang à Barcelone pour 2 127 lignes.

**La coupe est proportionnelle, 10 % du champ de chaque tournoi.** Un Top 8 sur
128 joueurs vaut 6,3 % du champ, sur 2 127 il vaut 0,4 %. Un Top 8 fixe notait
les Regional et les City Challenge sur deux barèmes.

### Ce qui a été refait dessus

- **Tier list Vendetta** (`scripts/seed-tier-lists.ts`, seedée) : 48 Légendes,
  exactement celles du corpus. Deux écarts seulement tiennent un test binomial,
  Kennen (18,5 %, p < 0,001) et Master Yi Wuju Bladesman (14,4 %, p = 0,002) ;
  onze sont établies en dessous. Le reste est un classement de lecture, et le dit.
- **`docs/META-KNOWLEDGE.md` v10** : section Vendetta réécrite sur le corpus.
- **`docs/DECKBUILDING-RULES.md` v10** : cores recalculés sur 2 569 decklists,
  21 Légendes au-dessus du seuil de 30 listes (17 avant).
- **`data/fiches/`** : 30 fiches recalées par `fiches-maj`, et **18 tiers alignés
  sur la tier list**. Le script signalait l'écart depuis toujours sans pouvoir le
  corriger ; il l'écrit maintenant avec `--ecrire`. Sans ça `/legendes` et
  `/tier-list` classaient 18 Légendes différemment.
- **`/meta`** lit `meta-parts.json` pour les tournois dont le classement est
  relevé, et retombe sur le comptage par decklist pour les autres (les sets
  antérieurs à Vendetta). Vérifié au navigateur : Kennen à Barcelone y vaut 270,
  le nombre de joueurs classés, et non 10, le nombre de listes publiées.

### Deux corrections que le changement de corpus a révélées

- **Akali n'était pas « à zéro Top 8 ».** L'ancien relevé lisait 0 sur 74 listes
  publiées ; sur 201 joueurs classés elle place 11 fois dans la coupe des 10 %.
  Elle reste établie sous la moyenne, mais à 5,5 %, pas à zéro.
- **Kai'Sa n'est pas la deuxième Légende du format.** Elle est quatrième, et
  surtout elle est chinoise : 10,3 % du champ en Chine, 0,8 % à Barcelone.

### La rotation des Best-Of, à ne pas confondre avec une faiblesse

Huit Légendes n'ont eu aucun pilote à Barcelone : Ahri, Darius, Garen, Jinx,
Lee Sin, Leona, Volibear, Yasuo. Toutes d'Origines. Elles n'ont plus de Best-Of
à gagner, donc plus personne pour les jouer. **Leur part de champ ne mesure plus
rien**, et une tier list qui les descend pour ça se trompe de cause. C'est écrit
dans le commentaire de chacune.

### Reste à faire

- **`/meta` pour Unleashed paraît faux**, signalé par Allan, pas encore regardé.
  Les sets antérieurs à Vendetta n'ont pas de classement relevé et retombent sur
  le comptage par decklist : c'est la première piste.
- **336 pseudos marqués par les homoglyphes riftdecks** sont encore en base
  (Lille 78, Suzhou 61, Atlanta 56, Fuzhou 51…). Reparse + reseed, local ET prod.
- **Quatre tournois hexgate écartés** par la règle des 128 joueurs : 233 (64),
  Jinan (78), Coupe du Tsar (93), Xi'an (67). Le brut est scrapé, la conversion
  est à un mot près. Jinan et Xi'an sont de vraies City Challenges.
- Rien n'est commité ni poussé. Tout est en base locale.

### Contrôles

`npx tsc --noEmit` sortie 0 · `npx next build` sortie 0 · 56 fichiers et 300 tests
verts · `validate-decklists.py` 0 MISMATCH.

Un test a bougé : `banned-cards.test.ts` listait quatre fiches citant une carte
bannie, il en liste trois. `fiches-maj` a recalculé les cartes clés d'Annie sur
les decklists réelles et la carte bannie a disparu d'elle-même. Les trois qui
restent sont des Légendes d'Origines désertées, sous le seuil de dix listes, donc
le script ne les touche pas et leurs cartes datent.

## Session du 26 août 2026 — RQ Barcelone, hexgate, pastille de tier

### Ce qui est en base locale, pas en prod

**Regional Qualifier de Barcelone (23 août 2026, 2 224 joueurs, Vendetta).**
106 decklists seedées sous le contexte `Barcelona Regional Qualifier`, 36 best-of
levés, drapeau posé dans `tournament-flags.ts`, page `/tournois/barcelona-regional-qualifier`
vérifiée au navigateur. Article `recap-barcelone-rq-top8` publié en local.

Deux sources couplées, et c'est le point qui compte :

- riftdecks ne publie que 118 listes sur 2 131 classés, dont 88 complètes
  (30 sans réserve ou sans runes, écartées par le garde-fou Vendetta).
- L'article officiel de Riot (`data/raw-scrapes/barcelona-rq-officiel.md`) donne
  37 listes complètes : 34 Best-Of et le Top 8. `scripts/parse-playriftbound.ts`
  le convertit et n'écrit que les 18 joueurs absents de riftdecks.
- **Les 19 joueurs présents des deux côtés concordent carte pour carte.** Zéro
  divergence. C'est ce qui valide le lot.
- Sans l'apport de Riot, Renata Glasc n'aurait eu aucune liste, et plusieurs
  best-of seraient tombés sur le mauvais deck.

**Dongguan Manbo Cup (8 août 2026, 109 joueurs)**, relevée sur hexgate : 98 listes
seedées. Sur les 25 tournois d'hexgate, 20 étaient déjà en base. Des 5 absents,
seul Dongguan passe la règle « proche de 128 joueurs » (les City Challenge publiées
vont de 101 à 128). Restent dehors, scrapés en brut mais non convertis :
233 (64 joueurs), 236 Jinan (78), 237 Coupe du Tsar (93), 241 Xi'an (67).
Le nom « Dongguan Manbo Cup » est une translittération de 漫博杯, à renommer si
Allan préfère autre chose : il vit dans `NOMS_PARTICULIERS` de
`scripts/parse-hexgate.mts` et dans la clé de `tournament-flags.ts`.

### Le piège riftdecks : des homoglyphes cyrilliques dans les pseudos

riftdecks marque ses pages contre le scraping. Dans le **titre H1** d'une page de
deck, des lettres latines sont remplacées par des cyrilliques identiques à l'oeil :
`ASC HаruKаze` porte deux U+0430 au lieu de deux `a`. La phrase du corps et l'URL
restent propres. `parse-riftdecks.ts` préférait le H1, donc recopiait la marque.

Un pseudo marqué ne se rapproche plus de rien : ni la recherche, ni le même joueur
d'un tournoi à l'autre, ni la comparaison avec la source officielle. Ça se voit
jusque dans les noms de fichiers (`icebre-ker` pour `icebreaker`).

Corrigé par `sansHomoglyphes` dans `scripts/parse-riftdecks-integrity.ts`, avec ses
tests. Elle ne latinise que si le pseudo ne contient AUCUNE autre lettre
cyrillique : un vrai pseudo russe reste intact, les noms chinois aussi. Relevé sur
les données : un seul homoglyphe employé, U+0430, 402 fois.

**Reste à faire : 336 decks déjà en base portent encore un pseudo marqué.**
Lille 78, Suzhou 61, Atlanta 56, Fuzhou 51, Tianjin CC 24, Shanghai CC 20,
Sydney 18, Ottawa 16, Qingdao 6, Shenyang 5, Tianjin RO 1. Le brut est sur le
disque : reparser puis reseeder chaque tournoi suffit. À faire en local ET en prod.

### `/decks` : pastille de tier du tournoi et tri

La pastille de tier existait déjà mais lisait `deck.tournamentTier`, jamais
remplie par le seeder. **Ne pas confondre les deux :** cette colonne dit la qualité
du RÉSULTAT du deck (S = top 3), elle n'est posée que sur 193 decks, et
`/legendes` s'en sert pour classer. La pastille de `/decks` lit désormais
`getTournamentTier(deck.tournamentContext)`, une fonction pure (S = Regional,
A = le reste). Les deux rendus, première page et scroll, montrent la même chose.

Le tri par défaut place les tournois tier S devant, puis le placement. Il se fait
dans `deck-listing.ts` sur TOUS les candidats avant la découpe en lots : trier
après la découpe ne trierait qu'à l'intérieur d'une page.

`mark-bestof-tournois.mts` accepte `--sauf "<Légende>"`. Barcelone en a besoin
pour Annie et Viktor : leurs vrais n°1 (#148 et #69) n'ont pas publié de liste,
le mieux classé publié est #683 et #107. Sans ce filtre, deux best-of faux
partaient en ligne. La commande exacte est dans le corps de l'article de session.

### Contrôles

`npx tsc --noEmit` sortie 0 · `npx next build` sortie 0 · 56 fichiers et 300 tests
verts · `npm run lint` 0 erreur, 97 avertissements connus ·
`validate-decklists.py` 0 MISMATCH sur 23 522 vérifiés.

### Ce qui manque

Rien n'est poussé ni déployé. Tout est en base locale. Couverture de l'article
posée : `public/img/articles/barcelone.webp`, la salle entière sous la bannière.

## Session du 26 août 2026 — filtre de mécaniques dans `/cartes`

Le menu « Mécaniques » du deckbuilder est maintenant partagé avec `/cartes`.
La page filtre côté serveur, garde le choix dans l'adresse et recalcule les choix
et leurs nombres après la recherche, le set, le type, la rareté et le domaine.
Une mécanique connue qui n'existe plus dans le contexte reste visible avec zéro
résultat ; une valeur d'adresse inconnue est ignorée. Le menu reste borné à
l'écran sur mobile et les libellés anglais passent par le dictionnaire existant.

Le composant commun vit dans `src/components/keyword-filter.tsx` et la logique
dans `src/lib/card-keywords.ts`. Ne pas recréer un parseur ou un menu propre à une
page. Commit poussé sur `origin/main` : `0f6cc001`.

Contrôle : lint sans erreur et 97 avertissements connus, 56 fichiers et 294 tests
verts, puis `npm run verify` avec un code de sortie 0.

## Session du 25 août 2026 — audit global du parcours utilisateur

Correctif ajouté après la passe : le deckbuilder ne tronque plus sa grille à
120 cartes. Son menu « Mécaniques » lit le texte des cartes pour reconnaître les
mots-clés officiels, l'XP et les déclencheurs. Il ne propose que les choix encore
présents après les filtres de domaine, Légende, coût, type et recherche, avec le
nombre de cartes pour chaque choix.
Contrôle : 55 fichiers et 292 tests verts, lint sans erreur, puis
`npm run verify` avec un code de sortie 0.

Les 29 commits de la passe sont poussés sur `origin/main`, de `cc2486c9` à
`71e10e90`. Aucun seed ni changement de base n'a été fait.

La passe a rendu les parcours plus simples et les échecs visibles :

- `/decks` ouvre sur Vendetta ; `?set=all` garde l'accès à tous les sets ;
- la comparaison est liée depuis chaque deck et signale un code illisible ;
- les filtres de decks peuvent être effacés et l'adresse filtrée des cartes peut
  être copiée ;
- la fiche d'une carte règle sa quantité dans la collection et lie les classeurs
  partagés ;
- le brouillon repris, les sauvegardes et les erreurs de publication, collection,
  import, j'aime et overlay donnent maintenant un retour visible ;
- les menus, aperçus, infobulles et actions principales restent utilisables au
  clavier et au toucher, avec des cibles plus grandes sur mobile ;
- les pages anglaises gardent leurs titres, chapôs, dates, recherches et styles
  communautaires traduits.

## Relecture du 25 août 2026 — ce que la passe avait cassé

Sept défauts relevés en relisant les 29 commits, tous corrigés depuis.

**Le set par défaut vidait des pages entières.** Vendetta s'appliquait aussi au
best-of, alors qu'aucun des 431 decks best-of n'est en Vendetta : « Best of »
rendait « Aucun deck ». Même piège pour les liens `?legend=` venus de
`/legendes` et de la tier list, et pour `?tournament=`. Le défaut vit maintenant
dans `setParDefaut` (`src/lib/deck-listing-params.ts`), employé par la page et
par la liste : il ne s'applique que sur la vue de départ, jamais sur un lien qui
porte déjà une intention. Le menu de set affiche le filtre réellement appliqué au
lieu d'un « Vendetta » figé.

**La tier list envoyait vers le mauvais set.** Cliquer une Légende dans l'onglet
Origins ouvrait les listes du set par défaut. Le lien porte maintenant le set de
l'onglet (`Global` devient `set=all`).

**`/guides/meta` avait été à moitié déplacé vers `/meta`.** L'index des guides et
l'accueil pointaient sur la page de chiffres, alors que le guide rédigé existe
toujours, garde son canonical, reste au sitemap et reste lié depuis quatre pages.
Les deux listes de guides repointent sur le guide ; le guide renvoie vers `/meta`
pour les chiffres à jour, et `/meta` est déjà dans la barre du site.

**Le comparateur appelait « code invalide » un deck lisible.** Une seule carte
absente de la base faisait rejeter toute la liste. Le deck s'affiche, et les
cartes manquantes sont nommées, comme partout ailleurs.

**30 des 32 nouveaux fichiers de test lisaient leur propre source** et y
cherchaient une chaîne (`expect(source).toContain('href="/decks"')`). Ils passent
que le composant marche ou non et cassent au moindre renommage. Supprimés. La
suite passe de 344 à 288 tests, tous verts, et le vrai test des filtres de decks
a été étoffé. **Quinze fichiers de la même forme restent, antérieurs à cette
passe** : à traiter séparément.

**La navbar mettait un fond teinté sous un texte de la même couleur**
(`bg-arcane/5 text-arcane`), ce que la charte interdit. Fond neutre désormais.

**Le skill `delegate-wave` avait divergé des deux côtés** : description en
franglais dans `.agents/skills/`, ancienne description dans le panneau
`.claude/skills/`. Les deux sont de nouveau identiques.

Plus petit : la couverture de Changsha passe de 2,7 Mo à 473 Ko (elle sortait en
7008x4672, les autres couvertures font 2048 de large) ; les alertes emploient le
jeton `text-error-light` au lieu de `text-red-400`. Le `Promise.resolve().then()` du fournisseur de collection n'était pas du bruit : il évite le `setState` synchrone dans un effet que le lint refuse. Gardé, avec le pourquoi écrit à côté. Le message du commit
`dd114499` porte un « aper?us » abîmé, laissé tel quel : l'historique est poussé.

Les idées plus lourdes n'ont pas été commencées : recherche globale, accueil
guidé pour les débutants, historique des pages vues et refonte commune des
jetons visuels. Elles demandent un choix de produit avant du code.

## Liste de travail au 24 août 2026

Dans l'ordre où Allan l'a posée. Cette liste garde l'état relevé ce jour-là ; la
section du 25 août ci-dessus donne l'état courant du dépôt distant.

| # | Chantier | Où ça en est |
|---|---|---|
| 1 | **Audit responsive** de tout le site | 14 défauts corrigés (6 par Claude, 8 par Codex). Contrôle final sur build de production : 172 passages, 0 constat, pages connectées comprises |
| 2 | **Refonte de la découverte de deck** (`/decks`) | faite : filtres réparés, choix visuel des Légendes, drapeaux des tournois et trois tris |
| 3 | **Re-audit de `/profil`** | fait, 5 défauts corrigés |
| 4 | **Re-audit des pages Légende et des guides** | fait, 3 défauts corrigés. Fiches et guides recalés le 24 août : 28 fiches, 52 chiffres réécrits, 0 écart au contrôle |
| 5 | **Source chinoise hexgate.cn** | 692 listes seedées en local (6 tournois), 6 pages de tournoi en ligne, garde-fou capable de les relire. Pas de best-of : ce ne sont pas des Regional Qualifiers |
| 6 | **130 decklists en double** | supprimées, plus 128 decks doublonnés en base locale |

## `/decks` repris le 24 août

La page ouvre maintenant sur tous les decks publiés. L'ancien filtre implicite
ne gardait que les listes sans tournoi ou marquées `featured` : il cachait les
2 003 decks Vendetta et vidait les liens « Voir tous les decks » de
`/legendes/[slug]`. Seul l'onglet « Best of » force encore `featured: true`.

Les filtres gardent les autres paramètres de l'adresse et repartent du premier
lot. Le doublon « Toutes les listes » a disparu. Le choix de Légende montre les
icônes carrées de `public/img/legend_icon/`. Le choix de tournoi reprend les
drapeaux SVG locaux de `CountryBadge`. Les deux menus passent par le `Popover` de
Base UI : un clic hors du menu ou sur l'autre filtre ferme le premier, Échap rend
le focus au bouton, et les listes partagent la classe `thin-scrollbar`.

**Les deux menus n'avaient jamais été ouverts à l'écran d'un téléphone.** Bornés à
une part de la fenêtre (65vh, 60vh), ils passaient sous la page dès qu'on les
ouvrait sous un bouton déjà bas : 136 px pour les tournois en 375x812, 62 px pour
les Légendes en 768x1024. Ils se bornent maintenant à `--available-height`, la
place que Base UI mesure entre le bouton et le bord de l'écran. Contrôlés ouverts
aux quatre tailles : plus rien hors écran, la page ne déborde pas, Échap ferme.

Les tris sont « Récents », « Placement » et « Populaire ». `placement` est une
chaîne en base (`1st`, `2nd`, `10th`) : le tri charge les seuls identifiants et
rangs, les compare comme des nombres, puis lit les 18 decks du lot. Un tri Prisma
direct mettrait `10th` avant `2nd`.

Contrôles faits après la dernière retouche : 13 tests ciblés verts,
`npm run verify` avec `VERIFY_EXIT=0`, et `git diff --check` vert. Les adresses
`?set=Vendetta`, `?legend=Zed%2C%20Master%20of%20Shadows`, `?sort=placement` et
`?sort=popular` ont répondu en HTTP 200 ; Vendetta n'affiche plus l'état vide et
le premier lot trié par place ne contient que des `1st`. Aucun navigateur piloté
n'était relié lors de la dernière passe : les deux nouveaux `Popover` n'ont pas
encore de capture ni de clic automatisé après leur pose. Aucun seed, push ou
déploiement n'a été fait.

### Ce qui reste, et pourquoi ce n'est pas fait

**Les fiches Légendes et les guides sont recalés** (24 août). Le corpus avait pris
692 listes depuis le relevé du 17 : `fiches-stats.mts` puis `fiches-maj.mts` ont
changé **28 fiches**, et les 52 chiffres que la prose de `src/lib/legend-guides.ts`
cite ont été réécrits avec. Les deux allaient ensemble : rafraîchir les fiches
seules aurait fait mentir les guides.

Ce qui change le plus : Akali passe de « aucun Top 8 » à une place en Top 8 sur
107 listes — la phrase sur la malchance et son p = 0,010 ne tenaient plus. Jayce
passe de 3 Top 8 pour 72 listes à 6 pour 101, Nasus de 86 à 125 listes, Kennen de
un à trois titres. La moyenne du champ passe de 7,1 à 6,9 %.

**Les sections écrites à la main des fiches citent aussi des chiffres.**
`fiches-maj.mts` ne les touche pas, par choix : `strengths` et `weaknesses` sont de
la prose. Sauf qu'elles restatent des statistiques, et la page Rek'Sai annonçait
« 10,4 % de conversion sur 77 listes » juste sous un texte qui en disait 110.
95 phrases réécrites. Le corpus du format passe de 1 671 à 2 365 listes, de quinze
à vingt et un tournois, la moyenne du champ de 7,1 à 6,9 %. **À refaire à chaque
recalage des fiches** : le script ne le fera pas à ta place.

**Treize guides ne parlent pas du format mais de toute l'histoire du jeu**
(« 336 listes pour 2 top 8 »). `fiches-stats.mts` filtre par set : il ne sait pas
les vérifier. Ils ont été recomptés à part, tous sets confondus. Ne pas leur
appliquer les chiffres du format.

**Deux Légendes vivaient en base sous deux orthographes** : « Rek'Sai » contre
« Rek'sai », « Grandmaster at Arms » contre « At Arms ». La carte n'existe que
sous une forme, alors les compteurs se coupaient en deux et une page annonçait
347 listes là où il y en a 387. 41 decks recalés sur l'orthographe de la carte
(base locale). Les imports hexgate ne peuvent pas le refaire : ils écrivent le nom
de la carte trouvée en base, jamais celui de la source.

**Déployé le 24 août.** Le code est poussé sur `main` (Coolify reconstruit tout
seul) et la base de production a reçu :

- les **692 listes chinoises** (692 créées, 0 erreur, 24 170 -> 24 862 decks) ;
- les **deux orthographes de Légende** recalées, 40 decks ;
- **`RQ Atlanta 2026` et `RQ Lille 2026`** renommés en `Atlanta Regional Qualifier`
  et `Lille Regional Qualifier`, 245 decks ;
- **Beijing et Chengdu redatées du 9 au 8 août**, 242 decks : la production les
  datait autrement que `tournament-flags.ts`, donc ces deux pages n'avaient ni
  pays, ni date, ni nombre de joueurs ;
- **128 decks abîmés effacés**, sous « Shanghai City Challenge » sans date. Leur
  deck principal comptait de 21 à 38 cartes au lieu de 40, aucune source, noms de
  joueurs tronqués. 89 des 128 recoupaient le Shanghai du 23 novembre, déjà en base
  sous sa vraie date.

Tout passe par `scripts/prod-mise-a-jour-24aout.mts` (essai à blanc par défaut) et
par `prisma/seed-scraped-decks.ts hexgate`. **Le seed ne se lance jamais sans son
préfixe.**

### Hartford et Bologna : deux bugs de seed derrière l'écart

L'écart prod/local venait de deux défauts de `prisma/seed-scraped-decks.ts`, tous
deux corrigés :

- **Sa table de traduction allait dans le mauvais sens** pour cinq Regional
  Qualifiers : elle transformait « Bologna Regional Qualifier », qui est la clé de
  `tournament-flags.ts`, en « RQ Bologna 2026 », qui n'existe pas. Ces cinq pages
  s'affichaient sans pays, sans date et sans nombre de joueurs. Le nom corrigé
  change l'adresse de la page (elle est calculée depuis ce nom) : cinq
  redirections permanentes sont posées dans `next.config.ts`.
- **Le suffixe anglais des places ne regardait que 1, 2 et 3** : « 71th »,
  « 1792th ». 6 107 places en local, 6 089 en production. La place entre dans la
  clé de dédoublonnage du seed : chaque passage recréait ces decks en double.
  Même histoire pour le nom de la Légende, qui venait du fichier et non de la
  carte (« Rek'Sai » contre « Rek'sai »).

`scripts/reparer-decks-24aout.mts` rattrape les lignes déjà écrites, dans les deux
bases. Il ne supprime jamais un deck qui porte un « j'aime » ou un best-of.

**Les données du disque, elles, étaient bonnes** : les 105 fichiers Hartford et les
120 de Bologna se vérifient un par un contre le relevé brut, zéro écart. Rien à
rescraper. Un seul deck reste hors base : ElderKane a deux listes au même rang 41
sur riftdecks, et la clé de dédoublonnage du seed ne sait pas en tenir deux.

**Reste à trancher, question pour Allan** : les deux bases ne rangent pas les
best-of pareil. La production en fait des lignes à part (`best-of-hartford-…`,
`featured`), qui doublent la ligne du classement — 13 sur Hartford, 28 sur
Bologna. La base locale, elle, pose le drapeau sur la ligne du classement, sans
doublon. Le modèle local est plus propre ; unifier changerait ce qu'affiche
`/decks?cat=bestof`, donc je n'ai rien touché en production.

**`.next-vieux/` traîne à la racine.** C'est un ancien dossier de build mis de
côté ; le garde-fou refuse que je l'efface, à faire à la main.

### Les pages des trois tournois chinois

Elles répondent au slug tiré du nom du contexte, pas au nom du fichier de fiche :
`/tournois/s4-beijing-city-challenge-2026-08-23` (et Shenzhen, et Suzhou). Les
fiches de `data/tournaments/` gardent, elles, l'identifiant de la source
(`s4-beijing-cc-238`), comme les cent fiches déjà présentes. Aucun fichier de
`src/` ne lit ce dossier : ce sont des relevés, pas une source de routage.

### Les doublons du 24 août, et pourquoi ce n'était pas un autre Shanghai

130 fichiers portaient le même identifiant riftdecks qu'un autre, cartes
comprises : un vieil import du Shanghai City Challenge du 23 novembre 2025,
doublé par un import propre. Vérifié avant d'effacer, parce que deux City
Challenge de la même ville à des dates différentes se ressemblent :

- le fichier sans date portait `date: 2025-11-23` et la même URL source que son
  jumeau ;
- 128 decks sur 128 se correspondaient par classement ET par joueur, les deux
  seuls écarts étant `ShiYu\_39` contre `ShiYu_39` (un antislash d'échappement) ;
- le sans-date était l'ancien : importé le 27 mai contre le 15 juin, aucune URL
  de source, pseudos tronqués.

`scripts/supprimer-doublons-decklists.mts` et
`scripts/supprimer-doublons-sans-source.mts` refont ce travail et refusent
d'effacer si les cartes diffèrent, si un deck porte une source, ou s'il n'a pas
de jumeau. Rien n'a été touché en production.

Attention : beaucoup de contextes anciens n'ont pas d'URL de source du tout
(Shenzhen National Open S2, Shanghai National Open…). Ce ne sont pas des
doublons, c'est la seule copie : le garde-fou du second script les protège.

Les points 3 et 4 viennent d'une remarque d'Allan : ces pages ont été écrites par
un agent qui n'avait pas le contexte du projet. On ne suppose pas qu'elles sont
bonnes parce qu'elles compilent — **on relit chaque chiffre contre sa source**
(`data/fiches/`, `docs/DECKBUILDING-RULES.md`, `docs/META-KNOWLEDGE.md`) et chaque
règle d'interface contre `AGENTS.md`.

Méthode : déléguer par vagues (`delegate-wave`) tout ce qui est balayage,
vérification chiffrée ou édition mécanique ; garder le jugement, l'intégrité des
decklists et la porte `npm run verify` de ce côté-ci.

## Audit responsive — passage 1 fait, deux défauts corrigés

Rapport complet : **`docs/AUDIT-RESPONSIVE-2026-08-24.md`**. 43 adresses x 4
tailles = 172 passages, contre un build de production.

Deux vrais défauts, tous deux corrigés :

1. **La barre de navigation sortait de l'écran à 768 px**, sur TOUTES les pages.
   Le bloc `md:flex` de `navbar.tsx` mesure 926 px et s'affichait dès 768 px : la
   page entière était poussée de 182 px vers la droite (199 px en anglais). Passé
   à `lg:` (1024 px).
2. **Le fil d'Ariane de `/outils/regles` pointait vers `/outils`**, qui n'existe
   pas : « Outils » est un menu déroulant. 404 en console sur les quatre tailles,
   et l'adresse partait dans le JSON-LD lu par Google.

Quatre familles de constats ont été écartées après vérification (liens `sr-only`,
liens au fil du texte que WCAG exclut, préchargements annulés, colonne collée
voulue). Le détecteur a été resserré en conséquence : `scripts/audit-responsive.mjs`.

**Passage de contrôle fait le 24 août**, sur un build de production : 43 URL x
4 écrans, **172 passages, 0 débordement, 0 texte coupé, 0 média trop large**.

Le balayage anonyme ne voyait pas trois pages : `/collection`, `/profil` et
`/d/<code>` changent une fois connecté. Repassées avec un cookie de session
(`scripts/cookie-session-local.ts`), elles ont rendu **deux vrais défauts**,
corrigés : le menu utilisateur ouvert depuis le menu mobile partait 120 px hors de
l'écran à gauche, et le bouton « Il vous manque N cartes » ne faisait que 20 px de
haut. Contrôle après correction : 0 constat.

Le balayage lui-même comptait 34 fois la barre du haut comme un bandeau qui mange
l'écran, alors qu'il venait d'ouvrir son menu. Il saute maintenant un bandeau qui
contient un `aria-expanded="true"`.

Restent deux constats mineurs non corrigés : des cases à cocher de 16 px sur
téléphone, et un bloc du deckbuilder qui touche le bord à 430 px sans déborder.

## Source chinoise hexgate.cn — six tournois en base locale

Rapport de reconnaissance : `data/raw-scrapes/hexgate/RAPPORT.md`.

Le site rend ses decklists dans la charge React, avec pour chaque carte son
numéro de collection ET son nom anglais. On rattache par le **nom anglais**
d'abord, par le couple set + numéro ensuite : les deux catalogues ne numérotent
pas pareil (hexgate écrit « FND-196/298 » ce que la base appelle `ogn-197-298`),
mais les noms anglais se recoupent.

| Tournoi | id | Inscrits | Listes publiées | Top 8 relevé |
|---|---:|---:|---:|---:|
| S4 Beijing City Challenge (2026-08-23) | 238 | 123 | 114 | 8 |
| S4 Shenzhen City Challenge (2026-08-23) | 239 | 128 | 115 | 6 |
| S4 Suzhou City Challenge (2026-08-23) | 240 | 110 | 101 | 7 |
| S4 Guangzhou City Challenge (2026-08-16) | 230 | 128 | 123 | 8 |
| S4 Shanghai City Challenge (2026-08-22) | 234 | 128 | 120 | 7 |
| S4 Guangzhou City Challenge (2026-08-22) | 235 | 128 | 119 | 8 |

**21 listes écartées** : plusieurs Champions du personnage de la Légende y
figurent et hexgate ne dit pas lequel a été désigné. On ne choisit pas à la place
du joueur, d'où trois Top 8 troués — c'est voulu.

Les trois derniers ont été retenus parce qu'ils affichaient 128 inscrits, la
borne posée par Allan. Aucun ne recoupait un tournoi déjà en base : contrôlé
avant l'import, pas après.

Trois outils, à relancer tels quels pour un tournoi de plus :

1. `scripts/scrape-hexgate.mts <id>` — relève la page et chaque decklist, écarte
   les listes dont les comptes ne tombent pas juste ;
2. `scripts/parse-hexgate.mts <id>` — convertit au format du site (demande la base) ;
3. `scripts/tournois-hexgate.mts <id>` — écrit la fiche de tournoi et affiche la
   ligne à poser dans `src/lib/tournament-flags.ts`.

**Seedées en base locale le 24 août** : 330 puis 362 decks créés, 24 802 decks au
total. **Pas de best-of** : la règle du projet les réserve aux Regional
Qualifiers, et ce sont des City Challenge. Rien n'est en production.

**Le seed se lance TOUJOURS avec un préfixe de fichier en argument** :
`npx tsx --env-file=.env prisma/seed-scraped-decks.ts hexgate`. Sans argument il
parcourt tout `data/decklists/`, et les listes que la base porte sous un libellé
daté (« S4 Shanghai City Challenge (2026-08-08) ») repassent sous le libellé sans
date que portent les fichiers : 1 992 decks recréés en double d'un coup. Erreur
faite le 24 août, réparée en effaçant ce que la passe avait créé hors des trois
tournois voulus. La clé de dédoublonnage du script est
`tournoi|joueur|légende|placement` : elle ne voit pas deux libellés du même
tournoi.

### Le validateur relit les listes chinoises

`python -X utf8 scripts/validate-decklists.py` donne **23 318 vérifiées, 0
MISMATCH**, 1 159 invérifiables. Il reconnaît la forme hexgate (`source` et
`cartes`, `slot_type` au lieu de `type`) en plus de la forme riftdecks, et compare
les noms en minuscules : la casse seule (« Ride The Wind ») faisait remonter 106
faux écarts.

Les captures HTML brutes (29 Mo, 361 pages) ne sont pas versionnées : les JSON
`tournoi-*-decks.json` portent tout, et l'URL pour retélécharger.

## Session du 23 août 2026 — six commits sur main, rien de poussé

Tout ce qui traînait dans l'arbre de travail est relu et commité, par sujet :

| Commit | Ce qu'il porte |
|---|---|
| `decklists: relève l'audit du 21 août` | données de l'audit + index remis d'aplomb |
| `legendes: sept guides de plus` | Mel, Zed, Ambessa, Nasus, Akali, Jayce, Kennen + dates de fiche + étiquette « bannie » |
| `decks: un onglet pour toutes les listes` | onglet `cat=all`, menu Légendes cohérent, `construireWhere` sortie et testée |
| `profil: filtrer ses decks…` | filtres, actions par deck, route DELETE, passe d'accessibilité |
| `tournois: Atlanta reprend son nom complet` | drapeau aligné sur `tournamentContext` |
| `prix: relève CardNexus` | prix + note de travail des decks préfaits |

Porte vérifiée après coup : `npx tsc --noEmit` EXIT=0, `npx vitest run`
**49 fichiers, 255 tests verts**, `npx next build` EXIT=0. **Rien n'est poussé
sur le dépôt distant, rien n'est déployé, rien n'est seedé en production.**

### L'index des decklists avait deux défauts

`data/decklists-index.json` gardait 102 chemins vers des fichiers que l'audit
du 21 avait renommés (c'était le test rouge de `scripts/decklists-index.test.ts`),
et ignorait 5 427 listes présentes sur le disque, dont 131 des 144 listes de
Lille. Les deux scripts qui le lisent (`check-bestof-coverage`,
`fix-bestof-coverage`) comptaient donc mal la couverture des best-of.

`scripts/fix-decklists-index.ts` refait le travail : l'index n'a aucun
générateur, chaque parseur de tournoi y ajoute ses lignes sans jamais retirer
les mortes. À relancer après tout audit qui renomme ou supprime des fichiers.

### Ce qui reste à décider : 130 listes en double sur le disque

130 decks existent en deux fichiers, sous l'ancien et le nouveau nom
(`ahri/shanghai-cc-437-12-de.json` et `ahri/shanghai-cc-12--de.json`, même
`id`). L'index n'en garde qu'un. Supprimer un fichier de decklist est une
décision d'Allan, pas d'un agent : rien n'a été effacé. La liste se retrouve
par l'`id` en double.

`public/video/overlay-compagnon-twitter.mp4` reste non suivi : le fichier n'est
appelé nulle part dans le code ni dans les articles.

## Decklists du 21 août 2026

L'audit des sources a ajouté 2 listes Ottawa, 45 listes Atlanta et 81 listes
Lille. Le corpus local compte 101 listes pour `Atlanta Regional Qualifier`, 144
pour `Lille Regional Qualifier` et 40 pour
`Riftbound Showdown Ottawa (2026-08-08)`. Chaque RQ porte 28 best-of ; Ottawa
n'en porte aucun. Le validateur donne 22 853 listes vérifiées, aucun écart et
aucune réserve Vendetta incomplète.

La production contient les mêmes listes et aucun ancien deck sans source. Ses
deux contextes portent encore les noms `RQ Atlanta 2026` et `RQ Lille 2026` : le
tunnel public a été fermé avant leur renommage. À sa réouverture, renommer ces
deux valeurs dans `Deck.tournamentContext`, puis recalculer les best-of avec les
noms complets. Le mot de passe PostgreSQL exposé dans la conversation doit être
changé.

## Article overlay compact + compagnon — publié

Écrit le 21 août 2026, puis repris avec Allan phrase par phrase. Le texte reste
centré sur le montage mobile : deux appareils, Moblin, le compagnon et les deux
supports proposés. Les détails de code, le dépannage et le ton commercial ont
été retirés. L'article est publié sur le site.

### Ce qui est bon et n'est pas à refaire

- `scripts/seed-article-overlay-compagnon.mts` — 23 blocs, upsert sur le slug
  `streamer-riftbound-avec-un-telephone`, avec `published: true`.
- `scripts/gen-i18n-article-overlay.mts` — écrit `src/lib/i18n-articles-en.ts`.
  **À relancer après toute retouche du texte français**, sinon le passage
  modifié repasse en français sur `/en` (le dictionnaire est indexé par le
  français exact). Le script s'arrête si une traduction manque.
- Médias, tous construits et vérifiés servis en 200 :
  `public/video/overlay-compagnon-demo.mp4` (les deux captures Multicorder côte à
  côte, toutes deux lancées à 18 s, 61,3 s, 3,3 Mo),
  `public/video/moblin-widget.mp4` (sa capture d'écran Moblin, 56 s, 865 Ko),
  et 6 images dans `public/img/articles/` dont `overlay-compact-plateau.webp`
  refaite depuis `IMG_7920_2.JPG`, la version où Allan a flouté le fond.
- Deux liens Amazon, `isSponsored: false`, vérifiés en stock : Manfrotto PIXI
  (`B09GKLCP95`) et bras magnétique UGREEN (`B0D2RC162S`).

### Ce qui a été repris dans le texte

Allan a rejeté la prose deux fois de suite, et il a raison les deux fois.

1. **Première version, trop commerciale.** Elle contenait en plus un paragraphe
   de remerciements **entièrement inventé** (« merci à ceux qui ont testé les
   premières versions, plusieurs choix viennent de leurs remarques »). Aucune
   source. Supprimé. Ne pas le réintroduire sous une autre forme : personne ne
   sait qui a testé quoi.
2. **Deuxième version, journal de bord d'un dev.** En corrigeant, Claude a versé
   dans le détail d'implémentation raconté au lecteur : « deux détails m'ont
   coûté plus de temps que le reste », la file d'envoi, les patchs. Allan :
   « le mec qui va lire l'article est dev, il s'en fout ».
3. **Troisième version, toujours pas naturelle.** Le passage encore en place le
   montre bien :

   > Les noms longs tiennent. « Ravenbloom Conservatory » ne rentre pas dans un
   > cadre de champ de bataille, alors il rapetisse jusqu'à tenir au lieu de se
   > faire couper.

   C'est une ligne de spécification habillée en phrase. Le passage a été retiré,
   comme les autres détails de code et de dépannage qui n'aidaient pas au
   montage.

Le fond factuel, lui, a été vérifié dans le code et peut être réutilisé tel
quel : ce que l'overlay compact affiche et n'affiche pas, les trois liens du
tableau de bord, les six étapes Moblin, le découpage en deux de l'écran du
compagnon, « Nouveau lien » qui casse la source déjà collée.

### Contraintes posées par Allan pendant la passe

- **« overlay », jamais « habillage »** dans le contenu rendu. C'est le libellé
  de la navbar. Le texte de l'article est propre ; l'interface du tableau de
  bord et ce fichier disent encore « habillage », passe non faite.
- **Pas de marche à suivre OBS** : l'article vise le montage mobile.
- **Deux appareils, pas un** : un téléphone sur trépied qui filme, plus une
  tablette ou un vieux téléphone entre les joueurs.
- Les liens Amazon rendus en carte carrée avec une grande image, pas en bandeau.
- Les vidéos prennent toute la colonne, pas la largeur du texte.

Après la reprise : les 10 tests d'`admin-validation.test.ts` passent et
`npm run verify` sort 0. Le seed local publie 23 blocs et le générateur écrit
28 traductions dans `src/lib/i18n-articles-en.ts`.

Ajout du 22 août : l'article porte aussi deux tutos Android, IRL Pro et PRISM
Live Studio, avec leurs liens Play Store et les vidéos fournies par Allan. Les
médias vivent dans `public/video/*-overlay-android.mp4`, avec leurs affiches dans
`public/img/articles/`. Le seed local publie maintenant 28 blocs et le générateur
écrit 32 traductions.

Le tableau de bord accepte aussi un décor propre à l'overlay compact. Il passe
par le même stockage `OverlayMedia` que les deux autres décors, sous le genre
`backgroundCompact`, et revient à `public/stream/compact.webp` quand on le retire.

### Code de production touché, hors article

Ces changements sont indépendants de l'article et tiennent debout seuls.

- **Nouveau type de bloc `video`.** Un type de bloc demande QUATRE retouches,
  comme `event` pour l'overlay : le type dans `src/types/index.ts`, le rendu
  dans `src/components/article-block-renderer.tsx`, la liste blanche de
  `src/lib/admin-validation.ts`, et `src/components/admin/block-editor.tsx`.
  Oublier la liste blanche fait répondre « type inconnu » à tout enregistrement
  depuis l'admin. Un test existant se servait de `"video"` comme exemple de type
  inconnu : passé sur `"podcast"`, et un test du nouveau bloc ajouté.
- **Traduction des articles.** Le contenu d'article ne passait par aucun
  dictionnaire : `/en` rendait un article français. Le corps, les légendes, les
  titres et les métadonnées passent maintenant par `traduire`, avec un second
  dictionnaire `src/lib/i18n-articles-en.ts` à côté de celui de l'interface.
  L'accueil, la liste `/articles` et les articles liés traduisent aussi le titre ;
  la liste traduit le chapô. Les autres articles ne bougent pas, une phrase
  absente reste en français.
- **`SponsorCard`** passe en carte carrée, image plein cadre en haut. Seul
  l'article de cette passe s'en sert.
- **« Actualités »** manquait à `i18n-en.ts` : le fil d'Ariane de tous les
  articles restait en français sur `/en`.

### Ce qui a été lancé

`npx tsc --noEmit` sort 0. `npx next build` sort 0. `npm test` donne 206 tests
verts sur 207 : `scripts/decklists-index.test.ts` échoue, et il échouait **avant
cette passe** (l'index pointe vers les decklists supprimées dans l'arbre de
travail). Ne pas chercher de ce côté.

`npm run lint` sort 8 erreurs, toutes dans `.firecrawl/*.js` (`require()`),
toutes antérieures.

## Audit du 21 août 2026 — relu et poussé

L'audit de Codex a été relu par Claude, corrigé sur trois points, puis poussé sur
`main`. **Rien n'a été seedé ni déployé** : le déploiement Coolify reste à lancer.

Ce que la passe change :

- écritures concurrentes de l'habillage, de la collection, des commentaires et
  des votes sérialisées — verrou de ligne, transactions, erreurs visibles ;
- slugs de partage tirés au sort par `crypto`, limites de débit sur le panier
  CardNexus, le compagnon et le jeton d'habillage, cache CardNexus borné ;
- contrôles principaux atteignables au clavier, états ARIA posés ;
- `data/decklists-index.json` ramené de 20 064 à 18 460 entrées : 1 doublon et
  1 603 chemins sans fichier. **Aucune decklist perdue** — vérifié entrée par
  entrée, les 18 460 chemins restants existent sur le disque ;
- `prisma/seed-scraped-decks.ts` refuse une carte ou une Légende absente et
  écrit en transaction. **Le seed n'a pas été lancé** ;
- canonical anglais, sitemap FR/EN avec alternates, sans date inventée ;
- 14 composants d'interface, deux relais deckbuilder et deux dépendances sans
  appel retirés. `button` et `dialog` restent ;
- guides et docs alignés sur Vendetta, quatrième set.

### Ce que la relecture a corrigé

1. **Les chiffres du site étaient faux à deux endroits sur trois.** Codex avait
   mis à jour `llms.txt` et la description du guide méta, mais trois textes
   rendus disaient encore « 88 tournois » et « 21 000 decklists », et `llms.txt`
   annonçait 1 048 cartes. Relevé sur la production (`/api/v1/cards`,
   `/api/v1/decks`, `/tournois`) : **1 175 cartes, 24 127 decklists,
   109 tournois**. Corrigé partout, clés anglaises comprises — sans elles la
   phrase repassait en français sur `/en`.
2. **`fusionnerEtatOverlay` n'était qu'un second nom pour `applyStateUpdate`**,
   que tout le reste du site appelle déjà. Supprimé ; son test rejoint ceux
   d'`applyStateUpdate`. Le verrou de ligne de `saveState` ne bouge pas.
3. Deux clés de traduction devenues orphelines portaient de faux chiffres
   (88 tournois, 9 555 decks) : retirées avant qu'elles ne ressortent.

### Vérifié par Claude après corrections

| Vérification | Résultat |
|---|---|
| `npx next build` | **EXIT=0** |
| `npx tsc --noEmit` | **EXIT=0**, 0 erreur |
| `npx vitest run` | **39 fichiers, 206 tests verts** |
| `npm run lint` | **0 erreur, 99 avertissements** |

`npm run validate:decks` avait été lancé par Codex après le nettoyage de
l'index : 22 626 vérifiées, 0 mismatch. Rien n'a touché aux données de deck
depuis.

### Ce qui reste à décider

1. **`Deck.legendId` mélange deux formes, et ça ne casse rien.** 4 030 decks sur
   24 182 portent un `riftboundId`, les autres un `id` de base. Vérifié avant de
   pousser : **aucune page ne regroupe ni ne filtre les decks par `legendId`**. Le
   regroupement par Légende passe partout par `legendName` (`groupBy: ["legendName"]`
   dans `src/lib/legend-fiche.ts`, `where: { legendName }` dans `deck-listing.ts` et
   sur `/legendes/[slug]`). `legendId` n'est lu qu'à un seul endroit, en repli, dans
   un `OR` avec deux recherches par nom, et seulement si le deck n'a pas de carte
   Légende dans sa section `legend`. **Mesuré : 0 deck publié sur 24 182 est dans ce
   cas**, donc ce repli ne s'exécute jamais. Les pages de tournoi, `export-image.ts`,
   `resolveDeckCards`, `deck-code` et le deckbuilder ne lisent pas du tout le champ.
   Seul `/api/v1/decks` le rend tel quel : un consommateur externe verrait deux
   formes. Uniformiser reste souhaitable, mais rien n'attend après.
2. **Le déploiement Coolify n'est pas lancé.** Le sitemap double le nombre
   d'adresses (FR + EN) : le vérifier en production après déploiement.
3. **Le seed strict n'a jamais tourné.** Le premier tournoi importé après ce
   changement dira si des noms de cartes du scrape ne passent plus.

## Décor compact réexporté le 22 août 2026

Allan a redessiné `public/stream/compact.webp` : les deux côtés sont maintenant
identiques au pixel, le cadre de droite est celui de gauche décalé de 1635 px. Avant,
il était plus large de 8 px et descendait de 7. `CADRE_COMPACT`, dans
`src/app/overlay/[token]/overlay-full.tsx`, a été remesuré sur le canal alpha du
nouveau fichier : `right.x` 1661 → 1668, `largeur` 224 → 216, `hero` et `bf` alignés
sur ceux de gauche.

Le cadre de cartes de droite passe de `x: 288` à `x: 306,45`. Il était calé sur le
milieu de la toile ; il se cale maintenant sur le panneau du dessus, comme à gauche.
Les deux images de cadre sont la même à 1563 px d'écart, les deux panneaux à 1635 px,
d'où 1635 - 1563 x 0,85.

Vérifié dans OBS (scène INGAME, source « Navigateur web » sur `localhost:3000`) : les
deux panneaux tiennent dans leurs traits dorés. Les cadres de cartes, eux, ne sont pas
vus à l'écran — l'état d'Allan est en mode `none`, et le basculer aurait changé son
direct. Leur calage est mesuré, pas vu.

Le fichier source est `public/stream/layout_compact.psd`, versionné comme `layout.psd`.

## Habillage de stream — état au 21 août 2026

Le chantier est **fermé des deux côtés**, plus aucun fichier réservé. Tout est
poussé sur `main`. Porte vérifiée en fin de session : `npm run verify` EXIT=0,
**29 fichiers et 186 tests verts**, lint à **0 erreur**.

### Ce qui existe

- **`/overlay/[token]`** — l'habillage complet, deux décors au choix (avec ou
  sans cadres caméra), plus `?compact=1` pour la version réduite d'un stream
  mobile. Le décor compact est `public/stream/compact.webp`, dessiné par Allan.
- **`/profil/overlay`** — le tableau de bord du streamer. Liens OBS, décor,
  joueurs, score, match, chrono, cartes à l'écran, tournoi et logo.
- **`/compagnon/[token]/[cle]`** — le compteur de match sur téléphone, ouvert par
  lien, sans compte Discord. Deux joueurs face à face, chacun sa moitié d'écran.
  À la fin du BO, « Préparer le match suivant » rouvre le formulaire avec les
  anciennes données. Le résultat reste sur le direct jusqu'à « Lancer la partie »,
  qui remplace les joueurs et remet les scores à zéro d'un coup. Il remplace
  l'ancien `/outils/compteur`, supprimé.

### Les règles qui ne se devinent pas

Elles sont dans `AGENTS.md`, à lire avant de toucher à cette partie :

- **un seul envoi en vol** vers l'habillage, par `src/lib/overlay-envoi.ts` ;
- **toujours un PATCH**, jamais l'état entier : tableau de bord et compagnon
  écrivent en même temps ;
- **les listes passent par `src/hooks/use-listes-overlay.ts`** — `r.ok`, forme
  vérifiée, échec visible ; un `.catch(() => {})` a déjà fait tomber le tableau
  de bord en plein direct ;
- **un champ ajouté à `event` demande trois retouches** (type, `normaliserEvent`,
  liste blanche de `overlay-validation.ts`), sinon toute écriture répond 400 ;
- **les découpes d'un décor se mesurent sur le canal alpha**, jamais à l'œil ;
- **la vérification passe par OBS**, pas par le navigateur seul.

### Comment essayer sans casser le direct d'Allan

Il n'y a qu'un seul `OverlayState` en base locale, et c'est celui qu'Allan a
ouvert dans OBS. Lancer une partie depuis le compagnon **remet les points et les
manches à zéro**. Avant tout essai qui écrit : sauver `overlayState.state` dans un
fichier, faire l'essai, restaurer. Sa source OBS pointe sur
`http://localhost:3000/overlay/…?compact=1`, donc sur le serveur de dev.

### Ce qui reste ouvert

1. **`compact.webp` n'est pas symétrique** — cadre gauche 231x305, cadre droit
   240x316, et le droit descend de 11 px. Les deux colonnes ne peuvent donc pas
   être jumelles. Allan reprend le fichier ; il faudra remesurer les découpes et
   recaler `CADRE_COMPACT` dans `overlay-full.tsx`.
2. **Le chinois** — un spectateur l'a demandé pour l'habillage. Portée non
   tranchée : l'habillage seul (~85 phrases), tout le site (807 entrées, machine
   à faire relire par un natif), ou seulement la plomberie. `Langue` et
   `PREFIXE_EN` sont écrits pour exactement deux langues.
3. **Rek'Sai s'écrit de deux façons en base** — « Rek'sai » la Légende, « Rek'Sai »
   ses champions. La recherche est devenue insensible à la casse, la donnée n'a
   pas été corrigée : renommer une carte se paie dans les decklists qui la citent.
4. **`overlay-dashboard.tsx` fait 1082 lignes.** Rien ne presse, mais c'est le
   fichier où deux exécutants se marchent dessus.

**Relevé mis à jour le 21 août 2026.** Branche `main`.
La session des 20 et 21 août est décrite ci-dessus ; le reste date du relevé du 14 août.
Tout ce qui suit a été mesuré en lançant les commandes, pas déduit d'une lecture.
L'architecture et les commandes sont dans `AGENTS.md`, l'archive des audits dans
`docs/AUDITS.md`.

**Passation détaillée de la session Vendetta/S4 :**
`docs/RAPPORT-SESSION-2026-08-14.md`. Elle contient les 982 decks seedés, les
549 rejets, tous les fichiers touchés, les erreurs rencontrées, l'audit Codex et
les commandes exactes de reprise. La lire avant de reprendre ce chantier.

## Ce qui marche

| Vérification | Résultat |
|---|---|
| `npx tsc --noEmit` | sortie **0**, aucune erreur |
| `npm test` | **28 fichiers, 175 tests, tous verts** |
| `npx next build` | sortie **0**, toutes les routes construites |
| `npm run verify` | vert (c'est `tsc` + `build`) |

Le site est en production sur https://riftboundfrance.fr : ~1050 cartes,
plus de 8000 decks, une quinzaine d'articles. Les briques suivantes tournent et
n'ont pas de défaut connu : base de cartes et filtres, pages de tournoi et
best-of, tier lists, deckbuilder, collection et classeurs, decks de la
communauté, commentaires, connexion Discord, version anglaise sous `/en`,
génération d'images de deck, habillage de stream.

## Ce qui est cassé

### `npm run lint` passe — 0 erreur, 99 avertissements au dernier relevé

La commande fait désormais partie de la porte CI. Les avertissements restent à
réduire, mais ils ne bloquent pas la vérification.

### `npm run validate:decks` est de nouveau exploitable

Exécuté jusqu'au bout après les derniers imports : **21 937 vérifiées, 0 mismatch, 0 composition
Vendetta incomplète, 1 201 anciennes listes sans source brute**. Ces 1 201 listes
restent invérifiables et ne doivent pas être présentées comme validées.

## Ce qui est en chantier, non terminé

### Champions comptés deux fois : corrigé en local, pas en prod

`scripts/fix-doublons-ogs-opp.mts` retire la ligne OPP en double quand un deck
porte la même carte sous ses deux impressions (OGS et OPP). **8 lignes sur 7
decks corrigées en base locale ; la production porte encore le défaut.**

Le script tourne à blanc par défaut, `--apply` pour écrire. En production, il
faut le lancer depuis un poste avec le `DATABASE_URL` de prod — **pas depuis le
conteneur** : l'image `standalone` n'embarque ni `tsx`, ni les scripts, ni de
fichier `.env` (Coolify injecte les variables dans l'environnement, d'où le
`node: .env: not found` si on tente `--env-file=.env` là-bas).

### Branche `feat/stream-overlay`, non fusionnée

Seule branche non fusionnée dans `main`. Elle isole l'habillage de stream, jugé
pas prêt pour la production. Les correctifs de code partent directement sur
`main` ; **ne pas fusionner cette branche** sans décision explicite.
(`feat/collection` est fusionnée et peut être supprimée.)

### Tournois S4 et Ottawa : état de reprise du 14 août

Les cinq premiers City Challenges du 8-9 août sont parsés, validés et seedés
localement : Fuzhou 122, Hangzhou 118, Guangzhou 121, Chengdu 119 et Beijing 123,
soit **603 decklists complètes**. Les 33 sources rejetées restent archivées dans
`data/raw-scrapes/` et tracées par `s4-incomplete-side-decks.json` ; aucune carte
manquante n'a été inventée.

Le parseur prend maintenant le tournoi en argument (il portait Xi'an en dur) :

```bash
npx tsx scripts/parse-riftdecks.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> Vendetta
```

**Terminés de bout en bout** (scrapés, convertis, validés, seedés en local,
best-of levés) : Fuzhou 128 decks / 32 Légendes, Hangzhou 124 / 32,
Guangzhou 128 / 29 et Chengdu 128. Chengdu est dans le commit `8321eaf3`.
Les cinq tournois sont déclarés en set Vendetta dans
`src/lib/tournament-flags.ts` et `/decks` a son filtre.

**Beijing** : 128 sources, 123 JSON complets et 5 rejets (réserves de 0, 8 ou 9
cartes). Un reparse depuis les Markdown produit strictement les mêmes 123 JSON.
Le seed ciblé est idempotent et laisse `featured=false`.

**Ottawa** : scrape repris le 14 août avec `scripts/scrape-tournoi.sh` et
`scripts/fc.sh` (rotation des clés), terminé à **525/525 sans erreur réseau**.
Le parseur a retenu 38 listes complètes et rejeté 487 sources partielles ; les
raisons sont conservées dans le fragment `riftbound-showdown-ottawa-rejected.json`.
Les 38 listes, dont le Top 8 complet, sont validées et seedées localement avec
`featured=false`. La page canonique indique Vendetta, construit, le 8 août 2026,
**594 inscrits**, 581 lignes classées et 525 decklists publiées.

**Ottawa : 525 listes publiées pour 581 joueurs classés et 594 inscrits.** Les 56
listes absentes du classement sont marquées « Decklist Missing » par Riftdecks :
on ne les fabrique pas.

**Ottawa et Beijing sont parsés, validés et seedés localement.**

**Trois autres S4 chinois tournent en parallèle** via `scripts/scrape-tournoi.sh` :
Shanghai (128 URL), Shenzhen (128) et Wuhan (114). Leurs pages canoniques ont été
vérifiées S4/Vendetta avant le lancement. Ne pas démarrer de processus concurrent.

Trois pièges déjà payés, à ne pas repayer :

- **Le format du parseur ne collait pas au seeder.** Runes en tableau au lieu
  d'un objet `{Fury:6}`, réserve sous `sideboard` au lieu de `sideDeck`, nom de
  Légende au fil d'Ariane (`Khazix`) au lieu du canonique (`Kha'Zix`). Chacun
  perdait des données en silence. Corrigé, mais c'est le genre d'écart à
  revérifier sur un deck avant de seeder les autres.
- **Il existe déjà deux routines de conversion Markdown** :
  `scripts/parse-riftdecks.ts`, utilisé pour les S4 récents, et l'historique
  `scripts/parse_riftbound_cached.py`. Avant de modifier l'un des deux, lire
  `data/raw-scrapes/AGENT-INSTRUCTIONS.md`, le skill `scraper-tournoi` et la
  mémoire Claude `feedback_scraping_gotchas.md`. Le Python porte encore un
  fallback Master Yi par champion explicitement déclaré faux dans
  `feedback_master_yi_disambiguation.md`, et il fusionne l'index global : ne pas
  le lancer tel quel sur tout le corpus. Ne jamais distinguer les deux Master Yi
  par leur champion.
- **Le parseur et le seeder ont depuis été corrigés et testés.**
  `scripts/parse-riftdecks.ts` conserve les formats `runes` objet, `sideDeck` et
  `sourceUrl`, rejette toute composition Vendetta incomplète et reproduit Beijing
  sans diff. `scripts/seed-tournament-decks.ts` supprime les slugs exacts du lot,
  préserve `sourceUrl`, effectue le lot dans une transaction et renvoie désormais
  un code non nul en cas d'échec.
- **Les clés firecrawl s'épuisent.** `scripts/fc.sh` passe à la suivante ; elles
  vivent dans `.firecrawl/keys`, hors git, à recréer sur un clone neuf.
- **Une réserve à 10 ne suffit pas à rendre une source complète.** Le parseur et
  le validateur exigent désormais 39 cartes main, 1 champion, 12 runes, 3 champs
  de bataille et 10 cartes de réserve pour Vendetta. Ottawa contient notamment
  des pages déclarant `champion (0)` ou `battlefields (0)` malgré un side complet.

### Codex : audit indépendant exécuté

`.codex/` et `.agents/skills/` sont en place et vérifiés : Codex charge
`AGENTS.md`, les six skills, les deux serveurs MCP et les deux sous-agents.
Un audit complet Codex CLI en lecture seule a été exécuté le 14 août. Ses deux
blocages de démarrage ont été corrigés : `entrypoint.sh` est fail-closed et
`migrate.mjs` n'utilise plus `--accept-data-loss`. La transaction du seed, les
tests, TypeScript et le validateur global ont aussi été vérifiés après son audit.

La passe de correction qui a suivi ajoute la validation des entrées sur les
routes admin, ferme les écritures partielles de decks et de tier lists par des
transactions, et réutilise la résolution canonique des noms de cartes. Elle
corrige aussi les 61 contrôles sans nom accessible dans l'éditeur d'article,
les courses du bouton Favoris, les erreurs React qui bloquaient ESLint et les
commandes de contrôle Windows dans les docs. Le workflow CI lance maintenant
lint, TypeScript, Vitest et le build. Vérifications finales : **140 tests**, lint
avec **0 erreur et 97 avertissements**, TypeScript, build et `git diff --check`
verts. Aucun commit, push, seed ou déploiement n'a été fait.

## Analyse Vendetta effectuée le 14 août 2026

La commande `npx tsx --env-file=.env scripts/analyze-vendetta-meta.ts` a été exécutée avec succès sur la DB locale : **982 decks, 9 contextes**. Une requête indépendante a confirmé les neuf volumes, les 72 places de Top 8 et les vainqueurs, notamment Guangzhou dans le contexte exact `S4 Guangzhou City Challenge (2026-08-09)`. Les résultats complets et les limites de l'échantillon sont dans `docs/META-KNOWLEDGE.md`.

Aucune règle de `docs/DECKBUILDING-RULES.md`, fiche de légende ou image n'a été modifiée : les statistiques de placement ne suffisent pas à établir des cores vérifiables et la proposition éditoriale Vendetta reste à faire valider par Allan. Le seed des tier lists historiques a été restauré séparément après correction du filtre OGS/OPP.

## Tier list Origins restaurée le 14 août 2026

La DB locale ne contenait plus la tier list Origins après un seed interrompu sur des doublons de cartes Légende OGS/OPP. `scripts/seed-tier-lists.ts` filtre désormais les impressions canoniques (`alternateArt=false`, `overnumbered=false`, `signature=false`, set différent de `OPP`) avant résolution. Le seed local a recréé Origins avec 16 entrées et restauré les quatre listes historiques : Origins, Spiritforged, Unleashed et Globale. L'audit `scripts/audit-tier-lists.mts` passe ; les nouvelles légendes Vendetta restent absentes des listes historiques et ne sont pas inventées.

## Tier list Vendetta seedée le 14 août 2026

Après validation éditoriale d'Allan, `scripts/seed-tier-lists.ts` contient désormais la proposition Vendetta fondée sur les 982 decks vérifiés. Le seed local a créé `Tier List Vendetta` avec **45 entrées**, publiée et marquée comme liste courante. L'audit Vendetta confirme 982 decks et 45 légendes classées. Le visuel a été généré sous `content/tweets/images/tier-list-vendetta.html`. Aucun seed de decklist, commit ou déploiement n'a été effectué.

## Session du 19 août 2026 : anglais, règles, prix, habillage

Cinq commits poussés sur `main` (`826bb6b4` à `320e27ad`). Ce qui compte pour la
suite :

**Version anglaise.** `scripts/audit-version-anglaise.mjs` (nouveau) va chercher les
pages `/en` rendues et compte les phrases restées en français. Il est passé de 2 966
à 328 phrases sur 33 pages. `src/components/breadcrumbs.tsx` est devenu un composant
client pour traduire le fil d'Ariane des 17 pages d'un coup. Reste : environ 120
phrases écrites en dur dans 4 guides (mécanique) et tout l'éditorial (fiches de
Légende, articles, glossaire), qui demande une décision d'architecture d'Allan.
Sous Git Bash, le script veut `MSYS_NO_PATHCONV=1`, sinon les chemins sont réécrits.

**Règlement anglais.** `scripts/parse-core-rules.py` prend maintenant la langue en
argument (`fr` par défaut, `en`) et produit `data/rules/core-rules-<langue>.json`.
Deux défauts corrigés au passage : les ligatures du PDF (ﬀ, ﬁ, ﬂ) passaient telles
quelles, et un filtre sur la longueur du texte jetait les règles courtes. Le français
passe de 2 094 à 2 317 règles sans perte, l'anglais en donne 2 316.
`loadCoreRules(langue)` garde un cache par langue.

**Prix CardNexus.** `regrouper()` retient l'impression la moins chère du même nom
de catalogue. Une decklist qui cite une surnumérotée ne facture plus la surnumérotée :
410 decks étaient surévalués, la médiane tombait de 225 €. Le regroupement se fait par
le **nom du catalogue CardNexus**, jamais par `cleanName` (confond Légende et Champion)
ni par identité stricte (les noms en base portent « (overnumbered) »).

**Habillage de stream.** Nouveau décor sans caméra (`layout_sanscam.webp`), la Légende
prenant la place de la caméra en cube. Envoi de logo et de fond par le streameur, avec
recherche de carte sans decklist. Nouvelle table `OverlayMedia` (voir `AGENTS.md`).
Les types d'image sont vérifiés **par les octets de tête**, pas par le `Content-Type`
déclaré ; le SVG est refusé exprès.

**Piège trouvé, et cher.** Une opacité posée sur une enveloppe sans hauteur autour d'un
élément en position absolue **ne s'anime pas**. Le fondu des points ne jouait pas et ça
ne se voyait pas en relecture de code : il a fallu mesurer image par image dans OBS.
L'opacité doit être posée sur l'élément positionné lui-même.

**Le piège de l'ordre de déploiement.** Coolify déploie tout seul au push. Le code est
donc en production **avant** le schéma, puisqu'il n'y a pas de migrations. `OverlayMedia`
a rendu 500 en prod jusqu'à sa création à la main. Pour toute nouvelle table : sortir le
DDL exact avec `npx prisma migrate diff --from-empty --to-schema-datamodel
prisma/schema.prisma --script`, puis le faire jouer dans le conteneur `/app`, où
`DATABASE_URL` est déjà posé. Ne pas lancer `prisma db push` sur la prod : il toucherait
au reste du schéma, sans retour arrière.

**Ce qui attend Allan :** réexporter `public/stream/test.webp` (décor avec caméras) et
peut-être `cartes_gauche.webp` / `cartes_droite.webp` depuis son PSD redessiné — les
fichiers du dépôt sont ceux du 16 août et ne correspondent plus. Les repères de position
sont mesurés sur ces images ; s'ils bougent, il faut les remesurer.

## Session du 19 août 2026 : cartes, tournois, collection et deckbuilder

Passe d'interface de Codex, relue et poussée :

- `/cartes` utilise un conteneur de 1400 px sur ordinateur. Les filtres restent
  repliés sur mobile et leur bouton atteint 44 px de haut.
- `/tournois` regroupe les événements par set, puis par niveau S/A et par date.
  Le titre mobile est raccourci. Une page tournoi affiche les événements voisins
  du même set, dans un ordre stable, et limite les voisins aux tournois visibles
  dans la liste.
- La page d'un classeur n'imbrique plus deux balises `main`. Ses filtres sont
  repliés sur mobile, ses actions et compteurs ont de plus grandes zones tactiles.
- L'aperçu flottant du deckbuilder ne s'ouvre que si l'appareil gère le survol
  avec un pointeur fin. Un toucher ne peut donc plus placer l'aperçu devant les
  boutons du tiroir.
- Les nouveaux textes ont leur traduction anglaise.

Playwright MCP a contrôlé `/cartes`, le classeur test
`/collection/cmq4e09rr0001vs1stsbqpyau`, `/tournois`, le tournoi de Tianjin
et le parcours mobile du deckbuilder avec ajout puis retrait d'une carte.
`npm test` passe avec **26 fichiers et 164 tests**. `npm run verify` passe
avec **EXIT=0** et 52 pages générées.

Relu et revérifié avant de pousser : `tsc` à 0, 164 tests verts, `lint` à 0 erreur
(99 avertissements, tous `no-img-element`), build à 0. Deux points contrôlés à la
mesure plutôt qu'à l'œil : la nouvelle requête des contextes de tournoi
(`placement IS NOT NULL` et plus de 5 decks) ne perd **aucune** des 110 pages
existantes, et un contenu forcé visible dans un `<details>` fermé s'affiche bien
sous Chrome 151. Aucun seed ni déploiement.

## Session du 20 août 2026 : compagnon de match (COMMITS LOCAUX, NON POUSSÉS)

Les commits `77c970de`, `deaf8d05` et `e391395c` sont sur `main`, **en local
seulement**. Le dernier commit remplace la première version du companion par une
interface mobile face-à-face.

La page guide la création du match en trois étapes : format, pseudos, Légendes,
champions et champs de bataille. Pendant la partie, le téléphone peut rester
entre les joueurs : le panneau du haut tourne à 180 degrés, les deux scores se
mettent à jour sans changer de page et l'image de chaque Légende sert de fond.
Le bouton de fin de manche demande le gagnant, met à jour le BO et relance les
points jusqu'à la victoire du match. La dernière manche peut être annulée.

| Fichier | Rôle |
|---|---|
| `src/app/compagnon/[token]/[cle]/compagnon.tsx` | Parcours en trois étapes, compteur face-à-face, fin et annulation de manche. |
| `src/app/compagnon/[token]/[cle]/compagnon.module.css` | Plein écran mobile, zones sûres, portrait vertical et paysage côte à côte. |
| `src/app/compagnon/[token]/[cle]/page.tsx` | Vérifie la clé, charge l'état, `noindex`. |
| `src/app/api/overlay/[token]/compagnon/route.ts` | Écriture par la clé, en-tête `x-cle-compagnon`. |
| `src/lib/overlay-compagnon.ts` (+ test) | Clé = HMAC du jeton avec `SESSION_SECRET`. |
| `src/lib/overlay-compagnon-client.ts` (+ test) | Fusion, ordre, reprise des envois et annulation de manche. |

Trois choses à ne pas défaire en retouchant l'interface :

1. **Le compagnon envoie un PATCH, jamais l'état entier.** Le streamer peut
   changer son décor depuis son tableau de bord au même moment ; un état entier
   écraserait son travail. Les patchs s'empilent dans `fusionner()` avant
   l'envoi — sans ça, taper un pseudo puis marquer un point 200 ms plus tard
   jetait le pseudo. Les requêtes partent maintenant dans l'ordre et un échec
   garde le changement jusqu'au nouvel essai.
2. **Le module CSS.** Sans lui, l'écran de match passe sous la ligne de
   flottaison du téléphone et il faut faire défiler pour marquer un point.
3. **La question « qui a gagné » ne se pose qu'au clic.** Un joueur peut
   concéder ou finir la manche au temps : l'habillage ne tranche pas à sa place.

Playwright a contrôlé les trois étapes, le match en 390×844 et 844×390, la mise
à jour d'un point et la fenêtre de fin de manche. Le test a restauré l'état de
l'habillage après les captures ; ses fichiers temporaires ont été retirés.
Vérifications finales : **28 fichiers et 175 tests verts**, lint avec **0 erreur
et 99 avertissements**, `npm run verify` avec `VERIFY_EXIT=0`, 52 pages générées
et `git diff --check` vert. Aucun push, seed ou déploiement n'a été fait.

**En attente d'une réponse d'Allan** : le chinois (simplifié/traditionnel)
demandé sous le tweet du 20 août. Périmètre à trancher — overlay seul
(~85 textes), tout le site (775 entrées de `i18n-en.ts`, traduction machine à
faire relire par un natif), ou la plomberie multilingue seule. Rien n'a été
écrit : la vague de relevé était en lecture seule. Ce qu'elle a mesuré :
l'habillage lui-même ne porte que cinq textes (« Légende », « Champion »,
« Champ de bataille », « caméra en attente », « Caméra »), tout le reste de ce
qu'on lit à l'écran est tapé par le streamer ou vient de la base ; les
79 textes du tableau de bord passent déjà par `t()`. La plomberie, elle, est
codée en dur pour deux langues (`type Langue`, `PREFIXE_EN`, le middleware, le
sélecteur de la navbar, les `hreflang`).

## Les 5 prochaines tâches, par priorité

1. **Refermer PostgreSQL après chaque seed.** Le 19 août 2026, le port
   `178.104.237.33:15432` acceptait les connexions depuis Internet en début de
   journée, puis plus du tout quelques heures après (contrôlé deux fois, avec le
   port 443 en témoin pour prouver que l'hôte répondait toujours). Rien n'est donc
   cassé aujourd'hui, mais le trou **se rouvre à chaque seed** : c'est un `socat`
   lancé à la main, pas une règle permanente, et personne ne voit qu'il traîne.
   Le refermer dans la foulée du seed, ou passer par un tunnel SSH ponctuel.
2. **Passer le correctif des champions en double sur la production** :
   `npx tsx scripts/fix-doublons-ogs-opp.mts` avec le `DATABASE_URL` de prod pour
   voir les 8 lignes, puis `--apply`.
3. **Réduire les 99 avertissements de lint.** Commencer par les imports et
   variables inutilisés, puis les images non optimisées.
4. **Réduire les 1 201 listes invérifiables** en retrouvant leurs sources brutes,
   sans les considérer valides par défaut.
5. **Trancher le sort de `feat/stream-overlay`** : la finir et la fusionner, ou
   la supprimer. Une branche qui traîne finit par diverger au point d'être
   infusionnable.

# Pièges

Les endroits où une modification qui a l'air juste casse autre chose.

## `rtk` masque le code de sortie

`rtk tsc && git commit` a déjà committé du code cassé : `rtk` renvoie 0 même
quand la commande qu'il enveloppe échoue. **Ne jamais utiliser `rtk` comme garde
dans un `&&`.** Pour vérifier :

```bash
npx tsc --noEmit ; echo "EXIT=$?"
```

## Ne jamais recalculer les cartes d'un deck à la main

`resolveDeckCards` (`src/lib/deck-cards.ts`) est le passage unique entre un code
de deck et la base. Le bloc a déjà été copié dans quatre fichiers, chacun avec le
même défaut : un `continue` muet qui supprimait sans rien dire une carte
introuvable, et un filtre `alternateArt: false` qui escamotait les cartes
n'existant qu'en illustration alternative. Corriger une copie en laissait trois
cassées. Un nom de carte a plusieurs formes (apostrophe, virgule, suffixe de
variante) : `queryKeys` et `findCard` s'en occupent, pas toi.

## Deux systèmes de « j'aime », qui ne se ressemblent pas

`DeckLike` porte sur les decks officiels, `CommunityDeckLike` sur ceux de la
communauté. La page Favoris fusionne les deux. Toucher à l'un sans l'autre
produit une page Favoris incohérente.

## Ne jamais fusionner `i18n.ts` et `i18n-server.ts`

`next/headers` n'existe pas côté client. Les composants client importent
`traduire` depuis `i18n.ts` ; si ce module tire `next/headers`, **tout le site
casse au chargement**. Le découpage est la seule chose qui tient. Même règle pour
`collection.ts` / `collection-server.ts`.

Le dictionnaire anglais est indexé **par le texte français lui-même**. Changer
une phrase française dans une page casse sa traduction en silence : la phrase
retombe en français au lieu de lever une erreur. Après toute retouche de texte,
répercuter la clé dans `src/lib/i18n-en.ts`.

## La CSP du middleware, et son exception unique

Le guide Next.js 16 local appelle désormais ce fichier `proxy.ts` et indique que
le comportement reste le même. Le renommage n'est pas fait dans cette passe : il
ne règle pas le démarrage et la borne de ce chantier est le contrôle de schéma.

`src/middleware.ts` pose la CSP pour tout le site. `/overlay/` est **la seule
route** autorisée à encadrer un site tiers (la caméra VDO.Ninja) et à afficher
une image venue de n'importe quel hôte (le logo du tournoi). Élargir la CSP
ailleurs ouvre le site entier. À l'inverse, une image distante ajoutée dans une
page sans mettre son hôte dans `img-src` ne s'affichera jamais — et il faut aussi
l'ajouter dans `images.remotePatterns` de `next.config.ts`. Deux endroits, pas un.

## Le service worker sert du JavaScript périmé

`public/sw.js` met en cache. En développement, une modification peut rester
invisible tant que le service worker n'est pas désinscrit dans les outils du
navigateur. Avant de conclure « mon changement ne marche pas », désinscrire.

## Tailwind v4 ne génère pas les classes construites

`bg-${couleur}-500` ne produit rien : Tailwind lit le code source en texte et ne
voit pas la classe. Utiliser une valeur arbitraire ou un style en ligne. Autre
effet de la v4 : le curseur main a disparu des boutons, il faut le remettre.

## Pas de migrations Prisma

Il n'y a pas de dossier `prisma/migrations/` : le schéma est poussé par
`prisma db push`. `migrate.mjs` ne fait plus d'écriture : il vérifie les 18 tables
et refuse une base vide ou incomplète. Initialiser ou mettre à niveau la base hors
du conteneur, après vérification. Donc **aucun historique de schéma et aucun
retour arrière**.
Une colonne supprimée est perdue. Vérifier deux fois avant de toucher au schéma,
et penser que `prisma db push` sur la base de production efface les données de
toute colonne retirée.

## Un déploiement Coolify ne seede pas les decks

Coolify construit et démarre l'application, rien de plus. Le contenu (cartes,
decks, articles) se pousse séparément. Un déploiement « réussi » sur une base
vide donne un site vide.

## Les scripts de `scripts/` sont des outils à usage unique

Les 77 scripts sont datés et liés à un tournoi ou à une correction précise. Ils
ne sont pas maintenus et beaucoup ne re-tourneraient pas. Les lire comme des
exemples, pas comme une bibliothèque. Une exception :
`scripts/validate-card-names.mts` et `scripts/validate-decklists.py` sont des
garde-fous vivants, à lancer.

## Dette de sécurité connue, non traitée

Au-delà de la base exposée (tâche 1) :

- La CSP garde `unsafe-inline` et `unsafe-eval` sur `script-src`. Le passage à
  une politique par nonce est identifié mais pas fait.
- Le rate-limit (`src/lib/rate-limit.ts`) est une table en mémoire : l'état est
  perdu à chaque redéploiement, et plusieurs routes qui écrivent (commentaires,
  votes, j'aime, `collection/bulk`) n'en ont pas du tout.

## Chargement progressif de `/decks` et audit Playwright du 14 août 2026

Cet audit avait validé des lots de 51 decks. La passe du 24 août a ramené
`TAILLE_LOT_DECKS` à 18 ; ses chiffres de 51 et 102 restent donc un relevé daté,
pas l'état actuel. `IntersectionObserver` charge toujours les lots suivants via
`GET /api/decks` quand la sentinelle approche du viewport. Le bouton
`Charger plus de decks` reste disponible comme secours clavier. Le contrôle du
14 août avait atteint 448 URL uniques. Le bouton disparaissait et le message
`Tous les decks sont affichés.` apparaît : aucun doublon et aucune boucle.

`src/lib/deck-listing.ts` porte la requête commune, le tri, la recherche, les
filtres `cat`, `legend`, `set`, `tournament`, `q`, `sort` et `owned`, ainsi que la
couverture de collection. Le composant garde les états chargement, erreur et fin,
et une zone `aria-live`.

L'audit a été repris avec gpt-5.6-sol et Playwright MCP sur les routes publiques,
dynamiques, connectées, administratives, anglaises et API. Le rapport vérifié est
`docs/AUDIT-SITE-2026-08-14.md` et sept captures vivent dans
`docs/audit-2026-08-14/`. Deux corrections sûres ont été revalidées : débordement
du filtre tournoi de `/admin/decks` à 320 px et sémantique ARIA du menu Outils.
Le tiroir mobile du deckbuilder conserve aussi désormais le focus après une action,
et ses contrôles de quantité restent utilisables sans survol sur écran tactile.
Les 16 champs texte et 45 boutons sans nom accessible, soit 61 contrôles, sont
corrigés localement dans `/admin/articles/[id]`, mais pas encore en production.
Les routes de partage sans donnée locale réelle restent explicitement non vérifiées.

Fichiers ajoutés ou modifiés pour ce point :

- `src/app/decks/page.tsx` ;
- `src/app/decks/decks-progressifs.tsx` ;
- `src/app/api/decks/route.ts` ;
- `src/lib/deck-listing.ts` ;
- `src/lib/deck-listing-params.ts` ;
- `src/lib/deck-listing.test.ts`.

Le serveur local répond en HTTP 200 et les contrôles visuels ont été réalisés avec
Playwright. Aucun commit, push, reset, seed ou changement de donnée brute n'a été
fait par cette reprise d'audit. Après le dernier changement : ESLint ciblé sans
erreur et avec 3 avertissements `no-img-element` préexistants, TypeScript vert,
22 fichiers et 140 tests verts, `npm run verify`
vert avec 52 pages générées, et `git diff --check` vert.

## Session du 22 août 2026 : audit de la collection

L'audit de la collection a trouvé puis corrigé les points suivants :

- la recherche et les filtres d'un classeur restent visibles sur mobile ;
- le filtre « Manquantes » conseille l'impression CardNexus la moins chère ;
- un import Piltover ou un lot invalide est refusé avant toute écriture ;
- un verrou PostgreSQL empêche deux créations en même temps de dépasser la
  limite de classeurs ou de créer deux classeurs par défaut ;
- les actions sur les classeurs montrent leur échec et le rapport d'import reste
  affiché jusqu'à l'actualisation demandée par le joueur ;
- l'achat refuse un deck si une carte manque en base ou dans le catalogue
  CardNexus, au lieu de créer un panier incomplet ;
- les appels CardNexus ont une limite de dix secondes et leurs réponses sont
  vérifiées ;
- la couverture d'un deck refuse les lots hors bornes et affiche un bouton
  « Réessayer » si son calcul échoue.

Le cache des listes CardNexus peut encore créer deux listes lors de deux premiers
clics simultanés sur le même deck. L'effet se limite à un doublon sur le compte
CardNexus ; aucune carte ni commande n'est perdue. Garder ce point tant que le
quota de listes ne pose pas de problème.

Correctif ajouté après contrôle du deck Zhao Jia 231937 : CardNexus suffixe les
noms des impressions cosmétiques. Le choix du prix passe par la liste blanche
partagée de `card-printing.ts` (`Alt`, `Alt Art`, `Alternate Art`, `Metal`,
`Overnumbered`, `Signature`, `Starter`, `Ultimate`). Kayle conseille
donc l'impression normale à 0,18 € au lieu de celle à 150 €. Les suffixes de
jeu, comme `Recruit (DE)`, restent distincts.
Test : `npx vitest run src/lib/cardnexus.test.ts` (23 tests verts).

Les listes CardNexus demandent maintenant les cartes en anglais. Vendetta n'existe
pas encore en français, donc le choix précédent pouvait produire un panier
incomplet. Repasser la constante `LANGUE` de `src/lib/cardnexus.ts` à `fr` quand
toutes les extensions jouées seront disponibles en français.
