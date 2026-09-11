import {
  ArrowRight,
  CalendarDays,
  Trash2,
} from 'lucide-react';

import { Link } from 'react-router';

import Badge from '../../../components/ui/Badge';

function formatDate(date) {
  if (!date) {
    return 'Recently';
  }

  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
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
  ).format(parsed);
}

function InterviewCard({
  interview,
  onDelete,
}) {
  const score =
    typeof interview?.matchScore ===
    'number'
      ? interview.matchScore
      : 0;

  return (
    <article className="history-card">
      <Link to={`/interviews/report/${interview._id}`} className="history-card__link" aria-label={`Open ${interview?.title || 'interview report'}`}>
      <div className="history-card__avatar">
        {interview?.title
          ?.charAt(0)
          ?.toUpperCase() || 'I'}
      </div>

      <div className="history-card__main">
        <h3>
          {interview?.title ||
            'Interview Preparation'}
        </h3>

        <div className="history-card__meta">
          <span>
            <CalendarDays size={13} />
            {formatDate(
              interview?.createdAt
            )}
          </span>

          <Badge variant="success">
            Completed
          </Badge>
        </div>
      </div>

      <div className="history-card__score">
        <strong>
          {score}%
        </strong>

        <span>
          Match Score
        </span>
      </div>

      <div className="history-card__arrow">
        <ArrowRight size={17} />
      </div>
      </Link>
      <button
        type="button"
        className="history-card__delete"
        aria-label={`Delete ${interview?.title || 'interview report'}`}
        onClick={() => onDelete?.(interview)}
      >
        <Trash2 size={16} />
      </button>
    </article>
  );
}

export default InterviewCard;
