#!/usr/bin/env python
"""Refuse les commandes sans retour arriere, avant qu'elles ne partent.

Portage pour Codex des regles `deny` de `.claude/settings.json`. Sans ce fichier,
Codex n'herite d'aucun garde-fou du depot : les regles de Claude Code ne
protegent que Claude Code.

Contrat (manuel Codex, section Hooks) : un objet JSON sur stdin, `tool_input.command`
porte la commande shell. Pour refuser, ecrire sur stdout
`hookSpecificOutput.permissionDecision = "deny"`. Tout autre retour laisse passer.

Un hook est un garde-fou, pas une frontiere : il attrape la faute d'inattention,
pas quelqu'un qui cherche a le contourner.
"""

import json
import re
import sys

# (motif, raison). Le motif est cherche n'importe ou dans la commande : un `&&`
# ou un pipe ne doit pas suffire a passer dessous.
INTERDITS: list[tuple[str, str]] = [
    (r"\brm\s+-[rf]{2}\b", "rm -rf : suppression sans retour arriere."),
    (r"\bsudo\s+rm\b", "sudo rm : suppression sans retour arriere."),
    (r"\bgit\s+push\s+(--force|-f)\b", "push force : reecrit l'historique distant."),
    (r"\bgit\s+push\s+\S+\s+\+", "push force (refspec +) : reecrit l'historique distant."),
    (r"\bgit\s+reset\s+--hard\b", "reset --hard : jette le travail non commite."),
    (r"\bgit\s+clean\s+-[a-z]*f[a-z]*d\b", "git clean -fd : jette les fichiers non suivis."),
    (r"\bgit\s+checkout\s+--\s", "checkout -- : jette les modifications d'un fichier."),
    (r"\bgit\s+branch\s+-D\b", "branch -D : supprime une branche non fusionnee."),
    (
        r"\bprisma\s+migrate\s+reset\b",
        "prisma migrate reset : vide la base. Aucun retour arriere, et la base de prod est joignable depuis Internet.",
    ),
    (
        r"\bprisma\s+db\s+push\b.*--accept-data-loss",
        "db push --accept-data-loss : perte de donnees acceptee d'avance.",
    ),
    (r"\bdropdb\b", "dropdb : supprime une base."),
    (r"\bpsql\b.*\bDROP\b", "DROP en SQL direct."),
    (r"\bdocker\s+compose\s+down\b.*-v", "compose down -v : supprime les volumes, donc la base locale."),
    (r"\bdocker\s+volume\s+rm\b", "docker volume rm : supprime la base locale."),
    # Les secrets ne doivent jamais entrer dans le contexte : ils ressortent dans
    # un transcript, un rapport ou un commit.
    (r"(cat|type|less|more|head|tail)\s+[^|;&]*\.env\b", "lecture d'un .env : garder les secrets hors du contexte."),
    (r"(cat|type|less|more|head|tail)\s+[^|;&]*dump2?\.sql\b", "lecture d'un dump de base."),
    (r"(cat|type|less|more|head|tail)\s+[^|;&]*client_secret_[^|;&]*\.json", "lecture d'un secret OAuth."),
]

# `rtk` masque le code de sortie de ce qu'il enveloppe : `rtk tsc && git commit` a
# deja laisse committer du code casse. On previent au lieu de refuser, l'usage
# reste bon pour lire une sortie.
AVERTIR: list[tuple[str, str]] = [
    (
        r"\brtk\b[^;]*&&",
        "rtk masque le code de sortie de la commande qu'il enveloppe : le `&&` qui suit part sur un succes faux. Verifier avec `npx tsc --noEmit ; echo EXIT=$?`.",
    ),
]


def refuser(raison: str) -> None:
    json.dump(
        {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "permissionDecision": "deny",
                "permissionDecisionReason": f"Refuse par le garde-fou du depot : {raison}",
            }
        },
        sys.stdout,
    )


def verdict(commande: str) -> str:
    """("deny"|"note"|"ok", raison). Le seul endroit qui juge une commande."""
    for motif, raison in INTERDITS:
        if re.search(motif, commande, re.IGNORECASE):
            return "deny", raison
    for motif, note in AVERTIR:
        if re.search(motif, commande, re.IGNORECASE):
            return "note", note
    return "ok", ""


def autocontrole() -> int:
    """`python .codex/hooks/garde-fous.py --test`. Echoue si un motif se relache."""
    cas = [
        ("rm -rf node_modules", "deny"),
        ("cd /tmp && rm -fr build", "deny"),
        ("git push --force origin main", "deny"),
        ("git push origin +main", "deny"),
        ("npx prisma migrate reset", "deny"),
        ("npx prisma db push --accept-data-loss", "deny"),
        ("docker compose down -v", "deny"),
        ("cat .env", "deny"),
        ("head -5 .env.prod.local", "deny"),
        ("rtk tsc && git commit -m x", "note"),
        # Ce qui doit passer : le travail courant, y compris ce qui ressemble de loin
        # a un interdit (`db push` sans perte acceptee, `push` sans force).
        ("npm run verify", "ok"),
        ("npx prisma db push", "ok"),
        ("git push origin main", "ok"),
        ("rtk git status", "ok"),
        ("npx vitest run", "ok"),
        ("grep -rn env src/", "ok"),
    ]
    rates = [(c, attendu, verdict(c)[0]) for c, attendu in cas if verdict(c)[0] != attendu]
    for commande, attendu, obtenu in rates:
        print(f"RATE  {commande!r} : attendu {attendu}, obtenu {obtenu}", file=sys.stderr)
    print(f"{len(cas) - len(rates)}/{len(cas)} cas verts", file=sys.stderr)
    return 1 if rates else 0


def main() -> int:
    if "--test" in sys.argv:
        return autocontrole()

    try:
        evenement = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        # Entree illisible : ne pas bloquer le travail sur un hook casse.
        return 0

    entree = evenement.get("tool_input") or {}
    commande = entree.get("command")
    if isinstance(commande, list):
        commande = " ".join(str(part) for part in commande)
    if not isinstance(commande, str) or not commande.strip():
        return 0

    decision, raison = verdict(commande)
    if decision == "deny":
        refuser(raison)
    elif decision == "note":
        json.dump(
            {"hookSpecificOutput": {"hookEventName": "PreToolUse", "additionalContext": raison}},
            sys.stdout,
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
