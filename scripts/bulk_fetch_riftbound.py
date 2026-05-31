# -*- coding: utf-8 -*-
"""Bulk-fetch Riftbound tournament decklists from riftdecks.com using the local
Scrapeur engine (curl_cffi Chrome impersonation) directly — no LLM tokens.

Run with the Scrapeur venv python:
  C:\\Users\\Allan\\Documents\\Claude\\Scrapeur\\.venv\\Scripts\\python.exe scripts\\bulk_fetch_riftbound.py

Caches each deck's markdown to data/raw-scrapes/{slug}/{deck-id}.md (resumable: skips existing),
writes data/raw-scrapes/{slug}-urls.txt and data/raw-scrapes/{slug}-meta.json.
"""
import os, sys, re, json, time

SCRAPEUR = r"C:\Users\Allan\Documents\Claude\Scrapeur"
PROJECT = r"C:\Users\Allan\Documents\Claude\RiftboundFr"
os.chdir(SCRAPEUR)
sys.path.insert(0, SCRAPEUR)
os.environ["SCRAPE_CACHE_ENABLED"] = "false"       # force live fetches (bypass 24h cached ban pages)
from app.scraper import scrape as _scrape          # noqa: E402
from app.crawler import map_site                   # noqa: E402

RAW = os.path.join(PROJECT, "data", "raw-scrapes")
LOG = os.path.join(RAW, "bulk_fetch.log")

TOURNAMENTS = [
    # S3 City Challenges (Unleashed)
    ("s3-guangzhou-cc-11454", "https://riftdecks.com/riftbound-tournaments/s3-guangzhou-city-challenge-tournament-decks-11454"),
    ("s3-shanghai-cc-10761",  "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-10761"),
    ("s3-guangzhou-cc-9974",  "https://riftdecks.com/riftbound-tournaments/s3-guangzhou-city-challenge-tournament-decks-9974"),
    ("s3-shenzhen-cc-9824",   "https://riftdecks.com/riftbound-tournaments/s3-shenzhen-city-challenge-tournament-decks-9824"),
    ("s3-shanghai-cc-9180",   "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-9180"),
    ("s3-shenzhen-cc-8570",   "https://riftdecks.com/riftbound-tournaments/s3-shenzhen-city-challenge-tournament-decks-8570"),
    ("s3-guangzhou-cc-8461",  "https://riftdecks.com/riftbound-tournaments/s3-guangzhou-city-challenge-tournament-decks-8461"),
    ("s3-shenzhen-cc-8460",   "https://riftdecks.com/riftbound-tournaments/s3-shenzhen-city-challenge-tournament-decks-8460"),
    ("s3-shanghai-cc-8418",   "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-8418"),
    ("s3-beijing-cc-8364",    "https://riftdecks.com/riftbound-tournaments/s3-beijing-city-challenge-tournament-decks-8364"),
    ("s3-shanghai-cc-8257",   "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-8257"),
    ("s3-fuzhou-cc-7961",     "https://riftdecks.com/riftbound-tournaments/s3-fuzhou-city-challenge-tournament-decks-7961"),
    ("s3-beijing-cc-7951",    "https://riftdecks.com/riftbound-tournaments/s3-beijing-city-challenge-tournament-decks-7951"),
    ("s3-guangzhou-cc-7950",  "https://riftdecks.com/riftbound-tournaments/s3-guangzhou-city-challenge-tournament-decks-7950"),
    ("s3-shanghai-cc-7949",   "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-7949"),
    ("s3-chengdu-cc-7947",    "https://riftdecks.com/riftbound-tournaments/s3-chengdu-city-challenge-tournament-decks-7947"),
    ("s3-changzhou-cc-7946",  "https://riftdecks.com/riftbound-tournaments/s3-changzhou-city-challenge-tournament-decks-7946"),
    ("s3-wuhan-cc-7945",      "https://riftdecks.com/riftbound-tournaments/s3-wuhan-city-challenge-tournament-decks-7945"),
    ("s3-shenyang-cc-7937",   "https://riftdecks.com/riftbound-tournaments/s3-shenyang-city-challenge-tournament-decks-7937"),
    ("s3-hangzhou-cc-7667",   "https://riftdecks.com/riftbound-tournaments/s3-hangzhou-city-challenge-tournament-decks-7667"),
    ("s3-guangzhou-cc-7666",  "https://riftdecks.com/riftbound-tournaments/s3-guangzhou-city-challenge-tournament-decks-7666"),
    ("s3-tianjin-cc-7643",    "https://riftdecks.com/riftbound-tournaments/s3-tianjin-city-challenge-tournament-decks-7643"),
    ("s3-shanghai-cc-7642",   "https://riftdecks.com/riftbound-tournaments/s3-shanghai-city-challenge-tournament-decks-7642"),
    ("s3-nanjing-cc-7640",    "https://riftdecks.com/riftbound-tournaments/s3-nanjing-city-challenge-tournament-decks-7640"),
    ("s3-shenzhen-cc-7639",   "https://riftdecks.com/riftbound-tournaments/s3-shenzhen-city-challenge-tournament-decks-7639"),
    # Regional Opens (Origins)
    ("hangzhou-ro-81",   "https://riftdecks.com/riftbound-tournaments/hangzhou-regional-open-tournament-decks-81"),
    ("beijing-ro-89",    "https://riftdecks.com/riftbound-tournaments/beijing-regional-open-tournament-decks-89"),
    ("chongqing-ro-85",  "https://riftdecks.com/riftbound-tournaments/chongqing-regional-open-tournament-decks-85"),
    ("guangzhou-ro-90",  "https://riftdecks.com/riftbound-tournaments/guangzhou-regional-open-tournament-decks-90"),
    # City Challenges (Origins-era, older)
    ("fuzhou-cc-584",    "https://riftdecks.com/riftbound-tournaments/fuzhou-city-challenge-tournament-decks-584"),
    ("shenzhen-cc-583",  "https://riftdecks.com/riftbound-tournaments/shenzhen-city-challenge-tournament-decks-583"),
    ("shanghai-cc-582",  "https://riftdecks.com/riftbound-tournaments/shanghai-city-challenge-tournament-decks-582"),
    ("beijing-cc-581",   "https://riftdecks.com/riftbound-tournaments/beijing-city-challenge-tournament-decks-581"),
    ("guangzhou-cc-579", "https://riftdecks.com/riftbound-tournaments/guangzhou-city-challenge-tournament-decks-579"),
    ("guangzhou-cc-578", "https://riftdecks.com/riftbound-tournaments/guangzhou-city-challenge-tournament-decks-578"),
    ("beijing-cc-576",   "https://riftdecks.com/riftbound-tournaments/beijing-city-challenge-tournament-decks-576"),
    ("shenzhen-cc-575",  "https://riftdecks.com/riftbound-tournaments/shenzhen-city-challenge-tournament-decks-575"),
    ("shanghai-cc-574",  "https://riftdecks.com/riftbound-tournaments/shanghai-city-challenge-tournament-decks-574"),
    ("hangzhou-cc-573",  "https://riftdecks.com/riftbound-tournaments/hangzhou-city-challenge-tournament-decks-573"),
    ("shanghai-cc-569",  "https://riftdecks.com/riftbound-tournaments/shanghai-city-challenge-tournament-decks-569"),
    ("nanjing-cc-568",   "https://riftdecks.com/riftbound-tournaments/nanjing-city-challenge-tournament-decks-568"),
    ("beijing-cc-567",   "https://riftdecks.com/riftbound-tournaments/beijing-city-challenge-tournament-decks-567"),
    ("shenyang-cc-566",  "https://riftdecks.com/riftbound-tournaments/shenyang-city-challenge-tournament-decks-566"),
    ("wuhan-cc-565",     "https://riftdecks.com/riftbound-tournaments/wuhan-city-challenge-tournament-decks-565"),
    ("guangzhou-cc-564", "https://riftdecks.com/riftbound-tournaments/guangzhou-city-challenge-tournament-decks-564"),
    ("chengdu-cc-562",   "https://riftdecks.com/riftbound-tournaments/chengdu-city-challenge-tournament-decks-562"),
    ("shenzhen-cc-561",  "https://riftdecks.com/riftbound-tournaments/shenzhen-city-challenge-tournament-decks-561"),
    ("guangzhou-cc-556", "https://riftdecks.com/riftbound-tournaments/guangzhou-city-challenge-tournament-decks-556"),
    ("shanghai-cc-437",  "https://riftdecks.com/riftbound-tournaments/shanghai-city-challenge-tournament-decks-437"),
    ("shanghai-cc-172",  "https://riftdecks.com/riftbound-tournaments/shanghai-city-challenge-tournament-decks-172"),
    ("chengdu-cc-141",   "https://riftdecks.com/riftbound-tournaments/chengdu-city-challenge-tournament-decks-141"),
]

def log(msg):
    line = time.strftime("%H:%M:%S") + " " + msg
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def is_banned(md):
    if not md:
        return True
    low = md.lower()
    # Cloudflare 1015 ban page is ~352 chars; real decks mention "banned cards" so don't match the bare word
    return ("error-1015" in low) or ("banned you temporarily" in low) or ("cloudflare-1xxx" in low) or (len(md) < 600)

def is_valid_deck(md):
    return bool(md) and not is_banned(md) and ("/cards/" in md) and len(md) >= 1500

def safe_scrape(url, expect_cards=True):
    try:
        r = _scrape(url, None, True)
        bad = is_banned(r.markdown) if not expect_cards else not is_valid_deck(r.markdown)
        if bad:
            r2 = _scrape(url, True, True)   # force real browser
            if (r2.markdown or "") and len(r2.markdown or "") > len(r.markdown or ""):
                return r2
        return r
    except Exception as e:
        log("  ERR scrape %s : %s" % (url, e))
        return None

def valid_cache(fp):
    try:
        if not os.path.exists(fp) or os.path.getsize(fp) < 1500:
            return False
        with open(fp, encoding="utf-8") as f:
            return is_valid_deck(f.read())
    except Exception:
        return False

def parse_meta(md, slug, url):
    meta = {"slug": slug, "sourceUrl": url}
    m = re.search(r"Event name\s*\n+\s*\*\*(.+?)\*\*", md)
    meta["name"] = m.group(1).strip() if m else slug
    m = re.search(r"(\d+)\s*Players", md)
    meta["playerCount"] = int(m.group(1)) if m else None
    m = re.search(r"Date\s*\n+\s*(\d+)/(\d+)/(\d+)", md)
    if m:
        mo, da, yr = int(m.group(1)), int(m.group(2)), int(m.group(3))
        yr = 2000 + yr if yr < 100 else yr
        meta["date"] = "%04d-%02d-%02d" % (yr, mo, da)
    else:
        meta["date"] = None
    m = re.search(r"\b(Origins|Spiritforged|Unleashed)\b", md)
    meta["set"] = m.group(1) if m else None
    m = re.search(r"Page\s+1\s+of\s+(\d+),\s+showing\s+\d+\s+record\(s\)\s+out\s+of\s+(\d+)\s+total", md)
    meta["lastPage"] = int(m.group(1)) if m else 1
    meta["total"] = int(m.group(2)) if m else None
    return meta

def main():
    tours = TOURNAMENTS
    if len(sys.argv) > 1:
        wanted = set(sys.argv[1:])
        tours = [t for t in TOURNAMENTS if t[0] in wanted]
    grand = 0
    consec_ban = 0
    for slug, url in tours:
        deck_dir = os.path.join(RAW, slug)
        os.makedirs(deck_dir, exist_ok=True)
        log("=== %s ===" % slug)
        urls_file = os.path.join(RAW, slug + "-urls.txt")
        # reuse already-collected URLs if present (avoids re-mapping / extra requests)
        seen = []
        if os.path.exists(urls_file) and os.path.getsize(urls_file) > 0:
            with open(urls_file, encoding="utf-8") as f:
                seen = [l.strip() for l in f if l.strip()]
            meta_file = os.path.join(RAW, slug + "-meta.json")
            meta = json.load(open(meta_file, encoding="utf-8")) if os.path.exists(meta_file) else {"slug": slug, "sourceUrl": url}
            log("  reuse %d urls" % len(seen))
        else:
            r = safe_scrape(url, expect_cards=False)
            if not r:
                log("  FATAL: page1 failed"); continue
            meta = parse_meta(r.markdown, slug, url)
            log("  meta: name=%s players=%s date=%s set=%s pages=%s total=%s" % (
                meta["name"], meta["playerCount"], meta["date"], meta["set"], meta["lastPage"], meta["total"]))
            with open(os.path.join(RAW, slug + "-meta.json"), "w", encoding="utf-8") as f:
                json.dump(meta, f, ensure_ascii=False, indent=2)
            seenset = set()
            for p in range(1, (meta["lastPage"] or 1) + 1):
                purl = url if p == 1 else url + "?page=" + str(p)
                try:
                    links = map_site(purl, 140)
                except Exception as e:
                    log("  ERR map page %d: %s" % (p, e)); continue
                cnt = 0
                for l in links:
                    if "/riftbound-metagame/deck-" in l and l not in seenset:
                        seenset.add(l); seen.append(l); cnt += 1
                log("  page %d: +%d (total %d)" % (p, cnt, len(seen)))
                time.sleep(1.0)
            with open(urls_file, "w", encoding="utf-8") as f:
                f.write("\n".join(seen))
        # fetch each deck
        done = 0; skipped = 0; failed = 0
        for durl in seen:
            did = durl.rstrip("/").split("/")[-1]
            fp = os.path.join(deck_dir, did + ".md")
            if valid_cache(fp):
                skipped += 1; continue
            dr = safe_scrape(durl)
            md = dr.markdown if dr else None
            if not is_valid_deck(md):
                failed += 1
                consec_ban += 1
                with open(os.path.join(RAW, slug + "-errors.txt"), "a", encoding="utf-8") as f:
                    f.write(durl + "\n")
                if consec_ban >= 4:
                    log("  rate-limited (%d consecutive) -> cooldown 300s" % consec_ban)
                    time.sleep(300); consec_ban = 0
                else:
                    time.sleep(2.0)
                continue
            consec_ban = 0
            with open(fp, "w", encoding="utf-8") as f:
                f.write(md)
            done += 1
            if (done + skipped) % 25 == 0:
                log("  fetched %d/%d (skip %d, fail %d)" % (done + skipped, len(seen), skipped, failed))
            time.sleep(1.0)
        grand += done + skipped
        log("  DONE %s: fetched %d, skipped %d, failed %d, urls %d" % (slug, done, skipped, failed, len(seen)))
    log("ALL DONE. total cached decks ~%d" % grand)

if __name__ == "__main__":
    open(LOG, "a", encoding="utf-8").close()
    main()
