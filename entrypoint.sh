#!/bin/sh
set -e

echo "Checking database..."
# La vérif du schéma est consultative : elle prévient, elle ne bloque JAMAIS le
# démarrage. Sans le `|| ...`, un simple accroc DB au boot faisait sortir migrate
# en 1, `set -e` avortait avant server.js, et Coolify redémarrait en boucle :
# tout le site tombait. Un schéma vraiment cassé est géré en aval par safeQuery.
node migrate.mjs || echo "Vérif schéma en échec — on démarre quand même."
echo "Starting server..."
exec node server.js
