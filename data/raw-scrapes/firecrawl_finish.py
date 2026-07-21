# -*- coding: utf-8 -*-
"""Termine un tournoi via Firecrawl quand notre IP est bannie par Cloudflare.

  python -X utf8 firecrawl_finish.py <slug> [nb-max]

Firecrawl scrape depuis ses propres serveurs : l'IP bannie ne le gêne pas. On lui
demande le HTML brut, que le parseur de drip_tournament.py lit tel quel.

⚠️ Chaque page coûte 1 crédit Firecrawl. Le paramètre <nb-max> borne la dépense ;
sans lui, le script s'arrête de toute façon dès qu'une réponse est vide.

Écrit dans le MÊME decks.jsonl que le drip, donc les deux méthodes se complètent
et la conversion (scripts/convert-drip.py) ne change pas.
"""
import json, os, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from drip_tournament import parse_deck  # noqa: E402


def run(slug, limit):
    d = os.path.join(HERE, slug)
    index = json.load(open(os.path.join(d, '_index.json'), encoding='utf-8'))
    out = os.path.join(d, 'decks.jsonl')
    log = os.path.join(d, '_firecrawl.log')

    done = set()
    if os.path.exists(out):
        for line in open(out, encoding='utf-8'):
            try:
                done.add(json.loads(line)['url'])
            except Exception:
                pass
    todo = [r for r in index if r.get('url') and r['url'] not in done][:limit]

    def say(m):
        line = f"[{time.strftime('%H:%M:%S')}] {m}"
        print(line, flush=True)
        with open(log, 'a', encoding='utf-8') as f:
            f.write(line + "\n")

    say(f"START firecrawl : {len(todo)} pages (deja faites : {len(done)})")
    got = vides = 0
    tmp = os.path.join(tempfile.gettempdir(), f'fc-{slug}.html')
    for i, m in enumerate(todo, 1):
        try:
            subprocess.run(['firecrawl', 'scrape', m['url'], '--format', 'rawHtml', '-o', tmp],
                           capture_output=True, timeout=120, shell=True)
            html = open(tmp, encoding='utf-8').read() if os.path.exists(tmp) else ''
            if os.path.exists(tmp):
                os.remove(tmp)
            deck = parse_deck(html) if html else None
            if deck is None:
                vides += 1
                say(f"vide sur {m['rank']} ({vides} d'affilee)")
                if vides >= 5:
                    say("ARRET : 5 pages vides d'affilee, credits epuises ou blocage.")
                    break
                continue
            vides = 0
            rec = dict(m)
            rec.update({'legendPage': deck['legend'], 'champion': deck['champion'],
                        'main': deck['main'], 'sideboard': deck['sideboard']})
            with open(out, 'a', encoding='utf-8') as f:
                f.write(json.dumps(rec, ensure_ascii=False) + "\n")
            got += 1
            if got % 25 == 0:
                say(f"progression : {got} recuperes, {len(todo) - i} restants")
        except Exception as e:
            say(f"ERR {m['rank']} : {e}")
    say(f"FIN firecrawl : {got} decklists, {got} credits depenses")


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    run(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 10 ** 6)
