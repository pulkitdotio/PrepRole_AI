const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { requestId, requestLogger } = require('../src/middlewares/request.middleware');
const { notFound, errorHandler } = require('../src/middlewares/error.middleware');

async function start(app, t) {
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
    });
    t.after(() => new Promise(resolve => server.close(resolve)));
    return `http://127.0.0.1:${server.address().port}`;
}

test('request IDs are unique and correlate JSON 404 responses', async t => {
    const app = express();
    app.use(requestId);
    app.use(notFound);
    app.use(errorHandler);
    const base = await start(app, t);
    const first = await fetch(base + '/missing');
    const second = await fetch(base + '/missing');
    const firstBody = await first.json();
    assert.match(first.headers.get('x-request-id'), /^[0-9a-f-]{36}$/);
    assert.notEqual(first.headers.get('x-request-id'), second.headers.get('x-request-id'));
    assert.equal(firstBody.requestId, first.headers.get('x-request-id'));
    assert.equal(firstBody.message, 'Route not found');
    assert.equal(firstBody.error.code, 'ROUTE_NOT_FOUND');
});

test('unexpected errors return no stack, path, database detail or original message', async t => {
    const app = express();
    app.use(requestId);
    app.get('/explode', () => {
        throw new Error('Mongo failed at C:\\private\\server.js using mongodb://secret');
    });
    app.use(errorHandler);
    const base = await start(app, t);
    const response = await fetch(base + '/explode');
    const text = await response.text();
    const body = JSON.parse(text);
    assert.equal(response.status, 500);
    assert.equal(body.error.code, 'INTERNAL_ERROR');
    assert.equal(body.requestId, response.headers.get('x-request-id'));
    for (const leaked of ['stack', 'private', 'mongodb', 'secret']) {
        assert.equal(text.toLowerCase().includes(leaked), false);
    }
});

test('structured request logging records metadata without request bodies', async t => {
    const records = [];
    t.mock.method(console, 'log', value => records.push(value));
    const app = express();
    app.use(requestId);
    app.use(requestLogger);
    app.use(express.json());
    app.post('/login', (req, res) => res.sendStatus(204));
    const base = await start(app, t);
    await fetch(base + '/login?tracking=private', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'never-log-this' })
    });
    assert.equal(records.length, 1);
    const logged = records[0];
    assert.equal(logged.includes('never-log-this'), false);
    assert.equal(logged.includes('tracking=private'), false);
    const record = JSON.parse(logged);
    assert.equal(record.event, 'http.request');
    assert.equal(record.path, '/login');
    assert.equal(record.status, 204);
});
