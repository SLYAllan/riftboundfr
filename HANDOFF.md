# HANDOFF — état des lieux

**Relevé du 13 août 2026.** Branche `main`, dernier commit `121e8cf0`.
Tout ce qui suit a été mesuré en lançant les commandes, pas déduit d'une lecture.
L'architecture et les commandes sont dans `AGENTS.md`, l'archive des audits dans
`docs/AUDITS.md`.

## Ce qui marche

| Vérification | Résultat |
|---|---|
| `npx tsc --noEmit` | sortie **0**, aucune erreur |
| `npx vitest run` | **10 fichiers, 85 tests, tous verts** (~1,2 s) |
| `npx next build` | sortie **0**, toutes les routes construites |
| `npm run verify` | vert (c'est `tsc` + `build`) |

Le site est en production sur https://riftboundfrance.fr : ~1050 cartes,
plus de 8000 decks, une quinzaine d'articles. Les briques suivantes tournent et
n'ont pas de défaut connu : base de cartes et filtres, pages de tournoi et
best-of, tier lists, deckbuilder, collection et classeurs, decks de la
communauté, commentaires, connexion Discord, version anglaise sous `/en`,
génération d'images de deck, habillage de stream.

## Ce qui est cassé

### `npm run lint` échoue — 15 erreurs, 96 avertissements

C'est **la seule commande rouge du dépôt**. Détail des erreurs :

- **11 × `react-hooks/set-state-in-effect`** — règle de React 19 introduite par
  une montée de version, pas par une régression du code. Chaque cas est un
  `setState` appelé directement dans un `useEffect`.
- **3 × `prefer-const`** (`export-image.ts:264`, et deux autres) — réparables
  par `npx eslint --fix`.
- **1 × « Cannot reassign variable after render completes ».**

Conséquence pratique : **un agent ne peut pas se servir de `npm run lint` comme
porte**. Tant que ce n'est pas remis à zéro, la porte est `npm run verify`.

### `npm run validate:decks` ne rend pas la main

`python -X utf8 scripts/validate-decklists.py` **dépasse 5 minutes** et a été
interrompu sans avoir fini. C'est pourtant le garde-fou anti-fabrication de
decklists exigé avant tout seed. Le lancer avec une limite de temps très large,
et ne pas conclure « ça marche » sur un simple dépassement.

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

### Cinq tournois S4 chinois : scrape brut lancé, conversion à faire

Les cinq City Challenge du 8-9 août (Fuzhou 128, Hangzhou 124, Guangzhou 128,
Chengdu 128, Beijing 128 = **636 decks**) sont récupérés par
`bash scripts/scrape-s4-chine.sh`. Reprenable : le relancer après une coupure
repart d'où ça s'est arrêté.

Le parseur prend maintenant le tournoi en argument (il portait Xi'an en dur) :

```bash
npx tsx scripts/parse-riftdecks.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> Vendetta
```

**Terminés de bout en bout** (scrapés, convertis, validés, seedés en local,
best-of levés) : Fuzhou 128 decks / 32 Légendes, Hangzhou 124 / 32,
Guangzhou 128 / 29. Les cinq tournois sont déclarés en set Vendetta dans
`src/lib/tournament-flags.ts` et `/decks` a son filtre.

**En cours** : Chengdu et Beijing (128 chacun), et Ottawa (525 listes). Reprendre
avec `bash scripts/scrape-tournoi.sh`, puis convertir, seeder, lever les best-of.

**Ottawa : 525 listes pour 581 joueurs.** L'écart n'est pas une perte : riftdecks
a un filtre « Decklist Missing », ces 56 joueurs n'ont pas publié de liste. On ne
la fabrique pas.

**Rien n'est en production.** Tout ce qui précède est en base locale.

Trois pièges déjà payés, à ne pas repayer :

- **Le format du parseur ne collait pas au seeder.** Runes en tableau au lieu
  d'un objet `{Fury:6}`, réserve sous `sideboard` au lieu de `sideDeck`, nom de
  Légende au fil d'Ariane (`Khazix`) au lieu du canonique (`Kha'Zix`). Chacun
  perdait des données en silence. Corrigé, mais c'est le genre d'écart à
  revérifier sur un deck avant de seeder les autres.
- **Les clés firecrawl s'épuisent.** `scripts/fc.sh` passe à la suivante ; elles
  vivent dans `.firecrawl/keys`, hors git, à recréer sur un clone neuf.
- **Ottawa (581 decks) n'est pas lancé.** Même commande, dix pages :
  `bash scripts/scrape-tournoi.sh riftbound-showdown-ottawa "<url>" 10`.

### Codex : une étape manuelle reste à faire

`.codex/` et `.agents/skills/` sont en place et vérifiés : Codex charge
`AGENTS.md`, les six skills, les deux serveurs MCP et les deux sous-agents.
**Les garde-fous ne tournent pas encore** : Codex refuse de lancer un hook non
relu. Ouvrir une session, taper `/hooks`, approuver `garde-fous.py`. Détail dans
`.codex/README.md`.

## Les 5 prochaines tâches, par priorité

1. **Fermer l'exposition de la base de production.** Le tunnel `pg-tunnel`
   (socat) publie PostgreSQL sur `178.104.237.33:15432`, ouvert à Internet.
   Toute la base est joignable : identités Discord, collections, commentaires.
   Seuls les identifiants protègent les données, et le mot de passe transite en
   clair. Couper le conteneur et repasser à un tunnel SSH ponctuel pour les
   seeds, ou restreindre le port au pare-feu Hetzner à une seule IP. Vérifier
   avec `nc -vz 178.104.237.33 15432` depuis l'extérieur : la connexion ne doit
   plus s'établir. C'est le point **C1** de l'audit du 26 juin, toujours ouvert.
2. **Passer le correctif des champions en double sur la production** :
   `npx tsx scripts/fix-doublons-ogs-opp.mts` avec le `DATABASE_URL` de prod pour
   voir les 8 lignes, puis `--apply`.
3. **Remettre `npm run lint` au vert.** Passer `npx eslint --fix` pour les trois
   `prefer-const`, puis traiter les onze `set-state-in-effect` un par un
   (la plupart se règlent en dérivant la valeur au rendu au lieu de la poser dans
   un effet). Objectif : que `lint` redevienne une porte utilisable.
4. **Rendre `validate:decks` exploitable** : trouver pourquoi le script dépasse
   cinq minutes et le rendre incrémental, ou au minimum documenter sa vraie
   durée. Un garde-fou qu'on n'ose plus lancer ne garde rien.
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
`prisma db push`, et `migrate.mjs` le pousse au démarrage du conteneur si les
tables manquent. Donc **aucun historique de schéma et aucun retour arrière**.
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
