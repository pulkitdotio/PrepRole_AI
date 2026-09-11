const mongoose = require('mongoose');
const L = require('../config/contentLimits');

// Stored profile and model strings remain untrusted; never render them as markup.
const text = max => ({ type: String, required: true, trim: true, maxlength: max });
const boundedArray = (type, max) => ({ type: [type], default: [], validate: {
    validator: value => value.length <= max, message: 'Too many entries'
} });
const questionSchema = new mongoose.Schema({
    question: text(L.questionChars), intention: text(L.intentionChars), answer: text(L.answerChars)
}, { _id: false, strict: 'throw' });
const skillGapSchema = new mongoose.Schema({
    skill: text(L.skillChars), severity: { type: String, enum: ['low', 'medium', 'high'], required: true }
}, { _id: false, strict: 'throw' });
const preparationPlanSchema = new mongoose.Schema({
    day: { type: Number, required: true, min: 1, max: L.days, validate: Number.isInteger },
    focus: text(L.focusChars), tasks: boundedArray(text(L.taskChars), L.tasks)
}, { _id: false, strict: 'throw' });
const interviewReportSchema = new mongoose.Schema({
    jobDescription: text(L.jobChars), resume: text(L.resumeChars), selfDescription: text(L.selfChars),
    matchScore: { type: Number, min: 0, max: 100, required: true },
    technicalQuestions: boundedArray(questionSchema, L.questions),
    behavioralQuestions: boundedArray(questionSchema, L.questions),
    skillGaps: boundedArray(skillGapSchema, L.gaps),
    preparationPlan: boundedArray(preparationPlanSchema, L.days),
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    title: text(L.titleChars)
}, { timestamps: true, strict: 'throw' });
interviewReportSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('InterviewReport', interviewReportSchema);
