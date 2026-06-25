#!/usr/bin/env bash
# Pipeline de transcription VOD — version FASTER-WHISPER (plus rapide, même précision).
# Usage : bash scripts/vod-transcribe-fw.sh /d/riftbound-vods/worklist.txt
# Identique à vod-transcribe.sh mais transcrit via scripts/fw_transcribe.py (CTranslate2).
set -uo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$HOME/.deno/bin:$PATH"   # Deno = solveur nsig pour yt-dlp (sinon "format not available")
WORK="${1:-/d/riftbound-vods/worklist-all.txt}"
BASE=/d/riftbound-vods
AUD="$BASE/audio"; TR="$BASE/transcripts"; LOGS="$BASE/logs"
MODEL="${WHISPER_MODEL:-small.en}"
# Auth + throttling anti-bot YouTube (cookies Firefox + pauses) — surchargeable par env.
COOKIES="${YTDLP_COOKIES:---cookies-from-browser firefox}"
THROTTLE="${YTDLP_THROTTLE:---sleep-requests 1.5 --sleep-interval 1 --max-sleep-interval 4}"
mkdir -p "$AUD" "$TR" "$LOGS"
LOG="$LOGS/pipeline.log"
ts(){ date '+%Y-%m-%d %H:%M:%S'; }
echo "$(ts) ===== START(fw) $WORK (model=$MODEL) =====" >>"$LOG"
n=0; ok=0
while IFS=$'\t' read -r id label; do
  [ -z "${id:-}" ] && continue
  n=$((n+1))
  if [ -f "$TR/$id.txt" ]; then echo "$(ts) SKIP  $id  $label" >>"$LOG"; ok=$((ok+1)); continue; fi
  echo "$(ts) DL    $id  $label" >>"$LOG"
  rm -f "$AUD/$id".* 2>/dev/null
  yt-dlp -f "bestaudio/best" -x --audio-format mp3 --audio-quality 5 --no-warnings --no-progress \
    $COOKIES $THROTTLE \
    -o "$AUD/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$id" >>"$LOGS/ytdlp.log" 2>&1
  af="$AUD/$id.mp3"
  if [ ! -f "$af" ]; then echo "$(ts) FAILDL $id" >>"$LOG"; continue; fi
  echo "$(ts) WHISP $id (fw)" >>"$LOG"
  python "$SCRIPT_DIR/fw_transcribe.py" "$af" "$TR" "$MODEL" >>"$LOGS/whisper.log" 2>&1
  if [ -f "$TR/$id.txt" ]; then echo "$(ts) DONE  $id" >>"$LOG"; ok=$((ok+1)); rm -f "$af"; else echo "$(ts) FAILWH $id" >>"$LOG"; fi
done < "$WORK"
echo "$(ts) ===== COMPLETE(fw) $WORK : $ok/$n =====" >>"$LOG"
