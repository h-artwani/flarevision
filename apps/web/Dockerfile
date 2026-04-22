FROM node:20-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire monorepo so npm workspace resolution works correctly
COPY . .

# Install all workspace dependencies
RUN npm ci

# Build shared-types first — web imports from it at compile time
RUN npm run build -w @flarevision/shared-types

# Build the Next.js app from its own directory so Next.js picks up
# next.config.ts correctly and generates .next/standalone output
RUN cd apps/web && npm run build

# Debug: verify standalone output and confirm next.config.ts was picked up
RUN ls -la apps/web/.next/ && echo "---" && cat apps/web/next.config.ts

EXPOSE 3000

CMD ["sh", "-c", "ls -la /app/apps/web/.next/ && ls -la /app/apps/web/.next/standalone 2>/dev/null || echo 'NO STANDALONE FOLDER' && node /app/apps/web/.next/standalone/server.js"]
