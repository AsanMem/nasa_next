const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
class JplBusyError extends Error { constructor(retryAfterSeconds = 4) { super('Busy'); this.retryAfterSeconds = retryAfterSeconds; } }
class TrajectoryStoreError extends Error {}
function loader(extra = {}) {
  const modules = new Map();
  function load(relative) {
    const file = path.isAbsolute(relative) ? relative : path.join(root, relative);
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} }; modules.set(file, module);
    const script = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(script, { module, exports: module.exports, Date, Math, Number, Map, Set, URL, Request, Response, Headers, FormData, Blob, AbortController, setTimeout, clearTimeout, console: { warn() {} }, fetch: async () => { throw Error('Unexpected network'); }, require: name => {
      if (name.endsWith('/trajectory-cache')) return { JplBusyError, TrajectoryStoreError, readTrajectoryCache: async () => null, writeTrajectoryCache: async () => {}, withJplLease: async work => work() };
      if (extra[name]) return extra[name];
      if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name) + '.ts');
      return require(name);
    }});
    return module.exports;
  }
  return load;
}
const load = loader(), model = load('src/app/lib/asteroids/view-model.ts'), numeric = load('src/app/lib/asteroids/trajectory.ts'), data = load('src/app/lib/asteroids/server/trajectory-service.ts');
const DAY = 86400000, eventTime = Date.UTC(2026, 9, 18, 8, 14, 11, 123);
const lookup = { signature: { source: 'NASA/JPL Horizons Lookup API', version: '1.1' }, count: 1, result: [{ spkid: '20509505', name: '509505 (2007 VL8)', type: 'asteroid (integrated barycenter)', alias: ['2509505', 'K07V08L'] }] };
const fixture = file => JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8').replace(/^\uFEFF/, ''));
const clone = value => JSON.parse(JSON.stringify(value));

test('NASA encounter moments preserve signed epochs, strict UTC minute fallback and date-only precision', () => {
  const raw = { id: '2509505', designation: '509505', orbital_data: { orbit_id: '30', epoch_osculation: '2461200.5', orbital_period: '330.7', eccentricity: '.35', semi_major_axis: '.93', inclination: '9.3', ascending_node_longitude: '62.3', perihelion_argument: '194.7', mean_anomaly: '310.1', mean_motion: '1.08', equinox: 'J2000' }, close_approach_data: [
    { close_approach_date: '1911-08-25', orbiting_body: 'Venus', epoch_date_close_approach: Date.UTC(1911, 7, 25, 6, 12) },
    { close_approach_date: '2026-10-18', orbiting_body: 'Earth', epoch_date_close_approach: eventTime },
    { close_approach_date: '2026-10-18', orbiting_body: 'Moon', close_approach_date_full: '2026-Oct-18 09:14' },
    { close_approach_date: '2026-10-18', orbiting_body: 'Earth' },
  ] };
  const asteroid = model.toAsteroid(raw);
  assert.equal(asteroid.approaches[0].utcMs, Date.UTC(1911, 7, 25, 6, 12)); assert.equal(asteroid.approaches[0].timePrecision, 'epoch');
  assert.equal(asteroid.approaches[1].utcMs, eventTime); assert.equal(asteroid.approaches[1].key, '2026-10-18-Earth-1');
  assert.equal(asteroid.approaches[2].utcMs, Date.UTC(2026, 9, 18, 9, 14)); assert.equal(asteroid.approaches[2].timePrecision, 'minute');
  assert.equal(asteroid.approaches[3].utcMs, null); assert.equal(asteroid.approaches[3].timePrecision, 'date');
  assert.equal(asteroid.orbitSolution.id, '30'); assert.equal(asteroid.orbitSolution.elements.semiMajorAxisAu, .93); assert.equal(asteroid.orbitSolution.elements.equinox, 'J2000');
  for (const full of ['2026-Feb-30 09:14', '2026-Oct-18 24:14', '2026-Oct-18 09:60', '2026-XYZ-18 09:14', '2026-Oct-18T09:14', '2026-Oct-19 09:14']) assert.equal(model.approachMoment({ close_approach_date: '2026-10-18', close_approach_date_full: full }).utcMs, null);
});

test('official lookup resolves current primary SPK identity without arithmetic and refuses ambiguity', () => {
  assert.equal(data.parseLookup(lookup, '2509505').spkId, '20509505');
  for (const changed of [{ ...lookup, count: 2 }, { ...lookup, signature: { ...lookup.signature, version: '99' } }, { ...lookup, result: [{ ...lookup.result[0], alias: [] }] }, { ...lookup, result: [{ ...lookup.result[0], type: 'spacecraft' }] }]) assert.throws(() => data.parseLookup(changed, '2509505'));
});

test('actual JPL fixtures prove UT, heliocentric ecliptic frame, values, solution and independent midpoint', () => {
  const times = [Date.UTC(2026, 9, 18), Date.UTC(2026, 9, 18, 6), Date.UTC(2026, 9, 18, 12)];
  const asteroid = data.parseHorizons(fixture('horizons-vl8.json'), times, '509505 (2007 VL8)');
  const earth = data.parseHorizons(fixture('horizons-earth.json'), times, 'Earth');
  assert.equal(asteroid.solutionId, '31'); assert.equal(asteroid.samples[0].x, .9369097036661699);
  assert.equal(earth.samples.length, 3);
  const p = { x: 0, y: 0, z: 0 }, v = { x: 0, y: 0, z: 0 };
  const endpoints = { id: '20509505', name: 'VL8', samples: [asteroid.samples[0], asteroid.samples[2]] };
  assert.equal(numeric.sampleTrajectoryTrack(endpoints, times[1], p, v), true);
  const actual = asteroid.samples[1], errorKm = Math.hypot(p.x - actual.x, p.y - actual.y, p.z - actual.z) * numeric.AU_KM;
  assert.ok(errorKm < 1, `independent 6h midpoint error ${errorKm} km`);
  assert.equal(numeric.sampleTrajectoryTrack(endpoints, times[0] - 1, p), false);
  numeric.sampleTrajectoryTrack(endpoints, times[2], p, v); assert.equal(p.x, asteroid.samples[2].x); assert.equal(v.y, asteroid.samples[2].vy);
  for (const [field, replacement] of [['Reference frame : Ecliptic of J2000.0', 'Reference frame : ICRF'], ['Center body name: Sun (10)', 'Center body name: Earth (399)'], ['JDUT', 'JDTDB'], ['Output units    : AU-D', 'Output units    : KM-S']]) {
    const bad = fixture('horizons-vl8.json'); assert.ok(bad.result.includes(field)); bad.result = bad.result.replace(field, replacement); assert.throws(() => data.parseHorizons(bad, times, '509505 (2007 VL8)'));
  }
  const bad = fixture('horizons-vl8.json'); bad.error = 'Input error'; assert.throws(() => data.parseHorizons(bad, times, '509505 (2007 VL8)'));
});

test('a real 48-point GET response validates the current live signature and complete time list', () => {
  const times = Array.from({ length: 48 }, (_, index) => Date.UTC(2026, 9, 18) + index * 3600000);
  const raw = fixture('horizons-vl8-medium.json'); assert.equal(raw.signature.version, '1.2');
  const result = data.parseHorizons(raw, times, '509505 (2007 VL8)');
  assert.equal(result.samples.length, 48); assert.equal(result.apiVersion, '1.2'); assert.equal(result.solutionId, '31');
  assert.equal(result.samples[0].x, .9369097036661699); assert.equal(result.samples[47].utcMs, times[47]);
  const futureFormat = clone(raw); futureFormat.signature.version = '99'; assert.throws(() => data.parseHorizons(futureFormat, times, '509505 (2007 VL8)'));
});

test('the actual short-URL uniform query returns all 257 times and independent quarter-point proof', () => {
  const start = 1778021163502, end = 1806601196498;
  const times = Array.from({ length: 257 }, (_, index) => Math.round(start + (end - start) * index / 256));
  const block = data.parseHorizons(fixture('horizons-vl8-uniform.json'), times, '509505 (2007 VL8)');
  assert.equal(block.samples.length, 257);
  const url = new URL(data.horizonsUniformUrl('DES=20509505;', start, end)); assert.ok(url.href.length < 700);
  assert.equal(url.searchParams.get('STEP_SIZE'), "'256'"); assert.equal(url.searchParams.has('TLIST'), false);
  const track = { id: '20509505', name: '509505 (2007 VL8)', samples: block.samples.filter((_, index) => index % 4 === 0) }, p = { x: 0, y: 0, z: 0 };
  let maximumKm = 0, heldOut = 0;
  for (let index = 0; index < block.samples.length; index++) if (index % 4) {
    const actual = block.samples[index]; assert.equal(numeric.sampleTrajectoryTrack(track, actual.utcMs, p), true);
    maximumKm = Math.max(maximumKm, Math.hypot(p.x - actual.x, p.y - actual.y, p.z - actual.z) * numeric.AU_KM); heldOut++;
  }
  assert.equal(heldOut, 192); assert.ok(maximumKm <= 1000, `real independent quarter-point error ${maximumKm} km`);
});

test('Hermite uses AU/day velocities with a correct derivative and never extrapolates', () => {
  const t = Date.UTC(2026, 0, 1), sample = d => ({ utcMs: t + d * DAY, x: d ** 3, y: d ** 2, z: d, vx: 3 * d ** 2, vy: 2 * d, vz: 1 });
  const track = { id: 'test', name: 'test', samples: [sample(0), sample(2)] }, p = { x: 0, y: 0, z: 0 }, v = { x: 0, y: 0, z: 0 };
  numeric.sampleTrajectoryTrack(track, t + DAY, p, v); assert.deepEqual(p, { x: 1, y: 1, z: 1 }); assert.deepEqual(v, { x: 3, y: 2, z: 1 });
  assert.equal(numeric.sampleTrajectoryTrack(track, t + 3 * DAY, p), false); assert.deepEqual(p, { x: 1, y: 1, z: 1 });
});

function harness({ curved = false, busyAfter = Infinity, failStatus, networkCost = 0, storeFailure = false, changeSolution = false, sampleEpoch = eventTime } = {}) {
  const cache = new Map(); let calls = 0, active = 0, peak = 0, now = eventTime, blocked = false;
  const commands = [], requestedTimes = [];
  const fakeFetch = async (url, init) => {
    calls++; if (calls > busyAfter && !blocked) { blocked = true; throw new JplBusyError(); }
    now += networkCost;
    if (failStatus) return new Response('{}', { status: failStatus, headers: { 'retry-after': '7' } });
    if (url.includes('horizons_lookup')) return Response.json(lookup);
    assert.ok(!init.body, 'The live-verified adapter uses the official GET endpoint');
    const address = new URL(url), command = address.searchParams.get('COMMAND').replaceAll("'", ''); commands.push(command);
    assert.equal(address.pathname, '/api/horizons.api'); assert.ok(url.length <= 1800);
    assert.equal(address.searchParams.get('TIME_TYPE'), "'UT'"); assert.equal(address.searchParams.get('VEC_CORR'), "'NONE'");
    const list = address.searchParams.get('TLIST'); let jds;
    if (list) jds = Array.from(list.matchAll(/'([\d.]+)'/g), match => Number(match[1]));
    else {
      const start = Number(address.searchParams.get('START_TIME').replaceAll("'", '').replace(/^JD/, '')), end = Number(address.searchParams.get('STOP_TIME').replaceAll("'", '').replace(/^JD/, '')), count = Number(address.searchParams.get('STEP_SIZE').replaceAll("'", ''));
      assert.equal(count, 256); assert.ok(url.length < 700); jds = Array.from({ length: count + 1 }, (_, index) => start + (end - start) * index / count);
    }
    const times = jds.map(jd => (jd - 2440587.5) * DAY); requestedTimes.push(times);
    const name = command.startsWith('DES=') ? lookup.result[0].name : ({ '399': 'Earth', '299': 'Venus', '301': 'Moon' }[command] ?? 'Sun');
    const rows = jds.map((jd, index) => { const d = (times[index] - sampleEpoch) / DAY, k = curved && command.startsWith('DES=') ? .0001 : 0; return `${jd}, A.D. calendar, ${1 + .01 * d + k * d ** 4}, ${.1 * d}, 0, ${.01 + 4 * k * d ** 3}, .1, 0,`; });
    return Response.json({ signature: { source: 'NASA/JPL Horizons API', version: '1.2' }, result: `Target body name: ${name} {source: ${command.startsWith('DES=') ? (changeSolution && calls > 2 ? 'JPL#32' : 'JPL#31') : 'DE441'}}\nEPOCH=2457566.5\nCenter body name: Sun (10)\nOutput units : AU-D\nOutput type : GEOMETRIC cartesian states\nReference frame : Ecliptic of J2000.0\nJDUT, Calendar Date, X, Y, Z, VX, VY, VZ,\n$$SOE\n${rows.join('\n')}\n$$EOE` });
  };
  const dependencies = { read: async key => { if (storeFailure) throw new TrajectoryStoreError(); return cache.get(key) ?? null; }, write: async (key, value) => cache.set(key, clone(value)), now: () => now,
    lease: async work => { if (calls >= busyAfter && !blocked) { blocked = true; throw new JplBusyError(); } active++; peak = Math.max(peak, active); try { return await work(); } finally { active--; } }, fetch: fakeFetch };
  const service = data.createTrajectoryService(dependencies);
  return { service, dependencies, cache, commands, requestedTimes, calls: () => calls, peak: () => peak, advance: ms => { now += ms; } };
}
const asteroid = () => ({ id: '2509505', name: '509505 (2007 VL8)', approaches: [], orbit: [], orbitSolution: { id: '30', epochJd: 2461200.5, periodDays: 30 } });
const event = (body = 'Earth', utcMs = eventTime) => ({ key: `2026-10-18-${body}-0`, date: '2026-10-18', body, utcMs, distance: 864000, speed: 10 });

test('bounded GET chunks preserve the union grid and reuse ready cache', async () => {
  const h = harness(), result = await h.service.get(asteroid(), event());
  assert.equal(result.status, 'ready'); assert.equal(h.peak(), 1); const coldCalls = h.calls(); assert.equal(coldCalls, 5, 'Lookup plus two uniform grids for each target');
  const split = h.commands.indexOf('399'); assert.ok(split > 0); assert.ok(h.commands.slice(0, split).every(command => command === 'DES=20509505;')); assert.ok(h.commands.slice(split).every(command => command === '399')); assert.deepEqual(h.requestedTimes.slice(0, split).flat(), h.requestedTimes.slice(split).flat());
  assert.equal(result.close.target.id, '399'); assert.equal(result.source.solutionId, '31'); assert.equal(result.target.solutionId, '31'); assert.equal(result.target.orbitEpochJd, 2457566.5); assert.equal(result.source.neoWsSolutionId, '30'); assert.match(result.source.warning, /differs/);
  for (const range of [result.close, result.overview]) for (const track of [range.asteroid, range.target]) assert.ok(track.samples.some(row => row.utcMs === eventTime));
  assert.equal(numeric.isTrajectoryReady(result), true);
  assert.equal((await h.service.get(asteroid(), event())).status, 'ready'); assert.equal(h.calls(), coldCalls);
  const invalid = clone(result); invalid.close.asteroid.samples[1].x = null; assert.equal(numeric.isTrajectoryReady(invalid), false);
  const nullSample = clone(result); nullSample.close.asteroid.samples[1] = null; assert.equal(numeric.isTrajectoryReady(nullSample), false);
  const wrongTime = clone(result); wrongTime.encounterUtcMs = wrongTime.close.endUtcMs + 1; assert.equal(numeric.isTrajectoryReady(wrongTime), false);
  const wrongBody = clone(result); wrongBody.close.target.id = '301'; assert.equal(numeric.isTrajectoryReady(wrongBody), false);
  const wrongProof = clone(result); wrongProof.validation.closeMaxErrorKm = 2; assert.equal(numeric.isTrajectoryReady(wrongProof), false);
  assert.ok(Array.from(h.cache.keys()).some(key => key.includes(':horizons:initial:31:2457566.5')));
});

test('adaptive quarter-point verification refines curved intervals instead of silently accepting a coarse path', async () => {
  const h = harness({ curved: true }), result = await h.service.get(asteroid(), event());
  assert.equal(result.status, 'ready'); assert.ok(result.close.asteroid.samples.length > 17); assert.ok(result.validation.closeMaxErrorKm <= 1); assert.ok(h.calls() > 3); assert.equal(h.peak(), 1);
});

test('Earth→Venus→Earth and Moon use body-specific same-frame vectors, same-day moments have separate caches', async () => {
  const h = harness();
  for (const [body, id, offset] of [['Earth', '399', 0], ['Venus', '299', 3600000], ['Earth', '399', 7200000], ['Moon', '301', 10800000]]) {
    const result = await h.service.get(asteroid(), event(body, eventTime + offset));
    assert.equal(result.status, 'ready'); assert.equal(result.close.target.id, id); assert.equal(result.encounterUtcMs, eventTime + offset);
    assert.deepEqual(result.close.asteroid.samples.map(row => row.utcMs), result.close.target.samples.map(row => row.utcMs));
  }
  assert.equal(data.trajectoryBody('mystery'), null); assert.equal(data.trajectoryBody('Pluto').id, '999');
  for (const body of ['Sun', 'Mercury', 'Venus', 'Earth', 'Moon', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']) assert.ok(data.trajectoryBody(body));
});

test('busy and request budgets return pending and resume cached blocks without repeating JPL work', async () => {
  const h = harness({ busyAfter: 1 });
  assert.equal((await h.service.get(asteroid(), event())).status, 'pending'); assert.equal(h.calls(), 1);
  assert.equal((await h.service.get(asteroid(), event())).status, 'ready'); assert.ok(h.calls() > 3);
  const budget = harness({ networkCost: 20000 }); let outcome;
  for (let poll = 0; poll < 30; poll++) { outcome = await budget.service.get(asteroid(), event()); if (outcome.status !== 'pending') break; }
  assert.equal(outcome.status, 'ready'); assert.equal(budget.calls(), h.calls());
  const expired = harness(); assert.equal((await expired.service.get(asteroid(), event(), { deadlineUtcMs: eventTime })).status, 'pending'); assert.equal(expired.calls(), 0);
});

test('missing time, unsupported bodies, cache outage and upstream rate limits remain explicit without invented paths', async () => {
  const h = harness(); assert.equal((await h.service.get(asteroid(), { ...event(), utcMs: null })).reason, 'missing-time');
  assert.equal((await h.service.get(asteroid(), event('Mystery'))).reason, 'unsupported-body'); assert.equal(h.calls(), 0);
  assert.equal((await harness({ storeFailure: true }).service.get(asteroid(), event())).reason, 'shared-cache-unavailable');
  const failure = await harness({ failStatus: 429 }).service.get(asteroid(), event()); assert.equal(failure.status, 'unavailable'); assert.equal(failure.reason, 'upstream-rate-limit'); assert.equal(failure.retryAfterMs, 7000);
  assert.ok(data.trajectoryRanges(eventTime, 100000).overview.end - data.trajectoryRanges(eventTime, 100000).overview.start <= 3652.5 * DAY);
  assert.equal(data.trajectoryRanges(eventTime, 10).overview.end - data.trajectoryRanges(eventTime, 10).overview.start, 10 * DAY);
  assert.equal(data.trajectoryRanges(eventTime, 30, 100, 10).close.end - data.trajectoryRanges(eventTime, 30, 100, 10).close.start, 12 * 3600000);
  assert.equal(data.trajectoryRanges(eventTime, 30, 1e10, 1).close.end - data.trajectoryRanges(eventTime, 30, 1e10, 1).close.start, 60 * DAY);
  assert.equal(data.trajectoryRanges(eventTime, 30).close.end - data.trajectoryRanges(eventTime, 30).close.start, 14 * DAY);
  assert.throws(() => data.horizonsUrl("DES=1;'\nEVIL='YES", [eventTime]));
});

test('real-size GET time lists are bounded, individually quoted and explicitly UTC/ecliptic', () => {
  const times = Array.from({ length: 325 }, (_, index) => eventTime + index * 3600000);
  for (let offset = 0; offset < times.length; offset += 48) {
    const batch = times.slice(offset, offset + 48), address = data.horizonsUrl('DES=20509505;', batch), url = new URL(address);
    assert.ok(address.length <= 1800); assert.ok(!address.includes('+')); assert.ok(address.includes('%20'));
    assert.equal(Array.from(url.searchParams.get('TLIST').matchAll(/'([\d.]+)'/g)).length, batch.length);
    assert.equal(url.searchParams.get('CENTER'), "'500@10'"); assert.equal(url.searchParams.get('REF_PLANE'), "'ECLIPTIC'"); assert.equal(url.searchParams.get('TIME_TYPE'), "'UT'");
  }
  assert.throws(() => data.horizonsUrl('DES=20509505;', times));
});

test('an orbit solution update rotates partial cache generation and recovers on the next poll', async () => {
  const h = harness({ changeSolution: true });
  const changing = await h.service.get(asteroid(), event()); assert.equal(changing.status, 'pending'); assert.match(changing.message, /updated/);
  const generation = Array.from(h.cache.entries()).find(([key]) => key.endsWith(':generation'))[1].token;
  assert.match(generation, /^[a-f0-9-]{36}$/);
  const result = await h.service.get(asteroid(), event()); assert.equal(result.status, 'ready'); assert.equal(result.source.solutionId, '32');
  const settledCalls = h.calls(); assert.equal((await h.service.get(asteroid(), event())).status, 'ready'); assert.equal(h.calls(), settledCalls);
});

test('clipped windows insert the exact encounter with bounded extra TLIST samples', async () => {
  const instant = Date.UTC(1600, 0, 1, 6, 3, 17, 123), h = harness({ sampleEpoch: instant });
  const result = await h.service.get(asteroid(), { ...event('Earth', instant), date: '1600-01-01', key: '1600-01-01-Earth-0' });
  assert.equal(result.status, 'ready');
  for (const window of [result.close, result.overview]) for (const track of [window.asteroid, window.target]) assert.ok(track.samples.some(sample => sample.utcMs === instant));
  assert.ok(h.requestedTimes.some(times => times.length < 48));
});

test('concurrent instances persist and recheck partial blocks inside one serial lease', async () => {
  const h = harness(), single = harness(); await single.service.get(asteroid(), event());
  let tail = Promise.resolve(), held = 0;
  const dependencies = { ...h.dependencies,
    read: async (key, options) => { assert.ok(Number.isFinite(options.deadlineUtcMs)); return h.dependencies.read(key, options); },
    write: async (key, value, options) => { assert.ok(Number.isFinite(options.deadlineUtcMs)); if (key.endsWith(':lookup') || key.includes(':vectors:') || key.includes(':uniform:')) assert.equal(held, 1, 'Publish each JPL result before releasing its lease'); await new Promise(resolve => setTimeout(resolve, 1)); return h.dependencies.write(key, value, options); },
    lease: (work, options) => { assert.ok(Number.isFinite(options.deadlineUtcMs)); const previous = tail; let release; tail = new Promise(resolve => { release = resolve; }); return previous.then(async () => { held++; try { return await work(); } finally { held--; release(); } }); },
  };
  const first = data.createTrajectoryService(dependencies), second = data.createTrajectoryService(dependencies);
  const results = await Promise.all([first.get(asteroid(), event()), second.get(asteroid(), event())]);
  assert.ok(results.every(result => result.status === 'ready')); assert.equal(h.calls(), single.calls(), 'No duplicate upstream query while cache persistence is slow');
});

test('slow lease acquisition and late cache reads cannot start HTTP beyond the absolute deadline', async () => {
  const acquired = harness();
  const service = data.createTrajectoryService({ ...acquired.dependencies, lease: async work => { acquired.advance(55000); return work(); } });
  const result = await service.get(asteroid(), event(), { deadlineUtcMs: eventTime + 55000 });
  assert.equal(result.status, 'pending'); assert.equal(acquired.calls(), 0);
  const late = harness(); let reads = 0;
  const afterRead = data.createTrajectoryService({ ...late.dependencies, read: async (...args) => { reads++; if (reads === 4) late.advance(55000); return late.dependencies.read(...args); } });
  assert.equal((await afterRead.get(asteroid(), event(), { deadlineUtcMs: eventTime + 55000 })).status, 'pending'); assert.equal(late.calls(), 0);
});

test('route validates IDs, preserves event authority and no-store, and exposes pending retry timing', async () => {
  let dataCalls = 0, selected;
  const raw = { id: '2509505', close_approach_data: [{ close_approach_date: '2026-10-18', epoch_date_close_approach: eventTime, orbiting_body: 'Moon' }] };
  const route = loader({
    '@/app/lib/data/asteroids/getAsteroid': { getAsteroid: async () => { dataCalls++; return raw; } },
    '@/app/lib/nasa/api': { getNasaUtcDate: () => '2026-10-18' },
    '@/app/lib/asteroids/view-model': model,
    '@/app/lib/asteroids/server/trajectory-service': { getVerifiedTrajectory: async (_, event) => { selected = event; return { status: 'pending', retryAfterMs: 3000, message: 'Preparing' }; } },
  })('src/app/api/asteroids/[id]/trajectory/route.ts');
  let response = await route.GET(new Request('https://orbital.test/api/asteroids/bad/trajectory'), { params: { id: 'bad' } }); assert.equal(response.status, 400); assert.equal(dataCalls, 0);
  response = await route.GET(new Request('https://orbital.test/api/asteroids/2509505/trajectory?date=2026-02-30'), { params: { id: '2509505' } }); assert.equal(response.status, 400); assert.equal(dataCalls, 0);
  response = await route.GET(new Request('https://orbital.test/api/asteroids/2509505/trajectory?date=2026-10-18&event=stale-key'), { params: { id: '2509505' } }); assert.equal(response.status, 404); assert.equal(selected, undefined);
  response = await route.GET(new Request('https://orbital.test/api/asteroids/2509505/trajectory?date=2026-10-18&event=2026-10-18-Moon-0'), { params: { id: '2509505' } }); assert.equal(response.status, 202); assert.equal(response.headers.get('Retry-After'), '3'); assert.equal(response.headers.get('Cache-Control'), 'no-store'); assert.equal(selected.body, 'Moon'); assert.equal(selected.utcMs, eventTime);
});
