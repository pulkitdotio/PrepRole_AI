import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
} from 'lucide-react';

import {
  Link,
  useNavigate,
} from 'react-router';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import InterviewStepper from '../components/InterviewStepper';
import InterviewForm from '../components/InterviewForm';
import ResumeUpload from '../components/ResumeUpload';

import Button from '../../../components/ui/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

import {
  generateInterviewReport,
} from '../interview.api';
import { getApiErrorMessage } from '../../../services/apiError';
import { generationMessages, nextGenerationMessage } from '../generationStatus';

const initialValues = {
  jobTitle: '',
  companyName: '',
  selfDescription: '',
  jobDescription: '',
};

function CreateInterview() {
  const navigate = useNavigate();

  const [step, setStep] =
    useState(1);

  const [values, setValues] =
    useState(initialValues);

  const [resume, setResume] =
    useState(null);

  const [errors, setErrors] =
    useState({});

  const [submitError, setSubmitError] =
    useState('');

  const [loading, setLoading] =
    useState(false);
  const loadingRef = useRef(false);
  const [generationMessageIndex, setGenerationMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setInterval(() => {
      setGenerationMessageIndex(nextGenerationMessage);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [loading]);

  const validateStepOne = () => {
    const nextErrors = {};

    if (values.jobTitle.length > 160) nextErrors.jobTitle = 'Job title must be 160 characters or fewer.';
    if (values.companyName.length > 160) nextErrors.companyName = 'Company name must be 160 characters or fewer.';
    if (values.jobDescription.length > 5000) nextErrors.jobDescription = 'Job description must be 5,000 characters or fewer.';
    if (values.selfDescription.length > 2000) nextErrors.selfDescription = 'Self-description must be 2,000 characters or fewer.';

    if (
      !values.jobTitle.trim()
    ) {
      nextErrors.jobTitle =
        'Job title is required.';
    }

    if (
      !values.selfDescription.trim()
    ) {
      nextErrors.selfDescription =
        'Please tell us about yourself.';
    }

    if (
      !values.jobDescription.trim()
    ) {
      nextErrors.jobDescription =
        'Job description is required.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const validateStepTwo = () => {
    const nextErrors = {};

    if (!resume) {
      nextErrors.resume =
        'Please upload your resume.';
    } else if (resume.size === 0) {
      nextErrors.resume = 'Please choose a non-empty PDF.';
    } else if (
      resume.type !==
      'application/pdf'
    ) {
      nextErrors.resume =
        'Only PDF files are allowed.';
    } else if (
      resume.size >
      3 * 1024 * 1024
    ) {
      nextErrors.resume =
        'Resume must be smaller than 3 MB.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const handleNext = () => {
    setSubmitError('');

    if (step === 1) {
      if (validateStepOne()) {
        setStep(2);
      }

      return;
    }

    if (step === 2) {
      if (validateStepTwo()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setSubmitError('');

    if (step > 1) {
      setStep(
        (current) =>
          current - 1
      );
    }
  };

  const handleGenerate = async () => {
    if (loadingRef.current) return;
    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (!validateStepTwo()) {
      setStep(2);
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setGenerationMessageIndex(0);
      setSubmitError('');

      /*
       * The backend currently receives one
       * jobDescription field.
       *
       * We include the optional title and
       * company information in that field
       * so the AI can use them too.
       */
      const jobDescription = [
        `Target Job Title: ${values.jobTitle.trim()}`,

        values.companyName.trim()
          ? `Company: ${values.companyName.trim()}`
          : '',

        '',
        'Job Description:',
        values.jobDescription.trim(),
      ]
        .filter(
          (value) =>
            value !== undefined &&
            value !== null
        )
        .join('\n');

      const response =
        await generateInterviewReport({
          resume,
          selfDescription:
            values.selfDescription.trim(),
          jobDescription,
        });

      const report =
        response?.interviewReport;

      if (!report?._id) {
        throw new Error(
          'The interview report was generated but no report ID was returned.'
        );
      }

      navigate(
        `/interviews/report/${report._id}`,
        {
          replace: true,
        }
      );
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Unable to generate your interview report. Please try again.'));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="interview-page">

      <div className="interview-page__topbar">

        <Link
          to="/dashboard"
          className="back-link"
          aria-disabled={loading}
          onClick={event => { if (loading) event.preventDefault(); }}
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>

      </div>

      <div className="interview-container">

        <div className="interview-heading">

          <div>
            <div className="page-eyebrow">
              <Sparkles size={13} />
              AI Interview Preparation
            </div>

            <h1>
              Create New Interview
            </h1>

            <p>
              Provide your details and
              let AI generate a personalized
              interview preparation report
              for you.
            </p>
          </div>

        </div>

        <InterviewStepper
          currentStep={step}
        />

        {submitError && (
          <div className="interview-error">
            <ErrorMessage
              message={submitError}
            />
          </div>
        )}

        {loading && (
          <div className="generation-status" role="status" aria-live="polite">
            <LoaderCircle size={18} className="spin" aria-hidden="true" />
            <div>
              <strong>{generationMessages[generationMessageIndex]}</strong>
              <span>This can take a moment. Keep this page open while PrepAI works.</span>
            </div>
          </div>
        )}

        <div className="interview-card">

          {step === 1 && (
            <InterviewForm
              values={values}
              onChange={setValues}
              errors={errors}
            />
          )}

          {step === 2 && (
            <div className="resume-step">

              <div className="form-section-heading">
                <div className="form-section-heading__icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2>
                    Upload Resume
                  </h2>

                  <p>
                    Upload the resume you
                    want AI to analyze.
                  </p>
                </div>
              </div>

              <ResumeUpload
                file={resume}
                onChange={(file) => {
                  setResume(file);

                  setErrors(
                    {}
                  );
                }}
                error={errors.resume}
              />

              <div className="resume-tip">
                <CheckCircle2 size={16} />

                <span>
                  Your resume is processed
                  securely and is used to
                  generate this preparation
                  report.
                </span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="review-step">

              <div className="form-section-heading">
                <div className="form-section-heading__icon">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2>
                    Review & Generate
                  </h2>

                  <p>
                    Everything looks good.
                    Generate your personalized
                    report.
                  </p>
                </div>
              </div>

              <div className="review-grid">

                <div className="review-item">
                  <span>
                    Target Role
                  </span>

                  <strong>
                    {values.jobTitle}
                  </strong>
                </div>

                <div className="review-item">
                  <span>
                    Company
                  </span>

                  <strong>
                    {values.companyName ||
                      'Not specified'}
                  </strong>
                </div>

                <div className="review-item review-item--full">
                  <span>
                    Resume
                  </span>

                  <strong>
                    {resume?.name}
                  </strong>
                </div>

                <div className="review-item review-item--full">
                  <span>
                    Job Description
                  </span>

                  <p>
                    {values.jobDescription}
                  </p>
                </div>

              </div>

              <div className="generate-notice">
                <Sparkles size={18} />

                <div>
                  <strong>
                    AI will generate:
                  </strong>

                  <p>
                    Match score, technical
                    questions, behavioral
                    questions, skill gaps, and
                    a personalized preparation
                    plan.
                  </p>
                </div>
              </div>

            </div>
          )}

          <div className="interview-actions">

            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={
                step === 1 ||
                loading
              }
            >
              <ArrowLeft size={15} />
              Back
            </Button>

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next Step
                <ArrowRight size={15} />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="large"
                onClick={
                  handleGenerate
                }
                loading={loading}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoaderCircle
                      size={16}
                      className="spin"
                    />
                    Generating report…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Interview Report
                  </>
                )}
              </Button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateInterview;
