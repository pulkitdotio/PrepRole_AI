import { Link } from 'react-router';
import Logo from '../../../components/common/Logo';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/useAuth';
import AuthLink from '../../auth/components/AuthLink';
import { getAuthState } from '../../auth/authRedirect';

function PublicHeader() {
  const { loading, isAuthenticated } = useAuth();

  return (
    <header className="public-header">
      <div className="public-container public-header__inner">
        <Link to="/" aria-label="PrepRole AI home"><Logo /></Link>
        <nav className="public-header__product" aria-label="Product navigation">
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#tools">Interview Report</Link>
        </nav>
        <nav className="public-header__account" aria-label="Account navigation">
          {loading ? (
            <Button disabled aria-busy="true">Checking session…</Button>
          ) : isAuthenticated ? (
            <>
              <Link to="/dashboard" className="button button--secondary button--medium">Open app</Link>
              <AuthLink to="/interviews/new" className="button button--primary button--medium">New Interview</AuthLink>
            </>
          ) : (
            <>
              <Link to="/login" className="button button--secondary button--medium">Login</Link>
              <Link to="/register" state={getAuthState('/interviews/new')} className="button button--primary button--medium">Start preparing</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default PublicHeader;
