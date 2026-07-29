# Audit d'interface, 29 juillet 2026

Revue complète du site avec les skills `better-*` et `make-interfaces-feel-better`,
puis correction. **82 fichiers modifiés, +672 / -576.** Rien n'est poussé : tout est
en local sur `main`.

**Tous les points de la liste « reste à faire » ont été traités**, sauf trois écartés
avec raison (voir la dernière section).

## Méthode

Deux balayages automatisés avec Playwright, plus un balayage des pages authentifiées.

**Balayage 1** — 29 routes à 390px et 1280px, soit 58 pages. Contraste WCAG 2 AA (avec
mélange alpha des fonds semi-transparents), débordement horizontal, zones tactiles
(WCAG 2.5.8 avec l'exception d'espacement et l'exception « lien en ligne »), plan des
titres, images sans `alt`, contrôles sans nom accessible, champs sans étiquette.

**Balayage 2 (profond)** — 26 routes à 768px, 1024px et 640px (soit 1280px à 200% de
zoom), 78 pages. Erreurs console et JS, requêtes en échec, liens internes morts,
`id` en double, références `aria` cassées, images sans dimensions, `tabindex` positif,
landmarks, métadonnées, liens vides, troncature sans valeur complète, longueur de ligne.

**Balayage 3 (authentifié)** — 11 routes à 390px et 1280px, soit 22 pages : `/profil`,
`/collection`, un classeur partagé, le deckbuilder et **les 7 pages `/admin`**, avec un
faux utilisateur local (`scripts/seed-test-user.mts`, refuse de tourner si
`DATABASE_URL` ne pointe pas sur localhost ; `--admin` pour le rôle administrateur,
`--clean` pour tout supprimer).

Scripts dans le dossier de travail temporaire : `sweep.mjs`, `deep.mjs`, `sweep-auth.mjs`.

| Passe | Pages avec constat |
| --- | --- |
| Avant correction | 27 / 58 |
| Après le premier lot | 14 / 58 |
| Après le deuxième lot | 6 / 58 |
| Ajout du contrôle « champ sans étiquette » | 20 / 58 |
| **État final, site public** | **2 / 58** |
| **État final, pages authentifiées et admin** | **0 / 22** |

Les 2 restantes sont `/profil` aux deux largeurs, qui redirige vers la page OAuth de
Discord. Le 1,12:1 et le `h1` manquant sont chez Discord, pas chez nous. Avec le faux
utilisateur, `/profil` et `/collection` ressortent **OK**.

## Vérifications

| Contrôle | Résultat |
| --- | --- |
| `npx tsc --noEmit` | EXIT=0 |
| `npm run build` | « Compiled successfully in 9.7s », EXIT=0 |
| `npx vitest run` | **22/22**. L'échec restant était dans `collection.test.ts`, pas `piltover-import` : le test attendait des clés à tiret (`"falling-star"`) que `nameKey` n'a jamais produites, il génère des espaces (`"falling star"`). Les deux côtés du calcul de couverture utilisent la même fonction, donc c'est le test qui était faux. Corrigé et commenté |
| Contraste, 58 pages | 0 échec hors page Discord |
| Débordement horizontal, 58 pages | 0 |
| Zones tactiles, 444 cibles à 390px | 0 échec |
| Noms accessibles et étiquettes de champ | 0 contrôle anonyme |
| Anneau de focus clavier | `outline: 2px solid rgb(14,165,233)`, décalage 2px |
| Liens internes | **400 testés, 0 mort** |
| `id` en double, `tabindex` positif, `<main>` unique, liens vides | 0 sur les 78 pages |
| Décalage de mise en page (images) | 0 risque réel sur 936 images de `/tournois` |
| Pages authentifiées et admin | **22/22 OK** |

Non vérifié : lecteur d'écran réel sur les modales, rendu macOS du lissage de police.

---

## 1. Couleurs

### Tokens (`src/app/globals.css`)

Méthode : luminosité relevée dans l'espace OKLCH, **teinte et saturation inchangées**,
jusqu'à atteindre 4,5:1 sur `surface-raised` (#2c2c34), le fond le plus clair où ces
couleurs servent de texte.

| Token | Avant | Après | Contraste |
| --- | --- | --- | --- |
| `--color-ink-muted` | `#64748b` | `#8596ae` | 2,91 → 4,6 |
| `--color-tier-a` | `#ef4444` | `#ff5c58` | 3,68 → 4,56 |
| `--color-tier-b` | `#8b5cf6` | `#a77bff` | 3,27 → 4,56 |
| `--color-tier-d` | `#6b7280` | `#949aa6` | 2,83 → 4,84 |
| `--color-rarity-epic` | `#8b5cf6` | `#a77bff` | 3,27 → 4,52 |
| `--color-rarity-legend` | `#ef4444` | `#ff5c58` | 3,68 → 4,51 |
| `--color-domain-fury` | `#ef4444` | `#ff5c58` | 3,68 → 4,56 |
| `--color-domain-mind` | `#3b82f6` | `#4b93ff` | 3,76 → 4,56 |
| `--color-domain-chaos` | `#8b5cf6` | `#a77bff` | 3,27 → 4,56 |
| `--color-domain-sorcery` | `#ec4899` | `#fa55a5` | 3,92 → 4,55 |

Calme, Corps, Ordre, tier S, tier C et les autres raretés passaient déjà : inchangés.

`src/lib/domains.ts` : `DOMAIN_COLORS` aligné sur ces valeurs (commentaire ajoutant la
contrainte de synchronisation avec les tokens CSS).

### Libellés sur remplissage de marque

Choix retenu (arbitré avec toi) : **garder la palette vive, passer le libellé en encre
sombre**. L'autre option, assombrir les fonds, faisait virer l'or au brun.

| Fond | Blanc avant | Encre après |
| --- | --- | --- |
| `bg-arcane` #0ea5e9 | 2,77 | 6,14 |
| `bg-gold` #f59e0b | 2,15 | 7,92 |
| `bg-emerald-500/600` | 2,54 | 6,71 |
| `bg-red-500`, `bg-blue-500`, `bg-amber-600` | 2,4 à 3,8 | 4,5+ |

- `text-white` → `text-canvas` sur **90 lignes** portant un de ces remplissages.
- `bg-violet` → `bg-violet-dark` sur **20 lignes** (blanc conservé, 5,70) : le violet
  #8b5cf6 échoue dans les deux sens, seul cas.
- `hover:bg-arcane-dark` → `hover:bg-arcane-light` sur 6 boutons : au survol, l'encre
  sombre tombait à 4,20 sur l'arcane foncé.

### Cas trouvés seulement par le balayage complet

| Page | Problème | Correction |
| --- | --- | --- |
| `/deckbuilder` | 118 onglets `bg-arcane/90` + blanc, 3,26:1 | `text-canvas`, `card-browser.tsx:125` |
| `/guides/meta` | Pastilles de tier S/A/B/C en blanc, 2,15 à 3,65 | `text-canvas`, `page.tsx:134` |
| `/tournois` | Mêmes pastilles, 2,15 et 2,77 | `text-canvas`, `tournament-list.tsx:177` |
| `/meta` | « Tier A/B/C/D » sur fond de la même teinte, 3,78 à 4,12 | Fond neutre, `meta-filters.tsx:19` |
| `/guides/deckbuilding` | Ronds numérotés blancs sur vert/bleu/orange/rouge, 2,28 à 3,76 | `text-canvas`, `page.tsx:106` |
| `/guides/jouer-en-ligne` | Étapes numérotées blanches, 2,77 et 4,23 | `text-canvas` + accent violet éclairci en `#a78bfa` |
| `/guides/domaines`, `/guides/debuter` | **Palette de domaines dupliquée en dur**, restée sur les anciennes valeurs | Les deux fichiers importent maintenant `DOMAIN_COLORS` |

### Pastilles de domaine

Le fond teinté sous un texte de la même teinte enfreint ta règle et coûtait du
contraste (4,32:1 mesuré). Remplacé par `bg-surface-raised` + texte coloré dans :
`decklist-interactive.tsx` (2), `deckbuilder/components/deck-panel.tsx`,
`decks/compare/deck-compare.tsx`, `deckbuilder/components/card-detail-modal.tsx`
(bord teinté retiré aussi), `legendes/[slug]/page.tsx`.

`DOMAIN_BG` dans `lib/domains.ts` : **supprimé**. Code mort qui portait ce motif.

### Encre désactivée sur du contenu réel

`text-ink-disabled` (2,06:1) servait à de vrais textes. Passé à `text-ink-muted` dans
`footer.tsx`, `a-propos/page.tsx`, `glossaire-client.tsx`, `deck-panel.tsx`,
`profile-actions.tsx`. Le token reste pour la seule pastille vraiment inactive.

Petit texte violet : `text-violet` → `text-violet-light` sur 32 occurrences (3,69 → 5,78).

---

## 2. Accessibilité

### Anneau de focus clavier

`focus:outline-none` sur **40 contrôles écrits à la main** (20 fichiers) écrasait
l'anneau global défini dans `globals.css`. Classe retirée partout. Les composants
shadcn ont leur propre anneau `focus-visible`, ils n'ont pas été touchés.

### Modales

Trois modales n'avaient ni `role="dialog"`, ni Escape, ni piège de focus, alors que le
hook `useDialogA11y` existait déjà dans le projet :

- `decklist-interactive.tsx` : `MobileCardModal` et `ExportPanel`
- `deckbuilder.tsx` : liste des decks sauvegardés, extraite dans un composant
  `SavedDecksModalShell` pour que le hook se monte avec la modale et pas avec la page

### Noms accessibles

`aria-label` (et `aria-pressed` quand c'est un état) ajoutés sur :

| Fichier | Contrôle |
| --- | --- |
| `decklist-interactive.tsx` | Croix de fermeture, bascules grille/liste/statistiques (deux jeux, compact et normal) |
| `deckbuilder.tsx` | Fermer la modale, supprimer un deck sauvegardé, vider le deck |
| `card-browser.tsx` | Voir le détail de la carte |
| `point-tracker.tsx` | Ajouter / retirer un point de départ |
| `pagination.tsx` | Page précédente, page suivante, `aria-label` sur le `<nav>` |

### Zones tactiles

- `footer.tsx` : liens de 16px de haut, cercles de 24px qui se chevauchaient.
  `py-1` sur chaque lien, mesuré à 24px.
- `glossaire-client.tsx:181` : renvoi « Voir aussi » de 20px, passé à `py-1`.

### Mouvement réduit

`globals.css` : bloc `@media (prefers-reduced-motion: reduce)` hors `@layer` et en
`!important`, pour passer devant les utilitaires Tailwind. Le site n'en avait aucun.

### Plan des titres

Cinq pages sautaient un niveau. Les `h4` venaient de composants partagés embarqués
sous des contextes différents.

- Micro-libellés de panneau (« Courbe d'énergie », « Répartition par type »,
  « Statistiques ») → `<p>` : ils étiquettent un widget, pas une section.
  Fichiers : `deck-stats-panel.tsx` (3), `deck-panel.tsx`, `deck-stats.tsx`.
- Aperçu de carte au survol → `<p>` : ce n'est pas une section du document.
- Titres de section de decklist (« Deck Principal », « Runes »…) → `h2`.
- Titre du bloc decklist → `h2` (suivait directement le `h1` de la page deck).
- `deck-panel.tsx:250` « Deck » → `h2`. `deckbuilder.tsx` titre de modale → `h2`.
- `guides/debuter:178` et `guides/deckbuilding:155,253` → `h3`.

---

## 3. Structure

| Page | Problème | Correction |
| --- | --- | --- |
| `/decks/[slug]` | Page large de 412px sur un écran de 320 | `min-w-0` sur la cellule de grille : sans lui, `truncate` ne s'applique pas |
| `/tier-list` | Barre de 4 onglets à 412px | `flex-wrap` + `max-w-full` + `px-4` |

---

## 4. Polish

### Coupure des lignes

`globals.css` : `h1-h4 { text-wrap: balance }`, `p, li, figcaption, blockquote
{ text-wrap: pretty }`. Aucun usage sur tout le site avant.

### Transitions

`transition-all` : **50 occurrences, 22 fichiers, ramenées à 0**. 33 lignes qui
n'animaient que des couleurs → `transition-colors`. 17 qui touchent aussi ombre,
opacité ou transform → `transition` nu (la liste Tailwind par défaut, pas `all`).

### Contours d'images

`card-image.tsx` : `outline outline-1 -outline-offset-1 outline-white/10` sur les deux
branches de rendu. Blanc pur à 10%, jamais un neutre teinté qui salirait le bord.

### Arrondis

`--radius-game-card` : `8px` → `0px`, à ta demande. Un seul point, les 10 usages de
`rounded-game-card` suivent. Les panneaux d'interface (`--radius-card: 12px`) n'ont
pas bougé.

### Chiffres et pluriels

- `binder-explorer.tsx:279` : `tabular-nums` sur le compteur de quantité, seul
  compteur vraiment dynamique qui en manquait.
- `deck-coverage-panel.tsx:87` : `carte(s)` → pluriel conditionnel.

---

## 5. Textes

| Fichier | Avant | Après |
| --- | --- | --- |
| `decks/page.tsx:596` | « Recent » | « Récents » |
| `ui/dialog.tsx:75`, `ui/sheet.tsx:75` | « Close » | « Fermer » |
| `deck-legend-filter.tsx:43` | « Toutes les legendes » | « Toutes les Légendes » |
| `glossaire-client.tsx:53` | Catégorie « Timing » sur violet chaos | `bg-violet-dark`, le violet échouait dans les deux sens |

---

## Envisagé puis écarté

| Candidat | Raison |
| --- | --- |
| Retour tactile `scale(0.96)` au clic | **Essayé puis retiré.** `@layer base` perd contre les utilitaires : le `transition-property: scale` était écrasé par `transition-colors`, le scale sautait sans animation. Le sortir de la couche tuait les transitions de couleur de tous les boutons ; lister toutes les propriétés revenait à réécrire `transition-all`. À faire proprement en ajoutant `active:scale-[0.96] transition-transform` aux CTA principaux |
| 209 `style={{ fontFamily: "var(--font-rubik)" }}` en ligne | La classe `font-display` existe et fonctionne (vérifié). Gros diff mécanique, zéro changement visible |
| Trait des icônes lucide à 1,5 à côté du texte régulier | La majorité des icônes bordent du semibold ou du bold, où 2 est correct. Une seule épaisseur par surface est déjà respectée |
| Rayons imbriqués concentriques | Mesurés au DOM : le seul écart est une pastille `rounded-full` contenant un drapeau. Une pastille n'entre pas dans ce calcul |
| Remplacer les bordures par des ombres | `--color-hairline` sert aussi de séparateur de liste et de bord de tableau, que le skill exclut. Séparer les deux rôles demanderait un second token pour un gain nul en thème sombre |
| `will-change` sur les cartes qui zooment | 0 usage, aucun saccadement observé. À n'ajouter qu'après constat |
| Réduire les `hover:scale-105/110` | Vignettes d'images, pas des interactions haute fréquence. Le bloc mouvement réduit les neutralise déjà |
| Remplacer `window.alert` du partage de classeur par un toast | Construire un système de notifications dépasse un audit d'interface |
| Réduire la mesure des articles à 65 caractères | Ta consigne « élargir les guides » prime |

---

## 6. Trouvé par le balayage profond et par le faux utilisateur

Ces points n'étaient visibles ni à l'œil, ni par le premier balayage.

| Gravité | Emplacement | Problème | Correction |
| --- | --- | --- | --- |
| HIGH | `app/meta/page.tsx:13` | `unstable_cache` mettait en cache les **21 000 lignes de decks brutes, 3,9 Mo**. Au-delà de 2 Mo, Next refuse d'écrire et lève un `unhandledRejection` : le cache ne servait **jamais** et la page rejouait toute la requête à chaque visite | Agrégation faite **dans** la fonction cachée, le payload tombe à quelques kilo-octets. `createdAt` n'est plus chargé sur 21 000 lignes ; la date affichée vient de la tier list courante |
| HIGH | `app/decks/page.tsx:663` | `style={{ backgroundColor: 'var(--color-tier-...)' }}` : avec `@theme inline`, Tailwind **n'émet pas** ces variables. Le fond du badge était transparent depuis toujours, le texte blanc le masquait | Table de classes littérales `TIER_BG`. Mesuré : `--color-tier-s` renvoyait bien une chaîne vide |
| MEDIUM | `components/navbar.tsx:120` | `aria-controls="mobile-menu"` pointait dans le vide **sur toutes les pages** : le panneau n'existe dans le DOM que lorsqu'il est ouvert | Attribut retiré, `aria-expanded` suffit |
| MEDIUM | `app/api/collection/route.ts:8` | Le provider interroge cette route sur **chaque page** ; un visiteur non connecté recevait un 401, journalisé en erreur par le navigateur partout | 200 avec un marqueur `anonymous` pour la lecture globale. Le 401 reste pour un classeur précis et pour toute écriture |
| MEDIUM | 9 pages | Champs de formulaire sans étiquette accessible : recherche de cartes, du glossaire, des tournois, du best-of, filtre de Légende, filtres du méta, tri du deckbuilder, nom du deck, classeur, réponse aux commentaires, noms de joueurs du compteur | `aria-label`, ou `htmlFor`/`id` là où une étiquette visible existait déjà (`/decks/compare`) |
| LOW | `navbar.tsx:57`, `footer.tsx:32` | `width`/`height` du logo donnaient un ratio 3:1 et 2,86:1 pour un fichier en 2:1 → avertissement Next sur chaque page | Ratio réel 224×112 |

## 7. Cohérence des deux tier lists

Signalé par Allan. L'accueil et `/tier-list` avaient **chacun leur table de couleurs**,
avec des opacités différentes (`/80` sur `/tier-list`) et des lettres blanches d'un
côté, sombres de l'autre après la correction de contraste.

- Nouveau fichier `src/lib/tier-colors.ts` : `TIER_BANNER` et `TIER_ORDER`, source
  unique consommée par les deux composants.
- Vérifié après coup : couleurs identiques, et même contenu des deux côtés
  (S=3, A=6, B=8, C=13, D=10, onglet UNL actif).
- À noter, différence volontaire conservée : l'accueil abrège les onglets
  (OGN / SFD / UNL / ALL), `/tier-list` les écrit en entier. La carte de l'accueil
  est trop étroite pour les noms complets.

### Zone qui défile sur la carte d'accueil

Signalé par Allan, à ne pas reproduire. La carte avait `h-[420px] overflow-y-auto`
pour 594px de contenu, donc une barre de défilement interne. La hauteur fixe existait
pour éviter que la carte grandisse au changement d'onglet et pousse toute la ligne
de la grille.

Les deux contraintes sont maintenant tenues sans compromis : les quatre onglets sont
empilés dans **la même cellule de grille**, seul l'actif est visible (`invisible` sur
les autres, ce qui les sort aussi de l'ordre de tabulation et de l'arbre
d'accessibilité). Les onglets inactifs restent dans le flux et fixent la hauteur sur
le plus grand. Leurs vignettes sont des blocs vides de même taille, donc **aucune
image supplémentaire n'est téléchargée**.

Mesuré après correction : **0 élément qui défile** sur la page, et **729px de hauteur
de carte sur les quatre onglets**, sans saut au clic.

## 8. Pages admin (balayées grâce au faux utilisateur)

Jamais mesurées avant, elles portaient de vrais défauts.

| Gravité | Emplacement | Problème | Correction |
| --- | --- | --- | --- |
| HIGH | `admin/tier-list/tier-list-editor.tsx:38` | **Quatrième** table de couleurs de tier : S en ambre, A en rouge, B en violet, C en bleu ciel. L'éditeur ne montrait donc pas les couleurs du site. Contraste jusqu'à **2,13:1** | Utilise `TIER_BANNER` partagé |
| HIGH | `admin/layout.tsx:20` | Barre latérale figée à 240px + `p-8` : la page faisait **722px de large sur un écran de 390px** | Colonne sur mobile, deux colonnes à partir de `md`, `min-w-0` sur le contenu |
| MEDIUM | `admin/decks/page.tsx:354,358` | Ligne d'en-tête et onglets sans retour à la ligne, débordement de 20px | `flex-wrap` sur les deux |
| MEDIUM | `admin/tier-list`, `admin/decks/import`, `admin/decks`, `block-editor.tsx` | 15 champs de formulaire sans étiquette accessible, alors qu'une étiquette visible existait juste au-dessus | `aria-label` dérivé du texte de l'étiquette |
| MEDIUM | `admin/tier-list/tier-list-editor.tsx:373` | Boutons de déplacement de tier : 20×16px, sous le minimum, et lettre blanche à 10px sur fond de tier (2,13:1) | 24×24px, et lettre colorée sur fond neutre via un nouveau `TIER_TEXT_CLASS` |
| LOW | `admin/decks/import/page.tsx:90` | Flèche de retour sans nom accessible | `aria-label="Retour aux decks"` |
| LOW | `admin/tier-list/tier-list-editor.tsx:400` | `h1` puis `h3` | `h2` |

**Résultat : 22/22 pages authentifiées et admin OK.**

Note : les couleurs de tier existaient en **quatre** exemplaires (accueil, `/tier-list`,
éditeur admin, tokens `--color-tier-*`). Il en reste deux, chacune avec un rôle
distinct et documenté dans `src/lib/tier-colors.ts` : `TIER_BANNER` pour les bandeaux,
`TIER_TEXT_CLASS` / `--color-tier-*` pour la lettre en texte sur fond neutre.

## Reste à faire

Tout est traité, sauf trois points écartés avec raison :

1. **Retour tactile `scale(0.96)` au clic** : une règle CSS globale ne peut pas être
   fluide sans écraser les transitions de couleur des boutons (essayé, retiré, voir la
   section « Envisagé puis écarté »). À ajouter au cas par cas sur les CTA principaux
   avec `active:scale-[0.96] transition-transform`.
2. **Longueur de ligne** mesurée entre 96 et 139 caractères sur les guides et les
   articles, contre 60-75 recommandés. **Laissé tel quel** : ta consigne « élargir
   les guides, éviter `max-w-3xl` » prime sur la règle typographique.
3. **Troncature sans valeur complète** : jusqu'à 337 éléments tronqués sans `title`
   sur `/decks` à 640px. Ajouter un `title` partout serait lourd ; la plupart sont des
   noms de deck dont la page cible porte le nom complet. **À trancher par toi.**

Et un point hors de ma portée : **lecteur d'écran réel** sur les trois modales
corrigées.

**Trait des icônes lucide** : finalement laissé à 2. Mesuré, la grande majorité des
icônes borde du texte semibold ou bold, où 2 est la bonne épaisseur ; une seule
épaisseur par surface est déjà respectée. Passer à 1,5 aurait dégradé plus de cas
qu'il n'en aurait corrigé.

**209 `style={{ fontFamily: var(--font-rubik) }}` en ligne** : laissés. La classe
`font-display` existe et fonctionne (vérifié), mais le remplacement est un gros diff
mécanique pour zéro changement visible, et chaque occurrence demande de fusionner un
`style` dans un `className` existant, ce qui n'est pas automatisable sans risque.

**Faux utilisateur** : supprimé après le balayage
(`npx tsx scripts/seed-test-user.mts --clean`). Le script reste dans le dépôt pour
refaire un balayage authentifié plus tard.

## Faux positifs écartés après vérification

- **Images sans `width`/`height`** : 94 signalées sur `/tournois`. Mesure réelle sur
  les 936 images de la page : **0 risque de décalage**, les classes `h-4 w-4` etc.
  réservent déjà la place. Aucun fichier touché.
- **`/profil` à 1,12:1 et sans `h1`** : c'est la page OAuth de Discord après
  redirection, pas une page du site.
- **`transition-property: all` sur 4 293 éléments** : c'est la valeur initiale CSS de
  la propriété, pas une classe `transition-all`.
