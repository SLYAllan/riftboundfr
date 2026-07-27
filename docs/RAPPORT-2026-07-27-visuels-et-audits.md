# Rapport du 27 juillet 2026 — visuels réseaux, audits de données

## Ce qui est en ligne

Quatre commits poussés sur `main`, de `310b14cf` à `5da09455`.

### Visuels de tier list (1600x1600)

`scripts/gen-tierlist-image.mts`, deux sets rendus : Armes spirituelles et
Déchaînement. Ce qui a changé par rapport à la version précédente :

- maquette dessinée en 1000 px, rendue en 1600 par `html { zoom }` : tout est
  rasterisé à la taille finale, rien n'est agrandi après coup ;
- les tiers de plus de huit Légendes passent sur deux rangées de taille égale, ce qui
  fait des icônes de 85 px au lieu de 57, toutes identiques, sans orphelin en bout de
  ligne ;
- alignement à gauche partout : l'ordre à l'intérieur d'un tier veut dire quelque
  chose ;
- couleurs chaud vers froid (S rouge, A orange, B jaune, C vert, D bleu) : le
  classement se lit sans relire les lettres ;
- verre et ombres conservés, halos colorés retirés — ils faisaient image générée ;
- noms de set en français, numéro de saison en sur-titre ;
- ligne de crédibilité en bas : « 33 tournois · 9 555 résultats · du 22/03 au 19/07 »,
  lue dans `data/tier-source-counts.json` qu'écrit `scripts/tier-unleashed.py` ;
- un fichier `-alt.txt` par visuel, à coller dans l'alt du tweet : le contenu d'une
  image n'est pas indexable.

On parle de **résultats** et non de decklists : les tiers sont calculés sur les
classements complets (rang + Légende), et tous les joueurs classés ne publient pas
leur liste — Hartford n'en a que 142 sur 1 659.

### Images de deck (2000x2000)

L'export du site, `GET /api/decklist-image?slug=`, passe de 1000 à 2000 px. La mise
en page ne bouge pas, toutes ses dimensions sont doublées. À 1000 px le texte des
cartes devenait illisible après la recompression de X.

Neuf decks sortis avec cet export, dans `content/tweets/images/decks/` : trois par
set, Légendes toutes différentes, tous vainqueurs de tournoi, choisis par tier puis
par taille du tournoi.

| Set | Decks |
| --- | --- |
| Origines | Kai'Sa (Shanghai National Open) · Master Yi (Hangzhou RO) · Annie (Houston RQ) |
| Armes spirituelles | Draven (Las Vegas RQ) · Irelia (Shenzhen National Open S2) · Kai'Sa (Dalian RO) |
| Déchaînement | Irelia (National Open S3) · Master Yi (Hartford RQ) · Diana (Vancouver RQ) |

## Audits

### Les tier lists tiennent

`scripts/audit-tier-lists.mts` compare les tiers publiés aux decks : part de méta,
conversion en top 8, Légendes jouées sans classement.

Le classement Déchaînement est rigoureusement aligné sur `scripts/tier-unleashed.py` :
le S regroupe les trois meilleures conversions à gros volume (Irelia 4,7 %, Diana
4,4 %, Yi 4,3 %), le A les six suivantes, le B tourne autour de la moyenne de 2,76 %,
le C passe dessous avec au moins un top 8, le D n'en a aucun. Origines et la Globale
sont cohérents aussi.

Seul point discutable : sur Armes spirituelles, quatre Légendes classées C convertissent
au-dessus de la médiane du set (Miss Fortune 3,4 %, Jax 3,0 %, Sett 2,8 %, Lux 2,4 %
contre 1,5 %). Sur deux à quatre top 8 chacune, c'est du bruit ; à surveiller au
prochain lot de tournois. Sur Origines, Darius est premier en conversion (5,1 %,
9 top 8 sur 177 decks) et classé B : le seul vrai candidat à une montée.

Contrôles annexes : aucun doublon, aucun tier hors S/A/B/C/D, aucune Légende jouée
sans classement, quatre tier lists à jour au 21 juillet, soit après le National Open.
Le générateur d'images refuse désormais de tourner si une Légende n'a pas d'icône —
il retombait sans rien dire sur celle d'Irelia.

### Six tournois rangés sous le mauvais set

`src/lib/tournament-flags.ts` contredisait le `setTag` des decks. Le filtre par set du
site les classait donc au mauvais endroit.

| Tournoi | date | disait | corrigé en |
| --- | --- | --- | --- |
| RQ Bologna | 21/02 | Unleashed | Spiritforged |
| RQ Las Vegas | 01/03 | Unleashed | Spiritforged |
| Shenzhen National Open S2 | 22/03 | Unleashed | Spiritforged |
| RQ Lille | 18/04 | Unleashed | Spiritforged |
| RQ Atlanta | 29/04 | Unleashed | Spiritforged |
| Xi'an Regional Open S3 | 24/05 | Spiritforged | Unleashed |

Méthode : quatorze Légendes n'existent que dans Déchaînement. Sydney en compte douze
sur trente-six decks, Lille zéro sur soixante-sept, Atlanta zéro sur cent
vingt-quatre, Shenzhen zéro sur deux mille quarante et un.

Au passage, le chevauchement des périodes entre sets est réel et ne vient pas de la
Chine : Sydney passe sur S3 dès le 22 mars, la Chine le 18 avril, et l'Europe et les
États-Unis finissent S2 jusqu'au 29 avril.

### Tirets cadratins

Vingt-deux mille titres de deck étaient du type « Légende — Tournoi ». Le tiret
cadratin n'a rien à faire dans le contenu rendu. Corrigé **en local et en prod**
(22 433 et 22 416 titres, plus un commentaire de tier list de chaque côté), et les
onze scripts de seed qui le produisaient utilisent maintenant un point médian.

Six titres gardent un tiret des deux côtés : ce sont des pseudos de joueurs
(`DWT—神切—阿龙`), on n'y touche pas.

### Master Yi : c'est le local qui avait dérivé

La base locale disait 69 Wuju Master, la prod 83. Le premier réflexe était de croire
la prod en retard. C'est l'inverse.

Le scrape brut `data/raw-scrapes/s3-xian-regional-open/` donne 11 Wuju Master et 54
Bladesman, et les JSON de `data/decklists/` concordent à 100 % avec lui. Seule la base
locale avait divergé : le commit `273442c9` avait basculé en Bladesman quatorze decks
qui jouaient réellement Wuju Master. Ils sont remis d'aplomb en local (11 à Xi'an,
2 aux Shenzhen City Challenges, 1 best-of), retour à 83 comme la prod.

**Rien n'a été écrit en prod sur ce point.** La seule écriture prod de la journée
reste la correction des tirets.

## Ce qui reste ouvert

- Confirmer que « Armes spirituelles » et « Déchaînement » sont bien les traductions
  officielles Riot : elles n'ont pas été vérifiées.
- Les crops des icônes de Légende ne sont pas homogènes (gros plans contre plans
  larges). C'est un travail sur les fichiers de `public/img/legend_icon/`.
- Écart de volume entre les bases : 22 456 decks en prod, 22 511 en local.
- Les neuf images de deck pèsent environ 4,5 Mo pièce, soit 40 Mo entrés dans le
  dépôt. À sortir du versionnement si la pratique se répète.

## Deux leçons de méthode

**L'outil existait déjà, deux fois.** Un générateur de visuel de deck a été écrit
puis jeté alors que `/api/decklist-image` faisait le travail ; un script de correction
Master Yi a été écrit alors que `scripts/fix-master-yi-from-sources.mts` existait. La
règle est inscrite en tête d'`AGENTS.md` : chercher l'outil avant d'en écrire un, ne
jamais deviner un format ou un chemin.

**Quand deux bases divergent, aucune n'est présumée juste.** On tranche par
`data/raw-scrapes/`, jamais par le raisonnement.
