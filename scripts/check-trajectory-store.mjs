// Run in the server identity/environment intended for release. No credentials are printed.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const sourcePath = path.resolve('src/app/lib/asteroids/server/trajectory-cache.ts');
const source = ts.transpileModule(fs.readFileSync(sourcePath, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
new Function('require', 'module', 'exports', source)(require, module, module.exports);
try {
  console.log(JSON.stringify(await module.exports.checkTrajectoryStore()));
  if (process.env.FIRESTORE_EMULATOR_HOST) console.log('Local protocol check only; cloud database and runtime IAM are not verified.');
} catch {
  console.error('Shared ephemeris cache unavailable. Verify the default Firestore database and the NASA SSR workload identity read/create/update IAM permissions before release. Client rules must remain closed.');
  process.exitCode = 1;
}
