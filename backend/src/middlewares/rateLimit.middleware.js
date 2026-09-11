const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { rateLimits } = require('../config/rateLimits');

function responseHandler(message) {
    return (req, res) => res.status(429).json({
        message,
        error: { code: 'RATE_LIMITED', message },
        ...(req.id ? { requestId: req.id } : {})
    });
}

function createLimiter(settings, options = {}) {
    return rateLimit({
        windowMs: settings.windowMs,
        limit: settings.limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        passOnStoreError: false,
        ...options
    });
}

function createGeneralLimiter(settings = rateLimits.general) {
    return createLimiter(settings, {
        skip: req => req.method === 'OPTIONS',
        handler: responseHandler('Too many requests. Please try again later.')
    });
}

function createLoginLimiter(settings = rateLimits.login) {
    return createLimiter(settings, {
        skipSuccessfulRequests: true,
        handler: responseHandler('Too many login attempts. Please try again later.')
    });
}

function createRegisterLimiter(settings = rateLimits.register) {
    return createLimiter(settings, {
        handler: responseHandler('Too many registration attempts. Please try again later.')
    });
}

function expensiveKey(req) {
    if (req.user?.id) return `user:${req.user.id}`;
    return `ip:${ipKeyGenerator(req.ip)}`;
}

function createExpensiveLimiter(settings = rateLimits.expensive) {
    return createLimiter(settings, {
        keyGenerator: expensiveKey,
        handler: responseHandler('AI generation limit reached. Please try again later.')
    });
}

const generalApiLimiter = createGeneralLimiter();
const loginLimiter = createLoginLimiter();
const registerLimiter = createRegisterLimiter();
const expensiveOperationLimiter = createExpensiveLimiter();

module.exports = {
    createGeneralLimiter,
    createLoginLimiter,
    createRegisterLimiter,
    createExpensiveLimiter,
    expensiveKey,
    generalApiLimiter,
    loginLimiter,
    registerLimiter,
    expensiveOperationLimiter
};
