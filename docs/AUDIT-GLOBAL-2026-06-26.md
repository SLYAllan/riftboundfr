# Audit global — Riftbound France

Date : 2026-06-26
Périmètre : sécurité, bugs/logique, SEO & GEO, performance, accessibilité, intégrité des données, build & dépendances, code mort, cohérence contenu FR.
Méthode : audit par dimension + vérification adversariale (réfutation) des findings majeurs.

---

## 1. Score de santé global

### Score : **62 / 100**

Le projet a un socle fonctionnel solide (SEO/GEO bien structuré, intégrité des decklists confirmée, build et typecheck verts). Il est pénalisé par une faille d'infrastructure critique (DB de prod exposée), une accessibilité faible et systémique, et plusieurs problèmes de cache/perf sur les pages les plus crawlées.

### Synthèse par dimension

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

## 2. Findings par priorité

> Priorité aux findings **confirmés réels** par la vérification adversariale. La sévérité indiquée est la sévérité **ajustée** après réfutation.

### CRITICAL

#### C1. Base de données Postgres de production exposée sur IP publique
- **Fichier / infra** : tunnel `pg-tunnel` (socat) — hors repo, documenté dans `project_prod_db_exposure.md` et `data/audit-15juin-security-seo.md`. Exposition sur `178.104.237.33:15432`.
- **Problème** : socat binde Postgres sur `0.0.0.0:15432`, accessible depuis Internet. Toute la base (identités Discord/Riot OAuth = PII, collections, commentaires, decks) est joignable directement ; seule la connaissance des identifiants DB protège les données (bruteforce / 0-day Postgres / leak de `DATABASE_URL`, mot de passe transitant en clair via socat). Vérification : exposition corroborée par plusieurs artefacts convergents, aucune règle de pare-feu / bind localhost trouvée dans le repo.
- **Recommandation** : `docker stop pg-tunnel` + repasser en tunnel SSH ponctuel pour les seeds, OU restreindre `15432` au pare-feu Hetzner Cloud à la seule IP d'Allan, et le couper hors fenêtre de seed. Ne jamais laisser le port exposé en permanence.
- **Indicateur de réussite** : `nc -vz 178.104.237.33 15432` depuis l'extérieur n'établit plus de connexion ; règle UFW / Hetzner Cloud Firewall en place.

---

### HIGH

#### H1. Sessions HMAC sans expiration ni révocation côté serveur
- **Fichier** : `src/lib/session.ts:18-42` ; `src/lib/auth.ts:20-32,57-60`
- **Problème** : `verify()` / `verifySignature()` recalculent le HMAC mais ne vérifient JAMAIS le timestamp encodé. Un cookie volé reste valide indéfiniment (le `maxAge` n'agit que côté navigateur). Aucun store de sessions → révocation impossible (logout = suppression du cookie client uniquement). Un token admin exfiltré = accès admin permanent jusqu'à rotation de `SESSION_SECRET`.
- **Recommandation** : vérifier l'âge du payload côté serveur (rejeter si timestamp > N jours) et/ou stocker les sessions en DB (table `Session` avec révocation). Au minimum, intégrer une époque rotative dans le secret.
- **Indicateur de réussite** : un token ancien dépassant la fenêtre est rejeté ; un mécanisme de révocation existe.

#### H2. Deckbuilder : export/partage et sauvegarde corrompent les copies multiples du champion
- **Fichier** : `src/app/deckbuilder/deckbuilder.tsx:389-393, 406-410` (export) ; `316-334`/`358-373` (sauvegarde locale)
- **Problème** : `getShareUrl()` et `getTextCode()` encodent le champion en dur à `quantity:1` et retirent TOUTES ses copies du main. Un deck jouant 2-3 copies du champion (autorisé, `maxQuantity('main')=3`) est exporté/partagé avec une seule copie ; au réimport (`loadFromCodeData`) le champion n'est rajouté qu'à +1 → round-trip 3x → 1x = perte silencieuse. `getTTSCode()` (L418-427) n'a PAS le bug (preuve de l'incohérence). La sauvegarde locale duplique au contraire le champion (poussé en section legend ET conservé dans main).
- **Recommandation** : encoder le champion avec sa quantité réelle (`championInMain.quantity`), aligner `getShareUrl`/`getTextCode`/`saveDeck` sur la logique de `getTTSCode`, vérifier le décompte au réimport.
- **Indicateur de réussite** : construire un deck avec 3 copies du champion, Partager, recharger l'URL → 3 copies affichées (pas 1) ; cohérent avec l'export TTS.

#### H3. Menus déroulants et modales sans ARIA, sans piège de focus, sans fermeture clavier
- **Fichier** : `src/components/navbar.tsx:55-84` ; `src/components/user-menu.tsx:63-117` ; `export-modal.tsx:110-111` ; `import-modal.tsx:107-108` ; `card-detail-modal.tsx:14-15`
- **Problème** : dropdowns sans `aria-expanded`/`aria-haspopup`/`role=menu`, fermeture sur `mousedown` extérieur uniquement (pas d'Escape, pas de déplacement de focus). Modales = `<div className="fixed inset-0">` sans `role="dialog"` ni `aria-modal`, sans piège de focus ni retour de focus au déclencheur. `card-detail-modal` n'a aucun handler clavier. Violations WCAG 4.1.2 / 2.4.3 / 1.4.13.
- **Recommandation** : ajouter `aria-expanded`, `aria-haspopup="menu"`, fermeture Escape sur les dropdowns ; `role="dialog" aria-modal="true" aria-labelledby` + piège de focus + retour de focus + Escape généralisé sur les modales. Envisager la primitive `ui/dialog` (Base UI) déjà présente.
- **Indicateur de réussite** : ouvrir un menu/modale au clavier → `aria-expanded` à true, Escape ferme, focus piégé puis rendu au déclencheur.

#### H4. Hook React appelé conditionnellement (rules-of-hooks) dans `deck-summary.tsx`
- **Fichier** : `src/components/deck-summary.tsx:95,101`
- **Problème** : dans `StackedCurve`, l'early return `if (!hasData) return null;` (L95) précède `const [hovered, setHovered] = useState(null);` (L101). `hasData` varie entre rendus → nombre de hooks variable → crash runtime possible « Rendered more hooks than during the previous render ». Bug de correction, pas une préférence de lint.
- **Recommandation** : remonter le `useState` au-dessus de tout return anticipé, garder l'early return après.
- **Indicateur de réussite** : `npx eslint src/components/deck-summary.tsx` ne remonte plus `react-hooks/rules-of-hooks` ; le `useState` est lexicalement avant tout return.

#### H5. Em-dashes dans le contenu d'articles seedés rendus en prod (Hartford en ligne)
- **Fichier** : `scripts/seed-hartford-article.mts:140` (et `:35` deckName) ; `prisma/seed-bestof-articles.ts` + `seed-*-bestof.ts` ; scripts Top 8
- **Problème** : les scripts de seed injectent systématiquement des tirets cadratins (—) dans des champs rendus : titres, intros, excerpts (= meta description SEO), en-têtes, `deckName`, labels de tier (« Tier 1 — Top 8 »). Le rendu ne transforme pas le caractère → violation directe de la règle éditoriale « pas de tiret cadratin ». Au moins l'article récap Hartford est EN LIGNE avec un — dans sa prose.
- **Recommandation** : remplacer les — de contenu par « , », « : » ou « · » selon le contexte ; re-seeder les articles/best-of concernés en prod. Laisser les — décoratifs des commentaires de code.
- **Indicateur de réussite** : `grep -n '—'` sur les scripts de seed ne renvoie plus de ligne dans `content`/`excerpt`/`title`/`deckName`/`context`/tier label ; aucune page prod n'affiche de —.

---

### MEDIUM

#### M1. Le secret de signature des sessions peut retomber sur `ADMIN_PASSWORD`
- **Fichier** : `src/lib/auth.ts:8-12`
- **Problème** : `getSessionSecret()` retourne `SESSION_SECRET || ADMIN_PASSWORD` et ne lève que si les deux manquent. Si `SESSION_SECRET` est oublié en prod, un mot de passe humain (faible entropie) sert de clé HMAC. Le fichier frère `session.ts:8` plante correctement sans secret — le bon pattern existe déjà. (Sévérité ajustée de High à Low/Medium : HMAC SHA-256 résistant à la préimage, et la checklist prod impose `SESSION_SECRET` via `openssl rand -hex 32` ; ne se matérialise que sur oubli opérateur.)
- **Recommandation** : aligner `auth.ts` sur `session.ts` — supprimer le fallback `|| process.env.ADMIN_PASSWORD`, fail-fast au boot si `SESSION_SECRET` absent.
- **Indicateur de réussite** : `auth.ts` ne référence plus `ADMIN_PASSWORD` comme secret ; le boot échoue sans `SESSION_SECRET`.

#### M2. CSP autorise `unsafe-inline` et `unsafe-eval` sur `script-src`
- **Fichier** : `src/middleware.ts:22`
- **Problème** : la CSP ne fournit aucune protection XSS ; tout point d'injection HTML (commentaires, titres de decks, markdown rendu) deviendrait exploitable.
- **Recommandation** : passer à une CSP à nonce/hash (nonce par requête dans le middleware, retirer `unsafe-inline`/`unsafe-eval`). Isoler GTM via nonce si nécessaire.
- **Indicateur de réussite** : l'en-tête CSP prod n'a plus `unsafe-eval` et remplace `unsafe-inline` par `nonce-...` sur `script-src`.

#### M3. Rate-limiting en mémoire process-local, contournable et perdu au redémarrage
- **Fichier** : `src/app/api/auth/route.ts:4-13` ; `src/app/api/community-decks/route.ts:20-29`
- **Problème** : Map en mémoire indexée sur `x-forwarded-for` (spoofable si le proxy ne réécrit pas), état perdu à chaque redéploiement Coolify, et la plupart des endpoints mutatifs (comments, votes, likes, collection/bulk, wishlist) n'ont AUCUN rate-limit.
- **Recommandation** : centraliser (Redis ou table DB) avec une clé IP fiable ; étendre au login admin et aux écritures sensibles ; vérifier que Traefik écrase `x-forwarded-for`.
- **Indicateur de réussite** : le rate-limit survit à un restart, n'est pas contournable en variant l'en-tête, et le login admin reste limité.

#### M4. `image-proxy` suit les redirections : SSRF possible
- **Fichier** : `src/app/api/image-proxy/route.ts:18-29`
- **Problème** : seul le hostname initial (`cmsassets.rgpub.io`) est validé, mais `fetch()` suit les redirections. Un 3xx vers une cible interne (`169.254.169.254`, `127.0.0.1`, services Coolify) serait suivi et renvoyé.
- **Recommandation** : `redirect: "manual"`, refuser/re-valider tout 3xx contre l'allowlist, vérifier le content-type `image/*` et borner la taille.
- **Indicateur de réussite** : une URL autorisée renvoyant un 302 vers `127.0.0.1` n'est plus suivie (403/502) ; `redirect:'manual'` présent.

#### M5. `/meta` charge tous les decks publiés à chaque requête, sans pagination ni cache
- **Fichier** : `src/app/meta/page.tsx:2,30-117`
- **Problème** : `force-dynamic` + `prisma.deck.findMany({ where:{published:true}, select:{...} })` sans `take`, agrégations en JS à chaque hit. Sur le petit Hetzner, chaque crawl recharge et re-réduit l'ensemble. (Medium : SELECT restreint à 4 colonnes scalaires, mais coût récurrent évitable.)
- **Recommandation** : remplacer par des agrégations SQL (`prisma.deck.groupBy({ by:['legendName'], _count:true, where:{published:true} })`) + requête distincte tournois/formats, le tout enveloppé dans `unstable_cache({ revalidate:300, tags:['meta'] })` comme la home.
- **Indicateur de réussite** : `/meta` n'exécute plus de findMany retournant >1000 lignes ; réponse servie depuis un cache.

#### M6. ~15 pages publiques en `force-dynamic` sans cache (zéro ISR/CDN)
- **Fichier** : `src/app/cartes/page.tsx:1` ; `tier-list/page.tsx:2` ; `articles/page.tsx:1` ; `decks/page.tsx:1` ; `tournois`, `deckbuilder`, `guides/glossaire`
- **Problème** : cause racine documentée dans le code (« `revalidate` froze it empty at Docker build » : DB non joignable au build). Le contournement `force-dynamic` supprime tout cache → round-trip Prisma + SSR à chaque requête. La home prouve que `unstable_cache` résout proprement le problème. (Medium : périmètre réel plus étroit que « ~15 pages » ; `/cartes`, `/decks`, `/articles` lisent `searchParams` donc le fix est paramétré ; gains nets et incontestables sur `/tier-list`, `/meta`, `/guides/glossaire` qui ne prennent aucun param.)
- **Recommandation** : envelopper les requêtes DB dans `unstable_cache(fn, key, { revalidate, tags })`, invalider via `revalidateTag` aux seeds/publications. Prioriser `/tier-list`, `/meta`, `/guides/glossaire`.
- **Indicateur de réussite** : ces pages ne sont plus `force-dynamic` OU enveloppent leurs requêtes DB dans `unstable_cache` ; un 2e hit rapproché ne déclenche pas de nouvelle requête Prisma.

#### M7. `/cartes` (page SEO très crawlée) non cachée, requêtes `select:*`
- **Fichier** : `src/app/cartes/page.tsx:63-72`
- **Problème** : `findMany` sans `select` (transfère `textPlain`/`textHtml` volumineux), `count`, `cardSet.findMany` à chaque combinaison de filtres, sans cache.
- **Recommandation** : `select` limité aux champs affichés (`id, riftboundId, name, imageUrl, rarity, setName, type`) ; `cardSet.findMany` en `unstable_cache` long ; requête catalogue en `unstable_cache` court paramétré par les filtres.
- **Indicateur de réussite** : `/cartes` utilise un `select` explicite et sert `cardSet` depuis un cache.

#### M8. Images clés en `<img>` brut au lieu de `next/image` (CLS)
- **Fichier** : `src/app/articles/page.tsx:107` ; `src/app/articles/[slug]/page.tsx:460` ; `src/components/article-block-renderer.tsx:86,124`
- **Problème** : covers d'articles et images de blocs en `<img>` sans width/height ni srcset → Cumulative Layout Shift, pas de lazy automatique.
- **Recommandation** : passer à `next/image` avec width/height (ou `fill` + ratio container) ; là où le CDN impose `unoptimized`, fixer width/height pour bloquer le CLS.
- **Indicateur de réussite** : CLS ~0 sur `/articles` et `/articles/[slug]` dans Lighthouse.

#### M9. Boutons icône-seul sans nom accessible (lucide `aria-hidden`)
- **Fichier** : `src/components/point-tracker.tsx:146-160,369-374,389-394` ; `navbar.tsx:105-110` ; `decklist-interactive.tsx:396-404` ; `export-modal.tsx:116` ; `search-bar.tsx:93,109`
- **Problème** : lucide met `aria-hidden="true"` sur les icônes sans enfants ; les boutons icône-seul sans texte ni `aria-label` sont muets pour un lecteur d'écran (échec WCAG 4.1.2). Impact le plus fort : le toggle de navigation mobile.
- **Recommandation** : ajouter un `aria-label` explicite par bouton (« Ouvrir le menu », « Augmenter le score », « Fermer », « Vue grille ») ; `aria-pressed` sur les toggles d'affichage.
- **Indicateur de réussite** : chaque `<button>` icône-seul a un `aria-label` ; chaque bouton est annoncé avec un nom non vide (NVDA/VoiceOver).

#### M10. Aucun style de focus visible global
- **Fichier** : `src/app/globals.css` (aucune règle `:focus-visible`) ; nus : `src/components/collection/binder-explorer.tsx`, `src/app/deckbuilder/components/search-bar.tsx`
- **Problème** : pas de baseline `:focus-visible` global ; 64 occurrences de `focus:outline-none` dans 22 fichiers. La plupart des champs faits main remplacent l'outline par `focus:border-arcane` (acceptable, contraste limite), mais certains éléments restent totalement nus (focus clavier invisible).
- **Recommandation** : règle globale `@layer base { *:focus-visible { outline: 2px solid var(--color-arcane); outline-offset: 2px; } }` ; remplacer `focus:outline-none` par `focus-visible:outline-none + focus-visible:ring-2`.
- **Indicateur de réussite** : navigation clavier (Tab) → indicateur de focus visible sur chaque élément interactif.

#### M11. Pas de skip-link « Aller au contenu »
- **Fichier** : `src/app/layout.tsx:110-119` (`<main>` sans `id`)
- **Problème** : aucun lien d'évitement avant `<main>` → utilisateurs clavier/lecteur d'écran tabulent toute la navbar sur chaque page (WCAG 2.4.1 non respecté).
- **Recommandation** : premier enfant du `<body>` : `<a href="#contenu" class="sr-only focus:not-sr-only ...">Aller au contenu</a>` + `id="contenu"` sur `<main>`. Définir l'utilitaire `.sr-only` (Tailwind v4 ne la génère pas toujours).
- **Indicateur de réussite** : charger une page, Tab une fois → premier élément focusable = skip-link visible et fonctionnel.

#### M12. `metadataBase` retombe sur `localhost:3000` si `NEXT_PUBLIC_SITE_URL` absent au build
- **Fichier** : `src/app/layout.tsx:30`
- **Problème** : `NEXT_PUBLIC_*` figées au BUILD. Si Coolify ne passe pas `NEXT_PUBLIC_SITE_URL` en build-arg avant `next build`, toutes les `og:image` et canonical relatives pointent vers `localhost:3000`.
- **Recommandation** : passer `NEXT_PUBLIC_SITE_URL=https://riftboundfrance.fr` en build-arg/env AVANT `next build` ; à défaut, hardcoder le fallback sur l'apex prod.
- **Indicateur de réussite** : le HTML source de `/` en prod contient `og:image` et canonical en `https://riftboundfrance.fr` (jamais localhost).

#### M13. Flux RSS existant mais non découvrable
- **Fichier** : `src/app/layout.tsx:104` (RSS généré par `src/app/rss.xml/route.ts`)
- **Problème** : aucun `<link rel="alternate" type="application/rss+xml">` dans le `<head>`, ni lien footer, ni entrée sitemap → indécouvrable par crawlers/agrégateurs.
- **Recommandation** : `alternates: { types: { 'application/rss+xml': '/rss.xml' } }` dans le metadata du layout ; optionnellement lien footer.
- **Indicateur de réussite** : le `<head>` contient `<link rel="alternate" type="application/rss+xml" href=".../rss.xml">`.

#### M14. Pages détail cartes/decks/tournois sans JSON-LD d'entité
- **Fichier** : `src/app/cartes/[id]/page.tsx:41` ; `decks/[slug]` ; `tournois/[slug]`
- **Problème** : seul `BreadcrumbList` est émis ; les milliers de pages cartes/decks restent des entités opaques pour Google rich results et la citabilité GEO.
- **Recommandation** : JSON-LD léger par template : carte → `Product`/`Thing` ; tournoi → `Event` ; deck → `CreativeWork`. Réutiliser le pattern des articles.
- **Indicateur de réussite** : chaque template contient un bloc `application/ld+json` autre que `BreadcrumbList`, valide au Rich Results Test.

#### M15. `setState` synchrone dans `useEffect` (cascades de rendu)
- **Fichier** : `src/components/point-tracker.tsx:46` ; `analytics.tsx:22,44` ; `card-ref.tsx:83` ; `deck-like-button.tsx:40` ; `deckbuilder/components/meta-indicator.tsx:30`
- **Problème** : `react-hooks/set-state-in-effect` (erreur sous React 19) → re-rendus en cascade (perte de perf, flicker/double-fetch).
- **Recommandation** : pour l'état dérivé (`point-tracker`), calculer pendant le rendu ou via `useMemo` ; analytics/card-ref (montage) tolérables, à confirmer cas par cas.
- **Indicateur de réussite** : `npx eslint <fichier>` ne remonte plus `react-hooks/set-state-in-effect`.

#### M16. 6 vulnérabilités npm via dépendances transitives de Next
- **Fichier** : `package.json:20`
- **Problème** : `js-yaml` (DoS), `postcss <8.5.10` (XSS) + 1 high, toutes transitives via `next 16.2.6`. `npm audit fix --force` voudrait downgrade `next@9` (cassant) — à NE PAS appliquer.
- **Recommandation** : mettre à jour `next 16.2.6 → 16.2.9` et `eslint-config-next 16.2.9`, relancer `npm audit`.
- **Indicateur de réussite** : après `npm i next@16.2.9 eslint-config-next@16.2.9`, `npm audit --omit=dev` ne liste plus postcss/next high+moderate.

#### M17. Médias VOD Hartford non ignorés (~145 Mo) risquent d'être commités
- **Fichier** : `.gitignore`
- **Problème** : `data/videos/hartford-day1.{mp3,json,srt,tsv,txt,vtt}` (~63 Mo + frames) en untracked, NON ignorés (`utrecht-day1.*` et `vancouver-day1.*` le sont, mais pas `hartford-day1.*`). Un `git add .` les commiterait.
- **Recommandation** : généraliser le `.gitignore` : `data/videos/*.mp3`, `data/videos/*.wav`, `data/videos/*-frames/`, `data/videos/*-day1.{srt,tsv,vtt,txt,json}`.
- **Indicateur de réussite** : `git check-ignore data/videos/hartford-day1.mp3` retourne le fichier ; `git status` ne les liste plus.

#### M18. `.claude/settings.local.json` suivi par git malgré la règle `.gitignore`
- **Fichier** : `.claude/settings.local.json`
- **Problème** : la règle existe mais le fichier est dans HEAD (commité avant la règle) → règle inopérante, pollue chaque diff.
- **Recommandation** : `git rm --cached .claude/settings.local.json` puis commit.
- **Indicateur de réussite** : `git ls-files .claude/settings.local.json` ne retourne plus rien.

---

### LOW

#### L1. Like communautaire : décrément non gardé → compteur peut devenir négatif
- **Fichier** : `src/app/api/community-decks/[code]/like/route.ts:27-33`
- **Recommandation** : garder le décrément (≥0), recalculer `likes = count(CommunityDeckLike)` dans la même transaction.
- **Indicateur** : forcer `likes=0` avec une ligne existante, POST /like → reste ≥0.

#### L2. `LikeButton` : mise à jour optimiste qui dérive de la valeur serveur
- **Fichier** : `src/app/d/[code]/like-button.tsx:35-38`
- **Recommandation** : faire renvoyer `likes` par la route POST et appliquer `setLikes(data.likes)`.
- **Indicateur** : liker dans 2 onglets → le compteur ne diverge plus du vrai total.

#### L3. Incrément de vues sur un GET utilisé aussi par l'import
- **Fichier** : `src/app/api/community-decks/[code]/route.ts:22-25` ; `src/app/d/[code]/page.tsx:65-68`
- **Recommandation** : séparer la lecture (GET sans effet de bord) de l'incrément (POST dédié), ne pas incrémenter à l'import.
- **Indicateur** : importer un deck par lien sans ouvrir sa page → `views` n'augmente plus.

#### L4. Parsing decklist : suffixe entre parenthèses traité comme `setCode`
- **Fichier** : `src/lib/deck-code.ts:47-52`
- **Recommandation** : ne traiter la parenthèse comme `setCode` que si son contenu ressemble à un code d'extension ; sinon tenter le lookup avec et sans parenthèse.
- **Indicateur** : coller `3 Master Yi (Wuju Master)` à l'import → carte résolue.

#### L5. Import collection en masse : aucune validation d'existence des `cardId`
- **Fichier** : `src/app/api/collection/bulk/route.ts:31-41`
- **Recommandation** : pré-filtrer contre `prisma.card.findMany({ where: { id: { in: ids } } })` avant la transaction.
- **Indicateur** : POST bulk avec un `cardId` inexistant → item ignoré proprement, pas de 500/FK.

#### L6. Endpoints d'écriture en masse sans borne (DoS applicatif)
- **Fichier** : `src/app/api/collection/bulk/route.ts:17-41` ; `src/app/api/collection/import/route.ts:47-79`
- **Recommandation** : borner le nombre d'items (≤ taille du catalogue ~1048) et la taille du CSV ; rejeter avec 413/400.

#### L7. Likes/garde de décrément basés sur lecture obsolète (decks tournoi & default binder)
- **Fichier** : `src/app/api/decks/[slug]/like/route.ts:67-71` ; `src/lib/collection-server.ts:68-77`
- **Recommandation** : transaction `delete + update` et/ou recompte ; contrainte unique `(userId, position=0)` + upsert pour le binder.

#### L8. CSRF : sessions SameSite=Lax sans token anti-CSRF ; effets de bord sur GET
- **Fichier** : `src/lib/session.ts:5` ; endpoints POST/PATCH/DELETE ; GET `community-decks/[code]`, `dev-login`
- **Recommandation** : vérifier l'`Origin` sur les routes mutatives ; éviter tout effet de bord d'écriture sur des handlers GET.

#### L9. `AdminLayout` rend les children quand non-admin (défense en profondeur incohérente)
- **Fichier** : `src/app/admin/layout.tsx:13-17`
- **Recommandation** : centraliser le contrôle dans le layout (rediriger vers `/admin/login` sauf sur la page login).

#### L10. Aperçu carte au survol inaccessible au clavier/tactile
- **Fichier** : `src/components/card-ref.tsx:90-110`
- **Recommandation** : rendre l'ancre focusable (`tabindex=0`/`button`), déclencher sur `onFocus`/`onBlur`, fermer sur Escape ; a minima `aria-label` avec le nom de la carte.

#### L11. Champs de formulaire/selects sans `<label>` ; toggles sans `aria-pressed`
- **Fichier** : `src/components/card-filters.tsx:54-72,77-97` ; `search-bar.tsx:32` ; `point-tracker.tsx:180-187`
- **Recommandation** : `<label htmlFor>` ou `aria-label` par champ ; `role="search"` sur la barre ; `aria-pressed` sur domaines/favori/vues.

#### L12. `optimizePackageImports` absent pour `lucide-react`
- **Fichier** : `next.config.ts:3-38`
- **Recommandation** : `experimental: { optimizePackageImports: ['lucide-react'] }` (vérifier la doc Next 16 locale).

#### L13. `CollectionProvider` fetch `/api/collection` au montage sur chaque page (même anonyme)
- **Fichier** : `src/components/collection/collection-provider.tsx:24-35`
- **Recommandation** : court-circuiter l'appel quand l'utilisateur n'est pas authentifié, ou lazy-load le provider sur les routes consommatrices.

#### L14. `Math.random()` dans la fonction cachée de la home
- **Fichier** : `src/app/page.tsx:27-76`
- **Recommandation** : borner la requête (`take`) plutôt que charger tous les decks éligibles pour n'en afficher que 6 ; déplacer l'aléatoire hors cache si rotation voulue.

#### L15. Lint : 30 `no-explicit-any` + 10 `no-require-imports` dans scripts/prisma/data
- **Fichier** : `eslint.config.mjs:9`
- **Recommandation** : ajouter `scripts/**`, `prisma/seed*.ts`, `data/**`, `audit-task1.js` à `globalIgnores` pour que `npm run lint` reflète la dette réelle de l'app.

#### L16. Pas de champ `engines` ; Prisma 6.19 vs 7.x
- **Fichier** : `package.json:3,15`
- **Recommandation** : `"engines": { "node": ">=20" }` ; patchs sûrs via `npm update` ; planifier la migration Prisma 6→7 séparément.

#### L17. Validateur decklists : ~1185-1950 decks classés « unverifiable » alors qu'ils sont vérifiables par URL source
- **Fichier** : `scripts/validate-decklists.py:105-110`
- **Problème** : appariement seulement par id de fichier (+ 3 tournois JSON). Suzhou/Fuzhou/Atlanta/Changsha/Vancouver/Utrecht tombent en « unverifiable » alors que leur scrape brut existe ; recoupement manuel par URL = 0 mismatch. Angle mort : une future fabrication dans ces buckets passerait en exit 0.
- **Recommandation** : matcher aussi par `source`/`sourceUrl` contre l'URL riftdecks des `.md` ; faire échouer si le taux d'unverifiable dépasse un seuil.
- **Indicateur** : après patch, « unverifiable » chute à ~0 pour ces tournois, MISMATCH toujours 0.

#### L18. Micro-écarts de prose dans les docs d'insight (pas dans les decklists)
- **Fichier** : `data/video-insights/cross-set-casts-2026-06.md:18`
- **Problème** : « Scrap Heap » vs « Scrapheap » (carte réelle) ; 10 « suspects » du validateur de noms sont des archétypes, pas des cartes. Aucun impact sur les decks publiés.
- **Recommandation** : corriger « Scrap Heap » → « Scrapheap » ; optionnellement ajouter les archétypes à la liste STOP.

#### L19. Pas de redirection http/www / hreflang (à confirmer côté Coolify)
- **Fichier** : `next.config.ts:1` ; `src/app/layout.tsx:103`
- **Recommandation** : vérifier que Traefik force `301` http/www → apex https ; hreflang non requis tant que mono-langue (documenter pour une future 2e langue).

#### L20. `llms.txt` contient des chiffres périmés (18 000 decklists / 88 tournois)
- **Fichier** : `public/llms.txt:9`
- **Recommandation** : mettre à jour avec les volumes réels (~21 657 decks) ; idéalement générer la ligne depuis un count DB en CI.

---

## 3. PLAN DE NETTOYAGE

### À ajouter au `.gitignore` (et généraliser)
```
# Médias VOD
data/videos/*.mp3
data/videos/*.wav
data/videos/*-frames/
data/videos/*-day1.{srt,tsv,vtt,txt,json}

# Python
__pycache__/
*.pyc

# Logs de scrape (élargir _*.log → *.log)
data/raw-scrapes/**/*.log
```

### À retirer du suivi git (`git rm --cached`)
- `.claude/settings.local.json` (règle .gitignore déjà présente mais inopérante)
- `scripts/__pycache__/parse_riftbound_cached.cpython-312.pyc` (`git rm --cached -r scripts/__pycache__`)
- `data/raw-scrapes/bulk_fetch.log`
- `data/raw-scrapes/scrape-progress.log`
- `data/audit-screens/` (~80 Mo, 22 PNG, non référencés par `src/`) — `git rm --cached -r` (décision produit : sinon documenter comme régénérables)

### Fichiers à supprimer (composants morts — confirmer qu'aucune page n'est en cours de dev)
- `src/components/collection/collection-explorer.tsx`
- `src/components/deck-viewer.tsx`
- `src/components/hero-carousel.tsx`
- `src/components/tier-badge.tsx`

### Scripts redondants / one-off à archiver ou supprimer
- Parseurs dupliqués : `scripts/parse-all-decklists.js`, `scripts/parse-decklist-md.js` (garder le canonique `scripts/parse-riftdecks.ts`)
- Correctifs prisma ponctuels déjà appliqués : `prisma/fix-decks.ts`, `prisma/fix-champions-main.ts`, `prisma/generate-atlanta.ts`, `prisma/link-corrected.ts`, `prisma/missing-cards-report.txt`, `check-missing-cards`, `deep-check`, `list-incomplete` (conserver les `seed-*.ts` réutilisés)

> Vérifier après nettoyage : `git ls-files | grep -E '\.pyc$|\.log$'` vide, `git check-ignore` confirme les médias ignorés, `tsc`/build verts après suppression des composants morts.

---

## 4. Plan d'action priorisé

### Étape 0 — Urgence sécurité (immédiat, indépendant)
1. **C1 — Fermer le port DB prod** : `docker stop pg-tunnel` + règle pare-feu Hetzner (allowlist IP Allan). C'est la seule faille Critical ; aucune dépendance, à faire en premier.

### Étape 1 — Quick wins à fort impact (faibles dépendances)
2. **H5 + cohérence FR** : corriger les em-dashes dans `seed-hartford-article.mts` (article EN LIGNE) puis les `seed-*-bestof.ts`, **re-seeder via le tunnel** (ordonner après C1 si le seed passe par le port à sécuriser — utiliser le tunnel SSH ponctuel).
3. **H4** : corriger le hook conditionnel `deck-summary.tsx` (bug crash potentiel, fix trivial).
4. **M17 + M18** : `git rm --cached` (settings.local.json) + élargir le `.gitignore` (médias Hartford, pyc, logs) avant tout `git add .`.

### Étape 2 — Données & logique
5. **H2** : corriger la corruption champion dans le deckbuilder (export/partage/sauvegarde), aligner sur `getTTSCode`.
6. **L1-L7** : fiabiliser les compteurs likes/vues (transactions, recompte) et validations FK/borne.

### Étape 3 — Durcissement sécurité (dépend partiellement de l'infra)
7. **M1** (supprimer fallback `ADMIN_PASSWORD`), **H1** (expiration/révocation sessions), **M2** (CSP nonce), **M3** (rate-limit centralisé), **M4** (SSRF image-proxy). H1 dépend d'un choix d'architecture (table Session) → planifier.

### Étape 4 — Performance (dépend d'un pattern commun)
8. **M5 + M6 + M7** : généraliser le pattern `unstable_cache` de la home. Commencer par `/tier-list`, `/meta`, `/guides/glossaire` (sans `searchParams`, fix trivial), puis les pages paramétrées par filtres. **M8** (next/image covers).

### Étape 5 — Accessibilité (chantier transversal)
9. **M10 + M11** (focus global + skip-link, fondations), puis **H3** (ARIA menus/modales), **M9** (aria-label boutons), **L10/L11** (labels, hover clavier). Ordre : fondations CSS/layout d'abord, composants ensuite.

### Étape 6 — SEO/GEO & dépendances (non bloquant)
10. **M12** (metadataBase build-arg — vérifier Coolify), **M13** (RSS découvrable), **M14** (JSON-LD entités), **L20** (llms.txt), **M16/L16** (bump Next 16.2.9, engines), **L15** (lint ignores), puis le **plan de nettoyage** code mort.

### Dépendances clés
- Le re-seed (H5) doit utiliser le tunnel SSH ponctuel une fois C1 appliqué (ne pas rouvrir le port public).
- M5/M6/M7 partagent le même remède (`unstable_cache`) → factoriser un helper.
- Les fondations a11y (M10/M11) précèdent les correctifs composant (H3/M9).
