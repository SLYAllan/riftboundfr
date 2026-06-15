# -*- coding: utf-8 -*-
"""Consolidate scraped Changsha Regional Open + Utrecht RQ into repo structure."""
import json, glob, re, os, io, sys, datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DATA = os.path.join(ROOT, 'data')

def load(p):
    raw = open(p, encoding='utf-8').read()
    return json.loads(json.loads(raw)) if raw.lstrip().startswith('"') else json.loads(raw)

# legend name normalization (apostrophe casing per site convention)
LEG_FIX = {
    "Kai'sa, Daughter of the Void": "Kai'Sa, Daughter of the Void",
    "Khazix, Voidreaver": "Kha'Zix, Voidreaver",
    "Reksai, Void Burrower": "Rek'Sai, Void Burrower",
}
def norm_legend(l):
    if not l: return l
    return LEG_FIX.get(l, l)

def slugify_legend(l):
    s = l.lower().replace("'", "")
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def player_slug(p):
    if not p: return ''
    s = p.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

def rank_to_int(r):
    m = re.match(r'(\d+)', r or '')
    return int(m.group(1)) if m else None

TYPE_CAP = {'unit':'Unit','gear':'Gear','spell':'Spell','champion':'Champion','legend':'Legend','runes':'Rune','battlefields':'Battlefield'}

def split_deck(main):
    """main: list of {name,quantity,type,riftboundId} -> (mainDeck, runes, battlefields)"""
    mainDeck, runes, battlefields = [], {}, []
    for c in main:
        t = c['type']
        if t == 'legend':
            continue
        if t == 'runes':
            dom = c['name'].replace(' Rune','').strip().capitalize()
            runes[dom] = runes.get(dom,0) + c['quantity']
        elif t == 'battlefields':
            battlefields += [c['name']] * 1  # names; qty usually 1
        else:
            mainDeck.append({
                'name': c['name'],
                'quantity': c['quantity'],
                'type': TYPE_CAP.get(t, t.capitalize()),
                'riftboundId': c.get('riftboundId'),
            })
    return mainDeck, runes, battlefields

def cap_domains(doms):
    return [d.capitalize() for d in (doms or [])]

def deck_id_from_url(u):
    m = re.search(r'-(\d+)$', u or '')
    return m.group(1) if m else 'x'

index_add = []

def write_deck(d, tournament_name, tourney_slug, date, player_count, set_name):
    legend = norm_legend(d.get('legend'))
    if not legend or not d.get('main'):
        return None
    placement = rank_to_int(d['rank'])
    mainDeck, runes, battlefields = split_deck(d['main'])
    side = []
    for c in d.get('sideboard', []):
        side.append({'name': c['name'], 'quantity': c['quantity'], 'type': 'Sideboard', 'riftboundId': c.get('riftboundId')})
    slug = slugify_legend(legend)
    pslug = player_slug(d.get('player')) or deck_id_from_url(d['url'])
    fid = f"{tourney_slug}-{placement}-{pslug}"
    rec = {
        'id': fid,
        'legend': legend,
        'champion': d.get('champion'),
        'player': d.get('player') or None,
        'tournament': tournament_name,
        'date': date,
        'placement': placement,
        'playerCount': player_count,
        'set': set_name,
        'archetype': None,
        'domains': cap_domains(d.get('domains')),
        'mainDeck': mainDeck,
        'runes': runes,
        'battlefields': battlefields,
        'sideDeck': side,
        'record': d.get('record'),
        'source': d['url'],
        'notes': '',
    }
    ddir = os.path.join(DATA, 'decklists', slug)
    os.makedirs(ddir, exist_ok=True)
    with open(os.path.join(ddir, fid + '.json'), 'w', encoding='utf-8') as f:
        json.dump(rec, f, ensure_ascii=False, indent=2)
    index_add.append({'id': fid, 'legend': legend, 'player': d.get('player') or None,
                      'placement': placement, 'file': f"{slug}/{fid}.json"})
    return rec

# ---------- CHANGSHA ----------
good = {}
for p in glob.glob(os.path.join(DATA,'raw-scrapes','changsha','changsha-decks-*.json')) + \
         glob.glob(os.path.join(DATA,'raw-scrapes','changsha','changsha-fix-*.json')) + \
         glob.glob(os.path.join(DATA,'raw-scrapes','changsha','changsha-rec-*.json')):
    for x in load(p)['decks']:
        if x.get('main') and x.get('legend'):
            good[x['url']] = x
# slow-drip JSONL (one deck object per line)
drip = os.path.join(DATA,'raw-scrapes','changsha','changsha-rec-drip.jsonl')
if os.path.exists(drip):
    for line in open(drip, encoding='utf-8'):
        line = line.strip()
        if not line: continue
        try: x = json.loads(line)
        except: continue
        if x.get('main') and x.get('legend'):
            good[x['url']] = x
print('Changsha good decklists:', len(good))

CH_NAME = 'S3 Changsha Regional Open'
CH_SLUG = 'changsha-ro'
CH_DATE = '2026-06-14'
CH_PLAYERS = 640
for d in good.values():
    write_deck(d, CH_NAME, CH_SLUG, CH_DATE, CH_PLAYERS, 'Unleashed')

# standings (all 638) for full-field domain breakdown + top placements
st = load(os.path.join(DATA,'raw-scrapes','changsha','changsha-standings.json'))['rows']
from collections import Counter
dom_counter = Counter()
for r in st:
    key = '/'.join(sorted(set(cap_domains(r.get('domains'))))) or 'Unknown'
    dom_counter[key] += 1
# legend breakdown from parsed sample
leg_counter = Counter(norm_legend(d['legend']) for d in good.values())
parsed_total = sum(leg_counter.values())
legendBreakdown = [{'legend': l, 'count': n, 'pct': round(100*n/parsed_total)} for l,n in leg_counter.most_common()]
# top placements (use parsed decks we have legend for, by placement)
url_to_parsed = {u: norm_legend(d['legend']) for u,d in good.items()}
top_placements = []
for r in st:
    ri = rank_to_int(r['rank'])
    if ri and ri <= 16:
        leg = url_to_parsed.get(r['url'])
        top_placements.append({'rank': ri, 'legend': leg, 'domains': cap_domains(r.get('domains'))})
top_placements.sort(key=lambda x: x['rank'])

changsha_tj = {
    'name': f'{CH_NAME} (2026-06-14)',
    'slug': 's3-changsha-regional-open-12102',
    'date': CH_DATE,
    'location': 'Changsha, China',
    'playerCount': CH_PLAYERS,
    'format': 'Constructed',
    'set': 'Unleashed',
    'organizer': '官方赛事',
    'decklistsPublished': len(st),
    'decklistsParsed': len(good),
    'sourceUrl': 'https://riftdecks.com/riftbound-tournaments/s3-changsha-regional-open-tournament-decks-12102',
    'topPlacements': top_placements,
    'legendBreakdown': legendBreakdown,
    'legendBreakdownCoverage': f'{len(good)} of {len(st)} decklists parsed (rank-biased toward top finishers; rate-limited on lower tables)',
    'domainBreakdown': [{'domains': k, 'count': v, 'pct': round(100*v/len(st))} for k,v in dom_counter.most_common()],
}
with open(os.path.join(DATA,'tournaments','s3-changsha-regional-open-12102.json'),'w',encoding='utf-8') as f:
    json.dump(changsha_tj, f, ensure_ascii=False, indent=2)
print('Wrote Changsha tournament JSON. Top legends:', [ (l['legend'], l['count']) for l in legendBreakdown[:6]])

# ---------- UTRECHT ----------
ut = load(os.path.join(DATA,'raw-scrapes','utrecht','utrecht-top16.json'))
UT_NAME = 'Riftbound Regional Qualifier - RQ Utrecht'
UT_SLUG = 'utrecht-rq'
UT_DATE = '2026-06-13'
UT_PLAYERS = 1953
ut_top = []
for d in ut['decks']:
    if d.get('main'):
        write_deck(d, UT_NAME, UT_SLUG, UT_DATE, UT_PLAYERS, 'Unleashed')
    ut_top.append({'rank': rank_to_int(d['rank']), 'record': d.get('record'),
                   'player': d.get('player'), 'legend': norm_legend(d.get('legend')),
                   'domains': cap_domains(d.get('domains'))})
ut_top.sort(key=lambda x: x['rank'])
ut_leg = Counter(x['legend'] for x in ut_top if x['legend'])
utrecht_tj = {
    'name': f'{UT_NAME} (2026-06-13)',
    'slug': 'riftbound-rq-utrecht-12057',
    'date': UT_DATE,
    'location': 'Utrecht, Netherlands',
    'playerCount': UT_PLAYERS,
    'format': 'Constructed',
    'set': 'Unleashed',
    'organizer': 'UVS Games Organized Play',
    'decklistsPublished': 1810,
    'decklistsParsed': sum(1 for d in ut['decks'] if d.get('main')),
    'sourceUrl': 'https://riftdecks.com/riftbound-tournaments/riftbound-regional-qualifier-rq-utrecht-tournament-decks-12057',
    'note': 'Swiss standings (records). Top 8 single-elim playoff results to be confirmed from the official VOD.',
    'topPlacements': ut_top,
    'legendBreakdownTop16': [{'legend': l, 'count': n} for l,n in ut_leg.most_common()],
}
with open(os.path.join(DATA,'tournaments','riftbound-rq-utrecht-12057.json'),'w',encoding='utf-8') as f:
    json.dump(utrecht_tj, f, ensure_ascii=False, indent=2)
print('Wrote Utrecht tournament JSON. Swiss top 8:')
for x in ut_top[:8]:
    print('  ', x['rank'], x['record'], x['legend'], '—', x['player'])

# ---------- INDEX ----------
idx_path = os.path.join(DATA,'decklists-index.json')
idx = json.load(open(idx_path, encoding='utf-8'))
existing_ids = {e['id'] for e in idx}
added = 0
for e in index_add:
    if e['id'] not in existing_ids:
        idx.append(e); existing_ids.add(e['id']); added += 1
json.dump(idx, open(idx_path,'w',encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'Index: +{added} entries (total {len(idx)})')
print('New decklist files written:', len(index_add))
