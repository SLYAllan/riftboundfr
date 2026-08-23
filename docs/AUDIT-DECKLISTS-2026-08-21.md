# Audit des sources de decklists du 21 août 2026

## Portée

L'audit compare les sources Riftdecks aux scrapes bruts et aux decklists de
Riftbound France.

- 91 sources historiques relues avec les captures Firecrawl du 21 août ;
- 15 sources Vendetta relues en entier, soit 28 pages de tournoi ;
- 2 nouvelles pages de deck relues séparément ;
- les nouvelles listes vérifiées ont ensuite suivi le pipeline local.

Les fichiers Firecrawl restent dans `.firecrawl/`, hors Git. Les scrapes bruts de
`data/raw-scrapes/` restent la source de vérité.

## Résultat Vendetta

Une seule source a changé : Riftbound Showdown Ottawa compte maintenant 527 liens
de deck contre 525 lors du scrape brut.

| Rang | Joueur | Légende | Source | État |
|---:|---|---|---|---|
| 279 | Steen | Draven, Glorious Executioner | [deck 225737](https://riftdecks.com/riftbound-metagame/deck-draven-glorious-executioner-225737) | complète, absente du site |
| 392 | Jee D Ferrari | Kennen, Heart of the Tempest | [deck 225888](https://riftdecks.com/riftbound-metagame/deck-kennen-heart-of-the-tempest-225888) | complète, absente du site |

Les deux listes portent chacune :

- 39 cartes dans le deck principal ;
- 1 Champion ;
- 12 runes ;
- 3 Champs de bataille ;
- 10 cartes en réserve.

Les deux listes ont été ajoutées aux scrapes bruts, converties, validées et
seedées dans la base locale. Ottawa compte maintenant 40 listes publiées.

Les 14 autres sources Vendetta n'ont pas changé : même nombre de liens, aucun
lien retiré et aucun rang modifié.

## Sources historiques

Deux sources portent plus de liens qu'au moment du scrape brut :

| Source | Avant | Maintenant | Écart |
|---|---:|---:|---:|
| Atlanta Regional Qualifier | 56 | 101 | +45 |
| Lille Regional Qualifier | 63 | 144 | +81 |

Ces liens sont bien présents sur les pages actuelles. Les 46 pages absentes à
Atlanta et les 82 pages absentes à Lille ont été scrapées. Le parseur retient
101 listes Atlanta et 144 listes Lille, toutes vérifiées contre leur source brute.

Trois anciens fichiers Atlanta ne correspondaient pas aux pages désormais
disponibles. Ils ont été supprimés. Quatre-vingt-dix-neuf doublons anciens ont
aussi été retirés au profit des fichiers issus du parseur commun.

Le seed de production porte 101 listes pour `Atlanta Regional Qualifier`, 144
pour `Lille Regional Qualifier` et 40 pour Ottawa. Les 204 anciens imports sans
source qui doublaient Atlanta et Lille ont été supprimés. Chaque RQ garde 28
best-of, un par Légende.

Aucun changement de rang n'a été trouvé parmi les decklists déjà présentes sur
Riftbound France.

## Faux écarts écartés

Le compteur de pagination de Riftdecks compte les joueurs classés, pas les
decklists disponibles. Il ne faut donc pas comparer ce total à
`decklistsPublished`.

Cette erreur aurait annoncé à tort de fortes hausses sur Atlanta, Hartford, Lille
et le National Open S3. Le contrôle par URL de deck remplace ce calcul.

Certaines anciennes pages n'écrivent que trois liens de deck dans le format lu
par Firecrawl alors que leur scrape brut en porte plus de cent. L'audit ne traite
pas ces absences comme des suppressions : le format de la page ne permet pas de
les confirmer.

## Validation locale

Le validateur global donne :

```text
verified=22853  MISMATCH(fabriqué?)=0  réserve Vendetta incomplète=0  unverifiable(pas de source brute)=1161
```

La passe limitée à Vendetta donne :

```text
verified=1673  MISMATCH(fabriqué?)=0  réserve Vendetta incomplète=0  unverifiable(pas de source brute)=0
```

Le corpus Vendetta publié correspond donc à ses sources brutes, nouvelles listes
Ottawa comprises.
