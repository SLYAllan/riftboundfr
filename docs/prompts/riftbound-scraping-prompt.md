# Prompt Claude Code — Scraper les decklists Riftbound via Scrapeur (MCP local)

## Outil de scraping

On utilise **Scrapeur**, un MCP local installé dans Claude Code. Il bypass les 403 Cloudflare et les pages JS sans crédits, tout tourne en local.

**3 outils disponibles :**

| Tu me dis… | J'appelle |
|---|---|
| "récupère le markdown de `<url>`" | `scrape(url)` |
| "page JS / bloquée, force le navigateur" | `scrape(url, render_js=true)` |
| "liste les URLs de `<site>`" | `map_urls(url)` |
| "crawl `<site>` sous /docs, 30 pages" | `crawl(url, max_pages=30, include_paths=["/docs"])` |

**Avantages vs Firecrawl :**
- Gratuit, pas de crédits, pas de limite
- Bypass Cloudflare (curl_cffi avec JA3 Chrome)
- Fallback navigateur headless si curl_cffi échoue (`render_js=true`)
- Tourne en local, pas de dépendance externe

## Setup (une seule fois)

```bash
mkdir -p data/decklists data/tournaments data/raw-scrapes
```

Vérifier que Scrapeur est connecté :
```bash
claude mcp list
# Doit afficher : scrapeur: ✓ Connected
```

---

## ⭐ MÉTHODE RECOMMANDÉE pour gros volume (0 token) — script direct

**NE PAS** scraper des centaines/milliers de decks via des sous-agents ou en appelant le MCP tour par tour : chaque markdown de deck (~6 Ko) traverse le contexte LLM → **les tokens fondent**. Pour un Regional Open (512 decks) ou une City Challenge (128 decks), c'est rédhibitoire.

À la place, **appeler le moteur Scrapeur directement depuis un script Python** : il bypasse Cloudflare (curl_cffi) et écrit tous les `.md` sur disque **sans passer par un LLM**. Puis parser les `.md` cachés avec un second script. Coût en tokens ≈ 0.

### Pourquoi ça marche
Le MCP Scrapeur est un script Python local :
`C:\Users\Allan\Documents\Claude\Scrapeur\mcp_server.py` (venv : `.venv\Scripts\python.exe`).
On importe son moteur directement :
```python
import os, sys
SCRAPEUR = r"C:\Users\Allan\Documents\Claude\Scrapeur"
os.chdir(SCRAPEUR); sys.path.insert(0, SCRAPEUR)
from app.scraper import scrape          # scrape(url, render_js, only_main_content) -> .markdown / .metadata
from app.crawler import map_site        # map_site(url, limit) -> liste d'URLs (respecte ?page=N)
```

### Pipeline en 2 scripts (déjà écrits dans `scripts/`)
1. **`scripts/bulk_fetch_riftbound.py`** — lancer avec le python du venv Scrapeur :
   `C:\Users\Allan\Documents\Claude\Scrapeur\.venv\Scripts\python.exe scripts\bulk_fetch_riftbound.py`
   - Pour chaque tournoi : parse la méta de la page 1 (nom, joueurs, date, set, dernière page, total via `Page 1 of N ... out of TOTAL total`).
   - Pagine `map_site(url+"?page=N", 140)`, filtre `/riftbound-metagame/deck-`, dédupe.
   - Fetch chaque deck, cache `data/raw-scrapes/{slug}/{deck-id}.md`. **Resumable** (skip les `.md` existants). Sleep ~0.5s.
   - Log de progression : `data/raw-scrapes/bulk_fetch.log`. Lancer en arrière-plan + un Monitor sur le log.
2. **`scripts/parse_riftbound_cached.py`** — python normal :
   - Lit les `.md` + `data/raw-scrapes/legend-map.json` + `{slug}-meta.json`.
   - Écrit les JSON dans `data/decklists/{legend-slug}/`, les résumés `data/tournaments/{slug}.json`, les fragments `data/raw-scrapes/index-fragments/{slug}.json`, puis **fusionne dans `data/decklists-index.json`** (dédup par id).

### ⚠️ Résolution de la légende (tournois chinois S2/S3)
Les pages de deck CN **n'ont PAS de fil d'Ariane légende** (contrairement à Xi'an/Atlanta). La légende n'apparaît qu'en **image de carte**. L'ancien `scripts/parse-riftdecks.ts` (qui cherche `[Legend](.../legends/constructed/...)`) **skip donc TOUS ces decks**.

Solution : générer une table `SET-NUMÉRO → nom de légende canonique` depuis la DB, puis matcher les images de cartes du deck :
```bash
# Générer data/raw-scrapes/legend-map.json depuis la DB (Card type='Legend')
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();const fs=require('fs');p.card.findMany({where:{type:'Legend'},select:{set:true,collectorNumber:true,name:true}}).then(c=>{const m={};for(const x of c){if(x.collectorNumber==null)continue;m[(x.set+'-'+x.collectorNumber).toUpperCase()]=x.name.replace(/\s*\([^)]*\)\s*$/,'').trim();}fs.writeFileSync('data/raw-scrapes/legend-map.json',JSON.stringify(m,null,2));}).finally(()=>p.\$disconnect());"
```
Dans le markdown du deck, chaque carte a une image `/img/cards/riftbound/{SET}/{set}-{num}-...png`. Clé = `SET.upper()+"-"+int(num)` (le `int()` retire le zéro initial ET la lettre variante : `ogn-027`→`OGN-27`, `sfd-020a`→`SFD-20`). Le SEUL match dans la legend-map = la légende du deck (ex. `SFD-185` → `Draven, Glorious Executioner`).

### ⚠️ Permission MCP en sous-agent
Un sous-agent en arrière-plan **ne peut pas afficher de pop-up d'autorisation** → `mcp__scrapeur__*` est auto-refusé. Si tu utilises quand même des agents, ajouter d'abord `mcp__scrapeur__scrape`, `mcp__scrapeur__map_urls`, `mcp__scrapeur__crawl` à l'`allow` de `.claude/settings.local.json`. (Avec la méthode script ci-dessus, pas besoin.)

### 🚨 Directives critiques anti-ban (leçons du 31 mai)

1. **NE JAMAIS paralléliser** plusieurs process de scrape sur riftdecks.com. 4 process en parallèle → **ban Cloudflare error 1015 (par IP)**. Toujours **MONO-PROCESSUS**, ~1-1,5s entre chaque deck.
2. **Désactiver le cache Scrapeur** pendant un repair : `os.environ["SCRAPE_CACHE_ENABLED"]="false"` AVANT `import app.scraper`. Sinon le cache disque (TTL 24h, `Scrapeur/.scrape_cache/`) **ressert les pages de ban mises en cache** → on croit refetcher mais on relit le ban.
3. **Détecter les pages de ban correctement** : la page Cloudflare 1015 fait ~352 caractères et contient « banned you temporarily » / « error-1015 ». ⚠️ NE PAS détecter sur le simple mot « banned » → **faux positif** (les decks contiennent « This deck contains banned cards »). Un vrai deck valide : ≥1500 car. ET contient `/cards/`.
4. **Si banni** : couper TOUT trafic (les requêtes pendant le ban le prolongent), attendre, OU **changer d'IP via VPN** (NordVPN system-wide a marché — vérifier l'IP de sortie via `scrape('https://api.ipify.org')`). Note : certaines IP VPN sont elles-mêmes blacklistées par Cloudflare.
5. **Légende absente du markdown** (decks chinois où l'image de légende n'est pas affichée) → **fallback champion→légende** : le champion (`group_champion`) est toujours dans le texte, et la légende du deck est le MÊME personnage. Mapper `champion.split(',')[0]` → légende. Seul cas ambigu : Master Yi (Wuju Bladesman = Origins/Spiritforged, Wuju Master = Unleashed) → trancher par le set.
6. **Seeding** : donner un `tournamentContext` UNIQUE par tournoi (`Nom (date)`) car plusieurs tournois partagent le même nom (7 « Shanghai City Challenge »). Le seeder générique `seed-scraped-decks.ts` re-traite TOUS les dossiers et déduplique par `context|player|legend|placement` → si le nom JSON ne matche pas le contexte en DB, il **duplique** (ex. « Suzhou Regional » vs « Suzhou Regional Qualifier »). Re-stamper `tournament` avant seed.

### Format du markdown de deck (pour le parser)
- En-tête : `# {nom} by {joueur}` puis `"{nom}" decklist by {JOUEUR}. {PLACE}(st|nd|rd|th) at {TOURNOI} by {ORG} on {YYYY-MM-DD}`.
- Sections par icônes de groupe : `group_champion`, `group_unit`, `group_gear`, `group_spell`, `group_battlefields`, `group_runes`, `group_sideboard`.
- Chaque carte : icône `rarity_{rareté}` (ligne précédente) + `**{qté}**[{Nom}](.../cards/...)` + icône `rune_{domaine}` (même ligne).
- Domaines du deck : bloc `## Deck Stats` → `| domains |` (exclure `colorless`).

---

## Comment scraper une decklist depuis riftdecks.com (méthode MCP unitaire — petits volumes)

### Commande à donner à Claude Code :

> Utilise l'outil `scrape` pour récupérer le markdown de cette page : [URL DE LA DECKLIST RIFTDECKS.COM]
> 
> Parse le contenu markdown et extrais les informations suivantes pour créer un fichier JSON dans `data/decklists/{legend-slug}/` :
>
> **Infos du tournoi à extraire :**
> - Nom du joueur
> - Nom du tournoi
> - Date du tournoi
> - Nombre de joueurs
> - Placement (1st, 2nd, Top 4, Top 8, etc.)
> - Format (Constructed)
>
> **Infos du deck à extraire :**
> - Legend (nom complet)
> - Champion Unit (nom complet + domain)
> - Domains du deck
> - Main Deck : pour chaque carte → nom, quantité, type (unit/spell/gear), rareté, domain
> - Runes : pour chaque rune → nom, quantité
> - Battlefields : pour chaque battlefield → nom
> - Sideboard : pour chaque carte → nom, quantité, type, domain
>
> **Format de sortie JSON :**
> ```json
> {
>   "id": "{tournament-slug}-{placement}-{player}",
>   "legend": "Nom Legend",
>   "legendId": null,
>   "champion": "Nom Champion Unit",
>   "player": "Pseudo",
>   "tournament": "Nom du tournoi",
>   "date": "YYYY-MM-DD",
>   "placement": 1,
>   "playerCount": 640,
>   "set": "Origins/Spiritforged/Unleashed",
>   "format": "Constructed",
>   "archetype": null,
>   "domains": ["Domain1", "Domain2"],
>   "mainDeck": [
>     { "name": "Carte", "quantity": 3, "type": "Spell", "rarity": "common", "domain": "Calm", "set": "OGN" }
>   ],
>   "runes": [
>     { "name": "Calm Rune", "quantity": 7 }
>   ],
>   "battlefields": ["BF1", "BF2", "BF3"],
>   "sideboard": [
>     { "name": "Carte", "quantity": 2, "type": "Gear", "rarity": "rare", "domain": "Order" }
>   ],
>   "totalCards": 64,
>   "stats": {
>     "unitCount": 6,
>     "spellCount": 25,
>     "gearCount": 17,
>     "averageCost": null
>   },
>   "sourceUrl": "URL de la page"
> }
> ```
>
> Sauvegarde le fichier dans `data/decklists/{legend-slug}/{tournament-slug}-{placement}-{player-slug}.json`
> Mets à jour `data/decklists-index.json`.

---

## Scraper un tournoi complet (TOUTES les decklists, TOUTES les pages)

### ⚠️ Pagination

Les pages de tournois sur riftdecks.com sont paginées avec `?page=X`. Un tournoi de 640 joueurs peut avoir 20-30+ pages de decklists. Il faut les parcourir TOUTES.

### Méthode rapide : map_urls + scrape

> **Étape 1 — Mapper toutes les URLs du tournoi :**
> Utilise `map_urls` sur la page du tournoi :
> `https://riftdecks.com/riftbound-tournaments/{tournament-slug}`
>
> Ça retourne la liste de toutes les URLs liées depuis cette page. Filtre celles qui matchent le pattern `riftbound-metagame/deck-` — ce sont les decklists.
>
> Si map_urls ne retourne pas toutes les pages (pagination), scrape manuellement chaque page :

> **Étape 1 bis — Pagination manuelle :**
> Utilise `scrape` sur la page 1 du tournoi :
> `https://riftdecks.com/riftbound-tournaments/{tournament-slug}`
>
> Dans le markdown retourné :
> 1. Extrais les infos du tournoi (nom, date, lieu, nombre de joueurs, organisateur)
> 2. Extrais TOUS les liens `deck-{nom}-{id}` sur cette page
> 3. Cherche les liens de pagination (`?page=2`, `?page=3`, etc.)
> 4. Note le numéro de la dernière page
>
> Puis scrape les pages suivantes une par une :
> - `scrape("https://riftdecks.com/riftbound-tournaments/{slug}?page=2")`
> - `scrape("https://riftdecks.com/riftbound-tournaments/{slug}?page=3")`
> - ... jusqu'à la dernière page
>
> Pour chaque page, extrais les URLs `deck-{nom}-{id}` et ajoute-les à `data/raw-scrapes/{tournament-slug}-urls.txt`.
>
> **IMPORTANT :**
> - Attends 2 secondes entre chaque page (sleep 2) pour ne pas se faire bloquer
> - Si une page retourne 0 decklists ou une erreur, c'est la fin — arrête la pagination
> - Décompte après chaque page : "Page X scrapée, Y decklists trouvées au total"
> - Si `scrape` échoue, retente avec `scrape(url, render_js=true)` (navigateur headless)

> **Étape 2 — Scraper chaque decklist :**
> Lis `data/raw-scrapes/{tournament-slug}-urls.txt` (toutes les URLs collectées).
> Pour chaque URL :
> 1. `scrape(url)` → récupère le markdown
> 2. Parse et crée le JSON dans `data/decklists/{legend-slug}/`
> 3. Sauvegarde le markdown brut dans `data/raw-scrapes/{tournament-slug}/{deck-id}.md` en cache
>
> **IMPORTANT :**
> - Attends 1-2 secondes entre chaque scrape
> - Si erreur → note dans `data/raw-scrapes/{tournament-slug}-errors.txt` et continue
> - Point d'étape tous les 10 decks : combien scrapés, combien restants, erreurs
> - À la fin, mets à jour `data/decklists-index.json`

### Raccourci : commande tout-en-un

> Scrape le tournoi complet `https://riftdecks.com/riftbound-tournaments/{tournament-slug}` :
> 1. `map_urls` ou `scrape` page 1 pour lister toutes les URLs de decklists
> 2. Pagine (`?page=2`, `?page=3`...) pour collecter TOUTES les URLs
> 3. `scrape` chaque decklist et crée le JSON dans `data/decklists/{legend-slug}/`
> 4. Sauvegarde le résumé du tournoi dans `data/tournaments/`
> 5. Mets à jour `data/decklists-index.json`
> Prends TOUT, pas juste le top 8. Pas de limite de crédits, on est en local.

---

## Scraper le Xi'an Regional Open (exemple concret)

> Scrape le tournoi S3 Xi'an Regional Open avec l'outil Scrapeur :
> 
> 1. `scrape("https://riftdecks.com/riftbound-tournaments/s3-xi-an-regional-open-tournament-decks-10763")`
> 2. Extrais TOUTES les URLs de decklists + pagine toutes les pages
> 3. Pour chaque decklist, `scrape(url)` et crée le JSON dans `data/decklists/{legend-slug}/`
> 4. Sauvegarde le résumé dans `data/tournaments/s3-xian-regional-open.json`
> 5. Mets à jour `data/decklists-index.json`
> 
> Infos connues : 640 joueurs, 2026-05-24, organisateur 官方赛事, Set Unleashed

---

## Scraper les decklists d'une Legend spécifique

> Utilise `scrape` sur la page méta de [NOM DE LA LEGEND] :
> `https://riftdecks.com/legends/constructed/{legend-slug}`
> 
> Extrais tous les liens `deck-{nom}-{id}`. Puis `scrape` chaque decklist et crée les JSON.
> Objectif : récupérer le maximum de listes pour cette Legend (20+ si possible).
> Pagine si nécessaire (`?page=2`, etc.).

---

## Crawl massif d'un site

Pour scraper en masse les pages d'un site (ex: tous les tournois de riftdecks.com) :

> Utilise `crawl` sur riftdecks.com :
> `crawl("https://riftdecks.com/riftbound-tournaments", max_pages=50, include_paths=["/riftbound-tournaments"])`
>
> Ça crawl automatiquement jusqu'à 50 pages sous /riftbound-tournaments. Extrais les URLs de tournois, puis scrape chaque tournoi individuellement.

---

## Après le scraping : réanalyser les patterns

> Lis toutes les decklists dans `data/decklists/` (y compris les nouvelles). Pour chaque Legend qui a 5+ listes, compare et identifie :
> - Core (90%+) — cartes auto-include
> - Standard (60-89%) — quasi-staples
> - Flex (30-59%) — choix méta-dépendant
> - Tech (<30%) — anti-méta spécifique
> 
> Mets à jour `DECKBUILDING-RULES.md` et `META-KNOWLEDGE.md`.

---

## Notes techniques

### Formats d'URL riftdecks.com

**Page d'une decklist individuelle :**
```
https://riftdecks.com/riftbound-metagame/deck-{nom-du-deck}-{id-numerique}
```
Exemples :
- `https://riftdecks.com/riftbound-metagame/deck-sha-huang-160769`
- `https://riftdecks.com/riftbound-metagame/deck-irelia-tempo-158432`

Le `{nom-du-deck}` est le nom donné par le joueur (souvent en chinois pour les tournois CN), et `{id-numerique}` est l'ID unique sur riftdecks.com. C'est cet ID qui est fiable pour le dédoublonnage.

**Page d'un tournoi (paginée) :**
```
https://riftdecks.com/riftbound-tournaments/{tournament-slug}
https://riftdecks.com/riftbound-tournaments/{tournament-slug}?page=2
https://riftdecks.com/riftbound-tournaments/{tournament-slug}?page=3
```
Exemples :
- `https://riftdecks.com/riftbound-tournaments/s3-xi-an-regional-open-tournament-decks-10763`
- `https://riftdecks.com/riftbound-tournaments/riftbound-regional-qualifier-atlanta-final-standings-tournament-decks-7872`

**Page méta d'une Legend (toutes ses decklists) :**
```
https://riftdecks.com/legends/constructed/{legend-slug}
```
Exemples :
- `https://riftdecks.com/legends/constructed/azir-emperor-of-the-sands`
- `https://riftdecks.com/legends/constructed/irelia-blade-dancer`

**Quand tu scrapes une page de tournoi**, les liens vers les decklists sont au format `deck-{nom}-{id}`. Extrais tous ces liens pour construire la liste d'URLs à scraper ensuite.

### Parsing du markdown scrapé
Le markdown de riftdecks.com suit ce pattern :

```
# {Nom du deck} by {Joueur}
"{Nom}" decklist by {Joueur}. {Placement} at {Tournoi} by {Organisateur} on {Date}

Legend (1) : {Nom Legend}
Champion (1) : {Nom Champion}
Unit (X) : {Nom} x{Quantité}
Gear (X) : ...
Spell (X) : ...
Battlefields (3) : ...
Runes (12) : ...
Sideboard (X) : ...
```

Les infos de domaine sont dans les icônes (calm, order, fury, etc.) converties en texte alt.
La rareté est dans les icônes (common, uncommon, rare, epic, showcase).

### Troubleshooting

| Problème | Solution |
|---|---|
| `scrape(url)` retourne vide ou erreur | Retenter avec `scrape(url, render_js=true)` |
| Timeout | Attendre 5 secondes et retenter |
| Page bloquée même avec render_js | Le site a peut-être changé son anti-bot, essayer plus tard |
| Contenu partiel (pas toute la decklist) | Vérifier si la page charge le contenu en AJAX — utiliser `render_js=true` |

### Avantages du scraper local
- **Pas de limite de crédits** — scrape autant que tu veux, c'est gratuit
- **Bypass Cloudflare** — curl_cffi imite un vrai navigateur Chrome (JA3 fingerprint)
- **Fallback navigateur** — si curl_cffi échoue, render_js=true lance un vrai navigateur headless
- **Cache local** — les résultats sont stockés dans data/raw-scrapes/ pour ne pas refaire les mêmes requêtes
- **Pas de dépendance cloud** — tout tourne sur ta machine
