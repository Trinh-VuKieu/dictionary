# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci

# Stage 2: Build source code & standalone output
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure dictionary.db is present (download if missing)
RUN npm run install-db

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Minimal production runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat libstdc++
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy dictionary database
COPY --from=builder --chown=nextjs:nodejs /app/lib/dictionary.db ./lib/dictionary.db

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
