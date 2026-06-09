# -*- coding: utf-8 -*-
"""GSC + GA4 pull via OAuth, self-contained (claude-seo v2.0.0 ne livre plus ses scripts).

Re-auth automatique si le refresh token a expiré (app Google en mode test = token 7 jours).
Lancer en interactif (ouvre le navigateur) :  python scripts/seo_google_pull.py
"""
import json, sys, datetime, urllib.parse, webbrowser, http.server, threading
import requests

sys.stdout.reconfigure(encoding="utf-8")

CFG_PATH = r"C:/Users/Allan/.config/claude-seo/google-api.json"
TOK_PATH = r"C:/Users/Allan/.config/claude-seo/oauth-token.json"
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
]

CFG = json.load(open(CFG_PATH, encoding="utf-8"))
CLIENT = (json.load(open(CFG["oauth_client_path"], encoding="utf-8")).get("installed")
          or json.load(open(CFG["oauth_client_path"], encoding="utf-8")).get("web"))


def save_token(d):
    json.dump(d, open(TOK_PATH, "w", encoding="utf-8"), indent=2)


def reauth():
    """Loopback OAuth flow (aucune lib externe)."""
    port = 8765
    redirect = f"http://localhost:{port}/"
    params = {
        "client_id": CLIENT["client_id"], "redirect_uri": redirect,
        "response_type": "code", "scope": " ".join(SCOPES),
        "access_type": "offline", "prompt": "consent",
    }
    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode(params)
    code_holder = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
            if "code" in q:
                code_holder["code"] = q["code"][0]
                self.wfile.write("Autorisation reçue. Vous pouvez fermer cet onglet.".encode("utf-8"))
            elif "error" in q:
                code_holder["error"] = q["error"][0]
                self.wfile.write(f"Erreur OAuth : {q['error'][0]}".encode("utf-8"))
            else:
                self.wfile.write(b"...")  # favicon / autre, on ignore
        def log_message(self, *a): pass

    srv = http.server.HTTPServer(("localhost", port), H)
    print("Ouverture du navigateur pour autoriser l'accès Google...")
    print("Si rien ne s'ouvre, ouvre :\n", auth_url)
    webbrowser.open(auth_url)
    # servir jusqu'à obtenir un code (ignore favicon et requêtes parasites)
    while "code" not in code_holder and "error" not in code_holder:
        srv.handle_request()
    srv.server_close()
    if "error" in code_holder:
        sys.exit(f"Autorisation refusée : {code_holder['error']}")

    r = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": CLIENT["client_id"], "client_secret": CLIENT["client_secret"],
        "code": code_holder["code"], "redirect_uri": redirect, "grant_type": "authorization_code",
    }, timeout=30)
    tok = r.json()
    if "access_token" not in tok:
        sys.exit(f"Échange du code échoué ({r.status_code}) : {json.dumps(tok)}")
    if "refresh_token" not in tok:
        # conserver l'ancien refresh_token si Google n'en renvoie pas
        try:
            old = json.load(open(TOK_PATH, encoding="utf-8"))
            if old.get("refresh_token"):
                tok["refresh_token"] = old["refresh_token"]
        except Exception:
            pass
    save_token(tok)
    print("Nouveau token sauvegardé.\n")
    return tok["access_token"]


def get_access_token():
    try:
        tok = json.load(open(TOK_PATH, encoding="utf-8"))
    except Exception:
        tok = {}
    if not tok.get("refresh_token"):
        print("Aucun refresh_token valide → ré-authentification.\n")
        return reauth()
    r = requests.post("https://oauth2.googleapis.com/token", data={
        "client_id": CLIENT["client_id"], "client_secret": CLIENT["client_secret"],
        "refresh_token": tok["refresh_token"], "grant_type": "refresh_token",
    }, timeout=30)
    if r.status_code == 200 and "access_token" in r.json():
        return r.json()["access_token"]
    print(f"Refresh échoué ({r.json().get('error')}) → ré-authentification nécessaire.\n")
    return reauth()


AT = get_access_token()
H = {"Authorization": "Bearer " + AT}
PROP = CFG["default_property"]; GA4 = CFG["ga4_property_id"]
site_enc = urllib.parse.quote(PROP, safe="")
today = datetime.date.today()
end = today - datetime.timedelta(days=3); start = end - datetime.timedelta(days=27)
ga_start = today - datetime.timedelta(days=28)


def gsc(dims):
    url = f"https://www.googleapis.com/webmasters/v3/sites/{site_enc}/searchAnalytics/query"
    return requests.post(url, headers=H, json={"startDate": str(start), "endDate": str(end),
        "dimensions": dims, "rowLimit": 25, "type": "web"}, timeout=60)


print(f"=== GSC ({start} → {end}) — {PROP} ===")
r = gsc([])
if r.status_code == 200 and r.json().get("rows"):
    t = r.json()["rows"][0]
    print(f"TOTAL clicks={t['clicks']:.0f} impressions={t['impressions']:.0f} CTR={t['ctr']*100:.2f}% pos={t['position']:.1f}")
elif r.status_code == 200:
    print("TOTAL: 0 impression sur la période")
else:
    print(f"ERR {r.status_code}: {r.text[:200]}")

for label, dims in [("QUERIES", ["query"]), ("PAGES", ["page"]), ("COUNTRY", ["country"]), ("DEVICE", ["device"])]:
    r = gsc(dims); print(f"\n-- TOP {label} --")
    if r.status_code != 200:
        print(f"  ERR {r.status_code}: {r.text[:150]}"); continue
    for row in r.json().get("rows", [])[:15]:
        print(f"  {row['clicks']:>4.0f} clk | {row['impressions']:>6.0f} imp | {row['ctr']*100:>5.1f}% | pos {row['position']:>4.1f} | {row['keys'][0]}")
    if not r.json().get("rows"): print("  (vide)")

r = requests.get(f"https://www.googleapis.com/webmasters/v3/sites/{site_enc}/sitemaps", headers=H, timeout=30)
print("\n=== GSC Sitemaps ===")
if r.status_code == 200:
    for s in r.json().get("sitemap", []):
        c = s.get("contents", [])
        print(f"  {s.get('path')} | submitted={sum(int(x.get('submitted',0)) for x in c)} indexed={sum(int(x.get('indexed',0)) for x in c)} | err={s.get('errors',0)} warn={s.get('warnings',0)}")
else:
    print(f"  ERR {r.status_code}: {r.text[:150]}")

ga = f"https://analyticsdata.googleapis.com/v1beta/properties/{GA4}:runReport"
print(f"\n=== GA4 ({ga_start} → today) — {GA4} ===")
r = requests.post(ga, headers=H, json={"dateRanges": [{"startDate": str(ga_start), "endDate": "today"}],
    "dimensions": [{"name": "sessionDefaultChannelGroup"}],
    "metrics": [{"name": "sessions"}, {"name": "totalUsers"}],
    "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}]}, timeout=60)
if r.status_code == 200:
    for row in r.json().get("rows", []):
        print(f"  {row['metricValues'][0]['value']:>5} sess | {row['metricValues'][1]['value']:>4} users | {row['dimensionValues'][0]['value']}")
    if not r.json().get("rows"): print("  (aucune session)")
else:
    print(f"  ERR {r.status_code}: {r.text[:200]}")
