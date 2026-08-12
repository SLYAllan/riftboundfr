@AGENTS.md

# Spécifique à Claude Code

Tout le fond — règles de travail, stack, arborescence, où vit la logique métier,
commandes vérifiées, conventions — est dans `AGENTS.md`, importé ci-dessus.
Il y est et pas ici parce que **Codex lit `AGENTS.md` et ne lit pas ce fichier** :
une seule source, sinon les deux divergent et l'un des deux agents travaille avec
une version périmée.

Ce qui suit n'existe que côté Claude Code.

## Écrire en français

Deux commandes portent les six règles d'écriture (Orwell) qui s'appliquent à
**toute prose rendue sur le site** : articles, guides, textes de page.

- `/reecrire` — réécrit un texte selon les six règles.
- `/accroche` — réécrit une accroche ou un texte d'accueil.

Elles n'existent pas dans Codex. Si une tâche produit du texte français destiné
aux visiteurs, elle se termine ici, pas ailleurs.

## Skills

`.hermes/SKILLS.md` dit lequel sert à quoi sur ce projet, et lesquels ne servent
à rien ici. En résumé : la famille `better-*` pour les passes d'interface (elle a
servi à l'audit du 29 juillet), `firecrawl` pour tout scraping — `WebFetch` et
`curl` se prennent des 403 Cloudflare.

`.hermes/skills/` en contient une copie de secours, parce que ces skills ne
viennent d'aucun marketplace et se sont déjà perdus une fois. **Ce n'est pas la
source** : Claude Code charge ceux de `~/.claude/`.

Un skill propose une méthode, il ne connaît pas le projet. `AGENTS.md` prime.

## Garde-fous

`.claude/settings.json` refuse `rm -rf`, `push --force`, les remises à zéro de
base et la lecture des `.env` ; il demande confirmation pour les déploiements,
les seeds et `prisma db push`.

**Ces règles ne protègent que Claude Code.** Un agent lancé par Hermes ou Codex
passe par sa propre politique d'approbation. Ne jamais supposer qu'un garde-fou
posé ici couvre l'autre exécutant.

## Mémoire

Le dossier de mémoire du projet retient des faits qui ne sont pas dans le dépôt
(préférences d'Allan, pièges d'API, historique de décisions). Un fait qui vit
déjà dans `AGENTS.md`, `HANDOFF.md` ou `docs/` n'y a pas sa place : il y serait
dupliqué, puis désynchronisé.
