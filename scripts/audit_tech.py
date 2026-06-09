# -*- coding: utf-8 -*-
import re, json, sys
import requests
sys.stdout.reconfigure(encoding="utf-8")
B = "http://localhost:3000"
PROD = "https://riftboundfrance.fr"

PAGES = {
    "home": "/", "cartes": "/cartes", "carte": "/cartes/unl-060a-219", "decks": "/decks",
    "deck": "/decks/s3-tianjin-regional-open-2026-06-07-553th-xyz-fiora", "tier-list": "/tier-list",
    "tournois": "/tournois", "tournoi": "/tournois/s3-tianjin-regional-open-2026-06-07",
    "articles": "/articles", "article": "/articles/best-of-tianjin-ro", "guide": "/guides/debuter",
}

def g(path):
    return requests.get(B + path, timeout=30).text

def check(name, html):
    title = (re.search(r"<title[^>]*>(.*?)</title>", html, re.S) or [None, ""])[1].strip()
    desc = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]*)"', html)
    desc = desc.group(1) if desc else ""
    canon = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]*)"', html)
    canon = canon.group(1) if canon else "—"
    h1 = len(re.findall(r"<h1\b", html))
    ogimg = "✓" if re.search(r'property="og:image"', html) else "✗"
    lang = (re.search(r'<html[^>]+lang="([^"]*)"', html) or [None, "?"])[1]
    # JSON-LD types
    lds = re.findall(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S)
    types = []
    for b in lds:
        try:
            d = json.loads(b)
            for o in (d if isinstance(d, list) else [d]):
                t = o.get("@type")
                if t: types.append(t if isinstance(t, str) else ",".join(t))
        except Exception:
            types.append("?")
    imgs = re.findall(r"<img\b[^>]*>", html)
    noalt = sum(1 for i in imgs if 'alt=' not in i)
    print(f"\n### {name}  ({PAGES[name]})")
    print(f"  title({len(title)}): {title[:75]}")
    print(f"  desc({len(desc)}): {desc[:90]}")
    print(f"  canonical: {canon}")
    print(f"  h1={h1} | og:image={ogimg} | lang={lang} | imgs={len(imgs)} sans alt={noalt}")
    print(f"  JSON-LD: {types or '—'}")

print("===== ON-PAGE / STRUCTURED DATA (localhost) =====")
for n in PAGES:
    try: check(n, g(PAGES[n]))
    except Exception as e: print(f"\n### {n} ERR {e}")

print("\n===== robots / sitemap / llms (localhost) =====")
for f in ["/robots.txt", "/sitemap.xml", "/llms.txt", "/manifest.webmanifest"]:
    r = requests.get(B + f, timeout=30)
    extra = ""
    if f == "/sitemap.xml": extra = f"  (<loc> = {r.text.count('<loc>')})"
    if f == "/robots.txt": extra = "  " + r.text.replace(chr(10), " | ")[:120]
    print(f"  {r.status_code}  {f}{extra}")

print("\n===== SECURITY HEADERS (prod) =====")
try:
    h = requests.get(PROD, timeout=30).headers
    for k in ["strict-transport-security", "content-security-policy", "x-frame-options",
              "x-content-type-options", "referrer-policy", "permissions-policy"]:
        print(f"  {'✓' if k in {kk.lower() for kk in h} else '✗'} {k}: {h.get(k, '—')[:80]}")
except Exception as e:
    print("  prod fetch err", e)
