#!/bin/bash
# Les cinq City Challenge chinois du 8-9 août 2026, en série.
# Un seul à la fois : le quota firecrawl (18 req/min) est celui du compte entier.
set -u
B="https://riftdecks.com/riftbound-tournaments"
bash scripts/scrape-tournoi.sh s4-fuzhou    "$B/s4-fuzhou-city-challenge-tournament-decks-13758"    2
bash scripts/scrape-tournoi.sh s4-hangzhou  "$B/s4-hangzhou-city-challenge-tournament-decks-13757"  2
bash scripts/scrape-tournoi.sh s4-guangzhou "$B/s4-guangzhou-city-challenge-tournament-decks-13756" 2
bash scripts/scrape-tournoi.sh s4-chengdu   "$B/s4-chengdu-city-challenge-tournament-decks-13771"   2
bash scripts/scrape-tournoi.sh s4-beijing   "$B/s4-beijing-city-challenge-tournament-decks-13770"   2
echo "=== LES CINQ SONT PASSÉS ==="
for s in s4-fuzhou s4-hangzhou s4-guangzhou s4-chengdu s4-beijing; do
  n=$(ls "data/raw-scrapes/$s"/*.md 2>/dev/null | grep -vc _page)
  e=$(wc -l < "data/raw-scrapes/$s-errors.txt" 2>/dev/null || echo 0)
  echo "$s : $n decks bruts, $e échecs"
done
