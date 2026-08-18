# Extrait les regles officielles du PDF « Regles de base » vers un JSON indexable.
# Le PDF n'est pas versionne (>40 Mo) : on garde le JSON, qui fait foi pour la recherche.
#   python -X utf8 scripts/parse-core-rules.py        (francais, par defaut)
#   python -X utf8 scripts/parse-core-rules.py en     (anglais)
# La numerotation des regles est la meme dans les deux langues : le decoupage ne
# depend pas de la langue, seul le fichier change.
import json, re, sys, pypdf

LANGUE = sys.argv[1] if len(sys.argv) > 1 else "fr"
SRC = f"data/rules/core-rules-{LANGUE}.pdf"
OUT = f"data/rules/core-rules-{LANGUE}.json"

reader = pypdf.PdfReader(SRC)
raw = "\n".join((p.extract_text() or "") for p in reader.pages)

# L'extraction double les espaces et coupe les lignes n'importe ou.
raw = raw.replace(" ", " ")
# Le PDF porte des ligatures typographiques : « battlefield » s'y ecrit avec U+FB01,
# pas avec f + i. Une recherche sur « field », « fin » ou « affect » ne trouvait donc
# rien, sur une page dont la recherche est tout l'interet. On les remet en lettres.
for lig, lettres in [("ﬀ", "ff"), ("ﬁ", "fi"), ("ﬂ", "fl"), ("ﬃ", "ffi"), ("ﬄ", "ffl")]:
    raw = raw.replace(lig, lettres)

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
    if "." not in e["id"] and not e["text"].endswith(".") and len(e["text"]) <= 60:
        section = e["text"].rstrip(" :")
        e["section"] = section
    else:
        e["section"] = section or ""
    e["top"] = top

# Le sommaire du PDF repete les memes numeros avec un libelle court ; le corps du
# document en donne le texte complet. On garde, pour chaque numero, la version la plus
# longue. Un seuil de longueur ne marchait pas : en anglais, des regles reelles sont
# tres courtes (« Battlefield zone ») et 66 d'entre elles disparaissaient.
par_id = {}
for e in entries:
    if not e["text"]:
        continue
    garde = par_id.get(e["id"])
    if garde is None or len(e["text"]) > len(garde["text"]):
        par_id[e["id"]] = e
# On reste dans l'ordre du document, celui que suit le sommaire de la page.
vus = set()
entries = [par_id[e["id"]] for e in entries if e["id"] in par_id and not (e["id"] in vus or vus.add(e["id"]))]

json.dump(entries, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
print(f"{len(entries)} regles ecrites dans {OUT}")
print("exemple :", json.dumps(entries[40], ensure_ascii=False)[:220])
