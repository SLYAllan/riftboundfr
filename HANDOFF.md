# HANDOFF — état des lieux

**Relevé mis à jour le 19 août 2026.** Branche `main`, dernier commit `320e27ad`.
La session du 19 août est décrite plus bas ; le reste date du relevé du 14 août.
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
| `npm test` | **26 fichiers, 164 tests, tous verts** |
| `npx next build` | sortie **0**, toutes les routes construites |
| `npm run verify` | vert (c'est `tsc` + `build`) |

Le site est en production sur https://riftboundfrance.fr : ~1050 cartes,
plus de 8000 decks, une quinzaine d'articles. Les briques suivantes tournent et
n'ont pas de défaut connu : base de cartes et filtres, pages de tournoi et
best-of, tier lists, deckbuilder, collection et classeurs, decks de la
communauté, commentaires, connexion Discord, version anglaise sous `/en`,
génération d'images de deck, habillage de stream.

## Ce qui est cassé

### `npm run lint` passe — 0 erreur, 97 avertissements au dernier relevé

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
3. **Réduire les 97 avertissements de lint.** Commencer par les imports et
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
