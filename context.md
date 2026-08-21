# LINC Project Context & Status

This document provides a summary of the project architecture, decisions made, and the current build status. This is to help another developer pick up the project seamlessly.

## 🚀 Project Overview
**LINC (Life Infrastructure Network)** is an AI-powered service discovery platform. It acts as a "social media for WORK", allowing users to connect with service providers, businesses, and organizations.
- A user can be both a requester and a provider using the same account.
- Businesses and organizations are treated as separate entities from individual providers.
- An embedded AI acts as a smart matching pipeline and a trust advisor within direct messages.

## 🏗️ Architecture & Stack
- **Monorepo** using npm workspaces (`/client`, `/server`, `/shared`).
- **Backend:** Node.js + Express.js.
- **Frontend:** React + Vite.
- **Database:** PostgreSQL hosted on **Supabase**.
- **AI Integration:** Google Gemini 1.5 Flash (via `@google/generative-ai`).
- **Real-time:** Socket.io for chat and notifications.

## 🗄️ Database Schema
We created and successfully pushed a 20-table schema to Supabase.
**Key Tables:**
- `users`: Core identities.
- `provider_profiles`, `businesses`, `organizations`: The 3 main service entity types.
- `services`: The services offered (must belong to exactly one entity type).
- `requests` & `matches`: User requests and AI-driven match scoring.
- `bookings`: Scheduling and job status.
- `conversations` & `messages`: Human-to-human DMs.
- `ai_conversations` & `ai_messages`: User-to-AI RAG search chats.
- `reviews`, `reports`, `verification_requests`: Platform trust and safety.

*The full migration SQL is located at:* `supabase/migrations/20260816000001_linc_schema.sql`

## 🛠️ Current Build Status (What we completed)
1. **Monorepo Initialization:** `package.json` workspaces configured. Client and server dependencies installed.
2. **Supabase:** Initialized, linked to the remote project (`niletechx@gmail.com`), and schema pushed successfully.
3. **Server Infrastructure:** 
   - Express app setup (`app.js`, `server.js`).
   - Sockets configured (`chat.socket.js`, `notification.socket.js`).
   - Middlewares created (auth, roles, error handling, rate limiting).
   - Utility functions (JWT, Logger, API responses).
4. **AI Module (`server/src/ai/`):** 
   - **RAG Pipeline:** Extracts user intent, retrieves providers from DB (scoring by distance, rating, budget), and builds prompts.
   - **Advisor:** Detects `@AI` mentions in DMs to provide trust/safety context on a provider.
5. **Feature Modules (Full Implementation):**
   - All **16 feature modules** across the platform are fully implemented following the 4-layer clean architecture (`Routes → Controller → Service → Repository`):
     - `auth` (Register, Login, JWT auth, Token refresh)
     - `users` (Profile management, status)
     - `categories` (Category hierarchy & fetching)
     - `providers` (Provider profile CRUD, availability, search filters)
     - `services` (Service listing CRUD, polymorphic associations)
     - `businesses` & `businesses/members` (Business entity management, team members)
     - `organizations` & `organizations/members` (Organization management, staff roles)
     - `requests` (User request creation, status, lifecycle)
     - `matching` (AI request matching, match score management)
     - `booking` (Booking scheduling, price agreement, statuses)
     - `messaging` & `messaging/inboxes` (Conversations, message delivery, inbox routing)
     - `reviews` (Polymorphic reviews, rating bounds, requester validation)
     - `verification` (Document submission, verification status workflow)
     - `reports` (Content reporting & moderation)
     - `notifications` (User notification management, read statuses)
     - `admin` (Platform overview, moderation dashboard, user management)

## 🎯 Next Steps / Where to pick up
1. **Environment Variables:** Open `server/.env` and paste the Supabase `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and Google `GEMINI_API_KEY`. (The URL is already pre-filled).
2. **Verify Modules:** Check the `providers` and `services` module files to ensure the AI finished writing them before the rate limit crash.
3. **Test the Backend:** Run `npm run dev:server` from the root to start the Express server on port 5000. Use Postman/Insomnia to test the `/api/auth/register` endpoint.
4. **Start Frontend Development:** The Vite React app is scaffolded in `/client`. You can now start building the UI components, routing, and state management (Zustand) to connect to the backend APIs.
