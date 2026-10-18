const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const runnerUrl = pathToFileURL(path.join(root, 'scripts/dev.mjs')).href;
const runner = import(runnerUrl);
const temporary = () => fs.mkdtempSync(path.join(os.tmpdir(), 'orbital-dev-test-'));
const removeTemporary = (folder) => {
  const resolved = path.resolve(folder);
  assert.equal(path.dirname(resolved).toLowerCase(), path.resolve(os.tmpdir()).toLowerCase());
  assert.ok(path.basename(resolved).startsWith('orbital-dev-test-'));
  fs.rmSync(resolved, { recursive: true, force: true });
};
const waitUntil = async (condition) => {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assert.fail('Timed out waiting for the owned test process.');
};

test('NASA dev has a distinct strict default origin and validates explicit port choices', async () => {
  const { devOptions } = await runner;
  assert.deepEqual(devOptions(), { port: '3100', hostname: '127.0.0.1', args: ['--hostname', '127.0.0.1', '--port', '3100'] });
  assert.deepEqual(devOptions(['--port=3102', '-H', 'localhost']).args, ['--hostname', 'localhost', '--port', '3102']);
  for (const args of [['-p'], ['-p', '0'], ['--port=65536'], ['--port=no']]) assert.throws(() => devOptions(args));
});

test('development cache is isolated while production config and existing loaders remain', async () => {
  const source = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8').replace(/import\s*\{\s*PHASE_DEVELOPMENT_SERVER\s*\}\s*from\s*["']next\/constants\.js["'];?/, 'const PHASE_DEVELOPMENT_SERVER = "phase-development-server";');
  const factory = (await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
  assert.equal(factory('phase-development-server').distDir, '.next-dev');
  assert.equal(factory('phase-production-build').distDir, '.next');
  assert.equal(factory('phase-production-server').distDir, '.next');
  const config = factory('phase-production-build');
  assert.ok(config.images.remotePatterns.some((item) => item.hostname === 'apod.nasa.gov'));
  const webpack = { module: { rules: [] }, resolve: { extensions: [] } };
  config.webpack(webpack, { isServer: true });
  assert.equal(webpack.module.rules[0].use, 'raw-loader');
  assert.ok(webpack.resolve.extensions.includes('.glsl'));
});

test('one checkout owns one dev guard, even when another port was requested', { timeout: 10000 }, async () => {
  const folder = temporary();
  const { acquireDevGuard } = await runner;
  let release;
  try {
    release = await acquireDevGuard(folder);
    await assert.rejects(acquireDevGuard(folder), /already has a development process/);
    await release(); release = null;
    release = await acquireDevGuard(folder);
  } finally { if (release) await release(); removeTemporary(folder); }
});

test('an abruptly exited owner does not leave a stale development guard', { timeout: 10000 }, async () => {
  const folder = temporary();
  const { acquireDevGuard } = await runner;
  const child = spawn(process.execPath, ['--input-type=module', '-e', `import {acquireDevGuard} from ${JSON.stringify(runnerUrl)}; await acquireDevGuard(${JSON.stringify(folder)}); console.log('ready'); process.stdin.once('data',()=>process.exit(0));`], { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  let release;
  try {
    await new Promise((resolve, reject) => { child.stdout.once('data', resolve); child.once('error', reject); child.once('exit', (code) => { if (code) reject(new Error(`Guard child failed: ${code}`)); }); });
    await assert.rejects(acquireDevGuard(folder), /already has a development process/);
    const exited = new Promise((resolve) => child.once('exit', resolve));
    child.stdin.write('exit'); await exited;
    release = await acquireDevGuard(folder);
  } finally { if (release) await release(); child.stdin.destroy(); removeTemporary(folder); }
});

test('runner preserves child exit diagnostics and does not automatically restart failures', { timeout: 10000 }, async () => {
  const folder = temporary(), bin = path.join(folder, 'node_modules/next/dist/bin');
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(bin, 'next'), `require('node:fs').writeFileSync('invocation.json', JSON.stringify(process.argv.slice(2))); process.exit(7);`);
  try {
    assert.equal(await (await runner).runDev(folder, []), 7);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(folder, 'invocation.json'))), ['dev', '--hostname', '127.0.0.1', '--port', '3100']);
    const diagnostic = JSON.parse(fs.readFileSync(path.join(folder, '.orbital-dev/last-exit.json')));
    assert.equal(diagnostic.exitCode, 7); assert.equal(diagnostic.signal, null); assert.equal(diagnostic.port, 3100);
    const release = await (await runner).acquireDevGuard(folder); await release();
  } finally { removeTemporary(folder); }
});

test('a managed Windows stop ends the owned Next process tree and releases its guard', { timeout: 10000, skip: process.platform !== 'win32' || process.env.ORBITAL_DEV_TREE_TEST !== '1' }, async () => {
  const folder = temporary(), bin = path.join(folder, 'node_modules/next/dist/bin');
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(bin, 'next'), `const child=require('node:child_process').spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore',windowsHide:true}); require('node:fs').writeFileSync('child.json',JSON.stringify({pid:process.pid,child:child.pid})); setInterval(()=>{},1000);`);
  const pending = (await runner).runDev(folder, []);
  try {
    await waitUntil(() => fs.existsSync(path.join(folder, 'child.json')));
    const ids = JSON.parse(fs.readFileSync(path.join(folder, 'child.json')));
    process.emit('SIGTERM');
    await pending;
    await waitUntil(() => { try { process.kill(ids.child, 0); return false; } catch { return true; } });
    assert.throws(() => process.kill(ids.pid, 0));
    const release = await (await runner).acquireDevGuard(folder); await release();
    assert.equal(JSON.parse(fs.readFileSync(path.join(folder, '.orbital-dev/last-exit.json'))).signal, 'SIGTERM');
  } finally { removeTemporary(folder); }
});

function middleware(environment) {
  const logs = [], source = fs.readFileSync(path.join(root, 'src/middleware.ts'), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
    module, exports: module.exports, process: { env: { NODE_ENV: environment } }, URL, Set,
    console: { info: (...args) => logs.push(args) },
    require: () => ({ NextResponse: { next: () => 'passthrough' } }),
  });
  return { execute: module.exports.middleware, logs };
}
const request = (origin = 'https://work.test', method = 'OPTIONS') => ({ method, nextUrl: new URL('http://127.0.0.1:3100/api/example?secret=hidden'), headers: new Headers({ origin, referer: 'https://user:password@work.test/private?token=secret', 'sec-fetch-site': 'cross-site', 'access-control-request-method': 'GET', cookie: 'never=log' }) });

test('development preflight diagnostic is bounded, strips private URL parts, and keeps routing unchanged', () => {
  const diagnostic = middleware('development');
  assert.equal(diagnostic.execute(request()), 'passthrough');
  diagnostic.execute(request());
  assert.equal(diagnostic.logs.length, 1);
  const entry = diagnostic.logs[0][1];
  assert.deepEqual(JSON.parse(JSON.stringify(entry)), { pathname: '/api/example', origin: 'https://work.test', refererOrigin: 'https://work.test', fetchSite: 'cross-site', requestedMethod: 'GET' });
  assert.doesNotMatch(JSON.stringify(entry), /password|token|secret|cookie/);
  diagnostic.execute(request('http://127.0.0.1:3100')); diagnostic.execute(request('https://ignored.test', 'GET'));
  assert.equal(diagnostic.logs.length, 1);
  for (let index = 0; index < 10; index++) diagnostic.execute(request(`https://work-${index}.test`));
  assert.equal(diagnostic.logs.length, 5);
  const production = middleware('production');
  assert.equal(production.execute(request()), 'passthrough'); assert.equal(production.logs.length, 0);
});
