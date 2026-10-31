# Audit de la bascule vers le serveur maison (31 octobre 2026)

But : savoir ce qui casserait si Riftbound France quittait le Hetzner (Coolify) pour le
serveur maison (Dokploy, Traefik, tunnel Cloudflare, Postgres 18.6), page par page, et ce
que la sécurité demande avant. Le plan de la bascule existe déjà, dans le dépôt du
serveur : `serveur/docs/superpowers/plans/2026-10-10-phase-4-migration.md` (tâches 4, 10,
11, 12, 16). Cet audit le relit contre le code d'aujourd'hui ; il ne le remplace pas.

Tout ce qui suit est mesuré (commande, réponse, fichier), sauf mention « à vérifier ».
Rien n'a été écrit en production : les balayages ne font que des GET, Google Analytics
coupé pour ne pas compter de fausses visites.

## Urgences, avant même la bascule

1. **La zone Cloudflare de riftboundfrance.fr sera supprimée vers le 5 novembre.** Elle
   est « pending » depuis le 8 octobre : les serveurs DNS sont toujours ceux d'OVH
   (`dns109.ovh.net`, `ns109.ovh.net`, relevé du 31 octobre). DNSSEC est coupé (aucun DS
   au registre), donc rien n'empêche le changement. C'est la tâche 10 du plan : changer
   les NS chez OVH pour `elisabeth.ns.cloudflare.com` et `sterling.ns.cloudflare.com`.
   Le site ne bouge pas (enregistrements en gris, toujours vers le Hetzner). Après le
   5, il faut recréer la zone depuis `serveur/zones/riftboundfrance.fr.ovh.txt`.
2. **Next 16.3.5 porte des failles critiques publiées**, vraies dès aujourd'hui sur le
   Hetzner (`npm audit --omit=dev`) :
   - exécution de code à distance dans `next/og` (`ImageResponse`), corrigée en 16.3.6.
     Le site s'en sert pour `/api/decklist-image` et les images Open Graph, routes
     publiques ;
   - exécution de code à distance dans l'optimiseur d'images quand il lit du SVG,
     jusqu'à 16.4.0 compris ;
   - SSRF dans l'optimiseur d'images, corrigée en 16.3.8 ;
   - empoisonnement du cache des pages, pour un hébergement hors Vercel.

   `next@16.4.3` corrige tout et tire `sharp@^0.35.5`, qui corrige une faille de
   librsvg (le site rouvre le lecteur SVG de sharp dans `src/lib/og-sharp.ts`). Le
   Dashboard, qui tourne sur la même machine que le futur site, est en `next@16.4.0` :
   touché aussi.

   **Fait le 31 octobre, en ligne le même jour vers 16 h 30** (deuxième Deploy Coolify :
   le premier a échoué, cause non relevée). Vérifié sur le site : le JavaScript servi
   porte `version:"16.4.3"`. Porte : `npm run verify` sortie 0,
   408 tests, lint sans erreur ; build de prod lancé en local sur la base locale : 86
   pages sans erreur au balayage navigateur, images de deck en 2000x2000 et 1620x2880,
   images Open Graph, proxy d'images et optimiseur sur image distante en 200. `npm audit
   --omit=dev` ne garde que `deepmerge-ts` (CLI Prisma) et `source-map-js` (build
   Tailwind), qui ne tournent pas sur le serveur.
3. **Le panneau Coolify répond sur Internet, en HTTP simple** :
   `http://178.104.237.33:8000/login` (302 vers la page de connexion), et les ports 6001
   et 6002 (temps réel et terminal de Coolify) sont ouverts. Le mot de passe circule en
   clair. Jusqu'à la suppression du Hetzner (tâche 16) : pare-feu Hetzner Cloud qui
   n'ouvre 8000, 6001, 6002 et 22 qu'à ton IP, ou accès par tunnel SSH.
4. **La base de prod n'a peut-être aucune sauvegarde aujourd'hui.** Le commentaire de
   `scripts/prod-tunnel.mts` dit « la base n'a pas de sauvegarde automatique côté
   Coolify ». À vérifier dans Coolify, onglet Backups de la base. Le `pg_dump` de la
   tâche 11 (répétition) en tient lieu : le garder.

## Ce qui bloque la bascule (code de ce dépôt)

### B1. L'IP des visiteurs (R1, pas fait)

`clientIp` (`src/lib/rate-limit.ts`) lit `x-real-ip`. À la maison, Traefik ne voit
qu'un client : cloudflared. Tous les visiteurs auraient donc la même IP, et chaque limite
deviendrait commune à tout le site :

| Limite | Fichier | Effet à la maison sans R1 |
|---|---|---|
| 5 connexions admin par minute | `api/auth/route.ts` | n'importe qui t'empêche de te connecter en tapant 5 faux mots de passe |
| likes, commentaires, votes, publication | `api/*/like`, `comments`, `community-decks` | le premier pic de visites bloque tout le monde |
| compagnon, overlay, médias | `api/overlay/*` | deux streamers en même temps se gênent |

Le plan (tâche 4) lit `cf-connecting-ip` en premier, et interdit ensuite tout Deploy
Coolify, puisque sur le Hetzner cet en-tête vient du visiteur et se forge. Le piège : tu
déploies souvent par Coolify (fiches, Radiance le 20 et le 30), et rien ne t'arrêterait.
Proposition : ne lire `cf-connecting-ip` que si une variable le dit, posée dans le seul
compose de Dokploy. Coolify reste alors sûr jusqu'au bout.

```ts
const derriereCloudflare = process.env.DERRIERE_CLOUDFLARE === "1";
// ...
(derriereCloudflare && req.headers.get("cf-connecting-ip")?.trim()) || req.headers.get("x-real-ip")?.trim() || ...
```

L'en-tête n'est sûr que si personne ne joint Traefik sans passer par le tunnel. La
chaîne `DOCKER-USER` (`serveur/reseau/docker-user.sh`) ferme 80, 443 et 3000 au réseau
local ; un `teardown` de test l'a déjà vidée une fois (HANDOFF du serveur). À contrôler
le soir de la bascule, depuis un téléphone en Wi-Fi : `http://<IP locale du serveur>/`
ne doit pas répondre. Et aucune redirection de port 80 ou 443 sur la box.

### B2. L'image Docker (PR #1, pas fusionnée)

`SLYAllan/riftboundfr#1` (branche `image-ghcr`) construit l'image dans la CI et la publie
sur GHCR. Elle a 39 commits de retard sur `main` mais se fusionne sans conflit
(`git merge-tree`). Elle passe `NEXT_PUBLIC_SITE_URL` en argument de build, seule
variable figée au build qui compte : la connexion Discord la lit sans valeur de repli.
`NEXT_PUBLIC_GA_ID` a une valeur de repli dans `src/components/analytics.tsx`, donc les
statistiques ne se perdent pas. `compose.dokploy.yaml` reste à écrire (tâche 4, étape 6).

### B3. La mémoire (1 Go) jamais essayée sous charge

Le plan donne 1 Go au conteneur, d'après 470 Mo mesurés le 8 octobre. Les coupures 503
du 17 et 18 octobre venaient de rafales de `/api/decklist-image` (rendu satori puis
sharp, carré de 2000 px). Une limite dépassée tue le conteneur : coupure. Le soir de la
répétition (tâche 11, étape 7), demander une dizaine d'images de deck à la fois et lire
`docker stats` pendant ce temps.

### B4. Cloudflare devant l'overlay

Ce que le tunnel change pour le site, mesuré dans le code :

| Fait | Conséquence | Réglage |
|---|---|---|
| L'overlay interroge `/api/overlay/<jeton>` toutes les 1,5 s depuis OBS (`use-overlay-poll.ts`) | Si Bot Fight Mode lance un défi, `fetch` ne peut pas le résoudre : l'overlay se fige en plein direct | **Laisser Bot Fight Mode coupé** sur riftboundfrance.fr. L'offre gratuite ne permet pas d'exempter un chemin (le plan le note, la spec §7.4 dit l'inverse) |
| Le pied de page porte `mailto:contact@riftboundfrance.fr` sur toutes les pages, et `/a-propos` l'écrit en texte | « Email Obfuscation », actif d'office, réécrit ces adresses dans le HTML ; React trouve alors un texte différent du sien, d'où une erreur d'hydratation probable sur `/a-propos` (pas mesurable tant que le site n'est pas derrière Cloudflare) | **Couper Email Obfuscation** (Scrape Shield). Tu ne lis plus cette boîte (décision du 8 octobre) : le lien pourrait pointer vers Discord |
| `/_next/image`, `/api/decklist-image`, `/api/image-proxy` envoient un `Cache-Control: public` | Cloudflare ne garde que les fichiers à extension connue : sans règle, chaque image part de ta connexion | **Une règle de cache** : chemins qui commencent par `/_next/image`, `/api/decklist-image`, `/api/image-proxy` → « Eligible for cache », durée de l'origine. Jamais les pages HTML |
| Cloudflare coupe une requête après 100 s (erreur 524) | Rien sur le site public ; une action admin longue (`/api/sync-cards`) peut afficher 524 alors qu'elle continue | Rien à faire, le savoir |
| Aucun WebSocket ni flux SSE dans le code | La coupure des connexions inactives de Cloudflare ne touche rien | Rien |

### B5. Comment on déploie, demain

Aujourd'hui : push, puis Deploy dans Coolify, qui construit sur le Hetzner. Demain :
push sur `main`, la CI construit et publie l'image (plusieurs minutes), puis « Déployer »
sur le Dashboard avec le SHA. Les fichiers de `data/` (fiches, prix) ne passent toujours
en ligne qu'avec un déploiement. Chaque déploiement recrée le conteneur : Traefik ne
l'envoie qu'une fois la sonde verte, d'où 30 à 60 s de page de maintenance (D27).
`AGENTS.md`, `docs/DEPLOIEMENT.md` et `HANDOFF.md` ne parlent pas encore du serveur
maison : une session sur ce dépôt ignore que le plan existe (tâche 12, étape 10).

## Sécurité du code

Vérifié, rien à faire :

- Les routes `/api/admin/*` et `/api/sync-cards` vérifient toutes `isAdmin()` (relevé des
  54 routes, méthode par méthode).
- `/api/auth/dev-login` répond 404 en production (`NODE_ENV=production` posé par le
  `Dockerfile`).
- OAuth Discord : `state` aléatoire, en cookie `httpOnly`, comparé au retour.
- `/api/image-proxy` : un seul hôte, `https` seulement, redirections refusées, taille et
  type bornés.
- Médias de l'overlay : type relu dans les octets, pas dans l'en-tête ; taille bornée.
- Aucune adresse absolue n'est tirée de l'en-tête `Host` : tout passe par
  `NEXT_PUBLIC_SITE_URL`. Derrière le tunnel, ni la redirection Discord ni le contrôle
  d'origine (`src/proxy.ts`) ne changent.
- Dépôt public : aucun `.env`, clé ou dump dans l'historique git
  (`git log --all --diff-filter=A`). Le port 15432 (socat) et le 5432 du Hetzner sont
  fermés ce 31 octobre.

À corriger, par ordre :

| # | Constat | Gravité | Correction |
|---|---|---|---|
| S1 | Next 16.3.5 et sharp 0.35.4 (urgence 2) | critique | `next@16.4.3`, en ligne le 31 |
| S2 | IP des visiteurs (B1) | élevée à la maison | R1 avec variable |
| S3 | `/api/decklist-image` rend n'importe quel code de deck, sans limite : le plus gros consommateur de processeur, sur une machine partagée avec les bots | moyenne | `rateLimit` par IP sur la route, une fois R1 fait |
| S4 | `.dockerignore` n'exclut ni `.env.prod.local`, ni `riftbound-france-*.json` (clé Google), ni `dump*.sql` (87 Mo de base), ni `node_modules` | faible tant que l'image se construit depuis GitHub | ajouter `.env*`, `*.sql`, `riftbound-france-*.json`, `node_modules`, `.agents`, `.playwright-mcp`, `.firecrawl` |
| S5 | Signature de la session admin comparée par `!==`, pas en temps constant ; la déconnexion ne révoque rien côté serveur (cookie de 7 jours, accepté 30) | faible | `timingSafeEqual` ; durée serveur alignée sur 7 jours |
| S6 | CSP `script-src 'unsafe-inline' 'unsafe-eval'` | faible, connu | hors bascule |

## Ce que Coolify fait aujourd'hui, et qui le reprend

Relevé sur le site en ligne (`curl -D -`) et dans le code. Je n'ai pas d'accès au
Hetzner : les lignes « à vérifier » se lisent dans l'interface de Coolify.

| Ce que fait Coolify (mesuré) | À la maison | État |
|---|---|---|
| Certificat Let's Encrypt | Certificat Cloudflare, tunnel chiffré jusqu'à la maison | plan, tâche 10 |
| `http://` → `https://` (302) | « Always Use HTTPS » | plan, tâche 10, étape 6 |
| Compression gzip, HTTP/3 | Cloudflare, d'office | rien à faire |
| `www` → apex (308) | C'est Next (`next.config.ts`), pas Coolify : il faut seulement que `www` arrive à l'appli | plan, tâche 12, étape 7 |
| Build de l'image au Deploy | CI GitHub, image GHCR | PR #1 |
| Variables, et ARG de build pour chacune | 7 variables dans le compose ; `NEXT_PUBLIC_SITE_URL` en variable de dépôt (posée le 8 octobre) | **à vérifier** : toute variable de l'onglet Coolify absente de la liste du plan |
| Sonde de santé | `HEALTHCHECK` de l'image | rien à faire |
| Stockage persistant | Le code n'écrit rien sur le disque, sauf le cache de Next | **à vérifier** : aucun volume dans l'onglet Storages |
| Sauvegarde de la base | Absente selon `prod-tunnel.mts` ; à la maison, toutes les bases chaque nuit, vers R2 et le coffre (`serveur/sauvegarde/sauvegarde.sh` lit `pg_database`) | riftbound y entrera seule |
| Accès à la base pour les seeds (socat 15432) | Tailscale, `dashboard:5432` ; `prod-tunnel.mts` lit déjà `PROD_TUNNEL` | plan, tâche 12, étape 11 |
| Panneau sur Internet en HTTP | Dokploy n'est publié que sur Tailscale | urgence 3 |

## Ce qui est déjà prêt

- Prisma 6.19.3 sur Postgres 18.6 : le Dashboard tourne déjà avec la même version, sur la
  même base.
- Le schéma n'utilise aucune extension Postgres : la restauration en rôle non
  superutilisateur ne bute sur rien de ce côté.
- Les variables lues par le code sont exactement celles du compose du plan
  (`DATABASE_URL`, `SESSION_SECRET`, `ADMIN_PASSWORD`, `DISCORD_CLIENT_ID`,
  `DISCORD_CLIENT_SECRET`, `CARDNEXUS_API_KEY`, `NEXT_PUBLIC_SITE_URL`).
- Aucune tâche planifiée côté serveur : le relevé de prix quotidien vit en mémoire et se
  déclenche à la lecture (`releverEnFond`, `src/lib/cardnexus.ts`).
- Rien n'écrit sur le disque à l'exécution, à part le cache de Next, que le `Dockerfile`
  rend accessible à l'utilisateur `nextjs`.
- Discord, Search Console (TXT de vérification) et les MX d'OVH sont recopiés à
  l'identique dans la zone Cloudflare. Même domaine, même adresse de retour Discord.

## Page par page

Deux passages sur le site en ligne, le 31 octobre entre 13 h 30 et 14 h (heure de
Paris). Ils servent de point de comparaison pour le soir de la bascule.

**Passage HTTP, toutes les adresses du sitemap** (`scripts/audit-bascule-http.mjs`,
6 884 adresses du sitemap et 23 de plus : robots, sitemap, `llms.txt`, manifeste,
service worker, santé, API publiques, `/en`, `/zh`, pages connectées) :

- 6 906 sur 6 907 répondent 200, médiane 112 ms. La plus lente : `/guides/glossaire`,
  1,75 s, puis les gros best-of et tournois (0,9 à 1,2 s).
- Aucune page ne laisse passer un hôte interne, l'IP du Hetzner, `localhost` ou un
  lien en `http://`. Toutes les balises canoniques visent `https://riftboundfrance.fr`.
- Seul échec : `/favicon.ico` en 404. Sans effet : le site déclare `/icon.png` et
  `/apple-icon.png`, qui répondent.

**Passage navigateur, chaque modèle de page** (`scripts/audit-bascule-pages.mjs`,
86 pages : les 18 pages fixes du sitemap, 3 exemples pour chacune des 5 routes à
paramètre (deck, carte, Légende, article, tournoi : le plus ancien, celui du milieu, le
plus récent), puis `/a-propos`, `/decks/compare`, `/community-decks`,
`/profil/overlay`, `/offline`, `/admin/login` et deux filtres de `/decks` ; 42 en
français, 41 en anglais, plus `/zh`, `/zh/profil/overlay` et `/zh/tier-list`) :

- Aucune erreur JavaScript, aucun refus de la CSP, aucune image morte, aucun `og:url`
  hors du site. Médiane 1,7 s jusqu'à l'événement `load`.
- Une seule anomalie, passagère : sur `/tournois`, 4 des 36 préchargements de liens
  (`?_rsc=…`) ont reçu **502**. Pas reproduit sur trois chargements de plus (109
  préchargements, tous 200), ni à la main. Retenir deux choses : le serveur actuel a
  des ratés courts sous rafale, déjà vus le 17 octobre ; et une seule visite de
  `/tournois` envoie 36 requêtes au serveur. À surveiller dans Dozzle la première
  semaine ; si le processeur monte, `prefetch={false}` sur les longues listes de liens.

**Après le Deploy de Next 16.4.3** (31 octobre, vers 17 h) : mêmes passages, mêmes
résultats. HTTP : 6 906 sur 6 907 en 200, aucun statut changé, aucune fuite, seul
`/favicon.ico` en 404. Navigateur : 86 pages sans aucun problème, le 502 de `/tournois`
n'est pas revenu. Le 90ᵉ centile passe de 270 à 386 ms, mais ce passage tournait à trois
requêtes à la fois au lieu de deux, juste après le Deploy qui vide les caches. Une
requête seule : `/tournois` entre 0,7 et 1 s, `/guides/glossaire` 0,2 s (1,75 s à midi).
Images de deck (carré et 9:16), aperçus d'article et de partage, proxy d'images et
optimiseur sur image distante : tous en 200 sur le site.

Vu en passant, sans lien avec la bascule : un code de partage inconnu (`/d/essaihist`)
rend « Deck introuvable » avec un statut 200 et deux balises `robots` contraires
(`noindex` puis `index, follow`). Google garde la plus stricte, mais un 404 serait plus
juste.

**Ce que ces passages ne couvrent pas** :

- Les pages connectées (`/collection`, `/profil`, publication de deck, likes, admin) :
  sans session valable en prod, elles rendent leur écran d'accueil. Sur le nom d'essai,
  la connexion Discord renvoie vers riftboundfrance.fr : elles ne se vérifient qu'après
  la bascule (tâche 12, étape 8, à la main).
- L'overlay et le compagnon : ils demandent un jeton, et la règle du dépôt veut une
  vérification dans OBS. Voir B4.

## Ce qu'il faut ajouter au plan de la phase 4

- **Tâche 4** : R1 avec `DERRIERE_CLOUDFLARE=1` dans le compose (`next@16.4.3` est
  déjà en ligne depuis le 31).
- **Tâche 10, étape 6** : Bot Fight Mode coupé sur riftboundfrance.fr ; Email
  Obfuscation coupé ; la règle de cache des images. Corriger la spec §7.4 (pas
  d'exemption de chemin sur l'offre gratuite).
- **Tâche 11, étape 7** : rejouer les deux balayages sur `essai.riftboundfrance.fr` et
  comparer avec ceux de ce jour ; rafale d'images de deck avec `docker stats` ; overlay
  dans OBS sur le nom d'essai, quinze minutes, dans une scène de test que tu ajoutes
  (jamais en touchant ton habillage en service).
- **Tâche 12, étape 8** : les deux balayages sur riftboundfrance.fr ; depuis un
  téléphone en Wi-Fi, Traefik injoignable en direct.

## Rejouer les balayages

Scripts : `scripts/audit-bascule-http.mjs` (toutes les adresses du sitemap) et
`scripts/audit-bascule-pages.mjs` (navigateur, chaque modèle de page). Le second demande
`playwright-core` installé hors du dépôt, comme `audit-responsive.mjs`.

```bash
node scripts/audit-bascule-http.mjs --base https://essai.riftboundfrance.fr --out http-essai.json
node scripts/audit-bascule-pages.mjs --base https://essai.riftboundfrance.fr --out pages-essai.json
```
