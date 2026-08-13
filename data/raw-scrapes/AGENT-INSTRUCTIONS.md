# Riftbound tournament scraper — shared agent instructions

You scrape ONE tournament from riftdecks.com.
Working dir: `C:\Users\Allan\Documents\Claude\RiftboundFr`.
Your prompt gives you a **URL** and a **SLUG**. Use them everywhere `{URL}` / `{SLUG}` appear.

**Fetching is already scripted — use it instead of calling a scraper by hand:**

```bash
bash scripts/scrape-tournoi.sh {SLUG} {URL} <page-count>
```

It does STEP 1 and the fetching half of STEP 2 (raw markdown into
`data/raw-scrapes/{SLUG}/`), and it is resumable. What remains for you is the
parsing: turning that raw markdown into decklist JSON, from STEP 2.2 onward.

Only the `firecrawl` CLI gets through riftdecks' Cloudflare. `curl`, `WebFetch`,
the MCP "Scrapeur" tools and `cloudscraper` 1.2.71 all return 403 (checked
2026-08-13). Calls go through `scripts/fc.sh`, which rotates to the next API key
when the current one runs out of credit; keys live in `.firecrawl/keys`, one per
line, **untracked** — recreate it on a fresh clone. One tournament at a time: a
key is capped at 18 requests/minute.

## STEP 0 — Legend lookup map
Read `data/raw-scrapes/legend-map.json` — a JSON object mapping `"SET-NUMBER"` (e.g. `"SFD-185"`)
to a canonical legend name (e.g. `"Draven, Glorious Executioner"`). Used to identify each deck's legend.

**A legend missing from this map silently drops the whole deck** (`no-legend`, STEP 2.2). When the
tournament is on a set newer than the map, every deck led by a new legend disappears without warning —
this happened with Vendetta, whose 9 legends were in the card DB but absent from the map. Before
scraping a new set, run `npx tsx scripts/maj-legend-map.mts` (add `--apply` to write): it fills the
map from the card DB and never overwrites an existing entry.

## STEP 1 — Tournament meta + paginated deck-URL collection
1. `mcp__scrapeur__scrape({URL})` (page 1). From the markdown read:
   - tournament display name (H1 / "Event name"),
   - player count (`"N Players"`),
   - Date (format `M/D/YY` → convert to `YYYY-MM-DD`),
   - the **Meta** value = the SET (`Origins` / `Spiritforged` / `Unleashed` / `Vendetta`),
     capitalised as shown — the page prints it uppercase (`VENDETTA`),
   - the line `Page 1 of N, showing X record(s) out of TOTAL total` → `N` = last page, `TOTAL` = expected deck count.
2. For each page `p` in `1..N`: call `mcp__scrapeur__map_urls(URL + (p>1 ? "?page="+p : ""), limit=130)`.
   Keep links matching `/riftbound-metagame/deck-`. Dedupe across pages. Wait ~1.5s between pages.
3. Save deduped deck URLs to `data/raw-scrapes/{SLUG}-urls.txt` (one per line). Report found vs TOTAL.

## STEP 2 — Scrape & parse each deck  (wait ~1.5s between scrapes)
For each deck URL:
1. `r = mcp__scrapeur__scrape(deckUrl)`; use `r.markdown` and `r.metadata.description`.
   Cache markdown to `data/raw-scrapes/{SLUG}/{deck-id}.md` (deck-id = last URL path segment, e.g. `deck-de-lai-wen-cheng-dou-69984`).
   If empty/error → retry once with `mcp__scrapeur__scrape(deckUrl, render_js=true)`.
2. **Legend**: find every card-image ref in markdown matching
   `/img/cards/riftbound/{SET}/{set}-{NUM}{optional letter}-...png`. For each build key
   `SET.toUpperCase() + "-" + Number(NUM)` (`Number()` strips leading zeros + trailing variant letter:
   `ogn-027`→`OGN-27`, `sfd-020a`→`SFD-20`). Look up each key in legend-map; the match is the legend
   (canonical name from the map). If **no** image matches → append deckUrl to
   `data/raw-scrapes/{SLUG}-errors.txt` (reason `no-legend`) and SKIP.
3. **Player / placement / date** from `metadata.description`
   (`"{deck}" decklist by {PLAYER}. {PLACE}(st|nd|rd|th) at {TOURNAMENT} by {ORG} on {YYYY-MM-DD}`):
   - player = `/decklist by (.+?)\.\s+\d+(?:st|nd|rd|th) at/`
   - placement = `/(\d+)(?:st|nd|rd|th) at/`  (int; null if absent)
   - date = `/on (\d{4}-\d{2}-\d{2})/`
4. **Cards**: walk markdown lines in order, tracking `currentSection` by group icons:
   `group_champion`→champion, `group_unit`→Unit, `group_gear`→Gear, `group_spell`→Spell,
   `group_battlefields`→battlefield, `group_runes`→rune, `group_sideboard`→sideboard.
   A card entry = a rarity icon `![<rarity>](...rarity_<rarity>.png)` then `**<qty>**[<Name>](https://riftdecks.com/cards/...)`
   then a domain rune icon `![<domain>](...rune_<domain>.png)`.
   rarity ∈ {common,uncommon,rare,epic,showcase,mythic}; domain ∈ {calm,order,fury,body,chaos,mind,colorless}.
   - champion section → `champion` = that card's name (qty 1).
   - unit/gear/spell → `mainDeck` entries with type Unit/Gear/Spell.
   - battlefields → `battlefields` (names only).
   - runes → `runes` `[{name,quantity}]`.
   - sideboard → `sideboard` `[{name,quantity,type:"Unknown",rarity,domain}]`.
5. **Deck domains**: from the `## Deck Stats` → `domains` block at the bottom (e.g. `chaos 55%`, `fury 47%`),
   non-colorless only, Capitalized (`["Chaos","Fury"]`). Fallback: the two rune icons in the header.
6. **Write** `data/decklists/{legend-slug}/{SLUG}-{placement|unranked}-{player-slug}.json`:
```json
{
  "id": "<deck-id>",
  "legend": "<canonical legend>",
  "legendId": null,
  "champion": "<champion or null>",
  "player": "<player>",
  "tournament": "<tournament name>",
  "date": "YYYY-MM-DD",
  "placement": <int|null>,
  "playerCount": <int>,
  "set": "Origins|Spiritforged|Unleashed|Vendetta",
  "format": "Constructed",
  "archetype": null,
  "domains": ["Chaos","Fury"],
  "mainDeck": [{"name":"","quantity":3,"type":"Unit","rarity":"common","domain":"chaos"}],
  "runes": [{"name":"Chaos Rune","quantity":6}],
  "battlefields": ["..."],
  "sideboard": [{"name":"","quantity":2,"type":"Unknown","rarity":"rare","domain":"fury"}],
  "totalCards": <sum mainDeck qty + runes qty + battlefields.length + 1 (legend) + (champion?1:0)>,
  "stats": {"unitCount":<Unit qty sum>,"spellCount":<Spell qty sum>,"gearCount":<Gear qty sum>,"averageCost":null},
  "sourceUrl": "<deckUrl>"
}
```
   - `legend-slug` = `legend.split(",")[0]` lowercased, non-alphanumeric → `-`, trim trailing `-`
     (e.g. `"Draven, Glorious Executioner"` → `draven`). Match existing folder names under `data/decklists/`
     when one already exists for that legend (e.g. `kaisa`, `khazix`, `lee-sin`, `miss-fortune`).
   - `player-slug` = player lowercased, non-alphanumeric → `-`, trimmed, max 30 chars.
     Many players are Chinese → slug may be empty; then use `{SLUG}-{placement}` (or `+deck-id` on collision).
7. Checkpoint every 15 decks: `X scraped / TOTAL, Z errors`.

## STEP 3 — Tournament summary
Write `data/tournaments/{SLUG}.json`:
`{ name, slug:"{SLUG}", date, location (infer from city, e.g. "Chengdu, China"), playerCount,
   format:"Constructed", set, organizer, decklistsPublished:<count written>, sourceUrl:"{URL}",
   topPlacements:[{rank,player,legend,domains} for top 8],
   legendBreakdown:[{legend,count,pct}] across all written decks, sorted desc }`.

## STEP 4 — Index fragment (DO NOT touch the global data/decklists-index.json)
Write `data/raw-scrapes/index-fragments/{SLUG}.json` = JSON array of
`{"id","legend","player","placement","file"}` (file = `"<legend-slug>/<filename>.json"`) for every deck written.

## FINAL REPORT
pages paginated, deck URLs found vs expected TOTAL, decks written, decks skipped (no-legend), other errors.
