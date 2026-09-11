const mongoose = require('mongoose');
const { z } = require('zod');
const L = require('../config/contentLimits');
const pagination = require('../config/pagination');

const requiredText = (label, maximum) => z.string()
    .min(1, `${label} is required`)
    .max(maximum, `${label} must be ${maximum} characters or fewer`);

const createInterviewBodySchema = z.strictObject({
    jobDescription: requiredText('Job description', L.jobChars),
    selfDescription: requiredText('Self description', L.selfChars)
});

const objectId = z.string().refine(
    value => mongoose.isObjectIdOrHexString(value),
    'Invalid interview report ID'
);

const interviewReportParamsSchema = z.strictObject({ interviewId: objectId });
const resumePdfParamsSchema = z.strictObject({ interviewReportId: objectId });
const interviewHistoryQuerySchema = z.strictObject({
    page: z.coerce.number().int().min(1).default(pagination.interviewDefaultPage),
    limit: z.coerce.number().int().min(1).max(pagination.interviewMaximumLimit)
        .default(pagination.interviewDefaultLimit)
});

module.exports = {
    createInterviewBodySchema,
    interviewReportParamsSchema,
    resumePdfParamsSchema,
    interviewHistoryQuerySchema
};
