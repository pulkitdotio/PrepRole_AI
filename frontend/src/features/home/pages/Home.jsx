import {
  ArrowRight,
  BriefcaseBusiness,
  FileSearch,
  Fingerprint,
  Focus,
  MessageSquareText,
  Route,
  ShieldCheck,
  Target,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router';
import Logo from '../../../components/common/Logo';
import ScrollReveal from '../../../components/common/ScrollReveal';
import AuthLink from '../../auth/components/AuthLink';
import HeroReportPreview from '../components/HeroReportPreview';
import InterviewReportPreview from '../components/InterviewReportPreview';
import PublicHeader from '../components/PublicHeader';
import RoleJourney from '../components/RoleJourney';

const workflow = [
  { icon: BriefcaseBusiness, number: '01', title: 'Add the role', description: 'Share the job title, description, and the context that matters to you.' },
  { icon: Upload, number: '02', title: 'Upload your resume', description: 'Use your current PDF so the analysis starts from your real experience.' },
  { icon: Route, number: '03', title: 'Follow a focused plan', description: 'Review your match, practice questions, skill gaps, and next steps.' },
];

const featureValues = [
  { icon: FileSearch, label: 'Resume-aware analysis' },
  { icon: MessageSquareText, label: 'Targeted interview questions' },
  { icon: Target, label: 'Prioritized skill gaps' },
  { icon: ShieldCheck, label: 'ATS-friendly tailored resume' },
];

const differentiators = [
  {
    icon: Fingerprint,
    title: 'Grounded in your experience',
    description: 'PrepRole starts with your resume and the work you have actually done.',
  },
  {
    icon: Focus,
    title: 'Focused on one opportunity',
    description: 'Every insight is organized around the specific role you are pursuing.',
  },
  {
    icon: ShieldCheck,
    title: 'No invented experience',
    description: 'Resume improvements clarify and reposition what is real—never fabricate accomplishments.',
  },
];

function Home() {
  return (
    <div className="public-page home-page">
      <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=sentient@500&display=swap" precedence="font" />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="home-hero public-container" aria-labelledby="home-title">
          <div className="home-hero__glow" aria-hidden="true" />
          <div className="home-hero__copy">
            <p className="home-eyebrow"><span>Role preparation, made personal</span></p>
            <h1 id="home-title" className="home-title">
              <span className="home-title__line">
                <span className="home-title__text">Prepare for the role.</span>
              </span>
              <span className="home-title__line home-title__line--muted">
                <span className="home-title__text">Not just the interview.</span>
              </span>
            </h1>
            <p className="home-hero__description">
              Turn your resume and a target job into a practical interview report, focused questions,
              skill-gap insights, and a tailored resume.
            </p>
            <div className="home-actions">
              <AuthLink to="/interviews/new" className="button button--primary button--large">
                Start role preparation <ArrowRight size={16} aria-hidden="true" />
              </AuthLink>
              <Link to="/#how-it-works" className="button button--secondary button--large">See how it works</Link>
            </div>
            <div className="home-trust-note"><ShieldCheck size={15} /><span>Your reports stay in your private workspace.</span></div>
          </div>
          <div className="home-hero__visual">
            <RoleJourney />
            <HeroReportPreview />
          </div>
        </section>

        <section className="home-value-strip" aria-label="PrepRole capabilities">
          <div className="public-container home-value-strip__inner">
            <ul>
              {featureValues.map(({ icon: Icon, label }) => (
                <li key={label}><Icon size={15} aria-hidden="true" /><span>{label}</span></li>
              ))}
            </ul>
            <p><ShieldCheck size={14} aria-hidden="true" />Your report stays in your private workspace.</p>
          </div>
        </section>

        <section id="how-it-works" className="home-section public-container" aria-labelledby="how-title">
          <ScrollReveal className="home-section__heading home-section__heading--split">
            <div><p className="home-eyebrow">A focused workflow</p><h2 id="how-title">From opportunity to action plan.</h2></div>
            <p>Three clear steps. Your experience stays at the center.</p>
          </ScrollReveal>
          <ol className="home-workflow">
            {workflow.map(({ icon: Icon, number, title, description }, index) => (
              <ScrollReveal as="li" delay={index * 70} key={title}>
                <span className="workflow-number">{number}</span>
                <span className="home-icon"><Icon size={19} aria-hidden="true" /></span>
                <h3>{title}</h3><p>{description}</p>
              </ScrollReveal>
            ))}
          </ol>
        </section>

        <section id="interview-report" className="home-section home-intelligence" aria-labelledby="intelligence-title">
          <div className="public-container home-intelligence__inner">
            <ScrollReveal className="home-intelligence__copy">
              <p className="home-eyebrow">Interview intelligence</p>
              <h2 id="intelligence-title">Know where you stand. Know what to do next.</h2>
              <p>PrepRole AI compares the role with your actual background and organizes the result into a report you can work through.</p>
              <AuthLink to="/interviews/new" className="section-link">Create an Interview Report <ArrowRight size={15} /></AuthLink>
            </ScrollReveal>
            <ScrollReveal delay={90}>
              <InterviewReportPreview />
            </ScrollReveal>
          </div>
        </section>

        <section id="tailored-resume" className="home-section public-container resume-feature" aria-labelledby="resume-title">
          <ScrollReveal className="resume-feature__visual" aria-hidden="true">
            <div className="resume-sheet">
              <div className="resume-sheet__header">
                <strong>Your Name</strong>
                <span>Software Engineer</span>
              </div>
              <div className="resume-sheet__section">
                <b>Summary</b>
                <p>Software engineer focused on reliable, user-centered web products.</p>
              </div>
              <div className="resume-sheet__section">
                <b>Experience</b>
                <strong>Frontend Engineer</strong>
                <p>Built accessible product experiences with <mark>React</mark> and <mark>TypeScript</mark>.</p>
                <p>Improved integrations across internal and external <mark>APIs</mark>.</p>
              </div>
              <div className="resume-sheet__section resume-sheet__section--skills">
                <b>Skills</b>
                <span>React</span><span>TypeScript</span><span>Node.js</span><span>REST APIs</span>
              </div>
              <div className="resume-sheet__section resume-sheet__education"><b>Education</b><i /></div>
            </div>
            <div className="resume-keywords"><span>Role-aligned keywords</span><b>React</b><b>APIs</b><b>TypeScript</b></div>
            <div className="resume-signal"><Target size={17} /><span>Aligned to your target role</span></div>
          </ScrollReveal>
          <ScrollReveal className="resume-feature__copy" delay={90}>
            <p className="home-eyebrow">Tailored Resume</p>
            <h2 id="resume-title">Carry the same role context into your resume.</h2>
            <p>Generate an ATS-friendly resume from the Interview Report using your original resume, self-description, and target job—without invented experience.</p>
            <AuthLink to="/interviews/new" className="button button--secondary button--medium">Prepare and tailor <ArrowRight size={15} /></AuthLink>
          </ScrollReveal>
        </section>

        <section className="home-section home-why" aria-labelledby="why-title">
          <div className="public-container">
            <ScrollReveal className="home-section__heading">
              <p className="home-eyebrow">Why PrepRole</p>
              <h2 id="why-title">Preparation grounded in your experience.</h2>
              <p>Clearer positioning for the opportunity ahead, built from the experience you already have.</p>
            </ScrollReveal>
            <div className="home-why__grid">
              {differentiators.map(({ icon: Icon, title, description }, index) => (
                <ScrollReveal className="home-why__item" delay={index * 70} key={title}>
                  <span className="home-why__icon"><Icon size={18} aria-hidden="true" /></span>
                  <div><h3>{title}</h3><p>{description}</p></div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <ScrollReveal as="section" className="home-final public-container" aria-labelledby="final-title">
          <div>
            <p className="home-eyebrow">Your next role deserves focus</p>
            <h2 id="final-title">Bring the opportunity. Leave with a plan.</h2>
            <p className="home-final__support">Upload your resume and target role to generate a focused preparation plan.</p>
          </div>
          <AuthLink to="/interviews/new" className="button button--light button--large">Start preparing <ArrowRight size={16} /></AuthLink>
        </ScrollReveal>
      </main>
      <footer className="public-footer">
        <div className="public-container public-footer__inner">
          <div className="public-footer__brand"><Logo /><p>Role-specific preparation, built around you.</p></div>
          <nav className="public-footer__links" aria-label="Footer navigation">
            <Link to="/#how-it-works">How it works</Link>
            <Link to="/#interview-report">Interview Report</Link>
            <Link to="/#tailored-resume">Tailored Resume</Link>
            <Link to="/login">Login</Link>
          </nav>
          <p className="public-footer__copyright">© PrepRole AI</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
