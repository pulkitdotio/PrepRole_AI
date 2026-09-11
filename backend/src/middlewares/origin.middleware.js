const { getAllowedOrigins } = require('../config/origins');
const AppError = require('../utils/appError');

function isTrustedRequest(req, allowedOrigins) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;

    const origin = req.get('Origin');
    // An explicitly untrusted (including "null") Origin cannot fall back to Referer.
    if (origin !== undefined) return allowedOrigins.includes(origin);

    const referer = req.get('Referer');
    if (referer) {
        try {
            const url = new URL(referer);
            return !url.username && !url.password && allowedOrigins.includes(url.origin);
        } catch {
            return false;
        }
    }
    // No host/proxy-header inference: non-browser clients must also send a trusted Origin.
    return false;
}

function protectOrigin(req, res, next) {
    if (!isTrustedRequest(req, getAllowedOrigins())) {
        return next(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Request origin is not trusted'));
    }
    next();
}

module.exports = { isTrustedRequest, protectOrigin };
