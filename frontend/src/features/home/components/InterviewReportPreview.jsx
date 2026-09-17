import { BarChart3, Check, CircleDot, MessageSquareText } from 'lucide-react';

const matches = ['React', 'Node.js', 'REST APIs'];
const gaps = ['System Design', 'AWS', 'Testing Strategy'];

function InterviewReportPreview() {
  return (
    <div className="report-demo" aria-label="Sample PrepRole interview report">
      <header className="report-demo__header">
        <div className="report-demo__title">
          <span className="report-demo__icon"><BarChart3 size={16} aria-hidden="true" /></span>
          <div><span>Sample interview report</span><strong>Software Engineer</strong></div>
        </div>
        <span className="report-demo__badge">Role analysis</span>
      </header>

      <div className="report-demo__overview">
        <div className="report-demo__match">
          <span>Role match</span>
          <div className="report-demo__match-row">
            <strong>82%</strong>
            <div className="report-demo__bar"><i /></div>
          </div>
          <p>Strong foundation with three clear areas to prioritize.</p>
        </div>

        <div className="report-demo__skills">
          <div>
            <span className="report-demo__label">Strong matches</span>
            <ul>{matches.map(item => <li key={item}><Check size={11} aria-hidden="true" />{item}</li>)}</ul>
          </div>
          <div>
            <span className="report-demo__label">Priority gaps</span>
            <ul>{gaps.map(item => <li key={item}><CircleDot size={11} aria-hidden="true" />{item}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="report-demo__questions">
        <div className="report-demo__questions-title">
          <span><MessageSquareText size={14} aria-hidden="true" /></span>
          <div><small>Targeted questions</small><strong>Practice what the role is likely to test</strong></div>
          <b>12</b>
        </div>
        <ol>
          <li><span>01</span>How would you design a resilient service for high traffic?</li>
          <li><span>02</span>Tell me about a technical trade-off you had to make.</li>
        </ol>
      </div>

      <footer className="report-demo__footer">
        <span>Recommended next action</span>
        <strong>Review system design foundations</strong>
      </footer>
    </div>
  );
}

export default InterviewReportPreview;
