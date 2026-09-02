# Node 20 est en fin de vie depuis avril 2026 : plus de correctif de sécurité.
# 24 est la LTS courante et la version de développement en local, donc build et
# production tournent sur le même moteur.
FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY migrate.mjs ./
COPY migrate-schema.mjs ./
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
# Le user nextjs doit pouvoir écrire le cache d'images optimisées et le cache
# de prerender/ISR (sinon EACCES sur /app/.next/cache et /app/.next/server).
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next
USER nextjs
EXPOSE 3000
ENV PORT=3000
# Docker pose HOSTNAME = identifiant du conteneur, et le serveur standalone de
# Next fait `process.env.HOSTNAME || "0.0.0.0"` : il n'écoutait donc QUE sur
# l'adresse du conteneur. Traefik y arrive, mais pas la boucle locale — la sonde
# se prenait « Connection refused » à chaque essai alors que le serveur tournait.
ENV HOSTNAME=0.0.0.0
# La sonde prouve que le serveur SERT. Elle ne juge pas la base : /api/health rend
# 200 avec l'état de la base dans son corps, parce qu'un accroc d'une seconde ne
# doit pas faire remplacer un conteneur qui sait servir en dégradé.
#
# `wget` de busybox, et pas `node -e` : la première version appelait process.exit()
# depuis le gestionnaire du fetch, ce qui tue Node avant la fermeture de ses
# descripteurs — sortie non nulle et AUCUNE sortie texte, à chaque essai. Coolify
# a refusé le déploiement du 2 septembre là-dessus. wget rend 0 sur 2xx, non nul
# sur une erreur HTTP comme sur un refus de connexion, et dit laquelle.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" > /dev/null || exit 1
CMD ["./entrypoint.sh"]
