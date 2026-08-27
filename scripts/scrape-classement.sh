#!/bin/bash
# Scrape UNIQUEMENT les pages de classement d'un tournoi riftdecks, pas les decks.
#
#   bash scripts/scrape-classement.sh <slug> <url-du-tournoi> [nb-pages]
#
# Pourquoi séparément de `scrape-tournoi.sh` : une page de classement porte
# 64 joueurs avec leur rang, leur pseudo et leur Légende, **y compris ceux qui
# n'ont pas publié leur decklist**. Pour une part de méta et un taux de
# conversion, c'est tout ce qu'il faut, et ça coûte 26 appels là où le scrape des
# decks en coûte des centaines.
#
# Utrecht ne publie que 3 % de ses listes, Hartford 5 %, Vancouver 7 % : sans ces
# pages, ces trois Regional Qualifier ne pesaient presque rien dans le méta
# Unleashed, qui n'était donc qu'un méta chinois sans le dire.
#
# Sans nombre de pages, le script le lit sur la première page
# (« Page 1 of N, showing … »). Reprenable : une page déjà sur le disque n'est
# pas reprise.
set -u

SLUG="${1:?slug du tournoi manquant}"
URL="${2:?url du tournoi manquante}"
PAGES="${3:-0}"

RACINE="data/raw-scrapes"
BRUT="$RACINE/$SLUG"
FC="bash $(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/fc.sh"

mkdir -p "$BRUT"

recuperer() {
  local p="$1" fichier="$2" adresse="$URL"
  [ "$p" -gt 1 ] && adresse="$URL?page=$p"
  # Un fichier trop court est une page de défi Cloudflare, pas un classement.
  if [ -s "$fichier" ] && [ "$(wc -c < "$fichier")" -gt 5000 ]; then return 0; fi
  $FC scrape "$adresse" -f markdown --only-main-content -o "$fichier" > /dev/null 2>&1
  [ -s "$fichier" ] && [ "$(wc -c < "$fichier")" -gt 5000 ]
}

recuperer 1 "$BRUT/_page-1.md" || { echo "[$SLUG] page 1 illisible"; exit 1; }

if [ "$PAGES" -eq 0 ]; then
  PAGES=$(grep -oE "Page 1 of [0-9]+" "$BRUT/_page-1.md" | grep -oE "[0-9]+$" | head -1)
  [ -z "$PAGES" ] && PAGES=1
fi
TOTAL=$(grep -oE "out of [0-9,]+ total" "$BRUT/_page-1.md" | grep -oE "[0-9,]+" | head -1)
echo "[$SLUG] $PAGES pages, ${TOTAL:-?} classés annoncés"

echecs=0
for p in $(seq 2 "$PAGES"); do
  if ! recuperer "$p" "$BRUT/_page-$p.md"; then
    echecs=$((echecs + 1)); echo "[$SLUG] page $p en échec"
  fi
  sleep 4
  [ $((p % 10)) -eq 0 ] && echo "[$SLUG] $p/$PAGES"
done

lignes=$(grep -hoE "^\| \*\*[0-9]+(st|nd|rd|th)\*\*" "$BRUT"/_page-*.md 2>/dev/null | wc -l)
echo "[$SLUG] FINI : $PAGES pages, $lignes lignes de rang brutes, $echecs échec(s)"
[ "$echecs" -eq 0 ]
