const test = require('node:test');
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createAuthConfig, getAuthConfig, getCookieOptions, getClearCookieOptions } = require('../src/config/auth');
const { parseAllowedOrigins } = require('../src/config/origins');
const { isTrustedRequest, protectOrigin } = require('../src/middlewares/origin.middleware');
const { createToken, verifyToken } = require('../src/utils/token');
const revoked = require('../src/models/revokedToken.model');
const users = require('../src/models/user.model');
const controller = require('../src/controllers/auth.controller');
const authMiddleware = require('../src/middlewares/auth.middleware');

// Ephemeral test-only secret, never loaded from or written to an environment file.
process.env.JWT_SECRET = randomBytes(48).toString('base64url');
process.env.CLIENT_URL = 'https://app.example.com';
process.env.NODE_ENV = 'production';
delete process.env.CLIENT_URLS;
delete process.env.COOKIE_SAME_SITE;
const config = getAuthConfig();
const userId = '507f1f77bcf86cd799439011';
const user = { _id: userId, username: 'Candidate', email: 'candidate@example.com' };

function response() {
    return {
        statusCode: 200, cookies: [], cleared: [],
        status(value) { this.statusCode = value; return this; },
        json(value) { this.body = value; return this; },
        cookie(...args) { this.cookies.push(args); return this; },
        clearCookie(...args) { this.cleared.push(args); return this; }
    };
}

test('cookie policy is deliberate and clear options match set options', () => {
    for (const sameSite of ['lax', 'strict', 'none', ' LAX ']) {
        const auth = createAuthConfig({ JWT_SECRET: process.env.JWT_SECRET, COOKIE_SAME_SITE: sameSite });
        assert.equal(auth.cookie.sameSite, sameSite.trim().toLowerCase());
        assert.equal(auth.cookie.secure, sameSite === 'none');
        assert.equal(auth.cookie.httpOnly, true);
        assert.equal(auth.cookie.domain, undefined);
    }
    assert.equal(config.cookie.secure, true);
    assert.equal(config.cookie.sameSite, 'lax');
    assert.equal(createAuthConfig({ JWT_SECRET: config.secret, NODE_ENV: 'production', COOKIE_SAME_SITE: 'none' }).cookie.secure, true);
    const { maxAge, ...options } = getCookieOptions();
    assert.equal(maxAge, config.lifetimeSeconds * 1000);
    assert.deepEqual(options, getClearCookieOptions());
    assert.throws(() => createAuthConfig({ JWT_SECRET: config.secret, COOKIE_SAME_SITE: 'invalid' }));
});

test('missing, empty, short and placeholder secrets fail without disclosing values', () => {
    for (const secret of [undefined, '', ' ', 'secret', '<generate-a-long-random-secret>', 'a'.repeat(64), 'change-me-to-a-longer-secret-for-production']) {
        assert.throws(() => createAuthConfig({ NODE_ENV: 'production', JWT_SECRET: secret }), /JWT_SECRET must/);
    }
});

test('origin configuration normalizes, deduplicates and rejects unsafe configuration', () => {
    assert.deepEqual(parseAllowedOrigins({ CLIENT_URLS: ' https://app.example.com/,https://app.example.com ' }), ['https://app.example.com']);
    assert.deepEqual(parseAllowedOrigins({ CLIENT_URL: 'http://localhost:5173' }), ['http://localhost:5173']);
    for (const value of ['', '*', 'null', 'https://app.example.com/path', 'https://user:pass@app.example.com', 'https://app.example.com?q=x']) {
        assert.throws(() => parseAllowedOrigins({ CLIENT_URL: value }));
    }
    assert.throws(() => parseAllowedOrigins({ NODE_ENV: 'production', CLIENT_URL: 'http://app.example.com' }));
});

test('unsafe requests require exact trusted Origin or trusted Referer fallback', () => {
    const trusted = ['https://app.example.com'];
    const request = (method, origin, referer) => ({ method, get: header => header === 'Origin' ? origin : referer });
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        assert.equal(isTrustedRequest(request(method, trusted[0]), trusted), true);
        assert.equal(isTrustedRequest(request(method, undefined, trusted[0] + '/workspace'), trusted), true);
        for (const origin of ['https://app.example.com.attacker.org', 'null', 'http://app.example.com', '']) {
            assert.equal(isTrustedRequest(request(method, origin, trusted[0]), trusted), false);
        }
        assert.equal(isTrustedRequest(request(method), trusted), false);
        assert.equal(isTrustedRequest(request(method, undefined, 'not a URL'), trusted), false);
    }
    for (const method of ['GET', 'HEAD', 'OPTIONS']) assert.equal(isTrustedRequest(request(method), trusted), true);
    let blocked;
    protectOrigin(request('POST', 'https://untrusted.example'), response(), error => { blocked = error; });
    assert.equal(blocked.statusCode, 403);
    assert.equal(blocked.code, 'ORIGIN_NOT_ALLOWED');
});

test('JWT has only standard session claims and a unique cryptographic ID', () => {
    const first = createToken(userId);
    const second = createToken(userId);
    const decoded = jwt.decode(first, { complete: true });
    assert.equal(decoded.header.alg, 'HS256');
    assert.deepEqual(Object.keys(decoded.payload).sort(), ['aud', 'exp', 'iat', 'iss', 'jti', 'sub']);
    assert.equal(decoded.payload.sub, userId);
    assert.equal(decoded.payload.exp - decoded.payload.iat, config.lifetimeSeconds);
    assert.notEqual(jwt.decode(second).jti, decoded.payload.jti);
    assert.deepEqual(verifyToken(first), { id: userId, sessionId: decoded.payload.jti, expiresAt: new Date(decoded.payload.exp * 1000) });
});

test('verification rejects wrong signature, algorithm, issuer, audience and invalid/missing claims', () => {
    const base = { sub: userId, jti: randomUUID(), iss: config.issuer, aud: config.audience, exp: Math.floor(Date.now() / 1000) + 100 };
    for (const key of ['sub', 'jti', 'exp', 'iss', 'aud']) {
        const payload = { ...base };
        delete payload[key];
        assert.throws(() => verifyToken(jwt.sign(payload, config.secret)));
    }
    for (const patch of [{ sub: 'invalid' }, { sub: 123 }, { jti: '' }, { jti: {} }, { iss: 'another-api' }, { aud: 'another-app' }, { exp: 1 }, { nbf: Math.floor(Date.now() / 1000) + 1000 }]) {
        assert.throws(() => verifyToken(jwt.sign({ ...base, ...patch }, config.secret)));
    }
    for (const algorithm of ['HS384', 'HS512', 'none']) {
        assert.throws(() => verifyToken(jwt.sign(base, config.secret, { algorithm })));
    }
    assert.throws(() => verifyToken(jwt.sign(base, randomBytes(48))));
    assert.throws(() => verifyToken('malformed'));
});

test('user password is excluded by default and revocation indexes use jti/actual expiry', () => {
    assert.equal(users.schema.path('password').options.select, false);
    assert.equal(revoked.schema.path('token'), undefined);
    assert.ok(revoked.schema.indexes().some(([fields, options]) => fields.jti === 1 && options.unique));
    assert.ok(revoked.schema.indexes().some(([fields, options]) => fields.expiresAt === 1 && options.expireAfterSeconds === 0));
});

test('registration hashes at cost 12 without trimming password and returns sanitized user', async t => {
    t.mock.method(users, 'findOne', async () => null);
    let stored;
    t.mock.method(users, 'create', async data => { stored = data; return { ...data, _id: userId }; });
    const res = response();
    await controller.registerUser({ body: { username: 'Candidate', email: 'candidate@example.com', password: ' password ' } }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(bcrypt.getRounds(stored.password), 12);
    assert.equal(await bcrypt.compare(' password ', stored.password), true);
    assert.equal(await bcrypt.compare('password', stored.password), false);
    assert.deepEqual(res.body.user, { id: userId, username: user.username, email: user.email });
    assert.equal(res.cookies[0][2].secure, true);
    assert.equal(res.cookies[0][2].httpOnly, true);
    assert.equal(verifyToken(res.cookies[0][1]).expiresAt.toISOString(), res.body.sessionExpiresAt);
});

test('login explicitly selects password; wrong password and unknown user have the same response', async t => {
    const hash = await bcrypt.hash(' password ', 12);
    let foundUser = { ...user, password: hash };
    t.mock.method(users, 'findOne', () => ({ select: async selection => {
        assert.equal(selection, '+password');
        return foundUser;
    } }));
    const good = response();
    await controller.loginUser({ body: { email: user.email, password: ' password ' } }, good);
    assert.equal(good.statusCode, 200);
    assert.equal(good.body.user.password, undefined);
    await assert.rejects(
        controller.loginUser({ body: { email: user.email, password: 'wrong password' } }, response()),
        error => error.statusCode === 401 && error.code === 'INVALID_CREDENTIALS' && error.message === 'Invalid credentials'
    );
    foundUser = null;
    await assert.rejects(
        controller.loginUser({ body: { email: user.email, password: 'wrong password' } }, response()),
        error => error.statusCode === 401 && error.code === 'INVALID_CREDENTIALS' && error.message === 'Invalid credentials'
    );
});

test('logout stores only jti/expiry, is idempotent, and blocks subsequent token use', async t => {
    const token = createToken(userId);
    const session = verifyToken(token);
    const records = new Map();
    t.mock.method(revoked, 'updateOne', async (filter, update, options) => {
        assert.deepEqual(filter, { jti: session.sessionId });
        assert.deepEqual(update, { $setOnInsert: { jti: session.sessionId, expiresAt: session.expiresAt } });
        assert.equal(options.upsert, true);
        records.set(filter.jti, update.$setOnInsert);
    });
    t.mock.method(revoked, 'exists', async filter => records.has(filter.jti));
    const req = { cookies: { token } };
    let passed = false;
    await authMiddleware(req, response(), () => { passed = true; });
    assert.equal(passed, true);
    assert.deepEqual(req.user, session);
    for (let i = 0; i < 2; i++) {
        const res = response();
        await controller.logoutUser(req, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(res.cleared[0], ['token', getClearCookieOptions()]);
    }
    assert.equal(records.size, 1);
    let denied;
    await authMiddleware(req, response(), error => { denied = error; });
    assert.equal(denied.statusCode, 401);
});

test('missing, malformed and expired logout cookies succeed without a database write', async t => {
    t.mock.method(revoked, 'updateOne', () => assert.fail('invalid token persisted'));
    const expired = jwt.sign({ sub: userId, jti: randomUUID(), iss: config.issuer, aud: config.audience, exp: 1 }, config.secret);
    for (const token of [undefined, 'malformed', expired]) {
        const res = response();
        await controller.logoutUser({ cookies: { token } }, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.cleared.length, 1);
    }
});

test('revocation database failures fail closed and logout still clears cookie', async t => {
    t.mock.method(revoked, 'exists', async () => { throw new Error('database offline'); });
    t.mock.method(revoked, 'updateOne', async () => { throw new Error('database offline'); });
    const req = { cookies: { token: createToken(userId) } };
    let middlewareError;
    await authMiddleware(req, response(), error => { middlewareError = error; });
    assert.equal(middlewareError.statusCode, 503);
    const logout = response();
    await assert.rejects(controller.logoutUser(req, logout), error => error.statusCode === 503);
    assert.equal(logout.cleared.length, 1);
});

test('get-me returns no password and clears a stale cookie if the user was deleted', async t => {
    let foundUser = user;
    t.mock.method(users, 'findById', () => ({ select: async () => foundUser }));
    const req = { user: verifyToken(createToken(userId)) };
    const good = response();
    await controller.getMeController(req, good);
    assert.equal(good.statusCode, 200);
    assert.equal(good.body.user.password, undefined);
    foundUser = null;
    const stale = response();
    await assert.rejects(controller.getMeController(req, stale), error => error.statusCode === 401);
    assert.equal(stale.cleared.length, 1);
});

test('only POST logout is registered and get-me remains protected', () => {
    const router = require('../src/routes/auth.routes');
    const logout = router.stack.filter(layer => layer.route?.path === '/logout');
    assert.equal(logout.length, 1);
    assert.deepEqual(Object.keys(logout[0].route.methods), ['post']);
    const getMe = router.stack.find(layer => layer.route?.path === '/get-me');
    assert.equal(getMe.route.stack[0].handle, authMiddleware);
});
