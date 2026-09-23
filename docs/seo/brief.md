# Brief SEO

Lu au début de chaque passe hebdomadaire (skill `seo-semaine`). Le paysage, les piliers
et ce qu'on refuse sont dans `docs/SEO-STRATEGY.md` : pas recopiés ici.

## Ce que le site doit produire

Riftbound France répond à un joueur francophone : quel deck jouer, quelle carte, quelles
règles. Une visite ne vaut que si elle mène à l'une de ces actions, par ordre de valeur :

1. **`clic_cardnexus`**, le seul revenu. Lien affilié vers CardNexus : panier d'un deck
   (`type_achat: panier`), panier des seules cartes manquantes (`manquantes`), une
   carte (`produit`) ou la boutique (`boutique`).
2. **`connexion_discord`**. Un compte ouvre la collection et fait revenir le joueur.
3. **Les usages d'un deck** : `copie_code_deck`, `copie_tts_deck`, `copie_lien_deck`,
   `export_image_deck`, `publication_deck`. Ils ne rapportent rien directement, mais
   disent qu'une page a servi.
4. Overlay et outils : `copie_lien_overlay`, `copie_lien_overlay_compact`,
   `copie_lien_compagnon`, `partage_tier_list`.

Tous partent d'un seul écouteur (`src/components/analytics.tsx`, règle dans
`src/lib/suivi-clics.ts`) et ne comptent que les visiteurs qui acceptent les cookies :
un chiffre bas l'est aussi pour ça.

## Les pages candidates

Une page devient « la page de la semaine » si elle passe les quatre contrôles, dans
l'ordre : elle convertit déjà, elle est visible (page 1 ou 2), la page de résultats
attend ce qu'elle offre, et le concurrent ne gagne pas seulement par ses liens.

Chiffres Search Console du 26 août au 20 septembre 2026 (`etat.json`, relevé du 23).

| Famille | Search Console | Ce qu'on sait |
|---|---|---|
| `/` et `/en` en France | `/` : 2 893 impressions, 18,8 % de clics. `/en` : 6 440 impressions, 4,1 % | Google montre l'accueil anglais aux Français sur « deck riftbound », « riftbound meta », « tier list riftbound ». Hors marque, à position égale : 5,8 % de clics pour `/`, 4,0 % pour `/en`. Cause non établie : `hreflang` justes et dans le `<head>`, deux pages indexées chacune pour elle-même. |
| `/legendes/[slug]` | 958 clics, position 5,0, 50 pages | Captent déjà. Master Yi, Wuju Bladesman fait 263 clics en 3,8e position : n'y pas toucher. Aucun lien d'achat direct sur ces pages. |
| `/cartes` | 641 clics, 6 194 impressions, position 5,7 | L'achat se fait sur `/cartes/[id]` (lien `produit`). |
| `/guides/*` | 1 050 clics, position 4,9 | Ban list en tête (489 clics). Pas de lien d'achat. |

DataForSEO sous-estime nettement : il voyait les pages de Légende absentes du top 10.
Ses chiffres servent à trouver des requêtes, jamais à juger une page.

**Pièges notés** (des noms d'autres sites ou de joueurs : ces visiteurs ne cherchent pas
ce qu'on offre) : « rift deck » (843 impressions, 0 clic, c'est riftdecks.com),
« rift atlas » (175, 0), « lineka fiki » (151, 0), « piltover archive » (DataForSEO,
3 600/mois).
