const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes } = require('node:crypto');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { createHelmetConfig } = require('../src/config/httpSecurity');

test('Helmet configuration enables HSTS only in production and delegates CSP to the frontend host', () => {
    const production = createHelmetConfig({ NODE_ENV: 'production' });
    const development = createHelmetConfig({ NODE_ENV: 'development' });
    assert.equal(production.contentSecurityPolicy, false);
    assert.equal(production.strictTransportSecurity.maxAge, 31536000);
    assert.equal(development.strictTransportSecurity, false);
    assert.deepEqual(production.crossOriginResourcePolicy, { policy: 'cross-origin' });
});

test('API responses hide Express and include core security headers', () => {
    const script = `
        process.env.NODE_ENV = 'production';
        process.env.JWT_SECRET = '${randomBytes(48).toString('base64url')}';
        process.env.CLIENT_URL = 'https://app.example.com';
        const app = require('./src/app');
        const server = app.listen(0, '127.0.0.1', async () => {
            const response = await fetch('http://127.0.0.1:' + server.address().port + '/health');
            const headers = Object.fromEntries(response.headers);
            console.log(JSON.stringify(headers));
            server.close();
        });
    `;
    const child = spawnSync(process.execPath, ['-e', script], {
        cwd: path.resolve(__dirname, '..'), encoding: 'utf8', timeout: 10000
    });
    assert.equal(child.status, 0, child.stderr);
    const headers = JSON.parse(child.stdout.trim());
    assert.equal(headers['x-powered-by'], undefined);
    assert.equal(headers['x-content-type-options'], 'nosniff');
    assert.equal(headers['x-frame-options'], 'DENY');
    assert.equal(headers['referrer-policy'], 'no-referrer');
    assert.match(headers['strict-transport-security'], /max-age=31536000/);
    assert.equal(headers['content-security-policy'], undefined);
});
