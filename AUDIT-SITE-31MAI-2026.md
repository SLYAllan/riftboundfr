# Audit site complet — 31 mai 2026 (pré-déploiement)

Audit du **dev local** (`localhost:3000` + repo) en vue du passage en production. Lancé via le plugin SEO (6 agents : technique, contenu/E-E-A-T, schema, GEO/IA, performance, sitemap) puis complété et vérifié manuellement sur les points bloquants pour le déploiement.

> Note méthode : les sous-agents SEO ont tourné mais sont revenus en cours de tâche (pas de reprise possible dans cet environnement). Les findings critiques ci-dessous ont donc tous été **re-vérifiés manuellement** (curl + lecture repo). Les pistes non bloquantes signalées par les agents sont listées en section « Recommandations ».

## ✅ Corrigé pendant cet audit (vérifié sur dev)

| # | Domaine | Problème | Correctif | Vérif |
|---|---------|----------|-----------|-------|
| 1 | Robots | `public/robots.txt` (statique) **masquait** `src/app/robots.ts` (dynamique, plus riche) → les règles explicites pour les crawlers IA (GPTBot, ClaudeBot, PerplexityBot, Applebot-Extended) étaient du code mort | Suppression de `public/robots.txt`. `robots.ts` est désormais actif (règles IA + sitemap basé sur `NEXT_PUBLIC_SITE_URL`). Disallow aligné sur `/admin` (sans slash) pour le wildcard | `curl /robots.txt` → règles IA présentes ✓ |
| 2 | Sitemap | La nouvelle page `/guides/meta` était **absente** du sitemap | Ajoutée dans `staticPages` (priorité 0.7, weekly) | `curl /sitemap.xml \| grep guides/meta` → 1 ✓ |
| 3 | GEO / llms.txt | `/guides/meta` absente de `llms.txt` | Ajoutée dans la section « Guides disponibles » | Lecture fichier ✓ |
| 4 | OG / images prod | La route `api/decklist-image` fetchait son fond via `req.nextUrl.origin` = host interne du container Coolify → `fetch failed` en boucle dans les logs prod | Lecture du PNG sur disque + inline en data URI (`readFile` + base64) | typecheck ✓ (effet réel après redeploy) |

## 🟢 Points sains (vérifiés, RAS)

- **En-têtes de sécurité** (`src/middleware.ts`) : CSP complète, HSTS (preload), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`. Solide.
- **`force-dynamic`** correctement posé sur les pages no-param qui interrogent la DB (`sitemap.ts`, `/tournois`) → évite le bug « page gelée vide au build Docker ».
- **`lang=fr`**, viewport mobile, `poweredByHeader: false`.
- **Sitemap** : génération dynamique avec fallback `staticPages` si DB indisponible (build Docker safe). ~9k URLs (cartes, decks, tournois, articles + statiques).
- **JSON-LD** présent : `layout.tsx` (Organization/WebSite) + `articles/[slug]` (Article).
- **Typecheck** : `tsc --noEmit` passe.
- **Nouvelle page `/guides/meta`** : HTTP 200, server component statique (pas de DB), sera prérendue.

## 🟡 Recommandations (non bloquantes pour ce déploiement)

### Données structurées (impact SEO/IA élevé, effort moyen)
- **BreadcrumbList** : absent partout. À ajouter globalement (fil d'Ariane) → rich results + meilleure compréhension IA.
- **FAQPage** sur les guides : les guides utilisent déjà des titres en questions (« Comment… ? », « C'est quoi… ? »). Les transformer en `FAQPage` JSON-LD = fort potentiel d'AI Overviews / rich snippets. Cible prioritaire : `/guides/debuter`, `/guides/deckbuilding`, `/guides/meta`, `/guides/domaines`.
- **Product / VideoGame / ItemList** : envisager sur `/cartes/[slug]` et les listes (`/tier-list`, `/decks`).

### Contenu / E-E-A-T
- Vérifier la présence d'un **auteur / entité éditrice** visible (page À propos, signature) pour renforcer E-E-A-T.
- Surveiller le **thin content** sur les pages de liste générées (cartes/decks) : s'assurer d'un minimum de texte unique indexable.

### Performance (analyse niveau code)
- Vérifier `priority` sur l'image LCP de la home et des articles (next/image), formats webp, dimensions explicites pour éviter le CLS.
- Auditer les composants `"use client"` qui pourraient rester server.
- `/tournois` rend beaucoup de chips de decks : surveiller le poids du payload (mais `force-dynamic` + DB OK).

### Lint
- Bruit ESLint pré-existant concentré dans les **scripts racine** (`parse-*.js`, `*-coverage.ts` : `no-explicit-any`, `no-require-imports`, unused vars) — hors build app, non bloquant.
- Route OG `decklist-image` : warnings `no-img-element` / `alt-text` **attendus** (satori impose `<img>`, pas `next/image`). À ignorer.

## État de déploiement

- **Bloquants** : aucun. Les 4 corrections sont faites et vérifiées.
- **Build prod** : autoritatif dans Docker/Coolify (déploiement manuel). Typecheck local OK ; build local non lancé pour ne pas écraser le `.next` du serveur dev en cours.
- **Rappel infra** : Coolify = déploiement **manuel** (pas d'auto-deploy). Un `git push` ne met rien en ligne tant qu'Allan ne clique pas Deploy. Le fix image OG ne prend effet qu'après redeploy.
