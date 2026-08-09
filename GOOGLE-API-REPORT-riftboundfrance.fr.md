# Rapport Google APIs — riftboundfrance.fr

**Date : 2 août 2026** · Sources : Search Console (5 au 30 juillet, décalage 2-3 j), GA4 (5 juillet au 1er août), PageSpeed Insights v5 + données terrain Chrome, inspection d'URL sur 28 pages.

> Ce rapport remplace celui du 21 juillet.

## Correction de chiffre sur le rapport précédent

Le rapport du 21 juillet annonçait **63 clics** sur 23 juin - 18 juillet. C'est faux, et par ma faute : la requête croisait requête × page, une vue qui écarte toutes les recherches que Google anonymise. Sur la même période, le vrai total est **338 clics et 4 330 impressions**.

Le site allait donc cinq fois mieux que ce que je vous ai écrit. Ce rapport-ci compte les totaux par jour, la seule base juste. Les tableaux par requête restent sur la vue partielle : c'est la seule que Google publie à ce niveau de détail.

## Résumé

| Indicateur | 23 juin - 18 juil | 5 - 30 juillet | Évolution |
|---|---|---|---|
| Clics Search Console | 338 | **997** | ×2,9 |
| Impressions | 4 330 | **11 735** | ×2,7 |
| Taux de clic | 7,8 % | **8,5 %** | +0,7 pt |
| Sessions organiques GA4 | 132 | **325** | ×2,5 |
| Sessions par jour | 4,9 | **12,0** | ×2,4 |
| Lighthouse mobile / desktop | 87 / 100 | 84 / 95 | −3 / −5 |
| Accessibilité mobile | 91 | **100** | +9 |

Sur 28 jours glissants, le trafic a presque triplé. Fin juillet tourne à 80-95 clics par jour contre 25-45 début juillet. Rien dans les données ne signale un plafond.

## Nouveau : les données terrain Chrome sont enfin là

Le site avait trop peu de visiteurs Chrome pour que Google publie ses mesures réelles. Ce n'est plus le cas. Voici ce que vivent les vrais visiteurs, sur la page d'accueil :

| Mesure | Valeur réelle (p75) | Seuil | Verdict |
|---|---|---|---|
| Affichage du plus grand élément (LCP) | **1,00 s** | 2,5 s | vert |
| Réponse à l'interaction (INP) | **107 ms** | 200 ms | vert |
| Décalage visuel (CLS) | **0** | 0,1 | vert |
| Premier affichage (FCP) | 0,92 s | 1,8 s | vert |
| Temps de réponse serveur | 0,44 s | 0,8 s | vert |

**Les trois signaux Web essentiels sont au vert.** Le LCP mobile de 4,1 s que remonte Lighthouse est un chiffre de laboratoire, mesuré sur un réseau lent simulé. Chez les vrais visiteurs, il est à 1 seconde. Il n'y a plus rien à corriger côté performance : le sujet est clos.

Les scores Lighthouse baissent légèrement (mobile 87 → 84, desktop 100 → 95) mais c'est du bruit de mesure sur une seule exécution, contredit par le terrain. L'accessibilité passe elle de 91 à **100 sur mobile et desktop** : l'audit d'interface de fin juillet a porté.

## Search Console, 5 au 30 juillet

997 clics, 11 735 impressions, 8,5 % de taux de clic, position moyenne 6,0.

### Où va le trafic

| Section | Pages qui ressortent | Impressions | Clics | Taux de clic | Clics par page |
|---|---|---|---|---|---|
| Accueil | 1 | 3 641 | **315** | 8,7 % | **315** |
| Guides | 5 | 1 930 | 190 | 9,8 % | **38** |
| Cartes | 310 | 3 127 | 307 | 9,8 % | 0,99 |
| Tier list | 1 | 255 | 19 | 7,5 % | 19 |
| Légendes | 29 | 365 | 35 | 9,6 % | 1,21 |
| Articles | 15 | 402 | 21 | 5,2 % | 1,40 |
| Decks | 873 | 2 466 | 105 | 4,3 % | **0,12** |
| Tournois | 25 | 163 | 4 | 2,5 % | 0,16 |

Cinq guides rapportent 190 clics. 873 pages de decks en rapportent 105. Un guide vaut trois cents pages de deck.

### La cannibalisation n'a pas bougé, et j'avais mal visé le remède

| Requête | Impressions | Position | Page servie | Le hub dédié est à |
|---|---|---|---|---|
| riftbound deck | 297 | 8,6 | **accueil** | `/decks` : position 13,5 |
| deck riftbound | 267 | 9,2 | **accueil** | `/decks` : position 13,5 |
| tier list riftbound | 234 | 3,6 | **accueil** | `/tier-list` : position 8,0 |
| riftbound tier list | 172 | 3,9 | **accueil** | `/tier-list` : position 8,0 |

Les titres et les H1 de `/decks` et `/tier-list` sont pourtant bons, je les ai relus : « Decks Riftbound - Decklists compétitives », « Tier List Riftbound FR - Meilleures Légendes ». Le conseil du 21 juillet, corriger les titres, était donc à côté.

La vraie cause est dans la page d'accueil : elle affiche la tier list en entier et un bloc « Decks à la une ». Google y trouve la réponse complète, la sert, et n'a aucune raison d'aller chercher le hub. Ce n'est pas une erreur de balise, c'est du contenu en double.

Deux sorties possibles, et il faut choisir :

- **Assumer l'accueil comme destination.** Elle est en position 3,6 sur « tier list riftbound » quand `/tier-list` est à 8,0. Elle gagne. On garde, et on travaille son taux de clic.
- **Vider l'accueil de la tier list**, la remplacer par un aperçu de trois lignes et un lien. Le hub récupère alors le classement, mais on perd le confort d'affichage voulu au départ, et il y a plusieurs semaines de flottement le temps que Google réévalue.

Sur les chiffres, la première option est la plus sûre : la position 3,6 rapporte déjà 18 clics, quand la position 8,0 du hub n'en rapporte que 19 sur cinq fois moins d'impressions. Mon avis : garder l'accueil, arrêter d'essayer de la contrer.

Le cas de `/decks` est différent. Là, l'accueil est à 8,6-9,2 et ne convertit pas (6 clics pour 297 impressions). Personne ne gagne. Le bloc « Decks à la une » de l'accueil montre quelques listes au hasard, sans intérêt pour qui cherche « riftbound deck » ; le hub, lui, a la recherche, les filtres et les 22 000 listes. Ici, il faut couper le doublon.

### Ce qui plafonne faute de page

Requêtes qui rapportent des impressions et zéro clic :

| Requête | Impressions | Position |
|---|---|---|
| decklist riftbound | 46 | 8,5 |
| riftbound decklist | 42 | 6,1 |
| star crossed riftbound | 34 | 7,9 |
| riftbound premier pas | 29 | 12,5 |
| swain riftbound | 26 | 6,4 |
| tier list legend riftbound | 21 | 9,7 |
| deck leblanc | 16 | 6,7 |
| ocean drake riftbound | 15 | 5,2 |
| deck irelia | 12 | 6,7 |

Le motif est net : **nom de champion + deck**. Swain, LeBlanc, Irelia, chacun à quelques dizaines d'impressions, aucun clic. Ces gens cherchent une page « decks Swain », et le site n'en a pas : `/decks?legend=Swain...` n'est pas indexable, et `/legendes/swain-...` parle de la Légende, pas de ses decks. C'est le seul gisement de contenu identifiable dans les données, et il est mécanique : une page par Légende, une trentaine de pages.

## GA4, trafic organique, 5 juillet au 1er août

325 sessions, 239 visiteurs, 2 187 pages vues, 12 sessions par jour.

| Page d'entrée | Sessions | Engagement |
|---|---|---|
| `/` | 73 | 69,9 % |
| `/cartes` | 73 | 63,0 % |
| `/guides/debuter` | 24 | 50,0 % |
| `/guides/glossaire` | 19 | 21,1 % |
| `/decks` | 18 | 55,6 % |
| `/tier-list` | 10 | 40,0 % |
| `/guides/deckbuilding` | 9 | 22,2 % |

`/cartes` rattrape l'accueil. Le glossaire et le guide de deckbuilding retiennent mal (21 % et 22 % d'engagement) : les gens arrivent, lisent une définition, repartent. C'est normal pour un glossaire, moins pour un guide de deckbuilding qui devrait mener vers des decks.

**Même réserve que le mois dernier** : plusieurs pages comptent plus de sessions que de visiteurs distincts, avec 100 % de rebond. `/decks/best-of-atlanta-annie-dark-child` fait 8 sessions pour 1 visiteur. C'est du robot ou du rechargement. Le trafic humain est un peu sous les 325.

## Indexation : 6 % du sitemap est connu de Google

Le sitemap déclare **23 692 URL**, dont 22 457 pages de decks et 1 067 pages de cartes. Sur 28 jours, **1 417 pages** obtiennent au moins une impression, soit 6 %.

J'ai inspecté 28 URL auprès de Google. Les dix pages structurantes (accueil, `/cartes`, `/decks`, `/tier-list`, `/tournois`, les guides, un article, une Légende, un best-of) sont **toutes indexées, toutes en canonique correcte, aucune erreur d'exploration**. De ce côté, rien à signaler.

Sur un échantillon tiré au sort dans le reste :

| Type | Indexées | Inconnues de Google |
|---|---|---|
| Pages de decks | 3 | 9 |
| Pages de cartes | 3 | 3 |

Google connaît environ un quart des pages de decks. Ce n'est pas un bug, c'est un arbitrage de sa part : 22 000 listes qui se ressemblent, pour un site jeune, il en prend un échantillon et ignore le reste. Les pages de cartes s'en sortent mieux, mais la moitié seulement.

**Ce que ça coûte :** l'exploration passe sur des milliers de pages qui rapportent 0,12 clic chacune, pendant que les pages de cartes, à 1 clic chacune, sont indexées à moitié. C'est du budget d'exploration déplacé au mauvais endroit.

Je ne recommande pas de supprimer les pages de decks : elles servent aux joueurs, elles sont liées depuis les pages de tournoi, et elles ne pénalisent pas le site. Mais **elles n'ont rien à faire dans le sitemap à 22 000 exemplaires**. Un sitemap qui ne déclare que les pages qui comptent (cartes, Légendes, guides, articles, tournois, best-of, soit ~1 300 URL) dirige l'exploration là où elle rapporte.

### Résidu www

73 URL en `www.` apparaissent encore dans les résultats (246 impressions, 15 clics). La redirection est pourtant bonne : `https://www.riftboundfrance.fr/cartes` renvoie un **308** vers l'apex. Ce sont de vieilles entrées qui n'ont pas encore été remplacées. Rien à faire, ça s'efface tout seul.

## Où en sont les actions du 21 juillet

| Action | État |
|---|---|
| Capter « riftbound deck » sur `/decks` | **Non faite.** Titre et H1 corrects, mais l'accueil garde la position. Voir le diagnostic revu ci-dessus. |
| Pages de decks par Légende | **Non faite.** Aucune route `/decks/legende/...`. Le besoin est confirmé par les données. |
| Recherche texte sur `/decks` | **Faite.** Champ « Chercher un deck, une Légende, un joueur ou une carte » en place. |
| Désambiguïser `/tier-list` | **Faite côté balises, sans effet.** Le problème était ailleurs. |
| Continuer les best-of de tournoi | **Faite.** Le best-of de Hartford fait 7 clics pour 73 impressions ; le National Open S3 est publié. |
| Activer l'API Chrome UX Report | **Sans objet.** PageSpeed livre les données terrain sans elle. |

## Actions priorisées

1. **Haute — Une page de decks par Légende**, en URL propre (`/decks/legende/swain-...`), avec les meilleures listes de la Légende, son taux de présence et un lien vers sa fiche. Une trentaine de pages. C'est la seule demande visible dans les données qui n'a aucune page pour y répondre : Swain, LeBlanc, Irelia et compagnie cumulent une centaine d'impressions à zéro clic, en position 6-7. *Comment savoir si ça échoue :* si dans six semaines ces requêtes n'ont toujours aucun clic, c'est que les pages sont trop minces et il faudra y mettre du texte, pas seulement des listes. *À surveiller :* les clics de la section Légendes dans Search Console, aujourd'hui à 35.

2. **Haute — Retirer « Decks à la une » de l'accueil**, remplacé par un lien vers `/decks`. L'accueil est à 8,6 sur « riftbound deck » et ne convertit pas ; le hub, mieux armé, est bloqué à 13,5 derrière elle. Contrairement à la tier list, il n'y a rien à perdre : le bloc affiche des listes au hasard. *Comment savoir si ça échoue :* si `/decks` ne remonte pas au-dessus de la position 10 en six semaines, le doublon n'était pas la cause et il faudra chercher du côté des liens entrants. *Dépend de rien, à faire en premier.*

3. **Haute — Laisser la tier list sur l'accueil.** C'est un renoncement à l'action 4 du 21 juillet, pas un oubli. L'accueil est en position 3,6 sur ces requêtes, le hub en 8,0 : la déloger coûterait des places. À la place, soigner ce qui s'affiche dans Google pour l'accueil, puisque c'est elle qui reçoit la demande.

4. **Moyenne — Sortir les 22 457 pages de decks du sitemap**, ne garder que les cartes, Légendes, guides, articles, tournois et best-of. L'exploration se concentre sur ce qui rapporte. Les pages de decks restent en ligne et liées depuis les tournois. *Comment savoir si ça échoue :* si les impressions de la section Decks s'effondrent au-delà de la baisse attendue, remettre les best-of et les listes de Top 8 dans le sitemap. *À surveiller :* le taux d'indexation des pages de cartes, aujourd'hui à la moitié.

5. **Moyenne — Rattacher le guide de deckbuilding aux decks.** 22 % d'engagement, 9 sessions : les gens le lisent et repartent. Des liens en fin de guide vers des decks qui illustrent chaque principe le raccrocheraient au reste du site.

6. **Basse — Continuer les best-of de tournoi.** Le format tient : 9,8 % de taux de clic sur la section Articles et Guides, contre 4,3 % sur les decks bruts.

Rien à faire côté performance ni côté indexation des pages principales. Ces deux chantiers sont finis.

## Notes de fraîcheur et limites

- Search Console : décalage de 2 à 3 jours, d'où une fenêtre qui s'arrête au 30 juillet.
- Les tableaux par requête reposent sur la vue requête × page, qui écarte les recherches anonymisées : 226 clics visibles sur 997 réels. Les positions et le classement relatif restent justes, les volumes sont des minimums.
- Données terrain Chrome : moyenne glissante sur 28 jours, tous appareils confondus.
- Lighthouse : une seule mesure de laboratoire sur réseau simulé. En cas de contradiction avec le terrain, le terrain a raison.
- L'API Chrome UX Report seule renvoie toujours 403 (non activée sur le projet Google Cloud). Sans conséquence : PageSpeed sert les mêmes données.
- Taux d'indexation : estimé sur 18 URL tirées au sort. Ordre de grandeur, pas mesure exacte.
- GA4 : à lire avec la réserve sur les sessions sans visiteur distinct.
