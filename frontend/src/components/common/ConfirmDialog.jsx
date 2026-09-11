import { useEffect, useRef } from 'react';
import Button from '../ui/Button';

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  loading = false,
  onConfirm,
  onCancel,
  children,
}) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !loading) onCancel();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="confirm-dialog__backdrop">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        {children}
        <div className="confirm-dialog__actions">
          <Button ref={cancelRef} variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

export default ConfirmDialog;
