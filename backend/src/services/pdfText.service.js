const { PDFParse } = require('pdf-parse');
const { performance } = require('node:perf_hooks');
const limits = require('../config/contentLimits');
const { ContentError, normalizeText } = require('../utils/content');
const logger = require('../utils/logger');

// PDF bytes and MIME metadata are hostile. Parse only local bytes, never filenames/URLs.
function validatePdfUpload(file) {
    if (!file || !Buffer.isBuffer(file.buffer) || file.buffer.length === 0) {
        throw new ContentError(400, 'A non-empty resume PDF is required');
    }
    if (file.buffer.length > limits.pdfBytes || file.size > limits.pdfBytes) {
        throw new ContentError(413, 'Resume file must be at most 3 MB');
    }
    if (file.mimetype !== 'application/pdf' || file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
        throw new ContentError(400, 'Invalid PDF file');
    }
}

async function extractResumeText(file, { Parser = PDFParse, now = () => performance.now() } = {}) {
    validatePdfUpload(file);
    const deadline = now() + limits.parseMs;
    const checkTime = () => {
        if (now() >= deadline) throw new ContentError(400, 'Unable to process this resume within the time limit');
    };
    let parser;
    try {
        parser = new Parser({ data: file.buffer, isEvalSupported: false, stopAtErrors: true, verbosity: 0 });
        const info = await parser.getInfo({ parsePageInfo: false });
        checkTime();
        if (!Number.isInteger(info.total) || info.total < 1 || info.total > limits.pdfPages) {
            throw new ContentError(400, `Resume PDF must contain 1–${limits.pdfPages} pages`);
        }
        let text = '';
        for (let page = 1; page <= info.total; page++) {
            checkTime();
            const result = await parser.getText({ partial: [page], pageJoiner: '', parseHyperlinks: false });
            checkTime();
            if (typeof result.text !== 'string') throw new ContentError(400, 'Unable to process this resume');
            if (text.length + result.text.length + 1 > limits.resumeChars) {
                throw new ContentError(413, 'Extracted resume text is too long');
            }
            text += result.text + '\n';
        }
        return normalizeText(text, limits.resumeChars, 'Resume text');
    } catch (error) {
        if (error instanceof ContentError) throw error;
        throw new ContentError(400, 'Unable to process this resume. Use a readable, unencrypted PDF.');
    } finally {
        // Cooperative checks cannot terminate synchronous PDF.js work or enforce a heap cap.
        // True CPU/memory isolation requires a separate process, deferred from this phase.
        if (parser) await parser.destroy().catch(() => { logger.warn('pdf_parser.cleanup_failed'); });
    }
}

module.exports = { validatePdfUpload, extractResumeText };
