const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('production startup rejects missing/placeholder secrets before loading routes', () => {
    for (const JWT_SECRET of ['', '<generate-a-long-random-secret>']) {
        const child = spawnSync(process.execPath, ['-e', "require('./src/app')"], {
            cwd: path.resolve(__dirname, '..'),
            env: { ...process.env, NODE_ENV: 'production', JWT_SECRET },
            encoding: 'utf8', timeout: 10000
        });
        assert.notEqual(child.status, 0);
        assert.match(child.stderr, /JWT_SECRET must be a strong random secret/);
        if (JWT_SECRET) assert.equal(child.stderr.includes(JWT_SECRET), false);
    }
});

test('application smoke: health, CORS, origin protection and cookie-clearing routes', async t => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = randomBytes(48).toString('base64url');
    process.env.GOOGLE_API_KEY = 'test-only-not-used-for-network';
    process.env.CLIENT_URL = 'https://app.example.com';
    delete process.env.CLIENT_URLS;
    delete process.env.COOKIE_SAME_SITE;
    const app = require('../src/app');
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    const base = `http://127.0.0.1:${server.address().port}`;
    assert.equal((await fetch(base + '/health')).status, 200);
    assert.equal((await fetch(base + '/ready')).status, 503);
    assert.equal((await fetch(base + '/api/auth/get-me')).status, 401);
    assert.equal((await fetch(base + '/api/auth/logout')).status, 404);
    for (const headers of [{ Origin: 'https://app.example.com' }, { Referer: 'https://app.example.com/workspace' }]) {
        const logout = await fetch(base + '/api/auth/logout', { method: 'POST', headers });
        assert.equal(logout.status, 200);
        assert.match(logout.headers.get('set-cookie'), /token=;/);
        assert.match(logout.headers.get('set-cookie'), /HttpOnly/);
        assert.match(logout.headers.get('set-cookie'), /Secure/);
        assert.match(logout.headers.get('set-cookie'), /SameSite=Lax/);
    }
    for (const headers of [{}, { Origin: 'https://untrusted.example' }, { Origin: 'null' }]) {
        assert.equal((await fetch(base + '/api/auth/logout', { method: 'POST', headers })).status, 403);
    }
    const preflight = await fetch(base + '/api/auth/logout', {
        method: 'OPTIONS', headers: { Origin: 'https://app.example.com', 'Access-Control-Request-Method': 'POST' }
    });
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://app.example.com');
    assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');

    const invalidRegistration = await fetch(base + '/api/auth/register', {
        method: 'POST',
        headers: { Origin: 'https://app.example.com', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'Candidate', email: 'invalid', password: 'password', isAdmin: true
        })
    });
    const invalidBody = await invalidRegistration.json();
    assert.equal(invalidRegistration.status, 400);
    assert.equal(invalidBody.message, 'Invalid request');
    assert.equal(invalidBody.error.code, 'VALIDATION_ERROR');
    assert.equal(invalidBody.requestId, invalidRegistration.headers.get('x-request-id'));
    assert.ok(invalidBody.error.details.every(detail => !('received' in detail)));
});
