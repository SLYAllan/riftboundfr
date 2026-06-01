from playwright.sync_api import sync_playwright
import os

OUT = r"C:\Users\Allan\Documents\Claude\RiftboundFr\data\videos\mobile"
os.makedirs(OUT, exist_ok=True)
URL = "http://localhost:3000/articles/recap-regional-qualifier-vancouver"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
    pg.goto(URL, wait_until="networkidle", timeout=60000)
    # dismiss cookie banner for clean shots
    try:
        pg.get_by_text("Accepter", exact=False).first.click(timeout=4000)
    except Exception as e:
        print("no cookie banner", repr(e))
    pg.wait_for_timeout(500)
    # scroll through the whole page to trigger lazy-loaded card images
    h = pg.evaluate("document.body.scrollHeight")
    y = 0
    while y < h:
        pg.evaluate(f"window.scrollTo(0,{y})")
        pg.wait_for_timeout(250)
        y += 700
    pg.evaluate("window.scrollTo(0,0)")
    pg.wait_for_timeout(800)

    shots = [
        ("01-top", None),
        ("02-bracket", "text=Le parcours du Top 8"),
        ("03-decklist-top", "text=Diana — AlanZQ"),
        ("04-decklist-grid", "text=Deck Principal"),
        ("05-decks-section", "text=Tous les decks du Top 7"),
    ]
    for name, sel in shots:
        if sel:
            try:
                el = pg.locator(sel).first
                el.scroll_into_view_if_needed(timeout=8000)
                pg.wait_for_timeout(700)
            except Exception as e:
                print("WARN", name, repr(e))
        pg.screenshot(path=os.path.join(OUT, name + ".png"))
        print("ok", name)
    b.close()
print("done")
