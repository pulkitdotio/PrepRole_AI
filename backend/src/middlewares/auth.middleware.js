const revokedTokenModel = require('../models/revokedToken.model');
const { getAuthConfig, getClearCookieOptions } = require('../config/auth');
const { verifyToken, isInvalidToken } = require('../utils/token');
const AppError = require('../utils/appError');
const userModel = require('../models/user.model');

async function authUser(req, res, next) {
    const unauthorized = () => {
        res.clearCookie(getAuthConfig().cookieName, getClearCookieOptions());
        return next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required'));
    };
    try {
        const token = req.cookies?.[getAuthConfig().cookieName];

        if (!token) {
            return unauthorized();
        }

        const session = verifyToken(token);
        const [isBlacklisted, userExists] = await Promise.all([
            revokedTokenModel.exists({ jti: session.sessionId }),
            userModel.exists({ _id: session.id })
        ]);

        if (isBlacklisted || !userExists) {
            return unauthorized();
        }

        req.user = session;

        next();
    } catch (error) {
        if (isInvalidToken(error)) return unauthorized();
        return next(new AppError(503, 'AUTHENTICATION_UNAVAILABLE', 'Authentication temporarily unavailable'));
    }
}

module.exports = authUser;
