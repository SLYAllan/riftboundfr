---
name: verifier
description: Vérifie que le travail tient avant de committer ou de pousser sur Riftbound France. À utiliser avant tout commit, tout push, ou dès qu'il faut dire si le dépôt est vert. Contient les pièges qui ont déjà fait passer du code cassé pour du vert.
---

# Vérifier avant de pousser

## La porte

```bash
npm run verify        # = tsc --noEmit && next build. Quelques minutes.
```

Vert = on peut committer. Rien d'autre ne fait office de porte.

## Les trois pièges

**1. `rtk` masque le code de sortie.** `rtk tsc && git commit` a déjà laissé
committer du code cassé : `rtk` rend 0 même quand la commande dessous échoue.
Pour juger un résultat, jamais de `&&` derrière `rtk` :

```bash
# PowerShell
npx tsc --noEmit ; echo "EXIT=$LASTEXITCODE"

# Bash
npx tsc --noEmit ; echo "EXIT=$?"
```

**2. `npm run lint` passe avec des avertissements.** Au relevé du 14 août 2026 :
0 erreur et 97 avertissements. Une nouvelle erreur bloque le travail ; les
avertissements existants restent une dette à réduire séparément.

**3. `npm run validate:decks` dépasse 5 minutes.** Le lancer avec une limite très
large. Un dépassement n'est pas un « ça marche ».

## Les autres commandes

| Commande | Ce qu'elle fait |
|---|---|
| `npx vitest run` | Tests. Doivent tous être verts. |
| `npx vitest run <fichier>` | Un seul fichier. |
| `npm run validate:decks` | Garde-fou anti-fabrication de decklists. Lent. |
| `npm run validate:names` | Noms de cartes suspects. Corrige avec `npm run fix:names`. |

## Ce qu'il faut dire ensuite

Rapporter le résultat réel, sortie à l'appui. Si un test échoue, le dire avec sa
sortie. Si une étape a été sautée, le dire. Ne jamais annoncer « vérifié » sans
avoir lu le code de sortie.

Le détail des commandes et leur état vérifié : `AGENTS.md`, section « Commandes ».
