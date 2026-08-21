const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.SKIP_ENV_VALIDATION = 'true';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_ci_cd_2026';

const app = require('../src/app');

describe('LINC Backend Production API Test Suite', () => {
  let server;
  let baseUrl;
  let authToken;

  before(async () => {
    return new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    return new Promise((resolve) => {
      if (server) {
        server.close(() => resolve());
      } else {
        resolve();
      }
    });
  });

  // ── 1. System Health & Metadata ─────────────────────────────────────────────
  describe('System Health & Metadata', () => {
    test('GET /health returns 200 and ok status', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.status, 'ok');
      assert.equal(body.service, 'LINC API');
      assert.ok(typeof body.uptime === 'number');
    });

    test('GET / returns root API metadata', async () => {
      const res = await fetch(`${baseUrl}/`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.service, 'LINC API');
      assert.equal(body.status, 'running');
      assert.equal(body.version, '1.0.0');
    });

    test('GET /health/db handles database status gracefully', async () => {
      const res = await fetch(`${baseUrl}/health/db`);
      assert.ok([200, 503].includes(res.status));
      const body = await res.json();
      assert.ok(body.hasOwnProperty('connected'));
      assert.ok(body.hasOwnProperty('host'));
    });

    test('GET /unknown-route returns 404', async () => {
      const res = await fetch(`${baseUrl}/non-existent-endpoint-${Date.now()}`);
      assert.equal(res.status, 404);
    });
  });

  // ── 2. Authentication Flow ──────────────────────────────────────────────────
  describe('Authentication Module', () => {
    test('POST /api/auth/login succeeds with valid credentials', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yonas.molla@email.com',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.token, 'Expected JWT token in response');
      assert.equal(body.data.user.email, 'yonas.molla@email.com');
      authToken = body.data.token;
    });

    test('POST /api/auth/login rejects invalid password', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'yonas.molla@email.com',
          password: 'wrongpassword',
        }),
      });

      assert.ok(res.status >= 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('GET /api/auth/me returns authenticated user profile', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.email, 'yonas.molla@email.com');
    });

    test('GET /api/auth/me returns 401 without token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`);
      assert.equal(res.status, 401);
    });
  });

  // ── 3. Public Discovery & Catalog ───────────────────────────────────────────
  describe('Discovery & Provider Catalog', () => {
    test('GET /api/providers returns provider list', async () => {
      const res = await fetch(`${baseUrl}/api/providers`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.length > 0, 'Expected at least 1 mock provider');
    });

    test('GET /api/providers/:id returns individual provider detail', async () => {
      const res = await fetch(`${baseUrl}/api/providers/1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.headline);
    });

    test('GET /api/categories returns all categories', async () => {
      const res = await fetch(`${baseUrl}/api/categories`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
    });

    test('GET /api/requests returns service requests', async () => {
      const res = await fetch(`${baseUrl}/api/requests`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
    });

    test('GET /api/reviews/:entityType/:entityId returns reviews', async () => {
      const res = await fetch(`${baseUrl}/api/reviews/provider/1`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
    });
  });

  // ── 4. Guest & Unauthenticated Access ───────────────────────────────────────
  describe('Guest Access Safety', () => {
    test('GET /api/bookings returns empty list for unauthenticated guests', async () => {
      const res = await fetch(`${baseUrl}/api/bookings`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.deepEqual(body.data, []);
    });

    test('GET /api/notifications returns empty list for unauthenticated guests', async () => {
      const res = await fetch(`${baseUrl}/api/notifications`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.deepEqual(body.data, []);
    });

    test('GET /api/messaging/conversations returns empty list for unauthenticated guests', async () => {
      const res = await fetch(`${baseUrl}/api/messaging/conversations`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.deepEqual(body.data, []);
    });

    test('POST /api/bookings is blocked for unauthenticated users', async () => {
      const res = await fetch(`${baseUrl}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: '1',
          entity_id: '1',
          entity_type: 'provider',
          scheduled_at: new Date().toISOString(),
          agreed_price: 500,
        }),
      });

      assert.equal(res.status, 401);
    });
  });

  // ── 5. AI Assistant Pipeline ────────────────────────────────────────────────
  describe('AI Assistant Pipeline', () => {
    test('POST /api/ai/chat returns intelligent response and provider matches', async () => {
      const res = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'I need an electrician for my apartment in Addis Ababa',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(body.data.message, 'Expected AI message in response');
      assert.ok(Array.isArray(body.data.providers), 'Expected provider matches array');
    });
  });
});
