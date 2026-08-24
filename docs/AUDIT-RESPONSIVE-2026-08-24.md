# Audit responsive du 24 août 2026

Le contrôle porte sur **43 URL valides** et quatre tailles, soit **172 passages**
sur un build de production. Le navigateur ouvre aussi les menus, filtres, listes,
onglets et fenêtres sûrs. Il ne lance aucune action qui écrit un deck, une
collection, un score ou l'état de l'overlay.

Le script et la liste relançable vivent dans `scripts/audit-responsive.mjs` et
`scripts/audit-urls.txt`. Le sitemap contient 5 154 URL, surtout des cartes et des
decks rendus par les mêmes gabarits. Le contrôle profond couvre chaque famille de
page, mais pas chaque ligne de données du sitemap.

## Tailles testées

| Taille | Passages |
|---|---:|
| 1440 x 900 | 43 |
| 768 x 1024 | 43 |
| 430 x 932 | 43 |
| 375 x 812 | 43 |

## URL testées

```text
/
/a-propos
/articles
/articles/best-of-las-vegas-rq-2026
/articles/streamer-riftbound-avec-un-telephone
/cartes
/cartes/ogn-001-298
/cartes/ven-021-166
/deckbuilder
/decks
/decks?cat=bestof
/decks?cat=all
/decks?cat=guide
/decks?cat=community
/decks/deck-kennen-heart-of-the-tempest-225566
/decks/compare
/d/essaihist
/guides
/guides/ban-list
/guides/debuter
/guides/deckbuilding
/guides/domaines
/guides/glossaire
/guides/jouer-en-ligne
/guides/meta
/legendes
/legendes/ahri-nine-tailed-fox
/legendes/kennen-heart-of-the-tempest
/meta
/offline
/outils/regles
/tier-list
/tournois
/tournois/atlanta-regional-qualifier
/tournois/riftbound-showdown-ottawa-2026-08-08
/collection
/profil
/profil/overlay
/community-decks
/admin/login
/en
/en/decks
/en/guides/debuter
```

## Problèmes trouvés et corrigés

1. La barre de navigation débordait à 768 px sur 41 pages. Le menu complet passe
   désormais au seuil `lg`.
2. Le fil d'Ariane de `/outils/regles` pointait vers `/outils`, qui n'existe pas.
3. Les filtres de domaines du deckbuilder débordaient de 55 px à 375 px. Ils
   reviennent à la ligne.
4. Le bouton de fermeture de l'import faisait 20 x 20 px. Il fait maintenant
   44 x 44 px.
5. Les onglets de statistiques du deckbuilder faisaient 23 px de haut. Leur cible
   fait 44 px sur téléphone.
6. Quatre liens d'action de l'accueil et « Tout effacer » dans les cartes avaient
   une cible trop basse sur téléphone. Ils font maintenant 44 px.
7. Le fil d'Ariane partagé, les liens de retour, les noms de cartes en vue liste
   et le bouton « Tirer » restaient sous 24 px. La correction vit dans les
   composants partagés.
8. Le détecteur comptait les liens au fil d'une phrase et les fenêtres plein
   écran comme des défauts. Ces deux faux positifs suivent maintenant les
   exceptions prévues.

Les captures prises avant correction sont dans `docs/audit-responsive-2026-08-24/`.

## Contrôle après correction

- Passage complet : **172 passages**, chaque famille de page et chaque taille.
- Contrôle ciblé final : **32 passages** sur les huit URL qui exposent les
  dernières cibles corrigées.
- Débordement horizontal : **0**.
- Élément hors cadre : **0**.
- Média trop large : **0**.
- Texte coupé hors troncature voulue : **0**.
- Petite cible sur les huit routes finales : **0**.
- Tests : **260 sur 260**.
- `npm run verify` : **sortie 0**.

## Restes connus

- `/d/essaihist` déclenche une requête privée sans session puis tente le lien
  Discord. Le navigateur relève des 401 et un refus CSP, mais la page reste
  utilisable. Ce n'est pas un défaut responsive.
- `/collection` appelle aussi une route privée sans session et reçoit le 401
  attendu.
- Le compagnon et l'overlay réel demandent un jeton et une clé valides. Ils n'ont
  pas été manipulés : cela aurait changé l'état de direct d'Allan.
- Les 5 111 autres URL du sitemap n'ont pas été rejouées une par une. Elles
  réemploient les gabarits de carte, deck, article et tournoi contrôlés ici.

## Relancer

```bash
npm run verify
npm run start -- -p 3001
node scripts/audit-responsive.mjs --base http://localhost:3001 \
  --urls scripts/audit-urls.txt --out ./audit
```
