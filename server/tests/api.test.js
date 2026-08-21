const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.SKIP_ENV_VALIDATION = 'true';

const app = require('../src/app');

describe('LINC Backend API Tests (CI/CD Verification)', () => {
  let server;
  let baseUrl;

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

  test('GET /health returns 200 and status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200, 'Expected status 200');
    
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'LINC API');
    assert.ok(typeof body.uptime === 'number');
  });

  test('GET / returns root API metadata', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200, 'Expected status 200');
    
    const body = await res.json();
    assert.equal(body.service, 'LINC API');
    assert.equal(body.status, 'running');
    assert.equal(body.version, '1.0.0');
  });

  test('GET /health/db handles database status check gracefully', async () => {
    const res = await fetch(`${baseUrl}/health/db`);
    assert.ok([200, 503].includes(res.status), `Unexpected status code: ${res.status}`);
    
    const body = await res.json();
    assert.ok(body.hasOwnProperty('connected'));
    assert.ok(body.hasOwnProperty('host'));
  });

  test('GET /unknown-route returns 404', async () => {
    const res = await fetch(`${baseUrl}/non-existent-endpoint-${Date.now()}`);
    assert.equal(res.status, 404);
  });
});
