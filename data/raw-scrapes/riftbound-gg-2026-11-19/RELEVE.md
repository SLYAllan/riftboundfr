# Relevé riftbound.gg du 19 novembre 2026

Passe sur https://riftbound.gg/articles/ (première page, du 22 octobre au 19 novembre).
Pages brutes rangées ici en HTML, telles que servies (`curl_cffi`, empreinte Chrome).
riftbound.gg est un concurrent : il ne se cite pas sur le site, il sert à repérer ce
qui nous manque. Rien n'a été importé DEPUIS riftbound.gg : ses listes sont chargées
en JavaScript depuis l'API dotgg, qu'un navigateur automatisé ne passe pas
(vérification anti-robot) ; on revient donc à la source qu'on suit déjà.

## Article par article

| Article | Ce qu'il apporte | Chez nous ? | Suite |
|---|---|---|---|
| Riftbound Ban List Updates – November 23, 2026 | Annonce Riot : 8 cartes + 2 champs de bataille, en vigueur le 23 | Oui, les 10 dans `bans.ts` et `banned-cards.ts`, effet au 23 | Rien. Nouveau : bans par région (Corée, chinois traditionnel décalés jusqu'à la sortie de Radiance chez eux). Ne touche pas hexgate (Chine continentale) |
| Riftbound Game Director Confirms Card Ban Update on Friday | Annonce du ban à venir | Oui | Rien |
| All Best-of Prizing Decks from the European Championship | 22 listes (16 best-of + Top 8) | Oui : reprise mot pour mot de l'article Riot `best-ofs-for-the-european-championship`, déjà relevé (`europe-rc-officiel.md`, 22 joueurs) | Rien |
| Europe Regional Championship 2026 (Den) | Top 8 + meilleure liste de 24 Légendes, avec rang | 18 sur 24 Légendes en base. Absentes : Master Yi (37e), Lucian (128e), Lee Sin (173e), Viktor (179e), Lux (227e), Ezreal (265e) | Relevé riftdecks refait (voir plus bas) |
| idem | « le Jayce le mieux classé a été disqualifié à la fin de la ronde 10 » | Tranche l'écart noté le 13 dans HANDOFF : Templar (21e au classement) contre Pjax91 (27e), n°1 Jayce pour Riot | Rien à changer : on suivait déjà Riot |
| Koko Lopez Banned … for Cheating | Décision Riot : disqualifié au RQ Los Angeles (ronde 3), suspendu jusqu'au 1er janvier 2029 | En base : 2e Barcelone (Kennen), 2e Atlanta (Draven), non concernés. À Los Angeles il figure au classement (2-2-0, Kennen, sans liste) | Rien : la décision ne touche que Los Angeles, où il n'a pas de liste |
| Riftbound Meta Tier List – Radiance – Week 2 | 13 tournois du 30 octobre au 4 novembre | City Challenge S5 : tous en base (hexgate). Absents : **Riftbound Showdown Series $25k CoolStuffCon Orlando** (plus de 256 joueurs), Riftbound $5k CoolStuffCon Orlando, VersusCon 2026, Radiance Rift Rumble Samyan Mitrtown, Convergence IV (en ligne, règle non posée) | Voir « Tournois absents » |
| Guides de Légende (Vex, Sett, Azir, Ezreal, Kennen, Kai'Sa, Riven, Rek'Sai, Jayce, Akali) | Avis et listes reprises du RC Europe, de Sacramento, de Melbourne, d'Orlando | Sacramento et Melbourne en base | Rien de plus que la ligne Orlando |
| Radiance Day 1 / Post-Ban Metagame / Best Decks for Every Legend | Analyse, listes théoriques | Sans objet | Rien : pas de résultat |
| Radiance Rules FAQ and Clarifications | Reprise de la FAQ Riot du 26 octobre | Déjà lue le 13 (`data/raw-scrapes/annonces/radiance-rules-faq.md`), non intégrée | Rien de neuf |
| Legacy (set 6) / The Reckoning (set 7) | Legacy : sortie le 29 janvier 2027, aperçus au Convergence Fest (13-15 décembre) ; Proving Grounds 2e édition le 19 février 2027 | Le site n'a pas de fiche des sets à venir | Rien |
| World Showcase, 2027 Premier Play / Local Play, RC Europe Event Information | Calendrier et format 2027 | Sans objet pour les données | Rien |
| Promos Packed Amphitheater et Sona DJ (Convergence Fest) | Cartes promo | Base cartes alimentée par Riftcodex et Riot, pas par riftbound.gg | Rien |
| Budget, prix, tirages K/DA et Worlds, GTA VI | Hors sujet | | |

## Tournois absents de chez nous

| Tournoi (d'après la tier list riftbound.gg, semaine 2) | Taille | Fait |
|---|---|---|
| Riftbound Showdown Series $25k, CoolStuffCon Orlando, 1er novembre 2026 | 556 joueurs | **Importé** depuis riftdecks 18616 : 56 listes publiées, 43 complètes, 13 écartées (réserve vide, pas complétée). Classement complet relevé (526 places avec Légende). Vainqueur MERC Koopastar (Riven) ; Top 8 : 2 Riven de plus, Kha'Zix, Kai'Sa, 2 Jayce. Recoupé avec riftbound.gg : Riven gagne, Kai'Sa dans le Top 4, Jayce dans le Top 8 |
| Riftbound $5k CoolStuffCon Orlando | 64 à 256 joueurs | Pas importé : à décider par Allan (riftdecks 18605, classement des rondes suisses seulement) |
| VersusCon 2026 | 64 à 256 | Pas importé, pas cherché : à décider |
| Radiance Rift Rumble, Samyan Mitrtown | 64 à 256 | Pas importé, pas cherché : à décider |
| Convergence IV @ RiftAtlas (en ligne) | plus de 256 | Pas importé : la règle des tournois en ligne n'est pas posée (déjà noté le 10 novembre, hexgate 306) |

## RC Europe : relevé riftdecks refait

Le relevé du 8 novembre avait 257 listes incomplètes sur 302 (ni Champion ni champs de
bataille). Ces 257 fichiers ont été **déplacés, pas supprimés**, dans
`data/raw-scrapes/europe-rc-releve-2026-11-08/` (avec les pages de liste et l'ancien
`europe-rc-urls.txt`), puis les 302 pages ont été relevées à nouveau
dans `data/raw-scrapes/europe-rc/` (même noms de fichier). Résultat : 245 toujours
incomplètes, 12 devenues complètes.

- 10 des 12 sont des joueurs dont on avait déjà la liste officielle Riot
  (`europe-rc-NN-officiel-*`), cartes identiques une à une : la copie riftdecks est
  écartée pour ne pas compter le joueur deux fois.
- 2 listes nouvelles : TCR Jorge (Kai'Sa, 148e), MERC keenan (Master Yi, 80e).
- Les n°1 de Master Yi (38e), Lucian (128e) et Viktor (179e) n'ont toujours pas de
  liste complète : best-of inchangés (22), même commande qu'au 13 novembre.
- Les listes que riftbound.gg montre pour Lee Sin, Lux et Ezreal restent incomplètes
  sur riftdecks : pas importées.

## Écarts relevés, rien changé

- **Sacramento** : riftbound.gg écrit qu'Akali a joué la finale et que Viktor a fini
  2e « des rondes suisses ». riftdecks (notre source) donne Viktor 2e, Akali 3e. Pas
  de seconde source sous la main pour trancher.
- **Rangs du RC Europe** : riftbound.gg décale d'une place tous les rangs après le 21e
  (Pjax91 26e au lieu de 27e) ; c'est le Jayce disqualifié retiré du classement. Riot
  garde 27e, on suit Riot.

## Commandes

```
python -I <scratchpad>/fetch.py data/raw-scrapes/riftbound-gg-2026-11-19 <slugs>   # pages brutes
bash scripts/scrape-tournoi.sh europe-rc <url 18668> 5
bash scripts/scrape-tournoi.sh orlando-showdown <url 18616> 9
npx tsx scripts/parse-riftdecks.ts europe-rc "Europe Regional Championship" 2026-11-08 315 Radiance
npx tsx scripts/parse-riftdecks.ts orlando-showdown "Riftbound Showdown Orlando (2026-11-01)" 2026-11-01 556 Radiance
python -X utf8 scripts/validate-decklists.py   # 32 723 vérifiées, 0 MISMATCH, sortie 0
npx tsx --env-file=.env scripts/seed-tournament-decks.ts europe-rc "Europe Regional Championship" Radiance "tournoi,radiance,regional"   # 57
npx tsx --env-file=.env scripts/seed-tournament-decks.ts orlando-showdown "Riftbound Showdown Orlando (2026-11-01)" Radiance "showdown,radiance"   # 43
npx tsx --env-file=.env scripts/mark-bestof-tournois.mts "Europe Regional Championship" --sauf "Master Yi, Wuju Bladesman" --sauf "Lucian, Purifier" --sauf "Viktor, Herald of the Arcane"   # 22
```

Seeds en LOCAL seulement (shell sans `DATABASE_URL`, `.env` local). Rien en production.

## `npm run maj:stats` (relancé après la réparation d'`apres-ban`, 5efb7d88f)

Sortie 0. Orlando entre au corpus avec 526 places. Radiance : 3 877 places sur
22 tournois. 32 fiches recomptées, `data/deckbuilding-stats.md` refait. Aucun
« RANG À REVOIR » ; **70 « CHIFFRE PÉRIMÉ »** dans les commentaires de
`scripts/tier-tables.ts` (Radiance et Globale : effectifs par Légende). C'est de la
prose à réécrire, pas faite ici, comme la passe de `META-KNOWLEDGE` et
`DECKBUILDING-RULES`.
