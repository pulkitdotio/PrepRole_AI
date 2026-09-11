const AppError = require('../utils/appError');
const logger = require('../utils/logger');

function notFound(req, res, next) {
    next(new AppError(404, 'ROUTE_NOT_FOUND', 'Route not found'));
}

function normalizeError(error) {
    if (error instanceof AppError) return error;
    if (error.type === 'entity.too.large') {
        return new AppError(413, 'BODY_TOO_LARGE', 'Request body is too large');
    }
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return new AppError(400, 'INVALID_JSON', 'Request body contains invalid JSON');
    }
    if (error.name === 'MulterError') {
        if (error.code === 'LIMIT_FIELD_VALUE') {
            return new AppError(413, 'CONTENT_TOO_LARGE', 'Resume upload text fields are too large');
        }
        if (error.code === 'LIMIT_FILE_SIZE') {
            return new AppError(413, 'CONTENT_TOO_LARGE', 'Resume file must be smaller than 3MB');
        }
        return new AppError(400, 'INVALID_UPLOAD', 'Invalid or oversized resume upload fields');
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
        return new AppError(400, 'VALIDATION_ERROR', 'Validation failed');
    }
    if (error.code === 11000) {
        return new AppError(409, 'CONFLICT', 'An account with those details already exists');
    }
    return new AppError(500, 'INTERNAL_ERROR', 'Internal server error');
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);
    const normalized = normalizeError(error);
    if (normalized.statusCode >= 500) {
        logger.error('http.request_failed', {
            requestId: req.id,
            errorType: error.name || 'Error',
            safeMessage: normalized.message
        });
    }
    return res.status(normalized.statusCode).json({
        message: normalized.message,
        error: {
            code: normalized.code,
            message: normalized.message,
            ...(normalized.details ? { details: normalized.details } : {})
        },
        ...(req.id ? { requestId: req.id } : {})
    });
}

module.exports = { notFound, normalizeError, errorHandler };
