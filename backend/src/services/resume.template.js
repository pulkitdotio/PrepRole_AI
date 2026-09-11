const { resumeDataSchema } = require('./ai.schemas');
const L = require('../config/contentLimits');
const { ContentError } = require('../utils/content');

// Only server-owned markup/CSS reaches Chromium. Every model value becomes escaped text.
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function renderResumeHTML(input) {
    const data = resumeDataSchema.parse(input);
    const e = escapeHTML;
    const section = (title, body) => body ? `<section><h2>${title}</h2>${body}</section>` : '';
    const entries = items => items.map(item => `<article><h3>${e(item.title)}</h3><p class="details">${[item.organization, item.location, item.dates].filter(Boolean).map(e).join(' · ')}</p>${item.bullets.length ? `<ul>${item.bullets.map(bullet => `<li>${e(bullet)}</li>`).join('')}</ul>` : ''}</article>`).join('');
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
<title>Tailored Resume</title><style>
@page { size: A4; margin: 14mm; }
* { box-sizing: border-box; } body { margin: 0; color: #172033; font: 10pt/1.4 Arial, Helvetica, sans-serif; overflow-wrap: anywhere; }
h1 { margin: 0 0 3pt; font-size: 23pt; letter-spacing: -.4pt; } header { border-bottom: 2pt solid #334155; padding-bottom: 9pt; }
.headline { font-size: 11pt; font-weight: bold; } .contact, .details { color: #475569; font-size: 9pt; }
h2 { margin: 12pt 0 5pt; font-size: 11pt; text-transform: uppercase; letter-spacing: .7pt; border-bottom: .5pt solid #cbd5e1; padding-bottom: 3pt; break-after: avoid; }
h3 { margin: 7pt 0 1pt; font-size: 10pt; break-after: avoid; } p { margin: 3pt 0; white-space: pre-line; }
ul { margin: 4pt 0 7pt; padding-left: 15pt; } li { margin-bottom: 3pt; white-space: pre-line; } article { break-inside: avoid; } .skills { line-height: 1.6; }
</style></head><body><header><h1>${e(data.personalInfo.name)}</h1><p class="headline">${e(data.personalInfo.headline)}</p><p class="contact">${data.personalInfo.contact.map(e).join(' · ')}</p></header><main>
${section('Profile', data.summary ? `<p>${e(data.summary)}</p>` : '')}
${section('Experience', entries(data.experience))}${section('Education', entries(data.education))}
${section('Projects', entries(data.projects))}${section('Skills', data.skills.length ? `<p class="skills">${data.skills.map(e).join(' · ')}</p>` : '')}
${section('Certifications', data.certifications.map(item => `<p>${e(item)}</p>`).join(''))}
</main></body></html>`;
    if (Buffer.byteLength(html) > L.htmlBytes) throw new ContentError(502, 'Unable to generate the resume PDF');
    return html;
}

module.exports = { escapeHTML, renderResumeHTML };
