# Codex sur ce dépôt

Ce qu'il faut savoir pour que Codex travaille ici comme Claude Code, et ce qu'il
faut faire une fois pour que ça marche.

## À faire une fois

1. **Marquer le dépôt de confiance.** Codex ne lit `.codex/` que pour un dépôt de
   confiance. Il pose la question au premier lancement ; `/status` dit où on en
   est. Sans confiance : pas de config projet, pas de garde-fous, pas de serveurs
   MCP — et rien ne prévient.
2. **Approuver les garde-fous.** Taper `/hooks`, relire `garde-fous.py`, le
   marquer de confiance. Codex refuse de lancer un hook non relu : il le liste et
   l'ignore. Codex retient l'empreinte du fichier, donc **toute modification du
   hook redemande une approbation**.
3. **Vérifier que ça a pris** :
   ```bash
   codex --ask-for-approval never "Liste les sources de consignes chargées et les skills du dépôt."
   ```
   Doivent apparaître : `AGENTS.md` à la racine, et les six skills de
   `.agents/skills/`.

## Ce qu'il y a dans ce dossier

| Fichier | Rôle |
|---|---|
| `config.toml` | Politique d'approbation, bac à sable, budget de consignes, serveurs MCP, branchement des garde-fous. |
| `hooks/garde-fous.py` | Refuse les commandes sans retour arrière. Portage des règles `deny` de `.claude/settings.json`. |
| `agents/*.toml` | Deux sous-agents en lecture seule : `explorateur` (trouver le vrai chemin d'exécution), `relecteur` (relire un diff avant commit). |

Les skills partagés ne sont **pas** ici : ils vivent dans `.agents/skills/`, à la
racine, parce que c'est là que Codex les cherche depuis n'importe quel
sous-dossier du dépôt.

## Vérifier les garde-fous

```bash
python .codex/hooks/garde-fous.py --test      # 16 cas, sortie 0
```

À relancer après toute modification de la liste. Le hook attrape la faute
d'inattention, pas quelqu'un qui cherche à le contourner : c'est un garde-fou,
pas une frontière.

## Ce que Codex n'a pas

- **dataforseo** — le serveur MCP demande un identifiant et un mot de passe, qui
  n'ont rien à faire dans un dépôt public. À poser dans `~/.codex/config.toml`.
- **Les skills `better-*`** (passes d'interface) et `firecrawl`. Ils vivent dans
  `~/.claude/`. Pour les rapatrier d'un coup, Codex sait importer une installation
  Claude Code : taper `/import` dans une session, choisir **Claude Code**. Ça
  convertit les skills, les commandes, les serveurs MCP et les hooks, sans rien
  changer à l'installation Claude Code.

## Si Codex ignore ces fichiers

- **Rien ne se charge** : le dépôt n'est probablement pas de confiance. `/status`.
- **Les consignes semblent coupées** : `AGENTS.md` fait ~21 Ko et Codex s'arrête à
  32 Ko par défaut, sans le dire. `project_doc_max_bytes` est monté à 64 Ko dans
  `config.toml` — vérifier que la config projet est bien chargée.
- **Le hook ne tourne pas** : il a changé depuis la dernière approbation. `/hooks`.
