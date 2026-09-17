import { ArrowRight, Check, Circle } from 'lucide-react';

const strongMatches = ['React', 'REST APIs', 'JavaScript'];
const priorityGaps = ['System design', 'AWS'];

function HeroReportPreview() {
  return (
    <article className="hero-report" aria-label="Sample interview report for a software engineer role">
      <header className="hero-report__header">
        <div>
          <span className="hero-report__sample">Sample report</span>
          <h2>Software Engineer</h2>
        </div>
        <span className="hero-report__status">Ready</span>
      </header>

      <div className="hero-report__score">
        <div className="hero-report__ring" aria-label="Example role match: 82 percent">
          <strong>82%</strong>
        </div>
        <div>
          <span>Role match</span>
          <p>A focused view of fit, strengths, and next priorities.</p>
        </div>
      </div>

      <div className="hero-report__columns">
        <div>
          <span className="hero-report__label">Strong matches</span>
          <ul>
            {strongMatches.map(item => (
              <li key={item}><Check size={12} aria-hidden="true" />{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <span className="hero-report__label">Priority gaps</span>
          <ul className="hero-report__gaps">
            {priorityGaps.map(item => (
              <li key={item}><Circle size={8} aria-hidden="true" />{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="hero-report__footer">
        <span>12 targeted questions</span>
        <ArrowRight size={14} aria-hidden="true" />
      </div>
    </article>
  );
}

export default HeroReportPreview;
