# Rapport de session du 14 août 2026

> **Document de reprise pour Claude Code, Codex, Hermes ou ChatGPT Desktop.**
>
> État mesuré sur `main`, HEAD `8321eaf3`, dans
> `C:/Users/Allan/Documents/Claude/RiftboundFr`.
>
> **Aucun commit, push ou déploiement n'a été effectué.** Le worktree est massif et
> mélange du code, des sources brutes, des données dérivées et des suppressions
> intentionnelles. Lire ce document, `AGENTS.md` et `HANDOFF.md` avant toute action.

## 1. Résumé exécutif

Cette session a principalement terminé le corpus compétitif Vendetta/S4 : huit
City Challenges chinois et le Riftbound Showdown Ottawa. Toutes les sources
publiées disponibles ont été conservées brutes, parsées avec le pipeline TypeScript
canonique, filtrées selon une règle d'intégrité stricte, puis seedées localement de
façon ciblée.

La règle de publication Vendetta appliquée partout est :

- exactement 39 cartes dans le deck principal ;
- exactement 1 champion ;
- exactement 12 runes ;
- exactement 3 champs de bataille ;
- exactement 10 cartes de réserve.

Une source incomplète n'est jamais complétée par inférence. Son Markdown reste dans
`data/raw-scrapes/` comme preuve, son JSON dérivé est absent ou supprimé, et la
raison du rejet est enregistrée dans un rapport `*-rejected.json`.

### Résultat consolidé du corpus

- **1 531 URL uniques attendues** ;
- **1 531 Markdown présents et valides** (> 500 octets) ;
- **0 échec réseau final** ;
- **982 decklists complètes acceptées et seedées localement** ;
- **549 sources rejetées** car incomplètes ;
- aucune carte manquante inventée ou reconstruite.

Le corpus seedé localement contient :

- 944 decks issus des huit City Challenges chinois ;
- 38 decks Ottawa ;
- 982 decks au total.

Les routes génériques `/tournois`, `/decks`, `/tier-list` et `/meta` lisent la base.
Aucune page spécifique par tournoi n'est nécessaire.

## 2. État exact des tournois

| Tournoi | URL | Markdown valides | Acceptées | Rejetées | Seed local | Contexte DB exact |
|---|---:|---:|---:|---:|---:|---|
| S4 Fuzhou | 128 | 128 | 122 | 6 | 122 | `S4 Fuzhou City Challenge (2026-08-09)` |
| S4 Hangzhou | 124 | 124 | 118 | 6 | 118 | `S4 Hangzhou City Challenge (2026-08-09)` |
| S4 Guangzhou | 128 | 128 | 121 | 7 | 121 | `S4 Guangzhou City Challenge (2026-08-09)` |
| S4 Chengdu | 128 | 128 | 119 | 9 | 119 | `S4 Chengdu City Challenge (2026-08-08)` |
| S4 Beijing | 128 | 128 | 123 | 5 | 123 | `S4 Beijing City Challenge (2026-08-08)` |
| S4 Shanghai | 128 | 128 | 124 | 4 | 124 | `S4 Shanghai City Challenge (2026-08-08)` |
| S4 Shenzhen | 128 | 128 | 118 | 10 | 118 | `S4 Shenzhen City Challenge (2026-08-08)` |
| S4 Wuhan | 114 | 114 | 99 | 15 | 99 | `S4 Wuhan City Challenge (2026-08-08)` |
| Ottawa | 525 | 525 | 38 | 487 | 38 | `Riftbound Showdown Ottawa (2026-08-08)` |
| **Total** | **1 531** | **1 531** | **982** | **549** | **982** | |

### Contrôles DB effectués sur les trois derniers S4

Shanghai :

- 124 lignes ;
- 124 slugs uniques ;
- 0 `featured` ;
- 0 `sourceUrl` manquante ;
- 0 carte non résolue ;
- 0 quantité non positive.

Shenzhen :

- 118 lignes ;
- 118 slugs uniques ;
- 0 `featured` ;
- 0 `sourceUrl` manquante ;
- 0 carte non résolue ;
- 0 quantité non positive.

Wuhan :

- 99 lignes ;
- 99 slugs uniques ;
- 0 `featured` ;
- 0 `sourceUrl` manquante ;
- 0 carte non résolue ;
- 0 quantité non positive.

Les cinq premiers S4 et Ottawa avaient reçu le même contrôle plus tôt dans la
session. Le contrôle consolidé initial a temporairement affiché Guangzhou à zéro
parce que la requête utilisait la mauvaise date (`2026-08-08`). La base porte
correctement le contexte `2026-08-09` avec 121 decks.

## 3. Ottawa : cas particulier à ne pas mal interpréter

Riftdecks affiche :

- 594 inscrits ;
- 581 lignes classées ;
- seulement 525 decklists publiées.

Les 56 listes absentes sont explicitement marquées comme manquantes par la source.
Elles ne doivent jamais être reconstruites.

Sur les 525 Markdown publiés :

- 38 sources contiennent la composition Vendetta complète ;
- 487 sont partielles et rejetées ;
- le Top 8 complet fait partie des 38 listes valides ;
- Rengar est le vainqueur ;
- aucune des 487 sources partielles n'a été complétée.

Rapport :
`data/raw-scrapes/index-fragments/riftbound-showdown-ottawa-rejected.json`.

## 4. Pipeline canonique et commandes de reprise

### Scrape

Le scraper canonique est :

```bash
bash scripts/scrape-tournoi.sh <slug> <url-tournoi> <nombre-pages>
```

Il est idempotent : tout Markdown de plus de 500 octets est repris depuis le cache.
Il passe par `scripts/fc.sh`, qui gère rotation des clés et rate-limit Firecrawl.
Les clés restent sous `.firecrawl/`, hors Git. Ne jamais les imprimer ni les copier
dans un fichier suivi.

Les trois derniers scrapes ont terminé :

- Shanghai 128/128, zéro erreur ;
- Shenzhen 128/128, zéro erreur après une reprise ciblée ;
- Wuhan 114/114, zéro erreur.

Shenzhen avait échoué une première fois sur :

`https://riftdecks.com/riftbound-metagame/deck-si-dan-ka-sha-226512`

La commande canonique a été relancée une fois. Les 127 fichiers présents ont été
pris depuis le cache et seule cette URL a été refacturée. Le second passage a
terminé à 128/128.

### Parsing

Le seul parseur autorisé pour les S4 récents est :

```bash
npx tsx scripts/parse-riftdecks.ts <slug> "<nom>" <AAAA-MM-JJ> <joueurs> Vendetta
```

Commandes exactes des trois derniers tournois :

```bash
npx tsx scripts/parse-riftdecks.ts s4-shanghai "S4 Shanghai City Challenge" 2026-08-08 128 Vendetta
npx tsx scripts/parse-riftdecks.ts s4-shenzhen "S4 Shenzhen City Challenge" 2026-08-08 128 Vendetta
npx tsx scripts/parse-riftdecks.ts s4-wuhan "S4 Wuhan City Challenge" 2026-08-08 114 Vendetta
```

Ne pas utiliser `scripts/parse_riftbound_cached.py` pour ces imports. Son format
diffère et il porte encore un fallback historique Master Yi dangereux.

Le parseur écrit :

- les JSON sous `data/decklists/<legende>/` ;
- un fragment exact sous
  `data/raw-scrapes/index-fragments/<slug>.json` ;
- un rapport de rejets sous
  `data/raw-scrapes/index-fragments/<slug>-rejected.json`.

### Validation

Commandes de validation :

```bash
python -X utf8 -m unittest scripts.validate_decklists_rules_test
npm test -- --run
npx tsc --noEmit
npm run validate:decks
```

Le validateur global vérifie les JSON contre les sources brutes et renvoie un code
non nul en cas de mismatch ou composition Vendetta incomplète.

### Seed local ciblé

La destination doit être vérifiée comme locale sans afficher `DATABASE_URL`.
La commande utilisée est :

```bash
npx tsx --env-file=.env scripts/seed-tournament-decks.ts \
  <slug> "<contexte exact>" Vendetta "city-challenge,s4,vendetta"
```

Le seeder :

- sélectionne les slugs exacts du lot ;
- résout toutes les cartes, le champion et la légende avant toute écriture ;
- conserve `sourceUrl` et les anciens champs source compatibles ;
- refuse une carte non résolue ;
- exécute suppression et recréation dans une transaction Prisma ;
- renvoie un code non nul en cas d'échec ;
- laisse `featured=false`.

Commandes des trois derniers lots :

```bash
npx tsx --env-file=.env scripts/seed-tournament-decks.ts s4-shanghai \
  "S4 Shanghai City Challenge (2026-08-08)" Vendetta \
  "city-challenge,s4,vendetta"

npx tsx --env-file=.env scripts/seed-tournament-decks.ts s4-shenzhen \
  "S4 Shenzhen City Challenge (2026-08-08)" Vendetta \
  "city-challenge,s4,vendetta"

npx tsx --env-file=.env scripts/seed-tournament-decks.ts s4-wuhan \
  "S4 Wuhan City Challenge (2026-08-08)" Vendetta \
  "city-challenge,s4,vendetta"
```

## 5. Fichiers créés pendant le chantier

### Garde-fous et scripts

- `scripts/decklist-integrity.ts`
- `scripts/decklist-integrity.test.ts`
- `scripts/validate_decklists_rules.py`
- `scripts/validate_decklists_rules_test.py`
- `scripts/parse-riftdecks-integrity.ts`
- `scripts/parse-riftdecks-integrity.test.ts`
- `scripts/seed-tournament-integrity.ts`
- `scripts/seed-tournament-integrity.test.ts`
- `scripts/tier-list-integrity.ts`
- `scripts/tier-list-integrity.test.ts`
- `scripts/analyze-vendetta-meta.ts`

### Application

- `src/lib/auth-redirect.ts`
- `src/lib/auth-redirect.test.ts`
- `src/lib/meta-stats.ts`
- `src/lib/meta-stats.test.ts`
- `src/lib/overlay-validation.ts`
- `src/lib/overlay-validation.test.ts`

### Données et rapports

- `data/raw-scrapes/s4-incomplete-side-decks.json`
- fragments et rapports `*-rejected.json` pour Beijing, Shanghai, Shenzhen,
  Wuhan, Ottawa et les quatre premiers S4 reparsés ;
- sources brutes complètes pour Beijing, Shanghai, Shenzhen, Wuhan et Ottawa ;
- JSON dérivés acceptés sous `data/decklists/`.

## 6. Fichiers modifiés importants et pourquoi

### Données decklists

- `scripts/parse-riftdecks.ts`
  - arguments de tournoi au lieu de Xi'an codé en dur ;
  - validation Vendetta complète ;
  - rapport de rejets explicite ;
  - fragment exact et idempotent ;
  - suppression des anciens JSON dérivés devenus invalides ;
  - préservation des Markdown bruts.
- `scripts/validate-decklists.py`
  - contrôle Vendetta complet ;
  - tous les dossiers bruts découverts dynamiquement.
- `scripts/seed-tournament-decks.ts`
  - slugs exacts ;
  - préflight de résolution ;
  - sources préservées ;
  - transaction atomique ;
  - code d'échec fiable.
- `scripts/seed-tier-lists.ts`
  - résolution exacte des légendes ;
  - Master Yi n'est plus résolu par simple prénom ou préfixe ambigu.

### Méta, tier list et tournois

- `src/app/meta/page.tsx`
- `src/app/meta/meta-filters.tsx`
- `src/lib/meta-stats.ts`
- `src/lib/meta-stats.test.ts`
- `src/lib/i18n-en.ts`
- `src/components/tournament-list.tsx`
- `src/lib/tournament-flags.ts`
- `src/app/api/admin/tier-list/route.ts`
- `src/app/tier-list/page.tsx`
- `src/app/sitemap.ts`

La page `/meta` est maintenant dynamique, alimentée par la DB, filtrable par set
et tournoi, responsive et orientée Vendetta. La metadata `/tier-list` ne porte plus
le chiffre Unleashed périmé. Le sitemap contient `/meta`. L'API admin connaît le
code de set Vendetta `VEN`.

### Authentification et overlay

- `src/lib/auth-redirect.ts` et son test ;
- `src/app/api/auth/discord/route.ts` ;
- `src/app/api/auth/discord/callback/route.ts` ;
- `src/app/api/overlay/state/route.ts` ;
- `src/lib/overlay-validation.ts` et son test ;
- `src/app/profil/overlay/page.tsx` ;
- `src/app/profil/page.tsx` ;
- `src/components/navbar.tsx`.

Le lien « Habillage de stream » réutilise `/profil/overlay` et l'auth Discord
existante. Les retours OAuth sont limités aux chemins locaux. Les URL absolues,
les chemins `//...` et les formes ambiguës sont refusés.

La route d'écriture overlay refuse désormais :

- le JSON mal formé ;
- une charge annoncée ou réelle au-delà de 32 Kio ;
- les propriétés inconnues ;
- les formats hors BO1/BO3/BO5 ;
- les nombres, textes, joueurs, terrains et listes de cartes hors limites.

### Démarrage et sécurité

- `entrypoint.sh` utilise maintenant `set -e` ; le serveur ne démarre plus si la
  migration échoue.
- `migrate.mjs` ne passe plus `--accept-data-loss` et propage l'échec.

Le port historique PostgreSQL `178.104.237.33:15432` a été testé depuis
l'extérieur pendant la session : connexion refusée. Ne pas le rouvrir publiquement.

## 7. Refonte `/meta`

La page a été refaite en réutilisant les données et conventions existantes.
Principes :

- `export const dynamic = "force-dynamic"` pour éviter une page vide figée au
  build lorsque la base n'est pas disponible ;
- statistiques calculées côté serveur puis filtrées côté client ;
- Vendetta sélectionné par défaut lorsque présent ;
- filtres set/tournoi ;
- statistiques de volume, participation et performance ;
- liens vers les decklists ;
- aucun « winrate » inventé à partir de la popularité ;
- mobile 390 px et desktop 1440 px vérifiés avec Playwright ;
- absence d'overflow constatée ;
- filtres fonctionnels ;
- pas d'erreur console lors de ce contrôle.

Correctifs accessibilité issus de l'audit Codex :

- suppression du second `<main>` imbriqué ;
- focus visible sur les sélecteurs ;
- résultats annoncés via `aria-live` ;
- `/meta` ajouté au sitemap.

## 8. Overlay et OAuth

Le système existait déjà. Aucun second système n'a été créé.

Parcours anonyme vérifié :

- accès à `/profil/overlay` ;
- redirection 307 vers
  `/api/auth/discord?retour=%2Fprofil%2Foverlay` ;
- destination locale assainie ;
- retour vers la page overlay après connexion.

Tests anti-open-redirect :

- URL absolue externe refusée ;
- `//evil...` refusé ;
- destination ambiguë refusée ;
- chemin local autorisé.

À faire encore : un test réel dans OBS avec une source navigateur et un passage
mobile complet sur le tableau de bord authentifié.

## 9. Tier list Vendetta : état et règle éditoriale

**Aucune tier list Vendetta n'a été seedée pendant cette session.** C'est volontaire.

Ne pas utiliser directement `data/meta-analysis.json` : il s'agit d'un ancien
snapshot cross-set qui mélange les ères. `scripts/analyze-meta.ts` mélange aussi
les sets et ignore silencieusement certains JSON illisibles.

Le script dédié `scripts/analyze-vendetta-meta.ts` doit être utilisé pour produire
les données du corpus Vendetta complet.

Une tier list ne doit pas être déduite de la seule popularité. Elle doit combiner :

- part du field ;
- présence en Top 8 ;
- conversion field vers Top 8 ;
- victoires ;
- régularité entre tournois ;
- taille d'échantillon ;
- lecture qualitative des matchups et de la méta.

Signaux éditoriaux mesurés avant les trois derniers imports, donc à recalculer :

- Kennen : 69 decks, 4 Top 8, 1 victoire ;
- Kai'Sa : 66 decks, 6 Top 8, 1 victoire ;
- Master Yi Bladesman : 63 decks, 9 Top 8, 0 victoire ;
- Irelia : 44 decks, 5 Top 8, 0 victoire ;
- Diana : 36 decks, 4 Top 8, 2 victoires ;
- Nasus : 36 decks, 2 Top 8, 1 victoire ;
- Jayce : 27 decks, 0 Top 8 ;
- Akali : 22 decks, 0 Top 8.

Vainqueurs des cinq premiers S4 :

- Fuzhou : Kai'Sa ;
- Hangzhou : Diana ;
- Guangzhou : Nasus ;
- Chengdu : Kennen ;
- Beijing : Diana.

Ottawa : Rengar.

Ces valeurs ne sont plus finales maintenant que Shanghai, Shenzhen et Wuhan sont
intégrés. Les recalculer avant toute décision éditoriale.

## 10. Vérifications exécutées

Derniers résultats connus avant la rédaction de ce rapport :

- `npx tsc --noEmit` : **exit 0** ;
- Vitest : **18 fichiers, 123 tests réussis** ;
- tests Python : **4 réussis** ;
- `npm run build` : **exit 0** après les modifications overlay, `/meta`, sitemap,
  entrypoint et migration ;
- `npm run lint` : **15 erreurs, 96 avertissements**, exactement la dette de
  référence documentée, aucune nouvelle erreur attribuée au chantier ;
- validation anti-fabrication finale après Shanghai, Shenzhen et Wuhan :
  **21 937 vérifiées, 0 mismatch, 0 composition Vendetta incomplète publiée,
  1 201 anciennes listes sans source brute**, exit 0 ;
- processus de cette validation : `proc_445fc1b4d614`.

Playwright :

- `/meta` vérifié à 390 px et 1440 px ;
- entrée overlay et redirection anonyme vérifiées ;
- installation Playwright temporaire/no-save ;
- `package.json` et `package-lock.json` ne doivent conserver aucun changement
  Playwright.

Serveur de développement encore actif au moment de la rédaction :

- processus Hermes `proc_1d25d3410dd1` ;
- commande `NODE_ENV=development npm run dev` ;
- application sur `http://localhost:3000`.

## 11. Audit Codex indépendant

Un vrai audit Codex CLI en lecture seule a été exécuté sur le worktree actuel :

```bash
codex exec --sandbox read-only '<prompt audit complet>'
```

Processus : `proc_ed6b4001b025`, exit 0.

Principaux constats de Codex :

### Critiques au moment de l'audit

1. PostgreSQL documenté comme publiquement exposé.
   - contrôle ultérieur : port 15432 refusé depuis l'extérieur ;
   - ne pas le rouvrir.
2. Le conteneur continuait après une migration ratée.
   - corrigé avec `set -e`.
3. `migrate.mjs` utilisait `--accept-data-loss`.
   - corrigé, option supprimée et erreurs propagées.

### Élevés

- seed tournoi non atomique ; corrigé par transaction ;
- worktree trop massif pour une revue unique ; toujours vrai ;
- valider et borner le JSON overlay ; corrigé et testé ;
- exécuter types/tests/build/validateur hors sandbox ; effectué ;
- lint rouge ; dette historique toujours présente.

### Moyens ou faibles

- double `<main>` dans `/meta` ; corrigé ;
- focus et annonce des filtres `/meta` ; corrigés ;
- `/meta` absent du sitemap ; corrigé ;
- CSP encore large avec `unsafe-inline` et `unsafe-eval` ; non traité ;
- stratégie de migration non traçable (`db push`, pas de migrations) ; non traitée ;
- tests OBS/mobile overlay ; à faire.

Verdict Codex : le fond est mieux tenu que ne le suggère le nombre de scripts et
les nouveaux garde-fous vont dans le bon sens. Son rapport complet est dans les
logs du processus Hermes ; la notification finale n'en montrait que la feuille de
route.

## 12. Erreurs rencontrées pendant la session

Cette section est volontairement détaillée pour éviter à Claude de repayer les
mêmes erreurs.

### Erreurs Windows et environnement

1. Un `subprocess` Python a essayé de lancer directement `npx` et Windows n'a pas
   trouvé l'exécutable `.cmd`.
   - résolution : lancer `npx` via le shell bash Hermes ;
   - règle : programmes natifs avec chemins `C:/...`, commandes `.cmd` via shell.
2. Un script temporaire TypeScript a été écrit dans `%LOCALAPPDATA%/Temp` puis n'a
   pas pu résoudre `@prisma/client`, car la résolution de modules partait du
   dossier temporaire.
   - résolution : exécuter depuis la racine du dépôt ou placer le script dans le
     dépôt ;
   - ne pas répéter.
3. Un script TypeScript temporaire CJS utilisait `await` au niveau racine.
   - erreur esbuild : top-level await non supporté avec sortie CJS ;
   - résolution : envelopper dans `async function main()` ou utiliser une IIFE.
4. `DATABASE_URL` n'était pas exportée dans le shell alors que les outils du projet
   la chargent depuis `.env`.
   - résolution : `npx tsx --env-file=.env ...` ou `node --env-file=.env ...` ;
   - ne jamais imprimer la valeur.
5. Des recherches `rg` ont échoué sur des regex mal échappées (`unclosed group`).
   - défaut de commande uniquement ; aucun fichier modifié.

### Erreurs de contrôle et hypothèses de schéma

1. Un contrôle maison a traité le champ `file` d'un fragment comme relatif à la
   racine du dépôt ; il est relatif à `data/decklists/`.
2. Un contrôle a supposé que `champion` était une liste de cartes ; dans le JSON
   canonique c'est une chaîne.
3. Un contrôle a supposé que le rapport `*-rejected.json` était un tableau ; c'est
   un objet avec la clé `decks`.
4. Une requête Prisma de contrôle a utilisé `source` et `deckCards` ; le modèle
   expose `sourceUrl` et `cards`.
5. Le contrôle consolidé a utilisé la mauvaise date Guangzhou (`08-08` au lieu de
   `08-09`), donnant temporairement zéro deck. La DB contient bien 121 lignes.

Ces erreurs n'ont pas modifié les sources ni la DB, sauf les seeds explicitement
réussis. Elles concernaient les scripts de vérification ad hoc.

### Erreurs d'édition et de typage corrigées

1. Un patch `/meta` a remplacé accidentellement des classes CSS utiles en ajoutant
   le focus visible. Les classes (`min-h-11`, largeur, fond, chiffres tabulaires)
   ont été rétablies avant validation.
2. Le premier raccordement du validateur overlay transmettait une valeur `unknown`
   à `saveState`, donc `tsc` a échoué.
   - correction : le validateur renvoie un `PatchOverlay` typé dans son cas
     `ok: true` ;
   - résultat : TypeScript vert et tests verts.
3. Un patch multi-fichier a été refusé car son point d'insertion était ambigu.
   Aucun fichier n'a été modifié par cette tentative ; le patch a été découpé.
4. Le premier test overlay a volontairement échoué car le module n'existait pas
   encore : étape RED du TDD, puis implémentation et passage au vert.
5. Un serveur Next secondaire a rencontré une instance déjà active ; aucun second
   serveur durable n'a été laissé.

### Erreurs ou signaux récupérables externes

- Shenzhen : une URL Firecrawl en échec après deux essais ; reprise idempotente
  réussie ensuite, 128/128.
- Première tentative d'installation Playwright : code 127 ; relance réussie.
- Anciennes anomalies Windows rencontrées pendant le chantier : sandbox Codex
  `CreateFileMapping` accès refusé, WSL `E_ACCESSDENIED`, préparation CUA demandant
  un PID navigateur. Elles ont été contournées sans modifier l'application.
- `npm run lint` reste rouge, mais au niveau historique exact 15/96.

## 13. État du worktree

Au relevé final avant création de ce rapport :

- branche `main` ;
- HEAD `8321eaf3` ;
- **603 entrées** dans `git status --porcelain` ;
- 27 fichiers suivis modifiés ;
- 28 fichiers suivis supprimés ;
- 548 chemins non suivis ;
- diff suivi : 55 fichiers, 482 insertions et 5 904 suppressions.

Les 28 suppressions sous `data/decklists/` sont intentionnelles : ce sont des JSON
anciennement publiés que la règle Vendetta stricte rejette désormais. Leurs
Markdown bruts restent conservés et leurs raisons figurent dans les rapports de
rejet. Ne pas restaurer aveuglément ces fichiers.

Le nombre très élevé de non-suivis vient principalement des sources brutes et des
JSON dérivés des nouveaux tournois. Ne pas faire `git add .` sans revue par lots.

Aucun changement Playwright ne doit apparaître dans `package.json`,
`package-lock.json` ou `tsconfig.json`. `tsconfig.json` avait été modifié
automatiquement par Next puis restauré.

## 14. Travaux restant à faire

### Priorité 1 : validation finale du corpus

1. Contrôler si nécessaire les 982 decks de la DB dans une seule requête avec les
   neuf contextes exacts, dont Guangzhou au 9 août. Les comptes individuels sont
   déjà vérifiés et le validateur global final est vert.
2. Conserver les rapports de rejet avec les sources brutes lors de la préparation
   des lots de commit.

### Priorité 2 : analyse et connaissance Vendetta

1. Exécuter `npx tsx --env-file=.env scripts/analyze-vendetta-meta.ts`.
2. Vérifier ses agrégations contre les neuf contextes DB.
3. Mettre à jour `docs/META-KNOWLEDGE.md` avec :
   - field complet ;
   - Top 8 ;
   - conversion ;
   - victoires ;
   - résultats par tournoi ;
   - limites de l'échantillon.
4. Mettre à jour `docs/DECKBUILDING-RULES.md` seulement si les données complètes
   apportent de nouvelles règles ou cores vérifiables.
5. Compléter les fiches des neuf nouvelles légendes Vendetta si nécessaire.

### Priorité 3 : tier list Vendetta

1. Produire une proposition éditoriale fondée sur le corpus complet.
2. La faire valider explicitement par Allan.
3. Seulement après validation :

```bash
npx tsx --env-file=.env scripts/seed-tier-lists.ts
npx tsx --env-file=.env scripts/audit-tier-lists.mts Vendetta
npx tsx scripts/gen-tierlist-image.mts Vendetta
```

Ne pas attribuer automatiquement les tiers depuis la popularité.

### Priorité 4 : contrôles navigateur finaux

Avec le serveur local :

- `/tournois` desktop/mobile ;
- chaque nouveau tournoi ;
- `/decks?set=Vendetta` ;
- `/tier-list` ;
- `/meta` desktop/mobile ;
- entrée Outils vers overlay ;
- redirection anonyme overlay ;
- tableau de bord overlay authentifié mobile ;
- rendu `/overlay/[token]` dans une source navigateur OBS.

Vérifier : erreurs console, overflow horizontal, focus, navigation clavier, images,
filtres et compteurs.

### Priorité 5 : lots de commit

Aucun commit sans demande d'Allan. Quand il l'autorisera, séparer au minimum :

1. garde-fous parse/validation/seed ;
2. données brutes et fragments ;
3. JSON decklists acceptés et suppressions invalides ;
4. `/meta` et traductions ;
5. OAuth/overlay ;
6. démarrage/migration/sécurité ;
7. documentation et rapport.

Ne jamais mélanger 603 chemins dans un commit unique sans inspection.

### Dette non traitée

- lint : les 15 erreurs historiques sont corrigées ; 97 avertissements restent ;
- CSP avec `unsafe-inline` et `unsafe-eval` ;
- stratégie Prisma sans migrations traçables ;
- rate-limit en mémoire et absent de certaines routes d'écriture ;
- 1 201 anciennes listes sans source brute lors du dernier validateur terminé ;
- `scripts/analyze-meta.ts` cross-set et permissif ;
- `scripts/audit-tier-lists.mts` avec `MIN_N=50`, peut-être trop haut pour
  Vendetta ;
- `tier-unleashed.py` codé en dur pour Unleashed ;
- branche historique `feat/stream-overlay` à ne pas fusionner sans décision.

## 15. Règles absolues pour la reprise

1. Lire `AGENTS.md`, ce rapport et `HANDOFF.md` avant toute modification.
2. Ne jamais inventer une decklist, une carte, une réserve ou un résultat.
3. Les sources Markdown brutes priment sur les JSON dérivés.
4. Une decklist Vendetta incomplète est rejetée, jamais complétée.
5. Riftdecks sert à l'identification et à la vérification ; les images publiques
   viennent de Riftcodex.
6. Ne pas recréer un outil si une route, un composant ou un script existe déjà.
7. Les images de deck viennent uniquement de `/api/decklist-image` ou du flux
   `generateDeckImage` existant selon le format demandé.
8. Les prix et achats passent uniquement par `src/lib/cardnexus.ts`.
9. Master Yi doit être résolu par identité complète, jamais par prénom ou préfixe.
10. Vérifier que la DB est locale avant toute écriture ; ne jamais imprimer les
    identifiants.
11. Aucun seed global, migration destructive ou `db push --accept-data-loss`.
12. Aucun commit, push ou déploiement sans autorisation explicite.
13. Sous Hermes Windows : terminal bash/MSYS, chemins natifs `C:/...`, pas de
    commandes PowerShell, exécutables `.cmd` via le shell.
14. Ne pas utiliser `rtk` comme garde de code de sortie.
15. Ne pas restaurer les 28 JSON supprimés sans vérifier leur rapport de rejet.

## 16. Point de départ recommandé pour Claude

```bash
# 1. Lire les règles et la passation
# AGENTS.md
# HANDOFF.md
# docs/RAPPORT-SESSION-2026-08-14.md

# 2. Vérifier l'état sans modifier
git status --short
git branch --show-current
git rev-parse --short HEAD

# 3. Le validateur final est déjà vert
# proc_445fc1b4d614 : verified=21937, mismatch=0, Vendetta incomplète=0

# 4. Rejouer les portes si d'autres fichiers ont changé
npx tsc --noEmit ; echo "TSC_EXIT=$?"
npm test -- --run ; echo "TEST_EXIT=$?"
npm run build ; echo "BUILD_EXIT=$?"

# 5. Analyse Vendetta seulement après validation globale
npx tsx --env-file=.env scripts/analyze-vendetta-meta.ts
```

Le prochain agent doit commencer par recalculer la connaissance Vendetta à partir
du corpus désormais validé. Il ne doit ni refaire les scrapes, ni reparcourir les
549 listes rejetées pour essayer de les « réparer », ni seeder une tier list sans
validation éditoriale.

## 17. `/decks` et audit des routes utilisateur

Demande reçue le 14 août 2026 : rendre les 51 premiers decks côté serveur, puis
charger les suivants au défilement sans perdre les filtres, le tri ni la couverture
de collection.

`src/lib/deck-listing.ts` exécute la requête commune de la page et de
`GET /api/decks`. La page envoie le premier lot au composant client
`src/app/decks/decks-progressifs.tsx`. Un `IntersectionObserver` charge le lot
suivant quand le sentinel approche du viewport ; le bouton
`Charger plus de decks` reste disponible comme secours. Le composant annonce aussi
le chargement, l'erreur et la fin. Le module pur `src/lib/deck-listing-params.ts` lit et transmet
`cat`, `legend`, `set`, `tournament`, `q`, `sort`, `owned` et `offset` sans importer
Prisma dans le graphe client.

Fichiers du chantier :

- `src/app/decks/page.tsx` ;
- `src/app/decks/decks-progressifs.tsx` ;
- `src/app/api/decks/route.ts` ;
- `src/lib/deck-listing.ts` ;
- `src/lib/deck-listing-params.ts` ;
- `src/lib/deck-listing.test.ts` ;
- `docs/AUDIT-SITE-2026-08-14.md` ;
- `HANDOFF.md` et ce rapport.

L'audit a été repris avec gpt-5.6-sol et Playwright MCP sur les routes publiques,
dynamiques, connectées, administratives, anglaises et API. Il classe les faits,
leurs preuves et les limites dans `docs/AUDIT-SITE-2026-08-14.md`. Sept captures de
contrôle sont conservées dans `docs/audit-2026-08-14/`.

Validations intermédiaires réellement menées :

- `npm test -- --run --pool=threads src/lib/deck-listing.test.ts` : 3 tests verts ;
- `npx tsc --noEmit` : sortie 0 après le premier raccord de la page.

Validations finales réellement exécutées après le dernier changement :

- ESLint ciblé sur les cinq fichiers fonctionnels touchés : sortie 0, avec trois
  avertissements `no-img-element` préexistants dans `deck-panel.tsx` ;
- `npx tsc --noEmit` : sortie 0 ;
- `npm test -- --run --pool=threads` : 19 fichiers et 126 tests verts, sortie 0 ;
- `npm run verify` : sortie 0, build Next réussi et 52 pages générées ;
- `git diff --check` : sortie 0, avec les seuls avertissements de conversion
  LF vers CRLF sur des fichiers déjà présents dans le worktree.

Playwright prouve 51 decks au départ, 102 après arrivée en bas, puis 448 URL de
decks uniques à la fin sans boucle. Les routes avec session et plusieurs segments
dynamiques réels ont été exécutés à 320, 768 et 1440 px. Restent hors périmètre :
lecteur d'écran réel, Lighthouse, OAuth Discord réel et routes de partage sans
donnée locale vérifiable. Aucun commit, push, reset, seed ou changement de donnée
brute n'a été fait par cette reprise.

Le contrôle statique final a aussi révélé deux défauts reproduits dans le tiroir
mobile du deckbuilder : le focus revenait sur `Fermer` après chaque modification et
les actions de carte dépendaient du survol. `use-dialog-a11y.ts` garde désormais le
dernier callback sans remonter son effet ; `deck-panel.tsx` expose toujours les
actions. Playwright confirme le maintien du focus et une quantité passée de 7 à 6
par clic, sans débordement.

## 18. Clôture de l'audit Codex

La passe suivante a traité les défauts confirmés par l'audit, sans toucher aux
données de production :

- validation stricte des corps JSON des routes admin, dont les dates, blocs
  d'article, cartes, événements et tier lists ;
- résolution canonique des noms de cartes lors des imports ;
- transactions pour les créations et mises à jour qui portent plusieurs tables ;
- refus des impressions alternatives, sur-numérotées, signées et OPP dans les
  tier lists ;
- 61 contrôles de l'éditeur d'article dotés d'un nom accessible ;
- courses corrigées dans le chargement du deckbuilder et le bouton Favoris ;
- démarrage du conteneur fermé sur erreur et contrôle en lecture seule des 18
  tables attendues ;
- workflow CI pour lint, TypeScript, Vitest et le build ;
- commandes PowerShell corrigées dans les documents partagés.

Contrôles exécutés après les derniers changements :

- `npx tsc --noEmit` : sortie 0 ;
- `npm test -- --pool=threads` : 22 fichiers, 140 tests verts ;
- `npm run lint` : sortie 0, 0 erreur et 97 avertissements ;
- `npm run build` avec une URL PostgreSQL factice : sortie 0, 52 pages générées ;
- `git diff --check` : sortie 0.

Le build journalise l'absence de PostgreSQL sur l'URL factice, sans échouer. Il
signale aussi que Next.js déprécie la convention `middleware.ts` au profit de
`proxy.ts`. Ce renommage n'a pas été fait dans cette passe. Aucun commit, push,
seed ou déploiement n'a été effectué.
