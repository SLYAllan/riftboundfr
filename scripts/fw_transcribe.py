#!/usr/bin/env python
"""Transcription faster-whisper (CTranslate2) : même précision que openai-whisper
pour le même modèle, mais 2-4x plus rapide. Usage :
    python scripts/fw_transcribe.py <audio> <outdir> [model]
Écrit <outdir>/<id>.txt. Modèle par défaut : small.en (suffisant, cf. test 25 juin)."""
import os
import sys

audio = sys.argv[1]
outdir = sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "small.en"
device = os.environ.get("WHISPER_DEVICE", "cuda")
vid = os.path.splitext(os.path.basename(audio))[0]

from faster_whisper import WhisperModel

try:
    model = WhisperModel(model_name, device=device, compute_type="float16")
except Exception:
    # repli si fp16 indispo (vieux GPU / cuDNN)
    model = WhisperModel(model_name, device=device, compute_type="int8_float16")

segments, _ = model.transcribe(audio, language="en", beam_size=5)
text = " ".join(s.text.strip() for s in segments)

os.makedirs(outdir, exist_ok=True)
with open(os.path.join(outdir, vid + ".txt"), "w", encoding="utf-8") as f:
    f.write(text + "\n")
