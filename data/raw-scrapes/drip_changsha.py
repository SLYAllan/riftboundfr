# -*- coding: utf-8 -*-
"""Slow-drip recovery of remaining Changsha decklists via curl_cffi (Scrapeur engine) + cf_clearance cookie.
Stays under Cloudflare rate-limit. Writes incrementally (JSONL) so progress survives interruptions."""
import json, time, re, sys, os, random
from curl_cffi import requests
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
COOKIE = "PHPSESSID=t0omeng689dcis7okjto4f4oak; cf_clearance=P3tbq0ehrpt1HmKN4Dr730lbqTtknU1rX5eH8Rkpb9M-1781521846-1.2.1.1-VwefyqLtuHuiAkf2T0u0enP0fg7SMm6m7l6xTg9iAkiMnYXgy_h3Cfb.sj9GJAzyTd7qcFjk2PHhFZxFUBvN72IlNlbc5XDN8szwQRFIAzjCwGQDC.z58jqS.vveGKJ__wXyvSNfBsKBjF2CXaKyDgazh.QhEsPqFd6FwwNMm4Yz93E9CkiidhlA3Jwpaay9pcr31HFPbxkLDtiHlLURtPhYRvQytPwo5AfOrnmC60IDE_PS4D8z7ag.drlD7eChhWtEnqayYBkEtjerqW37zP9Iij.yWpM6CrIntPp.8E_cmLFgElZNgWSM8Pst0Ky7lbsloZSbgMl1NQ2ys17X9nB5jC.heBOJJOyg4rVv2I7eTVxqWMbqlAtAQIr3fEnP8.4M.Jmf8WkgGTC1hr34Ntv.LkDLxVcK6blpMrRj7Pk"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36"
HEADERS = {"User-Agent": UA, "Cookie": COOKIE, "Accept": "text/html,application/xhtml+xml",
           "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
           "Referer": "https://riftdecks.com/riftbound-tournaments/s3-changsha-regional-open-tournament-decks-12102"}

OUT = os.path.join(HERE, 'changsha', 'changsha-rec-drip.jsonl')
LOG = os.path.join(HERE, 'changsha', '_drip.log')

def log(m):
    with open(LOG, 'a', encoding='utf-8') as f:
        f.write(f"[{time.strftime('%H:%M:%S')}] {m}\n")

def parse_deck(html):
    soup = BeautifulSoup(html, 'html.parser')
    table = soup.find(id='decklist')
    if not table:
        return None
    main, side = [], []
    in_side = False
    for tr in table.find_all('tr'):
        cls = tr.get('class') or []
        sub = tr.find(class_='subheader')
        if sub and 'card-list-item' not in cls:
            if 'sideboard' in sub.get_text(strip=True).lower():
                in_side = True
            continue
        if 'card-list-item' not in cls:
            continue
        a = tr.find('a')
        if not a:
            continue
        name = a.get_text(strip=True)
        img = tr.get('data-image-src') or ''
        m = re.search(r'/([a-z0-9]+)-(\d+)-\d+_full', img, re.I)
        rid = (m.group(1).upper() + '-' + m.group(2)) if m else None
        card = {'name': name, 'quantity': int(tr.get('data-quantity') or 0),
                'type': tr.get('data-card-type'), 'riftboundId': rid}
        (side if in_side else main).append(card)
    legend = None; champion = None
    for tr in table.select('tr.card-list-item[data-card-type="legend"]'):
        a = tr.find('a');  legend = a.get_text(strip=True) if a else None; break
    for tr in table.select('tr.card-list-item[data-card-type="champion"]'):
        a = tr.find('a');  champion = a.get_text(strip=True) if a else None; break
    title = (soup.title.get_text() if soup.title else '')
    player = ''
    if ' by ' in title:
        player = title.split(' by ', 1)[1].split(' | ')[0].strip()
    return {'legend': legend, 'champion': champion, 'player': player, 'main': main, 'sideboard': side}

def main():
    missing = json.load(open(os.path.join(HERE, 'changsha', '_missing.json'), encoding='utf-8'))
    # resume: skip urls already in OUT
    done = set()
    if os.path.exists(OUT):
        for line in open(OUT, encoding='utf-8'):
            try: done.add(json.loads(line)['url'])
            except: pass
    todo = [m for m in missing if m['url'] not in done]
    log(f"START drip: {len(todo)} to fetch ({len(done)} already done)")
    s = requests.Session(impersonate="chrome", headers=HEADERS)
    consec_block = 0
    got = 0
    for i, m in enumerate(todo):
        try:
            r = s.get(m['url'], timeout=30)
            html = r.text
            if 'id="decklist"' not in html or 'Just a moment' in html:
                consec_block += 1
                log(f"BLOCK {consec_block} on {m['rank']} (status {r.status_code})")
                if consec_block >= 15:
                    log("ABORT: 15 consecutive blocks (cookie likely expired / hard rate-limit). Stopping.")
                    break
                if consec_block >= 5:
                    wait = min(120, 30 * consec_block)
                    log(f"backoff {wait}s")
                    time.sleep(wait)
                else:
                    time.sleep(8)
                # re-queue for a later retry
                todo.append(m)
                continue
            consec_block = 0
            d = parse_deck(html)
            rec = {'rank': m['rank'], 'url': m['url'], 'domains': m['domains'], 'price': m.get('price'),
                   'player': d['player'], 'legend': d['legend'], 'champion': d['champion'],
                   'main': d['main'], 'sideboard': d['sideboard']}
            with open(OUT, 'a', encoding='utf-8') as f:
                f.write(json.dumps(rec, ensure_ascii=False) + '\n')
            got += 1
            if got % 25 == 0:
                log(f"progress: {got} fetched, {len(todo)-i-1} remaining-ish")
        except Exception as e:
            log(f"ERR {m['rank']}: {e}")
            time.sleep(5)
        # human-like jittered pace
        time.sleep(random.uniform(3.0, 4.5))
    log(f"DONE drip: {got} new decklists")

if __name__ == '__main__':
    main()
