const test = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('../src/middlewares/validate.middleware');
const { registerBodySchema, loginBodySchema, deleteAccountBodySchema } = require('../src/schemas/auth.schemas');
const {
    createInterviewBodySchema,
    interviewReportParamsSchema,
    resumePdfParamsSchema
} = require('../src/schemas/interview.schemas');
const L = require('../src/config/contentLimits');

function validateRequest(schemas, request) {
    return new Promise(resolve => {
        validate(schemas)(request, {}, error => resolve(error));
    });
}

function fields(error) {
    return error.details.map(detail => detail.field);
}

test('registration validates and normalizes only allowlisted fields', async () => {
    const valid = { body: {
        username: '  Candidate  ',
        email: ' CANDIDATE@EXAMPLE.COM ',
        password: ' password '
    } };
    assert.equal(await validateRequest({ body: registerBodySchema }, valid), undefined);
    assert.deepEqual(valid.body, {
        username: 'Candidate',
        email: 'candidate@example.com',
        password: ' password '
    });

    for (const body of [
        { email: 'candidate@example.com', password: 'password' },
        { username: 'x'.repeat(51), email: 'candidate@example.com', password: 'password' },
        { username: 'Candidate', email: 'invalid', password: 'password' },
        { username: 'Candidate', email: 'candidate@example.com', password: 'short' },
        { username: 'Candidate', email: 'candidate@example.com', password: 'x'.repeat(129) },
        { username: 'Candidate', email: 'candidate@example.com', password: 'password', isAdmin: true }
    ]) {
        const error = await validateRequest({ body: registerBodySchema }, { body });
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'VALIDATION_ERROR');
        assert.ok(error.details.length > 0);
    }
});

test('login requires exactly email and password', async () => {
    for (const body of [{ email: 'candidate@example.com' }, { password: 'password' }]) {
        const error = await validateRequest({ body: loginBodySchema }, { body });
        assert.equal(error.statusCode, 400);
        assert.equal(error.message, 'Invalid request');
    }
});

test('account deletion accepts only an untrimmed bounded password', async () => {
    const valid = { body: { password: ' password ' } };
    assert.equal(await validateRequest({ body: deleteAccountBodySchema }, valid), undefined);
    assert.equal(valid.body.password, ' password ');
    for (const body of [{}, { password: 'short' }, { password: 'x'.repeat(129) }, { password: 'password', userId: 'attacker' }]) {
        const error = await validateRequest({ body: deleteAccountBodySchema }, { body });
        assert.equal(error.code, 'VALIDATION_ERROR');
    }
});

test('interview body enforces Phase 3 limits and rejects unknown properties', async () => {
    for (const [field, length] of [
        ['jobDescription', L.jobChars + 1],
        ['selfDescription', L.selfChars + 1]
    ]) {
        const body = { jobDescription: 'A role', selfDescription: 'A candidate', [field]: 'x'.repeat(length) };
        const error = await validateRequest({ body: createInterviewBodySchema }, { body });
        assert.equal(error.statusCode, 400);
        assert.ok(fields(error).includes(field));
    }
    const unknown = await validateRequest({ body: createInterviewBodySchema }, {
        body: { jobDescription: 'A role', selfDescription: 'A candidate', userId: 'attacker' }
    });
    assert.equal(unknown.code, 'VALIDATION_ERROR');
});

test('malformed report IDs are rejected before controllers', async () => {
    for (const [schema, params] of [
        [interviewReportParamsSchema, { interviewId: 'not-an-object-id' }],
        [resumePdfParamsSchema, { interviewReportId: 'not-an-object-id' }]
    ]) {
        const error = await validateRequest({ params: schema }, { params });
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'VALIDATION_ERROR');
    }
});
