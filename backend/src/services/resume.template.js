const { resumeDataSchema } = require('./ai.schemas');
const L = require('../config/contentLimits');
const { ContentError } = require('../utils/content');

// Only server-owned markup/CSS reaches Chromium. Every model value becomes escaped text.
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function selectResumeDensity(data) {
    const entries = [...data.experience, ...data.education, ...data.projects];
    const bullets = entries.reduce((total, entry) => total + entry.bullets.length, 0);
    const skills = data.skillGroups.reduce((total, group) => total + group.skills.length, 0);
    const textLength = data.summary.length + entries.reduce((total, entry) => total +
        entry.title.length + entry.organization.length + entry.dates.length +
        entry.bullets.reduce((sum, bullet) => sum + bullet.length, 0), 0);
    return entries.length >= 6 || bullets >= 9 || skills >= 20 || textLength >= 1800 ? 'compact' : 'normal';
}

function renderResumeHTML(input) {
    const data = resumeDataSchema.parse(input);
    const e = escapeHTML;
    const density = selectResumeDensity(data);
    const separator = '<span class="separator" aria-hidden="true"> | </span>';
    const section = (title, body, className = '') => body
        ? `<section class="${className}"><h2>${title}</h2>${body}</section>` : '';
    const metadata = values => values.filter(Boolean).map(e).join(separator);
    const bullets = items => items.length
        ? `<ul>${items.map(item => `<li>${e(item)}</li>`).join('')}</ul>` : '';
    const entries = (items, kind) => items.map(item => {
        const meta = metadata([item.organization, item.location, item.dates]);
        return `<article class="entry ${kind}-entry"><h3>${e(item.title)}</h3>` +
            `${meta ? `<p class="details">${meta}</p>` : ''}${bullets(item.bullets)}</article>`;
    }).join('');
    const projects = data.projects.map(project => {
        const meta = metadata([project.organization, project.dates]);
        const technologies = project.technologies.length
            ? `<p class="technologies"><strong>Technologies:</strong> ${project.technologies.map(e).join(', ')}</p>` : '';
        return `<article class="entry project-entry"><h3>${e(project.title)}</h3>` +
            `${meta ? `<p class="details">${meta}</p>` : ''}${technologies}${bullets(project.bullets)}</article>`;
    }).join('');
    const skillGroups = data.skillGroups.map(group =>
        `<p class="skill-group"><strong>${e(group.category)}:</strong> ${group.skills.map(e).join(', ')}</p>`
    ).join('');
    const contactValues = [data.personalInfo.location, data.personalInfo.email, data.personalInfo.phone]
        .filter(Boolean).map(value => e(value));
    const links = data.personalInfo.links.map(link =>
        `<a href="${e(link.url)}">${e(link.label)}: ${e(link.url)}</a>`
    );
    const contact = [...contactValues, ...links].join(separator);
    const certifications = data.certifications.length
        ? `<p class="certifications">${data.certifications.map(e).join(separator)}</p>` : '';

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
<title>Tailored Resume</title><style>
@page { size: A4; margin: 12.7mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { color: #1f2937; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.38; overflow-wrap: anywhere; }
body.compact { font-size: 9.5pt; line-height: 1.32; }
header { padding-bottom: 7pt; border-bottom: 1.4pt solid #334155; }
h1 { margin: 0; color: #111827; font-size: 23pt; line-height: 1.05; letter-spacing: -.35pt; }
.compact h1 { font-size: 22pt; }
.headline { margin: 3pt 0 0; color: #334155; font-size: 11pt; font-weight: 700; }
.contact { margin: 4pt 0 0; color: #475569; font-size: 9pt; line-height: 1.35; }
a { color: inherit; text-decoration: none; }
.separator { color: #94a3b8; white-space: pre; }
section { margin-top: 10pt; }
.compact section { margin-top: 7pt; }
h2 { margin: 0 0 4pt; padding-bottom: 2pt; border-bottom: .55pt solid #cbd5e1; color: #0f172a; font-size: 10.5pt; line-height: 1.2; letter-spacing: .65pt; text-transform: uppercase; break-after: avoid-page; page-break-after: avoid; }
.compact h2 { margin-bottom: 3pt; }
p { margin: 0; }
.summary { line-height: 1.42; }
.entry { margin-top: 6pt; }
.compact .entry { margin-top: 4pt; }
.entry, .certifications-section, .skills-section { break-inside: avoid-page; page-break-inside: avoid; }
h3 { margin: 0; color: #111827; font-size: 10.2pt; line-height: 1.25; break-after: avoid-page; page-break-after: avoid; }
.details { margin-top: 1pt; color: #475569; font-size: 9pt; line-height: 1.3; }
.technologies { margin-top: 1.5pt; color: #334155; font-size: 9.2pt; line-height: 1.3; }
ul { margin: 2.5pt 0 0; padding: 0 0 0 14pt; }
li { margin: 0 0 1.7pt; padding-left: 1pt; line-height: 1.34; }
.compact li { margin-bottom: 1.2pt; line-height: 1.29; }
.skill-group { margin: 0 0 2.2pt; line-height: 1.35; }
.compact .skill-group { margin-bottom: 1.4pt; }
.skill-group strong, .technologies strong { color: #0f172a; }
.certifications { line-height: 1.35; }
</style></head><body class="${density}"><header><h1>${e(data.personalInfo.name)}</h1>` +
        `${data.personalInfo.headline ? `<p class="headline">${e(data.personalInfo.headline)}</p>` : ''}` +
        `${contact ? `<p class="contact">${contact}</p>` : ''}</header><main>` +
        `${section('Profile', data.summary ? `<p class="summary">${e(data.summary)}</p>` : '')}` +
        `${section('Skills', skillGroups, 'skills-section')}` +
        `${section('Experience', entries(data.experience, 'experience'))}` +
        `${section('Projects', projects)}` +
        `${section('Education', entries(data.education, 'education'))}` +
        `${section('Certifications', certifications, 'certifications-section')}` +
        `</main></body></html>`;
    if (Buffer.byteLength(html) > L.htmlBytes) throw new ContentError(502, 'Unable to generate the resume PDF');
    return html;
}

module.exports = { escapeHTML, selectResumeDensity, renderResumeHTML };
