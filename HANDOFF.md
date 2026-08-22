# HANDOFF — état des lieux

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

La page rend 51 decks côté serveur, puis `IntersectionObserver` charge les lots
suivants via `GET /api/decks` quand le sentinel approche du viewport. Le bouton
`Charger plus de decks` reste disponible comme secours clavier. Playwright prouve :
51 decks au départ, 102 après arrivée en bas, 102 URL uniques, puis 448 decks et
448 URL uniques à la fin. Le bouton disparaît et le message
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
