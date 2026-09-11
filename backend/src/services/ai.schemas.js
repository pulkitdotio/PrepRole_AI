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
    title: text(L.resumeFieldChars), organization: short(), location: short(), dates: short(),
    bullets: z.array(text(L.resumeBulletChars)).max(L.resumeBullets)
});
const project = z.strictObject({
    title: text(L.resumeFieldChars), organization: short(), dates: short(),
    technologies: z.array(text(L.skillChars)).max(10),
    bullets: z.array(text(L.resumeBulletChars)).max(3)
});
const professionalLink = z.strictObject({
    label: text(40),
    url: text(L.resumeFieldChars).refine(value => {
        try {
            const url = new URL(value);
            return /^https:\/\//i.test(value) && url.protocol === 'https:' && !url.username && !url.password;
        } catch { return false; }
    }, 'Professional links must use HTTPS')
});
const skillGroup = z.strictObject({
    category: text(40),
    skills: z.array(text(L.skillChars)).min(1).max(L.resumeSkillsPerGroup)
});
const resumeDataSchema = z.strictObject({
    personalInfo: z.strictObject({
        name: text(L.resumeFieldChars), headline: short(), email: short(), phone: short(), location: short(),
        links: z.array(professionalLink).max(L.resumeLinks)
    }),
    summary: text(L.summaryChars, 0),
    experience: z.array(entry).max(L.resumeEntries),
    education: z.array(entry).max(L.resumeEntries),
    projects: z.array(project).max(L.resumeProjects),
    skillGroups: z.array(skillGroup).max(L.resumeSkillGroups),
    certifications: z.array(text(L.resumeFieldChars)).max(L.resumeCertifications)
}).superRefine((data, context) => {
    const categories = new Set();
    const skills = new Set();
    let skillCount = 0;
    data.skillGroups.forEach((group, groupIndex) => {
        const category = group.category.toLocaleLowerCase();
        if (categories.has(category)) context.addIssue({ code: 'custom', path: ['skillGroups', groupIndex, 'category'], message: 'Duplicate skill category' });
        categories.add(category);
        group.skills.forEach((skill, skillIndex) => {
            skillCount += 1;
            const normalized = skill.toLocaleLowerCase();
            if (skills.has(normalized)) context.addIssue({ code: 'custom', path: ['skillGroups', groupIndex, 'skills', skillIndex], message: 'Duplicate skill' });
            skills.add(normalized);
        });
    });
    if (skillCount > L.resumeSkills) context.addIssue({ code: 'too_big', origin: 'array', maximum: L.resumeSkills, inclusive: true, path: ['skillGroups'], message: 'Too many skills' });
});

function responseJsonSchema(schema) {
    const json = z.toJSONSchema(schema, { target: 'draft-7' });
    delete json.$schema;
    // GenerateContent rejects these validation keywords for complex schemas.
    // Zod remains the authoritative boundary and enforces every bound after generation.
    const unsupported = new Set(['minLength', 'maxLength', 'minItems', 'maxItems']);
    const toProviderSchema = value => {
        if (Array.isArray(value)) return value.map(toProviderSchema);
        if (!value || typeof value !== 'object') return value;
        return Object.fromEntries(
            Object.entries(value)
                .filter(([key]) => !unsupported.has(key))
                .map(([key, child]) => [key, toProviderSchema(child)])
        );
    };
    return toProviderSchema(json);
}

module.exports = { interviewReportSchema, resumeDataSchema, responseJsonSchema };
