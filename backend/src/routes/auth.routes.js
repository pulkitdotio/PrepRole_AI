const express = require('express');

const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { registerBodySchema, loginBodySchema } = require('../schemas/auth.schemas');
const { loginLimiter, registerLimiter } = require('../middlewares/rateLimit.middleware');

const authRouter = express.Router();

authRouter.post(
    '/register',
    registerLimiter,
    validate({ body: registerBodySchema }),
    authController.registerUser
);

authRouter.post(
    '/login',
    loginLimiter,
    validate({ body: loginBodySchema }),
    authController.loginUser
);

authRouter.post(
    '/logout',
    authController.logoutUser
);

authRouter.get(
    '/get-me',
    authMiddleware,
    authController.getMeController
);

module.exports = authRouter;
