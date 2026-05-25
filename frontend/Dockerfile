# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inject build-time environment variables
ENV BASE_PATH=/apps/task-management/v1
ENV BASE_API_URL=https://holocron.keross.com/api
ENV APPLICATION_API_URL=https://holocron.keross.com/api/task-management/v1
ENV LOGIN_PAGE_URL=https://holocron.keross.com/ikon-portal/login.html
ENV IKON_PLATFORM_UI_URL=https://holocron.keross.com/ikon-portal



RUN npm run build

# ---- Stage 3: Runtime ----
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production

# Runtime ENV (optional override)
ENV BASE_PATH=/apps/task-management/v1
ENV BASE_API_URL=https://holocron.keross.com/api
ENV APPLICATION_API_URL=https://holocron.keross.com/api/task-management/v1
ENV LOGIN_PAGE_URL=https://holocron.keross.com/ikon-portal/login.html
ENV IKON_PLATFORM_UI_URL=https://holocron.keross.com/ikon-portal


# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
