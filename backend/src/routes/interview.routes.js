const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middlewares/file.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
    createInterviewBodySchema,
    interviewReportParamsSchema,
    resumePdfParamsSchema,
    interviewHistoryQuerySchema
} = require('../schemas/interview.schemas');
const { expensiveOperationLimiter } = require('../middlewares/rateLimit.middleware');

const interviewRouter = express.Router();

interviewRouter.post(
    '/',
    authMiddleware,
    expensiveOperationLimiter,
    upload.single('resume'),
    validate({ body: createInterviewBodySchema }),
    interviewController.generateInterviewReport
);

interviewRouter.get(
    '/report/:interviewId',
    authMiddleware,
    validate({ params: interviewReportParamsSchema }),
    interviewController.getInterviewReportById
);

interviewRouter.delete(
    '/report/:interviewId',
    authMiddleware,
    validate({ params: interviewReportParamsSchema }),
    interviewController.deleteInterviewReport
);

interviewRouter.get(
    '/stats',
    authMiddleware,
    interviewController.getInterviewStats
);

interviewRouter.get(
    '/',
    authMiddleware,
    validate({ query: interviewHistoryQuerySchema }),
    interviewController.getAllInterviewReports
);

interviewRouter.post(
    '/resume/pdf/:interviewReportId',
    authMiddleware,
    expensiveOperationLimiter,
    validate({ params: resumePdfParamsSchema }),
    interviewController.generateResumePDFController
);

module.exports = interviewRouter;
