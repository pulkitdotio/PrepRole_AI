import { useId } from 'react';
import { FileText, RefreshCw, Trash2, Upload } from 'lucide-react';

const MAX_FILE_SIZE = 3 * 1024 * 1024;

function ResumeUpload({ file, onChange, error, disabled = false }) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  const chooseFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) onChange(selectedFile);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (disabled) return;
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) onChange(droppedFile);
  };

  const isValidFile = file && file.type === 'application/pdf' && file.size > 0 && file.size <= MAX_FILE_SIZE;

  return (
    <div className="resume-upload">
      {!file ? (
        <label className={['resume-dropzone', disabled ? 'resume-dropzone--disabled' : ''].filter(Boolean).join(' ')} htmlFor={inputId} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <input
            id={inputId}
            className="visually-hidden"
            type="file"
            accept="application/pdf,.pdf"
            onChange={chooseFile}
            aria-describedby={[helpId, error ? errorId : ''].filter(Boolean).join(' ')}
            disabled={disabled}
          />
          <div className="resume-dropzone__icon"><Upload size={24} aria-hidden="true" /></div>
          <h3>Upload your resume</h3>
          <p>Drag and drop your PDF here, or click to browse.</p>
          <span id={helpId}>PDF only · Maximum 3 MB</span>
        </label>
      ) : (
        <div className={['resume-file', !isValidFile ? 'resume-file--error' : ''].filter(Boolean).join(' ')}>
          <div className="resume-file__icon"><FileText size={21} aria-hidden="true" /></div>
          <div className="resume-file__info">
            <strong>{file.name}</strong>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="resume-file__actions">
            <label className="resume-file__replace" htmlFor={inputId}>
              <input
                id={inputId}
                className="visually-hidden"
                type="file"
                accept="application/pdf,.pdf"
                onChange={chooseFile}
                aria-label="Replace resume"
                aria-describedby={error ? errorId : undefined}
                disabled={disabled}
              />
              <RefreshCw size={16} aria-hidden="true" />
              Replace
            </label>
            <button type="button" className="resume-file__remove" onClick={() => onChange(null)} aria-label="Remove resume" disabled={disabled}>
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  );
}

export default ResumeUpload;
