# Skills du projet

Copie datée du 12 août 2026 des skills et commandes d'Allan qui servent sur
Riftbound France. Copie **de secours et de repère**, pas la source : Claude Code
charge ceux de `~/.claude/skills/` et `~/.claude/commands/`, pas ceux d'ici.

Pourquoi les vendre dans le dépôt : le 10 août, ces 21 skills ont atterri dans
`C:\Windows\System32\.claude\skills` et sont devenus invisibles en session.
Ils ne viennent d'aucun marketplace, donc rien ne les réinstalle.

## Les deux qui comptent le plus ici

Dans `.hermes/commands/`. Ce sont des **commandes**, pas des skills, et elles sont
écrites pour ce projet.

| Commande | Quand |
|---|---|
| `reecrire` | Réécrit un texte selon les six règles d'Orwell du CLAUDE.md global d'Allan. À passer sur toute prose rendue : articles, guides, textes de page. |
| `accroche` | Réécrit une accroche ou un texte d'accueil selon les mêmes règles. |

Rappel des règles qu'elles appliquent : pas d'image toute faite, pas de mot long
quand un court suffit, couper ce qui peut l'être, actif plutôt que passif, mot
français courant plutôt que jargon. Et : **jamais de tiret cadratin** dans le
contenu rendu du site.

## Interface et design

Utilisés pour de vrai le 29 juillet 2026 (audit d'interface complet, 82 fichiers
modifiés) et le 11 août (passe d'accessibilité). Voir `docs/AUDITS.md`.

| Skill | Quand |
|---|---|
| `better-interface` | Chapeau : revue transversale d'un écran ou d'un parcours. Appelle les autres `better-*`. |
| `better-accessibility` | Focus, clavier, ARIA, formulaires, lecteurs d'écran. |
| `better-colors` | OKLCH, contrastes, thèmes. Le site a ses tokens en OKLCH. |
| `better-layout` | Groupement, alignement, ordre de lecture, points de rupture. |
| `better-typography` | Échelle typographique, hiérarchie des titres, césure. |
| `better-ui` | Finition : survols, ombres, arrondis, micro-animations. |
| `better-writing` | Textes d'interface : boutons, erreurs, états vides. **En anglais** — pour le français, passer par `reecrire`. |
| `make-interfaces-feel-better` | Variante condensée de `better-ui`, avec un mode revue rapide. |
| `baseline-ui` | Garde-fous Tailwind : durées d'animation, échelle typo, anti-motifs de mise en page. |
| `design` | Équipe de conception virtuelle pour une refonte de bout en bout. Gros calibre, à réserver aux chantiers. |
| `ui-ux-pro-max` | Bibliothèque de styles, palettes, appairages de polices. |
| `frontend-developer-skill` | Composants React 19 / Next 15+. |
| `responsive-design` | Container queries, typographie fluide, grilles. |
| `radix-ui-design-system` | Primitives sans style. Le site utilise Base UI, proche mais pas identique. |

## Peu ou pas utilisés ici

Copiés parce qu'ils étaient dans le dossier, mais sans usage établi sur ce projet :
`mobile-design` (pas d'app native), `figma-implement-design` (pas de Figma),
`scroll-experience`, `enhance-prompt`, `canvas-design`, `content-creator`,
`social-content`.

Deux exceptions possibles : `canvas-design` et `social-content` pourraient servir
aux visuels de réseaux, mais **les visuels de deck et de tier list ont déjà leur
outil** (`/api/decklist-image` et `scripts/gen-tierlist-image.mts`) — ne pas en
écrire un nouveau, voir `AGENTS.md`.

## Skills de plugin, non copiés

Ils viennent d'un marketplace et se réinstallent seuls. Listés pour mémoire.

| Skill | Usage sur le projet |
|---|---|
| `firecrawl:*` | **Le scraping web passe par là.** `WebFetch` et `curl` prennent des 403 Cloudflare. |
| `claude-seo:*` | Audits SEO et GEO (31 mai, 2 et 9 août). Attention : ses gabarits sont pensés SaaS, ~70 % ne se transposent pas ici. Partir de Search Console. |
| `superpowers:*` | Méthode : brainstorming, plans, débogage méthodique, revue. Les plans passés sont dans `docs/superpowers/`. |
| `ponytail:*` | Chasse à la sur-ingénierie. |
| `andrej-karpathy-skills:*` | Garde-fous de codage : changements chirurgicaux, hypothèses explicites. |

## Règle qui prime sur tous

Un skill propose une méthode, il ne connaît pas le projet. `AGENTS.md` gagne :
**ne jamais deviner, ne jamais fabriquer une decklist, chercher l'outil existant
avant d'en écrire un.**
