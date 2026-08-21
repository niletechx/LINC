# Issue #1: Frontend-Backend Integration & Live API Hookup

**Type:** `Feature` / `Epic`  
**Status:** `In Progress`  
**Assignee:** `Team LINC`  
**Target Branch:** `main`

---

## 🎯 Description
Connect the Flutter mobile client (`client/mobile`) to the Node.js/Express backend server (`server`), Supabase database, Google Gemini RAG pipeline, and Socket.IO real-time communication engine.

---

## 📋 Task Breakdown

### Phase 1: Core Networking & Authentication
- [ ] Install & configure `dio` HTTP client with interceptors (`api_client.dart`)
- [ ] Add base URL environment switching (`127.0.0.1:5000` for Web/Windows, `10.0.2.2:5000` for Android)
- [ ] Implement JWT token storage & auto-attach Bearer header
- [ ] Connect `LoginScreen` & `SignupScreen` to `POST /api/auth/login` and `POST /api/auth/register`
- [ ] Add session recovery on app launch via `GET /api/auth/me`

### Phase 2: Discovery, Search & Provider Details
- [ ] Fetch categories dynamically from `GET /api/categories`
- [ ] Connect `HomeScreen` verified providers & open requests to `GET /api/providers` and `GET /api/requests`
- [ ] Connect `SearchScreen` text queries, rating filters, distance radius to `GET /api/providers/search`
- [ ] Connect `ProviderProfileScreen` to `GET /api/providers/:id` (services list & reviews)

### Phase 3: Real-Time Chat & Gemini AI Pipeline
- [ ] Integrate `socket_io_client` in Flutter (`socket_service.dart`)
- [ ] Connect `MessagesScreen` conversation list to `GET /api/messaging/conversations`
- [ ] Connect `DmScreen` to Socket.IO events (`send_message`, `new_message`)
- [ ] Implement `@AI Trust Advisor` real-time trigger in DMs
- [ ] Hook `AiScreen` up to `POST /api/ai/chat` for live Gemini RAG recommendations

### Phase 4: Booking Flow, Provider Dashboard & Escrow
- [ ] Connect `BookingFlowScreen` to `POST /api/bookings`
- [ ] Fetch user bookings in `BookingsScreen` from `GET /api/bookings`
- [ ] Implement Provider availability switch via `PATCH /api/providers/availability`
- [ ] Connect incoming requests accept/decline actions to `PATCH /api/requests/:id`
- [ ] Integrate Escrow payment hold and milestone release logic

---

## 🧪 Acceptance Criteria
1. User can register, login, and stay authenticated across app restarts.
2. Search returns live providers from the Supabase database.
3. LINC AI answers queries using live database context via Gemini 1.5 Flash.
4. Two users can message each other in real-time with instant delivery.
5. Clients can create bookings with Escrow payment records stored in Supabase.
