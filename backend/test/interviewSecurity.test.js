const test = require('node:test');
const assert = require('node:assert/strict');
const controller = require('../src/controllers/interview.controller');
const Model = require('../src/models/interviewReport.model');
const ai = require('../src/services/ai.service');
const parser = require('../src/services/pdfText.service');
const fixture = require('../test-support/content');
const L = require('../src/config/contentLimits');
const userA = '507f1f77bcf86cd799439011';
const userB = '507f1f77bcf86cd799439012';
const reportId = '507f1f77bcf86cd799439013';
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }

test('both report and resume queries scope ownership and deny another user before AI', async t => {
    t.mock.method(ai, 'generateResumePDF', () => assert.fail('unauthorized report sent to AI'));
    t.mock.method(Model, 'findOne', query => {
        assert.deepEqual(query, { _id: reportId, userId: userA });
        return {
            select() { return this; },
            async lean() { return null; },
            then(resolve) { resolve(null); }
        }; // The document belongs to B, so an owner-scoped database query won't match.
    });
    for (const [handler, key] of [[controller.getInterviewReportById, 'interviewId'], [controller.generateResumePDFController, 'interviewReportId']]) {
        await assert.rejects(
            handler({ params: { [key]: reportId }, user: { id: userA } }, response()),
            error => error.statusCode === 404 && error.code === 'REPORT_NOT_FOUND'
        );
    }
});

test('generation uses authenticated ownership and rejects model mass assignment', async t => {
    t.mock.method(parser, 'extractResumeText', async () => fixture.profile.resume);
    let generated = fixture.report();
    t.mock.method(ai, 'generateInterviewReport', async input => { assert.deepEqual(input, fixture.profile); return generated; });
    let writes = 0;
    t.mock.method(Model, 'create', async data => { writes++; assert.equal(data.userId, userA); return data; });
    const req = { file: fixture.pdf(), body: { ...fixture.profile, userId: userB }, user: { id: userA } };
    const res = response();
    await controller.generateInterviewReport(req, res);
    assert.equal(res.statusCode, 201);
    for (const field of ['resume', 'jobDescription', 'selfDescription']) {
        assert.equal(res.body.interviewReport[field], undefined);
    }
    generated = { ...fixture.report(), userId: userB };
    await assert.rejects(controller.generateInterviewReport(req, response()));
    assert.equal(writes, 1);
});

test('oversized request fields are rejected before parsing or AI', async t => {
    t.mock.method(parser, 'extractResumeText', () => assert.fail('oversized field reached parsing'));
    for (const [field, max] of [['jobDescription', L.jobChars], ['selfDescription', L.selfChars]]) {
        await assert.rejects(controller.generateInterviewReport({ file: fixture.pdf(), body: { ...fixture.profile, [field]: 'x'.repeat(max + 1) }, user: { id: userA } }, response()), error => error.status === 413);
    }
});

test('Mongoose enforces maximum stored string and nested-array sizes', async () => {
    const valid = { ...fixture.report(), ...fixture.profile, userId: userA };
    await new Model(valid).validate();
    await assert.rejects(new Model({ ...valid, resume: 'x'.repeat(L.resumeChars + 1) }).validate());
    await assert.rejects(new Model({ ...valid, technicalQuestions: Array(L.questions + 1).fill(valid.technicalQuestions[0]) }).validate());
    const bad = fixture.report(); bad.preparationPlan[0].tasks = Array(L.tasks + 1).fill('A task to do');
    await assert.rejects(new Model({ ...valid, preparationPlan: bad.preparationPlan }).validate());
});
