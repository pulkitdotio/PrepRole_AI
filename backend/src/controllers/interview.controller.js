const aiService = require('../services/ai.service');
const pdfText = require('../services/pdfText.service');
const { interviewReportSchema } = require('../services/ai.schemas');
const { normalizeText } = require('../utils/content');
const L = require('../config/contentLimits');
const InterviewReportModel = require('../models/interviewReport.model');
const AppError = require('../utils/appError');

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
    return res.status(201).json({ message: 'Interview report generated successfully', interviewReport });
}

async function getInterviewReportById(req, res) {
    const { interviewId } = req.params;
    const interviewReport = await InterviewReportModel.findOne({ _id: interviewId, userId: req.user.id });
    if (!interviewReport) throw new AppError(404, 'REPORT_NOT_FOUND', 'Interview report not found');
    return res.status(200).json({ interviewReport });
}

async function getAllInterviewReports(req, res) {
    const interviewReports = await InterviewReportModel.find({ userId: req.user.id })
        .sort({ createdAt: -1 }).select('-resume -selfDescription -jobDescription -__v');
    return res.status(200).json({ interviewReports });
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

module.exports = { generateInterviewReport, getInterviewReportById, getAllInterviewReports, generateResumePDFController };
