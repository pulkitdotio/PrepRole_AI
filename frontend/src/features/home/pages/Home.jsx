import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  FileSearch,
  MessageSquareText,
  Route,
  ShieldCheck,
  Target,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router';
import Logo from '../../../components/common/Logo';
import AuthLink from '../../auth/components/AuthLink';
import PublicHeader from '../components/PublicHeader';
import RoleJourney from '../components/RoleJourney';

const workflow = [
  { icon: BriefcaseBusiness, number: '01', title: 'Add the role', description: 'Share the job title, description, and the context that matters to you.' },
  { icon: Upload, number: '02', title: 'Upload your resume', description: 'Use your current PDF so the analysis starts from your real experience.' },
  { icon: Route, number: '03', title: 'Follow a focused plan', description: 'Review your match, practice questions, skill gaps, and next steps.' },
];

const reportDetails = [
  { icon: MessageSquareText, label: 'Interview questions', value: 'Technical + behavioral' },
  { icon: Target, label: 'Skill gap analysis', value: 'Prioritized by severity' },
  { icon: FileSearch, label: 'Tailored resume', value: 'Generated from your report' },
];

function Home() {
  return (
    <div className="public-page">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <PublicHeader />
      <main id="main-content" tabIndex={-1}>
        <section className="home-hero public-container" aria-labelledby="home-title">
          <div className="home-hero__glow" aria-hidden="true" />
          <div className="home-hero__copy">
            <p className="home-eyebrow"><span>Role preparation, made personal</span></p>
            <h1 id="home-title">Prepare for the role.<br /><span>Not just the interview.</span></h1>
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
          <RoleJourney />
        </section>

        <section id="how-it-works" className="home-section public-container" aria-labelledby="how-title">
          <div className="home-section__heading home-section__heading--split">
            <div><p className="home-eyebrow">A focused workflow</p><h2 id="how-title">From opportunity to action plan.</h2></div>
            <p>Three clear steps. Your experience stays at the center.</p>
          </div>
          <ol className="home-workflow">
            {workflow.map(({ icon: Icon, number, title, description }) => (
              <li key={title}>
                <span className="workflow-number">{number}</span>
                <span className="home-icon"><Icon size={19} aria-hidden="true" /></span>
                <h3>{title}</h3><p>{description}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="tools" className="home-section home-intelligence" aria-labelledby="intelligence-title">
          <div className="public-container home-intelligence__inner">
            <div className="home-intelligence__copy">
              <p className="home-eyebrow">Interview intelligence</p>
              <h2 id="intelligence-title">Know where you stand. Know what to do next.</h2>
              <p>PrepRole AI compares the role with your actual background and organizes the result into a report you can work through.</p>
              <AuthLink to="/interviews/new" className="section-link">Create an Interview Report <ArrowRight size={15} /></AuthLink>
            </div>
            <div className="intelligence-panel">
              <div className="intelligence-panel__header"><BarChart3 size={17} /><span>Role preparation snapshot</span></div>
              {reportDetails.map(({ icon: Icon, label, value }) => (
                <div className="intelligence-row" key={label}>
                  <span className="intelligence-row__icon"><Icon size={17} /></span>
                  <span><small>{label}</small><strong>{value}</strong></span>
                  <ArrowRight size={15} aria-hidden="true" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section public-container resume-feature" aria-labelledby="resume-title">
          <div className="resume-feature__visual" aria-hidden="true">
            <div className="resume-sheet">
              <span className="resume-sheet__name" /><span className="resume-sheet__role" />
              <i /><i /><i /><i /><i />
            </div>
            <div className="resume-signal"><Target size={17} /><span>Aligned to your target role</span></div>
          </div>
          <div className="resume-feature__copy">
            <p className="home-eyebrow">Tailored Resume</p>
            <h2 id="resume-title">Carry the same role context into your resume.</h2>
            <p>Generate an ATS-friendly resume from the Interview Report using your original resume, self-description, and target job—without invented experience.</p>
            <AuthLink to="/interviews/new" className="button button--secondary button--medium">Prepare and tailor <ArrowRight size={15} /></AuthLink>
          </div>
        </section>

        <section className="home-final public-container" aria-labelledby="final-title">
          <div><p className="home-eyebrow">Your next role deserves focus</p><h2 id="final-title">Bring the opportunity. Leave with a plan.</h2></div>
          <AuthLink to="/interviews/new" className="button button--light button--large">Start preparing <ArrowRight size={16} /></AuthLink>
        </section>
      </main>
      <footer className="public-container public-footer"><Logo /><p>Role-specific preparation, built around you.</p><Link to="/#how-it-works">How it works</Link></footer>
    </div>
  );
}

export default Home;
