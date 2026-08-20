---
name: delegate-wave
description: Délègue le gros du travail (lecture, recherche, édition mécanique) à des workers pi tournant sur DeepSeek, pendant que Claude Code ou Codex ne fait plus que déléguer et relire. À utiliser dès qu'une tâche demande de balayer beaucoup de fichiers, scraper, parser, résumer ou appliquer un changement répétitif. But : couper la dépense de tokens du modèle cher sans jamais relâcher les RÈGLES ABSOLUES du dépôt.
---

# delegate-wave

Le skill vit dans `.agents/skills/delegate-wave/SKILL.md`. **Lis ce fichier et suis-le.**

Ce fichier-ci n'est qu'un panneau indicateur : Codex lit `.agents/skills/`, Claude
Code lit `.claude/skills/`. Sans lui, Claude Code ne voyait aucun des skills du
dépôt — d'où un `delegate-wave` employé d'un seul côté. Le fond n'est recopié nulle
part : deux copies de la même règle finissent toujours par diverger.
