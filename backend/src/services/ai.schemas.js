const { z } = require('zod');
const L = require('../config/contentLimits');

// All provider responses remain untrusted. Reject extra fields and overlarge values.
const text = (max, min = 1) => z.string().trim().min(min).max(max);
const question = z.strictObject({
    question: text(L.questionChars, 10), intention: text(L.intentionChars, 10), answer: text(L.answerChars, 20)
});
const interviewReportSchema = z.strictObject({
    title: text(L.titleChars), matchScore: z.number().min(0).max(100),
    technicalQuestions: z.array(question).min(4).max(L.questions),
    behavioralQuestions: z.array(question).min(4).max(L.questions),
    skillGaps: z.array(z.strictObject({ skill: text(L.skillChars, 2), severity: z.enum(['low', 'medium', 'high']) })).min(2).max(L.gaps),
    preparationPlan: z.array(z.strictObject({
        day: z.number().int().min(1).max(L.days), focus: text(L.focusChars, 5),
        tasks: z.array(text(L.taskChars, 5)).min(1).max(L.tasks)
    })).min(3).max(L.days)
});
const short = () => text(L.resumeFieldChars, 0);
const entry = z.strictObject({
    title: short(), organization: short(), location: short(), dates: short(),
    bullets: z.array(text(L.resumeBulletChars)).max(L.resumeBullets)
});
const resumeDataSchema = z.strictObject({
    personalInfo: z.strictObject({ name: text(L.resumeFieldChars), headline: short(),
        contact: z.array(text(L.resumeFieldChars)).max(6) }),
    summary: text(L.summaryChars, 0),
    experience: z.array(entry).max(L.resumeEntries),
    education: z.array(entry).max(L.resumeEntries),
    projects: z.array(entry).max(L.resumeEntries),
    skills: z.array(text(L.skillChars)).max(L.resumeSkills),
    certifications: z.array(text(L.resumeFieldChars)).max(12)
});

function responseJsonSchema(schema) {
    const json = z.toJSONSchema(schema, { target: 'draft-7' });
    delete json.$schema;
    return json;
}

module.exports = { interviewReportSchema, resumeDataSchema, responseJsonSchema };
