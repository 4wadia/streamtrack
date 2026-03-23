FROM oven/bun:1.2.22 AS base
WORKDIR /app

# Copy only backend package.json and install deps (no workspace needed)
COPY backend/package.json ./package.json
COPY bun.lock ./bun.lock
RUN bun install

# Copy backend source code
COPY backend ./

# Build the backend
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
