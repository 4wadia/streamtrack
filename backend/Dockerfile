FROM oven/bun:1.2.22 AS base
WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile

COPY backend ./backend
WORKDIR /app/backend

RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
