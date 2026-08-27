# ── Stage 1: Build TypeScript ──
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy package descriptors and TypeScript config
COPY package*.json tsconfig.json ./

# Install dependencies (including TypeScript compiler)
RUN npm install

# Copy source code and compile TypeScript to /usr/src/app/dist
COPY src ./src
RUN npm run build

# ── Stage 2: Production Runtime ──
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5001

# Copy package descriptors & install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Run as non-root user for security
USER node

EXPOSE 5001

# Run compiled server directly for proper UNIX signal handling
CMD ["node", "dist/server.js"]