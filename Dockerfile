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
# Sans sonde, un conteneur dont la base est tombée restait « healthy » pendant que
# toutes les pages répondaient en erreur. Le délai de démarrage laisse à Next le
# temps d'ouvrir son port avant le premier appel.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["./entrypoint.sh"]
