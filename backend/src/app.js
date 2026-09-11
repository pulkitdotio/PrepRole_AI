const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { getAuthConfig } = require('./config/auth');
const { getAllowedOrigins } = require('./config/origins');
const { protectOrigin } = require('./middlewares/origin.middleware');
const AppError = require('./utils/appError');
const { generalApiLimiter } = require('./middlewares/rateLimit.middleware');
const { createHelmetConfig } = require('./config/httpSecurity');
const { requestId, requestLogger } = require('./middlewares/request.middleware');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { liveness, createReadinessHandler } = require('./controllers/health.controller');

// Validate before loading routes or opening a database/listening socket.
getAuthConfig();
const allowedOrigins = getAllowedOrigins();

const authRouter = require('./routes/auth.routes');
const interviewRouter = require('./routes/interview.routes');

const app = express();
app.disable('x-powered-by');

if (process.env.NODE_ENV === 'production') {
    // Intended topology: exactly one trusted reverse proxy in front of Express.
    app.set('trust proxy', 1);
}

app.use(requestId);
app.use(requestLogger);
app.use(helmet(createHelmetConfig()));
app.use(protectOrigin);

app.use(
    cors({
        origin: (origin, callback) => {
            
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'CORS policy blocked this request'));
        },
        credentials: true
    })
);

// Current JSON endpoints only carry credentials; resume uploads use Multer.
app.use(express.json({ limit: '32kb' }));

app.use(cookieParser());

app.get('/health', liveness);
app.get('/ready', createReadinessHandler());

app.use('/api', generalApiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
