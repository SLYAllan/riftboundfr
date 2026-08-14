#!/bin/sh
echo "Checking database..."
node migrate.mjs
echo "Starting server..."
exec node server.js
