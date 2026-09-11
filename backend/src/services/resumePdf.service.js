const puppeteer = require('puppeteer');
const { renderResumeHTML } = require('./resume.template');
const { ContentError } = require('../utils/content');
const logger = require('../utils/logger');
const L = require('../config/contentLimits');

async function renderResumePDF(data, { launcher = puppeteer } = {}) {
    // No public raw-HTML input: validation and escaping happen before browser launch.
    const html = renderResumeHTML(data);
    let browser;
    let page;
    let watchdog;
    const killBrowser = () => {
        try { browser?.process()?.kill('SIGKILL'); } catch { /* Process may already have exited. */ }
    };
    try {
        browser = await launcher.launch({ headless: true, timeout: L.contentMs, protocolTimeout: L.contentMs });
        // This terminates the browser process, unlike a Promise.race timeout alone.
        watchdog = setTimeout(killBrowser, L.renderMs);
        page = await browser.newPage();
        page.setDefaultTimeout(L.contentMs);
        page.setDefaultNavigationTimeout(L.contentMs);
        await page.setJavaScriptEnabled(false);
        await page.setBypassServiceWorker(true);
        await page.setRequestInterception(true);
        page.on('request', request => {
            // Deny all document requests: no data:, file:, internal hosts or remote assets.
            void request.abort('blockedbyclient').catch(() => {});
        });
        await page.setOfflineMode(true);
        await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: L.contentMs });
        const pdf = Buffer.from(await page.pdf({
            format: 'A4', preferCSSPageSize: true, printBackground: true,
            timeout: L.pdfMs, waitForFonts: false
        }));
        if (pdf.length > L.generatedPdfBytes) throw new Error('PDF exceeds size budget');
        return pdf;
    } catch {
        logger.warn('resume_pdf.render_failed');
        throw new ContentError(502, 'Unable to generate the resume PDF');
    } finally {
        try {
            if (page) await page.close().catch(() => {});
            if (browser) await browser.close().catch(killBrowser);
        } finally {
            clearTimeout(watchdog);
        }
    }
}

module.exports = { renderResumePDF };
