import { Link } from 'react-router';
import PublicHeader from '../components/PublicHeader';
import { useAuth } from '../../../context/useAuth';

function NotFound() {
  const { isAuthenticated, loading } = useAuth();

  return <div className="public-page"><PublicHeader /><main className="public-container not-found"><p className="home-eyebrow">404 · Page not found</p><h1>This route isn’t on the plan.</h1><p>The page doesn’t exist or may have moved. Return home or continue in your workspace.</p><div className="not-found__actions"><Link to="/" className="button button--primary button--large">Back to PrepRole AI</Link>{!loading && isAuthenticated && <Link to="/dashboard" className="button button--secondary button--large">Open workspace</Link>}</div></main></div>;
}

export default NotFound;
