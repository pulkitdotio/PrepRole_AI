import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  FileText,
  Lightbulb,
  Sparkles,
  Target,
} from 'lucide-react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  useEffect,
  useState,
} from 'react';

import Badge from '../../../components/ui/Badge';
import PageLoader from '../../../components/common/PageLoader';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/ui/Button';
import { getApiErrorMessage, isCanceledRequest } from '../../../services/apiError';

import {
  getInterviewReport,
} from '../interview.api';

const tabs = [
  {
    id: 'overview',
    label: 'Overview',
  },
  {
    id: 'technical',
    label: 'Technical Questions',
  },
  {
    id: 'behavioral',
    label: 'Behavioral Questions',
  },
  {
    id: 'skills',
    label: 'Skill Gaps',
  },
  {
    id: 'plan',
    label: 'Preparation Plan',
  },
];

function severityClass(
  severity
) {
  return [
    'severity-badge',
    `severity-badge--${severity}`,
  ].join(' ');
}

function ScoreRing({
  score = 0,
}) {
  const radius = 49;

  const circumference =
    2 * Math.PI * radius;

  const offset =
    circumference -
    (score / 100) *
      circumference;

  return (
    <div className="score-ring">
      <svg
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle
          className="score-ring__track"
          cx="60"
          cy="60"
          r={radius}
        />

        <circle
          className="score-ring__progress"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
        />
      </svg>

      <div className="score-ring__value">
        <strong>
          {score}%
        </strong>

        <span>
          Match
        </span>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
}) {
  const [
    open,
    setOpen,
  ] = useState(false);

  return (
    <article className="question-card">

      <button
        type="button"
        className="question-card__header"
        onClick={() =>
          setOpen(
            (current) =>
              !current
          )
        }
        aria-expanded={open}
      >
        <div className="question-number">
          {String(index + 1).padStart(
            2,
            '0'
          )}
        </div>

        <div className="question-card__question">
          <span>
            Interview Question
          </span>

          <h3>
            {question.question}
          </h3>
        </div>

        <ChevronDown
          size={18}
          className={
            open
              ? 'question-chevron question-chevron--open'
              : 'question-chevron'
          }
        />
      </button>

      {open && (
        <div className="question-card__body">

          <div className="question-detail">
            <div className="question-detail__icon">
              <Target size={15} />
            </div>

            <div>
              <span>
                What the interviewer
                is assessing
              </span>

              <p>
                {question.intention}
              </p>
            </div>
          </div>

          <div className="question-detail">
            <div className="question-detail__icon">
              <Lightbulb size={15} />
            </div>

            <div>
              <span>
                Recommended answer
              </span>

              <p>
                {question.answer}
              </p>
            </div>
          </div>

        </div>
      )}
    </article>
  );
}

function InterviewReport() {
  const {
    interviewId,
  } = useParams();

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(Boolean(interviewId));

  const [error, setError] =
    useState(interviewId ? '' : 'Interview report not found.');

  const [activeTab, setActiveTab] =
    useState('overview');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      try {
        setLoading(true);
        setError('');

        const response =
          await getInterviewReport(
            interviewId,
            { signal: controller.signal }
          );

        if (!controller.signal.aborted) {
          setReport(
            response?.interviewReport
          );
        }
      } catch (error) {
        if (!controller.signal.aborted && !isCanceledRequest(error)) {
          setError(getApiErrorMessage(error, 'Unable to load this interview report.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (interviewId) {
      loadReport();
    }

    return () => controller.abort();
  }, [interviewId, reloadKey]);

  if (loading) {
    return <PageLoader message="Loading your interview report…" />;
  }

  if (error || !report) {
    return (
      <div className="report-error-page">
        <ErrorMessage
          message={
            error ||
            'Interview report not found.'
          }
        />

        <Link
          to="/interviews"
          className="button button--primary"
        >
          <ArrowLeft size={16} />
          Back to Interviews
        </Link>

        {interviewId && (
          <Button variant="secondary" onClick={() => setReloadKey(key => key + 1)}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  const score =
    Number(report.matchScore) || 0;

  return (
    <div className="report-page">

      {/* Header */}
      <header className="report-header">

        <Link
          to="/interviews"
          className="back-link"
        >
          <ArrowLeft size={15} />
          Back to Interviews
        </Link>

        <div className="report-header__main">

          <div className="report-company-icon">
            <FileText size={23} />
          </div>

          <div>
            <div className="report-title-row">
              <h1>
                {report.title ||
                  'Interview Report'}
              </h1>

              <Badge variant="success">
                Completed
              </Badge>
            </div>

            <p>
              AI-generated interview
              preparation report
            </p>
          </div>

        </div>

        <Link
          to={`/resume/${report._id}`}
          className="button button--secondary"
        >
          <FileText size={15} />
          Tailored Resume
        </Link>

      </header>

      {/* Tabs */}
      <div className="report-tabs">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={
              activeTab === tab.id
                ? 'report-tab report-tab--active'
                : 'report-tab'
            }
            onClick={() =>
              setActiveTab(tab.id)
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="report-content">

        {/* Overview */}
        {activeTab ===
          'overview' && (
          <>
            <section className="report-overview-grid">

              <article className="report-score-card">

                <div>
                  <span className="card-eyebrow">
                    Overall Match Score
                  </span>

                  <h2>
                    Your profile alignment
                  </h2>

                  <p>
                    Based on your resume,
                    background, and the
                    target job requirements.
                  </p>
                </div>

                <ScoreRing
                  score={score}
                />

              </article>

              <article className="skills-overview-card">

                <span className="card-eyebrow">
                  Skills Overview
                </span>

                <h2>
                  Your preparation
                  snapshot
                </h2>

                <div className="skill-meter">
                  <div>
                    <span>
                      Match Score
                    </span>

                    <strong>
                      {score}%
                    </strong>
                  </div>

                  <div className="meter">
                    <span
                      style={{
                        width: `${score}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="overview-stats">

                  <div>
                    <strong>
                      {
                        report
                          .technicalQuestions
                          ?.length ||
                        0
                      }
                    </strong>

                    <span>
                      Technical Questions
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        report
                          .behavioralQuestions
                          ?.length ||
                        0
                      }
                    </strong>

                    <span>
                      Behavioral Questions
                    </span>
                  </div>

                  <div>
                    <strong>
                      {
                        report.skillGaps
                          ?.length ||
                        0
                      }
                    </strong>

                    <span>
                      Skill Gaps
                    </span>
                  </div>

                </div>
              </article>

            </section>

            <section className="report-section">

              <div className="report-section__heading">
                <div>
                  <span className="card-eyebrow">
                    Key Insights
                  </span>

                  <h2>
                    Where to focus
                  </h2>
                </div>
              </div>

              <div className="insight-grid">

                <article className="insight-card">
                  <div className="insight-card__icon insight-card__icon--green">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <h3>
                      Strong alignment
                    </h3>

                    <p>
                      Your overall profile
                      has been compared
                      against the target
                      role requirements.
                    </p>
                  </div>
                </article>

                <article className="insight-card">
                  <div className="insight-card__icon insight-card__icon--purple">
                    <Sparkles size={18} />
                  </div>

                  <div>
                    <h3>
                      Personalized
                      questions
                    </h3>

                    <p>
                      Practice the technical
                      and behavioral questions
                      generated specifically for
                      this role.
                    </p>
                  </div>
                </article>

                <article className="insight-card">
                  <div className="insight-card__icon insight-card__icon--amber">
                    <CircleAlert size={18} />
                  </div>

                  <div>
                    <h3>
                      Close skill gaps
                    </h3>

                    <p>
                      Focus on the skills
                      identified by the AI
                      comparison before your
                      interview.
                    </p>
                  </div>
                </article>

              </div>
            </section>
          </>
        )}

        {/* Technical */}
        {activeTab ===
          'technical' && (
          <section className="report-section">

            <div className="report-section__heading">
              <div>
                <span className="card-eyebrow">
                  Technical Preparation
                </span>

                <h2>
                  Technical Questions
                </h2>

                <p>
                  Practice explaining your
                  thinking clearly and
                  connecting your answers
                  to the target role.
                </p>
              </div>
            </div>

            <div className="question-list">
              {(
                report
                  .technicalQuestions ||
                []
              ).map(
                (question, index) => (
                  <QuestionCard
                    key={`${index}-${question.question}`}
                    question={question}
                    index={index}
                  />
                )
              )}
            </div>

          </section>
        )}

        {/* Behavioral */}
        {activeTab ===
          'behavioral' && (
          <section className="report-section">

            <div className="report-section__heading">
              <div>
                <span className="card-eyebrow">
                  Behavioral Preparation
                </span>

                <h2>
                  Behavioral Questions
                </h2>

                <p>
                  Prepare structured stories
                  and examples that demonstrate
                  your strengths.
                </p>
              </div>
            </div>

            <div className="question-list">
              {(
                report
                  .behavioralQuestions ||
                []
              ).map(
                (question, index) => (
                  <QuestionCard
                    key={`${index}-${question.question}`}
                    question={question}
                    index={index}
                  />
                )
              )}
            </div>

          </section>
        )}

        {/* Skills */}
        {activeTab ===
          'skills' && (
          <section className="report-section">

            <div className="report-section__heading">
              <div>
                <span className="card-eyebrow">
                  Gap Analysis
                </span>

                <h2>
                  Skill Gaps
                </h2>

                <p>
                  Areas worth strengthening
                  before your interview.
                </p>
              </div>
            </div>

            <div className="skill-gap-list">
              {(
                report.skillGaps ||
                []
              ).map(
                (gap, index) => (
                  <article
                    className="skill-gap-card"
                    key={`${index}-${gap.skill}`}
                  >
                    <div className="skill-gap-card__icon">
                      <Target size={17} />
                    </div>

                    <div className="skill-gap-card__main">
                      <h3>
                        {gap.skill}
                      </h3>

                      <p>
                        Strengthen your
                        understanding and
                        interview readiness
                        around this area.
                      </p>
                    </div>

                    <span
                      className={severityClass(
                        gap.severity
                      )}
                    >
                      {gap.severity}
                    </span>
                  </article>
                )
              )}
            </div>

          </section>
        )}

        {/* Preparation Plan */}
        {activeTab ===
          'plan' && (
          <section className="report-section">

            <div className="report-section__heading">
              <div>
                <span className="card-eyebrow">
                  Your Roadmap
                </span>

                <h2>
                  Preparation Plan
                </h2>

                <p>
                  Follow this plan to focus
                  your preparation efficiently.
                </p>
              </div>
            </div>

            <div className="preparation-timeline">
              {(
                report
                  .preparationPlan ||
                []
              ).map(
                (day, index) => (
                  <article
                    className="plan-card"
                    key={`${day.day}-${index}`}
                  >
                    <div className="plan-day">
                      <span>
                        DAY
                      </span>

                      <strong>
                        {day.day}
                      </strong>
                    </div>

                    <div className="plan-content">
                      <h3>
                        {day.focus}
                      </h3>

                      <ul>
                        {(
                          day.tasks ||
                          []
                        ).map(
                          (
                            task,
                            taskIndex
                          ) => (
                            <li
                              key={
                                taskIndex
                              }
                            >
                              <CheckCircle2
                                size={14}
                              />
                              {task}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </article>
                )
              )}
            </div>

          </section>
        )}

      </div>
    </div>
  );
}

export default InterviewReport;
