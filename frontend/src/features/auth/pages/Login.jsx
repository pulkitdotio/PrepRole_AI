import { LockKeyhole } from 'lucide-react';
import { useLocation } from 'react-router';
import ErrorMessage from '../../../components/common/ErrorMessage';

import AuthLayout from '../../../layouts/AuthLayout';
import LoginForm from '../components/LoginForm';

function Login() {
  const location = useLocation();
  return (
    <AuthLayout mode="login">
      <div className="auth-card__header">
        <div className="auth-card__icon">
          <LockKeyhole size={20} />
        </div>

        <div>
          <h2>Welcome back</h2>
          <p>Sign in to continue your interview preparation.</p>
        </div>
      </div>

      <ErrorMessage message={location.state?.authNotice} />
      <LoginForm />
    </AuthLayout>
  );
}

export default Login;
