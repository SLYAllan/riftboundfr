#!/bin/sh
echo "Running prisma db push..."
node node_modules/prisma/build/index.js db push --skip-generate --accept-data-loss 2>&1 || echo "Warning: prisma db push failed (tables may already exist)"
echo "Starting server..."
exec node server.js
