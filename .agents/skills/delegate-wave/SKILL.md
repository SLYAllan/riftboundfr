---
name: delegate-wave
description: Délègue le gros du travail (lecture, recherche, édition mécanique) à des workers pi tournant sur DeepSeek, pendant que Claude Code ou Codex ne fait plus que déléguer et relire. À utiliser dès qu'une tâche demande de balayer beaucoup de fichiers, scraper, parser, résumer ou appliquer un changement répétitif. But : couper la dépense de tokens du modèle cher sans jamais relâcher les RÈGLES ABSOLUES du dépôt.
---

# Déléguer par vagues à pi + DeepSeek

L'idée tient en une phrase : **le worker gratte, toi tu relis.** Le worker, c'est
`pi` (installé, `pi --version`), branché sur DeepSeek. Toi (Claude Code ou Codex),
tu découpes le travail, tu lances la vague, tu relis chaque diff, tu décides. Tu ne
lis plus les fichiers toi-même quand un worker peut le faire à ta place.

## Quand l'utiliser / quand s'abstenir

- **Utiliser** : balayer beaucoup de fichiers, chercher où vit une chose, scraper,
  parser un scrape brut, résumer un transcript, appliquer un renommage ou une
  correction répétitive, produire un premier jet d'édition mécanique.
- **S'abstenir** : les décisions de jugement et tout ce que couvrent les RÈGLES
  ABSOLUES d'`AGENTS.md` — intégrité des decklists, choix d'architecture, seeds et
  base **de production** (aucun retour arrière), sécurité (garde-fous, `.env`).
  Le worker peut préparer ; **c'est toi qui tranches.**

## Réglage (une fois)

La clé DeepSeek vit dans l'environnement, **jamais dans le dépôt** (même règle que
les identifiants MCP dataforseo) :

```bash
export DEEPSEEK_API_KEY=sk-...      # shell perso, pas un fichier suivi
```

**Sur cette machine, la clé peut vivre dans le magasin d'identifiants de pi.** Un
`echo $DEEPSEEK_API_KEY` vide ne veut donc pas dire qu'elle manque. Ne jamais lire ni
afficher le fichier d'identifiants. Confirmer avec un appel qui exerce vraiment un
outil :

```bash
pi -p --provider deepseek --model deepseek-v4-flash --approve \
   --tools read,grep,find,ls --no-session \
   "Utilise read pour lire package.json, puis réponds uniquement avec le champ name."
```

Le test réussit seulement si la sortie contient le vrai nom du projet. Un code 0 ne
suffit pas : si la sortie contient du balisage `DSML` ou un appel d'outil écrit en
texte, DeepSeek n'a pas exécuté l'outil. Ne pas lancer de vague dans ce cas ; utiliser
les sous-agents disponibles et signaler l'échec de `pi`.

Deux modèles, deux usages :

| Modèle | Pour quoi |
|---|---|
| `deepseek-v4-flash` | Lecture, recherche, résumé, parse, édition mécanique. Le moins cher. Par défaut. |
| `deepseek-v4-pro` | Édition multi-fichiers, logique qui demande à réfléchir. |

## Lancer un worker

Non-interactif, il traite le message et sort (`-p`). On garde `AGENTS.md` en
contexte (donc **pas** de `-nc`) pour que le worker obéisse aux règles du dépôt.
`--approve` fait confiance aux fichiers du projet pour ce run.

```bash
# Worker LECTURE SEULE (découverte, recherche) : aucun outil d'écriture
pi -p --provider deepseek --model deepseek-v4-flash --approve \
   --tools read,grep,find,ls --session-id wave-<tache>-1 \
   "Liste chaque fichier de src/ qui importe resolveDeckCards et la ligne."

# Worker ÉDITEUR (premier jet d'un changement mécanique)
pi -p --provider deepseek --model deepseek-v4-pro --approve \
   --session-id wave-<tache>-2 \
   "Dans data/decklists/akali/*.json, renomme le champ 'sideboard' en 'sideDeck'. Ne touche à rien d'autre."
```

- `--session-id wave-...` : tu peux rouvrir le worker (`pi -c` / `--resume`) pour
  l'inspecter ou lui redonner du travail.
- Sortie machine : ajoute `--mode json` quand tu veux parser le résultat.

## La vague (3-4 workers, pas plus)

Même plafond que le reste du dépôt (`AGENTS.md` : vagues de 3-4, sinon rate-limit).
`tmux` n'existe pas sous Windows : on lance chaque worker **en arrière-plan** (l'outil
Bash `run_in_background`), un `--session-id` distinct par worker, puis on récolte.
Jamais deux grosses vagues en même temps.

## La porte : tu relis, toujours

Rien de ce qu'un worker écrit ne part sans relecture. Dans l'ordre :

1. **Lis le diff** que le worker a produit (`git diff`). Un worker bon marché se
   trompe sans prévenir : c'est le prix du procédé.
2. **Recoupe** contre les sources d'`AGENTS.md` (DB cartes, `banned-cards.ts`,
   `data/raw-scrapes/`) — surtout tout ce qui touche aux decklists.
3. **Ne jamais** passer un secret ou le contenu d'un `.env` dans un prompt de worker.
4. **La porte reste `npm run verify`**, lancée par toi, jamais par un worker.
   Voir le skill `verifier`.

Si un worker a « complété » une decklist partielle, l'a devinée, ou a fabriqué une
donnée : jeter son travail. Mieux vaut refaire que publier du faux (`AGENTS.md`,
« Intégrité des données decklists »).

Le fond des règles ne se recopie pas ici : il vit dans `AGENTS.md`. Ce skill ne dit
que *comment* déléguer ; *quoi* est permis, c'est `AGENTS.md` qui trace la ligne.
