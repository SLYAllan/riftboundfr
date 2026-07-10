# Rapport Google APIs — riftboundfrance.fr

**Date : 10 juillet 2026** · Sources : Search Console (28 j, décalage 2-3 j), GA4 (12 juin → 9 juil), PageSpeed Insights v5 (lab, à l'instant T). CrUX indisponible (voir Notes).

## Résumé

| Indicateur | Valeur |
|---|---|
| Clics GSC (28 j) | 25 |
| Impressions GSC (28 j) | 414 |
| Requêtes distinctes | 193 lignes requête×page |
| Sessions organiques GA4 (28 j) | 102 (78 utilisateurs, 568 pages vues) |
| Lighthouse SEO | 100/100 (mobile et desktop) |
| Lighthouse Performance | 73 mobile · **38 desktop** |
| Sitemap | 20 356 URLs soumises, 0 erreur, 0 avertissement |

Le site est jeune en organique : le volume est faible mais la trajectoire est saine (positions 4-10 sur beaucoup de requêtes à intention forte). Le point noir est la performance desktop et le poids des pages.

## Search Console

### Requête phare
- **best of hartford** : position 1, CTR 75 % (9 clics / 12 impressions) sur l'article Best of Hartford. Le format "best of" convertit très bien en SERP.

### Quick wins (position 4-10, ≥ 5 impressions, 0 ou peu de clics)

| Requête | Pos. | Impr. | Page |
|---|---|---|---|
| riftbound france | 8,4 | 31 | / |
| top deck riftbound | 6,1 | 10 | / |
| linsanity riftbound | 6,8 | 9 | deck Viktor Las Vegas |
| liste carte riftbound fr | 5,1 | 8 | /cartes |
| riftbound tier list | 7,5 | 8 | / |
| riftbound premier pas | 10,6 | 11 | /guides/debuter |
| tier list deck riftbound | 9,3 | 6 | / |
| moonfall riftbound | 9 | 7 | /cartes/unl-198-219 |
| mirru pyke | 6,7 | 6 | deck Mirru Hartford |

Lecture : les requêtes **"tier list riftbound"** et **"top deck riftbound"** atterrissent sur la home au lieu de `/tier-list` — la home cannibalise. Renforcer le maillage interne et le title de `/tier-list` (inclure "Tier list Riftbound" explicitement) devrait faire ranker la bonne page et gagner ces positions 6-9.

Autre lecture : la requête de marque "riftbound france" n'est qu'en position 8,4 — normal pour un domaine récent, ça montera seul avec les mentions/backlinks.

### Signal technique : www non redirigé
`https://www.riftboundfrance.fr/...` répond **200 sans redirection** et Google indexe/affiche des URLs en www (ex. deck Lux Hartford, 7 impressions). La canonical pointe bien vers l'apex (dégâts limités), mais une **redirection 301 www → apex** au niveau Coolify/Traefik consoliderait les signaux au lieu de les diluer.

## GA4 — Trafic organique (28 j)

- 102 sessions, 78 utilisateurs, ~3,8 sessions/jour, stable sur la période.
- Top landing pages : `/` (36 sessions, engagement 86 %), `/cartes` (12), `/guides/debuter` (7), article Vancouver (6), deck Irelia Hartford (6).
- Les pages decks individuelles ont un fort taux de rebond (80-100 %) : les visiteurs consultent la liste et repartent. Un bloc "decks similaires / autres decks de la légende" en bas de page deck retiendrait une partie de ce trafic.

## Performance (Lighthouse lab, home)

| Métrique | Mobile | Desktop |
|---|---|---|
| Performance | 73 | **38** |
| LCP (lab) | 60,0 s* | 17,3 s* |
| TBT | 10 ms | **3 770 ms** |
| CLS | 0 | 0,002 |
| FCP | 1,2 s | 0,6 s |
| Poids total | **23,1 Mo** | **28,2 Mo** |

*Les LCP lab aberrants (60 s / 17 s) indiquent qu'un élément candidat LCP se charge très tard — typiquement une image lourde ou lazy-loadée dans le hero/carrousel. Le vrai problème mesurable est le **poids de page de 23-28 Mo** (Lighthouse le classe "enormous network payload") et les 7,4 s de main-thread desktop. Piste probable : images de cartes/bannières servies en pleine résolution sur la home. À vérifier : dimensionnement `next/image`, formats WebP/AVIF, et surtout combien d'images la home charge d'un coup.

Accessibilité 91-96, Best practices 96, SEO 100 : rien à signaler.

## Sitemap

20 356 URLs soumises, 0 erreur, 0 avertissement (soumis le 14 juin). Le compteur "indexed: 0" de l'API est un champ déprécié par Google, pas un signal d'alerte — l'indexation réelle se lit dans le rapport Couverture ou via URL Inspection.

## Actions priorisées

1. **Haute — Poids de page home (23-28 Mo)** : identifier et compresser/lazy-loader les images responsables. Vérifiable : re-run PSI, viser < 3 Mo et perf desktop > 70.
2. **Haute — 301 www → apex** dans la config du reverse proxy. Vérifiable : `curl -I https://www.riftboundfrance.fr` doit renvoyer 301.
3. **Moyenne — Désambiguïser /tier-list vs home** : title + H1 "Tier list Riftbound" sur `/tier-list`, liens internes "tier list" pointant vers la page dédiée. Indicateur : dans 3-4 semaines, GSC doit montrer `/tier-list` sur les requêtes "tier list riftbound".
4. **Moyenne — Bloc decks liés en bas des pages deck** pour réduire le rebond 80-100 %.
5. **Basse — Activer l'API Chrome UX Report** sur le projet GCP (la clé renvoie 403) pour obtenir les vraies données terrain quand le trafic suffira.

## Notes de fraîcheur / limites

- CrUX : **403 Forbidden** = l'API "Chrome UX Report" n'est pas activée sur le projet GCP de la clé (ce n'est pas un manque de trafic, qui donnerait 404). Même activée, le site n'a probablement pas encore assez de trafic Chrome pour des données terrain.
- GSC : décalage de 2-3 jours sur les données Search Analytics.
- Lighthouse : données lab (une seule mesure, réseau simulé), pas des données utilisateurs réels.
