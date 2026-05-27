# ---- Stage 1: Install dependencies ----
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --force

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inject build-time environment variables (VITE_* are baked into the bundle)
# These are placeholder values — override them per environment by rebuilding.
ENV VITE_BASE_PATH=/apps/task-management/v1/
ENV VITE_API_BASE_URL=https://holocron.keross.com/api/task-management/v1
ENV VITE_IKON_API_URL=https://holocron.keross.com/api
ENV VITE_IKON_PLATFORM_UI_URL=https://holocron.keross.com/ikon-portal
ENV VITE_LOGIN_PAGE_URL=https://holocron.keross.com/ikon-portal/login.html
ENV VITE_IKON_USER_API_URL=https://holocron.keross.com/api/platform/user/current

RUN npm run build

# ---- Stage 3: Serve with Nginx ----
FROM nginx:alpine AS runner

# Remove default nginx config and replace with our SPA-friendly one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files into the sub-path directory
# so nginx serves them at /apps/task-management/v1/
COPY --from=builder /app/dist /usr/share/nginx/html/apps/task-management/v1

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
