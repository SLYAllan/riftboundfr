# -*- coding: utf-8 -*-
"""Collecte puis drip des decklists d'un tournoi riftdecks.

  python -X utf8 drip_tournament.py <slug> <url> <nb-pages> [secondes-entre-requetes]

Deux phases reprenables :
  phase 1 -> {slug}/_index.json   (rang, url, legende, joueur, domaines, prix)
  phase 2 -> {slug}/decks.jsonl   (une decklist par ligne, ecriture incrementale)

Le cookie cf_clearance vit ~30-60 min et il est lie a l'IP. Quand il expire, le
script s'arrete apres 15 blocages d'affilee : rafraichir _cf_cookie.txt via le
navigateur puis relancer, il reprend ou il s'est arrete.
"""
import json, time, re, os, random, sys
from curl_cffi import requests
from bs4 import BeautifulSoup

HERE = os.path.dirname(os.path.abspath(__file__))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36")


COOKIE_FILE = os.path.join(HERE, '_cf_cookie.txt')

# Le cookie cf_clearance vit ~30 min. Passe ce delai, chaque requete est un 403,
# et c'est en insistant sur ces 403 qu'on fait bannir l'IP (vecu 5 fois).
# Donc : on ARRETE de demander avant l'expiration, et on attend un cookie frais.
COOKIE_MAX_AGE = 25 * 60


def cookie():
    return open(COOKIE_FILE, encoding='utf-8').read().strip()


def cookie_mtime():
    return os.path.getmtime(COOKIE_FILE)


def session(referer):
    return requests.Session(impersonate="chrome", headers={
        "User-Agent": UA, "Cookie": cookie(),
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8", "Referer": referer})


def blocked(r):
    return r.status_code != 200 or 'Just a moment' in r.text or 'Un instant' in r.text


def parse_deck(html):
    soup = BeautifulSoup(html, 'html.parser')
    table = soup.find(id='decklist')
    if not table:
        return None
    main, side, in_side = [], [], False
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
        img = tr.get('data-image-src') or ''
        m = re.search(r'/([a-z0-9]+)-(\d+)[a-z]?-\d+_', img, re.I)
        (side if in_side else main).append({
            'name': a.get_text(strip=True),
            'quantity': int(tr.get('data-quantity') or 0),
            'type': tr.get('data-card-type'),
            'riftboundId': (m.group(1).upper() + '-' + str(int(m.group(2)))) if m else None,
        })

    def first(t):
        tr = table.select_one(f'tr.card-list-item[data-card-type="{t}"]')
        a = tr.find('a') if tr else None
        return a.get_text(strip=True) if a else None

    return {'legend': first('legend'), 'champion': first('champion'),
            'main': main, 'sideboard': side}


class Run:
    def __init__(self, slug, url, pages, pace=3.1):
        # riftdecks coupe vers 450-500 requetes par demi-heure (mesure 2 fois le
        # 21/07). A 3,1s on tape le plafond en 26 min ; a 7s on reste dessous.
        self.url, self.pages, self.pace = url, pages, pace
        self.dir = os.path.join(HERE, slug)
        os.makedirs(self.dir, exist_ok=True)
        self.index = os.path.join(self.dir, '_index.json')
        self.out = os.path.join(self.dir, 'decks.jsonl')
        self.nolist = os.path.join(self.dir, '_no-decklist.txt')
        self.logfile = os.path.join(self.dir, '_drip.log')

    def wait_for_fresh_cookie(self, why):
        """Aucune requete tant que le cookie n'a pas ete remplace. C'est la seule
        garantie qu'on ne tapera jamais dans le vide : on prefere attendre une heure
        plutot que de perdre l'IP pour deux."""
        was = cookie_mtime()
        self.log(f"PAUSE ({why}) : plus aucune requete, en attente d'un cookie frais dans _cf_cookie.txt")
        while cookie_mtime() == was:
            time.sleep(20)
        self.log("cookie remplace, reprise")
        return session(self.url), cookie_mtime()

    def log(self, m):
        line = f"[{time.strftime('%H:%M:%S')}] {m}"
        with open(self.logfile, 'a', encoding='utf-8') as f:
            f.write(line + "\n")
        print(line, flush=True)

    def collect(self):
        if os.path.exists(self.index):
            rows = json.load(open(self.index, encoding='utf-8'))
            self.log(f"index deja present : {len(rows)} decks")
            return rows
        s = session(self.url)
        seen, rows = set(), []
        for p in range(1, self.pages + 1):
            u = self.url if p == 1 else f"{self.url}?page={p}"
            r = s.get(u, timeout=30)
            if blocked(r):
                self.log(f"BLOCK page {p} (status {r.status_code}) — arret phase 1")
                break
            soup = BeautifulSoup(r.text, 'html.parser')
            n = 0
            # Les lignes "deck-placeholder-row" n'ont pas de decklist publiee (N/A,
            # "Submit Deck") mais portent rang, bilan, legende et joueur : on les garde,
            # elles suffisent a reconstituer le metagame complet du tournoi.
            for tr in soup.select('tr[id^=desktop-deck]'):
                href = tr.get('data-href')
                key = href or tr.get('id')
                if key in seen:
                    continue
                seen.add(key)
                record = tr.select_one('td.deck-rank div.text-secondary')
                rank = tr.select_one('td.deck-rank strong')
                legend = tr.select_one('td.deck-legend-image span.avatar')
                player = tr.select_one('td.deck-name div.small')
                price = tr.select_one('td.text-center span.text-green')
                rows.append({
                    'url': href,
                    'record': record.get_text(strip=True) if record else None,
                    'rank': rank.get_text(strip=True) if rank else None,
                    'legend': legend.get('title') if legend else None,
                    'player': re.sub(r'^by\s+', '', player.get_text(strip=True)) if player else None,
                    'domains': [i.get('alt') for i in tr.select('span.deck-domains img') if i.get('alt')],
                    'price': price.get_text(strip=True) if price else None,
                })
                n += 1
            self.log(f"page {p}/{self.pages} : +{n} (total {len(rows)})")
            time.sleep(random.uniform(2.0, 3.0))
        json.dump(rows, open(self.index, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        self.log(f"index ecrit : {len(rows)} decks")
        return rows

    def drip(self, rows):
        done = set()
        if os.path.exists(self.out):
            for line in open(self.out, encoding='utf-8'):
                try:
                    done.add(json.loads(line)['url'])
                except Exception:
                    pass
        skip = set()
        if os.path.exists(self.nolist):
            skip = {l.strip() for l in open(self.nolist, encoding='utf-8') if l.strip()}
        # les lignes sans decklist publiee n'ont rien a telecharger
        todo = [r for r in rows if r['url'] and r['url'] not in done and r['url'] not in skip]
        self.log(f"START drip : {len(todo)} a recuperer ({len(done)} faits, {len(skip)} sans liste)")
        s = session(self.url)
        mtime = cookie_mtime()
        got = i = 0
        while i < len(todo):
            m = todo[i]
            i += 1
            try:
                # cookie rafraichi a la main dans le navigateur ? on le reprend aussitot
                if cookie_mtime() != mtime:
                    mtime = cookie_mtime()
                    s = session(self.url)
                    self.log("cookie rafraichi, session rouverte")
                # trop vieux : on s'arrete AVANT de taper dans le vide
                if time.time() - cookie_mtime() > COOKIE_MAX_AGE:
                    s, mtime = self.wait_for_fresh_cookie("cookie vieux de plus de 25 min")
                r = s.get(m['url'], timeout=30)
                if blocked(r):
                    # UN seul refus suffit : on ne retente pas, on attend un cookie neuf.
                    # Insister sur des 403 est exactement ce qui fait bannir l'IP.
                    self.log(f"REFUS sur {m['rank']} (status {r.status_code})")
                    todo.append(m)
                    s, mtime = self.wait_for_fresh_cookie("refuse par Cloudflare")
                    continue
                d = parse_deck(r.text)
                if d is None:
                    with open(self.nolist, 'a', encoding='utf-8') as f:
                        f.write(m['url'] + "\n")
                else:
                    rec = dict(m)
                    rec.update({'legendPage': d['legend'], 'champion': d['champion'],
                                'main': d['main'], 'sideboard': d['sideboard']})
                    with open(self.out, 'a', encoding='utf-8') as f:
                        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
                    got += 1
                    if got % 25 == 0:
                        self.log(f"progression : {got} recuperes, {len(todo) - i} restants")
            except Exception as e:
                self.log(f"ERR {m['rank']} : {e}")
                time.sleep(5)
            time.sleep(random.uniform(self.pace * 0.85, self.pace * 1.15))
        self.log(f"FIN drip : {got} nouvelles decklists")


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print(__doc__)
        sys.exit(2)
    run = Run(sys.argv[1], sys.argv[2], int(sys.argv[3]),
              pace=float(sys.argv[4]) if len(sys.argv) > 4 else 3.1)
    run.drip(run.collect())
