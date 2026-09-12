import {
  Download,
  RefreshCw,
} from 'lucide-react';
import Button from '../../../components/ui/Button';

function ResumeActions({
  pdfUrl,
  loading,
  onGenerate,
}) {
  const handleDownload = () => {
    if (!pdfUrl) {
      return;
    }

    const link =
      document.createElement('a');

    link.href = pdfUrl;

    link.download =
      'PrepRole-AI-Tailored-Resume.pdf';

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  };

  return (
    <div className="resume-actions">

      <Button
        variant="secondary"
        onClick={onGenerate}
        loading={loading}
        loadingLabel="Generating resume…"
        icon={<RefreshCw size={15} aria-hidden="true" />}
      >
        Edit & Regenerate
      </Button>

      <Button
        onClick={handleDownload}
        disabled={
          loading || !pdfUrl
        }
        icon={<Download size={15} aria-hidden="true" />}
      >
        Download PDF
      </Button>

    </div>
  );
}

export default ResumeActions;
