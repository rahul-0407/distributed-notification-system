FROM oven/bun:1-alpine AS base
WORKDIR /app

FROM base AS installer
COPY package.json bun.lock turbo.json ./
COPY packages ./packages
COPY apps/backend ./apps/backend

RUN bun install

RUN cd packages/db && bun run prisma generate

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/apps/backend ./apps/backend
COPY --from=installer /app/package.json ./package.json

EXPOSE 5000

CMD ["sh", "-c", "cd packages/db && bun run prisma db push --accept-data-loss && cd /app && bun run apps/backend/index.ts"]
