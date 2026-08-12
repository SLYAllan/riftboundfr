# Règles officielles Riftbound

Deux extraits texte des PDF officiels français, récupérés le 21 juillet 2026 depuis
le [Rules Hub](https://playriftbound.com/fr-fr/rules-hub/). On garde le texte plutôt
que le PDF : ça se cherche au `grep`, et ça pèse 0,5 Mo au lieu de 55.

| Fichier | Contenu | Dernière mise à jour officielle |
|---|---|---|
| `regles-du-jeu-fr-2026-07-16.txt` | Règles du jeu, 134 pages, numérotées par section | 16/07/2026 |
| `regles-tournoi-fr-2026-07-16.txt` | Règles de tournoi, 57 pages | 16/07/2026 |

Sources PDF :
- Règles du jeu : https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/f668751be265e4bdf828145b593a74e0ddab6a9f.pdf
- Règles de tournoi : https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/fe9e2bd1e9b466be164da79d64e79e68f5e4c037.pdf

`riftbound-rules-rgpub.pdf` (30 mars 2026) est **périmé** : il ne contient ni Flux, ni
Brûler, ni Passer, ni l'amplification. Le garder pour l'historique, ne plus s'y fier.

## Comment chercher dedans

Les ligatures typographiques du PDF (`ﬁ`, `ﬂ`) sont déjà normalisées, sinon une
recherche sur « amplification » ne trouvait rien. Les règles sont numérotées, donc :

    rtk grep "^829\." data/meta-reports/regles-du-jeu-fr-2026-07-16.txt

Repères utiles : 422 Défausser, 427 Bannir, 440 Brûler, 441 Amplification (action),
442 Désamplifier, 443 Passer, 827 Amplification (mot-clé), 828 Amplifié, 829 Flux.

## Nouveautés Vendetta, en vigueur le 24 juillet 2026

Notes de patch : https://playriftbound.com/fr-fr/news/announcements/core-rules-vendetta-patch-notes/
Ban list : https://playriftbound.com/fr-fr/news/announcements/july-ban-list-updates/

Le détail est repris dans `docs/META-KNOWLEDGE.md` (mots-clés et ban list) et rendu sur le
site dans `/guides/glossaire`.
