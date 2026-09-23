# Journal SEO

Une entrée par passe, la plus récente en haut. On ajoute, on ne réécrit jamais une
entrée passée : c'est elle qui dira dans trois semaines pourquoi un titre a changé.

---

## 2026-09-23 · semaine 1, Search Console rebranché

**Fait**
- Relevé Search Console du 26 août au 20 septembre : 5 908 clics, 90 413 impressions,
  90 % des clics depuis la France. Détail dans `etat.json`, second relevé du 23.
- **Panne corrigée (pas encore en ligne)** : l'accueil `/en` sortait sans `<title>`,
  sans description et sans aperçu social, pour tous les visiteurs. Cause :
  `metaTraduite` posait `title: undefined` quand la page ne donnait pas de titre, et
  Next efface alors celui du layout. Corrigé à la racine (`traduireMeta`, dans
  `src/lib/i18n-server.ts`), avec son test. Vérifié sur le build de production :
  `/en` a son titre anglais, les pages françaises n'ont pas bougé. Le changement
  touche `/en` : sa date de mise en ligne sera la date de départ de la mesure.

**Constats (avec leur source)**
- Les pages de Légende captent déjà : 958 clics, position 5,0. L'entrée d'avant, qui
  les disait absentes du top 10, reposait sur DataForSEO : elle est fausse.
- En France, l'accueil anglais prend 6 440 impressions contre 2 893 pour le français,
  sur les requêtes de tête du site (tableau `france_vers_en_top20`). Hors marque et à
  position égale : 5,8 % de clics pour `/`, 4,0 % pour `/en`.
- Restent en français sous `/en` : le titre et la description des pages de Légende
  (`/en/legendes/viktor-herald-of-the-arcane`). `/zh` reprend le titre anglais du
  layout. Deux trous de traduction, pas des pannes : à traiter plus tard, un à la fois.

**Recommandation pour la semaine 2** : la page à suivre est l'accueil, `/` contre
`/en` en France. Le seul changement de la semaine est la correction du titre de
`/en`, une fois en ligne. On regarde deux semaines plus tard si les impressions
françaises de `/en` baissent au profit de `/`, et si les clics suivent. Aucun autre
changement sur ces deux pages d'ici là.

**Attend :** le Deploy dans Coolify (événements GA4 + correction du titre).

---

## 2026-09-23 · semaine 1, mise en place

**Fait**
- Événements GA4 posés sur les conversions (liste dans `brief.md`). Pas encore en
  ligne : le déploiement est manuel. Les compter à partir de sa date.
  Essayés dans un navigateur sur le build de production : « Acheter ce deck »,
  le lien d'achat d'une carte et « Copier » envoient chacun leur événement, une
  fois. Piège trouvé en route : « Acheter ce deck » est un formulaire POST, pas un
  lien ; l'écouteur écoute donc aussi `submit`.
- Premier relevé DataForSEO, Google France en français : 35 requêtes classées, et la
  longue traîne « deck » (87 requêtes). Chiffres dans `etat.json`, relevé du 23.
- Search Console **bloqué** : le fichier client OAuth a disparu de Téléchargements. La
  config pointe désormais vers `~/.config/claude-seo/client_secret.json`.

**Constats (avec leur source)**
- Sur « deck riftbound », Google France montre notre accueil au 5e rang, derrière
  riftdecks.com, puis trois boutiques de decks préconstruits. SERP DataForSEO du 23.
- Sur « deck viktor riftbound », les deux premières places sont des pages de Légende
  (riftbound.gg/viktor-herald-of-the-arcane-guide/, riftdecks.com/legends/constructed/…),
  puis des vidéos, un carrousel de produits et des boutiques. Nous : absents du top 10.
- `/legendes/viktor-herald-of-the-arcane` en ligne : 200, `index, follow`, canonical
  juste, 1 381 mots rendus sans JavaScript, 21 liens vers des decks, **aucun lien
  d'achat**. L'indexation réelle reste à vérifier dans Search Console (inspection d'URL).
- Les `hreflang` fr/en/x-default sont justes sur `/` et `/en`. Quand Google sert `/en`
  pour « riftbound deck » en France, c'est son choix, pas une panne.

**Recommandation : aucune page cette semaine.** Sans conversions mesurées, le premier
contrôle ne se juge pas. Semaine 2, une fois le déploiement fait et Search Console
rebranché : choisir entre `/cartes` et la famille `/legendes/[slug]` selon ce que
disent `clic_cardnexus` et la position réelle. Idée à garder pour la passe
« conversion » d'une Légende : un bouton « Acheter ce deck »
(`/api/cardnexus/panier?slug=`) sur le meilleur deck de la page.

**Attend :** le Deploy dans Coolify, puis le fichier `client_secret.json`.
