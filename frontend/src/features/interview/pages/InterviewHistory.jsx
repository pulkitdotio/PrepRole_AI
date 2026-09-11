import {
  Plus,
  Search,
} from 'lucide-react';

import {
  Link,
  useSearchParams,
} from 'react-router';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import InterviewList from '../components/InterviewList';

import PageLoader from '../../../components/common/PageLoader';
import ErrorMessage from '../../../components/common/ErrorMessage';

import {
  getInterviewReports,
} from '../interview.api';
import { HISTORY_PAGE_SIZE, parseHistoryPage } from '../pagination';

const emptyPagination = {
  page: 1, limit: HISTORY_PAGE_SIZE, totalItems: 0, totalPages: 0,
  hasNextPage: false, hasPreviousPage: false,
};

function InterviewHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseHistoryPage(searchParams.get('page'));
  const [interviews, setInterviews] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');
  const [pagination, setPagination] = useState(emptyPagination);

  useEffect(() => {
    const requested = searchParams.get('page');
    if (requested !== null && String(page) !== requested) {
      setSearchParams(page > 1 ? { page: String(page) } : {}, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      try {
        const response =
          await getInterviewReports({ page, limit: HISTORY_PAGE_SIZE });

        if (mounted) {
          const nextPagination = response?.pagination;
          if (nextPagination?.totalPages > 0 && page > nextPagination.totalPages) {
            setSearchParams(
              nextPagination.totalPages > 1 ? { page: String(nextPagination.totalPages) } : {},
              { replace: true }
            );
            return;
          }
          setInterviews(
            response?.interviewReports ||
              []
          );
          setPagination(nextPagination || emptyPagination);
        }
      } catch (error) {
        if (mounted) {
          setError(
            error?.response?.data
              ?.message ||
              'Unable to load interview history.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, [page, setSearchParams]);

  const goToPage = (nextPage) => {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
  };

  const filteredInterviews =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return interviews;
      }

      return interviews.filter(
        (interview) =>
          interview?.title
            ?.toLowerCase()
            .includes(query)
      );
    }, [interviews, search]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="history-page">

      <header className="page-header">

        <div>
          <span className="page-eyebrow">
            Preparation history
          </span>

          <h1>
            My Interviews
          </h1>

          <p>
            View and manage all your
            interview preparation reports.
          </p>
        </div>

        <Link
          to="/interviews/new"
          className="button button--primary"
        >
          <Plus size={16} />
          New Interview
        </Link>

      </header>

      {error && (
        <ErrorMessage
          message={error}
        />
      )}

      <div className="history-toolbar">

        <div className="history-search">
          <Search size={16} />

          <input
            type="search"
            placeholder="Search this page..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

      </div>

      <InterviewList
        interviews={
          filteredInterviews
        }
      />

      {pagination.totalPages > 0 && (
        <nav className="history-pagination" aria-label="Interview history pages">
          <button
            type="button"
            className="button button--secondary button--small"
            disabled={!pagination.hasPreviousPage || loading}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </button>
          <span aria-live="polite">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="button button--secondary button--small"
            disabled={!pagination.hasNextPage || loading}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}

    </div>
  );
}

export default InterviewHistory;
