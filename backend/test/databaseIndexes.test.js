const test = require('node:test');
const assert = require('node:assert/strict');
const User = require('../src/models/user.model');
const InterviewReport = require('../src/models/interviewReport.model');
const RevokedToken = require('../src/models/revokedToken.model');
const { synchronizeIndexes } = require('../scripts/syncIndexes');

function hasIndex(model, fields, expected = {}) {
    return model.schema.indexes().some(([actualFields, options]) =>
        JSON.stringify(actualFields) === JSON.stringify(fields) &&
        Object.entries(expected).every(([key, value]) => options[key] === value)
    );
}

test('schemas define required unique, history, revocation and TTL indexes without redundant userId index', () => {
    assert.equal(hasIndex(User, { username: 1 }, { unique: true }), true);
    assert.equal(hasIndex(User, { email: 1 }, { unique: true }), true);
    assert.equal(hasIndex(InterviewReport, { userId: 1, createdAt: -1 }), true);
    assert.equal(hasIndex(InterviewReport, { userId: 1 }), false);
    assert.equal(hasIndex(RevokedToken, { jti: 1 }, { unique: true }), true);
    assert.equal(hasIndex(RevokedToken, { expiresAt: 1 }, { expireAfterSeconds: 0 }), true);
    assert.equal(User.schema.options.strict, 'throw');
});

test('index orchestration previews every model and only syncs outside check mode', async t => {
    t.mock.method(console, 'log', () => {});
    const calls = [];
    const model = name => ({
        modelName: name,
        async diffIndexes() { calls.push(`diff:${name}`); return { toCreate: [], toDrop: [] }; },
        async syncIndexes() { calls.push(`sync:${name}`); }
    });
    const models = [model('User'), model('InterviewReport')];
    await synchronizeIndexes({ models, checkOnly: true });
    assert.deepEqual(calls, ['diff:User', 'diff:InterviewReport']);
    calls.length = 0;
    await synchronizeIndexes({ models });
    assert.deepEqual(calls, ['diff:User', 'sync:User', 'diff:InterviewReport', 'sync:InterviewReport']);
});
