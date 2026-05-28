# Prompt Claude Code — Scraper les decklists Riftbound via Firecrawl

## Setup (une seule fois)

### 1. Installer le plugin Firecrawl dans Claude Code
```
/plugin firecrawl
```
Ou manuellement :
```bash
npm install -g firecrawl
firecrawl auth # Suivre les instructions pour la clé API (500 crédits gratuits)
```

### 2. Créer les dossiers
```bash
mkdir -p data/decklists data/tournaments data/raw-scrapes
```

---

## Comment scraper une decklist depuis riftdecks.com

### Commande à donner à Claude Code :

> Utilise Firecrawl pour scraper cette page : [URL DE LA DECKLIST RIFTDECKS.COM]
> 
> Scrape en format markdown avec `onlyMainContent: true`. Ensuite, parse le contenu et extrais les informations suivantes pour créer un fichier JSON dans `data/decklists/{legend-slug}/` :
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
> Ensuite mets à jour `data/decklists-index.json` pour refléter cette nouvelle entrée.

---

## Scraper un tournoi complet (TOUTES les decklists, TOUTES les pages)

### ⚠️ Pagination

Les pages de tournois sur riftdecks.com sont paginées avec `?page=X`. Un tournoi de 640 joueurs peut avoir 20-30+ pages de decklists. Il faut les parcourir TOUTES.

### Étape 1 : Récupérer la page 1 et détecter la pagination

> Utilise Firecrawl pour scraper la page du tournoi sur riftdecks.com :
> `https://riftdecks.com/riftbound-tournaments/{tournament-slug}`
> 
> Scrape en markdown. Dans le contenu :
> 1. Extrais les infos du tournoi (nom, date, lieu, nombre de joueurs, organisateur)
> 2. Extrais TOUS les liens vers les decklists individuelles sur cette page
> 3. Cherche les liens de pagination — ils suivent le format `?page=2`, `?page=3`, etc.
> 4. Note le numéro de la dernière page disponible
>
> Sauvegarde les infos du tournoi dans `data/tournaments/{tournament-slug}.json`.
> Sauvegarde les URLs de decklists trouvées dans `data/raw-scrapes/{tournament-slug}-urls.txt`.

### Étape 2 : Paginer — scraper TOUTES les pages du tournoi

> Maintenant, scrape les pages suivantes une par une :
> - `https://riftdecks.com/riftbound-tournaments/{tournament-slug}?page=2`
> - `https://riftdecks.com/riftbound-tournaments/{tournament-slug}?page=3`
> - ... jusqu'à la dernière page
>
> Pour chaque page, extrais les URLs des decklists et ajoute-les à `data/raw-scrapes/{tournament-slug}-urls.txt`.
>
> **IMPORTANT :**
> - Attends 2 secondes entre chaque page pour ne pas spam
> - Si une page retourne 0 decklists ou une erreur, c'est qu'on a atteint la fin — arrête la pagination
> - Fais un décompte après chaque page : "Page X scrapée, Y decklists trouvées au total"
> - Quand toutes les pages sont faites, affiche le total : "Tournoi {nom} : {N} decklists sur {P} pages"

### Étape 3 : Scraper chaque decklist individuelle

> Lis le fichier `data/raw-scrapes/{tournament-slug}-urls.txt` qui contient maintenant TOUTES les URLs.
> Pour chaque URL, utilise Firecrawl pour scraper la page et créer le JSON de la decklist.
> 
> **IMPORTANT :**
> - Attends 1-2 secondes entre chaque scrape
> - Si une page retourne une erreur, note-la dans `data/raw-scrapes/{tournament-slug}-errors.txt` et continue
> - Sauvegarde le markdown brut dans `data/raw-scrapes/{tournament-slug}/{deck-id}.md` en cache
> - Après chaque batch de 10 decklists, fais un point : combien scrapées, combien restantes, erreurs
> - À la fin, mets à jour `data/decklists-index.json` avec toutes les nouvelles entrées

### Raccourci : commande tout-en-un

> Scrape le tournoi complet `https://riftdecks.com/riftbound-tournaments/{tournament-slug}` :
> 1. Scrape la page 1, détecte le nombre total de pages
> 2. Pagine toutes les pages (`?page=2`, `?page=3`, ...) pour collecter TOUTES les URLs de decklists
> 3. Scrape chaque decklist et crée le JSON dans `data/decklists/{legend-slug}/`
> 4. Sauvegarde le résumé du tournoi dans `data/tournaments/`
> 5. Mets à jour `data/decklists-index.json`
> Prends TOUT, pas juste le top 8.

---

## Scraper le Xi'an Regional Open (exemple concret)

> Utilise Firecrawl pour scraper le tournoi S3 Xi'an Regional Open :
> 
> 1. Scrape la page du tournoi : `https://riftdecks.com/riftbound-tournaments/s3-xi-an-regional-open-tournament-decks-10763`
> 2. Extrais TOUTES les URLs de decklists (pas juste le top 8 — prends tout ce qui est dispo)
> 3. Pour chaque decklist, scrape la page et crée le JSON dans `data/decklists/{legend-slug}/`
> 4. Sauvegarde le résumé du tournoi dans `data/tournaments/s3-xian-regional-open.json`
> 5. Mets à jour `data/decklists-index.json`
> 
> Infos connues : 640 joueurs, 2026-05-24, organisateur 官方赛事, Set Unleashed

---

## Scraper les decklists d'une Legend spécifique sur riftdecks.com

> Utilise Firecrawl pour scraper la page méta de [NOM DE LA LEGEND] :
> `https://riftdecks.com/legends/constructed/{legend-slug}`
> 
> Extrais tous les liens vers les decklists récentes de cette Legend. Puis scrape chaque decklist et crée les JSON. Objectif : récupérer le maximum de listes pour cette Legend (20+ si possible).

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
Le markdown de riftdecks.com suit ce pattern (vu dans l'exemple du Xi'an deck) :

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

Les infos de domaine sont dans les icônes (calm, order, fury, etc.) — Firecrawl les convertit en texte alt.
La rareté est dans les icônes (common, uncommon, rare, epic, showcase).

### Gestion des crédits Firecrawl
- Le tier gratuit donne 1000 crédits/mois (1 scrape = 1 crédit)
- Un tournoi de 64 joueurs = ~64 scrapes + 1 page tournoi = 65 crédits
- Un tournoi de 640 joueurs peut avoir 100-200+ decklists publiées = 200 crédits
- Si tu manques de crédits, priorise : top 8 d'abord, puis top 32, puis le reste
- Le plan Hobby à $19/mois donne 3000 crédits — largement suffisant pour scraper tous les tournois majeurs
