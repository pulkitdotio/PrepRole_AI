import { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { useAuth } from '../../../context/useAuth';
import { getApiErrorMessage } from '../../../services/apiError';

function AccountSettings() {
  const navigate = useNavigate();
  const { user, deleteAccount } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const deletingRef = useRef(false);

  const close = () => {
    if (loading) return;
    setOpen(false);
    setPassword('');
    setError('');
  };

  const confirm = async () => {
    if (deletingRef.current) return;
    if (password.length < 8) {
      setError('Enter your current password to continue.');
      return;
    }
    try {
      deletingRef.current = true;
      setLoading(true);
      setError('');
      await deleteAccount(password);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to delete your account. Please try again.'));
    } finally {
      deletingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="account-settings-page">
      <header className="page-header">
        <div>
          <span className="page-eyebrow">Account</span>
          <h1>Settings</h1>
          <p>Manage the data associated with {user?.email || 'your PrepAI account'}.</p>
        </div>
      </header>

      <section className="danger-zone" aria-labelledby="delete-account-heading">
        <div>
          <span className="page-eyebrow">Danger zone</span>
          <h2 id="delete-account-heading">Delete account and saved data</h2>
          <p>
            Permanently delete your account, interview reports, extracted resume text,
            job descriptions, and self-descriptions. This action cannot be undone.
          </p>
        </div>
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </section>

      <ConfirmDialog
        open={open}
        title="Permanently delete your account?"
        description="Enter your current password, then confirm. All saved interview preparation data will be removed."
        confirmLabel="Delete my account"
        loading={loading}
        onCancel={close}
        onConfirm={confirm}
      >
        <div className="confirm-dialog__field">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            disabled={loading}
            error={error}
            required
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}

export default AccountSettings;
