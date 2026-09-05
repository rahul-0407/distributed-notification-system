FROM oven/bun:1.2.2-alpine AS base
WORKDIR /app

FROM base AS installer
COPY package.json bun.lock turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/consumer/package.json ./apps/consumer/

RUN bun install --frozen-lockfile || bun install

COPY packages ./packages
COPY apps/consumer ./apps/consumer

RUN bunx prisma generate --schema=packages/db/prisma/schema.prisma

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/apps/consumer ./apps/consumer
COPY --from=installer /app/package.json ./package.json

CMD ["bun", "run", "apps/consumer/index.ts"]
