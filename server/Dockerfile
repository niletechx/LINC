# ==============================================================================
# Dockerfile for LINC Backend (Node.js + Express)
# Best Practices:
#  1. Minimal, secure base image (Alpine Linux)
#  2. Deterministic dependency layer caching
#  3. Non-root user execution (least-privilege security)
#  4. Native container health checking
# ==============================================================================

# Step 1: Base Image selection (Node 20 LTS on Alpine)
FROM node:20-alpine

# Set build & runtime metadata
LABEL maintainer="ermizamr" \
      description="LINC Backend API Service - DevOps Assignment" \
      version="1.0"

# Step 2: Set working directory
WORKDIR /usr/src/app

# Step 3: Install dependencies (Layer caching optimization)
# Copy package definitions first so npm install is cached unless dependencies change
COPY package*.json ./

# Install only production dependencies for minimal footprint & security
RUN npm install --omit=dev --no-audit --no-fund

# Step 4: Copy application source code
COPY . .

# Step 5: Security hardening - run as unprivileged 'node' user
RUN chown -R node:node /usr/src/app
USER node

# Step 6: Environment defaults & Port exposure
ENV NODE_ENV=production \
    PORT=10000

EXPOSE 10000

# Step 7: Built-in Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:10000/health || exit 1

# Step 8: Define entrypoint command
CMD ["node", "server.js"]
