# -*- coding: utf-8 -*-
"""Core Web Vitals (CrUX terrain) + PageSpeed (Lighthouse labo) via API key.
Lancer : python scripts/seo_cwv.py [url1 url2 ...]   (défaut = home + pages clés)
"""
import json, sys, requests
sys.stdout.reconfigure(encoding="utf-8")

CFG = json.load(open(r"C:/Users/Allan/.config/claude-seo/google-api.json", encoding="utf-8"))
KEY = CFG["api_key"]
SITE = "https://riftboundfrance.fr"
URLS = sys.argv[1:] or [SITE + p for p in ["/", "/cartes", "/decks", "/tier-list", "/guides/debuter"]]

def rate(metric, v):
    th = {"LCP": (2500, 4000), "INP": (200, 500), "CLS": (0.1, 0.25),
          "FCP": (1800, 3000), "TTFB": (800, 1800)}
    g, n = th[metric]
    if v <= g: return "🟢 Bon"
    if v <= n: return "🟠 À améliorer"
    return "🔴 Mauvais"

def fmt(metric, v):
    return f"{v/1000:.2f}s" if metric in ("LCP", "INP", "FCP", "TTFB") else f"{v:.3f}"

def crux_block(exp, label):
    if not exp:
        print(f"  {label}: pas de données CrUX (trafic insuffisant)")
        return
    m = exp.get("metrics", {})
    mapping = [("LCP", "largest_contentful_paint"), ("INP", "interaction_to_next_paint"),
               ("CLS", "cumulative_layout_shift"), ("FCP", "first_contentful_paint"),
               ("TTFB", "experimental_time_to_first_byte")]
    print(f"  {label}:")
    for short, key in mapping:
        d = m.get(key)
        if not d: continue
        p75 = d.get("percentile")
        if p75 is None: continue
        val = float(p75)
        if short == "CLS":  # CrUX renvoie CLS *100 en entier parfois, sinon string
            val = float(p75)
        print(f"    {short:5} p75 = {fmt(short, val):>8}  {rate(short, val)}")

for url in URLS:
    print(f"\n══ {url} ══")
    for strat in ("mobile", "desktop"):
        r = requests.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
                         params={"url": url, "key": KEY, "strategy": strat, "category": "performance"}, timeout=90)
        if r.status_code != 200:
            print(f"  [{strat}] ERR {r.status_code}: {r.text[:160]}")
            continue
        data = r.json()
        lh = data.get("lighthouseResult", {})
        score = lh.get("categories", {}).get("performance", {}).get("score")
        print(f"  ── {strat.upper()} ── Lighthouse perf (labo) : {round(score*100) if score is not None else '?'} /100")
        crux_block(data.get("loadingExperience"), "CrUX page (terrain 28j)")
        if strat == "mobile":
            crux_block(data.get("originLoadingExperience"), "CrUX origine (tout le site)")
