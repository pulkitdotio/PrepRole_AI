const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { createReadinessHandler } = require('../src/controllers/health.controller');
const { createShutdownController, installProcessHandlers } = require('../src/serverLifecycle');

function response() {
    return {
        statusCode: 200,
        status(value) { this.statusCode = value; return this; },
        json(value) { this.body = value; return this; }
    };
}

test('readiness reports both connected and unavailable database states', () => {
    const ready = response();
    createReadinessHandler(() => true)({}, ready);
    assert.equal(ready.statusCode, 200);
    assert.deepEqual(ready.body, { status: 'ready' });

    const unavailable = response();
    createReadinessHandler(() => false)({}, unavailable);
    assert.equal(unavailable.statusCode, 503);
    assert.deepEqual(unavailable.body, { status: 'not_ready', message: 'Service is not ready' });
});

test('shutdown stops HTTP, disconnects Mongo, exits once, and is idempotent', async t => {
    t.mock.method(console, 'log', () => {});
    const calls = [];
    const server = {
        listening: true,
        close(callback) { calls.push('http'); this.listening = false; callback(); },
        closeIdleConnections() { calls.push('idle'); }
    };
    const shutdown = createShutdownController({
        server,
        disconnect: async () => calls.push('mongo'),
        exit: code => calls.push(`exit:${code}`),
        timeoutMs: 100
    });
    await Promise.all([shutdown('SIGTERM'), shutdown('SIGINT')]);
    assert.deepEqual(calls, ['http', 'idle', 'mongo', 'exit:0']);
});

test('fatal process events request an error shutdown', async () => {
    const processObject = new EventEmitter();
    const calls = [];
    installProcessHandlers((reason, code) => calls.push({ reason, code }), processObject);
    processObject.emit('unhandledRejection', new Error('secret detail'));
    assert.deepEqual(calls, [{ reason: 'unhandledRejection', code: 1 }]);
});
