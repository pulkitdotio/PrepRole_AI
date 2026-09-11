import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';
import { getAuthDestination } from '../authRedirect';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useAuth } from '../../../context/useAuth';
import { getApiErrorMessage } from '../../../services/apiError';

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] =
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

    if (!form.email || !form.password) {
      setError(
        'Please enter your email and password.'
      );
      return;
    }

    setLoading(true);

    try {
      await login(form);

      navigate(getAuthDestination(location.state?.from), {
        replace: true,
      });
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to sign in. Please check your credentials.'));
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
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={handleChange}
        autoComplete="email"
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
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <button
          type="button"
          className="password-toggle"
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

      <Button
        type="submit"
        loading={loading}
        size="large"
        className="auth-submit"
      >
        Sign In
      </Button>
    </form>
  );
}

export default LoginForm;
