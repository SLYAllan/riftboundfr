# Documentation — Riftbound France

Où trouver quoi. Rangé le 25 août 2026.

## À la racine du dépôt

| Fichier | Ce qu'on y trouve |
|---|---|
| `AGENTS.md` | **Le point de départ.** Règles de travail, puis stack, arborescence, où vit la logique, commandes vérifiées, conventions. Lu par Claude Code ET par Codex : c'est la source unique. |
| `CLAUDE.md` | Importe `AGENTS.md`, rien d'autre. Vide de fond exprès : Codex ne le lit pas, donc toute consigne posée là lui échapperait. |
| `HANDOFF.md` | Ce qui marche, ce qui est cassé, le chantier en cours, les 5 prochaines tâches, et les pièges. |
| `README.md` | Démarrage rapide. |

## Connaissance du projet

| Fichier | Ce qu'on y trouve |
|---|---|
| `PROJET.md` | **Le projet en entier** : ce qu'est le site, son vocabulaire, ses pages, d'où viennent les données et par quelle chaîne, l'éditorial, la sécurité, l'histoire. À lire en premier quand on arrive. |
| `META-KNOWLEDGE.md` | Méta, tier lists, rulings, chiffres de tournoi, terminologie française officielle. Le plus gros document du dépôt. |
| `DECKBUILDING-RULES.md` | Règles de construction, table canonique des domaines, cores et cartes techniques par Légende. |
| `ARTICLE-STYLE.md` | Style et gabarit des articles. |
| `DESIGN.MD` | Règles visuelles du site. |
| `SEO-STRATEGY.md` | Stratégie de référencement. |
| `DEPLOIEMENT.md` | Coolify, Docker, DNS, SSL, base de données, méthode de seed en production. |
| `RAPPORT-SESSION-2026-08-14.md` | **Passation complète du chantier Vendetta/S4** : 9 tournois, 982 decks validés et seedés, rejets, changements de code, erreurs rencontrées, audit Codex, vérifications et travaux restants. |
| `AUDIT-SITE-2026-08-14.md` | Audit fonctionnel et UI/UX vérifié : routes, responsive, accessibilité, corrections locales et limites du contrôle. |
| `AUDIT-DECKLISTS-2026-08-21.md` | Audit des sources de decklists : nouvelles listes, rangs modifiés et contrôle Vendetta. |
| `AUDIT-RESPONSIVE-2026-08-24.md` | Balayage des 43 pages à quatre tailles d'écran : ce qui débordait, ce qui n'était que du bruit de mesure. |

## Archive

| Fichier | Ce qu'on y trouve |
|---|---|
| `AUDITS.md` | **Les 15 audits et rapports du projet en un seul fichier**, du plus récent (11 août 2026) au plus ancien (24 mai 2026). Chaque section garde son texte d'origine et la mention de son fichier source. C'est un état des lieux daté, pas la vérité d'aujourd'hui : pour l'état courant, lire `HANDOFF.md`. |
| `prompts/` | Les prompts réutilisables : scraping riftdecks, scraping Firecrawl, analyse de VOD, apprentissage de la méta, refonte du deckbuilder, modification d'articles et de decks. |
| `superpowers/` | Plans et spécifications de sessions passées. |

## Où vivent les données

`data/` et `content/` ne sont pas rangés dans `docs/` : une bonne partie des 77
scripts de `scripts/` les lit par un chemin en dur. Les déplacer casse la chaîne
de scraping et de seed. Voici la carte.

| Chemin | Ce que c'est | Statut |
|---|---|---|
| `data/raw-scrapes/` | **Scrapes bruts de riftdecks, par tournoi et par page.** La source de vérité contre laquelle `validate-decklists.py` vérifie qu'aucune decklist n'a été fabriquée. Voir `AGENT-INSTRUCTIONS.md` du dossier. | Source de vérité |
| `data/tournaments/classements.json` | Le classement COMPLET des tournois relevés : un joueur par ligne, decklist publiée ou non. Produit par `scripts/classements-tournois.mts`. C'est la base de toutes les parts de méta et de tous les taux de conversion. | Source de vérité |
| `data/tournaments/meta-parts.json` | Le même corpus, agrégé par Légende et par tournoi. Lu par `/meta` et par l'accueil. Écrit par la même commande. | Engendré |
| `data/fiches/*.json` | Fiche par Légende, lue par `/legendes`. **Deux moitiés qui ne se modifient pas de la même façon** : les sections chiffrées (cartes clés, champions, terrains, résultats) sont recalculées depuis la base par `scripts/fiches-stats.mts` puis posées par `scripts/fiches-maj.mts` ; la prose (archétype, capacité, plan de jeu, forces, faiblesses) est écrite à la main dans `data/fiches-prose.json` et appliquée par `scripts/fiches-prose.mts`. Ne pas éditer une section chiffrée à la main, le prochain calcul l'écrase. | Source de vérité |
| `data/fiches-prose.json` | La prose des fiches Légendes, relue à la main. C'est là qu'on écrit, jamais dans `data/fiches/` directement. | Source de vérité |
| `data/fiches-stats-vendetta.json` | Ce que les decklists du format disent de chaque Légende : parts de cartes, champions, terrains, places. Régénéré par `scripts/fiches-stats.mts`. | Dérivé |
| `data/video-insights/` | Connaissance tirée des VOD compétitives. Lire son `README.md` : il donne l'index, la hiérarchie et le pipeline. `matchups-reference.md` est la source unique des matchups. | Source de vérité |
| `data/meta-reports/` | Rapports de méta par tournoi. | Dérivé |
| `data/decklists/`, `data/tournaments/` | Decklists et tournois convertis, prêts à seeder. | Dérivé |
| `data/articles-drafts/` | Brouillons d'articles non publiés. | En chantier |
| `data/rules/`, `data/riftbound-rules-fr*` | Règles officielles du jeu en français. | Source de vérité |
| `data/prices/`, `data/videos/` | Régénérés, ignorés par git. | Jetable |
| `content/articles/` | Articles rédigés à la main. | Source de vérité |
| `content/aide-de-jeu/` | Textes de l'aide de jeu. | Source de vérité |
| `content/tweets/` | Idées de publications et visuels. Son `README.md` explique la génération des visuels de tier list. | Source de vérité |

Les règles du jeu codées en dur (bans, domaines, errata, drapeaux de tournoi) ne
sont ni dans `data/` ni ici : elles vivent dans `src/lib/`, listées dans
`AGENTS.md`.
