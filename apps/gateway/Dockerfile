# Stage 1: Prune
FROM node:22-slim AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @repo/gateway --docker

# Stage 2: Installer & Builder
FROM node:22-slim AS builder
WORKDIR /app
RUN corepack enable

# Copy lockfile and json first for caching
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Copy full source and build
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo run build --filter=@repo/gateway

# --- CRITICAL STEP: Prepare standalone deployment ---
# This creates a folder /app/deploy with ONLY the prod deps and built files for this app
RUN pnpm --filter=@repo/gateway --prod deploy ./deploy --legacy

# Stage 3: Runner
FROM node:22-slim AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --from=builder --chown=expressjs:nodejs /app/deploy .

CMD ["node", "dist/index.js"]
