FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml .
RUN npm i -g corepack && corepack enable && corepack prepare pnpm@latest --activate && pnpm fetch

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules node_modules
COPY . .
RUN --mount=type=secret,id=SHA \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=SENTRY_DSN \
    --mount=type=secret,id=SENTRY_ORG \
    --mount=type=secret,id=SENTRY_PROJECT \
    export SHA=$(cat /run/secrets/SHA) && \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    export SENTRY_DSN=$(cat /run/secrets/SENTRY_DSN) && \
    export SENTRY_ORG=$(cat /run/secrets/SENTRY_ORG) && \
    export SENTRY_PROJECT=$(cat /run/secrets/SENTRY_PROJECT) && \
    npm i -g corepack && corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --offline && \
    pnpm prisma generate && \
    pnpm build && \
    pnpm prune --prod

FROM base AS runner
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S nodejs && \
    chown -R nodejs:nodejs /app
COPY --from=builder --chown=nodejs:nodejs /app/node_modules node_modules
COPY --from=builder --chown=nodejs:nodejs /app/build build
COPY --chown=nodejs:nodejs server server
COPY --chown=nodejs:nodejs package.json .

USER nodejs
ENV NODE_ENV=production
CMD ["node", "server/server.production.js"]