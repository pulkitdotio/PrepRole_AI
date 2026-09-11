const limits = require('../config/contentLimits');
const AppError = require('./appError');

class ContentError extends AppError {
    constructor(status, message) {
        super(status, status === 413 ? 'CONTENT_TOO_LARGE' : 'INVALID_CONTENT', message);
        this.name = 'ContentError';
        this.status = status;
    }
}

// Filenames, metadata, extracted text and model strings are untrusted, never code.
function normalizeText(value, max, label) {
    if (typeof value !== 'string') throw new ContentError(400, `${label} must be text`);
    if (value.length > max) throw new ContentError(413, `${label} is too long (maximum ${max} characters)`);
    const text = value.replace(/\r\n?/g, '\n')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, '')
        .replace(/[\t ]+$/gm, '').replace(/\n{4,}/g, '\n\n\n').trim();
    if (!text) throw new ContentError(400, `${label} is required`);
    return text;
}

function normalizeProfile(input) {
    return {
        resume: normalizeText(input.resume, limits.resumeChars, 'Resume text'),
        jobDescription: normalizeText(input.jobDescription, limits.jobChars, 'Job description'),
        selfDescription: normalizeText(input.selfDescription, limits.selfChars, 'Self description')
    };
}

module.exports = { ContentError, normalizeText, normalizeProfile };
