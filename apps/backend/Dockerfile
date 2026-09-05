FROM oven/bun:1.2.2-alpine AS base
WORKDIR /app


FROM base AS installer
COPY package.json bun.lock turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/backend/package.json ./apps/backend/


RUN bun install --frozen-lockfile || bun install

COPY packages ./packages
COPY apps/backend ./apps/backend

RUN bunx prisma generate --schema=packages/db/prisma/schema.prisma


FROM base as runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=installer /app/node_modules ./node_modules
COPY --from=installer /app/packages ./packages
COPY --from=installer /app/apps/backend ./apps/backend
COPY --from=installer /app/package.json ./package.json

EXPOSE 5000

CMD ["bun", "run", "apps/backend/index.ts"]

