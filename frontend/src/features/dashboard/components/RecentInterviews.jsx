import {
  ArrowRight,
  CalendarDays,
  FileText,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router';

import Badge from '../../../components/ui/Badge';

function formatDate(date) {
  if (!date) {
    return 'Recently';
  }

  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  ).format(parsedDate);
}

function getInitials(title) {
  if (!title) {
    return 'AI';
  }

  const words =
    title
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  return words
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join('')
    .toUpperCase();
}

function RecentInterviews({
  interviews = [],
}) {
  const navigate = useNavigate();

  const recent =
    interviews.slice(0, 5);

  const handleOpenInterview = (
    interviewId
  ) => {
    if (!interviewId) {
      return;
    }

    navigate(
      `/interviews/report/${interviewId}`
    );
  };

  return (
    <section className="dashboard-section">

      {/* Section heading */}
      <div className="section-heading">

        <div>
          <span className="section-eyebrow">
            Your latest work
          </span>

          <h2>
            Recent Interview Reports
          </h2>
        </div>

        <Link
          to="/interviews"
          className="section-link"
        >
          View history

          <ArrowRight size={15} />
        </Link>

      </div>

      {/* Interview list */}
      <div className="interview-list">

        {recent.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state__icon">
              <FileText size={23} />
            </div>

            <h3>
              No interviews yet
            </h3>

            <p>
              Create your first interview
              preparation report to see it
              here.
            </p>

            <Link
              to="/interviews/new"
              className="button button--primary button--small"
            >
              Create Interview
            </Link>

          </div>

        ) : (

          recent.map((interview) => {

            const title =
              interview?.title ||
              'Interview Preparation';

            const score =
              typeof interview?.matchScore ===
              'number'
                ? interview.matchScore
                : 0;

            return (
              <article
                className="interview-row"
                key={interview._id}
              >

                {/* Company/title avatar */}
                <div className="company-avatar">
                  {getInitials(title)}
                </div>

                {/* Main information */}
                <div className="interview-row__main">

                  <strong>
                    {title}
                  </strong>

                  <div className="interview-meta">

                    <span>
                      AI Generated Report
                    </span>

                    <span>
                      <CalendarDays
                        size={13}
                      />

                      {formatDate(
                        interview.createdAt
                      )}
                    </span>

                  </div>

                </div>

                {/* Status */}
                <Badge variant="success">
                  Completed
                </Badge>

                {/* Score */}
                <div className="match-score">

                  <strong>
                    {score}%
                  </strong>

                  <span>
                    Match Score
                  </span>

                </div>

                {/* Open */}
                <button
                  type="button"
                  className="row-arrow"
                  aria-label={`Open ${title}`}
                  onClick={() =>
                    handleOpenInterview(
                      interview._id
                    )
                  }
                >
                  <ArrowRight size={17} />
                </button>

              </article>
            );
          })
        )}

      </div>
    </section>
  );
}

export default RecentInterviews;
