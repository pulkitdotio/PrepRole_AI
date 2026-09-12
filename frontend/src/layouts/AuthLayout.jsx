import { ArrowLeft, Check, FileSearch, MessageSquareText, Target } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { getAuthState } from '../features/auth/authRedirect';
import Logo from '../components/common/Logo';

function AuthLayout({ children, mode = 'login' }) {
  const isLogin = mode === 'login';
  const location = useLocation();

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="PrepRole AI overview">
        <div className="auth-story__inner">
          <Link to="/" aria-label="PrepRole AI home"><Logo /></Link>
          <div className="auth-story__copy">
            <p className="page-eyebrow">Role preparation workspace</p>
            <h1>Walk into the interview with a clearer point of view.</h1>
            <p>Build preparation around the role, your experience, and the gaps worth addressing.</p>
          </div>
          <div className="auth-snapshot" aria-label="What PrepRole AI provides">
            <div><span><Target size={16} /></span><strong>Match insights</strong><Check size={14} /></div>
            <div><span><MessageSquareText size={16} /></span><strong>Practice questions</strong><Check size={14} /></div>
            <div><span><FileSearch size={16} /></span><strong>Tailored resume</strong><Check size={14} /></div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__top">
          <Link to="/" className="auth-home-link"><ArrowLeft size={14} />Home</Link>
          <span>{isLogin ? "New to PrepRole AI?" : 'Already have an account?'}</span>
          <Link to={isLogin ? '/register' : '/login'} state={getAuthState(location.state?.from)}>{isLogin ? 'Create account' : 'Sign in'}</Link>
        </div>
        <div className="auth-card">{children}</div>
        <p className="auth-panel__note">Your preparation data remains in your private account workspace.</p>
      </section>
    </main>
  );
}

export default AuthLayout;
