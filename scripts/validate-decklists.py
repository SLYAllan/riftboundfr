# -*- coding: utf-8 -*-
"""
Garde-fou anti-fabrication. Vérifie chaque decklist de data/decklists/ contre sa
vérité terrain brute (data/raw-scrapes/). Détecte les decks dont les cartes ne
correspondent PAS à la source réelle (= fabriqués/approximés).

Règle projet : on n'invente JAMAIS de deck. Si la donnée n'est pas vérifiable,
on skip/supprime — on ne publie pas de données fausses ou incertaines.

Usage:  python -X utf8 scripts/validate-decklists.py
Exit 1 dans QUATRE cas :
  - un MISMATCH (cartes différentes de la source brute) ;
  - une réserve Vendetta incomplète ;
  - un fichier illisible, source brute ou decklist ;
  - une decklist sans source brute qui n'est pas au relevé
    data/decklists-inverifiables.json.

Les erreurs de lecture étaient toutes avalées : une source brute cassée ou un
deck illisible laissait la commande verte, ce qui vide le garde-fou de son sens.
Le relevé, lui, fige les 1 159 listes déjà publiées sans source brute (import
d'avant les scrapes) : elles ne repassent pas rouge, mais une NOUVELLE liste
invérifiable, elle, arrête tout.
"""
import re, glob, os, json, sys
from collections import Counter
from validate_decklists_rules import vendetta_decklist_missing

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DECKS = os.path.join(ROOT, 'data', 'decklists')
RAW   = os.path.join(ROOT, 'data', 'raw-scrapes')
RELEVE_INVERIFIABLES = os.path.join(ROOT, 'data', 'decklists-inverifiables.json')

# Tout fichier qu'on n'a pas su lire atterrit ici et fait sortir en 1. Avant, un
# « except Exception: pass » les cachait : la commande restait verte alors qu'elle
# n'avait comparé qu'une partie du corpus.
erreurs_lecture = []

def note_erreur(chemin, cause):
    erreurs_lecture.append((os.path.relpath(chemin, ROOT), str(cause)[:160]))

# Les sources n'écrivent pas la casse pareil : hexgate publie « Ride The Wind »
# là où la base dit « Ride the Wind ». Deux cartes différentes ne se distinguent
# jamais par la seule casse, donc tout se compare en minuscules.
def cle_carte(nom):
    return (nom or '').strip().lower()

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
        nm = cle_carte(mc.group(2))
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
# hexgate ne nomme pas ses clés comme riftdecks : `source` au lieu de `url`,
# `cartes` au lieu de `main`, et l'emplacement dans `slot_type`. Sans cette
# lecture, les 330 listes chinoises restaient invérifiables — donc jamais
# recoupées contre leur source, ce que la règle d'intégrité interdit.
def cartes_hexgate(o):
    principales = [c for c in o['cartes'] if c.get('slot_type') == 'main']
    return [{'name': c['en_name'], 'quantity': c['quantity'], 'type': 'unit'} for c in principales]

def walk(o):
    if isinstance(o, dict):
        if o.get('url') and 'main' in o: consider(o['url'], o['main'])
        if o.get('source') and isinstance(o.get('cartes'), list):
            consider(o['source'], cartes_hexgate(o))
        for v in o.values(): walk(v)
    elif isinstance(o, list):
        for v in o: walk(v)
# Tous les dossiers de scrape, pas une liste figée : sinon chaque nouveau tournoi
# arrive « invérifiable » tant que personne ne pense à l'ajouter ici.
for d in sorted(os.listdir(RAW)):
    if not os.path.isdir(os.path.join(RAW, d)): continue
    for f in glob.glob(os.path.join(RAW, d, '*.json')):
        try:
            obj = json.loads(open(f, encoding='utf-8').read())
            if isinstance(obj, str): obj = json.loads(obj)
            walk(obj)
        except Exception as cause: note_erreur(f, cause)
    for f in glob.glob(os.path.join(RAW, d, '*.jsonl')):
        try:
            lignes = open(f, encoding='utf-8').readlines()
        except Exception as cause:
            note_erreur(f, cause); continue
        for numero, line in enumerate(lignes, 1):
            if not line.strip(): continue
            try:
                o = json.loads(line)
                if o.get('url'): consider(o['url'], o.get('main'))
            except Exception as cause: note_erreur(f, 'ligne %d : %s' % (numero, cause))
def jpool(main):
    skip = {'legend','champion','runes','battlefields'}
    pool = {}
    for c in main:
        if (c.get('type') or '').lower() in skip: continue
        k = cle_carte(c['name'])
        pool[k] = pool.get(k, 0) + c['quantity']
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
    except Exception as cause: note_erreur(p, cause)

def fpool(o, drop_champ=True):
    champ = cle_carte(o.get('champion'))
    pool = {}
    for c in o.get('mainDeck', []):
        k = cle_carte(c['name'])
        if drop_champ and k == champ: continue
        pool[k] = pool.get(k, 0) + c['quantity']
    return pool

def diff_is_champion_only(a, b, champs):
    champs = {cle_carte(c) for c in champs if c}
    names = set(a) | set(b)
    diff = [n for n in names if a.get(n,0) != b.get(n,0)]
    return all(n in champs for n in diff), diff

verified = mismatch = unverifiable = incomplete_side_deck = 0
inverifiables = []
mism_list = []
incomplete_side_decks = []
for f in glob.glob(os.path.join(DECKS, '**', '*.json'), recursive=True):
    try: o = json.loads(open(f, encoding='utf-8').read())
    except Exception as cause:
        note_erreur(f, cause); continue
    missing = vendetta_decklist_missing(o)
    if missing:
        incomplete_side_deck += 1
        incomplete_side_decks.append((os.path.relpath(f, ROOT), ", ".join(missing)))
        continue
    idv = o.get('id', ''); src = o.get('source') or o.get('sourceUrl') or ''
    truth = None; champs = set()
    if idv in md_by_stem:
        _, truth, champs = parse_md(md_by_stem[idv])
    # 39 quand la source range le Champion à part (riftdecks), 40 quand elle le
    # laisse dans le deck principal (hexgate). Au-delà, la source est partielle ou
    # d'un autre format : on préfère « invérifiable » à une comparaison bancale.
    elif src and src in jtruth and units(jtruth[src]) in (39, 40):
        truth = jpool(jtruth[src])
    if truth is None:
        unverifiable += 1
        inverifiables.append(os.path.relpath(f, ROOT).replace(os.sep, '/'))
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

# Relevé des listes déjà publiées sans source brute. Il gèle l'existant pour que
# le compteur ne serve pas d'alibi : ce qui n'y est pas et n'a pas de source brute
# est une NOUVELLE liste invérifiable, donc un refus.
try:
    releve = set(json.loads(open(RELEVE_INVERIFIABLES, encoding='utf-8').read())['fichiers'])
except FileNotFoundError:
    releve = set()
except Exception as cause:
    note_erreur(RELEVE_INVERIFIABLES, cause)
    releve = set()

nouvelles_inverifiables = sorted(set(inverifiables) - releve)
reparees = sorted(releve - set(inverifiables))

# « --ecrire-releve » refige l'existant. À lancer en connaissance de cause, jamais
# pour faire taire un refus : une liste neuve sans source brute se source ou se
# supprime, elle n'entre pas au relevé.
if '--ecrire-releve' in sys.argv:
    open(RELEVE_INVERIFIABLES, 'w', encoding='utf-8', newline='').write(json.dumps({
        'commentaire': "Decklists publiées sans source brute dans data/raw-scrapes/. Figées pour que le compteur ne serve pas d'alibi : toute NOUVELLE liste invérifiable fait sortir validate-decklists.py en 1.",
        'fichiers': sorted(inverifiables),
    }, ensure_ascii=False, indent=1))
    print(f"Relevé réécrit : {len(inverifiables)} listes sans source brute.")
    sys.exit(0)

print(f"verified={verified}  MISMATCH(fabriqué?)={mismatch}  réserve Vendetta incomplète={incomplete_side_deck}  unverifiable(pas de source brute)={unverifiable}")
if mism_list:
    print("\n=== MISMATCH (cartes != source brute — à corriger ou supprimer) ===")
    for f, pl, diff in mism_list[:50]:
        sys.stdout.buffer.write(f"  {f}  player={pl}  diff={diff}\n".encode('utf-8','replace'))
if incomplete_side_decks:
    print("\n=== RÉSERVE VENDETTA INCOMPLÈTE — deck à supprimer ===")
    for f, total in incomplete_side_decks[:50]:
        sys.stdout.buffer.write(f"  {f}  réserve={total}/10\n".encode('utf-8','replace'))
if erreurs_lecture:
    print("\n=== FICHIERS ILLISIBLES — la comparaison n'a pas pu se faire ===")
    for f, cause in erreurs_lecture[:50]:
        sys.stdout.buffer.write(f"  {f}  {cause}\n".encode('utf-8','replace'))
    if len(erreurs_lecture) > 50:
        print(f"  … et {len(erreurs_lecture) - 50} autres")
if nouvelles_inverifiables:
    print("\n=== SANS SOURCE BRUTE et hors relevé — à sourcer ou à supprimer ===")
    for f in nouvelles_inverifiables[:50]:
        sys.stdout.buffer.write(f"  {f}\n".encode('utf-8','replace'))
    if len(nouvelles_inverifiables) > 50:
        print(f"  … et {len(nouvelles_inverifiables) - 50} autres")
    print(f"\n  Le relevé est {os.path.relpath(RELEVE_INVERIFIABLES, ROOT)}.")
if reparees:
    # Pas bloquant : une liste qui a retrouvé sa source est une bonne nouvelle. Mais
    # la laisser au relevé rendrait le garde-fou plus lâche qu'il n'a besoin.
    print(f"\n{len(reparees)} liste(s) du relevé ont retrouvé leur source brute : à retirer du relevé.")

sys.exit(1 if (mismatch or incomplete_side_deck or erreurs_lecture or nouvelles_inverifiables) else 0)
