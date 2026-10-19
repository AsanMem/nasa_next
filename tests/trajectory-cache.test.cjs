const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
function load() {
  const module = { exports: {} };
  const source = fs.readFileSync(path.join(__dirname, '../src/app/lib/asteroids/server/trajectory-cache.ts'), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
    { module, exports: module.exports, require, fetch, AbortSignal, Buffer, process, Date, URL });
  return module.exports;
}
function backend() {
  const docs = new Map(); let revision = 0, time = Date.UTC(2026, 9, 19), calls = [];
  const request = async (input, init = {}) => {
    const url = new URL(input), key = url.pathname; calls.push({ url, init });
    const doc = docs.get(key);
    if (!init.method || init.method === 'GET') return Response.json(doc ?? {}, { status: doc ? 200 : 404 });
    if (url.searchParams.get('currentDocument.exists') === 'false' && doc) return Response.json({}, { status: 409 });
    const expected = url.searchParams.get('currentDocument.updateTime');
    if (expected && doc?.updateTime !== expected) return Response.json({}, { status: 412 });
    const result = { ...JSON.parse(init.body), updateTime: `2026-10-19T00:00:00.${String(++revision).padStart(6, '0')}Z` };
    docs.set(key, result); return Response.json(result);
  };
  return { docs, calls, request, now: () => time, advance: ms => { time += ms; } };
}
function instance(backend, extras = {}) { return load().createTrajectoryStore({ projectId: 'nasa-odisey', fetch: backend.request, token: async () => 'test-server-identity', now: backend.now, ...extras }); }
test('public ephemeris cache is shared, keyed by full request, and expires after24hours', async () => {
  const b = backend(), first = instance(b), second = instance(b);
  assert.equal(await first.read('ID:solution:Earth:windowA'), null);
  await first.write('ID:solution:Earth:windowA', { samples: [1, 2] });
  assert.deepEqual(JSON.parse(JSON.stringify(await second.read('ID:solution:Earth:windowA'))), { samples: [1, 2] });
  assert.equal(await second.read('ID:solution:Earth:windowB'), null);
  assert.ok(b.calls.every(call => !call.url.href.includes('ID:solution')));
  b.advance(86_400_001); assert.equal(await second.read('ID:solution:Earth:windowA'), null);
});
test('CAS lease serializes independent Firebase instances and coalesces simultaneous work', async () => {
  const b = backend(), a = instance(b), c = instance(b); let release, active = 0, maximum = 0;
  const held = a.withLease(async () => { maximum = Math.max(maximum, ++active); await new Promise(resolve => { release = resolve; }); active--; return 'done'; });
  while (!release) await new Promise(resolve => setImmediate(resolve));
  await assert.rejects(c.withLease(async () => { maximum = Math.max(maximum, ++active); }), { name: 'JplBusyError' });
  release(); assert.equal(await held, 'done');
  await assert.rejects(c.withLease(async () => 'too soon'), { name: 'JplBusyError' });
  b.advance(551); assert.equal(await c.withLease(async () => 'next'), 'next'); assert.equal(maximum, 1);
});
test('simultaneous cold lease creation has exactly one winner', async () => {
  const b = backend(), instances = [instance(b), instance(b), instance(b)]; let count = 0;
  const outcomes = await Promise.allSettled(instances.map(store => store.withLease(async () => { count++; return 1; })));
  assert.equal(count, 1); assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1);
});
test('expired worker cannot unlock a replacement lease; failed upstream applies shared backoff', async () => {
  const b = backend(), a = instance(b), c = instance(b); let release;
  const old = a.withLease(async () => new Promise(resolve => { release = resolve; }));
  while (!release) await new Promise(resolve => setImmediate(resolve));
  b.advance(90_001);
  let finish; const replacement = c.withLease(async () => new Promise(resolve => { finish = resolve; }));
  while (!finish) await new Promise(resolve => setImmediate(resolve));
  release(1); await old;
  await assert.rejects(a.withLease(async () => 1), { name: 'JplBusyError' });
  finish(2); await replacement; b.advance(551);
  await assert.rejects(a.withLease(async () => { throw Object.assign(new Error('429'), { retryAfterSeconds: 30 }); }), /429/);
  b.advance(29_000); await assert.rejects(c.withLease(async () => 1), { name: 'JplBusyError' });
  b.advance(1001); assert.equal(await c.withLease(async () => 3), 3);
});
test('denied storage never calls JPL and never falls back to a private in-memory cache', async () => {
  const store = load().createTrajectoryStore({ projectId: 'nasa-odisey', token: async () => 'identity', fetch: async () => Response.json({}, { status: 403 }) });
  let called = false;
  await assert.rejects(store.withLease(async () => { called = true; }), { name: 'TrajectoryStoreError' });
  assert.equal(called, false);
  await assert.rejects(store.read('public'), { name: 'TrajectoryStoreError' });
});
test('bad, future, stale and oversized entries cannot become accepted cache responses', async () => {
  const b = backend(), store = instance(b); await store.write('one', { ok: true });
  const doc = [...b.docs.values()][0]; doc.fields.payload.stringValue = '{broken'; assert.equal(await store.read('one'), null);
  doc.fields.payload.stringValue = '{"ok":true}'; doc.fields.createdAt.timestampValue = '2099-01-01T00:00:00Z'; assert.equal(await store.read('one'), null);
  await assert.rejects(store.write('large', 'x'.repeat(800_001)), { name: 'TrajectoryStoreError' });
});
test('absolute request deadline bounds REST attempts and never starts JPL after a slow acquisition', async () => {
  const b = backend();
  const expired = instance(b);
  await assert.rejects(expired.read('none', { deadlineUtcMs: b.now() + 1000 }), { name: 'JplBusyError' });
  assert.equal(b.calls.length, 0);
  const store = instance(b, { fetch: async (...args) => { const result = await b.request(...args); b.advance(3000); return result; } });
  let called = false;
  const deadlineUtcMs = b.now() + 6000;
  await assert.rejects(store.withLease(async () => { called = true; }, { deadlineUtcMs }), { name: 'JplBusyError' });
  assert.equal(called, false);
  assert.ok(b.now() <= deadlineUtcMs);
  assert.equal(b.calls.length, 2);
});
