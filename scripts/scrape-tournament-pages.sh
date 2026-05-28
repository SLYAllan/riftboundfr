#!/bin/bash
# Scrape all tournament pages to collect decklist URLs
# Usage: bash scripts/scrape-tournament-pages.sh

set -e
RAW="data/raw-scrapes"

echo "=== FUZHOU (pages 2-8) ==="
for i in $(seq 2 8); do
  echo "  Scraping Fuzhou page $i..."
  firecrawl scrape --format links "https://riftdecks.com/riftbound-tournaments/s2-regional-open-fuzhou-tournament-decks-2859?page=$i" --output "$RAW/fuzhou-regional/page-$i.txt" 2>&1 | tail -1
  sleep 2
done

echo ""
echo "=== SUZHOU (page 1 first) ==="
echo "  Scraping Suzhou page 1..."
firecrawl scrape --format markdown,links "https://riftdecks.com/riftbound-tournaments/s3-suzhou-regional-open-tournament-decks-9990" --json --output "$RAW/suzhou-regional/page-1.json" 2>&1 | tail -1
sleep 2

# Detect max page from Suzhou page 1
MAX_PAGE=$(grep -oE 'page=[0-9]+' "$RAW/suzhou-regional/page-1.json" 2>/dev/null | sed 's/page=//' | sort -n | tail -1)
echo "  Suzhou max page detected: ${MAX_PAGE:-unknown}"

if [ -n "$MAX_PAGE" ] && [ "$MAX_PAGE" -gt 1 ]; then
  for i in $(seq 2 $MAX_PAGE); do
    echo "  Scraping Suzhou page $i..."
    firecrawl scrape --format links "https://riftdecks.com/riftbound-tournaments/s3-suzhou-regional-open-tournament-decks-9990?page=$i" --output "$RAW/suzhou-regional/page-$i.txt" 2>&1 | tail -1
    sleep 2
  done
fi

echo ""
echo "=== Collecting URLs ==="

# Fuzhou: page 1 already extracted to /tmp/fuzhou-urls-p1.txt
cp /tmp/fuzhou-urls-p1.txt "$RAW/fuzhou-regional-urls.txt"
for f in "$RAW/fuzhou-regional"/page-*.txt; do
  [ -f "$f" ] && grep -oE 'https://riftdecks\.com/riftbound-metagame/deck-[a-zA-Z0-9_-]+' "$f" >> "$RAW/fuzhou-regional-urls.txt" 2>/dev/null
done
sort -u -o "$RAW/fuzhou-regional-urls.txt" "$RAW/fuzhou-regional-urls.txt"
echo "  Fuzhou total URLs: $(wc -l < "$RAW/fuzhou-regional-urls.txt")"

# Suzhou
> "$RAW/suzhou-regional-urls.txt"
for f in "$RAW/suzhou-regional"/page-*.json "$RAW/suzhou-regional"/page-*.txt; do
  [ -f "$f" ] && grep -oE 'https://riftdecks\.com/riftbound-metagame/deck-[a-zA-Z0-9_-]+' "$f" >> "$RAW/suzhou-regional-urls.txt" 2>/dev/null
done
sort -u -o "$RAW/suzhou-regional-urls.txt" "$RAW/suzhou-regional-urls.txt"
echo "  Suzhou total URLs: $(wc -l < "$RAW/suzhou-regional-urls.txt")"

echo ""
echo "=== DONE collecting tournament page URLs ==="
