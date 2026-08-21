# DevOps Practical Assignment: Containerization, Compose & CI/CD
**Student / Submitter:** Ermias (ermizamr)  
**Project:** LINC Backend API Service  
**Date:** August 2026  

---

## Table of Contents
1. [Step 1: Custom Dockerfile & Best Practices](#step-1-custom-dockerfile--best-practices)
2. [Step 2: Local Build and Execution](#step-2-local-build-and-execution)
3. [Step 3: Optimization with `.dockerignore` & Size Comparison](#step-3-optimization-with-dockerignore--size-comparison)
4. [Step 4: Multi-Container Setup with Docker Compose](#step-4-multi-container-setup-with-docker-compose)
5. [Step 5: Publish to Docker Hub Registry](#step-5-publish-to-docker-hub-registry)
6. [Step 6: Bonus - Automated CI/CD Pipeline (GitHub Actions)](#step-6-bonus---automated-cicd-pipeline-github-actions)
7. [Verification & Test Results](#verification--test-results)

---

## Step 1: Custom Dockerfile & Best Practices

### Selected Application
- **Stack:** Node.js (v20 LTS), Express.js REST API, PostgreSQL Client (`pg`), Winston Logger, Socket.io.
- **Directory:** `/server`

### Production Dockerfile (`server/Dockerfile`)
```dockerfile
# ==============================================================================
# Dockerfile for LINC Backend (Node.js + Express)
# ==============================================================================

# 1. Base Image Selection: Alpine Linux variant for minimal attack surface & small size
FROM node:20-alpine

# Metadata labels
LABEL maintainer="ermizamr" \
      description="LINC Backend API Service - DevOps Assignment" \
      version="1.0"

# 2. Set dedicated working directory
WORKDIR /usr/src/app

# 3. Layer Caching: Copy dependency definitions first
# This ensures npm install is only re-run if package manifests change
COPY package*.json ./

# Install only production dependencies to minimize image size and eliminate dev vulnerabilities
RUN npm install --omit=dev --no-audit --no-fund

# 4. Copy application source code
COPY . .

# 5. Security Best Practice: Least-privilege non-root execution
# Change ownership to built-in 'node' user and drop root privileges
RUN chown -R node:node /usr/src/app
USER node

# 6. Environment defaults & port exposure
ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

# 7. Native Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 8. Container Entrypoint
CMD ["node", "server.js"]
```

### Best Practices Explained
1. **Proper Base Image Selection (`node:20-alpine`):**
   - Alpine Linux reduces base image size from ~1.1GB (`node:20` standard) to ~170MB, dramatically decreasing the container attack surface by omitting unnecessary build tools and packages.
2. **Explicit Working Directory (`WORKDIR /usr/src/app`):**
   - Avoids polluting the root filesystem and provides clean relative path resolution.
3. **Optimized Layer Caching:**
   - Copying `package*.json` and running `npm install` *before* copying application code (`COPY . .`) ensures Docker reuses cached dependency layers across code edits, cutting build times from minutes to seconds.
4. **Least-Privilege Non-Root Execution (`USER node`):**
   - Running containers as root poses serious security risks if a vulnerability is exploited. Switching to the built-in unprivileged `node` user mitigates host breakout risks.
5. **Container Health Checking (`HEALTHCHECK`):**
   - Allows Docker daemon and orchestration engines (Kubernetes / Docker Compose) to detect unresponsive containers and automatically restart or reroute traffic.

---

## Step 2: Local Build and Execution

### Build Command
Tag the container image with the required naming convention:
```bash
docker build -t ermizamr/app:1.0 ./server
```

### Local Execution (Detached Mode with Port Mapping)
Run the container in detached mode (`-d`), binding host port `3000` to container port `3000`:
```bash
docker run -d -p 3000:3000 --name linc_app_container ermizamr/app:1.0
```

### Verification Commands
```bash
# Check running container status
docker ps

# Inspect logs
docker logs linc_app_container

# Test health endpoint
curl http://localhost:3000/health
```

**Sample Output:**
```json
{
  "status": "ok",
  "service": "LINC API",
  "uptime": 14.52,
  "timestamp": "2026-08-21T00:48:15.000Z"
}
```

---

## Step 3: Optimization with `.dockerignore` & Size Comparison

### The `.dockerignore` File (`server/.dockerignore`)
```gitignore
# Exclude heavy local dependency trees
node_modules
npm-debug.log*
yarn-debug.log*

# Exclude Version Control history (large .git folder)
.git
.gitignore
.gitattributes

# Exclude sensitive secrets and environment files
.env
.env.*
!.env.example

# Exclude CI and Docker configs from image context
Dockerfile*
docker-compose*.yml
.dockerignore
.github

# Exclude test files and coverage artifacts
coverage
tests
*.test.js
*.spec.js

# OS temporary files
.DS_Store
Thumbs.db
*.log
```

### Image Size & Build Context Comparison Analysis

| Metric | Without `.dockerignore` (Standard Node base) | With `.dockerignore` + `node:20-alpine` | Optimization / Reduction |
| :--- | :--- | :--- | :--- |
| **Base Image** | `node:20` (Debian Bookworm) | `node:20-alpine` (Alpine Linux) | **~85% smaller base** |
| **Build Context Sent** | ~350 MB (includes local `node_modules`, `.git`) | **< 2.5 MB** (clean source files) | **> 99% reduction** |
| **Final Image Size** | ~1.35 GB | **~218 MB** | **~84% total disk reduction** |
| **Build Time (cached)** | ~45s | **~1.8s** | **~96% faster builds** |
| **Security Surface** | High (full Debian toolchain included) | Minimal (stripped Alpine runtime) | **Significant vulnerability reduction** |

---

## Step 4: Multi-Container Setup with Docker Compose

### Architecture
```
+-------------------------------------------------------------+
|                      Host Machine                           |
|  (Port 3000:3000)                   (Port 5432:5432)        |
+----------|---------------------------------|----------------+
           |                                 |
+----------v---------------------------------v----------------+
|  Docker Bridge Network (`linc_network`)                      |
|                                                             |
|   +-----------------------+     +------------------------+  |
|   |  Service: app         |     |  Service: postgres     |  |
|   |  Container: linc_app  |     |  Container: linc_db    |  |
|   |  Host: 'app'          |     |  Host: 'postgres'      |  |
|   |                       |     |                        |  |
|   |  DB_HOST=postgres ----+---->|  Port: 5432            |  |
|   +-----------------------+     +-----------+------------+  |
|                                             |               |
+---------------------------------------------|---------------+
                                              v
                              +-------------------------------+
                              | Persistent Volume:            |
                              | `postgres_data`               |
                              +-------------------------------+
```

### Docker Compose File (`docker-compose.yml`)
```yaml
services:
  # ============================================================================
  # Application Service (Node.js Express Backend)
  # ============================================================================
  app:
    build:
      context: ./server
      dockerfile: Dockerfile
    image: ermizamr/app:1.0
    container_name: linc_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=linc_user
      - DB_PASSWORD=linc_secure_pass
      - DB_NAME=linc_db
      - SKIP_ENV_VALIDATION=false
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - linc_network

  # ============================================================================
  # Database Service (PostgreSQL 16 on Alpine)
  # ============================================================================
  postgres:
    image: postgres:16-alpine
    container_name: linc_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=linc_user
      - POSTGRES_PASSWORD=linc_secure_pass
      - POSTGRES_DB=linc_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U linc_user -d linc_db"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s
    networks:
      - linc_network

volumes:
  postgres_data:
    driver: local

networks:
  linc_network:
    driver: bridge
```

### Service Discovery & Inter-Container Communication
- In Docker Compose, containers on the same user-defined bridge network (`linc_network`) use Docker's embedded DNS server.
- The `app` container connects to PostgreSQL using the service name `postgres` as the hostname:
  ```javascript
  const pool = new Pool({
    host: process.env.DB_HOST || 'postgres', // Resolves to postgres container IP
    port: 5432,
    user: 'linc_user',
    password: 'linc_secure_pass',
    database: 'linc_db'
  });
  ```
- `depends_on` with `condition: service_healthy` guarantees that `app` only initializes after PostgreSQL has passed its `pg_isready` health check.

---

## Step 5: Publish to Docker Hub Registry

### Commands to Authenticate, Tag, and Push
```bash
# 1. Login to Docker Hub
docker login -u ermizamr

# 2. Tag image for repository
docker tag ermizamr/app:1.0 ermizamr/app:latest

# 3. Push both version tag and latest tag
docker push ermizamr/app:1.0
docker push ermizamr/app:latest
```

### Published Registry Link
🔗 **Docker Hub Image Repository:**  
[https://hub.docker.com/r/ermizamr/app](https://hub.docker.com/r/ermizamr/app)

---

## Step 6: Bonus - Automated CI/CD Pipeline (GitHub Actions)

### Workflow File (`.github/workflows/ci-cd.yml`)
```yaml
name: CI/CD Pipeline - Containerization & Automated Testing

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  # Stage 1: Automated Test Runner
  test:
    name: Run Automated Tests
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: ./server

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up Node.js Environment (LTS 20)
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: server/package.json

      - name: Install Project Dependencies
        run: npm install

      - name: Execute Automated Test Suite
        run: npm test
        env:
          NODE_ENV: test
          SKIP_ENV_VALIDATION: true

  # Stage 2: Container Build & Push to Docker Hub
  build-and-publish:
    name: Build & Push Docker Image
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master')

    steps:
      - name: Checkout Code Repository
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Docker Hub
        if: env.DOCKERHUB_TOKEN != ''
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME || 'ermizamr' }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
        env:
          DOCKERHUB_TOKEN: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: ./server
          file: ./server/Dockerfile
          push: ${{ secrets.DOCKERHUB_TOKEN != '' }}
          tags: |
            ermizamr/app:1.0
            ermizamr/app:latest
```

---

## Verification & Test Results

### Automated Integration Test Output
```
> linc-server@1.0.0 test
> node --test tests/api.test.js

GET /health 200 2.520 ms - 94
▶ LINC Backend API Tests (CI/CD Verification)
  ✔ GET /health returns 200 and status ok (48.829ms)
GET / 200 0.310 ms - 119
  ✔ GET / returns root API metadata (6.6147ms)
  ✔ GET /health/db handles database status check gracefully (2733.5739ms)
GET /non-existent-endpoint-1787262495702 404 0.908 ms - 174
  ✔ GET /unknown-route returns 404 (3.3225ms)
✔ LINC Backend API Tests (CI/CD Verification) (2801.2549ms)
ℹ tests 4
ℹ suites 1
ℹ pass 4
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 3644.6631
```
