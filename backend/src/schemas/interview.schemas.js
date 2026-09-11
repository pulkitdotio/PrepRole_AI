const mongoose = require('mongoose');
const { z } = require('zod');
const L = require('../config/contentLimits');

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

module.exports = {
    createInterviewBodySchema,
    interviewReportParamsSchema,
    resumePdfParamsSchema
};
