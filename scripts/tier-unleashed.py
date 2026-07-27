# -*- coding: utf-8 -*-
"""Recalcule la tier list Unleashed sur toutes les decklists du depot.

  python -X utf8 scripts/tier-unleashed.py [set]

Parcourt data/decklists/, garde les decks du set demande (Unleashed par defaut),
et sort par legende : nombre de decks, part du field, Top 8, victoires, et la
conversion en Top 8 rapportee a la moyenne. Les tiers proposes sont un point de
depart chiffre, pas un verdict : c'est a relire a la main.
"""
import json, os, sys, collections

ROOT = os.path.join('data', 'decklists')


def load_index(path, tournament, canon):
    """Un classement de tournoi (rang + legende) suffit pour les tiers : le contenu
    des decks ne change pas un tier. Sert quand les decklists ne sont pas encore
    toutes recuperees."""
    import re
    out, dropped = [], []
    for r in json.load(open(path, encoding='utf-8')):
        lg = canon.get(r.get('legend'), r.get('legend'))
        # la colonne du tableau affiche parfois le champion : on ne devine pas,
        # ces decks reviendront avec leur vraie legende quand on aura leur liste
        if not lg or lg not in KNOWN:
            dropped.append((lg, r.get('url')))
            continue
        m = re.match(r'(\d+)', r.get('rank') or '')
        out.append({'legend': lg, 'placement': int(m.group(1)) if m else None,
                    'tournament': tournament, 'set': 'Unleashed'})
    if dropped:
        print(f"# {len(dropped)} lignes ecartees (legende illisible dans le tableau) :")
        for lg, url in dropped:
            print(f"#   {lg!r} {url}")
    return out


def load(card_set, skip_tournaments=frozenset()):
    decks, bad = [], []
    for folder in os.listdir(ROOT):
        d = os.path.join(ROOT, folder)
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            if not fn.endswith('.json'):
                continue
            try:
                with open(os.path.join(d, fn), encoding='utf-8') as f:
                    deck = json.load(f)
            except Exception:
                continue
            # "Global" = toutes les ères confondues (pour la tier list globale)
            if card_set != 'Global' and deck.get('set') != card_set:
                continue
            if not deck.get('legend'):
                continue
            if deck.get('tournament') in skip_tournaments:
                continue
            deck['legend'] = CANON.get(deck['legend'], deck['legend'])
            # quelques vieux fichiers ont un CHAMPION stocké comme légende
            # ("Viktor, Leader", "Volibear, Furious"...) : on les écarte et on les
            # signale, ils fausseraient les comptes sans qu'on s'en aperçoive
            if deck['legend'] not in KNOWN:
                bad.append((deck['legend'], deck.get('id') or fn))
                continue
            decks.append(deck)
    if bad:
        print(f"# {len(bad)} decks ecartes : légende inconnue (champion pris pour une légende)")
        for lg, who in bad[:12]:
            print(f"#   {lg!r} -> {who}")
    return decks


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

# Tournois dont on possede le CLASSEMENT COMPLET mais pas toutes les decklists.
# Pour un tier, le rang et la legende suffisent : le contenu du deck ne change rien.
# On retire du parcours local les decks deja convertis de ces tournois, sinon ils
# compteraient deux fois.
FULL_STANDINGS = [
    ("S3 National Open (2026-07-19)", os.path.join('data', 'raw-scrapes', 's3-national', '_index.json')),
    ("RQ Hartford 2026", os.path.join('data', 'raw-scrapes', 'hartford-full', '_index.json')),
]
CANON = {
    "Jax, Grandmaster at Arms": "Jax, Grandmaster At Arms",
    "Kai'sa, Daughter of the Void": "Kai'Sa, Daughter of the Void",
    "Khazix, Voidreaver": "Kha'Zix, Voidreaver",
    "Leblanc, Deceiver": "LeBlanc, Deceiver",
    "Reksai, Void Burrower": "Rek'Sai, Void Burrower",
    "Rek'sai, Void Burrower": "Rek'Sai, Void Burrower",
}


def main(card_set='Unleashed'):
    # on retire les decks du National deja convertis puis on remet son classement
    # complet : sinon le tournoi compterait deux fois, ou seulement en partie
    with_standings = card_set in ('Unleashed', 'Global')
    skip = {t for t, _ in FULL_STANDINGS} if with_standings else set()
    decks = load(card_set, skip_tournaments=skip)
    if with_standings:
        for tournament, path in FULL_STANDINGS:
            if not os.path.exists(path):
                print(f"# ATTENTION : classement manquant pour {tournament}")
                continue
            extra = load_index(path, tournament, CANON)
            print(f"# + classement complet, {tournament} : {len(extra)} decks")
            decks += extra
        print()
    n = len(decks)
    print(f"# {n} decklists {card_set} dans le depot\n")

    tot = collections.Counter()
    top8 = collections.Counter()
    wins = collections.Counter()
    tournaments = collections.defaultdict(set)
    for d in decks:
        lg = d['legend']
        tot[lg] += 1
        p = d.get('placement')
        if p and p <= 8:
            top8[lg] += 1
        if p == 1:
            wins[lg] += 1
            tournaments[lg].add(d.get('tournament'))

    ranked = sum(1 for d in decks if d.get('placement'))
    base = 100 * sum(top8.values()) / max(ranked, 1)
    print(f"decks classes : {ranked} | taux Top 8 moyen : {base:.2f}%\n")

    # Ce sur quoi le classement repose vraiment, pour que les visuels de tier list
    # annoncent la meme base que le calcul (et non le nombre de decklists en DB,
    # plus petit : tous les joueurs classes n'ont pas publie leur liste).
    counts_path = os.path.join('data', 'tier-source-counts.json')
    counts = {}
    if os.path.exists(counts_path):
        counts = json.load(open(counts_path, encoding='utf-8'))
    counts[card_set] = {
        'results': ranked,
        'tournaments': len({d.get('tournament') for d in decks if d.get('tournament')}),
    }
    json.dump(counts, open(counts_path, 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
    print(f"{'LEGENDE':38s} {'decks':>6s} {'field':>6s} {'top8':>5s} {'wins':>5s} {'conv':>6s}")
    for lg, c in tot.most_common():
        conv = 100 * top8[lg] / c
        flag = ''
        if c >= 40:
            flag = ' <<' if conv >= 2 * base else ('  (sous-performe)' if conv < base / 2 else '')
        print(f"{lg:38s} {c:6d} {100*c/n:5.1f}% {top8[lg]:5d} {wins[lg]:5d} {conv:5.1f}%{flag}")
        if wins[lg]:
            for t in sorted(x for x in tournaments[lg] if x):
                print(f"{'':38s}   won : {t}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'Unleashed')
