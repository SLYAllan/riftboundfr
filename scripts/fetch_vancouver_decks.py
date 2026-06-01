import os, sys, time

SCRAPEUR = r"C:\Users\Allan\Documents\Claude\Scrapeur"
os.chdir(SCRAPEUR)
sys.path.insert(0, SCRAPEUR)
from app.scraper import scrape  # noqa: E402

OUT = r"C:\Users\Allan\Documents\Claude\RiftboundFr\data\raw-scrapes\vancouver-rq"
os.makedirs(OUT, exist_ok=True)

# rank -> (key, url). Top 7 (8th BaoBao deck unavailable on riftdecks).
DECKS = [
    ("1-alanzq-diana", "https://riftdecks.com/riftbound-metagame/deck-diana-scorn-of-the-moon-171101"),
    ("2-samdsherman-rengar", "https://riftdecks.com/riftbound-metagame/deck-rengar-pridestalker-171145"),
    ("3-housesarebig-masteryi", "https://riftdecks.com/riftbound-metagame/deck-master-yi-wuju-bladesman-171077"),
    ("4-diwali-diana", "https://riftdecks.com/riftbound-metagame/deck-diana-scorn-of-the-moon-170902"),
    ("5-rocklho-azir", "https://riftdecks.com/riftbound-metagame/deck-azir-emperor-of-the-sands-170900"),
    ("6-arito-irelia", "https://riftdecks.com/riftbound-metagame/deck-irelia-blade-dancer-171202"),
    ("7-swagyolo420-sivir", "https://riftdecks.com/riftbound-metagame/deck-sivir-battle-mistress-171016"),
]

for key, url in DECKS:
    path = os.path.join(OUT, key + ".md")
    if os.path.exists(path) and os.path.getsize(path) > 1500:
        print("skip", key)
        continue
    try:
        res = scrape(url)
        md = getattr(res, "markdown", None)
        if md is None and isinstance(res, dict):
            md = res.get("markdown")
        if not md or len(md) < 1000:
            print("WARN short", key, len(md or ""))
            continue
        with open(path, "w", encoding="utf-8") as f:
            f.write(md)
        print("ok", key, len(md))
    except Exception as e:
        print("ERR", key, repr(e))
    time.sleep(1.5)

print("done")
