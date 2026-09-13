import { UserPlus } from 'lucide-react';

import AuthLayout from '../../../layouts/AuthLayout';
import RegisterForm from '../components/RegisterForm';

function Register() {
  return (
    <AuthLayout mode="register">
      <div className="auth-card__header">
        <div className="auth-card__icon">
          <UserPlus size={20} />
        </div>

        <div>
          <h2>Create Account</h2>
          <p>
            Start preparing for your next
            opportunity.
          </p>
        </div>
      </div>

      <RegisterForm />
    </AuthLayout>
  );
}

export default Register;