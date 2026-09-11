const test = require('node:test');
const assert = require('node:assert/strict');
const Model = require('../src/models/interviewReport.model');
const controller = require('../src/controllers/interview.controller');
const { interviewHistoryQuerySchema } = require('../src/schemas/interview.schemas');
const { REPORT_LIST_FIELDS, REPORT_DETAIL_FIELDS } = require('../src/utils/interviewProjection');

const userId = '507f1f77bcf86cd799439011';
const reportId = '507f1f77bcf86cd799439013';
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }

function historyQuery(result, capture) {
    return {
        select(value) { capture.select = value; return this; },
        sort(value) { capture.sort = value; return this; },
        skip(value) { capture.skip = value; return this; },
        limit(value) { capture.limit = value; return this; },
        async lean() { capture.lean = true; return result; }
    };
}

test('history pagination schema defaults and bounds page sizes', () => {
    assert.deepEqual(interviewHistoryQuerySchema.parse({}), { page: 1, limit: 10 });
    assert.deepEqual(interviewHistoryQuerySchema.parse({ page: '3', limit: '50' }), { page: 3, limit: 50 });
    for (const query of [{ page: '0' }, { page: '-1' }, { page: 'x' }, { limit: '0' }, { limit: '51' }, { limit: '100000' }]) {
        assert.equal(interviewHistoryQuerySchema.safeParse(query).success, false);
    }
});

test('history uses owner scope, newest-first projection, lean pagination and metadata', async t => {
    const capture = {};
    const reports = [{ _id: reportId, title: 'Role', matchScore: 82, createdAt: new Date() }];
    t.mock.method(Model, 'find', filter => {
        capture.filter = filter;
        return historyQuery(reports, capture);
    });
    t.mock.method(Model, 'countDocuments', async filter => {
        assert.deepEqual(filter, { userId });
        return 42;
    });
    const res = response();
    await controller.getAllInterviewReports({ user: { id: userId }, query: { page: 2, limit: 10 } }, res);
    assert.deepEqual(capture.filter, { userId });
    assert.equal(capture.select, REPORT_LIST_FIELDS);
    assert.deepEqual(capture.sort, { createdAt: -1 });
    assert.equal(capture.skip, 10);
    assert.equal(capture.limit, 10);
    assert.equal(capture.lean, true);
    assert.deepEqual(res.body.pagination, {
        page: 2, limit: 10, totalItems: 42, totalPages: 5,
        hasNextPage: true, hasPreviousPage: true
    });
    for (const field of ['resume', 'jobDescription', 'selfDescription', 'technicalQuestions', 'behavioralQuestions', 'skillGaps', 'preparationPlan']) {
        assert.equal(REPORT_LIST_FIELDS.includes(field), false);
    }
});

test('page beyond the end returns an empty list with stable metadata', async t => {
    t.mock.method(Model, 'find', () => historyQuery([], {}));
    t.mock.method(Model, 'countDocuments', async () => 11);
    const res = response();
    await controller.getAllInterviewReports({ user: { id: userId }, query: { page: 9, limit: 10 } }, res);
    assert.deepEqual(res.body.interviewReports, []);
    assert.deepEqual(res.body.pagination, {
        page: 9, limit: 10, totalItems: 11, totalPages: 2,
        hasNextPage: false, hasPreviousPage: true
    });
});

test('dashboard stats aggregate only the authenticated owner and handle empty data', async t => {
    let result = [];
    t.mock.method(Model, 'aggregate', async pipeline => {
        assert.equal(pipeline[0].$match.userId.toString(), userId);
        assert.deepEqual(pipeline[1].$group, {
            _id: null,
            totalInterviews: { $sum: 1 },
            averageMatchScore: { $avg: '$matchScore' },
            bestMatchScore: { $max: '$matchScore' }
        });
        return result;
    });
    const empty = response();
    await controller.getInterviewStats({ user: { id: userId } }, empty);
    assert.deepEqual(empty.body.stats, {
        totalInterviews: 0, completedInterviews: 0,
        averageMatchScore: null, bestMatchScore: null
    });
    result = [{ totalInterviews: 3, averageMatchScore: 81.6, bestMatchScore: 94 }];
    const populated = response();
    await controller.getInterviewStats({ user: { id: userId } }, populated);
    assert.deepEqual(populated.body.stats, {
        totalInterviews: 3, completedInterviews: 3,
        averageMatchScore: 82, bestMatchScore: 94
    });
});

test('report detail projection omits retained source profile fields', async t => {
    const report = { _id: reportId, title: 'Role', technicalQuestions: [] };
    let selected;
    t.mock.method(Model, 'findOne', filter => ({
        select(fields) { selected = fields; assert.deepEqual(filter, { _id: reportId, userId }); return this; },
        async lean() { return report; }
    }));
    const res = response();
    await controller.getInterviewReportById({ params: { interviewId: reportId }, user: { id: userId } }, res);
    assert.equal(selected, REPORT_DETAIL_FIELDS);
    for (const field of ['resume', 'jobDescription', 'selfDescription']) {
        assert.equal(selected.includes(field), false);
        assert.equal(res.body.interviewReport[field], undefined);
    }
});
