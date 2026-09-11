import { Link } from 'react-router';
import PublicHeader from '../components/PublicHeader';
import { useAuth } from '../../../context/useAuth';

function NotFound() {
  const { isAuthenticated, loading } = useAuth();

  return <div className="public-page"><PublicHeader /><main className="public-container not-found"><p className="home-eyebrow">404 · Page not found</p><h1>Let’s get you back on track.</h1><p>This page doesn’t exist or may have moved.</p><div className="not-found__actions"><Link to="/" className="button button--primary button--large">Back to PrepAI home</Link>{!loading && isAuthenticated && <Link to="/dashboard" className="button button--secondary button--large">Go to dashboard</Link>}</div></main></div>;
}

export default NotFound;
