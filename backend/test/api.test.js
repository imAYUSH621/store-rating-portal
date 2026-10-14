const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../src/server');

let server;
let baseUrl;

test.before(async () => {
  return new Promise((resolve) => {
    // Listen on dynamic ephemeral port
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(() => resolve());
  });
});

async function api(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

test('GET /api/health should return healthy status', async () => {
  const { status, data } = await api('/api/health');
  assert.equal(status, 200);
  assert.equal(data.status, 'healthy');
});

test('POST /api/auth/login with invalid password should fail with 401', async () => {
  const { status, data } = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@storerating.com',
      password: 'WrongPassword!123'
    })
  });
  assert.equal(status, 401);
  assert.equal(data.success, false);
});

let adminToken;
let userToken;
let ownerToken;

test('POST /api/auth/login with valid admin credentials returns JWT', async () => {
  const { status, data } = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@storerating.com',
      password: 'Admin@1234'
    })
  });
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.ok(data.token);
  assert.equal(data.user.role, 'ADMIN');
  adminToken = data.token;
});

test('POST /api/auth/login as Normal User returns JWT', async () => {
  const { status, data } = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'alexander@storerating.com',
      password: 'User@1234'
    })
  });
  assert.equal(status, 200);
  assert.equal(data.user.role, 'USER');
  userToken = data.token;
});

test('POST /api/auth/login as Store Owner returns JWT', async () => {
  const { status, data } = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'jonathan@artisancoffee.com',
      password: 'Owner@1234'
    })
  });
  assert.equal(status, 200);
  assert.equal(data.user.role, 'STORE_OWNER');
  ownerToken = data.token;
});

test('GET /api/admin/stats returns correct count metrics', async () => {
  const { status, data } = await api('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(status, 200);
  assert.ok(data.stats.totalUsers >= 6);
  assert.ok(data.stats.totalStores >= 4);
  assert.ok(data.stats.totalRatings >= 6);
});

test('GET /api/admin/users returns users list with role and store rating for owners', async () => {
  const { status, data } = await api('/api/admin/users?sortBy=name&sortOrder=asc', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert.equal(status, 200);
  assert.ok(Array.isArray(data.users));
  const owner = data.users.find((u) => u.role === 'STORE_OWNER');
  assert.ok(owner);
  assert.ok(owner.storeName);
});

test('POST /api/auth/signup enforces min 20 character Name constraint', async () => {
  const { status, data } = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Short Name', // only 10 chars, should be rejected
      email: 'short@test.com',
      password: 'Password@123',
      address: '123 Fake Street, Springfield'
    })
  });
  assert.equal(status, 400);
  assert.equal(data.success, false);
  assert.ok(data.errors.name.includes('at least 20 characters'));
});

test('POST /api/auth/signup creates account when all constraints are met', async () => {
  const uniqueEmail = `testuser_${Date.now()}@storerating.com`;
  const { status, data } = await api('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Maximilianus Aurelius Constantine', // 33 chars > 20
      email: uniqueEmail,
      password: 'StrongPass@2026',
      address: '88 Roman Way, Central Forum, Rome'
    })
  });
  assert.equal(status, 201);
  assert.equal(data.success, true);
  assert.equal(data.user.role, 'USER');
});

let targetStoreId;

test('GET /api/stores lists catalog with userSubmittedRating', async () => {
  const { status, data } = await api('/api/stores', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  assert.equal(status, 200);
  assert.ok(data.stores.length > 0);
  const ratedStore = data.stores.find((s) => s.userSubmittedRating !== null);
  assert.ok(ratedStore);
  targetStoreId = ratedStore.id;
  assert.ok(ratedStore.overallRating > 0);
});

test('POST /api/ratings/:storeId allows user to modify their rating', async () => {
  assert.ok(targetStoreId, 'Target store ID must be set');
  const { status, data } = await api(`/api/ratings/${targetStoreId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ rating: 4 })
  });
  assert.equal(status, 200);
  assert.equal(data.success, true);
  assert.equal(data.userRating, 4);
});

test('GET /api/owner/dashboard returns store stats and raters table', async () => {
  const { status, data } = await api('/api/owner/dashboard', {
    headers: { Authorization: `Bearer ${ownerToken}` }
  });
  assert.equal(status, 200);
  assert.equal(data.hasStore, true);
  assert.equal(data.store.name, 'Artisan Roast & Brew Coffeehouse');
  assert.ok(data.raters.length > 0);
});
