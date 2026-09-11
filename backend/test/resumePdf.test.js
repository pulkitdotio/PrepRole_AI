const test = require('node:test');
const assert = require('node:assert/strict');
const { existsSync } = require('node:fs');
const puppeteer = require('puppeteer');
const { PDFParse } = require('pdf-parse');
const { renderResumePDF } = require('../src/services/resumePdf.service');
const fixture = require('../test-support/content');

test('renderer disables JS, denies all requests and closes page/browser after failure', async t => {
    t.mock.method(console, 'warn', () => {});
    for (const failAt of ['newPage', 'setContent', 'pdf', 'none']) {
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
            on(event, callback) {
                assert.equal(event, 'request');
                for (const url of ['http://evil.example', 'https://example.com', 'http://127.0.0.1', 'http://[::1]', 'http://169.254.169.254', 'file:///etc/passwd', 'data:text/html,x', 'ws://localhost', 'ftp://example.com']) {
                    callback({ url: () => url, abort: async () => { aborted++; }, continue: () => assert.fail('request allowed') });
                }
            },
            async setContent(html, options) { assert.ok(options.timeout > 0); assert.ok(html.includes('default-src')); if (failAt === 'setContent') throw new Error('private html'); },
            async pdf(options) { assert.ok(options.timeout > 0); if (failAt === 'pdf') throw new Error('private chromium details'); return Buffer.from('%PDF-output'); },
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
    data.personalInfo.contact.push('<img src="http://127.0.0.1:3000/private">');
    const pdf = await renderResumePDF(data);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    const parser = new PDFParse({ data: pdf, isEvalSupported: false });
    try {
        const info = await parser.getInfo();
        assert.ok(info.total >= 1 && info.total <= 2);
        const result = await parser.getText();
        assert.ok(result.text.includes('<script>alert(1)</script>'));
        assert.ok(result.text.includes('Customer Support Associate'));
        assert.ok(result.text.includes('127.0.0.1:3000/private'));
    } finally { await parser.destroy(); }
});
