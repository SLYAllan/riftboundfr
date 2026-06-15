# Audit Sécurité + SEO — Riftbound France (15 juin 2026)

Audit page par page (par type/template) sur le serveur dev local incluant les nouvelles pages tournois (Changsha, Utrecht, Vancouver). Pages publiques : ~38 routes + ~40 routes API + back-office `/admin`.

## Score global

| Domaine | Score | Synthèse |
|---|---|---|
| **Sécurité** | **85 / 100** | Headers + auth solides. Point critique = exposition DB prod (infra). |
| **SEO** | **92 / 100** | Base excellente (schema, canonicals, OG, sitemap). 1 correctif appliqué. |

---

## 1. Sécurité

### ✅ Points forts
- **Headers** (`src/middleware.ts`) : HSTS (2 ans, preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/micro/geo off), CSP avec `frame-ancestors 'none'`.
- **Auth back-office** : toutes les routes `/api/admin/*` gated par `isAdmin()` → 401 ; `/admin/*` protégé via `isAdmin()` dans le layout.
- **`/api/auth/dev-login`** : renvoie **404 en production** (garde `NODE_ENV`).
- **`/api/image-proxy`** : anti-SSRF par allowlist d'hôte (`cmsassets.rgpub.io` uniquement).
- `poweredByHeader: false`, `output: standalone`, `images.remotePatterns` restreint (2 hôtes), `sw.js` avec CSP stricte propre.
- Rate limiting présent sur `/api/auth` et `/api/community-decks`.

### ⚠️ À améliorer
- **CSP `script-src` avec `'unsafe-inline'` + `'unsafe-eval'`** : affaiblit la protection XSS. Idéal = nonces/hash (chantier plus lourd). → **Corrigé partiellement** : ajout de `base-uri 'self'`, `object-src 'none'`, `form-action 'self'`.
- **Rate limiting partiel** : étendre aux autres endpoints d'écriture (collection, comments, wishlist, likes) pour limiter l'abus.

### 🔴 Critique (infra, hors code)
- **Exposition DB prod** : la base Postgres prod serait accessible publiquement (`178.104.237.33:15432` via tunnel socat). À **vérifier et fermer** (firewall / bind localhost / VPN). Voir mémoire `project_prod_db_exposure`.

---

## 2. SEO

### ✅ Points forts (sur tous les types de page)
- **1 seul `<h1>`** par page, `robots: index, follow`, **canonical**, **OG image**, meta description (100-150 car. en général).
- **Schema JSON-LD riche** : `WebSite` + `Organization` + `SearchAction` global ; `BreadcrumbList` sur les pages détail (tournois, articles) ; `Article` + `Person` (auteur Allan) sur les articles ; `AboutPage` + `Person` + `Organization` sur `/a-propos` (E-E-A-T solide).
- **Technique** : `robots.txt` propre (autorise GPTBot / ClaudeBot / PerplexityBot / Applebot — GEO-friendly ; bloque `/admin` `/api`), **`llms.txt`** présent, **`sitemap.xml` = 23 972 URLs** incluant déjà les 3 nouvelles pages tournois.
- Nouvelles pages tournois : title 64-70 car., desc ~105 car., BreadcrumbList ✓.

### ⚠️ Corrigé dans cet audit
- **`/guides` : canonical manquant** (seule page concernée) + title/desc trop courts → **corrigé** (canonical ajouté, title + description enrichis).

### 💡 Opportunités (non bloquantes)
- **Schema `Event`/`SportsEvent`** sur les pages tournois (actuellement seulement BreadcrumbList) : enrichirait les résultats riches pour les compétitions.
- Quelques titles courts (`/a-propos` ~27 car.) — acceptable mais perfectible.
- Sitemap très volumineux (23 972 URLs) : surveiller le budget de crawl (decks/cartes individuels). Déjà adressé en partie (cf. commits sitemap récents).

---

## 3. Plan d'action priorisé

| Priorité | Action | Statut |
|---|---|---|
| 🔴 Critique | Fermer l'accès public à la DB prod (infra) | À faire (infra) |
| 🟠 Haute | Étendre le rate limiting aux endpoints d'écriture | À faire |
| 🟠 Haute | CSP : viser nonces pour retirer `unsafe-inline`/`unsafe-eval` | Backlog |
| 🟢 Moyenne | `/guides` canonical + title/desc | ✅ Fait |
| 🟢 Moyenne | CSP `base-uri`/`object-src`/`form-action` | ✅ Fait |
| 🔵 Basse | Schema `Event` sur pages tournois | Backlog |

**Corrigé dans cette session** : canonical `/guides`, durcissement CSP (base-uri, object-src, form-action).
