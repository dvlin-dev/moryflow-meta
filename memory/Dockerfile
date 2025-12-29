# Dockerfile for memory-server (monorepo build)
# Build from root: docker build -t memory-server .

FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages (needed for workspace resolution)
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/
COPY packages/server/prisma ./packages/server/prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/core ./packages/core
COPY packages/server ./packages/server

# Build core first, then server
RUN pnpm --filter @moryflow/memory-core build
RUN pnpm --filter @moryflow/memory-server db:generate
RUN pnpm --filter @moryflow/memory-server build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/src/generated ./packages/server/src/generated
COPY --from=builder /app/packages/server/prisma ./packages/server/prisma

# Copy entrypoint script
COPY packages/server/docker-entrypoint.sh ./packages/server/
RUN chmod +x ./packages/server/docker-entrypoint.sh

WORKDIR /app/packages/server

EXPOSE 3000

# Use entrypoint for auto-migration
ENTRYPOINT ["./docker-entrypoint.sh"]
