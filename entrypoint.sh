#!/bin/sh
set -e

echo "Checking database..."
# Sortie 1 = schéma vide ou incomplet. Aucun redémarrage ne le réparera : il faut
# un « prisma db push ». Démarrer quand même donnait un conteneur qui se déclare
# prêt et répond 500 sur presque toute page.
# Sortie 2 = la vérification n'a pas pu se faire (base injoignable une seconde).
# Celle-là revient d'elle-même : bloquer dessus avait mis le site à terre en
# boucle de redémarrage le 16 août.
code=0
node migrate.mjs || code=$?
if [ "$code" -eq 1 ]; then
  echo "Schéma vide ou incomplet : le conteneur ne démarre pas."
  exit 1
fi
if [ "$code" -ne 0 ]; then
  echo "Vérif schéma impossible — on démarre quand même."
fi
echo "Starting server..."
exec node server.js
