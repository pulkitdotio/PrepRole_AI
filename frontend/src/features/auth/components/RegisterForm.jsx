import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getAuthDestination } from '../authRedirect';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useAuth } from '../../../context/useAuth';
import { getApiErrorMessage } from '../../../services/apiError';

function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { register } = useAuth();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(
        'Please fill in all required fields.'
      );
      return;
    }

    if (form.username.trim().length < 3) {
      setError(
        'Username must be at least 3 characters.'
      );
      return;
    }

    if (form.password.length < 8) {
      setError(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate(getAuthDestination(location.state?.from), {
        replace: true,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <ErrorMessage message={error} />

      <Input
        label="Username"
        name="username"
        type="text"
        placeholder="Enter your username"
        value={form.username}
        onChange={handleChange}
        autoComplete="username"
        disabled={loading}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
        disabled={loading}
        required
      />

      <div className="password-field">
        <Input
          label="Password"
          name="password"
          type={
            showPassword
              ? 'text'
              : 'password'
          }
          placeholder="Minimum 8 characters"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          disabled={loading}
          required
        />

        <button
          type="button"
          className="password-toggle"
          disabled={loading}
          onClick={() =>
            setShowPassword(
              (current) => !current
            )
          }
          aria-label={
            showPassword
              ? 'Hide password'
              : 'Show password'
          }
        >
          {showPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>

      <div className="password-field">
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={
            showConfirmPassword
              ? 'text'
              : 'password'
          }
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          disabled={loading}
          required
        />

        <button
          type="button"
          className="password-toggle"
          disabled={loading}
          onClick={() =>
            setShowConfirmPassword(
              (current) => !current
            )
          }
          aria-label={
            showConfirmPassword
              ? 'Hide password'
              : 'Show password'
          }
        >
          {showConfirmPassword ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}
        </button>
      </div>

      <Button
        type="submit"
        loading={loading}
        loadingLabel="Creating account…"
        size="large"
        className="auth-submit"
      >
        Create Account
      </Button>
    </form>
  );
}

export default RegisterForm;
