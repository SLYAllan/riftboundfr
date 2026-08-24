# HANDOFF — état des lieux

## Liste de travail au 24 août 2026

Dans l'ordre où Allan l'a posée. Rien n'est poussé sur le dépôt distant.

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
