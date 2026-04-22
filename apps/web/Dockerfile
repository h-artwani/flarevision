FROM node:20-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire monorepo so npm workspace resolution works correctly
COPY . .

# Install all workspace dependencies
RUN npm ci

# Build shared-types first — web imports from it at compile time
RUN npm run build -w @flarevision/shared-types

# Build the Next.js app (standalone output configured in next.config.ts)
RUN npm run build -w @flarevision/web

EXPOSE 3000

CMD ["node", "apps/web/.next/standalone/server.js"]
