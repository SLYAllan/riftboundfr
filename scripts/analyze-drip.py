# -*- coding: utf-8 -*-
"""Sort les regles de deckbuilding par legende a partir d'un decks.jsonl de drip.

  python -X utf8 scripts/analyze-drip.py <dossier-scrape> [nb-decks-mini]

Pour chaque legende ayant assez de decks, affiche, au format de docs/DECKBUILDING-RULES.md :
champion, core (>=90% des listes), standard (60-89%), flex (30-59%), battlefields,
repartition des runes, meilleurs classements.
"""
import json, os, re, sys, collections


def qty_mode(counter):
    """Quantite la plus frequente pour une carte."""
    return counter.most_common(1)[0][0]


def placement(rank):
    m = re.match(r'(\d+)', rank or '')
    return int(m.group(1)) if m else None


def analyze(scrape_dir, minimum=15):
    decks = []
    with open(os.path.join(scrape_dir, 'decks.jsonl'), encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line:
                decks.append(json.loads(line))
    print(f"# {len(decks)} decklists lues\n")

    by_legend = collections.defaultdict(list)
    for d in decks:
        lg = d.get('legendPage') or d.get('legend')
        if lg:
            by_legend[lg].append(d)

    for legend, group in sorted(by_legend.items(), key=lambda x: -len(x[1])):
        n = len(group)
        if n < minimum:
            continue
        champs = collections.Counter(d.get('champion') for d in group if d.get('champion'))
        incl = collections.Counter()          # nb de decks contenant la carte
        qty = collections.defaultdict(collections.Counter)
        bf = collections.Counter()
        runes = collections.Counter()
        side = collections.Counter()
        for d in group:
            seen = set()
            for c in d.get('main', []):
                t, name = c.get('type'), c['name']
                if t in ('legend', 'champion'):
                    continue
                if t == 'battlefields':
                    bf[name] += 1
                elif t == 'runes':
                    runes[re.sub(r'\s*Rune$', '', name)] += c['quantity']
                else:
                    if name not in seen:
                        incl[name] += 1
                        seen.add(name)
                    qty[name][c['quantity']] += 1
            for c in d.get('sideboard', []):
                side[c['name']] += 1

        def fmt(names):
            out = []
            for name in names:
                pct = 100 * incl[name] / n
                out.append(f"{name} {qty_mode(qty[name])}x ({pct:.0f}%)")
            return " · ".join(out)

        ranked = sorted(incl, key=lambda k: -incl[k])
        core = [c for c in ranked if incl[c] / n >= 0.90]
        standard = [c for c in ranked if 0.60 <= incl[c] / n < 0.90]
        flex = [c for c in ranked if 0.30 <= incl[c] / n < 0.60]

        places = sorted([p for p in (placement(d.get('rank')) for d in group) if p])[:6]
        champ_line = ", ".join(f"{c} ({100*k/n:.0f}%)" for c, k in champs.most_common(2))
        total_runes = sum(runes.values()) or 1

        print(f"### {legend} ({n} decks)")
        print(f"Champion : {champ_line or 'aucun'}")
        print(f"**Core ({len(core)} cartes)** : {fmt(core)}")
        print(f"**Standard** : {fmt(standard)}")
        print(f"**Flex** : {fmt(flex)}")
        print("**Battlefields** : " + " · ".join(f"{b} ({100*k/n:.0f}%)" for b, k in bf.most_common(5)))
        print("**Runes** : " + " · ".join(f"{d} {100*k/total_runes:.0f}%" for d, k in runes.most_common(4)))
        print("**Side le plus vu** : " + " · ".join(f"{s} ({100*k/n:.0f}%)" for s, k in side.most_common(6)))
        print(f"**Meilleurs classements** : {places}")
        print()


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    analyze(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 15)
