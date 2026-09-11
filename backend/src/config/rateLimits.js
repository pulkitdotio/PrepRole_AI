const MINUTE = 60 * 1000;

function createRateLimitConfig(env = process.env) {
    const production = env.NODE_ENV === 'production';
    return Object.freeze({
        general: Object.freeze({ windowMs: 15 * MINUTE, limit: production ? 300 : 1000 }),
        login: Object.freeze({ windowMs: 15 * MINUTE, limit: production ? 10 : 50 }),
        register: Object.freeze({ windowMs: 60 * MINUTE, limit: production ? 5 : 30 }),
        expensive: Object.freeze({ windowMs: 60 * MINUTE, limit: production ? 10 : 100 })
    });
}

module.exports = { createRateLimitConfig, rateLimits: createRateLimitConfig() };
