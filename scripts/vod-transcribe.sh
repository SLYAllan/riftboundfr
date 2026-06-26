#!/usr/bin/env bash
# Pipeline de transcription des VOD Riftbound (audio seul → Whisper GPU, SÉRIE).
# Usage : bash scripts/vod-transcribe.sh /d/riftbound-vods/worklist-p1.txt
# - Télécharge l'audio (mp3) sur D:, transcrit en .txt avec Whisper (GPU),
#   puis SUPPRIME l'audio pour économiser le disque. Un seul job à la fois
#   (ne sature pas le PC). Reprend là où il s'est arrêté (skip si .txt existe).
set -uo pipefail
WORK="${1:-/d/riftbound-vods/worklist-all.txt}"
BASE=/d/riftbound-vods
AUD="$BASE/audio"; TR="$BASE/transcripts"; LOGS="$BASE/logs"
MODEL="${WHISPER_MODEL:-small.en}"
DEVICE="${WHISPER_DEVICE:-cuda}"
mkdir -p "$AUD" "$TR" "$LOGS"
LOG="$LOGS/pipeline.log"
ts(){ date '+%Y-%m-%d %H:%M:%S'; }
echo "$(ts) ===== START $WORK (model=$MODEL device=$DEVICE) =====" >>"$LOG"
n=0; ok=0
while IFS=$'\t' read -r id label; do
  [ -z "${id:-}" ] && continue
  n=$((n+1))
  if [ -f "$TR/$id.txt" ]; then echo "$(ts) SKIP  $id  $label" >>"$LOG"; ok=$((ok+1)); continue; fi
  echo "$(ts) DL    $id  $label" >>"$LOG"
  rm -f "$AUD/$id".* 2>/dev/null
  yt-dlp -f bestaudio -x --audio-format mp3 --audio-quality 5 --no-warnings --no-progress \
    -o "$AUD/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id" >>"$LOGS/ytdlp.log" 2>&1
  af="$AUD/$id.mp3"
  if [ ! -f "$af" ]; then echo "$(ts) FAILDL $id" >>"$LOG"; continue; fi
  echo "$(ts) WHISP $id" >>"$LOG"
  whisper "$af" --model "$MODEL" --language en --device "$DEVICE" \
    --output_dir "$TR" --output_format txt --verbose False >>"$LOGS/whisper.log" 2>&1
  if [ -f "$TR/$id.txt" ]; then echo "$(ts) DONE  $id" >>"$LOG"; ok=$((ok+1)); rm -f "$af"; else echo "$(ts) FAILWH $id" >>"$LOG"; fi
done < "$WORK"
echo "$(ts) ===== COMPLETE $WORK : $ok/$n =====" >>"$LOG"
