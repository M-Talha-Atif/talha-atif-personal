# ---------- Stage 1: install prod deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# cache mount keeps npm's download cache between builds (BuildKit)
RUN --mount=type=cache,target=/root/.npm npm install --omit=dev

# ---------- Stage 2: final runtime image ----------
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run as non-root (the node image ships a 'node' user)
USER node

EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# exec form → node is PID 1 and receives SIGTERM
CMD ["node", "server.js"]
