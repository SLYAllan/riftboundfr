# Rapport Google APIs — riftboundfrance.fr

**Date : 21 juillet 2026** · Sources : Search Console (23 juin au 18 juillet, décalage 2-3 j), GA4 (23 juin au 20 juillet), PageSpeed Insights v5 (lab, à l'instant T). CrUX toujours indisponible (voir Notes).

> Ce rapport remplace celui du 10 juillet. Les valeurs de cette date sont conservées en colonne « avant » pour lire l'évolution.

## Résumé

| Indicateur | 10 juillet | 21 juillet | Évolution |
|---|---|---|---|
| Clics Search Console | 25 | **63** | ×2,5 |
| Impressions | 414 | **1 070** | ×2,6 |
| Taux de clic | 6,0 % | 5,9 % | stable |
| Sessions organiques GA4 | 102 | **132** | +29 % |
| Lighthouse performance mobile | 73 | **87** | +14 |
| Lighthouse performance desktop | **38** | **100** | +62 |
| Poids de la page d'accueil | **23-28 Mo** | **731 Ko** | −97 % |

Le trafic a plus que doublé en onze jours et les trois actions techniques du rapport précédent sont faites et vérifiées. Le sujet n'est plus la technique, c'est le ciblage des pages.

## Ce qui a été corrigé depuis le 10 juillet

Les trois actions prioritaires du précédent rapport ont été appliquées et mesurées :

1. **Poids de la page d'accueil** : 23-28 Mo à **731 Ko en mobile et 689 Ko en desktop**. Lighthouse ne signale plus de charge réseau excessive. Le score desktop passe de 38 à **100**, le blocage du fil principal de 3 770 ms à **0 ms**, et le LCP desktop de 17,3 s à **0,5 s**.
2. **Redirection www** : `https://www.riftboundfrance.fr/` renvoie bien un **308 vers l'apex**. Les signaux ne se diluent plus sur deux domaines.
3. **Blocs de decks liés** en bas des pages deck : en place.

Reste ouvert : la désambiguïsation de `/tier-list` face à l'accueil, et l'activation de l'API Chrome UX Report.

## Search Console, 23 juin au 18 juillet

63 clics, 1 070 impressions, 5,89 % de taux de clic, 330 lignes requête sur page.

| Requête | Clics | Impressions | Position | Page qui ressort |
|---|---|---|---|---|
| best of hartford | 10 | 13 | **1,0** | article Best of Hartford |
| deck riftbound fr | 8 | 23 | 3,3 | accueil |
| riftbound france | 7 | 24 | 10,3 | accueil |
| riftbound tier list | 7 | 52 | 4,3 | **accueil** |
| tier list riftbound | 6 | 57 | 4,0 | **accueil** |
| liste carte riftbound fr | 4 | 14 | 5,2 | /cartes |
| **riftbound deck** | **1** | **86** | **9,5** | accueil |

### Le gisement principal : « riftbound deck »

86 impressions, la plus forte demande du mois, pour **1 seul clic** en position 9,5. Aucune autre requête n'approche ce volume. C'est le premier levier du site.

### La cannibalisation persiste, et elle est chiffrée

« riftbound tier list » et « tier list riftbound » cumulent **109 impressions et 13 clics**, en position 4,0 à 4,3. Google renvoie vers **l'accueil**, jamais vers `/tier-list`, qui n'a récolté que **3 sessions** sur la période. Même schéma pour les requêtes deck, qui atterrissent sur l'accueil au lieu de `/decks`.

Le contenu existe et se classe bien. C'est la page de destination qui est la mauvaise.

### Le format qui gagne

« best of hartford » sort **premier**, avec 10 clics pour 13 impressions, soit **77 % de taux de clic**, le meilleur rendement du site. Les articles best-of de tournoi sont ce qui fonctionne le mieux, et personne ne couvre ces tournois en français.

## GA4, trafic organique, 23 juin au 20 juillet

132 sessions, 102 visiteurs, 677 pages vues, 4,9 sessions par jour.

| Page d'entrée | Sessions | Engagement |
|---|---|---|
| `/` | 38 | 78,9 % |
| `/cartes` | 21 | 61,9 % |
| `/decks` | 10 | 40,0 % |
| `/guides/debuter` | 8 | 62,5 % |
| `/guides/glossaire` | 7 | 42,9 % |
| `/tier-list` | **3** | 66,7 % |

**Réserve sur ces chiffres** : plusieurs pages affichent plus de sessions que de visiteurs, avec 100 % de rebond. Par exemple `/articles/recap-regional-qualifier-vancouver` compte 10 sessions pour **1 seul visiteur**. C'est du rechargement ou du robot. Le trafic humain réel est donc un peu sous les 132 sessions.

## Performance, mesures Lighthouse du 21 juillet

| Métrique | Mobile | Desktop |
|---|---|---|
| Performance | 87 | **100** |
| Accessibilité | 91 | 96 |
| Bonnes pratiques | 96 | 96 |
| SEO | 100 | 100 |
| LCP | 3,8 s | 0,5 s |
| Blocage du fil principal | 20 ms | 0 ms |
| Décalage visuel | 0 | 0,002 |
| Poids total | 731 Ko | 689 Ko |

Lighthouse ne remonte plus aucune opportunité d'optimisation. Le seul point encore perfectible est le LCP mobile à 3,8 s, contre 2,5 s recommandés.

## Actions priorisées

1. **Haute — Capter « riftbound deck »** (86 impressions, position 9,5). Faire de `/decks` la page qui répond à cette requête : titre et H1 explicites, et surtout un vrai contenu d'introduction sur la page, aujourd'hui réduite à des filtres. *Comment savoir si ça échoue :* si dans un mois `/decks` n'apparaît toujours pas dans Search Console sur cette requête, c'est que l'accueil garde la main et il faudra alléger son ciblage.
2. **Haute — Créer des pages par légende** (`/decks/legende/master-yi-wuju-bladesman` plutôt que `?legend=`). Une quarantaine de pages indexables visant « deck master yi riftbound » et équivalents. Le signal existe déjà : « deck master yi » rapporte des clics, mais sur un article, pas sur une page de decks. *Dépend de l'action 1*, même problème de ciblage.
3. **Moyenne — Ajouter une recherche texte sur `/decks`**, y compris par nom de carte. Aucun champ de saisie n'existe aujourd'hui. *Indicateur :* part des sessions `/decks` qui utilisent le paramètre de recherche.
4. **Moyenne — Désambiguïser `/tier-list`** face à l'accueil : titre et H1 « Tier list Riftbound », liens internes pointant vers la page dédiée. Action déjà listée le 10 juillet, non faite. 109 impressions en jeu.
5. **Moyenne — Continuer les best-of de tournoi**, le format au meilleur rendement. Le S3 National Open, plus gros tournoi Unleashed jamais joué avec 2 048 joueurs, est en cours de récupération.
6. **Basse — Activer l'API Chrome UX Report** sur le projet Google Cloud (la clé renvoie 403).

## Notes de fraîcheur et limites

- CrUX : **403 Forbidden**, l'API Chrome UX Report n'est pas activée sur le projet de la clé. Ce n'est pas un manque de trafic, qui donnerait un 404.
- Search Console : décalage de 2 à 3 jours.
- Lighthouse : données de laboratoire, une seule mesure sur réseau simulé, pas des visiteurs réels.
- GA4 : chiffres à lire avec la réserve ci-dessus sur les sessions sans visiteur distinct.
