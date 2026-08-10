# Extrait les regles officielles FR du PDF « Regles de base » vers un JSON indexable.
# Le PDF n'est pas versionne (44 Mo) : on garde le JSON, qui fait foi pour la recherche.
#   python -X utf8 scripts/parse-core-rules.py
import json, re, sys, pypdf

SRC = "data/rules/core-rules-fr.pdf"
OUT = "data/rules/core-rules-fr.json"

reader = pypdf.PdfReader(SRC)
raw = "\n".join((p.extract_text() or "") for p in reader.pages)

# L'extraction double les espaces et coupe les lignes n'importe ou.
raw = raw.replace(" ", " ")
lines = [re.sub(r"\s+", " ", l).strip() for l in raw.split("\n")]
lines = [l for l in lines if l]

NUM = re.compile(r"^(\d{3}(?:\.\d+)*(?:\.[a-z])?(?:\.\d+)*)\.\s+(.*)$")

entries = []
cur = None
for line in lines:
    m = NUM.match(line)
    if m:
        if cur:
            entries.append(cur)
        cur = {"id": m.group(1), "text": m.group(2)}
    elif cur:
        cur["text"] += " " + line
if cur:
    entries.append(cur)

# Un titre de section n'a pas de point final et sert d'en-tete aux regles qui suivent.
section = None
for e in entries:
    e["text"] = re.sub(r"\s+", " ", e["text"]).strip()
    top = e["id"].split(".")[0]
    if "." not in e["id"] and not e["text"].endswith("."):
        section = e["text"]
        e["section"] = e["text"]
    else:
        e["section"] = section or ""
    e["top"] = top

# On jette les entrees vides et les renvois de sommaire (texte trop court).
entries = [e for e in entries if len(e["text"]) > 25]

json.dump(entries, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(entries)} regles ecrites dans {OUT}")
print("exemple :", json.dumps(entries[40], ensure_ascii=False)[:220])
