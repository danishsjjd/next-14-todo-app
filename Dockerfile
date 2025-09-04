FROM node:lts-alpine AS base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# openssl for prisma, dumb-init to handle PID 1 correctly
RUN apk add --no-cache libc6-compat openssl dumb-init

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm run prisma:generate && pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# Prisma - required for migrations
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+client@5.19.1_prisma@5.19.1/node_modules/@prisma/client /app/node_modules/@prisma/client
# dependencies of @prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+engines@5.19.1/node_modules/@prisma/engines /app/node_modules/@prisma/engines
# dependencies of @prisma/engines
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+debug@5.19.1/node_modules/@prisma/debug /app/node_modules/@prisma/debug
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+engines@5.19.1/node_modules/@prisma/engines-version /app/node_modules/@prisma/engines-version
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+fetch-engine@5.19.1/node_modules/@prisma/fetch-engine /app/node_modules/@prisma/fetch-engine
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/@prisma+get-platform@5.19.1/node_modules/@prisma/get-platform /app/node_modules/@prisma/get-platform
# prisma cli
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.pnpm/prisma@5.19.1/node_modules/prisma /app/node_modules/prisma
RUN mkdir -p /app/node_modules/.bin && ln -s /app/node_modules/prisma/build/index.js /app/node_modules/.bin/prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["dumb-init","./entrypoint.sh"]
