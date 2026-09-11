const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const {
    createGeneralLimiter,
    createLoginLimiter,
    createExpensiveLimiter
} = require('../src/middlewares/rateLimit.middleware');

async function start(app, t) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    return `http://127.0.0.1:${server.address().port}`;
}

test('repeated failed login attempts receive a safe 429 response', async t => {
    const app = express();
    app.post('/login', createLoginLimiter({ windowMs: 60000, limit: 2 }), (req, res) => {
        res.status(401).json({ message: 'Invalid credentials' });
    });
    const base = await start(app, t);
    assert.equal((await fetch(base + '/login', { method: 'POST' })).status, 401);
    assert.equal((await fetch(base + '/login', { method: 'POST' })).status, 401);
    const blocked = await fetch(base + '/login', { method: 'POST' });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers.has('ratelimit'), true);
    assert.equal(blocked.headers.has('x-ratelimit-limit'), false);
    assert.deepEqual(await blocked.json(), {
        message: 'Too many login attempts. Please try again later.',
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many login attempts. Please try again later.'
        }
    });
});

test('general limiter permits normal request volume', async t => {
    const app = express();
    app.use(createGeneralLimiter({ windowMs: 60000, limit: 5 }));
    app.get('/', (req, res) => res.sendStatus(204));
    const base = await start(app, t);
    for (let index = 0; index < 3; index++) {
        assert.equal((await fetch(base)).status, 204);
    }
});

test('expensive limiter isolates authenticated users sharing an IP', async t => {
    const app = express();
    app.use('/generate/:userId', (req, res, next) => {
        req.user = { id: req.params.userId };
        next();
    }, createExpensiveLimiter({ windowMs: 60000, limit: 1 }));
    app.post('/generate/:userId', (req, res) => res.sendStatus(204));
    const base = await start(app, t);
    assert.equal((await fetch(base + '/generate/user-a', { method: 'POST' })).status, 204);
    assert.equal((await fetch(base + '/generate/user-a', { method: 'POST' })).status, 429);
    assert.equal((await fetch(base + '/generate/user-b', { method: 'POST' })).status, 204);
});
