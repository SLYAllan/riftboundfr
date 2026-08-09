# Analyse GEO — riftboundfrance.fr

**Date : 9 août 2026** · Production · Sources : robots.txt et llms.txt en ligne, HTML rendu
de 5 pages, deux requêtes réelles passées à ChatGPT avec recherche web (France, français),
via DataForSEO. Coût : 0,02 $.

> Le cadre est celui de Google : optimiser pour les réponses génératives, c'est du SEO
> appliqué à une nouvelle surface, pas une discipline séparée. Rien ici ne repose sur des
> recettes propres aux IA.

## Score de disponibilité GEO : 73/100

| Critère | Poids | Note | Ce qui la justifie |
|---|---|---|---|
| Accessibilité technique | 20 % | **19/20** | Rendu serveur complet, tous les robots d'IA autorisés |
| Citabilité | 25 % | **20/25** | Citations réelles constatées, mais dates et tableaux absents |
| Lisibilité structurelle | 20 % | **13/20** | `/tier-list` sans aucun sous-titre, zéro tableau sur le site |
| Autorité et marque | 20 % | **13/20** | Schéma Article et Person corrects, identité d'auteur incohérente |
| Contenu multi-format | 15 % | **8/15** | Images oui, aucune vidéo, aucun tableau, aucun graphique |

## Le fait principal : le site est déjà cité

Requête posée à ChatGPT en français, depuis la France, recherche web active :
*« Quels sont les meilleurs decks Riftbound actuellement ? Donne des sources
françaises. »*

**riftboundfrance.fr apparaît dans 5 des 10 sources**, et ChatGPT écrit noir sur blanc :

> « La meilleure ressource française que j'ai trouvée est clairement **Riftbound France
> – Méta & Tier List** : elle agrège plus de 21 000 decklists et 88 tournois et fournit
> une vraie analyse statistique plutôt qu'une simple tier list subjective. »

Pages citées : `/guides/meta` (deux fois, c'est l'ancre), `/tournois/s3-national-open-2026-07-19`,
`/decks`, et `/decks?tournament=RQ+Utrecht+2026`. Les seuls autres domaines cités sont
le site officiel de Riot et CardsRealm.

**Ce qui déclenche la citation est identifiable** : ChatGPT reprend des chiffres précis
qu'il ne trouve nulle part ailleurs. « 8 % du field et 6 victoires » pour Irelia,
« 19 Top 8 » pour LeBlanc, « 21 000 decklists et 88 tournois ». Ce n'est pas la prose qui
est citée, c'est la donnée agrégée. C'est la même conclusion que l'analyse de mots-clés
de ce matin : votre actif, ce sont les 22 500 listes, et personne d'autre en français ne
les a.

## Le trou : « où jouer »

Deuxième requête : *« Où puis-je jouer à Riftbound en France ? Boutiques et tournois près
de chez moi. »*

**Zéro citation du site.** ChatGPT se rabat sur le site officiel de Riot et sur des fiches
de boutiques locales. Il mentionne pourtant le Rift Tour et ses 16 boutiques partenaires,
sujet sur lequel le site a déjà un article.

L'article existe donc, mais il ne répond pas à la forme de la question. C'est une
actualité, pas un annuaire. Une IA qui cherche « près de chez moi » a besoin de lieux,
de villes et de dates, pas d'un récit.

Cela recoupe exactement le gisement mesuré ce matin : environ 1 200 recherches par mois
sur « riftbound locator » et « riftbound events », une page de résultats Google qui ne
compte que 90 résultats, et rien en français. Le trou est le même des deux côtés.

## Accès des robots d'IA

| Robot | État |
|---|---|
| GPTBot, ChatGPT-User | Autorisés explicitement |
| ClaudeBot | Autorisé explicitement |
| PerplexityBot | Autorisé explicitement |
| Applebot-Extended | Autorisé explicitement |
| OAI-SearchBot, CCBot, autres | Autorisés par la règle générale |

Seuls `/admin` et `/api/` sont fermés. Rien à corriger.

## llms.txt

Présent, 65 lignes, à jour. **À ne pas surestimer** : les relevés de journaux serveur et
l'étude SE Ranking sur 300 000 domaines ne montrent aucun effet sur les citations, et
Google comme Bing disent ne pas le lire. On le garde parce qu'il ne coûte rien, on n'en
attend rien.

## Rendu serveur

Vérifié sur cinq pages : le contenu est dans le HTML, entre 85 et 163 Ko. Les robots
d'IA n'exécutent pas JavaScript, ce point est donc décisif, et il est acquis.

## Données structurées

Partout : `Organization`, `WebSite`, `SearchAction`, `BreadcrumbList`, `ImageObject`.
Sur les articles, en plus : `Article`, `WebPage`, `Person`, `datePublished`,
`dateModified`.

**Un défaut d'identité.** L'auteur déclaré est :

```json
{"@type":"Person","name":"Allan","url":"https://twitter.com/solary_allan"}
```

L'URL renvoie vers un compte qui n'est pas celui de la marque, @FRRiftbound. Pour une IA
qui tente de relier une personne à une organisation, les deux entités ne se rejoignent
pas. À faire pointer vers une page d'auteur du site, elle-même reliée aux comptes par
`sameAs`.

## Les cinq changements à plus fort effet

1. **Créer la page « où jouer à Riftbound en France ».** C'est le seul trou où la demande
   est mesurée des deux côtés, en recherche classique et en réponse d'IA, avec zéro
   concurrent français. *Comment savoir si ça échoue :* si dans six semaines la même
   question posée à ChatGPT ne cite toujours pas le site, c'est que la page manque de
   lieux et de dates concrets, pas de texte.

2. **Mettre des tableaux là où il y a des données.** Le site n'en compte **aucun** sur
   les pages vérifiées. ChatGPT a dû fabriquer lui-même le tableau de classement à partir
   de votre prose. Un tableau déjà formé est repris tel quel. *Dépend de rien, à faire en
   premier.*

3. **Afficher une date de mise à jour sur les guides.** `/guides/meta` et
   `/guides/debuter` n'en portent aucune, alors que `/guides/meta` est la page la plus
   citée du site. Une IA qui hésite entre deux sources garde la datée.

4. **Donner des sous-titres à `/tier-list`.** Un `h1`, zéro `h2`, zéro `h3`. La page est
   un bloc, donc impossible à découper en passage citable, et c'est probablement pourquoi
   ChatGPT cite `/guides/meta` à sa place sur une question de tier list.

5. **Réparer l'identité de l'auteur**, puis relier le site, @FRRiftbound et la page
   À propos par `sameAs`.

## Deux détails à surveiller

- ChatGPT cite « 21 000 decklists et 88 tournois ». La réalité est d'environ 22 500 listes
  et plus de 95 tournois. Les chiffres affichés sur `/guides/meta` sont donc figés dans
  le texte, et les IA propagent la version périmée. Les rendre depuis la base.
- ChatGPT annonce la sortie française de Vendetta au 23 octobre. À vérifier de votre côté :
  si c'est exact, il y a un article à écrire, et personne en français ne l'a fait.

## Ce que je n'ai pas mesuré

La présence de la marque sur Reddit, YouTube et Wikipédia, qui pèse davantage que les
liens entrants sur les citations d'IA. Le vérifier demanderait des appels supplémentaires.
À faire dans un second temps, avec le budget DataForSEO restant, environ 0,88 $.
