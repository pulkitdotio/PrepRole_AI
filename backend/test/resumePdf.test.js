const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const puppeteer = require('puppeteer');
const { PDFParse } = require('pdf-parse');
const { renderResumePDF } = require('../src/services/resumePdf.service');
const fixture = require('../test-support/content');

async function readPdf(pdf, pages = []) {
    const parser = new PDFParse({ data: pdf, isEvalSupported: false });
    try {
        const info = await parser.getInfo();
        const text = (await parser.getText()).text;
        const pageText = [];
        for (const page of pages) pageText.push((await parser.getText({ partial: [page] })).text);
        return { pageCount: info.total, text, pageText };
    } finally { await parser.destroy(); }
}

test('renderer disables JS, denies all requests and closes page/browser after failure', async t => {
    t.mock.method(console, 'warn', () => {});
    for (const failAt of ['newPage', 'setContent', 'overflow', 'pdf', 'none']) {
        let pageClosed = false;
        let browserClosed = false;
        let aborted = 0;
        const page = {
            setDefaultTimeout(value) { assert.ok(value > 0); },
            setDefaultNavigationTimeout(value) { assert.ok(value > 0); },
            async setJavaScriptEnabled(value) { assert.equal(value, false); },
            async setBypassServiceWorker(value) { assert.equal(value, true); },
            async setRequestInterception(value) { assert.equal(value, true); },
            async setOfflineMode(value) { assert.equal(value, true); },
            async evaluate(callback) { assert.equal(typeof callback, 'function'); return failAt === 'overflow'; },
            on(event, callback) {
                assert.equal(event, 'request');
                for (const url of ['http://evil.example', 'https://example.com', 'http://127.0.0.1', 'http://[::1]', 'http://169.254.169.254', 'file:///etc/passwd', 'data:text/html,x', 'ws://localhost', 'ftp://example.com']) {
                    callback({ url: () => url, abort: async () => { aborted++; }, continue: () => assert.fail('request allowed') });
                }
            },
            async setContent(html, options) { assert.ok(options.timeout > 0); assert.ok(html.includes('default-src')); if (failAt === 'setContent') throw new Error('private html'); },
            async pdf(options) { assert.ok(options.timeout > 0); assert.equal(options.displayHeaderFooter, false); if (failAt === 'pdf') throw new Error('private chromium details'); return Buffer.from('%PDF-output'); },
            async close() { pageClosed = true; }
        };
        const launcher = { launch: async options => {
            assert.equal(options.args, undefined); // Never --no-sandbox / --disable-setuid-sandbox.
            return { async newPage() { if (failAt === 'newPage') throw new Error('failure'); return page; },
                async close() { browserClosed = true; }, process: () => ({ kill() {} }) };
        } };
        if (failAt === 'none') assert.ok(Buffer.isBuffer(await renderResumePDF(fixture.resume(), { launcher })));
        else await assert.rejects(renderResumePDF(fixture.resume(), { launcher }), error => error.status === 502 && !error.message.includes('private'));
        assert.equal(browserClosed, true);
        assert.equal(pageClosed, failAt !== 'newPage');
        if (failAt !== 'newPage') assert.equal(aborted, 9);
    }
});

test('real sandboxed Chromium renders a readable PDF with hostile names as literal text', async t => {
    if (!existsSync(await puppeteer.executablePath())) return t.skip('Bundled Chromium is not installed');
    const data = fixture.resume();
    data.personalInfo.name = '<script>alert(1)</script>';
    data.personalInfo.location = '<img src="http://127.0.0.1:3000/private">';
    const pdf = await renderResumePDF(data);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    const result = await readPdf(pdf);
    assert.ok(result.pageCount >= 1 && result.pageCount <= 2);
    assert.ok(result.text.includes('<script>alert(1)</script>'));
    assert.ok(result.text.includes('Customer Support Associate'));
    assert.ok(result.text.includes('127.0.0.1:3000/private'));
});

test('representative early-career resume is one page with extractable ATS text', async t => {
    if (!existsSync(await puppeteer.executablePath())) return t.skip('Bundled Chromium is not installed');
    const result = await readPdf(await renderResumePDF(fixture.earlyCareerResume()));
    assert.equal(result.pageCount, 1);
    for (const expected of [
        'Jordan Example', 'Campus Placement Portal', 'Inventory Insights Dashboard',
        'JavaScript', 'Foundations of Cloud Computing'
    ]) assert.ok(result.text.includes(expected), `missing extractable text: ${expected}`);
});

test('substantive long resume uses two meaningful pages without clipping content', async t => {
    if (!existsSync(await puppeteer.executablePath())) return t.skip('Bundled Chromium is not installed');
    const result = await readPdf(await renderResumePDF(fixture.longResume()), [1, 2]);
    assert.equal(result.pageCount, 2);
    assert.ok(result.pageText[0].replace(/\s/g, '').length > 800);
    assert.ok(result.pageText[1].replace(/\s/g, '').length > 500);
    assert.ok(result.text.includes('Service Reliability Toolkit'));
    assert.ok(result.text.includes('Secure Development Practices'));
    assert.ok(result.text.includes('Technical Assistant'));
    assert.ok(result.text.includes('Database Design'));
});
