# Audit responsive du 24 août 2026

Balayage de 43 adresses à quatre tailles d'écran, soit **172 passages**, contre un
build de production servi par `next start`. Outil : `scripts/audit-responsive.mjs`,
liste d'adresses : `scripts/audit-urls.txt`.

Tout est mesuré dans la page (`getBoundingClientRect`, `getComputedStyle`), rien
n'est lu dans le code. Le menu mobile est ouvert pour de vrai sur les deux tailles
de téléphone, puis la page est remesurée.

## Tailles balayées

| Nom | Taille | Passages |
|---|---|---:|
| Bureau | 1440 x 900 | 43 |
| Tablette | 768 x 1024 | 43 |
| Grand téléphone | 430 x 932 | 43 |
| Petit téléphone | 375 x 812 | 43 |

## Résultat : deux vrais défauts

### 1. La barre de navigation sortait de l'écran à 768 px — TOUT le site

Le bloc `hidden items-center gap-1 md:flex` de `src/components/navbar.tsx` mesure
**926 px**. Il apparaissait dès 768 px, le seuil `md` de Tailwind. À cette largeur
exacte, la barre dépassait donc de 182 px et poussait la page entière vers la
droite : **41 des 43 pages** débordaient à l'horizontale sur tablette, 199 px sur
les pages anglaises, dont le menu est plus large.

Aucune autre taille n'était touchée : le défaut n'existait qu'entre 768 et 1024 px.

**Corrigé** : la barre complète n'apparaît plus qu'à partir de `lg` (1024 px), le
menu déroulant prend le relais en dessous.

### 2. Le fil d'Ariane de `/outils/regles` menait à une page inexistante

`items={[{ name: "Outils", href: "/outils" }, …]}` : « Outils » est un **menu
déroulant**, pas une page. `/outils` répond 404. Next préchargeait ce lien, d'où
l'erreur console relevée sur les quatre tailles, et l'adresse partait aussi dans
le JSON-LD `BreadcrumbList` lu par Google.

**Corrigé** : le fil d'Ariane ne garde que « Accueil › Règles ».

## Ce qui a été écarté, et pourquoi

Le premier passage a sorti quatre familles de constats qui n'en étaient pas. Le
détecteur a été resserré ; la mesure sert à trouver, pas à accuser.

| Famille | Compte | Verdict |
|---|---:|---|
| Cible sous 24 px | 172 | Le lien « Aller au contenu » (`sr-only`, 1x1 par construction) et les liens au fil du texte, que WCAG 2.2 exclut de la règle des 24 px. |
| Texte coupé | 172 | **Uniquement** des éléments `sr-only`, rognés exprès pour les lecteurs d'écran. |
| Requête en échec | 166 | Préchargements `?_rsc=` annulés à la fermeture de l'onglet, plus des vidéos et images interrompues pareil. |
| Élément collé haut | 1 | La colonne de sommaire de `/outils/regles`, collée sur grand écran seulement : c'est voulu. |

Restent deux constats mineurs, non corrigés :

- des cases à cocher de 16 px sur téléphone (`input.size-4`) : la cible reste
  petite, même si le libellé à côté est cliquable ;
- un bloc du deckbuilder dont le bord droit tombe pile sur le bord de l'écran à
  430 px, sans débordement mesurable.

## Refaire le balayage

```bash
npx next build && npx next start -p 3001
node scripts/audit-responsive.mjs --base http://localhost:3001 \
  --urls scripts/audit-urls.txt --out ./audit --cookie <riftbound_session>
```

Deux pièges déjà payés, écrits aussi dans `HANDOFF.md` :

1. **Ne pas balayer `next dev`.** Quatre onglets en parallèle le mettent à genoux.
2. **Ne jamais lancer un `next build` pendant qu'un `next dev` tourne** : le
   serveur en marche répond alors 500 sur toutes les pages dynamiques, ce qui
   ressemble à s'y méprendre à un bug du site.
