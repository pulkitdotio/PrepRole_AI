const { GoogleGenAI } = require('@google/genai');
const L = require('../config/contentLimits');
const logger = require('../utils/logger');
const { ContentError } = require('../utils/content');
const { buildPrompt } = require('./ai.prompts');
const { interviewReportSchema, resumeDataSchema, responseJsonSchema } = require('./ai.schemas');
const { renderResumePDF } = require('./resumePdf.service');

// User fields and EVERY model response are untrusted. No model text enters instructions,
// logs, ownership fields, HTML markup, CSS, code, filesystem paths or network destinations.
let ai;
function getClient() {
    if (!process.env.GOOGLE_API_KEY) throw new ContentError(503, 'AI generation is temporarily unavailable');
    ai ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    return ai;
}

function parseResponse(text, schema) {
    if (typeof text !== 'string' || !text.trim() || text.length > L.aiResponseChars) {
        throw new Error('Invalid response size');
    }
    return schema.parse(JSON.parse(text));
}

async function generateStructured(operation, input, {
    client, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), now = Date.now
} = {}) {
    const prompt = buildPrompt(operation, input);
    const schema = operation === 'interview' ? interviewReportSchema : resumeDataSchema;
    const provider = client || getClient();
    const deadline = now() + L.aiTotalMs;
    let invalidOutput = false;
    // A single shared budget: at most three provider calls, including invalid-output retries.
    for (let attempt = 1; attempt <= L.aiAttempts; attempt++) {
        const remaining = deadline - now();
        if (remaining <= 0) break;
        const abort = new AbortController();
        const timeout = Math.min(L.aiRequestMs, remaining);
        const timer = setTimeout(() => abort.abort(), timeout);
        let response;
        try {
            response = await provider.models.generateContent({
                model: 'gemini-3.5-flash', contents: prompt.contents,
                config: {
                    systemInstruction: prompt.systemInstruction + (invalidOutput ? '\nPrevious output did not match the schema. Regenerate valid JSON only.' : ''),
                    responseMimeType: 'application/json', responseJsonSchema: responseJsonSchema(schema),
                    temperature: 0.2, maxOutputTokens: L.aiOutputTokens,
                    httpOptions: { timeout, retryOptions: { attempts: 1 } },
                    abortSignal: abort.signal
                }
            });
        } catch (error) {
            const status = Number(error?.status ?? error?.response?.status ?? error?.code);
            const retryable = [429, 500, 502, 503, 504].includes(status);
            logger.warn('ai.request_failed', { operation, attempt, status: Number.isFinite(status) ? status : undefined });
            if (!retryable || attempt === L.aiAttempts || now() >= deadline) {
                throw new ContentError(502, 'Unable to complete AI generation. Please try again later.');
            }
            await sleep(Math.min(500 * 2 ** (attempt - 1), Math.max(0, deadline - now())));
            continue;
        } finally {
            clearTimeout(timer);
        }
        try {
            if (now() >= deadline) break;
            const result = parseResponse(response?.text, schema);
            return result;
        } catch {
            invalidOutput = true;
            logger.warn('ai.output_rejected', { operation, attempt });
        }
    }
    throw new ContentError(502, 'Unable to generate valid preparation content. Please try again.');
}

async function generateInterviewReport(input) {
    return generateStructured('interview', input);
}

async function generateResumePDF(input) {
    const data = await generateStructured('resume', input);
    return renderResumePDF(data);
}

module.exports = { generateInterviewReport, generateResumePDF, generateStructured, parseResponse };
