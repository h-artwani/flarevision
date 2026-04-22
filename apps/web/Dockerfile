# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build -w @flarevision/shared-types

RUN cd apps/web && npm run build

RUN ls -la /app/apps/web/.next/standalone/

# ── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
