import {
  BriefcaseBusiness,
  FileText,
} from 'lucide-react';

import Input from '../../../components/ui/Input';
import Textarea from '../../../components/ui/Textarea';

function InterviewForm({
  values,
  onChange,
  errors = {},
}) {
  const updateField = (
    field,
    value
  ) => {
    onChange({
      ...values,
      [field]: value,
    });
  };

  return (
    <div className="interview-form">

      <div className="form-section-heading">
        <div className="form-section-heading__icon">
          <BriefcaseBusiness size={18} />
        </div>

        <div>
          <h2>
            Basic Information
          </h2>

          <p>
            Tell us about the role you're
            preparing for.
          </p>
        </div>
      </div>

      <div className="form-grid">

        <Input
          label="Target Job Title"
          placeholder="e.g. Senior Frontend Developer"
          value={
            values.jobTitle
          }
          onChange={(event) =>
            updateField(
              'jobTitle',
              event.target.value
            )
          }
          error={errors.jobTitle}
          maxLength={160}
          required
        />

        <Input
          label="Company Name"
          placeholder="e.g. Google"
          value={
            values.companyName
          }
          onChange={(event) =>
            updateField(
              'companyName',
              event.target.value
            )
          }
          error={errors.companyName}
          maxLength={160}
        />

      </div>

      <Textarea
        label="Self Description / About Me"
        placeholder="Tell us about yourself, your experience, skills, and career goals..."
        value={
          values.selfDescription
        }
        onChange={(event) =>
          updateField(
            'selfDescription',
            event.target.value
          )
        }
        error={
          errors.selfDescription
        }
        required
        maxLength={2000}
        showCount
      />

      <Textarea
        label="Job Description"
        placeholder="Paste the job description here..."
        value={
          values.jobDescription
        }
        onChange={(event) =>
          updateField(
            'jobDescription',
            event.target.value
          )
        }
        error={
          errors.jobDescription
        }
        required
        maxLength={5000}
        showCount
      />

      <div className="form-info-box">
        <FileText size={16} />

        <p>
          We'll compare your background
          with the job requirements and
          generate personalized interview
          preparation.
        </p>
      </div>
    </div>
  );
}

export default InterviewForm;
