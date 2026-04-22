FROM node:20-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root manifest and all workspace package manifests separately so
# Docker can cache the install layer independently of source changes
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/worker/package.json apps/worker/

# Install all workspace dependencies
RUN npm ci

# Copy all source files
COPY tsconfig.json ./
COPY packages/shared-types/ packages/shared-types/
COPY apps/worker/ apps/worker/

# Build shared-types first — worker imports from it at compile time
RUN npm run build -w @flarevision/shared-types

# Build the worker
RUN npm run build -w @flarevision/worker

# Set WORKDIR to the worker package so Railway's startCommand
# "node dist/index.js" resolves to apps/worker/dist/index.js
WORKDIR /app/apps/worker

CMD ["node", "dist/index.js"]
