const REPORT_LIST_FIELDS = '_id title matchScore createdAt updatedAt';
const REPORT_DETAIL_FIELDS = [
    '_id', 'title', 'matchScore', 'technicalQuestions', 'behavioralQuestions',
    'skillGaps', 'preparationPlan', 'createdAt', 'updatedAt'
].join(' ');

function serializeCreatedReport(report) {
    return {
        _id: report._id,
        title: report.title,
        matchScore: report.matchScore,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
    };
}

module.exports = { REPORT_LIST_FIELDS, REPORT_DETAIL_FIELDS, serializeCreatedReport };
