# Stratégie SEO — riftboundfrance.fr

**Date : 9 août 2026.** Un seul document, pas cinq. Le site a un seul opérateur : découper
la même stratégie en cinq fichiers produirait de la paperasse, pas des décisions.

Tout ce qui suit repose sur des mesures prises aujourd'hui : Search Console et GA4 sur
juillet, 825 mots-clés relevés chez DataForSEO, deux requêtes réelles posées à ChatGPT,
et l'état de la base.

## 1. Où en est le site

| Indicateur | Valeur (5-30 juillet) |
|---|---|
| Clics | 997 |
| Impressions | 11 735 |
| Taux de clic | 8,5 % |
| Position moyenne | 6,0 |
| Sessions organiques (GA4) | 325 |
| Pages avec au moins une impression | 1 417 |
| URL au sitemap | 2 407 (contre 23 751 avant aujourd'hui) |

Le trafic a triplé en un mois. Les signaux Web essentiels sont au vert sur le terrain.
L'indexation des pages structurantes est propre. **Aucun chantier technique n'est ouvert.**

Et le site est déjà cité par ChatGPT en français, dans 5 sources sur 10, nommé « la
meilleure ressource française ». Voir `GEO-ANALYSIS.md`.

## 2. Le paysage réel

Les domaines qui partagent les pages de résultats du site se rangent en trois familles :

| Famille | Domaines | Ce qu'ils tiennent |
|---|---|---|
| Boutiques | play-in.com, philibertnet.com, destocktcg.fr, maxireves.fr | Tout l'achat : display, booster, précommande |
| Riot | playriftbound.com, riotgames.com, leagueoflegends.com | L'officiel : règles, annonces, localisateur de boutiques |
| Contenu | **riftbound.gg** | Le seul vrai concurrent éditorial, et il est petit (61 mots-clés connus) |

**Conséquence directe.** La plus grosse poche de recherche française, environ 9 000
requêtes par mois autour de l'achat, appartient aux boutiques. La page de résultats de
« display riftbound » est à 100 % marchande. Un site communautaire n'y a pas de place, et
tenter d'y aller gaspillerait des mois. **On n'y va pas.**

En face, la famille éditoriale est quasi vide en français. C'est là que tout se joue.

## 3. Les trois piliers

### Pilier 1 — La donnée agrégée (à défendre)

C'est déjà l'actif. 22 500 listes et plus de 95 tournois, que personne d'autre n'a en
français. ChatGPT cite le site précisément parce qu'il y trouve des chiffres introuvables
ailleurs : « 8 % du field », « 19 Top 8 ».

Trois choses à corriger, toutes petites :

- **Aucun tableau sur le site.** ChatGPT a dû fabriquer le sien à partir de la prose. Un
  tableau déjà formé est repris tel quel.
- **Les chiffres de `/guides/meta` sont écrits en dur** et périmés : les IA propagent
  « 21 000 listes et 88 tournois » alors qu'on en a 22 500 et 95. À rendre depuis la base.
- **Pas de date de mise à jour sur les guides**, alors que `/guides/meta` est la page la
  plus citée.

*Comment savoir si ça échoue :* si dans deux mois la même question à ChatGPT ne cite plus
le site, c'est que la fraîcheur a pris le dessus et qu'il faut publier plus souvent.

### Pilier 2 — Où jouer (à créer)

Environ 1 200 recherches par mois sur « riftbound locator », « riftbound events »,
« tournoi riftbound », jusqu'à « tournoi riftbound lille ». La page de résultats Google ne
compte que **90 résultats au total**, avec un fil Reddit en quatrième position et rien en
français. Et ChatGPT ne cite pas le site sur cette question : il se rabat sur Riot.

Le site a un article sur le Rift Tour, mais c'est une actualité, pas un annuaire. Ce qui
manque : les boutiques, les villes, les dates.

*Comment savoir si ça échoue :* si après six semaines la page n'apparaît ni dans Google ni
dans les réponses d'IA, c'est qu'elle manque de lieux concrets, pas de texte.
*Dépend de :* rien. À faire en premier.

### Pilier 3 — Les portes d'entrée du jeu (à créer)

- **Proving Grounds** : environ 1 900 recherches par mois, aucune page. Le set est en base
  avec ses 24 cartes.
- **Decks de départ** : environ 180 par mois, dont le détail par champion.
- **Règles** : environ 900 par mois, servies par `/guides/debuter` mais sans date ni
  tableau.

L'article Proving Grounds publié aujourd'hui traite des quatre Légendes du set. Il manque
la page sur le **set lui-même**, qui est ce que les gens cherchent.

## 4. Ce qui est déjà couvert, et qu'il ne faut pas refaire

Le long tail « champion + deck » (Viktor 170 par mois, Kai'Sa 70, Vex et Teemo 60, et une
douzaine d'autres) est **entièrement couvert** : les dix-huit champions cherchés ont déjà
leur page de Légende. Le problème n'est pas la couverture, c'est que ces pages ne captent
pas encore. Nuance importante : les gens tapent le nom du **champion**, pas celui de la
Légende complète. Chaque page doit traiter le nom court.

## 5. Architecture

Rien à refondre. Trois ajouts :

```
/ou-jouer                    nouveau, pilier 2
/guides/proving-grounds      nouveau, pilier 3
/meta                        à transformer en page de statistiques citable
```

Le sitemap est passé de 23 751 à 2 407 URL aujourd'hui : les 22 500 listes brutes en
sortent, seuls les best-of et les Top 8 restent. L'exploration se concentre enfin sur ce
qui rapporte. Ne pas revenir en arrière.

## 6. Feuille de route

Calibrée pour une personne seule, pas pour une équipe.

**Semaines 1-2, ce qui est déjà écrit.** Déployer les trois actions du jour : accueil,
sitemap, guide de deckbuilding. Publier l'article Proving Grounds. Corriger l'identité de
l'auteur dans les données structurées.

**Semaines 3-6, le pilier 2.** La page « où jouer », avec les boutiques du Rift Tour, les
villes et les dates. C'est le seul terrain vide de la liste.

**Semaines 7-12, le pilier 3 et la donnée.** La page Proving Grounds, la page de
statistiques bâtie sur `/meta`, les tableaux, les dates de mise à jour.

**Mois 4-6, l'autorité.** Reddit, Discord et les créateurs francophones, à la main, cinq
liens bien choisis. Pas de prospection automatisée : le monde Riftbound francophone tient
en vingt sites, la réputation est le seul actif.

## 7. Objectifs

| Indicateur | Aujourd'hui | 3 mois | 6 mois | 12 mois |
|---|---|---|---|---|
| Clics mensuels | 997 | 1 800 | 3 000 | 6 000 |
| Impressions | 11 735 | 20 000 | 35 000 | 70 000 |
| Position moyenne | 6,0 | 5,5 | 5,0 | 4,5 |
| Pages avec impressions | 1 417 | 1 800 | 2 200 | 2 400 |
| Citations dans ChatGPT (sur 5 requêtes types) | 1 sur 2 testées | 3 sur 5 | 4 sur 5 | 4 sur 5 |
| Signaux Web essentiels | vert | vert | vert | vert |

Les cibles de clics supposent que les trois piliers tiennent. Elles n'ont rien
d'automatique : le triplement de juillet vient d'un site jeune qui sort de zéro, ce rythme
ne se maintient pas mécaniquement.

## 8. Ce qu'on ne fait pas

- **L'achat et les prix.** La page de résultats appartient aux boutiques.
- **Les pages de matchups générées** (30 Légendes = 435 pages minces) alors que Google
  n'indexe déjà qu'un quart des pages de decks.
- **La prospection par courriel et les réseaux d'échange de liens.**
- **Les gabarits SaaS** (alternative à X, X vs Y, intégrations, taille d'entreprise) :
  environ 70 % ne se transposent pas sur un site de jeu de cartes.

## 9. Ce qu'il faut surveiller sans relancer d'audit

- Les clics de la section Légendes dans Search Console, aujourd'hui à 35.
- La position de `/decks`, bloquée à 13,5 derrière l'accueil.
- Le taux d'indexation des pages de cartes, à la moitié.
- Une fois par mois : poser les mêmes questions à ChatGPT et compter les citations.
