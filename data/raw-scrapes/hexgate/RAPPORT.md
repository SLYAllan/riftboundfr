# hexgate.cn — reconnaissance du 24 août 2026

Source demandée par Allan : <https://hexgate.cn/tournaments/>. Rien n'a été importé.
Ce rapport dit ce que le site donne, comment le lire, et ce qui reste à vérifier.
Les trois captures brutes de ce dossier sont les preuves.

## Ce que c'est

Site chinois d'analyse Riftbound (« 海克斯飞门 / HEXGATE »), en `zh-CN`, bâti sur
Next.js. Il répond **200 avec un User-Agent de navigateur** ; sans lui, `curl` prend
un 308 de redirection. Pas de Cloudflare, pas de JavaScript obligatoire : tout le
contenu part du serveur.

## Les trois adresses

| Page | Adresse | Ce qu'elle porte |
|---|---|---|
| Liste | `/tournaments` | 21 tournois, `/tournaments/217` à `/tournaments/237` |
| Tournoi | `/tournaments/237` | nom, date, nombre de joueurs, Légende gagnante, classement complet, un lien par deck |
| Decklist | `/tournaments/237/decks/22542` | la liste entière |

Capture du 24 août : `tournaments-liste.html`, `tournoi-237.html`,
`deck-237-22542.html`.

## Le point qui décide de tout : les données sont structurées

Le HTML rendu n'affiche que du chinois, mais la charge React (`self.__next_f`) porte
un objet par carte, **avec le nom anglais et le numéro de collection** :

```json
{"card_no":"SFD-206/221","card_name":"劳伦特心眼刀","cn_name":"劳伦特心眼刀",
 "en_name":"Riposte","quantity":3,"card_type":"专属法术","slot_type":"main",
 "image_path":"card_images/SFD-206_221.webp","energy":2,"card_effect":"…"}
```

Deux clés suffisent donc à rattacher une carte à notre base sans traduire quoi que
ce soit : `card_no` (set + numéro, « SFD-206/221 ») et `en_name`. **Ne pas passer
par les noms chinois** : le numéro de collection est la clé sûre, le nom anglais
sert de contrôle.

## La forme d'une liste correspond à la nôtre

Relevé sur le deck 22542 (vainqueur, Fiora) en comptant les quantités par `slot_type` :

| `slot_type` | Total |
|---|---:|
| `main` | 40 (39 cartes + le Champion) |
| `rune` | 12 |
| `battlefield` | 3 |
| `sideboard` | 10 |
| `legend` | 1 |

C'est exactement ce qu'attend le pipeline Vendetta. Une liste hexgate peut donc
passer le validateur sans être complétée ni devinée.

## Ce que ça apporte

Le tournoi 237 est « 友友卡牌屋第三届沙皇杯 », 93 joueurs, 22 août 2026. Ce type
d'épreuve locale chinoise n'apparaît pas dans nos scrapes riftdecks. **Reste à
vérifier tournoi par tournoi** : le recoupement des 21 identifiants avec
`data/raw-scrapes/index-fragments/` n'a pas été fait.

## Ce qui n'est pas vérifié

- La pagination : 21 tournois sont visibles sur `/tournaments`, rien ne dit qu'il
  n'y en a pas d'autres derrière un paramètre de page.
- L'existence d'une API JSON propre. La charge React suffit, mais un point d'entrée
  officiel serait plus stable.
- Le rythme de publication, et si les listes anciennes restent en ligne.
- La correspondance des noms de Légendes chinois (无双剑姬 = Fiora, Grand Duelist)
  au-delà de l'exemple lu : elle se fera par `card_no`, jamais à l'oreille.
- Les conditions d'utilisation du site.

## Suite proposée

1. Relever les 21 tournois (nom, date, joueurs) et les comparer aux tournois déjà
   en base : ne garder que les absents.
2. Écrire un parseur qui lit la charge React et rend le même format que
   `scripts/parse-riftdecks.ts`, puis le passer au validateur
   (`npm run validate:decks`).
3. Garder les captures brutes dans ce dossier : elles sont la source de vérité,
   comme `data/raw-scrapes/` pour riftdecks.
