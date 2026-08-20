---
name: verifier
description: Vérifie que le travail tient avant de committer ou de pousser sur Riftbound France. À utiliser avant tout commit, tout push, ou dès qu'il faut dire si le dépôt est vert. Contient les pièges qui ont déjà fait passer du code cassé pour du vert.
---

# verifier

Le skill vit dans `.agents/skills/verifier/SKILL.md`. **Lis ce fichier et suis-le.**

Ce fichier-ci n'est qu'un panneau indicateur : Codex lit `.agents/skills/`, Claude
Code lit `.claude/skills/`. Sans lui, Claude Code ne voyait aucun des skills du
dépôt — d'où un `delegate-wave` employé d'un seul côté. Le fond n'est recopié nulle
part : deux copies de la même règle finissent toujours par diverger.
