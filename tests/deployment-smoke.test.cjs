const { test } = require('node:test');
const assert = require('node:assert/strict');

async function setup() { return import('../scripts/smoke-deployment.mjs'); }
function request(overrides = {}) {
  return async (url, init) => {
    assert.equal(init.redirect, 'error');
    assert.ok(init.signal instanceof AbortSignal);
    const path = url.pathname + url.search;
    const content = overrides[path] ?? (url.pathname === '/privacy' ? 'Asan Memetov amemetoff.it@gmail.com'
      : url.pathname === '/asteroids' ? '<h1>Asteroids</h1><a href="/asteroids/3781897/view?date=2026-10-19">Explore</a>'
      : url.pathname === '/birthday' ? 'Your birth sky'
      : 'NASA estimated diameter Past &amp; future encounters');
    return new Response(content, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  };
}

test('deployment smoke checks actual SSR content, dated catalog entry, privacy and birthday', async () => {
  const { verifyDeployment } = await setup();
  const pages = await verifyDeployment('https://nasa-odisey.web.app', request());
  assert.deepEqual(pages, ['/privacy', '/asteroids', '/asteroids/2509505/view', '/asteroids/3781897/view?date=2026-10-19', '/birthday']);
});

test('deployment smoke rejects the production regression even when HTTP status is 200', async () => {
  const { verifyDeployment } = await setup();
  await assert.rejects(verifyDeployment('https://nasa-odisey.web.app', request({
    '/asteroids/2509505/view': '<h1>This encounter can’t be opened yet.</h1>NASA object data is unavailable',
  })), /expected content is unavailable/);
  await assert.rejects(verifyDeployment('https://nasa-odisey.web.app', request({ '/asteroids/2509505/view': 'Opening the encounter…' })), /unavailable/);
});

test('deployment smoke permits an empty real feed but still requires a working profile', async () => {
  const { verifyDeployment } = await setup();
  const pages = await verifyDeployment('http://127.0.0.1:3101', request({ '/asteroids': 'Asteroids No approaches in this snapshot' }));
  assert.equal(pages.length, 4);
});

test('deployment smoke rejects invalid origins and HTTP/JSON failures', async () => {
  const { verifyDeployment } = await setup();
  for (const origin of ['https://user:password@example.com', 'http://example.com', 'https://example.com?secret=x', 'https://example.com/path']) {
    await assert.rejects(verifyDeployment(origin, request()), /HTTPS deployment origin/);
  }
  await assert.rejects(verifyDeployment('https://nasa-odisey.web.app', async () => new Response('failure', { status: 503 })), /HTTP 503/);
  await assert.rejects(verifyDeployment('https://nasa-odisey.web.app', async () => new Response('{}', { headers: { 'Content-Type': 'application/json' } })), /HTTP 200/);
});
