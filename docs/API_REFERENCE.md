# 📖 LINC — API Reference & Contract Specification

This document provides a comprehensive specification of all REST endpoints exposed by the LINC Express API server (`/api/v1`), detailing route paths, HTTP methods, authorization levels, request payloads, response schemas, and possible error status codes.

---

## 🔒 Authentication & Headers

### Global Base URL
- **Local:** `http://localhost:5000/api/v1`
- **Production (Render Cloud):** `https://linc-backend-2zcf.onrender.com/api/v1`

### Authorization Header
Endpoints requiring authentication enforce JWT bearer verification:
```http
Authorization: Bearer <jwt_access_token>
```

### Rate Limiting
- **General API (`apiLimiter`):** 100 requests per 15 minutes per IP.
- **Authentication (`authLimiter`):** 10 attempts per 15 minutes per IP (brute-force protection).
- **AI Endpoints (`aiLimiter`):** 20 requests per minute per IP (rate-budget guardrail).

---

## Standard Response Formats

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "message": "Descriptive error message",
  "errors": []
}
```

### Common HTTP Status Codes
| Status Code | Reason | Meaning |
|---|---|---|
| `200 OK` | Success | Request succeeded with data payload. |
| `201 Created` | Created | Resource successfully created. |
| `400 Bad Request` | Validation Failure | Invalid input payload or missing required parameters. |
| `401 Unauthorized` | Missing / Invalid Token | Bearer token missing, expired, or malformed. |
| `403 Forbidden` | Access Denied | Authenticated user lacks required role or permissions. |
| `404 Not Found` | Resource Missing | Targeted record or entity does not exist. |
| `409 Conflict` | Conflict | Duplicate resource (e.g. duplicate email/username). |
| `429 Too Many Requests`| Rate Limit Exceeded | Request quota exceeded for current window. |
| `500 Internal Server Error`| Server Error | Unhandled server or database error. |

---

## 1. Authentication (`/api/v1/auth`)

### Register User
- **Method:** `POST /api/v1/auth/register`
- **Auth:** Public (`None`)
- **Rate Limit:** `authLimiter`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Doe",
    "phone": "+251911223344",
    "role": "requester"
  }
  ```
- **Response Shape (`201`):**
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "Jane Doe",
        "role": "requester"
      },
      "token": "jwt_token_string"
    }
  }
  ```
- **Errors:** `400 Bad Request`, `409 Conflict` (email already exists).

### Login
- **Method:** `POST /api/v1/auth/login`
- **Auth:** Public (`None`)
- **Rate Limit:** `authLimiter`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response Shape (`200`):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "full_name": "Jane Doe",
        "role": "requester",
        "is_admin": false
      },
      "token": "jwt_token_string"
    }
  }
  ```
- **Errors:** `400 Bad Request`, `401 Unauthorized`.

### Current User Profile (`Me`)
- **Method:** `GET /api/v1/auth/me`
- **Auth:** `Bearer Token`
- **Response Shape (`200`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "Jane Doe",
      "avatar_url": null,
      "role": "requester",
      "created_at": "2026-10-13T00:00:00.000Z"
    }
  }
  ```
- **Errors:** `401 Unauthorized`.

### Logout
- **Method:** `POST /api/v1/auth/logout`
- **Auth:** `Bearer Token`
- **Response Shape (`200`):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

## 2. Users (`/api/v1/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/search?q=query` | Optional | Search users by name or username. |
| `GET` | `/api/v1/users/me` | Bearer | Get full profile of current authenticated user. |
| `PUT` | `/api/v1/users/me` | Bearer | Update current profile (bio, avatar, phone). |
| `GET` | `/api/v1/users/username/:username` | Optional | Look up public profile by unique username. |
| `GET` | `/api/v1/users/:id` | Optional | Fetch public user profile by UUID. |

---

## 3. Providers (`/api/v1/providers`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/providers` | Optional | List/filter providers by category, availability, rating. |
| `GET` | `/api/v1/providers/me` | Bearer | Fetch current user's provider profile and business details. |
| `POST` | `/api/v1/providers/me` | Bearer | Create provider profile (onboarding). |
| `PUT` | `/api/v1/providers/me` | Bearer | Update provider details, pricing, bio, availability. |
| `GET` | `/api/v1/providers/:id` | Optional | Fetch provider profile by UUID with reviews & services. |

---

## 4. Businesses & Organizations (`/api/v1/businesses` & `/api/v1/organizations`)

### Businesses
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/businesses` | Optional | List verified businesses and organizations. |
| `GET` | `/api/v1/businesses/me` | Bearer | Fetch owned business profiles. |
| `POST` | `/api/v1/businesses/me` | Bearer | Register a new business entity. |
| `PUT` | `/api/v1/businesses/me` | Bearer | Update business profile details. |
| `GET` | `/api/v1/businesses/:id` | Optional | Get business details, services, and staff. |
| `GET` | `/api/v1/businesses/:id/members`| Optional | List members/employees of a business. |
| `POST` | `/api/v1/businesses/:id/members`| Bearer (Owner) | Add a team member by email/user ID. |
| `DELETE` | `/api/v1/businesses/:id/members/:userId` | Bearer (Owner) | Remove team member. |

### Organizations
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/organizations` | Optional | List non-profits, civic, or public organizations. |
| `GET` | `/api/v1/organizations/me` | Bearer | Fetch user's registered organization. |
| `POST` | `/api/v1/organizations/me` | Bearer | Register a new organization. |
| `PUT` | `/api/v1/organizations/me` | Bearer | Update organization metadata and contacts. |
| `GET` | `/api/v1/organizations/:id` | Optional | View public organization profile. |

---

## 5. Services & Categories (`/api/v1/services` & `/api/v1/categories`)

### Services
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/services` | Optional | Filter services by query, category_id, entity_type. |
| `GET` | `/api/v1/services/:id` | Optional | Retrieve service listing details. |
| `POST` | `/api/v1/services` | Bearer (Provider/Owner)| Publish a new service listing. |
| `PUT` | `/api/v1/services/:id` | Bearer (Owner) | Update existing service listing. |
| `DELETE`| `/api/v1/services/:id` | Bearer (Owner) | Remove or soft-delete service listing. |

### Categories
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/categories` | Optional | List all active categories and subcategories. |
| `GET` | `/api/v1/categories/:id` | Optional | Get category details and associated services. |
| `POST` | `/api/v1/categories/seed` | Bearer (`admin`) | Seed default system categories (admin only). |

---

## 6. Requests & Intelligent Matching (`/api/v1/requests` & `/api/v1/matching`)

### Requests
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/requests` | Optional | Browse open client requests (filtered by category). |
| `GET` | `/api/v1/requests/:id` | Optional | View single request details and urgency. |
| `POST` | `/api/v1/requests` | Bearer | Post a new service request with requirements. |
| `PUT` | `/api/v1/requests/:id` | Bearer (Owner) | Update request requirements, budget, or status. |

### Matching
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/matching/requests/:requestId` | Optional | List matched providers for a request. |
| `POST` | `/api/v1/matching/requests/:requestId` | Bearer | Trigger 6-factor intelligent algorithmic matching. |
| `PUT` | `/api/v1/matching/:id` | Bearer | Update match status (`suggested`, `accepted`, `rejected`). |

---

## 7. AI Need Understanding & Chat (`/api/v1/ai`)

All AI endpoints utilize Google Gemini 1.5 Flash with RAG database injection and fallbacks.

| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/ai/chat` | Optional | `aiLimiter` (20/min) | Process natural language need and return intent + matched cards. |
| `POST` | `/api/v1/ai/chat/stream` | Optional | `aiLimiter` (20/min) | SSE streaming chat response for conversational UI. |
| `POST` | `/api/v1/ai/conversations` | Optional | Standard | Create an isolated AI conversation session. |
| `GET` | `/api/v1/ai/conversations` | Optional | Standard | List user's active AI chat sessions. |
| `GET` | `/api/v1/ai/conversations/:id/messages` | Optional | Standard | Retrieve history for a specific conversation. |
| `DELETE`| `/api/v1/ai/conversations/:id` | Optional | Standard | Delete AI chat session and context. |

---

## 8. Bookings (`/api/v1/bookings`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/bookings` | Bearer | List bookings for current user (as client or provider). |
| `GET` | `/api/v1/bookings/:id` | Bearer | Fetch details of a specific booking. |
| `POST` | `/api/v1/bookings` | Bearer | Create a new booking request. |
| `POST` | `/api/v1/bookings/:id/accept` | Bearer (Provider) | Accept a booking request. |
| `POST` | `/api/v1/bookings/:id/decline`| Bearer (Provider) | Decline a booking request. |
| `POST` | `/api/v1/bookings/:id/cancel` | Bearer | Cancel pending booking. |
| `POST` | `/api/v1/bookings/:id/complete`| Bearer | Mark service delivery completed. |

---

## 9. Payments & Escrow (`/api/v1/payments`)

Integrates with the Chapa payment gateway and LINC's 72-hour auto-release escrow vault.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/escrow/initiate` | Bearer | Initiate escrow lock via Chapa checkout URL. |
| `POST` | `/api/v1/payments/escrow/:id/confirm` | Bearer (Client) | Release escrow funds to provider upon delivery. |
| `POST` | `/api/v1/payments/escrow/:id/dispute` | Bearer | Raise dispute on held escrow funds. |
| `GET` | `/api/v1/payments/escrow` | Bearer | List active escrow transactions. |
| `GET` | `/api/v1/payments/escrow/:id` | Bearer | Get escrow payment status and timeline. |
| `POST` | `/api/v1/payments/chapa/webhook` | Public (Signed) | Chapa IPN webhook callback for payment confirmation. |
| `GET` | `/api/v1/payments/chapa/verify/:txRef` | Bearer | Check transaction status by reference ID. |
| `GET` | `/api/v1/payments/admin/disputes` | Bearer (`admin`)| List open payment disputes. |
| `POST` | `/api/v1/payments/admin/disputes/:id/resolve` | Bearer (`admin`)| Resolve dispute (refund client or pay provider). |

---

## 10. Messaging & Real-Time Chat (`/api/v1/messaging`)

Real-time message exchange backed by Socket.IO events (`send_message`, `receive_message`).

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/messaging/conversations` | Bearer | List active conversations for current user. |
| `POST` | `/api/v1/messaging/conversations` | Bearer | Start or retrieve conversation with participant. |
| `GET` | `/api/v1/messaging/conversations/:id` | Bearer | Retrieve chronological message history. |
| `POST` | `/api/v1/messaging/conversations/:id/messages` | Bearer | Send a text message or file attachment. |
| `PUT` | `/api/v1/messaging/conversations/:id/read` | Bearer | Mark all messages in conversation as read. |

---

## 11. Ratings, Reviews & Moderation (`/api/v1/reviews`, `/api/v1/reports`, `/api/v1/verification`)

### Reviews
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/reviews/:entityType/:entityId` | Optional | List verified reviews for a provider or service. |
| `GET` | `/api/v1/reviews/me` | Bearer | List reviews submitted by current user. |
| `POST` | `/api/v1/reviews` | Bearer | Submit review and 1-5 star rating for completed booking. |
| `PUT` | `/api/v1/reviews/:id` | Bearer (Author) | Edit existing review. |

### Reports & Moderation
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/reports` | Bearer | Report content, abuse, or fraudulent activity. |
| `GET` | `/api/v1/reports` | Bearer (`admin`) | List pending moderation reports. |
| `GET` | `/api/v1/reports/:id` | Bearer (`admin`) | Fetch report details and evidence. |
| `PUT` | `/api/v1/reports/:id/review` | Bearer (`admin`) | Resolve report (`dismiss`, `warn`, `suspend`). |

### Verification
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/verification/me` | Bearer | Check provider verification status. |
| `GET` | `/api/v1/verification/:id` | Bearer | View specific verification submission. |
| `POST` | `/api/v1/verification` | Bearer | Submit credentials / ID documentation. |
| `PUT` | `/api/v1/verification/:id/review` | Bearer (`admin`) | Approve or reject provider verification. |

---

## 12. Administration (`/api/v1/admin`)

Enforces `requireRole('admin')` RBAC check.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/overview` | Bearer (`admin`) | Get system KPI statistics (users, bookings, volume). |
| `GET` | `/api/v1/admin/users` | Bearer (`admin`) | Manage users, adjust roles, or soft-delete accounts. |
| `GET` | `/api/v1/admin/reports` | Bearer (`admin`) | Overview of security and trust violations. |
| `GET` | `/api/v1/admin/verification-requests` | Bearer (`admin`) | Queue of pending provider identity verifications. |
