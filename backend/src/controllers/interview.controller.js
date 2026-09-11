const aiService = require('../services/ai.service');
const pdfText = require('../services/pdfText.service');
const { interviewReportSchema } = require('../services/ai.schemas');
const { normalizeText } = require('../utils/content');
const L = require('../config/contentLimits');
const InterviewReportModel = require('../models/interviewReport.model');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const {
    REPORT_LIST_FIELDS,
    REPORT_DETAIL_FIELDS,
    serializeCreatedReport
} = require('../utils/interviewProjection');

// Request fields and AI output never choose ownership. Every resource query includes userId.
async function generateInterviewReport(req, res) {
    pdfText.validatePdfUpload(req.file);
    const selfDescription = normalizeText(req.body?.selfDescription, L.selfChars, 'Self description');
    const jobDescription = normalizeText(req.body?.jobDescription, L.jobChars, 'Job description');
    const resume = await pdfText.extractResumeText(req.file);
    const generated = await aiService.generateInterviewReport({ resume, selfDescription, jobDescription });
    const report = interviewReportSchema.parse(generated);
    const interviewReport = await InterviewReportModel.create({
        ...report, userId: req.user.id, resume, selfDescription, jobDescription
    });
    return res.status(201).json({
        message: 'Interview report generated successfully',
        interviewReport: serializeCreatedReport(interviewReport)
    });
}

async function getInterviewReportById(req, res) {
    const { interviewId } = req.params;
    const interviewReport = await InterviewReportModel
        .findOne({ _id: interviewId, userId: req.user.id })
        .select(REPORT_DETAIL_FIELDS)
        .lean();
    if (!interviewReport) throw new AppError(404, 'REPORT_NOT_FOUND', 'Interview report not found');
    return res.status(200).json({ interviewReport });
}

async function getAllInterviewReports(req, res) {
    const { page, limit } = req.query;
    const filter = { userId: req.user.id };
    const [interviewReports, totalItems] = await Promise.all([
        InterviewReportModel.find(filter)
            .select(REPORT_LIST_FIELDS)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        InterviewReportModel.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    return res.status(200).json({
        interviewReports,
        pagination: {
            page,
            limit,
            totalItems,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        }
    });
}

async function getInterviewStats(req, res) {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const [stats] = await InterviewReportModel.aggregate([
        { $match: { userId } },
        { $group: {
            _id: null,
            totalInterviews: { $sum: 1 },
            averageMatchScore: { $avg: '$matchScore' },
            bestMatchScore: { $max: '$matchScore' }
        } }
    ]);
    const totalInterviews = stats?.totalInterviews || 0;
    return res.status(200).json({
        stats: {
            totalInterviews,
            completedInterviews: totalInterviews,
            averageMatchScore: stats ? Math.round(stats.averageMatchScore) : null,
            bestMatchScore: stats?.bestMatchScore ?? null
        }
    });
}

async function generateResumePDFController(req, res) {
    const { interviewReportId } = req.params;
    const report = await InterviewReportModel.findOne({ _id: interviewReportId, userId: req.user.id });
    if (!report) throw new AppError(404, 'REPORT_NOT_FOUND', 'Interview report not found');
    const pdfBuffer = await aiService.generateResumePDF({
        resume: report.resume, jobDescription: report.jobDescription, selfDescription: report.selfDescription
    });
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_${interviewReportId}.pdf"`,
        'Content-Length': pdfBuffer.length
    });
    return res.send(pdfBuffer);
}

module.exports = {
    generateInterviewReport,
    getInterviewReportById,
    getAllInterviewReports,
    getInterviewStats,
    generateResumePDFController
};
