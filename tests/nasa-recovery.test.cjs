const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');

function setup(fetch) {
  const cache = new Map(), logs = [], timers = new Set();
  function load(relative) {
    const file = path.resolve(__dirname, '../src/app/lib', relative);
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(code, { exports, URL, Headers, AbortController, Date, Intl,
      process: { env: { NODE_ENV: 'production', NASA_API_KEY: 'SECRET_TEST_KEY' } }, fetch,
      console: { warn: (...args) => logs.push(args), info: (...args) => logs.push(args), error: (...args) => logs.push(args) },
      setTimeout(fn) { timers.add(fn); return fn; }, clearTimeout(fn) { timers.delete(fn); },
      require(name) { return load(path.relative(path.resolve(__dirname, '../src/app/lib'), path.resolve(path.dirname(file), name + '.ts'))); },
    });
    return exports;
  }
  return { load, logs, timers };
}
const url = 'https://api.nasa.gov/planetary/apod?api_key=SECRET_TEST_KEY';
const sciencePost = (slug = 'apod-2024-january-1-galaxy', media = '<img src="https://assets.science.nasa.gov/galaxy.jpg">') => ({ slug, link:'https://science.nasa.gov/image-article/'+slug+'/', content:{rendered:`<div class="media-detail-hero__media">${media}</div><h1>Galaxy &amp; stars</h1><p class="media-detail-hero__description"><strong>Explanation: </strong>Real source explanation.</p><table><tr><th>Credit &amp; Copyright</th><td>Original photographer</td></tr></table>`} });
test('APOD NASA Science adapter preserves publication, exhibit and credit; never uses a logo', () => {
  const {scienceApod} = setup().load('nasa/apod.ts');
  const item = scienceApod(sciencePost());
  assert.equal(item.date,'2024-01-01'); assert.equal(item.title,'Galaxy & stars');
  assert.equal(item.explanation,'Real source explanation.'); assert.equal(item.copyright,'Original photographer');
  assert.equal(item.media_type,'image');
  assert.equal(scienceApod(sciencePost('unrelated-post')),null);
  assert.equal(scienceApod(sciencePost(undefined,'<img src="https://science.nasa.gov/nasa-logo.png">')),null);
  assert.equal(scienceApod(sciencePost(undefined,'<iframe src="https://www.youtube.com/embed/example"></iframe>')).media_type,'video');
  assert.equal(scienceApod(sciencePost(undefined,'<video><source src="https://science.nasa.gov/example.mp4"></video>')).media_type,'video');
});
test('APOD dates include archive start and today, reject impossible, early and future dates without requests', async () => {
  let calls=0; const app=setup(async()=>{calls++;return new Response('[]');});
  const api=app.load('nasa/apod.ts');
  assert.equal(api.validApodDate('1995-06-16'),true);
  assert.equal(api.validApodDate('2024-02-29'),true);
  assert.equal(api.validApodDate(new Date().toISOString().slice(0,10)),true);
  for(const date of ['1995-06-15','2023-02-29','2024-02-30','2024-13-01','9999-01-01','bad']) {
    assert.equal(api.validApodDate(date),false); assert.equal((await api.fetchApodResult(date)).outcome,'invalid-data');
  }
  assert.equal(calls,0);
});
test('APOD archive queries include midnight, use no key and retain the original cache; failures omit the chosen date', async () => {
  const app=setup(async(url,init)=>{
    const u=new URL(url);assert.equal(u.hostname,'science.nasa.gov');assert.equal(u.searchParams.has('api_key'),false);
    assert.equal(u.searchParams.get('after'),'2023-12-31T23:59:59');assert.equal(u.searchParams.get('before'),'2024-01-02T00:00:00');
    assert.equal(init.next.revalidate,3600); return new Response(JSON.stringify([sciencePost()]));
  });
  assert.equal((await app.load('nasa/apod.ts').fetchApodResult('2024-01-01')).data.date,'2024-01-01');
  for(const [body,status,outcome] of [['[]',200,'empty'],['failure',503,'unavailable']]) {
    const failed=setup(async()=>new Response(body,{status}));
    assert.equal((await failed.load('nasa/apod.ts').fetchApodResult('2024-01-01')).outcome,outcome);
    assert.doesNotMatch(JSON.stringify(failed.logs),/2024-01-01|2023-12-31|SECRET_TEST_KEY/);
  }
});
test('NASA diagnostics distinguish HTTP failures without recording secrets or raw error messages', async () => {
  for (const [status, outcome] of [[401,'authorization'],[403,'authorization'],[429,'rate-limit'],[500,'unavailable'],[503,'unavailable']]) {
    const app = setup(async () => new Response('SECRET_TEST_KEY', { status }));
    assert.equal((await app.load('nasa/api.ts').fetchJsonResult(url)).outcome, outcome);
    assert.doesNotMatch(JSON.stringify(app.logs), /SECRET_TEST_KEY|https:|api_key/);
    assert.equal(app.timers.size, 0);
  }
  const app = setup(async () => { throw new Error(url); });
  assert.equal((await app.load('nasa/api.ts').fetchJsonResult(url)).outcome, 'unavailable');
  assert.doesNotMatch(JSON.stringify(app.logs), /SECRET_TEST_KEY/);
});
test('NASA distinguishes empty JSON, HTML, malformed JSON and invalid schema; cache interval is retained', async () => {
  for (const [body, outcome] of [['[]','empty'],['','empty'],['null','empty'],['<html>Redirect page</html>','invalid-data'],['{','invalid-data'],['{}','invalid-data'],['[1]','ok']]) {
    const app = setup(async (url, init) => { assert.equal(init.next.revalidate, 43200); return new Response(body); });
    const result = await app.load('nasa/api.ts').fetchJsonResult(url, 43200, undefined, Array.isArray);
    assert.equal(result.outcome, outcome);
  }
});
test('NASA timeout and caller abort terminate pending requests and release timers', async () => {
  const app = setup((url, init) => new Promise((resolve, reject) => {
    if (init.signal.aborted) reject(new Error('aborted'));
    init.signal.addEventListener('abort', () => reject(new Error('aborted')));
  }));
  const pending = app.load('nasa/api.ts').fetchJsonResult(url);
  [...app.timers][0]();
  assert.equal((await pending).outcome, 'unavailable'); assert.equal(app.timers.size, 0);
  const controller = new AbortController();
  const cancelled = app.load('nasa/api.ts').fetchJsonResult(url, 3600, { signal: controller.signal });
  controller.abort(); assert.equal((await cancelled).outcome, 'unavailable'); assert.equal(app.timers.size, 0);
});
test('DONKI uses verified official migration without an API key and preserves an empty selection', async () => {
  const app = setup(async (url, init) => {
    assert.equal(new URL(url).origin + new URL(url).pathname, 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/notifications');
    assert.equal(new URL(url).searchParams.has('api_key'), false);
    assert.equal(init.next.revalidate, 43200);
    return new Response('[]');
  });
  assert.equal((await app.load('nasa/donki.ts').fetchDonkiNotifications()).length, 0);
});
test('DONKI retains source metadata but does not present an empty markdown heading as a bulletin', async () => {
  const app = setup(async () => new Response(JSON.stringify([{ messageID:'known', messageBody:'## ', messageIssueTime:'2026-10-13T00:50Z' }])));
  const [item] = await app.load('nasa/donki.ts').fetchDonkiNotifications();
  assert.equal(item.messageID, 'known'); assert.equal(item.messageBody, undefined); assert.equal(item.isFallback, undefined);
});
test('EPIC distinguishes empty sequences and invalid metadata without fabricating observation dates', async () => {
  for (const body of ['[]','[null]','[{"image":"frame","date":"2026-02-30"}]']) {
    const app = setup(async () => new Response(body));
    const images = await app.load('nasa/epic.ts').fetchEpicImages();
    if (body === '[]') assert.equal(images.length, 0);
    else { assert.equal(images[0].identifier, 'local-epic-fallback'); assert.equal(images[0].date, undefined); }
  }
});
test('APOD invalid responses remain unavailable instead of fabricating an observation', async () => {
  const app = setup(async () => new Response('{"title":12,"media_type":"other","url":true}'));
  const item = await app.load('nasa/apod.ts').fetchApod();
  assert.equal(item, null);
  assert.match(JSON.stringify(app.logs), /invalid-data/);
});
test('journal NeoWs chooses the snapshot Earth encounter rather than the first historical record', async () => {
  const date = new Date().toISOString().slice(0,10);
  const app = setup(async () => new Response(JSON.stringify({ near_earth_objects: { [date]: [{ id:'1',name:'Object',is_potentially_hazardous_asteroid:true,close_approach_data:[{close_approach_date:'1913-01-01',orbiting_body:'Earth'},{close_approach_date:date,orbiting_body:'Earth',miss_distance:{kilometers:'1000.2'}}] }] } })));
  const [item] = await app.load('nasa/neows.ts').fetchTodayNeoFeed();
  assert.equal(item.approachDate, date); assert.equal(item.missDistanceKm, '1000.2');
});
test('EPIC commits only loaded latest requests, retains the current frame on failure and cancels after leaving', async () => {
  const app = setup(); const deferred = new Map();
  const loader = app.load('observations/frames.ts').createFrameLoader(url => new Promise((resolve,reject) => deferred.set(url,{resolve,reject})));
  let frame = 'initial', failed = false;
  const first = loader.show('slow', () => frame='slow', () => failed=true);
  const second = loader.show('fast', () => frame='fast', () => failed=true);
  assert.equal(frame, 'initial'); deferred.get('fast').resolve(); await second; assert.equal(frame,'fast');
  deferred.get('slow').resolve(); await first; assert.equal(frame,'fast');
  const error = loader.show('broken', () => frame='broken', () => failed=true);
  deferred.get('broken').reject(new Error('failed')); await error; assert.equal(frame,'fast'); assert.equal(failed,true);
  const leaving = loader.show('late', () => frame='late', () => failed=true); loader.cancel();
  deferred.get('late').resolve(); await leaving; assert.equal(frame,'fast');
});
