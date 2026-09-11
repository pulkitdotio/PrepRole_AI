function report() {
    const question = { question: 'How would you approach this task?', intention: 'Evaluate practical communication skills.', answer: 'A strong answer explains the approach and uses an honest example.' };
    return { title: 'Customer Support Preparation', matchScore: 75,
        technicalQuestions: Array.from({ length: 4 }, () => ({ ...question })),
        behavioralQuestions: Array.from({ length: 4 }, () => ({ ...question })),
        skillGaps: [{ skill: 'Ticketing workflow', severity: 'medium' }, { skill: 'Escalation process', severity: 'low' }],
        preparationPlan: [1, 2, 3].map(day => ({ day, focus: 'Practice communication', tasks: ['Review a relevant real example.'] })) };
}
function resume() {
    return { personalInfo: { name: 'Alex Candidate', headline: 'Customer Support Associate',
        email: 'alex@example.test', phone: '', location: 'Bengaluru, India', links: [] },
        summary: 'Customer-focused professional with experience resolving questions and documenting clear next steps.',
        experience: [{ title: 'Support Associate', organization: 'Example Company', dates: '2023–2025', location: 'Bengaluru', bullets: ['Responded to customer questions and maintained clear records.', 'Collaborated with colleagues to resolve complex requests.'] }],
        education: [{ title: 'Bachelor of Arts', organization: 'Example University', dates: '2023', location: '', bullets: [] }],
        projects: [], skillGroups: [{ category: 'Core Skills', skills: ['Communication', 'Troubleshooting', 'Documentation'] }], certifications: [] };
}

function earlyCareerResume() {
    const project = (title, technologies, focus) => ({
        title, organization: '', dates: '2024', technologies,
        bullets: [
            `Built ${focus} with ${technologies.slice(0, 2).join(' and ')} to support a clear end-to-end workflow.`,
            `Implemented tested data handling and accessible user feedback for reliable everyday use.`
        ]
    });
    return {
        personalInfo: {
            name: 'Jordan Example', headline: 'Software Engineering Graduate',
            email: 'jordan@example.test', phone: '+91 90000 00000', location: 'Pune, India',
            links: [
                { label: 'GitHub', url: 'https://github.com/example-candidate' },
                { label: 'Portfolio', url: 'https://portfolio.example.test' }
            ]
        },
        summary: 'Software engineering graduate focused on building accessible web applications and dependable APIs. Applies JavaScript, React, Node.js, SQL, and practical testing through academic and independent projects, with a clear interest in product-focused engineering roles.',
        experience: [],
        projects: [
            project('Campus Placement Portal', ['React', 'Node.js', 'Express', 'MongoDB'], 'a role-based placement portal'),
            project('Inventory Insights Dashboard', ['Python', 'Pandas', 'PostgreSQL'], 'a searchable inventory reporting tool'),
            project('Accessible Study Planner', ['JavaScript', 'HTML', 'CSS', 'Jest'], 'a keyboard-friendly study planning interface')
        ],
        education: [
            { title: 'Bachelor of Technology in Computer Science', organization: 'Example Institute of Technology', location: 'Pune', dates: '2021-2025', bullets: [] },
            { title: 'Higher Secondary Certificate', organization: 'Example Junior College', location: 'Pune', dates: '2021', bullets: [] },
            { title: 'Secondary School Certificate', organization: 'Example School', location: 'Pune', dates: '2019', bullets: [] }
        ],
        skillGroups: [
            { category: 'Languages', skills: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'C++'] },
            { category: 'Frontend', skills: ['React', 'HTML', 'CSS', 'Sass', 'Redux', 'Accessibility'] },
            { category: 'Backend', skills: ['Node.js', 'Express', 'REST APIs', 'JSON', 'Authentication', 'Web Security'] },
            { category: 'Data', skills: ['MongoDB', 'PostgreSQL', 'MySQL', 'Pandas', 'NumPy', 'Data Modeling'] },
            { category: 'Tools', skills: ['Git', 'GitHub', 'Docker', 'Postman', 'Jest', 'Linux'] }
        ],
        certifications: ['Foundations of Cloud Computing - Example Learning Platform']
    };
}

function longResume() {
    const data = earlyCareerResume();
    data.personalInfo.headline = 'Software Engineer';
    data.summary = 'Software engineer building secure web products, data services, and internal platforms. Experience includes API design, frontend delivery, automated testing, operational documentation, and cross-functional implementation across several substantive roles and projects.';
    data.experience = Array.from({ length: 4 }, (_, index) => ({
        title: ['Software Engineer', 'Associate Software Engineer', 'Engineering Intern', 'Technical Assistant'][index],
        organization: `Synthetic Organization ${index + 1}`,
        location: 'Pune', dates: `${2021 + index}-${2022 + index}`,
        bullets: Array.from({ length: 4 }, (_, bullet) =>
            `Delivered documented component ${bullet + 1} for a bounded product workflow using verified web technologies, automated checks, and maintainable interfaces.`)
    }));
    data.projects = [...data.projects, {
        title: 'Service Reliability Toolkit', organization: '', dates: '2023',
        technologies: ['Node.js', 'PostgreSQL', 'Docker'],
        bullets: [
            'Created health checks and structured diagnostics for local service operations.',
            'Added bounded failure handling and repeatable verification for service maintainers.',
            'Documented recovery steps and observable behavior for common operational faults.'
        ]
    }];
    data.certifications.push('Secure Development Practices - Example Academy', 'Database Design - Example Academy');
    return data;
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
module.exports = { report, resume, earlyCareerResume, longResume, profile, pdf };
