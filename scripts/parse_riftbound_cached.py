# -*- coding: utf-8 -*-
"""Parse cached riftdecks markdown -> decklist JSON + tournament summaries + index.

Reads:
  data/raw-scrapes/{slug}/*.md        (cached deck markdown)
  data/raw-scrapes/{slug}-meta.json   (tournament meta)
  data/raw-scrapes/legend-map.json    (SET-NUMBER -> canonical legend)
Writes:
  data/decklists/{legend-slug}/{slug}-{placement}-{playerslug}.json
  data/tournaments/{slug}.json
  data/raw-scrapes/index-fragments/{slug}.json
  merges all fragments into data/decklists-index.json
"""
import os, re, json, glob, sys

PROJECT = r"C:\Users\Allan\Documents\Claude\RiftboundFr"
RAW = os.path.join(PROJECT, "data", "raw-scrapes")
DECKLISTS = os.path.join(PROJECT, "data", "decklists")
TOURN = os.path.join(PROJECT, "data", "tournaments")
FRAG = os.path.join(RAW, "index-fragments")
INDEX = os.path.join(PROJECT, "data", "decklists-index.json")

with open(os.path.join(RAW, "legend-map.json"), encoding="utf-8") as f:
    LEGEND_MAP = json.load(f)

# character (first name, lowercased) -> set of legend names, for champion-based fallback
CHAR_LEGEND = {}
for _name in set(LEGEND_MAP.values()):
    _c = _name.split(",")[0].strip().lower()
    CHAR_LEGEND.setdefault(_c, set()).add(_name)

def champion_to_legend(champion, deck_set):
    """Deck legend == same character as the group_champion card. Resolve via character name."""
    if not champion:
        return None
    char = champion.split(",")[0].strip().lower()
    cands = CHAR_LEGEND.get(char)
    if not cands:
        return None
    if len(cands) == 1:
        return next(iter(cands))
    # only ambiguous case in the pool: Master Yi (Wuju Bladesman = Origins/Spiritforged, Wuju Master = Unleashed)
    if char == "master yi":
        if (deck_set or "") == "Unleashed":
            return "Master Yi, Wuju Master"
        return "Master Yi, Wuju Bladesman"
    return sorted(cands)[0]

DOMAINS = ("calm", "order", "fury", "body", "chaos", "mind", "colorless")
RARITIES = ("common", "uncommon", "rare", "epic", "showcase", "mythic", "legendary")
CARD_RE = re.compile(r"\*\*(\d+)\*\*\[([^\]]+)\]\(https://riftdecks\.com/cards/")
IMG_RE = re.compile(r"/img/cards/riftbound/([A-Za-z]+)/([a-z]+)-(\d+)[a-z]?-")

def legend_slug(name):
    s = name.split(",")[0].strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

def player_slug(p):
    s = re.sub(r"[^a-z0-9]+", "-", p.lower()).strip("-")
    return s[:30]

def cap(d):
    return d.capitalize()

def tournament_ctx(meta):
    """Contexte unique par tournoi: 'Nom (date)' (plusieurs tournois partagent le meme nom)."""
    name = (meta.get("name") or meta.get("slug") or "").replace("Shangai", "Shanghai").strip()
    d = meta.get("date")
    return "%s (%s)" % (name, d) if d else name

# slug du fil d'Ariane (/legends/constructed/{slug}) -> nom canonique
LEGEND_BY_SLUG = {}
for _n in set(LEGEND_MAP.values()):
    _s = re.sub(r"[^a-z0-9]+", "-", _n.lower().replace("'", "")).strip("-")
    LEGEND_BY_SLUG[_s] = _n

def find_legend(md):
    # 1) fil d'Ariane (format ancien) -> légende exacte (gère Master Yi Bladesman vs Master)
    bc = re.search(r"/legends/constructed/([a-z0-9-]+)", md)
    if bc and bc.group(1) in LEGEND_BY_SLUG:
        return LEGEND_BY_SLUG[bc.group(1)]
    # 2) image de carte (format CN récent) : SET-NUM qui matche la legend-map
    for m in IMG_RE.finditer(md):
        st, num = m.group(1).upper(), int(m.group(3))
        key = "%s-%d" % (st, num)
        if key in LEGEND_MAP:
            return LEGEND_MAP[key]
    return None

def parse_domains(md):
    lines = md.split("\n")
    doms = []
    for i, ln in enumerate(lines):
        if "| domains |" in ln:
            for ln2 in lines[i+1:i+12]:
                mm = re.match(r"\s*\|\s*(calm|order|fury|body|chaos|mind|colorless)\s*\|", ln2)
                if mm:
                    d = mm.group(1)
                    if d != "colorless" and cap(d) not in doms:
                        doms.append(cap(d))
                elif ln2.strip().startswith("| ") and "%" not in ln2:
                    break
            if doms:
                return doms
    # fallback: rune icons in header (first 20 lines)
    for ln in md.split("\n")[:25]:
        for mm in re.finditer(r"rune_(calm|order|fury|body|chaos|mind)\b", ln):
            if cap(mm.group(1)) not in doms:
                doms.append(cap(mm.group(1)))
    return doms[:2]

def parse_deck(md, deck_id, meta):
    # description
    player, placement = None, None
    dm = re.search(r"decklist by (.+?)\.\s+(\d+)(?:st|nd|rd|th)\s+at\b", md)
    if dm:
        player = dm.group(1).strip()
        placement = int(dm.group(2))
    if player is None:
        tm = re.search(r"^#\s+.+?\s+by\s+(.+)$", md, re.M)
        if tm:
            player = tm.group(1).strip()
    if player is None:
        player = ""

    lines = md.split("\n")
    section = None
    last_rarity = "common"
    champion = None
    main, runes, battlefields, sideboard = [], [], [], []
    for ln in lines:
        if "group_champion" in ln: section = "champion"; continue
        if "group_unit" in ln: section = "unit"; continue
        if "group_gear" in ln: section = "gear"; continue
        if "group_spell" in ln: section = "spell"; continue
        if "group_battlefields" in ln: section = "battlefield"; continue
        if "group_runes" in ln: section = "rune"; continue
        if "group_sideboard" in ln: section = "sideboard"; continue
        rm = re.search(r"rarity_(%s)" % "|".join(RARITIES), ln)
        if rm:
            last_rarity = rm.group(1)
        cm = CARD_RE.search(ln)
        if not cm:
            continue
        qty = int(cm.group(1)); name = cm.group(2)
        dom = "colorless"
        dmm = re.search(r"rune_(%s)" % "|".join(DOMAINS), ln)
        if dmm:
            dom = dmm.group(1)
        if section == "champion":
            champion = name
            continue
        if section == "rune":
            runes.append({"name": name, "quantity": qty})
        elif section == "battlefield":
            battlefields.append(name)
        elif section == "sideboard":
            sideboard.append({"name": name, "quantity": qty, "type": "Unknown", "rarity": last_rarity, "domain": dom})
        elif section in ("unit", "gear", "spell"):
            t = {"unit": "Unit", "gear": "Gear", "spell": "Spell"}[section]
            main.append({"name": name, "quantity": qty, "type": t, "rarity": last_rarity, "domain": dom})

    # legend: 1) via legend card image in markdown; 2) fallback via champion's character
    legend = find_legend(md) or champion_to_legend(champion, meta.get("set"))
    if not legend:
        return None, "no-legend"

    domains = parse_domains(md)
    total = (sum(c["quantity"] for c in main) + sum(r["quantity"] for r in runes)
             + len(battlefields) + 1 + (1 if champion else 0))
    deck = {
        "id": deck_id,
        "legend": legend,
        "legendId": None,
        "champion": champion,
        "player": player,
        "tournament": tournament_ctx(meta),
        "date": meta.get("date"),
        "placement": placement,
        "playerCount": meta.get("playerCount"),
        "set": meta.get("set"),
        "format": "Constructed",
        "archetype": None,
        "domains": domains,
        "mainDeck": main,
        "runes": runes,
        "battlefields": battlefields,
        "sideboard": sideboard,
        "totalCards": total,
        "stats": {
            "unitCount": sum(c["quantity"] for c in main if c["type"] == "Unit"),
            "spellCount": sum(c["quantity"] for c in main if c["type"] == "Spell"),
            "gearCount": sum(c["quantity"] for c in main if c["type"] == "Gear"),
            "averageCost": None,
        },
        "sourceUrl": "https://riftdecks.com/riftbound-metagame/" + deck_id,
    }
    return deck, None

def main():
    slugs = [os.path.basename(p)[:-10] for p in glob.glob(os.path.join(RAW, "*-meta.json"))]
    all_frag = []
    grand_written = 0
    for slug in sorted(slugs):
        with open(os.path.join(RAW, slug + "-meta.json"), encoding="utf-8") as f:
            meta = json.load(f)
        deck_dir = os.path.join(RAW, slug)
        if not os.path.isdir(deck_dir):
            continue
        frag = []
        decks = []
        skipped = 0
        used_names = set()
        for mdfile in glob.glob(os.path.join(deck_dir, "*.md")):
            deck_id = os.path.basename(mdfile)[:-3]
            with open(mdfile, encoding="utf-8") as f:
                md = f.read()
            deck, err = parse_deck(md, deck_id, meta)
            if not deck:
                skipped += 1
                continue
            lslug = legend_slug(deck["legend"])
            os.makedirs(os.path.join(DECKLISTS, lslug), exist_ok=True)
            pslug = player_slug(deck["player"])
            base = "%s-%s-%s" % (slug, deck["placement"] if deck["placement"] is not None else "unranked", pslug or "p")
            fname = base + ".json"
            if fname in used_names:
                idnum = re.search(r"(\d+)$", deck_id)
                fname = "%s-%s.json" % (base, idnum.group(1) if idnum else str(len(used_names)))
            used_names.add(fname)
            relpath = "%s/%s" % (lslug, fname)
            with open(os.path.join(DECKLISTS, lslug, fname), "w", encoding="utf-8") as f:
                json.dump(deck, f, ensure_ascii=False, indent=2)
            decks.append(deck)
            frag.append({"id": deck["id"], "legend": deck["legend"], "player": deck["player"],
                         "placement": deck["placement"], "file": relpath})
        # tournament summary
        legcount = {}
        for d in decks:
            legcount[d["legend"]] = legcount.get(d["legend"], 0) + 1
        n = len(decks) or 1
        breakdown = [{"legend": k, "count": v, "pct": round(v * 100 / n)} for k, v in
                     sorted(legcount.items(), key=lambda x: -x[1])]
        topp = []
        for d in sorted([d for d in decks if d["placement"] is not None], key=lambda x: x["placement"])[:8]:
            topp.append({"rank": d["placement"], "player": d["player"], "legend": d["legend"], "domains": d["domains"]})
        city = slug.replace("s2-", "").split("-cc-")[0].split("-regional")[0].replace("-", " ").title()
        summary = {
            "name": tournament_ctx(meta), "slug": slug, "date": meta.get("date"),
            "location": city + ", China", "playerCount": meta.get("playerCount"),
            "format": "Constructed", "set": meta.get("set"), "organizer": None,
            "decklistsPublished": len(decks), "sourceUrl": meta.get("sourceUrl"),
            "topPlacements": topp, "legendBreakdown": breakdown,
        }
        with open(os.path.join(TOURN, slug + ".json"), "w", encoding="utf-8") as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        os.makedirs(FRAG, exist_ok=True)
        with open(os.path.join(FRAG, slug + ".json"), "w", encoding="utf-8") as f:
            json.dump(frag, f, ensure_ascii=False, indent=2)
        all_frag.extend(frag)
        grand_written += len(decks)
        print("%-28s decks=%4d skipped(no-legend)=%3d" % (slug, len(decks), skipped))

    # merge into global index
    existing = []
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            existing = json.load(f)
    newids = {e["id"] for e in all_frag}
    merged = [e for e in existing if e.get("id") not in newids] + all_frag
    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    print("TOTAL written=%d, index now=%d" % (grand_written, len(merged)))

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
