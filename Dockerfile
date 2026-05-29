# ─────────────────────────────────────────────
# Stage 1: Build the SvelteKit app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL must be injected at build time as a build arg
# because Vite bakes env vars into the static bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ─────────────────────────────────────────────
# Stage 2: Production image (node adapter output)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# The adapter-node build output
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# Install only the production runtime dependency for adapter-node
RUN npm install --omit=dev

USER appuser

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "build/index.js"]
