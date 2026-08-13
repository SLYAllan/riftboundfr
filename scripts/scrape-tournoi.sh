#!/bin/bash
# Scrape un tournoi riftdecks : les pages de liste, puis chaque deck.
#
#   bash scripts/scrape-tournoi.sh <slug> <url-du-tournoi> <nb-pages>
#   bash scripts/scrape-tournoi.sh s4-fuzhou https://riftdecks.com/riftbound-tournaments/s4-fuzhou-...-13758 2
#
# Passe par le CLI `firecrawl`, seul outil qui traverse le Cloudflare de
# riftdecks : `curl`, `WebFetch`, le MCP scrapeur et cloudscraper 1.2.71 y
# prennent tous un 403 (vérifié le 13 août 2026).
#
# Reprenable : un deck déjà sur le disque n'est pas rescrapé. Relancer après une
# coupure reprend où ça s'est arrêté, sans repayer les appels déjà faits.
#
# À lancer un tournoi À LA FOIS. Le compte firecrawl plafonne à 18 requêtes par
# minute pour tout le compte : deux scrapes en parallèle ne vont pas deux fois
# plus vite, ils se volent le quota et repartent en erreur.
#
# Ne produit QUE du scrape brut. La conversion en decklists JSON vient après, et
# c'est elle qui doit être recoupée contre ce brut (voir AGENT-INSTRUCTIONS.md).
set -u

SLUG="${1:?slug du tournoi manquant}"
URL="${2:?url du tournoi manquante}"
PAGES="${3:?nombre de pages manquant}"

RACINE="data/raw-scrapes"
BRUT="$RACINE/$SLUG"
URLS="$RACINE/$SLUG-urls.txt"
ERREURS="$RACINE/$SLUG-errors.txt"

mkdir -p "$BRUT"
: > "$ERREURS"

# --- 1. Les pages de liste, d'où sortent les URL de decks ---------------------
if [ ! -s "$URLS" ]; then
  echo "[$SLUG] collecte des URL sur $PAGES page(s)"
  TMP_URLS="$(mktemp)"
  for p in $(seq 1 "$PAGES"); do
    page_url="$URL"
    [ "$p" -gt 1 ] && page_url="$URL?page=$p"
    page_md="$BRUT/_page-$p.md"
    if [ ! -s "$page_md" ]; then
      firecrawl scrape "$page_url" -f markdown --only-main-content -o "$page_md" > /dev/null 2>&1
      sleep 2
    fi
    grep -oE "https://riftdecks\.com/riftbound-metagame/deck-[a-z0-9-]+" "$page_md" >> "$TMP_URLS" 2>/dev/null
    echo "[$SLUG] page $p/$PAGES : $(wc -l < "$TMP_URLS") URL cumulées (avant dédoublonnage)"
  done
  sort -u "$TMP_URLS" > "$URLS"
  rm -f "$TMP_URLS"
fi

TOTAL=$(wc -l < "$URLS")
echo "[$SLUG] $TOTAL decks à récupérer"

# --- 2. Chaque deck ----------------------------------------------------------
n=0; ok=0; echecs=0; caches=0
while IFS= read -r deck_url; do
  [ -z "$deck_url" ] && continue
  n=$((n + 1))
  id="${deck_url##*/}"
  fichier="$BRUT/$id.md"

  # Un fichier trop court est une page de défi Cloudflare, pas un deck : on le
  # rejette pour qu'une reprise le retente au lieu de le compter comme acquis.
  if [ -s "$fichier" ] && [ "$(wc -c < "$fichier")" -gt 500 ]; then
    caches=$((caches + 1)); ok=$((ok + 1))
  else
    # Le compte firecrawl est limité à 18 requêtes/minute, soit 3,33 s entre deux
    # appels. À 1 s, deux appels sur cinq revenaient vides : des refus de débit,
    # pas des decks manquants. Une deuxième chance après 20 s absorbe le reste.
    obtenu=0
    for essai in 1 2; do
      firecrawl scrape "$deck_url" -f markdown --only-main-content -o "$fichier" > /dev/null 2>&1
      if [ -s "$fichier" ] && [ "$(wc -c < "$fichier")" -gt 500 ]; then obtenu=1; break; fi
      rm -f "$fichier"
      [ "$essai" -eq 1 ] && sleep 20
    done
    if [ "$obtenu" -eq 1 ]; then
      ok=$((ok + 1))
    else
      echecs=$((echecs + 1)); echo "$deck_url" >> "$ERREURS"
    fi
    sleep 4
  fi

  if [ $((n % 25)) -eq 0 ] || [ "$n" -eq "$TOTAL" ]; then
    echo "[$SLUG] $n/$TOTAL — ok=$ok (dont $caches déjà en cache) échecs=$echecs"
  fi
done < "$URLS"

echo "[$SLUG] FINI : $ok/$TOTAL récupérés, $echecs en échec (listés dans $ERREURS)"
[ "$echecs" -eq 0 ]
