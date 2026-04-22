FROM node:20-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# pnpm requires pnpm-workspace.yaml — the project declares workspaces
# in package.json (npm style), so we generate the equivalent pnpm config
RUN printf 'packages:\n  - "apps/*"\n  - "packages/*"\n' > pnpm-workspace.yaml

# Copy root manifest and all workspace package manifests separately so
# Docker can cache the install layer independently of source changes
COPY package.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY apps/worker/package.json apps/worker/

# Install all workspace dependencies
RUN pnpm install

# Copy all source files
COPY tsconfig.json ./
COPY packages/shared-types/ packages/shared-types/
COPY apps/worker/ apps/worker/

# Build shared-types first — worker imports from it at compile time
RUN pnpm --filter @flarevision/shared-types build

# Build the worker
RUN pnpm --filter @flarevision/worker build

# Set WORKDIR to the worker package so Railway's startCommand
# "node dist/index.js" resolves to apps/worker/dist/index.js
WORKDIR /app/apps/worker

CMD ["node", "dist/index.js"]
