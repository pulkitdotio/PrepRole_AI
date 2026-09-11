// Limits apply before normalization, parsing, persistence and document rendering.
module.exports = Object.freeze({
    pdfBytes: 3 * 1024 * 1024, pdfPages: 10, parseMs: 10000,
    resumeChars: 30000, jobChars: 6000, selfChars: 2000,
    fieldBytes: 24000, titleChars: 160, questionChars: 600,
    intentionChars: 600, answerChars: 2500, skillChars: 120,
    focusChars: 200, taskChars: 500, questions: 8, gaps: 6, days: 7, tasks: 6,
    aiResponseChars: 100000, aiOutputTokens: 12000, aiAttempts: 3,
    aiRequestMs: 45000, aiTotalMs: 120000,
    htmlBytes: 200000, renderMs: 45000, contentMs: 10000, pdfMs: 20000,
    generatedPdfBytes: 5 * 1024 * 1024,
    resumeFieldChars: 200, summaryChars: 1500, resumeBulletChars: 500,
    resumeEntries: 8, resumeBullets: 6, resumeSkills: 40
});
