# -*- coding: utf-8 -*-
"""
Garde-fou anti-fabrication. Vérifie chaque decklist de data/decklists/ contre sa
vérité terrain brute (data/raw-scrapes/). Détecte les decks dont les cartes ne
correspondent PAS à la source réelle (= fabriqués/approximés).

Règle projet : on n'invente JAMAIS de deck. Si la donnée n'est pas vérifiable,
on skip/supprime — on ne publie pas de données fausses ou incertaines.

Usage:  python -X utf8 scripts/validate-decklists.py
Exit 1 si au moins un MISMATCH (carte différente de la source) est trouvé.
"""
import re, glob, os, json, sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECKS = os.path.join(ROOT, 'data', 'decklists')
RAW   = os.path.join(ROOT, 'data', 'raw-scrapes')

# ── .md parser (gère les 2 formats : **N**[Nom] et tableau **N** | [Nom]) ──
CARD = re.compile(r'\*\*(\d+)\*\*\s*\|?\s*\[([^\]]+)\]')
SEC  = re.compile(r'group_(legend|champion|unit|gear|spell|battlefields|runes|sideboard)\.png')
PLAYER = re.compile(r'^#\s+(.*?)\s+by\s+(.*?)\s*$', re.M)

def parse_md(path):
    txt = open(path, encoding='utf-8').read()
    mh = PLAYER.search(txt)
    player = mh.group(2).strip() if mh else None
    sec = None; pool = {}; champs = set()
    for line in txt.splitlines():
        ms = SEC.search(line)
        if ms: sec = ms.group(1); continue
        mc = CARD.search(line)
        if not mc: continue
        nm = mc.group(2).strip()
        if sec == 'champion': champs.add(nm)
        if sec in ('unit', 'gear', 'spell'):
            pool[nm] = pool.get(nm, 0) + int(mc.group(1))
    return player, pool, champs

# ── JSON truth (changsha/vancouver/utrecht: par URL source) ──
def units(main): return sum(c['quantity'] for c in main if (c.get('type') or '').lower() in ('unit','gear','spell'))
jtruth = {}
def consider(url, main):
    if not url or main is None: return
    if url not in jtruth or units(main) > units(jtruth[url]): jtruth[url] = main
def walk(o):
    if isinstance(o, dict):
        if o.get('url') and 'main' in o: consider(o['url'], o['main'])
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
for d in ('changsha', 'vancouver', 'utrecht'):
    for f in glob.glob(os.path.join(RAW, d, '*.json')):
        try:
            obj = json.loads(open(f, encoding='utf-8').read())
            if isinstance(obj, str): obj = json.loads(obj)
            walk(obj)
        except Exception: pass
    for f in glob.glob(os.path.join(RAW, d, '*.jsonl')):
        for line in open(f, encoding='utf-8'):
            try:
                o = json.loads(line)
                if o.get('url'): consider(o['url'], o.get('main'))
            except Exception: pass
def jpool(main):
    skip = {'legend','champion','runes','battlefields'}
    pool = {}
    for c in main:
        if (c.get('type') or '').lower() in skip: continue
        pool[c['name']] = pool.get(c['name'], 0) + c['quantity']
    return pool

# index .md par stem (id) et par (dossier, joueur)
md_by_stem = {}
md_by_player = {}
for p in glob.glob(os.path.join(RAW, '**', '*.md'), recursive=True):
    stem = os.path.basename(p)[:-3]
    md_by_stem.setdefault(stem, p)
    try:
        pl, pool, champs = parse_md(p)
        if pl: md_by_player.setdefault((os.path.basename(os.path.dirname(p)), pl), (pool, champs))
    except Exception: pass

def fpool(o, drop_champ=True):
    champ = o.get('champion')
    pool = {}
    for c in o.get('mainDeck', []):
        if drop_champ and c['name'] == champ: continue
        pool[c['name']] = pool.get(c['name'], 0) + c['quantity']
    return pool

def diff_is_champion_only(a, b, champs):
    names = set(a) | set(b)
    diff = [n for n in names if a.get(n,0) != b.get(n,0)]
    return all(n in champs for n in diff), diff

verified = mismatch = unverifiable = 0
mism_list = []
for f in glob.glob(os.path.join(DECKS, '**', '*.json'), recursive=True):
    try: o = json.loads(open(f, encoding='utf-8').read())
    except Exception: continue
    idv = o.get('id', ''); src = o.get('source') or o.get('sourceUrl') or ''
    truth = None; champs = set()
    if idv in md_by_stem:
        _, truth, champs = parse_md(md_by_stem[idv])
    elif src and src in jtruth and units(jtruth[src]) == 39:
        truth = jpool(jtruth[src])
    if truth is None:
        unverifiable += 1
        continue
    fp = fpool(o, drop_champ=True)
    if fp == truth:
        verified += 1
    else:
        ok, diff = diff_is_champion_only(fp, truth, champs | {o.get('champion')})
        if ok:
            verified += 1  # simple bookkeeping du champion, cartes OK
        else:
            mismatch += 1
            mism_list.append((os.path.relpath(f, ROOT), o.get('player'), diff[:5]))

print(f"verified={verified}  MISMATCH(fabriqué?)={mismatch}  unverifiable(pas de source brute)={unverifiable}")
if mism_list:
    print("\n=== MISMATCH (cartes != source brute — à corriger ou supprimer) ===")
    for f, pl, diff in mism_list[:50]:
        sys.stdout.buffer.write(f"  {f}  player={pl}  diff={diff}\n".encode('utf-8','replace'))
sys.exit(1 if mismatch else 0)
