import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function visibleText(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#(?:x27|39);/g, "'")
    .replace(/\s+/g, ' ');
}

export async function verifyDeployment(origin, request = fetch) {
  const base = new URL(origin);
  if (base.username || base.password || base.search || base.hash || base.pathname !== '/' ||
      (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(base.hostname)))) {
    throw new Error('Provide an HTTPS deployment origin, without a path or credentials.');
  }
  const checked = [];
  async function page(path, required) {
    const response = await request(new URL(path, base), {
      headers: { Accept: 'text/html' }, redirect: 'error', signal: AbortSignal.timeout(45000),
    });
    if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) {
      throw new Error(`Deployment check failed for ${path}: HTTP ${response.status}.`);
    }
    const html = await response.text(), text = visibleText(html);
    if (/NASA object data is unavailable|This encounter can.t be opened yet|Internal Server Error|Application error/i.test(text) ||
        required.some(marker => !text.includes(marker))) {
      throw new Error(`Deployment check failed for ${path}: expected content is unavailable.`);
    }
    checked.push(path);
    return html;
  }

  await page('/privacy', ['Asan Memetov', 'amemetoff.it@gmail.com']);
  const catalog = await page('/asteroids', ['Asteroids']);
  const linked = catalog.match(/href=["'](\/asteroids\/\d+\/view\?[^"']+)["']/)?.[1].replace(/&amp;/g, '&');
  // The stable public fixture tests SSR even if today's catalog is genuinely empty.
  const profiles = new Set(['/asteroids/2509505/view']);
  if (linked) profiles.add(linked);
  for (const path of profiles) await page(path, ['Past & future encounters', 'NASA estimated diameter']);
  await page('/birthday', ['Your birth sky']);
  return checked;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const paths = await verifyDeployment(process.argv[2] || '');
    console.log(`Deployment content checks passed (${paths.length} pages).`);
  } catch {
    // Never print response bodies, visitor input or underlying request errors.
    console.error('Deployment content checks failed. Verify the SSR NASA key and published pages. HTTP 200 alone is insufficient.');
    process.exitCode = 1;
  }
}
