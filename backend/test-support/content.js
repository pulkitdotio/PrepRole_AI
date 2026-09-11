function report() {
    const question = { question: 'How would you approach this task?', intention: 'Evaluate practical communication skills.', answer: 'A strong answer explains the approach and uses an honest example.' };
    return { title: 'Customer Support Preparation', matchScore: 75,
        technicalQuestions: Array.from({ length: 4 }, () => ({ ...question })),
        behavioralQuestions: Array.from({ length: 4 }, () => ({ ...question })),
        skillGaps: [{ skill: 'Ticketing workflow', severity: 'medium' }, { skill: 'Escalation process', severity: 'low' }],
        preparationPlan: [1, 2, 3].map(day => ({ day, focus: 'Practice communication', tasks: ['Review a relevant real example.'] })) };
}
function resume() {
    return { personalInfo: { name: 'Alex Candidate', headline: 'Customer Support Associate', contact: ['alex@example.com', 'Bengaluru, India'] },
        summary: 'Customer-focused professional with experience resolving questions and documenting clear next steps.',
        experience: [{ title: 'Support Associate', organization: 'Example Company', dates: '2023–2025', location: 'Bengaluru', bullets: ['Responded to customer questions and maintained clear records.', 'Collaborated with colleagues to resolve complex requests.'] }],
        education: [{ title: 'Bachelor of Arts', organization: 'Example University', dates: '2023', location: '', bullets: [] }],
        projects: [], skills: ['Communication', 'Troubleshooting', 'Documentation'], certifications: [] };
}
const profile = { resume: 'Candidate with communication and customer support experience.', jobDescription: 'Customer support role requiring practical troubleshooting.', selfDescription: 'I enjoy helping customers solve problems.' };

// Small, valid, deterministic PDF fixture with a correct xref, no external fixture dependency.
function pdf(text = 'Candidate resume: customer support and communication.') {
    const escaped = text.replace(/[\\()]/g, char => '\\' + char);
    const stream = `BT /F1 12 Tf 50 740 Td (${escaped}) Tj ET`;
    const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
        '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
    let content = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, i) => { offsets.push(Buffer.byteLength(content)); content += `${i + 1} 0 obj\n${object}\nendobj\n`; });
    const xref = Buffer.byteLength(content);
    content += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return { buffer: Buffer.from(content), mimetype: 'application/pdf', size: Buffer.byteLength(content) };
}
module.exports = { report, resume, profile, pdf };
