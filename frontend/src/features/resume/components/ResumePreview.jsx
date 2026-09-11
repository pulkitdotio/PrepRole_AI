import {
  FileText,
  LoaderCircle,
} from 'lucide-react';

function ResumePreview({
  pdfUrl,
  loading = false,
}) {
  if (loading) {
    return (
      <div className="resume-preview resume-preview--loading" role="status" aria-live="polite">
        <LoaderCircle
          size={30}
          className="spin"
        />

        <p>
          Generating your tailored resume… This may take a moment.
        </p>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="resume-preview resume-preview--empty">
        <div className="resume-preview__empty-icon">
          <FileText size={25} />
        </div>

        <h3>
          Resume preview
        </h3>

        <p>
          Generate your tailored resume
          to preview it here.
        </p>
      </div>
    );
  }

  return (
    <div className="resume-preview">
      <iframe
        src={pdfUrl}
        title="Tailored resume preview"
      />
    </div>
  );
}

export default ResumePreview;
