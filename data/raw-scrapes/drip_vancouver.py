# -*- coding: utf-8 -*-
"""Scrape Vancouver final-standings decklists via curl_cffi (Scrapeur engine) + cf_clearance cookie.
Reads the standings file, fetches each deck, parses, writes JSONL incrementally."""
import json, time, re, os, random
from curl_cffi import requests
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
COOKIE = "PHPSESSID=t0omeng689dcis7okjto4f4oak; cf_clearance=IMzC1xfOpfs2_rptSObEI7vZjbdZOJtxGKsvb2f2V9U-1781528789-1.2.1.1-l0Iu57fXoJC6QzDw1VCrDaJUr4VXFOcmU6i4Ei34XcCTZPZ07mg_eopiS.XnC9RzjHxlX91Qm_hqPkLIFAgU.jWMX8jYY8jAzSMMkIGWiwnTIxh.f1qF2z1f2ui_l0bkNKMSkroaa8QbTgZZf_7fzDixHI1fg7_EY3w4Sf8abGBoHf9x_GyPHWMtiOriFcKDwkWQklXCIeSzF.VjFBPICKYhtTEVfLadkfIxhhUQCO5C1DDnp1nxWo_.O4k9LSwZ.iPT0VfCKQwbc2h0SdD5FiC5NK0tc7lrf9DAI5f6HMejG38qT1yc0gAW33hQMz7btnMXnt0wtxTkwX3pJmBk0_6XFi682x8ftM14_oIZcCaG4ua9HO2ExQFljf1sZ1K6bve0rYUIgJ1yU_Ey.udjBuCxxS4ZzuJLX2Qw_Ms_6rM"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": UA, "Cookie": COOKIE, "Accept": "text/html,application/xhtml+xml",
           "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
           "Referer": "https://riftdecks.com/riftbound-tournaments/riftbound-regional-qualifier-vancouver-final-standings-tournament-decks-11474"}

STANDINGS = os.path.join(HERE, "vancouver", "vancouver-standings.json")
OUT = os.path.join(HERE, "vancouver", "vancouver-decks.jsonl")
LOG = os.path.join(HERE, "vancouver", "_drip.log")

def log(m):
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(f"[{time.strftime('%H:%M:%S')}] {m}\n")

def parse_deck(html):
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find(id="decklist")
    if not table:
        return None
    main, side = [], []
    in_side = False
    for tr in table.find_all("tr"):
        cls = tr.get("class") or []
        sub = tr.find(class_="subheader")
        if sub and "card-list-item" not in cls:
            if "sideboard" in sub.get_text(strip=True).lower():
                in_side = True
            continue
        if "card-list-item" not in cls:
            continue
        a = tr.find("a")
        if not a:
            continue
        img = tr.get("data-image-src") or ""
        m = re.search(r"/([a-z0-9]+)-(\d+)-\d+_full", img, re.I)
        rid = (m.group(1).upper() + "-" + m.group(2)) if m else None
        card = {"name": a.get_text(strip=True), "quantity": int(tr.get("data-quantity") or 0),
                "type": tr.get("data-card-type"), "riftboundId": rid}
        (side if in_side else main).append(card)
    legend = champion = None
    for tr in table.select('tr.card-list-item[data-card-type="legend"]'):
        a = tr.find("a"); legend = a.get_text(strip=True) if a else None; break
    for tr in table.select('tr.card-list-item[data-card-type="champion"]'):
        a = tr.find("a"); champion = a.get_text(strip=True) if a else None; break
    title = soup.title.get_text() if soup.title else ""
    player = title.split(" by ", 1)[1].split(" | ")[0].strip() if " by " in title else ""
    return {"legend": legend, "champion": champion, "player": player, "main": main, "sideboard": side}

def main():
    raw = open(STANDINGS, encoding="utf-8").read()
    data = json.loads(json.loads(raw)) if raw.lstrip().startswith('"') else json.loads(raw)
    rows = data["rows"]
    done = set()
    if os.path.exists(OUT):
        for line in open(OUT, encoding="utf-8"):
            try: done.add(json.loads(line)["url"])
            except: pass
    todo = [r for r in rows if r["url"] not in done]
    log(f"START vancouver drip: {len(todo)} to fetch ({len(done)} done)")
    s = requests.Session(impersonate="chrome", headers=HEADERS)
    consec = 0; got = 0
    for r in todo:
        try:
            resp = s.get(r["url"], timeout=30)
            html = resp.text
            if 'id="decklist"' not in html or "Just a moment" in html:
                consec += 1
                log(f"BLOCK {consec} on {r['rank']} (status {resp.status_code})")
                if consec >= 12:
                    log("ABORT: cookie likely expired."); break
                time.sleep(30 if consec >= 4 else 8)
                todo.append(r); continue
            consec = 0
            d = parse_deck(html)
            rec = {"rank": r["rank"], "record": r.get("record"), "url": r["url"], "domains": r.get("domains"),
                   "player": d["player"] or r.get("playerFromList"), "legend": d["legend"] or r.get("legendFromList"),
                   "champion": d["champion"], "main": d["main"], "sideboard": d["sideboard"]}
            with open(OUT, "a", encoding="utf-8") as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            got += 1
            if got % 20 == 0: log(f"progress: {got} fetched")
        except Exception as e:
            log(f"ERR {r['rank']}: {e}"); time.sleep(5)
        time.sleep(random.uniform(2.5, 3.8))
    log(f"DONE vancouver drip: {got} decklists")

if __name__ == "__main__":
    main()
