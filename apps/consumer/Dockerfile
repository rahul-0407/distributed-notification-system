FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS installer
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/consumer ./apps/consumer

RUN bun install

RUN cd packages/db && bun run prisma generate

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/apps/consumer ./apps/consumer
COPY --from=installer /app/package.json ./package.json

CMD ["bun", "run", "apps/consumer/index.ts"]
