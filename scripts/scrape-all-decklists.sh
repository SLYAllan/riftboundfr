#!/bin/bash
# Batch scrape + parse all decklists for a tournament
# Usage: bash scripts/scrape-all-decklists.sh <tournament> <slug> <name> <date> <players> <set>
# Example: bash scripts/scrape-all-decklists.sh fuzhou-regional fuzhou-ro "S2 Regional Open - Fuzhou" 2026-01-18 511 Spiritforged

set -e
TOURNAMENT="$1"
SLUG="$2"
NAME="$3"
DATE="$4"
PLAYERS="$5"
SET="$6"

RAW="data/raw-scrapes/$TOURNAMENT"
URLS="data/raw-scrapes/${TOURNAMENT}-urls.txt"
ERRORS="data/raw-scrapes/${TOURNAMENT}-errors.txt"

mkdir -p "$RAW"
> "$ERRORS"

TOTAL=$(wc -l < "$URLS")
echo "START $TOURNAMENT: $TOTAL decklists to scrape"

COUNT=0
OK=0
FAIL=0

while IFS= read -r URL; do
  COUNT=$((COUNT + 1))
  DECK_ID=$(echo "$URL" | grep -oE '[0-9]+$')
  MD_FILE="$RAW/deck-${DECK_ID}.md"

  # Skip if already scraped
  if [ -f "$MD_FILE" ] && [ -s "$MD_FILE" ]; then
    OK=$((OK + 1))
    if [ $((COUNT % 50)) -eq 0 ]; then
      echo "PROGRESS $TOURNAMENT: $COUNT/$TOTAL (ok=$OK fail=$FAIL) [skipped cached]"
    fi
    continue
  fi

  # Scrape
  if firecrawl scrape --format markdown --only-main-content "$URL" --output "$MD_FILE" > /dev/null 2>&1; then
    if [ -s "$MD_FILE" ]; then
      OK=$((OK + 1))
    else
      FAIL=$((FAIL + 1))
      echo "$URL" >> "$ERRORS"
    fi
  else
    FAIL=$((FAIL + 1))
    echo "$URL" >> "$ERRORS"
  fi

  if [ $((COUNT % 50)) -eq 0 ]; then
    echo "PROGRESS $TOURNAMENT: $COUNT/$TOTAL (ok=$OK fail=$FAIL)"
  fi

  sleep 1
done < "$URLS"

echo "DONE $TOURNAMENT: $TOTAL total, $OK ok, $FAIL errors"
