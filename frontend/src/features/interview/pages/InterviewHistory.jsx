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
  useRef,
  useState,
} from 'react';

import InterviewList from '../components/InterviewList';

import PageLoader from '../../../components/common/PageLoader';
import ErrorMessage from '../../../components/common/ErrorMessage';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import Button from '../../../components/ui/Button';

import {
  getInterviewReports,
  deleteInterviewReport,
} from '../interview.api';
import { HISTORY_PAGE_SIZE, parseHistoryPage } from '../pagination';
import { getApiErrorMessage, isCanceledRequest } from '../../../services/apiError';

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
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const deletingRef = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const requested = searchParams.get('page');
    if (requested !== null && String(page) !== requested) {
      setSearchParams(page > 1 ? { page: String(page) } : {}, { replace: true });
    }
  }, [page, searchParams, setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReports() {
      try {
        setLoading(true);
        setError('');
        const response =
          await getInterviewReports({ page, limit: HISTORY_PAGE_SIZE, signal: controller.signal });

        if (!controller.signal.aborted) {
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
        if (!controller.signal.aborted && !isCanceledRequest(error)) {
          setError(getApiErrorMessage(error, 'Unable to load interview history.'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReports();

    return () => {
      controller.abort();
    };
  }, [page, reloadKey, setSearchParams]);

  const goToPage = (nextPage) => {
    setSearchParams(nextPage > 1 ? { page: String(nextPage) } : {});
  };

  const confirmDelete = async () => {
    if (!pendingDelete?._id || deletingRef.current) return;
    const interviewId = pendingDelete._id;
    try {
      deletingRef.current = true;
      setDeleting(true);
      setError('');
      await deleteInterviewReport(interviewId);
      if (interviews.length === 1 && page > 1) {
        goToPage(page - 1);
      } else {
        setInterviews(current => current.filter(item => item._id !== interviewId));
        setPagination(current => {
          const totalItems = Math.max(0, current.totalItems - 1);
          const totalPages = Math.ceil(totalItems / current.limit);
          return {
            ...current,
            totalItems,
            totalPages,
            hasNextPage: current.page < totalPages,
            hasPreviousPage: current.page > 1,
          };
        });
      }
      setPendingDelete(null);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete the interview report.'));
    } finally {
      deletingRef.current = false;
      setDeleting(false);
    }
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
    return <PageLoader message="Loading interview history…" />;
  }

  return (
    <div className="history-page">

      <header className="page-header">

        <div>
          <span className="page-eyebrow">
            Preparation history
          </span>

          <h1>
            Interview History
          </h1>

          <p>
            Revisit your role preparation reports and continue where you left off.
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
        <div className="page-error page-error--with-action">
          <ErrorMessage message={error} />
          <Button variant="secondary" size="small" onClick={() => setReloadKey(key => key + 1)}>Retry</Button>
        </div>
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

      <p className="history-search-note">Search covers the reports shown on this page.</p>

      <InterviewList
        interviews={
          filteredInterviews
        }
        onDelete={setPendingDelete}
        emptyTitle={search.trim() ? 'No matches on this page' : 'No interview reports yet'}
        emptyMessage={search.trim() ? 'Try another title or move to a different history page.' : 'Your generated interview reports will appear here.'}
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

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete interview report?"
        description="This permanently deletes the saved report and its retained resume and job context."
        confirmLabel="Delete report"
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

    </div>
  );
}

export default InterviewHistory;
