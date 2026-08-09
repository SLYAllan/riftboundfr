# Tweets @FRRiftbound

Tout ce qui concerne le compte X est ici.

## Ce qu'il y a dans le dossier

| Fichier | À quoi ça sert |
| --- | --- |
| `AAAA-MM-JJ-idees.md` | Une session d'idées : note de situation du site, puis les tweets prêts à copier avec lien, timing, média et points à vérifier. |
| `archive.md` | La liste des angles déjà proposés ou postés. À lire avant d'écrire, pour ne pas reposter la même idée. |
| `images/` | Les visuels prêts à poster, en 1600x1600. Chaque visuel a son `.html` source et son `-alt.txt` à côté : on régénère l'image à partir de là. |

## Refaire les visuels de tier list

Les tier lists viennent de la base, donc le visuel suit toujours le classement en
ligne. Quatre étapes :

```bash
# 1. compter ce sur quoi le classement repose (écrit data/tier-source-counts.json,
#    lu par le générateur pour la ligne du bas)
python -X utf8 scripts/tier-unleashed.py Spiritforged
python -X utf8 scripts/tier-unleashed.py Unleashed

# 2. générer les pages HTML (un set = une page, + le texte alt du tweet)
npx tsx scripts/gen-tierlist-image.mts Spiritforged Unleashed

# 3. servir le repo en local (les images de Légende sont dans public/)
python -m http.server 8899 --bind 127.0.0.1

# 4. ouvrir http://127.0.0.1:8899/content/tweets/images/tier-list-unleashed.html
#    dans un navigateur en 1600x1600 et capturer la page
```

Le fond est celui des images de deck (`public/img/fond-export.png`), avec le même
voile sombre. Pour un autre set : ajouter son nom aux commandes (`Origins`,
`Vendetta` quand sa tier list existera).

Deux points à ne pas défaire :

- La ligne du bas annonce des **résultats**, pas des decklists. Les tiers sont
  calculés sur les classements complets (rang + Légende) ; tous les joueurs classés
  n'ont pas publié leur liste, Hartford n'en a que 142 sur 1 659.
- Verre et ombres oui, halos colorés non. Pas de glow sur le titre ni derrière le
  tier S : ça fait image générée.

## Règles de publication

- 280 caractères, une idée par tweet.
- **Pas de lien dans le corps du tweet.** X réduit la portée des publications qui
  sortent les gens de la plateforme. Le tweet se suffit à lui-même, le lien part en
  première réponse. Sur un compte qui cherche son audience, la portée vaut plus que le
  clic, d'autant que le trafic du site vient de la recherche, pas des réseaux.
- Une image porte plus loin qu'un texte nu. Joindre un visuel dès que possible.
- Pas plus d'un hashtag, deux emoji maximum, jamais en ouverture.
- Aucun chiffre ni nom de carte sorti de nulle part : tout vient de la base ou d'une
  source citée dans la fiche du tweet.
- Le compte n'est pas affilié à Riot Games, ne rien laisser croire de tel.
