# -*- coding: utf-8 -*-
import os, sys
from playwright.sync_api import sync_playwright
sys.stdout.reconfigure(encoding="utf-8")

BASE = "http://localhost:3000"
OUT = r"C:\Users\Allan\Documents\Claude\RiftboundFr\data\audit-screens"
os.makedirs(OUT, exist_ok=True)

BINDER = "cmq4e09rr0001vs1stsbqpyau"
DECK = "s3-tianjin-regional-open-2026-06-07-553th-xyz-fiora"
CARD = "unl-060a-219"

DESKTOP = [
    ("home", "/"),
    ("cartes", "/cartes"),
    ("carte-detail", f"/cartes/{CARD}"),
    ("decks", "/decks"),
    ("decks-tournoi", "/decks?cat=tournoi"),
    ("decks-bestof", "/decks?cat=bestof"),
    ("deck-detail", f"/decks/{DECK}"),
    ("tier-list", "/tier-list"),
    ("tournois", "/tournois"),
    ("tournoi-detail", "/tournois/s3-tianjin-regional-open-2026-06-07"),
    ("articles", "/articles"),
    ("article-bestof-tianjin", "/articles/best-of-tianjin-ro"),
    ("collection-dashboard", "/collection"),
    ("collection-binder", f"/collection/{BINDER}"),
    ("deckbuilder", "/deckbuilder"),
    ("guide-debuter", "/guides/debuter"),
    ("compteur", "/outils/compteur"),
]
MOBILE = [("m-home", "/"), ("m-decks", "/decks"), ("m-tier-list", "/tier-list"), ("m-collection", "/collection")]

def shoot(page, name, path, full=True):
    try:
        page.goto(BASE + path, wait_until="networkidle", timeout=30000)
    except Exception:
        page.goto(BASE + path, wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1200)
    fp = os.path.join(OUT, name + ".png")
    page.screenshot(path=fp, full_page=full)
    print(f"  {name:26} {path}")

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
    page = ctx.new_page()
    # login (dev)
    page.goto(BASE + "/api/auth/dev-login", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(800)
    print("logged in (dev). Desktop:")
    for name, path in DESKTOP:
        shoot(page, name, path)
    ctx.close()
    # mobile
    mctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True)
    page = mctx.new_page()
    page.goto(BASE + "/api/auth/dev-login", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(600)
    print("Mobile:")
    for name, path in MOBILE:
        shoot(page, name, path)
    mctx.close()
    browser.close()
print("DONE ->", OUT)
