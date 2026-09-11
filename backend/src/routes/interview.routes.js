const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middlewares/file.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
    createInterviewBodySchema,
    interviewReportParamsSchema,
    resumePdfParamsSchema
} = require('../schemas/interview.schemas');

const interviewRouter = express.Router();

interviewRouter.post(
    '/',
    authMiddleware,
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

interviewRouter.get(
    '/',
    authMiddleware,
    interviewController.getAllInterviewReports
);

interviewRouter.post(
    '/resume/pdf/:interviewReportId',
    authMiddleware,
    validate({ params: resumePdfParamsSchema }),
    interviewController.generateResumePDFController
);

module.exports = interviewRouter;
