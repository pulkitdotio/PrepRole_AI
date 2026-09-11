const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const revokedTokenModel = require('../models/revokedToken.model');
const { getAuthConfig, getCookieOptions, getClearCookieOptions } = require('../config/auth');
const { createToken, verifyToken, isInvalidToken } = require('../utils/token');
const AppError = require('../utils/appError');
const InterviewReportModel = require('../models/interviewReport.model');

function issueSession(res, user) {
    const token = createToken(user._id.toString());
    const session = verifyToken(token);
    res.cookie(getAuthConfig().cookieName, token, getCookieOptions());
    return session.expiresAt.toISOString();
}

function sanitizeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email
    };
}

function duplicateRegistrationError(error) {
    if (error?.code !== 11000) return null;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    if (field === 'email') return new AppError(409, 'EMAIL_EXISTS', 'Email is already registered');
    if (field === 'username') return new AppError(409, 'USERNAME_EXISTS', 'Username is already taken');
    return new AppError(409, 'ACCOUNT_EXISTS', 'An account with those details already exists');
}

async function registerUser(req, res) {
    const { username, email, password } = req.body;

    const existingUser = await userModel.findOne({
        $or: [
            { email },
            { username }
        ]
    });

    if (existingUser) {
        if (existingUser.email === email) {
            throw new AppError(409, 'EMAIL_EXISTS', 'Email is already registered');
        }

        throw new AppError(409, 'USERNAME_EXISTS', 'Username is already taken');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let newUser;
    try {
        newUser = await userModel.create({ username, email, password: hashedPassword });
    } catch (error) {
        throw duplicateRegistrationError(error) || error;
    }

    const sessionExpiresAt = issueSession(res, newUser);

    return res.status(201).json({
        message: 'User registered successfully',
        user: sanitizeUser(newUser),
        sessionExpiresAt
    });
}

async function loginUser(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    const sessionExpiresAt = issueSession(res, user);

    return res.status(200).json({
        message: 'Login successful',
        user: sanitizeUser(user),
        sessionExpiresAt
    });
}

async function logoutUser(req, res) {
    const token = req.cookies?.[getAuthConfig().cookieName];
    res.clearCookie(getAuthConfig().cookieName, getClearCookieOptions());

    if (token) {
        try {
            const session = verifyToken(token);
            await revokedTokenModel.updateOne(
                { jti: session.sessionId },
                { $setOnInsert: { jti: session.sessionId, expiresAt: session.expiresAt } },
                { upsert: true }
            );
        } catch (error) {
            // Concurrent upserts and already-invalid cookies are safe repeat logouts.
            if (!isInvalidToken(error) && error.code !== 11000) {
                throw new AppError(503, 'SESSION_REVOCATION_FAILED', 'Unable to revoke session. Local cookie cleared.');
            }
        }
    }

    return res.status(200).json({
        message: 'Logout successful'
    });
}

async function getMeController(req, res) {
    const user = await userModel
        .findById(req.user.id)
        .select('_id username email');

    if (!user) {
        res.clearCookie(getAuthConfig().cookieName, getClearCookieOptions());
        throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication required');
    }

    return res.status(200).json({
        message: 'User fetched successfully',
        user: sanitizeUser(user),
        sessionExpiresAt: req.user.expiresAt.toISOString()
    });
}

async function deleteAccount(req, res) {
    const user = await userModel.findById(req.user.id).select('+password');
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid credentials');
    }

    try {
        await InterviewReportModel.deleteMany({ userId: req.user.id });
        await revokedTokenModel.updateOne(
            { jti: req.user.sessionId },
            { $setOnInsert: { jti: req.user.sessionId, expiresAt: req.user.expiresAt } },
            { upsert: true }
        );
        const result = await userModel.deleteOne({ _id: req.user.id });
        if (result.deletedCount !== 1) {
            throw new Error('Account disappeared during deletion');
        }
    } catch (error) {
        if (error.code === 11000) {
            // A concurrent revocation insert still means this session is revoked.
            const result = await userModel.deleteOne({ _id: req.user.id });
            if (result.deletedCount === 1) {
                res.clearCookie(getAuthConfig().cookieName, getClearCookieOptions());
                return res.status(200).json({ message: 'Account deleted successfully' });
            }
        }
        throw new AppError(503, 'ACCOUNT_DELETION_FAILED', 'Unable to delete account. Please try again.');
    }

    res.clearCookie(getAuthConfig().cookieName, getClearCookieOptions());
    return res.status(200).json({ message: 'Account deleted successfully' });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMeController,
    deleteAccount,
    duplicateRegistrationError
};
