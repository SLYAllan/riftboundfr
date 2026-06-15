# -*- coding: utf-8 -*-
"""Consolidate Vancouver final-standings JSONL -> per-deck JSON + index. Context = 'RQ Vancouver 2026'."""
import json, re, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(ROOT, 'data')
JSONL = os.path.join(DATA, 'raw-scrapes', 'vancouver', 'vancouver-decks.jsonl')

NAME = "RQ Vancouver 2026"          # == tournamentContext (merge with existing best-of decks)
SLUGPREFIX = "vancouver-fs"
DATE = "2026-05-30"
PLAYERS = 1833

LEG_FIX = {
    "Kai'sa, Daughter of the Void": "Kai'Sa, Daughter of the Void",
    "Khazix, Voidreaver": "Kha'Zix, Voidreaver",
    "Reksai, Void Burrower": "Rek'Sai, Void Burrower",
}
HG = {'а':'a','е':'e','о':'o','р':'p','с':'c','х':'x','у':'y','і':'i','ј':'j','ѕ':'s','ԁ':'d','һ':'h','ո':'n','г':'r','А':'A','Е':'E','О':'O','Р':'P','С':'C','Х':'X','У':'Y','Т':'T','М':'M','Н':'H','К':'K','В':'B','І':'I','Ѕ':'S'}
clean = lambda s: ''.join(HG.get(c, c) for c in s) if isinstance(s, str) else s
norm_legend = lambda l: LEG_FIX.get(l, l) if l else l
TYPE_CAP = {'unit':'Unit','gear':'Gear','spell':'Spell','champion':'Champion','legend':'Legend','runes':'Rune','battlefields':'Battlefield'}

def slugify_legend(l):
    return re.sub(r'[^a-z0-9]+', '-', l.lower().replace("'", "")).strip('-')
def pslug(p):
    return re.sub(r'[^a-z0-9]+', '-', (p or '').lower()).strip('-')
def rank_int(r):
    m = re.match(r'(\d+)', r or ''); return int(m.group(1)) if m else None
def cap_domains(ds): return [d.capitalize() for d in (ds or [])]
def deckid(u): m = re.search(r'-(\d+)$', u or ''); return m.group(1) if m else 'x'

def split_deck(main):
    md, runes, bf = [], {}, []
    for c in main:
        t = c['type']
        if t == 'legend': continue
        if t == 'runes':
            dom = c['name'].replace(' Rune','').strip().capitalize(); runes[dom] = runes.get(dom,0)+c['quantity']
        elif t == 'battlefields':
            bf.append(c['name'])
        else:
            md.append({'name':c['name'],'quantity':c['quantity'],'type':TYPE_CAP.get(t,t.capitalize()),'riftboundId':c.get('riftboundId')})
    return md, runes, bf

index_add = []
def main():
    rows = [json.loads(l) for l in open(JSONL, encoding='utf-8') if l.strip()]
    print('vancouver decks in jsonl:', len(rows))
    for d in rows:
        if not d.get('main') or not d.get('legend'): continue
        legend = norm_legend(d['legend']); placement = rank_int(d['rank'])
        md, runes, bf = split_deck(d['main'])
        side = [{'name':c['name'],'quantity':c['quantity'],'type':'Sideboard','riftboundId':c.get('riftboundId')} for c in d.get('sideboard',[])]
        slug = slugify_legend(legend)
        p = clean(d.get('player') or '') or deckid(d['url'])
        fid = f"{SLUGPREFIX}-{placement}-{pslug(p) or deckid(d['url'])}"
        rec = {'id':fid,'legend':legend,'champion':d.get('champion'),'player':clean(d.get('player')) or None,
               'tournament':NAME,'date':DATE,'placement':placement,'playerCount':PLAYERS,'set':'Unleashed',
               'archetype':None,'domains':cap_domains(d.get('domains')),'mainDeck':md,'runes':runes,
               'battlefields':bf,'sideDeck':side,'record':d.get('record'),'source':d['url'],'notes':''}
        ddir = os.path.join(DATA,'decklists',slug); os.makedirs(ddir, exist_ok=True)
        json.dump(rec, open(os.path.join(ddir, fid+'.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=2)
        index_add.append({'id':fid,'legend':legend,'player':rec['player'],'placement':placement,'file':f"{slug}/{fid}.json"})
    # index
    idx_path = os.path.join(DATA,'decklists-index.json')
    idx = json.load(open(idx_path, encoding='utf-8'))
    existing = {e['id'] for e in idx}; added = 0
    for e in index_add:
        if e['id'] not in existing: idx.append(e); existing.add(e['id']); added += 1
    json.dump(idx, open(idx_path,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'wrote {len(index_add)} deck files | index +{added} (total {len(idx)})')
    from collections import Counter
    c = Counter(norm_legend(d['legend']) for d in rows if d.get('legend'))
    print('top legends:', c.most_common(6))

if __name__ == '__main__':
    main()
