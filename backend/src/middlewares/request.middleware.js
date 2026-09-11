const { randomUUID } = require('node:crypto');
const logger = require('../utils/logger');

function requestId(req, res, next) {
    req.id = randomUUID();
    res.set('X-Request-Id', req.id);
    next();
}

function requestLogger(req, res, next) {
    const startedAt = process.hrtime.bigint();
    res.once('finish', () => {
        logger.info('http.request', {
            requestId: req.id,
            method: req.method,
            path: req.originalUrl.split('?')[0],
            status: res.statusCode,
            durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
            ...(req.user?.id ? { userId: String(req.user.id) } : {})
        });
    });
    next();
}

module.exports = { requestId, requestLogger };
