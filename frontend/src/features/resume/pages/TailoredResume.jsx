import {
  ArrowLeft,
  FileText,
  Sparkles,
} from 'lucide-react';

import {
  Link,
  useParams,
} from 'react-router';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import ResumePreview from '../components/ResumePreview';
import ResumeActions from '../components/ResumeActions';

import {
  getInterviewReport,
} from '../../interview/interview.api';

import {
  generateResumePDF,
} from '../resume.api';

import ErrorMessage from '../../../components/common/ErrorMessage';
import PageLoader from '../../../components/common/PageLoader';
import Button from '../../../components/ui/Button';
import { getApiErrorMessage, isCanceledRequest } from '../../../services/apiError';

function TailoredResume() {
  const {
    interviewId,
  } = useParams();

  const [report, setReport] =
    useState(null);

  const [pdfUrl, setPdfUrl] =
    useState('');

  const [loading, setLoading] =
    useState(Boolean(interviewId));

  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState('');
  const [loadError, setLoadError] = useState(interviewId ? '' : 'Interview report not found.');
  const [reloadKey, setReloadKey] = useState(0);
  const generatingRef = useRef(false);

  const generate = async () => {
    if (!interviewId || generatingRef.current) {
      return;
    }

    try {
      generatingRef.current = true;
      setGenerating(true);
      setError('');

      const pdfBlob =
        await generateResumePDF(
          interviewId
        );

      const nextUrl =
        URL.createObjectURL(
          pdfBlob
        );

      setPdfUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(
            oldUrl
          );
        }

        return nextUrl;
      });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to generate the tailored resume.'));
    } finally {
      generatingRef.current = false;
      setGenerating(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      try {
        setLoading(true);
        setLoadError('');
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
          setLoadError(getApiErrorMessage(error, 'Unable to load interview report.'));
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

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(
          pdfUrl
        );
      }
    };
  }, [pdfUrl]);

  if (loading) {
    return <PageLoader message="Loading resume details…" />;
  }

  if (loadError || !report) {
    return (
      <div className="report-error-page">
        <ErrorMessage message={loadError || 'Interview report not found.'} />
        <Link to="/interviews" className="button button--primary">
          <ArrowLeft size={16} />
          Back to Interviews
        </Link>
        {interviewId && (
          <Button variant="secondary" onClick={() => setReloadKey(key => key + 1)}>Retry</Button>
        )}
      </div>
    );
  }

  return (
    <div className="resume-page">

      <header className="resume-page__header">

        <Link
          to={`/interviews/report/${interviewId}`}
          className="back-link"
        >
          <ArrowLeft size={15} />
          Back to Report
        </Link>

        <div className="resume-title">

          <div className="resume-title__icon">
            <FileText size={20} />
          </div>

          <div>
            <span className="page-eyebrow">
              Report companion
            </span>

            <h1>
              Tailored Resume
            </h1>

            <p>
              A resume optimized for{' '}
              <strong>
                {report?.title ||
                  'your target role'}
              </strong>
              .
            </p>
          </div>

        </div>

      </header>

      {error && (
        <div className="resume-error">
          <ErrorMessage
            message={error}
          />
        </div>
      )}

      <section className="resume-layout">

        <div className="resume-info-panel">

          <div className="resume-info-card">

            <div className="resume-info-card__icon">
              <Sparkles size={19} />
            </div>

            <h2>
              Make your resume
              job-ready
            </h2>

            <p>
              PrepRole AI uses your original
              resume, self-description, and
              target job description to create
              an ATS-friendly tailored resume.
            </p>

            <ul>
              <li>
                <span>✓</span>
                No invented experience
              </li>

              <li>
                <span>✓</span>
                Tailored to the target role
              </li>

              <li>
                <span>✓</span>
                ATS-friendly formatting
              </li>
            </ul>

          </div>

          <ResumeActions
            pdfUrl={pdfUrl}
            loading={generating}
            onGenerate={generate}
          />

        </div>

        <div className="resume-preview-wrapper">

          <ResumePreview
            pdfUrl={pdfUrl}
            loading={generating}
          />

          {!pdfUrl &&
            !generating && (
              <Button
                className="resume-generate-button"
                onClick={generate}
                icon={<Sparkles size={16} aria-hidden="true" />}
              >
                Generate Tailored Resume
              </Button>
            )}

        </div>

      </section>
    </div>
  );
}

export default TailoredResume;
