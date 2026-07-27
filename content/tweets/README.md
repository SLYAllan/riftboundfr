# Tweets @FRRiftbound

Tout ce qui concerne le compte X est ici.

## Ce qu'il y a dans le dossier

| Fichier | À quoi ça sert |
| --- | --- |
| `AAAA-MM-JJ-idees.md` | Une session d'idées : note de situation du site, puis les tweets prêts à copier avec lien, timing, média et points à vérifier. |
| `archive.md` | La liste des angles déjà proposés ou postés. À lire avant d'écrire, pour ne pas reposter la même idée. |
| `images/` | Les visuels prêts à poster, en 1000x1000. Chaque visuel a son `.html` source à côté : on régénère l'image à partir de là. |

## Refaire les visuels de tier list

Les tier lists viennent de la base, donc le visuel suit toujours le classement en
ligne. Trois étapes :

```bash
# 1. générer les pages HTML (un set = une page)
npx tsx scripts/gen-tierlist-image.mts Spiritforged Unleashed

# 2. servir le repo en local (les images de Légende sont dans public/)
python -m http.server 8899 --bind 127.0.0.1

# 3. ouvrir http://127.0.0.1:8899/content/tweets/images/tier-list-unleashed.html
#    dans un navigateur en 1000x1000 et capturer la page
```

Le fond est celui des images de deck (`public/img/fond-export.png`), avec le même
voile sombre. Pour un autre set : ajouter son nom à la commande (`Origins`,
`Vendetta` quand sa tier list existera).

## Règles de publication

- 280 caractères, un lien en fin de tweet, une idée par tweet.
- Pas plus d'un hashtag, deux emoji maximum, jamais en ouverture.
- Aucun chiffre ni nom de carte sorti de nulle part : tout vient de la base ou d'une
  source citée dans la fiche du tweet.
- Le compte n'est pas affilié à Riot Games, ne rien laisser croire de tel.
