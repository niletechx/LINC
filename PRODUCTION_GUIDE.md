# LINC — Production Deployment & Operations Guide

## 1. System Architecture Overview

LINC (Life Infrastructure Network) connects clients across Addis Ababa with verified service specialists (plumbers, electricians, technicians, tutors, etc.) using AI-powered matching, real-time messaging, and secure escrow payments.

`
+-------------------------------------------------------------+
¦                    LINC Flutter Mobile App                   ¦
¦   • Guest Browse & Discover Mode                           ¦
¦   • AI Natural Language Discovery (Gemini Multi-Model)      ¦
¦   • Direct Provider Chat & Real-time Sockets                ¦
¦   • Escrow Booking & Review Lifecycle                       ¦
+-------------------------------------------------------------+
                               ¦ HTTP REST & WebSocket (Port 5000)
+------------------------------?------------------------------+
¦                    LINC Express.js Backend                   ¦
¦   • Security: Helmet, CORS, Rate Limiters, JWT RBAC         ¦
¦   • Multi-Model AI Router: Gemini 1.5/2.0 Flash + Pro       ¦
¦   • Escrow Engine: 72h Auto-Release Background Cron         ¦
¦   • Real-time Gateway: Socket.IO Chat & Notifications       ¦
+-------------------------------------------------------------+
                               ¦
            +-------------------------------------+
            ¦                                     ¦
   [Production Supabase Cloud]            [Standalone In-Memory / Local PG]
   PostgreSQL 16 with RLS                 Zero-dependency testing & demos
`

---

## 2. Quick Start & Running the Backend

### A. Standalone / Demo Mode (Zero External Dependencies)
1. Navigate to the server folder:
   `ash
   cd server
   `
2. Install dependencies:
   `ash
   npm install
   `
3. Start the server:
   `ash
   npm run dev
   # Or for production:
   npm start
   `
   *The backend will automatically start in in-memory mode with pre-seeded mock users, verified providers, and service categories.*

### B. Production Mode with Supabase Cloud
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Execute the migrations located in supabase/migrations/:
   - 20260816000001_linc_schema.sql
   - 20260816000002_escrow_payments.sql
   - 20260817000003_rbac_foundation.sql
   - 20260817000004_rls_policies.sql
   - 20260817000005_audit_and_column_security.sql
3. Copy server/.env.production.example to server/.env and fill in your Supabase credentials:
   `ini
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-secure-jwt-secret
   `
4. Start the server:
   `ash
   npm start
   `

### C. Containerized Deployment (Docker Compose)
Run the full stack with persistent PostgreSQL:
`ash
docker compose up --build -d
`

---

## 3. Running & Building the Flutter Mobile App

### A. Debug & Development
`ash
cd client/mobile

# Run targeting your local PC backend IP:
flutter run --dart-define=BASE_URL=http://YOUR_LOCAL_IP:5000
`
*(Tip: You can also adjust the backend server IP anytime directly inside the app settings!)*

### B. Building Release APK (Android)
`ash
cd client/mobile
flutter build apk --release --dart-define=BASE_URL=https://api.linc.et
`
The output APK will be generated at client/mobile/build/app/outputs/flutter-apk/app-release.apk.

---

## 4. Automated Verification & Quality Assurance

### Run Backend API Test Suite:
`ash
cd server
npm test
`
*Executes all 18 automated tests across Health checks, Authentication, Catalog discovery, Guest mode gates, Escrow protection, and AI pipeline.*

### Run Flutter Static Analysis:
`ash
cd client/mobile
flutter analyze
`
*Verifies 0 warnings and 0 compilation issues across the entire mobile codebase.*

---

## 5. Security & Operations Runbook

| Security Layer | Implementation |
|---|---|
| **Rate Limiting** | Rate limiters on sensitive routes (auth, login, signup, AI chat) |
| **HTTP Security** | helmet HTTP header protections, request size limits |
| **Process Lifecycle** | SIGTERM/SIGINT graceful shutdown draining HTTP, Socket.IO, and DB connections |
| **Fail-Safe AI** | Multi-candidate Gemini fallback pipeline (1.5 Flash -> 2.0 Flash -> Pro -> Local engine) |
| **Role-Based Access** | Strict distinction between client and provider views, preventing self-reviews and unauthorized booking manipulation |
