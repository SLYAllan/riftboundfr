# -*- coding: utf-8 -*-
"""Convertit un decks.jsonl produit par data/raw-scrapes/drip_*.py en fiches
data/decklists/{legende-slug}/*.json, au format reel du depot (runes = objet
{Domaine: n}, sideDeck, record/source/notes).

Usage :
  python -X utf8 scripts/convert-drip.py <dossier-scrape> <cle-contexte> <date> <playerCount> <set> <prefixe-id>

Exemple :
  python -X utf8 scripts/convert-drip.py data/raw-scrapes/s3-national \
      "S3 National Open (2026-07-19)" 2026-07-19 2048 Unleashed s3-national
"""
import json, os, re, sys, unicodedata
from collections import defaultdict

# riftdecks masque les pseudos avec des homoglyphes cyrilliques (anti-copie)
HOMOGLYPHS = str.maketrans({
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x', 'у': 'y',
    'і': 'i', 'ѕ': 's', 'ј': 'j', 'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K',
    'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X',
})

DOMAIN_FR = {'calm', 'order', 'fury', 'body', 'chaos', 'mind', 'colorless'}

# riftdecks n'ecrit pas les legendes comme nous : on ramene au nom canonique du depot
CANON = {
    "Jax, Grandmaster at Arms": "Jax, Grandmaster At Arms",
    "Kai'sa, Daughter of the Void": "Kai'Sa, Daughter of the Void",
    "Khazix, Voidreaver": "Kha'Zix, Voidreaver",
    "Leblanc, Deceiver": "LeBlanc, Deceiver",
    "Reksai, Void Burrower": "Rek'Sai, Void Burrower",
    "Rek'sai, Void Burrower": "Rek'Sai, Void Burrower",
}

# Toute legende ecrite doit figurer ici. Un nom absent = soit une vraie nouvelle
# legende, soit un champion pris pour une legende : on refuse d'ecrire et on signale.
KNOWN = {
    "Kai'Sa, Daughter of the Void", "Master Yi, Wuju Bladesman", "Master Yi, Wuju Master",
    "Draven, Glorious Executioner", "Viktor, Herald of the Arcane", "Irelia, Blade Dancer",
    "Fiora, Grand Duelist", "Miss Fortune, Bounty Hunter", "Sett, The Boss",
    "Teemo, Swift Scout", "Ahri, Nine-Tailed Fox", "Annie, Dark Child",
    "Azir, Emperor of the Sands", "Ezreal, Prodigal Explorer", "LeBlanc, Deceiver",
    "Diana, Scorn of the Moon", "Sivir, Battle Mistress", "Yasuo, Unforgiven",
    "Darius, Hand of Noxus", "Ornn, Fire Below the Mountain", "Lillia, Bashful Bloom",
    "Jinx, Loose Cannon", "Vex, Gloomist", "Leona, Radiant Dawn",
    "Lux, Lady of Luminosity", "Lee Sin, Blind Monk", "Volibear, Relentless Storm",
    "Lucian, Purifier", "Jax, Grandmaster At Arms", "Rumble, Mechanized Menace",
    "Kha'Zix, Voidreaver", "Rengar, Pridestalker", "Rek'Sai, Void Burrower",
    "Pyke, Bloodharbor Ripper", "Garen, Might of Demacia", "Renata Glasc, Chem-Baroness",
    "Jhin, Virtuoso", "Vi, Piltover Enforcer", "Ivern, Green Father",
    "Poppy, Keeper of the Hammer",
}


def slug(s, maxlen=60):
    s = unicodedata.normalize('NFKD', s or '')
    s = ''.join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[''`]", '', s.lower())
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s[:maxlen].strip('-')


def placement(rank):
    m = re.match(r'(\d+)', rank or '')
    return int(m.group(1)) if m else None


def convert(scrape_dir, context, date, player_count, card_set, prefix,
            location='', organizer='', source_url=''):
    src = os.path.join(scrape_dir, 'decks.jsonl')
    out_root = os.path.join('data', 'decklists')
    written, skipped, per_legend = 0, 0, defaultdict(int)
    seen_ids, rejected, written_decks, seen_urls, empty = set(), [], [], set(), []

    for line in open(src, encoding='utf-8'):
        line = line.strip()
        if not line:
            continue
        r = json.loads(line)
        # le drip et Firecrawl écrivent dans le même fichier : on ne garde qu'une
        # seule ligne par deck, sinon on écrirait deux fiches pour la même liste
        if r.get('url') in seen_urls:
            continue
        seen_urls.add(r.get('url'))
        # legende : celle lue DANS la decklist prime sur celle de la ligne du tableau,
        # qui affiche parfois le champion (ex. "Volibear, Furious")
        legend = r.get('legendPage') or r.get('legend')
        legend = CANON.get(legend, legend)
        if not legend or legend not in KNOWN:
            rejected.append((legend, r.get('url')))
            skipped += 1
            continue

        main, runes, battlefields, side = [], {}, [], []
        for c in r.get('main', []):
            t = c.get('type')
            if t in ('legend', 'champion'):
                continue
            if t == 'runes':
                dom = re.sub(r'\s*Rune$', '', c['name'])
                runes[dom] = runes.get(dom, 0) + c['quantity']
            elif t == 'battlefields':
                battlefields.extend([c['name']] * max(1, c['quantity']))
            else:
                main.append({'name': c['name'], 'quantity': c['quantity'],
                             'type': (t or 'unknown').capitalize(),
                             'riftboundId': c.get('riftboundId')})
        for c in r.get('sideboard', []):
            side.append({'name': c['name'], 'quantity': c['quantity'],
                         'riftboundId': c.get('riftboundId')})

        player = (r.get('player') or '').translate(HOMOGLYPHS).strip()
        place = placement(r.get('rank'))
        pslug = slug(player, 30)
        base = f"{prefix}-{place if place else 'unranked'}-{pslug}".rstrip('-')
        deck_id = base
        n = 2
        while deck_id in seen_ids:
            deck_id = f"{base}-{n}"
            n += 1
        seen_ids.add(deck_id)

        doms = [d.capitalize() for d in r.get('domains', []) if d in DOMAIN_FR and d != 'colorless']

        deck = {
            'id': deck_id,
            'legend': legend,
            'champion': r.get('champion'),
            'player': player or None,
            'tournament': context,
            'date': date,
            'placement': place,
            'playerCount': player_count,
            'set': card_set,
            'archetype': None,
            'domains': doms,
            'mainDeck': main,
            'runes': runes,
            'battlefields': battlefields,
            'sideDeck': side,
            'record': r.get('record') or None,
            'source': r.get('url'),
            'notes': None,
        }
        # Certaines pages riftdecks ne contiennent que la ligne de légende, sans une
        # seule carte. On n'écrit pas de deck vide : mieux vaut un deck manquant.
        if not main:
            empty.append((legend, r.get('url')))
            skipped += 1
            continue

        folder = os.path.join(out_root, slug(legend))
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, deck_id + '.json'), 'w', encoding='utf-8') as f:
            json.dump(deck, f, ensure_ascii=False, indent=2)
        written += 1
        per_legend[legend] += 1
        written_decks.append(deck)

    # fiche tournoi (etape 3 de AGENT-INSTRUCTIONS.md)
    tdir = os.path.join('data', 'tournaments')
    os.makedirs(tdir, exist_ok=True)
    tops = sorted((d for d in written_decks if d['placement']), key=lambda d: d['placement'])[:8]
    summary = {
        'name': context.split(' (')[0],
        'slug': prefix,
        'date': date,
        'location': location,
        'playerCount': player_count,
        'format': 'Constructed',
        'set': card_set,
        'organizer': organizer,
        'decklistsPublished': written,
        'sourceUrl': source_url,
        'topPlacements': [{'rank': d['placement'], 'player': d['player'],
                           'legend': d['legend'], 'domains': d['domains']} for d in tops],
        'legendBreakdown': [{'legend': lg, 'count': n, 'pct': round(100 * n / max(written, 1), 1)}
                            for lg, n in sorted(per_legend.items(), key=lambda x: -x[1])],
    }
    with open(os.path.join(tdir, prefix + '.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"ecrits : {written} | refuses : {skipped} (dont {len(empty)} pages sans aucune carte)")
    for lg, n in sorted(per_legend.items(), key=lambda x: -x[1]):
        print(f"  {n:5d}  {lg}")
    if rejected:
        print("\nREFUSES (legende inconnue — a regarder a la main) :")
        for lg, url in rejected[:20]:
            print(f"  {lg!r}  {url}")
        if len(rejected) > 20:
            print(f"  ... et {len(rejected) - 20} autres")
    return written, per_legend


if __name__ == '__main__':
    if len(sys.argv) < 7:
        print(__doc__)
        sys.exit(2)
    a = sys.argv
    convert(a[1], a[2], a[3], int(a[4]), a[5], a[6],
            location=a[7] if len(a) > 7 else '',
            organizer=a[8] if len(a) > 8 else '',
            source_url=a[9] if len(a) > 9 else '')
