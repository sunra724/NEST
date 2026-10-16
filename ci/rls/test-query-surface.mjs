import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';
import { SignJWT } from 'jose';

// Run only in a disposable checkout: replace one local fixture, then restore it.
if (process.env.RLS_DISPOSABLE_APP !== 'true') throw new Error('Disposable app marker required');
for (const file of ['.env', '.env.local', '.env.production', '.env.production.local']) {
  try { await fs.access(file); throw new Error('Refuse an app checkout containing environment files'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const fixturePath = 'server-data/program-n.json';
try {
  const publicFiles = await fs.readdir('public/data');
  assert.equal(publicFiles.some(file => file.endsWith('.json')), false, 'Raw fallback documents must not be deployed as public assets');
} catch (error) { if (error.code !== 'ENOENT') throw error; }
const original = await fs.readFile(fixturePath);
const fixture = JSON.parse(original);
const privateMarkers = ['synthetic-contact-unique', 'synthetic-registration-unique', 'synthetic-memo-unique'];
fixture.participants = [{ id: 'synthetic-person', name: 'Synthetic person', cohort: 'Synthetic cohort', contact: privateMarkers[0], registeredAt: privateMarkers[1], memo: privateMarkers[2] }];
const jwtSecret = randomBytes(32).toString('hex');
const viewerPassword = randomBytes(20).toString('hex');
const adminPassword = randomBytes(20).toString('hex');
const results = [];
let child;
async function stop() {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' });
  else child.kill('SIGTERM');
  await Promise.race([new Promise(resolve => child.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 2000))]);
  if (child.exitCode === null) child.kill('SIGKILL');
}
async function start(overrides = {}) {
  await stop();
  const socket = net.createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  const env = { ...process.env, NODE_ENV: 'production', JWT_SECRET: jwtSecret, SITE_PASSWORD: viewerPassword, ADMIN_PASSWORD: adminPassword, ...overrides };
  for (const key of ['SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEST_ACCESS_PASSWORD']) delete env[key];
  child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '-p', String(port)], { env, windowsHide: true, stdio: 'ignore' });
  const base = 'http://127.0.0.1:' + port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error('Disposable Next server exited');
    try { if ((await fetch(base + '/login', { signal: AbortSignal.timeout(1000) })).ok) return base; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Disposable Next server did not become ready');
}
function check(label, actual, expected) { assert.deepEqual(actual, expected, label); results.push(label); }
async function login(base, path, password) {
  const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
  check(path + ' configured login', response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}
try {
  await fs.writeFile(fixturePath, JSON.stringify(fixture));
  let base = await start();
  const viewerCookie = await login(base, '/api/auth', viewerPassword);
  const adminCookie = await login(base, '/api/admin/auth', adminPassword);
  for (const [actor, cookie] of [['anon', ''], ['viewer', viewerCookie], ['admin', adminCookie]]) {
    for (const path of ['/data/program-n.json', '/data/operations.json', '/data/program-n%2Ejson', '/%64ata/program-n.json', '/data%2Fprogram-n.json']) {
      const response = await fetch(base + path, { headers: { Cookie: cookie }, redirect: 'manual' });
      check(actor + ' direct JSON blocked: ' + path, response.status, 404);
      check(actor + ' direct JSON not cached: ' + path, response.headers.get('cache-control'), 'no-store');
    }
  }
  check('anon API denied', (await fetch(base + '/api/data/program-n')).status, 401);
  check('viewer admin API denied', (await fetch(base + '/api/admin/programs/n', { headers: { Cookie: viewerCookie } })).status, 401);
  const viewer = await fetch(base + '/api/data/program-n', { headers: { Cookie: viewerCookie } });
  check('viewer API allowed', viewer.status, 200);
  const viewerData = await viewer.json();
  check('viewer receives cohort only', viewerData.participants, [{ cohort: 'Synthetic cohort' }]);
  check('viewer receives aggregate count', viewerData.participantSummary.total, 1);
  const admin = await fetch(base + '/api/data/program-n', { headers: { Cookie: adminCookie } });
  check('admin API allowed', admin.status, 200);
  check('admin retains fixture fields', (await admin.json()).participants, fixture.participants);
  const page = await fetch(base + '/programs/n', { headers: { Cookie: viewerCookie } });
  check('viewer program page works', page.status, 200);
  const pageText = await page.text();
  check('server-rendered page omits private fields', privateMarkers.some(marker => pageText.includes(marker)), false);
  base = await start({ JWT_SECRET: '' });
  const missingJwt = await fetch(base + '/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: viewerPassword }) });
  check('missing JWT secret cannot issue session', missingJwt.status, 500);
  const fallbackToken = await new SignJWT({ role: 'admin' }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('5m').sign(new TextEncoder().encode('fallback-secret'));
  check('old fallback signature rejected', (await fetch(base + '/api/data/program-n', { headers: { Cookie: 'admin_token=' + fallbackToken } })).status, 401);
  base = await start({ ADMIN_PASSWORD: '' });
  for (const body of [{}, { password: '' }]) {
    check('missing admin password cannot issue session ' + JSON.stringify(body), (await fetch(base + '/api/admin/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).status, 401);
  }
  await fs.writeFile('query-surface-evidence.json', JSON.stringify({ checkedAt: new Date().toISOString(), checks: results.length, passed: results, syntheticFixtureOnly: true, remoteDatabaseAccessed: false, valuesPrinted: false }, null, 2));
  process.stdout.write(JSON.stringify({ querySurfaceChecksPassed: results.length, remoteDatabaseAccessed: false }) + '\n');
} finally {
  await stop();
  await fs.writeFile(fixturePath, original);
}
