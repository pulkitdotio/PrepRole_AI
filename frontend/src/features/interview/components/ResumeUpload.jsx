import { FileText, Trash2, Upload } from 'lucide-react';

const MAX_FILE_SIZE = 3 * 1024 * 1024;

function ResumeUpload({ file, onChange, error }) {
  const chooseFile = (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) onChange(selectedFile);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) onChange(droppedFile);
  };

  const isValidFile = file && file.type === 'application/pdf' && file.size > 0 && file.size <= MAX_FILE_SIZE;

  return (
    <div className="resume-upload">
      {!file ? (
        <label className="resume-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
          <input type="file" accept="application/pdf,.pdf" onChange={chooseFile} hidden />
          <div className="resume-dropzone__icon"><Upload size={24} /></div>
          <h3>Upload your resume</h3>
          <p>Drag and drop your PDF here, or click to browse.</p>
          <span>PDF only · Maximum 3 MB</span>
        </label>
      ) : (
        <div className={['resume-file', !isValidFile ? 'resume-file--error' : ''].filter(Boolean).join(' ')}>
          <div className="resume-file__icon"><FileText size={21} /></div>
          <div className="resume-file__info">
            <strong>{file.name}</strong>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <button type="button" className="resume-file__remove" onClick={() => onChange(null)} aria-label="Remove resume">
            <Trash2 size={17} />
          </button>
        </div>
      )}
      {error && <p className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export default ResumeUpload;
