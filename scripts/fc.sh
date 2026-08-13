#!/bin/bash
# firecrawl, mais qui change de clé quand la clé courante n'a plus de crédit.
#
#   bash scripts/fc.sh scrape <url> -f markdown --only-main-content -o <fichier>
#   bash scripts/fc.sh map <url>
#
# Remplace l'appel direct à `firecrawl` : mêmes arguments, même sortie. Le seul
# ajout est la rotation de clés.
#
# D'où viennent les clés, dans l'ordre :
#   1. $FIRECRAWL_API_KEYS  (séparées par des virgules ou des espaces)
#   2. .firecrawl/keys      (une par ligne)  <- le cas normal ici
#   3. $FIRECRAWL_API_KEY   (clé unique)
#   4. la config du CLI, si rien de tout ça
#
# Les clés sont des secrets : `.firecrawl/` est ignoré par git, et rien ici ne
# les écrit dans une sortie. Ne jamais les recopier dans un fichier suivi.
#
# Deux échecs à ne pas confondre, c'est tout l'intérêt du script :
#   « Insufficient credits »  -> la clé est morte, passer à la suivante.
#   « Rate limit exceeded »   -> la clé est bonne, on va trop vite : attendre.
# Traiter le second comme le premier brûlerait les cinq clés en une minute.
set -u

RACINE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FICHIER_CLES="$RACINE/.firecrawl/keys"
# La clé qui marchait au dernier appel, pour ne pas retenter les mortes à chaque
# fois : sur 600 decks, ça ferait 600 essais perdus d'avance.
ETAT="$RACINE/.firecrawl/cle-courante"

# --- Charger les clés --------------------------------------------------------
CLES=()
if [ -n "${FIRECRAWL_API_KEYS:-}" ]; then
  IFS=', ' read -r -a CLES <<< "$FIRECRAWL_API_KEYS"
elif [ -f "$FICHIER_CLES" ]; then
  while IFS= read -r ligne; do
    ligne="${ligne%%#*}"; ligne="$(echo "$ligne" | tr -d '[:space:]')"
    [ -n "$ligne" ] && CLES+=("$ligne")
  done < "$FICHIER_CLES"
elif [ -n "${FIRECRAWL_API_KEY:-}" ]; then
  CLES=("$FIRECRAWL_API_KEY")
fi

# Aucune clé : on laisse le CLI se débrouiller avec sa propre config plutôt que
# d'échouer. C'est le comportement d'avant ce script.
if [ "${#CLES[@]}" -eq 0 ]; then
  exec firecrawl "$@"
fi

# Reprendre à la clé qui marchait.
DEPART=0
if [ -f "$ETAT" ]; then
  lu="$(cat "$ETAT" 2>/dev/null || echo 0)"
  case "$lu" in ''|*[!0-9]*) lu=0 ;; esac
  [ "$lu" -lt "${#CLES[@]}" ] && DEPART="$lu"
fi

# --- Essayer chaque clé à partir de là ---------------------------------------
n="${#CLES[@]}"
for ((d = 0; d < n; d++)); do
  i=$(( (DEPART + d) % n ))
  cle="${CLES[$i]}"

  # Jusqu'à trois passages sur la même clé : les refus de débit sont temporaires.
  for essai in 1 2 3; do
    sortie="$(firecrawl "$@" -k "$cle" 2>&1)"
    code=$?

    if echo "$sortie" | grep -qi "Insufficient credits"; then
      break   # clé à sec : inutile d'insister, on passe à la suivante
    fi

    if echo "$sortie" | grep -qi "Rate limit exceeded"; then
      # Le CLI dit au bout de combien de secondes ça repart ; le lire vaut mieux
      # que de deviner. À défaut, 10 s de plus à chaque essai.
      attente="$(echo "$sortie" | grep -oE "retry after [0-9]+s" | grep -oE "[0-9]+" | head -1)"
      [ -z "$attente" ] && attente=$((essai * 10))
      sleep "$((attente + 2))"
      continue
    fi

    # Ni crédit épuisé ni débit dépassé : c'est le résultat, bon ou mauvais.
    echo "$i" > "$ETAT"
    [ -n "$sortie" ] && echo "$sortie"
    exit "$code"
  done

  echo "[fc] clé ${i} épuisée, passage à la suivante" >&2
done

echo "[fc] les ${n} clés sont à sec." >&2
exit 1
