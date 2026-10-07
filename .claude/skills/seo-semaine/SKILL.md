---
name: seo-semaine
description: La passe SEO hebdomadaire de Riftbound France. Relève Search Console, les conversions GA4 et DataForSEO, juge le dernier changement, recommande UN changement sur UNE page, puis attend le oui d'Allan. À utiliser pour « la passe SEO », « quelle page travailler », « le point SEO de la semaine », ou pour choisir et démonter une page.
---

# La passe SEO de la semaine

Les règles sont dans `AGENTS.md`, section « SEO : une page, un changement, une
semaine ». Ce fichier dit seulement dans quel ordre travailler.

## 0. Lire

`docs/seo/brief.md` (ce que le site doit produire), le haut de `docs/seo/journal.md`
(le dernier changement et sa date), `docs/seo/etat.json` (les relevés passés).

## 1. Relever

**Search Console** (Claude Code seulement : les scripts viennent du plugin `claude-seo`) :

```bash
S=$(ls -d ~/.claude/plugins/cache/agricidaniel-claude-seo/claude-seo/*/scripts | tail -1)
python $S/gsc_query.py --dimensions page --limit 5000 --json
python $S/gsc_query.py --dimensions query,page --limit 5000 --json
```

Il demande `~/.config/claude-seo/client_secret.json`. S'il manque, le dire et
continuer sans : ne pas remplacer ses chiffres par ceux de DataForSEO.

**Conversions GA4** : les événements du brief. `ga4_report.py` ne sait pas les sortir ;
les lire dans GA4 (Rapports > Engagement > Événements) ou par l'API Data (`runReport`,
dimensions `eventName` et `pagePath`).

**DataForSEO** (serveur MCP `dataforseo`) : `dataforseo_labs_google_ranked_keywords`,
cible `riftboundfrance.fr`, `France`, `fr`, `limit` 100. La réponse dépasse le contexte
et part dans un fichier : la trier par script, ne pas la lire à la main. Jamais de
crawl on-page, il vide le compte.

Ajouter le relevé daté dans `releves` de `etat.json`. Ne jamais écraser un ancien.

## 2. Juger le dernier changement

Comparer au relevé pris AVANT lui. Moins de deux semaines : ne rien conclure. Juger
sur les deux côtés à la fois, recherche et conversions (voir `AGENTS.md`).

## 3. Vérifier que la page n'a rien cassé

```bash
curl -s -o page.html -w "%{http_code}\n" -A "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" <url>
```

Code 200, `index, follow`, canonical sur elle-même, texte présent sans JavaScript.

## 4. Choisir une page (seulement s'il n'y en a pas en cours)

Les quatre contrôles du brief, dans l'ordre. Puis quatre passes sur la page retenue :

1. **Accès** : l'étape 3, plus l'inspection d'URL dans Search Console.
2. **Concurrence** : la SERP de sa requête principale (`serp_organic_live_advanced`),
   puis lire les pages en tête en entier (skill `firecrawl`). Ce qu'elles couvrent et
   pas nous, ce qu'on dit mieux.
3. **Réponses des IA** : la réponse en tête de chaque titre, des titres qui reprennent
   la question telle qu'on la tape. Pas de `llms.txt` ni de schéma pour ça.
4. **Conversion** : un chemin évident vers `clic_cardnexus`, assez haut sur la page.

## 5. Recommander, puis attendre

UN changement, chaque raison avec sa source (URL, requête, fichier, relevé). Rien
n'est rédigé ni publié avant le oui d'Allan.

## 6. Écrire le journal

Une entrée datée en haut de `docs/seo/journal.md` : fait, constats avec leurs sources,
recommandation, ce qui attend. Le changement mis en ligne y prend sa date de
déploiement, pas celle du commit.
